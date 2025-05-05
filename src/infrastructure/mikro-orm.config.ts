import { defineConfig } from '@mikro-orm/mysql';
import { getDatabaseConfig } from './config.ts';

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
