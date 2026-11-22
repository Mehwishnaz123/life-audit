export const metadata = { title: 'Life balance · Life Audit' };
import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { addDays } from '@/lib/dates';
import { loadPeriod, pct, weekStartOf } from '@/lib/audit';

const COMPARE = [
  ['week', 'This week vs last week'],
  ['month', 'This month vs last month'],
  ['year', 'This year vs last year'],
] as const;

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const sp = await searchParams;
  const { supabase, areas, today, profile } = await getAppContext();
  const c = COMPARE.some((x) => x[0] === sp.c) ? (sp.c as string) : 'week';
  let from: string, to: string, pFrom: string, pTo: string;
  if (c === 'month') {
    from = today.slice(0, 7) + '-01';
    to = today;
    pTo = addDays(from, -1);
    pFrom = pTo.slice(0, 7) + '-01';
  } else if (c === 'year') {
    const y = Number(today.slice(0, 4));
    from = `${y}-01-01`; to = today; pFrom = `${y - 1}-01-01`; pTo = `${y - 1}-12-31`;
  } else {
    from = weekStartOf(today, profile?.week_start ?? 1); to = addDays(from, 6); pFrom = addDays(from, -7); pTo = addDays(from, -1);
  }
  const [cur, prev] = await Promise.all([loadPeriod(supabase, areas, from, to), loadPeriod(supabase, areas, pFrom, pTo)]);
  const shown = areas.filter((a: any) => a.show_on_dashboard !== false);

  // Radar chart geometry
  const N = Math.max(3, shown.length);
  const cx = 160, cy = 150, R = 110;
  const pt = (i: number, f: number) => {
    const ang = ((-90 + (i * 360) / N) * Math.PI) / 180;
    return [cx + Math.cos(ang) * R * f, cy + Math.sin(ang) * R * f];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, Math.max(0.04, v)).map((n) => n.toFixed(1)).join(',')).join(' ');
  const score = (st: typeof cur, id: string) => st.areaStats.find((a) => a.area.id === id)?.score ?? 0;
  const curVals = shown.map((a) => score(cur, a.id));
  const prevVals = shown.map((a) => score(prev, a.id));
  const hasPrev = prev.hasData;
  const weighted = (st: typeof cur) => {
    const xs = st.areaStats.filter((a) => a.score != null && shown.some((s) => s.id === a.area.id));
    const w = xs.reduce((s, a) => s + (a.area as any).weight, 0);
    return w ? xs.reduce((s, a) => s + (a.score as number) * (a.area as any).weight, 0) / w : null;
  };

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Life balance</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Life balance across your areas, weighted by how much each matters to you.</p>
      </header>
      <nav className="filters" aria-label="Comparison">
        {COMPARE.map(([k, l]) => <Link key={k} href={`/app/analytics?c=${k}`} aria-current={c === k ? 'page' : undefined}>{l}</Link>)}
      </nav>

      {!cur.hasData ? (
        <div className="card" style={{ background: 'var(--butter)' }}>
          <h2 className="h3">Not enough recorded activity yet</h2>
          <p style={{ margin: 0, color: '#5A3D0C' }}>Analytics appear once you have planned and recorded tasks, time blocks or habits in this period.</p>
        </div>
      ) : (
        <section className="cols">
          <div className="card dark audit-card" style={{ alignItems: 'center', color: 'var(--ground)' }}>
            <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500, alignSelf: 'flex-start' }}>Life balance</h2>
            <svg viewBox="0 0 320 300" role="img" aria-label="Radar chart of completion by life area" style={{ width: '100%', maxWidth: 420 }}>
              {[1, 0.66, 0.33].map((f) => <polygon key={f} points={shown.map((_, i) => pt(i, f).join(',')).join(' ')} fill="none" stroke="#5A3C66" strokeWidth="1" />)}
              {hasPrev && <polygon points={poly(prevVals)} fill="rgba(138,92,150,.35)" stroke="#B48CC2" strokeWidth="2" strokeDasharray="4 4" />}
              <polygon points={poly(curVals)} fill="rgba(255,201,60,.35)" stroke="#FFC93C" strokeWidth="2.5" strokeLinejoin="round" />
              {shown.map((a, i) => {
                const [x, y] = pt(i, 1.18);
                return <text key={a.id} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#FBE4EA">{a.name}</text>;
              })}
            </svg>
            <div className="legend">
              <span><i style={{ background: '#FFC93C' }} />Current period</span>
              {hasPrev && <span><i style={{ background: '#B48CC2' }} />Previous period</span>}
            </div>
          </div>
          <div className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Weighted balance</h2>
              <span className="big" style={{ fontSize: 30 }}>{pct(weighted(cur))}</span>
            </div>
            <span className="muted">{hasPrev ? `Previous period: ${pct(weighted(prev))}` : 'No records in the previous period to compare with.'}</span>
            {shown.map((a: any) => {
              const s = cur.areaStats.find((x) => x.area.id === a.id)!;
              const p = prev.areaStats.find((x) => x.area.id === a.id);
              return (
                <div key={a.id} className="stack" style={{ gap: 5 }}>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 15 }}>
                    <span className="row" style={{ gap: 8 }}><i style={{ width: 12, height: 12, borderRadius: 4, background: a.color, display: 'inline-block' }} />{a.name} <span className="muted">· importance {a.weight}/5</span></span>
                    <span><strong>{pct(s.score)}</strong>{hasPrev && p?.score != null && s.score != null ? <span className="muted"> (was {pct(p.score)})</span> : null}</span>
                  </div>
                  <div className="bar" style={{ background: 'var(--track)' }}><span style={{ width: Math.round((s.score || 0) * 100) + '%', background: a.color }} /></div>
                  {a.success_definition && <span className="muted" style={{ fontSize: 13 }}>Success here: {a.success_definition}</span>}
                </div>
              );
            })}
            <Link href="/app/areas" style={{ fontWeight: 600 }}>Change importance or success definitions →</Link>
          </div>
        </section>
      )}
    </div>
  );
}
