import Link from 'next/link';
import BrandMark from './BrandMark';
import NavLinks from './NavLinks';
import { SITE_NAME, isSupabaseConfigured } from '@/lib/site';
import { createClient } from '@/lib/supabase/server';

export default async function SiteHeader() {
  let signedIn = false;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      signedIn = !!data.user;
    } catch {
      signedIn = false;
    }
  }
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <BrandMark />
          <span>{SITE_NAME}</span>
        </Link>
        <NavLinks signedIn={signedIn} />
      </div>
    </header>
  );
}
