// Shared TypeScript types for Amaiko AI

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Agent {
  id: string;
  userId: string;
  name: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface MemoryBlock {
  label: string;
  value: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: any;
}

export interface McpToolContext {
  userToken: string;
  userId: string;
}
