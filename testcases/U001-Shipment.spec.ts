/**
 * @file U001-Shipment.spec.ts
 * @purpose Test Suite 6: Shipment Operations (Test Cases 19-20)
 * 
 * This suite handles:
 * - Test Case 19: Uploading Shipment Task
 * - Test Case 20: Checking Shipment Task
 */

import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as SelectorsWarehouseTaskForShipment from '../lib/Constants/SelectorsWarehouseTaskForShipment';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateWarehouseTaskForShipmentPage } from '../pages/WarehouseTaskForShipmentPage';
import { Click, expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import {
  orderNumber,
  nameProduct,
  quantityProductLaunchOnProduction,
  incomingQuantity,
  tableMainUploading,
  buttonUploading,
} from './U001-Constants';

export const runU001_06_Shipment = (isSingleTest: boolean, iterations: number) => {
  console.log(`Start of the test: U001 Shipment Operations (Test Cases 19-20)`);

  test('Test Case 19 - Uploading Shipment Task', async ({ page }) => {
    // doc test case 14
    console.log('Test Case 19 - Uploading Shipment Task');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(page);
    let numberColumn: number;

    await allure.step('Step 01-02: Open the warehouse page and warehouse shipping task page', async () => {
      // Find and go to the page using the locator Склад: Задачи на отгрузку
      const selector = SelectorsShipmentTasks.SELECTOR_SHIPPING_TASKS;
      await warehouseTaskForShipment.navigateToPageAndWaitForTable(SELECTORS.MAINMENU.WAREHOUSE.URL, selector, tableMainUploading);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      const titles = testData1.elements.WarehouseLoadingTasks.titles;
      const buttons = testData1.elements.WarehouseLoadingTasks.buttons;
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await warehouseTaskForShipment.validatePageHeadersAndButtons(page, titles, buttons, SelectorsShipmentTasks.SELECTOR_SCLAD_SHIPPING_TASKS);
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
    });

    await allure.step('Step 05-06: Search product and verify first row', async () => {
      // Using table search we look for the value of the variable and verify it's in the first row
      await warehouseTaskForShipment.searchAndVerifyFirstRow(nameProduct, tableMainUploading, tableMainUploading, {
        useRedesign: true,
        timeoutBeforeWait: 1000,
        searchInputDataTestId: SelectorsShipmentTasks.SHIPMENTS_SEARCH_INPUT,
      });
    });

    await allure.step('Step 07: Find the checkbox column and click', async () => {
      // Click the first row cell using direct data-testid pattern
      const firstRowCell = page.locator(SelectorsShipmentTasks.ROW_NUMBER_PATTERN).first();

      // Wait for the cell to be visible
      await firstRowCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await firstRowCell.scrollIntoViewIfNeeded();

      // Highlight the cell for debugging
      await firstRowCell.evaluate(el => {
        (el as HTMLElement).style.outline = '3px solid red';
      });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Click the cell
      await firstRowCell.click();
      console.log('First row cell clicked');
    });

    await allure.step('Step 08: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', buttonUploading);
      // Wait for the page to stabilize
      await page.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 09-10: Checking the modalwindow headings and buttons', async () => {
      const titles = testData1.elements.ModalWindowUploadingTask.titles;
      const buttons = testData1.elements.ModalWindowUploadingTask.buttons;
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await warehouseTaskForShipment.validatePageHeadersAndButtons(page, titles, buttons, SelectorsShipmentTasks.MODAL_SHIPMENT_DETAILS, {
        useModalMethod: true,
      });
    });

    await allure.step('Step 11: Check the Shipping modal window', async () => {
      // Check the Shipping modal window
      await warehouseTaskForShipment.shipmentModalWindow();
    });

    await allure.step('Step 12: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', SelectorsWarehouseTaskForShipment.BUTTON_SHIP);
    });
  });

  test('Test Case 20 - Checking the number of shipped entities', async ({
    // doc test case 15
    page,
  }) => {
    console.log('Test Case 20 - Checking the number of shipped entities');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const warehouseTaskForShipment = new CreateWarehouseTaskForShipmentPage(page);
    let numberColumn: number;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await warehouseTaskForShipment.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the warehouse shipping task page', async () => {
      // Find and go to the page using the locator Склад: Задачи на отгрузку
      const selector = SelectorsShipmentTasks.SELECTOR_SHIPPING_TASKS;
      await warehouseTaskForShipment.findTable(selector);

      // Wait for loading
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Wait for the table body to load
      await warehouseTaskForShipment.waitingTableBody(tableMainUploading);
    });

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable

      await warehouseTaskForShipment.searchAndWaitForTable(nameProduct, tableMainUploading, tableMainUploading, {
        useRedesign: true,
        timeoutBeforeWait: 1000,
      });
    });

    await allure.step('Step 04: Check that the first row of the table contains the variable name', async () => {
      // Check that the first row of the table contains the variable name
      await warehouseTaskForShipment.checkNameInLineFromFirstRow(nameProduct, tableMainUploading);
    });

    await allure.step('Step 05: Find the checkbox column and click', async () => {
      // console.log("numberColumn: ", numberColumn);
      await warehouseTaskForShipment.getValueOrClickFromFirstRow(tableMainUploading, 2, Click.Yes, Click.No);
    });

    await allure.step('Step 06: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', buttonUploading);
    });

    await allure.step('Step 07: Checking the number of shipped entities', async () => {
      const tableBody = SelectorsWarehouseTaskForShipment.TABLE_SCROLL;
      await warehouseTaskForShipment.waitingTableBody(tableBody);

      // Find the shipped quantity cell using data-testid
      const shippedCell = page.locator(SelectorsWarehouseTaskForShipment.TABLE_BODY_SHIPPED).first();

      await shippedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shippedCell.scrollIntoViewIfNeeded();

      // Highlight the shipped quantity cell
      await shippedCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'lightcyan';
        el.style.border = '2px solid blue';
      });

      // Get the shipped quantity value from the cell
      const shippedValue = await shippedCell.textContent();
      const valueInShipped = shippedValue?.trim() || '';

      console.log('Shipped quantity: ', valueInShipped);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(Number(valueInShipped)).toBe(Number(quantityProductLaunchOnProduction) - Number(incomingQuantity));
        },
        'Verify shipped quantity equals expected value',
        test.info(),
      );
    });
  });
};
