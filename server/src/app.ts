import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { env } from './config/env.js';
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

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  });

  // CORS
  app.register(cors, {
    origin: true,
    credentials: true,
  });

  // JWT
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

  // Ensure DB initialized
  getDatabase();

  // Health check
  app.get('/api/health', async () => {
    return {
      status: 'ok',
      service: 'biblia-go-server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Register feature modules
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(syncRoutes, { prefix: '/api/sync' });
  app.register(searchRoutes, { prefix: '/api/search' });
  app.register(aiRoutes, { prefix: '/api/ai' });

  return app;
}
