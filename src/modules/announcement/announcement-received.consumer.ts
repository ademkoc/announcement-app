import { DateTime } from 'luxon';
import EventEmitter from "node:events";
import { GarageService } from "../garage.service.ts";
import type { IConsumer, Message, MessageService } from "../../infrastructure/message.service.ts";
import { AnnouncementService } from "./announcement.service.ts";
import { logger } from "../../infrastructure/logger.ts";

export type AnnouncementReceivedConsumerMessage = {
  filename: string;
  district: string;
  receivedAt: string;
}

export class AnnouncementReceivedConsumer extends EventEmitter implements IConsumer {
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

  async handleMessage(message: Message<AnnouncementReceivedConsumerMessage>): Promise<void> {
    const childLogger = logger.child({ consumer: this.constructor.name });
    childLogger.info({ message }, 'Received message!');

    const payload = message.body as AnnouncementReceivedConsumerMessage;

    const file = await this.#garageService.getFile(payload.filename);

    if (file) {
      const text = await this.#announcementService.transcribe(payload.filename, file.transformToWebStream());

      const receivedAt = DateTime.fromFormat(payload.receivedAt, 'yyyy-MM-dd HH:mm:ss').toJSDate();

      const announcement = await this.#announcementService.save({
        name: payload.filename,
        district: payload.district,
        receivedAt,
        text
      });

      this.#messageService.sendMessage('announcement_transcribed', {
        id: 'announcementTranscribed',
        body: announcement
      });
    }
  }
}
