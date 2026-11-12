import { buildApp } from './app.js';
import { env } from './config/env.js';
import { getDatabase, checkpointDatabase } from './db/client.js';
import { registerGracefulShutdown } from './utils/gracefulShutdown.js';

const app = buildApp();
const db = getDatabase();

// Register graceful termination listeners (SIGINT, SIGTERM)
registerGracefulShutdown(app, {
  close: () => {
    checkpointDatabase();
    db.close();
  },
});

async function start() {
  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });
    console.log(`🚀 Bíblia Go Fastify Server rodando em ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
