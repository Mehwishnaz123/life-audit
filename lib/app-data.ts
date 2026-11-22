import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { todayIn } from '@/lib/dates';

export type Area = { id: string; name: string; color: string; sort_order: number; archived_at: string | null };
export type Task = {
  id: string;
  title: string;
  area_id: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  status: 'todo' | 'done';
  completed_at: string | null;
  created_at: string;
};

/** Signed-in user, their profile and life areas. Sends visitors who are not signed in to the login page. */
export async function getAppContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: areas }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('life_areas').select('*').is('archived_at', null).order('sort_order'),
  ]);

  const timezone = profile?.timezone || 'UTC';
  return {
    supabase,
    user,
    profile,
    name: profile?.display_name || user.email?.split('@')[0] || 'there',
    isAdmin: profile?.role === 'admin',
    timezone,
    today: todayIn(timezone),
    areas: (areas || []) as Area[],
  };
}
