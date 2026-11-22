'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addDays } from '@/lib/dates';

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}
const s = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const refresh = () => revalidatePath('/app', 'layout');
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/* ---------- My Day: schedule blocks and planned vs actual ---------- */
export async function addBlock(f: FormData) {
  const { supabase, user } = await userClient();
  const date = s(f, 'date');
  const start = s(f, 'start_time');
  const end = s(f, 'end_time');
  const title = s(f, 'title');
  if (!title || !isDate(date) || !start || !end || minutes(end) <= minutes(start)) {
    redirect(`/app/day?date=${date}&error=` + encodeURIComponent('Please give the block a title and an end time after its start time.'));
  }
  await supabase.from('schedule_blocks').insert({
    user_id: user.id,
    date,
    start_time: start,
    end_time: end,
    title: title.slice(0, 200),
    area_id: s(f, 'area_id') || null,
    priority: s(f, 'priority') || 'medium',
    notes: s(f, 'notes') || null,
  });
  refresh();
}

export async function recordBlock(f: FormData) {
  const { supabase, user } = await userClient();
  const blockId = s(f, 'block_id');
  const status = s(f, 'status');
  if (!['done', 'partial', 'skipped'].includes(status)) return;
  const actual = s(f, 'actual_minutes');
  const next = s(f, 'next_action');
  await supabase.from('block_records').upsert(
    {
      user_id: user.id,
      block_id: blockId,
      status,
      actual_minutes: status === 'skipped' ? 0 : actual ? Math.max(0, parseInt(actual, 10) || 0) : null,
      actual_note: s(f, 'actual_note') || null,
      skip_reason: status === 'skipped' ? s(f, 'skip_reason') || null : null,
      next_action: status === 'done' ? null : next || null,
    },
    { onConflict: 'block_id' },
  );
  // Carry forward / reschedule: copy the block to the next day (never marked done).
  if (status !== 'done' && (next === 'carry_forward' || next === 'reschedule')) {
    const { data: b } = await supabase.from('schedule_blocks').select('*').eq('id', blockId).eq('user_id', user.id).maybeSingle();
    if (b) {
      const to = next === 'reschedule' && isDate(s(f, 'rescheduled_to')) ? s(f, 'rescheduled_to') : addDays(b.date, 1);
      await supabase.from('schedule_blocks').insert({
        user_id: user.id, date: to, start_time: b.start_time, end_time: b.end_time, title: b.title, area_id: b.area_id, priority: b.priority, notes: b.notes,
      });
      await supabase.from('block_records').update({ rescheduled_to: to }).eq('block_id', blockId);
    }
  }
  refresh();
}

export async function clearRecord(f: FormData) {
  const { supabase, user } = await userClient();
  await supabase.from('block_records').delete().eq('block_id', s(f, 'block_id')).eq('user_id', user.id);
  refresh();
}

export async function deleteBlock(f: FormData) {
  const { supabase, user } = await userClient();
  await supabase.from('schedule_blocks').delete().eq('id', s(f, 'block_id')).eq('user_id', user.id);
  refresh();
}

/* ---------- Goals and milestones ---------- */
export async function addGoal(f: FormData) {
  const { supabase, user } = await userClient();
  const title = s(f, 'title');
  if (!title) return;
  await supabase.from('goals').insert({
    user_id: user.id,
    title: title.slice(0, 200),
    description: s(f, 'description') || null,
    area_id: s(f, 'area_id') || null,
    horizon: s(f, 'horizon') || 'yearly',
    start_date: s(f, 'start_date') || null,
    deadline: s(f, 'deadline') || null,
    priority: s(f, 'priority') || 'medium',
  });
  refresh();
}

export async function addMilestone(f: FormData) {
  const { supabase, user } = await userClient();
  const title = s(f, 'title');
  if (!title) return;
  await supabase.from('milestones').insert({
    user_id: user.id, goal_id: s(f, 'goal_id'), title: title.slice(0, 200), due_date: s(f, 'due_date') || null, sort_order: parseInt(s(f, 'sort_order'), 10) || 0,
  });
  refresh();
}

export async function toggleMilestone(f: FormData) {
  const { supabase, user } = await userClient();
  const done = s(f, 'done') === '1';
  await supabase.from('milestones').update({ completed_at: done ? null : new Date().toISOString() }).eq('id', s(f, 'id')).eq('user_id', user.id);
  refresh();
}

export async function setGoalStatus(f: FormData) {
  const { supabase, user } = await userClient();
  const status = s(f, 'status');
  if (!['active', 'paused', 'completed', 'dropped'].includes(status)) return;
  await supabase
    .from('goals')
    .update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null })
    .eq('id', s(f, 'id'))
    .eq('user_id', user.id);
  refresh();
}

export async function deleteGoal(f: FormData) {
  const { supabase, user } = await userClient();
  await supabase.from('goals').delete().eq('id', s(f, 'id')).eq('user_id', user.id);
  refresh();
}

/* ---------- Habits ---------- */
export async function addHabit(f: FormData) {
  const { supabase, user } = await userClient();
  const title = s(f, 'title');
  if (!title) return;
  await supabase.from('habits').insert({
    user_id: user.id, title: title.slice(0, 200), area_id: s(f, 'area_id') || null, frequency: s(f, 'frequency') || 'daily',
  });
  refresh();
}

export async function toggleHabit(f: FormData) {
  const { supabase, user } = await userClient();
  const habitId = s(f, 'habit_id');
  const date = s(f, 'date');
  if (!isDate(date)) return;
  if (s(f, 'done') === '1') {
    await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', date).eq('user_id', user.id);
  } else {
    await supabase.from('habit_logs').upsert({ user_id: user.id, habit_id: habitId, date, done: true }, { onConflict: 'habit_id,date' });
  }
  refresh();
}

export async function archiveHabit(f: FormData) {
  const { supabase, user } = await userClient();
  await supabase.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', s(f, 'id')).eq('user_id', user.id);
  refresh();
}

/* ---------- Journal and gratitude ---------- */
export async function saveJournal(f: FormData) {
  const { supabase, user } = await userClient();
  const date = s(f, 'date');
  if (!isDate(date)) return;
  const row = {
    user_id: user.id, date,
    went_well: s(f, 'went_well') || null, could_be_better: s(f, 'could_be_better') || null, learned: s(f, 'learned') || null,
    feeling: s(f, 'feeling') || null, highlights: s(f, 'highlights') || null, body: s(f, 'body') || null,
  };
  const id = s(f, 'id');
  if (id) await supabase.from('journal_entries').update(row).eq('id', id).eq('user_id', user.id);
  else await supabase.from('journal_entries').insert(row);
  refresh();
  redirect(`/app/journal?date=${date}&saved=1`);
}

export async function addGratitude(f: FormData) {
  const { supabase, user } = await userClient();
  const date = s(f, 'date');
  if (!isDate(date)) return;
  const items = ['g1', 'g2', 'g3', 'text'].map((k) => s(f, k)).filter(Boolean);
  if (items.length) await supabase.from('gratitude_entries').insert(items.map((text, i) => ({ user_id: user.id, date, text: text.slice(0, 500), sort_order: i })));
  refresh();
}

export async function deleteGratitude(f: FormData) {
  const { supabase, user } = await userClient();
  await supabase.from('gratitude_entries').delete().eq('id', s(f, 'id')).eq('user_id', user.id);
  refresh();
}

/* ---------- Life areas ---------- */
export async function addArea(f: FormData) {
  const { supabase, user } = await userClient();
  const name = s(f, 'name');
  if (!name) return;
  await supabase.from('life_areas').insert({
    user_id: user.id, name: name.slice(0, 60), color: s(f, 'color') || '#C2255C', description: s(f, 'description') || null, sort_order: 100,
  });
  refresh();
}

export async function updateArea(f: FormData) {
  const { supabase, user } = await userClient();
  const name = s(f, 'name');
  if (!name) return;
  await supabase
    .from('life_areas')
    .update({
      name: name.slice(0, 60),
      color: s(f, 'color') || '#C2255C',
      weight: Math.min(5, Math.max(1, parseInt(s(f, 'weight'), 10) || 3)),
      success_definition: s(f, 'success_definition') || null,
      show_on_dashboard: f.get('show_on_dashboard') === 'on',
    })
    .eq('id', s(f, 'id'))
    .eq('user_id', user.id);
  refresh();
}

export async function archiveArea(f: FormData) {
  const { supabase, user } = await userClient();
  const restore = s(f, 'restore') === '1';
  await supabase.from('life_areas').update({ archived_at: restore ? null : new Date().toISOString() }).eq('id', s(f, 'id')).eq('user_id', user.id);
  refresh();
}

/* ---------- Settings ---------- */
export async function saveProfile(f: FormData) {
  const { supabase, user } = await userClient();
  const tz = s(f, 'timezone');
  let validTz = 'UTC';
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    validTz = tz;
  } catch {}
  await supabase
    .from('profiles')
    .update({ display_name: s(f, 'display_name').slice(0, 80) || null, timezone: validTz, week_start: parseInt(s(f, 'week_start'), 10) || 0, updated_at: new Date().toISOString() })
    .eq('id', user.id);
  refresh();
  redirect('/app/settings?saved=1');
}

export async function requestDeletion() {
  const { supabase, user } = await userClient();
  await supabase.from('deletion_requests').upsert({ user_id: user.id }, { onConflict: 'user_id' });
  redirect('/app/settings?deletion=1');
}
