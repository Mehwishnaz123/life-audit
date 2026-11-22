import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_SETTINGS } from '@/lib/content';
import { saveSettings, saveFaq, deleteFaq, savePlan } from '@/lib/actions/admin';
import FormMessage from '@/components/FormMessage';

const LABELS: Record<string, [string, boolean]> = {
  hero_badge: ['Small badge above the headline', false],
  hero_title: ['Main headline', false],
  hero_subtitle: ['Text under the headline', true],
  cta_label: ['Main button text', false],
  founder_name: ['Founder name (About page)', false],
  founder_bio: ['About the founder (About page)', true],
  contact_email: ['Contact email (footer and About page)', false],
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: settingsRows }, { data: faqs }, { data: plans }] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('site_faqs').select('*').order('sort_order'),
    supabase.from('site_plans').select('*').order('sort_order'),
  ]);
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  (settingsRows || []).forEach((r: any) => (settings[r.key] = r.value));

  return (
    <div className="view">
      <header className="stack" style={{ gap: 6 }}>
        <h1 className="h2" style={{ fontSize: 'clamp(30px,4vw,44px)' }}>Website admin</h1>
        <p className="muted" style={{ margin: 0, fontSize: 15 }}>
          Changes appear on the public website straight away. <Link href="/" target="_blank">Open the website</Link>
        </p>
      </header>
      <FormMessage error={sp.error} message={sp.saved ? 'Saved.' : undefined} />

      <section id="text" className="admin-section">
        <h2 className="h3 serif" style={{ fontSize: 24, fontWeight: 500 }}>Website text</h2>
        <form action={saveSettings} className="admin-item">
          {Object.entries(LABELS).map(([key, [label, long]]) => (
            <div key={key} className="field">
              <label htmlFor={key}>{label}</label>
              {long ? (
                <textarea id={key} name={key} className="textarea" defaultValue={settings[key]} />
              ) : (
                <input id={key} name={key} className="input" defaultValue={settings[key]} />
              )}
            </div>
          ))}
          <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }}>Save website text</button>
        </form>
      </section>

      <section id="faqs" className="admin-section">
        <h2 className="h3 serif" style={{ fontSize: 24, fontWeight: 500 }}>FAQs</h2>
        {(faqs || []).map((f: any) => (
          <div key={f.id} className="admin-item">
            <form action={saveFaq} className="stack" style={{ gap: 12 }}>
              <input type="hidden" name="id" value={f.id} />
              <div className="field">
                <label htmlFor={'q-' + f.id}>Question</label>
                <input id={'q-' + f.id} name="question" className="input" defaultValue={f.question} required />
              </div>
              <div className="field">
                <label htmlFor={'a-' + f.id}>Answer</label>
                <textarea id={'a-' + f.id} name="answer" className="textarea" defaultValue={f.answer} required />
              </div>
              <div className="row">
                <div className="field" style={{ width: 120 }}>
                  <label htmlFor={'o-' + f.id}>Order</label>
                  <input id={'o-' + f.id} name="sort_order" type="number" className="input" defaultValue={f.sort_order} />
                </div>
                <label className="row" style={{ gap: 8, minHeight: 48, alignSelf: 'flex-end' }}>
                  <input type="checkbox" name="published" defaultChecked={f.published} /> Show on website
                </label>
              </div>
              <button type="submit" className="btn small" style={{ alignSelf: 'flex-start' }}>Save</button>
            </form>
            <form action={deleteFaq}>
              <input type="hidden" name="id" value={f.id} />
              <button type="submit" className="linkbtn">Delete this question</button>
            </form>
          </div>
        ))}
        <form action={saveFaq} className="admin-item" style={{ background: 'var(--peach)' }}>
          <strong>Add a new question</strong>
          <div className="field">
            <label htmlFor="q-new">Question</label>
            <input id="q-new" name="question" className="input" required />
          </div>
          <div className="field">
            <label htmlFor="a-new">Answer</label>
            <textarea id="a-new" name="answer" className="textarea" required />
          </div>
          <input type="hidden" name="sort_order" value={(faqs || []).length} />
          <input type="hidden" name="published" value="on" />
          <button type="submit" className="btn small" style={{ alignSelf: 'flex-start' }}>Add question</button>
        </form>
      </section>

      <section id="plans" className="admin-section">
        <h2 className="h3 serif" style={{ fontSize: 24, fontWeight: 500 }}>Pricing plans</h2>
        <div className="cols">
          {(plans || []).map((p: any) => (
            <form key={p.id} action={savePlan} className="admin-item">
              <input type="hidden" name="id" value={p.id} />
              <div className="field">
                <label htmlFor={'n-' + p.id}>Plan name</label>
                <input id={'n-' + p.id} name="name" className="input" defaultValue={p.name} />
              </div>
              <div className="row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor={'p-' + p.id}>Price</label>
                  <input id={'p-' + p.id} name="price_label" className="input" defaultValue={p.price_label} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor={'per-' + p.id}>Period</label>
                  <input id={'per-' + p.id} name="period" className="input" defaultValue={p.period} />
                </div>
              </div>
              <div className="field">
                <label htmlFor={'t-' + p.id}>Short description</label>
                <input id={'t-' + p.id} name="tagline" className="input" defaultValue={p.tagline} />
              </div>
              <div className="field">
                <label htmlFor={'f-' + p.id}>Features (one per line)</label>
                <textarea id={'f-' + p.id} name="features" className="textarea" rows={6} defaultValue={(p.features || []).join('\n')} />
              </div>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" name="highlighted" defaultChecked={p.highlighted} /> Highlight this plan
              </label>
              <button type="submit" className="btn small" style={{ alignSelf: 'flex-start' }}>Save {p.name}</button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
