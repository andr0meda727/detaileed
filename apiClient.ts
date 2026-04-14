import supabase from './utils/supabase';
import { getSelectedStudioId } from './contexts/StudioContext';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.detaileed.com/api' : '/api');

async function getHeaders(isJson = false): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
        'Accept': 'application/json',
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


async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return undefined as T;
    }
    return response.json();
}

const CACHE_PREFIX = 'df_api_cache_';

export async function apiGet<T>(
    path: string,
    params?: Record<string, string | boolean | undefined>,
    onCacheHit?: (data: T) => void
): Promise<T> {
    const url = new URL(`${API_BASE}${path}`, window.location.origin);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                url.searchParams.set(key, String(value));
            }
        });
    }

    const urlString = url.toString();
    const cacheKey = `${CACHE_PREFIX}${urlString}`;

    // 1. Try to serve from cache first
    if (onCacheHit) {
        try {
            const cachedUrlData = localStorage.getItem(cacheKey);
            if (cachedUrlData) {
                const parsed = JSON.parse(cachedUrlData) as T;
                onCacheHit(parsed);
            }
        } catch (e) {
            console.warn('Failed to parse cached API data', e);
        }
    }

    // 2. Fetch fresh data
    const response = await fetch(urlString, {
        headers: await getHeaders(),
    });

    // 3. Process and cache the fresh data
    const freshData = await handleResponse<T>(response);

    try {
        if (freshData !== undefined) {
            localStorage.setItem(cacheKey, JSON.stringify(freshData));
        }
    } catch (e) {
        console.warn('Failed to save API data to cache', e);
    }

    return freshData;
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
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API Error ${response.status}: ${errorText}`);
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
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }
}
