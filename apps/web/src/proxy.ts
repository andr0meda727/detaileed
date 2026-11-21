import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL } from '@/shared/lib/site';

/**
 * Refreshes the Supabase session on every page request and writes the new cookies to the response, so server
 * components always see a valid session. It doesn't guard pages; the account layout does that.
 */
export async function proxy(request: NextRequest) {
  // Without Supabase settings (e.g. a local build) there is no session to refresh.
  if (!SUPABASE_URL || !SUPABASE_KEY) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Touching the user refreshes an expired access token.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Pages only: not static files, images or the metadata routes.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
