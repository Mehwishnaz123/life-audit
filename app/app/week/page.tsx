import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { addDays } from '@/lib/dates';
import { weekStartOf } from '@/lib/audit';
import { normaliseBlocks, plannedMinutes, actualMinutes, fmtMinutes, clock } from '@/lib/records';

export default async function WeekPage({ searchParams }: { searchParams: Promise<{ start?: string }> }) {
  const sp = await searchParams;
  const { supabase, today, profile, areas } = await getAppContext();
  const thisWeek = weekStartOf(today, profile?.week_start ?? 1);
  const start = sp.start && /^\d{4}-\d{2}-\d{2}$/.test(sp.start) ? weekStartOf(sp.start, profile?.week_start ?? 1) : thisWeek;
  const end = addDays(start, 6);
  const [{ data: b }, { data: tasks }, { data: logs }, { data: habits }] = await Promise.all([
    supabase.from('schedule_blocks').select('*, block_records(*)').gte('date', start).lte('date', end).order('start_time'),
    supabase.from('tasks').select('*').gte('due_date', start).lte('due_date', end),
    supabase.from('habit_logs').select('date').gte('date', start).lte('date', end),
    supabase.from('habits').select('id').is('archived_at', null),
  ]);
  const blocks = normaliseBlocks(b || []);
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const planned = blocks.reduce((a, x) => a + plannedMinutes(x), 0);
  const actual = blocks.reduce((a, x) => a + actualMinutes(x), 0);
  const tasksDone = (tasks || []).filter((t: any) => t.status === 'done').length;
  const fmtDay = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>This week</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Your 7 days at a glance. Tap a day to plan it hour by hour.</p>
      </header>
      <nav className="filters" aria-label="Choose a week">
        <Link href={`/app/week?start=${addDays(start, -7)}`}>← Last week</Link>
        <Link href="/app/week" aria-current={start === thisWeek ? 'page' : undefined}>This week</Link>
        <Link href={`/app/week?start=${addDays(start, 7)}`}>Next week →</Link>
      </nav>
      <section className="tiles">
        <div className="tile hot"><span style={{ fontSize: 14 }}>Planned time</span><span className="big">{fmtMinutes(planned)}</span></div>
        <div className="tile"><span className="muted">Time actually spent</span><span className="big">{fmtMinutes(actual)}</span></div>
        <div className="tile" style={{ background: 'var(--butter)' }}><span className="muted" style={{ color: '#5A3D0C' }}>Tasks due · done</span><span className="big">{(tasks || []).length} · {tasksDone}</span></div>
        <div className="tile" style={{ background: 'var(--blush)' }}><span className="muted" style={{ color: '#7A1B3F' }}>Habit check-ins</span><span className="big">{(logs || []).length}<span style={{ fontSize: 18 }}> of {(habits || []).length * 7}</span></span></div>
      </section>
      <section className="rings" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(230px, 100%), 1fr))' }}>
        {days.map((d) => {
          const bs = blocks.filter((x) => x.date === d);
          const ts = (tasks || []).filter((t: any) => t.due_date === d);
          const isToday = d === today;
          return (
            <article key={d} className="card" style={{ padding: 18, gap: 8, outline: isToday ? '2px solid var(--rasp)' : 'none' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{fmtDay(d)}</strong>
                {isToday && <span className="chip tone-today">Today</span>}
              </div>
              {bs.length === 0 && ts.length === 0 && <span className="muted">Nothing planned yet.</span>}
              {bs.map((x) => (
                <div key={x.id} className="row" style={{ gap: 8, fontSize: 14, flexWrap: 'nowrap' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, flex: 'none', background: x.area_id ? areaById[x.area_id]?.color : 'var(--rasp)' }} />
                  <span className="muted" style={{ width: 62, flex: 'none' }}>{clock(x.start_time)}</span>
                  <span style={{ flex: 1, textDecoration: x.record?.status === 'done' ? 'line-through' : 'none' }}>{x.title}</span>
                </div>
              ))}
              {ts.map((t: any) => (
                <div key={t.id} className="row" style={{ gap: 8, fontSize: 14 }}>
                  <span className={'chip ' + (t.status === 'done' ? 'tone-done' : 'tone-week')}>{t.status === 'done' ? 'Done' : 'Due'}</span>
                  <span style={{ flex: 1 }}>{t.title}</span>
                </div>
              ))}
              <Link href={`/app/day?date=${d}`} style={{ fontWeight: 600, fontSize: 14 }}>Plan this day →</Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
