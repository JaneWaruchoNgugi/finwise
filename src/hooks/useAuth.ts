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

const phoneVariants = (phone: string): string[] => {
  const raw = String(phone || '').trim();
  const compact = raw.replace(/\s+/g, '');
  const digitsOnly = compact.replace(/\D/g, '');
  const normalized = normalizePhone(raw);
  const variants = new Set<string>([raw, compact, normalized, normalized.replace(/\s+/g, '')].filter(Boolean));

  if (/^0\d{9}$/.test(normalized)) {
    variants.add('254' + normalized.slice(1));
    variants.add('+254' + normalized.slice(1));
  }
  if (/^254\d{9}$/.test(digitsOnly)) {
    variants.add(digitsOnly);
    variants.add('+' + digitsOnly);
    variants.add('0' + digitsOnly.slice(3));
  }
  if (/^\d{9}$/.test(digitsOnly)) {
    variants.add('0' + digitsOnly);
    variants.add('254' + digitsOnly);
    variants.add('+254' + digitsOnly);
  }

  return Array.from(variants);
};

const findUserByPhone = async (phone: string): Promise<{ uid: string; data: UserProfile } | null> => {
  const variants = phoneVariants(phone);
  const lookupValues: unknown[] = Array.from(new Set([
    ...variants,
    ...variants.map(v => Number(v.replace(/\D/g, ''))).filter(Number.isFinite),
  ]));

  for (const id of variants.map(v => v.replace(/\s+/g, ''))) {
    const snap = await getDoc(doc(db, 'users', id));
    if (snap.exists()) return { uid: snap.id, data: snap.data() as UserProfile };
  }

  for (const value of lookupValues) {
    const matches = await getDocs(query(collection(db, 'users'), where('phone', '==', value)));
    if (!matches.empty) return { uid: matches.docs[0].id, data: matches.docs[0].data() as UserProfile };
  }

  for (const value of lookupValues) {
    const payments = await getDocs(query(collection(db, 'payments'), where('phone', '==', value)));
    for (const paymentSnap of payments.docs) {
      const payment = paymentSnap.data() as { userId?: unknown };
      const userId = typeof payment.userId === 'string' ? payment.userId.trim() : '';
      if (!userId) continue;
      const userSnap = await getDoc(doc(db, 'users', userId));
      if (userSnap.exists()) return { uid: userSnap.id, data: userSnap.data() as UserProfile };
    }
  }

  return null;
};

const loadLocalProfile = (): UserProfile | null => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); }
  catch { return null; }
};

type ServerProfile = Partial<UserProfile> & { subscriptionStatus?: string; pendingTier?: SubscriptionTier | null };
type PaymentDoc = {
  id: string;
  userId?: string;
  phone?: string;
  tier?: SubscriptionTier;
  status?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

const isPaidTier = (tier: unknown): tier is Exclude<SubscriptionTier, 'free'> =>
  tier === 'silver' || tier === 'gold' || tier === 'platinum';

const isSuccessfulPaymentStatus = (status: unknown) =>
  status === 'success' || status === 'paid';

const toMillis = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (typeof value === 'object') {
    const maybeTimestamp = value as { toMillis?: () => number; toDate?: () => Date; seconds?: number };
    if (typeof maybeTimestamp.toMillis === 'function') return maybeTimestamp.toMillis();
    if (typeof maybeTimestamp.toDate === 'function') return maybeTimestamp.toDate().getTime();
    if (typeof maybeTimestamp.seconds === 'number') return maybeTimestamp.seconds * 1000;
  }
  return 0;
};

const phoneLookupValues = (phone: string): unknown[] => {
  const variants = phoneVariants(phone);
  return Array.from(new Set([
    ...variants,
    ...variants.map(v => Number(v.replace(/\D/g, ''))).filter(Number.isFinite),
  ]));
};

const findLatestSuccessfulPayment = async (uid: string, phone?: string): Promise<PaymentDoc | null> => {
  const payments = new Map<string, PaymentDoc>();
  const addMatches = (docs: Awaited<ReturnType<typeof getDocs>>) => {
    docs.forEach(snap => {
      const data = snap.data() as Omit<PaymentDoc, 'id'>;
      if (isSuccessfulPaymentStatus(data.status) && isPaidTier(data.tier)) {
        payments.set(snap.id, { id: snap.id, ...data });
      }
    });
  };

  if (uid) {
    addMatches(await getDocs(query(collection(db, 'payments'), where('userId', '==', uid))));
  }

  for (const value of phone ? phoneLookupValues(phone) : []) {
    addMatches(await getDocs(query(collection(db, 'payments'), where('phone', '==', value))));
  }

  return Array.from(payments.values()).sort((a, b) => {
    const aTime = toMillis(a.createdAt) || toMillis(a.updatedAt);
    const bTime = toMillis(b.createdAt) || toMillis(b.updatedAt);
    return bTime - aTime;
  })[0] ?? null;
};

const hasCurrentPaidSubscription = (profile: UserProfile | ServerProfile): boolean => {
  if (profile.subscriptionStatus !== 'active' || !isPaidTier(profile.tier)) return false;
  const expiryMs = profile.subscriptionExpiresAt ? Date.parse(profile.subscriptionExpiresAt) : 0;
  const startMs = profile.subscriptionStart ? Date.parse(profile.subscriptionStart) : 0;
  if (expiryMs) return Date.now() < expiryMs;
  if (startMs) return Date.now() - startMs < SUBSCRIPTION_MS;
  return true;
};

const paymentSubscriptionWindow = (payment: PaymentDoc) => {
  const startMs = toMillis(payment.createdAt) || toMillis(payment.updatedAt) || Date.now();
  const expiresMs = startMs + SUBSCRIPTION_MS;
  return { startMs, expiresMs };
};

const restorePaidSubscriptionFromPayment = async (uid: string, profile: UserProfile): Promise<UserProfile> => {
  if (hasCurrentPaidSubscription(profile)) return profile;

  const payment = await findLatestSuccessfulPayment(uid, profile.phone);
  if (!payment || !isPaidTier(payment.tier)) return profile;

  const { startMs, expiresMs } = paymentSubscriptionWindow(payment);
  if (Date.now() >= expiresMs) return profile;

  const subscriptionStart = new Date(startMs).toISOString();
  const subscriptionExpiresAt = new Date(expiresMs).toISOString();
  const repairedProfile: UserProfile = {
    ...profile,
    uid,
    tier: payment.tier,
    subscriptionStatus: 'active',
    subscriptionStart,
    subscriptionExpiresAt,
  };

  await setDoc(doc(db, 'users', uid), {
    tier: payment.tier,
    subscriptionStatus: 'active',
    subscriptionStart,
    subscriptionExpiresAt,
    lastPaymentId: payment.id,
    pendingTier: null,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  return repairedProfile;
};

const createPaidProfileFromPayment = async (phone: string, pin: string): Promise<UserProfile | null> => {
  const normalizedPhone = normalizePhone(phone);
  const payment = await findLatestSuccessfulPayment(phoneToId(normalizedPhone), normalizedPhone);
  if (!payment || !isPaidTier(payment.tier)) return null;

  const { startMs, expiresMs } = paymentSubscriptionWindow(payment);
  if (Date.now() >= expiresMs) return null;

  const uid = typeof payment.userId === 'string' && payment.userId.trim()
    ? payment.userId.trim()
    : phoneToId(normalizedPhone);
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid,
    name: 'FinWise User',
    phone: normalizedPhone,
    pin: hashPin(pin),
    createdAt: now,
    tier: payment.tier,
    subscriptionStatus: 'active',
    subscriptionStart: new Date(startMs).toISOString(),
    subscriptionExpiresAt: new Date(expiresMs).toISOString(),
  };

  await setDoc(doc(db, 'users', uid), {
    ...profile,
    lastPaymentId: payment.id,
    pendingTier: null,
    recoveredFromPayment: true,
    updatedAt: now,
  }, { merge: true });

  return profile;
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
      const found = await findUserByPhone(local.phone);
      if (found) {
        uid = found.uid;
        server = found.data as ServerProfile;
      }
    }

    if (!server) return local;

    server = await restorePaidSubscriptionFromPayment(uid, {
      ...local,
      ...server,
      uid,
      tier: server.tier || local.tier || 'free',
      phone: server.phone || local.phone || uid,
    } as UserProfile);

    const paidTier = server.tier === 'silver' || server.tier === 'gold' || server.tier === 'platinum';
    const hasSubscriptionDates = Boolean(server.subscriptionExpiresAt || server.subscriptionStart);
    const isExpired = paidTier && hasSubscriptionDates && !hasCurrentPaidSubscription(server);
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
      const existing = await findUserByPhone(normalizedPhone);
      if (existing) {
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
      const restoredProfile = await restorePaidSubscriptionFromPayment(uid, { ...p, uid });
      saveProfile(restoredProfile);
      localStorage.setItem(SESSION_KEY, 'true');
      setProfile(restoredProfile);
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
      const found = await findUserByPhone(normalizedPhone);
      const resolvedUid = found?.uid ?? phoneToId(normalizedPhone);
      const data: UserProfile | null = found?.data ?? null;

      if (!data) {
        const recoveredProfile = await createPaidProfileFromPayment(normalizedPhone, pin);
        if (recoveredProfile) {
          saveProfile(recoveredProfile);
          localStorage.setItem(SESSION_KEY, 'true');
          setProfile(recoveredProfile);
          setIsUnlocked(true);
          return true;
        }
        setError('No account found for this phone number.');
        return false;
      }
      if (data.pin !== hashPin(pin)) {
        setError('Wrong PIN.');
        return false;
      }
      const restoredProfile = await restorePaidSubscriptionFromPayment(resolvedUid, { ...data, uid: resolvedUid });
      saveProfile(restoredProfile);
      localStorage.setItem(SESSION_KEY, 'true');
      setProfile(restoredProfile);
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
