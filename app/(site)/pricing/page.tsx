import type { Metadata } from 'next';
import PricingCards from '@/components/PricingCards';
import { getSiteContent } from '@/lib/content';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Pricing',
  description: `${SITE_NAME} plans: Free, Premium and Pro. Start free; downgrading never locks the data you already recorded.`,
  alternates: { canonical: '/pricing' },
};

export default async function PricingPage() {
  const { plans } = await getSiteContent();
  return (
    <section className="section">
      <div className="wrap stack-lg">
        <div className="stack" style={{ maxWidth: 680 }}>
          <span className="eyebrow">Pricing</span>
          <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,62px)' }}>Start free. Grow into more.</h1>
          <p className="lead">Every plan keeps your data private and exportable. If you ever downgrade, everything you recorded stays readable.</p>
        </div>
        <PricingCards plans={plans} />
        <p className="muted">Prices are in US dollars. Paid plans open once the payment provider is connected.</p>
      </div>
    </section>
  );
}
