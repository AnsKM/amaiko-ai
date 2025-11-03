# API_REFERENCE.md - API Reference Documentation

**Version:** 1.0
**Last Updated:** November 2025
**Application:** Amaiko AI - Enterprise AI Assistant

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [REST API Endpoints](#rest-api-endpoints)
4. [Microsoft Graph API Integration](#microsoft-graph-api-integration)
5. [MCP Tools API](#mcp-tools-api)
6. [Letta Agent API](#letta-agent-api)
7. [Database Operations](#database-operations)
8. [WebSocket API](#websocket-api)
9. [Webhook Handlers](#webhook-handlers)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Security Considerations](#security-considerations)

---

## Overview

This document provides comprehensive API reference documentation for the Amaiko AI application. It covers all REST endpoints, Microsoft Graph API integrations, MCP tools, database operations, and authentication flows.

### Base URLs

```
Production:  https://api.amaiko.ai
Development: http://localhost:8100
Staging:     https://api-staging.amaiko.ai
```

### API Versioning

```
Current Version: v1
Base Path: /api/v1
```

### Supported Protocols

- **HTTP/HTTPS**: REST API endpoints
- **WebSocket**: Real-time notifications
- **Webhooks**: Microsoft Graph change notifications

---

## Authentication

### Overview

Amaiko AI uses multiple authentication mechanisms:

1. **Azure AD OAuth 2.0** - User authentication
2. **On-Behalf-Of (OBO) Flow** - Graph API access
3. **Client Credentials Flow** - Application-level access
4. **JWT Tokens** - API authentication

### Authentication Flow Diagram

```
┌──────────────┐                                   ┌─────────────┐
│              │                                   │             │
│  Microsoft   │◄─────── (1) Auth Request ─────────┤   Client    │
│  Teams Bot   │                                   │ Application │
│              │                                   │             │
└───────┬──────┘                                   └─────────────┘
        │
        │ (2) User Token
        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Amaiko Backend                            │
│                                                              │
│  ┌──────────────────┐          ┌─────────────────────┐       │
│  │ GraphAuthService │◄────────▶│   AgentService      │       │
│  │                  │          │                     │       │
│  │  OBO Token Flow  │          │  Create/Get Agent   │       │
│  └────────┬─────────┘          └─────────────────────┘       │
│           │                                                  │
│           │ (3) Exchange Token                               │
│           ▼                                                  │
│  ┌──────────────────┐                                        │
│  │  Azure AD MSAL   │                                        │
│  │                  │                                        │
│  │  acquireTokenOBO │                                        │
│  └────────┬─────────┘                                        │
└───────────┼──────────────────────────────────────────────────┘
            │
            │ (4) Graph API Token
            ▼
┌───────────────────────┐
│                       │
│  Microsoft Graph API  │
│                       │
│  • Mail               │
│  • Calendar           │
│  • Files              │
│  • People             │
│                       │
└───────────────────────┘
```

---

## Authentication Endpoints

### 1. Get Authorization URL

**Endpoint:** `GET /api/v1/auth/authorize`

**Description:** Generate Azure AD authorization URL for user sign-in.

**Query Parameters:**

| Parameter    | Type     | Required | Description                         |
| ------------ | -------- | -------- | ----------------------------------- |
| redirect_uri | string   | Yes      | OAuth redirect URI                  |
| scopes       | string[] | No       | Requested permission scopes         |
| state        | string   | No       | State parameter for CSRF protection |

**Request Example:**

```http
GET /api/v1/auth/authorize?redirect_uri=https://app.amaiko.ai/callback&scopes=Mail.Read,Calendar.ReadWrite
Host: api.amaiko.ai
```

**Response:**

```json
{
  "authUrl": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=...&response_type=code&redirect_uri=...",
  "state": "abc123xyz"
}
```

**Status Codes:**

- `200 OK` - Authorization URL generated successfully
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

---

### 2. Exchange Authorization Code

**Endpoint:** `POST /api/v1/auth/token`

**Description:** Exchange authorization code for access and refresh tokens.

**Request Body:**

```json
{
  "code": "M.C507_BAY.2.U...",
  "redirect_uri": "https://app.amaiko.ai/callback",
  "scopes": [
    "Mail.Read",
    "Mail.Send",
    "Calendars.ReadWrite",
    "Files.Read.All"
  ]
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "0.AXEA1Nk...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "Mail.Read Mail.Send Calendars.ReadWrite Files.Read.All"
}
```

**Status Codes:**

- `200 OK` - Token exchanged successfully
- `400 Bad Request` - Invalid authorization code
- `401 Unauthorized` - Authentication failed
- `500 Internal Server Error` - Server error

---

### 3. Refresh Access Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Description:** Refresh expired access token using refresh token.

**Request Body:**

```json
{
  "refresh_token": "0.AXEA1Nk..."
}
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "0.AXEA1Nk...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

**Status Codes:**

- `200 OK` - Token refreshed successfully
- `400 Bad Request` - Invalid refresh token
- `401 Unauthorized` - Refresh token expired
- `500 Internal Server Error` - Server error

---

### 4. Acquire On-Behalf-Of Token

**Endpoint:** `POST /api/v1/auth/obo`

**Description:** Exchange user token for Graph API access token (OBO flow).

**Headers:**

```
Authorization: Bearer <user_teams_token>
```

**Response:**

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "expires_in": 3599,
  "token_type": "Bearer",
  "scope": "Mail.Read Mail.Send Calendars.ReadWrite Files.Read.All User.Read People.Read"
}
```

**Implementation:**

```typescript
// File: backend/src/graph/graph-auth.service.ts
async acquireTokenOnBehalfOf(userToken: string): Promise<string> {
  const oboRequest: msal.OnBehalfOfRequest = {
    oboAssertion: userToken,
    scopes: [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Files.Read.All',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/People.Read',
    ],
  };

  const response = await this.msalClient.acquireTokenOnBehalfOf(oboRequest);
  return response.accessToken;
}
```

**Status Codes:**

- `200 OK` - OBO token acquired successfully
- `401 Unauthorized` - Invalid user token
- `403 Forbidden` - Insufficient permissions
- `500 Internal Server Error` - Server error

---

## REST API Endpoints

### Agent Management

#### 1. Create Agent

**Endpoint:** `POST /api/v1/agents`

**Description:** Create a new Letta agent for a user.

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-123",
  "userProfile": {
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "Sales Manager",
    "department": "Sales"
  },
  "preferences": {
    "workSchedule": "9-5",
    "priorities": ["inbox_zero", "meeting_efficiency"]
  }
}
```

**Response:**

```json
{
  "agentId": "letta-agent-456",
  "userId": "user-123",
  "status": "active",
  "createdAt": "2025-11-03T10:00:00Z",
  "memory": {
    "persona": {
      "name": "Amaiko Assistant",
      "role": "Professional AI Assistant"
    },
    "human": {
      "name": "John Doe",
      "role": "Sales Manager"
    }
  }
}
```

**Implementation:**

```typescript
// File: backend/src/agents/agent.service.ts
async createUserAgent(userId: string, userProfile: any): Promise<string> {
  const agent = await this.lettaClient.createAgent({
    name: `agent-${userId}`,
    memory: {
      persona: this.buildPersonaMemory(),
      human: this.buildHumanMemory(userProfile),
      conversationContext: '',
      archival: [],
    },
    tools: this.getAvailableTools(),
    model: 'gpt-4o',
    contextWindow: 128000,
  });

  await this.agentMemoryService.saveAgentMapping({
    userId,
    agentId: agent.id,
    metadata: { userProfile, preferences: {} },
  });

  return agent.id;
}
```

**Status Codes:**

- `201 Created` - Agent created successfully
- `400 Bad Request` - Invalid request body
- `409 Conflict` - Agent already exists for user
- `500 Internal Server Error` - Server error

---

#### 2. Get Agent

**Endpoint:** `GET /api/v1/agents/:userId`

**Description:** Retrieve agent information for a user.

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "agentId": "letta-agent-456",
  "userId": "user-123",
  "status": "active",
  "createdAt": "2025-11-03T10:00:00Z",
  "lastActive": "2025-11-03T14:30:00Z",
  "metadata": {
    "totalConversations": 42,
    "totalToolCalls": 156,
    "averageResponseTime": 1.2
  }
}
```

**Status Codes:**

- `200 OK` - Agent retrieved successfully
- `404 Not Found` - No agent found for user
- `500 Internal Server Error` - Server error

---

#### 3. Chat with Agent

**Endpoint:** `POST /api/v1/agents/:agentId/chat`

**Description:** Send a message to the agent and receive a response.

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "Show me my emails from Sarah about budget",
  "context": {
    "userToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "userId": "user-123",
    "conversationId": "conv-789"
  }
}
```

**Response:**

```json
{
  "response": "I found 3 emails from Sarah about budget. Here's a summary:\n\n1. Q4 Budget Review - URGENT (Nov 3, 8:45 AM)\n2. Budget Planning Meeting Notes (Nov 1, 3:20 PM)\n3. FW: Budget Approval Process (Oct 28, 10:15 AM)\n\nWould you like me to show you the full details of any of these emails?",
  "toolCalls": [
    {
      "tool": "search_emails",
      "params": {
        "query": "from:Sarah budget",
        "maxResults": 10
      },
      "result": {
        "status": "success",
        "count": 3
      }
    }
  ],
  "conversationId": "conv-789",
  "timestamp": "2025-11-03T14:35:00Z"
}
```

**Status Codes:**

- `200 OK` - Message processed successfully
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Agent not found
- `500 Internal Server Error` - Server error

---

#### 4. Update Agent Memory

**Endpoint:** `PATCH /api/v1/agents/:agentId/memory`

**Description:** Update agent memory blocks.

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "memoryType": "human",
  "updates": {
    "preferences": {
      "workSchedule": "flexible",
      "priorities": ["inbox_zero"]
    }
  }
}
```

**Response:**

```json
{
  "agentId": "letta-agent-456",
  "memoryType": "human",
  "updated": true,
  "timestamp": "2025-11-03T14:40:00Z"
}
```

**Status Codes:**

- `200 OK` - Memory updated successfully
- `400 Bad Request` - Invalid memory update
- `404 Not Found` - Agent not found
- `500 Internal Server Error` - Server error

---

### Workflow Management

#### 1. List Available Workflows

**Endpoint:** `GET /api/v1/workflows`

**Description:** Retrieve list of available workflow definitions.

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "workflows": [
    {
      "name": "daily_briefing",
      "description": "Comprehensive daily update with emails, calendar, and tasks",
      "stages": 5,
      "estimatedDuration": "2-3 minutes"
    },
    {
      "name": "inbox_review",
      "description": "Pull recent emails for follow-ups",
      "stages": 1,
      "estimatedDuration": "30 seconds"
    },
    {
      "name": "meeting_prep",
      "description": "Gather context for upcoming meetings",
      "stages": 4,
      "estimatedDuration": "1-2 minutes"
    }
  ]
}
```

**Status Codes:**

- `200 OK` - Workflows retrieved successfully
- `500 Internal Server Error` - Server error

---

#### 2. Start Workflow

**Endpoint:** `POST /api/v1/workflows/start`

**Description:** Initiate a workflow execution.

**Headers:**

```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "workflowName": "daily_briefing",
  "userId": "user-123",
  "context": {
    "userToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "dateRange": {
      "start": "2025-11-03",
      "end": "2025-11-03"
    }
  }
}
```

**Response:**

```json
{
  "workflowRunId": "workflow-run-456",
  "workflowName": "daily_briefing",
  "status": "PENDING",
  "startedAt": "2025-11-03T09:00:00Z",
  "stages": [
    "fetch_emails",
    "fetch_calendar",
    "fetch_tasks",
    "generate_insights",
    "send_briefing"
  ]
}
```

**Implementation:**

```typescript
// File: backend/src/agents/workflow-orchestrator.service.ts
async startWorkflow(
  workflowName: string,
  userId: string,
  context: Record<string, any>,
): Promise<WorkflowRun> {
  const workflow = this.workflows.get(workflowName);

  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowName}`);
  }

  const { userToken, ...sanitizedContext } = context;

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

  this.executeWorkflow(workflowRun.id).catch((error) => {
    this.logger.error(`Error executing workflow ${workflowRun.id}`, error);
  });

  return workflowRun;
}
```

**Status Codes:**

- `202 Accepted` - Workflow started successfully
- `400 Bad Request` - Invalid workflow name or parameters
- `404 Not Found` - Workflow not found
- `500 Internal Server Error` - Server error

---

#### 3. Get Workflow Status

**Endpoint:** `GET /api/v1/workflows/:workflowRunId`

**Description:** Check the status of a running workflow.

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "workflowRunId": "workflow-run-456",
  "workflowName": "daily_briefing",
  "status": "RUNNING",
  "currentStage": "fetch_calendar",
  "startedAt": "2025-11-03T09:00:00Z",
  "progress": {
    "completed": 1,
    "total": 5,
    "percentage": 20
  },
  "stageResults": {
    "fetch_emails": {
      "status": "completed",
      "result": {
        "emailCount": 8
      }
    }
  }
}
```

**Status Codes:**

- `200 OK` - Workflow status retrieved successfully
- `404 Not Found` - Workflow run not found
- `500 Internal Server Error` - Server error

---

#### 4. Cancel Workflow

**Endpoint:** `DELETE /api/v1/workflows/:workflowRunId`

**Description:** Cancel a running workflow.

**Headers:**

```
Authorization: Bearer <user_token>
```

**Response:**

```json
{
  "workflowRunId": "workflow-run-456",
  "status": "CANCELLED",
  "cancelledAt": "2025-11-03T09:01:30Z"
}
```

**Status Codes:**

- `200 OK` - Workflow cancelled successfully
- `400 Bad Request` - Workflow cannot be cancelled
- `404 Not Found` - Workflow run not found
- `500 Internal Server Error` - Server error

---

## Microsoft Graph API Integration

The Amaiko backend integrates with Microsoft Graph API to access user data. All Graph API calls go through the `GraphService`.

### Email Operations

#### 1. Search Emails

**Service Method:** `GraphService.searchEmails()`

**Parameters:**

```typescript
interface SearchEmailsParams {
  userToken: string;
  query: string;
  maxResults?: number;
  orderBy?: string;
  filter?: string;
}
```

**Graph API Call:**

```
GET https://graph.microsoft.com/v1.0/me/messages
  ?$filter={filter}
  &$orderby={orderBy}
  &$top={maxResults}
  &$select=id,subject,from,receivedDateTime,bodyPreview,hasAttachments
```

**Implementation:**

```typescript
// File: backend/src/graph/graph.service.ts
async searchEmails(
  userToken: string,
  params: SearchEmailsParams,
): Promise<Message[]> {
  const client = this.getAuthenticatedClient(userToken);

  let query = client.api('/me/messages').top(params.maxResults || 10);

  if (params.filter) {
    query = query.filter(params.filter);
  }

  if (params.orderBy) {
    query = query.orderby(params.orderBy);
  }

  query = query.select('id,subject,from,receivedDateTime,bodyPreview,hasAttachments');

  const response = await query.get();
  return response.value;
}
```

**Response:**

```json
{
  "value": [
    {
      "id": "AAMkAGI2...",
      "subject": "Q4 Budget Review - URGENT",
      "from": {
        "emailAddress": {
          "name": "Sarah Johnson",
          "address": "sarah.johnson@company.com"
        }
      },
      "receivedDateTime": "2025-11-03T08:45:00Z",
      "bodyPreview": "We need to finalize Q4 budget allocations...",
      "hasAttachments": true
    }
  ]
}
```

---

#### 2. Get Email

**Service Method:** `GraphService.getEmail()`

**Graph API Call:**

```
GET https://graph.microsoft.com/v1.0/me/messages/{messageId}
  ?$select=id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,attachments,importance
```

**Implementation:**

```typescript
async getEmail(userToken: string, messageId: string): Promise<Message> {
  const client = this.getAuthenticatedClient(userToken);

  return await client
    .api(`/me/messages/${messageId}`)
    .select('id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,attachments,importance')
    .get();
}
```

**Response:**

```json
{
  "id": "AAMkAGI2...",
  "subject": "Q4 Budget Review - URGENT",
  "from": {
    "emailAddress": {
      "name": "Sarah Johnson",
      "address": "sarah.johnson@company.com"
    }
  },
  "toRecipients": [
    {
      "emailAddress": {
        "name": "John Doe",
        "address": "john.doe@company.com"
      }
    }
  ],
  "receivedDateTime": "2025-11-03T08:45:00Z",
  "importance": "high",
  "body": {
    "contentType": "html",
    "content": "<html><body>We need to finalize Q4 budget allocations...</body></html>"
  },
  "attachments": [
    {
      "@odata.type": "#microsoft.graph.fileAttachment",
      "id": "AAMkAGI2...",
      "name": "Q4-Budget-Draft.xlsx",
      "size": 245760,
      "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  ]
}
```

---

#### 3. Send Email

**Service Method:** `GraphService.sendEmail()`

**Graph API Call:**

```
POST https://graph.microsoft.com/v1.0/me/sendMail
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": {
    "subject": "Re: Q4 Budget Review",
    "body": {
      "contentType": "Text",
      "content": "Thanks for sending this. I'm reviewing the Q4 budget now..."
    },
    "toRecipients": [
      {
        "emailAddress": {
          "address": "sarah.johnson@company.com"
        }
      }
    ]
  },
  "saveToSentItems": true
}
```

**Implementation:**

```typescript
async sendEmail(
  userToken: string,
  params: SendEmailParams,
): Promise<void> {
  const client = this.getAuthenticatedClient(userToken);

  const message = {
    subject: params.subject,
    body: {
      contentType: 'Text',
      content: params.body,
    },
    toRecipients: params.recipients.map(r => ({
      emailAddress: { address: r },
    })),
  };

  if (params.cc) {
    message.ccRecipients = params.cc.map(r => ({
      emailAddress: { address: r },
    }));
  }

  await client.api('/me/sendMail').post({
    message,
    saveToSentItems: true,
  });
}
```

---

#### 4. Reply to Email

**Service Method:** `GraphService.replyToEmail()`

**Graph API Call:**

```
POST https://graph.microsoft.com/v1.0/me/messages/{messageId}/reply
```

**Request Body:**

```json
{
  "comment": "Thanks for sending this. I'm reviewing now..."
}
```

**Implementation:**

```typescript
async replyToEmail(
  userToken: string,
  messageId: string,
  replyText: string,
): Promise<void> {
  const client = this.getAuthenticatedClient(userToken);

  await client.api(`/me/messages/${messageId}/reply`).post({
    comment: replyText,
  });
}
```

---

### Calendar Operations

#### 1. Get Calendar Events

**Service Method:** `GraphService.getCalendarEvents()`

**Graph API Call:**

```
GET https://graph.microsoft.com/v1.0/me/calendar/calendarView
  ?startDateTime={start}
  &endDateTime={end}
  &$orderby=start/dateTime
  &$select=id,subject,start,end,location,organizer,attendees,isOnlineMeeting,onlineMeetingUrl
```

**Implementation:**

```typescript
async getCalendarEvents(
  userToken: string,
  startDate: Date,
  endDate: Date,
): Promise<Event[]> {
  const client = this.getAuthenticatedClient(userToken);

  const response = await client
    .api('/me/calendar/calendarView')
    .query({
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
    })
    .orderby('start/dateTime')
    .select('id,subject,start,end,location,organizer,attendees,isOnlineMeeting,onlineMeetingUrl')
    .get();

  return response.value;
}
```

**Response:**

```json
{
  "value": [
    {
      "id": "AAMkAGI2...",
      "subject": "Team Standup",
      "start": {
        "dateTime": "2025-11-03T09:00:00",
        "timeZone": "Pacific Standard Time"
      },
      "end": {
        "dateTime": "2025-11-03T09:30:00",
        "timeZone": "Pacific Standard Time"
      },
      "location": {
        "displayName": "Conference Room A"
      },
      "organizer": {
        "emailAddress": {
          "name": "John Doe",
          "address": "john.doe@company.com"
        }
      },
      "attendees": [
        {
          "emailAddress": {
            "name": "Sarah Johnson",
            "address": "sarah.johnson@company.com"
          },
          "status": {
            "response": "accepted"
          }
        }
      ],
      "isOnlineMeeting": true,
      "onlineMeetingUrl": "https://teams.microsoft.com/l/meetup-join/..."
    }
  ]
}
```

---

#### 2. Create Calendar Event

**Service Method:** `GraphService.createCalendarEvent()`

**Graph API Call:**

```
POST https://graph.microsoft.com/v1.0/me/events
Content-Type: application/json
```

**Request Body:**

```json
{
  "subject": "Budget Review",
  "start": {
    "dateTime": "2025-11-06T09:00:00",
    "timeZone": "Pacific Standard Time"
  },
  "end": {
    "dateTime": "2025-11-06T10:00:00",
    "timeZone": "Pacific Standard Time"
  },
  "attendees": [
    {
      "emailAddress": {
        "address": "sarah.johnson@company.com"
      },
      "type": "required"
    }
  ],
  "isOnlineMeeting": true,
  "body": {
    "contentType": "Text",
    "content": "Discussion about Q4 budget allocations"
  }
}
```

**Implementation:**

```typescript
async createCalendarEvent(
  userToken: string,
  params: CalendarEventParams,
): Promise<Event> {
  const client = this.getAuthenticatedClient(userToken);

  const event = {
    subject: params.subject,
    start: {
      dateTime: params.startDateTime,
      timeZone: params.timeZone || 'Pacific Standard Time',
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: params.timeZone || 'Pacific Standard Time',
    },
    attendees: params.attendees?.map(email => ({
      emailAddress: { address: email },
      type: 'required',
    })),
    isOnlineMeeting: params.isOnlineMeeting || false,
    body: params.body ? {
      contentType: 'Text',
      content: params.body,
    } : undefined,
  };

  return await client.api('/me/events').post(event);
}
```

**Response:**

```json
{
  "id": "AAMkAGI2...",
  "subject": "Budget Review",
  "start": {
    "dateTime": "2025-11-06T09:00:00",
    "timeZone": "Pacific Standard Time"
  },
  "end": {
    "dateTime": "2025-11-06T10:00:00",
    "timeZone": "Pacific Standard Time"
  },
  "isOnlineMeeting": true,
  "onlineMeetingUrl": "https://teams.microsoft.com/l/meetup-join/...",
  "webLink": "https://outlook.office365.com/calendar/..."
}
```

---

### File Operations

#### 1. Search Files

**Service Method:** `GraphService.searchFiles()`

**Graph API Call:**

```
GET https://graph.microsoft.com/v1.0/me/drive/root/search(q='{query}')
  ?$top={maxResults}
  &$select=id,name,size,lastModifiedDateTime,lastModifiedBy,webUrl,parentReference
```

**Implementation:**

```typescript
async searchFiles(
  userToken: string,
  query: string,
  maxResults: number = 10,
): Promise<DriveItem[]> {
  const client = this.getAuthenticatedClient(userToken);

  const response = await client
    .api(`/me/drive/root/search(q='${query}')`)
    .top(maxResults)
    .select('id,name,size,lastModifiedDateTime,lastModifiedBy,webUrl,parentReference')
    .get();

  return response.value;
}
```

**Response:**

```json
{
  "value": [
    {
      "id": "01BYE5RZ6QN3ZWBTUFOFD3GSPGOHDJD36K",
      "name": "Q4-Strategic-Planning-Draft.docx",
      "size": 2457600,
      "lastModifiedDateTime": "2025-10-28T15:30:00Z",
      "lastModifiedBy": {
        "user": {
          "displayName": "John Doe",
          "email": "john.doe@company.com"
        }
      },
      "webUrl": "https://company.sharepoint.com/personal/.../Q4-Strategic-Planning-Draft.docx",
      "parentReference": {
        "driveId": "b!-RIj2DuyvE...",
        "path": "/drive/root:/Documents/Strategy"
      }
    }
  ]
}
```

---

#### 2. Get File Download Info

**Service Method:** `GraphService.getFileDownloadInfo()`

**Graph API Call:**

```
GET https://graph.microsoft.com/v1.0/me/drive/items/{fileId}
  ?$select=id,name,size,@microsoft.graph.downloadUrl,webUrl
```

**Implementation:**

```typescript
async getFileDownloadInfo(
  userToken: string,
  fileId: string,
): Promise<DriveItem> {
  const client = this.getAuthenticatedClient(userToken);

  return await client
    .api(`/me/drive/items/${fileId}`)
    .select('id,name,size,@microsoft.graph.downloadUrl,webUrl')
    .get();
}
```

**Response:**

```json
{
  "id": "01BYE5RZ6QN3ZWBTUFOFD3GSPGOHDJD36K",
  "name": "Q4-Strategic-Planning-Draft.docx",
  "size": 2457600,
  "@microsoft.graph.downloadUrl": "https://company.sharepoint.com/.../download?...",
  "webUrl": "https://company.sharepoint.com/personal/.../Q4-Strategic-Planning-Draft.docx"
}
```

---

### User Operations

#### 1. Get User Profile

**Service Method:** `GraphService.getUserProfile()`

**Graph API Call:**

```
GET https://graph.microsoft.com/v1.0/me
  ?$select=id,displayName,mail,jobTitle,department,officeLocation,mobilePhone
```

**Implementation:**

```typescript
async getUserProfile(userToken: string): Promise<User> {
  const client = this.getAuthenticatedClient(userToken);

  return await client
    .api('/me')
    .select('id,displayName,mail,jobTitle,department,officeLocation,mobilePhone')
    .get();
}
```

**Response:**

```json
{
  "id": "48d31887-5fad-4d73-a9f5-3c356e68a038",
  "displayName": "John Doe",
  "mail": "john.doe@company.com",
  "jobTitle": "Sales Manager",
  "department": "Sales",
  "officeLocation": "Building 2, Office 210",
  "mobilePhone": "+1 555-0123"
}
```

---

## MCP Tools API

MCP (Model Context Protocol) tools are standardized functions that agents can call to interact with external services. All MCP tools return a consistent `McpToolResult` format.

### MCP Tool Result Format

```typescript
interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}
```

### Email Tools

#### 1. search_emails

**Tool Name:** `search_emails`

**Description:** Search emails using natural language query.

**Parameters:**

```json
{
  "query": "from:Sarah about budget",
  "maxResults": 10,
  "dateRange": "last 7 days"
}
```

**Implementation:**

```typescript
// File: backend/src/mcp/tools/email-tools.service.ts
async searchEmails(
  params: SearchEmailsParams,
  context: McpContext,
): Promise<McpToolResult> {
  try {
    const emails = await this.graphService.searchEmails(
      context.userToken,
      params,
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'success',
          count: emails.length,
          emails: emails.map(e => ({
            id: e.id,
            subject: e.subject,
            from: e.from?.emailAddress,
            receivedDateTime: e.receivedDateTime,
            bodyPreview: e.bodyPreview,
          })),
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ status: 'error', message: error.message }),
      }],
      isError: true,
    };
  }
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"count\": 3,\n  \"emails\": [\n    {\n      \"id\": \"AAMkAGI2...\",\n      \"subject\": \"Q4 Budget Review - URGENT\",\n      \"from\": {\n        \"name\": \"Sarah Johnson\",\n        \"address\": \"sarah.johnson@company.com\"\n      },\n      \"receivedDateTime\": \"2025-11-03T08:45:00Z\",\n      \"bodyPreview\": \"We need to finalize Q4 budget...\"\n    }\n  ]\n}"
    }
  ]
}
```

---

#### 2. get_email

**Tool Name:** `get_email`

**Description:** Retrieve full email content by ID.

**Parameters:**

```json
{
  "emailId": "AAMkAGI2..."
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"email\": {\n    \"id\": \"AAMkAGI2...\",\n    \"subject\": \"Q4 Budget Review - URGENT\",\n    \"from\": {...},\n    \"body\": \"<html>...</html>\",\n    \"attachments\": [...]\n  }\n}"
    }
  ]
}
```

---

#### 3. send_email

**Tool Name:** `send_email`

**Description:** Send a new email.

**Parameters:**

```json
{
  "recipients": ["sarah.johnson@company.com"],
  "subject": "Re: Q4 Budget Review",
  "body": "Thanks for sending this. I'm reviewing now...",
  "cc": ["mike.williams@company.com"]
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"message\": \"Email sent successfully\"\n}"
    }
  ]
}
```

---

#### 4. reply_to_email

**Tool Name:** `reply_to_email`

**Description:** Reply to an existing email.

**Parameters:**

```json
{
  "emailId": "AAMkAGI2...",
  "replyText": "Thanks for the update!"
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"message\": \"Reply sent successfully\"\n}"
    }
  ]
}
```

---

### Calendar Tools

#### 1. get_calendar_events

**Tool Name:** `get_calendar_events`

**Description:** Get calendar events for a date range.

**Parameters:**

```json
{
  "startDate": "2025-11-03",
  "endDate": "2025-11-03"
}
```

**Implementation:**

```typescript
// File: backend/src/mcp/tools/calendar-tools.service.ts
async getCalendarEvents(
  params: GetEventsParams,
  context: McpContext,
): Promise<McpToolResult> {
  try {
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);

    const events = await this.graphService.getCalendarEvents(
      context.userToken,
      startDate,
      endDate,
    );

    const formattedEvents = events.map((event) => ({
      id: event.id,
      subject: event.subject,
      start: event.start,
      end: event.end,
      location: event.location?.displayName,
      organizer: event.organizer?.emailAddress,
      attendees: event.attendees?.map((a) => a.emailAddress),
      isOnlineMeeting: event.isOnlineMeeting,
      onlineMeetingUrl: event.onlineMeetingUrl,
    }));

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'success',
          count: formattedEvents.length,
          events: formattedEvents,
        }, null, 2),
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ status: 'error', message: error.message }),
      }],
      isError: true,
    };
  }
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"count\": 3,\n  \"events\": [\n    {\n      \"id\": \"AAMkAGI2...\",\n      \"subject\": \"Team Standup\",\n      \"start\": {\"dateTime\": \"2025-11-03T09:00:00\", \"timeZone\": \"PST\"},\n      \"end\": {\"dateTime\": \"2025-11-03T09:30:00\", \"timeZone\": \"PST\"}\n    }\n  ]\n}"
    }
  ]
}
```

---

#### 2. create_calendar_event

**Tool Name:** `create_calendar_event`

**Description:** Create a new calendar event.

**Parameters:**

```json
{
  "subject": "Budget Review",
  "startDateTime": "2025-11-06T09:00:00",
  "endDateTime": "2025-11-06T10:00:00",
  "attendees": ["sarah.johnson@company.com"],
  "isOnlineMeeting": true,
  "body": "Discussion about Q4 budget allocations"
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"message\": \"Calendar event created successfully\",\n  \"event\": {\n    \"id\": \"AAMkAGI2...\",\n    \"subject\": \"Budget Review\",\n    \"onlineMeetingUrl\": \"https://teams.microsoft.com/...\"\n  }\n}"
    }
  ]
}
```

---

### File Tools

#### 1. search_files

**Tool Name:** `search_files`

**Description:** Search files in OneDrive and SharePoint.

**Parameters:**

```json
{
  "query": "Q4 planning",
  "maxResults": 10
}
```

**Result:**

```json
{
  "content": [
    {
      "type": "text",
      "text": "{\n  \"status\": \"success\",\n  \"count\": 10,\n  \"files\": [\n    {\n      \"id\": \"01BYE5RZ...\",\n      \"name\": \"Q4-Strategic-Planning-Draft.docx\",\n      \"size\": 2457600,\n      \"webUrl\": \"https://company.sharepoint.com/...\"\n    }\n  ]\n}"
    }
  ]
}
```

---

## Letta Agent API

Amaiko uses Letta (formerly MemGPT) for stateful AI agents. The Letta API is accessed through the Letta Python client.

### Agent Operations

#### 1. Create Agent

**Method:** `LettaClient.create_agent()`

**Parameters:**

```python
{
  "name": "agent-user-123",
  "memory": {
    "persona": "You are Amaiko, a professional AI assistant...",
    "human": "User is John Doe, Sales Manager at Company Inc.",
    "conversation_context": "",
    "archival": []
  },
  "tools": ["search_emails", "get_calendar_events", ...],
  "model": "gpt-4o",
  "context_window": 128000
}
```

**Implementation:**

```python
# Letta Python Client
agent = letta_client.create_agent(
    name=f"agent-{user_id}",
    memory=AgentMemory(
        persona=persona_text,
        human=human_text,
        conversation_context="",
        archival_memory=[]
    ),
    tools=tool_list,
    llm_config=LLMConfig(
        model="gpt-4o",
        context_window=128000
    )
)
```

**Response:**

```json
{
  "id": "agent-123",
  "name": "agent-user-123",
  "created_at": "2025-11-03T10:00:00Z",
  "memory": {
    "persona": "...",
    "human": "...",
    "conversation_context": "",
    "archival": []
  }
}
```

---

#### 2. Send Message to Agent

**Method:** `LettaClient.send_message()`

**Parameters:**

```python
{
  "agent_id": "agent-123",
  "message": "Show me my emails from Sarah",
  "role": "user"
}
```

**Implementation:**

```python
response = letta_client.send_message(
    agent_id=agent_id,
    message=user_message,
    role="user"
)
```

**Response:**

```json
{
  "messages": [
    {
      "role": "assistant",
      "content": "I'll search for emails from Sarah for you.",
      "function_call": {
        "name": "search_emails",
        "arguments": "{\"query\": \"from:Sarah\"}"
      }
    },
    {
      "role": "function",
      "name": "search_emails",
      "content": "{\"status\": \"success\", \"count\": 3, ...}"
    },
    {
      "role": "assistant",
      "content": "I found 3 emails from Sarah. Here's a summary: ..."
    }
  ]
}
```

---

## Database Operations

### TypeORM Entities

#### 1. AgentMapping Entity

**Table:** `agent_mappings`

**Schema:**

```sql
CREATE TABLE agent_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) UNIQUE NOT NULL,
  agent_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agent_mappings_user_id ON agent_mappings(user_id);
CREATE INDEX idx_agent_mappings_agent_id ON agent_mappings(agent_id);
```

**TypeORM Entity:**

```typescript
// File: backend/src/agents/entities/agent-mapping.entity.ts
@Entity('agent_mappings')
export class AgentMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  agentId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**CRUD Operations:**

```typescript
// Create
const mapping = agentMappingRepository.create({
  userId: 'user-123',
  agentId: 'letta-agent-456',
  metadata: { userProfile: {...}, preferences: {...} },
});
await agentMappingRepository.save(mapping);

// Read
const mapping = await agentMappingRepository.findOne({
  where: { userId: 'user-123', isActive: true },
});

// Update
mapping.metadata.preferences = { workSchedule: 'flexible' };
await agentMappingRepository.save(mapping);

// Delete (soft delete)
mapping.isActive = false;
await agentMappingRepository.save(mapping);
```

---

#### 2. WorkflowRun Entity

**Table:** `workflow_runs`

**Schema:**

```sql
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_name VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  current_stage VARCHAR(255),
  context JSONB,
  result JSONB,
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_runs_user_id ON workflow_runs(user_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(status);
CREATE INDEX idx_workflow_runs_workflow_name ON workflow_runs(workflow_name);
```

**TypeORM Entity:**

```typescript
// File: backend/src/agents/entities/workflow-run.entity.ts
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
  userId: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.PENDING,
  })
  status: WorkflowStatus;

  @Column({ nullable: true })
  currentStage: string;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any>;

  @Column({ nullable: true })
  error: string;

  @Column({ default: 0 })
  retryCount: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## WebSocket API

### Real-time Notifications

**Connection URL:** `wss://api.amaiko.ai/ws`

**Authentication:**

```javascript
const ws = new WebSocket('wss://api.amaiko.ai/ws');

// Send authentication message on connect
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer eyJ0eXAi...'
  }));
};
```

**Message Types:**

#### 1. Workflow Progress Update

```json
{
  "type": "workflow_progress",
  "data": {
    "workflowRunId": "workflow-run-456",
    "status": "RUNNING",
    "currentStage": "fetch_calendar",
    "progress": {
      "completed": 1,
      "total": 5,
      "percentage": 20
    }
  }
}
```

#### 2. Agent Response

```json
{
  "type": "agent_response",
  "data": {
    "agentId": "letta-agent-456",
    "conversationId": "conv-789",
    "message": "I found 3 emails from Sarah...",
    "timestamp": "2025-11-03T14:35:00Z"
  }
}
```

#### 3. Tool Execution Update

```json
{
  "type": "tool_execution",
  "data": {
    "tool": "search_emails",
    "status": "completed",
    "result": {
      "count": 3
    }
  }
}
```

---

## Webhook Handlers

### Microsoft Graph Change Notifications

**Webhook URL:** `https://api.amaiko.ai/webhooks/graph`

**Supported Resources:**

- `me/messages` - New email notifications
- `me/events` - Calendar event changes
- `me/drive/root` - File change notifications

**Notification Payload:**

```json
{
  "value": [
    {
      "subscriptionId": "sub-123",
      "changeType": "created",
      "resource": "users/user-123/messages/AAMkAGI2...",
      "resourceData": {
        "@odata.type": "#Microsoft.Graph.Message",
        "@odata.id": "users/user-123/messages/AAMkAGI2...",
        "id": "AAMkAGI2..."
      },
      "clientState": "secretClientValue",
      "tenantId": "tenant-123"
    }
  ]
}
```

**Handler Implementation:**

```typescript
@Post('/webhooks/graph')
async handleGraphNotification(@Body() notification: any) {
  // Validate notification
  if (notification.validationToken) {
    return notification.validationToken;
  }

  // Process change notification
  for (const change of notification.value) {
    if (change.changeType === 'created' && change.resource.includes('messages')) {
      await this.processNewEmail(change.resourceData.id);
    }
  }

  return { status: 'ok' };
}
```

---

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "emailId",
      "reason": "Email ID is required"
    },
    "timestamp": "2025-11-03T14:40:00Z",
    "requestId": "req-abc123"
  }
}
```

### Error Codes

| Code                         | HTTP Status | Description                            |
| ---------------------------- | ----------- | -------------------------------------- |
| `AUTHENTICATION_FAILED`    | 401         | Authentication failed or token expired |
| `INSUFFICIENT_PERMISSIONS` | 403         | User lacks required permissions        |
| `RESOURCE_NOT_FOUND`       | 404         | Requested resource not found           |
| `INVALID_REQUEST`          | 400         | Request parameters are invalid         |
| `RATE_LIMIT_EXCEEDED`      | 429         | Too many requests                      |
| `GRAPH_API_ERROR`          | 502         | Error from Microsoft Graph API         |
| `LETTA_API_ERROR`          | 502         | Error from Letta API                   |
| `INTERNAL_SERVER_ERROR`    | 500         | Internal server error                  |

### Retry Logic

For transient errors (rate limits, network issues), implement exponential backoff:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error)) {
        throw error;
      }

      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function isRetryable(error: any): boolean {
  const retryableCodes = [429, 500, 502, 503, 504];
  return retryableCodes.includes(error.response?.status);
}
```

---

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699027200
```

### Rate Limits by Endpoint

| Endpoint                         | Rate Limit   | Window   |
| -------------------------------- | ------------ | -------- |
| `/api/v1/agents/:agentId/chat` | 60 requests  | 1 minute |
| `/api/v1/workflows/start`      | 10 requests  | 1 minute |
| `/api/v1/auth/*`               | 5 requests   | 1 minute |
| All other endpoints              | 100 requests | 1 minute |

### Handling Rate Limits

When rate limit is exceeded:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 60,
      "remaining": 0,
      "resetAt": "2025-11-03T14:45:00Z"
    }
  }
}
```

Client should wait until `resetAt` before retrying.

---

## Security Considerations

### 1. Authentication

- **Always use HTTPS** for API calls
- **Never log or store access tokens** in plain text
- **Implement token refresh** before expiration
- **Use secure token storage** (encrypted database, secure key vault)

### 2. Authorization

- **Validate user permissions** for every request
- **Implement principle of least privilege**
- **Use On-Behalf-Of flow** for Graph API access
- **Never use application-level tokens** for user operations

### 3. Data Protection

- **Encrypt sensitive data** at rest and in transit
- **Sanitize user input** to prevent injection attacks
- **Implement request validation** using schemas
- **Log security events** for audit trails

### 4. API Security

- **Implement rate limiting** to prevent abuse
- **Use request signing** for webhook validation
- **Validate webhook sources** using client state
- **Implement CORS policies** for frontend access

### 5. Error Handling

- **Never expose internal errors** to clients
- **Log detailed errors** server-side only
- **Return generic error messages** to clients
- **Implement error monitoring** and alerting

---

## Appendix: Complete API Endpoint List

### Authentication Endpoints

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | `/api/v1/auth/authorize` | Get authorization URL       |
| POST   | `/api/v1/auth/token`     | Exchange authorization code |
| POST   | `/api/v1/auth/refresh`   | Refresh access token        |
| POST   | `/api/v1/auth/obo`       | Acquire OBO token           |

### Agent Endpoints

| Method | Endpoint                           | Description         |
| ------ | ---------------------------------- | ------------------- |
| POST   | `/api/v1/agents`                 | Create agent        |
| GET    | `/api/v1/agents/:userId`         | Get agent           |
| POST   | `/api/v1/agents/:agentId/chat`   | Chat with agent     |
| PATCH  | `/api/v1/agents/:agentId/memory` | Update agent memory |
| DELETE | `/api/v1/agents/:agentId`        | Deactivate agent    |

### Workflow Endpoints

| Method | Endpoint                             | Description         |
| ------ | ------------------------------------ | ------------------- |
| GET    | `/api/v1/workflows`                | List workflows      |
| POST   | `/api/v1/workflows/start`          | Start workflow      |
| GET    | `/api/v1/workflows/:workflowRunId` | Get workflow status |
| DELETE | `/api/v1/workflows/:workflowRunId` | Cancel workflow     |
| GET    | `/api/v1/workflows/user/:userId`   | Get user workflows  |

### Webhook Endpoints

| Method | Endpoint            | Description                   |
| ------ | ------------------- | ----------------------------- |
| POST   | `/webhooks/graph` | Microsoft Graph notifications |
| POST   | `/webhooks/teams` | Teams activity notifications  |

### Health & Monitoring

| Method | Endpoint     | Description        |
| ------ | ------------ | ------------------ |
| GET    | `/health`  | Health check       |
| GET    | `/metrics` | Prometheus metrics |
| GET    | `/version` | API version info   |

---

## Conclusion

This API reference documentation provides comprehensive coverage of all Amaiko AI endpoints, Microsoft Graph integrations, MCP tools, and database operations. Use this as a reference when integrating with the Amaiko AI platform.

**Key Points:**

1. **Authentication**: Use Azure AD OAuth 2.0 with OBO flow for Graph API access
2. **MCP Tools**: Standardized tool interface for agent capabilities
3. **Rate Limiting**: Respect rate limits and implement exponential backoff
4. **Error Handling**: Use consistent error format and proper status codes
5. **Security**: Always use HTTPS, validate tokens, and protect sensitive data

**Related Documentation:**

- `/docs/amaiko_app/ARCHITECTURE.md` - System architecture
- `/docs/amaiko_app/BOT_FRAMEWORK.md` - Microsoft Teams bot implementation
- `/docs/amaiko_app/AGENT_FRAMEWORK.md` - Letta agent framework
- `/docs/amaiko_app/USER_FLOW.md` - User interaction flows

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Maintainer:** Amaiko AI Development Team
