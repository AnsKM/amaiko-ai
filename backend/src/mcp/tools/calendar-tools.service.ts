import { Injectable, Logger } from '@nestjs/common';
import { GraphService, CalendarEventParams } from '../../graph/graph.service';
import { McpContext, McpToolResult } from '../interfaces/mcp-context.interface';

interface GetEventsParams {
  startDate: string;
  endDate: string;
}

/**
 * Calendar tools for MCP integration
 * Provides calendar event management via Microsoft Graph
 */
@Injectable()
export class CalendarToolsService {
  private readonly logger = new Logger(CalendarToolsService.name);

  constructor(private graphService: GraphService) {}

  /**
   * Tool: get_calendar_events
   * Get calendar events for a date range
   */
  async getCalendarEvents(
    params: GetEventsParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Getting calendar events for user ${context.userId} from ${params.startDate} to ${params.endDate}`,
      );

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
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                count: formattedEvents.length,
                events: formattedEvents,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error getting calendar events', error);
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
   * Tool: create_calendar_event
   * Create a new calendar event
   */
  async createCalendarEvent(
    params: CalendarEventParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Creating calendar event for user ${context.userId}: ${params.subject}`,
      );

      const event = await this.graphService.createCalendarEvent(
        context.userToken,
        params,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                message: 'Calendar event created successfully',
                event: {
                  id: event.id,
                  subject: event.subject,
                  start: event.start,
                  end: event.end,
                  location: event.location?.displayName,
                  isOnlineMeeting: event.isOnlineMeeting,
                  onlineMeetingUrl: event.onlineMeetingUrl,
                },
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error creating calendar event', error);
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
   * Tool: update_calendar_event
   * Update an existing calendar event
   */
  async updateCalendarEvent(
    params: {
      eventId: string;
      updates: Partial<CalendarEventParams>;
    },
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Updating calendar event ${params.eventId} for user ${context.userId}`,
      );

      const event = await this.graphService.updateCalendarEvent(
        context.userToken,
        params.eventId,
        params.updates,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                message: 'Calendar event updated successfully',
                event: {
                  id: event.id,
                  subject: event.subject,
                  start: event.start,
                  end: event.end,
                },
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error updating calendar event', error);
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
   * Tool: delete_calendar_event
   * Delete a calendar event
   */
  async deleteCalendarEvent(
    params: { eventId: string },
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Deleting calendar event ${params.eventId} for user ${context.userId}`,
      );

      await this.graphService.deleteCalendarEvent(
        context.userToken,
        params.eventId,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              message: 'Calendar event deleted successfully',
              eventId: params.eventId,
            }),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error deleting calendar event', error);
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
   * Get all available calendar tools metadata
   */
  getToolsMetadata() {
    return [
      {
        name: 'get_calendar_events',
        description: 'Get calendar events for a specified date range',
        parameters: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              description: 'Start date in ISO format (YYYY-MM-DD)',
            },
            endDate: {
              type: 'string',
              description: 'End date in ISO format (YYYY-MM-DD)',
            },
          },
          required: ['startDate', 'endDate'],
        },
      },
      {
        name: 'create_calendar_event',
        description: 'Create a new calendar event',
        parameters: {
          type: 'object',
          properties: {
            subject: {
              type: 'string',
              description: 'Event title/subject',
            },
            startDateTime: {
              type: 'string',
              description: 'Start date and time in ISO format',
            },
            endDateTime: {
              type: 'string',
              description: 'End date and time in ISO format',
            },
            location: {
              type: 'string',
              description: 'Event location (optional)',
            },
            attendees: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of attendee email addresses (optional)',
            },
            body: {
              type: 'string',
              description: 'Event description/body (optional)',
            },
            isOnlineMeeting: {
              type: 'boolean',
              description: 'Create as online meeting (Teams) (optional)',
            },
          },
          required: ['subject', 'startDateTime', 'endDateTime'],
        },
      },
      {
        name: 'update_calendar_event',
        description: 'Update an existing calendar event',
        parameters: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The ID of the event to update',
            },
            updates: {
              type: 'object',
              description: 'Fields to update',
              properties: {
                subject: { type: 'string' },
                startDateTime: { type: 'string' },
                endDateTime: { type: 'string' },
                location: { type: 'string' },
              },
            },
          },
          required: ['eventId', 'updates'],
        },
      },
      {
        name: 'delete_calendar_event',
        description: 'Delete a calendar event',
        parameters: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'The ID of the event to delete',
            },
          },
          required: ['eventId'],
        },
      },
    ];
  }
}
