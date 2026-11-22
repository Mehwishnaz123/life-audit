import type { Metadata } from 'next';
import AppSidebar from '@/components/AppSidebar';
import NotConnected from '@/components/NotConnected';
import { SITE_NAME, isSupabaseConfigured } from '@/lib/site';
import { getAppContext } from '@/lib/app-data';

export const metadata: Metadata = { title: 'Website admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <NotConnected />;
  const ctx = await getAppContext();
  return (
    <div className="app">
      <AppSidebar siteName={SITE_NAME} isAdmin={ctx.isAdmin} />
      <main className="main">
        {ctx.isAdmin ? (
          children
        ) : (
          <div className="view">
            <h1 className="h2">This area is for the website owner</h1>
            <p className="muted" style={{ fontSize: 16 }}>Your account does not have admin access.</p>
          </div>
        )}
      </main>
    </div>
  );
}
