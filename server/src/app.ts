import Fastify, { FastifyInstance, FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { env } from './config/env.js';
import { auditLoggerPlugin } from './plugins/auditLogger.js';
import { securityHeadersPlugin } from './plugins/securityHeaders.js';
import { rateLimitPlugin, RateLimitOptions } from './plugins/rateLimit.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { syncRoutes } from './modules/sync/sync.routes.js';
import { searchRoutes } from './modules/search/search.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { getDatabase } from './db/client.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export interface AppOptions {
  enableRateLimit?: boolean;
  rateLimitOptions?: RateLimitOptions;
  logger?: boolean;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const isTest = env.NODE_ENV === 'test';

  const app = Fastify({
    logger: options.logger ?? (isTest ? false : true),
  });

  // 1. Audit logger & Request ID tracking
  app.register(auditLoggerPlugin);

  // 2. Security Headers (Helmet equivalents)
  app.register(securityHeadersPlugin, {
    enableHsts: env.NODE_ENV === 'production',
  });

  // 3. CORS
  app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });

  // 4. Rate Limiting
  const shouldEnableRateLimit = options.enableRateLimit ?? true;
  if (shouldEnableRateLimit) {
    app.register(rateLimitPlugin, {
      maxRequests: isTest ? 1000 : (options.rateLimitOptions?.maxRequests ?? 100),
      windowMs: options.rateLimitOptions?.windowMs ?? 60_000,
      whitelist: options.rateLimitOptions?.whitelist ?? ['/api/health', '/health'],
    });
  }

  // 5. JWT Authentication
  app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // Auth decorator
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Token de autenticação inválido ou expirado' });
    }
  });

  // Centralized Error Handler (RFC 7807 aligned)
  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);

    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: error.message || 'Limite de requisições excedido.',
      });
    }

    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;

    if (statusCode >= 500) {
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Ocorreu um erro interno no servidor.',
      });
    }

    return reply.status(statusCode).send({
      error: error.name || 'Bad Request',
      message: error.message,
    });
  });

  // Centralized 404 Handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Rota ${request.method} ${request.url} não encontrada.`,
    });
  });

  // Ensure DB initialized with pragmas and schema
  getDatabase();

  // Health check endpoint with diagnostics
  app.get('/api/health', async () => {
    let dbStatus = 'ok';
    try {
      const db = getDatabase();
      db.prepare('SELECT 1').get();
    } catch {
      dbStatus = 'degraded';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      service: 'biblia-go-server',
      version: '1.1.0',
      database: dbStatus,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  });

  // Feature modules registration
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(syncRoutes, { prefix: '/api/sync' });
  app.register(searchRoutes, { prefix: '/api/search' });
  app.register(aiRoutes, { prefix: '/api/ai' });

  return app;
}
