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

  async changeWarehouseBalances(quantity: string) {
    await this.page.locator('[data-testid="InputNumber-Input"]').fill(quantity);
    await this.page.locator('[data-testid="InputNumber-Input"]').press('Enter');
  }

  async checkWarehouseBalances(quantity: string) {
    await this.page.waitForTimeout(1000);
    const checkBalanceCell = this.page.locator('[data-testid="TableRevisionPagination-TableData-Current"]');
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

    // Change warehouse balances
    await this.changeWarehouseBalances(balanceValue);

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

    // Check that the balance is now the expected value
    await this.checkWarehouseBalances(balanceValue);
  }
}
