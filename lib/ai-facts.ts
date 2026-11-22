import { addDays } from '@/lib/dates';
import { loadPeriod } from '@/lib/audit';
import { normaliseBlocks, plannedMinutes, actualMinutes } from '@/lib/records';
import type { Area } from '@/lib/app-data';

/**
 * Everything the AI is allowed to know: a compact summary of the user's OWN records.
 * The AI never reads the database directly, so it cannot invent activity.
 */
export async function buildFacts(supabase: any, areas: Area[], today: string, name: string) {
  const [{ data: tasks }, { data: blocks }, { data: goals }, { data: ms }, { data: habits }, { data: logs }, week, month] = await Promise.all([
    supabase.from('tasks').select('title, due_date, priority, status, area_id').eq('status', 'todo').order('due_date', { nullsFirst: false }).limit(40),
    supabase.from('schedule_blocks').select('*, block_records(*)').gte('date', today).lte('date', addDays(today, 6)).order('date').order('start_time'),
    supabase.from('goals').select('id, title, horizon, deadline, priority, area_id').eq('status', 'active').limit(20),
    supabase.from('milestones').select('goal_id, title, completed_at, due_date').order('sort_order'),
    supabase.from('habits').select('id, title').is('archived_at', null),
    supabase.from('habit_logs').select('habit_id, date').gte('date', addDays(today, -6)),
    loadPeriod(supabase, areas, addDays(today, -6), today),
    loadPeriod(supabase, areas, addDays(today, -29), today),
  ]);
  const areaName = (id: string | null) => areas.find((a) => a.id === id)?.name || null;
  const pct = (r: number | null) => (r == null ? null : Math.round(r * 100) + '%');
  const upcoming = normaliseBlocks(blocks || []);

  return {
    user_name: name,
    today,
    life_areas: areas.map((a) => a.name),
    schedule_next_7_days: upcoming.map((b) => ({
      date: b.date, start: b.start_time.slice(0, 5), end: b.end_time.slice(0, 5), title: b.title,
      area: areaName(b.area_id), status: b.record?.status || 'not recorded',
    })),
    open_tasks: (tasks || []).map((t: any) => ({ title: t.title, due: t.due_date, priority: t.priority, area: areaName(t.area_id), overdue: !!t.due_date && t.due_date < today })),
    active_goals: (goals || []).map((g: any) => {
      const m = (ms || []).filter((x: any) => x.goal_id === g.id);
      return { title: g.title, timeframe: g.horizon, deadline: g.deadline, area: areaName(g.area_id), milestones_done: m.filter((x: any) => x.completed_at).length, milestones_total: m.length, next_milestone: m.find((x: any) => !x.completed_at)?.title || null };
    }),
    habits_last_7_days: (habits || []).map((h: any) => ({ habit: h.title, days_done: new Set((logs || []).filter((l: any) => l.habit_id === h.id).map((l: any) => l.date)).size })),
    last_7_days: summary(week),
    last_30_days: summary(month),
  };

  function summary(p: any) {
    return {
      planned_items: p.plannedItems, completed_items: p.doneItems, completion_rate: pct(p.rate),
      planned_hours: +(p.plannedMin / 60).toFixed(1), recorded_real_hours: +(p.actualMin / 60).toFixed(1),
      skipped_blocks: p.skipped, unrecorded_blocks: p.unrecorded.length,
      habit_consistency: pct(p.habitRate),
      postponed_again_and_again: p.postponed.map(([t, n]: [string, number]) => `${t} (${n} times)`),
      skip_reasons: p.skipReasons.map(([r, n]: [string, number]) => `${r} (${n})`),
      by_life_area: p.areaStats.filter((a: any) => a.items).map((a: any) => ({ area: a.area.name, items: a.items, done: a.doneItems, planned_hours: +(a.plannedMin / 60).toFixed(1) })),
      days: p.days.map((d: any) => ({ date: d.date, planned: d.planned, done: d.done })),
      journal_days: p.journalDays,
    };
  }
}

export const FACT_RULES = `Rules you must always follow:
- Use ONLY the JSON facts given to you. Never invent tasks, habits, numbers, dates or progress.
- If the facts do not contain something, say plainly that it has not been recorded yet and suggest how to record it in the app.
- Be warm, short and practical. Never shame the user for missed days; help them restart.
- Write in the same language the user writes in (English, Urdu or Roman Urdu are all fine).
- Do not give medical, legal or financial advice beyond simple everyday planning tips.`;
