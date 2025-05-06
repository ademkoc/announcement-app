import { defineConfig, EntityManager, RequestContext } from '@mikro-orm/mysql';
import { getDatabaseConfig } from './config.ts';
import type { HookHandlerDoneFunction } from 'fastify';

export default defineConfig({
  clientUrl: getDatabaseConfig().url,

  entities: ['src/modules/**/*.entity.ts'],

  migrations: {
    tableName: 'migrations', // name of database table with log of executed transactions
    path: './migrations', // path to the folder with migrations
    snapshot: false,
    transactional: false
  },

  debug: false
});

export const ormEntityManagerHook =
  (em: EntityManager, done: HookHandlerDoneFunction) => RequestContext.create(em, done);
