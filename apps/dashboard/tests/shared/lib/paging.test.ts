import { describe, expect, it, vi } from 'vitest';
import { fetchAllPages } from '@/shared/lib/paging';

describe('fetchAllPages', () => {
  it('loads every page in order', async () => {
    const fetchPage = vi.fn(async (page: number) => ({ items: [page * 10, page * 10 + 1], totalPages: '3' }));
    expect(await fetchAllPages(fetchPage)).toEqual([10, 11, 20, 21, 30, 31]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it('stops at maxPages and handles a single page', async () => {
    const many = vi.fn(async () => ({ items: [1], totalPages: 500 }));
    expect(await fetchAllPages(many, 4)).toHaveLength(4);
    expect(await fetchAllPages(async () => ({ items: ['only'] }))).toEqual(['only']);
  });
});
