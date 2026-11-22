import Link from 'next/link';
import type { Metadata } from 'next';
import LifeCore from '@/components/LifeCore';
import AppShowcase from '@/components/AppShowcase';
import JsonLd from '@/components/JsonLd';
import PricingCards from '@/components/PricingCards';
import FaqList from '@/components/FaqList';
import { getSiteContent } from '@/lib/content';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

export const revalidate = 60;
export const metadata: Metadata = { alternates: { canonical: '/' } };

// Fixed (not random) so the server and browser draw the same sparkles.
const SPARKS = Array.from({ length: 42 }, (_, i) => {
  const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
  const c = ['#FFC93C', '#FF7A2F', '#FF4F8B', '#FFF7EE'][i % 4];
  return { left: (r(1) * 100).toFixed(1) + '%', top: (r(2) * 100).toFixed(1) + '%', size: 1.5 + r(3) * 3, c, delay: (-r(4) * 5).toFixed(2) + 's', dur: (2.5 + r(5) * 4).toFixed(2) + 's' };
});

const ICONS: Record<string, string> = {
  planner: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  goals: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  tasks: 'M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M12 6h8M12 12h8M12 18h8',
  habits: 'M20 4v5h-5M4 20v-5h5M19 9a8 8 0 0 0-14-2M5 15a8 8 0 0 0 14 2',
  journal: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM9 9h6M9 13h4',
  'life-areas': 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
};

const FEATURES = [
  { href: '/features#planner', title: 'Time-based planner', text: 'Plan your year, month, week and each hour of today in one place.', alt: false },
  { href: '/features#goals', title: 'Goals with milestones', text: 'Break a big goal into small steps. The app shows how far you have come.', alt: true },
  { href: '/features#tasks', title: 'Tasks and deadlines', text: 'All your deadlines in one list, so nothing is forgotten.', alt: false },
  { href: '/features#habits', title: 'Habits without shame', text: 'Build good habits day by day. Missed a day? Just start again, no guilt.', alt: true },
  { href: '/features#journal', title: 'Journal and gratitude', text: 'Write a few lines about your day and three things you are thankful for.', alt: false },
  { href: '/features#life-areas', title: 'Life areas you define', text: 'Faith, study, work, health, family, money, or areas you create yourself.', alt: true },
];

const AUDIT = [
  ['Education', 14, 11],
  ['Career', 10, 6],
  ['Health', 5, 4],
  ['Family', 7, 8],
  ['Faith', 6, 6],
] as const;

export default async function HomePage() {
  const { settings, faqs, plans } = await getSiteContent();
  const offers = plans
    .map((p) => ({ p, n: parseFloat(p.price_label.replace(/[^0-9.]/g, '')) }))
    .filter((x) => !isNaN(x.n))
    .map(({ p, n }) => ({ '@type': 'Offer', name: p.name, price: n.toFixed(2), priceCurrency: 'USD' }));

  // Split the headline so the word "finally" gets the gradient, when present.
  const title = settings.hero_title;
  const idx = title.toLowerCase().indexOf('finally');

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', '@id': SITE_URL + '/#org', name: SITE_NAME, url: SITE_URL },
            { '@type': 'WebSite', '@id': SITE_URL + '/#site', name: SITE_NAME, url: SITE_URL, publisher: { '@id': SITE_URL + '/#org' } },
            { '@type': 'SoftwareApplication', name: SITE_NAME, applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', description: SITE_DESCRIPTION, url: SITE_URL, offers },
          ],
        }}
      />

      <section className="hero-wrap" aria-labelledby="hero-title">
        <div className="stage">
          <div className="sparks" aria-hidden="true">
            {SPARKS.map((s, i) => (
              <span key={i} className="spark" style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: s.c, boxShadow: `0 0 10px ${s.c}`, animationDelay: s.delay, animationDuration: s.dur }} />
            ))}
          </div>
          <div className="stage-inner">
            <div className="stack rise" style={{ gap: 26 }}>
              <span className="badge-live">
                <span className="live" aria-hidden="true" />
                {settings.hero_badge}
              </span>
              <h1 id="hero-title" className="h1 hero-title">
                {idx >= 0 ? (
                  <>
                    {title.slice(0, idx)}
                    <em className="gradd">{title.slice(idx, idx + 7)}</em>
                    {title.slice(idx + 7)}
                  </>
                ) : (
                  title
                )}
              </h1>
              <p className="lead">{settings.hero_subtitle}</p>
              <p className="hero-explain">
                A free app that helps you <strong>plan your day hour by hour</strong>, <strong>keep good habits</strong>, and get a <strong>simple weekly report</strong> of how you really spent your time.
              </p>
              <div className="row" style={{ gap: 14 }}>
                <Link href="/signup" className="btn glowbtn" style={{ minHeight: 54, padding: '0 28px', fontSize: 17 }}>
                  {settings.cta_label}
                </Link>
                <Link href="#how" style={{ padding: '16px 8px', fontWeight: 500, color: '#FFC93C' }}>
                  See how it works ↓
                </Link>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#D9C2D6' }}>Free to start · No card needed · Works on phone and computer</p>
            </div>
            <LifeCore />
          </div>
          <div className="scrollcue" aria-hidden="true">
            <span className="mono">SCROLL</span>
            <span className="cueline">
              <span />
            </span>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <div key={k} style={{ display: 'flex', gap: 14 }}>
              {[['Hourly plans', '#FF7A2F'], ['Weekly view', '#FFC93C'], ['Monthly calendar', '#FF4F8B'], ['Yearly goals', '#7B4BC9'], ['Tasks & deadlines', '#2F6FDE'], ['Habits & streaks', '#0B8F7F'], ['Private journal', '#D6336C'], ['Gratitude', '#B8860B'], ['Planned vs actual', '#E8590C'], ['Weekly reports', '#4F7F12']].map(([t, c]) => (
                <span key={t + k} className="marquee-item"><i style={{ background: c }} />{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section id="how" className="section">
        <div className="wrap stack-lg">
          <div className="stack" style={{ maxWidth: 680 }}>
            <span className="eyebrow">How it works</span>
            <h2 className="h2">One day with {SITE_NAME}</h2>
            <p className="lead">Just a few minutes a day. The app does the counting for you.</p>
          </div>
          <ol className="timeline">
            {[
              ['Morning', '5 minutes', 'Plan your day', 'Add what you want to do and when: study at 7, work at 9, family at 8.', '#FF7A2F'],
              ['During the day', '1 tap', 'Tick as you go', 'Mark tasks and habits done. Prayers, water, reading: one tap each.', '#FFC93C'],
              ['Night', '2 minutes', 'Check your day', 'For each plan, choose done, half done or skipped. Write two lines in your journal.', '#FF4F8B'],
              ['Every Sunday', 'automatic', 'Get your report', 'See your best days, what you keep putting off, and how each part of life is doing.', '#7B4BC9'],
            ].map(([when, time, title, text, c], i) => (
              <li key={when} className="tl-step" style={{ animationDelay: i * 0.15 + 's' }}>
                <span className="tl-dot" style={{ background: c, boxShadow: `0 0 0 6px ${c}33` }}>{i + 1}</span>
                <span className="tl-when">{when} · <b>{time}</b></span>
                <h3 className="h3">{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section white">
        <div className="wrap stack-lg">
          <div className="stack" style={{ maxWidth: 640 }}>
            <span className="eyebrow">See inside the app</span>
            <h2 className="h2">Simple screens. Clear answers.</h2>
          </div>
          <AppShowcase />
          <p className="muted" style={{ margin: 0 }}>Screens show example data. Your own data is private to your account.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap stack-lg">
          <div className="stack" style={{ maxWidth: 640 }}>
            <span className="eyebrow">Who is it for</span>
            <h2 className="h2">Made for real, busy people</h2>
          </div>
          <div className="grid">
            {[
              ['Students', 'Keep track of classes, assignments, exams and study hours without stress.', 'var(--blush)'],
              ['Working people', 'Balance work, learning and family, and finish what matters first.', 'var(--butter)'],
              ['Anyone growing', 'Prayers, reading, health or savings: build the habits you care about.', 'var(--peach)'],
            ].map(([t, d, bg]) => (
              <div key={t} className="card lift reveal" style={{ background: bg }}>
                <h3 className="h3">{t}</h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{d}</p>
              </div>
            ))}
          </div>
          <div className="row">
            <Link href="/signup" className="btn">Create my free account</Link>
            <span className="muted">No card needed. Takes 30 seconds.</span>
          </div>
        </div>
      </section>

      <section className="section white">
        <div className="wrap stack-lg">
          <div className="stack" style={{ maxWidth: 640 }}>
            <span className="eyebrow">What is inside</span>
            <h2 className="h2">Everything you need, in one simple app</h2>
          </div>
          <div className="grid">
            {FEATURES.map((f) => (
              <Link key={f.href} href={f.href} className="card lift reveal" style={{ textDecoration: 'none', color: 'inherit', background: 'var(--ground)' }}>
                <span className={'icon-tile' + (f.alt ? ' alt' : '')} aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICONS[f.href.split('#')[1]]} />
                  </svg>
                </span>
                <h3 className="h3">{f.title}</h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{f.text}</p>
                <span style={{ color: 'var(--rasp)', fontWeight: 600, fontSize: 15 }}>Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="audit" className="section dark">
        <div className="wrap grid-2">
          <div className="stack" style={{ gap: 20 }}>
            <span className="eyebrow">Your weekly report</span>
            <h2 className="h2">See the difference between what you planned and what you really did.</h2>
            <p className="lead">Every week the app shows how your time was really spent, which days went best, and which tasks you keep putting off. Only from what you recorded, never guessed.</p>
            <Link href="/signup" className="btn light" style={{ alignSelf: 'flex-start' }}>
              Get my free weekly report
            </Link>
          </div>
          <div className="audit-card reveal">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="serif" style={{ fontSize: 22 }}>Weekly report</span>
              <span className="chip" style={{ border: '1px solid #8A5C96', color: '#FBE4EA' }}>Example data</span>
            </div>
            <div className="legend">
              <span><i style={{ background: '#8A5C96' }} />Planned hours</span>
              <span><i style={{ background: '#FFC93C' }} />Actual hours</span>
            </div>
            {AUDIT.map(([name, planned, actual]) => (
              <div key={name} className="stack" style={{ gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{name}</span>
                  <span style={{ color: '#FBE4EA' }}>{actual}h of {planned}h</span>
                </div>
                <div className="bar"><span style={{ width: (planned / 14) * 100 + '%', background: '#8A5C96' }} /></div>
                <div className="bar"><span style={{ width: (actual / 14) * 100 + '%', background: '#FFC93C' }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap stack-lg">
          <div className="stack" style={{ maxWidth: 640 }}>
            <span className="eyebrow">Pricing</span>
            <h2 className="h2">Start free. Grow into more.</h2>
            <p className="lead">Whatever plan you are on, what you have written stays yours. Downgrading never locks existing data.</p>
          </div>
          <PricingCards plans={plans} />
        </div>
      </section>

      <section className="section white">
        <div className="wrap narrow stack-lg">
          <h2 className="h2">Questions, answered plainly</h2>
          <FaqList faqs={faqs.slice(0, 4)} />
          <Link href="/faq" style={{ fontWeight: 600 }}>See all questions</Link>
        </div>
      </section>

      <Link href="/signup" className="mobile-cta">Start free — no card needed</Link>

      <section className="section">
        <div className="wrap">
          <div className="cta-band">
            <h2 className="h2" style={{ maxWidth: 720 }}>Take control of your 24 hours, starting today.</h2>
            <p style={{ margin: 0, fontSize: 18, maxWidth: 520 }}>Free to start. Plan your day in 5 minutes and check it at night in 2.</p>
            <Link href="/signup" className="btn dark" style={{ minHeight: 54, padding: '0 30px' }}>
              {settings.cta_label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
