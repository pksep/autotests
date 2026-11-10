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
    logger.info('Attempting cookie session login');

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

    return await this.handleResponse(response);
  }

  private async handleResponse(response: any) {
    const status = response.status();
    const responseData = await this.parseJsonBody(response);

    if (response.ok()) {
      logger.info('Cookie session login successful');
    } else {
      logger.info(`Login returned HTTP ${status}`);
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

  async getSession(request: APIRequestContext, accessCookie?: string) {
    return this.apiRequest(request, 'GET', ENV.API_BASE_URL + 'api/auth/session', {
      // undefined uses the context cookie jar; an empty string explicitly removes cookies.
      headers: accessCookie === undefined ? {} : { Cookie: accessCookie ? `access_token=${accessCookie}` : '' },
    });
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

    if (refreshToken !== undefined) {
      headers.Cookie = refreshToken ? `refresh_token=${refreshToken}` : '';
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
   * Invalidate the session identified by the context cookies.
   * @param request APIRequestContext
   * @returns Response indicating logout success
   */
  async logout(request: APIRequestContext) {
    logger.info('Logging out the current cookie session');

    const response = await this.apiRequest(request, 'POST', ENV.API_BASE_URL + 'api/auth/logout');

    if (response.status >= 200 && response.status < 300) {
      logger.info('Cookie session logout successful');
    } else {
      logger.info(`Logout returned HTTP ${response.status}`);
    }

    return response;
  }
}
