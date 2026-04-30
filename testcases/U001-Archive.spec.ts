/**
 * @file U001-Archive.spec.ts
 * @purpose Test Suite 10: Archive Operations (Test Cases 33-35)
 *
 * This suite handles:
 * - Test Case 33: Archive Metalworking Warehouse Task All
 * - Test Case 34: Archive Assembly Warehouse Task All
 * - Test Case 35: Moving Task For Shipment To The Archive
 */

import * as MetalWorkingWarhouseSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as SelectorsAssemblyWarehouse from '../lib/Constants/SelectorsAssemblyWarehouse';
import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import { Click } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import logger from '../lib/utils/logger';
import { designation, nameProduct } from './U001-Constants';

export const runU001_10_Archive = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Start of the test: U001 Archive Operations (Test Cases 33-35)`);

  test('Case 33 - Archive Metalworking Warehouse Task All', async ({
    // doc test case 28
    page,
  }) => {
    logger.log('Test Case 33 - Archive Metalworking Warehouse Task All');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    const warehouseTable = MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the metalworking warehouse page', async () => {
      const selector = MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE;
      await metalworkingWarehouse.findTable(selector);
      await page.waitForTimeout(TIMEOUTS.LONG);
      await page.waitForLoadState('networkidle');
      // Wait for table to be visible; allow empty table (no rows) so test does not timeout when there are no tasks
      await metalworkingWarehouse.waitingTableBody(warehouseTable, {
        minRows: 0,
        timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD,
      });
    });

    await allure.step('Step 03: Search product', async () => {
      await metalworkingWarehouse.searchTable(designation, warehouseTable, MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_SEARCH_INPUT);

      await metalworkingWarehouse.waitingTableBody(warehouseTable, {
        minRows: 0,
        timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD,
      });
    });

    await allure.step('Step 04-06: Archive all matching items', async () => {
      // Logic same as products/details: search, then delete from bottom up; re-search after each archive
      // because this list does not refresh after archiving. All actions on metalworking page.
      let iterationCount = 0;
      const maxIterations = 100;

      while (iterationCount < maxIterations) {
        iterationCount++;
        await metalworkingWarehouse.searchTable(designation, warehouseTable, MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_SEARCH_INPUT);
        await metalworkingWarehouse.waitingTableBody(warehouseTable, { minRows: 0, timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        const rows = page.locator(`${warehouseTable} tbody tr`).filter({ hasText: designation });
        const rowCount = await rows.count();
        let lastDataRowIndex = -1;
        for (let i = 0; i < rowCount; i++) {
          const firstCell = rows.nth(i).locator('td').first();
          const hasNonCheckboxInput = (await firstCell.locator('input:not([type="checkbox"])').count()) > 0;
          if (!hasNonCheckboxInput) lastDataRowIndex = i;
        }
        if (lastDataRowIndex === -1) break;

        const lastRow = rows.nth(lastDataRowIndex);
        const checkboxInput = lastRow.locator('td').first().locator('input[type="checkbox"]');
        await checkboxInput.scrollIntoViewIfNeeded();
        await checkboxInput.click();
        await page.waitForTimeout(TIMEOUTS.SHORT);

        await metalworkingWarehouse.clickOnTheTableHeaderCell(15, warehouseTable);
        await metalworkingWarehouse.clickButton('Архив', MetalWorkingWarhouseSelectors.BUTTON_ARCHIVE, undefined, { waitForEnabled: true, failIfDisabled: true });
        await page.waitForTimeout(200);
        await metalworkingWarehouse.clickButton('Да', PartsDBSelectors.BUTTON_CONFIRM);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator(warehouseTable).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        await metalworkingWarehouse.waitingTableBody(warehouseTable, { minRows: 0, timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD });
      }
    });
  });

  test('Case 34 - Archive Assembly Warehouse Task All', async ({
    // doc test case 29
    page,
  }) => {
    logger.log('Test Case 34 - Archive Assembly Warehouse Task All');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);
    const warehouseTable = SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE;

    await allure.step('Step 01-02: Open the warehouse page and assembly warehouse page', async () => {
      const selector = SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON;
      await assemblyWarehouse.navigateToPageAndWaitForTable(SELECTORS.MAINMENU.WAREHOUSE.URL, selector, warehouseTable);
    });

    await allure.step('Step 03: Search product', async () => {
      await assemblyWarehouse.searchTable(designation, warehouseTable, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT);

      await assemblyWarehouse.waitingTableBody(warehouseTable, {
        minRows: 0,
        timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD,
      });
    });

    await allure.step('Step 04-06: Archive item', async () => {
      await assemblyWarehouse.archiveItem(page, designation, warehouseTable, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_BUTTON_ARCHIVE_ASSEMBLY, SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_BAN_MODAL_YES_BUTTON, {
        useCheckboxMark: true,
        headerCellIndex: 16,
        checkColumnIndexForCheckbox: 5,
      });
    });
  });

  test('Case 35 - Moving Task For Shipment To The Archive', async ({
    // doc test case 30
    page,
  }) => {
    logger.log('Test Case 35 - Moving Task For Shipment To The Archive');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    let numberColumn: number;

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 02: Search product', async () => {
      // Using table search we look for the value of the variable
      await loadingTaskPage.searchAndWaitForTable(nameProduct, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.SHIPMENTS_TABLE_BODY, {
        useRedesign: true,
        timeoutBeforeWait: 1000,
        searchInputDataTestId: LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT,
      });
    });

    await allure.step('Step 03-06: Archive all matching items', async () => {
      // Loop through all search results and archive them
      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100; // Safety limit to prevent infinite loops

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        logger.log(`Archive iteration ${iterationCount}`);

        // Wait for table to be ready (allow empty table since items may have been archived)
        await loadingTaskPage.waitingTableBody(LoadingTasksSelectors.SHIPMENTS_TABLE, {
          minRows: 0,
          timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD,
        });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        // Check if there are any rows in the table
        const rows = page.locator(`${LoadingTasksSelectors.SHIPMENTS_TABLE_BODY} tr`);
        const rowCount = await rows.count();

        if (rowCount === 0) {
          logger.log('No more items to archive');
          hasMoreItems = false;
          break;
        }

        // Check that the first row contains the variable name
        await loadingTaskPage.checkNameInLineFromFirstRow(nameProduct, LoadingTasksSelectors.SHIPMENTS_TABLE);

        // Find the checkbox column and click (column 2)
        await loadingTaskPage.getValueOrClickFromFirstRow(LoadingTasksSelectors.SHIPMENTS_TABLE, 2, Click.Yes, Click.No);

        // Archive the item with verification
        await loadingTaskPage.archiveItem(page, nameProduct, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.buttonArchive, PartsDBSelectors.BUTTON_CONFIRM, {
          verifyArchived: true,
          verifyTableSelector: LoadingTasksSelectors.SHIPMENTS_TABLE,
          tableBodySelector: LoadingTasksSelectors.SHIPMENTS_TABLE_BODY,
          searchInputDataTestId: LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT,
        });

        // Check if there are still items left
        const remainingRows = page.locator(`${LoadingTasksSelectors.SHIPMENTS_TABLE_BODY} tr`);
        const remainingCount = await remainingRows.count();

        if (remainingCount === 0) {
          logger.log('All items archived');
          hasMoreItems = false;
        } else {
          logger.log(`Remaining items: ${remainingCount}`);
        }
      }

      if (iterationCount >= maxIterations) {
        console.warn(`Reached maximum iterations (${maxIterations}). Some items may not have been archived.`);
      }
    });
  });
};
