import type { Metadata } from 'next';
import { getAppContext } from '@/lib/app-data';
import { isAiConnected } from '@/lib/gemini';
import PlannerForm from '@/components/PlannerForm';

export const metadata: Metadata = { title: 'AI Planner' };

export default async function PlannerPage() {
  const { today } = await getAppContext();
  const connected = isAiConnected();
  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>AI Planner</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Type a big goal. The AI breaks it into steps and fits this week's time blocks around your existing plan.</p>
      </header>
      {!connected && <p className="notice">The AI Planner is almost ready. It switches on as soon as the Gemini key is added.</p>}
      <PlannerForm connected={connected} today={today} />
    </div>
  );
}
