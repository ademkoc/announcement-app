import packageJson from '../package.json' with { type: 'json' };
import { createApp } from './app.ts';
import { getConfig } from './infrastructure/config.ts';
import { logger } from './infrastructure/logger.ts';

export const abortController = new AbortController();

async function startServer() {
  const config = getConfig();

  logger.info('Starting application...');

  const app = await createApp();

  try {
    await app.listen({
      host: config.server.bindAddress,
      port: config.server.port,
      signal: abortController.signal,
      listenTextResolver: (address) => {
        return `${packageJson.name} project listening at ${address}`;
      }
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  process.addListener('SIGTERM', (signal) => closeServer(signal));
  process.addListener('SIGINT', (signal) => closeServer(signal));

  const closeServer = (signal: NodeJS.Signals) => {
    app.log.info(`Received signal to close: ${signal}`);
    abortController.abort();
    app.log.info(`Bye!`);
    process.exit(0);
  };

  logger.info("We are ready!");
}

try {
  await startServer();
} catch (error) {
  console.error(error);
}
