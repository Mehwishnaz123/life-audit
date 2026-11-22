import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { addDays, prettyDate } from '@/lib/dates';
import { addBlock, recordBlock, clearRecord, deleteBlock } from '@/lib/actions/app';
import { normaliseBlocks, plannedMinutes, actualMinutes, fmtMinutes, clock } from '@/lib/records';
import AreaChip, { AreaSelect } from '@/components/AreaChip';
import FormMessage from '@/components/FormMessage';

const REASONS = ['Ran out of time', 'Low energy', 'Something urgent came up', 'Plans changed', 'Forgot', 'Other'];
const NEXT = [
  ['carry_forward', 'Carry to tomorrow'],
  ['reschedule', 'Reschedule to a date'],
  ['postpone', 'Postpone (decide later)'],
  ['cancel', 'Cancel'],
];
const STATUS_LABEL: Record<string, [string, string]> = {
  done: ['Done', 'tone-done'],
  partial: ['Partly done', 'tone-week'],
  skipped: ['Skipped', 'tone-today'],
};

export default async function DayPage({ searchParams }: { searchParams: Promise<{ date?: string; error?: string }> }) {
  const sp = await searchParams;
  const { supabase, today, areas } = await getAppContext();
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : today;
  const { data } = await supabase.from('schedule_blocks').select('*, block_records(*)').eq('date', date).order('start_time');
  const blocks = normaliseBlocks(data || []);
  const areaById = Object.fromEntries(areas.map((a) => [a.id, a]));

  const planned = blocks.reduce((a, b) => a + plannedMinutes(b), 0);
  const actual = blocks.reduce((a, b) => a + actualMinutes(b), 0);
  const count = (st: string) => blocks.filter((b) => b.record?.status === st).length;
  const recorded = blocks.filter((b) => b.record).length;

  const byArea = areas
    .map((a) => {
      const bs = blocks.filter((b) => b.area_id === a.id);
      return { area: a, p: bs.reduce((x, b) => x + plannedMinutes(b), 0), ac: bs.reduce((x, b) => x + actualMinutes(b), 0) };
    })
    .filter((x) => x.p > 0);
  const maxP = Math.max(1, ...byArea.map((x) => Math.max(x.p, x.ac)));
  const unfinished = blocks.filter((b) => b.record && b.record.status !== 'done');

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <span className="muted" style={{ fontSize: 15 }}>{prettyDate(date)}</span>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Today, hour by hour</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Nothing is marked for you. Record each block as it really went.</p>
      </header>

      <nav className="filters" aria-label="Choose a day">
        <Link href={`/app/day?date=${addDays(date, -1)}`}>← Previous day</Link>
        <Link href="/app/day" aria-current={date === today ? 'page' : undefined}>Today</Link>
        <Link href={`/app/day?date=${addDays(date, 1)}`}>Next day →</Link>
        <form method="get" action="/app/day" className="row" style={{ gap: 6 }}>
          <label htmlFor="pick-date" className="sr-only">Pick a date</label>
          <input id="pick-date" type="date" name="date" defaultValue={date} className="input" style={{ minHeight: 42, width: 170 }} />
          <button type="submit" className="btn small dark">Go</button>
        </form>
      </nav>

      <section className="tiles">
        <div className="tile"><span className="muted">Planned</span><span className="big">{fmtMinutes(planned)}</span><span className="muted">{blocks.length} blocks</span></div>
        <div className="tile hot"><span style={{ fontSize: 14 }}>Actually spent</span><span className="big">{fmtMinutes(actual)}</span><span style={{ fontSize: 13 }}>{planned ? Math.round((actual / planned) * 100) : 0}% of plan</span></div>
        <div className="tile" style={{ background: 'var(--butter)' }}><span className="muted" style={{ color: '#5A3D0C' }}>Recorded</span><span className="big">{recorded}<span style={{ fontSize: 19 }}> of {blocks.length}</span></span><span className="muted" style={{ color: '#5A3D0C' }}>{count('done')} done · {count('partial')} partly · {count('skipped')} skipped</span></div>
      </section>

      <section className="card">
        <FormMessage error={sp.error} />
        <form action={addBlock} className="inline-form">
          <input type="hidden" name="date" value={date} />
          <div className="field grow"><label htmlFor="b-title">New time block</label><input id="b-title" name="title" className="input" placeholder="e.g. Study, Exercise, Family time" required maxLength={200} /></div>
          <div className="field"><label htmlFor="b-start">Start</label><input id="b-start" name="start_time" type="time" className="input" defaultValue="09:00" required /></div>
          <div className="field"><label htmlFor="b-end">End</label><input id="b-end" name="end_time" type="time" className="input" defaultValue="10:00" required /></div>
          <AreaSelect areas={areas} id="b-area" />
          <button type="submit" className="btn">Add block</button>
        </form>
      </section>

      <section className="cols">
        <div className="stack" style={{ gap: 12 }}>
          {blocks.length === 0 && <p className="empty">No blocks planned for this day yet. Add your first one above.</p>}
          {blocks.map((b) => {
            const r = b.record;
            const lab = r ? STATUS_LABEL[r.status] : null;
            return (
              <article key={b.id} className="card" style={{ gap: 12, outline: r?.status === 'done' ? `2px solid ${b.area_id ? areaById[b.area_id]?.color : 'var(--rasp)'}` : 'none' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="muted">{clock(b.start_time)} – {clock(b.end_time)} · {fmtMinutes(plannedMinutes(b))}</span>
                  <div className="row" style={{ gap: 6 }}>
                    <AreaChip area={b.area_id ? areaById[b.area_id] : null} />
                    {lab && <span className={'chip ' + lab[1]}>{lab[0]}</span>}
                  </div>
                </div>
                <h2 className="h3">{b.title}</h2>
                {r && (
                  <p className="muted" style={{ margin: 0 }}>
                    {r.status === 'done' && <>Actual time: {fmtMinutes(actualMinutes(b))}. </>}{r.status === 'partial' && (r.actual_minutes != null ? <>Actual time: {fmtMinutes(r.actual_minutes)} of {fmtMinutes(plannedMinutes(b))}. </> : <>How many minutes did you really spend? Add them below so your reports are right. </>)}
                    {r.skip_reason && <>Reason: {r.skip_reason}. </>}
                    {r.next_action && <>Next: {NEXT.find((n) => n[0] === r.next_action)?.[1]}{r.rescheduled_to ? ` (${r.rescheduled_to})` : ''}. </>}
                    {r.actual_note && <>Note: {r.actual_note}</>}
                  </p>
                )}
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--rasp)', minHeight: 32 }}>{r ? 'Change what happened' : 'Record what happened'}</summary>
                  <form action={recordBlock} className="stack" style={{ gap: 10, marginTop: 10 }}>
                    <input type="hidden" name="block_id" value={b.id} />
                    <div className="row">
                      <div className="field" style={{ flex: '1 1 140px' }}>
                        <label htmlFor={'am-' + b.id}>Actual minutes</label>
                        <input id={'am-' + b.id} name="actual_minutes" type="number" min={0} className="input" defaultValue={r?.actual_minutes ?? ''} placeholder={plannedMinutes(b) + ' planned'} />
                      </div>
                      <div className="field" style={{ flex: '1 1 180px' }}>
                        <label htmlFor={'sr-' + b.id}>If skipped, why?</label>
                        <select id={'sr-' + b.id} name="skip_reason" className="select" defaultValue={r?.skip_reason || ''}>
                          <option value="">—</option>
                          {REASONS.map((x) => <option key={x}>{x}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="field" style={{ flex: '1 1 200px' }}>
                        <label htmlFor={'na-' + b.id}>If not finished, what next?</label>
                        <select id={'na-' + b.id} name="next_action" className="select" defaultValue={r?.next_action || ''}>
                          <option value="">—</option>
                          {NEXT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="field" style={{ flex: '1 1 160px' }}>
                        <label htmlFor={'rt-' + b.id}>Reschedule date</label>
                        <input id={'rt-' + b.id} name="rescheduled_to" type="date" className="input" defaultValue={addDays(date, 1)} />
                      </div>
                    </div>
                    <div className="field"><label htmlFor={'an-' + b.id}>What was actually done (optional)</label><input id={'an-' + b.id} name="actual_note" className="input" defaultValue={r?.actual_note || ''} /></div>
                    <div className="row">
                      <button type="submit" name="status" value="done" className="btn small">Done</button>
                      <button type="submit" name="status" value="partial" className="btn small dark">Partly done</button>
                      <button type="submit" name="status" value="skipped" className="btn small ghost">Skipped</button>
                    </div>
                  </form>
                  <div className="row" style={{ marginTop: 8 }}>
                    {r && (
                      <form action={clearRecord}><input type="hidden" name="block_id" value={b.id} /><button type="submit" className="linkbtn">Clear the record</button></form>
                    )}
                    <form action={deleteBlock}><input type="hidden" name="block_id" value={b.id} /><button type="submit" className="linkbtn">Delete this block</button></form>
                  </div>
                </details>
              </article>
            );
          })}
        </div>

        <div className="stack" style={{ gap: 16 }}>
          <div className="audit-card" style={{ color: 'var(--ground)' }}>
            <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Planned vs actual</h2>
            <div className="legend"><span><i style={{ background: '#8A5C96' }} />Planned</span><span><i style={{ background: '#FFC93C' }} />Actual</span></div>
            {byArea.length === 0 && <p style={{ margin: 0, color: '#FBE4EA' }}>Add blocks with a life area to see the comparison.</p>}
            {byArea.map((x) => (
              <div key={x.area.id} className="stack" style={{ gap: 5 }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}><span>{x.area.name}</span><span style={{ color: '#FBE4EA' }}>{fmtMinutes(x.ac)} of {fmtMinutes(x.p)}</span></div>
                <div className="bar"><span style={{ width: (x.p / maxP) * 100 + '%', background: '#8A5C96' }} /></div>
                <div className="bar"><span style={{ width: (x.ac / maxP) * 100 + '%', background: '#FFC93C' }} /></div>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Unfinished</h2>
            {unfinished.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>Blocks you mark partly done or skipped appear here.</p>
            ) : (
              unfinished.map((b) => (
                <div key={b.id} className="row" style={{ justifyContent: 'space-between', padding: '10px 12px', borderRadius: 14, background: 'var(--ground)' }}>
                  <strong>{b.title}</strong>
                  <span className="muted">{STATUS_LABEL[b.record!.status][0]} → {NEXT.find((n) => n[0] === b.record!.next_action)?.[1] || 'no decision yet'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
