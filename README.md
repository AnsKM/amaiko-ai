# Amaiko AI - Enterprise AI Assistant for Microsoft Teams

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-24.x-green.svg)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-11-red.svg)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)

Amaiko AI is a production-ready enterprise AI assistant integrated into Microsoft Teams. It acts as a personal AI buddy for employees, maintaining stateful memory using the Letta framework, orchestrating tasks across emails, calendars, and documents via Microsoft Graph API, and supporting multi-agent collaboration with a shared knowledge base.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Features

### Core Capabilities

- **Stateful AI Agents**: Powered by Letta (formerly MemGPT) for long-term memory and context
- **Microsoft Teams Integration**: Native bot framework integration with adaptive cards
- **Microsoft Graph API**: Email, calendar, and file management
- **Multi-Agent Workflows**: Orchestrated workflows across email, calendar, CRM, and knowledge agents
- **Knowledge Base**: ChromaDB-powered vector store for semantic search
- **CRM Integration**: Dynamics 365, Salesforce, and HubSpot connectors
- **MCP Tools**: Model Context Protocol for standardized tool integration
- **Enterprise Security**: Azure Entra ID authentication with OAuth 2.0

### Agent Capabilities

- **Email Management**: Search, send, reply, and organize emails
- **Calendar Management**: Create, update, and search calendar events
- **File Operations**: Search and access OneDrive/SharePoint files
- **Workflow Automation**: Pre-built workflows (customer follow-up, email triage, daily briefing)
- **Personalized Memory**: Each user gets a dedicated agent with persistent memory

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Microsoft Teams                             │
│                   (User Interface)                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Bot Framework
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Backend                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐      │
│  │ Teams Bot    │  │ Graph API    │  │ Agent Service     │      │
│  │ Service      │──│ Integration  │──│ (Letta Powered)   │      │
│  └──────────────┘  └──────────────┘  └───────────────────┘      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MCP Tools Layer                             │   │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐                 │   │
│  │  │Email     │ │Calendar   │ │Files     │                 │   │
│  │  │Tools     │ │Tools      │ │Tools     │                 │   │
│  │  └──────────┘ └───────────┘ └──────────┘                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬──────────────────────┬──────────────────┘
                        │                      │
           ┌────────────▼────────┐   ┌────────▼──────────┐
           │   Letta Server      │   │  ChromaDB         │
           │ (Agent Framework)   │   │ (Vector Store)    │
           └─────────────────────┘   └───────────────────┘
```

## Technology Stack

### Backend

- **Framework**: NestJS 11 (TypeScript 5.9+)
- **Runtime**: Node.js 24 LTS
- **Database**: PostgreSQL 18
- **Cache**: Redis 8
- **AI Framework**: Letta (formerly MemGPT)
- **LLM**: Azure OpenAI (GPT-4o)
- **Vector Store**: ChromaDB
- **Authentication**: Microsoft Entra ID (MSAL)
- **API Integration**: Microsoft Graph API
- **Bot Framework**: Microsoft Bot Framework v4
- **Testing**: Vitest

### Frontend

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **TypeScript**: 5.9+

### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Kubernetes 1.34

## Prerequisites

- **Node.js**: Version 24.x LTS
- **Docker**: Latest version
- **Docker Compose**: Version 2.x or higher
- **Git**: Latest version
- **Azure Account**: For Entra ID and Bot Service
- **Microsoft 365 Developer Account**: For Teams testing

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/amaiko-ai.git
cd amaiko-ai
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### 4. Access the Application

- **Backend API**: http://localhost:8100
- **Frontend Dashboard**: http://localhost:8200
- **Letta Server**: http://localhost:8285
- **ChromaDB**: http://localhost:8002
- **PostgreSQL**: localhost:5434
- **Redis**: localhost:6380

## Detailed Setup

### Azure Configuration

#### 1. Create Azure Entra ID App Registration

1. Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App Registrations**
2. Click **New registration**
   - **Name**: "Amaiko AI Assistant"
   - **Supported account types**: "Accounts in any organizational directory (Multitenant)"
   - **Redirect URI**: `https://your-domain.com/auth/callback`
3. Note the **Application (client) ID** and **Directory (tenant) ID**

#### 2. Configure API Permissions

Add the following Microsoft Graph **Delegated** permissions:

- `User.Read`
- `Mail.Read`
- `Mail.Send`
- `Calendars.ReadWrite`
- `Files.Read.All`
- `People.Read`

Click **Grant admin consent** for your organization.

#### 3. Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. **Copy the secret value immediately**

#### 4. Register Teams Bot

1. Go to [Azure Portal](https://portal.azure.com) → **Bot Services**
2. Click **Create** and configure
3. Configure **Messaging endpoint**: `https://your-domain.com/api/messages`

#### 5. Update Environment Variables

```bash
AZURE_CLIENT_ID=<your-client-id>
AZURE_CLIENT_SECRET=<your-secret>
AZURE_TENANT_ID=<your-tenant-id>
MICROSOFT_APP_ID=<bot-app-id>
MICROSOFT_APP_PASSWORD=<bot-password>
```

## Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev   # Hot reload
npm run test        # Run tests
npm run lint        # Lint code
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev         # Development server
npm run build       # Production build
```

## Deployment

### Docker

```bash
# Build images
docker build -t amaiko-backend:latest ./backend
docker build -t amaiko-frontend:latest ./frontend

# Production deployment
docker-compose --profile production up -d
```

### Kubernetes

```bash
# Create namespace
kubectl create namespace amaiko

# Create secrets
kubectl create secret generic amaiko-secrets \
  --from-literal=database-url="postgresql://..." \
  -n amaiko

# Deploy
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -n amaiko
```

## Project Structure

```
amaiko-ai/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── agents/            # Letta agent service
│   │   ├── bot/               # Teams bot service
│   │   ├── graph/             # Microsoft Graph service
│   │   ├── mcp/               # MCP tools
│   │   └── main.ts
│   └── Dockerfile
├── frontend/                   # Next.js frontend
│   ├── src/
│   └── Dockerfile
├── teams-app/                  # Teams app manifest
│   └── manifest.json
├── k8s/                        # Kubernetes manifests
│   └── deployment.yaml
├── docker-compose.yml
└── .env.example
```

## Troubleshooting

### Bot not responding

- Check messaging endpoint is publicly accessible
- Verify MICROSOFT_APP_ID and MICROSOFT_APP_PASSWORD
- Check logs: `docker-compose logs backend`

### Graph API errors

- Verify Azure app permissions are granted
- Check credentials in `.env`
- Ensure redirect URI is configured

### Database connection issues

- Verify DATABASE_URL format
- Check PostgreSQL is running: `docker-compose ps postgres`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [https://docs.amaiko.ai](https://docs.amaiko.ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/amaiko-ai/issues)
- **Email**: support@amaiko.ai

---

**Built with ❤️ by the Amaiko Team**
