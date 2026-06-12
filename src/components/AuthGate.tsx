import React, { useState, useRef, useEffect } from 'react';

import { normalizePhone } from '../hooks/useAuth';
import type { SubscriptionTier } from '../types';

interface AuthGateProps {
  hasProfile: boolean;
  onCreateProfile: (name: string, phone: string, pin: string, tier: SubscriptionTier) => void;
  onUnlock: (phone: string, pin: string) => Promise<boolean>;
  onCheckPhoneExists: (phone: string) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
  prefilledPhone?: string;
  tier?: SubscriptionTier;
  defaultMode?: 'login' | 'signup';
}

const PIN_LENGTH = 4;

const PinInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  error: boolean;
  autoFocus?: boolean;
}> = ({ value, onChange, onComplete, error, autoFocus }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (autoFocus) inputRef.current?.focus(); }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, PIN_LENGTH);
    onChange(v);
    if (v.length === PIN_LENGTH) onComplete?.(v);
  };

  return (
    <div style={{ position: 'relative', marginBottom: 4 }} onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, cursor: 'pointer' }}
        autoFocus={autoFocus}
      />
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '12px 0' }}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div key={i} style={{
            width: 58, height: 58, borderRadius: 16,
            background: error ? 'rgba(220,38,38,0.08)' : i < value.length ? 'rgba(167,139,250,0.18)' : 'rgba(167,139,250,0.10)',
            border: `2px solid ${error ? 'rgba(220,38,38,0.4)' : i < value.length ? 'rgba(167,139,250,0.7)' : 'rgba(167,139,250,0.35)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {i < value.length && (
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: error ? 'var(--red)' : '#A78BFA',
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AuthGate: React.FC<AuthGateProps> = ({ hasProfile, onCreateProfile, onUnlock, onCheckPhoneExists, loading, error: authError, prefilledPhone = '', tier = 'free', defaultMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode ?? (hasProfile ? 'login' : 'signup'));

  // Signup
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState(prefilledPhone);
  const [pin, setPin]         = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep]       = useState<'info' | 'pin' | 'confirm'>('info');
  const [signupErr, setSignupErr] = useState('');
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [banner, setBanner] = useState('');

  // Login
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin]     = useState('');
  const [loginStep, setLoginStep]   = useState<'phone' | 'pin'>('phone');
  const [loginErr, setLoginErr]     = useState('');
  // const [attempts, setAttempts]     = useState(0);

  const handleLoginPinComplete = (v: string) => {
    if (loading) return;
    setLoginErr('');
    setTimeout(async () => {
      const ok = await onUnlock(loginPhone, v);
      if (!ok) {
        // setAttempts(a => a + 1);
        setLoginPin('');
      }
    }, 120);
  };

  const handleSignupPinComplete = () => {
    setTimeout(() => setStep('confirm'), 200);
  };

  const handleSignupInfoContinue = async () => {
    if (loading || checkingPhone) return;
    const nextPhone = phone.trim();
    if (!name.trim() || !nextPhone) return;
    setSignupErr('');
    setBanner('');
    if (!/^0\d{9}$/.test(normalizePhone(nextPhone))) {
      setSignupErr('Enter a valid Kenyan phone number, for example 0712 345 678.');
      return;
    }
    setCheckingPhone(true);
    try {
      const exists = await onCheckPhoneExists(nextPhone);
      if (exists) {
        const message = 'An account already exists for this phone number. Please log in instead.';
        setSignupErr(message);
        setBanner(message);
        setLoginPhone(nextPhone);
        setLoginPin('');
        setLoginStep('phone');
        setMode('login');
        return;
      }
      setStep('pin');
    } catch {
      const message = 'Could not verify this phone number. Check your connection and try again.';
      setSignupErr(message);
      setBanner(message);
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleConfirmComplete = (v: string) => {
    setTimeout(() => {
      if (v !== pin) { setSignupErr('PINs do not match'); setConfirm(''); setPin(''); setStep('pin'); }
      else onCreateProfile(name.trim(), phone.trim(), v, tier);
    }, 120);
  };

  const switchToLogin = () => { setName(''); setPhone(''); setPin(''); setConfirm(''); setStep('info'); setSignupErr(''); setMode('login'); };
  const switchToSignup = () => { setLoginPhone(''); setLoginPin(''); setLoginStep('phone'); setLoginErr(''); setMode('signup'); };

  return (
    <div style={S.overlay}>
      <style>{`
        @keyframes authIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .auth-card { animation: authIn 0.35s ease forwards; }
        @keyframes authSpin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={S.bg} />
      <div style={S.card} className="auth-card">

        {/* Logo */}
        <div style={S.logoRow}>
          <div style={S.logoMark}><span style={S.logoSym}>Ƒ</span></div>
          <div>
            <div style={S.logoName}>FinWise</div>
            <div style={S.logoTag}>YOUR MONEY, MASTERED</div>
          </div>
        </div>

        {/* ── LOGIN: phone ── */}
        {mode === 'login' && loginStep === 'phone' && (
          <>
            <div style={S.title}>Welcome Back</div>
            <p style={S.sub}>Enter your phone number to continue</p>
            <div style={S.field}>
              <label style={S.label}>Phone Number</label>
              <input style={S.input} type="tel" placeholder="e.g. 0712 345 678" value={loginPhone} autoFocus
                onChange={e => setLoginPhone(e.target.value.replace(/[^\d\s+]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && loginPhone.trim() && setLoginStep('pin')} />
            </div>
            <button style={{ ...S.btn, marginTop: 20, opacity: !loginPhone.trim() || loading ? 0.5 : 1 }}
              disabled={!loginPhone.trim() || loading} onClick={() => setLoginStep('pin')}>
              {loading ? 'Please wait…' : 'Continue →'}
            </button>
            {banner && <div style={S.banner}>{banner}</div>}
            <div style={S.hint}>No account? <button style={S.link} onClick={switchToSignup}>Create one</button></div>
          </>
        )}

        {/* ── LOGIN: pin ── */}
        {mode === 'login' && loginStep === 'pin' && (
          <>
            <div style={S.title}>Enter PIN</div>
            <p style={S.sub}>Enter your 4-digit PIN</p>
            <PinInput value={loginPin} onChange={v => { if (!loading) { setLoginPin(v); setLoginErr(''); } }} onComplete={handleLoginPinComplete} error={!!(loginErr || authError)} autoFocus={!loading} />
            {loading && <div style={S.loadingBox}><span style={S.spinner} /> Checking account...</div>}
            {banner && <div style={S.banner}>{banner}</div>}
            {(loginErr || authError) && !loading && <div style={S.err}>{loginErr || authError}</div>}
            <button style={{ ...S.backLink, opacity: loading ? 0.45 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading} onClick={() => { setLoginPin(''); setLoginErr(''); setLoginStep('phone'); }}>← Back</button>
            <div style={S.hint}>
              Forgot PIN? <button style={S.link} onClick={() => { if (window.confirm('This will delete all your data. Continue?')) { localStorage.clear(); window.location.reload(); } }}>Reset everything</button>
            </div>
          </>
        )}

        {/* ── SIGNUP: info ── */}
        {mode === 'signup' && step === 'info' && (
          <>
            <div style={S.title}>Create Account</div>
            {tier !== 'free' && (
              <div style={{ fontSize: 12, color: 'var(--gold)', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 6, padding: '5px 10px', display: 'inline-block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {tier} plan
              </div>
            )}
            <div style={S.fields}>
              <div style={S.field}>
                <label style={S.label}>Your Name</label>
                <input style={S.input} placeholder="e.g. Amina" value={name} autoFocus onChange={e => setName(e.target.value)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Phone Number</label>
                <input style={S.input} type="tel" placeholder="e.g. 0712 345 678" value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/[^\d\s+]/g, '')); setSignupErr(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleSignupInfoContinue()} />
              </div>
            </div>
            <button style={{ ...S.btn, opacity: !name.trim() || !phone.trim() || loading || checkingPhone ? 0.5 : 1 }}
              disabled={!name.trim() || !phone.trim() || loading || checkingPhone} onClick={handleSignupInfoContinue}>
              {checkingPhone ? 'Checking number…' : loading ? 'Please wait…' : 'Continue →'}
            </button>
            {banner && <div style={S.banner}>{banner}</div>}
            {signupErr && !banner && <div style={S.err}>{signupErr}</div>}
            {authError && <div style={S.err}>{authError}</div>}
            <div style={S.hint}>Already have an account? <button style={S.link} onClick={switchToLogin}>Log in</button></div>
          </>
        )}

        {/* ── SIGNUP: set pin ── */}
        {mode === 'signup' && step === 'pin' && (
          <>
            <div style={S.title}>Set Your PIN</div>
            <p style={S.sub}>Choose a {PIN_LENGTH}-digit PIN</p>
            <PinInput value={pin} onChange={v => { setPin(v); setSignupErr(''); }} onComplete={handleSignupPinComplete} error={false} autoFocus />
            <button style={S.backLink} onClick={() => { setPin(''); setStep('info'); }}>← Back</button>
          </>
        )}

        {/* ── SIGNUP: confirm pin ── */}
        {mode === 'signup' && step === 'confirm' && (
          <>
            <div style={S.title}>Confirm PIN</div>
            <p style={S.sub}>Re-enter your {PIN_LENGTH}-digit PIN</p>
            <PinInput value={confirm} onChange={v => { if (!loading) { setConfirm(v); setSignupErr(''); } }} onComplete={handleConfirmComplete} error={!!(signupErr || authError)} autoFocus={!loading} />
            {loading && <div style={S.loadingBox}><span style={S.spinner} /> Checking details...</div>}
            {(signupErr || authError) && !loading && <div style={S.err}>{signupErr || authError}</div>}
            <button style={{ ...S.backLink, opacity: loading ? 0.45 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading} onClick={() => { setConfirm(''); setPin(''); setStep('pin'); }}>← Back</button>
          </>
        )}

      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  overlay:  { position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  bg:       { position: 'absolute', inset: 0, background: 'var(--bg-page)' },
  card:     { position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border-acc)', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 380, boxShadow: 'var(--shadow-lg)' },
  logoRow:  { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoMark: { width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(145deg, var(--gold), var(--gold-l))', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoSym:  { fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 800, color: '#0A1628' },
  logoName: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700, color: 'var(--gold-l)' },
  logoTag:  { fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.14em' },
  title:    { fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 },
  sub:      { fontSize: 13, color: 'var(--text-2)', marginBottom: 20 },
  fields:   { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 },
  field:    { display: 'flex', flexDirection: 'column', gap: 5 },
  label:    { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input:    { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-1)', fontSize: 15, fontFamily: 'Karla, sans-serif', outline: 'none' },
  btn:      { width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#0A1628', borderRadius: 12, fontWeight: 700, fontSize: 15, fontFamily: 'Karla, sans-serif', border: 'none', cursor: 'pointer' },
  err:      { fontSize: 13, color: 'var(--red)', background: 'var(--red-dim)', padding: '9px 12px', borderRadius: 8, marginTop: 4, textAlign: 'center' },
  banner:   { fontSize: 13, color: '#92400E', background: 'rgba(251,191,36,0.16)', border: '1px solid rgba(245,158,11,0.35)', padding: '9px 12px', borderRadius: 8, marginTop: 4, textAlign: 'center', fontWeight: 700 },
  loadingBox: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: 'var(--gold)', background: 'rgba(255,127,0,0.1)', border: '1px solid rgba(255,127,0,0.18)', padding: '9px 12px', borderRadius: 8, marginTop: 4, textAlign: 'center', fontWeight: 700 },
  spinner:  { width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,127,0,0.25)', borderTopColor: 'var(--gold)', animation: 'authSpin 0.75s linear infinite' },
  hint:     { fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 },
  link:     { background: 'transparent', border: 'none', color: 'var(--gold)', fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  backLink: { background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 13, fontFamily: 'Karla, sans-serif', cursor: 'pointer', display: 'block', margin: '8px auto 0', padding: '6px 12px' },
};
