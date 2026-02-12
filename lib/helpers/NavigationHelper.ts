/**
 * @file NavigationHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for navigation and page management operations extracted from Page.ts
 * 
 * This helper handles:
 * - Page navigation (goto, nav, navigateToPage)
 * - URL and page validation (checkUrl, checkTitle, checkLanguage, checkBreadCrumb)
 * - Network state management (waitForNetworkIdle)
 * - Tab management (createNewTabAndNavigate)
 */

import { Page } from '@playwright/test';
import { ENV } from '../../config';
import { PageObject } from '../Page';
import logger from '../logger';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Opens the specified URL or the default base URL if none is provided.
   * @param url - The URL to navigate to. Defaults to BASE_URL from ENV if not provided.
   */
  async goto(url: string = ENV.BASE_URL): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' }); // Navigate to the provided URL and wait until the DOM content is loaded
  }

  /**
   * Waits for the network to be idle (no network requests for at least 500ms).
   * This is a common pattern used across many test cases to ensure page stability after actions.
   * @param timeout - Optional timeout in milliseconds (default: 30000)
   */
  async waitForNetworkIdle(timeout?: number): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Navigates to a page, finds a table element, waits for network idle, and waits for the table body to load.
   * This is a common pattern used across many test cases.
   * Note: This method will be updated when TableHelper is created to use table methods from there.
   * @param url - The URL to navigate to
   * @param tableSelector - The selector for the table element to find and click
   * @param tableBodySelector - The selector for the table body to wait for
   * @param options - Optional configuration for waiting table body (minRows, timeoutMs)
   * @param findTable - Function to find table (will be from TableHelper when created)
   * @param waitingTableBody - Function to wait for table body (will be from TableHelper when created)
   */
  async navigateToPageAndWaitForTable(
    url: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: { minRows?: number; timeoutMs?: number },
    findTable?: (selector: string) => Promise<void>,
    waitingTableBody?: (selector: string, options?: { minRows?: number; timeoutMs?: number }) => Promise<void | { success: boolean }>,
  ): Promise<void> {
    await this.goto(url);
    if (findTable) {
      await findTable(tableSelector);
    }
    await this.page.waitForLoadState('networkidle');
    if (waitingTableBody) {
      await waitingTableBody(tableBodySelector, options);
    }
  }

  /**
   * Navigates to a page and validates the presence of an element
   * @param url - The URL to navigate to
   * @param dataTestId - The data-testid of the element to validate
   */
  async navigateToPage(url: string, dataTestId: string): Promise<void> {
    console.log(`Navigating to ${url}`);
    console.log(`PageTitleId to ${dataTestId}`);

    try {
      await this.page.goto(url);
    } catch (navigationError) {
      // Handle navigation interruption
      if (navigationError instanceof Error && navigationError.message.includes('interrupted')) {
        console.log(`Navigation to ${url} was interrupted, waiting for page to stabilize...`);
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForTimeout(2000);
      } else {
        throw navigationError;
      }
    }

    await this.page.waitForTimeout(500);
    await this.page.waitForLoadState('networkidle');

    // Validate the presence of an element using data-testid (accept either raw id or full selector)
    let selector = dataTestId;
    const match = dataTestId.match(/data-testid\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      selector = `[data-testid="${match[1]}"]`;
    } else if (!dataTestId.includes('data-testid')) {
      selector = `[data-testid="${dataTestId}"]`;
    }
    const locator = this.page.locator(selector);
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const isVisible = await locator.isVisible();
    if (!isVisible) {
      throw new Error(`Element with data-testid "${dataTestId}" is not visible after navigation`);
    }
  }

  /**
   * Navigates by clicking an element with the specified data-testid
   * @param dataTestId - The data-testid of the element to click
   * @returns True if navigation succeeded, or an error message if it failed
   */
  async nav(dataTestId: string): Promise<true | string> {
    try {
      const elementHandles = await this.page.$$(`[data-testid="${dataTestId}"]`);
      // Check if elementHandle is not null
      if (!elementHandles) {
        return `Element with data-testid="${dataTestId}" not found`;
      }

      const elementCount = elementHandles.length;
      //logger.info(dataTestId);
      if (elementCount === 0) {
        const errorMessage = `Navigation failed: Element with data-testid "${dataTestId}" not found.`;
        logger.error(errorMessage);
        return errorMessage;
      }

      if (elementCount > 1) {
        const errorMessage = `Navigation failed: Multiple elements with data-testid "${dataTestId}" found. Expected only one.`;
        logger.error(errorMessage);
        return errorMessage;
      }

      await elementHandles[0].click();
      await this.page.waitForLoadState('load');
      const pageUrl = this.page.url();
      const pageTitle = await this.page.title();
      const pageBreadcrumb = await this.page.innerText('.breadcrumb');

      logger.info(`Navigated to: ${pageUrl}`);
      logger.info(`Page Title: ${pageTitle}`);
      logger.info(`Breadcrumb: ${pageBreadcrumb}`);
      return true;
    } catch (error) {
      let errorMessage: string;

      if (error instanceof Error) {
        errorMessage = `Navigation failed: ${error.message}`;
      } else {
        errorMessage = 'Navigation failed: An unknown error occurred';
      }

      logger.error(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Check if the current URL path matches the expected path.
   * @param expectedPath - The expected URL path to compare.
   * @returns True if the URL path matches, or an error message if it does not.
   */
  async checkUrl(expectedPath: string): Promise<true | string> {
    try {
      const actualURL = new URL(this.page.url());
      const actualPath = actualURL.pathname;
      if (actualPath !== expectedPath) {
        const errorMessage = `URL path does not match. Expected: ${expectedPath}, Actual: ${actualPath}`;
        logger.error(errorMessage);
        return errorMessage;
      }
      logger.info(`URL path verification passed: ${actualPath}`);
      return true;
    } catch (error) {
      let errorMessage: string;

      if (error instanceof Error) {
        errorMessage = `URL path verification failed: ${error.message}`;
      } else {
        errorMessage = 'URL path verification failed: An unknown error occurred';
      }

      logger.error(errorMessage);
      return errorMessage;
    }
  }

  /**
   * Check if the current page title matches the expected title.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param expectedTitle - The expected page title to compare.
   * @throws Error if the actual title does not match the expected title.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async checkTitle(expectedTitle: string): Promise<void> {
    const actualTitle = await this.page.title();
    if (actualTitle !== expectedTitle) {
      throw new Error(`Title does not match. Expected: ${expectedTitle}, Actual: ${actualTitle}`);
    }
    logger.info(`Title verification passed: ${actualTitle}`);
  }

  /**
   * Check if the current page language matches the expected language.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param expectedLanguage - The expected language to compare.
   * @throws Error if the actual language does not match the expected language or if the language element is not found.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async checkLanguage(expectedLanguage: string): Promise<void> {
    const languageElement = await this.page.$('selector-for-language-element');
    if (!languageElement) {
      throw new Error('Language element not found on the page');
    }
    const actualLanguage = await languageElement.textContent();
    if (actualLanguage !== expectedLanguage) {
      throw new Error(`Language does not match. Expected: ${expectedLanguage}, Actual: ${actualLanguage}`);
    }
    logger.info(`Language verification passed: ${actualLanguage}`);
  }

  /**
   * Check if the current page breadcrumb matches the expected breadcrumb.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param expectedBreadcrumb - The expected breadcrumb text to compare.
   * @throws Error if the actual breadcrumb does not match the expected breadcrumb or if the breadcrumb element is not found.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async checkBreadCrumb(expectedBreadcrumb: string): Promise<void> {
    const breadcrumbElement = await this.page.$('.breadcrumb');
    if (!breadcrumbElement) {
      throw new Error('Breadcrumb element not found on the page');
    }
    const actualBreadcrumb = await breadcrumbElement.textContent();
    if (actualBreadcrumb !== expectedBreadcrumb) {
      throw new Error(`Breadcrumb does not match. Expected: ${expectedBreadcrumb}, Actual: ${actualBreadcrumb}`);
    }
    logger.info(`Breadcrumb verification passed: ${actualBreadcrumb}`);
  }

  /**
   * Creates a new tab, navigates to the specified URL, and returns both the page and a new PageObject instance
   * @param url - The URL to navigate to in the new tab
   * @param PageObjectClass - The PageObject class constructor to instantiate (e.g., CreateLoadingTaskPage)
   * @returns An object containing the new page and page object instance
   */
  async createNewTabAndNavigate<T extends PageObject>(url: string, PageObjectClass: new (page: Page) => T): Promise<{ page: Page; pageObject: T }> {
    const context = this.page.context();
    const newPage = await context.newPage();
    const pageObject = new PageObjectClass(newPage);
    await pageObject.goto(url);
    await pageObject.waitForNetworkIdle();
    await newPage.waitForTimeout(1000);
    return { page: newPage, pageObject };
  }
}
