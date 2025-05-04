import type { ConsumeMessage } from "amqplib";
import { GarageService } from "./garage.service.ts";
import type { IConsumer } from "./message.service.ts";
import { AmqpClient } from "./amqp.client.ts";
import { SdrRecordService } from "./sdr-record.service.ts";
import { getLogger } from "./logger.ts";
import { DateTime } from 'luxon';

export class AnnouncementReceivedConsumer implements IConsumer {
  #logger = getLogger();
  #amqpClient: AmqpClient;
  #garageService: GarageService;
  #sdrRecordService: SdrRecordService;

  constructor(
    amqpClient: AmqpClient,
    garageService: GarageService,
    sdrRecordService: SdrRecordService,
  ) {
    this.#amqpClient = amqpClient;
    this.#garageService = garageService;
    this.#sdrRecordService = sdrRecordService;
  }

  async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    this.#logger.info('New message received', JSON.stringify(msg));

    if (msg === null) {
      return;
    }

    const message = JSON.parse(msg.content.toString()) as
      { filename: string, district: string, receivedAt: string };

    const file = await this.#garageService.getFile(message.filename);

    if (file) {
      const text = await this.#sdrRecordService.transcribe(message.filename, file.transformToWebStream());

      const receivedAt = DateTime.fromFormat(message.receivedAt, 'yyyy-MM-dd HH:mm:ss').toJSDate();

      await this.#sdrRecordService.save({
        name: message.filename,
        district: message.district,
        receivedAt,
        text
      });
    }

    this.#amqpClient.channel.ack(msg);
  }
}
