import type { Metadata } from 'next';
import FaqList from '@/components/FaqList';
import JsonLd from '@/components/JsonLd';
import { getSiteContent } from '@/lib/content';
import { SITE_NAME } from '@/lib/site';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description: `Plain answers about ${SITE_NAME}: what it is, privacy, life areas, plans and the AI assistant.`,
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const { faqs } = await getSiteContent();
  return (
    <section className="section">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
        }}
      />
      <div className="wrap narrow stack-lg">
        <div className="stack">
          <span className="eyebrow">FAQ</span>
          <h1 className="h1" style={{ fontSize: 'clamp(38px,5vw,62px)' }}>Questions, answered plainly</h1>
        </div>
        <FaqList faqs={faqs} />
      </div>
    </section>
  );
}
