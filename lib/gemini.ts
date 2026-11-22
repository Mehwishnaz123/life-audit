
/**
 * Google Gemini connection. The key lives only on the server (GEMINI_API_KEY),
 * so it is never sent to the browser.
 */
const KEY = () => process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';
const MODELS = () => [process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.5-flash'].filter(Boolean) as string[];

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
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body,
      cache: 'no-store',
    });
    if (res.status === 404) { last = `model ${model} not found`; continue; }
    if (res.status === 429) throw new Error('The AI is busy right now. Please try again in a minute.');
    if (!res.ok) throw new Error('The AI could not answer right now (' + res.status + ').');
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    if (!text) throw new Error('The AI returned an empty answer. Please try again.');
    return text.trim();
  }
  throw new Error('No AI model available (' + last + ').');
}
