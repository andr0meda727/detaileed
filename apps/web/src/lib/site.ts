/** Settings from the build environment (see .env.example). NEXT_PUBLIC_* values are inlined at build time. */

const origin = (value: string | undefined, fallback: string) => (value || fallback).replace(/\/+$/, '');

/** This site's public origin. */
export const SITE_URL = origin(process.env.NEXT_PUBLIC_SITE_URL, 'https://detaileed.com');

/** The API origin (paths start with /api). */
export const API_URL = origin(process.env.NEXT_PUBLIC_API_URL, 'https://api.detaileed.com');

/** The studio dashboard, for studio owners. */
export const DASHBOARD_URL = origin(process.env.NEXT_PUBLIC_DASHBOARD_URL, 'https://app.detaileed.com');

/** MapLibre style; undefined = the ui package default (OpenFreeMap). */
export const MAP_STYLE_URL = process.env.NEXT_PUBLIC_MAP_STYLE_URL || undefined;

/** Cloudflare Turnstile site key for sign-in and sign-up; empty = no captcha (it must match Supabase's setting). */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '';

/** Absolute URL of a path on this site. */
export const siteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
