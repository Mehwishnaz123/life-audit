'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import { askCoach, type ChatTurn } from '@/lib/actions/ai';

const STARTERS = [
  'How did my last 7 days go?',
  'What do I keep postponing, and why?',
  'What should I focus on tomorrow?',
  'Which life area am I neglecting?',
];

export default function CoachChat({ name, connected }: { name: string; connected: boolean }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [turns, pending]);

  function send(q: string) {
    const question = q.trim();
    if (!question || pending) return;
    setError('');
    const history = turns;
    setTurns([...history, { role: 'user', text: question }]);
    setText('');
    start(async () => {
      const r = await askCoach(history, question);
      if (r.ok) setTurns((t) => [...t, { role: 'model', text: r.data }]);
      else { setError(r.error); setTurns(history); setText(question); }
    });
  }

  return (
    <div className="chat card">
      <div className="chat-log" aria-live="polite">
        {turns.length === 0 && (
          <div className="chat-hello">
            <div className="chat-orb" aria-hidden="true" />
            <p style={{ margin: 0, fontSize: 18 }}>Hi {name}! I'm your <b>AI Coach</b>. I can only see what you've recorded in Life Audit, so I'll never make things up.</p>
            <div className="chat-starters">
              {STARTERS.map((s) => <button key={s} type="button" className="chip-btn" onClick={() => send(s)} disabled={!connected || pending}>{s}</button>)}
            </div>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={'bubble ' + (t.role === 'user' ? 'me' : 'ai')}>{t.text}</div>
        ))}
        {pending && <div className="bubble ai typing"><span /><span /><span /></div>}
        <div ref={end} />
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(text); }}>
        <label htmlFor="coach-q" className="sr-only">Ask your coach</label>
        <input id="coach-q" className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={connected ? 'Ask anything about your week…' : 'AI not connected yet'} disabled={!connected} maxLength={1500} autoComplete="off" />
        <button className="btn" disabled={!connected || pending || !text.trim()}>{pending ? 'Thinking…' : 'Send'}</button>
      </form>
    </div>
  );
}
