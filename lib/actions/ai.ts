'use server';
import { revalidatePath } from 'next/cache';
import { getAppContext } from '@/lib/app-data';
import { addDays } from '@/lib/dates';
import { askGemini, isAiConnected, takeAiCredit } from '@/lib/gemini';
import { buildFacts, FACT_RULES } from '@/lib/ai-facts';

type Result<T> = { ok: boolean; data?: T; error?: string };
const NOT_CONNECTED = 'The AI is not connected yet. The owner needs to add a Gemini key (see README).';
const LIMIT = 'You have used today\'s AI messages. They refresh tomorrow.';

/* ---------------- AI Coach: chat about your own records ---------------- */
export type ChatTurn = { role: 'user' | 'model'; text: string };

export async function askCoach(history: ChatTurn[], question: string): Promise<Result<string>> {
  const q = String(question || '').trim().slice(0, 1500);
  if (!q) return { ok: false, error: 'Please type a question.' };
  if (!isAiConnected()) return { ok: false, error: NOT_CONNECTED };
  const { supabase, user, areas, today, name } = await getAppContext();
  if (!takeAiCredit(user.id)) return { ok: false, error: LIMIT };
  try {
    const facts = await buildFacts(supabase, areas, today, name);
    const system = `You are "Life Coach", the friendly AI coach inside the Life Audit app.
You help ${name} understand their own week, spot patterns (what they skip, postpone or do well), and decide what to do next.
${FACT_RULES}
- Keep answers under 150 words unless asked for more. Use short bullet points when listing.
- When it helps, end with one small, concrete next step they can do in the app today.

FACTS (JSON, from the user's own records):
${JSON.stringify(facts)}`;
    const turns: ChatTurn[] = [...(history || []).slice(-10).map((t) => ({ role: t.role, text: String(t.text).slice(0, 2000) })), { role: 'user', text: q }];
    return { ok: true, data: await askGemini({ system, turns }) };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Something went wrong.' };
  }
}

/* ---------------- AI Planner: turn a goal into milestones + a plan ---------------- */
export type PlanBlock = { date: string; start: string; end: string; title: string };
export type Plan = {
  goal_title: string;
  summary: string;
  horizon: 'yearly' | 'half_year' | 'quarterly' | 'monthly' | 'weekly';
  deadline: string | null;
  area: string | null;
  milestones: { title: string; due_date: string | null }[];
  blocks: PlanBlock[];
};

export async function makePlan(input: { goal: string; deadline?: string; hours?: string; times?: string }): Promise<Result<Plan>> {
  const goal = String(input.goal || '').trim().slice(0, 500);
  if (!goal) return { ok: false, error: 'Please describe your goal.' };
  if (!isAiConnected()) return { ok: false, error: NOT_CONNECTED };
  const { supabase, user, areas, today, name } = await getAppContext();
  if (!takeAiCredit(user.id)) return { ok: false, error: LIMIT };
  try {
    const facts = await buildFacts(supabase, areas, today, name);
    const system = `You are "Life Planner", the AI planner inside the Life Audit app. You turn one goal into a realistic plan.
${FACT_RULES}
- Respect the user's existing schedule in the facts: new time blocks must NOT overlap blocks already planned on the same date.
- Be realistic: do not plan more than the hours per day the user can give. Leave room for rest.
- Dates are YYYY-MM-DD, times are 24-hour HH:MM. Today is ${today}. Only plan blocks between ${today} and ${addDays(today, 6)}.
- "area" must be one of these names or null: ${JSON.stringify(areas.map((a) => a.name))}.
Reply with ONLY JSON in exactly this shape:
{"goal_title": string, "summary": string (2 short sentences, friendly), "horizon": "yearly"|"half_year"|"quarterly"|"monthly"|"weekly", "deadline": "YYYY-MM-DD"|null, "area": string|null,
 "milestones": [{"title": string, "due_date": "YYYY-MM-DD"|null}] (3 to 6, in order),
 "blocks": [{"date": "YYYY-MM-DD", "start": "HH:MM", "end": "HH:MM", "title": string}] (the first week's time blocks, 3 to 10)}

FACTS (JSON, from the user's own records):
${JSON.stringify(facts)}`;
    const ask = `Goal: ${goal}
Deadline: ${input.deadline || 'not given, choose a sensible one'}
Hours I can give per day: ${input.hours || 'about 1'}
Best time of day for me: ${input.times || 'any free time'}`;
    const raw = await askGemini({ system, turns: [{ role: 'user', text: ask }], json: true });
    const plan = clean(JSON.parse(raw.replace(/^```json\s*|```$/g, '')), today);
    if (!plan.milestones.length) return { ok: false, error: 'The AI could not make a plan from that. Try describing the goal in a bit more detail.' };
    return { ok: true, data: plan };
  } catch (e: any) {
    return { ok: false, error: e instanceof SyntaxError ? 'The AI answer was not readable. Please try again.' : e?.message || 'Something went wrong.' };
  }
}

const isDate = (v: any) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isTime = (v: any) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
function clean(p: any, today: string): Plan {
  const horizons = ['yearly', 'half_year', 'quarterly', 'monthly', 'weekly'];
  const last = addDays(today, 6);
  return {
    goal_title: String(p?.goal_title || 'My goal').slice(0, 200),
    summary: String(p?.summary || '').slice(0, 600),
    horizon: horizons.includes(p?.horizon) ? p.horizon : 'monthly',
    deadline: isDate(p?.deadline) ? p.deadline : null,
    area: typeof p?.area === 'string' ? p.area : null,
    milestones: (Array.isArray(p?.milestones) ? p.milestones : []).slice(0, 8).map((m: any) => ({ title: String(m?.title || '').slice(0, 200), due_date: isDate(m?.due_date) ? m.due_date : null })).filter((m: any) => m.title),
    blocks: (Array.isArray(p?.blocks) ? p.blocks : []).slice(0, 14)
      .filter((b: any) => isDate(b?.date) && b.date >= today && b.date <= last && isTime(b?.start) && isTime(b?.end) && b.end > b.start && b?.title)
      .map((b: any) => ({ date: b.date, start: b.start, end: b.end, title: String(b.title).slice(0, 200) })),
  };
}

export async function savePlan(plan: Plan, withBlocks: boolean): Promise<Result<string>> {
  const { supabase, user, areas, today } = await getAppContext();
  const p = clean(plan, today);
  const area_id = areas.find((a) => a.name.toLowerCase() === (p.area || '').toLowerCase())?.id || null;
  const { data: goal, error } = await supabase.from('goals')
    .insert({ user_id: user.id, title: p.goal_title, description: p.summary || null, area_id, horizon: p.horizon, start_date: today, deadline: p.deadline, priority: 'medium' })
    .select('id').single();
  if (error || !goal) return { ok: false, error: 'Could not save the goal. Please try again.' };
  if (p.milestones.length) {
    await supabase.from('milestones').insert(p.milestones.map((m, i) => ({ user_id: user.id, goal_id: goal.id, title: m.title, due_date: m.due_date, sort_order: i })));
  }
  if (withBlocks && p.blocks.length) {
    await supabase.from('schedule_blocks').insert(p.blocks.map((b) => ({ user_id: user.id, date: b.date, start_time: b.start, end_time: b.end, title: b.title, area_id, priority: 'medium' })));
  }
  revalidatePath('/app', 'layout');
  return { ok: true, data: goal.id };
}
