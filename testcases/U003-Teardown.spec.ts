/**
 * @file U003-Teardown.spec.ts
 * @purpose U003 Cases 11-13: Delete shipment task, delete test products, verify all deleted.
 */

import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import { expectSoftWithScreenshot } from '../lib/Page';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import * as SelectorsLoadingTasksPage from '../lib/Constants/SelectorsLoadingTasksPage';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

export const runU003_06_Teardown = (_isSingleTest: boolean, _iterations: number) => {
  logger.log('U003 Cases 11-13 - Teardown');

  test('Case 11 - Удаление задачи на отгрузку', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.log('Test Case 11 - Delete shipment task');
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const productNamesToArchive = ['TEST_PRODUCT'];

    await allure.step('Step 1: Перейти на страницу Задачи на отгрузку', async () => {
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
      const pageContainer = page.locator(SelectorsLoadingTasksPage.issueShipmentPage);
      await pageContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(pageContainer).toBeVisible();
        },
        'Verify Issue Shipment page is visible for Test Case 11',
        test.info(),
      );
    });

    await allure.step('Step 2: Архивировать все задачи для тестовых изделий', async () => {
      for (const name of productNamesToArchive) {
        logger.log(`Archiving all shipment tasks for product name: ${name}`);
        const archivedCount = await loadingTaskPage.archiveAllShipmentTasksByProduct(name);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
          },
          `Verify shipment tasks archived for "${name}": ${archivedCount} items`,
          test.info(),
        );
      }
    });
  });

  test('Case 12 - Delete all test products', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM);
    logger.log('Test Case 12 - Delete all test products');
    const partsDatabasePage = new CreatePartsDatabasePage(page);
    const searchPrefix = 'TEST_PRODUCT';

    await allure.step('Step 1: Open parts database and archive all test products (same logic as U001)', async () => {
      await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabasePage.waitForNetworkIdle();

      const searchProduct = page.locator(SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT).first();
      await searchProduct.fill(searchPrefix);
      await searchProduct.press('Enter');
      await partsDatabasePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100;
      let archivedCount = 0;

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        const rows = page.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }
        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const rowText = (await row.textContent()) ?? '';
          const firstCell = row.locator('td').first();
          const colspan = await firstCell.getAttribute('colspan');
          if (rowText.includes('Итого:') || colspan === '15') continue;

          const nameCell = row.locator('td').nth(2);
          const cellText = (await nameCell.textContent())?.trim() ?? '';
          if (cellText.startsWith(searchPrefix)) {
            await row.click();
            await partsDatabasePage.archiveAndConfirm(SelectorsPartsDataBase.BUTTON_ARCHIVE, SelectorsPartsDataBase.BUTTON_CONFIRM);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            archivedCount++;
          }
        }
        const remainingRows = page.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} tbody tr`);
        if ((await remainingRows.count()) === 0) hasMoreItems = false;
        else await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
        },
        `Verify test products archived: ${archivedCount} items`,
        test.info(),
      );
      logger.log(`All test products with prefix "${searchPrefix}" have been archived (${archivedCount} items)`);
    });
  });

  test('Case 13 - Verify all items are deleted', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.log('Test Case 13 - Verify all items are deleted');
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const partsDatabasePage = new CreatePartsDatabasePage(page);
    const productNameValue = 'TEST_PRODUCT';
    const searchPrefix = 'TEST_PRODUCT';

    await allure.step('Step 1: Verify all shipment tasks are deleted', async () => {
      const remainingCount = await loadingTaskPage.verifyAllShipmentTasksDeleted(productNameValue, test.info());
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingCount).toBe(0);
        },
        `Verify all shipment tasks deleted: expected 0, found ${remainingCount}`,
        test.info(),
      );
    });

    await allure.step('Step 2: Verify all test products are deleted', async () => {
      const remainingCount = await partsDatabasePage.verifyAllTestProductsDeleted(searchPrefix, test.info());
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingCount).toBe(0);
        },
        `Verify all test products deleted: expected 0, found ${remainingCount}`,
        test.info(),
      );
    });

    await allure.step('Step 3: Verify no orders exist in warehouse orders page', async () => {
      const remainingCount = await loadingTaskPage.verifyNoWarehouseOrdersForProduct(productNameValue, test.info());
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingCount).toBe(0);
        },
        `Verify all warehouse orders deleted: expected 0, found ${remainingCount}`,
        test.info(),
      );
    });

    await allure.step('Step 4: Verify no deficit entries exist for test products', async () => {
      const remainingCount = await loadingTaskPage.verifyNoDeficitEntriesForProduct(productNameValue, test.info());
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(remainingCount).toBe(0);
        },
        `Verify all deficit entries deleted: expected 0, found ${remainingCount}`,
        test.info(),
      );
    });
  });
};
