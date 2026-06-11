import React from 'react';
import { BarChart3, Bell, Bot, Check, Crown, Landmark, Lock, ReceiptText, Shield, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { SubscriptionTier } from '../types';

interface Plan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  color: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  tagline: string;
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    tier: 'silver',
    name: 'Silver',
    price: 10,
    color: '#94A3B8',
    icon: Shield,
    tagline: 'Planning essentials',
    features: ['Bills & recurring payments', 'Savings goals with deadlines', 'Emergency fund tracker', 'Net worth calculator'],
  },
  {
    tier: 'gold',
    name: 'Gold',
    price: 10,
    color: '#D97706',
    icon: Crown,
    tagline: 'Complete premium access',
    popular: true,
    features: ['Everything in Silver', 'Investment portfolio', 'Spending insights & analytics', 'AI Chat advisor', 'Alerts & SOS system', 'Priority support', 'CSV exports'],
  },
];

const LOCKED_FEATURES = [
  { icon: TrendingUp, label: 'Investments' },
  { icon: Target, label: 'Goals' },
  { icon: ReceiptText, label: 'Bills' },
  { icon: Landmark, label: 'Net Worth' },
  { icon: Shield, label: 'Emergency' },
  { icon: BarChart3, label: 'Insights' },
  { icon: Bot, label: 'AI Chat' },
  { icon: Bell, label: 'Alerts' },
];

interface UpgradePageProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({ currentTier, onSelectPlan }) => {
  const hasFullAccess = currentTier === 'gold' || currentTier === 'platinum';
  const currentPlanName = currentTier === 'platinum' ? 'Legacy Platinum' : currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const visiblePlans = hasFullAccess ? PLANS.filter(plan => plan.tier === 'gold') : PLANS;

  return (
    <div style={S.page} className="animate-in">
      <style>{`
        .up-hero { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:20px; align-items:center; width:100%; max-width:980px; }
        .up-locked { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; width:100%; max-width:760px; }
        .up-plans { display:grid; grid-template-columns:repeat(2,minmax(0,360px)); justify-content:center; gap:18px; width:100%; max-width:780px; }
        .up-plan-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
        .up-plan-btn:hover { filter:brightness(1.06); transform:translateY(-1px); }
        @media(max-width:760px){
          .up-hero { grid-template-columns:1fr; text-align:left; }
          .up-locked { grid-template-columns:repeat(4,1fr); gap:8px; }
          .up-plans { grid-template-columns:1fr; }
        }
        @media(max-width:410px){ .up-locked { grid-template-columns:repeat(2,1fr); } }
      `}</style>

      <section className="up-hero" style={S.hero}>
        <div>
          <div style={S.badge}><Sparkles size={13} /> {hasFullAccess ? 'Plan active' : 'Upgrade your plan'}</div>
          <h1 style={S.title}>{hasFullAccess ? 'Your Gold tools are unlocked' : 'Choose the tools that match your money goals'}</h1>
          <p style={S.sub}>
            {hasFullAccess
              ? <>You are currently on <strong style={{ color: 'var(--text-1)' }}>{currentPlanName}</strong>. You already have access to planning, insights, AI coaching, alerts, and priority support.</>
              : <>You are currently on <strong style={{ color: 'var(--text-1)', textTransform: 'capitalize' }}>{currentTier}</strong>. Upgrade to unlock planning, insights, AI coaching, alerts, and priority support.</>}
          </p>
        </div>
        <div style={S.summaryCard}>
          <div style={S.summaryLabel}>{hasFullAccess ? 'Gold access' : 'Premium unlocks'}</div>
          <div style={S.summaryValue}>{hasFullAccess ? 'On' : '8'}</div>
          <div style={S.summaryText}>{hasFullAccess ? 'premium tools active' : 'additional money tools'}</div>
        </div>
      </section>

      <section className="up-locked" aria-label={hasFullAccess ? 'Included premium features' : 'Locked premium features'}>
        {LOCKED_FEATURES.map(feature => {
          const Icon = feature.icon;
          return (
            <div key={feature.label} style={hasFullAccess ? { ...S.lockedItem, borderColor: 'var(--border-acc)', background: 'var(--gold-dim)' } : S.lockedItem}>
              <Icon size={21} strokeWidth={2.1} style={{ color: 'var(--gold)' }} />
              <span style={S.lockedLabel}>{feature.label}</span>
              {hasFullAccess ? <Check size={11} style={S.lockBadge} /> : <Lock size={10} style={S.lockBadge} />}
            </div>
          );
        })}
      </section>

      <section className="up-plans">
        {visiblePlans.map(plan => {
          const Icon = plan.icon;
          const isCurrent = currentTier === plan.tier || (hasFullAccess && plan.tier === 'gold');
          return (
            <article
              key={plan.tier}
              className="up-plan-card"
              style={{
                ...S.planCard,
                border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border)',
                boxShadow: plan.popular ? `0 16px 44px ${plan.color}22` : 'var(--shadow-card)',
              }}
            >
              {plan.popular && <div style={S.popularBadge}>Most popular</div>}
              <div style={{ ...S.planIcon, color: plan.color, background: `${plan.color}16`, borderColor: `${plan.color}35` }}>
                <Icon size={26} strokeWidth={2.1} />
              </div>
              <div style={{ ...S.planName, color: plan.color }}>{plan.name}</div>
              <div style={S.planTagline}>{plan.tagline}</div>
              <div style={S.planPrice}>
                <span style={S.planAmt}>KES {plan.price.toLocaleString()}</span>
                <span style={S.planPer}>/mo</span>
              </div>
              <div style={S.featureList}>
                {plan.features.map(feature => (
                  <div key={feature} style={S.featureItem}>
                    <Check size={14} strokeWidth={2.6} style={{ color: plan.color, flexShrink: 0 }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                className="up-plan-btn"
                onClick={() => onSelectPlan(plan.tier)}
                disabled={isCurrent}
                style={{ ...S.planBtn, opacity: isCurrent ? 0.6 : 1, cursor: isCurrent ? 'default' : 'pointer' }}
              >
                {isCurrent ? (hasFullAccess ? 'Active plan' : 'Current plan') : `Upgrade to ${plan.name}`}
              </button>
            </article>
          );
        })}
      </section>

      <div style={S.note}><Lock size={13} /> Secure payment via M-Pesa. Premium access renews every 30 days.</div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, padding: '6px 0 44px' },
  hero: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 26px', boxShadow: 'var(--shadow-card)' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid var(--border-acc)', borderRadius: 999, padding: '6px 12px', textTransform: 'uppercase', letterSpacing: 0 },
  title: { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(25px, 5vw, 42px)', fontWeight: 700, color: 'var(--text-1)', margin: '12px 0 8px', lineHeight: 1.12 },
  sub: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 620 },
  summaryCard: { minWidth: 170, background: 'var(--bg-surface)', border: '1px solid var(--border-acc)', borderRadius: 14, padding: 18, textAlign: 'center' },
  summaryLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', fontWeight: 800 },
  summaryValue: { fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 },
  summaryText: { fontSize: 12, color: 'var(--text-2)' },
  lockedItem: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '13px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', minHeight: 78, boxShadow: 'var(--shadow)' },
  lockedLabel: { fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textAlign: 'center' },
  lockBadge: { position: 'absolute', top: 7, right: 7, color: 'var(--gold)' },
  planCard: { background: 'var(--bg-card)', borderRadius: 18, padding: '25px 22px 22px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', position: 'relative', transition: 'transform .15s, box-shadow .15s' },
  popularBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 900, color: '#fff', background: 'var(--btn-gradient)', padding: '5px 13px', borderRadius: 999, textTransform: 'uppercase', whiteSpace: 'nowrap' },
  planIcon: { width: 52, height: 52, borderRadius: 14, border: '1px solid', display: 'grid', placeItems: 'center', marginBottom: 14 },
  planName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 27, fontWeight: 700 },
  planTagline: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  planPrice: { margin: '15px 0 18px' },
  planAmt: { fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 700, color: 'var(--text-1)' },
  planPer: { fontSize: 13, color: 'var(--text-3)', marginLeft: 4 },
  featureList: { display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 22, flex: 1 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--text-2)', padding: '8px 0', borderBottom: '1px solid var(--border)', lineHeight: 1.35 },
  planBtn: { width: '100%', padding: 13, background: 'var(--btn-gradient)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, fontFamily: 'DM Sans, sans-serif', transition: 'filter .15s, transform .15s' },
  note: { display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '0 16px' },
};
