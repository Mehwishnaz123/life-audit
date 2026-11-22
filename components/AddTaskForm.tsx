import { addTask } from '@/lib/actions/tasks';
import type { Area } from '@/lib/app-data';

export default function AddTaskForm({ areas, today }: { areas: Area[]; today: string }) {
  return (
    <form action={addTask} className="inline-form">
      <div className="field grow">
        <label htmlFor="task-title">New task</label>
        <input id="task-title" name="title" className="input" placeholder="What needs doing?" required maxLength={200} />
      </div>
      <div className="field">
        <label htmlFor="task-area">Life area</label>
        <select id="task-area" name="area_id" className="select" defaultValue={areas[0]?.id || ''}>
          <option value="">None</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="task-due">Deadline</label>
        <input id="task-due" name="due_date" type="date" className="input" defaultValue={today} />
      </div>
      <div className="field">
        <label htmlFor="task-priority">Priority</label>
        <select id="task-priority" name="priority" className="select" defaultValue="medium">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <button type="submit" className="btn">Add task</button>
    </form>
  );
}
