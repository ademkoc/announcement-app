# announcement

npm run migration:create -- --config ./src/mikro-orm.config.ts
npm run migration:up -- --config ./src/mikro-orm.config.ts

rabbitmqctl purge_queue announcement_received
