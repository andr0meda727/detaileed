import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL } from '@/shared/lib/site';

/** Supabase for server components, route handlers and actions, reading the session from the request cookies. */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components can't set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in user (verified with Supabase), or null. */
export async function getSignedInUser() {
  // Without Supabase settings (e.g. a local build) nobody can be signed in.
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const supabase = await getServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
