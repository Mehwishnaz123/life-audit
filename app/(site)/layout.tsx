import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { getSiteContent } from '@/lib/content';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getSiteContent();
  return (
    <div className="site">
      <div aria-hidden="true" className="blob blob-a" />
      <div aria-hidden="true" className="blob blob-b" />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter contactEmail={settings.contact_email} />
    </div>
  );
}
