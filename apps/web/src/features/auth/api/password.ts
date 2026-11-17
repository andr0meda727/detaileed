import type { AuthError } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';

/**
 * Sets the signed-in customer's password, with the emailed `nonce` when Supabase asked to reauthenticate. Other
 * devices are then signed out, so a changed password also locks out whoever knew the old one.
 */
export async function setPassword(password: string, nonce?: string): Promise<AuthError | null> {
  const auth = getSupabase().auth;
  const { error } = await auth.updateUser(nonce ? { password, nonce } : { password });
  if (error) return error;
  // Best effort: the password is already changed, so a failure here isn't the customer's problem
  await auth.signOut({ scope: 'others' }).catch(() => undefined);
  return null;
}
