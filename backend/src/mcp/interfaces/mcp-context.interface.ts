/**
 * Context interface for MCP tool executions
 * Contains user authentication and session information
 */
export interface McpContext {
  /**
   * User's access token for Microsoft Graph API
   */
  userToken: string;

  /**
   * User ID from Teams/Azure AD
   */
  userId: string;

  /**
   * User's email address
   */
  userEmail?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Tool execution result
 */
export interface McpToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: any;
    mimeType?: string;
  }>;
  isError?: boolean;
}
