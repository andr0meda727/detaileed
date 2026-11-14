import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/supabase', () => ({ default: { auth: { getSession: vi.fn() } } }));

const { resolveApiOrigin } = await import('@/app/api');

describe('resolveApiOrigin', () => {
  it('uses the configured origin', () => {
    expect(resolveApiOrigin('http://localhost:5174', false)).toBe('http://localhost:5174');
  });

  it('strips a trailing slash and an old-style /api suffix', () => {
    expect(resolveApiOrigin('https://api.detaileed.com/api/', true)).toBe('https://api.detaileed.com');
  });

  it('falls back to same origin in dev and the production api in prod', () => {
    expect(resolveApiOrigin('', false)).toBe('');
    expect(resolveApiOrigin(undefined, true)).toBe('https://api.detaileed.com');
  });
});
