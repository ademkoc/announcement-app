import amqp from 'amqplib';
import type { Channel, ChannelModel } from 'amqplib';
import type { Config } from './config.service.ts';

export class AmqpClient {
  channel: Channel;
  #connection: ChannelModel;

  constructor(connection: ChannelModel, channel: Channel) {
    this.#connection = connection;
    this.channel = channel;
  }

  static async init(config: Config) {
    const connection = await amqp.connect({
      hostname: config.amqp.hostname,
      username: config.amqp.username,
      password: config.amqp.password,
    });
    connection.on('error', (err) => {});

    const channel = await connection.createChannel();
    channel.on('error', (err) => {});

    await channel.assertQueue('announcement_received', { durable: true });
    await channel.prefetch(1);

    return new AmqpClient(connection, channel);
  }

  async dispose() {
    try {
      await this.channel.close();
      await this.#connection.close();
    } catch {}
  }
}