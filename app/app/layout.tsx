import type { Metadata } from 'next';
import AppSidebar from '@/components/AppSidebar';
import NotConnected from '@/components/NotConnected';
import { SITE_NAME, isSupabaseConfigured } from '@/lib/site';
import { getAppContext } from '@/lib/app-data';

export const metadata: Metadata = { title: 'My dashboard', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <NotConnected />;
  const ctx = await getAppContext();
  return (
    <div className="app">
      <div aria-hidden="true" className="blob blob-b" style={{ opacity: 0.3 }} />
      <AppSidebar siteName={SITE_NAME} isAdmin={ctx.isAdmin} />
      <main className="main">{children}</main>
    </div>
  );
}
