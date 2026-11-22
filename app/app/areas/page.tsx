export const metadata = { title: 'Life areas · Life Audit' };
import { getAppContext } from '@/lib/app-data';
import { addArea, updateArea, archiveArea } from '@/lib/actions/app';

const PALETTE = ['#E8590C', '#D6336C', '#B8860B', '#7B4BC9', '#2F6FDE', '#0B8F7F', '#4F7F12', '#C2255C'];

export default async function AreasPage() {
  const { supabase } = await getAppContext();
  const [{ data: all }, { data: tasks }, { data: goals }, { data: habits }] = await Promise.all([
    supabase.from('life_areas').select('*').order('sort_order').order('created_at'),
    supabase.from('tasks').select('area_id, status'),
    supabase.from('goals').select('area_id, status'),
    supabase.from('habits').select('area_id').is('archived_at', null),
  ]);
  const live = (all || []).filter((a: any) => !a.archived_at);
  const archived = (all || []).filter((a: any) => a.archived_at);
  const n = (rows: any[] | null, id: string, f: (r: any) => boolean = () => true) => (rows || []).filter((r) => r.area_id === id && f(r)).length;

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Life Areas</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Your life, your categories. Rename them, set how much each matters to you, add or archive.</p>
      </header>

      <section className="card">
        <form action={addArea} className="inline-form">
          <div className="field grow"><label htmlFor="a-name">New life area</label><input id="a-name" name="name" className="input" placeholder="e.g. Side business, Hifz, Art" required maxLength={60} /></div>
          <div className="field"><label htmlFor="a-color">Colour</label><input id="a-color" name="color" type="color" className="input" defaultValue={PALETTE[0]} style={{ padding: 4 }} /></div>
          <div className="field grow"><label htmlFor="a-desc">Description (optional)</label><input id="a-desc" name="description" className="input" /></div>
          <button type="submit" className="btn">Add area</button>
        </form>
      </section>

      <section className="cols">
        {live.map((a: any) => (
          <form key={a.id} action={updateArea} className="card" style={{ borderTop: `6px solid ${a.color}` }}>
            <input type="hidden" name="id" value={a.id} />
            <div className="row">
              <div className="field" style={{ flex: 1 }}><label htmlFor={'n-' + a.id}>Name</label><input id={'n-' + a.id} name="name" className="input" defaultValue={a.name} required /></div>
              <div className="field" style={{ width: 80 }}><label htmlFor={'c-' + a.id}>Colour</label><input id={'c-' + a.id} name="color" type="color" className="input" defaultValue={a.color} style={{ padding: 4 }} /></div>
            </div>
            <div className="field">
              <label htmlFor={'w-' + a.id}>How important is this area to you?</label>
              <select id={'w-' + a.id} name="weight" className="select" defaultValue={String(a.weight)}>
                <option value="1">1 — a little</option><option value="2">2</option><option value="3">3 — medium</option><option value="4">4</option><option value="5">5 — very</option>
              </select>
            </div>
            <div className="field"><label htmlFor={'s-' + a.id}>What does success look like here?</label><input id={'s-' + a.id} name="success_definition" className="input" defaultValue={a.success_definition || ''} placeholder="e.g. Pray all five prayers on time" /></div>
            <label className="row" style={{ gap: 8 }}><input type="checkbox" name="show_on_dashboard" defaultChecked={a.show_on_dashboard} /> Show on my dashboard</label>
            <span className="muted">{n(goals, a.id, (g) => g.status === 'active')} active goals · {n(tasks, a.id, (t) => t.status === 'todo')} open tasks · {n(habits, a.id)} habits</span>
            <div className="row">
              <button type="submit" className="btn small">Save</button>
              <button type="submit" formAction={archiveArea} className="linkbtn" style={{ color: 'var(--muted)' }}>Archive</button>
            </div>
          </form>
        ))}
      </section>

      {archived.length > 0 && (
        <section className="card">
          <h2 className="h3">Archived</h2>
          <p className="muted" style={{ margin: 0 }}>Archiving hides an area. Its goals, tasks and habits are kept.</p>
          <div className="row">
            {archived.map((a: any) => (
              <form key={a.id} action={archiveArea}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="restore" value="1" />
                <button type="submit" className="btn small ghost">Restore {a.name}</button>
              </form>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
