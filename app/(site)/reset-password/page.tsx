import type { Metadata } from 'next';
import { updatePassword } from '@/lib/actions/auth';
import FormMessage from '@/components/FormMessage';

export const metadata: Metadata = { title: 'Choose a new password', robots: { index: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <form action={updatePassword} className="auth-card">
      <h1 className="h2" style={{ fontSize: 34 }}>Choose a new password</h1>
      <FormMessage error={sp.error} />
      <div className="field">
        <label htmlFor="password">New password (at least 8 characters)</label>
        <input id="password" name="password" type="password" className="input" autoComplete="new-password" minLength={8} required />
      </div>
      <button type="submit" className="btn block">Save new password</button>
    </form>
  );
}
