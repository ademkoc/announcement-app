import { EntityRepository } from '@mikro-orm/mysql';
import type { IAnnouncement } from './announcement.entity.ts';

export class AnnouncementRepository extends EntityRepository<IAnnouncement> {}
