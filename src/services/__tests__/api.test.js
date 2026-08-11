import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, ApiError, NetworkError, setApiErrorHandler, clearApiCache } from '../api';
import { config } from '../../config/env';

const BASE = config.apiUrl;

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

describe('api request layer', () => {
  beforeEach(() => {
    localStorage.clear();
    setApiErrorHandler(null);
    vi.restoreAllMocks();
    clearApiCache();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sends GET to the right URL with query string and auth header', async () => {
    localStorage.setItem('token', 'tok-123');
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: [] }));

    await api.leads.getAll({ status: 'INQUIRY', page: 2, empty: undefined, blank: '' });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = globalThis.fetch.mock.calls[0];
    expect(url).toBe(`${BASE}/leads?status=INQUIRY&page=2`);
    expect(opts.headers.Authorization).toBe('Bearer tok-123');
    expect(opts.headers['Content-Type']).toBe('application/json');
  });

  it('serializes the body and sets method on POST requests', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(201, { success: true, data: {} }));

    await api.leads.create({ name: 'Amit', phone: '9876543210' });

    const [, opts] = globalThis.fetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(opts.body).toBe(JSON.stringify({ name: 'Amit', phone: '9876543210' }));
  });

  it('returns parsed JSON data on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: { id: 1 } }));

    const res = await api.dashboard.getStats();

    expect(res).toEqual({ success: true, data: { id: 1 } });
  });

  it('handles non-JSON responses by wrapping the text body', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'text/plain' },
      json: async () => { throw new Error('not json'); },
      text: async () => 'plain response',
    });

    const res = await api.leads.getAll();

    expect(res).toEqual({ message: 'plain response' });
  });

  it('throws ApiError with status and data on error responses', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse(404, { message: 'Not found', code: 'LEAD_NOT_FOUND' }));

    const err = await api.leads.getById('abc').catch((e) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe('ApiError');
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.data).toEqual({ message: 'Not found', code: 'LEAD_NOT_FOUND' });
  });

  it('retries GET once on network error then throws NetworkError', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    const res = await api.leads.getAll();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(res).toEqual({ success: true, data: [] });
  });

  it('throws NetworkError when the network keeps failing', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    const err = await api.leads.getAll().catch((e) => e);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(err).toBeInstanceOf(NetworkError);
    expect(err.message).toBe('Network error. Please check your connection and try again.');
  });

  it('retries GET once on 5xx responses', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, { message: 'Unavailable' }))
      .mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    const res = await api.leads.getAll();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(res).toEqual({ success: true, data: [] });
  });

  it('does not retry POST requests on 5xx responses', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(500, { message: 'boom' }));

    const err = await api.auth.login('a@b.com', 'secret').catch((e) => e);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
  });

  it('calls the global error handler and does not retry on 429', async () => {
    const handler = vi.fn();
    setApiErrorHandler(handler);
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(429, { message: 'Too many requests' }));

    const err = await api.dashboard.getStats().catch((e) => e);

    expect(handler).toHaveBeenCalledWith('Too many requests');
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(429);
  });

  it('times out and throws NetworkError without retrying', async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn().mockImplementation(
      (_url, opts) =>
        new Promise((_resolve, reject) => {
          opts.signal.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          });
        }),
    );

    const promise = api.leads.getAll();
    const assertion = expect(promise).rejects.toBeInstanceOf(NetworkError);

    await vi.advanceTimersByTimeAsync(30001);
    await assertion;

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('respects an externally aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();

    const err = await api.leads.getAll({}, { signal: controller.signal }).catch((e) => e);

    expect(err.name).toBe('AbortError');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('stores the token from a successful login', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(200, { success: true, data: { token: 'jwt-token', user: {} } }),
      );

    const res = await api.auth.login('a@b.com', 'secret');

    expect(res.data.token).toBe('jwt-token');
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  it('deduplicates concurrent identical GET requests', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: [1] }));

    const [a, b] = await Promise.all([api.leads.getAll(), api.leads.getAll()]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    expect(a).toEqual({ success: true, data: [1] });
  });

  it('serves a cached GET response within the TTL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: [1] }));

    await api.leads.getAll();
    await api.leads.getAll();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('refetches after the cache TTL expires', async () => {
    vi.useFakeTimers();
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: [1] }));

    await api.leads.getAll();
    await vi.advanceTimersByTimeAsync(30001);
    await api.leads.getAll();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('flushes the cache when a mutation is made', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(200, { success: true, data: [1] }))
      .mockResolvedValueOnce(jsonResponse(201, { success: true, data: {} }))
      .mockResolvedValueOnce(jsonResponse(200, { success: true, data: [] }));

    const first = await api.leads.getAll();
    await api.leads.create({ name: 'Amit' });
    const second = await api.leads.getAll();

    expect(first).toEqual({ success: true, data: [1] });
    expect(second).toEqual({ success: true, data: [] });
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('keeps distinct cache entries for different query strings', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(jsonResponse(200, { success: true, data: [] }));

    await api.leads.getAll({ status: 'INQUIRY' });
    await api.leads.getAll({ status: 'CONVERTED' });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not cache failed GET requests', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await api.leads.getAll().catch(() => {});
    await api.leads.getAll().catch(() => {});

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });
});
