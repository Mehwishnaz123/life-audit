import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export default function SiteFooter({ contactEmail }: { contactEmail: string }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <span className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{SITE_NAME}</span>
          <p className="muted" style={{ margin: 0 }}>A personal command center for your whole life.</p>
        </div>
        <nav aria-label="Footer" className="footer-links">
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p className="muted" style={{ margin: 0 }}>
          Contact: {contactEmail.includes('@') ? <a href={'mailto:' + contactEmail}>{contactEmail}</a> : contactEmail}
          <br />© {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
}
