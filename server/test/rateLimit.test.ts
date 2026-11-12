import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { rateLimitPlugin } from '../src/plugins/rateLimit';

describe('rateLimitPlugin', () => {
  it('allows requests within limit and sets rate limit headers', async () => {
    const app = Fastify();
    await app.register(rateLimitPlugin, { maxRequests: 5, windowMs: 60_000 });

    app.get('/test', async () => ({ ok: true }));

    const res1 = await app.inject({ method: 'GET', url: '/test' });
    expect(res1.statusCode).toBe(200);
    expect(String(res1.headers['x-ratelimit-limit'])).toBe('5');
    expect(String(res1.headers['x-ratelimit-remaining'])).toBe('4');
  });

  it('blocks requests exceeding maximum threshold with HTTP 429', async () => {
    const app = Fastify();
    await app.register(rateLimitPlugin, { maxRequests: 2, windowMs: 60_000 });

    app.get('/test', async () => ({ ok: true }));

    await app.inject({ method: 'GET', url: '/test' });
    await app.inject({ method: 'GET', url: '/test' });

    const blockedRes = await app.inject({ method: 'GET', url: '/test' });
    expect(blockedRes.statusCode).toBe(429);
    expect(blockedRes.json().error).toBe('Too Many Requests');
  });

  it('bypasses whitelisted paths like /health', async () => {
    const app = Fastify();
    await app.register(rateLimitPlugin, { maxRequests: 1, windowMs: 60_000, whitelist: ['/health'] });

    app.get('/health', async () => ({ status: 'ok' }));

    const res1 = await app.inject({ method: 'GET', url: '/health' });
    const res2 = await app.inject({ method: 'GET', url: '/health' });
    const res3 = await app.inject({ method: 'GET', url: '/health' });

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
    expect(res3.statusCode).toBe(200);
  });
});
