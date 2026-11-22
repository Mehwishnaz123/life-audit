import { createServerClient } from '@supabase/ssr';
import { createClient as createPlainClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/site';

const url = () => SUPABASE_URL;
const key = () => SUPABASE_ANON_KEY;

/** Client tied to the signed-in visitor (reads their login cookie). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url(), key(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a page render, where cookies are read-only. The middleware refreshes them.
        }
      },
    },
  });
}

/** Anonymous client for public website content (no login needed). */
export function createPublicClient() {
  return createPlainClient(url(), key(), { auth: { persistSession: false } });
}
