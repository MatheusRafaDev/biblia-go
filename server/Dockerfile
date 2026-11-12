# Multi-stage Dockerfile para o Fastify Backend da Bíblia Go
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build
RUN npm prune --production

# Production Runner Stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3333
ENV HOST=0.0.0.0
ENV DATABASE_PATH=/app/data/biblia_go_server.db

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3333

CMD ["node", "dist/server.js"]
