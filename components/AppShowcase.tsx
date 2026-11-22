'use client';
import { useEffect, useState } from 'react';

const TABS = [
  { id: 'today', label: 'Today', title: 'Plan every hour', text: 'Put your day into time blocks. At night, mark each one done, half done or skipped.' },
  { id: 'week', label: 'Week', title: 'See your whole week', text: 'Seven days side by side, with every plan and deadline in its place.' },
  { id: 'habits', label: 'Habits', title: 'Build habits that stick', text: 'One tap a day. Streaks and a 28-day grid show your progress.' },
  { id: 'reports', label: 'Reports', title: 'Know where time really went', text: 'Planned time vs real time for every part of your life. No guessing.' },
];

const BLOCKS = [
  ['5:00 AM', 'Fajr and Quran', '#7B4BC9', 'Done'],
  ['7:00 AM', 'Study: Python', '#2F6FDE', 'Done'],
  ['9:00 AM', 'University', '#2F6FDE', 'Half done'],
  ['3:00 PM', 'Freelance work', '#E8590C', 'Skipped'],
  ['8:00 PM', 'Family time', '#D6336C', 'Not yet'],
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HABITS = [
  ['Five prayers', '#7B4BC9', 26],
  ['Read 10 pages', '#B8860B', 19],
  ['Drink water', '#0B8F7F', 22],
];
const REPORT = [
  ['Faith', 6, 6, '#7B4BC9'],
  ['Education', 14, 11, '#2F6FDE'],
  ['Career', 10, 6, '#E8590C'],
  ['Health', 5, 4, '#0B8F7F'],
  ['Family', 7, 8, '#D6336C'],
];
const tone: Record<string, string> = { Done: 'tone-done', 'Half done': 'tone-week', Skipped: 'tone-today', 'Not yet': 'tone-none' };

/** Interactive preview of the app with example data (clearly labelled). */
export default function AppShowcase() {
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setTab((t) => (t + 1) % TABS.length), 5000);
    return () => clearInterval(id);
  }, [auto]);
  const t = TABS[tab];

  return (
    <div className="showcase">
      <div className="showcase-copy">
        <div role="tablist" aria-label="App screens" className="showcase-tabs">
          {TABS.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              type="button"
              aria-selected={i === tab}
              className={'stab' + (i === tab ? ' on' : '')}
              onClick={() => {
                setTab(i);
                setAuto(false);
              }}
            >
              {x.label}
              {i === tab && auto && <span className="stab-timer" />}
            </button>
          ))}
        </div>
        <h3 key={t.id + 'h'} className="h2 swap" style={{ fontSize: 'clamp(28px,3.4vw,40px)' }}>{t.title}</h3>
        <p key={t.id + 'p'} className="lead swap">{t.text}</p>
      </div>

      <div className="device" role="tabpanel" aria-label={t.label + ' screen preview with example data'}>
        <div className="device-bar"><i /><i /><i /><span>{t.label} · example</span></div>
        <div key={t.id} className="device-screen swap">
          {t.id === 'today' &&
            BLOCKS.map(([time, title, c, st], i) => (
              <div key={title} className="mock-row" style={{ animationDelay: i * 0.08 + 's' }}>
                <span className="mock-time">{time}</span>
                <span className="mock-dot" style={{ background: c }} />
                <span className="mock-title">{title}</span>
                <span className={'chip ' + tone[st]}>{st}</span>
              </div>
            ))}
          {t.id === 'week' && (
            <div className="mock-week">
              {DAYS.map((d, i) => (
                <div key={d} className="mock-day" style={{ animationDelay: i * 0.06 + 's' }}>
                  <strong>{d}</strong>
                  {Array.from({ length: (i % 3) + 2 }, (_, k) => (
                    <span key={k} style={{ background: ['#FFE1EA', '#FFF1C2', '#FFE9D6', '#E7F0FF'][(i + k) % 4] }} />
                  ))}
                </div>
              ))}
            </div>
          )}
          {t.id === 'habits' &&
            HABITS.map(([name, c, n], hi) => (
              <div key={name as string} className="mock-habit">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{name}</strong>
                  <span className="muted">{n} of 28 days</span>
                </div>
                <div className="mock-grid">
                  {Array.from({ length: 28 }, (_, i) => (
                    <span key={i} style={{ background: (i * 7 + hi * 3) % 28 < (n as number) ? (c as string) : 'var(--track)', animationDelay: i * 0.02 + 's' }} />
                  ))}
                </div>
              </div>
            ))}
          {t.id === 'reports' &&
            REPORT.map(([name, p, a, c], i) => (
              <div key={name as string} className="mock-report">
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{name}</span>
                  <span className="muted">{a}h of {p}h</span>
                </div>
                <div className="bar" style={{ background: 'var(--track)' }}>
                  <span className="grow-x" style={{ width: ((a as number) / 14) * 100 + '%', background: c as string, animationDelay: i * 0.1 + 's' }} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
