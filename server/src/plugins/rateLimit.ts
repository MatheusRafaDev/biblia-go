import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
  whitelist?: string[];
}

interface ClientBucket {
  count: number;
  resetAt: number;
}

const rateLimitPluginAsync: FastifyPluginAsync<RateLimitOptions> = async (
  fastify: FastifyInstance,
  options: RateLimitOptions
) => {
  const maxRequests = options.maxRequests ?? 100;
  const windowMs = options.windowMs ?? 60_000;
  const whitelist = new Set(options.whitelist ?? ['/api/health', '/health']);

  const buckets = new Map<string, ClientBucket>();

  // Periodic cleanup to avoid memory leak with abandoned IPs
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, b] of buckets.entries()) {
      if (now >= b.resetAt) {
        buckets.delete(key);
      }
    }
  }, 60_000);

  // Do not hold Node process alive on shutdown
  const timer = cleanupInterval as unknown as { unref?: () => void };
  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  fastify.addHook('onClose', async () => {
    clearInterval(cleanupInterval);
    buckets.clear();
  });

  fastify.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    const routeUrl = req.routeOptions?.url;
    // Check whitelist against raw url or configured route pattern
    if (whitelist.has(req.url) || (routeUrl && whitelist.has(routeUrl))) {
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let bucket = buckets.get(ip);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(ip, bucket);
    }

    bucket.count++;

    const remaining = Math.max(0, maxRequests - bucket.count);
    const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

    reply.header('X-RateLimit-Limit', maxRequests);
    reply.header('X-RateLimit-Remaining', remaining);
    reply.header('X-RateLimit-Reset', resetSeconds);

    if (bucket.count > maxRequests) {
      reply.header('Retry-After', resetSeconds);
      return reply.status(429).send({
        error: 'Too Many Requests',
        message: `Limite de requisições excedido. Tente novamente em ${resetSeconds}s.`,
      });
    }
  });
};

export const rateLimitPlugin = fp(rateLimitPluginAsync, {
  name: 'rate-limit-plugin',
});
