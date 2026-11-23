import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startMock } from './helpers.ts';

let mock: Awaited<ReturnType<typeof startMock>>;
beforeAll(async () => (mock = await startMock()));
afterAll(() => mock.close());

describe('mock server', () => {
  it('answers a preflight from a local dev server', async () => {
    const res = await fetch(`${mock.url}/api/Clients`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3010',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,x-studio-id',
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3010');
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
    expect(res.headers.get('access-control-allow-headers')).toBe('authorization,x-studio-id');
  });

  it('does not allow other origins', async () => {
    const res = await fetch(`${mock.url}/`, { headers: { Origin: 'https://example.com' } });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('answers unknown paths with problem details', async () => {
    const res = await fetch(`${mock.url}/api/nothing-here`);
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ status: 404, code: 'MOCK_NOT_IMPLEMENTED' });
  });

  it('resets the data', async () => {
    const res = await fetch(`${mock.url}/__mock/reset`, { method: 'POST' });
    expect(res.status).toBe(204);
  });
});
