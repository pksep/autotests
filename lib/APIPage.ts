/**
 * @file APIPage.ts
 * @date 2025-01-20
 * @purpose To handle common actions and utilities across all pages, including interacting with input fields, buttons, and handling errors. Via API
 *
 * @alterations

 */

import { APIRequestContext, request, Page, expect, Locator, ElementHandle, APIResponse } from '@playwright/test'; // Import Playwright's Page class
import { AbstractPage } from './AbstractPage'; // Import the base AbstractPage class
import { ENV, SELECTORS } from '../config'; // Import environment and selector configurations
import { Input } from './Input'; // Import the Input helper class for handling input fields
import { Button } from './Button'; // Import the Button helper class for handling button clicks
import logger from './utils/logger'; // Import logger utility for logging messages

export class APIPageObject extends AbstractPage {
  
  constructor(context?: Page | APIRequestContext | null) {
    super(context as any); 
  }

  /**
   * Builds headers for authenticated API calls (Nest JWT).
   * Pass a raw access token, `Bearer …`, or `invalid_user` / empty to omit Authorization.
   */
  protected authHeaders(accessToken?: string, extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (accessToken && accessToken !== 'invalid_user') {
      headers['Authorization'] = accessToken.startsWith('Bearer ') ? accessToken : `Bearer ${accessToken}`;
    }
    return headers;
  }

  /** Flatten a payload for multipart/form-data (Nest FileFieldsInterceptor + @Body). */
  protected toMultipartFields(data: Record<string, unknown>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;
      out[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
    return out;
  }

  protected async parseJsonBody(response: APIResponse): Promise<any> {
    try {
      return await response.json();
    } catch {
      const text = await response.text();
      try {
        return text ? JSON.parse(text) : {};
      } catch {
        return { raw: text };
      }
    }
  }

  /**
   * Domains without a dedicated REST module: forwards to {@code POST api/actions/get-by-params}
   * (see sep_erp_server ActionsController). Merges {@code dto}; default {@code relativeActionType} is {@code assembly_kit}.
   */
  protected async postActionsByParams(
    request: APIRequestContext,
    dto: Record<string, unknown>,
    accessToken?: string
  ): Promise<{ status: number; data: any }> {
    const data = { relativeActionType: 'assembly_kit', offset: 0, ...dto };
    const res = await request.post(ENV.API_BASE_URL + 'api/actions/get-by-params', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(accessToken),
      },
      data,
    });
    return { status: res.status(), data: await this.parseJsonBody(res) };
  }

  /** Probe helper for legacy UI-only POMs: encodes method name + payload into {@code searchString}. */
  protected async apiProbe(
    request: APIRequestContext,
    op: string,
    payload: unknown,
    accessToken?: string
  ): Promise<{ status: number; data: any }> {
    return this.postActionsByParams(
      request,
      { searchString: JSON.stringify({ op, payload }) },
      accessToken && accessToken !== 'invalid_user' ? accessToken : undefined
    );
  }

  /**
   * Helper method to ensure all POST requests have proper Content-Type header
   * @param request - The API request context
   * @param url - The API endpoint URL
   * @param data - The request data
   * @param additionalHeaders - Any additional headers to include
   * @returns Promise with the response
   */
  async postWithJsonHeaders(request: APIRequestContext, url: string, data: any, additionalHeaders: any = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    return await request.post(url, {
      headers: headers,
      data: data,
    });
  }

  /**
   * Helper method to ensure all PUT requests have proper Content-Type header
   * @param request - The API request context
   * @param url - The API endpoint URL
   * @param data - The request data
   * @param additionalHeaders - Any additional headers to include
   * @returns Promise with the response
   */
  async putWithJsonHeaders(request: APIRequestContext, url: string, data: any, additionalHeaders: any = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    return await request.put(url, {
      headers: headers,
      data: data,
    });
  }

  async apiLogin(request: APIRequestContext, username: string, password: string, tabel: string) {
    logger.log(ENV.BASE_URL + '/api/auth/login');
    const response = await request.post(ENV.BASE_URL + 'api/auth/login', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        username: username,
        password: password,
        tabel: tabel,
      },
    });

    if (response.ok()) {
      const responseData = await response.json();
      return responseData; // Return the login response data
    } else {
      throw new Error(`Login failed with status: ${response.status()}`);
    }
  }
}
