import type EventEmitter from 'node:events';

type Queue = 'announcement_received';

export type Message = { id: string; body: Record<string, unknown> };

export interface IConsumer {
  handleMessage: (msg: Message) => void
}

type ConsumerType = EventEmitter & IConsumer;

export class MessageService {
  #consumers: Map<string, ConsumerType>;

  constructor() {
    this.#consumers = new Map<string, ConsumerType>;
  }

  addConsumer(name: string, consumer: ConsumerType) {
    this.#consumers.set(name, consumer);
    this.#defineConsumers();
  }

  #defineConsumers() {
    for (const [, consumer] of this.#consumers) {
      consumer.on('message', consumer.handleMessage);
    }
  }

  sendMessage(queue: Queue, payload: Message) {
    const consumer = this.#consumers.get(queue);
    if (!consumer) {
      throw new Error(`Consumer not found for queue: ${queue}`);
    }
    consumer.emit('message', payload);
  }
}