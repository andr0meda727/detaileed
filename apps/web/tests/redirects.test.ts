import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';

const appDir = path.join(import.meta.dirname, '../src/app');

/** The page file for a path like `/studio/:id/book`, allowing for route groups such as `(profile)`. */
const pageExists = (route: string) => {
  const dir = path.join(appDir, ...route.split('/').map((s) => (s.startsWith(':') ? `[${s.slice(1)}]` : s)));
  return existsSync(path.join(dir, 'page.tsx'));
};

describe('redirects from the old Polish paths', async () => {
  const redirects = (await nextConfig.redirects?.()) ?? [];

  it('keeps the link from booking emails working', () => {
    expect(redirects).toContainEqual(
      expect.objectContaining({ source: '/konto/rezerwacje', destination: '/account/bookings', permanent: true }),
    );
  });

  it.each(redirects.map((r) => [r.source, r.destination]))('%s leads to an existing page (%s)', (_, destination) => {
    expect(pageExists(destination)).toBe(true);
  });
});
