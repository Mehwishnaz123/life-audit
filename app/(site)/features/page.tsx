import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Features',
  description: `How ${SITE_NAME} works: a year-to-hour planner, goals with milestones, one deadline list, habits, a private journal and a Life Audit of planned vs actual time.`,
  alternates: { canonical: '/features' },
};

const SECTIONS = [
  {
    id: 'planner',
    q: 'How does the planner connect the year to the hour?',
    a: 'You plan at five levels: year, month, week, day and hour. A yearly goal becomes monthly targets, weekly focus and hour-by-hour blocks on a given day, and you can move between the levels at any time.',
    points: ['Start and end time, life area and priority for every block', 'Recurring blocks and reminders', 'Move or reschedule a block without losing its history'],
  },
  {
    id: 'audit',
    q: 'What is planned vs actual, and what does the Life Audit show?',
    a: 'For every scheduled block you record what really happened: done, partly done or skipped, the actual time spent and, if skipped, why. Nothing is ever marked complete for you. The Life Audit then compares planned time with actual time across your life areas.',
    points: ['Daily audit: planned, completed, missed and time spent', 'Weekly audit: completion rate, strongest and weakest days, repeatedly postponed tasks', 'Monthly and yearly reviews built only from what you recorded'],
  },
  {
    id: 'goals',
    q: 'How are goals and progress tracked?',
    a: 'Goals can be yearly, six-month, quarterly, monthly or weekly. Each goal is broken into milestones and daily actions, and its progress percentage is calculated from the milestones and tasks you actually finish. You never type a percentage yourself.',
    points: ['Example: Learn Machine Learning → Python revision → NumPy and Pandas → supervised learning → three projects → portfolio', 'Linked tasks show which daily work serves which goal'],
  },
  {
    id: 'tasks',
    q: 'Can I see all my deadlines in one place?',
    a: 'Yes. Every task from every life area appears in one list with smart views: overdue, due today, due tomorrow, this week, this month, upcoming and completed. Each one carries a clear urgency label.',
    points: ['Priority, estimated and actual duration, notes and subtasks', 'An assignment can be split into smaller tasks with their own dates'],
  },
  {
    id: 'habits',
    q: 'How does the habit tracker handle missed days?',
    a: 'Habits can be daily, weekly, monthly or on a custom schedule. You see streaks, a completion heatmap and a consistency percentage. A missed day is shown as a pattern to understand, never as a failure, with an easy way to restart.',
    points: ['Prayers, Quran reading, water, study, reading, sleep or any habit you define'],
  },
  {
    id: 'journal',
    q: 'Is there a private journal and gratitude log?',
    a: 'Yes. The daily journal offers free writing and guided prompts (what went well, what could be better, what I learned, how I feel). The gratitude log asks for three or more things each day. Weekly and monthly reflections build on both. Entries are private to your account.',
    points: [],
  },
  {
    id: 'life-areas',
    q: 'Can I organise my life my own way?',
    a: 'Yes. You start with faith, career, education, health, family, growth and finance, then rename, archive or add your own areas, each with its own colour, goals, tasks, habits and notes. You also decide how much each area matters to you.',
    points: [],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="section">
        <div className="wrap narrow stack">
          <span className="eyebrow">Features</span>
          <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,62px)' }}>Everything your life needs, connected.</h1>
          <p className="lead">{SITE_NAME} combines a planner, goals, tasks, habits, a journal and a Life Audit. Because they share one memory, each tool knows what the others recorded.</p>
        </div>
      </section>
      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className={'section' + (i % 2 === 0 ? ' white' : '')} style={{ padding: '64px 0' }}>
          <div className="wrap narrow stack reveal">
            <h2 className="h2" style={{ fontSize: 'clamp(26px,3.4vw,38px)' }}>{s.q}</h2>
            <p className="lead">{s.a}</p>
            {s.points.length > 0 && (
              <ul className="prose" style={{ margin: 0, paddingLeft: 22 }}>
                {s.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
      <section className="section">
        <div className="wrap narrow stack" style={{ alignItems: 'flex-start' }}>
          <h2 className="h2">Ready to see your life in one place?</h2>
          <div className="row">
            <Link href="/signup" className="btn">Sign up free</Link>
            <Link href="/pricing" className="btn ghost">Compare plans</Link>
          </div>
        </div>
      </section>
    </>
  );
}
