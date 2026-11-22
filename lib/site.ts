export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Life Audit';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const SITE_DESCRIPTION =
  'An all-in-one personal life planner: goals, tasks, habits, journal and a Life Audit that compares the day you planned with the day you lived.';

// Public project address and public (anon) key. Both are safe to ship to browsers:
// the database security rules decide what each signed-in user can read or change.
// Values in .env.local or the hosting settings override these.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbikimuciltcplsrzrnj.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iaWtpbXVjaWx0Y3Bsc3J6cm5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxNzEzMjMsImV4cCI6MjExMDc0NzMyM30.gzZd3GEbDFUb5LxBPbYtMH-xdrUYPU72NbWQ3O3bBPE';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
