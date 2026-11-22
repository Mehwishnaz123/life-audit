import Link from 'next/link';
import { getAppContext, type Task } from '@/lib/app-data';
import { addDays } from '@/lib/dates';
import TaskRow from '@/components/TaskRow';
import AddTaskForm from '@/components/AddTaskForm';

const VIEWS = [
  ['open', 'All open'],
  ['overdue', 'Overdue'],
  ['today', 'Due today'],
  ['tomorrow', 'Due tomorrow'],
  ['week', 'This week'],
  ['month', 'This month'],
  ['upcoming', 'Upcoming'],
  ['none', 'No deadline'],
  ['done', 'Completed'],
] as const;

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const sp = await searchParams;
  const { supabase, today, areas } = await getAppContext();
  const { data } = await supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }).order('created_at');
  const tasks = (data || []) as Task[];
  const tomorrow = addDays(today, 1);
  const week = addDays(today, 7);
  const month = addDays(today, 31);

  const test: Record<string, (t: Task) => boolean> = {
    open: (t) => t.status === 'todo',
    overdue: (t) => t.status === 'todo' && !!t.due_date && t.due_date < today,
    today: (t) => t.status === 'todo' && t.due_date === today,
    tomorrow: (t) => t.status === 'todo' && t.due_date === tomorrow,
    week: (t) => t.status === 'todo' && !!t.due_date && t.due_date >= today && t.due_date <= week,
    month: (t) => t.status === 'todo' && !!t.due_date && t.due_date >= today && t.due_date <= month,
    upcoming: (t) => t.status === 'todo' && !!t.due_date && t.due_date > month,
    none: (t) => t.status === 'todo' && !t.due_date,
    done: (t) => t.status === 'done',
  };
  const view = sp.view && test[sp.view] ? sp.view : 'open';
  const shown = tasks.filter(test[view]);
  if (view === 'done') shown.sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''));
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Tasks</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Every deadline from every life area, in one place.</p>
      </header>
      <section className="card">
        <AddTaskForm areas={areas} today={today} />
      </section>
      <nav aria-label="Deadline views" className="filters">
        {VIEWS.map(([key, label]) => (
          <Link key={key} href={key === 'open' ? '/app/tasks' : `/app/tasks?view=${key}`} aria-current={view === key ? 'page' : undefined}>
            {label} ({tasks.filter(test[key]).length})
          </Link>
        ))}
      </nav>
      <section className="card">
        {shown.length === 0 ? (
          <p className="empty">Nothing in this view.</p>
        ) : (
          shown.map((t) => <TaskRow key={t.id} task={t} area={t.area_id ? areaById[t.area_id] : undefined} today={today} showDelete />)
        )}
      </section>
    </div>
  );
}
