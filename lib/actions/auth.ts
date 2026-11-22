'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL, isSupabaseConfigured } from '@/lib/site';

const NOT_READY = 'Accounts are not switched on yet: the database still needs to be connected.';
const back = (path: string, key: 'error' | 'message', text: string, extra = '') =>
  redirect(`${path}?${key}=${encodeURIComponent(text)}${extra}`);
const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === 'string' ? v : '';
  return s.startsWith('/') && !s.startsWith('//') ? s : '/app';
};

export async function login(formData: FormData) {
  if (!isSupabaseConfigured()) back('/login', 'error', NOT_READY);
  const next = safeNext(formData.get('next'));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || ''),
  });
  if (error) back('/login', 'error', error.message, '&next=' + encodeURIComponent(next));
  redirect(next);
}

export async function signup(formData: FormData) {
  if (!isSupabaseConfigured()) back('/signup', 'error', NOT_READY);
  const password = String(formData.get('password') || '');
  if (password.length < 8) back('/signup', 'error', 'Please use a password of at least 8 characters.');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get('email') || '').trim(),
    password,
    options: {
      emailRedirectTo: `${SITE_URL}/auth/callback?next=/app`,
      data: {
        display_name: String(formData.get('name') || '').trim(),
        timezone: String(formData.get('timezone') || 'UTC'),
      },
    },
  });
  if (error) back('/signup', 'error', error.message);
  if (data.session) redirect('/app');
  back('/login', 'message', 'Account created. Please open the confirmation email we sent you, then log in.');
}

export async function requestPasswordReset(formData: FormData) {
  if (!isSupabaseConfigured()) back('/forgot-password', 'error', NOT_READY);
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(formData.get('email') || '').trim(), {
    redirectTo: `${SITE_URL}/auth/callback?next=/reset-password`,
  });
  // Same message either way, so nobody can test which emails have accounts.
  back('/forgot-password', 'message', 'If that email has an account, a reset link is on its way.');
}

export async function updatePassword(formData: FormData) {
  if (!isSupabaseConfigured()) back('/reset-password', 'error', NOT_READY);
  const password = String(formData.get('password') || '');
  if (password.length < 8) back('/reset-password', 'error', 'Please use a password of at least 8 characters.');
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) back('/reset-password', 'error', error.message);
  redirect('/app');
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/');
}
