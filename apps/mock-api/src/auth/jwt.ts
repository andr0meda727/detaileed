import { createHmac, timingSafeEqual } from 'node:crypto';

/** Mock-only signing key: the tokens only have to look like Supabase's and survive a restart of the mock. */
const SECRET = 'detaileed-mock-api-not-a-real-secret';

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signature = (data: string) => createHmac('sha256', SECRET).update(data).digest('base64url');

/** A signed HS256 JWT. */
export function signJwt(payload: Record<string, unknown>): string {
  const data = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  return `${data}.${signature(data)}`;
}

/** The payload of a token this mock signed, or null when it is malformed or tampered with (expiry not checked). */
export function verifyJwt(token: string): Record<string, unknown> | null {
  const [header, payload, sig] = token.split('.');
  if (!header || !payload || !sig) return null;
  const expected = Buffer.from(signature(`${header}.${payload}`));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}
