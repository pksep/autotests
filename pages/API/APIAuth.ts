import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class AuthAPI extends APIPageObject {
  constructor(context?: Page | APIRequestContext | null) {
    super(context);
  }

  async login(request: APIRequestContext, login: string, password: string, tabel: string) {
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
      },
    );

    return await this.handleResponse(response, login);
  }

  private async handleResponse(response: any, username: string) {
    const status = response.status();
    let responseData;

    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    if (response.ok()) {
      logger.info(`Login successful for user: ${username}`);
    } else {
      logger.info(`Login failed for user: ${username}, status: ${status} - This is expected for defensive testing`);
    }

    return { status: status, data: responseData };
  }

    async getUserByToken(request: APIRequestContext, token: string) {
      logger.info(`Getting user by token`);

      // Token validation endpoint - returns 200 OK if token is valid (no user data returned)
      // This is correct API behavior: 200 = valid token, 401 = invalid token
      const response = await request.post(ENV.API_BASE_URL + 'api/auth/check', {
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
          'compress': 'no-compress',
        },
        data: {
          token: token
        }
      });

    const status = response.status();
    let responseData;

    try {
      responseData = await response.json();
      logger.log(`🔍 JSON response parsed successfully: ${JSON.stringify(responseData).substring(0, 200)}...`);
    } catch (e) {
      responseData = await response.text();
      logger.log(`🔍 Text response: "${responseData}" (length: ${responseData.length})`);
    }

    // Response processed

    if (response.ok()) {
      logger.info(`Successfully retrieved user by token`);
    } else {
      logger.info(`Failed to get user by token, status: ${status} - This is expected for defensive testing`);
    }

        return { status: status, data: responseData };
  }

  /**
   * Refresh access and refresh tokens using a valid refresh token
   * @param request APIRequestContext
   * @param refreshToken Valid refresh token
   * @returns Response with new tokens
   */
  async refreshTokens(request: APIRequestContext, refreshToken: string) {
    logger.info(`Refreshing tokens using refresh token`);

    const response = await request.post(ENV.API_BASE_URL + 'api/auth/refresh', {
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const status = response.status();
    let responseData;

    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    if (response.ok()) {
      logger.info(`Token refresh successful`);
    } else {
      logger.info(`Token refresh failed, status: ${status}`);
    }

    return { status: status, data: responseData };
  }

  /**
   * Logout the user by invalidating the session
   * @param request APIRequestContext
   * @param userId ID of the user to logout
   * @returns Response indicating logout success
   */
  async logout(request: APIRequestContext, userId: number) {
    logger.info(`Logging out user with ID: ${userId}`);

    const response = await request.post(ENV.API_BASE_URL + 'api/auth/logout', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        userId: userId,
      },
    });

    const status = response.status();
    let responseData;

    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }

    if (response.ok()) {
      logger.info(`Logout successful for user ID: ${userId}`);
    } else {
      logger.info(`Logout failed for user ID: ${userId}, status: ${status}`);
    }

    return { status: status, data: responseData };
  }
}
