import { Injectable, Logger } from '@nestjs/common';
import * as msal from '@azure/msal-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GraphAuthService {
  private readonly logger = new Logger(GraphAuthService.name);
  private msalClient: msal.ConfidentialClientApplication;

  constructor(private configService: ConfigService) {
    const msalConfig: msal.Configuration = {
      auth: {
        clientId: this.configService.get<string>('AZURE_CLIENT_ID'),
        authority: `https://login.microsoftonline.com/${this.configService.get<string>('AZURE_TENANT_ID')}`,
        clientSecret: this.configService.get<string>('AZURE_CLIENT_SECRET'),
      },
      system: {
        loggerOptions: {
          loggerCallback: (level, message, containsPii) => {
            if (!containsPii) {
              switch (level) {
                case msal.LogLevel.Error:
                  this.logger.error(message);
                  break;
                case msal.LogLevel.Warning:
                  this.logger.warn(message);
                  break;
                case msal.LogLevel.Info:
                  this.logger.log(message);
                  break;
                case msal.LogLevel.Verbose:
                  this.logger.verbose(message);
                  break;
              }
            }
          },
          piiLoggingEnabled: false,
          logLevel: msal.LogLevel.Info,
        },
      },
    };

    this.msalClient = new msal.ConfidentialClientApplication(msalConfig);
    this.logger.log('MSAL client initialized successfully');
  }

  /**
   * Acquire token on behalf of a user (OBO flow)
   * This is used to get a Graph API token using the user's Teams token
   */
  async acquireTokenOnBehalfOf(userToken: string): Promise<string> {
    try {
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

      if (!response || !response.accessToken) {
        throw new Error('Failed to acquire token on behalf of user');
      }

      this.logger.log('Successfully acquired OBO token');
      return response.accessToken;
    } catch (error) {
      this.logger.error('Error acquiring OBO token', error);
      throw error;
    }
  }

  /**
   * Acquire application token (app-only authentication)
   * Used for background tasks that don't require user context
   */
  async acquireApplicationToken(): Promise<string> {
    try {
      const clientCredentialRequest: msal.ClientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await this.msalClient.acquireTokenByClientCredential(
        clientCredentialRequest,
      );

      if (!response || !response.accessToken) {
        throw new Error('Failed to acquire application token');
      }

      this.logger.log('Successfully acquired application token');
      return response.accessToken;
    } catch (error) {
      this.logger.error('Error acquiring application token', error);
      throw error;
    }
  }

  /**
   * Get authorization URL for user sign-in
   */
  async getAuthCodeUrl(scopes: string[], redirectUri: string): Promise<string> {
    try {
      const authCodeUrlParameters: msal.AuthorizationUrlRequest = {
        scopes,
        redirectUri,
      };

      const authUrl = await this.msalClient.getAuthCodeUrl(authCodeUrlParameters);
      return authUrl;
    } catch (error) {
      this.logger.error('Error generating auth code URL', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async acquireTokenByCode(
    code: string,
    scopes: string[],
    redirectUri: string,
  ): Promise<msal.AuthenticationResult> {
    try {
      const tokenRequest: msal.AuthorizationCodeRequest = {
        code,
        scopes,
        redirectUri,
      };

      const response = await this.msalClient.acquireTokenByCode(tokenRequest);

      if (!response) {
        throw new Error('Failed to acquire token by authorization code');
      }

      this.logger.log('Successfully acquired token by code');
      return response;
    } catch (error) {
      this.logger.error('Error acquiring token by code', error);
      throw error;
    }
  }
}
