import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = { title: 'Privacy', description: `How ${SITE_NAME} treats your personal data, in plain language.`, alternates: { canonical: '/privacy' } };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="wrap narrow stack-lg prose">
        <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,58px)' }}>Privacy</h1>
        <p className="lead">Your life is personal. Here is, in plain words, what {SITE_NAME} keeps, why, and what control you have.</p>
        <p className="muted">Last updated: 22 November 2026</p>

        <h2>What we keep</h2>
        <ul>
          <li><strong>Your account:</strong> your email address, your display name and your settings (time zone, week start).</li>
          <li><strong>What you add:</strong> tasks, time blocks and what really happened, habits, goals, journal and gratitude entries, and your life areas.</li>
          <li>We do not ask for your phone number, address or payment card. We do not sell your data, and we do not show ads.</li>
        </ul>

        <h2>Who can see it</h2>
        <ul>
          <li>Only your account can read your records. The database itself blocks other users from seeing them.</li>
          <li>Your journal and reflections are never shown to search engines or other people.</li>
          <li>We only look at stored data if you ask us for help, or if the law requires it.</li>
        </ul>

        <h2>The AI Coach and AI Planner</h2>
        <p>When you use them, a short summary of your own records (for example your plans, habits and goals for the recent weeks) is sent to Google's Gemini AI service to write the answer. Your journal text is not included. If you do not use these features, nothing is sent.</p>

        <h2>Services we use</h2>
        <ul>
          <li><strong>Supabase</strong> stores your account and records in a secure database.</li>
          <li><strong>Netlify</strong> hosts the website.</li>
          <li><strong>Google</strong> (Gemini) powers the AI features, and Gmail sends account emails such as sign-up confirmation and password reset.</li>
        </ul>

        <h2>Your control</h2>
        <ul>
          <li>Download everything you recorded at any time from <strong>Settings → Export my data</strong>.</li>
          <li>Ask for your account and all your data to be deleted from <strong>Settings</strong>.</li>
          <li>Changing or ending a plan never locks the data you already recorded.</li>
        </ul>

        <h2>Cookies</h2>
        <p>We use only the cookies needed to keep you logged in. No advertising or tracking cookies.</p>

        <h2>Changes</h2>
        <p>If this page changes in an important way, we will tell you in the app before the change applies.</p>
      </div>
    </section>
  );
}
