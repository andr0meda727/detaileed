import type { Session } from '@supabase/supabase-js';
import supabase from '@/shared/lib/supabase';

const PASSWORD_LINK_TYPES = ['invite', 'recovery', 'signup'];

// Supabase email links land with `#...&type=invite|recovery|signup`. Read it when the app loads,
// before the Supabase client consumes the hash.
let passwordSetupPending = PASSWORD_LINK_TYPES.some((type) => window.location.hash.includes(`type=${type}`));

/** Current session; waits for Supabase to finish reading a session from the URL. */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** The user came from an invite/recovery link, or their account was created without a password. */
export function needsPasswordSetup(session: Session | null): boolean {
  return passwordSetupPending || session?.user.user_metadata?.needs_password === true;
}

export function clearPasswordSetup(): void {
  passwordSetupPending = false;
}

/** Calls `onChange` on every sign-in, sign-out and token refresh. Returns an unsubscribe function. */
export function subscribeToAuthChanges(onChange: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') passwordSetupPending = true;
    onChange();
  });
  return () => data.subscription.unsubscribe();
}

/** Only same-app paths are allowed as a post-login redirect (no `//evil.com`). */
export function safeRedirect(target: string | undefined): string {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}
