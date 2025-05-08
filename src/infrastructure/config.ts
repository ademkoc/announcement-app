import type { Level } from 'pino';
import packageJson from '../../package.json' with { type: 'json' };

export type Environment = 'test' | 'production' | 'development';

export function getEnv<T extends string>(key: string): T | undefined {
  return process.env[key] as T;
}

export function getIntegerEnv(key: string): number | undefined {
  const value = getEnv(key);
  if (!value) {
    return undefined;
  }

  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new Error(`Unable to use env var with key: '${key}'`);
  }

  return parsedValue;
}

export function getMandatoryEnv(key: string): string {
  const value = getEnv(key);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to find env var with key: '${key}'`);
  }
  return value;
}

export function getDatabaseConfig() {
  return {
    url: getMandatoryEnv('DATABASE_URL'),
  };
}

export function getConfig(): Config {
  return {
    nodeEnv: getMandatoryEnv('NODE_ENV') as Environment,
    serviceName: getEnv('SERVICE_NAME') || packageJson.name,
    environment: getMandatoryEnv('APP_ENV') as Environment,
    logLevel: getEnv('LOG_LEVEL') as Level || 'info',

    server: {
      port: getIntegerEnv('APP_PORT') ?? 3000,
      bindAddress: getEnv('APP_BIND_ADDRESS') || '0.0.0.0'
    },

    storage: {
      region: getMandatoryEnv('AWS_DEFAULT_REGION'),
      accessKeyId: getMandatoryEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: getMandatoryEnv('AWS_SECRET_ACCESS_KEY'),
      recordingsBucket: getMandatoryEnv('AWS_RECORDINGS_BUCKET'),
    },

    azureSpeech: {
      key: getMandatoryEnv('AZURE_SPEECH_SUBSCRIPTION_KEY'),
      region: getMandatoryEnv('AZURE_SPEECH_REGION'),
    },

    whisperModelPath: getMandatoryEnv('WHISPER_MODEL_PATH'),

    recordingsFolderPath: getMandatoryEnv('RECORDINGS_FOLDER_PATH'),
  };
}

export type Config = {
  nodeEnv: Environment;
  serviceName: string;
  environment: Environment;
  logLevel: Level;

  server: {
    port: number;
    bindAddress: string;
  }

  storage: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    recordingsBucket: string;
  };

  azureSpeech: {
    key: string;
    region: string;
  };

  whisperModelPath: string;

  recordingsFolderPath: string;
}