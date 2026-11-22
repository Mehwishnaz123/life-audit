import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TABLES = ['profiles', 'life_areas', 'goals', 'milestones', 'tasks', 'schedule_blocks', 'block_records', 'habits', 'habit_logs', 'journal_entries', 'gratitude_entries', 'reflections', 'events'];

// Sends the signed-in user a JSON file of their own records. Security rules return only their rows.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const out: Record<string, unknown> = { exported_at: new Date().toISOString(), email: user.email };
  for (const t of TABLES) {
    const { data } = await supabase.from(t).select('*');
    out[t] = data || [];
  }
  return new NextResponse(JSON.stringify(out, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      'X-Robots-Tag': 'noindex',
    },
  });
}
