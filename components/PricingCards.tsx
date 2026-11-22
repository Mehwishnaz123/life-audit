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
            <>
              <p className="early-note">🎉 <b>Free during early access.</b> Every {p.name} feature that's ready is unlocked for you now. Paid plans start later, and you'll be told before anything changes.</p>
              <Link href="/signup" className={'btn' + (p.highlighted ? '' : ' dark')} style={{ marginTop: 4 }}>
                Try {p.name} free
              </Link>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
