import Link from 'next/link';
import type { Plan } from '@/lib/content';

export default function PricingCards({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid" style={{ alignItems: 'stretch' }}>
      {plans.map((p) => (
        <article key={p.id} className={'card plan' + (p.highlighted ? ' featured' : '')}>
          {p.highlighted && <span className="ribbon">Most complete</span>}
          <h3 className="h3">{p.name}</h3>
          <span className="plan-price">
            {p.price_label} <small>{p.period}</small>
          </span>
          <p className="muted" style={{ margin: 0 }}>{p.tagline}</p>
          <ul>
            {(p.features || []).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {p.id === 'free' ? (
            <Link href="/signup" className="btn" style={{ marginTop: 8 }}>
              Start free now
            </Link>
          ) : (
            <span className="btn" aria-disabled="true" style={{ marginTop: 8, opacity: 0.85, cursor: 'default', background: p.highlighted ? 'var(--yellow)' : 'var(--peach)', boxShadow: 'none', transform: 'none' }}>
              Coming soon
            </span>
          )}
        </article>
      ))}
    </div>
  );
}
