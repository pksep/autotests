/**
 * Reusable flows for U006 specs. Extracts repeated step sequences so spec files
 * stay thin and avoid god-object duplication.
 */

import { expect, type Page, type Locator, type TestInfo } from '@playwright/test';
import { SELECTORS } from '../../config';
import logger from '../utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../../pages/PartsDatabasePage';
import * as SelectorsPartsDataBase from '../Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import { HIGHLIGHT_ERROR } from '../Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../utils/utilities';

/**
 * Navigate to Parts DB, search for detail by exact name, then archive every matching row
 * (exact match on row text). Used by Cleanup 01–20 and Cleanup 21–22.
 */
export async function archiveMatchingDetailsInPartsDb(
  page: Page,
  detailName: string,
  testInfo: TestInfo,
): Promise<void> {
  const detailsPage = new CreatePartsDatabasePage(page);

  await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
    await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
    await page.waitForLoadState('load');
  });

  await allure.step('Step 2: Найдите все детали с точным совпадением имени', async () => {
    const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
    const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
    await expectSoftWithScreenshot(
      page,
      async () => {
        await expect.soft(searchInput).toBeVisible();
      },
      'Verify search input is visible',
      testInfo,
    );

    await searchInput.fill('');
    await searchInput.press('Enter');
    // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI
    await page.waitForTimeout(TIMEOUTS.STANDARD);
    await searchInput.fill(detailName);
    await searchInput.press('Enter');
    await page.waitForLoadState('load');
    // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI
    await page.waitForTimeout(TIMEOUTS.STANDARD);

    const rows = detailTable.locator('tbody tr');
    const rowCount = await rows.count();
    logger.log(`Found ${rowCount} rows in search results.`);

    if (rowCount === 0) {
      logger.log('No matching rows found for archiving.');
      return;
    }

    const matchingRows: Locator[] = [];
    for (let i = 0; i < rowCount; i++) {
      const rowLocator = rows.nth(i);
      let rowText: string | null;
      try {
        rowText = await rowLocator.textContent({ timeout: WAIT_TIMEOUTS.SHORT });
      } catch {
        continue;
      }
      if (rowText && rowText.trim() === detailName) {
        matchingRows.push(rowLocator);
      }
    }

    logger.log(`Found ${matchingRows.length} exact matches for '${detailName}'.`);

    if (matchingRows.length === 0) {
      logger.warn('No exact matches found for archiving.');
      return;
    }

    for (let i = matchingRows.length - 1; i >= 0; i--) {
      await allure.step(`Archiving row ${i + 1} out of ${matchingRows.length}`, async () => {
        const currentRow = matchingRows[i];
        await detailsPage.highlightElement(currentRow, HIGHLIGHT_ERROR);
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait after row click
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await currentRow.click();
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait after row click
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        const archiveButton = page.locator(SelectorsPartsDataBase.ARCHIVE_BUTTON);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(archiveButton).toBeVisible();
          },
          'Verify archive button is visible',
          testInfo,
        );
        await archiveButton.click();
        await page.waitForLoadState('load');

        const archiveModal = page.locator(SelectorsPartsDataBase.MODAL_CONFIRM_GENERIC);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(archiveModal).toBeVisible();
          },
          'Verify archive modal is visible',
          testInfo,
        );

        const yesButton = archiveModal.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(yesButton).toBeVisible();
          },
          'Verify Yes button is visible',
          testInfo,
        );
        await yesButton.click();
        await page.waitForLoadState('load');
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI
        await page.waitForTimeout(TIMEOUTS.STANDARD);
      });
    }

    logger.log(`All ${matchingRows.length} exact matching details have been archived.`);
  });
}
