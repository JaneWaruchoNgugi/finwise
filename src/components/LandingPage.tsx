import React, { useState, useEffect } from 'react';
import type { SubscriptionTier, SubscriptionPlan } from '../types';

const PLANS: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    color: '#6B7280',
    icon: '◎',
    features: [
      'Expense tracking & categorisation',
      'Financial Advisor view',
      'Dashboard overview',
      'Monthly spending summary',
    ],
    lockedViews: ['investments', 'goals', 'bills', 'networth', 'emergency', 'insights', 'chat', 'alerts'],
  },
  {
    tier: 'silver',
    name: 'Silver',
    price: 10,
    color: '#94A3B8',
    icon: '◈',
    features: [
      'Everything in Free',
      'Bills & recurring payments',
      'Savings goals with deadlines',
      'Emergency fund tracker',
      'Net Worth calculator',
    ],
    lockedViews: ['investments', 'insights', 'chat', 'alerts'],
  },
  {
    tier: 'gold',
    name: 'Gold',
    price: 10,
    color: '#D97706',
    icon: '◉',
    features: [
      'Everything in Silver',
      'Investment portfolio (SACCO, MMF, stocks...)',
      'Spending insights & analytics',
      'AI Chat financial advisor',
      'Alerts & SOS emergency system',
      'Priority support',
      'CSV data exports',
    ],
    lockedViews: [],
  },
];

export const PLAN_LOCKED_VIEWS = Object.fromEntries(
  PLANS.map(p => [p.tier, p.lockedViews])
) as Record<SubscriptionTier, import('../types').AppView[]>;

const STATS = [
  { value: '12,000+', label: 'Kenyans saving smarter' },
  { value: 'KES 2.4B', label: 'Tracked across users' },
  { value: '4.9★', label: 'Average user rating' },
];

const FEATURES = [
  { icon: '📊', title: 'Smart Budgeting', desc: 'Categorise every shilling automatically and see where your money really goes.' },
  { icon: '🎯', title: 'Goal Tracking', desc: 'Set savings targets with deadlines and watch your progress in real time.' },
  { icon: '📈', title: 'Investment Manager', desc: 'Track SACCOs, MMFs, stocks, bonds and crypto in one clean portfolio view.' },
  { icon: '🤖', title: 'AI Financial Advisor', desc: 'Get personalised advice based on your actual income, spending and goals.' },
  { icon: '🔔', title: 'Bills & Alerts', desc: 'Never miss a payment. Get overdue warnings and SOS emergency alerts.' },
];

interface LandingPageProps {
  onSelectTier: (tier: SubscriptionTier) => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTier, onLogin }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);

  return (
    <div style={S.page}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer  { 0%,100% { opacity:.7; } 50% { opacity:1; } }
        @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .land-hero   { animation: fadeUp 0.55s ease forwards; }
        .land-stats  { animation: fadeUp 0.55s ease 0.15s both; }
        .land-feat   { animation: fadeUp 0.55s ease 0.25s both; }
        .land-plans  { animation: fadeUp 0.55s ease 0.35s both; }
        .land-footer { animation: fadeUp 0.55s ease 0.45s both; }
        .plan-card   { transition: transform 0.22s ease, box-shadow 0.22s ease; }
        .plan-card:hover { transform: translateY(-6px); }
        .feat-card   { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .feat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(217,119,6,0.12); }
        .cta-btn     { transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(217,119,6,0.35); }
        .cta-btn:active { transform: translateY(0); }
        .logo-float  { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <nav style={{ ...S.nav, opacity: visible ? 1 : 0, transition: 'opacity 0.4s' }}>
        <div style={S.navInner}>
          <div style={S.logoRow}>
            <div style={S.logoMark} className="logo-float"><span style={S.logoSym}>Ƒ</span></div>
            <div>
              <div style={S.logoName}>FinWise</div>
              <div style={S.logoTag}>YOUR MONEY, MASTERED</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={S.navLogin} className="cta-btn" onClick={onLogin}>
              Log In
            </button>
            <button style={S.navCta} className="cta-btn" onClick={() => onSelectTier('free')}>
              Get Started Free →
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={S.hero} className="land-hero">
        <div style={S.heroBadge}>🇰🇪 Built for Kenya · Trusted by 12,000+ users</div>
        <h1 style={S.headline}>
          Take control of your<br />
          <span style={S.headlineAccent}>financial future</span>
        </h1>
        <p style={S.heroSub}>
          Track expenses, grow investments, hit your savings goals — all in one beautifully simple app.
          Your data never leaves your device.
        </p>
        <div style={S.heroBtns}>
          <button style={S.primaryBtn} className="cta-btn" onClick={() => onSelectTier('free')}>
            Start for Free
          </button>
          <button style={S.secondaryBtn} className="cta-btn" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
            View Plans ↓
          </button>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section style={S.statsRow} className="land-stats">
        {STATS.map(s => (
          <div key={s.label} style={S.statItem}>
            <div style={S.statValue}>{s.value}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section style={S.section} className="land-feat">
        <div style={S.sectionLabel}>WHAT YOU GET</div>
        <h2 style={S.sectionTitle}>Everything you need to master your money</h2>
        <div style={S.featGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feat-card" style={{ ...S.featCard, animationDelay: `${i * 0.06}s` }}>
              <div style={S.featIcon}>{f.icon}</div>
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS ───────────────────────────────────────────── */}
      <section id="plans" style={S.section} className="land-plans">
        <div style={S.sectionLabel}>PRICING</div>
        <h2 style={S.sectionTitle}>Simple, transparent plans</h2>
        <p style={S.sectionSub}>Start free. Upgrade when you're ready. Cancel anytime.</p>
        <div style={S.plansGrid}>
          {PLANS.map((plan) => {
            const isPopular = plan.tier === 'gold';
            return (
              <div
                key={plan.tier}
                className="plan-card"
                style={{
                  ...S.planCard,
                  border: isPopular ? `2px solid ${plan.color}` : `1.5px solid rgba(10,22,40,0.09)`,
                  boxShadow: isPopular ? `0 8px 40px rgba(217,119,6,0.18)` : S.planCard.boxShadow,
                }}
              >
                {isPopular && (
                  <div style={{ ...S.popularBadge, background: `linear-gradient(135deg, #F59E0B, #D97706)` }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div style={{ fontSize: 32, marginBottom: 10 }}>{plan.icon}</div>
                <div style={{ ...S.planName, color: plan.color }}>{plan.name}</div>
                <div style={S.planPriceRow}>
                  {plan.price === 0
                    ? <span style={S.planFree}>Free forever</span>
                    : <>
                        <span style={S.planAmount}>KES {plan.price.toLocaleString()}</span>
                        <span style={S.planPer}>/month</span>
                      </>
                  }
                </div>
                <ul style={S.featureList}>
                  {plan.features.map(f => (
                    <li key={f} style={S.featureItem}>
                      <span style={{ color: plan.price === 0 ? '#6B7280' : plan.color, marginRight: 8, fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  style={plan.price === 0 ? S.planBtnFree : { ...S.planBtnPaid, background: `linear-gradient(135deg, #F59E0B, #D97706)` }}
                  className="cta-btn"
                  onClick={() => onSelectTier(plan.tier)}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Subscribe — KES ${plan.price.toLocaleString()}/mo`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────── */}
      <section style={S.trustStrip} className="land-footer">
        <div style={S.trustItem}>🔒 PIN-protected access</div>
        <div style={S.trustDot}>·</div>
        <div style={S.trustItem}>📱 Works offline</div>
        <div style={S.trustDot}>·</div>
        <div style={S.trustItem}>🇰🇪 KES currency support</div>
        <div style={S.trustDot}>·</div>
        <div style={S.trustItem}>🚫 No bank login required</div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={S.footer} className="land-footer">
        <div style={S.footerLogo}>
          <div style={{ ...S.logoMark, width: 32, height: 32 }}><span style={{ ...S.logoSym, fontSize: 16 }}>Ƒ</span></div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: '#D97706' }}>FinWise</span>
        </div>
        <div style={S.footerText}>© {new Date().getFullYear()} FinWise · Smart money management for every Kenyan</div>
      </footer>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page:         { minHeight: '100vh', background: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'DM Sans, sans-serif', color: '#0A1628' },

  // Nav
  nav:          { width: '100%', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(10,22,40,0.07)' },
  navInner:     { maxWidth: 1100, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navCta:       { padding: '9px 20px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  navLogin:     { padding: '9px 20px', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-s)', borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },

  // Logo
  logoRow:      { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark:     { width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(145deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoSym:      { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 800, color: '#fff' },
  logoName:     { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: '#D97706', lineHeight: 1.1 },
  logoTag:      { fontSize: 8, color: '#9CA3AF', letterSpacing: '0.14em' },

  // Hero
  hero:         { maxWidth: 720, textAlign: 'center', padding: '80px 24px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 },
  heroBadge:    { fontSize: 13, fontWeight: 600, color: '#D97706', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 20, padding: '6px 16px' },
  headline:     { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, color: '#0A1628', lineHeight: 1.15, margin: 0 },
  headlineAccent: { background: 'linear-gradient(135deg, #F59E0B, #D97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub:      { fontSize: 17, color: '#4B5563', lineHeight: 1.75, maxWidth: 560, margin: 0 },
  heroBtns:     { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  primaryBtn:   { padding: '14px 32px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  secondaryBtn: { padding: '14px 28px', background: '#fff', color: '#D97706', border: '2px solid rgba(217,119,6,0.3)', borderRadius: 12, fontWeight: 700, fontSize: 16, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },

  // Stats
  statsRow:     { width: '100%', maxWidth: 900, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: 'rgba(10,22,40,0.06)', borderTop: '1px solid rgba(10,22,40,0.06)', borderBottom: '1px solid rgba(10,22,40,0.06)', margin: '0 0 80px' },
  statItem:     { background: '#fff', padding: '28px 20px', textAlign: 'center' },
  statValue:    { fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 700, color: '#D97706', marginBottom: 4 },
  statLabel:    { fontSize: 13, color: '#6B7280' },

  // Section
  section:      { width: '100%', maxWidth: 1100, padding: '0 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#D97706', letterSpacing: '0.14em', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, color: '#0A1628', textAlign: 'center', margin: '0 0 12px' },
  sectionSub:   { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 40 },

  // Features
  featGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, width: '100%' },
  featCard:     { background: '#FAFAFA', border: '1px solid rgba(10,22,40,0.07)', borderRadius: 16, padding: '28px 24px', cursor: 'default' },
  featIcon:     { fontSize: 32, marginBottom: 14 },
  featTitle:    { fontSize: 17, fontWeight: 700, color: '#0A1628', marginBottom: 8 },
  featDesc:     { fontSize: 14, color: '#6B7280', lineHeight: 1.65 },

  // Plans
  plansGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20, width: '100%' },
  planCard:     { background: '#fff', borderRadius: 20, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', boxShadow: '0 2px 12px rgba(10,22,40,0.06)' },
  popularBadge: { position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 800, color: '#fff', padding: '4px 14px', borderRadius: 20, letterSpacing: '0.08em', whiteSpace: 'nowrap' },
  planName:     { fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, marginBottom: 8 },
  planPriceRow: { marginBottom: 24 },
  planFree:     { fontSize: 16, fontWeight: 600, color: '#6B7280' },
  planAmount:   { fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 700, color: '#0A1628' },
  planPer:      { fontSize: 13, color: '#9CA3AF', marginLeft: 3 },
  featureList:  { listStyle: 'none', padding: 0, margin: '0 0 28px', width: '100%', textAlign: 'left' },
  featureItem:  { fontSize: 13, color: '#374151', padding: '7px 0', borderBottom: '1px solid rgba(10,22,40,0.05)', lineHeight: 1.5 },
  planBtnFree:  { width: '100%', padding: '12px', background: '#F9FAFB', color: '#6B7280', border: '1.5px solid rgba(10,22,40,0.1)', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  planBtnPaid:  { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },

  // Trust
  trustStrip:   { width: '100%', background: 'rgba(217,119,6,0.04)', borderTop: '1px solid rgba(217,119,6,0.12)', borderBottom: '1px solid rgba(217,119,6,0.12)', padding: '18px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  trustItem:    { fontSize: 13, color: '#4B5563', fontWeight: 500 },
  trustDot:     { color: '#D1D5DB' },

  // Footer
  footer:       { width: '100%', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  footerLogo:   { display: 'flex', alignItems: 'center', gap: 8 },
  footerText:   { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
};
