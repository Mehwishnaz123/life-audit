import Link from 'next/link';
import { getAppContext, type Task } from '@/lib/app-data';
import { addDays, prettyDate } from '@/lib/dates';
import TaskRow from '@/components/TaskRow';
import AddTaskForm from '@/components/AddTaskForm';

export default async function OverviewPage() {
  const { supabase, name, today, timezone, areas } = await getAppContext();
  const [{ data }, blocksC, habitsC, journalC, goalsC] = await Promise.all([
    supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
    supabase.from('schedule_blocks').select('id', { count: 'exact', head: true }),
    supabase.from('habits').select('id', { count: 'exact', head: true }),
    supabase.from('journal_entries').select('id', { count: 'exact', head: true }),
    supabase.from('goals').select('id', { count: 'exact', head: true }),
  ]);
  const tasks = (data || []) as Task[];
  const steps = [
    { done: tasks.length > 0, title: 'Add your first task', hint: 'Something you need to do, with a deadline.', href: '/app/tasks' },
    { done: (blocksC.count || 0) > 0, title: 'Plan your day by the hour', hint: 'Add a time block like "Study, 7 to 9 AM".', href: '/app/day' },
    { done: (habitsC.count || 0) > 0, title: 'Start one good habit', hint: 'For example prayers, water or reading.', href: '/app/habits' },
    { done: (goalsC.count || 0) > 0, title: 'Set one big goal', hint: 'Then break it into small steps.', href: '/app/goals' },
    { done: (journalC.count || 0) > 0, title: 'Write two lines in your journal', hint: 'What went well today?', href: '/app/journal' },
  ];
  const stepsDone = steps.filter((x) => x.done).length;

  const completedToday = (t: Task) =>
    t.status === 'done' && t.completed_at && new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(t.completed_at)) === today;
  // "Today" = open tasks due today or earlier, plus anything finished today.
  const todays = tasks.filter((t) => (t.status === 'todo' && t.due_date && t.due_date <= today) || completedToday(t));
  const doneToday = todays.filter((t) => t.status === 'done').length;
  const open = tasks.filter((t) => t.status === 'todo');
  const overdue = open.filter((t) => t.due_date && t.due_date < today).length;
  const weekEnd = addDays(today, 7);
  const thisWeek = open.filter((t) => t.due_date && t.due_date >= today && t.due_date <= weekEnd).length;
  const upcoming = open.filter((t) => t.due_date && t.due_date > today).slice(0, 5);
  const pct = todays.length ? Math.round((doneToday / todays.length) * 100) : 0;
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));

  const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: 'numeric', hour12: false }).format(new Date()));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const rings = areas.map((a) => {
    const items = todays.filter((t) => t.area_id === a.id);
    const d = items.filter((t) => t.status === 'done').length;
    const p = items.length ? Math.round((d / items.length) * 100) : 0;
    return { ...a, p, items: items.length, d };
  });

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <span className="muted" style={{ fontSize: 15 }}>{prettyDate(today)}</span>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>
          {greeting}, {name}
        </h1>
      </header>

      {stepsDone < steps.length && (
        <section className="card" style={{ background: 'linear-gradient(120deg, #FFF1C2, #FFE1EA)' }} aria-label="Getting started">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 className="h3 serif" style={{ fontSize: 24, fontWeight: 500 }}>Getting started: {stepsDone} of {steps.length} done</h2>
            <span className="muted">About 5 minutes in total</span>
          </div>
          <div className="bar" style={{ background: '#fff' }}><span style={{ width: (stepsDone / steps.length) * 100 + '%', background: 'var(--grad)', transition: 'width .5s' }} /></div>
          <div className="rings" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px, 100%), 1fr))' }}>
            {steps.map((st, i) => (
              <Link key={st.href} href={st.href} className="lift" style={{ textDecoration: 'none', color: 'var(--ink)', background: '#fff', borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 4, opacity: st.done ? 0.6 : 1 }}>
                <span className="row" style={{ gap: 8 }}>
                  <span className={'tick' + (st.done ? ' on' : '')} style={{ width: 24, height: 24 }} aria-hidden="true">{st.done ? '✓' : i + 1}</span>
                  <strong style={{ textDecoration: st.done ? 'line-through' : 'none' }}>{st.title}</strong>
                </span>
                <span className="muted" style={{ fontSize: 13 }}>{st.hint}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="tiles" aria-label="Today in numbers">
        <div className="tile hot">
          <span style={{ fontSize: 14 }}>Done today</span>
          <span className="big">
            {doneToday}
            <span style={{ fontSize: 19 }}> of {todays.length}</span>
          </span>
          <span style={{ fontSize: 13 }}>{pct}% of today</span>
        </div>
        <div className="tile">
          <span className="muted">Open tasks</span>
          <span className="big">{open.length}</span>
        </div>
        <div className="tile" style={{ background: 'var(--blush)' }}>
          <span className="muted" style={{ color: '#7A1B3F' }}>Overdue</span>
          <span className="big">{overdue}</span>
        </div>
        <div className="tile" style={{ background: 'var(--butter)' }}>
          <span className="muted" style={{ color: '#5A3D0C' }}>Due in the next 7 days</span>
          <span className="big">{thisWeek}</span>
        </div>
      </section>

      <section className="card">
        <AddTaskForm areas={areas} today={today} />
      </section>

      <section className="cols">
        <div className="card">
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Today</h2>
          {todays.length === 0 ? (
            <p className="empty">Nothing due today. Add a task above with today's date.</p>
          ) : (
            todays.map((t) => <TaskRow key={t.id} task={t} area={t.area_id ? areaById[t.area_id] : undefined} today={today} />)
          )}
        </div>
        <div className="card">
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Upcoming deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="empty">No upcoming deadlines.</p>
          ) : (
            upcoming.map((t) => <TaskRow key={t.id} task={t} area={t.area_id ? areaById[t.area_id] : undefined} today={today} />)
          )}
          <Link href="/app/tasks" style={{ fontWeight: 600 }}>All tasks and deadlines →</Link>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 className="h3 serif" style={{ fontSize: 26, fontWeight: 500 }}>My Life at a Glance</h2>
          <span className="muted">Share of today's tasks done in each life area</span>
        </div>
        <div className="rings">
          {rings.map((r) => (
            <div key={r.id} className="ring-card">
              <div
                className="ring-out"
                role="img"
                aria-label={`${r.name}: ${r.items ? r.p + '%' : 'nothing planned'} today`}
                style={{ background: `conic-gradient(${r.color} 0 ${r.p}%, var(--track) ${r.p}% 100%)` }}
              >
                <div className="ring-in">{r.items ? r.p + '%' : '—'}</div>
              </div>
              <span style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</span>
              <span className="muted" style={{ fontSize: 13 }}>{r.items ? `${r.d} of ${r.items} done` : 'Nothing planned'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
