import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createMockServer } from '../src/app.ts';

export interface Mock {
  url: string;
  close: () => Promise<void>;
}

/** Starts the mock on a free port; call `close()` after the tests. */
export async function startMock(): Promise<Mock> {
  const server: Server = createMockServer();
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

export const OWNER = 'wlasciciel@demo.detaileed.com';
export const EMPLOYEE = 'pracownik@demo.detaileed.com';
export const CUSTOMER = 'klient@demo.detaileed.com';

/** An access token for a demo account (password `demo1234`). */
export async function signIn(mock: Mock, email: string): Promise<string> {
  const res = await fetch(`${mock.url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'demo1234' }),
  });
  const body = (await res.json()) as { access_token: string };
  return body.access_token;
}

/** Calls the API as the signed-in user, in a studio when given; resolves with status and parsed body. */
export async function call<T = unknown>(
  mock: Mock,
  token: string | null,
  method: string,
  path: string,
  options: { studioId?: string; body?: unknown } = {},
): Promise<{ status: number; body: T }> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.studioId) headers['X-Studio-Id'] = options.studioId;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${mock.url}${path}`, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await res.text();
  return { status: res.status, body: (text ? JSON.parse(text) : undefined) as T };
}

/** The demo owner's studios: the busy one first, then the empty one. */
export async function ownerStudios(mock: Mock, token: string) {
  const { body } = await call<{ studioId: string; name: string }[]>(mock, token, 'GET', '/api/Studios/my');
  return { full: body[0].studioId, empty: body[1].studioId };
}
