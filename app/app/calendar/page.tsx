export const metadata = { title: 'This month · Life Audit' };
import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { prettyDate } from '@/lib/dates';
import { normaliseBlocks, clock } from '@/lib/records';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; d?: string }> }) {
  const sp = await searchParams;
  const { supabase, today, areas, profile } = await getAppContext();
  const month = sp.m && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : today.slice(0, 7);
  const [y, mo] = month.split('-').map(Number);
  const first = `${month}-01`;
  const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const last = `${month}-${String(dim).padStart(2, '0')}`;
  const weekStart = profile?.week_start ?? 1;
  const lead = (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() - weekStart + 7) % 7;
  const prev = mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`;
  const next = mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, '0')}`;
  const sel = sp.d && /^\d{4}-\d{2}-\d{2}$/.test(sp.d) ? sp.d : today.startsWith(month) ? today : first;

  const [{ data: tasks }, { data: blocks }, { data: journal }, { data: habitLogs }, { data: events }, { data: goals }] = await Promise.all([
    supabase.from('tasks').select('id, title, due_date, status, area_id').gte('due_date', first).lte('due_date', last),
    supabase.from('schedule_blocks').select('*, block_records(*)').gte('date', first).lte('date', last).order('start_time'),
    supabase.from('journal_entries').select('id, date, highlights').gte('date', first).lte('date', last),
    supabase.from('habit_logs').select('date, habit_id').gte('date', first).lte('date', last),
    supabase.from('events').select('*').gte('date', first).lte('date', last),
    supabase.from('goals').select('id, title, deadline').gte('deadline', first).lte('deadline', last),
  ]);
  const bl = normaliseBlocks(blocks || []);
  const on = (d: string) => ({
    tasks: (tasks || []).filter((t: any) => t.due_date === d),
    blocks: bl.filter((b) => b.date === d),
    journal: (journal || []).filter((j: any) => j.date === d),
    habits: (habitLogs || []).filter((h: any) => h.date === d).length,
    events: (events || []).filter((e: any) => e.date === d),
    goals: (goals || []).filter((g: any) => g.deadline === d),
  });
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: dim }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)];
  const s = on(sel);
  const monthName = new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>This month</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Tap a date to see everything planned and done that day.</p>
      </header>
      <nav className="filters" aria-label="Month">
        <Link href={`/app/calendar?m=${prev}`}>← Previous</Link>
        <Link href="/app/calendar" aria-current={month === today.slice(0, 7) ? 'page' : undefined}>This month</Link>
        <Link href={`/app/calendar?m=${next}`}>Next →</Link>
      </nav>
      <section className="cols">
        <div className="card">
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>{monthName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0,1fr))', gap: 6, textAlign: 'center' }}>
            {Array.from({ length: 7 }, (_, i) => <span key={i} className="muted" style={{ fontWeight: 600 }}>{DOW[(i + weekStart) % 7]}</span>)}
            {cells.map((d, i) => {
              if (!d) return <span key={'e' + i} />;
              const x = on(d);
              const busy = x.tasks.length + x.blocks.length + x.events.length + x.goals.length;
              const isSel = d === sel;
              return (
                <Link
                  key={d}
                  href={`/app/calendar?m=${month}&d=${d}`}
                  aria-label={`${prettyDate(d)}${busy ? `, ${busy} items` : ''}`}
                  aria-current={isSel ? 'date' : undefined}
                  style={{ minHeight: 54, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textDecoration: 'none', background: isSel ? 'var(--ink)' : d === today ? 'var(--blush)' : 'var(--ground)', color: isSel ? 'var(--ground)' : 'var(--ink)', fontWeight: d === today ? 700 : 400 }}
                >
                  <span>{Number(d.slice(8))}</span>
                  <span style={{ display: 'flex', gap: 3 }}>
                    {x.tasks.length > 0 && <i style={{ width: 6, height: 6, borderRadius: 3, background: '#FF4F8B' }} />}
                    {x.blocks.length > 0 && <i style={{ width: 6, height: 6, borderRadius: 3, background: '#FFC93C' }} />}
                    {x.journal.length > 0 && <i style={{ width: 6, height: 6, borderRadius: 3, background: '#7B4BC9' }} />}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="legend" style={{ color: 'var(--muted)' }}>
            <span><i style={{ background: '#FF4F8B' }} />Deadlines</span>
            <span><i style={{ background: '#FFC93C' }} />Schedule</span>
            <span><i style={{ background: '#7B4BC9' }} />Journal</span>
          </div>
        </div>
        <div className="card" style={{ background: 'var(--peach)' }}>
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>{prettyDate(sel)}</h2>
          {s.tasks.length + s.blocks.length + s.journal.length + s.events.length + s.goals.length === 0 && s.habits === 0 && <p className="muted" style={{ margin: 0 }}>Nothing recorded on this date.</p>}
          {s.goals.map((g: any) => <div key={g.id} className="task-row" style={{ background: '#fff' }}><span className="chip tone-week">Goal deadline</span><span className="task-title">{g.title}</span></div>)}
          {s.events.map((e: any) => <div key={e.id} className="task-row" style={{ background: '#fff' }}><span className="chip tone-month">Event</span><span className="task-title">{e.title}</span></div>)}
          {s.tasks.map((t: any) => (
            <div key={t.id} className="task-row" style={{ background: '#fff' }}>
              <span className={'chip ' + (t.status === 'done' ? 'tone-done' : 'tone-today')}>{t.status === 'done' ? 'Done' : 'Deadline'}</span>
              <span className={'task-title' + (t.status === 'done' ? ' done' : '')}>{t.title}</span>
            </div>
          ))}
          {s.blocks.map((b) => (
            <div key={b.id} className="task-row" style={{ background: '#fff' }}>
              <span className="muted" style={{ width: 70 }}>{clock(b.start_time)}</span>
              <span className="task-title">{b.title}</span>
              <span className={'chip ' + (b.record?.status === 'done' ? 'tone-done' : b.record ? 'tone-week' : 'tone-none')}>{b.record ? ({ done: 'Done', partial: 'Partly done', skipped: 'Skipped' } as Record<string, string>)[b.record.status] || b.record.status : 'Not recorded'}</span>
            </div>
          ))}
          {s.habits > 0 && <p style={{ margin: 0 }}>{s.habits} habit check-in{s.habits > 1 ? 's' : ''}.</p>}
          {s.journal.map((j: any) => <Link key={j.id} href={`/app/journal?date=${j.date}`}>Journal entry{j.highlights ? `: ${j.highlights}` : ''}</Link>)}
          <div className="row">
            <Link href={`/app/day?date=${sel}`} className="btn small dark">Open this day</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
