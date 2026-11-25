import { randomBytes } from 'node:crypto';
import { HttpError, noContent, redirect } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { newId } from '../store/ids.ts';
import { db } from '../store/store.ts';
import { toSupabaseUser, type AuthUser } from './accounts.ts';
import {
  createSession,
  pkceMatches,
  readAccessToken,
  readRefreshToken,
  signOut,
  type TokenClaims,
} from './sessions.ts';

/**
 * A fake Supabase Auth (GoTrue) under `/auth/v1`, enough for `@supabase/supabase-js` in the dashboard and
 * `@supabase/ssr` in the customer site. No emails are sent: links that Supabase would email (sign-up confirmation,
 * password reset) are printed to the mock's console instead.
 */

type Body = Record<string, unknown>;
const bodyOf = (req: MockRequest) => (req.body ?? {}) as Body;
const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** Supabase's error body: `error_code` is what the apps switch on, `msg` the English message. */
function authError(status: number, errorCode: string, msg: string, extra: Body = {}): HttpError {
  return new HttpError(status, { code: status, error_code: errorCode, msg, ...extra });
}

const invalidCredentials = () =>
  authError(400, 'invalid_credentials', 'Invalid login credentials', {
    error: 'invalid_grant',
    error_description: 'Invalid login credentials',
  });

const issuer = (req: MockRequest) => `${req.origin}/auth/v1`;
const findUser = (email: string) => db().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
const userById = (id: string) => db().users.find((u) => u.id === id);

/** The signed-in user of a request, from its `Authorization: Bearer <access token>`. */
export function bearerToken(req: MockRequest): string | null {
  const header = req.headers.authorization ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}

function requireSession(req: MockRequest): { claims: TokenClaims; user: AuthUser } {
  const token = bearerToken(req);
  if (!token) throw authError(401, 'no_authorization', 'This endpoint requires a valid Bearer token');
  const claims = readAccessToken(token);
  if (claims === 'signed_out')
    throw authError(403, 'session_not_found', 'Session from session_id claim in JWT does not exist');
  if (typeof claims === 'string') {
    throw authError(403, 'bad_jwt', `invalid JWT: unable to parse or verify signature, token is ${claims}`);
  }
  const user = userById(claims.sub);
  if (!user) throw authError(403, 'user_not_found', 'User from sub claim in JWT does not exist');
  return { claims, user };
}

function checkPassword(password: string) {
  if (password.length < 6) {
    throw authError(422, 'weak_password', 'Password should be at least 6 characters.', {
      weak_password: { reasons: ['length'], message: 'Password should be at least 6 characters.' },
    });
  }
}

function signIn(req: MockRequest, user: AuthUser, sessionId?: string) {
  user.lastSignInAt = new Date().toISOString();
  return createSession(user, issuer(req), sessionId);
}

// ---- Email links (printed, not sent) ----

interface EmailFlow {
  userId: string;
  type: 'signup' | 'recovery' | 'invite' | 'magiclink';
  redirectTo: string;
  /** PKCE clients (the customer site) get `?code=`; implicit clients (the dashboard) get the session in the hash. */
  codeChallenge: string | null;
  codeChallengeMethod: string;
}

const emailTokens = new Map<string, EmailFlow>();
const authCodes = new Map<string, EmailFlow>();

function printEmailLink(req: MockRequest, user: AuthUser, type: EmailFlow['type']) {
  const body = bodyOf(req);
  const options = (body.options ?? {}) as Body;
  const redirectTo =
    req.query.get('redirect_to') ||
    text(options.emailRedirectTo) ||
    text(options.redirectTo) ||
    'http://localhost:3011';
  const token = randomBytes(16).toString('hex');
  emailTokens.set(token, {
    userId: user.id,
    type,
    redirectTo,
    codeChallenge: text(body.code_challenge) || null,
    codeChallengeMethod: text(body.code_challenge_method) || 's256',
  });
  const link = `${req.origin}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;
  console.log(`[mock-api] email to ${user.email} (${type}): ${link}`);
}

/** The link in the email: like Supabase, it redirects to the app with a PKCE code or the session in the hash. */
function verify(req: MockRequest) {
  const flow = emailTokens.get(req.query.get('token') ?? '');
  const redirectTo = req.query.get('redirect_to') || flow?.redirectTo || 'http://localhost:3011';
  if (!flow) {
    const error = 'error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    return redirect(`${redirectTo}#${error}`);
  }
  emailTokens.delete(req.query.get('token') ?? '');
  const user = userById(flow.userId);
  if (!user) return redirect(`${redirectTo}#error=access_denied&error_code=user_not_found`);
  if (flow.codeChallenge) {
    const code = newId();
    authCodes.set(code, flow);
    return redirect(`${redirectTo}${redirectTo.includes('?') ? '&' : '?'}code=${code}`);
  }
  const session = signIn(req, user);
  const hash = new URLSearchParams({
    access_token: session.access_token,
    expires_at: String(session.expires_at),
    expires_in: String(session.expires_in),
    refresh_token: session.refresh_token,
    token_type: 'bearer',
    type: flow.type,
  });
  return redirect(`${redirectTo}#${hash}`);
}

// ---- Endpoints ----

function token(req: MockRequest) {
  const body = bodyOf(req);
  switch (req.query.get('grant_type')) {
    case 'password': {
      const user = findUser(text(body.email));
      if (!user || user.password === null || user.password !== text(body.password)) throw invalidCredentials();
      return signIn(req, user);
    }
    case 'refresh_token': {
      const refresh = readRefreshToken(text(body.refresh_token));
      const user = refresh && userById(refresh.sub);
      if (!refresh || !user) {
        throw authError(400, 'refresh_token_not_found', 'Invalid Refresh Token: Refresh Token Not Found', {
          error: 'invalid_grant',
          error_description: 'Invalid Refresh Token: Refresh Token Not Found',
        });
      }
      return createSession(user, issuer(req), refresh.sessionId);
    }
    case 'pkce': {
      const code = text(body.auth_code);
      const flow = authCodes.get(code);
      if (!flow) throw authError(404, 'flow_state_not_found', 'invalid flow state, no valid flow state found');
      if (!pkceMatches(text(body.code_verifier), flow.codeChallenge ?? '', flow.codeChallengeMethod)) {
        throw authError(400, 'bad_code_verifier', 'code challenge does not match previously saved code verifier');
      }
      authCodes.delete(code);
      const user = userById(flow.userId);
      if (!user) throw authError(404, 'user_not_found', 'User not found');
      return signIn(req, user);
    }
    default:
      throw authError(400, 'unsupported_grant_type', 'unsupported_grant_type', { error: 'unsupported_grant_type' });
  }
}

function signUp(req: MockRequest) {
  const body = bodyOf(req);
  const email = text(body.email).trim().toLowerCase();
  const password = text(body.password);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    throw authError(400, 'email_address_invalid', `Email address "${email}" is invalid`);
  }
  if (findUser(email)) throw authError(422, 'user_already_exists', 'User already registered');
  checkPassword(password);
  const data = (body.data ?? {}) as Body;
  const user: AuthUser = {
    id: newId(),
    email,
    password,
    firstName: text(data.first_name),
    lastName: text(data.last_name),
    createdAt: new Date().toISOString(),
    lastSignInAt: null,
    metadata: data,
  };
  db().users.push(user);
  // Confirmation is off in the mock: the new account is signed in straight away.
  return signIn(req, user);
}

function updateUser(req: MockRequest) {
  const { user } = requireSession(req);
  const body = bodyOf(req);
  if (typeof body.password === 'string') {
    checkPassword(body.password);
    if (body.password === user.password) {
      throw authError(422, 'same_password', 'New password should be different from the old password.');
    }
    user.password = body.password;
    delete user.metadata.needs_password;
  }
  if (body.data && typeof body.data === 'object') {
    const data = body.data as Body;
    user.metadata = { ...user.metadata, ...data };
    if (typeof data.first_name === 'string') user.firstName = data.first_name;
    if (typeof data.last_name === 'string') user.lastName = data.last_name;
  }
  return toSupabaseUser(user);
}

function logout(req: MockRequest) {
  const token = bearerToken(req);
  const claims = token ? readAccessToken(token) : 'invalid';
  if (typeof claims !== 'string') signOut(claims, req.query.get('scope') ?? 'global');
  return noContent();
}

function sendEmail(type: EmailFlow['type']) {
  return (req: MockRequest) => {
    const user = findUser(text(bodyOf(req).email));
    // Like Supabase, never reveal whether an account exists.
    if (user) printEmailLink(req, user, type);
    return {};
  };
}

const SETTINGS = {
  external: { email: true, phone: false, anonymous_users: false, google: false, apple: false, github: false },
  disable_signup: false,
  mailer_autoconfirm: true,
  phone_autoconfirm: false,
  sms_provider: '',
  saml_enabled: false,
};

export const supabaseRoutes: Route[] = [
  route('POST', '/auth/v1/token', token),
  route('GET', '/auth/v1/user', (req) => toSupabaseUser(requireSession(req).user)),
  route('PUT', '/auth/v1/user', updateUser),
  route('POST', '/auth/v1/logout', logout),
  route('POST', '/auth/v1/signup', signUp),
  route('POST', '/auth/v1/recover', sendEmail('recovery')),
  route('POST', '/auth/v1/resend', (req) =>
    sendEmail(text(bodyOf(req).type) === 'signup' ? 'signup' : 'magiclink')(req),
  ),
  // The mock never asks for a reauthentication code, so this only has to succeed.
  route('GET', '/auth/v1/reauthenticate', (req) => (requireSession(req), {})),
  route('GET', '/auth/v1/settings', () => SETTINGS),
  route('GET', '/auth/v1/verify', verify),
];
