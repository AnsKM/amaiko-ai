# Amaiko AI - Agent Framework & MCP Integration

## Table of Contents

1. [Overview](#overview)
2. [Letta Agent Architecture](#letta-agent-architecture)
3. [Memory Management System](#memory-management-system)
4. [MCP Tools Integration](#mcp-tools-integration)
5. [Tool Calling Patterns](#tool-calling-patterns)
6. [Context Window Management](#context-window-management)
7. [Agent Decision-Making Logic](#agent-decision-making-logic)
8. [Multi-Agent Collaboration](#multi-agent-collaboration)
9. [Knowledge Base Integration](#knowledge-base-integration)

---

## Overview

Amaiko AI's agent framework is built on Letta (formerly MemGPT), which provides stateful AI agents with long-term memory capabilities. The system integrates Model Context Protocol (MCP) for standardized tool execution, enabling seamless interaction with Microsoft 365 services.

### Key Capabilities

- **Stateful Memory**: Persistent memory across conversations
- **Context Retention**: Maintains user preferences and conversation history
- **Tool Orchestration**: Execute complex multi-tool workflows
- **Learning Capabilities**: Improves responses based on interactions
- **Multi-Agent Coordination**: Collaborate across specialized agents

---

## Letta Agent Architecture

### Letta Framework Overview

Letta provides a production-ready framework for building stateful LLM applications:

```
┌────────────────────────────────────────────────────────────┐
│                    Letta Agent Instance                    │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Memory System                      │  │
│  │                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐    │  │
│  │  │   Persona   │  │   Human     │  │  Archival  │    │  │
│  │  │   Memory    │  │   Memory    │  │   Memory   │    │  │
│  │  │             │  │             │  │            │    │  │
│  │  │  - Role     │  │  - Profile  │  │  - Long    │    │  │
│  │  │  - Style    │  │  - Prefs    │  │    term    │    │  │
│  │  │  - Caps     │  │  - Context  │  │    facts   │    │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Conversation Buffer (Working Memory)       │  │
│  │                                                      │  │
│  │  - Recent messages (last N turns)                    │  │
│  │  - Tool call results                                 │  │
│  │  - Temporary context                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 LLM Engine                           │  │
│  │                                                      │  │
│  │  Model: Azure OpenAI GPT-5                          │  │
│  │  - Context window: 128K tokens                       │  │
│  │  - Response generation                               │  │
│  │  - Tool call planning                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Tool Execution Engine                   │  │
│  │                                                      │  │
│  │  - MCP tool registry                                 │  │
│  │  - Parameter validation                              │  │
│  │  - Result formatting                                 │  │
│  │  - Error handling                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Recall & Retrieval System                  │  │
│  │                                                      │  │
│  │  - Semantic search over archival memory              │  │
│  │  - Context-aware fact retrieval                      │  │
│  │  - ChromaDB vector store integration                 │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Agent Lifecycle

```
┌─────────────┐
│   Created   │  Agent instantiated for user
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Initialized │  Memory blocks populated
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Active    │  Processing user messages
└──────┬──────┘
       │
       ├──────► Tool Execution
       │        ├─ Execute MCP tools
       │        ├─ Update memory
       │        └─ Return results
       │
       ├──────► Memory Update
       │        ├─ Store new facts
       │        ├─ Update preferences
       │        └─ Archive conversations
       │
       ▼
┌─────────────┐
│  Persisted  │  State saved to database
└─────────────┘
```

### Agent Configuration

```typescript
// backend/src/agents/config/agent.config.ts
export interface AgentConfiguration {
  // Model settings
  model: string;                    // 'azure/gpt-5'
  temperature: number;              // 0.7
  maxTokens: number;                // 4096

  // Memory settings
  memoryBlocks: MemoryBlock[];
  maxMemoryBlocks: number;          // 10

  // Tool settings
  tools: string[];
  maxToolCalls: number;             // 5 per turn

  // Behavior settings
  conversationStyle: 'professional' | 'casual' | 'technical';
  verbosity: 'concise' | 'detailed';
  proactivity: 'reactive' | 'proactive';
}

export const DEFAULT_AGENT_CONFIG: AgentConfiguration = {
  model: 'azure/gpt-5',
  temperature: 0.7,
  maxTokens: 4096,
  memoryBlocks: [
    {
      label: 'persona',
      value: PERSONA_TEMPLATE,
      isEditable: false,
    },
    {
      label: 'human',
      value: '',
      isEditable: true,
    },
    {
      label: 'conversation_context',
      value: '',
      isEditable: true,
    },
  ],
  maxMemoryBlocks: 10,
  tools: [
    'search_emails',
    'send_email',
    'get_calendar_events',
    'create_calendar_event',
    'search_files',
  ],
  maxToolCalls: 5,
  conversationStyle: 'professional',
  verbosity: 'concise',
  proactivity: 'proactive',
};
```

---

## Memory Management System

### Memory Block Types

Letta uses structured memory blocks for different types of information:

#### 1. Persona Memory (System-Level)

Defines the agent's identity and capabilities:

```typescript
const PERSONA_TEMPLATE = `
I am Amaiko, an AI assistant integrated into Microsoft Teams.

My capabilities:
- Email management (search, read, send, organize)
- Calendar scheduling (view, create, update events)
- File operations (search, access OneDrive/SharePoint)
- Workflow automation (execute multi-step processes)
- Knowledge retrieval (company information, policies)

My communication style:
- Professional yet friendly
- Concise but thorough
- Proactive in offering help
- Respectful of user's time

My limitations:
- Cannot access data without proper permissions
- Cannot perform actions without user consent
- Must prioritize user privacy and security
`;
```

#### 2. Human Memory (User-Specific)

Stores user profile and preferences:

```typescript
interface HumanMemory {
  profile: {
    name: string;
    email: string;
    role: string;
    department: string;
    timezone: string;
    language: string;
  };
  preferences: {
    communicationStyle: string;
    notificationPreferences: {
      email: boolean;
      calendar: boolean;
      workflow: boolean;
    };
    workingHours: {
      start: string;  // "09:00"
      end: string;    // "17:00"
      timezone: string;
    };
    priorityKeywords: string[];  // ["urgent", "asap", "important"]
  };
  context: {
    currentProjects: string[];
    keyContacts: Array<{ name: string; role: string }>;
    frequentTopics: string[];
  };
}

// Example
const humanMemory = {
  profile: {
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Sales Manager",
    department: "Sales",
    timezone: "America/New_York",
    language: "en-US",
  },
  preferences: {
    communicationStyle: "concise",
    notificationPreferences: {
      email: true,
      calendar: true,
      workflow: true,
    },
    workingHours: {
      start: "09:00",
      end: "17:00",
      timezone: "America/New_York",
    },
    priorityKeywords: ["urgent", "asap", "client escalation"],
  },
  context: {
    currentProjects: ["Q4 Sales Campaign", "Enterprise Client Onboarding"],
    keyContacts: [
      { name: "Jane Smith", role: "VP Sales" },
      { name: "Mike Johnson", role: "Lead Account Manager" },
    ],
    frequentTopics: ["sales pipeline", "client meetings", "quarterly targets"],
  },
};
```

#### 3. Conversation Context Memory

Tracks recent conversation themes and active tasks:

```typescript
interface ConversationContext {
  recentTopics: Array<{
    topic: string;
    timestamp: Date;
    relevance: number;  // 0-1 score
  }>;
  activeTasks: Array<{
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: Date;
  }>;
  followUps: Array<{
    action: string;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
  }>;
  lastInteraction: Date;
  conversationTone: 'professional' | 'casual' | 'urgent';
}

// Example
const conversationContext = {
  recentTopics: [
    {
      topic: "Q4 sales pipeline review",
      timestamp: new Date("2025-01-15T14:30:00Z"),
      relevance: 0.9,
    },
    {
      topic: "Client meeting preparation",
      timestamp: new Date("2025-01-15T10:00:00Z"),
      relevance: 0.7,
    },
  ],
  activeTasks: [
    {
      type: "email_draft",
      description: "Draft proposal for ABC Corp",
      status: "in_progress",
      createdAt: new Date("2025-01-15T09:00:00Z"),
    },
    {
      type: "calendar_event",
      description: "Schedule demo with XYZ Inc",
      status: "pending",
      createdAt: new Date("2025-01-15T11:00:00Z"),
    },
  ],
  followUps: [
    {
      action: "Follow up with client on proposal",
      dueDate: new Date("2025-01-20T12:00:00Z"),
      priority: "high",
    },
  ],
  lastInteraction: new Date("2025-01-15T14:35:00Z"),
  conversationTone: "professional",
};
```

#### 4. Archival Memory (Long-Term Storage)

Stores historical facts and knowledge:

```typescript
interface ArchivalMemory {
  facts: Array<{
    id: string;
    content: string;
    category: string;
    timestamp: Date;
    embedding?: number[];  // Vector embedding for semantic search
  }>;
}

// Examples of archival facts
const archivalFacts = [
  {
    id: "fact-001",
    content: "User prefers meetings scheduled in the afternoon",
    category: "preference",
    timestamp: new Date("2024-12-01T00:00:00Z"),
  },
  {
    id: "fact-002",
    content: "ABC Corp is our largest client, contract value $2M annually",
    category: "business_context",
    timestamp: new Date("2024-11-15T00:00:00Z"),
  },
  {
    id: "fact-003",
    content: "User typically reviews emails at 8 AM and 2 PM daily",
    category: "work_pattern",
    timestamp: new Date("2024-10-01T00:00:00Z"),
  },
];
```

### Memory Update Strategies

```typescript
export class MemoryUpdateService {
  /**
   * Update memory after conversation turn
   */
  async updateMemoryAfterTurn(
    agentId: string,
    userId: string,
    conversationData: {
      userMessage: string;
      agentResponse: string;
      toolCalls: ToolCall[];
      timestamp: Date;
    },
  ): Promise<void> {
    // 1. Extract key information
    const keyInfo = await this.extractKeyInformation(conversationData);

    // 2. Update conversation context
    await this.updateConversationContext(agentId, {
      recentTopics: keyInfo.topics,
      lastInteraction: conversationData.timestamp,
      conversationTone: keyInfo.tone,
    });

    // 3. Archive important facts
    if (keyInfo.shouldArchive) {
      await this.archiveFacts(agentId, keyInfo.facts);
    }

    // 4. Update user preferences if detected
    if (keyInfo.preferenceUpdates) {
      await this.updateUserPreferences(userId, keyInfo.preferenceUpdates);
    }
  }

  /**
   * Prune old conversation context
   */
  async pruneConversationContext(agentId: string): Promise<void> {
    const context = await this.getConversationContext(agentId);

    // Keep only last 10 topics
    context.recentTopics = context.recentTopics
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    // Remove completed tasks older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    context.activeTasks = context.activeTasks.filter(
      (task) =>
        task.status !== 'completed' || task.createdAt > sevenDaysAgo,
    );

    await this.saveConversationContext(agentId, context);
  }

  /**
   * Semantic search over archival memory
   */
  async searchArchivalMemory(
    agentId: string,
    query: string,
    limit: number = 5,
  ): Promise<ArchivalFact[]> {
    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(query);

    // Search ChromaDB
    const results = await this.chromaClient.query({
      collection: `agent-${agentId}-archival`,
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
    });

    return results.documents.map((doc, idx) => ({
      id: results.ids[idx],
      content: doc,
      category: results.metadatas[idx].category,
      timestamp: new Date(results.metadatas[idx].timestamp),
      similarity: results.distances[idx],
    }));
  }
}
```

---

## MCP Tools Integration

### MCP Protocol Overview

Model Context Protocol provides a standardized interface for tool execution:

```typescript
// MCP Tool Definition
interface McpTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ParameterSchema>;
    required?: string[];
  };
  execute: (params: any, context: McpContext) => Promise<McpToolResult>;
}

// MCP Context
interface McpContext {
  userToken: string;      // OAuth access token
  userId: string;         // User identifier
  userEmail?: string;     // User email
  metadata?: Record<string, any>;
}

// MCP Tool Result
interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: any;
    mimeType?: string;
  }>;
  isError?: boolean;
}
```

### Available MCP Tools

#### Email Tools

```typescript
// 1. search_emails
{
  name: 'search_emails',
  description: 'Search user emails with query parameters',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      maxResults: { type: 'number', default: 10 },
      folder: { type: 'string', default: 'inbox' },
    },
    required: ['query'],
  },
}

// 2. get_email
{
  name: 'get_email',
  description: 'Get full email details by ID',
  parameters: {
    type: 'object',
    properties: {
      messageId: { type: 'string', description: 'Email message ID' },
    },
    required: ['messageId'],
  },
}

// 3. send_email
{
  name: 'send_email',
  description: 'Send email on behalf of user',
  parameters: {
    type: 'object',
    properties: {
      to: { type: 'string' },
      subject: { type: 'string' },
      body: { type: 'string' },
      cc: { type: 'array', items: { type: 'string' } },
      bcc: { type: 'array', items: { type: 'string' } },
    },
    required: ['to', 'subject', 'body'],
  },
}

// 4. reply_to_email
{
  name: 'reply_to_email',
  description: 'Reply to an existing email',
  parameters: {
    type: 'object',
    properties: {
      messageId: { type: 'string' },
      replyBody: { type: 'string' },
    },
    required: ['messageId', 'replyBody'],
  },
}
```

#### Calendar Tools

```typescript
// 1. get_calendar_events
{
  name: 'get_calendar_events',
  description: 'Retrieve calendar events in date range',
  parameters: {
    type: 'object',
    properties: {
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      maxResults: { type: 'number', default: 10 },
    },
    required: ['startDate', 'endDate'],
  },
}

// 2. create_calendar_event
{
  name: 'create_calendar_event',
  description: 'Create new calendar event',
  parameters: {
    type: 'object',
    properties: {
      subject: { type: 'string' },
      startDateTime: { type: 'string', format: 'date-time' },
      endDateTime: { type: 'string', format: 'date-time' },
      location: { type: 'string' },
      attendees: { type: 'array', items: { type: 'string' } },
      body: { type: 'string' },
      isOnlineMeeting: { type: 'boolean', default: false },
    },
    required: ['subject', 'startDateTime', 'endDateTime'],
  },
}

// 3. update_calendar_event
{
  name: 'update_calendar_event',
  description: 'Update existing calendar event',
  parameters: {
    type: 'object',
    properties: {
      eventId: { type: 'string' },
      updates: { type: 'object' },
    },
    required: ['eventId', 'updates'],
  },
}

// 4. delete_calendar_event
{
  name: 'delete_calendar_event',
  description: 'Delete calendar event',
  parameters: {
    type: 'object',
    properties: {
      eventId: { type: 'string' },
    },
    required: ['eventId'],
  },
}
```

#### File Tools

```typescript
// 1. search_files
{
  name: 'search_files',
  description: 'Search OneDrive/SharePoint files',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      maxResults: { type: 'number', default: 10 },
    },
    required: ['query'],
  },
}

// 2. list_files
{
  name: 'list_files',
  description: 'List files in folder',
  parameters: {
    type: 'object',
    properties: {
      folderId: { type: 'string', default: 'root' },
    },
  },
}

// 3. get_file_content
{
  name: 'get_file_content',
  description: 'Get file download information',
  parameters: {
    type: 'object',
    properties: {
      fileId: { type: 'string' },
    },
    required: ['fileId'],
  },
}
```

---

## Tool Calling Patterns

### Single Tool Call

```typescript
// Agent decides to search emails
const toolCall = {
  name: 'search_emails',
  parameters: {
    query: 'from:client@company.com is:unread',
    maxResults: 5,
  },
};

// Execute tool
const result = await agentService.executeTool(
  toolCall.name,
  toolCall.parameters,
  mcpContext,
);

// Agent processes result and responds
const response = {
  messages: [{
    role: 'assistant',
    content: 'I found 3 unread emails from the client. The most recent is about...',
  }],
  toolCalls: [toolCall],
};
```

### Chain of Tool Calls

```typescript
// Multi-step workflow: Search emails → Get details → Draft reply

// Step 1: Search for emails
const searchResult = await executeTool('search_emails', {
  query: 'subject:"Project Update"',
  maxResults: 1,
});

// Step 2: Get full email details
const messageId = searchResult.content[0].data.emails[0].id;
const emailDetails = await executeTool('get_email', { messageId });

// Step 3: Agent analyzes and drafts reply
const draftReply = await agent.generateReply(emailDetails);

// Step 4: Send reply (with user confirmation)
if (await getUserConfirmation(draftReply)) {
  await executeTool('reply_to_email', {
    messageId,
    replyBody: draftReply,
  });
}
```

### Parallel Tool Calls

```typescript
// Fetch multiple data sources simultaneously
const [emails, events, files] = await Promise.all([
  executeTool('search_emails', { query: 'is:unread', maxResults: 5 }),
  executeTool('get_calendar_events', {
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
  }),
  executeTool('search_files', { query: 'modified:today', maxResults: 5 }),
]);

// Agent combines results for daily briefing
const briefing = await agent.generateBriefing({ emails, events, files });
```

---

## Context Window Management

### Context Budget Allocation

```
Total Context Window: 128K tokens (GPT-5)

Allocation:
┌──────────────────────────────────────┐
│ System Prompt              │  2K     │
│ Memory Blocks              │  8K     │
│ Conversation History       │ 40K     │
│ Tool Results               │ 30K     │
│ Archival Memory Retrieval  │ 10K     │
│ Reserved for Response      │ 38K     │
└──────────────────────────────────────┘
```

### Context Compression Strategies

```typescript
export class ContextManager {
  /**
   * Manage context window for agent
   */
  async prepareContext(agentId: string, newMessage: string): Promise<Context> {
    // 1. Load essential memory
    const memoryBlocks = await this.loadMemoryBlocks(agentId);

    // 2. Load conversation history with compression
    const conversationHistory = await this.loadCompressedHistory(
      agentId,
      maxTokens: 40000,
    );

    // 3. Retrieve relevant archival facts
    const archivalFacts = await this.searchArchivalMemory(
      agentId,
      newMessage,
      limit: 5,
    );

    // 4. Calculate remaining budget
    const usedTokens = this.countTokens({
      memoryBlocks,
      conversationHistory,
      archivalFacts,
    });

    const remainingTokens = 128000 - usedTokens - 38000; // Reserve for response

    return {
      systemPrompt: this.buildSystemPrompt(),
      memoryBlocks,
      conversationHistory,
      archivalFacts,
      newMessage,
      budgetInfo: {
        total: 128000,
        used: usedTokens,
        remaining: remainingTokens,
      },
    };
  }

  /**
   * Compress conversation history
   */
  private async loadCompressedHistory(
    agentId: string,
    maxTokens: number,
  ): Promise<Message[]> {
    const fullHistory = await this.loadFullHistory(agentId);
    let history = [];
    let tokens = 0;

    // Always keep last 10 messages
    const recentMessages = fullHistory.slice(-10);

    for (const message of recentMessages.reverse()) {
      const messageTokens = this.countTokens(message);

      if (tokens + messageTokens > maxTokens) {
        break;
      }

      history.unshift(message);
      tokens += messageTokens;
    }

    // If space remains, add summarized older messages
    if (tokens < maxTokens * 0.8) {
      const olderMessages = fullHistory.slice(0, -10);
      const summary = await this.summarizeMessages(olderMessages);
      history.unshift({
        role: 'system',
        content: `Previous conversation summary: ${summary}`,
      });
    }

    return history;
  }

  /**
   * Summarize old messages
   */
  private async summarizeMessages(messages: Message[]): Promise<string> {
    const prompt = `
      Summarize the following conversation, focusing on:
      1. Key topics discussed
      2. Important decisions made
      3. Action items identified
      4. User preferences revealed

      Conversation:
      ${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}
    `;

    const summary = await this.llm.complete(prompt, { maxTokens: 500 });
    return summary;
  }
}
```

---

## Agent Decision-Making Logic

### Decision Flow

```
User Message
     │
     ▼
┌─────────────────┐
│ Intent Analysis │
│ - What does     │
│   user want?    │
│ - Urgency?      │
│ - Ambiguity?    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Memory Recall   │
│ - Relevant      │
│   context?      │
│ - Previous      │
│   similar       │
│   requests?     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tool Selection  │
│ - Which tools   │
│   needed?       │
│ - In what       │
│   order?        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Tool Execution  │
│ - Execute tools │
│ - Handle errors │
│ - Aggregate     │
│   results       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Response Gen.   │
│ - Format        │
│   results       │
│ - Provide       │
│   context       │
│ - Suggest next  │
│   actions       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Memory Update   │
│ - Store facts   │
│ - Update prefs  │
│ - Archive       │
│   important     │
│   info          │
└─────────────────┘
```

### Intent Classification

```typescript
export class IntentClassifier {
  async classifyIntent(message: string, context: AgentContext): Promise<Intent> {
    const prompt = `
      Given the user message and context, classify the intent.

      User message: "${message}"

      Recent context:
      ${context.recentTopics.map((t) => `- ${t.topic}`).join('\n')}

      Possible intents:
      - search_information (user wants to find something)
      - create_item (user wants to create email/event/document)
      - update_item (user wants to modify existing item)
      - delete_item (user wants to remove something)
      - get_summary (user wants overview/summary)
      - execute_workflow (user wants automated task)
      - ask_question (user has general question)
      - small_talk (casual conversation)

      Return JSON with: { intent: string, confidence: number, entities: object }
    `;

    const result = await this.llm.complete(prompt, { temperature: 0.1 });
    return JSON.parse(result);
  }
}
```

### Tool Selection Strategy

```typescript
export class ToolSelector {
  selectTools(intent: Intent, availableTools: McpTool[]): ToolPlan {
    const plan: ToolPlan = {
      tools: [],
      sequence: 'sequential' | 'parallel',
      estimatedTime: 0,
    };

    switch (intent.intent) {
      case 'search_information':
        // Determine what to search
        if (intent.entities.emailRelated) {
          plan.tools.push({ name: 'search_emails', params: {...} });
        }
        if (intent.entities.fileRelated) {
          plan.tools.push({ name: 'search_files', params: {...} });
        }
        plan.sequence = 'parallel'; // Can search simultaneously
        break;

      case 'create_item':
        if (intent.entities.type === 'email') {
          plan.tools.push({ name: 'send_email', params: {...} });
        } else if (intent.entities.type === 'event') {
          plan.tools.push({ name: 'create_calendar_event', params: {...} });
        }
        plan.sequence = 'sequential';
        break;

      case 'get_summary':
        // Fetch multiple sources
        plan.tools.push(
          { name: 'search_emails', params: { query: 'is:unread', maxResults: 10 } },
          { name: 'get_calendar_events', params: {...} },
        );
        plan.sequence = 'parallel';
        break;

      // ... more cases
    }

    return plan;
  }
}
```

---

## Multi-Agent Collaboration

### Agent Roles

Amaiko supports specialized agents for different domains:

```typescript
enum AgentRole {
  PRIMARY = 'primary',           // General-purpose agent
  EMAIL_SPECIALIST = 'email',    // Email operations expert
  CALENDAR_SPECIALIST = 'calendar', // Scheduling expert
  FILE_SPECIALIST = 'file',      // Document management expert
  CRM_SPECIALIST = 'crm',        // CRM integration expert
  KNOWLEDGE_SPECIALIST = 'knowledge', // Knowledge base expert
}

interface SpecializedAgent {
  role: AgentRole;
  agentId: string;
  capabilities: string[];
  priority: number;
}
```

### Agent Delegation

```typescript
export class AgentOrchestrator {
  /**
   * Delegate task to specialized agent
   */
  async delegateToSpecialist(
    task: Task,
    primaryAgentId: string,
  ): Promise<TaskResult> {
    // 1. Determine which specialist is needed
    const specialist = this.selectSpecialist(task);

    if (!specialist) {
      // Primary agent handles it
      return await this.executePrimary(task, primaryAgentId);
    }

    // 2. Get or create specialist agent
    const specialistAgent = await this.getSpecialistAgent(
      task.userId,
      specialist.role,
    );

    // 3. Prepare task context from primary agent
    const taskContext = await this.prepareTaskContext(primaryAgentId, task);

    // 4. Execute with specialist
    const result = await this.executeSpecialist(
      specialistAgent,
      task,
      taskContext,
    );

    // 5. Update primary agent's memory with result
    await this.updatePrimaryAgentMemory(primaryAgentId, result);

    return result;
  }

  private selectSpecialist(task: Task): SpecializedAgent | null {
    if (task.requiresDeepEmailAnalysis) {
      return { role: AgentRole.EMAIL_SPECIALIST, ... };
    }

    if (task.requiresComplexScheduling) {
      return { role: AgentRole.CALENDAR_SPECIALIST, ... };
    }

    if (task.requiresCRMIntegration) {
      return { role: AgentRole.CRM_SPECIALIST, ... };
    }

    return null;
  }
}
```

### Knowledge Sharing

```typescript
export class KnowledgeSharing {
  /**
   * Share knowledge between agents
   */
  async shareKnowledge(
    sourceAgentId: string,
    targetAgentId: string,
    knowledge: Knowledge,
  ): Promise<void> {
    // 1. Extract relevant facts
    const facts = this.extractFacts(knowledge);

    // 2. Filter for relevance to target agent
    const relevantFacts = this.filterRelevant(facts, targetAgentId);

    // 3. Add to target agent's archival memory
    for (const fact of relevantFacts) {
      await this.archiveToAgent(targetAgentId, fact);
    }

    // 4. Log knowledge transfer
    await this.logTransfer(sourceAgentId, targetAgentId, relevantFacts.length);
  }

  /**
   * Sync common knowledge across all user's agents
   */
  async syncCommonKnowledge(userId: string): Promise<void> {
    const agents = await this.getUserAgents(userId);

    // Collect common facts
    const commonFacts = await this.extractCommonFacts(agents);

    // Distribute to all agents
    for (const agent of agents) {
      await this.updateAgentCommonKnowledge(agent.id, commonFacts);
    }
  }
}
```

---

## Knowledge Base Integration

### ChromaDB Vector Store

```typescript
export class KnowledgeBaseService {
  constructor(
    private chromaClient: ChromaClient,
    private embeddingService: EmbeddingService,
  ) {}

  /**
   * Index new knowledge
   */
  async indexKnowledge(
    agentId: string,
    documents: Document[],
  ): Promise<void> {
    // Generate embeddings
    const embeddings = await this.embeddingService.generateBatch(
      documents.map((d) => d.content),
    );

    // Add to ChromaDB collection
    await this.chromaClient.collection(`agent-${agentId}-knowledge`).add({
      ids: documents.map((d) => d.id),
      embeddings,
      documents: documents.map((d) => d.content),
      metadatas: documents.map((d) => d.metadata),
    });
  }

  /**
   * Semantic search
   */
  async search(
    agentId: string,
    query: string,
    filters?: Record<string, any>,
    limit: number = 5,
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.embeddingService.generate(query);

    // Search ChromaDB
    const results = await this.chromaClient
      .collection(`agent-${agentId}-knowledge`)
      .query({
        queryEmbeddings: [queryEmbedding],
        nResults: limit,
        where: filters,
      });

    return results.documents.map((doc, idx) => ({
      id: results.ids[idx],
      content: doc,
      metadata: results.metadatas[idx],
      similarity: 1 - results.distances[idx], // Convert distance to similarity
    }));
  }

  /**
   * Augment agent context with knowledge
   */
  async augmentContext(
    agentId: string,
    query: string,
  ): Promise<string> {
    const results = await this.search(agentId, query, {}, 3);

    if (results.length === 0) {
      return '';
    }

    return `
      Relevant knowledge from database:
      ${results.map((r, i) => `${i + 1}. ${r.content}`).join('\n')}
    `;
  }
}
```

---

## Performance Optimization

### Caching Strategy

```typescript
export class AgentCacheService {
  /**
   * Cache common queries
   */
  async cacheToolResult(
    toolName: string,
    params: any,
    result: McpToolResult,
    ttl: number = 300, // 5 minutes
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(toolName, params);
    await this.redis.setex(cacheKey, ttl, JSON.stringify(result));
  }

  /**
   * Get cached result
   */
  async getCachedResult(
    toolName: string,
    params: any,
  ): Promise<McpToolResult | null> {
    const cacheKey = this.generateCacheKey(toolName, params);
    const cached = await this.redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }

  private generateCacheKey(toolName: string, params: any): string {
    const paramHash = createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex');
    return `tool:${toolName}:${paramHash}`;
  }
}
```

### Response Streaming

```typescript
/**
 * Stream agent responses for better UX
 */
async function* streamAgentResponse(
  agentId: string,
  message: string,
): AsyncGenerator<string> {
  const agent = await lettaClient.getAgent(agentId);

  // Stream LLM response
  const stream = await agent.chatStream(message);

  for await (const chunk of stream) {
    if (chunk.type === 'assistant_message') {
      yield chunk.content;
    }

    if (chunk.type === 'tool_call') {
      yield `\n[Using tool: ${chunk.toolName}]\n`;
    }

    if (chunk.type === 'tool_result') {
      yield `\n[Tool completed]\n`;
    }
  }
}
```

---

## References

- [Letta Documentation](https://docs.letta.com)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [ChromaDB Documentation](https://docs.trychroma.com)
- [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** Amaiko AI Engineering Team
