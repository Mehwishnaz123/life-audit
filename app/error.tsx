'use client';
import { useEffect } from 'react';
import Link from 'next/link';

/** Friendly error screen. If the page is simply out of date (we published an update), reload it automatically. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const outdated = /Server Action|Failed to find|ChunkLoadError|Loading chunk/i.test(String(error?.message || error?.name || ''));

  useEffect(() => {
    if (!outdated) return;
    try {
      if (sessionStorage.getItem('la-reloaded') !== '1') {
        sessionStorage.setItem('la-reloaded', '1');
        window.location.reload();
        return;
      }
    } catch {}
  }, [outdated]);

  return (
    <main className="container" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div className="stack" style={{ gap: 14, maxWidth: 460, alignItems: 'center' }}>
        <div className="chat-orb" aria-hidden="true" />
        <h1 className="h2" style={{ fontSize: 32 }}>{outdated ? 'Life Audit was just updated' : 'Something went wrong'}</h1>
        <p className="muted" style={{ margin: 0 }}>
          {outdated ? 'This page was opened before our latest update. Reload it and try again. Nothing you saved is lost.' : 'Sorry about that. Please try again. If it keeps happening, reload the page.'}
        </p>
        <div className="row" style={{ gap: 10, justifyContent: 'center' }}>
          <button className="btn" onClick={() => { try { sessionStorage.removeItem('la-reloaded'); } catch {} window.location.reload(); }}>Reload page</button>
          {!outdated && <button className="btn ghost" onClick={() => reset()}>Try again</button>}
          <Link href="/" className="btn ghost">Home</Link>
        </div>
      </div>
    </main>
  );
}
