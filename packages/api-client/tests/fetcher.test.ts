import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch, configureApiClient } from '../src';

const fetchMock = vi.fn<typeof fetch>();

function respond(status: number, body?: unknown, contentType = 'application/json') {
  const text = body === undefined ? null : typeof body === 'string' ? body : JSON.stringify(body);
  fetchMock.mockResolvedValueOnce(new Response(text, { status, headers: { 'Content-Type': contentType } }));
}

function sentHeaders(call = 0): Headers {
  return new Headers(fetchMock.mock.calls[call][1]?.headers);
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  configureApiClient({ baseUrl: 'https://api.test/', getToken: () => 'tok', getStudioId: () => 'studio-1' });
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('apiFetch', () => {
  it('prefixes the base url and sends auth and studio headers', async () => {
    respond(200, { ok: true });
    await apiFetch('/api/clients');

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/clients');
    expect(sentHeaders().get('Authorization')).toBe('Bearer tok');
    expect(sentHeaders().get('X-Studio-Id')).toBe('studio-1');
    expect(sentHeaders().get('Accept')).toBe('application/json');
  });

  it('omits auth and studio headers for anonymous calls', async () => {
    configureApiClient({ baseUrl: '' });
    respond(200, []);
    await apiFetch('/api/public/studios');

    expect(fetchMock.mock.calls[0][0]).toBe('/api/public/studios');
    expect(sentHeaders().has('Authorization')).toBe(false);
    expect(sentHeaders().has('X-Studio-Id')).toBe(false);
  });

  it('sends json bodies with a json content type and returns the parsed body', async () => {
    respond(201, { id: '1' });
    const result = await apiFetch<{ id: string }>('/api/clients', {
      method: 'POST',
      body: JSON.stringify({ name: 'A' }),
    });

    expect(result).toEqual({ id: '1' });
    expect(sentHeaders().get('Content-Type')).toBe('application/json');
  });

  it('resolves undefined for 204', async () => {
    respond(204);
    await expect(apiFetch('/api/clients/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('throws ApiError with code and detail from problem details', async () => {
    respond(
      404,
      { title: 'Not Found', status: 404, detail: 'Nie znaleziono rezerwacji', code: 'BOOKING_NOT_FOUND' },
      'application/problem+json',
    );

    const error = await apiFetch('/api/bookings/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: 'BOOKING_NOT_FOUND', message: 'Nie znaleziono rezerwacji' });
  });

  it('exposes validation errors', async () => {
    respond(
      400,
      { title: 'One or more validation errors occurred.', status: 400, errors: { Name: ['Nazwa jest wymagana.'] } },
      'application/problem+json',
    );

    const error = (await apiFetch('/api/service', { method: 'POST', body: '{}' }).catch((e: unknown) => e)) as ApiError;
    expect(error.errors).toEqual({ Name: ['Nazwa jest wymagana.'] });
    expect(error.code).toBeUndefined();
  });

  it('keeps a plain text error body as the message', async () => {
    respond(500, 'boom', 'text/plain');

    const error = (await apiFetch('/api/x').catch((e: unknown) => e)) as ApiError;
    expect(error.status).toBe(500);
    expect(error.message).toBe('boom');
  });
});
