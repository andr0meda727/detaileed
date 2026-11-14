/** A page of a paged list (`?page=&pageSize=`), as the API returns it. Counts may arrive as strings. */
export interface PageOf<T> {
  items: T[];
  totalPages?: number | string;
}

/** The API's largest page size. */
export const MAX_PAGE_SIZE = 100;

/**
 * Loads every page of a paged list. Screens that compute totals or calendars over the whole list use this
 * until they get server-side filtering; `maxPages` keeps a runaway list from flooding the API.
 */
export async function fetchAllPages<T>(fetchPage: (page: number) => Promise<PageOf<T>>, maxPages = 20): Promise<T[]> {
  const first = await fetchPage(1);
  const totalPages = Math.min(Number(first.totalPages ?? 1), maxPages);
  const rest = await Promise.all(Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => fetchPage(i + 2)));
  return [first, ...rest].flatMap((page) => page.items);
}
