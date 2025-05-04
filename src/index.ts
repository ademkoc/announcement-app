import { MikroORM } from '@mikro-orm/mysql';
import { MessageService } from './message.service.ts';
import { getConfig } from './config.service.ts';
import { SdrRecordService } from './sdr-record.service.ts';
import { GarageService } from './garage.service.ts';
import { SdrRecord } from './sdr-record.entity.ts';
import { AnnouncementReceivedConsumer } from './announcement-received.consumer.ts';
import { AmqpClient } from './amqp.client.ts';
import { getLogger } from './logger.ts';
import { RecordWatchService } from './record-watch.service.ts';
import { AzureCognitiveService } from './transcription/azure-cognitive.service.ts';

const logger = getLogger();

async function main() {

  logger.info('Hey! I am starting...');

  const config = getConfig();

  const orm = await MikroORM.init();
  const amqpClient = await AmqpClient.init(config);

  process.addListener('SIGTERM', (signal) => closeServer(signal));
  process.addListener('SIGINT', (signal) => closeServer(signal));

  const closeServer = async (signal:NodeJS.Signals) => {
    logger.info(`Received signal to close: ${signal}`);
    await orm.close();
    await amqpClient.dispose();
    logger.info(`Bye!`);
    process.exit();
  };

  const garageService = new GarageService(config);
  const messageService = new MessageService(amqpClient);

  const azureCognitiveService = new AzureCognitiveService(config);

  const sdrRecordService = new SdrRecordService(orm.em.fork().getRepository(SdrRecord), azureCognitiveService);
  const recordWatchService = new RecordWatchService(config, garageService, messageService);

  messageService.addConsumer(
    'announcement_received',
    new AnnouncementReceivedConsumer(amqpClient, garageService, sdrRecordService)
  );

  await recordWatchService.bootCheck(await sdrRecordService.getAllFilenames());
  logger.info("We are ready!");
  await recordWatchService.watchFolder();
}

try {
  await main();
} catch (error) {
  logger.error(error);
}


