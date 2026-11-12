import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { getDatabase } from '../../db/client.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  const db = getDatabase();

  // POST /api/auth/register
  app.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Dados inválidos',
        details: parsed.error.format(),
      });
    }

    const { name, email, password } = parsed.data;

    // Check if email already registered
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return reply.status(409).send({ error: 'Email já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    db.prepare('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)').run(
      userId,
      name,
      email,
      passwordHash
    );

    const token = app.jwt.sign({ sub: userId, name, email });

    return reply.status(201).send({
      user: { id: userId, name, email },
      token,
    });
  });

  // POST /api/auth/login
  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Credenciais inválidas',
        details: parsed.error.format(),
      });
    }

    const { email, password } = parsed.data;

    interface UserRow {
      id: string;
      name: string;
      email: string;
      password_hash: string;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    if (!user) {
      return reply.status(401).send({ error: 'Email ou senha incorretos' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return reply.status(401).send({ error: 'Email ou senha incorretos' });
    }

    const token = app.jwt.sign({ sub: user.id, name: user.name, email: user.email });

    return reply.send({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  });

  // GET /api/auth/me
  app.get('/me', { onRequest: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const userPayload = request.user as { sub: string };

    interface UserRow {
      id: string;
      name: string;
      email: string;
      created_at: string;
    }

    const user = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(userPayload.sub) as UserRow | undefined;
    if (!user) {
      return reply.status(404).send({ error: 'Usuário não encontrado' });
    }

    return reply.send({ user });
  });
}
