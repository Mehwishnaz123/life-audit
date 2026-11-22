
/**
 * Google Gemini connection. The key lives only on the server (GEMINI_API_KEY),
 * so it is never sent to the browser.
 */
const KEY = () => (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '').trim();
const MODELS = () => [process.env.GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest'].filter(Boolean) as string[];
/* On Netlify, the AI Gateway may provide GOOGLE_GEMINI_BASE_URL. Your own GEMINI_API_KEY in Netlify always takes priority. */
const BASE = () => (process.env.GOOGLE_GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');

export function isAiConnected() {
  return Boolean(KEY());
}

/* Simple per-user daily limit so the free Gemini quota is shared fairly. */
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 30);
const usage = new Map<string, { day: string; n: number }>();
export function takeAiCredit(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  const u = usage.get(userId);
  const n = u && u.day === day ? u.n : 0;
  if (n >= DAILY_LIMIT) return false;
  usage.set(userId, { day, n: n + 1 });
  return true;
}

type Turn = { role: 'user' | 'model'; text: string };

export async function askGemini(opts: { system: string; turns: Turn[]; json?: boolean }): Promise<string> {
  const key = KEY();
  if (!key) throw new Error('AI is not connected yet.');
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: opts.turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    generationConfig: { temperature: 0.5, maxOutputTokens: 2048, ...(opts.json ? { responseMimeType: 'application/json' } : {}) },
  });
  let last = '';
  for (const model of MODELS()) {
    const res = await fetch(`${BASE()}/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body,
      cache: 'no-store',
    });
    if (res.status === 404) { last = `model ${model} not found`; continue; }
    if (res.status === 429) throw new Error('The AI is busy right now. Please try again in a minute.');
    if (!res.ok) {
      let reason = '';
      try { reason = String((await res.json())?.error?.message || ''); } catch {}
      console.error('Gemini error', res.status, model, reason);
      if (/api key/i.test(reason)) throw new Error('The AI key is not valid. The owner needs to check the GEMINI_API_KEY setting in Netlify.');
      if (res.status === 400 && /model|not supported|not found/i.test(reason)) { last = reason; continue; }
      throw new Error('The AI could not answer right now (' + res.status + (reason ? ': ' + reason.slice(0, 140) : '') + ').');
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    if (!text) throw new Error('The AI returned an empty answer. Please try again.');
    return text.trim();
  }
  throw new Error('No AI model available (' + last + ').');
}
