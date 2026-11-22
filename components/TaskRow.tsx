import { toggleTask, deleteTask } from '@/lib/actions/tasks';
import { urgency } from '@/lib/dates';
import type { Area, Task } from '@/lib/app-data';

export default function TaskRow({ task, area, today, showDelete = false }: { task: Task; area?: Area; today: string; showDelete?: boolean }) {
  const done = task.status === 'done';
  const u = urgency(task.due_date, today, done);
  return (
    <div className="task-row">
      <form action={toggleTask}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="done" value={done ? '1' : '0'} />
        <button type="submit" className={'tick' + (done ? ' on' : '')} aria-label={(done ? 'Mark not done: ' : 'Mark done: ') + task.title}>
          {done ? '✓' : ''}
        </button>
      </form>
      <span className={'task-title' + (done ? ' done' : '')}>
        {task.title}
        {task.priority === 'high' && !done && <span className="chip" style={{ marginLeft: 8, background: 'var(--blush)', color: '#7A1B3F' }}>High</span>}
      </span>
      {area && (
        <span className="chip" style={{ background: area.color + '22', color: 'var(--ink)', border: `1px solid ${area.color}55` }}>
          {area.name}
        </span>
      )}
      <span className={'chip tone-' + u.tone}>{u.label}</span>
      {showDelete && (
        <form action={deleteTask}>
          <input type="hidden" name="id" value={task.id} />
          <button type="submit" className="iconbtn" aria-label={'Delete ' + task.title}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
