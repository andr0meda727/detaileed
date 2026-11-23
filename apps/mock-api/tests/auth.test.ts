import { createClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { CUSTOMER, OWNER, call, startMock, type Mock } from './helpers.ts';

let mock: Mock;
beforeAll(async () => (mock = await startMock()));
afterAll(() => mock.close());

/** The real Supabase client, as the apps use it (implicit flow like the dashboard, or PKCE like the site). */
const supabase = (flowType: 'implicit' | 'pkce' = 'implicit') =>
  createClient(mock.url, 'mock-publishable-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType },
  });

describe('fake supabase sign-in', () => {
  it('signs a demo account in with a JWT-shaped token that the API accepts', async () => {
    const client = supabase();
    const { data, error } = await client.auth.signInWithPassword({ email: OWNER, password: 'demo1234' });
    expect(error).toBeNull();
    const token = data.session!.access_token;
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    expect(claims).toMatchObject({ email: OWNER, role: 'authenticated', aud: 'authenticated' });
    expect(claims.exp).toBeGreaterThan(Date.now() / 1000);

    const { data: user } = await client.auth.getUser();
    expect(user.user?.email).toBe(OWNER);
    const studios = await call<unknown[]>(mock, token, 'GET', '/api/Studios/my');
    expect(studios.status).toBe(200);
    expect(studios.body).toHaveLength(2);
  });

  it('refuses a wrong password with the Supabase error code', async () => {
    const { data, error } = await supabase().auth.signInWithPassword({ email: OWNER, password: 'wrong' });
    expect(data.session).toBeNull();
    expect(error?.code).toBe('invalid_credentials');
  });

  it('refreshes a session and signs out', async () => {
    const client = supabase();
    await client.auth.signInWithPassword({ email: CUSTOMER, password: 'demo1234' });
    const { data, error } = await client.auth.refreshSession();
    expect(error).toBeNull();
    expect(data.session?.user.email).toBe(CUSTOMER);
    const refreshToken = data.session!.refresh_token;

    await client.auth.signOut();
    const again = await call(mock, null, 'POST', '/auth/v1/token?grant_type=refresh_token', {
      body: { refresh_token: refreshToken },
    });
    expect(again.status).toBe(400);
    expect(again.body).toMatchObject({ error_code: 'refresh_token_not_found' });
  });

  it('signs a new customer up and lets them change the password', async () => {
    const client = supabase('pkce');
    const email = `nowy.${Date.now()}@example.com`;
    const { data, error } = await client.auth.signUp({
      email,
      password: 'Haslo1234',
      options: { data: { first_name: 'Ola', last_name: 'Nowa' } },
    });
    expect(error).toBeNull();
    expect(data.session?.user.user_metadata.first_name).toBe('Ola');

    const same = await client.auth.updateUser({ password: 'Haslo1234' });
    expect(same.error?.code).toBe('same_password');
    const changed = await client.auth.updateUser({ password: 'NoweHaslo1' });
    expect(changed.error).toBeNull();
    expect((await supabase().auth.signInWithPassword({ email, password: 'NoweHaslo1' })).error).toBeNull();

    const twice = await supabase().auth.signUp({ email, password: 'Haslo1234' });
    expect(twice.error?.code).toBe('user_already_exists');
  });

  it('completes a password reset link with the PKCE code exchange', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const client = supabase('pkce');
    const { error } = await client.auth.resetPasswordForEmail(CUSTOMER, {
      redirectTo: 'http://localhost:3011/auth/callback?next=/reset-password',
    });
    expect(error).toBeNull();
    const link = String(log.mock.calls.at(-1)?.[0]).match(/https?:\/\/\S+/)![0];
    log.mockRestore();

    const verify = await fetch(link, { redirect: 'manual' });
    expect(verify.status).toBe(303);
    const code = new URL(verify.headers.get('location')!).searchParams.get('code')!;
    const { data, error: exchangeError } = await client.auth.exchangeCodeForSession(code);
    expect(exchangeError).toBeNull();
    expect(data.session?.user.email).toBe(CUSTOMER);
    const reused = await client.auth.exchangeCodeForSession(code);
    expect(reused.error).not.toBeNull();
  });

  it('answers the API without a valid token with 401', async () => {
    const res = await call(mock, 'not-a-token', 'GET', '/api/me/profile');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
