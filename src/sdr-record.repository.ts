import { EntityRepository } from '@mikro-orm/mysql';
import type { ISdrRecord } from './sdr-record.entity.ts';

export class SdrRecordRepository extends EntityRepository<ISdrRecord> {}
