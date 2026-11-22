import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { addDays } from '@/lib/dates';
import { loadPeriod, pct } from '@/lib/audit';
import { normaliseBlocks, plannedMinutes, fmtMinutes, toMinutes } from '@/lib/records';
import { type Insight } from '@/lib/assistant';

export default async function AssistantPage() {
  const { supabase, areas, today } = await getAppContext();
  const [{ data: tasks }, { data: todayBlocks }, { data: goals }, { data: milestones }, { data: habits }, { data: logs }, week] = await Promise.all([
    supabase.from('tasks').select('*').eq('status', 'todo'),
    supabase.from('schedule_blocks').select('*, block_records(*)').eq('date', today).order('start_time'),
    supabase.from('goals').select('*').eq('status', 'active'),
    supabase.from('milestones').select('goal_id, completed_at'),
    supabase.from('habits').select('*').is('archived_at', null),
    supabase.from('habit_logs').select('habit_id').eq('date', today),
    loadPeriod(supabase, areas, addDays(today, -6), today),
  ]);
  const open = tasks || [];
  const blocks = normaliseBlocks(todayBlocks || []);
  const out: Insight[] = [];

  const overdue = open.filter((t: any) => t.due_date && t.due_date < today);
  if (overdue.length) out.push({ kind: 'Overdue', tone: 'tone-overdue', text: `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} past the deadline: ${overdue.slice(0, 4).map((t: any) => t.title).join(', ')}. Reschedule or cancel them so they stop weighing on your list.` });

  const soon = open.filter((t: any) => t.due_date && t.due_date >= today && t.due_date <= addDays(today, 3)).sort((a: any, b: any) => a.due_date.localeCompare(b.due_date));
  if (soon.length) out.push({ kind: 'Priorities', tone: 'tone-today', text: `Coming up in the next 3 days: ${soon.slice(0, 4).map((t: any) => `${t.title} (${t.due_date === today ? 'today' : t.due_date})`).join(', ')}. Consider doing "${soon[0].title}" first.` });

  const plannedToday = blocks.reduce((a, b) => a + plannedMinutes(b), 0);
  if (plannedToday > 12 * 60) out.push({ kind: 'Overloaded day', tone: 'tone-week', text: `Today has ${fmtMinutes(plannedToday)} of planned blocks. That leaves little room for rest or surprises.` });

  const sorted = [...blocks].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const clashes: string[] = [];
  for (let i = 1; i < sorted.length; i++) if (toMinutes(sorted[i].start_time) < toMinutes(sorted[i - 1].end_time)) clashes.push(`${sorted[i - 1].title} and ${sorted[i].title}`);
  if (clashes.length) out.push({ kind: 'Schedule conflict', tone: 'tone-tomorrow', text: `These blocks overlap today: ${clashes.join('; ')}.` });

  if (week.postponed.length) out.push({ kind: 'Procrastination pattern', tone: 'tone-month', text: `This week you pushed these to later more than once: ${week.postponed.map(([t, n]) => `${t} (${n}×)`).join(', ')}. Try a shorter block or an earlier time.` });

  const doneIds = new Set((logs || []).map((l: any) => l.habit_id));
  const left = (habits || []).filter((h: any) => !doneIds.has(h.id));
  if (left.length) out.push({ kind: 'Habits', tone: 'tone-week', text: `Still open today: ${left.map((h: any) => h.title).join(', ')}.` });

  const noMs = (goals || []).filter((g: any) => !(milestones || []).some((m: any) => m.goal_id === g.id));
  if (noMs.length) out.push({ kind: 'Goals', tone: 'tone-month', text: `${noMs.map((g: any) => g.title).join(', ')} ${noMs.length > 1 ? 'have' : 'has'} no milestones yet, so progress cannot be measured. Break ${noMs.length > 1 ? 'them' : 'it'} into 3–5 steps.` });

  if (week.rate != null) out.push({ kind: 'Last 7 days', tone: 'tone-done', text: `You completed ${pct(week.rate)} of what you planned over the last 7 days${week.habitRate != null ? `, with ${pct(week.habitRate)} habit consistency` : ''}.` });

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Smart tips</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Suggestions built only from what you recorded.</p>
      </header>
      <p className="notice">Want to talk it through? <Link href="/app/coach">Ask the AI Coach</Link> or let the <Link href="/app/planner">AI Planner</Link> turn a goal into steps.</p>
      {out.length === 0 ? (
        <div className="card"><h2 className="h3">All clear</h2><p className="muted" style={{ margin: 0 }}>Nothing needs attention right now. Add tasks, goals or time blocks and suggestions will appear here.</p></div>
      ) : (
        <section className="cols">
          {out.map((i) => (
            <div key={i.kind} className="card">
              <span className={'chip ' + i.tone} style={{ alignSelf: 'flex-start' }}>{i.kind}</span>
              <p style={{ margin: 0, fontSize: 17 }}>{i.text}</p>
            </div>
          ))}
        </section>
      )}
      <div className="row"><Link href="/app/tasks" className="btn small dark">Open tasks</Link><Link href="/app/day" className="btn small ghost">Plan today</Link></div>
    </div>
  );
}
