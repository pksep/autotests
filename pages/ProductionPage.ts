import { Page, Locator } from '@playwright/test';
import { PageObject } from '../lib/Page';
import * as SelectorsProductionPage from '../lib/Constants/SelectorsProductionPage';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

/**
 * ProductionPage class for interacting with the Production page
 * Handles table interactions, row validation, and menu operations
 */
export class ProductionPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  /**
   * Navigate to the production page
   */
  async gotoProductionPage(): Promise<void> {
    await this.page.goto('/production');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify table section is expanded by checking for scroll wrapper tracks
   * @returns true if table is expanded (2+ tracks found), false otherwise
   */
  async verifyTableSectionExpanded(): Promise<boolean> {
    const scrollTracks = this.page.locator(SelectorsProductionPage.SCROLL_WRAPPER_TRACK_CLASS);
    let trackCount = await scrollTracks.count();

    if (trackCount < 2) {
      const accordionSummary = this.page.locator(SelectorsProductionPage.EQUIPMENT_ACCORDION_SUMMARY);
      await accordionSummary.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      trackCount = await scrollTracks.count();
    }

    return trackCount >= 2;
  }

  /**
   * Get the Equipment table locator
   */
  getEquipmentTable(): Locator {
    return this.page.locator(SelectorsProductionPage.EQUIPMENT_TABLE);
  }

  /**
   * Get the User table locator
   */
  getUserTable(): Locator {
    return this.page.locator(SelectorsProductionPage.PRODUCTION_TABLE);
  }

  /**
   * Wait for table to be visible and ready
   */
  async waitForTableReady(table: Locator): Promise<void> {
    await table.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
    await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
  }

  /**
   * Collect main rows from a table, excluding sub-rows with -Operation or -NonOperation
   * @param table - The table locator
   * @param maxRows - Maximum number of main rows to collect
   * @returns Array of main row locators
   */
  async collectMainRows(table: Locator, maxRows: number = 15): Promise<Locator[]> {
    const allRows = table.locator('tbody tr');
    const rowCount = await allRows.count();
    const mainRows: Locator[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row = allRows.nth(i);
      const testId = await row.getAttribute('data-testid');
      if (testId && !testId.includes('-Operation') && !testId.includes('-NonOperation')) {
        mainRows.push(row);
        if (mainRows.length >= maxRows) {
          break;
        }
      }
    }

    return mainRows;
  }

  /**
   * Get row number from data-testid
   * @param testId - The data-testid attribute value
   * @returns Row number as string, or null if not found
   */
  extractRowNumber(testId: string | null): string | null {
    if (!testId) return null;
    const match = testId.match(/Row(\d+)$/);
    return match ? match[1] : null;
  }
}
