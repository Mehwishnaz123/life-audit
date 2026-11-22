export const metadata = { title: 'This year · Life Audit' };
import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default async function YearPage({ searchParams }: { searchParams: Promise<{ y?: string }> }) {
  const sp = await searchParams;
  const { supabase, today, areas } = await getAppContext();
  const thisYear = Number(today.slice(0, 4));
  const y = sp.y && /^\d{4}$/.test(sp.y) ? Number(sp.y) : thisYear;
  const from = `${y}-01-01`;
  const to = `${y}-12-31`;
  const [{ data: goals }, { data: milestones }, { data: tasks }, { data: journal }, { data: blocks }] = await Promise.all([
    supabase.from('goals').select('*').order('deadline', { ascending: true, nullsFirst: false }),
    supabase.from('milestones').select('goal_id, completed_at'),
    supabase.from('tasks').select('due_date, status, completed_at').gte('due_date', from).lte('due_date', to),
    supabase.from('journal_entries').select('date').gte('date', from).lte('date', to),
    supabase.from('schedule_blocks').select('date').gte('date', from).lte('date', to),
  ]);
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const yearGoals = (goals || []).filter((g: any) => g.horizon === 'yearly' || (g.deadline && g.deadline.startsWith(String(y))));
  const progress = (g: any) => {
    const ms = (milestones || []).filter((m: any) => m.goal_id === g.id);
    return ms.length ? Math.round((ms.filter((m: any) => m.completed_at).length / ms.length) * 100) : 0;
  };

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>{y} at a glance</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Your big goals for the year, and what happened in each month.</p>
      </header>
      <nav className="filters" aria-label="Choose a year">
        <Link href={`/app/year?y=${y - 1}`}>← {y - 1}</Link>
        <Link href="/app/year" aria-current={y === thisYear ? 'page' : undefined}>This year</Link>
        <Link href={`/app/year?y=${y + 1}`}>{y + 1} →</Link>
      </nav>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Goals for {y}</h2>
          <Link href="/app/goals" className="btn small dark">Add a goal</Link>
        </div>
        {yearGoals.length === 0 && <p className="empty">No goals for this year yet. A good start: one goal for study, one for health, one for faith.</p>}
        {yearGoals.map((g: any) => {
          const p = progress(g);
          const color = (g.area_id && areaById[g.area_id]?.color) || '#C2255C';
          return (
            <div key={g.id} className="stack" style={{ gap: 6 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span><strong>{g.title}</strong> {g.status === 'completed' && <span className="chip tone-done">Achieved</span>}</span>
                <span style={{ color, fontWeight: 700 }}>{p}%</span>
              </div>
              <div className="bar" style={{ background: 'var(--track)' }}><span style={{ width: p + '%', background: color }} /></div>
            </div>
          );
        })}
      </section>

      <section className="rings" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))' }}>
        {MONTHS.map((name, i) => {
          const m = `${y}-${String(i + 1).padStart(2, '0')}`;
          const ts = (tasks || []).filter((t: any) => t.due_date.startsWith(m));
          const done = ts.filter((t: any) => t.status === 'done').length;
          const jd = (journal || []).filter((j: any) => j.date.startsWith(m)).length;
          const bd = new Set((blocks || []).filter((b: any) => b.date.startsWith(m)).map((b: any) => b.date)).size;
          const gd = (goals || []).filter((g: any) => g.deadline && g.deadline.startsWith(m));
          const isNow = m === today.slice(0, 7);
          const pct = ts.length ? Math.round((done / ts.length) * 100) : null;
          return (
            <Link key={m} href={`/app/calendar?m=${m}`} className="card lift" style={{ padding: 18, gap: 6, textDecoration: 'none', color: 'var(--ink)', outline: isNow ? '2px solid var(--rasp)' : 'none' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{name}</strong>
                {pct != null && <span className="chip tone-week">{pct}% done</span>}
              </div>
              <span className="muted">{ts.length} tasks · {done} done</span>
              <span className="muted">{bd} days planned · {jd} journal days</span>
              {gd.map((g: any) => <span key={g.id} className="chip tone-today" style={{ alignSelf: 'flex-start' }}>Goal due: {g.title}</span>)}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
