import { validationProblem } from '../http.ts';

/** The API's paged envelope for `?Page=&PageSize=` (default 1 and 20, at most 100) or `?Skip=`. */
export function paged<T>(items: T[], query: URLSearchParams) {
  const pageSize = Number(query.get('PageSize') ?? query.get('pageSize') ?? 20);
  const page = Number(query.get('Page') ?? query.get('page') ?? 1);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw validationProblem({ PageSize: ['Rozmiar strony musi być między 1 a 100.'] });
  }
  if (!Number.isInteger(page) || page < 1) throw validationProblem({ Page: ['Numer strony musi być dodatni.'] });
  const skipParam = query.get('Skip') ?? query.get('skip');
  const skip = skipParam !== null ? Number(skipParam) : (page - 1) * pageSize;
  return {
    items: items.slice(skip, skip + pageSize),
    page,
    pageSize,
    totalCount: items.length,
    totalPages: Math.ceil(items.length / pageSize),
  };
}

/** A case-insensitive "contains" over several fields. */
export function matches(search: string | null, ...fields: (string | null | undefined)[]): boolean {
  if (!search?.trim()) return true;
  const needle = search.trim().toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

/** Polish alphabetical order. */
export const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, 'pl');
