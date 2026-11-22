import type { Faq } from '@/lib/content';

// Native <details> works without JavaScript, so search engines and AI tools read every answer.
export default function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="stack" style={{ gap: 12 }}>
      {faqs.map((f, i) => (
        <details key={f.id} className="faq" open={i === 0}>
          <summary>
            <h3 style={{ margin: 0, font: 'inherit' }}>{f.question}</h3>
          </summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
