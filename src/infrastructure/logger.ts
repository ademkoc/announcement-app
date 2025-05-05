import pino from 'pino';
import pretty from 'pino-pretty';
import { getConfig, type Config } from "./config.ts";

let cache: pino.Logger<never, boolean>;

export function getLogger() {
  if (cache) {
    return cache;
  }

  const config = getConfig();

  if (config.environment !== 'production') {
    cache = pino.default(
      pretty({
        sync: true,
        minimumLevel: config.logLevel,
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'hostname,pid'
      })
    );

    return cache;
  }

  cache = pino.default({
    level: config.logLevel,
  });

  return cache;
}
