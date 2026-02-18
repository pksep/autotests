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
   * Gets and verifies a success message, optionally checking for order number
   * @param orderNumber - Optional order number to verify in the message
   */
  async getMessage(orderNumber?: string) {
    const successMessageLocator = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION).last();
    await expect(successMessageLocator).toBeVisible();
    if (orderNumber) {
      const successMessageText = (await successMessageLocator.textContent()) || '';
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
      await this.page.locator(MODAL_LOADER_PRODUCTION).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
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
    //let visible = await container.isVisible().catch(() => false);
    // for (let i = 0; i < 10 && !visible; i++) {
    //   await page.waitForTimeout(100);
    //   visible = await container.isVisible().catch(() => false);
    // }
    // if (!visible) {
    //   console.log('Notification not visible.');
    //   return null;
    // }
    const titleLoc = container.locator('[data-testid="Notification-Notification-Title"]');
    await titleLoc.evaluate(row => {
      row.style.backgroundColor = 'yellow';
      row.style.border = '2px solid red';
      row.style.color = 'blue';
    });
    const descLoc = container.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION);
    await descLoc.evaluate(row => {
      row.style.backgroundColor = 'yellow';
      row.style.border = '2px solid red';
      row.style.color = 'blue';
    });
    // Highlight data-testid elements
    //await titleLoc.evaluate((el: HTMLElement) => { el.style.backgroundColor = 'yellow'; el.style.border = '2px solid red'; el.style.color = 'blue'; }).catch(() => { });
    //await descLoc.evaluate((el: HTMLElement) => { el.style.backgroundColor = 'yellow'; el.style.border = '2px solid red'; el.style.color = 'blue'; }).catch(() => { });
    const title = ((await titleLoc.textContent().catch(() => '')) || '').trim();
    const message = ((await descLoc.textContent().catch(() => '')) || '').trim();
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
