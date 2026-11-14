import { configureApiClient } from '@detaileed/api-client';
import { getSelectedStudioId } from '@/features/studios';
import supabase from '@/shared/lib/supabase';

/**
 * API origin without the `/api` suffix (request paths already start with `/api`).
 * Empty in dev means same origin, so requests go through the Vite proxy.
 * A trailing `/api` is stripped so an old-style value (`https://host/api`) keeps working.
 */
export function resolveApiOrigin(value: string | undefined, isProd: boolean): string {
  const origin = value || (isProd ? 'https://api.detaileed.com' : '');
  return origin.replace(/\/+$/, '').replace(/\/api$/, '');
}

export const API_ORIGIN = resolveApiOrigin(import.meta.env.VITE_API_URL, import.meta.env.PROD);

configureApiClient({
  baseUrl: API_ORIGIN,
  getToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
  getStudioId: getSelectedStudioId,
});
