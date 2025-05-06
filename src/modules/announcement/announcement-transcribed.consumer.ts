import type { IConsumer, Message } from "../../infrastructure/message.service.ts";
import { getLogger } from "../../infrastructure/logger.ts";
import EventEmitter from "node:events";

export type AnnouncementTranscribedConsumerMessage = {
  filename: string;
  district: string;
  receivedAt: string;
}

export class AnnouncementTranscribedConsumer extends EventEmitter implements IConsumer {
  #logger = getLogger().child({ name: this.constructor.name });

  constructor(
  ) {
    super();
  }

  async handleMessage(payload: Message): Promise<void> {
    this.#logger.info('New message received', JSON.stringify(payload));

    await fetch('https://ntfy.sh/ademkoc', {
      method: 'POST',
      body: payload.body.text as string
    });
  }
}
