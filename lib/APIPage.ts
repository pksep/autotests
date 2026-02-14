/**
 * @file APIPage.ts
 * @date 2025-01-20
 * @purpose To handle common actions and utilities across all pages, including interacting with input fields, buttons, and handling errors. Via API
 *
 * @alterations

 */

import { APIRequestContext, request, Page, expect, Locator, ElementHandle } from '@playwright/test'; // Import Playwright's Page class
import { AbstractPage } from './AbstractPage'; // Import the base AbstractPage class
import { ENV, SELECTORS } from '../config'; // Import environment and selector configurations
import { Input } from './Input'; // Import the Input helper class for handling input fields
import { Button } from './Button'; // Import the Button helper class for handling button clicks
import logger from './utils/logger'; // Import logger utility for logging messages

export class APIPageObject extends AbstractPage {
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
      ...additionalHeaders
    };

    return await request.post(url, {
      headers: headers,
      data: data
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
      ...additionalHeaders
    };

    return await request.put(url, {
      headers: headers,
      data: data
    });
  }

  async apiLogin(request: APIRequestContext, username: string, password: string, tabel: string) {
    logger.log(ENV.BASE_URL + '/api/auth/login');
    const response = await request.post(ENV.BASE_URL + 'api/auth/login', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        username: username,
        password: password,
        tabel: tabel
      }
    });

    if (response.ok()) {
      const responseData = await response.json();
      return responseData; // Return the login response data
    } else {
      throw new Error(`Login failed with status: ${response.status()}`);
    }
  }
}