import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

describe('Fastify Backend API Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health - deve retornar status ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('biblia-go-server');
  });

  let registeredUserId = '';

  it('POST /api/auth/register - deve cadastrar novo usuário com sucesso', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'Dev Back-end',
        email: 'dev@bibliago.com',
        password: 'senhaSegura123',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    registeredUserId = body.user.id;
    expect(body.user.email).toBe('dev@bibliago.com');
    expect(body.token).toBeDefined();
  });

  it('POST /api/auth/login - deve autenticar e retornar token JWT', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'dev@bibliago.com',
        password: 'senhaSegura123',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.token).toBeDefined();
    expect(body.user.name).toBe('Dev Back-end');
  });

  it('GET /api/auth/me - deve proteger rota e retornar perfil do usuário', async () => {
    // 1. Login to get token
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'dev@bibliago.com',
        password: 'senhaSegura123',
      },
    });
    const { token } = JSON.parse(loginRes.payload);

    // 2. Access /me
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(meRes.statusCode).toBe(200);
    const body = JSON.parse(meRes.payload);
    expect(body.user.email).toBe('dev@bibliago.com');
  });

  it('POST /api/sync - deve sincronizar favoritos e progresso de leitura em nuvem', async () => {
    const syncRes = await app.inject({
      method: 'POST',
      url: '/api/sync',
      payload: {
        userId: registeredUserId || 'usr_test_123',
        favorites: [
          {
            translationId: 'ACF11',
            bookId: 1,
            chapter: 1,
            verse: 1,
            highlightColor: '#FFF59D',
            note: 'Início da criação',
          },
        ],
        readingProgress: [
          {
            planId: 'nt_90_days',
            dayNumber: 1,
            isCompleted: true,
          },
        ],
      },
    });

    expect(syncRes.statusCode).toBe(200);
    const body = JSON.parse(syncRes.payload);
    expect(body.success).toBe(true);
    expect(body.cloudState.favorites).toHaveLength(1);
    expect(body.cloudState.favorites[0].note).toBe('Início da criação');
    expect(body.cloudState.readingProgress).toHaveLength(1);
    expect(body.cloudState.readingProgress[0].isCompleted).toBe(true);
  });

  it('GET /api/search/semantic - deve retornar versículos com score de similaridade por tema', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search/semantic?q=ansiedade&limit=3',
    });

    expect(res.statusCode).toBe(200);
    const results = JSON.parse(res.payload);
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].similarityScore).toBeGreaterThan(0.6);
    expect(results[0].bookName).toBeDefined();
    expect(results[0].text).toBeDefined();
  });

  it('POST /api/ai/chat - deve responder dúvida bíblica citando versículos com exatidão (RAG)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ai/chat',
      payload: {
        question: 'O que a Bíblia ensina para quem está passando por ansiedade e preocupação?',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.answer).toBeDefined();
    expect(body.confidence).toBeGreaterThan(0.8);
    expect(body.citations.length).toBeGreaterThan(0);
    expect(body.citations[0].chapter).toBeDefined();
    expect(body.citations[0].verse).toBeDefined();
  });
});
