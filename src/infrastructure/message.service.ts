import type EventEmitter from 'node:events';

type Queue = 'announcement_received' | 'announcement_transcribed';

export type Message<T> = { id: string; body: T };

export interface IConsumer {
  handleMessage: (msg: Message<any>) => void
}

type ConsumerType = EventEmitter & IConsumer;

export class MessageService {
  #consumers: Map<string, ConsumerType>;

  constructor() {
    this.#consumers = new Map<string, ConsumerType>;
  }

  addConsumer(name: string, consumer: ConsumerType) {
    this.#consumers.set(name, consumer);
    consumer.on('message', consumer.handleMessage);
    // process only one message at a time
    consumer.setMaxListeners(1);
  }

  sendMessage(queue: Queue, payload: Message<any>) {
    const consumer = this.#consumers.get(queue);
    if (!consumer) {
      throw new Error(`Consumer not found for queue: ${queue}`);
    }
    consumer.emit('message', payload);
  }
}