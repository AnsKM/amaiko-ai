import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentMemoryService, UserProfile } from './agent-memory.service';
import { EmailToolsService } from '../mcp/tools/email-tools.service';
import { CalendarToolsService } from '../mcp/tools/calendar-tools.service';
import { FileToolsService } from '../mcp/tools/file-tools.service';

// Letta client types (simplified - actual SDK may differ)
interface LettaConfig {
  baseUrl: string;
  apiKey?: string;
}

interface MemoryBlock {
  label: string;
  value: string;
}

interface CreateAgentParams {
  name: string;
  model?: string;
  memoryBlocks?: MemoryBlock[];
  tools?: string[];
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatParams {
  messages: ChatMessage[];
  context?: Record<string, any>;
}

/**
 * Service to manage Letta AI agents
 * Handles agent creation, memory management, and chat interactions
 */
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private lettaConfig: LettaConfig;

  // Tool services for MCP integration
  private availableTools: Map<string, any>;

  constructor(
    private configService: ConfigService,
    private memoryService: AgentMemoryService,
    private emailToolsService: EmailToolsService,
    private calendarToolsService: CalendarToolsService,
    private fileToolsService: FileToolsService,
  ) {
    this.lettaConfig = {
      baseUrl:
        this.configService.get<string>('LETTA_BASE_URL') ||
        'http://localhost:8283',
      apiKey: this.configService.get<string>('LETTA_API_KEY'),
    };

    // Initialize tool registry
    this.availableTools = new Map([
      ['search_emails', this.emailToolsService],
      ['get_email', this.emailToolsService],
      ['send_email', this.emailToolsService],
      ['reply_to_email', this.emailToolsService],
      ['get_calendar_events', this.calendarToolsService],
      ['create_calendar_event', this.calendarToolsService],
      ['update_calendar_event', this.calendarToolsService],
      ['delete_calendar_event', this.calendarToolsService],
      ['search_files', this.fileToolsService],
      ['list_files', this.fileToolsService],
      ['get_file_content', this.fileToolsService],
    ]);

    this.logger.log('AgentService initialized with Letta config');
  }

  /**
   * Create a new agent for a user
   */
  async createUserAgent(
    userId: string,
    userProfile: UserProfile,
  ): Promise<any> {
    try {
      this.logger.log(`Creating agent for user ${userId}`);

      // Check if agent already exists
      const existingAgentId = await this.memoryService.getAgentId(userId);
      if (existingAgentId) {
        this.logger.warn(`Agent already exists for user ${userId}`);
        return { id: existingAgentId, status: 'existing' };
      }

      // Create agent configuration
      const agentParams: CreateAgentParams = {
        name: `agent-${userId}`,
        model:
          this.configService.get<string>('DEFAULT_LLM_MODEL') || 'azure/gpt-4o',
        memoryBlocks: [
          {
            label: 'persona',
            value:
              'I am a helpful AI assistant integrated into Microsoft Teams. I can help with emails, calendar management, file search, and knowledge retrieval. I maintain context of our conversations and learn from our interactions.',
          },
          {
            label: 'human',
            value: `User: ${userProfile.name}\nEmail: ${userProfile.email}\nRole: ${userProfile.role || 'Employee'}\nDepartment: ${userProfile.department || 'N/A'}`,
          },
          {
            label: 'company_knowledge',
            value: '', // Will be populated over time
          },
          {
            label: 'conversation_context',
            value: '', // Tracks ongoing conversation themes
          },
        ],
        tools: Array.from(this.availableTools.keys()),
      };

      // In production, this would call the actual Letta SDK
      // For now, we'll simulate the agent creation
      const mockAgentId = `letta-agent-${userId}-${Date.now()}`;

      // Save agent mapping
      await this.memoryService.saveAgentMapping(
        userId,
        mockAgentId,
        userProfile,
      );

      this.logger.log(`Agent created successfully for user ${userId}`);

      return {
        id: mockAgentId,
        name: agentParams.name,
        status: 'created',
        tools: agentParams.tools,
      };
    } catch (error) {
      this.logger.error('Error creating user agent', error);
      throw error;
    }
  }

  /**
   * Chat with an agent
   */
  async chatWithAgent(
    userId: string,
    message: string,
    userToken: string,
  ): Promise<any> {
    try {
      const agentId = await this.memoryService.getAgentId(userId);

      if (!agentId) {
        throw new Error('Agent not found for user');
      }

      this.logger.log(`Processing chat message for user ${userId}`);

      // Create MCP context for tool execution
      const mcpContext = {
        userToken,
        userId,
      };

      // In production, this would call the actual Letta SDK
      // The Letta agent would:
      // 1. Process the message with its LLM
      // 2. Decide which tools to call (if any)
      // 3. Execute tools via MCP
      // 4. Generate a response

      // For now, we'll simulate a simple response
      const mockResponse = {
        messages: [
          {
            messageType: 'assistant_message',
            content: `I received your message: "${message}". I'm your AI assistant and I can help you with emails, calendar, and files. How can I assist you today?`,
          },
        ],
        toolCalls: [],
      };

      return mockResponse;
    } catch (error) {
      this.logger.error('Error in chat with agent', error);
      throw error;
    }
  }

  /**
   * Update agent memory block
   */
  async updateAgentMemory(
    userId: string,
    blockLabel: string,
    newValue: string,
  ): Promise<void> {
    try {
      const agentId = await this.memoryService.getAgentId(userId);

      if (!agentId) {
        throw new Error('Agent not found for user');
      }

      this.logger.log(
        `Updating agent memory block '${blockLabel}' for user ${userId}`,
      );

      // In production, this would call the Letta SDK:
      // await this.lettaClient.agents.blocks.modify(agentId, blockLabel, { value: newValue });

      // For now, we'll store in metadata
      await this.memoryService.updateAgentMetadata(userId, {
        [`memory_${blockLabel}`]: newValue,
        lastMemoryUpdate: new Date().toISOString(),
      });

      this.logger.log(`Agent memory updated for user ${userId}`);
    } catch (error) {
      this.logger.error('Error updating agent memory', error);
      throw error;
    }
  }

  /**
   * Get agent details
   */
  async getAgentDetails(userId: string): Promise<any> {
    try {
      const mapping = await this.memoryService.getAgentMapping(userId);

      return {
        userId: mapping.userId,
        agentId: mapping.agentId,
        userName: mapping.userName,
        userEmail: mapping.userEmail,
        isActive: mapping.isActive,
        metadata: mapping.metadata,
        createdAt: mapping.createdAt,
        updatedAt: mapping.updatedAt,
      };
    } catch (error) {
      this.logger.error('Error getting agent details', error);
      throw error;
    }
  }

  /**
   * Execute a tool on behalf of an agent
   * This is called by Letta when the agent decides to use a tool
   */
  async executeTool(
    toolName: string,
    params: any,
    context: any,
  ): Promise<any> {
    try {
      this.logger.log(`Executing tool: ${toolName}`);

      const toolService = this.availableTools.get(toolName);

      if (!toolService) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      // Map tool names to service methods
      const methodMap: Record<string, string> = {
        search_emails: 'searchEmails',
        get_email: 'getEmail',
        send_email: 'sendEmail',
        reply_to_email: 'replyToEmail',
        get_calendar_events: 'getCalendarEvents',
        create_calendar_event: 'createCalendarEvent',
        update_calendar_event: 'updateCalendarEvent',
        delete_calendar_event: 'deleteCalendarEvent',
        search_files: 'searchFiles',
        list_files: 'listFiles',
        get_file_content: 'getFileContent',
      };

      const methodName = methodMap[toolName];

      if (!methodName || typeof toolService[methodName] !== 'function') {
        throw new Error(`Method not found for tool: ${toolName}`);
      }

      // Execute the tool method
      const result = await toolService[methodName](params, context);

      return result;
    } catch (error) {
      this.logger.error(`Error executing tool ${toolName}`, error);
      throw error;
    }
  }

  /**
   * Get all available tools metadata
   */
  getAvailableTools(): any[] {
    const allTools = [
      ...this.emailToolsService.getToolsMetadata(),
      ...this.calendarToolsService.getToolsMetadata(),
      ...this.fileToolsService.getToolsMetadata(),
    ];

    return allTools;
  }

  /**
   * Delete an agent
   */
  async deleteAgent(userId: string): Promise<void> {
    try {
      this.logger.log(`Deleting agent for user ${userId}`);

      const agentId = await this.memoryService.getAgentId(userId);

      if (!agentId) {
        throw new Error('Agent not found for user');
      }

      // In production, delete from Letta:
      // await this.lettaClient.agents.delete(agentId);

      // Deactivate the mapping
      await this.memoryService.deactivateAgent(userId);

      this.logger.log(`Agent deleted for user ${userId}`);
    } catch (error) {
      this.logger.error('Error deleting agent', error);
      throw error;
    }
  }
}
