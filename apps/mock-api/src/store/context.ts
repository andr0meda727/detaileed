import type { AuthUser } from '../auth/accounts.ts';
import { readAccessToken } from '../auth/sessions.ts';
import { problem } from '../http.ts';
import type { MockRequest } from '../router.ts';
import { db } from './store.ts';
import type { Membership, Studio } from './types.ts';

/** The signed-in user of an API request (`Authorization: Bearer <Supabase access token>`). */
export function requireUser(req: MockRequest): AuthUser {
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? '');
  const claims = match ? readAccessToken(match[1].trim()) : 'invalid';
  const user = typeof claims === 'string' ? undefined : db().users.find((u) => u.id === claims.sub);
  if (!user) throw problem(401, 'UNAUTHORIZED', 'Zaloguj się ponownie, sesja wygasła.');
  return user;
}

export interface StaffContext {
  user: AuthUser;
  studio: Studio;
  member: Membership;
}

/** A staff request: the signed-in user works in the studio named by `X-Studio-Id`. */
export function requireStudio(req: MockRequest): StaffContext {
  const user = requireUser(req);
  const header = req.headers['x-studio-id'];
  const studioId = Array.isArray(header) ? header[0] : header;
  const studio = db().studios.find((s) => s.id === studioId);
  const member = db().memberships.find((m) => m.studioId === studioId && m.userId === user.id);
  if (!studio || !member) throw problem(403, 'STUDIO_ACCESS_DENIED', 'Nie masz dostępu do tego studia.');
  return { user, studio, member };
}

/** Settings only the owner (or a manager) may change. */
export function requireManager(req: MockRequest): StaffContext {
  const ctx = requireStudio(req);
  if (ctx.member.roleId === 3) throw problem(403, 'FORBIDDEN', 'Brak uprawnień do wykonania tej akcji.');
  return ctx;
}

/** Owner-only actions (team, studio details, public profile). */
export function requireOwner(req: MockRequest): StaffContext {
  const ctx = requireStudio(req);
  if (ctx.member.roleId !== 1) throw problem(403, 'FORBIDDEN', 'Tylko właściciel studia może to zmienić.');
  return ctx;
}
