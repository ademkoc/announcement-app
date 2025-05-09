import { EntityRepository } from '@mikro-orm/better-sqlite';
import type { IAnnouncement } from './announcement.entity.ts';

export class AnnouncementRepository extends EntityRepository<IAnnouncement> {}
