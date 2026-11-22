import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = { title: 'Terms', description: `Terms of use for ${SITE_NAME}.`, alternates: { canonical: '/terms' } };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="wrap narrow stack-lg prose">
        <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,58px)' }}>Terms of use</h1>
        <p className="notice">[The full terms of service must be written and reviewed before launch.]</p>
      </div>
    </section>
  );
}
