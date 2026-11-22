export const metadata = { title: 'Deadlines · Life Audit' };
import Link from 'next/link';
import { getAppContext, type Task } from '@/lib/app-data';
import { addDays, daysBetween } from '@/lib/dates';
import TaskRow from '@/components/TaskRow';

export default async function DeadlinesPage() {
  const { supabase, today, areas } = await getAppContext();
  const [{ data: t }, { data: goals }, { data: ms }] = await Promise.all([
    supabase.from('tasks').select('*').eq('status', 'todo').not('due_date', 'is', null).order('due_date'),
    supabase.from('goals').select('id, title, deadline, status').eq('status', 'active').not('deadline', 'is', null).order('deadline'),
    supabase.from('milestones').select('id, title, due_date, completed_at, goal_id').is('completed_at', null).not('due_date', 'is', null).order('due_date'),
  ]);
  const tasks = (t || []) as Task[];
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const goalById = Object.fromEntries((goals || []).map((g: any) => [g.id, g]));
  const week = addDays(today, 7);
  const month = addDays(today, 31);

  const groups: [string, string, (d: string) => boolean][] = [
    ['Overdue', 'tone-overdue', (d) => d < today],
    ['Due today', 'tone-today', (d) => d === today],
    ['Due tomorrow', 'tone-tomorrow', (d) => d === addDays(today, 1)],
    ['This week', 'tone-week', (d) => d > addDays(today, 1) && d <= week],
    ['This month', 'tone-month', (d) => d > week && d <= month],
    ['Later', 'tone-later', (d) => d > month],
  ];
  const other = [
    ...(goals || []).map((g: any) => ({ id: 'g' + g.id, kind: 'Goal', title: g.title, date: g.deadline })),
    ...(ms || []).map((m: any) => ({ id: 'm' + m.id, kind: 'Step', title: `${m.title}${goalById[m.goal_id] ? ' · ' + goalById[m.goal_id].title : ''}`, date: m.due_date })),
  ];
  const total = tasks.length + other.length;

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Deadlines</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Everything with a due date, in one list, the most urgent first. Tick a task when it is done.</p>
      </header>
      {total === 0 && (
        <div className="empty">
          No deadlines yet. <Link href="/app/tasks">Add a task with a due date</Link>.
        </div>
      )}
      {groups.map(([label, tone, test]) => {
        const ts = tasks.filter((x) => x.due_date && test(x.due_date));
        const os = other.filter((x) => test(x.date));
        if (!ts.length && !os.length) return null;
        return (
          <section key={label} className="card">
            <div className="row" style={{ gap: 10 }}>
              <span className={'chip ' + tone} style={{ fontSize: 13 }}>{label}</span>
              <span className="muted">{ts.length + os.length} item{ts.length + os.length > 1 ? 's' : ''}</span>
            </div>
            {ts.map((x) => <TaskRow key={x.id} task={x} area={x.area_id ? areaById[x.area_id] : undefined} today={today} />)}
            {os.map((x) => {
              const n = daysBetween(today, x.date);
              return (
                <Link key={x.id} href="/app/goals" className="task-row" style={{ textDecoration: 'none', color: 'var(--ink)' }}>
                  <span className="chip" style={{ background: 'var(--peach)', color: '#7A2E0E' }}>{x.kind}</span>
                  <span className="task-title">{x.title}</span>
                  <span className="muted">{n < 0 ? `${-n} days late` : n === 0 ? 'today' : `in ${n} days`}</span>
                </Link>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
