import Link from 'next/link';
import type { Metadata } from 'next';
import { requestPasswordReset } from '@/lib/actions/auth';
import FormMessage from '@/components/FormMessage';

export const metadata: Metadata = { title: 'Reset your password', robots: { index: false } };

export default async function ForgotPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const sp = await searchParams;
  return (
    <form action={requestPasswordReset} className="auth-card">
      <h1 className="h2" style={{ fontSize: 34 }}>Forgot your password?</h1>
      <p className="muted" style={{ margin: 0 }}>Enter your email and we will send you a link to choose a new one.</p>
      <FormMessage error={sp.error} message={sp.message} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <button type="submit" className="btn block">Send reset link</button>
      <Link href="/login">Back to log in</Link>
    </form>
  );
}
