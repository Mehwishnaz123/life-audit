import { getAppContext } from '@/lib/app-data';
import { saveProfile, requestDeletion } from '@/lib/actions/app';
import FormMessage from '@/components/FormMessage';
import { getSiteContent } from '@/lib/content';

const ZONES = ['Asia/Karachi', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Riyadh', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Dhaka', 'Asia/Jakarta', 'Australia/Sydney', 'UTC'];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deletion?: string }> }) {
  const sp = await searchParams;
  const { profile, user, name, timezone, supabase } = await getAppContext();
  const [{ data: del }, { plans }] = await Promise.all([supabase.from('deletion_requests').select('created_at').maybeSingle(), getSiteContent()]);
  const zones = ZONES.includes(timezone) ? ZONES : [timezone, ...ZONES];

  return (
    <div className="view">
      <header><h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Settings</h1></header>
      <FormMessage message={sp.saved ? 'Settings saved.' : sp.deletion ? 'Your deletion request was received.' : undefined} />
      <section className="cols">
        <form action={saveProfile} className="card">
          <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Profile and preferences</h2>
          <div className="field"><label htmlFor="s-name">Display name</label><input id="s-name" name="display_name" className="input" defaultValue={name} /></div>
          <div className="field"><label>Email</label><input className="input" value={user.email || ''} readOnly disabled /></div>
          <div className="field">
            <label htmlFor="s-tz">Time zone</label>
            <select id="s-tz" name="timezone" className="select" defaultValue={timezone}>{zones.map((z) => <option key={z}>{z}</option>)}</select>
          </div>
          <div className="field">
            <label htmlFor="s-ws">Week starts on</label>
            <select id="s-ws" name="week_start" className="select" defaultValue={String(profile?.week_start ?? 1)}>
              <option value="1">Monday</option><option value="0">Sunday</option><option value="6">Saturday</option>
            </select>
          </div>
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Save settings</button>
        </form>

        <div className="stack" style={{ gap: 16 }}>
          <div className="card">
            <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Your plan</h2>
            <p style={{ margin: 0 }}><strong>Early access</strong> · everything unlocked, free</p>
            <p className="muted" style={{ margin: 0 }}>You can use every feature, including Premium and Pro, for free while Life Audit is in early access. When paid plans start, we will tell you first. Your data always stays yours, whatever plan you choose.</p>
          </div>
          <div className="card">
            <h2 className="h3 serif" style={{ fontSize: 22, fontWeight: 500 }}>Your data</h2>
            <p className="muted" style={{ margin: 0 }}>Download everything you have recorded as one file.</p>
            <a href="/app/settings/export" className="btn small dark" style={{ alignSelf: 'flex-start' }} download>Export my data</a>
            <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%' }} />
            {del ? (
              <p className="notice" style={{ margin: 0 }}>You asked for your account to be deleted on {String(del.created_at).slice(0, 10)}. It will be removed together with all your data.</p>
            ) : (
              <form action={requestDeletion} className="stack" style={{ gap: 8 }}>
                <p className="muted" style={{ margin: 0 }}>Ask for your account and all of its data to be deleted. Export first if you want a copy.</p>
                <button type="submit" className="btn small ghost" style={{ alignSelf: 'flex-start', borderColor: 'var(--rasp)', color: 'var(--rasp)' }}>Request account deletion</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
