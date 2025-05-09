import { defineConfig, EntityManager, RequestContext } from '@mikro-orm/better-sqlite';
import type { HookHandlerDoneFunction } from 'fastify';

export default defineConfig({
  dbName: 'sqlite.db',

  entities: ['dist/src/modules/**/*.entity.js'],
  entitiesTs: ['src/modules/**/*.entity.ts'],

  migrations: {
    tableName: 'migrations', // name of database table with log of executed transactions
    path: './migrations', // path to the folder with migrations
    snapshot: false,
    transactional: false
  },

  debug: false,
  preferTs: process.env.MIKROORM_PREFER_TS === 'true',
});

export const ormEntityManagerHook =
  (em: EntityManager, done: HookHandlerDoneFunction) => RequestContext.create(em, done);
