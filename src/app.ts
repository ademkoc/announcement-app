import Fastify from 'fastify';
import { MikroORM } from '@mikro-orm/mysql';
import { MessageService } from './infrastructure/message.service.ts';
import { getConfig } from './infrastructure/config.ts';
import { AnnouncementService } from './modules/announcement/announcement.service.ts';
import { GarageService } from './modules/garage.service.ts';
import { Announcement } from './modules/announcement/announcement.entity.ts';
import { AnnouncementReceivedConsumer } from './modules/announcement/announcement-received.consumer.ts';
import { getLogger } from './infrastructure/logger.ts';
import { RecordWatchService } from './modules/announcement/record-watch.service.ts';
import { AzureCognitiveService } from './modules/transcription/azure-cognitive.service.ts';
import { ormEntityManagerHook } from './infrastructure/mikro-orm.config.ts';
import { announcementRoutePlugin } from './modules/announcement/announcement.route.ts';
import { AnnouncementTranscribedConsumer } from './modules/announcement/announcement-transcribed.consumer.ts';

export async function createApp() {
  const config = getConfig();

  const orm = await MikroORM.init();

  const garageService = new GarageService(config);
  const messageService = new MessageService();

  const azureCognitiveService = new AzureCognitiveService(config);

  const announcementService = new AnnouncementService(orm.em.fork().getRepository(Announcement), azureCognitiveService);
  const recordWatchService = new RecordWatchService(config, garageService, messageService);

  messageService.addConsumer(
    'announcement_received',
    new AnnouncementReceivedConsumer(garageService, announcementService, messageService)
  );
  messageService.addConsumer('announcement_transcribed', new AnnouncementTranscribedConsumer());

  const fastify = Fastify({ loggerInstance: getLogger() });
  fastify.addHook('onRequest', function onRequestORMHook(request, reply, done) { ormEntityManagerHook(orm.em, done); });
  fastify.addHook('onClose', async () => await orm.close());
  fastify.register(announcementRoutePlugin, { announcementService, prefix: 'v1/announcement' });

  await recordWatchService.bootCheck(await announcementService.getAllFilenames());

  // no need to await this, it will run in the background
  recordWatchService.watchFolder();

  return fastify;
}
