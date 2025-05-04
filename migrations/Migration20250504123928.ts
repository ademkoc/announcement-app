import { Migration } from '@mikro-orm/migrations';

export class Migration20250504123928 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`sdr_record\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`district\` varchar(255) not null, \`text\` text not null, \`received_at\` datetime not null, \`created_at\` datetime null, \`updated_at\` datetime null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`sdr_record\` add index \`sdr_record_received_at_index\`(\`received_at\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`sdr_record\`;`);
  }

}
