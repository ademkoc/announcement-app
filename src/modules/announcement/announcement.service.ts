import { AnnouncementRepository } from './announcement.repository.ts';
import type { IAnnouncement } from './announcement.entity.ts';
import type { TranscriberStrategy } from '../transcription/strategy.ts';

export class AnnouncementService {
  #announcementRepository: AnnouncementRepository;
  #transcribeStrategy: TranscriberStrategy;

  constructor(
    announcementRepository: AnnouncementRepository,
    transcribeStrategy: TranscriberStrategy,
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
    const announcement = this.#announcementRepository.create(data);
    await this.#announcementRepository.getEntityManager().flush();
    return announcement;
  }

  transcribe(filename: string, stream: ReadableStream) {
    return this.#transcribeStrategy.transcribe(filename, stream);
  }
}
