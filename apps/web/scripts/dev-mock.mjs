/**
 * `pnpm dev:mock [--port 3011]`: `next dev` against the mock API. Loads .env.mock into the environment first,
 * because Next never overrides variables that are already set, so these beat .env.local.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { port: { type: 'string', short: 'p' } }, strict: false });
const port = values.port ?? '3001';

process.loadEnvFile(new URL('../.env.mock', import.meta.url));
// Auth redirects (sign-up confirmation, password reset) come back to this server.
process.env.NEXT_PUBLIC_SITE_URL ??= `http://localhost:${port}`;

const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '-p', port], { stdio: 'inherit', env: process.env });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => process.exit(code ?? 0));
