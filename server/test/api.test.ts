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

  describe('Core Infrastructure & Security Headers', () => {
    it('GET /api/health - deve retornar diagnóstico completo e headers de segurança', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.status).toBe('ok');
      expect(body.service).toBe('biblia-go-server');
      expect(body.database).toBe('ok');
      expect(body.environment).toBe('test');
      expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);

      // Security headers check
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(res.headers['x-request-id']).toBeDefined();
    });

    it('deve preservar X-Request-Id fornecido pelo cliente', async () => {
      const customId = 'custom-client-req-999';
      const res = await app.inject({
        method: 'GET',
        url: '/api/health',
        headers: {
          'x-request-id': customId,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers['x-request-id']).toBe(customId);
    });

    it('GET /api/rota-inexistente - deve retornar 404 padronizado', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/rota-inexistente',
      });

      expect(res.statusCode).toBe(404);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Not Found');
      expect(body.message).toContain('não encontrada');
    });
  });

  describe('Authentication Module (/api/auth)', () => {
    let registeredUserId = '';
    let userToken = '';

    it('POST /api/auth/register - deve rejeitar payload com senha curta', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'João',
          email: 'joao@example.com',
          password: '123', // menos de 6 caracteres
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Dados inválidos');
    });

    it('POST /api/auth/register - deve cadastrar novo usuário e normalizar email em minúsculas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Dev Back-end',
          email: 'Dev@BibliaGo.com',
          password: 'senhaSegura123',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.payload);
      registeredUserId = body.user.id;
      userToken = body.token;
      expect(body.user.email).toBe('dev@bibliago.com');
      expect(body.token).toBeDefined();
    });

    it('POST /api/auth/register - deve rejeitar email duplicado independentemente de maiúsculas', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Dev Outro',
          email: 'DEV@BIBLIAGO.COM',
          password: 'outraSenha123',
        },
      });

      expect(res.statusCode).toBe(409);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Email já cadastrado');
    });

    it('POST /api/auth/login - deve autenticar mesmo com variação de caixa no email', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'DEV@BIBLIAGO.COM',
          password: 'senhaSegura123',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.token).toBeDefined();
      expect(body.user.id).toBe(registeredUserId);
    });

    it('POST /api/auth/login - deve rejeitar senha incorreta com 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'dev@bibliago.com',
          password: 'senhaErrada',
        },
      });

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Email ou senha incorretos');
    });

    it('GET /api/auth/me - deve rejeitar requisição sem token com 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      });

      expect(res.statusCode).toBe(401);
    });

    it('GET /api/auth/me - deve autenticar e retornar perfil quando token válido é enviado', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.user.id).toBe(registeredUserId);
      expect(body.user.email).toBe('dev@bibliago.com');
      expect(body.user.name).toBe('Dev Back-end');
    });
  });

  describe('Cloud Sync Module (/api/sync)', () => {
    let testUserId = '';
    let testUserToken = '';

    beforeAll(async () => {
      const reg = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Sync Tester',
          email: 'synctester@bibliago.com',
          password: 'syncPassword123',
        },
      });
      const data = JSON.parse(reg.payload);
      testUserId = data.user.id;
      testUserToken = data.token;
    });

    it('POST /api/sync - deve rejeitar token que tenta sincronizar dados de outro userId (403)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/sync',
        headers: {
          authorization: `Bearer ${testUserToken}`,
        },
        payload: {
          userId: 'outro_usuario_id_invasor',
          favorites: [],
          readingProgress: [],
        },
      });

      expect(res.statusCode).toBe(403);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Não autorizado');
    });

    it('POST /api/sync - deve sincronizar atomicamente favoritos e progresso de leitura em transação', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/sync',
        headers: {
          authorization: `Bearer ${testUserToken}`,
        },
        payload: {
          userId: testUserId,
          favorites: [
            {
              translationId: 'ACF11',
              bookId: 1,
              chapter: 1,
              verse: 1,
              highlightColor: '#FFF59D',
              note: 'Início da criação',
            },
            {
              translationId: 'ACF11',
              bookId: 19,
              chapter: 23,
              verse: 1,
              highlightColor: '#A7F3D0',
              note: 'O Senhor é meu pastor',
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

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.success).toBe(true);
      expect(body.syncedAt).toBeDefined();
      expect(body.cloudState.favorites).toHaveLength(2);
      expect(body.cloudState.readingProgress).toHaveLength(1);
    });

    it('POST /api/sync - deve atualizar favoritos existentes com Last-Write-Wins', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/sync',
        headers: {
          authorization: `Bearer ${testUserToken}`,
        },
        payload: {
          userId: testUserId,
          favorites: [
            {
              translationId: 'ACF11',
              bookId: 1,
              chapter: 1,
              verse: 1,
              highlightColor: '#FFE0B2', // cor atualizada
              note: 'Anotação atualizada via LWW',
            },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      const updatedFav = body.cloudState.favorites.find(
        (f: { bookId: number; chapter: number; verse: number }) =>
          f.bookId === 1 && f.chapter === 1 && f.verse === 1
      );
      expect(updatedFav.highlightColor).toBe('#FFE0B2');
      expect(updatedFav.note).toBe('Anotação atualizada via LWW');
    });

    it('POST /api/sync - deve rejeitar payload com parâmetros inválidos (400)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/sync',
        payload: {
          userId: testUserId,
          favorites: [
            {
              translationId: 'ACF11',
              bookId: -1, // bookId inválido negativo
              chapter: 1,
              verse: 1,
            },
          ],
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Payload de sincronização inválido');
    });
  });

  describe('Semantic Search Module (/api/search/semantic)', () => {
    it('GET /api/search/semantic - deve retornar versículos relevantes com score de similaridade', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/semantic?q=ansiedade&limit=3',
      });

      expect(res.statusCode).toBe(200);
      const results = JSON.parse(res.payload);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].similarityScore).toBeGreaterThan(0.7);
      expect(results[0].bookName).toBeDefined();
      expect(results[0].text).toBeDefined();
      expect(results[0].themeTags).toContain('ansiedade');
    });

    it('GET /api/search/semantic - deve filtrar termos sem correspondência retornando vazio', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/semantic?q=termo_completamente_inexistente_xyz',
      });

      expect(res.statusCode).toBe(200);
      const results = JSON.parse(res.payload);
      expect(results).toEqual([]);
    });

    it('GET /api/search/semantic - deve rejeitar termo vazio com 400', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/semantic?q=',
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('AI RAG Biblical Chat (/api/ai/chat)', () => {
    it('POST /api/ai/chat - deve responder dúvida temática com citações precisas e alta confiança', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        payload: {
          question: 'Como vencer o medo e a ansiedade através da oração?',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.answer).toBeDefined();
      expect(body.confidence).toBeGreaterThanOrEqual(0.9);
      expect(body.citations.length).toBeGreaterThan(0);
      expect(body.citations[0].chapter).toBeDefined();
      expect(body.citations[0].verse).toBeDefined();
    });

    it('POST /api/ai/chat - deve responder pergunta ampla com fallback teológico sólido', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        payload: {
          question: 'O que a Bíblia ensina para o meu dia a dia?',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.payload);
      expect(body.answer).toBeDefined();
      expect(body.confidence).toBeGreaterThanOrEqual(0.7);
      expect(body.citations).toBeDefined();
    });

    it('POST /api/ai/chat - deve rejeitar pergunta vazia ou menor que 2 caracteres com 400', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/ai/chat',
        payload: {
          question: 'a',
        },
      });

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.payload);
      expect(body.error).toBe('Requisição inválida');
    });
  });
});
