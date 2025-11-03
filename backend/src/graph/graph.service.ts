import { Injectable, Logger } from '@nestjs/common';
import { Client } from '@microsoft/microsoft-graph-client';
import { GraphAuthService } from './graph-auth.service';
import { Message, Event, DriveItem, User } from '@microsoft/microsoft-graph-types';

export interface EmailSearchParams {
  query: string;
  maxResults?: number;
  folder?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  attachments?: any[];
}

export interface CalendarEventParams {
  subject: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  attendees?: string[];
  body?: string;
  isOnlineMeeting?: boolean;
}

@Injectable()
export class GraphService {
  private readonly logger = new Logger(GraphService.name);

  constructor(private authService: GraphAuthService) {}

  /**
   * Get authenticated Graph client for user
   */
  private async getClient(userToken: string): Promise<Client> {
    return Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.authService.acquireTokenOnBehalfOf(userToken);
          done(null, token);
        } catch (error) {
          this.logger.error('Error in auth provider', error);
          done(error, null);
        }
      },
    });
  }

  /**
   * Get authenticated Graph client for application
   */
  private async getAppClient(): Promise<Client> {
    return Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.authService.acquireApplicationToken();
          done(null, token);
        } catch (error) {
          this.logger.error('Error in app auth provider', error);
          done(error, null);
        }
      },
    });
  }

  // ============================================================================
  // EMAIL OPERATIONS
  // ============================================================================

  /**
   * Search user emails
   */
  async searchEmails(
    userToken: string,
    params: EmailSearchParams,
  ): Promise<Message[]> {
    try {
      const client = await this.getClient(userToken);
      const { query, maxResults = 10, folder = 'inbox' } = params;

      const messages = await client
        .api(`/me/mailFolders/${folder}/messages`)
        .search(`"${query}"`)
        .top(maxResults)
        .select('subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments')
        .orderby('receivedDateTime DESC')
        .get();

      this.logger.log(`Found ${messages.value.length} emails matching query: ${query}`);
      return messages.value;
    } catch (error) {
      this.logger.error('Error searching emails', error);
      throw error;
    }
  }

  /**
   * Get email by ID
   */
  async getEmail(userToken: string, messageId: string): Promise<Message> {
    try {
      const client = await this.getClient(userToken);

      const message = await client
        .api(`/me/messages/${messageId}`)
        .select('subject,from,toRecipients,receivedDateTime,body,hasAttachments')
        .get();

      return message;
    } catch (error) {
      this.logger.error('Error getting email', error);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(userToken: string, params: SendEmailParams): Promise<void> {
    try {
      const client = await this.getClient(userToken);

      const message = {
        subject: params.subject,
        body: {
          contentType: 'HTML',
          content: params.body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: params.to,
            },
          },
        ],
        ccRecipients: params.cc?.map((email) => ({
          emailAddress: { address: email },
        })),
        bccRecipients: params.bcc?.map((email) => ({
          emailAddress: { address: email },
        })),
        attachments: params.attachments,
      };

      await client.api('/me/sendMail').post({ message });

      this.logger.log(`Email sent successfully to ${params.to}`);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }

  /**
   * Reply to email
   */
  async replyToEmail(
    userToken: string,
    messageId: string,
    replyBody: string,
  ): Promise<void> {
    try {
      const client = await this.getClient(userToken);

      await client.api(`/me/messages/${messageId}/reply`).post({
        comment: replyBody,
      });

      this.logger.log(`Reply sent to message ${messageId}`);
    } catch (error) {
      this.logger.error('Error replying to email', error);
      throw error;
    }
  }

  // ============================================================================
  // CALENDAR OPERATIONS
  // ============================================================================

  /**
   * Get calendar events
   */
  async getCalendarEvents(
    userToken: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Event[]> {
    try {
      const client = await this.getClient(userToken);

      const events = await client
        .api('/me/calendar/events')
        .filter(
          `start/dateTime ge '${startDate.toISOString()}' and end/dateTime le '${endDate.toISOString()}'`,
        )
        .select('subject,start,end,location,attendees,organizer,isOnlineMeeting,onlineMeetingUrl')
        .orderby('start/dateTime')
        .get();

      this.logger.log(`Found ${events.value.length} calendar events`);
      return events.value;
    } catch (error) {
      this.logger.error('Error getting calendar events', error);
      throw error;
    }
  }

  /**
   * Create calendar event
   */
  async createCalendarEvent(
    userToken: string,
    params: CalendarEventParams,
  ): Promise<Event> {
    try {
      const client = await this.getClient(userToken);

      const event: any = {
        subject: params.subject,
        start: {
          dateTime: params.startDateTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: params.endDateTime,
          timeZone: 'UTC',
        },
        location: params.location
          ? {
              displayName: params.location,
            }
          : undefined,
        attendees: params.attendees?.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        })),
        body: params.body
          ? {
              contentType: 'HTML',
              content: params.body,
            }
          : undefined,
        isOnlineMeeting: params.isOnlineMeeting || false,
      };

      const createdEvent = await client.api('/me/calendar/events').post(event);

      this.logger.log(`Calendar event created: ${params.subject}`);
      return createdEvent;
    } catch (error) {
      this.logger.error('Error creating calendar event', error);
      throw error;
    }
  }

  /**
   * Update calendar event
   */
  async updateCalendarEvent(
    userToken: string,
    eventId: string,
    params: Partial<CalendarEventParams>,
  ): Promise<Event> {
    try {
      const client = await this.getClient(userToken);

      const updates: any = {};

      if (params.subject) updates.subject = params.subject;
      if (params.startDateTime)
        updates.start = { dateTime: params.startDateTime, timeZone: 'UTC' };
      if (params.endDateTime)
        updates.end = { dateTime: params.endDateTime, timeZone: 'UTC' };
      if (params.location)
        updates.location = { displayName: params.location };

      const updatedEvent = await client
        .api(`/me/calendar/events/${eventId}`)
        .patch(updates);

      this.logger.log(`Calendar event updated: ${eventId}`);
      return updatedEvent;
    } catch (error) {
      this.logger.error('Error updating calendar event', error);
      throw error;
    }
  }

  /**
   * Delete calendar event
   */
  async deleteCalendarEvent(userToken: string, eventId: string): Promise<void> {
    try {
      const client = await this.getClient(userToken);

      await client.api(`/me/calendar/events/${eventId}`).delete();

      this.logger.log(`Calendar event deleted: ${eventId}`);
    } catch (error) {
      this.logger.error('Error deleting calendar event', error);
      throw error;
    }
  }

  // ============================================================================
  // FILE OPERATIONS (OneDrive/SharePoint)
  // ============================================================================

  /**
   * Search files
   */
  async searchFiles(
    userToken: string,
    query: string,
    maxResults: number = 10,
  ): Promise<DriveItem[]> {
    try {
      const client = await this.getClient(userToken);

      const files = await client
        .api(`/me/drive/root/search(q='${encodeURIComponent(query)}')`)
        .top(maxResults)
        .select('name,size,webUrl,lastModifiedDateTime,file,folder')
        .get();

      this.logger.log(`Found ${files.value.length} files matching query: ${query}`);
      return files.value;
    } catch (error) {
      this.logger.error('Error searching files', error);
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileDownloadInfo(
    userToken: string,
    itemId: string,
  ): Promise<Record<string, any>> {
    try {
      const client = await this.getClient(userToken);

      const metadata = await client
        .api(`/me/drive/items/${itemId}`)
        .select('id,name,size,lastModifiedDateTime,@microsoft.graph.downloadUrl')
        .get();

      return {
        id: metadata.id,
        name: metadata.name,
        size: metadata.size,
        lastModifiedDateTime: metadata.lastModifiedDateTime,
        downloadUrl: metadata['@microsoft.graph.downloadUrl'] ?? null,
      };
    } catch (error) {
      this.logger.error('Error getting file download info', error);
      throw error;
    }
  }

  /**
   * List files in folder
   */
  async listFiles(
    userToken: string,
    folderId: string = 'root',
  ): Promise<DriveItem[]> {
    try {
      const client = await this.getClient(userToken);

      const path =
        folderId === 'root'
          ? '/me/drive/root/children'
          : `/me/drive/items/${encodeURIComponent(folderId)}/children`;

      const files = await client
        .api(path)
        .select('name,size,webUrl,lastModifiedDateTime,file,folder')
        .get();

      return files.value;
    } catch (error) {
      this.logger.error('Error listing files', error);
      throw error;
    }
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  /**
   * Get user profile
   */
  async getUserProfile(userToken: string): Promise<User> {
    try {
      const client = await this.getClient(userToken);

      const user = await client
        .api('/me')
        .select('displayName,mail,userPrincipalName,jobTitle,department,officeLocation')
        .get();

      return user;
    } catch (error) {
      this.logger.error('Error getting user profile', error);
      throw error;
    }
  }

  /**
   * Get user's manager
   */
  async getUserManager(userToken: string): Promise<User> {
    try {
      const client = await this.getClient(userToken);

      const manager = await client
        .api('/me/manager')
        .select('displayName,mail,jobTitle')
        .get();

      return manager;
    } catch (error) {
      this.logger.error('Error getting user manager', error);
      throw error;
    }
  }

  /**
   * Search people
   */
  async searchPeople(
    userToken: string,
    query: string,
    maxResults: number = 10,
  ): Promise<any[]> {
    try {
      const client = await this.getClient(userToken);

      const people = await client
        .api('/me/people')
        .search(`"${query}"`)
        .top(maxResults)
        .select('displayName,emailAddresses,jobTitle,department')
        .get();

      return people.value;
    } catch (error) {
      this.logger.error('Error searching people', error);
      throw error;
    }
  }
}
