# Amaiko AI - System Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [Microsoft Graph Integration](#microsoft-graph-integration)
6. [Letta Agent Framework](#letta-agent-framework)
7. [MCP Tools Layer](#mcp-tools-layer)
8. [Authentication &amp; Authorization](#authentication--authorization)
9. [Deployment Architecture](#deployment-architecture)
10. [Technology Stack](#technology-stack)

---

## Overview

Amaiko AI is an enterprise-grade AI assistant integrated into Microsoft Teams that acts as a personal productivity buddy for employees. The system leverages stateful AI agents powered by Letta (formerly MemGPT), orchestrates tasks across Microsoft 365 services via Graph API, and provides multi-agent collaboration capabilities.

### Core Principles

- **Stateful Memory**: Each user has a dedicated AI agent with persistent memory
- **Multi-Agent Architecture**: Specialized agents for email, calendar, files, and CRM
- **MCP-Based Tools**: Standardized tool integration via Model Context Protocol
- **Enterprise Security**: Azure Entra ID authentication with OAuth 2.0
- **Scalable Design**: Microservices architecture with Docker/Kubernetes deployment

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Microsoft Teams                              │
│                      (User Interface Layer)                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  - Chat Interface                                            │   │
│  │  - Adaptive Cards                                            │   │
│  │  - Bot Commands                                              │   │
│  │  - File Attachments                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ Bot Framework Protocol
                                │ (Webhooks + SSO)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NestJS Backend Service                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    API Gateway Layer                         │   │
│  │  - /api/messages (Bot endpoint)                              │   │
│  │  - /api/auth/* (OAuth flow)                                  │   │
│  │  - /api/webhooks/* (Graph webhooks)                          │   │
│  │  - /health (Health check)                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Service Layer                             │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐     │   │
│  │  │   Agent     │  │   Graph      │  │   Workflow       │     │   │
│  │  │   Service   │  │   Service    │  │   Orchestrator   │     │   │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘     │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐     │   │
│  │  │   Agent     │  │   Graph      │  │   Bot            │     │   │
│  │  │   Memory    │  │   Auth       │  │   Service        │     │   │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    MCP Tools Layer                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │   │
│  │  │   Email      │  │   Calendar   │  │   Files          │    │   │
│  │  │   Tools      │  │   Tools      │  │   Tools          │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────┬────────────────────┬──────────────────┬──────────────┘
               │                    │                  │
               │                    │                  │
┌──────────────▼────────┐  ┌────────▼────────┐  ┌─────▼──────────────┐
│   Letta Server        │  │  PostgreSQL 18  │  │  Redis 8           │
│   (Agent Runtime)     │  │  (Primary DB)   │  │  (Cache/Session)   │
│                       │  │                 │  │                    │
│  - Agent instances    │  │  - User data    │  │  - Session store   │
│  - Memory blocks      │  │  - Agent maps   │  │  - Token cache     │
│  - Tool execution     │  │  - Workflows    │  │  - Rate limiting   │
└───────────────────────┘  └─────────────────┘  └────────────────────┘
               │
               │
┌──────────────▼────────┐
│   ChromaDB            │
│   (Vector Store)      │
│                       │
│  - Knowledge base     │
│  - Embeddings         │
│  - Semantic search    │
└───────────────────────┘
```

### Component Communication

```
┌─────────────┐    HTTP/WebSockets    ┌──────────────┐
│   Teams     │◄─────────────────────►│   Backend    │
│   Client    │                       │   (NestJS)   │
└─────────────┘                       └──────┬───────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
             ┌──────▼───────┐        ┌──────▼───────┐        ┌────────▼──────┐
             │   Letta      │        │   Graph API  │        │  PostgreSQL   │
             │   gRPC/HTTP  │        │   REST/SDK   │        │  TypeORM      │
             └──────────────┘        └──────────────┘        └───────────────┘
```

---

## Backend Architecture

### NestJS Module Structure

The backend follows a modular architecture with clear separation of concerns:

```
backend/src/
├── agents/                      # Letta Agent Management
│   ├── agent.service.ts        # Core agent operations
│   ├── agent-memory.service.ts # Memory management
│   ├── workflow-orchestrator.service.ts # Multi-agent workflows
│   ├── agents.module.ts        # Module definition
│   └── entities/
│       ├── agent-mapping.entity.ts    # User-Agent mapping
│       └── workflow-run.entity.ts     # Workflow execution tracking
├── graph/                       # Microsoft Graph Integration
│   ├── graph.service.ts        # Graph API operations
│   ├── graph-auth.service.ts   # OAuth & token management
│   └── graph.module.ts
├── mcp/                         # Model Context Protocol Tools
│   ├── tools/
│   │   ├── email-tools.service.ts
│   │   ├── calendar-tools.service.ts
│   │   └── file-tools.service.ts
│   ├── interfaces/
│   │   └── mcp-context.interface.ts
│   └── mcp.module.ts
├── app.module.ts               # Root module
└── main.ts                     # Application entry point
```

### Service Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                      AppModule                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ConfigModule (Global)                                │  │
│  │  TypeOrmModule (Database)                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│  │   Agents    │────►│     MCP     │     │    Graph    │  │
│  │   Module    │     │   Module    │◄────│   Module    │  │
│  └─────────────┘     └─────────────┘     └─────────────┘  │
└─────────────────────────────────────────────────────────────┘

Dependency Flow:
AgentsModule → McpModule → GraphModule
```

### Key Services

#### 1. AgentService (`agent.service.ts`)

Manages Letta AI agents for users:

```typescript
@Injectable()
export class AgentService {
  // Core operations
  async createUserAgent(userId: string, userProfile: UserProfile): Promise<Agent>
  async chatWithAgent(userId: string, message: string, userToken: string): Promise<ChatResponse>
  async updateAgentMemory(userId: string, blockLabel: string, newValue: string): Promise<void>
  async executeTool(toolName: string, params: any, context: any): Promise<any>

  // Tools registry
  private availableTools: Map<string, any> = new Map([
    ['search_emails', emailToolsService],
    ['send_email', emailToolsService],
    ['get_calendar_events', calendarToolsService],
    ['create_calendar_event', calendarToolsService],
    ['search_files', fileToolsService],
    // ... more tools
  ])
}
```

**Responsibilities:**

- Create and manage Letta agents per user
- Route user messages to appropriate agents
- Execute MCP tools on behalf of agents
- Maintain tool registry

#### 2. AgentMemoryService (`agent-memory.service.ts`)

Manages agent-to-user mappings and metadata:

```typescript
@Injectable()
export class AgentMemoryService {
  async saveAgentMapping(userId: string, agentId: string, userProfile?: UserProfile): Promise<AgentMapping>
  async getAgentId(userId: string): Promise<string | null>
  async getAgentMapping(userId: string): Promise<AgentMapping>
  async updateAgentMetadata(userId: string, metadata: Record<string, any>): Promise<void>
  async deactivateAgent(userId: string): Promise<void>
  async hasActiveAgent(userId: string): Promise<boolean>
}
```

#### 3. WorkflowOrchestratorService (`workflow-orchestrator.service.ts`)

Orchestrates multi-agent workflows:

```typescript
@Injectable()
export class WorkflowOrchestratorService {
  // Workflow execution
  async startWorkflow(workflowName: string, userId: string, context: Record<string, any>): Promise<WorkflowRun>
  async getWorkflowStatus(workflowRunId: string): Promise<WorkflowRun>
  async cancelWorkflow(workflowRunId: string): Promise<void>

  // Workflow management
  getAvailableWorkflows(): WorkflowDefinition[]
  registerWorkflow(workflow: WorkflowDefinition): void
}
```

**Workflow Structure:**

```typescript
interface WorkflowDefinition {
  name: string
  description: string
  stages: WorkflowStage[]
}

interface WorkflowStage {
  id: string
  agent: string           // Which agent to use
  tool: string            // Which tool to execute
  inputMapping?: Record<string, any>
  outputKey?: string
}
```

**Example Workflow:**

```typescript
{
  name: 'inbox_review',
  description: 'Daily inbox review and prioritization',
  stages: [
    {
      id: 'fetch_recent',
      agent: 'email-agent',
      tool: 'search_emails',
      inputMapping: { query: 'is:unread', maxResults: 20 }
    },
    {
      id: 'prioritize',
      agent: 'email-agent',
      tool: 'analyze_priority',
      inputMapping: { emails: '$fetch_recent.emails' }
    },
    {
      id: 'create_summary',
      agent: 'email-agent',
      tool: 'generate_summary',
      inputMapping: { prioritized: '$prioritize.result' }
    }
  ]
}
```

#### 4. GraphService (`graph.service.ts`)

Microsoft Graph API integration:

```typescript
@Injectable()
export class GraphService {
  // Email operations
  async searchEmails(userToken: string, params: EmailSearchParams): Promise<Message[]>
  async getEmail(userToken: string, messageId: string): Promise<Message>
  async sendEmail(userToken: string, params: SendEmailParams): Promise<void>
  async replyToEmail(userToken: string, messageId: string, replyBody: string): Promise<void>

  // Calendar operations
  async getCalendarEvents(userToken: string, startDate: Date, endDate: Date): Promise<Event[]>
  async createCalendarEvent(userToken: string, params: CalendarEventParams): Promise<Event>
  async updateCalendarEvent(userToken: string, eventId: string, params: Partial<CalendarEventParams>): Promise<Event>
  async deleteCalendarEvent(userToken: string, eventId: string): Promise<void>

  // File operations
  async searchFiles(userToken: string, query: string, maxResults?: number): Promise<DriveItem[]>
  async getFileDownloadInfo(userToken: string, itemId: string): Promise<Record<string, any>>
  async listFiles(userToken: string, folderId?: string): Promise<DriveItem[]>

  // User operations
  async getUserProfile(userToken: string): Promise<User>
  async getUserManager(userToken: string): Promise<User>
  async searchPeople(userToken: string, query: string, maxResults?: number): Promise<any[]>
}
```

---

## Database Schema

### PostgreSQL Tables

#### 1. agent_mappings

Maps users to their Letta agents:

```sql
CREATE TABLE agent_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_mappings_user_id ON agent_mappings(user_id);
CREATE INDEX idx_agent_mappings_is_active ON agent_mappings(is_active);
```

**TypeORM Entity:**

```typescript
@Entity('agent_mappings')
export class AgentMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  @Column()
  agentId: string;

  @Column({ nullable: true })
  userEmail: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 2. workflow_runs

Tracks workflow execution:

```sql
CREATE TYPE workflow_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TABLE workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_name VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    status workflow_status DEFAULT 'pending',
    context JSONB NOT NULL,
    result JSONB,
    error TEXT,
    current_stage VARCHAR(255),
    retry_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_workflow_runs_user_id ON workflow_runs(user_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
```

**TypeORM Entity:**

```typescript
export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('workflow_runs')
export class WorkflowRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workflowName: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.PENDING })
  @Index()
  status: WorkflowStatus;

  @Column({ type: 'jsonb' })
  context: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ nullable: true })
  currentStage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Database Relationships

```
┌─────────────────────┐
│  agent_mappings     │
│  ─────────────────  │
│  id (PK)            │
│  user_id (UK)       │◄──────┐
│  agent_id           │       │
│  ...                │       │
└─────────────────────┘       │
                              │ user_id
                              │
┌─────────────────────┐       │
│  workflow_runs      │       │
│  ─────────────────  │       │
│  id (PK)            │       │
│  user_id (FK)       │───────┘
│  workflow_name      │
│  status             │
│  ...                │
└─────────────────────┘
```

---

## Microsoft Graph Integration

### Authentication Flow

```
┌──────────┐                                     ┌──────────────┐
│  Teams   │                                     │   Azure AD   │
│  Client  │                                     │  (Entra ID)  │
└────┬─────┘                                     └──────┬───────┘
     │                                                  │
     │ 1. User interacts with bot                       │
     │                                                  │
     ▼                                                  │
┌────────────┐                                          │
│  Backend   │                                          │
│  (NestJS)  │                                          │
└────┬───────┘                                          │
     │                                                  │
     │ 2. Check if token exists                         │
     │                                                  │
     │ 3. If not, initiate OAuth flow                   │
     ├──────────────────────────────────────────────►   │
     │         GET /authorize                           │
     │                                                  │
     │ 4. User authenticates & grants consent           │
     │ ◄──────────────────────────────────────────────  │
     │         Authorization code                       │
     │                                                  │
     │ 5. Exchange code for tokens                      │
     ├──────────────────────────────────────────────►   │
     │         POST /token                              │
     │                                                  │
     │ 6. Access token + Refresh token                  │
     │ ◄──────────────────────────────────────────────  │
     │                                                  │
     │ 7. Store tokens (Redis)                          │
     │                                                  │
     │ 8. Use token for Graph API calls                 │
     │                                                  │
```

### GraphAuthService Implementation

```typescript
@Injectable()
export class GraphAuthService {
  private msalClient: ConfidentialClientApplication;

  constructor(configService: ConfigService) {
    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: configService.get('AZURE_CLIENT_ID'),
        clientSecret: configService.get('AZURE_CLIENT_SECRET'),
        authority: `https://login.microsoftonline.com/${configService.get('AZURE_TENANT_ID')}`,
      },
    });
  }

  /**
   * On-Behalf-Of (OBO) flow - Exchange Teams SSO token for Graph token
   */
  async acquireTokenOnBehalfOf(userToken: string): Promise<string> {
    const oboRequest = {
      oboAssertion: userToken,
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await this.msalClient.acquireTokenOnBehalfOf(oboRequest);
    return response.accessToken;
  }

  /**
   * Application token for app-only operations
   */
  async acquireApplicationToken(): Promise<string> {
    const response = await this.msalClient.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    return response.accessToken;
  }
}
```

### Graph API Permissions

Required Microsoft Graph API permissions:

**Delegated Permissions** (user context):

- `User.Read` - Read user profile
- `Mail.Read` - Read user emails
- `Mail.Send` - Send emails as user
- `Calendars.ReadWrite` - Manage calendar
- `Files.Read.All` - Read files in OneDrive/SharePoint
- `People.Read` - Access organization directory

**Application Permissions** (app context):

- `User.Read.All` - Read all user profiles
- `Mail.Read` - Read mail in all mailboxes
- `Calendars.Read` - Read calendars in all mailboxes

---

## Letta Agent Framework

### Agent Architecture

Letta (formerly MemGPT) provides stateful AI agents with long-term memory:

```
┌─────────────────────────────────────────────────────────────┐
│                    Letta Agent Instance                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Memory Blocks                        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │   Persona   │  │    Human    │  │  Company    │    │  │
│  │  │   Memory    │  │   Memory    │  │  Knowledge  │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐                     │  │
│  │  │Conversation │  │   Event     │                     │  │
│  │  │   Context   │  │   Buffer    │                     │  │
│  │  └─────────────┘  └─────────────┘                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Core Processor                     │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │        LLM (GPT-4o / Azure OpenAI)               │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    Tool Registry                      │  │
│  │  - search_emails         - search_files               │  │
│  │  - send_email            - list_files                 │  │
│  │  - get_calendar_events   - get_file_content           │  │
│  │  - create_event          - search_people              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Memory Block Structure

Each agent has multiple memory blocks:

1. **Persona Memory**
   - Agent's personality and capabilities
   - Communication style
   - Role and purpose

```json
{
  "label": "persona",
  "value": "I am a helpful AI assistant integrated into Microsoft Teams. I can help with emails, calendar management, file search, and knowledge retrieval. I maintain context of our conversations and learn from our interactions."
}
```

2. **Human Memory**
   - User information
   - Preferences
   - Work patterns

```json
{
  "label": "human",
  "value": "User: John Doe\nEmail: john.doe@company.com\nRole: Sales Manager\nDepartment: Sales\nPreferences: Prefers brief summaries, morning briefings at 8 AM"
}
```

3. **Company Knowledge**
   - Organization-specific information
   - Policies and procedures
   - Product knowledge

```json
{
  "label": "company_knowledge",
  "value": "Company: Acme Corp\nProducts: SaaS CRM platform\nSales process: 7-stage pipeline\nKey customers: Fortune 500 enterprises"
}
```

4. **Conversation Context**
   - Recent conversation themes
   - Active tasks
   - Follow-up items

```json
{
  "label": "conversation_context",
  "value": "Current topics: Q4 sales pipeline review, upcoming client meeting preparation\nActive tasks: Draft proposal for ABC Corp, Schedule demo with XYZ Inc"
}
```

### Agent Creation Flow

```typescript
// 1. User interacts with bot for first time
// 2. Backend creates agent for user

const agentParams: CreateAgentParams = {
  name: `agent-${userId}`,
  model: 'azure/gpt-4o',
  memoryBlocks: [
    {
      label: 'persona',
      value: 'I am a helpful AI assistant...',
    },
    {
      label: 'human',
      value: `User: ${userProfile.name}\nEmail: ${userProfile.email}`,
    },
    {
      label: 'company_knowledge',
      value: '',
    },
    {
      label: 'conversation_context',
      value: '',
    },
  ],
  tools: [
    'search_emails',
    'send_email',
    'get_calendar_events',
    'create_calendar_event',
    'search_files',
    // ... more tools
  ],
};

// 3. Letta creates agent instance
const agent = await lettaClient.createAgent(agentParams);

// 4. Save mapping in database
await agentMemoryService.saveAgentMapping(userId, agent.id, userProfile);
```

### Agent Chat Flow

```
User Message → Backend → Letta Agent → Tool Execution → Response

┌─────────┐
│  User   │
└────┬────┘
     │
     │ "Show me urgent emails from today"
     │
     ▼
┌─────────────┐
│   Backend   │
│   (NestJS)  │
└────┬────────┘
     │
     │ 1. Get agent ID for user
     │ 2. Prepare MCP context
     │
     ▼
┌─────────────────┐
│  Letta Agent    │
│                 │
│  1. Process     │
│     message     │
│  2. Check       │
│     memory      │
│  3. Decide to   │
│     use tool    │
└────┬────────────┘
     │
     │ Tool call: search_emails({ query: "is:urgent", date: "today" })
     │
     ▼
┌─────────────────┐
│  Backend MCP    │
│  Tool Executor  │
│                 │
│  1. Execute     │
│     email tool  │
│  2. Call Graph  │
│     API         │
│  3. Return      │
│     results     │
└────┬────────────┘
     │
     │ Results: [{ subject: "Urgent: Client issue", ... }]
     │
     ▼
┌─────────────────┐
│  Letta Agent    │
│                 │
│  1. Process     │
│     results     │
│  2. Update      │
│     memory      │
│  3. Generate    │
│     response    │
└────┬────────────┘
     │
     │ "I found 3 urgent emails from today. The most important..."
     │
     ▼
┌─────────┐
│  User   │
└─────────┘
```

---

## MCP Tools Layer

The Model Context Protocol (MCP) provides standardized tool integration for AI agents.

### MCP Context Interface

```typescript
export interface McpContext {
  userToken: string;       // Microsoft Graph access token
  userId: string;          // Azure AD user ID
  userEmail?: string;      // User email
  metadata?: Record<string, any>;
}

export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: any;
    mimeType?: string;
  }>;
  isError?: boolean;
}
```

### Email Tools

Location: `/backend/src/mcp/tools/email-tools.service.ts`

**Available Tools:**

1. **search_emails**

   - Search user emails with query parameters
   - Parameters: `query`, `maxResults`, `folder`
   - Returns: Array of email summaries
2. **get_email**

   - Get full email details by ID
   - Parameters: `messageId`
   - Returns: Complete email with body
3. **send_email**

   - Send email on behalf of user
   - Parameters: `to`, `subject`, `body`, `cc[]`, `bcc[]`
   - Returns: Success confirmation
4. **reply_to_email**

   - Reply to existing email
   - Parameters: `messageId`, `replyBody`
   - Returns: Success confirmation

**Tool Metadata Format:**

```typescript
{
  name: 'search_emails',
  description: 'Search user emails with query parameters',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for emails',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results to return',
        default: 10,
      },
      folder: {
        type: 'string',
        description: 'Email folder to search',
        default: 'inbox',
      },
    },
    required: ['query'],
  },
}
```

### Calendar Tools

Location: `/backend/src/mcp/tools/calendar-tools.service.ts`

**Available Tools:**

1. **get_calendar_events**

   - Retrieve calendar events in date range
   - Parameters: `startDate`, `endDate`, `maxResults`
   - Returns: Array of events
2. **create_calendar_event**

   - Create new calendar event
   - Parameters: `subject`, `startDateTime`, `endDateTime`, `location`, `attendees[]`, `isOnlineMeeting`
   - Returns: Created event details
3. **update_calendar_event**

   - Update existing event
   - Parameters: `eventId`, `updates`
   - Returns: Updated event
4. **delete_calendar_event**

   - Delete calendar event
   - Parameters: `eventId`
   - Returns: Success confirmation

### File Tools

Location: `/backend/src/mcp/tools/file-tools.service.ts`

**Available Tools:**

1. **search_files**

   - Search OneDrive/SharePoint files
   - Parameters: `query`, `maxResults`
   - Returns: Array of file metadata
2. **list_files**

   - List files in folder
   - Parameters: `folderId`
   - Returns: Array of files/folders
3. **get_file_content**

   - Get file download information
   - Parameters: `fileId`
   - Returns: File metadata with download URL

### Tool Execution Flow

```typescript
// 1. Agent decides to use a tool
const toolCall = {
  name: 'search_emails',
  params: { query: 'urgent', maxResults: 5 },
};

// 2. Backend routes to tool service
const result = await agentService.executeTool(
  toolCall.name,
  toolCall.params,
  mcpContext
);

// 3. Tool service calls Graph API
const emails = await graphService.searchEmails(
  mcpContext.userToken,
  { query: 'urgent', maxResults: 5 }
);

// 4. Format result for agent
const mcpResult: McpToolResult = {
  content: [{
    type: 'text',
    text: JSON.stringify({
      status: 'success',
      count: emails.length,
      emails: emails.map(e => ({
        subject: e.subject,
        from: e.from.emailAddress.address,
        preview: e.bodyPreview,
      })),
    }),
  }],
};

// 5. Return to agent for processing
return mcpResult;
```

---

## Authentication & Authorization

### OAuth 2.0 Flow

Amaiko AI uses Azure Entra ID (formerly Azure AD) for authentication:

1. **Single Sign-On (SSO) in Teams**

   - Teams provides user token automatically
   - No separate login required for users
2. **On-Behalf-Of (OBO) Flow**

   - Backend exchanges Teams token for Graph token
   - Maintains user context for all operations
3. **Token Management**

   - Access tokens: 1 hour expiry
   - Refresh tokens: 90 days expiry
   - Stored in Redis with encryption

### Security Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Security Layers                        │
│                                                          │
│  1. Azure Entra ID                                       │
│     - Multi-tenant authentication                        │
│     - Conditional access policies                        │
│     - MFA enforcement                                    │
│                                                          │
│  2. OAuth 2.0 + OpenID Connect                           │
│     - Authorization code flow                            │
│     - On-Behalf-Of (OBO) token exchange                  │
│     - Scope-based permissions                            │
│                                                          │
│  3. Token Management                                     │
│     - Redis-based token cache                            │
│     - Automatic token refresh                            │
│     - Secure token storage                               │
│                                                          │
│  4. API Security                                         │
│     - JWT validation                                     │
│     - Rate limiting                                      │
│     - CORS policies                                      │
│                                                          │
│  5. Data Security                                        │
│     - TLS/SSL encryption in transit                      │
│     - Database encryption at rest                        │
│     - Secret management (Azure Key Vault)                │
└──────────────────────────────────────────────────────────┘
```

### Permission Scopes

**Microsoft Graph Scopes:**

```typescript
const REQUIRED_SCOPES = [
  'https://graph.microsoft.com/Mail.Read',
  'https://graph.microsoft.com/Mail.Send',
  'https://graph.microsoft.com/Calendars.ReadWrite',
  'https://graph.microsoft.com/Files.Read.All',
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/People.Read',
];
```

**Bot Framework Scopes:**

```typescript
const BOT_SCOPES = [
  'identity',              // Access user identity
  'messageTeamMembers',    // Send messages to team members
];
```

---

## Deployment Architecture

### Docker Compose Deployment (Development)

```yaml
services:
  backend:       # NestJS API - Port 8100
  frontend:      # Next.js UI - Port 8200
  postgres:      # Database - Port 5434
  redis:         # Cache - Port 6380
  letta:         # Agent server - Port 8285
  chromadb:      # Vector store - Port 8002
  nginx:         # Reverse proxy (production profile)
```

### Kubernetes Deployment (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                       │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Ingress Controller                       │  │
│  │  - SSL termination                                    │  │
│  │  - Load balancing                                     │  │
│  │  - Path-based routing                                 │  │
│  └─────────────────┬─────────────────────────────────────┘  │
│                    │                                        │
│         ┌──────────┼──────────┐                             │
│         │          │          │                             │
│    ┌────▼────┐ ┌───▼────┐ ┌───▼─────┐                       │
│    │Backend  │ │Frontend│ │ Letta   │                       │
│    │Service  │ │Service │ │ Service │                       │
│    │(3 pods) │ │(2 pods)│ │(2 pods) │                       │
│    └────┬────┘ └────────┘ └───┬─────┘                       │
│         │                     │                             │
│    ┌────▼─────────────────────▼─────┐                       │
│    │     PostgreSQL StatefulSet     │                       │
│    │     (Primary + Replica)        │                       │
│    └────────────────────────────────┘                       │
│                                                             │
│    ┌────────────────────────────────┐                       │
│    │     Redis Sentinel Cluster     │                       │
│    │     (3 pods)                   │                       │
│    └────────────────────────────────┘                       │
│                                                             │
│    ┌────────────────────────────────┐                       │
│    │     ChromaDB StatefulSet       │                       │
│    │     (Persistent volume)        │                       │
│    └────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### High Availability Configuration

**Backend Service:**

- 3+ replicas
- Horizontal Pod Autoscaling (HPA)
- CPU target: 70%
- Memory target: 80%

**PostgreSQL:**

- Primary-replica setup
- Automated failover
- Point-in-time recovery (PITR)
- Backup to Azure Blob Storage

**Redis:**

- Sentinel mode (3 instances)
- Automatic failover
- AOF persistence

**Monitoring Stack:**

- Prometheus for metrics
- Grafana for dashboards
- Azure Application Insights
- Loki for log aggregation

---

## Technology Stack

### Backend Stack

| Component     | Technology                        | Version  | Purpose                   |
| ------------- | --------------------------------- | -------- | ------------------------- |
| Framework     | NestJS                            | 11.x     | Backend API framework     |
| Runtime       | Node.js                           | 24.x LTS | JavaScript runtime        |
| Language      | TypeScript                        | 5.7.x    | Type-safe development     |
| Database      | PostgreSQL                        | 18       | Primary data store        |
| Cache         | Redis                             | 8        | Session & cache store     |
| ORM           | TypeORM                           | 0.3.x    | Database abstraction      |
| Auth          | MSAL Node                         | 3.8.x    | Azure AD authentication   |
| Graph API     | @microsoft/microsoft-graph-client | 3.0.x    | Microsoft 365 integration |
| Bot Framework | botbuilder                        | 4.23.x   | Teams bot integration     |
| AI Framework  | Letta (@letta-ai/letta-client)    | Latest   | Stateful AI agents        |
| Vector DB     | ChromaDB                          | 3.1.x    | Knowledge base            |
| LLM           | Azure OpenAI                      | GPT-4o   | Language model            |
| MCP           | @modelcontextprotocol/sdk         | 1.20.x   | Tool protocol             |

### Infrastructure

| Component         | Technology           | Purpose                 |
| ----------------- | -------------------- | ----------------------- |
| Containerization  | Docker               | Application packaging   |
| Orchestration     | Kubernetes           | Container orchestration |
| Service Mesh      | Istio (optional)     | Traffic management      |
| CI/CD             | GitHub Actions       | Automation pipeline     |
| Monitoring        | Prometheus + Grafana | Metrics & dashboards    |
| Logging           | Loki                 | Log aggregation         |
| Tracing           | Jaeger               | Distributed tracing     |
| Secret Management | Azure Key Vault      | Secure secret storage   |

### Development Tools

| Tool           | Purpose             |
| -------------- | ------------------- |
| Vitest         | Unit testing        |
| Jest           | Integration testing |
| Supertest      | API testing         |
| ESLint         | Code linting        |
| Prettier       | Code formatting     |
| Husky          | Git hooks           |
| Docker Compose | Local development   |

---

## Performance Considerations

### Optimization Strategies

1. **Database Optimization**

   - Connection pooling (max 20 connections)
   - Query optimization with indexes
   - Read replicas for scaling
   - Prepared statements
2. **Caching Strategy**

   - Redis for session data (TTL: 1 hour)
   - Graph API responses cached (TTL: 5 minutes)
   - Agent responses cached (TTL: 10 minutes)
   - LRU eviction policy
3. **API Rate Limiting**

   - Per-user limits: 100 requests/15 minutes
   - Global limit: 10,000 requests/hour
   - Redis-based distributed limiting
4. **Async Processing**

   - Bull queue for background jobs
   - Workflow execution async
   - Email processing queue
   - Notification delivery queue
5. **Load Balancing**

   - Round-robin for backend pods
   - Session affinity for WebSocket
   - Health check endpoints

### Scaling Guidelines

**Horizontal Scaling:**

- Backend: Scale to N pods based on CPU/memory
- Database: Add read replicas
- Redis: Cluster mode for >100k ops/sec

**Vertical Scaling:**

- PostgreSQL: Increase memory for larger working set
- Letta: Increase CPU for faster inference

---

## Security Best Practices

1. **Authentication**

   - Always use Azure Entra ID
   - Enforce MFA for admin access
   - Implement conditional access policies
2. **Authorization**

   - Principle of least privilege
   - Role-based access control (RBAC)
   - Scope-based permissions
3. **Data Protection**

   - Encrypt all data in transit (TLS 1.3)
   - Encrypt sensitive data at rest
   - Use Azure Key Vault for secrets
4. **Network Security**

   - Private endpoints for Azure services
   - Network security groups (NSGs)
   - Web Application Firewall (WAF)
5. **Audit & Compliance**

   - Log all authentication events
   - Track data access patterns
   - Regular security audits
   - GDPR compliance measures

---

## Maintenance & Operations

### Health Monitoring

**Health Check Endpoints:**

```typescript
// /health - Overall health
{
  status: 'ok',
  timestamp: '2025-01-15T10:00:00Z',
  services: {
    database: 'ok',
    redis: 'ok',
    letta: 'ok',
    graph: 'ok'
  }
}

// /health/detailed - Detailed metrics
{
  status: 'ok',
  uptime: 86400,
  memory: { used: 512, total: 2048 },
  cpu: { usage: 45 },
  database: { connections: 15, queries: 1250 },
  redis: { connected: true, ops: 5000 }
}
```

### Backup Strategy

1. **Database Backups**

   - Full backup: Daily at 2 AM UTC
   - Incremental: Every 6 hours
   - Retention: 30 days
   - Restore time: <1 hour
2. **Redis Snapshots**

   - AOF: Every second
   - RDB: Every 15 minutes
   - Retention: 7 days
3. **Configuration Backups**

   - Git-based version control
   - Infrastructure as Code
   - Automated backups

### Disaster Recovery

**Recovery Time Objective (RTO):** 1 hour
**Recovery Point Objective (RPO):** 5 minutes

**Failover Procedure:**

1. Detect failure (automated monitoring)
2. Promote replica database
3. Update DNS records
4. Restart services
5. Verify functionality
6. Notify stakeholders

---

## References

- [NestJS Documentation](https://docs.nestjs.com)
- [Microsoft Graph API](https://learn.microsoft.com/en-us/graph)
- [Letta Framework](https://docs.letta.com)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Azure Entra ID](https://learn.microsoft.com/en-us/entra)
- [TypeORM Documentation](https://typeorm.io)

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** Amaiko AI Engineering Team
