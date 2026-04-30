/**
 * @file NotificationHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for notification and message operations extracted from Page.ts
 *
 * This helper handles:
 * - Getting notification messages
 * - Closing success messages
 * - Extracting notification content
 * - Getting latest notification text
 */

import { Page, expect } from '@playwright/test';
import * as SelectorsNotifications from '../Constants/SelectorsNotifications';
import { WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import logger from '../utils/logger';

/** Loader modal that can cover the notification area and intercept clicks (e.g. after "Launch into production"). */
const MODAL_LOADER_PRODUCTION = '[data-testid="ModalStartProduction-Loader"]';

export class NotificationHelper {
  constructor(private page: Page) {}

  /**
   * Captures the POST /api/stock-order/ request+response around a user action.
   * This is used for "В производство" validation when notification text is no longer reliable.
   */
  async captureStockOrderRequestAndResponse(
    action: () => Promise<void>,
    timeoutMs: number = WAIT_TIMEOUTS.PAGE_RELOAD,
  ): Promise<{
    url: string;
    status: number;
    ok: boolean;
    requestPayload: unknown;
    responseBody: unknown;
    responseText: string;
  }> {
    const responsePromise = this.page.waitForResponse(
      response => {
        const request = response.request();
        if (request.method() !== 'POST') {
          return false;
        }

        try {
          const pathname = new URL(response.url()).pathname;
          return /\/api\/stock-order\/?$/.test(pathname);
        } catch {
          return response.url().includes('/api/stock-order/');
        }
      },
      { timeout: timeoutMs },
    );

    await action();
    const response = await responsePromise;
    const request = response.request();

    let requestPayload: unknown = null;
    try {
      requestPayload = request.postDataJSON();
    } catch {
      requestPayload = request.postData() ?? null;
    }

    let responseBody: unknown = null;
    let responseText = '';
    try {
      responseBody = await response.json();
      responseText = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
    } catch {
      responseText = (await response.text().catch(() => '')) || '';
      responseBody = responseText;
    }

    const result = {
      url: response.url(),
      status: response.status(),
      ok: response.ok(),
      requestPayload,
      responseBody,
      responseText,
    };

    logger.log(`Captured stock-order API call: ${JSON.stringify(result)}`);
    return result;
  }

  /**
   * Gets and verifies a success message, optionally checking for order number
   * @param orderNumber - Optional order number to verify in the message
   */
  async getMessage(orderNumber?: string) {
    const successMessages = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION);
    const successMessageLocator = successMessages.last();
    await expect(successMessageLocator).toBeVisible();
    if (orderNumber) {
      let successMessageText = '';
      const deadline = Date.now() + WAIT_TIMEOUTS.STANDARD;

      while (Date.now() < deadline && !successMessageText.includes(orderNumber)) {
        const count = await successMessages.count();
        const visibleTexts: string[] = [];

        for (let index = 0; index < count; index++) {
          const message = successMessages.nth(index);
          if (await message.isVisible().catch(() => false)) {
            visibleTexts.push(((await message.textContent().catch(() => '')) || '').trim());
          }
        }

        successMessageText =
          visibleTexts.find(messageText => messageText.includes(orderNumber)) ||
          visibleTexts[visibleTexts.length - 1] ||
          '';

        if (!successMessageText.includes(orderNumber)) {
          await this.page.waitForTimeout(250);
        }
      }

      expect(successMessageText).toContain(orderNumber);
    }
  }

  /**
   * Closes the success message notification.
   * Waits for the production loader modal to disappear first so it does not intercept the click.
   */
  async closeSuccessMessage() {
    try {
      const closeButton = this.page.locator('[data-testid="Notification-Notification-Icon"]').last();
      await this.page
        .locator(MODAL_LOADER_PRODUCTION)
        .waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD })
        .catch(() => {});
      await closeButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await closeButton.click({ timeout: WAIT_TIMEOUTS.SHORT });
    } catch (error) {
      logger.warn('Closing notification failed (loader may have intercepted or notification closed).', error);
    }
  }

  /**
   * Extracts notification message title and description
   * @param page - The Playwright page instance
   * @returns Object with title and message, or null if not visible
   */
  async extractNotificationMessage(page: Page): Promise<{ title: string; message: string } | null> {
    // Extract using data-testid; poll briefly due to transient nature
    const container = page.locator('[data-testid="Notification-Notification"]').last();
    await container.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
    if (!(await container.isVisible().catch(() => false))) {
      logger.warn('Notification not visible while extracting message.');
      return null;
    }

    const titleLoc = container.locator('[data-testid="Notification-Notification-Title"]');
    const descLoc = container.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION);

    const title = ((await titleLoc.textContent({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => '')) || '').trim();
    const message = ((await descLoc.textContent({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => '')) || '').trim();
    if (!title && !message) {
      logger.warn('Notification was visible, but title and description were empty.');
      return null;
    }

    await titleLoc
      .evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      })
      .catch(() => {});
    await descLoc
      .evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      })
      .catch(() => {});

    return { title, message };
  }

  /**
   * Gets the text content of the latest notification description.
   * @returns The notification description text, or empty string if not visible
   */
  async getLatestNotificationText(): Promise<string> {
    const desc = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION).last();
    const visible = await desc.isVisible().catch(() => false);
    if (!visible) return '';
    return (await desc.textContent())?.trim() || '';
  }
}
