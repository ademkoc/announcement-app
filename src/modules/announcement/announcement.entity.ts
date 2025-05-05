import { EntitySchema, OptionalProps } from '@mikro-orm/core';
import { AnnouncementRepository } from './announcement.repository.ts';

export interface IAnnouncement {
  id: number;
  name: string;
  district: string;
  text: string;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  [OptionalProps]?: 'createdAt' | 'updatedAt';
}

export const Announcement = new EntitySchema<IAnnouncement>({
  name: 'Announcement',
  repository: () => AnnouncementRepository,
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

