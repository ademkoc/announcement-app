import { SdrRecordRepository } from './sdr-record.repository.ts';
import type { ISdrRecord } from './sdr-record.entity.ts';
import type { ITranscriber } from './transcription/transcriber.ts';

export class SdrRecordService {
  #sdrRecordRepository: SdrRecordRepository;
  #transcribeStrategy: ITranscriber;

  constructor(
    sdrRecordRepository: SdrRecordRepository,
    transcribeStrategy: ITranscriber,
  ) {
    this.#sdrRecordRepository = sdrRecordRepository;
    this.#transcribeStrategy = transcribeStrategy;
  }

  async getAllFilenames() {
    const sdrRecords = await this.#sdrRecordRepository
      .createQueryBuilder()
      .select(['id', 'name'])
      .getResult();

    return sdrRecords.map(sdrRecord => sdrRecord.name);
  }

  async save(data: Pick<ISdrRecord, 'name' | 'district' | 'text' | 'receivedAt'>) {
    this.#sdrRecordRepository.create(data);
    await this.#sdrRecordRepository.getEntityManager().flush();
  }

  transcribe(filename: string, stream: ReadableStream) {
    return this.#transcribeStrategy.transcribe(filename, stream);
  }
}
