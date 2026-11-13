/**
 * HTTP layer shared by every app. It knows nothing about Supabase or React:
 * the app registers how to get the token and the current studio via `configureApiClient`.
 * Works in the browser and on a server (e.g. Next.js), as long as `fetch` exists.
 */

export interface ApiClientConfig {
  /** API origin, e.g. `https://api.detaileed.com`. Paths already start with `/api`. Empty = same origin. */
  baseUrl: string;
  /** Supabase access token of the signed-in user, or null for anonymous calls. */
  getToken?: () => Promise<string | null> | string | null;
  /** Studio the staff endpoints should work in (sent as `X-Studio-Id`). */
  getStudioId?: () => string | null;
}

let config: ApiClientConfig = { baseUrl: '' };

export function configureApiClient(next: ApiClientConfig): void {
  config = { ...next, baseUrl: next.baseUrl.replace(/\/+$/, '') };
}

/** RFC 7807 problem details as the API returns them. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Stable machine-readable error code, e.g. `BOOKING_NOT_FOUND`. Switch on this, not on texts. */
  code?: string;
  /** Validation failures: request property path (`Name`, `Vehicle.LicensePlate`) to messages. */
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly detail?: string;
  readonly errors?: Record<string, string[]>;
  /** Raw parsed body (problem details), or the text body when it is not JSON. */
  readonly data?: ProblemDetails | string;

  constructor(status: number, data?: ProblemDetails | string) {
    const problem = typeof data === 'object' ? data : undefined;
    const text = typeof data === 'string' && data ? data : undefined;
    super(problem?.detail ?? problem?.title ?? text ?? `API error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = problem?.code;
    this.detail = problem?.detail;
    this.errors = problem?.errors;
  }
}

/** Paged list envelope (`?page=&pageSize=`, max pageSize 100). */
export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

async function buildHeaders(init?: RequestInit): Promise<Headers> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (typeof init?.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = await config.getToken?.();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const studioId = config.getStudioId?.();
  if (studioId && !headers.has('X-Studio-Id')) headers.set('X-Studio-Id', studioId);
  return headers;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  if ((response.headers.get('Content-Type') ?? '').includes('json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/**
 * Calls the API. `path` starts with `/api/...`.
 * Resolves with the parsed JSON body (undefined for 204/empty), rejects with `ApiError` for non-2xx.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${config.baseUrl}${path}`, { ...init, headers: await buildHeaders(init) });
  const body = await readBody(response);
  if (!response.ok) {
    throw new ApiError(response.status, body as ProblemDetails | string | undefined);
  }
  return body as T;
}
