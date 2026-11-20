import path from 'node:path';
import type { NextConfig } from 'next';

const repoRoot = path.join(import.meta.dirname, '../..');

/**
 * The site's paths used to be Polish. Links to them live on in sent emails (the backend links to /konto/rezerwacje),
 * bookmarks and search results, so they redirect permanently; the query string is kept.
 */
const POLISH_PATHS: [from: string, to: string][] = [
  ['/logowanie', '/sign-in'],
  ['/rejestracja', '/sign-up'],
  ['/przypomnij-haslo', '/forgot-password'],
  ['/nowe-haslo', '/reset-password'],
  ['/potwierdz-email', '/confirm-email'],
  ['/konto', '/account'],
  ['/konto/samochody', '/account/cars'],
  ['/konto/rezerwacje', '/account/bookings'],
  ['/konto/opinie', '/account/reviews'],
  ['/konto/bezpieczenstwo', '/account/security'],
  ['/studio/:id/rezerwuj', '/studio/:id/book'],
];

const nextConfig: NextConfig = {
  redirects: async () => POLISH_PATHS.map(([source, destination]) => ({ source, destination, permanent: true })),
  // A self-contained server in .next/standalone for the Docker image.
  output: 'standalone',
  // The workspace packages ship TypeScript sources.
  transpilePackages: ['@detaileed/ui', '@detaileed/api-client', '@detaileed/domain'],
  // Trace and bundle from the monorepo root, so packages outside apps/web are included.
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
