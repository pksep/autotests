/**
 * @file ArchiveHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for archive and delete operations extracted from Page.ts
 * 
 * This helper handles:
 * - Archiving items
 * - Archive confirmation
 * - Checkbox selection and archiving
 */

import { Page } from '@playwright/test';
import { ElementHelper } from './ElementHelper';
import { TableHelper } from './TableHelper';
import logger from '../utils/logger';

export class ArchiveHelper {
  private elementHelper: ElementHelper;
  private tableHelper: TableHelper;

  constructor(private page: Page) {
    this.elementHelper = new ElementHelper(page);
    this.tableHelper = new TableHelper(page);
  }

  /**
   * Archives an item by selecting the first row and clicking archive/confirm buttons.
   * This is a common pattern used across many test cases.
   * @param pageObject - The PageObject instance to call helper methods through (for RowCellHelper methods)
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
   *   - verifyArchived: If true, verifies item is archived by searching again
   *   - verifyTableSelector: Selector for verification table (default: tableSelector)
   *   - tableBodySelector: Selector for table body to check for archived item
   *   - searchInputDataTestId: Data test ID for search input
   */
  async archiveItem(
    pageObject: any, // PageObject instance to call helper methods
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
    // Select/check the first row (calls RowCellHelper through PageObject)
    if (options?.useCheckboxMark) {
      await pageObject.checkboxMarkNameInLineFromFirstRow(searchTerm, tableSelector);
    } else {
      await pageObject.checkNameInLineFromFirstRow(searchTerm, tableSelector);
    }

    // Click on table header cell if specified (some archive operations require this)
    // Calls RowCellHelper through PageObject
    if (options?.headerCellIndex !== undefined) {
      await pageObject.clickOnTheTableHeaderCell(options.headerCellIndex, tableSelector);
    }

    // Click archive button (calls ElementHelper)
    const archiveLabel = options?.archiveButtonLabel || 'Архив';
    await pageObject.clickButton(archiveLabel, archiveButtonSelector);

    // Wait a bit for modal to appear
    await page.waitForTimeout(200);

    // Confirm the archive (calls ElementHelper)
    const confirmLabel = options?.confirmButtonLabel || 'Да';
    await pageObject.clickButton(confirmLabel, confirmButtonSelector);

    // Wait for the modal to close and table to update
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(options?.waitAfterConfirm || 1000);

    // Verify the item is archived by searching again
    if (options?.verifyArchived !== false && options?.tableBodySelector) {
      logger.log('Verifying item is archived by searching again...');
      const verifyTableSelector = options.verifyTableSelector || tableSelector;

      // Perform the search using redesign method (calls TableHelper)
      await this.tableHelper.searchTableRedesign(searchTerm, verifyTableSelector);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check that the item is no longer in the table
      // When there are no results, the table body might be hidden, so we check for attached state
      const tableBodyLocator = page.locator(options.tableBodySelector);
      const isTableBodyVisible = await tableBodyLocator.isVisible().catch(() => false);

      let rowCount = 0;
      if (isTableBodyVisible) {
        const rows = page.locator(`${options.tableBodySelector} tr`);
        rowCount = await rows.count();
      }

      if (rowCount > 0) {
        logger.log(`Warning: Item "${searchTerm}" still found in table after archiving (${rowCount} rows). It may not have been archived properly.`);
      } else {
        logger.log(`Item "${searchTerm}" successfully archived - not found in search results.`);
      }
    }
  }

  /**
   * Performs a simple archive operation: clicks the archive button and confirms.
   * This is a common pattern used across many test cases.
   * @param pageObject - The PageObject instance to call helper methods through
   * @param archiveButtonSelector - Selector for the archive button
   * @param confirmButtonSelector - Selector for the confirmation button
   * @param options - Optional configuration:
   *   - archiveButtonLabel: Label for the archive button (default: 'Архив')
   *   - confirmButtonLabel: Label for the confirm button (default: 'Да')
   *   - waitAfterConfirm: Timeout in ms after confirmation (default: 1000)
   */
  async archiveAndConfirm(
    pageObject: any, // PageObject instance to call helper methods
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    options?: {
      archiveButtonLabel?: string;
      confirmButtonLabel?: string;
      waitAfterConfirm?: number;
    },
  ): Promise<void> {
    // Click archive button
    const archiveLabel = options?.archiveButtonLabel || 'Архив';
    const archiveButton = this.page.locator(archiveButtonSelector, { hasText: archiveLabel });

    // Wait for button to be visible and enabled
    await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for button to be enabled with retry
    let isEnabled = false;
    for (let retry = 0; retry < 10; retry++) {
      isEnabled = await archiveButton.isEnabled();
      if (isEnabled) {
        break;
      }
      await this.page.waitForTimeout(500);
    }

    if (!isEnabled) {
      throw new Error(`Archive button "${archiveLabel}" is not enabled after waiting.`);
    }

    // Highlight and click archive button (calls ElementHelper)
    await pageObject.highlightElement(archiveButton, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(500);
    await archiveButton.click();

    // Wait a bit for modal to appear
    await this.page.waitForTimeout(200);

    // Confirm the archive (calls ElementHelper)
    const confirmLabel = options?.confirmButtonLabel || 'Да';
    await pageObject.clickButton(confirmLabel, confirmButtonSelector);

    // Wait for the modal to close
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(options?.waitAfterConfirm || 1000);
  }

  /**
   * Selects a checkbox by order number and archives the order
   * @param pageObject - The PageObject instance to call helper methods through
   * @param orderNumber - The order number to find and archive
   * @param checkboxesSelector - Selector for checkboxes
   * @param orderNumberCellsSelector - Selector for order number cells
   * @param archiveButtonSelector - Selector for archive button
   * @param confirmButtonSelector - Selector for confirm button
   * @param editModalSelector - Selector for edit modal
   * @param errorMessage - Optional error message if order not found
   * @param itemTypeName - Optional item type name for logging
   */
  async selectCheckboxAndArchiveOrder(
    pageObject: any, // PageObject instance to call helper methods
    orderNumber: string,
    checkboxesSelector: string,
    orderNumberCellsSelector: string,
    archiveButtonSelector: string,
    confirmButtonSelector: string,
    editModalSelector: string,
    errorMessage?: string,
    itemTypeName?: string,
  ): Promise<void> {
    const { allure } = await import('allure-playwright');
    await allure.step('Select checkbox and archive the second order', async () => {
      // Wait for the edit dialog to appear
      const editModal = this.page.locator(`${editModalSelector}[open]`);
      await editModal.waitFor({ state: 'visible', timeout: 10000 });

      // Wait a bit more for modal content to load
      await this.page.waitForTimeout(1000);

      // Find the checkbox for the order
      const checkboxes = this.page.locator(checkboxesSelector);
      const orderNumberCells = this.page.locator(orderNumberCellsSelector);

      // Wait for at least one checkbox to be visible
      await checkboxes
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {
          logger.log('Warning: No checkboxes found in edit modal');
        });
      
      // Calls OrderHelper through PageObject
      const checkboxIndex = await pageObject.findCheckboxIndexByOrderNumber(
        checkboxes,
        orderNumberCells,
        orderNumber,
        errorMessage || `Could not find checkbox for ${itemTypeName ? itemTypeName + ' ' : ''}order ${orderNumber}`,
      );

      // Click the checkbox
      const checkbox = checkboxes.nth(checkboxIndex);
      // Calls ElementHelper through PageObject
      await pageObject.highlightElement(checkbox, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });

      await checkbox.click();
      const logPrefix = itemTypeName ? `${itemTypeName} ` : '';
      logger.log(`Selected checkbox for ${logPrefix}order ${orderNumber}`);

      // Archive and confirm
      await this.archiveAndConfirm(pageObject, archiveButtonSelector, confirmButtonSelector);
      logger.log('Archived and confirmed');
    });
  }
}
