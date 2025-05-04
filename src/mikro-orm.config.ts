import { defineConfig } from '@mikro-orm/mysql';
import { getConfig } from './config.service.ts';

export default defineConfig({
  clientUrl: getConfig().database.url,

  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  migrations: {
    tableName: 'migrations', // name of database table with log of executed transactions
    path: './migrations', // path to the folder with migrations
    snapshot: false,
    transactional: false
  },

  debug: false,
});
