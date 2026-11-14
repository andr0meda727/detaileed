import supabase from '@/shared/lib/supabase';
import { getSelectedStudioId } from '@/features/studios';
import { ApiError, type ProblemDetails } from '@detaileed/api-client';
import { API_ORIGIN } from '@/app/api';

const API_BASE = `${API_ORIGIN}/api`;

async function getHeaders(isJson = false): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  const studioId = getSelectedStudioId();
  if (studioId) {
    headers['X-Studio-Id'] = studioId;
  }
  return headers;
}

export { ApiError };

async function extractApiError(response: Response): Promise<never> {
  const text = await response.text().catch(() => '');
  let data: ProblemDetails | string = text;
  try {
    data = JSON.parse(text) as ProblemDetails;
  } catch {
    // Not JSON: keep the text body as the message.
  }
  throw new ApiError(response.status, data);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    await extractApiError(response);
  }
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }
  return response.json();
}

export async function apiGet<T>(path: string, params?: Record<string, string | boolean | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const urlString = url.toString();
  const response = await fetch(urlString, {
    headers: await getHeaders(),
  });

  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: await getHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: await getHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: await getHeaders(true),
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: await getHeaders(),
  });
  if (!response.ok) {
    await extractApiError(response);
  }
}

export async function generateBookingsReport(dateFrom: string, dateTo: string): Promise<void> {
  const response = await fetch(`${API_BASE}/Reports/bookings`, {
    method: 'POST',
    headers: await getHeaders(true),
    body: JSON.stringify({ dateFrom, dateTo }),
  });

  // Accept 200, 202 (Accepted) or 204
  if (!response.ok) {
    await extractApiError(response);
  }
}
