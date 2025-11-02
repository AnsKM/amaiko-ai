import { Injectable, Logger } from '@nestjs/common';
import { GraphService } from '../../graph/graph.service';
import { McpContext, McpToolResult } from '../interfaces/mcp-context.interface';

interface SearchEmailsParams {
  query: string;
  maxResults?: number;
  folder?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
}

interface ReplyToEmailParams {
  messageId: string;
  replyBody: string;
}

/**
 * Email tools for MCP integration
 * Provides email search, send, and reply functionality via Microsoft Graph
 */
@Injectable()
export class EmailToolsService {
  private readonly logger = new Logger(EmailToolsService.name);

  constructor(private graphService: GraphService) {}

  /**
   * Tool: search_emails
   * Search user emails with query parameters
   */
  async searchEmails(
    params: SearchEmailsParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(`Searching emails for user ${context.userId} with query: ${params.query}`);

      const emails = await this.graphService.searchEmails(context.userToken, {
        query: params.query,
        maxResults: params.maxResults || 10,
        folder: params.folder || 'inbox',
      });

      // Format emails for agent consumption
      const formattedEmails = emails.map((email) => ({
        subject: email.subject,
        from: email.from?.emailAddress?.address,
        fromName: email.from?.emailAddress?.name,
        receivedDateTime: email.receivedDateTime,
        bodyPreview: email.bodyPreview,
        isRead: email.isRead,
        hasAttachments: email.hasAttachments,
        id: email.id,
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                count: formattedEmails.length,
                emails: formattedEmails,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error searching emails', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              message: error.message,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Tool: get_email
   * Get full email details by ID
   */
  async getEmail(
    messageId: string,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(`Getting email ${messageId} for user ${context.userId}`);

      const email = await this.graphService.getEmail(
        context.userToken,
        messageId,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                email: {
                  subject: email.subject,
                  from: email.from?.emailAddress,
                  to: email.toRecipients?.map((r) => r.emailAddress),
                  receivedDateTime: email.receivedDateTime,
                  body: email.body?.content,
                  bodyType: email.body?.contentType,
                  hasAttachments: email.hasAttachments,
                },
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error getting email', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              message: error.message,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Tool: send_email
   * Send an email on behalf of the user
   */
  async sendEmail(
    params: SendEmailParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Sending email from user ${context.userId} to ${params.to}`,
      );

      await this.graphService.sendEmail(context.userToken, params);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: `Email sent successfully to ${params.to}`,
              subject: params.subject,
            }),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error sending email', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              message: error.message,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Tool: reply_to_email
   * Reply to an existing email
   */
  async replyToEmail(
    params: ReplyToEmailParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Replying to email ${params.messageId} for user ${context.userId}`,
      );

      await this.graphService.replyToEmail(
        context.userToken,
        params.messageId,
        params.replyBody,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: 'Reply sent successfully',
              messageId: params.messageId,
            }),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error replying to email', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              message: error.message,
            }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Get all available email tools metadata
   */
  getToolsMetadata() {
    return [
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
              description: 'Maximum number of results to return (default: 10)',
              default: 10,
            },
            folder: {
              type: 'string',
              description: 'Email folder to search (default: inbox)',
              default: 'inbox',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_email',
        description: 'Get full email details by ID',
        parameters: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'The ID of the email message',
            },
          },
          required: ['messageId'],
        },
      },
      {
        name: 'send_email',
        description: 'Send an email on behalf of the user',
        parameters: {
          type: 'object',
          properties: {
            to: {
              type: 'string',
              description: 'Recipient email address',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            body: {
              type: 'string',
              description: 'Email body (HTML supported)',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'CC recipients (optional)',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'BCC recipients (optional)',
            },
          },
          required: ['to', 'subject', 'body'],
        },
      },
      {
        name: 'reply_to_email',
        description: 'Reply to an existing email',
        parameters: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'The ID of the email to reply to',
            },
            replyBody: {
              type: 'string',
              description: 'The reply message body',
            },
          },
          required: ['messageId', 'replyBody'],
        },
      },
    ];
  }
}
