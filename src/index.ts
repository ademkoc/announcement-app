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

const logger = getLogger();

async function main() {

  logger.info('Hey! I am starting...');

  const config = getConfig();

  const orm = await MikroORM.init();

  process.addListener('SIGTERM', (signal) => closeServer(signal));
  process.addListener('SIGINT', (signal) => closeServer(signal));

  const closeServer = async (signal: NodeJS.Signals) => {
    logger.info(`Received signal to close: ${signal}`);
    await orm.close();
    logger.info(`Bye!`);
    process.exit();
  };

  const garageService = new GarageService(config);
  const messageService = new MessageService();

  const azureCognitiveService = new AzureCognitiveService(config);

  const announcementService = new AnnouncementService(orm.em.fork().getRepository(Announcement), azureCognitiveService);
  const recordWatchService = new RecordWatchService(config, garageService, messageService);

  messageService.addConsumer(
    'announcement_received',
    new AnnouncementReceivedConsumer(garageService, announcementService)
  );

  await recordWatchService.bootCheck(await announcementService.getAllFilenames());
  logger.info("We are ready!");
  await recordWatchService.watchFolder();
}

try {
  await main();
} catch (error) {
  logger.error(error);
}


