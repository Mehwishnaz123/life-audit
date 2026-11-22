import { getAppContext } from '@/lib/app-data';
import { addDays } from '@/lib/dates';
import { addHabit, toggleHabit, archiveHabit } from '@/lib/actions/app';
import AreaChip, { AreaSelect } from '@/components/AreaChip';

const DAYS = 28;

export default async function HabitsPage() {
  const { supabase, areas, today } = await getAppContext();
  const from = addDays(today, -(DAYS - 1));
  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from('habits').select('*').is('archived_at', null).order('created_at'),
    supabase.from('habit_logs').select('habit_id, date').gte('date', from).lte('date', today),
  ]);
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(from, i));

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Habits</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>A pale square is a day off, not a failure. Pick it back up today.</p>
      </header>

      <section className="card">
        <form action={addHabit} className="inline-form">
          <div className="field grow"><label htmlFor="h-title">New habit</label><input id="h-title" name="title" className="input" placeholder="e.g. Read 10 pages, Five daily prayers" required maxLength={200} /></div>
          <AreaSelect areas={areas} id="h-area" />
          <div className="field">
            <label htmlFor="h-f">How often</label>
            <select id="h-f" name="frequency" className="select" defaultValue="daily"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
          </div>
          <button type="submit" className="btn">Add habit</button>
        </form>
      </section>

      {(habits || []).length === 0 && <p className="empty">No habits yet. Add your first one above.</p>}

      <section className="cols">
        {(habits || []).map((h: any) => {
          const done = new Set((logs || []).filter((l: any) => l.habit_id === h.id).map((l: any) => l.date));
          const doneToday = done.has(today);
          let streak = 0;
          for (let i = DAYS - 1; i >= 0; i--) {
            const d = dates[i];
            if (done.has(d)) streak++;
            else if (d === today) continue; // today not done yet does not break the streak
            else break;
          }
          const created = String(h.created_at).slice(0, 10);
          const tracked = dates.filter((d) => d >= created);
          const pct = tracked.length ? Math.round((tracked.filter((d) => done.has(d)).length / tracked.length) * 100) : 0;
          const area = h.area_id ? areaById[h.area_id] : null;
          const color = area?.color || '#C2255C';
          return (
            <article key={h.id} className="card">
              <div className="row" style={{ gap: 12 }}>
                <form action={toggleHabit}>
                  <input type="hidden" name="habit_id" value={h.id} />
                  <input type="hidden" name="date" value={today} />
                  <input type="hidden" name="done" value={doneToday ? '1' : '0'} />
                  <button type="submit" className={'tick' + (doneToday ? ' on' : '')} style={{ width: 34, height: 34, borderColor: color }} aria-label={(doneToday ? 'Undo today: ' : 'Done today: ') + h.title}>
                    {doneToday ? '✓' : ''}
                  </button>
                </form>
                <div className="stack" style={{ gap: 2, flex: 1 }}>
                  <strong style={{ fontSize: 16 }}>{h.title}</strong>
                  <div className="row" style={{ gap: 6 }}><AreaChip area={area} /><span className="muted">{h.frequency}</span></div>
                </div>
              </div>
              <div role="img" aria-label={`${h.title}: done on ${done.size} of the last ${DAYS} days`} style={{ display: 'grid', gridTemplateColumns: 'repeat(14, minmax(0, 1fr))', gap: 4 }}>
                {dates.map((d) => (
                  <span key={d} title={d} style={{ aspectRatio: '1', borderRadius: 5, background: done.has(d) ? color : d < created ? 'transparent' : 'var(--track)', outline: d === today ? '2px solid var(--ink)' : 'none' }} />
                ))}
              </div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                <span>Streak: <strong>{streak} {streak === 1 ? 'day' : 'days'}</strong></span>
                <span>Consistency: <strong>{pct}%</strong></span>
              </div>
              <form action={archiveHabit}><input type="hidden" name="id" value={h.id} /><button type="submit" className="linkbtn" style={{ color: 'var(--muted)' }}>Archive habit</button></form>
            </article>
          );
        })}
      </section>
    </div>
  );
}
