'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
  { href: '/about', label: 'About' },
];

export default function NavLinks({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Main" className="nav">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined}>
          {l.label}
        </Link>
      ))}
      {signedIn ? (
        <Link href="/app" className="btn small dark">
          Open my dashboard
        </Link>
      ) : (
        <>
          <Link href="/login" aria-current={path === '/login' ? 'page' : undefined}>
            Log in
          </Link>
          <Link href="/signup" className="btn small dark">
            Sign up free
          </Link>
        </>
      )}
    </nav>
  );
}
