import { addDays, daysBetween } from '@/lib/dates';
import { normaliseBlocks, plannedMinutes, actualMinutes, type Block } from '@/lib/records';
import type { Area } from '@/lib/app-data';

export type DayStat = { date: string; planned: number; done: number; rate: number | null };
export type AreaStat = { area: Area; plannedMin: number; actualMin: number; items: number; doneItems: number; score: number | null };

/** Everything in this report is counted from records the user saved. Nothing is estimated. */
export async function loadPeriod(supabase: any, areas: Area[], from: string, to: string) {
  const [{ data: b }, { data: tasks }, { data: habits }, { data: logs }, { data: milestones }, { data: goals }, { data: journal }] = await Promise.all([
    supabase.from('schedule_blocks').select('*, block_records(*)').gte('date', from).lte('date', to),
    supabase.from('tasks').select('*'),
    supabase.from('habits').select('*'),
    supabase.from('habit_logs').select('habit_id, date').gte('date', from).lte('date', to),
    supabase.from('milestones').select('*'),
    supabase.from('goals').select('*'),
    supabase.from('journal_entries').select('date').gte('date', from).lte('date', to),
  ]);
  const blocks: Block[] = normaliseBlocks(b || []);
  const allTasks = tasks || [];
  const inRange = (d?: string | null) => !!d && d >= from && d <= to;
  const dueTasks = allTasks.filter((t: any) => inRange(t.due_date));
  const completedTasks = allTasks.filter((t: any) => t.status === 'done' && inRange(String(t.completed_at || '').slice(0, 10)));
  const nDays = daysBetween(from, to) + 1;
  const dates = Array.from({ length: nDays }, (_, i) => addDays(from, i));

  const days: DayStat[] = dates.map((d) => {
    const bs = blocks.filter((x) => x.date === d);
    const ts = dueTasks.filter((t: any) => t.due_date === d);
    const planned = bs.length + ts.length;
    const done = bs.filter((x) => x.record?.status === 'done').length + 0.5 * bs.filter((x) => x.record?.status === 'partial').length + ts.filter((t: any) => t.status === 'done').length;
    return { date: d, planned, done, rate: planned ? done / planned : null };
  });
  const plannedItems = days.reduce((a, d) => a + d.planned, 0);
  const doneItems = days.reduce((a, d) => a + d.done, 0);

  const liveHabits = (habits || []).filter((h: any) => !h.archived_at);
  const habitStats = liveHabits.map((h: any) => {
    const created = String(h.created_at).slice(0, 10);
    const due = dates.filter((d) => d >= created).length;
    const done = (logs || []).filter((l: any) => l.habit_id === h.id).length;
    return { habit: h, due, done, rate: due ? done / due : null };
  });
  const habitDue = habitStats.reduce((a: number, h: any) => a + h.due, 0);
  const habitDone = habitStats.reduce((a: number, h: any) => a + h.done, 0);

  const areaStats: AreaStat[] = areas.map((a) => {
    const bs = blocks.filter((x) => x.area_id === a.id);
    const ts = dueTasks.filter((t: any) => t.area_id === a.id);
    const hs = habitStats.filter((h: any) => h.habit.area_id === a.id);
    const items = bs.length + ts.length + hs.reduce((x: number, h: any) => x + h.due, 0);
    const doneI =
      bs.filter((x) => x.record?.status === 'done').length + 0.5 * bs.filter((x) => x.record?.status === 'partial').length + ts.filter((t: any) => t.status === 'done').length + hs.reduce((x: number, h: any) => x + h.done, 0);
    return { area: a, plannedMin: bs.reduce((x, y) => x + plannedMinutes(y), 0), actualMin: bs.reduce((x, y) => x + actualMinutes(y), 0), items, doneItems: doneI, score: items ? doneI / items : null };
  });

  // Tasks or blocks pushed to later two or more times.
  const pushes: Record<string, number> = {};
  blocks.forEach((x) => {
    if (x.record && ['postpone', 'carry_forward', 'reschedule'].includes(x.record.next_action || '')) pushes[x.title] = (pushes[x.title] || 0) + 1;
  });
  const postponed = Object.entries(pushes).filter(([, n]) => n >= 2).sort((a, z) => z[1] - a[1]);

  const msDone = (milestones || []).filter((m: any) => inRange(String(m.completed_at || '').slice(0, 10)));
  const goalsDone = (goals || []).filter((g: any) => g.status === 'completed' && inRange(String(g.completed_at || '').slice(0, 10)));
  const goalsOpenPastDeadline = (goals || []).filter((g: any) => g.status === 'active' && g.deadline && g.deadline <= to);
  const skipReasons: Record<string, number> = {};
  blocks.forEach((x) => {
    if (x.record?.status === 'skipped' && x.record.skip_reason) skipReasons[x.record.skip_reason] = (skipReasons[x.record.skip_reason] || 0) + 1;
  });

  return {
    from, to, days, blocks, plannedItems, doneItems,
    rate: plannedItems ? doneItems / plannedItems : null,
    plannedMin: blocks.reduce((a, x) => a + plannedMinutes(x), 0),
    actualMin: blocks.reduce((a, x) => a + actualMinutes(x), 0),
    recordedBlocks: blocks.filter((x) => x.record).length,
    skipped: blocks.filter((x) => x.record?.status === 'skipped').length,
    unfinished: blocks.filter((x) => x.record && x.record.status !== 'done'),
    unrecorded: blocks.filter((x) => !x.record),
    tasksDone: completedTasks,
    tasksOpenDue: dueTasks.filter((t: any) => t.status !== 'done'),
    habitStats, habitRate: habitDue ? habitDone / habitDue : null,
    areaStats, postponed, msDone, goalsDone, goalsOpenPastDeadline,
    skipReasons: Object.entries(skipReasons).sort((a, z) => z[1] - a[1]),
    journalDays: new Set((journal || []).map((j: any) => j.date)).size,
    hasData: blocks.length + dueTasks.length + completedTasks.length + (logs || []).length > 0,
  };
}

export const pct = (r: number | null) => (r == null ? '—' : Math.round(r * 100) + '%');

/** Start of the week containing `iso`, given the user's first weekday (0 = Sunday). */
export function weekStartOf(iso: string, weekStart: number) {
  const dow = new Date(iso + 'T00:00:00Z').getUTCDay();
  return addDays(iso, -((dow - weekStart + 7) % 7));
}
