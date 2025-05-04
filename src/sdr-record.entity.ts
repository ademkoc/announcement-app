import { EntitySchema, OptionalProps } from '@mikro-orm/core';
import { SdrRecordRepository } from './sdr-record.repository.ts';

export interface ISdrRecord {
  id: number;
  name: string;
  district: string;
  text: string;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  [OptionalProps]?: 'createdAt' | 'updatedAt';
}

export const SdrRecord = new EntitySchema<ISdrRecord>({
  name: 'SdrRecord',
  repository: () => SdrRecordRepository,
  properties: {
    id: { type: 'number', primary: true },
    name: { type: 'varchar', length: 255, nullable: false },
    district: { type: 'varchar', length: 255, nullable: false },
    text: { type: 'text', nullable: false },
    receivedAt: { type: 'Date', nullable: false, index: true },
    createdAt: { type: 'Date', onCreate: () => new Date(), nullable: true },
    updatedAt: { type: 'Date', onCreate: () => new Date(), onUpdate: () => new Date(), nullable: true }
  }
});

