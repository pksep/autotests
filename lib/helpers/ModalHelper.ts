/**
 * @file ModalHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for modal and dialog operations extracted from Page.ts
 *
 * This helper handles:
 * - Modal visibility and closing
 * - Modal title extraction (H3, H4)
 * - Modal button operations
 * - Modal validation
 */

import { Page, expect, Locator, TestInfo } from '@playwright/test';
import { WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import { extractIdFromSelector } from '../utils/utilities';
import { expectSoftWithScreenshot } from '../utils/utilities';
import logger from '../utils/logger';

export const OPEN_DIALOG_SELECTOR =
  'dialog[open], [role="dialog"]:visible, .modal:visible, .modal-yui-kit__modal-content:visible, [data-testid*="Modal"]:visible, [data-testid*="Dialog"]:visible, [data-testid*="Confirm"]:visible';

export interface DialogButtonExpectation {
  selector?: string;
  label?: string | RegExp;
  enabled?: boolean;
}

export interface DialogValidationOptions {
  dialogSelector?: string;
  expectedTitle?: string | RegExp;
  expectedTexts?: Array<string | RegExp>;
  expectedButtons?: DialogButtonExpectation[];
  expectedInputSelectors?: string[];
  mustHaveMeaningfulText?: boolean;
  closeAfterValidation?: boolean;
  closeSelector?: string;
  timeout?: number;
  testInfo?: TestInfo;
}

export interface DialogValidationResult {
  selector: string;
  title: string | null;
  text: string;
  buttons: string[];
  inputs: string[];
  closed: boolean;
}

function normalizeDialogText(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

export class ModalHelper {
  constructor(private page: Page) {}

  /**
   * Checks if a modal window is closed (hidden)
   * @param locator - The selector for the modal window
   * @param timeout - Optional timeout in ms to wait for hidden (default: WAIT_TIMEOUTS.PAGE_RELOAD)
   */
  async checkCloseModalWindow(locator: string, timeout: number = WAIT_TIMEOUTS.PAGE_RELOAD) {
    const modalWindow = this.page.locator(locator);
    await expect(modalWindow).toBeHidden({ timeout });
  }

  /**
   * Returns the first visible open dialog/modal. Use a selector for known dialogs,
   * otherwise this falls back to common dialog/modal patterns used in the app.
   */
  getOpenDialog(dialogSelector: string = OPEN_DIALOG_SELECTOR): Locator {
    return this.page.locator(dialogSelector).filter({ hasNot: this.page.locator('[aria-hidden="true"]') }).first();
  }

  /**
   * Lightweight dialog snapshot for exploration/debug assertions.
   */
  async getOpenDialogSnapshot(dialogSelector: string = OPEN_DIALOG_SELECTOR): Promise<DialogValidationResult> {
    const dialog = this.getOpenDialog(dialogSelector);
    await expect(dialog).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });

    const titleLocator = dialog.locator('h1,h2,h3,h4,h5,[data-testid*="Title"],[class*="title"]').first();
    const title = normalizeDialogText(await titleLocator.textContent({ timeout: 1000 }).catch(() => null)) || null;
    const text = normalizeDialogText(await dialog.innerText({ timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => ''));
    const buttons = await dialog
      .locator('button:visible,[role="button"]:visible')
      .evaluateAll(elements => elements.map(element => (element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()).filter(Boolean));
    const inputs = await dialog
      .locator('input:visible, textarea:visible, select:visible')
      .evaluateAll(elements => elements.map(element => element.getAttribute('data-testid') || element.getAttribute('placeholder') || element.tagName.toLowerCase()).filter(Boolean));

    return {
      selector: dialogSelector,
      title,
      text,
      buttons,
      inputs,
      closed: false,
    };
  }

  /**
   * Generic validation for dialogs/popups/modals:
   * - visible open dialog
   * - title/text content
   * - expected buttons and enabled/disabled state
   * - expected inputs
   * - optional close behavior
   */
  async validateDialog(options: DialogValidationOptions = {}): Promise<DialogValidationResult> {
    const dialogSelector = options.dialogSelector ?? OPEN_DIALOG_SELECTOR;
    const dialog = this.getOpenDialog(dialogSelector);
    await expect(dialog).toBeVisible({ timeout: options.timeout ?? WAIT_TIMEOUTS.STANDARD });

    const snapshot = await this.getOpenDialogSnapshot(dialogSelector);

    if (options.mustHaveMeaningfulText ?? true) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(snapshot.text.length).toBeGreaterThan(0);
        },
        `Verify dialog has meaningful text. Actual: "${snapshot.text}"`,
        options.testInfo,
      );
    }

    if (options.expectedTitle) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          if (options.expectedTitle instanceof RegExp) {
            expect.soft(snapshot.title ?? '').toMatch(options.expectedTitle);
          } else {
            expect.soft(snapshot.title ?? '').toContain(options.expectedTitle);
          }
        },
        `Verify dialog title. Expected: ${String(options.expectedTitle)}, actual: "${snapshot.title ?? ''}"`,
        options.testInfo,
      );
    }

    for (const expectedText of options.expectedTexts ?? []) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          if (expectedText instanceof RegExp) {
            expect.soft(snapshot.text).toMatch(expectedText);
          } else {
            expect.soft(snapshot.text).toContain(expectedText);
          }
        },
        `Verify dialog text contains ${String(expectedText)}`,
        options.testInfo,
      );
    }

    for (const expectedInputSelector of options.expectedInputSelectors ?? []) {
      const input = dialog.locator(expectedInputSelector).first();
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(input).toBeVisible();
        },
        `Verify dialog input is visible: ${expectedInputSelector}`,
        options.testInfo,
      );
    }

    for (const expectedButton of options.expectedButtons ?? []) {
      let button = expectedButton.selector ? dialog.locator(expectedButton.selector).first() : dialog.locator('button:visible,[role="button"]:visible');
      if (expectedButton.label) {
        button = button.filter({ hasText: expectedButton.label }).first();
      }

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(button).toBeVisible();
        },
        `Verify dialog button is visible: ${expectedButton.selector ?? String(expectedButton.label ?? '')}`,
        options.testInfo,
      );

      if (typeof expectedButton.enabled === 'boolean') {
        const disabled = await button
          .evaluate(element => element.hasAttribute('disabled') || element.classList.contains('disabled-yui-kit') || element.getAttribute('aria-disabled') === 'true')
          .catch(() => false);
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(!disabled).toBe(expectedButton.enabled);
          },
          `Verify dialog button enabled state: expected ${expectedButton.enabled}, actual ${!disabled}`,
          options.testInfo,
        );
      }
    }

    if (options.closeAfterValidation) {
      await this.closeOpenDialog(dialogSelector, options.closeSelector, options.timeout);
      snapshot.closed = true;
    }

    return snapshot;
  }

  /**
   * Closes an open dialog using a known close/cancel selector first, then Escape.
   */
  async closeOpenDialog(dialogSelector: string = OPEN_DIALOG_SELECTOR, closeSelector?: string, timeout: number = WAIT_TIMEOUTS.STANDARD): Promise<void> {
    const dialog = this.getOpenDialog(dialogSelector);
    await expect(dialog).toBeVisible({ timeout });

    const closeLocator = closeSelector
      ? dialog.locator(closeSelector).first()
      : dialog.locator('[data-testid$="Cancel-Button"], [data-testid*="Cancel"], button:has-text("Отмена"), button:has-text("Закрыть"), button:has-text("Нет"), [aria-label*="Закрыть"], [aria-label*="Close"]').first();

    if (await closeLocator.isVisible().catch(() => false)) {
      await closeLocator.click();
    } else {
      await this.page.keyboard.press('Escape');
    }

    await expect(dialog).toBeHidden({ timeout });
  }

  /**
   * Validates that no dialog/modal is currently visible.
   */
  async validateNoOpenDialogs(dialogSelector: string = OPEN_DIALOG_SELECTOR): Promise<void> {
    await expect(this.page.locator(dialogSelector)).toHaveCount(0, { timeout: WAIT_TIMEOUTS.STANDARD });
  }

  /**
   * Get all H3 tag values within a specific element by class name.
   * Excludes H3 tags inside <dialog> or <dialogs> tags.
   *
   * @param page - The Playwright page instance
   * @param selector - The data-testid selector of the container to scan
   * @returns Array of H3 text content
   */
  async getAllH3TitlesInClass(page: Page, selector: string): Promise<string[]> {
    // Step 1: Only accept data-testid selectors (no CSS classes)
    // Selector must be in format: [data-testid="value"] or pattern selectors like [data-testid^="..."] or [data-testid$="..."]
    // Also accepts combinations like [data-testid^="..."][data-testid$="..."]
    const isDataTestIdSelector = selector.startsWith('[data-testid=') || selector.startsWith('[data-testid^=') || selector.startsWith('[data-testid$=');
    if (!isDataTestIdSelector) {
      throw new Error(`getAllH3TitlesInClass only accepts data-testid selectors. Received: ${selector}. Use format: [data-testid="your-test-id"] or pattern selectors like [data-testid^="..."] or [data-testid$="..."]`);
    }
    const container = page.locator(selector);

    const classTitles: string[] = [];
    const h3Elements = await container.locator('h3').all();

    for (const h3Tag of h3Elements) {
      try {
        // Check if this H3 is inside any modal/dialog using evaluate
        const isInsideModal = await h3Tag.evaluate(el => {
          // Check for dialog element (HTML5 semantic element)
          if (el.closest('dialog')) return true;

          // Check for role="dialog" attribute
          if (el.closest('[role="dialog"]')) return true;

          // Check for data-testid containing "Modal"
          let parent = el.parentElement;
          while (parent) {
            if (parent.hasAttribute && parent.hasAttribute('data-testid')) {
              const testId = parent.getAttribute('data-testid');
              if (testId && testId.includes('Modal')) {
                return true;
              }
            }
            parent = parent.parentElement;
          }

          return false;
        });

        // Only include H3 if it's not inside a modal
        if (!isInsideModal) {
          const title = await h3Tag.textContent();
          if (title) {
            classTitles.push(title.trim());
            await h3Tag.evaluate(row => {
              row.style.backgroundColor = 'yellow';
              row.style.border = '2px solid red';
              row.style.color = 'blue';
            });
          }
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }
    logger.info('H3 Titles Found Inside Class (Excluding Modals):', classTitles);

    return classTitles;
  }

  /**
   * Get all H3 tag values within a specific element by data-testid
   * Excludes H3 tags inside <dialog> or <dialogs> tags.
   *
   * @param page - The Playwright page instance
   * @param testId - The data-testid of the container to scan
   * @returns Array of H3 text content
   */
  async getAllH3TitlesInTestId(page: Page, testId: string): Promise<string[]> {
    // Normalize: accept raw testId or a full selector containing data-testid
    let selector = testId;
    const match = testId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!testId.includes('data-testid')) {
      selector = `[data-testid="${testId}"]`;
    }

    // Step 1: Collect all H3 titles inside the specified data-testid container
    const container = page.locator(selector);
    const testIdTitles: string[] = [];
    const h3Elements = await container.locator('h3').all();

    for (const h3Tag of h3Elements) {
      try {
        // Check if this H3 is inside any modal/dialog using evaluate
        const isInsideModal = await h3Tag.evaluate(el => {
          // Check for dialog element (HTML5 semantic element)
          if (el.closest('dialog')) return true;

          // Check for role="dialog" attribute
          if (el.closest('[role="dialog"]')) return true;

          // Check for data-testid containing "Modal"
          let parent = el.parentElement;
          while (parent) {
            if (parent.hasAttribute && parent.hasAttribute('data-testid')) {
              const testId = parent.getAttribute('data-testid');
              if (testId && testId.includes('Modal')) {
                return true;
              }
            }
            parent = parent.parentElement;
          }

          return false;
        });

        // Only include H3 if it's not inside a modal
        if (!isInsideModal) {
          const title = await h3Tag.textContent();
          if (title) {
            testIdTitles.push(title.trim());

            // Highlight the element inside the given data-testid container
            await h3Tag.evaluate(el => {
              (el as HTMLElement).style.backgroundColor = 'yellow';
              (el as HTMLElement).style.border = '2px solid red';
              (el as HTMLElement).style.color = 'blue';
            });
          }
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }
    logger.info('H3 Titles Found Inside TestId (Excluding Modals):', testIdTitles);

    return testIdTitles;
  }

  /**
   * Get all H4 tag values within a modal by class name
   * @param page - The Playwright page instance
   * @param modalClassName - The class name of the modal container
   * @returns Array of H4 text content
   */
  async getAllH4TitlesInModalClass(page: Page, modalClassName: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');
    const section = page.locator('.basefile__modal-section');
    await section.waitFor({ state: 'attached', timeout: 5000 }); // Wait for the section to populate
    await page.waitForTimeout(1000); // Extra time for dynamic rendering, if needed

    const container = await page.locator(`.${modalClassName}`);
    const modalInnerHTML = await container.innerHTML();
    logger.info('Modal inner HTML:', modalInnerHTML);

    await expect(container).toBeVisible({ timeout: 5000 });
    logger.info('Container visibility confirmed.');

    const h4Elements = container.locator('h4');
    const h4Count = await h4Elements.count();
    logger.info(`Number of <h4> elements found: ${h4Count}`);

    if (h4Count === 0) {
      logger.warn(`No <h4> elements found inside class '${modalClassName}'.`);
      return [];
    }

    const titles: string[] = [];
    for (let i = 0; i < h4Count; i++) {
      const h4Tag = h4Elements.nth(i);
      await h4Tag.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      const title = await h4Tag.evaluate(element => {
        return Array.from(element.childNodes)
          .map(node => node.textContent?.trim() || '')
          .join(' ');
      });
      logger.log(`H4 Element ${i + 1}:`, title);

      if (title) {
        titles.push(title);
      }
    }

    logger.info(`Collected Titles:`, titles);
    return titles;
  }

  /**
   * Get all H4 tag values within a modal by data-testid
   * @param page - The Playwright page instance
   * @param modalTestId - The data-testid of the modal container
   * @returns Array of H4 text content
   */
  async getAllH4TitlesInModalByTestId(page: Page, modalTestId: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');

    // Determine the container selector
    let containerSelector: string;

    // If the input already contains [open] or is a dialog selector, use it as-is (may need [open] added)
    if (modalTestId.includes('[open]')) {
      // Already has [open], use as-is
      containerSelector = modalTestId;
    } else if (modalTestId.startsWith('dialog')) {
      // It's a dialog selector without [open], add it
      containerSelector = `${modalTestId}[open]`;
    } else if (modalTestId.includes('[data-testid=')) {
      // It's a full selector without [open], extract ID and construct selector
      const extractedId = extractIdFromSelector(modalTestId);
      containerSelector = `[data-testid="${extractedId}"][open]`;
    } else {
      // It's just the ID, construct the selector
      containerSelector = `[data-testid="${modalTestId}"][open]`;
    }

    // Locate the open modal container using the constructed selector
    const container = page.locator(containerSelector);
    await expect(container).toBeVisible({ timeout: 5000 });

    logger.info('Container visibility confirmed.');

    // Wait briefly to ensure all elements are loaded
    await page.waitForTimeout(500);

    // Locate all h4 elements inside the modal (without filtering by data-testid)
    const h4Elements = container.locator('h4');

    const h4Count = await h4Elements.count();

    logger.info(`Number of <h4> elements found: ${h4Count}`);

    if (h4Count === 0) {
      logger.warn(`No <h4> elements found inside modal '${modalTestId}'.`);
      return [];
    }

    const titles: string[] = [];
    for (let i = 0; i < h4Count; i++) {
      const h4Tag = h4Elements.nth(i);

      await h4Tag.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });

      const title = await h4Tag.textContent();
      logger.log(`H4 Element ${i + 1}:`, title);

      if (title) {
        titles.push(title.trim());
      }
    }

    logger.info(`Collected Titles:`, titles);
    return titles;
  }

  /**
   * Get all H3 tag values within a modal by class name
   * @param page - The Playwright page instance
   * @param className - The class name of the modal container
   * @returns Array of H3 text content
   */
  async getAllH3TitlesInModalClass(page: Page, className: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Step 1: Locate the container by the specified class
    const container = page.locator(`.${className}`);
    const titles: string[] = [];

    // Step 2: Find all <h3> elements within the container
    const h3Elements = await container.locator('h3').all();
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          await h3Tag.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 Titles Found Inside Class '${className}':`, titles);

    return titles;
  }

  /**
   * Get all H3 tag values within a modal by data-testid (new version)
   * @param page - The Playwright page instance
   * @param className - The class name or selector of the modal container
   * @returns Array of H3 text content
   */
  async getAllH3TitlesInModalClassNew(page: Page, className: string): Promise<string[]> {
    // Step 1: Locate the container by the specified class
    const container = page.locator(`${className}`);
    const titles: string[] = [];

    // Step 2: Find all <h3> elements within the container
    const h3Elements = await container.locator('h3').all();
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          await h3Tag.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 Titles Found Inside Class '${className}':`, titles);

    return titles;
  }

  /**
   * Get all H3 tag values within a modal by data-testid
   * @param page - The Playwright page instance
   * @param testId - The data-testid of the modal container
   * @returns Array of H3 text content
   */
  async getAllH3TitlesInModalTestId(page: Page, testId: string): Promise<string[]> {
    // Step 1: Locate the container by the specified data-testid
    // Check if testId is already a full selector (contains [data-testid)
    // Handles both cases: '[data-testid="..."]' and 'dialog[data-testid="..."]'
    const isFullSelector = testId.includes('[data-testid');
    const selector = isFullSelector ? `${testId}[open]` : `[data-testid^="${testId}"][open]`;
    const container = page.locator(selector);
    const titles: string[] = [];

    // Step 2: Find all <h3> elements within the container
    const h3Elements = await container.locator('h3').elementHandles();
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          // Cast the element to HTMLElement before accessing style
          await h3Tag.evaluate(row => {
            (row as HTMLElement).style.backgroundColor = 'yellow';
            (row as HTMLElement).style.border = '2px solid red';
            (row as HTMLElement).style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 Titles Found Inside TestId '${testId}':`, titles);

    return titles;
  }

  /**
   * Get all H3 and H4 tag values within a modal by data-testid
   * @param page - The Playwright page instance
   * @param testId - The data-testid of the modal container
   * @returns Array of H3 and H4 text content
   */
  async getAllH3AndH4TitlesInModalTestId(page: Page, testId: string): Promise<string[]> {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Step 1: Try different patterns to find the dialog
    let dialog = page.locator(`dialog[data-testid^="${testId}"][open]`);
    let dialogCount = await dialog.count();

    // If no matches and testId doesn't end with -ModalRight, try with suffix pattern
    if (dialogCount === 0 && !testId.endsWith('-ModalRight')) {
      dialog = page.locator(`dialog[data-testid^="${testId}"][data-testid$="-ModalRight"][open]`);
      dialogCount = await dialog.count();
      logger.log(`DEBUG: Found ${dialogCount} dialogs matching testId pattern with suffix: ${testId}*-ModalRight`);
    } else {
      logger.log(`DEBUG: Found ${dialogCount} dialogs matching testId pattern: ${testId}*`);
    }

    const titles: string[] = [];

    // Step 2: Find all <h3> and <h4> elements within the dialog
    const h3Elements = await dialog.locator('h3').elementHandles();
    const h4Elements = await dialog.locator('h4').elementHandles();

    logger.log(`DEBUG: Found ${h3Elements.length} H3 elements and ${h4Elements.length} H4 elements`);

    // Process H3 elements
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        logger.log(`DEBUG: H3 element text: "${title}"`);
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          // Cast the element to HTMLElement before accessing style
          await h3Tag.evaluate(row => {
            (row as HTMLElement).style.backgroundColor = 'yellow';
            (row as HTMLElement).style.border = '2px solid red';
            (row as HTMLElement).style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H3 tag:', error);
      }
    }

    // Process H4 elements
    for (const h4Tag of h4Elements) {
      try {
        const title = await h4Tag.textContent();
        logger.log(`DEBUG: H4 element text: "${title}"`);
        if (title) {
          titles.push(title.trim()); // Trim to remove unnecessary whitespace
          // Cast the element to HTMLElement before accessing style
          await h4Tag.evaluate(row => {
            (row as HTMLElement).style.backgroundColor = 'yellow';
            (row as HTMLElement).style.border = '2px solid red';
            (row as HTMLElement).style.color = 'blue';
          });
        }
      } catch (error) {
        console.error('Error processing H4 tag:', error);
      }
    }

    // Step 3: Log the collected titles
    logger.info(`H3 and H4 Titles Found Inside TestId '${testId}':`, titles);

    return titles;
  }

  /**
   * Validates H4 titles in a modal by test ID
   * @param page - Playwright Page object
   * @param modalTestId - Modal test ID (can be full selector or just ID)
   * @param expectedTitles - Array of expected title strings
   * @param options - Optional configuration (testInfo for screenshots, allowPartialMatch for first title)
   * @returns Promise<void>
   */
  async validateModalH4Titles(
    page: Page,
    modalTestId: string,
    expectedTitles: string[],
    options?: {
      testInfo?: TestInfo;
      allowPartialMatch?: boolean; // If true, first title uses contains() instead of exact match
    },
  ): Promise<void> {
    const expectedTitlesNormalized = expectedTitles.map(title => title.trim());
    const h4Titles = await this.getAllH4TitlesInModalByTestId(page, modalTestId);
    const normalizedH4Titles = h4Titles.map(title => title.trim());

    // Log for debugging
    logger.log('Expected Titles:', expectedTitlesNormalized);
    logger.log('Received Titles:', normalizedH4Titles);

    // Validate length
    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(normalizedH4Titles.length).toBe(expectedTitlesNormalized.length);
      },
      `Verify H4 titles count: expected ${expectedTitlesNormalized.length}, actual ${normalizedH4Titles.length}`,
      options?.testInfo,
    );

    // Validate content and order
    if (options?.allowPartialMatch && normalizedH4Titles.length > 0 && expectedTitlesNormalized.length > 0) {
      // First title uses contains, rest use exact match
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles[0]).toContain(expectedTitlesNormalized[0]);
        },
        `Verify first H4 title contains expected: "${expectedTitlesNormalized[0]}"`,
        options?.testInfo,
      );

      // Validate remaining titles with exact match
      for (let i = 1; i < expectedTitlesNormalized.length; i++) {
        if (i < normalizedH4Titles.length) {
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(normalizedH4Titles[i]).toBe(expectedTitlesNormalized[i]);
            },
            `Verify H4 title at index ${i}: expected "${expectedTitlesNormalized[i]}", actual "${normalizedH4Titles[i]}"`,
            options?.testInfo,
          );
        }
      }
    } else {
      // All titles use exact match
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles).toEqual(expectedTitlesNormalized);
        },
        `Verify H4 titles match: expected ${JSON.stringify(expectedTitlesNormalized)}, actual ${JSON.stringify(normalizedH4Titles)}`,
        options?.testInfo,
      );
    }
  }

  /**
   * Validates H3 + H4 titles in a modal by test ID (for modals where main title is h3 and section titles are h4).
   * Uses same assertion rules as validateModalH4Titles; allowPartialMatch applies to first title.
   */
  async validateModalH3AndH4Titles(
    page: Page,
    modalTestId: string,
    expectedTitles: string[],
    options?: {
      testInfo?: TestInfo;
      allowPartialMatch?: boolean;
    },
  ): Promise<void> {
    const expectedTitlesNormalized = expectedTitles.map(title => title.trim());
    const titles = await this.getAllH3AndH4TitlesInModalTestId(page, modalTestId);
    const normalizedTitles = titles.map(title => title.trim());

    logger.log('Expected Titles (H3+H4):', expectedTitlesNormalized);
    logger.log('Received Titles (H3+H4):', normalizedTitles);

    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(normalizedTitles.length).toBe(expectedTitlesNormalized.length);
      },
      `Verify H3+H4 titles count: expected ${expectedTitlesNormalized.length}, actual ${normalizedTitles.length}`,
      options?.testInfo,
    );

    if (options?.allowPartialMatch && normalizedTitles.length > 0 && expectedTitlesNormalized.length > 0) {
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedTitles[0]).toContain(expectedTitlesNormalized[0]);
        },
        `Verify first title contains expected: "${expectedTitlesNormalized[0]}"`,
        options?.testInfo,
      );
      for (let i = 1; i < expectedTitlesNormalized.length; i++) {
        if (i < normalizedTitles.length) {
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(normalizedTitles[i]).toBe(expectedTitlesNormalized[i]);
            },
            `Verify title at index ${i}: expected "${expectedTitlesNormalized[i]}", actual "${normalizedTitles[i]}"`,
            options?.testInfo,
          );
        }
      }
    } else {
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedTitles).toEqual(expectedTitlesNormalized);
        },
        `Verify H3+H4 titles match: expected ${JSON.stringify(expectedTitlesNormalized)}, actual ${JSON.stringify(normalizedTitles)}`,
        options?.testInfo,
      );
    }
  }

  /**
   * Get buttons from a dialog by class and button selector
   * @param page - The Playwright page instance
   * @param dialogClass - The class name of the dialog
   * @param buttonSelector - The selector for buttons within the dialog
   * @returns Locator for the buttons
   */
  async getButtonsFromDialog(page: Page, dialogClass: string, buttonSelector: string): Promise<Locator> {
    // Locate the dialog using the class and `open` attribute
    const dialogLocator = page.locator(`dialog.${dialogClass}[open]`);

    // Find all buttons inside the scoped dialog
    return dialogLocator.locator(buttonSelector);
  }

  /**
   * Check if modal company window is visible
   */
  async modalCompany() {
    const modalWindow = '.modal-yui-kit__modal-content';
    expect(await this.page.locator(modalWindow)).toBeVisible();
  }
}
