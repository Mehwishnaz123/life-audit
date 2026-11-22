import type { Metadata } from 'next';
import { getAppContext } from '@/lib/app-data';
import { isAiConnected } from '@/lib/gemini';
import CoachChat from '@/components/CoachChat';

export const metadata: Metadata = { title: 'AI Coach · Life Audit' };

export default async function CoachPage() {
  const { name } = await getAppContext();
  const connected = isAiConnected();
  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>AI Coach</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Ask about your week, your habits or what to do next. It only uses what you recorded.</p>
      </header>
      {!connected && <p className="notice">The AI Coach is almost ready. It switches on as soon as the Gemini key is added.</p>}
      <CoachChat name={name} connected={connected} />
    </div>
  );
}
