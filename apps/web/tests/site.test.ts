import { describe, expect, it } from 'vitest';
import { siteUrl } from '@/lib/site';

describe('siteUrl', () => {
  it('joins the origin and a path', () => {
    expect(siteUrl('/studio/s1')).toBe('https://detaileed.com/studio/s1');
    expect(siteUrl('account')).toBe('https://detaileed.com/account');
  });
});
