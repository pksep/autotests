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
import * as SelectorsFileComponents from '../lib/Constants/SelectorsFileComponents'; // Import File Components selectors
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers'; // Import Ordered From Suppliers selectors
import { Input } from './Input'; // Import the Input helper class for handling input fields
import { Button } from './Button'; // Import the Button helper class for handling button clicks
import logger from './utils/logger'; // Import logger utility for logging messages
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

  /** Scans and validates table structure within element (duplicate data-testids, missing cells). */
  async scanTablesWithinElement(page: Page, dataTestId: string): Promise<ValidationResult> {
    return this.tableHelper.scanTablesWithinElement(page, dataTestId);
  }

  /** Finds and clicks element by partial data-testid. */
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

  /** Get normalized text content of selector. */
  async getTextNormalized(selector: string): Promise<string | null> {
    return this.elementHelper.getTextNormalized(selector);
  }

  /** Get normalized error message from selector. */
  async getErrorMessage(selector: string): Promise<string | null> {
    return this.elementHelper.getErrorMessage(selector);
  }

  /** Scroll element into view with extra offset. */
  async scrollIntoViewWithExtra(element: Locator, pageInstance: Page): Promise<void> {
    return this.elementHelper.scrollIntoViewWithExtra(element, pageInstance);
  }

  /** Wait for element, scroll into view, highlight. */
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

  /** Create new tab, navigate to URL, return page and PageObject instance. */
  async createNewTabAndNavigate<T extends PageObject>(url: string, PageObjectClass: new (page: Page) => T): Promise<{ page: Page; pageObject: T }> {
    return this.navigationHelper.createNewTabAndNavigate(url, PageObjectClass);
  }

  /** Open URL (default ENV.BASE_URL). */
  async goto(url: string = ENV.BASE_URL): Promise<void> {
    return this.navigationHelper.goto(url);
  }

  /** Wait for network idle. */
  async waitForNetworkIdle(timeout?: number): Promise<void> {
    return this.navigationHelper.waitForNetworkIdle(timeout);
  }

  /** Navigate to page, find table, wait for table body. */
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

  /** Search table and optionally wait for table body. */
  async searchAndWaitForTable(
    searchTerm: string,
    tableSelector: string,
    tableBodySelector: string,
    options?: { useRedesign?: boolean; searchInputDataTestId?: string; timeoutBeforeWait?: number; minRows?: number; timeoutMs?: number },
  ): Promise<void> {
    return this.tableHelper.searchAndWaitForTable(searchTerm, tableSelector, tableBodySelector, options);
  }

  /** Validates page H3 titles and buttons. */
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

  /** Search table and verify first row contains term. */
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

  /** Archive item: first row, archive + confirm buttons. */
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

  /** Click archive button then confirm. */
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

  /** Wait then verify first row contains search term. */
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

  /** Pause execution for ms (default 1000). */
  async waitForTimeout(ms: number = 1000): Promise<void> {
    if (ENV.DEBUG) {
      logger.info(`Page Class: Pausing for ${ms} milliseconds...`); // Log the pause action for debugging purposes
    }
    await this.page.waitForTimeout(ms); // Wait for the specified timeout duration
    if (ENV.DEBUG) {
      logger.info('Page Class: Pause complete'); // Log after the pause is complete
    }
  }

  /** Fill login form. */
  async fillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    return this.loginHelper.fillLoginForm(page, tabel, login, password);
  }

  async newFillLoginForm(page: Page, tabel: string, login: string, password: string): Promise<void> {
    return this.loginHelper.newFillLoginForm(page, tabel, login, password);
  }

  /** Read tooltip text by hovering over element. */
  async readTooltip(hoverSelector: string, tooltipSelector: string): Promise<string | null> {
    return this.elementHelper.readTooltip(hoverSelector, tooltipSelector);
  }

  /** Navigate by clicking element with data-testid. */
  async nav(dataTestId: string): Promise<true | string> {
    return this.navigationHelper.nav(dataTestId);
  }

  /** Check URL path matches expected. */
  async checkUrl(expectedPath: string): Promise<true | string> {
    return this.navigationHelper.checkUrl(expectedPath);
  }

  /** Check page title matches expected. */
  async checkTitle(expectedTitle: string): Promise<void> {
    return this.navigationHelper.checkTitle(expectedTitle);
  }

  /** Check page language matches expected. */
  async checkLanguage(expectedLanguage: string): Promise<void> {
    return this.navigationHelper.checkLanguage(expectedLanguage);
  }

  /** Check breadcrumb matches expected. */
  async checkBreadCrumb(expectedBreadcrumb: string): Promise<void> {
    return this.navigationHelper.checkBreadCrumb(expectedBreadcrumb);
  }

  /** Capture a screenshot of the current page. */
  async captureScreenshot(filename: string): Promise<void> {
    return this.navigationHelper.captureScreenshot(filename);
  }

  /** Wait for selector to become visible. */
  async waitForSelector(selector: string): Promise<void> {
    return this.elementHelper.waitForSelector(selector);
  }

  /** Check number of columns in table. */
  async checkTableColumns(page: Page, tableId: string, skip?: boolean): Promise<number> {
    return this.tableHelper.checkTableColumns(page, tableId, skip);
  }

  /** Check table column headers match expected. */
  async checkTableColumnHeaders(page: Page, tableId: string, expectedHeaders: any, skip?: boolean): Promise<boolean> {
    return this.tableHelper.checkTableColumnHeaders(page, tableId, expectedHeaders, skip);
  }

  /** Find table by selector, scroll into view, click. */
  async findTable(selector: string): Promise<void> {
    return this.tableHelper.findTable(selector);
  }

  /** Find column index by data-testid in a table. */
  async findColumn(page: Page, tableId: string, colId: string): Promise<number> {
    return this.tableHelper.findColumn(page, tableId, colId);
  }

  /** Get success message (optional order number). */
  async getMessage(orderNumber?: string) {
    return this.notificationHelper.getMessage(orderNumber);
  }

  /** Close success message. */
  async closeSuccessMessage() {
    return this.notificationHelper.closeSuccessMessage();
  }

  /** Search in table. */
  async searchTable(nameSearch: string, locator: string, searchInputDataTestId?: string) {
    return this.tableHelper.searchTable(nameSearch, locator, searchInputDataTestId);
  }

  /** Search in table (redesign UI). */
  async searchTableRedesign(nameSearch: string, locator: string) {
    return this.tableHelper.searchTableRedesign(nameSearch, locator);
  }

  /** Search table by icon click. */
  async searchTableByIcon(nameSearch: string, locator: string) {
    return this.tableHelper.searchTableByIcon(nameSearch, locator);
  }

  /** Wait for table body visible. */
  async waitingTableBody(locator: string, options?: { minRows?: number; timeoutMs?: number }) {
    return this.tableHelper.waitingTableBody(locator, options ?? {});
  }

  /** Check table row ordering by urgency/planned shipment dates. */
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

  /** Click button by text and locator. */
  async clickButton(
    textButton: string,
    locator: string,
    click: Click = Click.Yes,
    options?: { waitForEnabled?: boolean; enabledTimeout?: number },
  ) {
    return this.elementHelper.clickButton(textButton, locator, click, options);
  }

  /** Wait for table body (no thead). */
  async waitingTableBodyNoThead(locator: string) {
    return this.tableHelper.waitingTableBodyNoThead(locator);
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

  /** Validate H4 titles in modal by test ID. */
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

  /** Check button visible and active/inactive. */
  async checkButtonState(name: string, selector: string, expectedState: 'active' | 'inactive'): Promise<boolean> {
    return this.validationHelper.checkButtonState(name, selector, expectedState);
  }
  async extractNotificationMessage(page: Page): Promise<{ title: string; message: string } | null> {
    return this.notificationHelper.extractNotificationMessage(page);
  }

  /** Get latest notification text. */
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

  /** Navigate to URL and validate element by data-testid. */
  async navigateToPage(url: string, dataTestId: string): Promise<void> {
    return this.navigationHelper.navigateToPage(url, dataTestId);
  }
  /** Verify test data array is not empty. */
  async verifyTestDataAvailable<T>(testDataArray: T[], arrayName: string, allArrays?: { detail?: T[]; cbed?: T[]; izd?: T[] }): Promise<void> {
    return this.miscHelper.verifyTestDataAvailable(testDataArray, arrayName, allArrays);
  }

  /** Find row index by order number in orders modal. */
  async findOrderRowIndexByOrderNumber(orderRowsLocator: Locator, targetOrderNumber: string, errorMessage?: string): Promise<number> {
    return this.orderHelper.findOrderRowIndexByOrderNumber(orderRowsLocator, targetOrderNumber, errorMessage);
  }

  /** Find checkbox index by order number in edit modal. */
  async findCheckboxIndexByOrderNumber(
    checkboxesLocator: Locator,
    orderNumberCellsLocator: Locator,
    targetOrderNumber: string,
    errorMessage?: string,
  ): Promise<number> {
    return this.orderHelper.findCheckboxIndexByOrderNumber(checkboxesLocator, orderNumberCellsLocator, targetOrderNumber, errorMessage);
  }

  /** Open context menu and click Заказы. */
  async openContextMenuAndClickOrders(
    popoverSelector: string,
    menuItemSelector: string,
    waitForModalSelector?: string,
    popoverPosition: 'first' | 'last' | number = 'first',
  ): Promise<void> {
    return this.orderHelper.openContextMenuAndClickOrders(this, popoverSelector, menuItemSelector, waitForModalSelector, popoverPosition);
  }

  /** Verify orders modal content. */
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

  /** Get quantity cell value and optionally verify. */
  async getQuantityCellAndVerify(
    quantityCellSelector: string,
    expectedValue?: number,
    quantityType: string = 'quantity',
    itemTypeName?: string,
    useComplexSelector: boolean = false,
    prefixId?: string,
    suffixId?: string,
    timeoutMs: number = WAIT_TIMEOUTS.STANDARD,
    tableSelector?: string,
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
      tableSelector,
    );
  }

  /** Click order row to open edit dialog. */
  async clickOrderToOpenEditDialog(orderRowsSelector: string, orderNumber: string, errorMessage?: string, itemTypeName?: string): Promise<void> {
    return this.orderHelper.clickOrderToOpenEditDialog(this, orderRowsSelector, orderNumber, errorMessage, itemTypeName);
  }

  /** Select checkbox for order and archive. */
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
  /** Validate table is displayed with rows. */
  async validateTableIsDisplayedWithRows(tableTestId: string): Promise<void> {
    return this.validationHelper.validateTableIsDisplayedWithRows(tableTestId);
  }

  /** Validate buttons visibility and state. */
  async validateButtons(page: Page, buttons: Array<{ datatestid: string; label: string; state: string }>, dialogSelector?: string): Promise<void> {
    return this.validationHelper.validateButtons(page, buttons, dialogSelector);
  }
  /** Validate checkbox in section. */
  async validateCheckbox(page: Page, section: Locator, sectionIndex: number) {
    return this.validationHelper.validateCheckbox(page, section, sectionIndex);
  }
  /** Check checkbox in section. */
  async checkCheckbox(page: Page, section: Locator, sectionIndex: number) {
    return this.validationHelper.checkCheckbox(page, section, sectionIndex);
  }

  /** Validate uploaded file names in sections. */
  async validateFileNames(page: Page, fileSections: Locator[], uploadedFiles: string[]): Promise<void> {
    return this.validationHelper.validateFileNames(page, fileSections, uploadedFiles);
  }
  /** Highlight element with optional custom styles. */
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

  /** Locate by data-testid, highlight, wait visible. */
  async locateAndHighlightElement(dataTestId: string, timeout: number = 30000): Promise<Locator> {
    return this.elementHelper.locateAndHighlightElement(dataTestId, timeout);
  }

  /** Vue-compatible search with pressSequentially. */
  async searchWithPressSequentially(
    searchInputSelector: string,
    searchTerm: string,
    options?: { delay?: number; waitAfterSearch?: number; timeout?: number },
  ): Promise<void> {
    return this.tableHelper.searchWithPressSequentially(searchInputSelector, searchTerm, options);
  }

  /** Fill input and wait for value. */
  async fillInputAndWaitForValue(inputLocator: Locator, value: string, timeout: number = TIMEOUTS.MEDIUM): Promise<void> {
    return this.elementHelper.fillInputAndWaitForValue(inputLocator, value, timeout);
  }

  /** Fill input with retries until value matches. */
  async fillInputWithRetries(input: Locator, value: string, maxAttempts = 3): Promise<string> {
    return this.elementHelper.fillInputWithRetries(input, value, maxAttempts);
  }

  /** Find actual search input (wrapper or direct). */
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
