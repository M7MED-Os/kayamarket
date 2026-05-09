import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { resolveStoreSlug } from '@/lib/tenant/resolve';

export async function proxy(request: NextRequest) {
  // 1. Auth handling (lightweight only) - refresh Supabase session
  let supabaseResponse = await updateSession(request);

  // 2. Extract store slug using pure string logic
  const slug = resolveStoreSlug(request.nextUrl.hostname, request.nextUrl.searchParams);

  // 3. Set headers ONLY (NO DB)
  if (slug) {
    supabaseResponse.headers.set('x-store-slug', slug);
  }

  // 4. Route protection (lightweight session check only)
  // We need a lightweight client just to check if the session exists in the cookie.
  // We DO NOT query the database here.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          if (slug) {
            supabaseResponse.headers.set('x-store-slug', slug);
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (
    (request.nextUrl.pathname.startsWith('/admin') ||
     request.nextUrl.pathname.startsWith('/super-admin')) &&
    !user &&
    request.nextUrl.pathname !== '/login'
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
