import React, { useCallback, useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { Mail, Send, Users, Check, AlertTriangle, KeyRound } from 'lucide-react';
import { functions } from '../../../lib/firebase';

const KEY_STORE = 'pf_admin_newsletter_key';
const getSubscribers = httpsCallable(functions, 'getSubscribers');
const sendNewsletter = httpsCallable(functions, 'sendNewsletter');

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Turn the admin's plain-text message into a simple branded HTML email.
const toHtml = (subject: string, body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0F1B2D">
    <div style="background:linear-gradient(135deg,#F97316,#EA580C);padding:20px 24px;border-radius:12px 12px 0 0">
      <span style="color:#fff;font-size:20px;font-weight:800">PesaFlow</span>
    </div>
    <div style="padding:24px;border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px">
      <h2 style="margin:0 0 14px;font-size:19px">${escapeHtml(subject)}</h2>
      ${body.split(/\n\n+/).map(p => `<p style="line-height:1.6;color:#374151">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`).join('')}
      <p style="margin-top:26px;font-size:12px;color:#9CA3AF">You're receiving this because you subscribed to PesaFlow updates.</p>
    </div>
  </div>`;

export const AdminNewsletter: React.FC = () => {
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem(KEY_STORE) || '');
  const [count, setCount] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const loadCount = useCallback(async () => {
    if (!adminKey) return;
    try {
      const res = await getSubscribers({ adminKey });
      setCount((res.data as { count: number }).count);
      setResult(null);
    } catch (e) {
      setCount(null);
      setResult({ ok: false, msg: (e as Error).message || 'Could not load subscribers (check admin key).' });
    }
  }, [adminKey]);

  useEffect(() => { loadCount(); }, [loadCount]);

  const saveKey = () => { localStorage.setItem(KEY_STORE, adminKey.trim()); loadCount(); };

  const send = async () => {
    if (!subject.trim() || !body.trim()) return;
    if (!window.confirm(`Send this update to ${count ?? 'all'} subscribers?`)) return;
    setBusy(true); setResult(null);
    try {
      const res = await sendNewsletter({ adminKey, subject: subject.trim(), html: toHtml(subject.trim(), body.trim()) });
      const d = res.data as { sent: number; failed: number; total: number };
      setResult({ ok: true, msg: `Sent to ${d.sent} of ${d.total} subscribers${d.failed ? ` (${d.failed} failed)` : ''}.` });
      setSubject(''); setBody('');
    } catch (e) {
      setResult({ ok: false, msg: (e as Error).message || 'Send failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={S.h1}><Mail size={22} /> Newsletter</h1>
        <p style={S.sub}>Send product updates and money tips to everyone who subscribed on the landing page.</p>
      </div>

      {/* Admin key */}
      <div style={S.card}>
        <label style={S.label}><KeyRound size={14} /> Admin key</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={S.input} type="password" placeholder="Enter the ADMIN_KEY set in functions env"
            value={adminKey} onChange={e => setAdminKey(e.target.value)} />
          <button style={S.secondaryBtn} onClick={saveKey}>Save</button>
        </div>
        <div style={S.hint}>Required to send. This matches the <code>ADMIN_KEY</code> environment variable on your Cloud Functions.</div>
      </div>

      {/* Subscriber count */}
      <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={S.countIcon}><Users size={20} /></div>
        <div>
          <div style={S.countLabel}>Active subscribers</div>
          <div style={S.countVal}>{count === null ? '—' : count.toLocaleString()}</div>
        </div>
        <button style={{ ...S.secondaryBtn, marginLeft: 'auto' }} onClick={loadCount}>Refresh</button>
      </div>

      {/* Compose */}
      <div style={S.card}>
        <label style={S.label}>Subject</label>
        <input style={S.input} placeholder="e.g. New: track your daily hustle earnings" value={subject} onChange={e => setSubject(e.target.value)} />
        <label style={{ ...S.label, marginTop: 14 }}>Message</label>
        <textarea style={{ ...S.input, minHeight: 160, resize: 'vertical', fontFamily: 'inherit' }}
          placeholder={'Write your update…\n\nBlank lines start a new paragraph.'} value={body} onChange={e => setBody(e.target.value)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
          <button style={{ ...S.sendBtn, opacity: busy || !subject.trim() || !body.trim() || !adminKey ? 0.55 : 1 }}
            disabled={busy || !subject.trim() || !body.trim() || !adminKey} onClick={send}>
            <Send size={16} /> {busy ? 'Sending…' : 'Send to all subscribers'}
          </button>
          {result && (
            <span style={{ ...S.result, color: result.ok ? 'var(--green, #16A34A)' : 'var(--red, #DC2626)' }}>
              {result.ok ? <Check size={15} /> : <AlertTriangle size={15} />} {result.msg}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  h1: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800, color: 'var(--text-1)', margin: 0 },
  sub: { fontSize: 14, color: 'var(--text-3)', marginTop: 6 },
  card: { background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, padding: 18 },
  label: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  input: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg-surface, #f9fafb)', color: 'var(--text-1)', fontSize: 14 },
  hint: { fontSize: 12, color: 'var(--text-3)', marginTop: 8 },
  secondaryBtn: { padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', background: 'var(--bg-surface, #f3f4f6)', color: 'var(--text-1)', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  countIcon: { width: 44, height: 44, borderRadius: 10, display: 'grid', placeItems: 'center', background: 'var(--gold-dim, #FEF3E7)', color: 'var(--gold, #EA580C)' },
  countLabel: { fontSize: 12, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  countVal: { fontSize: 24, fontWeight: 800, color: 'var(--text-1)' },
  sendBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#F97316,#EA580C)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' },
  result: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 },
};
