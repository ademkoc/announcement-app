import { GarageService } from "../garage.service.ts";
import type { IConsumer, Message, MessageService } from "../../infrastructure/message.service.ts";
import { AnnouncementService } from "./announcement.service.ts";
import { getLogger } from "../../infrastructure/logger.ts";
import { DateTime } from 'luxon';
import EventEmitter from "node:events";

export type AnnouncementReceivedConsumerMessage = {
  filename: string;
  district: string;
  receivedAt: string;
}

export class AnnouncementReceivedConsumer extends EventEmitter implements IConsumer {
  #logger = getLogger().child({ name: this.constructor.name });
  #garageService: GarageService;
  #announcementService: AnnouncementService;
  #messageService: MessageService;

  constructor(
    garageService: GarageService,
    announcementService: AnnouncementService,
    messageService: MessageService,
  ) {
    super();
    this.#garageService = garageService;
    this.#announcementService = announcementService;
    this.#messageService = messageService;
  }

  async handleMessage(payload: Message): Promise<void> {
    this.#logger.info('New message received', JSON.stringify(payload));

    const message = payload.body as AnnouncementReceivedConsumerMessage;

    const file = await this.#garageService.getFile(message.filename);

    if (file) {
      const text = await this.#announcementService.transcribe(message.filename, file.transformToWebStream());

      const receivedAt = DateTime.fromFormat(message.receivedAt, 'yyyy-MM-dd HH:mm:ss').toJSDate();

      await this.#announcementService.save({
        name: message.filename,
        district: message.district,
        receivedAt,
        text
      });

      this.#messageService.sendMessage('announcement_transcribed', {
        id: 'announcementTranscribed',
        body: {
          text
        }
      });
    }
  }
}
