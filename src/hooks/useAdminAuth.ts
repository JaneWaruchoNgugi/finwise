import { useState, useCallback, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithCustomToken, signOut, onIdTokenChanged } from 'firebase/auth';
import { httpsCallable, type FunctionsError } from 'firebase/functions';
import { db, auth, functions } from '../lib/firebase';
import type { AdminUser, AdminRole } from '../types';

const ADMIN_SESSION = 'finwise_admin_session';
const adminSignInFn = httpsCallable(functions, 'adminSignIn');

const hashPassword = (pw: string): string => {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = (h * 33) ^ pw.charCodeAt(i);
  return (h >>> 0).toString(36);
};

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    try { return JSON.parse(sessionStorage.getItem(ADMIN_SESSION) || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The admin panel and the main app share one Firebase Auth session, and the locked
  // Firestore rules require the `admin` claim to read admin data. If a regular-user
  // sign-in replaced the session (or it expired), the stored "logged in" flag would
  // point at a session with no admin claim → silently broken reads. Verify the LIVE
  // token here and, if the claim is gone, drop back to the login screen.
  useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (user) => {
      if (!sessionStorage.getItem(ADMIN_SESSION)) return;
      let hasClaim = false;
      try {
        const res = user ? await user.getIdTokenResult() : null;
        hasClaim = res?.claims?.admin === true;
      } catch { hasClaim = false; }
      if (!hasClaim) {
        sessionStorage.removeItem(ADMIN_SESSION);
        setAdmin(null);
      }
    });
    return unsub;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Preferred: server-verified admin sign-in → Firebase Auth session with an
      // `admin` claim (needed once admin collections are rules-gated).
      try {
        const res = await adminSignInFn({ email, password });
        const { token, admin: adminData } = res.data as { token: string; admin: AdminUser };
        await signInWithCustomToken(auth, token);
        sessionStorage.setItem(ADMIN_SESSION, JSON.stringify(adminData));
        setAdmin(adminData);
        return true;
      } catch (fnErr) {
        const code = (fnErr as FunctionsError)?.code;
        if (code === 'functions/permission-denied') { setError('Invalid credentials.'); return false; }
        console.warn('adminSignIn unavailable, using fallback:', code || fnErr);
      }

      const snap = await getDocs(collection(db, 'admins'));
      const match = snap.docs.find(d => {
        const data = d.data() as AdminUser;
        return data.email === email && data.passwordHash === hashPassword(password);
      });
      if (!match) { setError('Invalid credentials.'); return false; }
      const adminData = { id: match.id, ...match.data() } as AdminUser;
      sessionStorage.setItem(ADMIN_SESSION, JSON.stringify(adminData));
      setAdmin(adminData);
      return true;
    } catch {
      setError('Login failed. Check your connection.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_SESSION);
    setAdmin(null);
    signOut(auth).catch(() => { /* ignore */ });
  }, []);

  const createAdmin = useCallback(async (email: string, password: string, role: AdminRole) => {
    const id = email.replace(/[^a-z0-9]/gi, '_');
    const newAdmin: Omit<AdminUser, 'id'> = {
      email, passwordHash: hashPassword(password), role,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'admins', id), newAdmin);
  }, []);

  const deleteAdmin = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'admins', id));
  }, []);

  return { admin, loading, error, login, logout, createAdmin, deleteAdmin };
};
