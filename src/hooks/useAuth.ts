import { useState, useCallback, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile, SubscriptionTier } from '../types';

const SESSION_KEY = 'finwise_session';
const PROFILE_KEY = 'finwise_auth_profile';
const SUBSCRIPTION_DAYS = 30;
const SUBSCRIPTION_MS = SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000;

const hashPin = (pin: string): string => {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) h = (h * 33) ^ pin.charCodeAt(i);
  return (h >>> 0).toString(36);
};

const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/[^\d+]/g, '');
  if (/^0\d{9}$/.test(digits)) return digits;
  if (/^254\d{9}$/.test(digits)) return '0' + digits.slice(3);
  if (/^\+254\d{9}$/.test(digits)) return '0' + digits.slice(4);
  return phone.replace(/\s+/g, '');
};

const phoneToId = (phone: string) => normalizePhone(phone).replace(/\s+/g, '');

const loadLocalProfile = (): UserProfile | null => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
};

type ServerProfile = Partial<UserProfile> & { subscriptionStatus?: string; pendingTier?: SubscriptionTier | null };

const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const useAuth = () => {
  const [profile, setProfile]       = useState<UserProfile | null>(loadLocalProfile);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(localStorage.getItem(SESSION_KEY) === 'true');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    const local = loadLocalProfile();
    if (!local) return null;

    const candidateIds = Array.from(new Set([
      local.uid,
      local.phone ? phoneToId(local.phone) : '',
    ].filter(Boolean) as string[]));

    let uid = candidateIds[0] || '';
    let server: ServerProfile | null = null;

    for (const id of candidateIds) {
      const snap = await getDoc(doc(db, 'users', id));
      if (snap.exists()) {
        uid = snap.id;
        server = snap.data() as ServerProfile;
        break;
      }
    }

    if (!server && local.phone) {
      const normalizedPhone = normalizePhone(local.phone);
      const matches = await getDocs(query(collection(db, 'users'), where('phone', '==', normalizedPhone)));
      if (!matches.empty) {
        uid = matches.docs[0].id;
        server = matches.docs[0].data() as ServerProfile;
      }
    }

    if (!server) return local;

    const paidTier = server.tier === 'silver' || server.tier === 'gold' || server.tier === 'platinum';
    const expiryMs = server.subscriptionExpiresAt ? Date.parse(server.subscriptionExpiresAt) : 0;
    const startMs = server.subscriptionStart ? Date.parse(server.subscriptionStart) : 0;
    const isExpired = paidTier && ((expiryMs && Date.now() >= expiryMs) || (startMs && Date.now() - startMs >= SUBSCRIPTION_MS));
    if (isExpired) {
      const expiredAt = new Date().toISOString();
      await setDoc(doc(db, 'users', uid), {
        tier: 'free',
        subscriptionStatus: 'expired',
        previousTier: server.tier,
        subscriptionExpiredAt: expiredAt,
        updatedAt: expiredAt,
      }, { merge: true });
      server = { ...server, tier: 'free', subscriptionStatus: 'expired', previousTier: server.tier, subscriptionExpiredAt: expiredAt };
    }

    const merged = {
      ...local,
      ...server,
      uid,
      tier: server.tier || local.tier || 'free',
      phone: server.phone || local.phone || uid,
    } as UserProfile;

    saveProfile(merged);
    setProfile(merged);
    return merged;
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    refreshProfile().catch(e => console.error(e));
  }, [isUnlocked, refreshProfile]);

  const createProfile = useCallback(async (name: string, phone: string, pin: string, tier: SubscriptionTier = 'free') => {
    setLoading(true);
    setError(null);
    try {
      const normalizedPhone = normalizePhone(phone);
      if (!/^0\d{9}$/.test(normalizedPhone)) {
        setError('Enter a valid Kenyan phone number, for example 0712345678.');
        return;
      }
      if (!/^\d{4}$/.test(pin)) {
        setError('PIN must be exactly 4 digits.');
        return;
      }

      const uid = phoneToId(normalizedPhone);
      const existing = await getDoc(doc(db, 'users', uid));
      if (existing.exists()) {
        setError('An account already exists for this phone number. Please log in.');
        return;
      }

      const now = new Date().toISOString();
      const p: UserProfile = {
        name: name.trim(),
        phone: normalizedPhone,
        pin: hashPin(pin),
        createdAt: now,
        tier: 'free',
      };
      const serverProfile = {
        ...p,
        subscriptionStatus: tier === 'free' ? 'active' : 'pending_payment',
        pendingTier: tier === 'free' ? null : tier,
      };

      await setDoc(doc(db, 'users', uid), serverProfile);
      saveProfile({ ...p, uid });
      localStorage.setItem(SESSION_KEY, 'true');
      setProfile({ ...p, uid });
      setIsUnlocked(true);
    } catch (e) {
      setError('Failed to create account. Check your connection.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const unlock = useCallback(async (phone: string, pin: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const normalizedPhone = normalizePhone(phone);
      const uid = phoneToId(normalizedPhone);
      let resolvedUid = uid;
      let snap = await getDoc(doc(db, 'users', uid));
      let data: UserProfile | null = snap.exists() ? snap.data() as UserProfile : null;

      if (!data) {
        const matches = await getDocs(query(collection(db, 'users'), where('phone', '==', normalizedPhone)));
        if (!matches.empty) {
          resolvedUid = matches.docs[0].id;
          data = matches.docs[0].data() as UserProfile;
        }
      }

      if (!data) {
        setError('No account found for this phone number.');
        return false;
      }
      if (data.pin !== hashPin(pin)) {
        setError('Wrong PIN.');
        return false;
      }
      saveProfile({ ...data, uid: resolvedUid });
      localStorage.setItem(SESSION_KEY, 'true');
      setProfile({ ...data, uid: resolvedUid });
      setIsUnlocked(true);
      return true;
    } catch (e) {
      setError('Login failed. Check your connection.');
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTier = useCallback(async (tier: SubscriptionTier): Promise<boolean> => {
    const local = loadLocalProfile();
    if (!local) return false;
    const fresh = await refreshProfile();
    const uid = fresh?.uid || local.uid || (local.phone ? phoneToId(local.phone) : '');
    const snap = uid ? await getDoc(doc(db, 'users', uid)) : null;
    const server = snap?.exists() ? snap.data() as ServerProfile : (fresh || {}) as ServerProfile;
    if (server.subscriptionStatus !== 'active' || server.tier !== tier) {
      return false;
    }
    const updated = {
      ...local,
      ...fresh,
      ...server,
      uid,
      tier: server.tier,
      subscriptionStart: server.subscriptionStart ?? new Date().toISOString(),
    } as UserProfile;
    saveProfile(updated);
    setProfile(updated);
    return true;
  }, [refreshProfile]);

  const lock = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsUnlocked(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const local = loadLocalProfile();
      if (local?.phone) await deleteDoc(doc(db, 'users', phoneToId(local.phone)));
    } catch { /* best effort */ }
    [SESSION_KEY, PROFILE_KEY, 'finwise_expenses', 'finwise_investments',
     'finwise_goals', 'finwise_bills', 'finwise_networth']
      .forEach(k => localStorage.removeItem(k));
    setProfile(null);
    setIsUnlocked(false);
  }, []);

  return { profile, isUnlocked, loading, error, createProfile, unlock, lock, deleteAccount, updateTier, refreshProfile };
};
