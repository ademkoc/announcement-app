import { AnnouncementRepository } from './announcement.repository.ts';
import type { IAnnouncement } from './announcement.entity.ts';
import type { ITranscriber } from '../transcription/transcriber.ts';

export class AnnouncementService {
  #announcementRepository: AnnouncementRepository;
  #transcribeStrategy: ITranscriber;

  constructor(
    announcementRepository: AnnouncementRepository,
    transcribeStrategy: ITranscriber,
  ) {
    this.#announcementRepository = announcementRepository;
    this.#transcribeStrategy = transcribeStrategy;
  }

  getAll(pagination: { offset: number; limit: number }) {
    return this.#announcementRepository.findAndCount({}, { limit: pagination.limit, offset: pagination.offset });
  }

  async getAllFilenames() {
    const announcements = await this.#announcementRepository
      .createQueryBuilder()
      .select(['id', 'name'])
      .getResult();

    return announcements.map(announcement => announcement.name);
  }

  async save(data: Pick<IAnnouncement, 'name' | 'district' | 'text' | 'receivedAt'>) {
    this.#announcementRepository.create(data);
    await this.#announcementRepository.getEntityManager().flush();
  }

  transcribe(filename: string, stream: ReadableStream) {
    return this.#transcribeStrategy.transcribe(filename, stream);
  }
}
