import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import * as SelectorsFileComponents from '../lib/Constants/SelectorsFileComponents';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../lib/Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../lib/Page';
import { archiveMatchingDetailsInPartsDb } from '../lib/helpers/U006Flows';

export const runU006Archive = () => {
  test('00 - Archive All - Archive all items in filebase table', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Step 1: Navigate to filebase page', async () => {
      await detailsPage.goto(SELECTORS.MAINMENU.FILES.URL);
      await page.waitForLoadState('load');
      logger.info('Navigated to filebase page');
    });

    await allure.step("Step 2: Find the table with class 'table-yui-kit'", async () => {
      const table = page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify table is visible',
        test.info(),
      );

      // Highlight the table for visibility
      await detailsPage.waitAndHighlight(table);

      logger.info("Found table with class 'table-yui-kit'");
    });

    await allure.step("Step 3: Search for 'Test' and press Enter", async () => {
      // Find the search input field using the specific data-testid
      const searchInput = page.locator(SelectorsPartsDataBase.SEARCH_DROPDOWN_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify search input is visible',
        test.info(),
      );

      // Highlight the search input for visibility
      await detailsPage.highlightElement(searchInput, HIGHLIGHT_PENDING);

      // Clear any existing text and search for "Test"
      await searchInput.fill('Test');
      await searchInput.press('Enter');
      await page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      logger.info("Searched for 'Test' and pressed Enter");
    });

    await allure.step('Step 4: Archive all items in the table', async () => {
      const table = page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE);
      await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // When search returns no results, the table may have only thead (no tbody), so do not wait for tbody
      const rows = table.locator('tbody tr');
      let rowCount = await rows.count();
      logger.log(`Found ${rowCount} rows to archive`);
      if (rowCount === 0) {
        logger.log('Search returned no results (test items may already be archived) - nothing to archive');
      }

      let archivedCount = 0;

      // Continue until table is empty. Process from bottom up so removing a row does not shift indices.
      while (rowCount > 0) {
        const lastIndex = rowCount - 1;
        const rowToArchive = rows.nth(lastIndex);

        // Check if the row has actual content (td elements)
        const tdElements = rowToArchive.locator('td');
        const tdCount = await tdElements.count();

        if (tdCount === 0) {
          logger.log('Found empty row (no td elements) - search returned no results');
          break;
        }

        // Highlight the current row being processed
        await detailsPage.highlightElement(rowToArchive, HIGHLIGHT_ERROR);

        logger.log(`Processing row ${archivedCount + 1} (index ${lastIndex} from bottom)`);

        // Click the row to select it
        await rowToArchive.click();
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait after row click
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        // Find and click the Archive button (filebase page uses BaseFile-Buttons-Ban)
        const archiveButton = page.locator(SelectorsFileComponents.BASE_FILE_BUTTON_ARCHIVE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(archiveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify archive button is visible',
          test.info(),
        );

        // Highlight the archive button
        await detailsPage.highlightElement(archiveButton, HIGHLIGHT_ERROR);

        await archiveButton.click();
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        // Wait for and interact with the confirmation dialog (filebase uses BaseFile-BanDialog)
        const confirmDialog = page.locator(SelectorsFileComponents.BASE_FILE_BAN_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(confirmDialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify confirmation dialog is visible',
          test.info(),
        );

        // Highlight the dialog
        await detailsPage.highlightElement(confirmDialog, HIGHLIGHT_SUCCESS);

        // Click the Yes button in the dialog
        const yesButton = page.locator(SelectorsFileComponents.BASE_FILE_BAN_DIALOG_YES);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(yesButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          'Verify Yes button is visible',
          test.info(),
        );

        // Highlight the Yes button
        await detailsPage.highlightElement(yesButton, HIGHLIGHT_SUCCESS);

        await yesButton.click();
        await page.waitForLoadState('load');
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        archivedCount++;
        logger.log(`✅ Archived item ${archivedCount}`);

        // Update row count after archiving
        rowCount = await rows.count();
        logger.log(`Remaining rows: ${rowCount}`);

        // Small delay to make the process visible
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait after row click
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }

      logger.log(`✅ Successfully archived all ${archivedCount} items`);
      logger.info(`All items have been archived successfully. Total archived: ${archivedCount}`);
    });

    await allure.step('Step 5: Verify table is empty', async () => {
      const table = page.locator(SelectorsFileComponents.BASE_FILE_FILE_WINDOW_TABLE_TABLE);
      const rows = table.locator('tbody tr');
      const finalRowCount = await rows.count();

      // Check if there are any rows with actual content (td elements)
      let contentRowCount = 0;
      for (let i = 0; i < finalRowCount; i++) {
        const row = rows.nth(i);
        const tdElements = row.locator('td');
        const tdCount = await tdElements.count();
        if (tdCount > 0) {
          contentRowCount++;
        }
      }

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(contentRowCount).toBe(0);
        },
        `Verify table has no content rows: ${contentRowCount} content rows, ${finalRowCount} total rows`,
        test.info(),
      );
      logger.log(`✅ Table has no content rows (${contentRowCount} content rows, ${finalRowCount} total rows)`);
      logger.info('Table verification complete - all items archived');
    });
  });

  test('Cleanup 01 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 02 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME, test.info());
  });

  test('Cleanup 03 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 04 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 05 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 06 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 07 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 08 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 09 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 10 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 11 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 12 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 13 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 14 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 15 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 16 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 17 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 18 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 19 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });

  test('Cleanup 20 - Архивация всех совпадающих деталей (Cleanup) `${SelectorsPartsDataBase.TEST_DETAIL_NAME}`', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    await archiveMatchingDetailsInPartsDb(page, SelectorsPartsDataBase.TEST_DETAIL_NAME, test.info());
  });
};
