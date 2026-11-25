import { createHash, randomBytes } from 'node:crypto';
import { newId } from '../store/ids.ts';
import { signJwt, verifyJwt } from './jwt.ts';
import { toSupabaseUser, type AuthUser } from './accounts.ts';

/** How long an access token lives, like Supabase's default. */
export const ACCESS_TOKEN_TTL_SECONDS = 3600;

/**
 * Tokens are signed and self-contained, so a restart of the mock (tsx watch) keeps everyone signed in. Only
 * sign-outs are remembered in memory; they are kept across `/__mock/reset` too.
 */
const revokedSessions = new Set<string>();
const sessionsByUser = new Map<string, Set<string>>();

export interface TokenClaims {
  sub: string;
  email: string;
  session_id: string;
  exp: number;
}

/** A Supabase session for the user: JWT access token with `exp`, `sub`, `email`, `role: authenticated`. */
export function createSession(user: AuthUser, issuer: string, sessionId: string = newId()) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ACCESS_TOKEN_TTL_SECONDS;
  const access_token = signJwt({
    iss: issuer,
    sub: user.id,
    aud: 'authenticated',
    exp,
    iat: now,
    email: user.email,
    phone: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { first_name: user.firstName, last_name: user.lastName, email: user.email, sub: user.id },
    role: 'authenticated',
    aal: 'aal1',
    amr: [{ method: 'password', timestamp: now }],
    session_id: sessionId,
    is_anonymous: false,
  });
  const refresh_token = signJwt({
    typ: 'refresh',
    sub: user.id,
    session_id: sessionId,
    nonce: randomBytes(6).toString('hex'),
  });
  let sessions = sessionsByUser.get(user.id);
  if (!sessions) sessionsByUser.set(user.id, (sessions = new Set()));
  sessions.add(sessionId);
  return {
    access_token,
    token_type: 'bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    expires_at: exp,
    refresh_token,
    user: toSupabaseUser(user),
  };
}

/** Why a token was refused, in Supabase's words. */
export type TokenFailure = 'invalid' | 'expired' | 'signed_out';

/** The claims of a valid, unexpired access token of a live session. */
export function readAccessToken(token: string): TokenClaims | TokenFailure {
  const claims = verifyJwt(token);
  if (!claims || claims.typ === 'refresh' || typeof claims.sub !== 'string') return 'invalid';
  if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return 'expired';
  if (revokedSessions.has(String(claims.session_id))) return 'signed_out';
  return claims as unknown as TokenClaims;
}

/** The user id and session of a refresh token, or null when it's unknown or its session was signed out. */
export function readRefreshToken(token: string): { sub: string; sessionId: string } | null {
  const claims = verifyJwt(token);
  if (!claims || claims.typ !== 'refresh' || typeof claims.sub !== 'string') return null;
  const sessionId = String(claims.session_id);
  if (revokedSessions.has(sessionId)) return null;
  return { sub: claims.sub, sessionId };
}

/** Signs out one session (`local`), every session of the user (`global`) or all but this one (`others`). */
export function signOut(claims: TokenClaims, scope: string) {
  const sessions = sessionsByUser.get(claims.sub) ?? new Set<string>();
  if (scope === 'local') {
    revokedSessions.add(claims.session_id);
    return;
  }
  for (const id of sessions) if (scope === 'global' || id !== claims.session_id) revokedSessions.add(id);
  if (scope === 'global') revokedSessions.add(claims.session_id);
}

/** PKCE: `S256` hashes the verifier; `plain` compares it as is. */
export function pkceMatches(verifier: string, challenge: string, method: string): boolean {
  const computed =
    method.toLowerCase() === 's256' ? createHash('sha256').update(verifier).digest('base64url') : verifier;
  return computed === challenge;
}
