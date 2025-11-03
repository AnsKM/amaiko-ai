import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowRun, WorkflowStatus } from './entities/workflow-run.entity';
import { AgentService } from './agent.service';

export interface WorkflowStage {
  id: string;
  agent: string;
  tool: string;
  inputMapping?: Record<string, any>;
  outputKey?: string;
}

export interface WorkflowDefinition {
  name: string;
  description: string;
  stages: WorkflowStage[];
}

/**
 * Service to orchestrate multi-agent workflows
 * Coordinates tasks across email, calendar, CRM, and knowledge agents
 */
@Injectable()
export class WorkflowOrchestratorService {
  private readonly logger = new Logger(WorkflowOrchestratorService.name);

  // Registered workflow definitions (can be extended at runtime)
  private workflows: Map<string, WorkflowDefinition> = new Map();

  // In-memory store for sensitive workflow execution data (e.g., user tokens)
  private workflowTokens: Map<string, string> = new Map();

  constructor(
    @InjectRepository(WorkflowRun)
    private workflowRunRepository: Repository<WorkflowRun>,
    private agentService: AgentService,
  ) {
    this.registerWorkflow({
      name: 'inbox_review',
      description:
        'Pull a quick list of recent emails to help the user stay on top of follow-ups.',
      stages: [
        {
          id: 'recent_inbox',
          agent: 'email-agent',
          tool: 'search_emails',
          inputMapping: {
            query: 'follow up',
            maxResults: 5,
          },
        },
      ],
    });
  }

  /**
   * Start a workflow execution
   */
  async startWorkflow(
    workflowName: string,
    userId: string,
    context: Record<string, any>,
  ): Promise<WorkflowRun> {
    try {
      this.logger.log(`Starting workflow ${workflowName} for user ${userId}`);

      const workflow = this.workflows.get(workflowName);

      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowName}`);
      }

      // Create workflow run record
      const { userToken, ...sanitizedContext } = context;

      if (!workflow.stages.length) {
        throw new Error(`Workflow ${workflowName} has no stages defined`);
      }

      const workflowRun = this.workflowRunRepository.create({
        workflowName,
        userId,
        status: WorkflowStatus.PENDING,
        context: sanitizedContext,
        currentStage: workflow.stages[0].id,
        retryCount: 0,
      });

      await this.workflowRunRepository.save(workflowRun);

      if (userToken) {
        this.workflowTokens.set(workflowRun.id, userToken);
      }

      // Start execution asynchronously
      this.executeWorkflow(workflowRun.id).catch((error) => {
        this.logger.error(
          `Error executing workflow ${workflowRun.id}`,
          error,
        );
      });

      return workflowRun;
    } catch (error) {
      this.logger.error('Error starting workflow', error);
      throw error;
    }
  }

  /**
   * Execute a workflow run
   */
  private async executeWorkflow(workflowRunId: string): Promise<void> {
    try {
      let workflowRun = await this.workflowRunRepository.findOne({
        where: { id: workflowRunId },
      });

      if (!workflowRun) {
        throw new Error(`Workflow run not found: ${workflowRunId}`);
      }

      const workflow = this.workflows.get(workflowRun.workflowName);

      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowRun.workflowName}`);
      }

      const userToken = this.workflowTokens.get(workflowRunId);

      if (!userToken) {
        throw new Error('User token not available for workflow execution');
      }

      // Update status to running
      workflowRun.status = WorkflowStatus.RUNNING;
      workflowRun.startedAt = new Date();
      await this.workflowRunRepository.save(workflowRun);

      // Execute each stage sequentially
      const stageResults: Record<string, any> = {};

      for (const stage of workflow.stages) {
        try {
          this.logger.log(
            `Executing stage ${stage.id} of workflow ${workflowRunId}`,
          );

          // Update current stage
          workflowRun.currentStage = stage.id;
          await this.workflowRunRepository.save(workflowRun);

          // Prepare stage input (can reference previous stage outputs)
          const stageInput = this.prepareStageInput(
            stage,
            workflowRun.context,
            stageResults,
          );

          // Execute the tool
          const stageResult = await this.agentService.executeTool(
            stage.tool,
            stageInput,
            {
              userToken,
              userId: workflowRun.userId,
            },
          );

          // Store stage result
          stageResults[stage.id] = stageResult;

          this.logger.log(
            `Stage ${stage.id} completed successfully`,
          );
        } catch (error) {
          this.logger.error(`Error in stage ${stage.id}`, error);

          // Check if we should retry
          if (workflowRun.retryCount < 3) {
            workflowRun.retryCount++;
            await this.workflowRunRepository.save(workflowRun);

            // Retry the workflow
            this.logger.log(
              `Retrying workflow ${workflowRunId}, attempt ${workflowRun.retryCount}`,
            );
            await this.executeWorkflow(workflowRunId);
            return;
          } else {
            // Max retries reached, mark as failed
            throw error;
          }
        }
      }

      // Workflow completed successfully
      workflowRun.status = WorkflowStatus.COMPLETED;
      workflowRun.completedAt = new Date();
      workflowRun.result = stageResults;
      await this.workflowRunRepository.save(workflowRun);

      this.logger.log(`Workflow ${workflowRunId} completed successfully`);
    } catch (error) {
      // Mark workflow as failed
      const workflowRun = await this.workflowRunRepository.findOne({
        where: { id: workflowRunId },
      });

      if (workflowRun) {
        workflowRun.status = WorkflowStatus.FAILED;
        workflowRun.error = error.message;
        workflowRun.completedAt = new Date();
        await this.workflowRunRepository.save(workflowRun);
      }

      throw error;
    } finally {
      this.workflowTokens.delete(workflowRunId);
    }
  }

  /**
   * Prepare input for a workflow stage
   */
  private prepareStageInput(
    stage: WorkflowStage,
    context: Record<string, any>,
    previousResults: Record<string, any>,
  ): any {
    if (!stage.inputMapping) {
      return context;
    }

    const input: Record<string, any> = {};

    for (const [key, value] of Object.entries(stage.inputMapping)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        // Reference to previous stage output
        const refPath = value.substring(1).split('.');
        let refValue = previousResults;

        for (const part of refPath) {
          refValue = refValue?.[part];
        }

        input[key] = refValue;
      } else {
        input[key] = value;
      }
    }

    return input;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowRunId: string): Promise<WorkflowRun> {
    try {
      const workflowRun = await this.workflowRunRepository.findOne({
        where: { id: workflowRunId },
      });

      if (!workflowRun) {
        throw new Error(`Workflow run not found: ${workflowRunId}`);
      }

      return workflowRun;
    } catch (error) {
      this.logger.error('Error getting workflow status', error);
      throw error;
    }
  }

  /**
   * Cancel a running workflow
   */
  async cancelWorkflow(workflowRunId: string): Promise<void> {
    try {
      const workflowRun = await this.workflowRunRepository.findOne({
        where: { id: workflowRunId },
      });

      if (!workflowRun) {
        throw new Error(`Workflow run not found: ${workflowRunId}`);
      }

      if (
        workflowRun.status === WorkflowStatus.COMPLETED ||
        workflowRun.status === WorkflowStatus.FAILED ||
        workflowRun.status === WorkflowStatus.CANCELLED
      ) {
        throw new Error('Cannot cancel workflow in current status');
      }

      workflowRun.status = WorkflowStatus.CANCELLED;
      workflowRun.completedAt = new Date();
      await this.workflowRunRepository.save(workflowRun);

      this.logger.log(`Workflow ${workflowRunId} cancelled`);
      this.workflowTokens.delete(workflowRunId);
    } catch (error) {
      this.logger.error('Error cancelling workflow', error);
      throw error;
    }
  }

  /**
   * Get all workflows for a user
   */
  async getUserWorkflows(userId: string): Promise<WorkflowRun[]> {
    try {
      return await this.workflowRunRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Error getting user workflows', error);
      throw error;
    }
  }

  /**
   * Get available workflow definitions
   */
  getAvailableWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Register a custom workflow
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.name, workflow);
    this.logger.log(`Workflow registered: ${workflow.name}`);
  }
}
