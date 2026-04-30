/**
 * Archive rows on the global filebase (База файлов) after searching by a scoped term.
 * Used by U005 cleanup (U005_image*) and U006 Archive (U006_image*).
 */

import { expect, type Page, type TestInfo } from '@playwright/test';
import { SELECTORS } from '../../config';
import logger from '../utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../../pages/PartsDatabasePage';
import * as SelectorsFileComponents from '../Constants/SelectorsFileComponents';
import * as SelectorsPartsDataBase from '../Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../utils/utilities';

export async function archiveFilebaseRowsBySearchTerm(page: Page, searchTerm: string, testInfo: TestInfo): Promise<void> {
  const detailsPage = new CreatePartsDatabasePage(page);

  await allure.step('Filebase: navigate to filebase page', async () => {
    await detailsPage.goto(SELECTORS.MAINMENU.FILES.URL);
    await page.waitForLoadState('load');
    logger.info('Navigated to filebase page');
  });

  await allure.step("Filebase: verify table visible", async () => {
    const table = page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE);
    await expectSoftWithScreenshot(
      page,
      async () => {
        await expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify filebase table is visible',
      testInfo,
    );
    await detailsPage.waitAndHighlight(table);
  });

  await allure.step(`Filebase: search for '${searchTerm}'`, async () => {
    const searchInput = page.locator(SelectorsPartsDataBase.SEARCH_DROPDOWN_INPUT);
    await expectSoftWithScreenshot(
      page,
      async () => {
        await expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
      },
      'Verify search input is visible',
      testInfo,
    );
    await detailsPage.highlightElement(searchInput, HIGHLIGHT_PENDING);
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
    await page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    logger.info(`Searched filebase for '${searchTerm}'`);
  });

  await allure.step('Filebase: archive all matching rows (bottom-up)', async () => {
    const table = page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE);
    await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    const rows = table.locator('tbody tr');
    let rowCount = await rows.count();
    logger.log(`Found ${rowCount} filebase rows to archive for search '${searchTerm}'`);
    if (rowCount === 0) {
      logger.log('No filebase rows — nothing to archive');
      return;
    }

    let archivedCount = 0;
    while (rowCount > 0) {
      const lastIndex = rowCount - 1;
      const rowToArchive = rows.nth(lastIndex);
      const tdElements = rowToArchive.locator('td');
      const tdCount = await tdElements.count();
      if (tdCount === 0) {
        logger.log('Empty row — stopping filebase archive loop');
        break;
      }

      await detailsPage.highlightElement(rowToArchive, HIGHLIGHT_ERROR);
      await rowToArchive.click();
      // eslint-disable-next-line playwright/no-wait-for-timeout -- UI settle after row select
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      const archiveButton = page.locator(SelectorsFileComponents.BASE_FILE_BUTTON_ARCHIVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(archiveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify archive button is visible',
        testInfo,
      );
      await detailsPage.highlightElement(archiveButton, HIGHLIGHT_ERROR);
      await archiveButton.click();
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for dialog
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const confirmDialog = page.locator(SelectorsFileComponents.BASE_FILE_BAN_DIALOG);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(confirmDialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify confirmation dialog is visible',
        testInfo,
      );
      await detailsPage.highlightElement(confirmDialog, HIGHLIGHT_SUCCESS);

      const yesButton = page.locator(SelectorsFileComponents.BASE_FILE_BAN_DIALOG_YES);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(yesButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify Yes button is visible',
        testInfo,
      );
      await detailsPage.highlightElement(yesButton, HIGHLIGHT_SUCCESS);
      await yesButton.click();
      await page.waitForLoadState('load');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      archivedCount++;
      rowCount = await rows.count();
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    }
    logger.log(`Archived ${archivedCount} filebase item(s) for '${searchTerm}'`);
  });

  await allure.step('Filebase: verify no content rows remain for current search', async () => {
    const table = page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE);
    const rows = table.locator('tbody tr');
    const finalRowCount = await rows.count();
    let contentRowCount = 0;
    for (let i = 0; i < finalRowCount; i++) {
      const row = rows.nth(i);
      const tdCount = await row.locator('td').count();
      if (tdCount > 0) contentRowCount++;
    }
    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(contentRowCount).toBe(0);
      },
      `Verify filebase has no content rows after archive (${searchTerm}): ${contentRowCount} content rows`,
      testInfo,
    );
  });
}
