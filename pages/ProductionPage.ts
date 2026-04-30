import { Page, Locator, BrowserContext, expect, TestInfo } from '@playwright/test';
import { PageObject } from '../lib/Page';
import * as SelectorsProductionPage from '../lib/Constants/SelectorsProductionPage';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { expectSoftWithScreenshot } from '../lib/utils/utilities';

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

  private parseDateForDelta(dateText: string): Date | null {
    const parts = dateText.trim().split(/\s+/);
    if (parts.length < 2) {
      return null;
    }
    const [day, month, year] = parts[0].split('.');
    const [hour, minute] = parts[1].split(':');
    if (!day || !month || !year || !hour || !minute) {
      return null;
    }

    const parsed = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10),
      Number.parseInt(hour, 10),
      Number.parseInt(minute, 10),
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private calculateBusinessDeltaHours(dateA: Date, dateB: Date): number {
    const getWorkingMinutes = (earlier: Date, later: Date): number => {
      let totalMinutes = 0;
      let current = new Date(earlier);
      while (current < later) {
        const month = current.getMonth();
        const date = current.getDate();
        const day = current.getDay();
        const hour = current.getHours();
        
        // Exclude weekends (Sat/Sun) and New Year holidays (Jan 1-10)
        const isWeekend = day === 0 || day === 6;
        const isNewYearHoliday = month === 0 && date >= 1 && date <= 10;
        
        if (!isWeekend && !isNewYearHoliday && hour >= 11 && hour < 19) {
          totalMinutes += 1;
        }
        current.setMinutes(current.getMinutes() + 1);
      }
      return totalMinutes;
    };

    let sign = -1;
    let minutes = 0;
    if (dateA <= dateB) {
      minutes = getWorkingMinutes(dateA, dateB);
    } else {
      sign = 1;
      minutes = getWorkingMinutes(dateB, dateA);
    }

    return Math.round(((sign * minutes) / 60) * 100) / 100;
  }

  async verifyDeltasOnTaskPage(
    targetPage: Page,
    isSingleTest: boolean,
    iterations: number,
    testInfo: TestInfo,
  ): Promise<void> {
    const isUserPage = targetPage.url().includes('task-by-user');
    const taskTable = targetPage.locator(
      isUserPage ? SelectorsProductionPage.TASK_BY_USER_EXECUTIVE_TABLE : SelectorsProductionPage.TASK_BY_EQUIPMENT_EXECUTIVE_TABLE,
    );
    await taskTable.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });

    const rowLocator = taskTable.locator('tbody tr');
    const rowCount = await rowLocator.count();
    const maxIterations = isSingleTest ? 1 : (iterations || rowCount);
    logger.log(
      `[ERP-3482] Found ${rowCount} rows on ${isUserPage ? 'User' : 'Equipment'} task page. Checking up to ${maxIterations}.`,
    );

    for (let i = 0; i < Math.min(rowCount, maxIterations); i++) {
      const currentRow = rowLocator.nth(i);

      const startCell = currentRow
        .locator(isUserPage ? SelectorsProductionPage.TASK_BY_USER_REQUIRED_TIME_CELL : SelectorsProductionPage.TASK_BY_EQUIPMENT_SHIPMENT_DATE_CELL)
        .first();
      const endCell = currentRow
        .locator(isUserPage ? SelectorsProductionPage.TASK_BY_USER_CALCULATED_TIME_CELL : SelectorsProductionPage.TASK_BY_EQUIPMENT_CALCULATED_CELL)
        .first();
      const deltaCell = currentRow
        .locator(isUserPage ? SelectorsProductionPage.TASK_BY_USER_DELTA_TIME_CELL : SelectorsProductionPage.TASK_BY_EQUIPMENT_DELTA_TIME_CELL)
        .first();

      if ((await startCell.count()) === 0 || (await deltaCell.count()) === 0) {
        continue;
      }

      const startRaw = await startCell.innerText();
      const endRaw = (await endCell.count()) > 0 ? await endCell.innerText() : 'MISSING';
      const deltaRaw = await deltaCell.innerText();

      const startDate = this.parseDateForDelta(startRaw);
      const endDate = this.parseDateForDelta(endRaw);
      if (!startDate || !endDate) {
        continue;
      }

      const actualDelta = Number.parseFloat(deltaRaw.replace(',', '.'));
      const expectedDelta = this.calculateBusinessDeltaHours(startDate, endDate);
      const difference = Math.round(Math.abs(actualDelta - expectedDelta) * 100) / 100;
      const isPass = difference <= 0.02;

      await this.highlightElement(deltaCell, {
        backgroundColor: isPass ? '#c8e6c9' : '#ffcdd2',
        border: isPass ? '2px solid #2e7d32' : '2px solid #c62828',
        color: '#000000',
      });

      if (!isPass) {
        logger.error(
          `FAILURE on ${targetPage.url()} Row ${i + 1}: Start="${startRaw}", End="${endRaw}", Expected=${expectedDelta}, Actual=${actualDelta}`,
        );
      }

      await expectSoftWithScreenshot(
        targetPage,
        () => {
          expect.soft(
            difference,
            `Row ${i + 1}: Delta mismatch (Expected: ${expectedDelta}, Actual: ${actualDelta})`,
          ).toBeLessThanOrEqual(0.02);
        },
        `ERP-3482 delta check row ${i + 1}`,
        testInfo,
      );
    }
  }

  async processWorkloadView(
    context: BrowserContext,
    switchSelector: string,
    isSingleTest: boolean,
    iterations: number,
    testInfo: TestInfo,
  ): Promise<void> {
    const switchItem = this.page.locator(switchSelector);
    await switchItem.scrollIntoViewIfNeeded();
    await switchItem.click();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(switchItem).toHaveClass(/switch-yui-kit-active/, { timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `ERP-3482 switch active ${switchSelector}`,
      testInfo,
    );
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(TIMEOUTS.LONG);

    const workloadTable = this.page.locator(SelectorsProductionPage.PRODUCTION_WORKLOAD_TABLE);
    await workloadTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });

    const rows = workloadTable.locator('tbody tr');
    const rowCount = await rows.count();
    const iterationsToRun = isSingleTest ? 1 : (iterations || rowCount);

    for (let i = 0; i < Math.min(rowCount, iterationsToRun); i++) {
      const row = rows.nth(i);
      await row.scrollIntoViewIfNeeded();
      const firstCell = row.locator(SelectorsProductionPage.WORKLOAD_ROW_FIRST_CELL).first();

      const [newPage] = await Promise.all([
        context.waitForEvent('page', { timeout: WAIT_TIMEOUTS.PAGE_RELOAD }),
        firstCell.click(),
      ]);

      try {
        await newPage.waitForLoadState('networkidle');
        await this.verifyDeltasOnTaskPage(newPage, isSingleTest, iterations, testInfo);
      } finally {
        await newPage.close();
      }
    }
  }
}
