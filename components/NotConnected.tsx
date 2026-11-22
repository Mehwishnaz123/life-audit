import Link from 'next/link';

export default function NotConnected() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="auth-card" style={{ margin: 0 }}>
        <h1 className="h2" style={{ fontSize: 30 }}>The database is not connected yet</h1>
        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>
          The dashboard and admin panel save real data, so they need Supabase. Add the two Supabase values to the <code>.env.local</code> file, then restart the website.
        </p>
        <Link href="/" className="btn">Back to the website</Link>
      </div>
    </main>
  );
}
