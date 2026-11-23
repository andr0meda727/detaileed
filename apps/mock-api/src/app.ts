import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { HttpError, Reply } from './http.ts';
import { matchRoute, pathExists, type MockRequest } from './router.ts';
import { routes } from './routes/index.ts';
import { resetStore } from './store/store.ts';

/** Browsers may call the mock from any local dev server (`http://localhost:<port>`, `http://127.0.0.1:<port>`). */
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
const ALLOWED_HEADERS = 'Authorization, Content-Type, X-Studio-Id, apikey, x-client-info, x-supabase-api-version';

function applyCors(req: IncomingMessage, res: ServerResponse) {
  const origin = req.headers.origin;
  if (!origin || !LOCAL_ORIGIN.test(origin)) return;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  // Echo what the browser asks for, so a new client header never breaks the preflight.
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] ?? ALLOWED_HEADERS);
  res.setHeader('Access-Control-Expose-Headers', 'x-supabase-api-version');
  res.setHeader('Access-Control-Max-Age', '600');
  res.setHeader('Vary', 'Origin');
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return undefined;
  const type = req.headers['content-type'] ?? '';
  if (type.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(text));
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, {
      title: 'Bad Request',
      status: 400,
      detail: 'Nieprawidłowy JSON.',
      code: 'INVALID_JSON',
    });
  }
}

function send(res: ServerResponse, status: number, body: unknown, problem = false) {
  if (body === undefined) {
    res.writeHead(status).end();
    return;
  }
  const type = problem && status >= 400 ? 'application/problem+json' : 'application/json';
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` }).end(JSON.stringify(body));
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  applyCors(req, res);
  const method = (req.method ?? 'GET').toUpperCase();
  if (method === 'OPTIONS') return send(res, 204, undefined);

  const url = new URL(req.url ?? '/', 'http://mock');
  const path = url.pathname;
  const isApi = path.startsWith('/api/');

  if (method === 'GET' && path === '/') {
    return send(res, 200, { name: '@detaileed/mock-api', routes: routes.length, reset: 'POST /__mock/reset' });
  }
  if (method === 'POST' && path === '/__mock/reset') {
    resetStore();
    return send(res, 204, undefined);
  }

  const found = matchRoute(routes, method, path);
  if (!found) {
    const status = pathExists(routes, path) ? 405 : 404;
    console.warn(`[mock-api] no handler for ${method} ${path}`);
    return send(
      res,
      status,
      { title: 'Not Found', status, detail: `Mock API nie obsługuje ${method} ${path}.`, code: 'MOCK_NOT_IMPLEMENTED' },
      true,
    );
  }

  const request: MockRequest = {
    method,
    path,
    params: found.params,
    query: url.searchParams,
    body: await readBody(req),
    headers: req.headers,
    origin: `http://${req.headers.host ?? 'localhost'}`,
  };
  const result = await found.route.handler(request);
  if (result instanceof Reply) return send(res, result.status, result.body, isApi);
  return send(res, 200, result);
}

/** The mock API as a plain Node HTTP server (not listening yet). */
export function createMockServer(options: { log?: boolean } = {}): Server {
  return createServer((req, res) => {
    const started = Date.now();
    if (options.log) {
      res.on('finish', () => console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - started}ms`));
    }
    handle(req, res).catch((err: unknown) => {
      if (err instanceof HttpError) return send(res, err.status, err.body, true);
      console.error('[mock-api]', err);
      send(res, 500, { title: 'Internal Server Error', status: 500, detail: String(err), code: 'MOCK_ERROR' }, true);
    });
  });
}
