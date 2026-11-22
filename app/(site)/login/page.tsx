import Link from 'next/link';
import type { Metadata } from 'next';
import { login } from '@/lib/actions/auth';
import FormMessage from '@/components/FormMessage';

export const metadata: Metadata = { title: 'Log in', robots: { index: false } };

type SP = Promise<{ error?: string; message?: string; next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <form action={login} className="auth-card">
      <h1 className="h2" style={{ fontSize: 34 }}>Log in</h1>
      <p className="muted" style={{ margin: 0 }}>Welcome back.</p>
      <FormMessage error={sp.error} message={sp.message} />
      <input type="hidden" name="next" value={sp.next || '/app'} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      <button type="submit" className="btn block">Log in</button>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Link href="/signup">Create an account</Link>
        <Link href="/forgot-password">Forgot password?</Link>
      </div>
    </form>
  );
}
