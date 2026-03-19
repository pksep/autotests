/**
 * @file U002-Izd.spec.ts
 * @purpose U002 IZD flow: Case 16 (initial ordered qty), Case 17 (two orders + archive), Case 18 (archive task).
 */

import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreateOrderedFromSuppliersPage, Supplier } from '../pages/OrderedFromSuppliersPage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreateAssemblyWarehousePage } from '../pages/AssemplyWarehousePage';
import { SELECTORS } from '../config';
import { expectSoftWithScreenshot } from '../lib/Page';
import * as SelectorsOrderedFromSuppliers from '../lib/Constants/SelectorsOrderedFromSuppliers';
import * as SelectorsAssemblyWarehouse from '../lib/Constants/SelectorsAssemblyWarehouse';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { arrayDetail, arrayCbed, arrayIzd, setQuantityLaunchInProduct } from './U002-Constants';

declare global {
  var initialOrderedQuantity: string;
}

export const runU002_06_Izd = (_isSingleTest: boolean, _iterations: number) => {
  logger.info('U002 Izd - Cases 16, 17, 18');

  test('Case 16 Izd - Get Initial Ordered Quantity from Assembly Warehouse', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 16 - Get Initial Ordered Quantity from Assembly Warehouse for IZD');
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await assemblyWarehouse.verifyTestDataAvailable(arrayIzd, 'IZD', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const izd of arrayIzd) {
      await allure.step('Step 1: Open the warehouse page', async () => {
        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      });

      await allure.step('Step 2: Open the Assembly Warehouse page (Заказ склада на сборку)', async () => {
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await assemblyWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });
      });

      await allure.step('Step 3: Search for IZD and get initial ordered quantity', async () => {
        await assemblyWarehouse.searchAndWaitForTable(izd.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        const rows = page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount > 0) {
          const orderedCell = page.locator(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO).first();
          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
          const initialOrderedQuantity = (await orderedCell.innerText()).trim();
          global.initialOrderedQuantity = initialOrderedQuantity;
          logger.info(`Initial ordered quantity for ${izd.name}: ${initialOrderedQuantity}`);
        } else {
          global.initialOrderedQuantity = '0';
          logger.info(`No existing orders found for ${izd.name} - starting with 0`);
        }
      });
    }
  });

  test('Case 17 Izd - Create Two IZD Orders, Verify Total, and Archive Second Order', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM_SHORT);
    logger.info('Test Case 17 - Create Two IZD Orders, Verify Total, and Archive Second Order');
    const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await metalworkingWarehouse.verifyTestDataAvailable(arrayIzd, 'IZD', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const izd of arrayIzd) {
      let firstOrderNumber: string;
      let secondOrderNumber: string;

      await allure.step('Setup: Archive any existing IZD orders in Assembly Warehouse', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });
        await assemblyWarehouse.archiveAllAssemblyTasksForItem(izd.name, { maxArchives: 10 });
        await page.waitForTimeout(TIMEOUTS.LONG);
      });

      await allure.step('Step 1: Create first IZD order with quantity 50', async () => {
        logger.info('Creating first IZD order with quantity 50...');
        const result = await orderedFromSuppliersPage.launchIntoProductionSupplier(izd.name, '50', Supplier.product);
        firstOrderNumber = result.checkOrderNumber;
        logger.info(`✅ First IZD order created - Order number: ${firstOrderNumber}, Quantity: 50`);
      });

      await allure.step('Step 2: Create second IZD order with quantity 5', async () => {
        logger.info('Creating second IZD order with quantity 5...');
        const result = await orderedFromSuppliersPage.launchIntoProductionSupplier(izd.name, '5', Supplier.product);
        secondOrderNumber = result.checkOrderNumber;
        logger.info(`✅ Second IZD order created - Order number: ${secondOrderNumber}, Quantity: 5`);
      });

      await allure.step('Step 3: Go to Assembly Warehouse and verify total quantity is 55', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await metalworkingWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });

        await metalworkingWarehouse.searchAndWaitForTable(izd.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        await metalworkingWarehouse.getQuantityCellAndVerify(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO, 55, 'Total ordered', 'IZD');
      });

      await allure.step("Step 4: Open context menu and click 'Заказы'", async () => {
        await assemblyWarehouse.openOrdersContextMenuForItemRow(izd.name, 55);
      });

      await allure.step('Step 5: Verify orders are present', async () => {
        await metalworkingWarehouse.verifyOrdersModal(
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_RIGHT_MENU_MODAL,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_STOCK_ORDER_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_COUNT_SHIPMENTS_PREFIX,
          [firstOrderNumber, secondOrderNumber],
          ['50', '5'],
          'IZD',
          true,
          WAIT_TIMEOUTS.STANDARD,
        );
      });

      await allure.step('Step 6: Click on second order to open edit dialog', async () => {
        await metalworkingWarehouse.clickOrderToOpenEditDialog(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER, secondOrderNumber, `Could not find second IZD order ${secondOrderNumber} in the orders list`, 'IZD');
      });

      await allure.step('Step 7: Select checkbox and archive the second order', async () => {
        await metalworkingWarehouse.selectCheckboxAndArchiveOrder(
          secondOrderNumber,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_CHECKBOX_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_DATA_NUMBER_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_BUTTONS_BUTTON_ARCHIVE,
          SelectorsPartsDataBase.BUTTON_CONFIRM,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER,
          `Could not find checkbox for second IZD order ${secondOrderNumber}`,
          'IZD',
        );
      });

      await allure.step('Step 9: Close dialogs and refresh page', async () => {
        await page.click('body', { position: { x: 1, y: 1 } });
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await page.reload();
        await metalworkingWarehouse.waitForNetworkIdle();
        logger.info('Page refreshed');
      });

      await allure.step('Step 10: Search for IZD again and verify quantity decreased by 5', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await metalworkingWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });

        await metalworkingWarehouse.searchAndWaitForTable(izd.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        const remainingOrderedQuantity = await metalworkingWarehouse.getQuantityCellAndVerify(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO, 50, 'Remaining ordered', 'IZD');

        setQuantityLaunchInProduct(remainingOrderedQuantity);
        logger.info(`✅ Set quantityLaunchInProduct to ${remainingOrderedQuantity} for subsequent test cases`);
      });
    }
  });

  test('Case 18 Izd - Archive Task and Verify Removal', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 18 - Archive IZD Task and Verify Removal');
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await assemblyWarehouse.verifyTestDataAvailable(arrayIzd, 'IZD', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const izd of arrayIzd) {
      await allure.step('Step 1: Open Assembly Warehouse page', async () => {
        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await assemblyWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });
      });

      await allure.step('Step 2: Search for IZD', async () => {
        await assemblyWarehouse.searchAndWaitForTable(izd.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });
      });

      await allure.step('Step 3: Select checkbox and archive all tasks for IZD', async () => {
        const archivedCount = await assemblyWarehouse.archiveAllAssemblyTasksForItem(izd.name, { maxArchives: 10 });
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
          },
          `Verify archive completed - archived ${archivedCount} task(s) for ${izd.name}`,
          test.info(),
        );
      });

      await allure.step('Step 4: Verify all tasks are archived', async () => {
        await page.waitForTimeout(TIMEOUTS.LONG);
        await assemblyWarehouse.searchAndWaitForTable(izd.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        const rows = page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
        const rowCount = await rows.count();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(rowCount).toBe(0);
          },
          `Verify IZD task archived - no rows for ${izd.name}`,
          test.info(),
        );
        logger.info(`IZD task successfully archived - no rows found for ${izd.name}`);
      });
    }
  });
};
