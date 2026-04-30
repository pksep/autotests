import { test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { ENV } from '../config';
import { ProductionPage } from '../pages/ProductionPage';
import * as SelectorsProductionPage from '../lib/Constants/SelectorsProductionPage';
import { TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

/**
 * ERP-3482 - Verify "Дельта по времени" column on production workload tables.
 * Logic: Working hours 11:00-19:00 (GMT+6), skips weekends and New Year holidays (Jan 1-10).
 * Formula: Required Time - Calculated Time.
 * Tolerance: ±0.02 hours.
 */

export const runERP_3482 = (isSingleTest: boolean = false, iterations: number = 0) => {
  test.use({ timezoneId: 'Asia/Omsk' });

  test('ERP-3482 - Workload By Equipment', async ({ page, context }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const productionPage = new ProductionPage(page);
    await allure.step('Navigate to production page and open workload accordion', async () => {
        await page.goto(`${ENV.BASE_URL}production`);
        const accordionBtn = page.locator(SelectorsProductionPage.PRODUCTION_WORKLOAD_ACCORDION_BUTTON);
        await accordionBtn.click();
    });
    await productionPage.processWorkloadView(
      context,
      SelectorsProductionPage.PRODUCTION_WORKLOAD_SWITCH_ITEM_0,
      isSingleTest,
      iterations,
      testInfo,
    );
  });

  test('ERP-3482 - Workload By Performer', async ({ page, context }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const productionPage = new ProductionPage(page);
    await allure.step('Navigate to production page and open workload accordion', async () => {
        await page.goto(`${ENV.BASE_URL}production`);
        const accordionBtn = page.locator(SelectorsProductionPage.PRODUCTION_WORKLOAD_ACCORDION_BUTTON);
        await accordionBtn.click();
    });
    await productionPage.processWorkloadView(
      context,
      SelectorsProductionPage.PRODUCTION_WORKLOAD_SWITCH_ITEM_1,
      isSingleTest,
      iterations,
      testInfo,
    );
  });
};
