import type { IncomingHttpHeaders } from 'node:http';

/** What a route handler gets: the parsed request. */
export interface MockRequest {
  method: string;
  /** Path without the query string, e.g. `/api/Clients/123`. */
  path: string;
  /** Path parameters by their name in the route (`{id}` → `params.id`). */
  params: Record<string, string>;
  query: URLSearchParams;
  /** Parsed JSON body (or the form fields of a form body); undefined without one. */
  body: unknown;
  headers: IncomingHttpHeaders;
  /** This server's own origin, e.g. `http://localhost:5180`. */
  origin: string;
}

/** Returns the JSON body (200), a `Reply`, or throws an `HttpError`. */
export type Handler = (req: MockRequest) => unknown;

export interface Route {
  method: string;
  /** The path as the OpenAPI spec writes it, e.g. `/api/Clients/{id}`. */
  path: string;
  handler: Handler;
  pattern: RegExp;
  keys: string[];
}

export function route(method: string, path: string, handler: Handler): Route {
  const keys: string[] = [];
  const source = path
    .split('/')
    .map((part) => {
      const param = /^\{(\w+)\}$/.exec(part);
      if (!param) return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      keys.push(param[1]);
      return '([^/]+)';
    })
    .join('/');
  // ASP.NET matches paths case-insensitively, so the mock does too.
  return { method: method.toUpperCase(), path, handler, pattern: new RegExp(`^${source}/?$`, 'i'), keys };
}

/** The first route for this method and path, with its path parameters. */
export function matchRoute(routes: Route[], method: string, path: string) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const match = r.pattern.exec(path);
    if (!match) continue;
    const params: Record<string, string> = {};
    r.keys.forEach((key, i) => (params[key] = decodeURIComponent(match[i + 1])));
    return { route: r, params };
  }
  return null;
}

/** Whether some route serves this path with another method (405 rather than 404). */
export function pathExists(routes: Route[], path: string): boolean {
  return routes.some((r) => r.pattern.test(path));
}
