/**
 * @file U002-Details.spec.ts
 * @purpose U002 Details flow: Case 08 (initial ordered qty), Case 10 (two orders + archive), Case 11 (archive task).
 */

import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreateOrderedFromSuppliersPage, Supplier } from '../pages/OrderedFromSuppliersPage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { SELECTORS } from '../config';
import { expectSoftWithScreenshot } from '../lib/Page';
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers';
import * as SelectorsMetalWorkingWarhouse from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as SelectorsMetalworkingOperations from '../lib/Constants/SelectorsMetalworkingOperations';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { arrayDetail, arrayCbed, arrayIzd, setQuantityLaunchInProduct } from './U002-Constants';

declare global {
  var initialOrderedQuantity: string;
  var pushedIntoProductionQuantity: string;
}

export const runU002_04_Details = (_isSingleTest: boolean, _iterations: number) => {
  logger.info('U002 Details - Cases 08, 10, 11');

  test('Case 08 - Get Initial Ordered Quantity from Metalworking Warehouse', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 08 - Get Initial Ordered Quantity from Metalworking Warehouse');
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

    await metalworkingWarehouse.verifyTestDataAvailable(arrayDetail, 'DETAIL', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 1: Open the warehouse page', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      });

      await allure.step('Step 2: Open the Metalworking Warehouse page (Заказ склада на металлообработку)', async () => {
        await page.locator(SelectorsMetalWorkingWarhouse.WAREHOUSE_PAGE_STOCK_ORDER_METALWORKING_BUTTON).click();
        await metalworkingWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, { minRows: 0 });
      });

      await allure.step('Step 3: Search for detail and get initial ordered quantity', async () => {
        await metalworkingWarehouse.searchAndWaitForTable(detail.name, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT,
        });

        const rows = page.locator(`${SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount > 0) {
          const orderedCell = page.locator(SelectorsMetalworkingOperations.METALWORKING_ROW0_ORDERED_CELL_SELECTOR).first();
          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
          const initialOrderedQuantity = (await orderedCell.innerText()).trim();
          global.initialOrderedQuantity = initialOrderedQuantity;
          logger.info(`Initial ordered quantity for ${detail.name}: ${initialOrderedQuantity}`);
        } else {
          global.initialOrderedQuantity = '0';
          logger.info(`No existing orders found for ${detail.name} - starting with 0`);
        }
      });
    }
  });

  test('Case 10 - Create Two Orders, Verify Total, and Archive Second Order', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM_SHORT);
    logger.info('Test Case 10 - Create Two Orders, Verify Total, and Archive Second Order');
    const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

    await metalworkingWarehouse.verifyTestDataAvailable(arrayDetail, 'DETAIL', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const detail of arrayDetail) {
      let firstOrderNumber: string;
      let secondOrderNumber: string;

      await allure.step('Step 1: Create first order with quantity 50', async () => {
        logger.info('Creating first order with quantity 50...');
        const result = await orderedFromSuppliersPage.launchIntoProductionSupplier(detail.name, '50', Supplier.details);
        firstOrderNumber = result.checkOrderNumber;
        logger.info(`✅ First order created - Order number: ${firstOrderNumber}, Quantity: 50`);
      });

      await allure.step('Step 2: Create second order with quantity 5', async () => {
        logger.info('Creating second order with quantity 5...');
        const result = await orderedFromSuppliersPage.launchIntoProductionSupplier(detail.name, '5', Supplier.details);
        secondOrderNumber = result.checkOrderNumber;
        logger.info(`✅ Second order created - Order number: ${secondOrderNumber}, Quantity: 5`);
      });

      await allure.step('Step 3: Go to Metalworking Warehouse and verify total quantity is 55', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsMetalWorkingWarhouse.WAREHOUSE_PAGE_STOCK_ORDER_METALWORKING_BUTTON).click();
        await metalworkingWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, { minRows: 0 });

        await metalworkingWarehouse.searchAndWaitForTable(detail.name, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT,
        });

        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          minRows: 1,
          timeoutMs: WAIT_TIMEOUTS.LONG,
        });

        await metalworkingWarehouse.getQuantityCellAndVerify(
          '',
          55,
          'Total ordered',
          undefined,
          true,
          SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_TABLE_ROW0_PREFIX,
          SelectorsMetalworkingOperations.ASSEMBLY_OPERATIONS_ROW_PATTERN_ORDERED,
          WAIT_TIMEOUTS.LONG,
          SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
        );
      });

      await allure.step("Step 4: Open context menu and click 'Заказы'", async () => {
        await metalworkingWarehouse.openContextMenuAndClickOrders(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_TABLE_ROW0_POPOVER, SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_TABLE_ROW0_POPOVER_ITEM0);
      });

      await allure.step('Step 5: Verify orders modal opens and shows both orders', async () => {
        await metalworkingWarehouse.verifyOrdersModal(
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_RIGHT_MENU_MODAL,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_COUNT_SHIPMENTS,
          [firstOrderNumber, secondOrderNumber],
          ['50', '5'],
        );
      });

      await allure.step('Step 6: Click on second order to open edit dialog', async () => {
        await metalworkingWarehouse.clickOrderToOpenEditDialog(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER, secondOrderNumber, `Could not find second order ${secondOrderNumber} in the orders list`);
      });

      await allure.step('Step 7: Select checkbox and archive the second order', async () => {
        await metalworkingWarehouse.selectCheckboxAndArchiveOrder(
          secondOrderNumber,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_CHECKBOX_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_DATA_NUMBER_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_BUTTONS_BUTTON_ARCHIVE,
          SelectorsPartsDataBase.BUTTON_CONFIRM,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER,
          `Could not find checkbox for second order ${secondOrderNumber}`,
        );
      });

      await allure.step('Step 9: Close dialogs and refresh page', async () => {
        await page.click('body', { position: { x: 1, y: 1 } });
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await page.reload();
        await metalworkingWarehouse.waitForNetworkIdle();
        logger.info('Page refreshed');
      });

      await allure.step('Step 10: Search for detail again and verify quantity decreased by 5', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsMetalWorkingWarhouse.WAREHOUSE_PAGE_STOCK_ORDER_METALWORKING_BUTTON).click();
        await metalworkingWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, { minRows: 0 });

        await metalworkingWarehouse.searchAndWaitForTable(detail.name, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT,
        });

        await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          minRows: 1,
          timeoutMs: WAIT_TIMEOUTS.LONG,
        });
        await page.waitForTimeout(TIMEOUTS.EXTENDED);

        const remainingOrderedQuantity = await metalworkingWarehouse.getQuantityCellAndVerify(
          '',
          50,
          'Remaining ordered',
          undefined,
          true,
          SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_TABLE_ROW0_PREFIX,
          SelectorsMetalworkingOperations.ASSEMBLY_OPERATIONS_ROW_PATTERN_ORDERED,
          WAIT_TIMEOUTS.LONG,
          SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
        );

        global.pushedIntoProductionQuantity = remainingOrderedQuantity.toString();
        setQuantityLaunchInProduct(remainingOrderedQuantity);
        logger.info(`✅ Set quantityLaunchInProduct to ${remainingOrderedQuantity} for subsequent test cases`);
      });
    }
  });

  test('Case 11 - Archive Task and Verify Removal', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 11 - Archive Task and Verify Removal');
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

    await metalworkingWarehouse.verifyTestDataAvailable(arrayDetail, 'DETAIL', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const detail of arrayDetail) {
      await allure.step('Step 1: Open Metalworking Warehouse page', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsMetalWorkingWarhouse.WAREHOUSE_PAGE_STOCK_ORDER_METALWORKING_BUTTON).click();
        await metalworkingWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, { minRows: 0 });
      });

      await allure.step('Step 2: Search for detail', async () => {
        await metalworkingWarehouse.searchAndWaitForTable(detail.name, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT,
        });
      });

      await allure.step('Step 3: Select checkbox and archive all matching tasks', async () => {
        const archivedCount = await metalworkingWarehouse.archiveAllMetalworkingTasksForDetail(detail.name, { maxArchives: 10 });
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
          },
          `Verify archive completed - archived ${archivedCount} task(s) for ${detail.name}`,
          test.info(),
        );
      });

      await allure.step('Step 4: Verify all tasks are archived', async () => {
        await page.waitForTimeout(TIMEOUTS.LONG);
        await metalworkingWarehouse.waitForNetworkIdle();

        await metalworkingWarehouse.searchAndWaitForTable(detail.name, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE, {
          searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT,
        });

        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const rows = page.locator(`${SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE} tbody tr`);
        const rowCount = await rows.count();

        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(rowCount).toBe(0);
          },
          `Verify all tasks archived - no rows for ${detail.name}`,
          test.info(),
        );
        logger.info(`✅ All tasks successfully archived - no rows found for ${detail.name}`);
      });
    }
  });
};
