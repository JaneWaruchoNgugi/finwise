import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { UserProfile, SubscriptionTier } from '../../../types';

const TIER_PRICE: Record<SubscriptionTier, number> = { free: 0, silver: 10, gold: 10, platinum: 999 };
const TIER_COLOR: Record<SubscriptionTier, string> = { free: '#9BAAC4', silver: '#C0C0C0', gold: '#C9A84C', platinum: '#A78BFA' };
const TIERS: SubscriptionTier[] = ['free', 'silver', 'gold', 'platinum'];

interface PaymentRow {
  id: string;
  userId?: string;
  phone?: string;
  tier?: SubscriptionTier;
  amount?: number;
  status?: string;
  createdAt?: unknown;
  trans_id?: string;
}

const toMillis = (value: unknown): number => {
  if (!value) return 0;
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') return value.toMillis();
  return 0;
};

const formatDate = (value: unknown): string => {
  const ms = toMillis(value);
  return ms ? new Date(ms).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
};

const isPaid = (status?: string) => status === 'success' || status === 'paid';

export const AdminSubscriptions: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDocs(collection(db, 'users')), getDocs(collection(db, 'payments'))]).then(([userSnap, paymentSnap]) => {
      setUsers(userSnap.docs.map(d => d.data() as UserProfile));
      setPayments(paymentSnap.docs.map(d => ({ id: d.id, ...d.data() }) as PaymentRow));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const paidPayments = payments.filter(p => isPaid(p.status));
    return {
      estimatedMrr: users.reduce((sum, u) => sum + TIER_PRICE[u.tier], 0),
      collectedRevenue: paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      recentPaid: paidPayments.sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)).slice(0, 8),
    };
  }, [users, payments]);

  if (loading) return <div style={{ color: 'var(--text-3)', padding: 32 }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <h2 style={heading}>Subscriptions</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        <div style={heroCard}>
          <div style={label}>Monthly Recurring Revenue (est.)</div>
          <div style={heroValue}>KES {stats.estimatedMrr.toLocaleString()}</div>
          <div style={hint}>Based on current user tiers.</div>
        </div>
        <div style={heroCard}>
          <div style={label}>Collected Subscription Revenue</div>
          <div style={heroValue}>KES {stats.collectedRevenue.toLocaleString()}</div>
          <div style={hint}>Based on successful payment records.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {TIERS.map(tier => {
          const count = users.filter(u => u.tier === tier).length;
          const successfulPayments = payments.filter(p => p.tier === tier && isPaid(p.status));
          const revenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
          return (
            <div key={tier} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TIER_COLOR[tier], marginBottom: 8, textTransform: 'capitalize' }}>{tier}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-1)', fontFamily: 'Cormorant Garamond, serif' }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {TIER_PRICE[tier] === 0 ? 'Free' : `KES ${TIER_PRICE[tier]}/mo`} - KES {(count * TIER_PRICE[tier]).toLocaleString()} MRR
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                {successfulPayments.length} paid payment{successfulPayments.length === 1 ? '' : 's'} - KES {revenue.toLocaleString()} collected
              </div>
            </div>
          );
        })}
      </div>

      <section style={panelStyle}>
        <div style={panelTitle}>Recent Paid Upgrades</div>
        {stats.recentPaid.map(p => (
          <div key={p.id} style={paymentRow}>
            <div>
              <div style={{ color: 'var(--text-1)', fontWeight: 700, fontSize: 13 }}>{p.phone || p.userId || 'Unknown user'}</div>
              <div style={{ color: 'var(--text-3)', fontSize: 11 }}>{p.trans_id || p.id}</div>
            </div>
            <div style={{ color: p.tier ? TIER_COLOR[p.tier] : 'var(--text-3)', fontWeight: 700, textTransform: 'capitalize' }}>{p.tier || '-'}</div>
            <div style={{ color: 'var(--text-1)', fontWeight: 700 }}>KES {Number(p.amount || 0).toLocaleString()}</div>
            <div style={{ color: 'var(--text-3)', fontSize: 12 }}>{formatDate(p.createdAt)}</div>
          </div>
        ))}
        {stats.recentPaid.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No paid upgrades recorded yet.</div>}
      </section>
    </div>
  );
};

const heading: React.CSSProperties = { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 700, color: 'var(--text-1)', margin: 0 };
const heroCard: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border-acc)', borderRadius: 10, padding: '18px 22px' };
const label: React.CSSProperties = { fontSize: 12, color: 'var(--text-3)', marginBottom: 5 };
const hint: React.CSSProperties = { fontSize: 11, color: 'var(--text-3)', marginTop: 5 };
const heroValue: React.CSSProperties = { fontSize: 30, fontWeight: 700, color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif' };
const panelStyle: React.CSSProperties = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 };
const panelTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--text-2)', marginBottom: 12 };
const paymentRow: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) 90px 100px 110px', gap: 12, alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--border)' };
