import { GarageService } from "./garage.service.ts";
import type { IConsumer, Message } from "./message.service.ts";
import { SdrRecordService } from "./sdr-record.service.ts";
import { getLogger } from "./logger.ts";
import { DateTime } from 'luxon';
import EventEmitter from "node:events";

export type AnnouncementReceivedConsumerMessage = {
  filename: string;
  district: string;
  receivedAt: string;
}

export class AnnouncementReceivedConsumer extends EventEmitter implements IConsumer {
  #logger = getLogger();
  #garageService: GarageService;
  #sdrRecordService: SdrRecordService;

  constructor(
    garageService: GarageService,
    sdrRecordService: SdrRecordService,
  ) {
    super();
    this.#garageService = garageService;
    this.#sdrRecordService = sdrRecordService;
  }

  async handleMessage(payload: Message): Promise<void> {
    this.#logger.info('New message received', JSON.stringify(payload));

    const message = payload.body as AnnouncementReceivedConsumerMessage;

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
  }
}
