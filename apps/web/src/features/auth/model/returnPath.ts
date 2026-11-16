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
