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
import logger from '../logger';

export class ModalHelper {
  constructor(private page: Page) {}

  /**
   * Checks if a modal window is closed (hidden)
   * @param locator - The selector for the modal window
   */
  async checkCloseModalWindow(locator: string) {
    const modalWindow = await this.page.locator(locator);
    await expect(modalWindow).toBeHidden();
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
      throw new Error(
        `getAllH3TitlesInClass only accepts data-testid selectors. Received: ${selector}. Use format: [data-testid="your-test-id"] or pattern selectors like [data-testid^="..."] or [data-testid$="..."]`,
      );
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
      console.log(`H4 Element ${i + 1}:`, title);

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
      console.log(`H4 Element ${i + 1}:`, title);

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
      console.log(`DEBUG: Found ${dialogCount} dialogs matching testId pattern with suffix: ${testId}*-ModalRight`);
    } else {
      console.log(`DEBUG: Found ${dialogCount} dialogs matching testId pattern: ${testId}*`);
    }

    const titles: string[] = [];

    // Step 2: Find all <h3> and <h4> elements within the dialog
    const h3Elements = await dialog.locator('h3').elementHandles();
    const h4Elements = await dialog.locator('h4').elementHandles();

    console.log(`DEBUG: Found ${h3Elements.length} H3 elements and ${h4Elements.length} H4 elements`);

    // Process H3 elements
    for (const h3Tag of h3Elements) {
      try {
        const title = await h3Tag.textContent();
        console.log(`DEBUG: H3 element text: "${title}"`);
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
        console.log(`DEBUG: H4 element text: "${title}"`);
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
    console.log('Expected Titles:', expectedTitlesNormalized);
    console.log('Received Titles:', normalizedH4Titles);

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
