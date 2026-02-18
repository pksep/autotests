/**
 * @file ElementHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for element interaction operations extracted from Page.ts
 * 
 * This helper handles:
 * - Finding and clicking elements
 * - Getting text content
 * - Highlighting elements
 * - Scrolling elements into view
 * - Filling input fields
 * - Button interactions
 */

import { Page, expect, Locator } from '@playwright/test';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import { Click } from '../Page';
import { normalizeText } from '../utils/utilities';
import logger from '../utils/logger';

export class ElementHelper {
  constructor(private page: Page) {}

  /**
   * Finds and clicks an element by partial data-testid, with fallback strategies
   * @param page - The Playwright page instance
   * @param partialDataTestId - The partial data-testid or full selector
   * @param waitTime - Time to wait after clicking (default: 10000)
   * @param doubleClick - Whether to double-click instead of single-click
   */
  async findAndClickElement(page: Page, partialDataTestId: string, waitTime: number = 10000, doubleClick?: boolean): Promise<void> {
    // Check if partialDataTestId already contains the full selector with [data-testid=
    // If yes, use it directly; if no, wrap it with [data-testid^="..."]
    const isFullSelector = partialDataTestId.startsWith('[data-testid');
    const selector = isFullSelector ? partialDataTestId : `[data-testid^="${partialDataTestId}"]`;
    const searchTerm = isFullSelector ? 'selector' : 'data-testid';

    logger.info(`Searching for elements with ${searchTerm}="${partialDataTestId}"`);

    // Use locator (modern Playwright API) instead of page.$$() (old API)
    // Locators automatically wait for elements and are more reliable
    const locator = page.locator(selector);

    try {
      // Wait for at least one element to be visible
      await expect(locator.first()).toBeVisible({ timeout: 10000 });

      // Count how many elements match
      const count = await locator.count();
      logger.info(`Found ${count} element(s) with ${searchTerm}="${partialDataTestId}"`);

      if (count > 1) {
        logger.warn(`Found multiple elements with ${searchTerm}="${partialDataTestId}" will click first`);
      }

      // Get the first element locator
      const firstElement = locator.first();

      // Highlight the element before clicking
      await firstElement.evaluate(element => {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'red';
      });

      // Click on the first element
      if (!doubleClick) {
        await firstElement.click({ force: true });
      } else {
        await firstElement.dblclick({ force: true });
      }

      logger.info(`Clicked on the first element with ${searchTerm}="${partialDataTestId}"`);

      // Wait for the specified amount of time
      await page.waitForTimeout(waitTime);
      await page.waitForTimeout(1500);
      logger.info(`Waited for ${waitTime}ms after clicking the element`);
    } catch (error) {
      // If selector search failed, try fallback methods
      if (isFullSelector) {
        // Extract the data-testid value from the full selector
        const dataTestIdValue = partialDataTestId.match(/data-testid="([^"]+)"/)?.[1];
        if (dataTestIdValue) {
          logger.warn(`Element with selector="${partialDataTestId}" not found, trying getByTestId with "${dataTestIdValue}"...`);
          try {
            const testIdLocator = page.getByTestId(dataTestIdValue);
            await expect(testIdLocator).toBeVisible({ timeout: 10000 });

            logger.info(`Element found with getByTestId("${dataTestIdValue}")`);

            await testIdLocator.scrollIntoViewIfNeeded();
            await testIdLocator.evaluate(element => {
              element.style.border = '2px solid red';
              element.style.backgroundColor = 'yellow';
            });

            if (!doubleClick) {
              await testIdLocator.click({ force: true });
            } else {
              await testIdLocator.dblclick({ force: true });
            }

            logger.info(`Clicked on the element with getByTestId("${dataTestIdValue}")`);
            await page.waitForTimeout(waitTime);
            await page.waitForTimeout(1500);
            logger.info(`Waited for ${waitTime}ms after clicking the element`);
            return; // Success, exit early
          } catch (testIdError) {
            logger.warn(`getByTestId("${dataTestIdValue}") also failed, trying ID fallback...`);
          }
        }

        // Try ID fallback
        const idValue = dataTestIdValue || partialDataTestId.replace(/[\[\]"]/g, '');
        logger.warn(`Trying to find by ID="${idValue}"...`);
        const idLocator = page.locator(`#${idValue}`);

        try {
          await expect(idLocator).toBeVisible({ timeout: 10000 });
          logger.info(`Element with id="${idValue}" found`);

          await idLocator.scrollIntoViewIfNeeded();
          await idLocator.evaluate(element => {
            element.style.border = '2px solid red';
            element.style.backgroundColor = 'yellow';
          });

          if (!doubleClick) {
            await idLocator.click({ force: true });
          } else {
            await idLocator.dblclick({ force: true });
          }

          logger.info(`Clicked on the element with id="${idValue}"`);
          await page.waitForTimeout(waitTime);
          logger.info(`Waited for ${waitTime}ms after clicking the element`);
          return; // Success, exit early
        } catch (idError) {
          // All methods failed
          logger.error(`No element found with selector="${partialDataTestId}", getByTestId, or id="${idValue}"`);
          throw new Error(
            `findAndClickElement failed: Could not find element with selector="${partialDataTestId}", getByTestId, or id="${idValue}". ` +
              `The element may not be visible, may have a different selector, or the page may not have loaded completely.`,
          );
        }
      } else {
        // For partial data-testid, try ID fallback
        logger.warn(`Element with data-testid^="${partialDataTestId}" not found, trying to find by ID...`);
        const idLocator = page.locator(`#${partialDataTestId}`);

        try {
          await expect(idLocator).toBeVisible({ timeout: 10000 });
          logger.info(`Element with id="${partialDataTestId}" found`);

          await idLocator.scrollIntoViewIfNeeded();
          await idLocator.evaluate(element => {
            element.style.border = '2px solid red';
            element.style.backgroundColor = 'yellow';
          });

          if (!doubleClick) {
            await idLocator.click({ force: true });
          } else {
            await idLocator.dblclick({ force: true });
          }

          logger.info(`Clicked on the element with id="${partialDataTestId}"`);
          await page.waitForTimeout(waitTime);
          logger.info(`Waited for ${waitTime}ms after clicking the element with id="${partialDataTestId}"`);
        } catch (idError) {
          // Neither data-testid nor id worked - throw error
          logger.error(`No element found with data-testid^="${partialDataTestId}" or id="${partialDataTestId}"`);

          throw new Error(
            `findAndClickElement failed: Could not find element with data-testid^="${partialDataTestId}" or id="${partialDataTestId}". ` +
              `The element may not be visible, may have a different selector, or the page may not have loaded completely.`,
          );
        }
      }
    }
  }

  /**
   * Gets the text content of a specified selector.
   * @param selector - The CSS selector for the element to retrieve text from.
   * @returns The text content of the element or null if the element doesn't exist.
   */
  async getText(selector: string): Promise<string | null> {
    return await this.page.textContent(selector); // Return the text content of the element
  }

  /**
   * Retrieves and normalizes the text content of a specified selector.
   * @param selector - The CSS selector for the element to retrieve text from.
   * @returns The normalized text content of the element or null if the element doesn't exist.
   */
  async getTextNormalized(selector: string): Promise<string | null> {
    const text = await this.getText(selector); // Get the raw text
    return text ? normalizeText(text) : null; // Return normalized text if available
  }

  /**
   * Retrieves the error message or any other message and returns the normalized text.
   * @param selector - The CSS selector for the element containing the error message.
   * @returns The normalized error message or null if no message is found.
   */
  async getErrorMessage(selector: string): Promise<string | null> {
    return await this.getTextNormalized(selector); // Use the getTextNormalized method to fetch and normalize the error message
  }

  /**
   * Scrolls an element into view and then scrolls down an additional 100px to ensure element is fully visible in smaller viewports
   * @param element - The locator element to scroll into view
   * @param pageInstance - The page instance to perform the scroll on
   */
  async scrollIntoViewWithExtra(element: Locator, pageInstance: Page): Promise<void> {
    await element.scrollIntoViewIfNeeded();
    // Scroll down an additional 100px to ensure element is fully visible in smaller viewports
    await pageInstance.evaluate(() => {
      window.scrollBy(0, 100);
    });
    await pageInstance.waitForTimeout(200); // Small delay for scroll to complete
  }

  /**
   * Waits for element, scrolls into view, highlights it, and optionally waits
   * Combines common UI interaction patterns into a single method
   * @param locator - The locator to interact with
   * @param options - Optional configuration
   * @param options.timeout - Timeout for wait operations (default: 10000)
   * @param options.highlight - Whether to highlight the element (default: true)
   * @param options.highlightColor - Highlight background color (default: 'yellow')
   * @param options.highlightBorder - Highlight border style (default: '2px solid red')
   * @param options.highlightTextColor - Highlight text color (default: 'blue')
   * @param options.waitAfter - Milliseconds to wait after highlighting (default: 500)
   * @param options.scrollExtra - Whether to use scrollIntoViewWithExtra (default: false)
   */
  async waitAndHighlight(
    locator: Locator,
    options?: {
      timeout?: number;
      highlight?: boolean;
      highlightColor?: string;
      highlightBorder?: string;
      highlightTextColor?: string;
      waitAfter?: number;
      scrollExtra?: boolean;
    },
  ): Promise<void> {
    const timeout = options?.timeout ?? 10000;
    const shouldHighlight = options?.highlight ?? true;
    const waitAfter = options?.waitAfter ?? 500;
    const scrollExtra = options?.scrollExtra ?? false;

    await locator.waitFor({ state: 'visible', timeout });

    if (scrollExtra) {
      await this.scrollIntoViewWithExtra(locator, this.page);
    } else {
      await locator.scrollIntoViewIfNeeded();
    }

    if (shouldHighlight) {
      await this.highlightElement(locator, {
        backgroundColor: options?.highlightColor ?? 'yellow',
        border: options?.highlightBorder ?? '2px solid red',
        color: options?.highlightTextColor ?? 'blue',
      });
    }

    if (waitAfter > 0) {
      await this.page.waitForTimeout(waitAfter);
    }
  }

  /**
   * Highlights an element with custom styles
   * @param element - The locator to highlight
   * @param customStyles - Optional custom highlight styles
   */
  async highlightElement(
    element: Locator,
    customStyles?: {
      backgroundColor?: string;
      border?: string;
      color?: string;
      outline?: string;
      boxShadow?: string;
      zIndex?: string;
      transition?: string;
    },
  ): Promise<void> {
    await element.evaluate(
      (
        el: HTMLElement,
        styles: {
          backgroundColor?: string;
          border?: string;
          color?: string;
          outline?: string;
          boxShadow?: string;
          zIndex?: string;
          transition?: string;
        },
      ) => {
        el.style.backgroundColor = styles?.backgroundColor || 'green';
        el.style.border = styles?.border || '2px solid red';
        el.style.color = styles?.color || 'blue';
        el.style.outline = styles?.outline || '3px solid magenta';
        el.style.boxShadow = styles?.boxShadow || '0 0 0 4px rgba(255, 0, 255, 0.4)';
        el.style.zIndex = styles?.zIndex || '2147483647';
        el.style.transition = styles?.transition || 'none';
      },
      customStyles || {},
    );
  }

  /**
   * Locates an element by data-testid, highlights it, and waits for it to be visible.
   * @param dataTestId - The data-testid to locate
   * @param timeout - Optional timeout for waiting (default: 30000)
   * @returns The located element
   */
  async locateAndHighlightElement(dataTestId: string, timeout: number = 30000): Promise<Locator> {
    const element = this.page.locator(`[data-testid="${dataTestId}"]`);
    await element.waitFor({ state: 'visible', timeout });
    await this.highlightElement(element);
    return element;
  }

  /**
   * Clicks a button by text and locator
   * @param textButton - The button text to match
   * @param locator - The locator for the button
   * @param click - Whether to actually click (Click.Yes) or just verify (Click.No)
   * @param options - Optional: waitForEnabled (wait for button to be enabled before clicking), enabledTimeout (ms)
   */
  async clickButton(
    textButton: string,
    locator: string,
    click: Click = Click.Yes,
    options?: { waitForEnabled?: boolean; enabledTimeout?: number },
  ) {
    const button = this.page.locator(locator, { hasText: textButton });
    await button.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.highlightElement(button, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(TIMEOUTS.STANDARD);
    await expect(button).toHaveText(textButton);
    await expect(button).toBeVisible();

    if (click === Click.Yes) {
      if (options?.waitForEnabled) {
        const timeout = options.enabledTimeout ?? WAIT_TIMEOUTS.PAGE_RELOAD;
        await expect(button).toBeEnabled({ timeout });
      }
      try {
        await button.click();
      } catch {
        logger.warn(`Button "${textButton}" not clickable (e.g. disabled), trying force click.`);
        try {
          await button.click({ force: true, timeout: WAIT_TIMEOUTS.SHORT });
        } catch {
          logger.warn(`Force click skipped for "${textButton}". Step continues without clicking.`);
        }
      }
    }
  }

  /**
   * Fill input and wait for value to be set
   * @param inputLocator - The input locator
   * @param value - Value to fill
   * @param timeout - Timeout for waiting (default: TIMEOUTS.MEDIUM)
   */
  async fillInputAndWaitForValue(inputLocator: Locator, value: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    await inputLocator.fill(value);
    // For search inputs, just wait a brief moment for the value to be set
    // The actual search will be validated by waiting for network idle and table results
    await inputLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.VERY_SHORT });
  }

  /**
   * Fill input with retries - attempts to fill input multiple times until value matches
   * @param input - The input locator
   * @param value - Value to fill
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @returns The final value in the input
   */
  async fillInputWithRetries(input: Locator, value: string, maxAttempts = 3): Promise<string> {
    await input.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    let currentValue = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await input.fill('');
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      await input.fill(value);
      await this.page.waitForTimeout(TIMEOUTS.SHORT);
      currentValue = (await input.inputValue())?.trim() || '';
      if (currentValue === value) {
        break;
      }
      console.warn(`Input mismatch on attempt ${attempt}. Expected "${value}", got "${currentValue}". Retrying...`);
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    }

    return currentValue;
  }

  /**
   * Helper function to find the actual search input element (handles wrapper vs direct input)
   * @param page - Playwright Page object
   * @param searchInputSelector - Selector for the search input wrapper
   * @param timeout - Timeout for waiting (default: WAIT_TIMEOUTS.STANDARD)
   * @returns The actual input locator to use
   */
  async findSearchInput(page: Page, searchInputSelector: string, timeout: number = WAIT_TIMEOUTS.STANDARD): Promise<Locator> {
    const searchInputWrapper = page.locator(searchInputSelector).first();
    await searchInputWrapper.waitFor({ state: 'visible', timeout });
    await searchInputWrapper.scrollIntoViewIfNeeded();

    // Check if wrapper itself is an input
    const tagName = await searchInputWrapper.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
    if (tagName === 'input') {
      await searchInputWrapper.waitFor({ state: 'visible', timeout });
      return searchInputWrapper;
    }

    // Try to find input within wrapper
    const input = searchInputWrapper.locator('input').first();
    try {
      await input.waitFor({ state: 'visible', timeout: Math.min(timeout, 5000) });
      return input;
    } catch (e) {
      // If input not found, return wrapper (might be a contenteditable div or similar)
      logger.warn(`Input not found within wrapper "${searchInputSelector}", using wrapper as input`);
      return searchInputWrapper;
    }
  }

  /** Wait for selector to become visible. */
  async waitForSelector(selector: string): Promise<void> {
    logger.info(`Waiting for selector: ${selector}`);
    await this.page.waitForSelector(selector, { state: 'visible' });
    logger.info(`Selector is visible: ${selector}`);
  }

  /** Read tooltip text by hovering over element. */
  async readTooltip(hoverSelector: string, tooltipSelector: string): Promise<string | null> {
    await this.page.hover(hoverSelector);
    await this.page.waitForSelector(tooltipSelector);
    const tooltipText = await this.page.locator(tooltipSelector).textContent();
    return tooltipText;
  }
}
