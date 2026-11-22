import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = { title: 'Terms', description: `Terms of use for ${SITE_NAME}, in plain language.`, alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap narrow stack-lg prose">
        <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,58px)' }}>Terms of use</h1>
        <p className="lead">The simple rules for using {SITE_NAME}.</p>
        <p className="muted">Last updated: 22 November 2026</p>

        <h2>Using {SITE_NAME}</h2>
        <ul>
          <li>You need an account with a real email address. Keep your password safe; you are responsible for what happens in your account.</li>
          <li>Use the app for your own planning and reflection. Do not try to break it, overload it, or access other people's accounts.</li>
        </ul>

        <h2>Early access</h2>
        <ul>
          <li>{SITE_NAME} is in early access. Every feature, including Premium and Pro, is free for now.</li>
          <li>When paid plans start, we will tell you before anything changes. You will never be charged without choosing a paid plan yourself.</li>
          <li>Because the app is new, features may change, and there may sometimes be errors or short outages. We do our best to keep your data safe and the app working.</li>
        </ul>

        <h2>Your content</h2>
        <ul>
          <li>What you write and record belongs to you. We only store and process it so the app can work for you.</li>
          <li>You can export your data or ask for your account to be deleted at any time.</li>
        </ul>

        <h2>AI features</h2>
        <p>The AI Coach and AI Planner give suggestions based on what you recorded. They can be wrong, so use your own judgement. They are not medical, legal or financial advice.</p>

        <h2>Ending your account</h2>
        <p>You can stop using {SITE_NAME} and ask for deletion at any time. We may suspend accounts that misuse the service or harm other people.</p>

        <h2>Changes</h2>
        <p>We may update these terms as the app grows. If the change is important, we will tell you in the app first.</p>
      </div>
    </section>
  );
}
