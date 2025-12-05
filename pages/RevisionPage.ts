import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

// Страница:  Ревизия
export class CreateRevisionPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async changeWarehouseBalances(quantity: string, tableSelector?: string) {
    // If table selector is provided, scope to first row of that table
    // Otherwise, use the generic selector (for backward compatibility)
    let inputLocator;
    if (tableSelector) {
      // Find the input within the first row of the specified table
      const table = this.page.locator(tableSelector);
      const firstRow = table.locator('tbody tr').first();
      inputLocator = firstRow.locator('[data-testid="InputNumber-Input"]');
    } else {
      inputLocator = this.page.locator('[data-testid="InputNumber-Input"]').first();
    }

    await inputLocator.waitFor({ state: 'visible', timeout: 10000 });
    await inputLocator.fill(quantity);
    await inputLocator.press('Enter');
  }

  async checkWarehouseBalances(quantity: string, tableSelector?: string) {
    await this.page.waitForTimeout(1000);

    // If table selector is provided, scope to first row of that table
    // Otherwise, use the generic selector (for backward compatibility)
    let checkBalanceCell;
    if (tableSelector) {
      // Find the balance cell within the first row of the specified table
      const table = this.page.locator(tableSelector);
      const firstRow = table.locator('tbody tr').first();
      checkBalanceCell = firstRow.locator('[data-testid="TableRevisionPagination-TableData-Current"]');
    } else {
      checkBalanceCell = this.page.locator('[data-testid="TableRevisionPagination-TableData-Current"]').first();
    }

    await checkBalanceCell.waitFor({ state: 'visible', timeout: 10000 });
    await checkBalanceCell.scrollIntoViewIfNeeded();

    // Highlight the balance cell
    await checkBalanceCell.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'lightyellow';
      el.style.border = '2px solid orange';
    });
    await this.page.waitForTimeout(300);

    const checkBalance = await checkBalanceCell.textContent();
    expect(checkBalance).toBe(quantity);
  }

  /**
   * Performs the revision page balance change pattern: checks first row, changes balance, confirms archive, and verifies balance.
   * This is a common pattern used in Test Case 36.
   * @param searchTerm - The term to verify is in the first row
   * @param tableSelector - Selector for the table element
   * @param balanceValue - The balance value to set (default: '0')
   * @param confirmButtonSelector - Selector for the confirmation button (default: '[data-testid="TableRevisionPagination-ConfirmDialog-Approve"]')
   * @param options - Optional configuration:
   *   - refreshAndSearchAfter: If true, refreshes page and searches again after confirmation
   *   - searchInputDataTestId: Data test ID for search input when refreshing (default: 'TableRevisionPagination-SearchInput-Dropdown-Input')
   *   - waitAfterConfirm: Timeout in ms after confirmation (default: 1000)
   */
  async changeBalanceAndConfirmArchive(
    searchTerm: string,
    tableSelector: string,
    balanceValue: string = '0',
    confirmButtonSelector: string = '[data-testid="TableRevisionPagination-ConfirmDialog-Approve"]',
    options?: {
      refreshAndSearchAfter?: boolean;
      searchInputDataTestId?: string;
      waitAfterConfirm?: number;
    }
  ): Promise<void> {
    // Check that the first row contains the search term
    await this.checkNameInLineFromFirstRow(searchTerm, tableSelector);

    // Change warehouse balances - pass table selector to scope to first row
    await this.changeWarehouseBalances(balanceValue, tableSelector);

    // Confirm the archive
    await this.clickButton('Да', confirmButtonSelector);

    // Wait for confirmation to process
    await this.page.waitForTimeout(options?.waitAfterConfirm || 1000);

    // Optionally refresh page and search again
    if (options?.refreshAndSearchAfter) {
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);

      // Refresh the page
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(1000);

      // Search again
      await this.searchTable(searchTerm, tableSelector, options.searchInputDataTestId || 'TableRevisionPagination-SearchInput-Dropdown-Input');

      // Wait for the table body to load
      await this.waitingTableBodyNoThead(tableSelector);
      await this.page.waitForTimeout(1000);
    }

    // Check that the balance is now the expected value - pass table selector to scope to first row
    await this.checkWarehouseBalances(balanceValue, tableSelector);
  }

  /**
   * Sets the warehouse revision balance to 0 for a single product
   * in the revisions table.
   *
   * This encapsulates the "search + wait + changeBalanceAndConfirmArchive"
   * pattern used in U003 Test Case 10.
   * @returns true if the operation was successful, false otherwise
   */
  async setRevisionBalanceToZeroForProduct(
    productName: string,
    tableSelector: string,
    options?: {
      searchInputDataTestId?: string;
      confirmButtonSelector?: string;
      refreshAndSearchAfter?: boolean;
      waitAfterConfirm?: number;
    }
  ): Promise<boolean> {
    try {
      const searchInputTestId = options?.searchInputDataTestId || 'TableRevisionPagination-SearchInput-Dropdown-Input';
      const confirmButtonSelector = options?.confirmButtonSelector || '[data-testid="TableRevisionPagination-ConfirmDialog-Approve"]';

      // Search for the product in the revisions table
      await this.searchTable(productName, tableSelector, searchInputTestId);
      await this.waitingTableBodyNoThead(tableSelector);

      // Change balance to 0 and confirm archive, with optional refresh/search
      await this.changeBalanceAndConfirmArchive(productName, tableSelector, '0', confirmButtonSelector, {
        refreshAndSearchAfter: options?.refreshAndSearchAfter ?? true,
        searchInputDataTestId: searchInputTestId,
        waitAfterConfirm: options?.waitAfterConfirm ?? 1000,
      });

      return true;
    } catch (error) {
      console.error(`Failed to set revision balance to 0 for product "${productName}": ${error}`);
      return false;
    }
  }
}
