import Link from 'next/link';
import { getAppContext } from '@/lib/app-data';
import { prettyDate } from '@/lib/dates';
import { saveJournal } from '@/lib/actions/app';
import FormMessage from '@/components/FormMessage';

const FEELINGS = ['Calm', 'Happy', 'Grateful', 'Hopeful', 'Tired', 'Stressed', 'Sad', 'Anxious'];

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ date?: string; q?: string; saved?: string }> }) {
  const sp = await searchParams;
  const { supabase, today } = await getAppContext();
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : today;
  const q = (sp.q || '').trim();

  const [{ data: entry }, historyRes] = await Promise.all([
    supabase.from('journal_entries').select('*').eq('date', date).order('created_at').limit(1).maybeSingle(),
    q
      ? supabase
          .from('journal_entries')
          .select('*')
          .or(['body', 'went_well', 'could_be_better', 'learned', 'highlights'].map((c) => `${c}.ilike.%${q.replace(/[%,()]/g, ' ')}%`).join(','))
          .order('date', { ascending: false })
          .limit(30)
      : supabase.from('journal_entries').select('*').order('date', { ascending: false }).limit(30),
  ]);
  const history = historyRes.data || [];
  const e: any = entry || {};

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <span className="muted" style={{ fontSize: 15 }}>{prettyDate(date)}</span>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Journal</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>Private to you. Only your account can read these pages.</p>
      </header>
      <FormMessage message={sp.saved ? 'Entry saved.' : undefined} />

      <section className="cols">
        <form action={saveJournal} className="card" style={{ background: 'var(--peach)' }}>
          <input type="hidden" name="date" value={date} />
          {e.id && <input type="hidden" name="id" value={e.id} />}
          <div className="field"><label htmlFor="j-h">Today's highlight</label><input id="j-h" name="highlights" className="input" defaultValue={e.highlights || ''} style={{ background: '#fff' }} /></div>
          <div className="field"><label htmlFor="j-w">What went well?</label><textarea id="j-w" name="went_well" className="textarea" defaultValue={e.went_well || ''} style={{ background: '#fff' }} /></div>
          <div className="field"><label htmlFor="j-b">What could have been better?</label><textarea id="j-b" name="could_be_better" className="textarea" defaultValue={e.could_be_better || ''} style={{ background: '#fff' }} /></div>
          <div className="field"><label htmlFor="j-l">What did I learn today?</label><textarea id="j-l" name="learned" className="textarea" defaultValue={e.learned || ''} style={{ background: '#fff' }} /></div>
          <div className="field">
            <label htmlFor="j-f">How am I feeling?</label>
            <select id="j-f" name="feeling" className="select" defaultValue={e.feeling || ''} style={{ background: '#fff' }}>
              <option value="">—</option>
              {FEELINGS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="j-free">Free writing</label><textarea id="j-free" name="body" className="textarea" rows={6} defaultValue={e.body || ''} style={{ background: '#fff' }} /></div>
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>{e.id ? 'Update entry' : 'Save entry'}</button>
        </form>

        <div className="card">
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>History</h2>
          <form method="get" action="/app/journal" className="row" style={{ gap: 8 }}>
            <label htmlFor="j-q" className="sr-only">Search your journal</label>
            <input id="j-q" type="search" name="q" defaultValue={q} className="input" placeholder="Search your entries" style={{ flex: 1 }} />
            <button type="submit" className="btn small dark">Search</button>
          </form>
          {history.length === 0 && <p className="empty">{q ? 'No entry matches that search.' : 'Your saved entries will appear here.'}</p>}
          {history.map((h: any) => (
            <Link key={h.id} href={`/app/journal?date=${h.date}`} style={{ textDecoration: 'none', color: 'inherit', padding: '12px 14px', borderRadius: 16, background: h.date === date ? 'var(--blush)' : 'var(--ground)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="row" style={{ gap: 8 }}>
                <strong style={{ fontSize: 14 }}>{prettyDate(h.date)}</strong>
                {h.feeling && <span className="chip" style={{ background: 'var(--butter)', color: '#5A3D0C' }}>{h.feeling}</span>}
              </span>
              <span className="muted" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                {h.highlights || h.went_well || h.body || h.learned || '…'}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
