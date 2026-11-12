# ADR 002: Arquitetura do Backend com Fastify, TypeScript e Docker

## Status
Aceito

## Contexto
Para a Fase 2 do projeto Bíblia Go, é necessário um backend autônomo para autenticação JWT, sincronização em nuvem, busca semântica vetorial e pipeline RAG para o assistente de IA. Como o desenvolvedor possui perfil voltado a backend (Node.js/TS, C#/.NET, SQL, Docker, AWS), o servidor deve demonstrar excelência em arquitetura limpa, alta performance e conteinerização.

Alternativas consideradas:
1. **Express.js**: Tradicional, porém mais lento e com suporte a TypeScript/async-await menos elegante sem middlewares adicionais.
2. **NestJS**: Completo, porém com sobrecarga pesada de decorators e boilerplate para serviços de microsserviço enxutos.
3. **Fastify com TypeScript Strict e Zod**: O mais rápido framework HTTP do ecossistema Node, com validação de schemas em tempo de compilação/execução e arquitetura modular de plugins (`fastify-plugin`).

## Decisão
Adotamos o **Fastify** com **TypeScript em modo strict**, validação via **Zod**, banco de dados através da biblioteca nativa **`node:sqlite`** (Node 22+) e conteinerização multi-stage via **Docker**.

## Consequências
### Positivas
- Throughput até 4x superior ao Express em benchmarks I/O.
- Validação automática de payloads e tipagem inferida com precisão ponta-a-ponta via Zod.
- Uso de `node:sqlite` elimina necessidade de compilação de binários nativos no build Docker (Node Alpine).
- Imagem final de produção enxuta (~120MB) com usuário não-root (`appuser`).
- Suporte nativo a Healthcheck e Graceful Shutdown.

### Negativas / Mitigações
- Ecossistema de plugins ligeiramente diferente do Express. Mitigado usando plugins padrão (`@fastify/cors`, `@fastify/jwt`) e plugins customizados limpos.

