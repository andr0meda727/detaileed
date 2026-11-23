import path from 'node:path';
import type { NextConfig } from 'next';

const repoRoot = path.join(import.meta.dirname, '../..');

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone for the Docker image.
  output: 'standalone',
  // The workspace packages ship TypeScript sources.
  transpilePackages: ['@detaileed/ui', '@detaileed/api-client', '@detaileed/domain'],
  // Trace and bundle from the monorepo root, so packages outside apps/web are included.
  outputFileTracingRoot: repoRoot,
  turbopack: { root: repoRoot },
  reactStrictMode: true,
  poweredByHeader: false,
  // `next dev` would write an AGENTS.md for AI agents into apps/web; the repo's own AGENTS.md is the guide.
  agentRules: false,
};

export default nextConfig;
