'use client';
import { useEffect, useState, type CSSProperties } from 'react';

const TASKS = [
  { id: 't1', title: 'Fajr and morning walk' },
  { id: 't2', title: 'Finish class assignment' },
  { id: 't3', title: 'Call my family' },
];
const HABITS = [
  { id: 'p', title: 'Prayers' },
  { id: 'w', title: 'Water' },
  { id: 'r', title: 'Read 10 pages' },
];
const PAST_WEEK = [62, 78, 55, 84, 71, 46];
const LABELS = [
  { text: '12 AM', style: { top: '1%', left: '50%', transform: 'translateX(-50%)' } },
  { text: '6 AM', style: { right: '-2%', top: '50%', transform: 'translateY(-50%)' } },
  { text: '12 PM', style: { bottom: '1%', left: '50%', transform: 'translateX(-50%)' } },
  { text: '6 PM', style: { left: '-2%', top: '50%', transform: 'translateY(-50%)' } },
];

/** Animated hero: a real 24-hour clock of today, plus a small sample "today" you can tick. */
export default function LifeCore() {
  const [tasks, setTasks] = useState<Record<string, boolean>>({ t1: true, t2: false, t3: false });
  const [habits, setHabits] = useState<Record<string, boolean>>({ p: true, w: false, r: false });
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);

  const tDone = Object.values(tasks).filter(Boolean).length;
  const hDone = Object.values(habits).filter(Boolean).length;
  const done = tDone + hDone;
  const total = TASKS.length + HABITS.length;
  const pct = Math.round((done / total) * 100);

  const minutes = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const deg = (minutes / 1440) * 360;
  const left = 1440 - minutes;
  const timeText = now ? now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '--:--';
  const leftText = now ? `${Math.floor(left / 60)}h ${left % 60}m left today` : 'Your day';
  const week = PAST_WEEK.concat(pct);

  return (
    <div className="core-stage rise2">
      <svg aria-hidden="true" className="links" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="50" y1="50" x2="18" y2="14" className="flow" />
        <line x1="50" y1="50" x2="88" y2="54" className="flow" style={{ animationDelay: '-1.2s' }} />
        <line x1="50" y1="50" x2="24" y2="88" className="flow" style={{ animationDelay: '-2.1s' }} />
      </svg>

      <div className="orbit" role="img" aria-label={now ? `A 24-hour clock. It is ${timeText}, with ${leftText}.` : 'A 24-hour clock of your day'}>
        <div className="ring r1" />
        <div className="ring arc" />
        <div className="ring daydone" style={{ background: `conic-gradient(from 0deg, rgba(255,201,60,.9) 0deg, rgba(255,79,139,.9) ${deg}deg, transparent ${deg}deg)` }} />
        <div className="ring r2" />
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="htick" style={{ transform: `rotate(${i * 15}deg)` }}>
            <span className={i % 6 === 0 ? 'major' : ''} />
          </div>
        ))}
        {LABELS.map((l) => (
          <span key={l.text} className="hlabel" style={l.style as CSSProperties}>{l.text}</span>
        ))}
        <div className="orb" style={{ animationDuration: '14s' }}>
          <span style={{ background: '#FFC93C', boxShadow: '0 0 14px #FFC93C' }} />
        </div>
        <div className="orb" style={{ inset: '20%', animationDuration: '9s', animationDirection: 'reverse' }}>
          <span style={{ background: '#FF4F8B', boxShadow: '0 0 14px #FF4F8B' }} />
        </div>
        {now && (
          <div className="hand" style={{ transform: `rotate(${deg}deg)` }}>
            <span className="hand-line" />
            <span className="hand-dot" />
          </div>
        )}
        <div className="ripple" />
        <div className="ripple" style={{ animationDelay: '1.5s' }} />
        <div className="core">
          <div className="core-in">
            <span className="core-label">YOUR 24 HOURS</span>
            <span className="core-num">{timeText}</span>
            <span className="core-sub">{leftText}</span>
          </div>
        </div>
      </div>

      <div className="fcard" style={{ left: 0, top: 0, width: 240, animationDuration: '7s' }}>
        <div className="fhead">
          <span>Today's plan</span>
          <span className="live" aria-hidden="true" style={{ marginLeft: 'auto' }} />
          <span style={{ fontSize: 13, color: '#FFC93C' }}>{tDone} of {TASKS.length} done</span>
        </div>
        <div className="mini-bar" aria-hidden="true"><span style={{ width: Math.round((tDone / TASKS.length) * 100) + '%' }} /></div>
        {TASKS.map((t) => (
          <button key={t.id} type="button" className="frow" aria-pressed={!!tasks[t.id]} onClick={() => setTasks({ ...tasks, [t.id]: !tasks[t.id] })}>
            <span className="fmark" style={{ background: tasks[t.id] ? '#FFC93C' : 'transparent' }}>{tasks[t.id] ? '✓' : ''}</span>
            <span style={{ flex: 1, opacity: tasks[t.id] ? 0.7 : 1 }}>{t.title}</span>
          </button>
        ))}
        <span className="fhint">Try it: tap a task</span>
      </div>

      <div className="fcard" style={{ right: 0, top: '42%', width: 200, animationDuration: '8.5s', animationDelay: '-2s' }}>
        <div className="fhead"><span>This week</span></div>
        <div role="img" aria-label={`How much of the plan was done each day this week. Today: ${pct}%`} className="wbars">
          {week.map((v, i) => (
            <span key={i} className="wbar" style={{ height: Math.max(6, v) + '%', background: i === 6 ? 'linear-gradient(180deg,#FF4F8B,#FF7A2F)' : 'linear-gradient(180deg,#FFC93C,#FF9A4D)', animationDelay: 0.4 + i * 0.08 + 's' }} />
          ))}
        </div>
        <div className="mono-row"><span>MON</span><span>TODAY {pct}% DONE</span></div>
      </div>

      <div className="fcard" style={{ left: '4%', bottom: 0, width: 256, animationDuration: '9s', animationDelay: '-4s' }}>
        <div className="fhead"><span>Daily habits</span><span style={{ marginLeft: 'auto', fontSize: 13, color: '#FFC93C' }}>{hDone} of {HABITS.length}</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {HABITS.map((h) => (
            <button key={h.id} type="button" className={'hchip' + (habits[h.id] ? ' on' : '')} aria-pressed={!!habits[h.id]} onClick={() => setHabits({ ...habits, [h.id]: !habits[h.id] })}>
              {habits[h.id] ? '✓ ' : ''}{h.title}
            </button>
          ))}
        </div>
      </div>

      <span className="mono stage-note" aria-hidden="true">EXAMPLE DAY · YOUR OWN DATA STAYS PRIVATE</span>
    </div>
  );
}
