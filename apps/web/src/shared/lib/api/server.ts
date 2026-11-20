import { ApiError, configureApiClient } from '@detaileed/api-client';
import { API_URL } from '@/shared/lib/site';

// Server code only calls anonymous public endpoints, so one module-level config without a token is safe here;
// signed-in calls run in the browser (see app/providers.tsx).
configureApiClient({ baseUrl: API_URL });

/** Options for public endpoints: Next keeps the answer for 60 s, like the API's own output cache. */
export const publicRequest: RequestInit = { next: { revalidate: 60 } };

/** Awaits a public API call, turning 404 (an unpublished or unknown studio) into null. */
export async function orNotFound<T>(call: Promise<T>): Promise<T | null> {
  try {
    return await call;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
