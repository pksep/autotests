import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class AuthAPI extends APIPageObject {
  constructor(context?: Page | APIRequestContext | null) {
    super(context);
  }

  async login(
    request: APIRequestContext,
    login: string,
    password: string,
    tabel: string,
    additionalHeaders: Record<string, string> = {},
  ) {
    logger.info(`Attempting login for user: ${login}`);

    // Use the correct endpoint and field names with compress header
    const response = await this.postWithJsonHeaders(
      request,
      ENV.API_BASE_URL + 'api/auth/login',
      {
        login: login,
        password: password,
        tabel: tabel,
      },
      {
        compress: 'no-compress',
        ...additionalHeaders,
      },
    );

    return await this.handleResponse(response, login);
  }

  private async handleResponse(response: any, username: string) {
    const status = response.status();
    const responseData = await this.parseJsonBody(response);

    if (response.ok()) {
      logger.info(`Login successful for user: ${username}`);
    } else {
      logger.info(`Login failed for user: ${username}, status: ${status} - This is expected for defensive testing`);
    }

    return {
      status: status,
      data: responseData,
      headers: response.headers(),
      headersArray: response.headersArray(),
      method: 'POST',
      url: response.url(),
    };
  }

  async getUserByToken(request: APIRequestContext, token: string) {
    logger.info(`Getting user by token`);

    // Token validation endpoint returns a success status for a valid token and 401 for an invalid token.
    const result = await this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/auth/check', {
      data: { token },
      headers: { accept: '*/*' },
    });

    if (result.status >= 200 && result.status < 300) {
      logger.info(`Successfully retrieved user by token`);
    } else {
      logger.info(`Failed to get user by token, status: ${result.status} - This is expected for defensive testing`);
    }

    return result;
  }

  /**
   * Refresh access and refresh tokens using a valid refresh token
   * @param request APIRequestContext
   * @param refreshToken Valid refresh token
   * @returns Response with new tokens
   */
  async refreshTokens(request: APIRequestContext, refreshToken?: string) {
    logger.info(`Refreshing tokens using refresh token`);

    const headers: Record<string, string> = {};

    if (refreshToken) {
      headers.Cookie = `refresh_token=${refreshToken}`;
    }

    const response = await this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/auth/refresh', {
      headers,
    });

    if (response.status >= 200 && response.status < 300) {
      logger.info(`Token refresh successful`);
    } else {
      logger.info(`Token refresh failed, status: ${response.status}`);
    }

    return response;
  }

  /**
   * Logout the user by invalidating the session
   * @param request APIRequestContext
   * @param userId ID of the user to logout
   * @returns Response indicating logout success
   */
  async logout(request: APIRequestContext, userId: number) {
    logger.info(`Logging out user with ID: ${userId}`);

    const response = await this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/auth/logout', {
      data: { userId },
    });

    if (response.status >= 200 && response.status < 300) {
      logger.info(`Logout successful for user ID: ${userId}`);
    } else {
      logger.info(`Logout failed for user ID: ${userId}, status: ${response.status}`);
    }

    return response;
  }
}
