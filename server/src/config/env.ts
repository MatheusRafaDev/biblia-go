import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  HOST: z.string().default('0.0.0.0'),
  JWT_SECRET: z.string().default('biblia-go-super-secret-jwt-key-2026'),
  DATABASE_PATH: z.string().default('biblia_go_server.db'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export const env = envSchema.parse(process.env);
