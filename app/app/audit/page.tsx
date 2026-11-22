import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { addDays, prettyDate } from '@/lib/dates';
import { loadPeriod, pct, weekStartOf } from '@/lib/audit';
import { fmtMinutes } from '@/lib/records';

const PERIODS = [
  ['daily', 'Daily'],
  ['weekly', 'Weekly'],
  ['monthly', 'Monthly'],
  ['yearly', 'Yearly'],
] as const;

function range(period: string, today: string, weekStart: number) {
  if (period === 'weekly') {
    const s = weekStartOf(today, weekStart);
    return { from: s, to: addDays(s, 6), prevFrom: addDays(s, -7), prevTo: addDays(s, -1), label: 'This week', prevLabel: 'last week' };
  }
  if (period === 'monthly') {
    const [y, m] = today.split('-').map(Number);
    const from = `${today.slice(0, 7)}-01`;
    const to = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
    const prevTo = addDays(from, -1);
    return { from, to, prevFrom: prevTo.slice(0, 7) + '-01', prevTo, label: 'This month', prevLabel: 'last month' };
  }
  if (period === 'yearly') {
    const y = Number(today.slice(0, 4));
    return { from: `${y}-01-01`, to: `${y}-12-31`, prevFrom: `${y - 1}-01-01`, prevTo: `${y - 1}-12-31`, label: `${y}`, prevLabel: `${y - 1}` };
  }
  return { from: today, to: today, prevFrom: addDays(today, -1), prevTo: addDays(today, -1), label: 'Today', prevLabel: 'yesterday' };
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const sp = await searchParams;
  const { supabase, areas, today, profile } = await getAppContext();
  const period = PERIODS.some((p) => p[0] === sp.period) ? (sp.period as string) : 'daily';
  const r = range(period, today, profile?.week_start ?? 1);
  const [cur, prev] = await Promise.all([loadPeriod(supabase, areas, r.from, r.to), loadPeriod(supabase, areas, r.prevFrom, r.prevTo)]);

  const pastDays = cur.days.filter((d) => d.date <= today && d.rate != null);
  const best = pastDays.length > 1 ? pastDays.reduce((a, d) => (d.rate! > a.rate! ? d : a)) : null;
  const worst = pastDays.length > 1 ? pastDays.reduce((a, d) => (d.rate! < a.rate! ? d : a)) : null;

  // Only compare when both periods actually have records.
  const compare = (a: number | null, b: number | null) => {
    if (a == null || b == null) return null;
    const diff = Math.round((a - b) * 100);
    return diff === 0 ? `same as ${r.prevLabel}` : `${diff > 0 ? '+' : ''}${diff} points vs ${r.prevLabel}`;
  };

  const findings: string[] = [];
  if (cur.rate != null) findings.push(`You completed ${Math.round(cur.doneItems * 10) / 10} of ${cur.plannedItems} planned items (${pct(cur.rate)}).`);
  if (cur.plannedMin) findings.push(`You planned ${fmtMinutes(cur.plannedMin)} of time blocks and recorded ${fmtMinutes(cur.actualMin)} actually spent.`);
  if (cur.unrecorded.length) findings.push(`${cur.unrecorded.length} time block${cur.unrecorded.length > 1 ? 's are' : ' is'} not recorded yet, so they are left out of the actual time.`);
  if (best && worst && best.date !== worst.date) findings.push(`Strongest day: ${prettyDate(best.date)} (${pct(best.rate)}). Lightest day: ${prettyDate(worst.date)} (${pct(worst.rate)}).`);
  if (cur.skipReasons.length) findings.push(`Most common reason for skipping: "${cur.skipReasons[0][0]}" (${cur.skipReasons[0][1]} time${cur.skipReasons[0][1] > 1 ? 's' : ''}).`);
  if (cur.postponed.length) findings.push(`Pushed to later two or more times: ${cur.postponed.map(([t, n]) => `${t} (${n}×)`).join(', ')}.`);
  if (cur.goalsDone.length) findings.push(`Goals achieved: ${cur.goalsDone.map((g: any) => g.title).join(', ')}.`);
  if (cur.goalsOpenPastDeadline.length) findings.push(`Goals past their deadline and still open: ${cur.goalsOpenPastDeadline.map((g: any) => g.title).join(', ')}.`);

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>My reports</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Daily, weekly, monthly and yearly reports of what really happened, counted only from what you recorded.</p>
      </header>
      <nav className="filters" aria-label="Audit period">
        {PERIODS.map(([k, l]) => (
          <Link key={k} href={k === 'daily' ? '/app/audit' : `/app/audit?period=${k}`} aria-current={period === k ? 'page' : undefined}>{l}</Link>
        ))}
      </nav>

      {!cur.hasData ? (
        <div className="card" style={{ background: 'var(--butter)' }}>
          <h2 className="h3">Not enough recorded activity for {r.label.toLowerCase()} yet</h2>
          <p style={{ margin: 0, color: '#5A3D0C' }}>Plan blocks in My Day, add tasks with deadlines and tick off habits. The audit fills in from those records and never guesses.</p>
          <div className="row"><Link href="/app/day" className="btn small dark">Plan my day</Link><Link href="/app/habits" className="btn small ghost">Habits</Link></div>
        </div>
      ) : (
        <>
          <section className="tiles">
            <div className="tile hot"><span style={{ fontSize: 14 }}>Completion</span><span className="big">{pct(cur.rate)}</span><span style={{ fontSize: 13 }}>{compare(cur.rate, prev.rate) || r.label}</span></div>
            <div className="tile"><span className="muted">Time: planned → actual</span><span className="big" style={{ fontSize: 28 }}>{fmtMinutes(cur.plannedMin)} → {fmtMinutes(cur.actualMin)}</span><span className="muted">{cur.recordedBlocks} of {cur.blocks.length} blocks recorded</span></div>
            <div className="tile" style={{ background: 'var(--butter)' }}><span className="muted" style={{ color: '#5A3D0C' }}>Habit consistency</span><span className="big">{pct(cur.habitRate)}</span><span className="muted" style={{ color: '#5A3D0C' }}>{compare(cur.habitRate, prev.habitRate) || ' '}</span></div>
            <div className="tile" style={{ background: 'var(--blush)' }}><span className="muted" style={{ color: '#7A1B3F' }}>Finished</span><span className="big">{cur.tasksDone.length}</span><span className="muted" style={{ color: '#7A1B3F' }}>tasks · {cur.msDone.length} milestones · {cur.goalsDone.length} goals</span></div>
          </section>

          <section className="cols">
            <div className="card">
              <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Findings</h2>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>{findings.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
            <div className="audit-card" style={{ color: 'var(--ground)' }}>
              <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>By life area</h2>
              <div className="legend"><span><i style={{ background: '#FFC93C' }} />Share of planned items done</span></div>
              {cur.areaStats.filter((a) => a.items > 0).map((a) => {
                const p = prev.areaStats.find((x) => x.area.id === a.area.id);
                const c = compare(a.score, p?.score ?? null);
                return (
                  <div key={a.area.id} className="stack" style={{ gap: 5 }}>
                    <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                      <span>{a.area.name}</span>
                      <span style={{ color: '#FBE4EA' }}>{pct(a.score)}{a.actualMin ? ` · ${fmtMinutes(a.actualMin)}` : ''}{c ? ` · ${c}` : ''}</span>
                    </div>
                    <div className="bar"><span style={{ width: Math.round((a.score || 0) * 100) + '%', background: a.area.color }} /></div>
                  </div>
                );
              })}
              {cur.areaStats.every((a) => a.items === 0) && <p style={{ margin: 0, color: '#FBE4EA' }}>Give your blocks, tasks and habits a life area to see this.</p>}
            </div>
          </section>

          {period !== 'daily' && (
            <section className="card">
              <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Day by day</h2>
              <div role="img" aria-label="Completion rate for each day" style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 140, overflowX: 'auto' }}>
                {cur.days.filter((d) => d.date <= today).map((d) => (
                  <span key={d.date} title={`${d.date}: ${pct(d.rate)}`} style={{ flex: '1 0 6px', minWidth: 6, height: d.rate == null ? 4 : Math.max(6, d.rate * 130), borderRadius: '6px 6px 2px 2px', background: d.rate == null ? 'var(--track)' : 'linear-gradient(180deg,#FFC93C,#FF7A2F)' }} />
                ))}
              </div>
              <span className="muted">Each bar is one day. A flat grey bar means nothing was planned that day.</span>
            </section>
          )}

          <section className="cols">
            <div className="card">
              <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Habits</h2>
              {cur.habitStats.length === 0 && <p className="muted" style={{ margin: 0 }}>No habits yet.</p>}
              {cur.habitStats.map((h: any) => (
                <div key={h.habit.id} className="stack" style={{ gap: 5 }}>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 15 }}><span>{h.habit.title}</span><strong>{pct(h.rate)}</strong></div>
                  <div className="bar" style={{ background: 'var(--track)' }}><span style={{ width: Math.round((h.rate || 0) * 100) + '%', background: 'var(--rasp)' }} /></div>
                </div>
              ))}
            </div>
            <div className="card">
              <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Still open</h2>
              {cur.tasksOpenDue.length + cur.unfinished.length === 0 && <p className="muted" style={{ margin: 0 }}>Nothing left open for this period.</p>}
              {cur.tasksOpenDue.map((t: any) => <div key={t.id} className="task-row"><span className="chip tone-today">Task</span><span className="task-title">{t.title}</span><span className="muted">{t.due_date}</span></div>)}
              {cur.unfinished.map((b) => <div key={b.id} className="task-row"><span className="chip tone-week">{b.record?.status}</span><span className="task-title">{b.title}</span><span className="muted">{b.date}</span></div>)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
