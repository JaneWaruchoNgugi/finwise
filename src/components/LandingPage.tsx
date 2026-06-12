import React, { useState, useEffect } from 'react';
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDollarSign,
  Crown,
  Flag,
  Goal,
  Landmark,
  Layers3,
  LineChart,
  LockKeyhole,
  ReceiptText,
  Shield,
  Sparkles,
  Smartphone,
  Star,
  TrendingUp,
  WalletCards,
  XCircle,
} from 'lucide-react';
import type { SubscriptionTier, SubscriptionPlan } from '../types';

type IconComponent = React.ComponentType<{ size?: number; strokeWidth?: number; style?: React.CSSProperties }>;
type LandingPlan = Omit<SubscriptionPlan, 'icon'> & {
  icon: IconComponent;
  standardPrice?: number;
  tagline: string;
};

const INTRO_END_LABEL = 'June 30, 2026';

const PLANS: LandingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    color: '#6B7280',
    icon: Circle,
    tagline: 'A clean start for everyday tracking',
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
    standardPrice: 299,
    color: '#94A3B8',
    icon: BadgeCheck,
    tagline: 'Planning essentials for one focused month',
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
    price: 20,
    standardPrice: 599,
    color: '#D97706',
    icon: Crown,
    tagline: 'Complete premium access and intelligence',
    features: [
      'Everything in Silver',
      'Investment portfolio tracking',
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

const STATS: { value: string; label: string; icon?: IconComponent }[] = [
  { value: '12,000+', label: 'Kenyans saving smarter' },
  { value: 'KES 2.4B', label: 'Tracked across users' },
  { value: '4.9', label: 'Average user rating', icon: Star },
];

const FEATURES: { icon: IconComponent; title: string; desc: string }[] = [
  { icon: BarChart3, title: 'Smart Budgeting', desc: 'Categorise every shilling and see exactly where your money is going.' },
  { icon: Goal, title: 'Goal Tracking', desc: 'Set savings targets with deadlines and measure progress in real time.' },
  { icon: TrendingUp, title: 'Investment Manager', desc: 'Track SACCOs, MMFs, stocks, bonds and crypto in one calm portfolio view.' },
  { icon: Bot, title: 'AI Financial Advisor', desc: 'Get guidance based on your income, spending, goals, and actual habits.' },
  { icon: Bell, title: 'Bills & Alerts', desc: 'Stay ahead of recurring bills, overdue payments, and emergency signals.' },
  { icon: Landmark, title: 'Net Worth Clarity', desc: 'Bring assets and liabilities together so your financial position is easy to read.' },
];

const VALUE_POINTS: { icon: IconComponent; title: string; desc: string }[] = [
  { icon: WalletCards, title: 'Built around Kenyan money habits', desc: 'KES-first tracking, M-Pesa-friendly pricing, and categories that make sense locally.' },
  { icon: Shield, title: 'Private by design', desc: 'Your day-to-day records stay on your device unless you choose paid activation.' },
  { icon: Layers3, title: 'One place for the full picture', desc: 'Expenses, goals, bills, investments, net worth, alerts, and AI support work together.' },
];

const STEPS: { icon: IconComponent; title: string; desc: string }[] = [
  { icon: ReceiptText, title: 'Log your money', desc: 'Capture income, expenses, bills, and commitments without spreadsheet friction.' },
  { icon: LineChart, title: 'Read the pattern', desc: 'See what is recurring, what is growing, and what needs attention this month.' },
  { icon: CalendarDays, title: 'Act with a plan', desc: 'Use goals, alerts, and recommendations to make your next money move clear.' },
];

const TRUST_ITEMS: { icon: IconComponent; label: string }[] = [
  { icon: LockKeyhole, label: 'PIN-protected access' },
  { icon: CircleDollarSign, label: 'KES currency support' },
  { icon: XCircle, label: 'No bank login required' },
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
        @keyframes float    { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .land-hero   { animation: fadeUp 0.55s ease forwards; }
        .land-stats  { animation: fadeUp 0.55s ease 0.12s both; }
        .land-section { animation: fadeUp 0.55s ease 0.18s both; }
        .plan-card   { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .plan-card:hover { transform: translateY(-6px); }
        .feat-card, .value-card, .step-card { transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease; }
        .feat-card:hover, .value-card:hover, .step-card:hover { transform: translateY(-3px); box-shadow: 0 16px 38px rgba(15,23,42,0.08); border-color: rgba(217,119,6,0.22); }
        .cta-btn     { transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s; }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(217,119,6,0.28); }
        .cta-btn:active { transform: translateY(0); }
        .logo-float  { animation: float 4s ease-in-out infinite; }
        .hero-preview { width:100%; max-width:980px; }
        .preview-grid { display:grid; grid-template-columns:1.1fr .9fr; gap:18px; }
        .feature-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; width:100%; }
        .value-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; width:100%; }
        .step-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; width:100%; }
        .plans-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; width:100%; align-items:stretch; }
        @media(max-width:900px){
          .preview-grid, .feature-grid, .value-grid, .step-grid, .plans-grid { grid-template-columns:1fr; }
          .hero-preview { max-width:640px; }
        }
        @media(max-width:640px){
          .nav-actions { gap:8px!important; }
          .nav-free { display:none!important; }
          .hero-break { display:none; }
        }
      `}</style>

      <nav style={{ ...S.nav, opacity: visible ? 1 : 0, transition: 'opacity 0.4s' }}>
        <div style={S.navInner}>
          <div style={S.logoRow}>
            <div style={S.logoMark} className="logo-float"><span style={S.logoSym}>F</span></div>
            <div>
              <div style={S.logoName}>FinWise</div>
              <div style={S.logoTag}>YOUR MONEY, MASTERED</div>
            </div>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={S.navLogin} className="cta-btn" onClick={onLogin}>Log In</button>
            <button style={S.navCta} className="cta-btn nav-free" onClick={() => onSelectTier('free')}>
              Get Started Free <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </nav>

      <section style={S.hero} className="land-hero">
        <div style={S.heroBadge}>
          <Flag size={14} strokeWidth={2.3} />
          Built for Kenya · Launch offer ends {INTRO_END_LABEL}
        </div>
        <h1 style={S.headline}>
          Money clarity for every<br className="hero-break" /> Kenyan household
        </h1>
        <p style={S.heroSub}>
          FinWise brings your spending, bills, goals, investments, net worth, alerts, and AI guidance into one polished money dashboard.
        </p>
        <div style={S.heroBtns}>
          <button style={S.primaryBtn} className="cta-btn" onClick={() => onSelectTier('gold')}>
            Start Gold for KES 20 <ChevronRight size={17} strokeWidth={2.5} />
          </button>
          <button style={S.secondaryBtn} className="cta-btn" onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
            View Plans <ChevronDown size={17} strokeWidth={2.5} />
          </button>
        </div>
        <div style={S.priceNote}>Silver is KES 10 and Gold is KES 20 for the first 30-day month. Standard pricing starts after {INTRO_END_LABEL}: Silver KES 299/month, Gold KES 599/month.</div>

        <div className="hero-preview" style={S.previewShell}>
          <div style={S.previewTopBar}>
            <div style={S.previewTitle}>FinWise monthly command center</div>
            <div style={S.previewPill}><Sparkles size={13} /> Live plan</div>
          </div>
          <div className="preview-grid">
            <div style={S.previewPanelMain}>
              <div style={S.previewLabel}>Spending health</div>
              <div style={S.previewScore}>84</div>
              <div style={S.previewCopy}>Strong month. Keep subscriptions and dining out below target to protect your goal contributions.</div>
              <div style={S.previewBars}>
                {[
                  ['Essentials', '72%', '#2563EB'],
                  ['Goals', '58%', '#059669'],
                  ['Investments', '41%', '#D97706'],
                ].map(([label, width, color]) => (
                  <div key={label}>
                    <div style={S.previewBarMeta}><span>{label}</span><span>{width}</span></div>
                    <div style={S.previewTrack}><div style={{ ...S.previewFill, width, background: color }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.previewSide}>
              <div style={S.previewMini}><ReceiptText size={18} /><span>Bills due</span><strong>KES 12,400</strong></div>
              <div style={S.previewMini}><Goal size={18} /><span>Goal progress</span><strong>68%</strong></div>
              <div style={S.previewMini}><TrendingUp size={18} /><span>Portfolio</span><strong>+7.2%</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section style={S.statsRow} className="land-stats">
        {STATS.map(s => {
          const StatIcon = s.icon;
          return (
            <div key={s.label} style={S.statItem}>
              <div style={S.statValue}>{s.value}{StatIcon && <StatIcon size={21} strokeWidth={2.2} style={{ fill: '#D97706' }} />}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          );
        })}
      </section>

      <section style={S.section} className="land-section">
        <div style={S.sectionLabel}>WHY FINWISE</div>
        <h2 style={S.sectionTitle}>A personal finance workspace that feels calm, useful, and complete</h2>
        <div className="value-grid">
          {VALUE_POINTS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="value-card" style={S.valueCard}>
                <div style={S.valueIcon}><Icon size={23} strokeWidth={2.1} /></div>
                <div style={S.valueTitle}>{item.title}</div>
                <div style={S.valueDesc}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={S.section} className="land-section">
        <div style={S.sectionLabel}>WHAT YOU GET</div>
        <h2 style={S.sectionTitle}>Everything you need to master your money</h2>
        <div className="feature-grid">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="feat-card" style={{ ...S.featCard, animationDelay: `${i * 0.06}s` }}>
                <div style={S.featIcon}><Icon size={25} strokeWidth={2.1} /></div>
                <div style={S.featTitle}>{f.title}</div>
                <div style={S.featDesc}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={S.section} className="land-section">
        <div style={S.sectionLabel}>HOW IT WORKS</div>
        <h2 style={S.sectionTitle}>From scattered money notes to a monthly plan</h2>
        <div className="step-grid">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="step-card" style={S.stepCard}>
                <div style={S.stepTop}><span style={S.stepNum}>{index + 1}</span><Icon size={22} strokeWidth={2.1} /></div>
                <div style={S.stepTitle}>{step.title}</div>
                <div style={S.stepDesc}>{step.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="plans" style={S.section} className="land-section">
        <div style={S.sectionLabel}>PRICING</div>
        <h2 style={S.sectionTitle}>Launch pricing for your first 30-day month</h2>
        <p style={S.sectionSub}>Transparent monthly access. The launch offer is available until {INTRO_END_LABEL}; standard prices are shown upfront.</p>
        <div className="plans-grid">
          {PLANS.map((plan) => {
            const isPopular = plan.tier === 'gold';
            const PlanIcon = plan.icon;
            return (
              <div
                key={plan.tier}
                className="plan-card"
                style={{
                  ...S.planCard,
                  border: isPopular ? `2px solid ${plan.color}` : `1.5px solid rgba(10,22,40,0.09)`,
                  boxShadow: isPopular ? `0 18px 52px rgba(217,119,6,0.18)` : S.planCard.boxShadow,
                }}
              >
                {isPopular && (
                  <div style={{ ...S.popularBadge, background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
                    <Sparkles size={12} strokeWidth={2.4} /> BEST VALUE
                  </div>
                )}
                <div style={{ ...S.planIcon, color: plan.color, background: `${plan.color}14`, borderColor: `${plan.color}35` }}>
                  <PlanIcon size={27} strokeWidth={2.1} />
                </div>
                <div style={{ ...S.planName, color: plan.color }}>{plan.name}</div>
                <div style={S.planTagline}>{plan.tagline}</div>
                <div style={S.planPriceRow}>
                  {plan.price === 0
                    ? <span style={S.planFree}>Free forever</span>
                    : <>
                        <div style={S.launchLabel}>Launch price</div>
                        <span style={S.planAmount}>KES {plan.price.toLocaleString()}</span>
                        <span style={S.planPer}>/first month</span>
                        <div style={S.standardPrice}>Then KES {plan.standardPrice?.toLocaleString()}/month after {INTRO_END_LABEL}</div>
                      </>
                  }
                </div>
                <ul style={S.featureList}>
                  {plan.features.map(f => (
                    <li key={f} style={S.featureItem}>
                      <Check size={15} strokeWidth={2.6} style={{ color: plan.price === 0 ? '#6B7280' : plan.color, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  style={plan.price === 0 ? S.planBtnFree : { ...S.planBtnPaid, background: isPopular ? 'linear-gradient(135deg, #F59E0B, #D97706)' : '#0A1628' }}
                  className="cta-btn"
                  onClick={() => onSelectTier(plan.tier)}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Subscribe — KES ${plan.price.toLocaleString()}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section style={S.trustStrip} className="land-section">
        {TRUST_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.label}>
              {index > 0 && <div style={S.trustDot}>·</div>}
              <div style={S.trustItem}>
                <Icon size={16} strokeWidth={2.2} style={{ color: '#D97706', flexShrink: 0 }} />
                {item.label}
              </div>
            </React.Fragment>
          );
        })}
      </section>

      <footer style={S.footer} className="land-section">
        <div style={S.footerLogo}>
          <div style={{ ...S.logoMark, width: 32, height: 32 }}><span style={{ ...S.logoSym, fontSize: 16 }}>F</span></div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: '#D97706' }}>FinWise</span>
        </div>
        <div style={S.footerText}>© {new Date().getFullYear()} FinWise · Smart money management for every Kenyan</div>
      </footer>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg,#FFFCF7 0%,#FFFFFF 30%,#F8FAFC 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'DM Sans, sans-serif', color: '#0A1628' },

  nav: { width: '100%', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(10,22,40,0.07)' },
  navInner: { maxWidth: 1120, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navCta: { padding: '9px 18px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  navLogin: { padding: '9px 20px', background: '#fff', color: '#0A1628', border: '1px solid rgba(10,22,40,0.12)', borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },

  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: { width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(145deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 10px 22px rgba(217,119,6,0.22)' },
  logoSym: { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 800, color: '#fff' },
  logoName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 21, fontWeight: 700, color: '#B45309', lineHeight: 1.1 },
  logoTag: { fontSize: 8, color: '#9CA3AF', letterSpacing: '0.14em' },

  hero: { width: '100%', maxWidth: 1120, textAlign: 'center', padding: '72px 24px 54px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 19 },
  heroBadge: { fontSize: 13, fontWeight: 800, color: '#B45309', background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 999, padding: '7px 16px', display: 'inline-flex', alignItems: 'center', gap: 7 },
  headline: { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 700, color: '#0A1628', lineHeight: 1.02, margin: 0, letterSpacing: 0 },
  heroSub: { fontSize: 18, color: '#4B5563', lineHeight: 1.72, maxWidth: 680, margin: 0 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  primaryBtn: { padding: '14px 30px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 16, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryBtn: { padding: '14px 26px', background: '#fff', color: '#B45309', border: '1.5px solid rgba(217,119,6,0.28)', borderRadius: 12, fontWeight: 800, fontSize: 16, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  priceNote: { maxWidth: 760, fontSize: 13, color: '#6B7280', lineHeight: 1.6, background: '#fff', border: '1px solid rgba(10,22,40,0.08)', borderRadius: 12, padding: '10px 14px' },

  previewShell: { marginTop: 22, background: '#0A1628', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 22, padding: 18, boxShadow: '0 28px 80px rgba(10,22,40,0.22)', textAlign: 'left' },
  previewTopBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' },
  previewTitle: { color: '#F9FAFB', fontSize: 14, fontWeight: 800 },
  previewPill: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#FDE68A', background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 },
  previewPanelMain: { background: 'linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.06))', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 22 },
  previewLabel: { color: 'rgba(255,255,255,0.56)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' },
  previewScore: { fontFamily: 'Cormorant Garamond, serif', fontSize: 72, color: '#F59E0B', fontWeight: 700, lineHeight: 1 },
  previewCopy: { color: 'rgba(255,255,255,0.74)', fontSize: 14, lineHeight: 1.6, maxWidth: 520 },
  previewBars: { display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 },
  previewBarMeta: { display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 6 },
  previewTrack: { height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  previewFill: { height: '100%', borderRadius: 999 },
  previewSide: { display: 'flex', flexDirection: 'column', gap: 12 },
  previewMini: { flex: 1, minHeight: 88, display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 12, background: '#fff', borderRadius: 15, padding: '15px 16px', color: '#0A1628' },

  statsRow: { width: '100%', maxWidth: 920, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1, background: 'rgba(10,22,40,0.06)', border: '1px solid rgba(10,22,40,0.06)', margin: '0 0 76px' },
  statItem: { background: '#fff', padding: '28px 20px', textAlign: 'center' },
  statValue: { fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 700, color: '#D97706', marginBottom: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 },
  statLabel: { fontSize: 13, color: '#6B7280' },

  section: { width: '100%', maxWidth: 1120, padding: '0 24px 82px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: 900, color: '#B45309', letterSpacing: '0.14em', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#0A1628', textAlign: 'center', margin: '0 0 34px', lineHeight: 1.14, maxWidth: 760 },
  sectionSub: { fontSize: 15, color: '#6B7280', textAlign: 'center', margin: '-22px 0 40px', maxWidth: 660, lineHeight: 1.65 },

  valueCard: { background: '#fff', border: '1px solid rgba(10,22,40,0.08)', borderRadius: 16, padding: '24px 22px', minHeight: 190 },
  valueIcon: { width: 48, height: 48, borderRadius: 14, marginBottom: 16, display: 'grid', placeItems: 'center', color: '#D97706', background: 'rgba(217,119,6,0.09)', border: '1px solid rgba(217,119,6,0.16)' },
  valueTitle: { fontSize: 17, fontWeight: 800, color: '#0A1628', marginBottom: 8 },
  valueDesc: { fontSize: 14, color: '#6B7280', lineHeight: 1.65 },

  featCard: { background: '#fff', border: '1px solid rgba(10,22,40,0.08)', borderRadius: 16, padding: '24px 22px', cursor: 'default', minHeight: 178 },
  featIcon: { width: 48, height: 48, borderRadius: 14, marginBottom: 16, display: 'grid', placeItems: 'center', color: '#D97706', background: 'rgba(217,119,6,0.09)', border: '1px solid rgba(217,119,6,0.16)' },
  featTitle: { fontSize: 17, fontWeight: 800, color: '#0A1628', marginBottom: 8 },
  featDesc: { fontSize: 14, color: '#6B7280', lineHeight: 1.65 },

  stepCard: { background: '#fff', border: '1px solid rgba(10,22,40,0.08)', borderRadius: 16, padding: '22px 22px 24px', minHeight: 160 },
  stepTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#D97706', marginBottom: 22 },
  stepNum: { width: 32, height: 32, borderRadius: 999, background: '#0A1628', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 900 },
  stepTitle: { fontSize: 17, fontWeight: 800, color: '#0A1628', marginBottom: 8 },
  stepDesc: { fontSize: 14, color: '#6B7280', lineHeight: 1.65 },

  planCard: { background: '#fff', borderRadius: 18, padding: '32px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', boxShadow: '0 8px 28px rgba(10,22,40,0.06)' },
  popularBadge: { position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 900, color: '#fff', padding: '5px 14px', borderRadius: 999, letterSpacing: '0.08em', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 },
  planIcon: { width: 54, height: 54, borderRadius: 14, border: '1px solid', display: 'grid', placeItems: 'center', marginBottom: 14 },
  planName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, marginBottom: 4 },
  planTagline: { fontSize: 13, color: '#6B7280', minHeight: 38, lineHeight: 1.45, marginBottom: 12 },
  planPriceRow: { marginBottom: 24, minHeight: 100 },
  launchLabel: { display: 'inline-flex', color: '#B45309', background: 'rgba(217,119,6,0.09)', border: '1px solid rgba(217,119,6,0.16)', borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 900, marginBottom: 7, textTransform: 'uppercase' },
  planFree: { fontSize: 16, fontWeight: 700, color: '#6B7280' },
  planAmount: { fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 700, color: '#0A1628' },
  planPer: { fontSize: 13, color: '#9CA3AF', marginLeft: 4 },
  standardPrice: { fontSize: 12, color: '#6B7280', lineHeight: 1.5, maxWidth: 210, marginTop: 7 },
  featureList: { listStyle: 'none', padding: 0, margin: '0 0 28px', width: '100%', textAlign: 'left', flex: 1 },
  featureItem: { fontSize: 13, color: '#374151', padding: '7px 0', borderBottom: '1px solid rgba(10,22,40,0.05)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 },
  planBtnFree: { width: '100%', padding: '12px', background: '#F9FAFB', color: '#6B7280', border: '1.5px solid rgba(10,22,40,0.1)', borderRadius: 10, fontWeight: 800, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },
  planBtnPaid: { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' },

  trustStrip: { width: '100%', background: '#fff', borderTop: '1px solid rgba(217,119,6,0.12)', borderBottom: '1px solid rgba(217,119,6,0.12)', padding: '18px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 0 },
  trustItem: { fontSize: 13, color: '#4B5563', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 },
  trustDot: { color: '#D1D5DB' },

  footer: { width: '100%', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  footerLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
};
