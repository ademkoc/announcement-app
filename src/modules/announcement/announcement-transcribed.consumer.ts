import type { IConsumer, Message } from "../../infrastructure/message.service.ts";
import { logger } from "../../infrastructure/logger.ts";
import EventEmitter from "node:events";
import type { IAnnouncement } from "./announcement.entity.ts";

export class AnnouncementTranscribedConsumer extends EventEmitter implements IConsumer {
  constructor() {
    super();
  }

  async handleMessage(message: Message<IAnnouncement>): Promise<void> {
    const childLogger = logger.child({ consumer: this.constructor.name });
    childLogger.info({ message }, 'New message received');

    await fetch('https://ntfy.sh/ademkoc', {
      method: 'POST',
      body: message.body.text as string,
      headers: { 'Title': message.body.district, 'Tags': 'loudspeaker' }
    });
  }
}
