export const metadata = { title: 'Goals · Life Audit' };
import { getAppContext } from '@/lib/app-data';
import { addGoal, addMilestone, toggleMilestone, setGoalStatus, deleteGoal } from '@/lib/actions/app';
import { urgency } from '@/lib/dates';
import AreaChip, { AreaSelect } from '@/components/AreaChip';

const HORIZONS: [string, string][] = [
  ['yearly', 'Yearly'],
  ['half_year', 'Six-month'],
  ['quarterly', 'Quarterly'],
  ['monthly', 'Monthly'],
  ['weekly', 'Weekly'],
  ['milestone', 'Personal milestone'],
];

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const sp = await searchParams;
  const { supabase, areas, today } = await getAppContext();
  const [{ data: goals }, { data: milestones }, { data: tasks }] = await Promise.all([
    supabase.from('goals').select('*').order('created_at'),
    supabase.from('milestones').select('*').order('sort_order').order('created_at'),
    supabase.from('tasks').select('id, goal_id, status'),
  ]);
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const showAll = sp.show === 'all';
  const list = (goals || []).filter((g: any) => showAll || g.status === 'active' || g.status === 'paused');

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Goals</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Progress is counted from the milestones and linked tasks you finish. You never type a percentage.</p>
      </header>

      <section className="card">
        <form action={addGoal} className="stack" style={{ gap: 12 }}>
          <div className="inline-form">
            <div className="field grow"><label htmlFor="g-title">New goal</label><input id="g-title" name="title" className="input" placeholder="e.g. Learn Machine Learning" required maxLength={200} /></div>
            <div className="field">
              <label htmlFor="g-h">Time frame</label>
              <select id="g-h" name="horizon" className="select" defaultValue="yearly">{HORIZONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </div>
            <AreaSelect areas={areas} id="g-area" />
          </div>
          <div className="inline-form">
            <div className="field"><label htmlFor="g-start">Start date</label><input id="g-start" name="start_date" type="date" className="input" defaultValue={today} /></div>
            <div className="field"><label htmlFor="g-dl">Deadline</label><input id="g-dl" name="deadline" type="date" className="input" /></div>
            <div className="field">
              <label htmlFor="g-p">Priority</label>
              <select id="g-p" name="priority" className="select" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
            </div>
            <div className="field grow"><label htmlFor="g-d">Why it matters (optional)</label><input id="g-d" name="description" className="input" /></div>
            <button type="submit" className="btn">Add goal</button>
          </div>
        </form>
      </section>

      <nav className="filters" aria-label="Goal filter">
        <a href="/app/goals" aria-current={!showAll ? 'page' : undefined}>Active</a>
        <a href="/app/goals?show=all" aria-current={showAll ? 'page' : undefined}>All goals</a>
      </nav>

      {list.length === 0 && <p className="empty">No goals yet. Add one above, then break it into milestones.</p>}

      <section className="cols">
        {list.map((g: any) => {
          const ms = (milestones || []).filter((m: any) => m.goal_id === g.id);
          const gt = (tasks || []).filter((t: any) => t.goal_id === g.id);
          const total = ms.length + gt.length;
          const done = ms.filter((m: any) => m.completed_at).length + gt.filter((t: any) => t.status === 'done').length;
          const pct = total ? Math.round((done / total) * 100) : 0;
          const area = g.area_id ? areaById[g.area_id] : null;
          const color = area?.color || '#C2255C';
          const dl = g.deadline ? urgency(g.deadline, today, g.status === 'completed') : null;
          return (
            <article key={g.id} className="card">
              <div className="row" style={{ gap: 6 }}>
                <AreaChip area={area} />
                <span className="chip" style={{ background: 'var(--ground)', color: 'var(--ink-soft)' }}>{HORIZONS.find((h) => h[0] === g.horizon)?.[1]} goal</span>
                {g.status !== 'active' && <span className="chip tone-done">{g.status}</span>}
                {dl && <span className={'chip tone-' + dl.tone}>{dl.label}</span>}
              </div>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>{g.title}</h2>
                <span className="big" style={{ fontSize: 30, color }}>{pct}%</span>
              </div>
              {g.description && <p className="muted" style={{ margin: 0 }}>{g.description}</p>}
              <div className="bar" style={{ background: 'var(--track)' }}><span style={{ width: pct + '%', background: color, transition: 'width .5s' }} /></div>
              <span className="muted">{total ? `${done} of ${total} milestones and linked tasks done` : 'Add milestones to start measuring progress'}</span>
              {ms.map((m: any) => (
                <form key={m.id} action={toggleMilestone} className="task-row" style={{ padding: '4px 6px' }}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="done" value={m.completed_at ? '1' : '0'} />
                  <button type="submit" className={'tick' + (m.completed_at ? ' on' : '')} aria-label={(m.completed_at ? 'Mark not done: ' : 'Mark done: ') + m.title}>{m.completed_at ? '✓' : ''}</button>
                  <span className={'task-title' + (m.completed_at ? ' done' : '')}>{m.title}</span>
                  {m.due_date && <span className="muted">{m.due_date}</span>}
                </form>
              ))}
              <form action={addMilestone} className="inline-form">
                <input type="hidden" name="goal_id" value={g.id} />
                <input type="hidden" name="sort_order" value={ms.length} />
                <div className="field grow"><label htmlFor={'m-' + g.id} className="sr-only">New milestone</label><input id={'m-' + g.id} name="title" className="input" placeholder="Add a milestone" required /></div>
                <button type="submit" className="btn small dark">Add</button>
              </form>
              <div className="row" style={{ gap: 4 }}>
                {g.status !== 'completed' && (
                  <form action={setGoalStatus}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="status" value="completed" /><button type="submit" className="linkbtn">Mark goal achieved</button></form>
                )}
                {g.status === 'active' && (
                  <form action={setGoalStatus}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="status" value="paused" /><button type="submit" className="linkbtn">Pause</button></form>
                )}
                {g.status !== 'active' && (
                  <form action={setGoalStatus}><input type="hidden" name="id" value={g.id} /><input type="hidden" name="status" value="active" /><button type="submit" className="linkbtn">Make active</button></form>
                )}
                <form action={deleteGoal}><input type="hidden" name="id" value={g.id} /><button type="submit" className="linkbtn" style={{ color: 'var(--muted)' }}>Delete</button></form>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
