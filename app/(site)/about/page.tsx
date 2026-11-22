import type { Metadata } from 'next';
import { getSiteContent } from '@/lib/content';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'About',
  description: `Who builds ${SITE_NAME}, why it exists and the principles it follows.`,
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const { settings } = await getSiteContent();
  return (
    <section className="section">
      <div className="wrap narrow stack-lg prose">
        <div className="stack">
          <span className="eyebrow">About</span>
          <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,62px)' }}>Why {SITE_NAME} exists</h1>
          <p className="lead">Most tools hold one corner of life. {SITE_NAME} is built to hold all of it, and to show you honestly how your time is really spent.</p>
        </div>
        <div>
          <h2>Who is building it</h2>
          <p><strong>{settings.founder_name}</strong></p>
          <p>{settings.founder_bio}</p>
          <h2>Principles</h2>
          <ul>
            <li>Insights come only from what you recorded. Nothing is invented.</li>
            <li>Nothing is marked complete for you.</li>
            <li>Your journal is private, and your data is exportable.</li>
            <li>A plan change never locks the data you already have.</li>
          </ul>
          {settings.contact_email?.includes('@') && (<><h2>Contact</h2><p><a href={'mailto:' + settings.contact_email}>{settings.contact_email}</a></p></>)}
        </div>
      </div>
    </section>
  );
}
