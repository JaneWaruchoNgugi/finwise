import React, { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import type { Goal, GoalCategory } from '../types';
import { GOAL_META, getGoalProgress, getGoalDeadlineStatus, projectGoalDate } from '../hooks/goals';
import { formatCurrency } from '../utils/expenses';

interface GoalsProps {
  goals: Goal[];
  activeGoals: Goal[];
  completedGoals: Goal[];
  totalTargeted: number;
  totalSaved: number;
  onAdd: (data: Omit<Goal, 'id' | 'createdAt' | 'completed'>) => void;
  onRemove: (id: string) => void;
  onContribute: (id: string, amount: number) => void;
  onUpdateSaved: (id: string, amount: number) => void;
  currency: string;
  maxGoals?: number;
  onUpgrade?: () => void;
}

export const Goals: React.FC<GoalsProps> = ({
  goals, activeGoals, completedGoals, totalTargeted, totalSaved,
  onAdd, onRemove, onContribute, currency, maxGoals, onUpgrade,
}) => {
  const [name, setName]         = useState('');
  const [target, setTarget]     = useState('');
  const [saved, setSaved]       = useState('');
  const [monthly, setMonthly]   = useState('');
  const [category, setCategory] = useState<GoalCategory>('emergency');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes]       = useState('');
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributeAmt, setContributeAmt] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleAdd = () => {
    const tgt = parseFloat(target.replace(/,/g, ''));
    const sav = parseFloat(saved.replace(/,/g, '') || '0');
    const mon = parseFloat(monthly.replace(/,/g, '') || '0');
    if (!name.trim() || isNaN(tgt) || tgt <= 0 || goalLimitReached) return;
    onAdd({ name: name.trim(), targetAmount: tgt, savedAmount: sav, category, deadline, monthlyContribution: mon, notes });
    setName(''); setTarget(''); setSaved(''); setMonthly(''); setDeadline(''); setNotes('');
    setSubmitted(true); setTimeout(() => setSubmitted(false), 1500);
  };

  const handleContribute = (id: string) => {
    const amt = parseFloat(contributeAmt.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) return;
    onContribute(id, amt);
    setContributeId(null); setContributeAmt('');
  };

  const overallPct = totalTargeted > 0 ? Math.round((totalSaved / totalTargeted) * 100) : 0;
  const goalLimitReached = typeof maxGoals === 'number' && goals.length >= maxGoals;

  return (
    <div style={S.container} className="animate-in">

      {/* Summary bar */}
      <div className="goals-summary-bar">
        {[
          { label: 'Active Goals',     val: activeGoals.length,                         unit: '',    color: 'var(--blue)' },
          { label: 'Total Targeted',   val: formatCurrency(totalTargeted, currency),     unit: '',    color: 'var(--text-1)' },
          { label: 'Total Saved',      val: formatCurrency(totalSaved, currency),        unit: '',    color: 'var(--green)' },
          { label: 'Goals Completed',  val: completedGoals.length,                       unit: '',    color: 'var(--gold)' },
        ].map((s) => (
          <div key={s.label} style={S.summaryItem}>
            <div style={S.summaryLabel}>{s.label}</div>
            <div style={{ ...S.summaryVal, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {goals.length > 0 && (
        <div style={S.overallCard}>
          <div style={S.overallLeft}>
            <div style={S.cardTitle}>Overall Progress</div>
            <div style={S.overallAmt}>{formatCurrency(totalSaved, currency)} <span style={S.overallOf}>of {formatCurrency(totalTargeted, currency)}</span></div>
          </div>
          <div style={S.overallRight}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="28" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="36" cy="36" r="28" fill="none" stroke="var(--gold)" strokeWidth="8"
                strokeDasharray={`${(overallPct / 100) * 176} 176`}
                strokeLinecap="round" transform="rotate(-90 36 36)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(201,168,76,0.5))' }} />
              <text x="36" y="40" textAnchor="middle" fill="var(--gold)" fontSize="13" fontFamily="Cormorant Garamond" fontWeight="700">{overallPct}%</text>
            </svg>
          </div>
        </div>
      )}

      {/* Add form */}
      <div style={goalLimitReached ? { ...S.formCard, ...S.lockedFormCard } : S.formCard}>
        <div style={S.formTitleRow}>
          <div style={S.cardTitle}>Add New Goal</div>
          {goalLimitReached && <span style={S.limitTag}><Lock size={12} /> Free plan limit</span>}
          {submitted && <span style={S.successTag}>✓ Goal Added!</span>}
        </div>
        {goalLimitReached && (
          <div style={S.upgradePrompt}>
            <div style={S.upgradeIcon}><Sparkles size={18} /></div>
            <div style={{ flex: 1 }}>
              <div style={S.upgradeTitle}>Your first goal is active. Silver unlocks unlimited planning.</div>
              <div style={S.upgradeText}>Add more goals, plan deadlines, and track emergency fund progress without replacing your current goal.</div>
            </div>
            {onUpgrade && <button style={S.upgradeBtn} onClick={onUpgrade}>Upgrade to Silver</button>}
          </div>
        )}
        <div className="goals-form-grid">
          <div style={S.field}>
            <label style={S.label}>Goal Name</label>
            <input style={S.input} placeholder="e.g. Mombasa Vacation" value={name} onChange={(e) => setName(e.target.value)} disabled={goalLimitReached} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)} disabled={goalLimitReached}>
              {(Object.entries(GOAL_META) as [GoalCategory, typeof GOAL_META[GoalCategory]][]).map(([k, m]) => (
                <option key={k} value={k}>{m.icon} {m.label}</option>
              ))}
            </select>
          </div>
          <div style={S.field}>
            <label style={S.label}>Target Amount (KSh)</label>
            <input style={S.input} type="number" placeholder="e.g. 150000" value={target} onChange={(e) => setTarget(e.target.value)} disabled={goalLimitReached} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Already Saved (KSh)</label>
            <input style={S.input} type="number" placeholder="0" value={saved} onChange={(e) => setSaved(e.target.value)} disabled={goalLimitReached} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Monthly Contribution (KSh)</label>
            <input style={S.input} type="number" placeholder="e.g. 5000" value={monthly} onChange={(e) => setMonthly(e.target.value)} disabled={goalLimitReached} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Deadline (optional)</label>
            <input style={S.input} type="month" value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={goalLimitReached}
              // style={{ ...S.input, colorScheme: 'dark' }}
            />
          </div>
        </div>
        <div style={S.formBottom}>
          <input style={{ ...S.input, flex: 1 }} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={goalLimitReached} />
          <button style={{ ...S.addBtn, opacity: !name.trim() || !target || goalLimitReached ? 0.5 : 1 }} onClick={handleAdd} disabled={!name.trim() || !target || goalLimitReached}>
            + Add Goal
          </button>
        </div>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div>
          <div style={S.sectionTitle}>🎯 Active Goals ({activeGoals.length})</div>
          <div style={S.goalGrid}>
            {activeGoals.map((goal) => {
              const meta = GOAL_META[goal.category];
              const pct  = getGoalProgress(goal);
              const status = getGoalDeadlineStatus(goal);
              const projDate = projectGoalDate(goal);
              // const remaining = goal.targetAmount - goal.savedAmount;

              return (
                <div key={goal.id} style={{ ...S.goalCard, borderColor: `${meta.color}25` }}>
                  <div style={S.goalHeader}>
                    <div style={{ ...S.goalIcon, background: `${meta.color}18` }}>{meta.icon}</div>
                    <div style={S.goalInfo}>
                      <div style={S.goalName}>{goal.name}</div>
                      <div style={{ ...S.goalCat, color: meta.color }}>{meta.label}</div>
                    </div>
                    <div style={S.goalBadgeWrap}>
                      {status !== 'no-deadline' && (
                        <span style={{ ...S.statusBadge,
                          color: status === 'on-track' ? 'var(--green)' : 'var(--red)',
                          background: status === 'on-track' ? 'var(--green-dim)' : 'var(--red-dim)',
                        }}>
                          {status === 'on-track' ? '✓ On Track' : '⚠ Behind'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={S.goalAmounts}>
                    <div>
                      <div style={S.amtLabel}>Saved</div>
                      <div style={{ ...S.amtVal, color: meta.color }}>{formatCurrency(goal.savedAmount, currency)}</div>
                    </div>
                    <div style={S.amtDivider}>/</div>
                    <div>
                      <div style={S.amtLabel}>Target</div>
                      <div style={S.amtVal}>{formatCurrency(goal.targetAmount, currency)}</div>
                    </div>
                    <div style={S.amtPct}>{pct}%</div>
                  </div>

                  <div style={S.progressTrack}>
                    <div style={{ ...S.progressFill, width: `${pct}%`, background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})` }} />
                  </div>

                  <div style={S.goalMeta}>
                    {goal.deadline && <span>🗓 {goal.deadline}</span>}
                    {projDate && <span>📍 Est. {projDate}</span>}
                    {goal.monthlyContribution > 0 && <span>💰 {formatCurrency(goal.monthlyContribution, currency)}/mo</span>}
                  </div>

                  {/* Contribute panel */}
                  {contributeId === goal.id ? (
                    <div style={S.contributeRow}>
                      <input style={{ ...S.input, flex: 1, padding: '8px 12px', fontSize: 13 }}
                        type="number" placeholder="Amount to add..." value={contributeAmt}
                        onChange={(e) => setContributeAmt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleContribute(goal.id)}
                        autoFocus />
                      <button style={S.confirmBtn} onClick={() => handleContribute(goal.id)}>Add</button>
                      <button style={S.cancelBtn} onClick={() => setContributeId(null)}>✕</button>
                    </div>
                  ) : (
                    <div style={S.goalActions}>
                      <button style={S.contributeBtn} onClick={() => setContributeId(goal.id)}>+ Contribute</button>
                      <button style={S.removeBtn} onClick={() => onRemove(goal.id)}>Remove</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <div style={S.sectionTitle}>🏆 Completed Goals ({completedGoals.length})</div>
          <div style={S.completedList}>
            {completedGoals.map((goal) => {
              const meta = GOAL_META[goal.category];
              return (
                <div key={goal.id} style={S.completedItem}>
                  <span style={S.completedIcon}>{meta.icon}</span>
                  <div style={S.completedInfo}>
                    <div style={S.completedName}>{goal.name}</div>
                    <div style={S.completedAmt}>{formatCurrency(goal.targetAmount, currency)}</div>
                  </div>
                  <span style={S.completedBadge}>✓ Done</span>
                  <button style={S.removeBtn} onClick={() => onRemove(goal.id)}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>🎯</div>
          <div style={S.emptyTitle}>Set your first financial goal</div>
          <p style={S.emptyText}>Whether it's an emergency fund, a vacation, or a down payment — every goal starts with a single step.</p>
        </div>
      )}
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 20 },
  cardTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 },
  summaryBar: {},
  summaryItem: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' },
  summaryLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  summaryVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 700 },
  overallCard: { background: 'var(--bg-elevated)', border: '1px solid var(--border-acc)', borderRadius: 14, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  overallLeft: { flex: 1 },
  overallRight: { flexShrink: 0 },
  overallAmt: { fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: 'var(--gold)' },
  overallOf: { fontSize: 16, color: 'var(--text-3)' },
  formCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 22px' },
  formTitleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  successTag: { fontSize: 12, color: 'var(--green)', background: 'var(--green-dim)', padding: '3px 10px', borderRadius: 4, fontWeight: 600 },
  limitTag: { fontSize: 12, color: 'var(--gold)', background: 'var(--gold-dim)', border: '1px solid var(--border-acc)', padding: '3px 10px', borderRadius: 999, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 },
  lockedFormCard: { borderColor: 'var(--border-acc)', background: 'linear-gradient(135deg, var(--bg-card), var(--gold-dim))' },
  upgradePrompt: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: '1px solid var(--border-acc)', borderRadius: 12, background: 'var(--bg-surface)', marginBottom: 18, flexWrap: 'wrap' },
  upgradeIcon: { width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', color: 'var(--gold)', background: 'var(--gold-dim)', flexShrink: 0 },
  upgradeTitle: { fontSize: 14, fontWeight: 800, color: 'var(--text-1)', marginBottom: 3 },
  upgradeText: { fontSize: 12, color: 'var(--text-3)', lineHeight: 1.45 },
  upgradeBtn: { padding: '9px 14px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#0A1628', border: 'none', borderRadius: 9, fontWeight: 800, fontSize: 12, fontFamily: 'Karla, sans-serif', cursor: 'pointer' },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-1)', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  select: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text-1)', fontSize: 14, fontFamily: 'Karla, sans-serif' },
  formBottom: { display: 'flex', gap: 12, marginTop: 14, alignItems: 'center' },
  addBtn: { padding: '11px 24px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#0A1628', borderRadius: 9, fontWeight: 700, fontSize: 14, fontFamily: 'Karla, sans-serif', whiteSpace: 'nowrap', flexShrink: 0 },
  sectionTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 },
  goalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 },
  goalCard: { background: 'var(--bg-card)', border: '1px solid', borderRadius: 14, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 },
  goalHeader: { display: 'flex', alignItems: 'center', gap: 12 },
  goalIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
  goalInfo: { flex: 1, minWidth: 0 },
  goalName: { fontSize: 15, fontWeight: 600, color: 'var(--text-1)' },
  goalCat: { fontSize: 12, marginTop: 2 },
  goalBadgeWrap: { flexShrink: 0 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, letterSpacing: '0.06em' },
  goalAmounts: { display: 'flex', alignItems: 'center', gap: 12 },
  amtLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 },
  amtVal: { fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 700, color: 'var(--text-1)' },
  amtDivider: { color: 'var(--text-3)', fontSize: 20, alignSelf: 'flex-end', paddingBottom: 2 },
  amtPct: { marginLeft: 'auto', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: 'var(--text-3)' },
  progressTrack: { height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.6s ease' },
  goalMeta: { display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)', flexWrap: 'wrap' },
  contributeRow: { display: 'flex', gap: 8, alignItems: 'center' },
  confirmBtn: { padding: '8px 16px', background: 'linear-gradient(135deg, var(--gold), var(--gold-l))', color: '#0A1628', borderRadius: 7, fontWeight: 700, fontSize: 13 },
  cancelBtn: { padding: '8px 10px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', borderRadius: 7, fontSize: 13 },
  goalActions: { display: 'flex', gap: 8 },
  contributeBtn: { flex: 1, padding: '9px 0', background: 'var(--gold-dim)', border: '1px solid var(--border-acc)', color: 'var(--gold)', borderRadius: 8, fontWeight: 600, fontSize: 13 },
  removeBtn: { padding: '9px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', borderRadius: 8, fontSize: 13 },
  completedList: { display: 'flex', flexDirection: 'column', gap: 8 },
  completedItem: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--green-dim)', border: '1px solid var(--green-b)', borderRadius: 10 },
  completedIcon: { fontSize: 22, flexShrink: 0 },
  completedInfo: { flex: 1 },
  completedName: { fontSize: 14, color: 'var(--text-1)', fontWeight: 500 },
  completedAmt: { fontSize: 12, color: 'var(--text-3)', marginTop: 2 },
  completedBadge: { fontSize: 11, color: 'var(--green)', background: 'var(--green-dim)', padding: '3px 10px', borderRadius: 20, fontWeight: 700 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', background: 'var(--bg-card)', border: '1px dashed var(--border-acc)', borderRadius: 14, textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, color: 'var(--gold)', marginBottom: 10 },
  emptyText: { fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 400 },
};
