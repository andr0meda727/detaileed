import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { routes } from '../src/routes/index.ts';
import { OWNER, call, ownerStudios, signIn, startMock, type Mock } from './helpers.ts';

const spec = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../../packages/api-client/openapi.json'), 'utf8'),
) as {
  paths: Record<string, Record<string, unknown>>;
};
const operations = Object.entries(spec.paths).flatMap(([path, ops]) =>
  Object.keys(ops).map((method) => ({ method: method.toUpperCase(), path })),
);

let mock: Mock;
let token: string;
let studioId: string;
beforeAll(async () => {
  mock = await startMock();
  token = await signIn(mock, OWNER);
  studioId = (await ownerStudios(mock, token)).full;
});
afterAll(() => mock.close());

describe('the openapi spec', () => {
  it('has operations to check', () => {
    expect(operations.length).toBeGreaterThan(80);
  });

  it.each(operations)('$method $path has a handler', ({ method, path }) => {
    expect(routes.some((r) => r.method === method && r.path === path)).toBe(true);
  });

  it.each(operations)('$method $path answers without a server error', async ({ method, path }) => {
    const url = path.replace(/\{(\w+)\}/g, (_, name: string) =>
      name === 'date' ? '2030-01-01' : name === 'token' ? 'demo-invitation' : '00000000-0000-4000-8000-000000000000',
    );
    const res = await call<{ code?: string }>(mock, token, method, url, {
      studioId,
      body: method === 'GET' || method === 'DELETE' ? undefined : {},
    });
    expect(res.status).toBeLessThan(500);
    expect(res.body?.code).not.toBe('MOCK_NOT_IMPLEMENTED');
  });
});
