# 📡 Bíblia Go — Especificação da API REST

Esta documentação descreve todos os endpoints públicos e autenticados do servidor backend do **Bíblia Go** construído com **Fastify**, **TypeScript**, **Zod** e **node:sqlite**.

---

## 🌐 Informações Gerais
- **Base URL Local**: `http://localhost:3333`
- **Formato dos Dados**: JSON (`Content-Type: application/json`)
- **Autenticação**: Bearer Token JWT via cabeçalho `Authorization: Bearer <token>`
- **Segurança**: Rate limiting por IP (`X-RateLimit-*`), Helmet headers de proteção e Request ID tracking (`X-Request-Id`).

---

## 📋 Sumário dos Endpoints

| Método | Endpoint | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/health` | Pública | Healthcheck do serviço |
| `POST` | `/api/auth/register` | Pública | Cadastro de novo usuário |
| `POST` | `/api/auth/login` | Pública | Autenticação e emissão de JWT |
| `GET` | `/api/auth/me` | Bearer Token | Dados do perfil do usuário autenticado |
| `POST` | `/api/sync` | Bearer Token | Sincronização bidirecional de dados |
| `GET` | `/api/search/semantic` | Pública / Opcional | Busca semântica por tema e embeddings |
| `POST` | `/api/ai/ask` | Bearer Token | Assistente de IA Bíblico (RAG com citações) |

---

## 1. Monitoramento

### `GET /health`
Verifica se o servidor e a base de dados SQLite estão operacionais.

**Resposta `200 OK`**:
```json
{
  "status": "ok",
  "uptime": 124.5,
  "timestamp": "2026-11-12T17:40:00.000Z",
  "database": "connected"
}
```

---

## 2. Autenticação

### `POST /api/auth/register`
Cadastra uma nova conta de usuário.

**Corpo da Requisição**:
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "SenhaSegura123!"
}
```

**Resposta `201 Created`**:
```json
{
  "user": {
    "id": "usr_9f8e7d6c",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "created_at": "2026-11-12T17:40:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### `POST /api/auth/login`
Autentica com email e senha para obter um JWT válido por 7 dias.

**Corpo da Requisição**:
```json
{
  "email": "joao@exemplo.com",
  "password": "SenhaSegura123!"
}
```

**Resposta `200 OK`**:
```json
{
  "user": {
    "id": "usr_9f8e7d6c",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### `GET /api/auth/me`
Retorna os dados do usuário autenticado a partir do token JWT.

**Cabeçalhos**:
```http
Authorization: Bearer <seu_token_jwt>
```

**Resposta `200 OK`**:
```json
{
  "user": {
    "id": "usr_9f8e7d6c",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "created_at": "2026-11-12T17:40:00.000Z"
  }
}
```

---

## 3. Sincronização em Nuvem (Cloud Sync)

### `POST /api/sync`
Sincronização bidirecional offline-first entre o SQLite local do mobile e o servidor. Implementa estratégia *Last-Write-Wins* baseada em timestamp ISO 8601.

**Cabeçalhos**:
```http
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

**Corpo da Requisição**:
```json
{
  "lastSyncedAt": "2026-11-10T12:00:00.000Z",
  "favorites": [
    {
      "id": "fav_01",
      "translationId": "ACF11",
      "bookId": "JHN",
      "chapter": 3,
      "verse": 16,
      "color": "#FFE699",
      "note": "Amor sacrificial de Deus",
      "updatedAt": "2026-11-12T15:30:00.000Z"
    }
  ],
  "readingProgress": [
    {
      "planId": "plano_anual",
      "day": 12,
      "completedAt": "2026-11-12T07:15:00.000Z"
    }
  ],
  "quizScores": [
    {
      "category": "Evangelhos",
      "score": 100,
      "totalQuestions": 5,
      "correctAnswers": 5,
      "completedAt": "2026-11-12T14:00:00.000Z"
    }
  ]
}
```

**Resposta `200 OK`**:
```json
{
  "syncedAt": "2026-11-12T17:41:00.000Z",
  "conflictsResolved": 0,
  "serverChanges": {
    "favorites": [],
    "readingProgress": [],
    "quizScores": []
  }
}
```

---

## 4. Busca Semântica

### `GET /api/search/semantic?q={query}&limit={limit}`
Realiza busca vetorial baseada no significado da consulta (ex: "ansiedade e paz", "perdão na família"), mapeando conceitos teológicos para versículos bíblicos.

**Parâmetros de Query**:
- `q` (obrigatório): Texto da pesquisa temática
- `limit` (opcional, padrão 10): Quantidade máxima de resultados

**Resposta `200 OK`**:
```json
{
  "query": "paz em momentos difíceis",
  "count": 2,
  "results": [
    {
      "reference": "Filipenses 4:6-7",
      "translation": "ACF11",
      "text": "Não estejais inquietos por coisa alguma... e a paz de Deus guardará os vossos corações.",
      "similarityScore": 0.94,
      "theme": "Ansiedade e Confiança"
    },
    {
      "reference": "João 14:27",
      "translation": "ACF11",
      "text": "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá.",
      "similarityScore": 0.89,
      "theme": "Consolo e Paz"
    }
  ]
}
```

---

## 5. Assistente Bíblico RAG (IA)

### `POST /api/ai/ask`
Consulta o assistente teológico de Inteligência Artificial com pipeline RAG (*Retrieval-Augmented Generation*). Todas as respostas são obrigatoriamente fundamentadas em passagens bíblicas citadas.

**Corpo da Requisição**:
```json
{
  "question": "Qual o significado da parábola do Filho Pródigo?",
  "preferredTranslation": "ACF11"
}
```

**Resposta `200 OK`**:
```json
{
  "answer": "A parábola do Filho Pródigo (Lucas 15:11-32) ilustra o amor incondicional e perdoador do Pai celestial...",
  "citedPassages": [
    {
      "reference": "Lucas 15:11-32",
      "translation": "ACF11",
      "relevance": "Passagem central da narrativa"
    }
  ],
  "modelUsed": "biblia-rag-v1"
}
```

---

## 🛑 Tratamento de Erros e Códigos HTTP

Todas as respostas de erro seguem o padrão RFC 7807 / Fastify:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Dados de entrada inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email com formato inválido"
    }
  ]
}
```

| Código | Significado | Quando ocorre |
|---|---|---|
| `400` | Bad Request | Falha de validação do schema Zod |
| `401` | Unauthorized | Token ausente, expirado ou inválido |
| `403` | Forbidden | Sem permissão para o recurso |
| `404` | Not Found | Recurso não localizado |
| `429` | Too Many Requests | Limite de requisições por IP atingido (Rate Limit) |
| `500` | Internal Server Error | Erro inesperado no processamento do servidor |
