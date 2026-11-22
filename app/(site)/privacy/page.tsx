import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy', description: `How ${SITE_NAME} treats your personal data.`, alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="wrap narrow stack-lg prose">
        <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,58px)' }}>Privacy</h1>
        <p className="notice">[The full legal privacy policy must be written and reviewed before launch. The points below are the promises it will be built on.]</p>
        <ul>
          <li>Your goals, tasks, habits and journal are visible only to your account. This is enforced by the database itself.</li>
          <li>Journals and reflections are never shown to search engines.</li>
          <li>You can export your data and ask for your account to be deleted.</li>
          <li>Downgrading a plan never locks data you already recorded.</li>
        </ul>
      </div>
    </section>
  );
}
