import { siteUrl } from '@/lib/site';

/**
 * A safe place to go back to after signing in: only a path on this site (`/studio/…`), never another origin
 * (`//evil.com`, `https://…`), so the `?next=` parameter can't be used to redirect people elsewhere.
 */
export function safeReturnPath(next: string | null | undefined, fallback = '/konto'): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
  return next;
}

/** The sign-in page with a way back to `path`. */
export const signInPath = (path: string) => `/logowanie?next=${encodeURIComponent(path)}`;

/** Where the sign-up confirmation link leads: /auth/callback signs the person in, then goes to `next`. */
export const confirmEmailRedirect = (next: string) => siteUrl(`/auth/callback?next=${encodeURIComponent(next)}`);

/** The page that sends the confirmation email again. */
export const confirmEmailPath = (email: string, next: string) =>
  `/potwierdz-email?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`;
