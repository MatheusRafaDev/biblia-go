import { FastifyInstance } from 'fastify';

export interface ClosableDatabase {
  close: () => void;
}

export function registerGracefulShutdown(
  app: FastifyInstance,
  db?: ClosableDatabase,
  processRef: NodeJS.Process = process
): () => Promise<void> {
  const shutdown = async (signal?: string) => {
    app.log.info({ signal }, 'Iniciando encerramento gracioso do servidor...');

    try {
      await app.close();
      app.log.info('Servidor Fastify encerrado com sucesso.');

      if (db && typeof db.close === 'function') {
        db.close();
        app.log.info('Conexão SQLite fechada com segurança.');
      }
    } catch (err) {
      app.log.error({ err }, 'Erro ao encerrar servidor graciosamente.');
      throw err;
    }
  };

  const handleSignal = (signal: string) => {
    shutdown(signal)
      .then(() => {
        processRef.exit(0);
      })
      .catch(() => {
        processRef.exit(1);
      });
  };

  processRef.on('SIGINT', () => handleSignal('SIGINT'));
  processRef.on('SIGTERM', () => handleSignal('SIGTERM'));

  return shutdown;
}
