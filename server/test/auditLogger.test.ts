import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { auditLoggerPlugin, AuditLogEntry } from '../src/plugins/auditLogger';

describe('auditLoggerPlugin', () => {
  it('assigns unique request ID if none provided in request headers', async () => {
    const app = Fastify();
    await app.register(auditLoggerPlugin);

    app.get('/test', async () => ({ ok: true }));

    const res = await app.inject({ method: 'GET', url: '/test' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('preserves existing x-request-id from incoming request', async () => {
    const app = Fastify();
    await app.register(auditLoggerPlugin);

    app.get('/test', async () => ({ ok: true }));

    const clientReqId = 'custom-trace-uuid-12345';
    const res = await app.inject({
      method: 'GET',
      url: '/test',
      headers: { 'x-request-id': clientReqId },
    });

    expect(res.headers['x-request-id']).toBe(clientReqId);
  });

  it('triggers onAuditLog callback with structured metadata on response', async () => {
    const app = Fastify();
    const logs: AuditLogEntry[] = [];

    await app.register(auditLoggerPlugin, {
      onAuditLog: (entry) => {
        logs.push(entry);
      },
    });

    app.get('/audit-test', async () => ({ done: true }));

    await app.inject({ method: 'GET', url: '/audit-test' });

    expect(logs.length).toBe(1);
    expect(logs[0].url).toBe('/audit-test');
    expect(logs[0].method).toBe('GET');
    expect(logs[0].statusCode).toBe(200);
    expect(logs[0].durationMs).toBeGreaterThanOrEqual(0);
  });
});
