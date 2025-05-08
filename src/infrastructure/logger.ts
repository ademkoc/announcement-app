import pino, { type Logger } from 'pino';
import pretty from 'pino-pretty';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getConfig } from "./config.ts";

const config = getConfig();
const context = new AsyncLocalStorage<{ logger: Logger }>();

function getLogger() {
  if (config.environment !== 'production') {
    return pino.default(
      pretty({
        sync: true,
        minimumLevel: config.logLevel,
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid'
      })
    );
  }

  return pino.default({
    level: config.logLevel,
  });
}

export const logger = new Proxy(getLogger(), {
  get(target, property, receiver) {
    const store = context.getStore();
    return Reflect.get(store?.logger ?? target, property, receiver);
  },
});

export function setLoggerContext(filename: string, callback: () => void) {
  return context.run({ logger: getLogger().child({ filename }) }, callback);
}
