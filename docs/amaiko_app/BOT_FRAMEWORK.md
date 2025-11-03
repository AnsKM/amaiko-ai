# Amaiko AI - Bot Framework Documentation

## Table of Contents

1. [Overview](#overview)
2. [Microsoft Teams Bot Architecture](#microsoft-teams-bot-architecture)
3. [Bot Registration &amp; Configuration](#bot-registration--configuration)
4. [Bot Commands &amp; Interactions](#bot-commands--interactions)
5. [Message Handling Flow](#message-handling-flow)
6. [Adaptive Cards &amp; UI Components](#adaptive-cards--ui-components)
7. [Bot State Management](#bot-state-management)
8. [Conversation Flow Patterns](#conversation-flow-patterns)
9. [Proactive Messaging](#proactive-messaging)
10. [Error Handling &amp; Retry Logic](#error-handling--retry-logic)

---

## Overview

Amaiko AI's bot framework provides seamless integration with Microsoft Teams, enabling users to interact with their AI assistant through natural conversation, commands, and rich UI components. The bot leverages Microsoft Bot Framework v4 and integrates deeply with Teams-specific features.

### Key Features

- **Natural Language Processing**: Understand user intent beyond simple commands
- **Rich Interactions**: Adaptive Cards for structured data display
- **Proactive Notifications**: Send updates without user prompts
- **Multi-Channel Support**: Personal chat, team channels, and group chats
- **SSO Integration**: Seamless authentication with Teams
- **File Handling**: Support for file attachments and sharing

---

## Microsoft Teams Bot Architecture

### Bot Framework Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Microsoft Teams Client                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  User Interface                                           │  │
│  │  - Chat window                                            │  │
│  │  - Adaptive Cards                                         │  │
│  │  - Compose box with @mentions                             │  │
│  │  - File attachments                                       │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             │ Bot Framework Protocol
                             │ (HTTPS + JSON)
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    Azure Bot Service                              │
│  - Message routing                                                │
│  - Protocol translation                                           │
│  - Authentication                                                 │
│  - Channel management                                             │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ POST /api/messages
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    Amaiko Backend (NestJS)                        │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                 Bot Adapter                               │    │
│  │  - Receive activities                                     │    │
│  │  - Validate tokens                                        │    │
│  │  - Route to handlers                                      │    │
│  └────────────────────────┬──────────────────────────────────┘    │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────────────────┐    │
│  │              Bot Activity Handler                         │    │
│  │  - onMessage()                                            │    │
│  │  - onConversationUpdate()                                 │    │
│  │  - onMembersAdded()                                       │    │
│  │  - onInvokeActivity()                                     │    │
│  └────────────────────────┬──────────────────────────────────┘    │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────────────────┐    │
│  │              Command Router                               │    │
│  │  - Parse commands                                         │    │
│  │  - Extract parameters                                     │    │
│  │  - Route to services                                      │    │
│  └────────────────────────┬──────────────────────────────────┘    │
│                           │                                       │
│         ┌─────────────────┼─────────────────┐                     │
│         │                 │                 │                     │
│    ┌────▼─────┐    ┌──────▼──────┐    ┌─────▼──────┐              │
│    │  Agent   │    │   Graph     │    │ Workflow   │              │
│    │ Service  │    │  Service    │    │Orchestrator│              │
│    └──────────┘    └─────────────┘    └────────────┘              │
└───────────────────────────────────────────────────────────────────┘
```

### Bot Framework Protocol

The Bot Framework uses a standardized Activity schema:

```typescript
interface Activity {
  type: ActivityType;           // 'message', 'conversationUpdate', etc.
  id: string;                   // Unique activity ID
  timestamp: Date;              // When activity occurred
  channelId: string;            // 'msteams'
  from: ChannelAccount;         // Sender information
  conversation: ConversationAccount; // Conversation context
  recipient: ChannelAccount;    // Bot account
  text?: string;                // Message text
  attachments?: Attachment[];   // Files, cards, etc.
  entities?: Entity[];          // Metadata
  channelData?: any;           // Teams-specific data
  value?: any;                 // Adaptive Card submit data
}
```

---

## Bot Registration & Configuration

### Azure Bot Service Setup

1. **Create Bot Registration**

   ```bash
   az bot create \
     --resource-group amaiko-rg \
     --name amaiko-bot \
     --kind registration \
     --appid <AZURE_APP_ID> \
     --endpoint https://your-domain.com/api/messages
   ```
2. **Configure Channels**

   - Enable Microsoft Teams channel
   - Set messaging endpoint
   - Configure OAuth connection
3. **Bot Configuration in Code**

```typescript
// backend/src/bot/bot.config.ts
import { BotFrameworkAdapter } from 'botbuilder';
import { ConfigService } from '@nestjs/config';

export class BotConfig {
  static createAdapter(config: ConfigService): BotFrameworkAdapter {
    return new BotFrameworkAdapter({
      appId: config.get('MICROSOFT_APP_ID'),
      appPassword: config.get('MICROSOFT_APP_PASSWORD'),
      channelAuthTenant: config.get('AZURE_TENANT_ID'),
    });
  }
}
```

### Teams App Manifest

Location: `/teams-app/manifest.json`

Key sections:

```json
{
  "manifestVersion": "1.16",
  "id": "YOUR_APP_ID",
  "version": "1.0.0",
  "name": {
    "short": "Amaiko AI",
    "full": "Amaiko AI Assistant - Your Personal AI Buddy"
  },
  "bots": [
    {
      "botId": "YOUR_MICROSOFT_APP_ID",
      "scopes": ["personal", "team", "groupchat"],
      "supportsFiles": true,
      "isNotificationOnly": false,
      "commandLists": [
        {
          "scopes": ["personal", "team", "groupchat"],
          "commands": [
            {
              "title": "help",
              "description": "Get help and learn what I can do"
            },
            {
              "title": "search emails",
              "description": "Search your emails with a query"
            },
            {
              "title": "check calendar",
              "description": "View your upcoming calendar events"
            },
            {
              "title": "create event",
              "description": "Create a new calendar event"
            },
            {
              "title": "search files",
              "description": "Search for files in OneDrive/SharePoint"
            },
            {
              "title": "daily briefing",
              "description": "Get your daily summary of emails and calendar"
            },
            {
              "title": "start workflow",
              "description": "Start an automated workflow"
            }
          ]
        }
      ]
    }
  ],
  "permissions": [
    "identity",
    "messageTeamMembers"
  ]
}
```

---

## Bot Commands & Interactions

### Command Structure

Amaiko AI supports three types of commands:

1. **Slash Commands**: `/help`, `/search`
2. **Natural Language**: "Show me my calendar", "Search for urgent emails"
3. **Adaptive Card Actions**: Button clicks, form submissions

### Command Registry

```typescript
// backend/src/bot/commands/command-registry.ts
export class CommandRegistry {
  private commands: Map<string, CommandHandler> = new Map();

  constructor() {
    this.registerCommand('help', new HelpCommand());
    this.registerCommand('search', new SearchCommand());
    this.registerCommand('calendar', new CalendarCommand());
    this.registerCommand('email', new EmailCommand());
    this.registerCommand('workflow', new WorkflowCommand());
    this.registerCommand('briefing', new BriefingCommand());
  }

  async execute(
    context: TurnContext,
    command: string,
    args: string[]
  ): Promise<void> {
    const handler = this.commands.get(command);

    if (!handler) {
      await context.sendActivity('Command not found. Type "help" for available commands.');
      return;
    }

    await handler.execute(context, args);
  }
}
```

### Built-in Commands

#### 1. Help Command

```typescript
export class HelpCommand implements CommandHandler {
  async execute(context: TurnContext): Promise<void> {
    const card = this.createHelpCard();
    await context.sendActivity({
      attachments: [card],
    });
  }

  private createHelpCard(): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Amaiko AI - Available Commands',
          weight: 'Bolder',
          size: 'Large',
        },
        {
          type: 'TextBlock',
          text: 'I can help you with the following:',
          wrap: true,
        },
        {
          type: 'FactSet',
          facts: [
            { title: '/help', value: 'Show this help message' },
            { title: '/search emails [query]', value: 'Search your emails' },
            { title: '/calendar', value: 'View upcoming events' },
            { title: '/create event', value: 'Create calendar event' },
            { title: '/search files [query]', value: 'Find files' },
            { title: '/briefing', value: 'Get daily summary' },
            { title: '/workflow [name]', value: 'Start workflow' },
          ],
        },
        {
          type: 'TextBlock',
          text: 'You can also ask me questions naturally, like:',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: '- "Show me urgent emails from today"',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: '- "What\'s on my calendar tomorrow?"',
          wrap: true,
        },
        {
          type: 'TextBlock',
          text: '- "Create a meeting with John at 2pm"',
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Documentation',
          url: 'https://docs.amaiko.ai',
        },
      ],
    });
  }
}
```

#### 2. Search Command

```typescript
export class SearchCommand implements CommandHandler {
  constructor(
    private agentService: AgentService,
    private graphService: GraphService,
  ) {}

  async execute(context: TurnContext, args: string[]): Promise<void> {
    if (args.length === 0) {
      await context.sendActivity('Please provide a search query. Example: /search important emails');
      return;
    }

    const query = args.join(' ');
    const userId = context.activity.from.aadObjectId;
    const userToken = await this.getUserToken(context);

    // Show typing indicator
    await context.sendActivity({ type: 'typing' });

    try {
      // Use agent to search
      const response = await this.agentService.chatWithAgent(
        userId,
        `Search emails: ${query}`,
        userToken,
      );

      // Format and send results
      const card = this.createSearchResultsCard(response);
      await context.sendActivity({ attachments: [card] });
    } catch (error) {
      await context.sendActivity('Sorry, I encountered an error while searching. Please try again.');
    }
  }

  private createSearchResultsCard(results: any): Attachment {
    // Create adaptive card with results
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Search Results',
          weight: 'Bolder',
          size: 'Large',
        },
        {
          type: 'Container',
          items: results.emails.map((email: any) => ({
            type: 'Container',
            items: [
              {
                type: 'TextBlock',
                text: email.subject,
                weight: 'Bolder',
              },
              {
                type: 'TextBlock',
                text: `From: ${email.from}`,
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: email.preview,
                wrap: true,
              },
            ],
            separator: true,
          })),
        },
      ],
    });
  }
}
```

#### 3. Calendar Command

```typescript
export class CalendarCommand implements CommandHandler {
  constructor(
    private graphService: GraphService,
  ) {}

  async execute(context: TurnContext, args: string[]): Promise<void> {
    const userId = context.activity.from.aadObjectId;
    const userToken = await this.getUserToken(context);

    await context.sendActivity({ type: 'typing' });

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 7);

      const events = await this.graphService.getCalendarEvents(
        userToken,
        today,
        tomorrow,
      );

      const card = this.createCalendarCard(events);
      await context.sendActivity({ attachments: [card] });
    } catch (error) {
      await context.sendActivity('Unable to fetch calendar events.');
    }
  }

  private createCalendarCard(events: Event[]): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Your Upcoming Events',
          weight: 'Bolder',
          size: 'Large',
        },
        ...events.map((event) => ({
          type: 'Container',
          items: [
            {
              type: 'ColumnSet',
              columns: [
                {
                  type: 'Column',
                  width: 'auto',
                  items: [
                    {
                      type: 'TextBlock',
                      text: this.formatDate(event.start.dateTime),
                      weight: 'Bolder',
                    },
                  ],
                },
                {
                  type: 'Column',
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: event.subject,
                      wrap: true,
                    },
                    {
                      type: 'TextBlock',
                      text: event.location?.displayName || 'No location',
                      isSubtle: true,
                    },
                  ],
                },
              ],
            },
          ],
          separator: true,
        })),
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Create New Event',
          data: { action: 'create_event' },
        },
      ],
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
```

#### 4. Workflow Command

```typescript
export class WorkflowCommand implements CommandHandler {
  constructor(
    private workflowOrchestrator: WorkflowOrchestratorService,
  ) {}

  async execute(context: TurnContext, args: string[]): Promise<void> {
    if (args.length === 0) {
      // Show available workflows
      await this.showWorkflows(context);
      return;
    }

    const workflowName = args[0];
    const userId = context.activity.from.aadObjectId;
    const userToken = await this.getUserToken(context);

    await context.sendActivity({ type: 'typing' });

    try {
      const workflowRun = await this.workflowOrchestrator.startWorkflow(
        workflowName,
        userId,
        { userToken },
      );

      await context.sendActivity({
        text: `Started workflow: ${workflowName}`,
        attachments: [this.createWorkflowStatusCard(workflowRun)],
      });
    } catch (error) {
      await context.sendActivity(`Error starting workflow: ${error.message}`);
    }
  }

  private async showWorkflows(context: TurnContext): Promise<void> {
    const workflows = this.workflowOrchestrator.getAvailableWorkflows();
    const card = this.createWorkflowListCard(workflows);
    await context.sendActivity({ attachments: [card] });
  }

  private createWorkflowListCard(workflows: WorkflowDefinition[]): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Available Workflows',
          weight: 'Bolder',
          size: 'Large',
        },
        ...workflows.map((workflow) => ({
          type: 'Container',
          items: [
            {
              type: 'TextBlock',
              text: workflow.name,
              weight: 'Bolder',
            },
            {
              type: 'TextBlock',
              text: workflow.description,
              wrap: true,
              isSubtle: true,
            },
          ],
          selectAction: {
            type: 'Action.Submit',
            data: {
              action: 'start_workflow',
              workflow: workflow.name,
            },
          },
          separator: true,
        })),
      ],
    });
  }

  private createWorkflowStatusCard(workflowRun: WorkflowRun): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: 'Workflow Status',
          weight: 'Bolder',
          size: 'Large',
        },
        {
          type: 'FactSet',
          facts: [
            { title: 'Workflow', value: workflowRun.workflowName },
            { title: 'Status', value: workflowRun.status },
            { title: 'Started', value: workflowRun.createdAt.toLocaleString() },
          ],
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Check Status',
          data: {
            action: 'check_workflow_status',
            workflowId: workflowRun.id,
          },
        },
      ],
    });
  }
}
```

---

## Message Handling Flow

### Activity Processing Pipeline

```
Incoming Activity
       │
       ▼
┌──────────────────┐
│  Bot Adapter     │
│  - Validate      │
│  - Authenticate  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Activity Handler │
│ - Route by type  │
└────────┬─────────┘
         │
    ┌────┴────┬────────────┬──────────────┐
    │         │            │              │
    ▼         ▼            ▼              ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────────┐
│Message │ │Invoke│ │Conv.     │ │Members       │
│Handler │ │      │ │Update    │ │Added         │
└────┬───┘ └──┬───┘ └──────┬───┘ └───────┬──────┘
     │        │            │             │
     ▼        ▼            ▼             ▼
┌─────────────────────────────────────────────┐
│            Business Logic                   │
│  - Agent Service                            │
│  - Graph Service                            │
│  - Workflow Orchestrator                    │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Response      │
         │  - Text        │
         │  - Cards       │
         │  - Files       │
         └────────────────┘
```

### Message Handler Implementation

```typescript
// backend/src/bot/bot-activity-handler.ts
import { ActivityHandler, TurnContext, MessageFactory } from 'botbuilder';

export class AmaikoBotActivityHandler extends ActivityHandler {
  constructor(
    private agentService: AgentService,
    private commandRegistry: CommandRegistry,
    private authService: GraphAuthService,
  ) {
    super();

    // Handle incoming messages
    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });

    // Handle conversation updates
    this.onConversationUpdate(async (context, next) => {
      await this.handleConversationUpdate(context);
      await next();
    });

    // Handle members added
    this.onMembersAdded(async (context, next) => {
      await this.handleMembersAdded(context);
      await next();
    });

    // Handle adaptive card submissions
    this.onInvokeActivity(async (context, next) => {
      await this.handleInvoke(context);
      await next();
    });
  }

  private async handleMessage(context: TurnContext): Promise<void> {
    const text = context.activity.text?.trim();

    if (!text) {
      return;
    }

    // Extract user info
    const userId = context.activity.from.aadObjectId;
    const userToken = await this.getUserToken(context);

    // Check if it's a command
    if (text.startsWith('/')) {
      await this.handleCommand(context, text);
      return;
    }

    // Natural language processing via agent
    await this.handleNaturalLanguage(context, text, userId, userToken);
  }

  private async handleCommand(
    context: TurnContext,
    text: string,
  ): Promise<void> {
    const [command, ...args] = text.slice(1).split(' ');
    await this.commandRegistry.execute(context, command.toLowerCase(), args);
  }

  private async handleNaturalLanguage(
    context: TurnContext,
    text: string,
    userId: string,
    userToken: string,
  ): Promise<void> {
    // Show typing indicator
    await context.sendActivity({ type: 'typing' });

    try {
      // Send to AI agent
      const response = await this.agentService.chatWithAgent(
        userId,
        text,
        userToken,
      );

      // Format response
      await this.sendAgentResponse(context, response);
    } catch (error) {
      this.logger.error('Error in natural language processing', error);
      await context.sendActivity('Sorry, I encountered an error. Please try again.');
    }
  }

  private async sendAgentResponse(
    context: TurnContext,
    response: any,
  ): Promise<void> {
    // If agent used tools, show results
    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const toolCall of response.toolCalls) {
        const card = this.createToolResultCard(toolCall);
        await context.sendActivity({ attachments: [card] });
      }
    }

    // Send agent message
    for (const message of response.messages) {
      if (message.messageType === 'assistant_message') {
        await context.sendActivity(message.content);
      }
    }
  }

  private async handleConversationUpdate(context: TurnContext): Promise<void> {
    // Handle bot added to conversation
    if (context.activity.membersAdded) {
      for (const member of context.activity.membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await this.sendWelcomeMessage(context);
        }
      }
    }
  }

  private async handleMembersAdded(context: TurnContext): Promise<void> {
    const userId = context.activity.from.aadObjectId;
    const userProfile = await this.getUserProfile(context);

    // Create agent for new user
    try {
      await this.agentService.createUserAgent(userId, userProfile);
      await this.sendWelcomeMessage(context);
    } catch (error) {
      this.logger.error('Error creating agent for new user', error);
    }
  }

  private async handleInvoke(context: TurnContext): Promise<void> {
    const value = context.activity.value;

    if (!value || !value.action) {
      return;
    }

    // Route based on action
    switch (value.action) {
      case 'create_event':
        await this.handleCreateEvent(context, value);
        break;
      case 'start_workflow':
        await this.handleStartWorkflow(context, value);
        break;
      case 'check_workflow_status':
        await this.handleCheckWorkflowStatus(context, value);
        break;
      default:
        await context.sendActivity('Unknown action');
    }
  }

  private async sendWelcomeMessage(context: TurnContext): Promise<void> {
    const welcomeCard = CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'Image',
          url: 'https://your-domain.com/logo.png',
          size: 'Medium',
          horizontalAlignment: 'Center',
        },
        {
          type: 'TextBlock',
          text: 'Welcome to Amaiko AI!',
          weight: 'Bolder',
          size: 'ExtraLarge',
          horizontalAlignment: 'Center',
        },
        {
          type: 'TextBlock',
          text: 'I\'m your personal AI assistant. I can help you with:',
          wrap: true,
        },
        {
          type: 'Container',
          items: [
            { type: 'TextBlock', text: '✉️ Managing emails' },
            { type: 'TextBlock', text: '📅 Calendar scheduling' },
            { type: 'TextBlock', text: '📁 File searches' },
            { type: 'TextBlock', text: '🤖 Automated workflows' },
          ],
        },
        {
          type: 'TextBlock',
          text: 'Type "help" to see what I can do!',
          wrap: true,
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'Get Started',
          data: { action: 'show_help' },
        },
      ],
    });

    await context.sendActivity({ attachments: [welcomeCard] });
  }

  private async getUserToken(context: TurnContext): Promise<string> {
    // Extract SSO token from Teams
    const token = context.activity.channelData?.ssoToken;

    if (!token) {
      // Request SSO token
      await this.requestSSOToken(context);
      throw new Error('Token required');
    }

    // Exchange for Graph token via OBO
    return await this.authService.acquireTokenOnBehalfOf(token);
  }

  private async requestSSOToken(context: TurnContext): Promise<void> {
    const signInCard = CardFactory.oauthCard(
      'Azure Active Directory',
      'Sign In',
      'Please sign in to continue',
    );

    await context.sendActivity({ attachments: [signInCard] });
  }

  private async getUserProfile(context: TurnContext): Promise<UserProfile> {
    return {
      name: context.activity.from.name,
      email: context.activity.from.email || '',
      role: context.activity.channelData?.user?.jobTitle,
      department: context.activity.channelData?.user?.department,
    };
  }
}
```

---

## Adaptive Cards & UI Components

### Card Templates

Adaptive Cards provide rich, interactive UI components in Teams:

#### 1. Email Summary Card

```typescript
export function createEmailSummaryCard(emails: Email[]): Attachment {
  return CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `📧 Email Summary (${emails.length} messages)`,
        weight: 'Bolder',
        size: 'Large',
      },
      ...emails.map((email) => ({
        type: 'Container',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'Image',
                    url: getProfilePicture(email.from),
                    size: 'Small',
                    style: 'Person',
                  },
                ],
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: email.subject,
                    weight: 'Bolder',
                    wrap: true,
                  },
                  {
                    type: 'TextBlock',
                    text: email.from.name,
                    isSubtle: true,
                  },
                  {
                    type: 'TextBlock',
                    text: email.bodyPreview,
                    wrap: true,
                    maxLines: 2,
                  },
                  {
                    type: 'TextBlock',
                    text: formatTimeAgo(email.receivedDateTime),
                    isSubtle: true,
                    size: 'Small',
                  },
                ],
              },
            ],
          },
        ],
        selectAction: {
          type: 'Action.Submit',
          data: {
            action: 'view_email',
            messageId: email.id,
          },
        },
        separator: true,
      })),
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Refresh',
        data: { action: 'refresh_emails' },
      },
    ],
  });
}
```

#### 2. Calendar Event Card

```typescript
export function createCalendarEventCard(event: Event): Attachment {
  return CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'Container',
        style: 'emphasis',
        items: [
          {
            type: 'TextBlock',
            text: event.subject,
            weight: 'Bolder',
            size: 'Large',
            wrap: true,
          },
        ],
      },
      {
        type: 'FactSet',
        facts: [
          {
            title: '📅 Date',
            value: formatDate(event.start.dateTime),
          },
          {
            title: '⏰ Time',
            value: `${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}`,
          },
          {
            title: '📍 Location',
            value: event.location?.displayName || 'No location',
          },
          {
            title: '👥 Attendees',
            value: event.attendees?.length.toString() || '0',
          },
        ],
      },
      {
        type: 'TextBlock',
        text: 'Description',
        weight: 'Bolder',
      },
      {
        type: 'TextBlock',
        text: event.body?.content || 'No description',
        wrap: true,
      },
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'Join Meeting',
        url: event.onlineMeetingUrl,
      },
      {
        type: 'Action.Submit',
        title: 'Edit',
        data: {
          action: 'edit_event',
          eventId: event.id,
        },
      },
      {
        type: 'Action.Submit',
        title: 'Delete',
        data: {
          action: 'delete_event',
          eventId: event.id,
        },
        style: 'destructive',
      },
    ],
  });
}
```

#### 3. Workflow Progress Card

```typescript
export function createWorkflowProgressCard(workflowRun: WorkflowRun): Attachment {
  const progress = calculateProgress(workflowRun);

  return CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `🔄 Workflow: ${workflowRun.workflowName}`,
        weight: 'Bolder',
        size: 'Large',
      },
      {
        type: 'Container',
        items: [
          {
            type: 'ProgressBar',
            title: 'Progress',
            value: progress,
          },
        ],
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Status', value: getStatusEmoji(workflowRun.status) + ' ' + workflowRun.status },
          { title: 'Current Stage', value: workflowRun.currentStage },
          { title: 'Started', value: formatTimeAgo(workflowRun.startedAt) },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Refresh Status',
        data: {
          action: 'refresh_workflow',
          workflowId: workflowRun.id,
        },
      },
      {
        type: 'Action.Submit',
        title: 'Cancel',
        data: {
          action: 'cancel_workflow',
          workflowId: workflowRun.id,
        },
        style: 'destructive',
      },
    ],
  });
}
```

#### 4. File Search Results Card

```typescript
export function createFileSearchCard(files: DriveItem[]): Attachment {
  return CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: `📁 File Search Results (${files.length} files)`,
        weight: 'Bolder',
        size: 'Large',
      },
      ...files.map((file) => ({
        type: 'Container',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'Image',
                    url: getFileIcon(file.name),
                    size: 'Small',
                  },
                ],
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: file.name,
                    weight: 'Bolder',
                    wrap: true,
                  },
                  {
                    type: 'TextBlock',
                    text: `${formatFileSize(file.size)} • Modified ${formatTimeAgo(file.lastModifiedDateTime)}`,
                    isSubtle: true,
                    size: 'Small',
                  },
                ],
              },
            ],
          },
        ],
        selectAction: {
          type: 'Action.OpenUrl',
          url: file.webUrl,
        },
        separator: true,
      })),
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'New Search',
        data: { action: 'new_file_search' },
      },
    ],
  });
}
```

### Interactive Forms

```typescript
export function createEventCreationForm(): Attachment {
  return CardFactory.adaptiveCard({
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: 'Create Calendar Event',
        weight: 'Bolder',
        size: 'Large',
      },
      {
        type: 'Input.Text',
        id: 'subject',
        label: 'Event Title',
        placeholder: 'Team Meeting',
        isRequired: true,
      },
      {
        type: 'Input.Date',
        id: 'date',
        label: 'Date',
        isRequired: true,
      },
      {
        type: 'Input.Time',
        id: 'startTime',
        label: 'Start Time',
        isRequired: true,
      },
      {
        type: 'Input.Time',
        id: 'endTime',
        label: 'End Time',
        isRequired: true,
      },
      {
        type: 'Input.Text',
        id: 'location',
        label: 'Location',
        placeholder: 'Conference Room A',
      },
      {
        type: 'Input.Text',
        id: 'attendees',
        label: 'Attendees (comma-separated emails)',
        placeholder: 'john@example.com, jane@example.com',
        isMultiline: false,
      },
      {
        type: 'Input.Toggle',
        id: 'isOnlineMeeting',
        title: 'Add Teams Meeting',
        value: 'false',
      },
      {
        type: 'Input.Text',
        id: 'body',
        label: 'Description',
        placeholder: 'Meeting agenda...',
        isMultiline: true,
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Create Event',
        data: { action: 'submit_create_event' },
      },
      {
        type: 'Action.Submit',
        title: 'Cancel',
        data: { action: 'cancel' },
      },
    ],
  });
}
```

---

## Bot State Management

### State Architecture

```typescript
// backend/src/bot/state/conversation-state.ts
export interface ConversationState {
  userId: string;
  conversationId: string;
  lastActivity: Date;
  context: {
    currentTopic?: string;
    pendingAction?: PendingAction;
    recentSearches?: string[];
    preferences?: UserPreferences;
  };
}

export interface PendingAction {
  type: 'create_event' | 'send_email' | 'start_workflow';
  data: any;
  expiresAt: Date;
}

export interface UserPreferences {
  timezone: string;
  language: string;
  notificationSettings: {
    email: boolean;
    workflow: boolean;
    calendar: boolean;
  };
}
```

### State Management Service

```typescript
@Injectable()
export class BotStateService {
  constructor(
    @Inject('REDIS_CLIENT')
    private redisClient: Redis,
  ) {}

  async getConversationState(
    conversationId: string,
  ): Promise<ConversationState | null> {
    const key = `conversation:${conversationId}`;
    const data = await this.redisClient.get(key);

    return data ? JSON.parse(data) : null;
  }

  async setConversationState(
    conversationId: string,
    state: ConversationState,
  ): Promise<void> {
    const key = `conversation:${conversationId}`;
    const ttl = 3600; // 1 hour

    await this.redisClient.setex(key, ttl, JSON.stringify(state));
  }

  async updateContext(
    conversationId: string,
    context: Partial<ConversationState['context']>,
  ): Promise<void> {
    const state = await this.getConversationState(conversationId);

    if (!state) {
      return;
    }

    state.context = { ...state.context, ...context };
    await this.setConversationState(conversationId, state);
  }

  async setPendingAction(
    conversationId: string,
    action: PendingAction,
  ): Promise<void> {
    await this.updateContext(conversationId, { pendingAction: action });
  }

  async getPendingAction(
    conversationId: string,
  ): Promise<PendingAction | null> {
    const state = await this.getConversationState(conversationId);
    return state?.context.pendingAction || null;
  }

  async clearPendingAction(conversationId: string): Promise<void> {
    await this.updateContext(conversationId, { pendingAction: undefined });
  }
}
```

---

## Conversation Flow Patterns

### Multi-Turn Conversations

```typescript
// Example: Creating a calendar event with multiple steps
export class EventCreationFlow {
  constructor(private stateService: BotStateService) {}

  async start(context: TurnContext): Promise<void> {
    await this.stateService.setPendingAction(context.activity.conversation.id, {
      type: 'create_event',
      data: {},
      expiresAt: new Date(Date.now() + 300000), // 5 minutes
    });

    await context.sendActivity('Let\'s create a calendar event. What\'s the title?');
  }

  async handleResponse(context: TurnContext, response: string): Promise<void> {
    const conversationId = context.activity.conversation.id;
    const action = await this.stateService.getPendingAction(conversationId);

    if (!action || action.type !== 'create_event') {
      return;
    }

    const eventData = action.data;

    // State machine for event creation
    if (!eventData.subject) {
      eventData.subject = response;
      action.data = eventData;
      await this.stateService.setPendingAction(conversationId, action);
      await context.sendActivity('Got it. What date should this event be on? (YYYY-MM-DD)');
    } else if (!eventData.date) {
      eventData.date = response;
      action.data = eventData;
      await this.stateService.setPendingAction(conversationId, action);
      await context.sendActivity('What time does it start? (HH:MM)');
    } else if (!eventData.startTime) {
      eventData.startTime = response;
      action.data = eventData;
      await this.stateService.setPendingAction(conversationId, action);
      await context.sendActivity('What time does it end? (HH:MM)');
    } else if (!eventData.endTime) {
      eventData.endTime = response;
      action.data = eventData;
      await this.stateService.setPendingAction(conversationId, action);
      await context.sendActivity('Any specific location? (or type "none")');
    } else if (!eventData.location) {
      eventData.location = response === 'none' ? '' : response;
      action.data = eventData;
      await this.stateService.setPendingAction(conversationId, action);
      await context.sendActivity('Should I add a Teams meeting link? (yes/no)');
    } else if (eventData.isOnlineMeeting === undefined) {
      eventData.isOnlineMeeting = response.toLowerCase() === 'yes';

      // All data collected, create event
      await this.createEvent(context, eventData);
      await this.stateService.clearPendingAction(conversationId);
    }
  }

  private async createEvent(context: TurnContext, eventData: any): Promise<void> {
    await context.sendActivity({ type: 'typing' });

    try {
      const userToken = await this.getUserToken(context);

      const startDateTime = `${eventData.date}T${eventData.startTime}:00`;
      const endDateTime = `${eventData.date}T${eventData.endTime}:00`;

      const event = await this.graphService.createCalendarEvent(userToken, {
        subject: eventData.subject,
        startDateTime,
        endDateTime,
        location: eventData.location,
        isOnlineMeeting: eventData.isOnlineMeeting,
      });

      const card = createCalendarEventCard(event);
      await context.sendActivity({
        text: '✅ Event created successfully!',
        attachments: [card],
      });
    } catch (error) {
      await context.sendActivity('Sorry, I couldn\'t create the event. Please try again.');
    }
  }
}
```

---

## Proactive Messaging

### Scheduled Notifications

```typescript
@Injectable()
export class ProactiveMessagingService {
  constructor(
    private botAdapter: BotFrameworkAdapter,
    private configService: ConfigService,
  ) {}

  /**
   * Send proactive message to user
   */
  async sendProactiveMessage(
    conversationReference: Partial<ConversationReference>,
    message: string | Partial<Activity>,
  ): Promise<void> {
    await this.botAdapter.continueConversation(
      conversationReference,
      async (turnContext) => {
        await turnContext.sendActivity(message);
      },
    );
  }

  /**
   * Send daily briefing
   */
  async sendDailyBriefing(
    userId: string,
    conversationReference: Partial<ConversationReference>,
  ): Promise<void> {
    try {
      // Get user's data
      const userToken = await this.getStoredToken(userId);
      const [emails, events] = await Promise.all([
        this.graphService.searchEmails(userToken, {
          query: 'is:unread',
          maxResults: 5,
        }),
        this.graphService.getCalendarEvents(
          userToken,
          new Date(),
          new Date(Date.now() + 86400000), // Next 24 hours
        ),
      ]);

      // Create briefing card
      const card = this.createBriefingCard(emails, events);

      // Send proactive message
      await this.sendProactiveMessage(conversationReference, {
        attachments: [card],
      });
    } catch (error) {
      this.logger.error('Error sending daily briefing', error);
    }
  }

  /**
   * Notify workflow completion
   */
  async notifyWorkflowCompletion(
    userId: string,
    conversationReference: Partial<ConversationReference>,
    workflowRun: WorkflowRun,
  ): Promise<void> {
    const card = createWorkflowCompletionCard(workflowRun);

    await this.sendProactiveMessage(conversationReference, {
      text: `✅ Workflow "${workflowRun.workflowName}" completed successfully!`,
      attachments: [card],
    });
  }

  private createBriefingCard(emails: Message[], events: Event[]): Attachment {
    return CardFactory.adaptiveCard({
      type: 'AdaptiveCard',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: '☀️ Good Morning! Here\'s your daily briefing',
          weight: 'Bolder',
          size: 'Large',
        },
        {
          type: 'Container',
          items: [
            {
              type: 'TextBlock',
              text: `📧 You have ${emails.length} unread emails`,
              weight: 'Bolder',
            },
            ...emails.slice(0, 3).map((email) => ({
              type: 'TextBlock',
              text: `• ${email.subject}`,
              wrap: true,
            })),
          ],
        },
        {
          type: 'Container',
          items: [
            {
              type: 'TextBlock',
              text: `📅 You have ${events.length} events today`,
              weight: 'Bolder',
            },
            ...events.slice(0, 3).map((event) => ({
              type: 'TextBlock',
              text: `• ${formatTime(event.start.dateTime)} - ${event.subject}`,
              wrap: true,
            })),
          ],
        },
      ],
      actions: [
        {
          type: 'Action.Submit',
          title: 'View All Emails',
          data: { action: 'view_emails' },
        },
        {
          type: 'Action.Submit',
          title: 'View Calendar',
          data: { action: 'view_calendar' },
        },
      ],
    });
  }
}
```

### Scheduling Briefings

```typescript
// backend/src/bot/schedulers/briefing.scheduler.ts
@Injectable()
export class BriefingScheduler {
  constructor(
    private proactiveMessaging: ProactiveMessagingService,
    private agentMemoryService: AgentMemoryService,
  ) {}

  @Cron('0 8 * * 1-5') // 8 AM weekdays
  async sendMorningBriefings(): Promise<void> {
    const activeMappings = await this.agentMemoryService.getAllActiveMappings();

    for (const mapping of activeMappings) {
      const conversationRef = this.getConversationReference(mapping);

      await this.proactiveMessaging.sendDailyBriefing(
        mapping.userId,
        conversationRef,
      );
    }
  }

  private getConversationReference(
    mapping: AgentMapping,
  ): Partial<ConversationReference> {
    // Retrieve stored conversation reference from metadata
    return mapping.metadata?.conversationReference || null;
  }
}
```

---

## Error Handling & Retry Logic

### Error Handling Strategy

```typescript
@Injectable()
export class BotErrorHandler {
  private readonly logger = new Logger(BotErrorHandler.name);

  async handleError(
    context: TurnContext,
    error: Error,
  ): Promise<void> {
    this.logger.error('Bot error', error);

    // Send user-friendly error message
    await context.sendActivity(this.getUserFriendlyMessage(error));

    // Log to monitoring service
    await this.logToMonitoring(context, error);
  }

  private getUserFriendlyMessage(error: Error): string {
    if (error.message.includes('authentication')) {
      return 'I need you to sign in again. Please click the sign-in button.';
    }

    if (error.message.includes('rate limit')) {
      return 'I\'m receiving too many requests right now. Please try again in a moment.';
    }

    if (error.message.includes('network')) {
      return 'I\'m having trouble connecting to Microsoft services. Please try again.';
    }

    return 'Sorry, I encountered an unexpected error. Please try again or contact support.';
  }

  private async logToMonitoring(
    context: TurnContext,
    error: Error,
  ): Promise<void> {
    // Send to Application Insights, Sentry, etc.
    const metadata = {
      userId: context.activity.from.aadObjectId,
      conversationId: context.activity.conversation.id,
      activityType: context.activity.type,
      timestamp: new Date().toISOString(),
    };

    // Log implementation
  }
}
```

### Retry Logic

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: 'linear' | 'exponential';
  } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const delayMs = options.delayMs || 1000;
  const backoff = options.backoff || 'exponential';

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxAttempts) {
        const delay =
          backoff === 'exponential'
            ? delayMs * Math.pow(2, attempt - 1)
            : delayMs * attempt;

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Usage
const result = await withRetry(
  () => graphService.sendEmail(userToken, params),
  { maxAttempts: 3, delayMs: 1000, backoff: 'exponential' },
);
```

---

## References

- [Microsoft Bot Framework Documentation](https://docs.microsoft.com/en-us/azure/bot-service)
- [Adaptive Cards Designer](https://adaptivecards.io/designer/)
- [Teams Bot Samples](https://github.com/microsoft/BotBuilder-Samples)
- [Bot Framework SDK](https://github.com/microsoft/botbuilder-js)

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** Amaiko AI Engineering Team
