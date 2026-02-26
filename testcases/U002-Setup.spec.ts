/**
 * @file U002-Setup.spec.ts
 * @purpose U002 Setup: cleanup existing test data and initialize arrays for DataSetup (Cases 05–07).
 */

import { test } from '@playwright/test';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { arrayDetail, arrayCbed, arrayIzd } from './U002-Constants';
import logger from '../lib/utils/logger';

export const runU002_01_Setup = (_isSingleTest: boolean, _iterations: number) => {
  logger.info('U002 Setup - Ensure test data exists');

  test('Setup - Ensure test data exists', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Setup - Ensuring test data exists');
    const partsDatabasePage = new CreatePartsDatabasePage(page);

    await allure.step('Clean up existing test items', async () => {
      await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabasePage.waitForNetworkIdle();

      logger.info('=== CLEANING UP EXISTING TEST ITEMS ===');

      await partsDatabasePage.cleanupTestItemsByPrefix(
        'DETAIL',
        'DEFAULT_DETAIL',
        SelectorsPartsDataBase.SEARCH_DETAIL_ATTRIBUT,
        SelectorsPartsDataBase.DETAIL_TABLE,
        'last',
      );

      await partsDatabasePage.cleanupTestItemsByPrefix(
        'CBED',
        'DEFAULT_CBED',
        SelectorsPartsDataBase.SEARCH_CBED_ATTRIBUT,
        SelectorsPartsDataBase.CBED_TABLE,
        1,
      );

      await partsDatabasePage.cleanupTestItemsByPrefix(
        'IZD',
        'DEFAULT_IZD',
        SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT,
        SelectorsPartsDataBase.PRODUCT_TABLE,
        'first',
      );

      logger.info('=== CLEANUP COMPLETE ===');
    });

    await allure.step('Initialize empty test data arrays', async () => {
      arrayDetail.length = 0;
      arrayCbed.length = 0;
      arrayIzd.length = 0;
      logger.info('✅ Initialized empty test data arrays - Test Cases 5, 6, 7 will create the items');
    });

    await allure.step('Final verification', async () => {
      logger.info(`✅ Setup complete - Details: ${arrayDetail.length}, CBED: ${arrayCbed.length}, IZD: ${arrayIzd.length}`);
    });
  });
};
