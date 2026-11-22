export const metadata = { title: 'Gratitude · Life Audit' };
import { getAppContext } from '@/lib/app-data';
import { addDays, prettyDate } from '@/lib/dates';
import { addGratitude, deleteGratitude } from '@/lib/actions/app';

export default async function GratitudePage() {
  const { supabase, today } = await getAppContext();
  const { data } = await supabase.from('gratitude_entries').select('*').gte('date', addDays(today, -60)).order('date', { ascending: false }).order('sort_order');
  const rows = data || [];
  const todays = rows.filter((r: any) => r.date === today);
  const byDate: Record<string, any[]> = {};
  rows.filter((r: any) => r.date !== today).forEach((r: any) => (byDate[r.date] = [...(byDate[r.date] || []), r]));
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = addDays(today, -i);
    if (rows.some((r: any) => r.date === d)) streak++;
    else if (i === 0) continue;
    else break;
  }

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Gratitude</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Three things, or more, every day.</p>
      </header>
      <section className="tiles">
        <div className="tile" style={{ background: 'var(--butter)' }}><span className="muted" style={{ color: '#5A3D0C' }}>Recorded today</span><span className="big">{todays.length}<span style={{ fontSize: 19 }}> of 3</span></span></div>
        <div className="tile"><span className="muted">Days in a row</span><span className="big">{streak}</span></div>
      </section>
      <section className="cols">
        <form action={addGratitude} className="card" style={{ background: 'var(--butter)' }}>
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Today I am grateful for</h2>
          <input type="hidden" name="date" value={today} />
          {['g1', 'g2', 'g3'].map((k, i) => (
            <div key={k} className="field">
              <label htmlFor={k} className="sr-only">Thing {i + 1}</label>
              <input id={k} name={k} className="input" placeholder={`${todays.length + i + 1}.`} style={{ background: '#fff' }} maxLength={500} />
            </div>
          ))}
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Save</button>
        </form>
        <div className="card">
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Today</h2>
          {todays.length === 0 && <p className="muted" style={{ margin: 0 }}>Nothing recorded yet today.</p>}
          {todays.map((r: any) => (
            <div key={r.id} className="task-row">
              <span className="task-title">{r.text}</span>
              <form action={deleteGratitude}><input type="hidden" name="id" value={r.id} /><button type="submit" className="iconbtn" aria-label={'Remove ' + r.text}>×</button></form>
            </div>
          ))}
          {Object.keys(byDate).length > 0 && <h3 className="h3" style={{ fontSize: 16, marginTop: 12 }}>Earlier</h3>}
          {Object.entries(byDate).map(([d, items]) => (
            <div key={d} style={{ padding: '10px 12px', borderRadius: 14, background: 'var(--ground)' }}>
              <strong style={{ fontSize: 13 }}>{prettyDate(d)}</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>{items.map((r) => <li key={r.id}>{r.text}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
