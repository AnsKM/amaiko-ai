import { Module } from '@nestjs/common';
import { EmailToolsService } from './tools/email-tools.service';
import { CalendarToolsService } from './tools/calendar-tools.service';
import { FileToolsService } from './tools/file-tools.service';
import { GraphModule } from '../graph/graph.module';

@Module({
  imports: [GraphModule],
  providers: [
    EmailToolsService,
    CalendarToolsService,
    FileToolsService,
  ],
  exports: [
    EmailToolsService,
    CalendarToolsService,
    FileToolsService,
  ],
})
export class McpModule {}
