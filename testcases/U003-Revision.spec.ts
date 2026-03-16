/**
 * @file U003-Revision.spec.ts
 * @purpose U003 Case 10: Set warehouse revision values to 0 for test products.
 */

import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import { expectSoftWithScreenshot } from '../lib/Page';
import { CreateRevisionPage } from '../pages/RevisionPage';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import { TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { TEST_PRODUCT_NAMES } from './U003-Constants';
import logger from '../lib/utils/logger';

export const runU003_05_Revision = (_isSingleTest: boolean, _iterations: number) => {
  logger.log('U003 Case 10 - Set warehouse revision values to 0');

  test('Case 10 - Set warehouse revision values to 0', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM); // 5 minutes
    logger.log('Test Case 10 - Set warehouse revision values to 0');
    const revisionPage = new CreateRevisionPage(page);
    const testProducts = TEST_PRODUCT_NAMES;

    await allure.step('Step 1: Open the warehouse page', async () => {
      await revisionPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await revisionPage.waitForNetworkIdle();
    });

    await allure.step('Step 2: Open the warehouse revisions page', async () => {
      await revisionPage.findTable(SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID);
      await page.waitForLoadState('networkidle');
      await revisionPage.waitingTableBodyNoThead(SelectorsRevision.WAREHOUSE_REVISION_PRODUCTS_TABLE);
    });

    await allure.step('Step 3: Set revision balances to 0 for all test products', async () => {
      for (const productName of testProducts) {
        logger.log(`Setting warehouse revision balance to 0 for product: ${productName}`);
        const success = await revisionPage.setRevisionBalanceToZeroForProduct(
          productName,
          SelectorsRevision.WAREHOUSE_REVISION_PRODUCTS_TABLE,
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(success).toBe(true);
          },
          `Verify revision balance set to 0 for product "${productName}"`,
          test.info(),
        );
      }
    });

    logger.log(`✅ All test products (${testProducts.length}) have been set to 0 in warehouse revisions`);
  });
};
