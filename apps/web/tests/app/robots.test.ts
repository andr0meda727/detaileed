import { readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';

const appDir = path.join(import.meta.dirname, '../../src/app');
/** The top-level URL segments of a route group, e.g. `(auth)` → `/sign-in`, `/auth`. */
const segmentsOf = (group: string) =>
  readdirSync(path.join(appDir, '(site)', group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `/${entry.name}`);

describe('robots.txt', () => {
  const rules = robots().rules;
  const disallow = (Array.isArray(rules) ? rules[0] : rules).disallow as string[];
  const blocked = (segment: string) => disallow.some((rule) => rule === segment || rule.startsWith(`${segment}/`));

  it.each(segmentsOf('(auth)'))('keeps the sign-in page %s out of search engines', (segment) => {
    expect(blocked(segment)).toBe(true);
  });

  it('keeps the account and the booking request out of search engines', () => {
    expect(disallow).toEqual(expect.arrayContaining(['/account', '/studio/*/book']));
  });
});
