import Link from 'next/link';
import type { Metadata } from 'next';
import { signup } from '@/lib/actions/auth';
import FormMessage from '@/components/FormMessage';
import TimezoneInput from '@/components/TimezoneInput';

export const metadata: Metadata = { title: 'Create your account', robots: { index: false } };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <form action={signup} className="auth-card">
      <h1 className="h2" style={{ fontSize: 34 }}>Create your account</h1>
      <p className="muted" style={{ margin: 0 }}>Start with the free plan. No card needed.</p>
      <FormMessage error={sp.error} />
      <TimezoneInput />
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" type="text" className="input" autoComplete="name" required />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password (at least 8 characters)</label>
        <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
      </div>
      <button type="submit" className="btn block">Create account</button>
      <p className="muted" style={{ margin: 0 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  );
}
