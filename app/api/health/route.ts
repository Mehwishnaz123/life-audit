import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/server';
import { askGemini, isAiConnected } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

/* The AI test is cached for an hour so this page can never run up AI costs. */
let aiCache: { at: number; ok: boolean; note: string } | null = null;

export async function GET(req: Request) {
  let database = 'ok';
  try {
    const { error } = await createPublicClient().from('site_plans').select('id').limit(1);
    if (error) database = 'error: ' + error.message;
  } catch (e: any) {
    database = 'error: ' + (e?.message || 'unreachable');
  }

  const ai: Record<string, unknown> = { connected: isAiConnected(), viaNetlifyGateway: Boolean(process.env.GOOGLE_GEMINI_BASE_URL) };
  if (new URL(req.url).searchParams.get('ai') === '1' && isAiConnected()) {
    if (!aiCache || Date.now() - aiCache.at > 60 * 60 * 1000) {
      try {
        const reply = await askGemini({ system: 'Reply with the single word OK.', turns: [{ role: 'user', text: 'Ping' }] });
        aiCache = { at: Date.now(), ok: true, note: reply.slice(0, 20) };
      } catch (e: any) {
        aiCache = { at: Date.now(), ok: false, note: String(e?.message || 'failed').slice(0, 200) };
      }
    }
    ai.test = aiCache;
  }

  return NextResponse.json({ status: database === 'ok' ? 'ok' : 'degraded', database, ai, time: new Date().toISOString() }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}
