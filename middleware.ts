import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/site';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPrivate = path === '/app' || path.startsWith('/app/') || path === '/admin' || path.startsWith('/admin/');
  if (!user && isPrivate) {
    const to = request.nextUrl.clone();
    to.pathname = '/login';
    to.search = '?next=' + encodeURIComponent(path);
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
