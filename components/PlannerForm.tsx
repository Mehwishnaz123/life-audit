'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { makePlan, savePlan, type Plan } from '@/lib/actions/ai';

const EXAMPLES = ['Learn Machine Learning basics', 'Memorise Surah Al-Mulk', 'Lose 4 kg in a healthy way', 'Finish my final-year project'];

function niceDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function PlannerForm({ connected, today }: { connected: boolean; today: string }) {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hours, setHours] = useState('1');
  const [times, setTimes] = useState('Evening');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [withBlocks, setWithBlocks] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function create(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSaved(false); setPlan(null);
    start(async () => {
      const r = await makePlan({ goal, deadline, hours, times });
      if (r.ok) setPlan(r.data); else setError(r.error);
    });
  }
  function save() {
    if (!plan) return;
    setError('');
    start(async () => {
      const r = await savePlan(plan, withBlocks);
      if (r.ok) setSaved(true); else setError(r.error);
    });
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <form className="card stack" onSubmit={create} style={{ gap: 14 }}>
        <div className="field"><label htmlFor="pl-goal">What do you want to achieve?</label>
          <input id="pl-goal" className="input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. Learn Machine Learning basics" required maxLength={500} disabled={!connected} />
        </div>
        <div className="chat-starters">{EXAMPLES.map((x) => <button key={x} type="button" className="chip-btn" onClick={() => setGoal(x)} disabled={!connected}>{x}</button>)}</div>
        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="field grow"><label htmlFor="pl-dl">By when? (optional)</label><input id="pl-dl" type="date" className="input" min={today} value={deadline} onChange={(e) => setDeadline(e.target.value)} disabled={!connected} /></div>
          <div className="field grow"><label htmlFor="pl-h">Hours per day</label>
            <select id="pl-h" className="select" value={hours} onChange={(e) => setHours(e.target.value)} disabled={!connected}>
              {['0.5', '1', '1.5', '2', '3', '4'].map((h) => <option key={h} value={h}>{h} hour{h === '1' ? '' : 's'}</option>)}
            </select></div>
          <div className="field grow"><label htmlFor="pl-t">Best time</label>
            <select id="pl-t" className="select" value={times} onChange={(e) => setTimes(e.target.value)} disabled={!connected}>
              {['Early morning', 'Morning', 'Afternoon', 'Evening', 'Night', 'Any free time'].map((t) => <option key={t}>{t}</option>)}
            </select></div>
        </div>
        <button className="btn" disabled={!connected || pending || !goal.trim()}>{pending && !plan ? 'Making your plan…' : '✨ Make my plan'}</button>
      </form>

      {error && <p className="notice error" role="alert">{error}</p>}
      {pending && !plan && <div className="card plan-loading"><div className="chat-orb" /><p className="muted" style={{ margin: 0 }}>Reading your schedule and breaking your goal into steps…</p></div>}

      {plan && (
        <div className="card stack plan-card" style={{ gap: 16 }}>
          <div className="stack" style={{ gap: 6 }}>
            <span className="chip tone-month" style={{ alignSelf: 'flex-start' }}>{plan.area || 'Goal'}{plan.deadline ? ' · by ' + niceDate(plan.deadline) : ''}</span>
            <h2 className="h3" style={{ margin: 0 }}>{plan.goal_title}</h2>
            {plan.summary && <p className="muted" style={{ margin: 0 }}>{plan.summary}</p>}
          </div>
          <div>
            <h3 className="label" style={{ marginBottom: 8 }}>Steps (milestones)</h3>
            <ol className="plan-steps">{plan.milestones.map((m, i) => <li key={i} style={{ animationDelay: i * 0.08 + 's' }}><span>{m.title}</span>{m.due_date && <small>{niceDate(m.due_date)}</small>}</li>)}</ol>
          </div>
          {plan.blocks.length > 0 && (
            <div>
              <h3 className="label" style={{ marginBottom: 8 }}>This week's time blocks</h3>
              <ul className="plan-blocks">{plan.blocks.map((b, i) => <li key={i}><b>{niceDate(b.date)}</b><span>{b.start}–{b.end}</span><span>{b.title}</span></li>)}</ul>
              <label className="row" style={{ gap: 8, marginTop: 10, fontSize: 15 }}><input type="checkbox" checked={withBlocks} onChange={(e) => setWithBlocks(e.target.checked)} /> Also add these blocks to my day planner</label>
            </div>
          )}
          {saved ? (
            <div className="notice">✅ Saved! <Link href="/app/goals">See it in My goals</Link>{withBlocks && plan.blocks.length ? <> · <Link href="/app/week">See my week</Link></> : null}</div>
          ) : (
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="btn dark" onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save this plan'}</button>
              <button type="button" className="btn ghost" onClick={() => setPlan(null)} disabled={pending}>Try again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
