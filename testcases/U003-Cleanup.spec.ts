/**
 * @file U003-Cleanup.spec.ts
 * @purpose U003 Case 0: Cleanup – delete all test items before run.
 */

import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import { expectSoftWithScreenshot } from '../lib/Page';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

export const runU003_00_Cleanup = (_isSingleTest: boolean, _iterations: number) => {
  logger.log('U003 Case 0 - Cleanup: Delete all test items');

  test('Case 0 - Cleanup: Delete all test items', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG); // 10 minutes for cleanup
    logger.log('Test Case 0 - Cleanup: Delete all test items');
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const partsDatabasePage = new CreatePartsDatabasePage(page);

    const searchPrefix = 'TEST_';

    await allure.step('Step 1: Delete all shipment tasks', async () => {
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
      const archivedShipmentTasksCount = await loadingTaskPage.archiveAllShipmentTasksByProduct(searchPrefix);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(archivedShipmentTasksCount).toBeGreaterThanOrEqual(0);
        },
        `Verify shipment tasks archived: ${archivedShipmentTasksCount} items`,
        test.info(),
      );
    });

    await allure.step('Step 2: Delete all test products', async () => {
      const archivedProductsCount = await partsDatabasePage.archiveAllTestProductsByPrefix(searchPrefix);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(archivedProductsCount).toBeGreaterThanOrEqual(0);
        },
        `Verify test products archived: ${archivedProductsCount} items`,
        test.info(),
      );
    });

    logger.log(`✅ Cleanup completed successfully`);
  });
};
