import { Migration } from '@mikro-orm/migrations';

export class Migration20250505121255 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`announcement\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`district\` varchar(255) not null, \`text\` text not null, \`received_at\` datetime not null, \`created_at\` datetime null, \`updated_at\` datetime null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`announcement\` add index \`announcement_received_at_index\`(\`received_at\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists \`announcement\`;`);
  }

}
