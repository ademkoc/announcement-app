import type { ConsumeMessage } from 'amqplib';
import { AmqpClient } from './amqp.client.ts';

type Queue = 'announcement_received';

export interface IConsumer {
  handleMessage: (msg: ConsumeMessage | null) => void
}

export class MessageService {
  #amqpClient: AmqpClient;
  #consumers: Map<string, IConsumer>;

  constructor(amqpClient: AmqpClient) {
    this.#amqpClient = amqpClient;
    this.#consumers = new Map<string, IConsumer>;
  }

  addConsumer(name: string, consumer: IConsumer) {
    this.#consumers.set(name, consumer);
    this.#defineConsumers();
  }

  #defineConsumers() {
    for (const [queue, consumer] of this.#consumers) {
      this.#amqpClient.channel.consume(queue, consumer.handleMessage.bind(consumer));
    }
  }

  sendMessage(queue: Queue, data: Record<string, unknown>) {
    return this.#amqpClient.channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true })
  }
}