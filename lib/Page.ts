/**
 * @file Page.ts
 * @date 2025-01-20
 * @purpose To handle common actions and utilities across all pages, including interacting with input fields, buttons, and handling errors.
 *
 * @alterations
 * - 2025-01-20: Initial version of the PageObject class to handle reusable page interactions.
 * - 2025-01-20: Added logging, text normalization, and error message handling methods.
 */

import { Page, expect, Locator, ElementHandle, TestInfo } from '@playwright/test'; // Import Playwright's Page class
import { AbstractPage } from './AbstractPage'; // Import the base AbstractPage class
import { ENV } from '../config'; // Import environment and selector configurations
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote'; // Import Modal Window Consignment Note selectors
import * as SelectorsStartProduction from '../lib/Constants/SelectorsStartProduction'; // Import Start Production selectors
import * as SelectorsNotifications from '../lib/Constants/SelectorsNotifications'; // Import Notifications selectors
import * as SelectorsSearchInputs from '../lib/Constants/SelectorsSearchInputs'; // Import Search Inputs selectors
import * as SelectorsFileComponents from '../lib/Constants/SelectorsFileComponents'; // Import File Components selectors
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers'; // Import Ordered From Suppliers selectors
import { Input } from './Input'; // Import the Input helper class for handling input fields
import { Button } from './Button'; // Import the Button helper class for handling button clicks
import logger from './logger'; // Import logger utility for logging messages
import { allure } from 'allure-playwright';
import { TIMEOUTS, WAIT_TIMEOUTS } from './Constants/TimeoutConstants'; // Import timeout constants
import { expectSoftWithScreenshot, normalizeText, normalizeOrderNumber, normalizeDate, extractIdFromSelector, arraysAreIdentical, countColumns, extractDataSpetification, ISpetificationData } from './utils/utilities'; // Import utility functions
import { ElementHelper } from './helpers/ElementHelper'; // Import ElementHelper for element interaction operations
import { NavigationHelper } from './helpers/NavigationHelper'; // Import NavigationHelper for navigation operations
import { ModalHelper } from './helpers/ModalHelper'; // Import ModalHelper for modal operations
import { ValidationHelper } from './helpers/ValidationHelper'; // Import ValidationHelper for validation operations
import { ArchiveHelper } from './helpers/ArchiveHelper'; // Import ArchiveHelper for archive operations
import { OrderHelper } from './helpers/OrderHelper'; // Import OrderHelper for order operations
import { RowCellHelper } from './helpers/RowCellHelper'; // Import RowCellHelper for row/cell operations
import { NotificationHelper } from './helpers/NotificationHelper'; // Import NotificationHelper for notification operations
import { LoginHelper } from './helpers/LoginHelper'; // Import LoginHelper for login operations
import { MiscHelper } from './helpers/MiscHelper'; // Import MiscHelper for miscellaneous operations
import { TableHelper, type ValidationResult } from './helpers/TableHelper'; // Import TableHelper for table operations
// Re-export utilities for backward compatibility
export { expectSoftWithScreenshot, populateTestData, normalizeText, normalizeOrderNumber, normalizeDate, extractIdFromSelector, arraysAreIdentical, countColumns, extractDataSpetification, ISpetificationData } from './utils/utilities';
// Re-export ValidationResult from TableHelper
export type { ValidationResult } from './helpers/TableHelper';

/**
 * PageObject class that provides common page actions, such as interacting with inputs, buttons, and retrieving text.
 * Inherits from the AbstractPage class for basic page handling functionality.
 */
export class PageObject extends AbstractPage {
  protected button: Button; // Button helper instance
  protected input: Input; // Input helper instance
  protected elementHelper: ElementHelper; // Element interaction helper instance
  protected navigationHelper: NavigationHelper; // Navigation helper instance
  protected tableHelper: TableHelper; // Table operations helper instance
  protected modalHelper: ModalHelper; // Modal operations helper instance
  protected validationHelper: ValidationHelper; // Validation operations helper instance
  protected archiveHelper: ArchiveHelper; // Archive operations helper instance
  protected orderHelper: OrderHelper; // Order operations helper instance
  protected rowCellHelper: RowCellHelper; // Row/cell operations helper instance
  protected notificationHelper: NotificationHelper; // Notification operations helper instance
  protected loginHelper: LoginHelper; // Login operations helper instance
  protected miscHelper: MiscHelper; // Miscellaneous operations helper instance

  constructor(page: Page) {
    super(page); // Initialize the base AbstractPage with the page object
    this.button = new Button(page); // Initialize the button helper
    this.input = new Input(page); // Initialize the input helper
    this.elementHelper = new ElementHelper(page); // Initialize the element helper
    this.navigationHelper = new NavigationHelper(page); // Initialize the navigation helper
    this.tableHelper = new TableHelper(page); // Initialize the table helper
    this.modalHelper = new ModalHelper(page); // Initialize the modal helper
    this.validationHelper = new ValidationHelper(page); // Initialize the validation helper
    this.archiveHelper = new ArchiveHelper(page); // Initialize the archive helper
    this.orderHelper = new OrderHelper(page); // Initialize the order helper
    this.rowCellHelper = new RowCellHelper(page); // Initialize the row/cell helper
    this.notificationHelper = new NotificationHelper(page); // Initialize the notification helper
    this.loginHelper = new LoginHelper(page); // Initialize the login helper
    this.miscHelper = new MiscHelper(page); // Initialize the misc helper
  }

  /**
   * Scans and validates the structure of tables within a specified element, and identifies rows with duplicate data-testids and cells missing data-testids.
   * @param page - The Playwright page instance.
   * @param dataTestId - The data-testid of the container element.
   * @returns A promise that resolves once the validation is complete.
   * @throws An error if any validation check fails.
   */
  async scanTablesWithinElement(page: Page, dataTestId: string): Promise<ValidationResult> {
    return this.tableHelper.scanTablesWithinElement(page, dataTestId);
  }

  /**
   * Finds an element with the specified partial data-testid and clicks on it.
   * If not found, it tries to find an element with the same value as id and clicks on it.
   * @param page - The Playwright page instance.
   * @param partialDataTestId - The partial data-testid of the elements to search for.
   * @param waitTime - The amount of time to wait after clicking, in milliseconds.
   * @returns A promise that resolves once the element is clicked and the wait time has elapsed.
   */
  /**
   * Finds and clicks an element by partial data-testid, with fallback strategies
   * @param page - The Playwright page instance
   * @param partialDataTestId - The partial data-testid or full selector
   * @param waitTime - Time to wait after clicking (default: 10000)
   * @param doubleClick - Whether to double-click instead of single-click
   */
  async findAndClickElement(page: Page, partialDataTestId: string, waitTime: number = 10000, doubleClick?: boolean): Promise<void> {
    return this.elementHelper.findAndClickElement(page, partialDataTestId, waitTime, doubleClick);
  }

  /**
   * Gets the text content of a specified selector.
   * @param selector - The CSS selector for the element to retrieve text from.
   * @returns The text content of the element or null if the element doesn't exist.
   */
  async getText(selector: string): Promise<string | null> {
    return this.elementHelper.getText(selector);
  }

  /**
   * Retrieves and normalizes the text content of a specified selector.
   * @param selector - The CSS selector for the element to retrieve text from.
   * @returns The normalized text content of the element or null if the element doesn't exist.
   */
  async getTextNormalized(selector: string): Promise<string | null> {
    return this.elementHelper.getTextNormalized(selector);
  }

  /**
   * Retrieves the error message or any other message and returns the normalized text.
   * @param selector - The CSS selector for the element containing the error message.
   * @returns The normalized error message or null if no message is found.
   */
  async getErrorMessage(selector: string): Promise<string | null> {
    return this.elementHelper.getErrorMessage(selector);
  }

  /**
   * Scrolls an element into view and then scrolls down an additional 100px to ensure element is fully visible in smaller viewports
   * @param element - The locator element to scroll into view
   * @param pageInstance - The page instance to perform the scroll on
   */
  async scrollIntoViewWithExtra(element: Locator, pageInstance: Page): Promise<void> {
    return this.elementHelper.scrollIntoViewWithExtra(element, pageInstance);
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
    return this.elementHelper.waitAndHighlight(locator, options);
  }

  /**
   * Creates a new tab, navigates to the specified URL, and returns both the page and a new PageObject instance
   * @param url - The URL to navigate to in the new tab
   * @param PageObjectClass - The PageObject class constructor to instantiate (e.g., CreateLoadingTaskPage)
   * @returns An object containing the new page and page object instance
   */
  async createNewTabAndNavigate<T extends PageObject>(url: string, PageObjectClass: new (page: Page) => T): Promise<{ page: Page; pageObject: T }> {
    return this.navigationHelper.createNewTabAndNavigate(url, PageObjectClass);
  }

  /**
   * Opens the specified URL or the default base URL if none is provided.
   * @param url - The URL to navigate to. Defaults to BASE_URL from ENV if not provided.
   */
  async goto(url: string = ENV.BASE_URL): Promise<void> {
    return this.navigationHelper.goto(url);
  }

  /**
   * Waits for the network to be idle (no network requests for at least 500ms).
   * This is a common pattern used across many test cases to ensure page stability after actions.
   * @param timeout - Optional timeout in milliseconds (default: 30000)
   */
  async waitForNetworkIdle(timeout?: number): Promise<void> {
    return this.navigationHelper.waitForNetworkIdle(timeout);
  }

  /**
   * Navigates to a page, finds a table element, waits for network idle, and waits for the table body to load.
   * This is a common pattern used across many test cases.
   * @param url - The URL to navigate to
   * @param tableSelector - The selector for the table element to find and click
   * @param tableBodySelector - The selector for the table body to wait for
   * @param options - Optional configuration for waiting table body (minRows, timeoutMs)
   */
  async navigateToPageAndWaitForTable(
    url: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: { minRows?: number; timeoutMs?: number },
  ): Promise<void> {
    return this.navigationHelper.navigateToPageAndWaitForTable(
      url,
      tableSelector,
      tableBodySelector,
      options,
      this.tableHelper.findTable.bind(this.tableHelper),
      async (selector: string, opts?: { minRows?: number; timeoutMs?: number }) => {
        await this.tableHelper.waitingTableBody(selector, opts);
      },
    );
  }

  /**
   * Searches a table and waits for the table body to load.
   * This is a common pattern used across many test cases.
   * @param searchTerm - The search term to enter
   * @param tableSelector - The selector for the table to search in
   * @param tableBodySelector - The selector for the table body to wait for
   * @param options - Optional configuration:
   *   - useRedesign: If true, uses searchTableRedesign instead of searchTable (default: false)
   *   - searchInputDataTestId: Optional data-testid for the search input (for searchTable method)
   *   - timeoutBeforeWait: Optional timeout in ms before waiting for table body
   *   - minRows: Minimum number of rows to wait for
   *   - timeoutMs: Timeout in ms for waiting table body
   */
  async searchAndWaitForTable(
    searchTerm: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: {
      useRedesign?: boolean;
      searchInputDataTestId?: string;
      timeoutBeforeWait?: number;
      minRows?: number;
      timeoutMs?: number;
    },
  ): Promise<void> {
    if (options?.useRedesign) {
      await this.tableHelper.searchTableRedesign(searchTerm, tableSelector);
      await this.page.waitForLoadState('networkidle');
    } else {
      await this.tableHelper.searchTable(searchTerm, tableSelector, options?.searchInputDataTestId);
      // searchTable already includes waitForLoadState('networkidle')
    }

    if (options?.timeoutBeforeWait) {
      await this.page.waitForTimeout(options.timeoutBeforeWait);
    }

    // Only wait for table body if minRows is explicitly provided
    if (options?.minRows !== undefined) {
      await this.tableHelper.waitingTableBody(tableBodySelector, {
        minRows: options.minRows,
        timeoutMs: options?.timeoutMs,
      });
    }
  }

  /**
   * Validates page headings (H3 titles) and buttons on a page.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param titles - Array of expected H3 titles (will be trimmed)
   * @param buttons - Array of button configurations to validate
   * @param className - CSS class name to search for H3 titles (default: 'container')
   * @param options - Optional configuration:
   *   - skipTitleValidation: If true, skips H3 title validation
   *   - skipButtonValidation: If true, skips button validation
   */
  async validatePageHeadersAndButtons(
    page: Page,
    titles: string[],
    buttons: Array<{
      class?: string;
      datatestid?: string;
      label: string;
      state?: string | boolean;
    }>,
    containerSelector: string,
    options?: {
      skipTitleValidation?: boolean;
      skipButtonValidation?: boolean;
      useModalMethod?: boolean;
      testInfo?: TestInfo;
    },
  ): Promise<void> {
    return this.validationHelper.validatePageHeadersAndButtons(page, titles, buttons, containerSelector, options);
  }

  /**
   * Searches for a term in a table and verifies that the first row contains the search term.
   * This is a common pattern used across many test cases.
   * @param searchTerm - The term to search for
   * @param tableSelector - Selector for the table element
   * @param tableBodySelector - Selector for the table body element
   * @param options - Optional configuration:
   *   - useRedesign: If true, uses searchTableRedesign instead of searchTable
   *   - searchInputDataTestId: Data test ID for the search input (when not using redesign)
   *   - timeoutBeforeWait: Timeout in ms before waiting for table body
   *   - minRows: Minimum number of rows expected in the table
   *   - timeoutMs: Timeout in ms for waiting for table body
   */
  async searchAndVerifyFirstRow(
    searchTerm: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: {
      useRedesign?: boolean;
      searchInputDataTestId?: string;
      timeoutBeforeWait?: number;
      minRows?: number;
      timeoutMs?: number;
    },
  ): Promise<void> {
    return this.validationHelper.searchAndVerifyFirstRow(this, searchTerm, tableSelector, tableBodySelector, options);
  }

  /**
   * Archives an item by selecting the first row and clicking archive/confirm buttons.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param searchTerm - The term to verify is in the first row (optional, for validation)
   * @param tableSelector - Selector for the table element
   * @param archiveButtonSelector - Selector or label for the archive button
   * @param confirmButtonSelector - Selector or label for the confirm button
   * @param options - Optional configuration:
   *   - useCheckboxMark: If true, uses checkboxMarkNameInLineFromFirstRow instead of checkNameInLineFromFirstRow
   *   - headerCellIndex: If provided, clicks on table header cell before archive button
   *   - archiveButtonLabel: Label text for archive button (default: 'Архив')
   *   - confirmButtonLabel: Label text for confirm button (default: 'Да')
   *   - waitAfterConfirm: Timeout in ms after confirmation (default: 1000)
   */
  async archiveItem(
    page: Page,
    searchTerm: string,
    tableSelector: string,
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    options?: {
      useCheckboxMark?: boolean;
      headerCellIndex?: number;
      archiveButtonLabel?: string;
      confirmButtonLabel?: string;
      waitAfterConfirm?: number;
      verifyArchived?: boolean;
      verifyTableSelector?: string;
      tableBodySelector?: string;
      searchInputDataTestId?: string;
    },
  ): Promise<void> {
    return this.archiveHelper.archiveItem(this, page, searchTerm, tableSelector, archiveButtonSelector, confirmButtonSelector, options);
  }

  /**
   * Performs a simple archive operation: clicks the archive button and confirms.
   * This is a common pattern used across many test cases.
   * @param archiveButtonSelector - Selector for the archive button
   * @param confirmButtonSelector - Selector for the confirmation button
   * @param options - Optional configuration:
   *   - archiveButtonLabel: Label for the archive button (default: 'Архив')
   *   - confirmButtonLabel: Label for the confirm button (default: 'Да')
   *   - waitAfterConfirm: Timeout in ms after confirmation (default: 1000)
   */
  async archiveAndConfirm(
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    options?: {
      archiveButtonLabel?: string;
      confirmButtonLabel?: string;
      waitAfterConfirm?: number;
    },
  ): Promise<void> {
    return this.archiveHelper.archiveAndConfirm(this, archiveButtonSelector, confirmButtonSelector, options);
  }

  /**
   * Waits for network idle, optionally waits for a timeout, then checks that the first row contains the search term.
   * This is a common pattern used across many test cases.
   * @param page - The Playwright page instance
   * @param searchTerm - The term to verify is in the first row
   * @param tableSelector - Selector for the table element
   * @param options - Optional configuration:
   *   - timeoutMs: Timeout in ms after network idle (default: 0, no timeout)
   *   - waitForNetworkIdle: If true, waits for networkidle (default: true)
   */
  async waitAndCheckFirstRow(
    page: Page,
    searchTerm: string,
    tableSelector: string,
    options?: {
      timeoutMs?: number;
      waitForNetworkIdle?: boolean;
      testInfo?: TestInfo;
      description?: string;
    },
  ): Promise<void> {
    return this.validationHelper.waitAndCheckFirstRow(this, page, searchTerm, tableSelector, options);
  }

  /**
   * Pauses the test execution for a specified amount of time (in milliseconds).
   * @param ms - The duration in milliseconds to pause the execution. Defaults to 1000ms.
   */
  async waitForTimeout(ms: number = 1000): Promise<void> {
    if (ENV.DEBUG) {
      logger.info(`Page Class: Pausing for ${ms} milliseconds...`); // Log the pause action for debugging purposes
    }
    await this.page.waitForTimeout(ms); // Wait for the specified timeout duration
    if (ENV.DEBUG) {
      logger.info('Page Class: Pause complete'); // Log after the pause is complete
    }
  }

  /**
   * Fill in the login form.
   * @param page - The Playwright page instance.
   * @param tabel - The table value.
   * @param login - The login username.
   * @param password - The login password.
   */

  async fillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    return this.loginHelper.fillLoginForm(page, tabel, login, password);
  }

  async newFillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    return this.loginHelper.newFillLoginForm(page, tabel, login, password);
  }

  /**
   * Hover over an element and read the tooltip text.
   * @param hoverSelector - The selector for the element to hover over.
   * @param tooltipSelector - The selector for the tooltip element.
   * @returns The text content of the tooltip, or null if not found.
   */

  /**
   * Reads tooltip text by hovering over an element and reading the tooltip.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param hoverSelector - The selector for the element to hover over.
   * @param tooltipSelector - The selector for the tooltip element.
   * @returns The tooltip text or null if not found.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async readTooltip(hoverSelector: string, tooltipSelector: string): Promise<string | null> {
    await this.page.hover(hoverSelector);
    await this.page.waitForSelector(tooltipSelector);
    const tooltipText = await this.page.locator(tooltipSelector).textContent();
    return tooltipText;
  }

  /**
   * Navigate to the element with the specified data-testid and log the details.
   * @param dataTestId - The data-testid of the element to navigate to.
   * @returns True if navigation is successful, or an error message if it fails.
   */

  /**
   * Navigates by clicking an element with the specified data-testid
   * @param dataTestId - The data-testid of the element to click
   * @returns True if navigation succeeded, or an error message if it failed
   */
  async nav(dataTestId: string): Promise<true | string> {
    return this.navigationHelper.nav(dataTestId);
  }

  /**
   * Check if the current URL path matches the expected path.
   * @param expectedPath - The expected URL path to compare.
   * @returns True if the URL path matches, or an error message if it does not.
   */
  async checkUrl(expectedPath: string): Promise<true | string> {
    return this.navigationHelper.checkUrl(expectedPath);
  }

  /**
   * Check if the current page title matches the expected title.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param expectedTitle - The expected page title to compare.
   * @throws Error if the actual title does not match the expected title.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async checkTitle(expectedTitle: string): Promise<void> {
    return this.navigationHelper.checkTitle(expectedTitle);
  }

  /**
   * Check if the current page language matches the expected language.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param expectedLanguage - The expected language to compare.
   * @throws Error if the actual language does not match the expected language or if the language element is not found.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async checkLanguage(expectedLanguage: string): Promise<void> {
    return this.navigationHelper.checkLanguage(expectedLanguage);
  }

  /**
   * Check if the current breadcrumb matches the expected breadcrumb.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param expectedBreadcrumb - The expected breadcrumb to compare.
   * @throws Error if the actual breadcrumb does not match the expected breadcrumb.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async checkBreadCrumb(expectedBreadcrumb: string): Promise<void> {
    return this.navigationHelper.checkBreadCrumb(expectedBreadcrumb);
  }

  /**
   * Capture a screenshot of the current page and save it to the specified file.
   * @param filename - The name of the file to save the screenshot.
   * @returns A promise that resolves when the screenshot is captured and saved.
   */

  /**
   * Captures a screenshot of the current page.
   * @deprecated OBSOLETE - Only used in README.md examples, not in actual test code. Consider removing.
   * @param filename - The filename to save the screenshot as.
   */
  // TODO: OBSOLETE - Remove after confirming no usage (only in README examples)
  async captureScreenshot(filename: string): Promise<void> {
    logger.info(`Capturing screenshot: ${filename}`);
    await this.page.screenshot({ path: filename });
  }

  /**
   * Wait for the specified selector to become visible on the page.
   * @deprecated OBSOLETE - This method is never used in the codebase. Consider removing.
   * @param selector - The selector to wait for.
   * @returns A promise that resolves when the selector is visible.
   */
  // TODO: OBSOLETE - Remove after confirming no usage
  async waitForSelector(selector: string): Promise<void> {
    logger.info(`Waiting for selector: ${selector}`);
    await this.page.waitForSelector(selector, { state: 'visible' });
    logger.info(`Selector is visible: ${selector}`);
  }

  /**
   * Function to check the number of columns in a table with a specific ID.
   * @param page - The Playwright page object.
   * @param tableId - The ID of the table to locate.
   * @returns The column count as a number.
   */
  async checkTableColumns(page: Page, tableId: string, skip?: boolean): Promise<number> {
    return this.tableHelper.checkTableColumns(page, tableId, skip);
  }

  /**
   * Check if the table column headers match the expected headers.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param expectedHeaders - The expected headers to compare.
   * @returns A promise that resolves to true if the headers match, or throws an error if not.
   */
  async checkTableColumnHeaders(page: Page, tableId: string, expectedHeaders: any, skip?: boolean): Promise<boolean> {
    return this.tableHelper.checkTableColumnHeaders(page, tableId, expectedHeaders, skip);
  }

  /**
   * Find the table element using the specified selector, scroll it into view, and click on it.
   * @param selector - The selector to locate the table element.
   * @returns A promise that resolves when the element is found, scrolled into view, and clicked.
   */
  async findTable(selector: string): Promise<void> {
    return this.tableHelper.findTable(selector);
  }

  /**
   * Find the column index with the specified data-testid in a table and handle header rows merging if necessary.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param colId - The data-testid of the column to find.
   * @returns The index of the column with the specified data-testid, or false if not found.
   */
  async findColumn(page: Page, tableId: string, colId: string): Promise<number> {
    return this.tableHelper.findColumn(page, tableId, colId);
  }

  /**
   * Check the ordering of table rows based on the urgency date and planned shipment date columns.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param urgencyColIndex - The index of the urgency date column.
   * @param plannedShipmentColIndex - The index of the planned shipment date column.
   * @returns An object containing the success status and an optional message if the ordering check fails.
   */
  // async checkTableRowOrdering(
  //   page: Page,
  //   tableId: string,
  //   urgencyColIndex: number,
  //   plannedShipmentColIndex: number
  // ): Promise<{ success: boolean; message?: string }> {
  //   // Get all rows in the table
  //   logger.info(urgencyColIndex);

  //   let table = await page.$(`#${tableId}`);
  //   if (!table) {
  //     table = await page.$(`[data-testid="${tableId}"]`);
  //   }

  //   if (!table) {
  //     return {
  //       success: false,
  //       message: `Table with id "${tableId}" not found`,
  //     };
  //   }

  //   // Get all rows in the table excluding the header rows
  //   const rows = await table.$$("tbody tr");
  //   const headerRows = await table.$$("tbody tr th");
  //   rows.splice(0, headerRows.length); // Remove header rows

  //   // Filter out rows that contain `th` elements
  //   const filteredRows = rows.filter(async (row) => {
  //     const thElements = await row.$$("th");
  //     return thElements.length === 0;
  //   });

  //   // Debug: Log the count of rows found
  //   logger.info(`Total rows found in the table: ${filteredRows.length}`);

  //   // Extract data from rows
  //   const rowData = await Promise.all(
  //     filteredRows.map(async (row) => {
  //       const cells = await row.$$("td");
  //       const urgencyDate =
  //         (await cells[urgencyColIndex]?.innerText()) ?? "";
  //       const plannedShipmentDate =
  //         (await cells[plannedShipmentColIndex]?.innerText()) ?? "";
  //       return { urgencyDate, plannedShipmentDate };
  //     })
  //   );

  //   // Function to parse date strings with various separators
  //   const parseDate = (dateStr: string): Date => {
  //     const parts = dateStr.split(/[.\-\/]/); // Split by dots, hyphens, or slashes
  //     if (parts.length === 3) {
  //       return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // Convert to YYYY-MM-DD
  //     }
  //     return new Date(dateStr); // Fallback to default Date parsing
  //   };

  //   // Sort rows
  //   const compareDates = (a: string, b: string) =>
  //     parseDate(a).getTime() - parseDate(b).getTime();

  //   // Verify row ordering for urgencyDate
  //   let lastUrgencyDateIndex = -1;
  //   for (let i = 0; i < rowData.length; i++) {
  //     if (rowData[i].urgencyDate) {
  //       if (
  //         lastUrgencyDateIndex >= 0 &&
  //         compareDates(
  //           rowData[lastUrgencyDateIndex].urgencyDate,
  //           rowData[i].urgencyDate
  //         ) > 0
  //       ) {
  //         return {
  //           success: false,
  //           message: `Row ordering error in urgencyDate at index ${i}`,
  //         };
  //       }
  //       lastUrgencyDateIndex = i;
  //     } else {
  //       break; // Exit the loop once we encounter a row with an empty urgencyDate
  //     }
  //   }
  // }

  /**
   * Verify the success message contains the specified order number.
   * @param orderNumber - The order number to check within the success message.
   * @returns A promise that resolves when the message is verified.
   */

  async getMessage(orderNumber?: string) {
    return this.notificationHelper.getMessage(orderNumber);
  }

  /**
   * Perform a search in the main table using the specified search term.
   * @param nameSearch - The search term to fill in the search input.
   * @param locator - The selector to locate the table element.
   * @returns A promise that resolves when the search is performed.
   */
  async closeSuccessMessage() {
    return this.notificationHelper.closeSuccessMessage();
  }

  /**
   * Search in the main table
   * @param nameSearch - the name entered in the table search to perform the search
   * @param locator - the full locator of the table
   */
  async searchTable(nameSearch: string, locator: string, searchInputDataTestId?: string) {
    console.log('Search Table', nameSearch, locator, searchInputDataTestId);
    const table = this.page.locator(locator);
    await table.evaluate(el => {
      el.style.backgroundColor = 'green';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    const searchContainer = (
      searchInputDataTestId ? table.locator(`[data-testid="${searchInputDataTestId}"]`) : table.locator(SelectorsSearchInputs.MAIN_SEARCH_COVER_INPUT)
    ).nth(0);

    // Wait for search container to be visible
    await searchContainer.waitFor({ state: 'visible', timeout: 10000 });

    // For dropdown inputs, click the container first to open it
    try {
      await searchContainer.click({ timeout: 2000 });
      await this.page.waitForTimeout(300);
    } catch (e) {
      // Container might already be open, continue
    }

    // Find the input element inside the container (YSearch component)
    // Try both: input inside container, or input with data-testid directly
    let searchTable = searchContainer.locator('input').first();

    // If input is not found/visible in container, try locating it directly
    if (searchInputDataTestId) {
      const directInput = table.locator(`input[data-testid="${searchInputDataTestId}"]`).first();
      try {
        await directInput.waitFor({ state: 'visible', timeout: 2000 });
        searchTable = directInput;
      } catch (e) {
        // Fall back to container approach
      }
    }

    // Wait for the input to be visible or attached
    try {
      await searchTable.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      // If not visible, try attached state (element exists in DOM but might be hidden)
      await searchTable.waitFor({ state: 'attached', timeout: 5000 });
    }

    // Clear and fill without clicking (which can be blocked by dialogs)
    await searchTable.evaluate((el: HTMLInputElement) => (el.value = ''));
    await this.page.waitForTimeout(200);
    await searchTable.fill(nameSearch);
    await this.page.waitForTimeout(300);

    // Verify the value was set before pressing Enter
    const currentValue = await searchTable.inputValue();
    console.log(`Search field value before Enter: "${currentValue}"`);

    // Press Enter to trigger search
    await searchTable.press('Enter');
    await this.page.waitForLoadState('networkidle');

    // Wait a bit more for the search to complete
    await this.page.waitForTimeout(1000);

    // Check the final value
    const finalValue = await searchTable.inputValue();
    console.log(`Search field value after Enter: "${finalValue}"`);

    // Don't assert the value matches exactly, as some search fields clear after search
    // Just verify the search was performed
    console.log(`Search performed for: "${nameSearch}"`);
  }

  /**
   * Search in the main table
   * @param nameSearch - the name entered in the table search to perform the search
   * @param locator - the full locator of the table
   */
  async searchTableRedesign(nameSearch: string, locator: string) {
    const table = this.page.locator(locator);
    // const searchTable = table
    //   .locator('[data-testid="DeficitIzdTable-Search-Dropdown-Input"]')
    //   .nth(0);

    const searchTable = table.locator('.search-yui-kit__input').nth(0);

    // Clear and fill without clicking (which can be blocked by dialogs)
    await searchTable.evaluate((el: HTMLInputElement) => (el.value = ''));
    await this.page.waitForTimeout(200);
    await searchTable.fill(nameSearch);
    await this.page.waitForTimeout(1000); // Wait for fill to complete

    const currentValue = await searchTable.inputValue();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(currentValue).toBe(nameSearch);
      },
      `Verify search input equals "${nameSearch}"`,
      undefined,
    );
    await searchTable.press('Enter');
    await this.page.waitForTimeout(1000); // Wait 1 second after pressing Enter before verifying results
  }

  /**
   * Поиск в основой таблице
   * @param nameSearch - имя которое вводим в поиск таблицы и осуществляем поиск but my clickign search icon
   * @param locator - локатор селектора [data-testid=**]
   */
  async searchTableByIcon(nameSearch: string, locator: string) {
    const table = this.page.locator(locator);
    const searchTable = table.locator(SelectorsSearchInputs.SEARCH_COVER_INPUT).nth(0);
    await searchTable.fill(nameSearch);

    const currentValue = await searchTable.inputValue();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(currentValue).toBe(nameSearch);
      },
      `Verify search input equals "${nameSearch}"`,
      undefined,
    );
    const searchIcon = table.locator('[data-testid="Search-Cover-Icon"]');
    await searchIcon.click();
  }

  /**
   * Wait for the table body to become visible.
   * @param locator - the full locator of the table
   * @returns A promise that resolves when the table body is visible.
   */
  async waitingTableBody(locator: string, { minRows = 1, timeoutMs = 10000 }: { minRows?: number; timeoutMs?: number } = {}) {
    const locatorTable = this.page.locator(locator);
    await locatorTable.evaluate((element: HTMLElement) => {
      element.style.border = '2px solid red';
    });

    if (minRows <= 0) {
      // Just wait for the table to be attached/visible without requiring rows
      await locatorTable.waitFor({ state: 'visible', timeout: timeoutMs });
      return { success: true };
    }

    // Check if the locator is already a tbody selector (contains "Tbody" or "tbody")
    const isTbodySelector = /Tbody|tbody/i.test(locator);
    const rowSelector = isTbodySelector ? `${locator} tr` : `${locator} tbody tr`;

    if (minRows === 1) {
      // Preserve legacy behavior exactly
      await this.page.waitForSelector(rowSelector, {
        state: 'attached',
        timeout: timeoutMs,
      });
    } else {
      // Wait for at least minRows visible rows or timeout
      await this.page.waitForFunction(
        (args: { sel: string; expected: number; isTbody: boolean }) => {
          const { sel, expected, isTbody } = args;
          const root = document.querySelector(sel);
          if (!root) return false;
          const rowSelector = isTbody ? 'tr' : 'tbody tr';
          const allRows = root.querySelectorAll(rowSelector);
          let visible = 0;
          for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i] as HTMLElement;
            if (row && row.offsetParent !== null) visible++;
            if (visible >= expected) return true;
          }
          return false;
        },
        { sel: locator, expected: minRows, isTbody: isTbodySelector },
        { timeout: timeoutMs },
      );
    }

    return { success: true };
  }

  /**
   * Check the ordering of table rows based on the urgency date and planned shipment date columns.
   * @param page - The Playwright page instance.
   * @param tableId - The ID or data-testid of the table element.
   * @param urgencyColIndex - The index of the urgency date column.
   * @param plannedShipmentColIndex - The index of the planned shipment date column.
   * @returns An object containing the success status and an optional message if the ordering check fails.
   */
  async checkDatesWithOrderList(
    page: Page,
    tableId: string,
    nameColIdIndex: number,
    urgencyColIndex: number,
    plannedShipmentColIndex: number,
    ordersIconColIndex: number,
    modalSelector: string,
    modalTableSelector: string,
    urgencyModalColId: string,
    plannedShipmentModalColId: string,
  ): Promise<{ success: boolean; message?: string }> {
    return this.orderHelper.checkDatesWithOrderList(
      this,
      page,
      tableId,
      nameColIdIndex,
      urgencyColIndex,
      plannedShipmentColIndex,
      ordersIconColIndex,
      modalSelector,
      modalTableSelector,
      urgencyModalColId,
      plannedShipmentModalColId,
    );
  }

  /**
   * Click a button with the specified text and locator.
   * @param textButton - The text content of the button to click.
   * @param locator - The selector to locate the button element.
   * @returns A promise that resolves when the button is clicked.
   */
  /**
   * Clicks a button by text and locator
   * @param textButton - The button text to match
   * @param locator - The locator for the button
   * @param click - Whether to actually click (Click.Yes) or just verify (Click.No)
   */
  async clickButton(textButton: string, locator: string, click: Click = Click.Yes) {
    return this.elementHelper.clickButton(textButton, locator, click);
  }

  /**
   * Wait for the table body to become visible. if not thead
   * @param locator - the full locator of the table
   * @returns A promise that resolves when the table body is visible.
   */
  async waitingTableBodyNoThead(locator: string) {
    const locatorTable = this.page.locator(locator);

    // Wait for any table rows in tbody - generic approach without relying on classes or hardcoded data-testid patterns
    await this.page.waitForSelector(`${locator} tbody tr`, {
      state: 'attached',
      timeout: 10000,
    });
  }

  async checkHeader(header: string, url: string) {
    return this.validationHelper.checkHeader(header, url);
  }

  async ordersListVerifyModalDates(
    page: Page,
    modalSelectorId: string,
    modalTableSelectorId: string,
    urgencyModalColValForCompare: string,
    plannedShipmentModalColValForCompare: string,
    urgencyDateId: string,
    plannedShipmentDateId: string,
  ): Promise<{ success: boolean; message?: string }> {
    return this.orderHelper.ordersListVerifyModalDates(
      this,
      page,
      modalSelectorId,
      modalTableSelectorId,
      urgencyModalColValForCompare,
      plannedShipmentModalColValForCompare,
      urgencyDateId,
      plannedShipmentDateId,
    );
  }

  /** Checks the current date in the locator
   * @param locator - the full locator of the table
   */
  async checkCurrentDate(locator: string) {
    return this.miscHelper.checkCurrentDate(locator);
  }

  // Check the "Start Production" modal window
  async checkModalWindowLaunchIntoProduction(locator: string) {
    return this.miscHelper.checkModalWindowLaunchIntoProduction(locator);
  }

  /** Checks and enters the quantity in the "Start Production" modal window
   * @param quantity - checks that the input has this value
   * @param quantityOrder - if this parameter is specified, enters this value in the input field
   */
  async checkOrderQuantityNew(quantity: string, quantityOrder?: string) {
    return this.orderHelper.checkOrderQuantityNew(quantity, quantityOrder);
  }
  /** Checks and enters the quantity in the order modal window
   * @param locator - selector for the quantity input field
   * @param quantity - expected value in the input (checked only if quantityOrder is not provided)
   * @param quantityOrder - if specified, enters this value in the input field
   */
  async checkOrderQuantity(locator: string, quantity: string, quantityOrder?: string) {
    return this.orderHelper.checkOrderQuantity(locator, quantity, quantityOrder);
  }

  // Save the order number from the "Start Production" modal window
  async checkOrderNumber() {
    return this.orderHelper.checkOrderNumber();
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async getValueOrClickFromFirstRow(locator: string, cellIndex: number, click: Click = Click.No, dblclick: Click = Click.No) {
    return this.rowCellHelper.getValueOrClickFromFirstRow(locator, cellIndex, click, dblclick);
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async getValueOrClickFromFirstRowNoThead(locator: string, cellIndex: number, click: Click = Click.No, dblclick: Click = Click.No) {
    return this.rowCellHelper.getValueOrClickFromFirstRowNoThead(locator, cellIndex, click, dblclick);
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the locator of the table [data-testid=**]
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async clickIconOperation(locator: string, cellIndex: number, click: Click = Click.No) {
    return this.rowCellHelper.clickIconOperation(locator, cellIndex, click);
  }

  /** Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the locator of the table [data-testid=**]
   * @param cellIndex - the index of the cell from which to extract the value (0-based)
   * @param click - whether to click on the cell
   */
  async clickIconOperationNew(locator: string, cellIndex: number, click: Click = Click.No) {
    return this.rowCellHelper.clickIconOperationNew(locator, cellIndex, click);
  }

  /** Checks if the first row contains the specified name and marks the checkbox in the second cell
   * @param name - the value to search for
   * @param locator - the full locator of the table
   */
  async checkboxMarkNameInLineFromFirstRow(name: string, locator: string) {
    return this.rowCellHelper.checkboxMarkNameInLineFromFirstRow(name, locator);
  }

  /**
   * Check that the first row contains the searched name
   * @param name - the searched value
   * @param locator - the full locator of the table
   */
  async checkNameInLineFromFirstRow(
    name: string,
    locator: string,
    options?: {
      testInfo?: TestInfo;
      description?: string;
    },
  ) {
    return this.rowCellHelper.checkNameInLineFromFirstRow(name, locator, options);
  }

  /**
   * Click on the table header cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the header cell to click on
   */
  async clickOnTheTableHeaderCell(cellIndex: number, locator: string) {
    return this.rowCellHelper.clickOnTheTableHeaderCell(cellIndex, locator);
  }

  /**
   * Retrieve descendants from the entity specification
   * Iterate through the entity specification table and save to separate arrays
   * @param descendantsCbedArray - the array where we plan to save the assemblies
   * @param descendantsDetailArray - the array where we plan to save the details
   */
  async preservingDescendants(descendantsCbedArray: ISpetificationData[], descendantsDetailArray: ISpetificationData[]) {
    return this.miscHelper.preservingDescendants(this, descendantsCbedArray, descendantsDetailArray);
  }

  /**
   * Check the modal window for completion status
   * @param nameOperation - Pass the name of the operation for verification
   * @param nameProduct - Pass the name of the entity for verification
   * @param designationProduct - Pass the designation of the entity for verification
   */
  async completionMarkModalWindow(nameOperation: string, nameProduct: string, designationProduct: string) {
    return this.miscHelper.completionMarkModalWindow(nameOperation, nameProduct, designationProduct);
  }

  // Checking the modal window to send to archive
  async checkModalWindowForTransferringToArchive(locator: string) {
    return this.miscHelper.checkModalWindowForTransferringToArchive(locator);
  }

  // Check the modal window "Completed Sets"
  async completesSetsModalWindow() {
    return this.miscHelper.completesSetsModalWindow(this);
  }

  /**
   * Check the modal window "Invoice for Completion" depending on the entity.
   * Enter the quantity for accounting and check the checkbox for the first order in the list.
   * @param typeInvoice - Type of entity: Product/Assembly.
   * @param checkbox - Check the checkbox for the first order in the table.
   * @param enterQuantity - Enter the quantity in the "Your Quantity" cell.
   */
  async assemblyInvoiceModalWindow(typeInvoice: TypeInvoice, checkbox: boolean, enterQuantity?: string) {
    return this.miscHelper.assemblyInvoiceModalWindow(this, typeInvoice, checkbox, enterQuantity);
  }

  /** Waiting close modal window
   *    @param locator - Locator of the input.
   */
  async checkCloseModalWindow(locator: string) {
    return this.modalHelper.checkCloseModalWindow(locator);
  }

  async filterRowsWithoutTh(rows: ElementHandle[]): Promise<ElementHandle[]> {
    return this.miscHelper.filterRowsWithoutTh(rows);
  }

  /**
   * Show the left table if it is not visible
   * @param tableId of the table to search for
   * @param buttonId of the button that we will click on
   */
  async showLeftTable(tableId: string, buttonId: string) {
    return this.miscHelper.showLeftTable(tableId, buttonId);
  }

  /**
   * Get the ids of all the columns data-testid passed in and return an array of Ids
   * @param tableId of the table to search for
   * @param page curent Page
   * @param searchFields the array of data-testids to search for
   * @returns array of integers
   */
  /**
   * Get searchable column IDs for a table
   * @param page - The Playwright page instance
   * @param tableId - The ID or data-testid of the table
   * @param searchFields - Array of search field data-testids
   * @returns Array of column indices
   */
  async getSearchableColumnIds(page: Page, tableId: string, searchFields: string[]): Promise<number[]> {
    return this.tableHelper.getSearchableColumnIds(page, tableId, searchFields);
  }

  /**
   * Checks the search history functionality and verifies that search history items
   * can be clicked to populate the search field and trigger the search.
   *
   * @param page - The Playwright page object.
   * @param tableId - The ID of the table to perform the search on.
   * @param searchFieldId - The ID of the search input field.
   * @param searchTerms - Array of search terms to verify in the search history.
   */
  async checkSearchHistory(page: Page, tableId: string, searchFieldId: string, searchTerms: string[]): Promise<void> {
    return this.tableHelper.checkSearchHistory(page, tableId, searchFieldId, searchTerms);
  }

  /**
   * Performs negative tests on the search functionality to ensure it handles
   * invalid inputs gracefully.
   *
   * @param page - The Playwright page object.
   * @param tableId - The ID of the table to perform the search on.
   * @param searchFieldId - The ID of the search input field.
   */
  async performNegativeSearchTests(page: Page, tableId: string, searchFieldId: string): Promise<void> {
    return this.tableHelper.performNegativeSearchTests(page, tableId, searchFieldId);
  }

  /**
   * Find and fill a cell in a table
   * @param page - The Playwright page instance
   * @param tableSelector - The selector for the table
   * @param variableName - The variable name to search for in cells
   * @param targetCellIndex - The index of the target cell to fill
   * @param value - Optional value to fill (if not provided, returns current value)
   * @returns The current value if value not provided, or void if value was filled
   */
  async findAndFillCell(page: Page, tableSelector: string, variableName: string, targetCellIndex: number, value?: string): Promise<string | void> {
    return this.tableHelper.findAndFillCell(page, tableSelector, variableName, targetCellIndex, value);
  }

  /**
   * Retrieve all rows as Locators from a table.
   * @param table - The Playwright Locator for the table element.
   * @returns A promise that resolves to an array of row Locators.
   */
  async getAllDataRows(table: Locator): Promise<Locator[]> {
    return this.tableHelper.getAllDataRows(table);
  }

  /**
   * Get all H3 tag values within a specific element by class name.
   * Excludes H3 tags inside <dialog> or <dialogs> tags.
   *
   * @param {string} className - The class name of the container to scan.
   * @returns {string[]} - Array of H3 text content.
   */
  async getAllH3TitlesInClass(page: Page, selector: string): Promise<string[]> {
    return this.modalHelper.getAllH3TitlesInClass(page, selector);
  }

  async getAllH3TitlesInTestId(page: Page, testId: string): Promise<string[]> {
    return this.modalHelper.getAllH3TitlesInTestId(page, testId);
  }

  async isButtonVisible(
    page: Page,
    buttonSelector: string,
    label: string,
    Benabled: boolean = true, // Default is true
    dialogContext: string = '', // Optional: Specify dialog context for scoping
    waitForEnabled: boolean = false, // Optional: If true, wait for button to become enabled (default: false for backward compatibility)
    waitTimeout: number = 10000, // Optional: Maximum time to wait for button to become enabled (default: 10 seconds)
  ): Promise<boolean> {
    return this.validationHelper.isButtonVisible(page, buttonSelector, label, Benabled, dialogContext, waitForEnabled, waitTimeout);
  }

  async getAllH4TitlesInModalClass(page: Page, modalClassName: string): Promise<string[]> {
    return this.modalHelper.getAllH4TitlesInModalClass(page, modalClassName);
  }

  async getAllH4TitlesInModalByTestId(page: Page, modalTestId: string): Promise<string[]> {
    return this.modalHelper.getAllH4TitlesInModalByTestId(page, modalTestId);
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
    return this.modalHelper.validateModalH4Titles(page, modalTestId, expectedTitles, options);
  }

  /** Checks if a button is visible and active/inactive
   * @param selector - selector for the button
   * @param expectedState - expected state of the button ('active' or 'inactive')
   * @returns Promise<boolean> - true if button state matches expected, false otherwise
   */
  async checkButtonState(name: string, selector: string, expectedState: 'active' | 'inactive'): Promise<boolean> {
    return this.validationHelper.checkButtonState(name, selector, expectedState);
  }
  async extractNotificationMessage(page: Page): Promise<{ title: string; message: string } | null> {
    return this.notificationHelper.extractNotificationMessage(page);
  }

  /**
   * Gets the text content of the latest notification description.
   * @returns The notification description text, or empty string if not visible
   */
  async getLatestNotificationText(): Promise<string> {
    return this.notificationHelper.getLatestNotificationText();
  }

  async isButtonVisibleTestId(
    page: Page,
    testId: string,
    label: string,
    Benabled: boolean = true, // Default is true
    dialogContextTestId: string = '', // Optional: Specify dialog context testId for scoping
  ): Promise<boolean> {
    return this.validationHelper.isButtonVisibleTestId(page, testId, label, Benabled, dialogContextTestId);
  }

  async getAllH3TitlesInModalClass(page: Page, className: string): Promise<string[]> {
    return this.modalHelper.getAllH3TitlesInModalClass(page, className);
  }

  async getAllH3TitlesInModalTestId(page: Page, testId: string): Promise<string[]> {
    return this.modalHelper.getAllH3TitlesInModalTestId(page, testId);
  }

  async getAllH3AndH4TitlesInModalTestId(page: Page, testId: string): Promise<string[]> {
    return this.modalHelper.getAllH3AndH4TitlesInModalTestId(page, testId);
  }

  async getButtonsFromDialog(page: Page, dialogClass: string, buttonSelector: string): Promise<Locator> {
    return this.modalHelper.getButtonsFromDialog(page, dialogClass, buttonSelector);
  }

  async getAllH3TitlesInModalClassNew(page: Page, className: string): Promise<string[]> {
    return this.modalHelper.getAllH3TitlesInModalClassNew(page, className);
  }

  async modalCompany() {
    return this.modalHelper.modalCompany();
  }

  /**
   * Navigate to the element with the specified data-testid and log the details.
   * @param url - The URL of the page to navigate to.
   * @param dataTestId - The data-testid of the element to validate after navigation.
   * @returns Promise<void> - Logs navigation status and validates the presence of the specified element.
   */
  /**
   * Navigates to a page and validates the presence of an element
   * @param url - The URL to navigate to
   * @param dataTestId - The data-testid of the element to validate
   */
  async navigateToPage(url: string, dataTestId: string): Promise<void> {
    return this.navigationHelper.navigateToPage(url, dataTestId);
  }
  /**
   * Validate page titles by checking the H3 elements within a given section, and apply styling for debugging.
   * @param testId - The data-testid attribute of the section containing the titles.
   * @param expectedTitles - An array of expected titles to validate against.
   * @returns Promise<void> - Validates the content and order of titles, applies styling, or throws an error if validation fails.
   */
  /**
   * Verifies that test data arrays are available and not empty.
   * Used in U002 test suite to ensure test data has been prepared before running tests.
   * @param testDataArray - The array to verify (e.g., arrayDetail, arrayCbed, arrayIzd)
   * @param arrayName - Display name for the array (e.g., "DETAIL", "CBED", "IZD")
   * @param allArrays - Optional object containing all arrays for logging purposes
   */
  async verifyTestDataAvailable<T>(testDataArray: T[], arrayName: string, allArrays?: { detail?: T[]; cbed?: T[]; izd?: T[] }): Promise<void> {
    return this.miscHelper.verifyTestDataAvailable(testDataArray, arrayName, allArrays);
  }

  /**
   * Finds the row index of an order by its order number in a modal orders list.
   * Used in U002 test suite to locate specific orders in the orders modal.
   * @param orderRowsLocator - Locator for the order number rows
   * @param targetOrderNumber - The order number to find
   * @param errorMessage - Custom error message if order not found (optional)
   * @returns The index of the row containing the order number
   * @throws Error if the order number is not found
   */
  async findOrderRowIndexByOrderNumber(orderRowsLocator: Locator, targetOrderNumber: string, errorMessage?: string): Promise<number> {
    return this.orderHelper.findOrderRowIndexByOrderNumber(orderRowsLocator, targetOrderNumber, errorMessage);
  }

  /**
   * Finds the checkbox index of an order by its order number in an edit modal.
   * Used in U002 test suite to locate and select checkboxes for specific orders.
   * @param checkboxesLocator - Locator for the checkboxes
   * @param orderNumberCellsLocator - Locator for the order number cells (corresponding to checkboxes)
   * @param targetOrderNumber - The order number to find
   * @param errorMessage - Custom error message if order not found (optional)
   * @returns The index of the checkbox for the order number
   * @throws Error if the order number is not found
   */
  async findCheckboxIndexByOrderNumber(
    checkboxesLocator: Locator,
    orderNumberCellsLocator: Locator,
    targetOrderNumber: string,
    errorMessage?: string,
  ): Promise<number> {
    return this.orderHelper.findCheckboxIndexByOrderNumber(checkboxesLocator, orderNumberCellsLocator, targetOrderNumber, errorMessage);
  }

  /**
   * Opens a context menu by clicking on a popover cell and then clicks on the 'Заказы' menu item.
   * Used in U002 test suite to open orders modal from warehouse tables.
   * @param popoverSelector - Selector for the popover/context menu cell
   * @param menuItemSelector - Selector for the 'Заказы' menu item
   * @param waitForModalSelector - Optional selector for the modal to wait for after clicking menu item
   * @param popoverPosition - Optional position selector ('first', 'last', or number for nth()) - default: 'first'
   */
  async openContextMenuAndClickOrders(
    popoverSelector: string,
    menuItemSelector: string,
    waitForModalSelector?: string,
    popoverPosition: 'first' | 'last' | number = 'first',
  ): Promise<void> {
    return this.orderHelper.openContextMenuAndClickOrders(this, popoverSelector, menuItemSelector, waitForModalSelector, popoverPosition);
  }

  /**
   * Verifies that the orders modal opens and contains the expected orders.
   * Used in U002 test suite to verify orders are displayed correctly in the modal.
   * @param modalSelector - Selector for the orders modal
   * @param tableSelector - Selector for the orders table
   * @param orderRowsSelector - Selector for order number rows (direct locator or within modal)
   * @param quantityCellsSelector - Selector for quantity cells (direct locator or within order rows)
   * @param expectedOrderNumbers - Array of expected order numbers to verify
   * @param expectedQuantities - Array of expected quantities to verify
   * @param itemTypeName - Optional name for logging (e.g., "DETAIL", "CBED", "IZD")
   * @param useRowLocator - If true, quantity cells are located within order rows; if false, they use nth() index
   * @param additionalWaitTimeout - Optional additional wait timeout (for IZD case)
   */
  async verifyOrdersModal(
    modalSelector: string,
    tableSelector: string,
    orderRowsSelector: string,
    quantityCellsSelector: string,
    expectedOrderNumbers: string[],
    expectedQuantities: string[],
    itemTypeName?: string,
    useRowLocator: boolean = false,
    additionalWaitTimeout?: number,
  ): Promise<void> {
    return this.orderHelper.verifyOrdersModal(
      this,
      modalSelector,
      tableSelector,
      orderRowsSelector,
      quantityCellsSelector,
      expectedOrderNumbers,
      expectedQuantities,
      itemTypeName,
      useRowLocator,
      additionalWaitTimeout,
    );
  }

  /**
   * Gets a quantity cell, highlights it, and returns the quantity value.
   * Used in U002 test suite to verify warehouse quantities.
   * @param quantityCellSelector - Selector for the quantity cell (can be a simple selector or a complex one)
   * @param expectedValue - Optional expected value to verify
   * @param quantityType - Optional type description for logging (e.g., "Total ordered", "Remaining ordered")
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   * @param useComplexSelector - If true, the selector is a complex pattern with prefix and suffix
   * @param prefixSelector - Optional prefix selector for complex selectors (used with useComplexSelector)
   * @param suffixSelector - Optional suffix selector for complex selectors (used with useComplexSelector)
   * @returns The quantity value as a number
   */
  async getQuantityCellAndVerify(
    quantityCellSelector: string,
    expectedValue?: number,
    quantityType: string = 'quantity',
    itemTypeName?: string,
    useComplexSelector: boolean = false,
    prefixId?: string,
    suffixId?: string,
    timeoutMs: number = WAIT_TIMEOUTS.STANDARD,
  ): Promise<number> {
    return this.orderHelper.getQuantityCellAndVerify(
      this,
      quantityCellSelector,
      expectedValue,
      quantityType,
      itemTypeName,
      useComplexSelector,
      prefixId,
      suffixId,
      timeoutMs,
    );
  }

  /**
   * Clicks on an order in the orders modal to open the edit dialog.
   * Used in U002 test suite to open edit dialogs for specific orders.
   * @param orderRowsSelector - Selector for order rows
   * @param orderNumber - The order number to click on
   * @param errorMessage - Optional custom error message if order not found
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   */
  async clickOrderToOpenEditDialog(orderRowsSelector: string, orderNumber: string, errorMessage?: string, itemTypeName?: string): Promise<void> {
    return this.orderHelper.clickOrderToOpenEditDialog(this, orderRowsSelector, orderNumber, errorMessage, itemTypeName);
  }

  /**
   * Selects a checkbox for a specific order and archives it.
   * Used in U002 test suite to archive orders from the edit dialog.
   * @param orderNumber - The order number to archive
   * @param checkboxesSelector - Selector for checkboxes
   * @param orderNumberCellsSelector - Selector for order number cells
   * @param archiveButtonSelector - Selector for the archive button
   * @param confirmButtonSelector - Selector for the confirm button
   * @param editModalSelector - Selector for the edit modal (to wait for it)
   * @param errorMessage - Optional custom error message if checkbox not found
   * @param itemTypeName - Optional item type for logging (e.g., "DETAIL", "CBED", "IZD")
   */
  async selectCheckboxAndArchiveOrder(
    orderNumber: string,
    checkboxesSelector: string,
    orderNumberCellsSelector: string,
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    editModalSelector: string,
    errorMessage?: string,
    itemTypeName?: string,
  ): Promise<void> {
    return this.archiveHelper.selectCheckboxAndArchiveOrder(
      this,
      orderNumber,
      checkboxesSelector,
      orderNumberCellsSelector,
      archiveButtonSelector,
      confirmButtonSelector,
      editModalSelector,
      errorMessage,
      itemTypeName,
    );
  }

  async validatePageTitlesWithStyling(testId: string, expectedTitles: string[]): Promise<void> {
    return this.validationHelper.validatePageTitlesWithStyling(testId, expectedTitles);
  }
  /**
   * Validate that a table is displayed and has rows.
   * @param tableTestId - The data-testid of the table to validate.
   * @returns Promise<void> - Validates the presence and non-emptiness of the table.
   */
  async validateTableIsDisplayedWithRows(tableTestId: string): Promise<void> {
    return this.validationHelper.validateTableIsDisplayedWithRows(tableTestId);
  }

  /**
   * Validate a button's visibility and state using its data-testid.
   * Checks if the button is disabled either by attribute or CSS class.
   * @param page - The Playwright page object.
   * @param buttons - Array of button configurations including data-testid, label, and expected state.
   * @param dialogSelector - Optional scoped selector for the dialog or container.
   */
  async validateButtons(page: Page, buttons: Array<{ datatestid: string; label: string; state: string }>, dialogSelector?: string): Promise<void> {
    return this.validationHelper.validateButtons(page, buttons, dialogSelector);
  }
  /**
   * Validates that the checkbox in the "Главный:" row is not checked.
   * @param {import('@playwright/test').Page} page - Playwright page object.
   * @param {import('@playwright/test').Locator} section - Locator for the file section.
   * @param {number} sectionIndex - Index of the section being checked.
   * @returns {Promise<boolean>} - Returns whether the checkbox is checked.
   */
  async validateCheckbox(page: Page, section: Locator, sectionIndex: number) {
    return this.validationHelper.validateCheckbox(page, section, sectionIndex);
  }
  /**
   * Checks the checkbox in the "Главный:" row and applies styling.
   * @param {import('@playwright/test').Page} page - Playwright page object.
   * @param {import('@playwright/test').Locator} section - Locator for the file section.
   * @param {number} sectionIndex - Index of the section being checked.
   * @returns {Promise<boolean>} - Returns whether the checkbox is checked.
   */
  async checkCheckbox(page: Page, section: Locator, sectionIndex: number) {
    return this.validationHelper.checkCheckbox(page, section, sectionIndex);
  }

  /**
   * Validates that all uploaded file fields contain the correct filename without extension.
   * @param {Page} page - Playwright page object.
   * @param {Locator[]} fileSections - Array of file section locators.
   * @param {string[]} uploadedFiles - Array of uploaded file names.
   */
  async validateFileNames(page: Page, fileSections: Locator[], uploadedFiles: string[]): Promise<void> {
    return this.validationHelper.validateFileNames(page, fileSections, uploadedFiles);
  }
  /**
   * Highlights an element with standard debugging styles.
   * @param element - The Playwright locator to highlight
   * @param customStyles - Optional custom styles to apply
   */
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
    return this.elementHelper.highlightElement(element, customStyles);
  }

  /**
   * Locates an element by data-testid, highlights it, and waits for it to be visible.
   * @param dataTestId - The data-testid to locate
   * @param timeout - Optional timeout for waiting (default: 30000)
   * @returns The located element
   */
  async locateAndHighlightElement(dataTestId: string, timeout: number = 30000): Promise<Locator> {
    return this.elementHelper.locateAndHighlightElement(dataTestId, timeout);
  }

  /**
   * Vue-compatible search using pressSequentially
   * @param searchInputSelector - Selector for the search input element
   * @param searchTerm - Term to search for
   * @param options - Optional configuration (delay, waitAfterSearch)
   */
  async searchWithPressSequentially(
    searchInputSelector: string,
    searchTerm: string,
    options?: { delay?: number; waitAfterSearch?: number; timeout?: number },
  ): Promise<void> {
    return this.tableHelper.searchWithPressSequentially(searchInputSelector, searchTerm, options);
  }

  /**
   * Helper function to extract ID from full selector
   * @param selector - The selector string (may contain [data-testid="..."] or just the ID)
   * @returns The extracted data-testid value or the original selector if no match
   */

  /**
   * Fill input and wait for value to be set
   * @param inputLocator - The input locator
   * @param value - Value to fill
   * @param timeout - Timeout for waiting (default: TIMEOUTS.MEDIUM)
   */
  async fillInputAndWaitForValue(inputLocator: Locator, value: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    return this.elementHelper.fillInputAndWaitForValue(inputLocator, value, timeout);
  }

  /**
   * Fill input with retries - attempts to fill input multiple times until value matches
   * @param input - The input locator
   * @param value - Value to fill
   * @param maxAttempts - Maximum number of attempts (default: 3)
   * @returns The final value in the input
   */
  async fillInputWithRetries(input: Locator, value: string, maxAttempts = 3): Promise<string> {
    return this.elementHelper.fillInputWithRetries(input, value, maxAttempts);
  }

  /**
   * Helper function to find the actual search input element (handles wrapper vs direct input)
   * @param page - Playwright Page object
   * @param searchInputSelector - Selector for the search input wrapper
   * @param timeout - Timeout for waiting (default: WAIT_TIMEOUTS.STANDARD)
   * @returns The actual input locator to use
   */
  async findSearchInput(page: Page, searchInputSelector: string, timeout: number = WAIT_TIMEOUTS.STANDARD): Promise<Locator> {
    return this.elementHelper.findSearchInput(page, searchInputSelector, timeout);
  }
}

// ValidationResult is now exported from TableHelper



export enum Click {
  Yes = 1,
  No = 0,
}

export enum TypeInvoice {
  cbed = 'Сборка',
  product = 'Изделие',
}
