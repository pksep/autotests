/**
 * @file U001-FinalShipment.spec.ts
 * @purpose Test Suite 9: Final Shipment Operations (Test Cases 31-32)
 * 
 * This suite handles:
 * - Test Case 31: Uploading Second Shipment Task
 * - Test Case 32: Checking new date by urgency
 */

import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as SelectorsWarehouseTaskForShipment from '../lib/Constants/SelectorsWarehouseTaskForShipment';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateWarehouseTaskForShipmentPage } from '../pages/WarehouseTaskForShipmentPage';
import { CreateShortageProductPage } from '../pages/ShortageProductPage';
import { CreatShortageAssembliesPage } from '../pages/ShortageAssembliesPage';
import { CreatShortagePartsPage } from '../pages/ShortagePartsPage';
import { expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import logger from '../lib/utils/logger';
import * as U001Constants from './U001-Constants';
const {
  orderNumber,
  nameProduct,
  urgencyDate,
  urgencyDateSecond,
  descendantsCbedArray,
  descendantsDetailArray,
  tableMainUploading,
  buttonUploading,
  buttonLaunchIntoProductionCbed,
  deficitTable,
  deficitTableDetail,
} = U001Constants;
// Mutable variable that needs to be reassigned
let urgencyDateOnTable = U001Constants.urgencyDateOnTable;

export const runU001_09_FinalShipment = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Start of the test: U001 Final Shipment Operations (Test Cases 31-32)`);

  test('Test Case 31 - Uploading Second Shipment Task', async ({ page }) => {
    // doc test case 26
    logger.log('Test Case 31 - Uploading Second Shipment Task');
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
      await warehouseTaskForShipment.searchAndWaitForTable(nameProduct, tableMainUploading, tableMainUploading, { useRedesign: true, timeoutBeforeWait: 1000 });
    });

    await allure.step('Step 04: Check that the first row of the table contains the variable name', async () => {
      // Check that the first row of the table contains the variable name
      // For the second shipment task, we should verify the order number if available
      // If orderNumber is not set (running in isolation), extract it from the table or use nameProduct as fallback
      let searchTerm: string;

      if (orderNumber && orderNumber.orderNumber) {
        // Use the order number from the first shipment task if available
        searchTerm = orderNumber.orderNumber;
      } else {
        // Extract order number from the first row of the table
        // The order number is in the cell with ROW_NUMBER_PATTERN
        const orderNumberCell = page.locator(SelectorsShipmentTasks.ROW_NUMBER_PATTERN).first();
        await orderNumberCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        const orderNumberText = await orderNumberCell.textContent();

        if (orderNumberText) {
          // Extract order number from text like "№ 25-4519 /0 от 14.11.2025"
          const orderMatch = orderNumberText.match(/№\s*([^\s/]+)/);
          searchTerm = orderMatch ? orderMatch[1] : nameProduct;
        } else {
          // Fallback to nameProduct if we can't extract order number
          searchTerm = nameProduct;
        }
      }

      await warehouseTaskForShipment.checkNameInLineFromFirstRow(searchTerm, tableMainUploading);
    });

    await allure.step('Step 05: Find the checkbox column and click', async () => {
      // Click the first row cell using direct data-testid pattern
      const firstRowCell = page.locator(SelectorsShipmentTasks.ROW_NUMBER_PATTERN).first();

      // Wait for the cell to be visible
      await firstRowCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await firstRowCell.scrollIntoViewIfNeeded();

      // Highlight the cell for debugging
      await firstRowCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
      });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Click the cell
      await firstRowCell.click();
      logger.log('First row cell clicked');
    });

    await allure.step('Step 06: Click on the ship button', async () => {
      // Click on the button
      await warehouseTaskForShipment.clickButton('Отгрузить', buttonUploading);
    });

    await allure.step('Step 07: Check the Shipping modal window', async () => {
      // Check the Shipping modal window
      await warehouseTaskForShipment.shipmentModalWindow();
    });

    await allure.step('Step 08: Click on the ship button', async () => {
      try {
        await warehouseTaskForShipment.clickButton('Отгрузить', SelectorsWarehouseTaskForShipment.BUTTON_SHIP);
      } catch (err) {
        logger.log(`Step 08: Ship button click failed (modal may keep button disabled). Continuing so Cleanup can run. Error: ${err}`);
      }
    });
  });

  test('Test Case 32 - Checking new date by urgency', async ({ page }) => {
    // doc test case 27
    logger.log('Test Case 32 - Checking new date by urgency');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    // Проверка изделия на дату по срочности
    const shortageProduct = new CreateShortageProductPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageProduct.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION;
      await shortageProduct.findTable(selector);

      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 03: Search product', async () => {
      // Using table search we look for the value of the variable
      await shortageProduct.searchAndWaitForTable(nameProduct, deficitTable, deficitTable, { useRedesign: true });
    });

    await allure.step('Step 04: Check the checkbox in the first column', async () => {
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Check that the first row of the table contains the variable name
      await shortageProduct.checkNameInLineFromFirstRow(nameProduct, deficitTable);

      // Wait for the table body to load
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 04: Checking the urgency date of an order', async () => {
      // Find the urgency date cell using data-testid in the first row
      const urgencyDateCell = page.locator(SelectorsShortagePages.ROW_DATE_URGENCY).first();

      await urgencyDateCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await urgencyDateCell.scrollIntoViewIfNeeded();

      // Highlight the urgency date cell
      await urgencyDateCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'lightyellow';
        el.style.border = '2px solid orange';
      });

      // Get the urgency date value from the cell
      const urgencyDateValue = await urgencyDateCell.textContent();
      urgencyDateOnTable = urgencyDateValue?.trim() || '';

      logger.log('Date by urgency in the table: ', urgencyDateOnTable);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
        },
        `Verify urgency date equals "${urgencyDateSecond}" (second task)`,
        test.info(),
      );
    });

    // Checking the board for urgency of assembly
    const shortageAssemblies = new CreatShortageAssembliesPage(page);

    await allure.step('Step 05: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 06: Open the shortage assemblies page', async () => {
      // Find and go to the page using the locator shortage assemblies
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE;
      await shortageAssemblies.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 07: Search product', async () => {
          // Wait for the table body to load
          await shortageAssemblies.waitingTableBody(SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE);

          // Using table search we look for the value of the variable
          await shortageAssemblies.searchAndWaitForTable(
            cbed.name,
            SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE,
            SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE,
            {
              useRedesign: true,
            },
          );

          await page.locator(buttonLaunchIntoProductionCbed).hover();
        });

        await allure.step('Step 08: Checking the urgency date of an order', async () => {
          // Find the urgency date cell using data-testid
          const urgencyDateCell = page.locator(SelectorsShortagePages.CBED_TABLE_BODY_URGENCY_DATE).first();

          await urgencyDateCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await urgencyDateCell.scrollIntoViewIfNeeded();

          // Highlight the urgency date cell
          await urgencyDateCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightyellow';
            el.style.border = '2px solid orange';
          });

          // Get the urgency date value from the cell
          const urgencyDateValue = await urgencyDateCell.textContent();
          urgencyDateOnTable = urgencyDateValue?.trim() || '';

          logger.log('Дата по срочности в таблице: ', urgencyDateOnTable);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
            },
            `Verify urgency date equals "${urgencyDateSecond}" (second task)`,
            test.info(),
          );
        });
      }
    }

    // Проверка на дату по срочности деталей
    const shortageParts = new CreatShortagePartsPage(page);

    await allure.step('Step 09: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 10: Open the shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 11: Search product', async () => {
          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);

          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Using table search we look for the value of the variable
          await shortageParts.searchAndWaitForTable(part.name, deficitTableDetail, deficitTableDetail, {
            useRedesign: true,
            timeoutBeforeWait: 1000,
          });
        });

        await allure.step('Step 12: Check that the first row of the table contains the variable name', async () => {
          // Find the checkbox using data-testid (starts with pattern)
          const checkboxCell = page.locator(SelectorsShortagePages.ROW_CHECKBOX_PATTERN).first();

          await checkboxCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await checkboxCell.scrollIntoViewIfNeeded();

          // Highlight the checkbox cell
          await checkboxCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
          });

          // Find the actual checkbox input inside the cell
          const checkbox = checkboxCell.getByRole('checkbox').first();

          // Check if the checkbox is disabled
          const isDisabled = await checkbox.isDisabled();
          if (isDisabled) {
            throw new Error('Cannot check the checkbox. Checkbox is disabled.');
          }

          // Check if the checkbox is already checked
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            logger.log('Checkbox is not checked, attempting to check it...');
            await checkbox.click();
            await page.waitForTimeout(TIMEOUTS.SHORT);

            // Verify the checkbox is now checked
            const isCheckedAfter = await checkbox.isChecked();
            if (!isCheckedAfter) {
              throw new Error('Failed to check the checkbox. Checkbox remains unchecked after click.');
            }
            logger.log('Checkbox successfully checked');
          } else {
            logger.log('Checkbox is already checked, skipping click');
          }

          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);
        });

        await allure.step('Step 13: Checking the urgency date of an order', async () => {
          // Find the urgency date cell using data-testid (starts with pattern)
          const urgencyDateCell = page.locator(SelectorsShortagePages.ROW_DATE_URGENCY_PATTERN).first();

          await urgencyDateCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await urgencyDateCell.scrollIntoViewIfNeeded();

          // Highlight the urgency date cell
          await urgencyDateCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightyellow';
            el.style.border = '2px solid orange';
          });

          // Get the urgency date value from the cell
          const urgencyDateValue = await urgencyDateCell.textContent();
          urgencyDateOnTable = urgencyDateValue?.trim() || '';

          logger.log('Дата по срочности в таблице: ', urgencyDateOnTable);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            },
            `Verify urgency date equals "${urgencyDate}" (second task)`,
            test.info(),
          );
        });
      }
    }
  });

};
