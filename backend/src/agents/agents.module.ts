import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentService } from './agent.service';
import { AgentMemoryService } from './agent-memory.service';
import { WorkflowOrchestratorService } from './workflow-orchestrator.service';
import { AgentMapping } from './entities/agent-mapping.entity';
import { WorkflowRun } from './entities/workflow-run.entity';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentMapping, WorkflowRun]),
    McpModule,
  ],
  providers: [
    AgentService,
    AgentMemoryService,
    WorkflowOrchestratorService,
  ],
  exports: [AgentService, AgentMemoryService, WorkflowOrchestratorService],
})
export class AgentsModule {}
