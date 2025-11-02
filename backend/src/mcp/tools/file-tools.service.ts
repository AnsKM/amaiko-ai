import { Injectable, Logger } from '@nestjs/common';
import { GraphService } from '../../graph/graph.service';
import { McpContext, McpToolResult } from '../interfaces/mcp-context.interface';

interface SearchFilesParams {
  query: string;
  maxResults?: number;
}

interface ListFilesParams {
  folderId?: string;
}

/**
 * File tools for MCP integration
 * Provides file search and access via Microsoft Graph (OneDrive/SharePoint)
 */
@Injectable()
export class FileToolsService {
  private readonly logger = new Logger(FileToolsService.name);

  constructor(private graphService: GraphService) {}

  /**
   * Tool: search_files
   * Search files in OneDrive/SharePoint
   */
  async searchFiles(
    params: SearchFilesParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Searching files for user ${context.userId} with query: ${params.query}`,
      );

      const files = await this.graphService.searchFiles(
        context.userToken,
        params.query,
        params.maxResults || 10,
      );

      const formattedFiles = files.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        webUrl: file.webUrl,
        lastModifiedDateTime: file.lastModifiedDateTime,
        isFolder: !!file.folder,
        fileType: file.file?.mimeType || (file.folder ? 'folder' : 'unknown'),
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                count: formattedFiles.length,
                files: formattedFiles,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error searching files', error);
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
   * Tool: list_files
   * List files in a specific folder
   */
  async listFiles(
    params: ListFilesParams,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      const folderId = params.folderId || 'root';
      this.logger.log(
        `Listing files for user ${context.userId} in folder: ${folderId}`,
      );

      const files = await this.graphService.listFiles(
        context.userToken,
        folderId,
      );

      const formattedFiles = files.map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        webUrl: file.webUrl,
        lastModifiedDateTime: file.lastModifiedDateTime,
        isFolder: !!file.folder,
        fileType: file.file?.mimeType || (file.folder ? 'folder' : 'unknown'),
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                folderId,
                count: formattedFiles.length,
                files: formattedFiles,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error listing files', error);
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
   * Tool: get_file_content
   * Get file content by ID
   * Note: For large files or binary files, returns download URL instead
   */
  async getFileContent(
    itemId: string,
    context: McpContext,
  ): Promise<McpToolResult> {
    try {
      this.logger.log(
        `Getting file content for item ${itemId}, user ${context.userId}`,
      );

      // For now, we'll return the file metadata and a note about downloading
      // In production, you might want to handle small text files differently
      const content = await this.graphService.getFileContent(
        context.userToken,
        itemId,
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                status: 'success',
                message:
                  'File content retrieved. For large files, use the download URL.',
                itemId,
                contentLength: content?.length || 0,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error getting file content', error);
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
   * Get all available file tools metadata
   */
  getToolsMetadata() {
    return [
      {
        name: 'search_files',
        description: 'Search files in OneDrive and SharePoint',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for files',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_files',
        description: 'List files in a specific folder',
        parameters: {
          type: 'object',
          properties: {
            folderId: {
              type: 'string',
              description:
                'The ID of the folder to list (default: root - user\'s OneDrive root)',
              default: 'root',
            },
          },
        },
      },
      {
        name: 'get_file_content',
        description: 'Get file content by ID',
        parameters: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The ID of the file item',
            },
          },
          required: ['itemId'],
        },
      },
    ];
  }
}
