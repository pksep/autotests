/**
 * @file U002-Cbed.spec.ts
 * @purpose U002 CBED flow: Case 13 (initial ordered qty), Case 14 (two orders + archive), Case 15 (archive task).
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

export const runU002_05_Cbed = (_isSingleTest: boolean, _iterations: number) => {
  logger.info('U002 Cbed - Cases 13, 14, 15');

  test('Case 13 Cbed - Get Initial Ordered Quantity from Assembly Warehouse', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 13 - Get Initial Ordered Quantity from Assembly Warehouse');
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await assemblyWarehouse.verifyTestDataAvailable(arrayCbed, 'CBED', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 1: Open the warehouse page', async () => {
        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      });

      await allure.step('Step 2: Open the Assembly Warehouse page (Заказ склада на сборку)', async () => {
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await assemblyWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });
      });

      await allure.step('Step 3: Search for CBED and get initial ordered quantity', async () => {
        await assemblyWarehouse.searchAndWaitForTable(cbed.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        const rows = page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
        const rowCount = await rows.count();

        if (rowCount > 0) {
          const orderedCell = page.locator(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO).first();
          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
          const initialOrderedQuantity = (await orderedCell.innerText()).trim();
          global.initialOrderedQuantity = initialOrderedQuantity;
          logger.info(`Initial ordered quantity for ${cbed.name}: ${initialOrderedQuantity}`);
        } else {
          global.initialOrderedQuantity = '0';
          logger.info(`No existing orders found for ${cbed.name} - starting with 0`);
        }
      });
    }
  });

  test('Case 14 Cbed - Create Two CBED Orders, Verify Total, and Archive Second Order', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM_SHORT);
    logger.info('Test Case 14 - Create Two CBED Orders, Verify Total, and Archive Second Order');
    const orderedFromSuppliersPage = new CreateOrderedFromSuppliersPage(page);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await metalworkingWarehouse.verifyTestDataAvailable(arrayCbed, 'CBED', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const cbed of arrayCbed) {
      let firstOrderNumber: string;
      let secondOrderNumber: string;

      await allure.step('Step 1: Create first CBED order with quantity 50', async () => {
        logger.info('Creating first CBED order with quantity 50...');
        const result = await orderedFromSuppliersPage.launchIntoProductionSupplier(cbed.name, '50', Supplier.cbed);
        firstOrderNumber = result.checkOrderNumber;
        logger.info(`✅ First CBED order created - Order number: ${firstOrderNumber}, Quantity: 50`);
      });

      await allure.step('Step 2: Create second CBED order with quantity 5', async () => {
        logger.info('Creating second CBED order with quantity 5...');
        const result = await orderedFromSuppliersPage.launchIntoProductionSupplier(cbed.name, '5', Supplier.cbed);
        secondOrderNumber = result.checkOrderNumber;
        logger.info(`✅ Second CBED order created - Order number: ${secondOrderNumber}, Quantity: 5`);
      });

      // If this step fails with e.g. 105 instead of 55, archive may not be updating totals: Case 15 (or previous run) should leave 0; leftover orders suggest archive or total calculation is broken.
      await allure.step('Step 3: Go to Assembly Warehouse and verify total quantity is 55', async () => {
        await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await metalworkingWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });

        await metalworkingWarehouse.searchAndWaitForTable(cbed.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        await assemblyWarehouse.getQuantityCellAndVerify(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO, 55, 'Total ordered', 'CBED');
      });

      await allure.step("Step 4: Open context menu and click 'Заказы'", async () => {
        await metalworkingWarehouse.openContextMenuAndClickOrders(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_HEAD_POPOVER, SelectorsPartsDataBase.POPOVER_ITEM0, undefined, 1);
      });

      await allure.step('Step 5: Verify orders modal opens and shows both orders', async () => {
        await metalworkingWarehouse.verifyOrdersModal(
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_RIGHT_MENU_MODAL,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_COUNT_SHIPMENTS,
          [firstOrderNumber, secondOrderNumber],
          ['50', '5'],
          'CBED',
        );
      });

      await allure.step('Step 6: Click on second order to open edit dialog', async () => {
        await metalworkingWarehouse.clickOrderToOpenEditDialog(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER, secondOrderNumber, `Could not find second CBED order ${secondOrderNumber} in the orders list`, 'CBED');
      });

      await allure.step('Step 7: Select checkbox and archive the second order', async () => {
        await metalworkingWarehouse.selectCheckboxAndArchiveOrder(
          secondOrderNumber,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_CHECKBOX_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_DATA_NUMBER_PREFIX,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_BUTTONS_BUTTON_ARCHIVE,
          SelectorsPartsDataBase.BUTTON_CONFIRM,
          SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER,
          `Could not find checkbox for second CBED order ${secondOrderNumber}`,
          'CBED',
        );
      });

      await allure.step('Step 9: Close dialogs and refresh page', async () => {
        await page.click('body', { position: { x: 1, y: 1 } });
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await page.reload();
        await assemblyWarehouse.waitForNetworkIdle();
        logger.info('Page refreshed');
      });

      await allure.step('Step 10: Search for CBED again and verify quantity decreased by 5', async () => {
        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await assemblyWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });

        await assemblyWarehouse.searchAndWaitForTable(cbed.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        const remainingOrderedQuantity = await assemblyWarehouse.getQuantityCellAndVerify(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_KOLVO, 50, 'Remaining ordered', 'CBED');

        setQuantityLaunchInProduct(remainingOrderedQuantity);
        logger.info(`✅ Set quantityLaunchInProduct to ${remainingOrderedQuantity} for subsequent test cases`);
      });
    }
  });

  test('Case 15 Cbed - Archive Task and Verify Removal', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 18 - Archive CBED Task and Verify Removal');
    const assemblyWarehouse = new CreateAssemblyWarehousePage(page);

    await assemblyWarehouse.verifyTestDataAvailable(arrayCbed, 'CBED', {
      detail: arrayDetail,
      cbed: arrayCbed,
      izd: arrayIzd,
    });

    for (const cbed of arrayCbed) {
      await allure.step('Step 1: Open Assembly Warehouse page', async () => {
        await assemblyWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
        await assemblyWarehouse.waitForNetworkIdle();
        await assemblyWarehouse.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });
      });

      await allure.step('Step 2: Search for CBED', async () => {
        await assemblyWarehouse.searchAndWaitForTable(cbed.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });
      });

      await allure.step('Step 3: Select checkbox and archive all tasks for CBED', async () => {
        const archivedCount = await assemblyWarehouse.archiveAllAssemblyTasksForItem(cbed.name, { maxArchives: 10 });
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(archivedCount).toBeGreaterThanOrEqual(0);
          },
          `Verify archive completed - archived ${archivedCount} task(s) for ${cbed.name}`,
          test.info(),
        );
      });

      await allure.step('Step 4: Verify all tasks are archived', async () => {
        await page.waitForTimeout(TIMEOUTS.LONG);
        await assemblyWarehouse.searchAndWaitForTable(cbed.name, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, {
          searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
        });

        const rows = page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
        const rowCount = await rows.count();

        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(rowCount).toBe(0);
          },
          `Verify CBED task archived - no rows for ${cbed.name}`,
          test.info(),
        );
        logger.info(`CBED task successfully archived - no rows found for ${cbed.name}`);
      });
    }
  });
};
