import path from 'node:path';
import fs from 'node:fs/promises';
import type { Config } from '../../infrastructure/config.ts';
import { GarageService } from '../garage.service.ts';
import { MessageService } from '../../infrastructure/message.service.ts';
import { logger, setLoggerContext } from '../../infrastructure/logger.ts';

export class RecordWatchService {
  #config: Config;
  #messageService: MessageService;
  #garageService: GarageService;

  constructor(
    config: Config,
    garageService: GarageService,
    messageService: MessageService,
  ) {
    this.#config = config;
    this.#messageService = messageService;
    this.#garageService = garageService;
  }

  async readFolder() {
    try {
      const files = await fs.readdir(this.#config.recordingsFolderPath);
      return files.filter(file => path.extname(file) === '.mp3');
    } catch (err) {
      throw new Error('Recordings can not read', { cause: err })
    }
  }

  async bootCheck(exclude: string[]) {
    const files = await this.readFolder();

    const filenamesInFolder = new Set(files);
    const filenamesInDatabase = new Set(exclude);

    const difference = new Set(
      Array.from(filenamesInFolder).filter(x => !filenamesInDatabase.has(x))
    );

    await Promise.all(
      Array.from(difference).map(filename => setLoggerContext(filename, () => this.preProcess(filename))));
  }

  async preProcess(filename: string) {
    const fullpath = path.join(this.#config.recordingsFolderPath, filename);

    await this.#garageService.uploadFile(filename, fullpath);

    const [district, , , receiveDate, receiveTimeLike] = filename.split('_');
    const receiveTime = path.basename(receiveTimeLike, '.mp3');
    const formatedDate = `${receiveDate.slice(0, 4)}-${receiveDate.slice(4, 6)}-${receiveDate.slice(6, 8)}`;
    const formatedTime = `${receiveTime.slice(0, 2)}:${receiveTime.slice(2, 4)}:${receiveTime.slice(4, 6)}`;

    this.#messageService.sendMessage('announcement_received', {
      id: 'announcementReceived',
      body: {
        filename,
        district: district.charAt(0).toUpperCase() + district.slice(1),
        receivedAt: `${formatedDate} ${formatedTime}`,
      }
    });

    logger.info('Message sent!');
  }

  async watchFolder() {
    for await (const event of fs.watch(this.#config.recordingsFolderPath, {})) {
      logger.debug(event);

      const filename = event.filename;
      if (!filename || filename === '.DS_Store') {
        continue;
      }

      if (path.extname(filename) === '.mp3') {
        setLoggerContext(filename, () => this.preProcess(filename));
      }
    }
  }
}