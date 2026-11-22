import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="auth-card" style={{ margin: 0, textAlign: 'center', alignItems: 'center' }}>
        <h1 className="h2">Page not found</h1>
        <p className="muted" style={{ margin: 0 }}>That page does not exist.</p>
        <Link href="/" className="btn">Go to the home page</Link>
      </div>
    </main>
  );
}
