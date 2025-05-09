import { Migration } from '@mikro-orm/migrations';

export class Migration20250509075445 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`announcement\` (\`id\` integer not null primary key autoincrement, \`name\` text not null, \`district\` text not null, \`text\` text not null, \`received_at\` datetime not null, \`created_at\` datetime null, \`updated_at\` datetime null);`);
    this.addSql(`create index \`announcement_received_at_index\` on \`announcement\` (\`received_at\`);`);
  }

}
