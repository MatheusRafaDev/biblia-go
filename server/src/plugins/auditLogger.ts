import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import crypto from 'node:crypto';

export interface AuditLogEntry {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  durationMs: number;
  ip: string;
  userAgent?: string;
}

export interface AuditLoggerOptions {
  onAuditLog?: (entry: AuditLogEntry) => void;
}

const auditLoggerPluginAsync: FastifyPluginAsync<AuditLoggerOptions> = async (
  fastify: FastifyInstance,
  options: AuditLoggerOptions
) => {
  fastify.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    const existingId = req.headers['x-request-id'];
    const requestId = (typeof existingId === 'string' ? existingId : null) || crypto.randomUUID();

    req.headers['x-request-id'] = requestId;
    reply.header('X-Request-Id', requestId);
    (req as unknown as { startTime: number }).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (req: FastifyRequest, reply: FastifyReply) => {
    const startTime = (req as unknown as { startTime: number }).startTime || Date.now();
    const durationMs = Date.now() - startTime;
    const requestId = String(reply.getHeader('X-Request-Id') || req.headers['x-request-id'] || '');

    const entry: AuditLogEntry = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: reply.statusCode,
      durationMs,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'],
    };

    if (typeof options.onAuditLog === 'function') {
      options.onAuditLog(entry);
    }
  });
};

export const auditLoggerPlugin = fp(auditLoggerPluginAsync, {
  name: 'audit-logger-plugin',
});
