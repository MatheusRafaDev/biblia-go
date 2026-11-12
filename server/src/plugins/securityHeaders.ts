import { FastifyInstance, FastifyPluginAsync, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export interface SecurityHeadersOptions {
  enableHsts?: boolean;
}

const securityHeadersPluginAsync: FastifyPluginAsync<SecurityHeadersOptions> = async (
  fastify: FastifyInstance,
  options: SecurityHeadersOptions
) => {
  const enableHsts = options.enableHsts ?? true;

  fastify.addHook('onSend', async (_req, reply: FastifyReply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '0');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (enableHsts) {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  });
};

export const securityHeadersPlugin = fp(securityHeadersPluginAsync, {
  name: 'security-headers-plugin',
});
