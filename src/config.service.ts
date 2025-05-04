import type { Level } from 'pino';
import packageJson from '../package.json' with { type: 'json' };

export type Environment = 'test' | 'production' | 'development';

export function getEnv<T extends string>(key: string): T | undefined {
  return process.env[key] as T;
}

export function getMandatoryEnv(key: string): string {
  const value = getEnv(key);
  if (typeof value === 'undefined') {
    throw new Error(`Unable to find env var with key: '${key}'`);
  }
  return value;
}

export function getConfig(): Config {
  return {
    nodeEnv: getMandatoryEnv('NODE_ENV') as Environment,
    serviceName: getEnv('SERVICE_NAME') || packageJson.name,
    environment: getMandatoryEnv('APP_ENV') as Environment,
    logLevel: getEnv('LOG_LEVEL') as Level || 'info',

    database: {
      url: getMandatoryEnv('DATABASE_URL')
    },

    storage: {
      region: getMandatoryEnv('AWS_DEFAULT_REGION'),
      accessKeyId: getMandatoryEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: getMandatoryEnv('AWS_SECRET_ACCESS_KEY'),
      recordingsBucket: getMandatoryEnv('AWS_RECORDINGS_BUCKET'),
    },

    amqp: {
      hostname: getMandatoryEnv('AMQP_HOSTNAME'),
      username: getMandatoryEnv('AMQP_USERNAME'),
      password: getMandatoryEnv('AMQP_PASSWORD'),
    },

    azureSpeech: {
      key: getMandatoryEnv('AZURE_SPEECH_SUBSCRIPTION_KEY'),
      region: getMandatoryEnv('AZURE_SPEECH_REGION'),
    },

    recordingsFolderPath: getMandatoryEnv('RECORDINGS_FOLDER_PATH'),
  };
}
export type Config = {
  nodeEnv: Environment;
  serviceName: string;
  environment: Environment;
  logLevel: Level;

  database: {
    url: string;
  }

  storage: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    recordingsBucket: string;
  };

  amqp: {
    hostname: string;
    username: string;
    password: string;
  };

  azureSpeech: {
    key: string;
    region: string;
  };

  recordingsFolderPath: string;
}