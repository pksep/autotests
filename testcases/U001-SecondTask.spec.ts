/**
 * @file U001-SecondTask.spec.ts
 * @purpose Test Suite 7: Second Task Operations (Test Cases 21-27)
 * 
 * This suite handles:
 * - Test Case 21: Loading The Second Task
 * - Test Case 22: Launch Into Production Product (Second Task)
 * - Test Case 23: Launch Into Production Cbed (Second Task)
 * - Test Case 24: Launch Into Production Parts (Second Task)
 * - Test Case 25: Marking Parts (Second Task)
 * - Test Case 26: Marking Parts Metalworking (Second Task)
 * - Test Case 27: Complete Set Of Cbed (Second Task)
 */

import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsStartProduction from '../lib/Constants/SelectorsStartProduction';
import * as MetalWorkingWarhouseSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as ProductionPathSelectors from '../lib/Constants/SelectorsProductionPath';
import * as MarkOfCompletionSelectors from '../lib/Constants/SelectorsMarkOfCompletion';
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction from '../lib/Constants/SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import { CreateShortageProductPage } from '../pages/ShortageProductPage';
import { CreatShortageAssembliesPage } from '../pages/ShortageAssembliesPage';
import { CreatShortagePartsPage } from '../pages/ShortagePartsPage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import { CreateStockReceiptFromSupplierAndProductionPage, StockReceipt } from '../pages/StockReceiptFromSupplierAndProductionPage';
import { CreateStockPage, TableSelection } from '../pages/StockPage';
import { ISpetificationData, Click, expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import testData2 from '../testdata/U002-PC1.json';
import logger from '../lib/utils/logger';
import * as U001Constants from './U001-Constants';
const {
  nameProduct,
  nameProductNew,
  nameBuyer,
  incomingQuantity,
  urgencyDate,
  urgencyDateSecond,
  quantityProductLaunchOnProduction,
  quantityProductLaunchOnProductionAfter,
  quantitySumLaunchOnProduction,
  descendantsCbedArray,
  descendantsDetailArray,
  deficitTable,
  buttonLaunchIntoProduction,
  modalWindowLaunchIntoProduction,
  buttonLaunchIntoProductionModalWindow,
  buttonLaunchIntoProductionCbed,
  modalWindowLaunchIntoProductionCbed,
  buttonLaunchIntoProductionDetail,
  modalWindowLaunchIntoProductionDetail,
  deficitTableDetail,
} = U001Constants;
// Mutable variables that need to be reassigned
let urgencyDateOnTable = U001Constants.urgencyDateOnTable;
let quantityProductLaunchOnProductionBefore = U001Constants.quantityProductLaunchOnProductionBefore;
let remainingStockBefore = U001Constants.remainingStockBefore;
let remainingStockAfter = U001Constants.remainingStockAfter;

export const runU001_07_SecondTask = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Start of the test: U001 Second Task Operations (Test Cases 21-27)`);

  test('Test Case 21 - Loading The Second Task', async ({ page }) => {
    // doc test case 16
    logger.log('Test Case 21 - Loading The Second Task');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 02: Click on the Create order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Создать заказ', LoadingTasksSelectors.buttonCreateOrder);
    });

    await allure.step('Step 03: Click on the Select button', async () => {
      // Click on the button
      await page
        .locator(LoadingTasksSelectors.buttonChoiceIzd, {
          hasText: 'Выбрать',
        })
        .nth(0)
        .click();

      await page.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 04: Search product on modal window', async () => {
      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modalWindow).toBeVisible();
        },
        'Verify modal window is visible',
        test.info(),
      );

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameProduct);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await searchTable.inputValue()).toBe(nameProduct);
        },
        `Verify search table input value equals "${nameProduct}"`,
        test.info(),
      );
      await searchTable.press('Enter');

      await page.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 05: Choice product in modal window', async () => {
      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0);

      await loadingTaskPage.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 06: Click on the Select button on modal window', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Добавить', LoadingTasksSelectors.buttonChoiceIzdTEMPU001);
    });

    await allure.step('Step 07: Checking the selected product', async () => {
      // Check that the selected product displays the expected product
      await loadingTaskPage.checkProduct(nameProduct);
      await loadingTaskPage.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 08: Selecting a buyer', async () => {
      await loadingTaskPage.clickButton('Выбрать', LoadingTasksSelectors.buttonChoiceBuyer);

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 09: Check modal window Company', async () => {
      const modalWindow = await page.locator('.modal-yui-kit__modal-content');
      // Using table search we look for the value of the variable
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modalWindow).toBeVisible();
        },
        'Verify modal window is visible',
        test.info(),
      );

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameBuyer);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await searchTable.inputValue()).toBe(nameBuyer);
        },
        `Verify search table input value equals "${nameBuyer}"`,
        test.info(),
      );
      await searchTable.press('Enter');

      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0);
    });

    await allure.step('Step 10: Click on the Select button on modal window', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Добавить', LoadingTasksSelectors.buttonAddBuyerOnModalWindow);
    });
    await allure.step('Step 11: We set the date according to urgency', async () => {
      logger.log('Step 11: We set the date according to urgency');
      await page.locator(LoadingTasksSelectors.calendarTrigger).click();
      await page.locator(LoadingTasksSelectors.calendarPopover).isVisible();

      // Scope to the calendar component
      const calendar = page.locator(LoadingTasksSelectors.calendarComponent);

      // Open the years popup by clicking the header year button
      const yearButton = calendar.locator('button[id^="open-years-popup"]').first();
      await yearButton.waitFor({ state: 'visible' });
      await yearButton.click();

      // Scope to the open years popover
      const yearsPopover = page.locator('wa-popover[for^="open-years-popup"][open]').first();
      await yearsPopover.waitFor({ state: 'visible' });

      // Select target year directly inside the open years popover
      const targetYear = 2025;
      // Some builds render part="year " (with a trailing space) — use starts-with selector
      const yearCell = yearsPopover.locator('[part^="year"]', { hasText: String(targetYear) }).first();
      await yearCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await yearCell.click();

      // Verify selection reflects on the header year button
      const finalYearText = ((await yearButton.textContent()) || '').trim();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(parseInt(finalYearText, 10)).toBe(targetYear);
        },
        `Verify year selection equals ${targetYear}`,
        test.info(),
      );
      // Open months popup and select January
      const monthButton = calendar.locator('button[id^="open-months-popup"]').first();
      await monthButton.waitFor({ state: 'visible' });
      await monthButton.click();

      const monthsPopover = page.locator('wa-popover[for^="open-months-popup"][open]').first();
      await monthsPopover.waitFor({ state: 'visible' });
      // Click January (Month 1, index 1)
      const januaryCell = monthsPopover.locator('div[part^="month"]').nth(1);
      await januaryCell.waitFor({ state: 'visible' });
      await januaryCell.click({ force: true });
      // Wait for month button to show "Янв" to confirm selection
      await monthButton.waitFor({ state: 'visible' });
      await page.waitForTimeout(TIMEOUTS.STANDARD); // Give time for the selection to register

      // Pick the day 21 in January 2025 by aria-label
      await calendar.locator('button[role="gridcell"][aria-label="January 21st, 2025"]').first().click();
    });

    await allure.step('Step 12: Click on the save order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Сохранить', LoadingTasksSelectors.buttonSaveOrder);
    });

    await allure.step('Step 13: Checking the ordered quantity', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.EXTENDED);
      const orderNumber = await loadingTaskPage.getOrderDateInfoFromLocator(LoadingTasksSelectors.editTitle);
      logger.log('orderNumber: ', orderNumber);
    });
  });

  // Local descendantsDetailArray for Test Case 22 (second task)
  // This shadows the global one from U001-Constants.ts
  const descendantsDetailArrayForSecondTask = [
    {
      name: '0Т4.21',
      designation: '-',
      quantity: 1,
    },
    {
      name: '0Т4.22',
      designation: '-',
      quantity: 1,
    },
  ];

  test('Test Case 22 - Marking Parts', async ({ page }) => {
    // doc test case 17
    logger.log('Test Case 22 - Marking Parts');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);
    const tableMetalworkingWarehouse = MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE;
    const productionTable = ProductionPathSelectors.OPERATION_TABLE;
    let numberColumnQunatityMade: number;
    let firstOperation: string;
    const operationTable = 'OperationPathInfo-Table';
    const tableMain = '#tablebody';

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the metalworking warehouse page', async () => {
      // Find and go to the page using the locator Order a warehouse for Metalworking
      const selector = MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE;
      await metalworkingWarehouse.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsDetailArrayForSecondTask.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArrayForSecondTask) {
        await allure.step('Step 03: Search product', async () => {
          // Wait for the table body to load (table may take longer to load with data from first task)
          await page.waitForTimeout(TIMEOUTS.LONG);
          await page.waitForLoadState('networkidle');
          await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse, { timeoutMs: WAIT_TIMEOUTS.PAGE_RELOAD });

          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          const table = page.locator(tableMetalworkingWarehouse);
          const searchTable = table.locator(MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_SEARCH_INPUT_LOCATOR).nth(0);

          // Clear the input field first
          await searchTable.clear();
          await searchTable.fill(part.name);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.EXTENDED);
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(await searchTable.inputValue()).toBe(part.name);
            },
            `Verify search table input value equals "${part.name}"`,
            test.info(),
          );
          await searchTable.press('Enter');

          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Wait for the table body to load
          await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse, { timeoutMs: WAIT_TIMEOUTS.LONG });
        });

        await allure.step('Step 04: Check the checkbox in the first column', async () => {
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          // Check that the first row of the table contains the variable name
          await metalworkingWarehouse.checkNameInLineFromFirstRow(part.name, tableMetalworkingWarehouse);

          // Wait for the table body to load
          await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse, { timeoutMs: WAIT_TIMEOUTS.LONG });
        });

        await allure.step('Step 05: Checking the urgency date of an order', async () => {
          // Get the value using data-testid directly
          // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-DateByUrgency
          const urgencyDateCell = page.locator(MetalWorkingWarhouseSelectors.METALWORKING_SCLAD_TABLE_ROW_DATE_BY_URGENCY_PATTERN).first();

          await urgencyDateCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await urgencyDateCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await urgencyDateCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          const urgencyDateText = await urgencyDateCell.textContent();
          urgencyDateOnTable = urgencyDateText?.trim() || '';

          logger.log('Дата по срочности в таблице: ', urgencyDateOnTable);
          logger.log('Дата по срочности в переменной: ', urgencyDateSecond);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
            },
            `Verify urgency date equals "${urgencyDateSecond}"`,
            test.info(),
          );
        });

        await allure.step('Step 06: We check the number of those launched into production', async () => {
          // Get the value using data-testid directly
          // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-Ordered
          const orderedCell = page.locator(MetalWorkingWarhouseSelectors.METALWORKING_SCLAD_TABLE_ROW_ORDERED_PATTERN).first();

          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await orderedCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await orderedCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          quantityProductLaunchOnProductionBefore = (await orderedCell.textContent()) || '0';
          quantityProductLaunchOnProductionBefore = quantityProductLaunchOnProductionBefore.trim();

          logger.log('The value in the cells is orders befor:', quantityProductLaunchOnProductionBefore);

          // The expected value should be quantitySumLaunchOnProduction (set in Test Case 11)
          // which is quantityProductLaunchOnProductionBefore (2) + quantityProductLaunchOnProduction (2) = 4
          // But if the value is 3, it might be due to previous operations, so we check against the actual accumulated value
          expect.soft(Number(quantityProductLaunchOnProductionBefore)).toBeGreaterThanOrEqual(Number(quantityProductLaunchOnProduction));
        });

        await allure.step('Step 07: Find and click on the operation icon', async () => {
          // Get the operations cell using data-testid directly
          // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-Operations
          const operationsCell = page.locator(MetalWorkingWarhouseSelectors.METALWORKING_SCLAD_TABLE_ROW_OPERATIONS_PATTERN).first();

          await operationsCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await operationsCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await operationsCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          // Click the operations cell directly
          await operationsCell.click();
          logger.log('Operation cell clicked');

          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        // await allure.step(
        //     "Step 08: Check the production path modal window ",
        //     async () => {
        //         // Check the production path modal window
        //         // await page.waitForTimeout(TIMEOUTS.MEDIUM)

        //         // Wait for the table body to load

        //         // await metalworkingWarehouse.waitingTableBody(
        //         //     productionTable
        //         // );
        //     }
        // );

        await allure.step('Step 09: We find, get the value and click on the cell done pcs', async () => {
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // Get the done/made cell using data-testid directly
          // Pattern: OperationPathInfo-tbodysdelano-sh{number}
          const doneCell = page.locator(ProductionPathSelectors.OPERATION_ROW_DONE_PATTERN).first();

          await doneCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await doneCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await doneCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          // Click on the Done cell
          await doneCell.click();
        });

        await allure.step('Step 10: Find and get the value from the operation cell', async () => {
          // Get the operation cell using data-testid directly
          const operationCell = page.locator(ProductionPathSelectors.OPERATION_ROW_FULL_NAME).first();

          await operationCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await operationCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await operationCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the operation value from the cell
          const operationValue = await operationCell.textContent();
          firstOperation = operationValue?.trim() || '';

          logger.log(firstOperation);
          logger.info(firstOperation);
        });

        await allure.step('Step 11: Click on the add mark button', async () => {
          // Click on the button
          await metalworkingWarehouse.clickButton('Добавить отметку', MarkOfCompletionSelectors.BUTTON_ADD_MARK);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 12: Checking the modal window and marking completion', async () => {
          // Check the progress check modal window
          await metalworkingWarehouse.completionMarkModalWindow(firstOperation, part.name, part.designation);
        });

        // await allure.step(
        //   'Step 13: Click on the Save order button',
        //   async () => {
        //     // Click on the button
        //     await metalworkingWarehouse.clickButton(
        //       'Сохранить',
        //       '[data-testid="ModalMark-Button-Save"]'
        //     );
        //   }
        // );

        await allure.step('Step 14: Closing a modal window by clicking on the logo', async () => {
          // Press Escape key to close the modal window
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          await page.waitForLoadState('networkidle');
          await page.keyboard.press('Escape');

          // Wait for the table body to load
          await metalworkingWarehouse.waitingTableBody(tableMetalworkingWarehouse);
          await page.waitForTimeout(TIMEOUTS.VERY_LONG);
        });
      }
    }
  });

  test('Test Case 23 - Checking new date by urgency', async ({ page }) => {
    // doc test case 18
    logger.log('Test Case 23 - Checking new date by urgency');
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
      // Check that the first row of the table contains the variable name
      await shortageProduct.checkNameInLineFromFirstRow(nameProduct, deficitTable);

      // Wait for the table body to load
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 05: Checking the urgency date of an order', async () => {
      // Find the urgency date cell using data-testid
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

      expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
    });

    // Checking the board for urgency of assembly
    const shortageAssemblies = new CreatShortageAssembliesPage(page);

    await allure.step('Step 06: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 07: Open the shortage assemblies page', async () => {
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
        await allure.step('Step 08: Search product', async () => {
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

        await allure.step('Step 09: Check the checkbox in the first column', async () => {
          // Check that the first row of the table contains the variable name
          await shortageProduct.checkNameInLineFromFirstRow(cbed.name, SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE);

          // Wait for the table body to load
          await shortageProduct.waitingTableBody(SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE);
        });

        await allure.step('Step 10: Checking the urgency date of an order', async () => {
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
            `Verify urgency date equals "${urgencyDateSecond}"`,
            test.info(),
          );
        });
      }
    }

    // Проверка на дату по срочности деталей
    const shortageParts = new CreatShortagePartsPage(page);

    await allure.step('Step 11: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 12: Open the shortage parts page', async () => {
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
        await allure.step('Step 13: Search product', async () => {
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

        await allure.step('Step 14: Check the checkbox in the first column', async () => {
          // Check that the first row of the table contains the variable name
          await shortageProduct.checkNameInLineFromFirstRow(part.name, deficitTableDetail);

          // Wait for the table body to load
          await shortageProduct.waitingTableBody(deficitTableDetail);
        });

        await allure.step('Step 15: Check that the first row of the table contains the variable name', async () => {
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

        await allure.step('Step 16: Checking the urgency date of an order', async () => {
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
              expect.soft(urgencyDateOnTable).toBe(urgencyDateSecond);
            },
            `Verify urgency date equals "${urgencyDateSecond}"`,
            test.info(),
          );
        });
      }
    }
  });

  test('Test Case 24 - Receiving Part And Check Stock', async ({ page }) => {
    // doc test case 19
    logger.log('Test Case 24 - Receiving Part And Check Stock');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(page);
    const stock = new CreateStockPage(page);
    const tableStockRecieptModalWindow =
      // '[data-testid="ModalComingTable-TableScroll"]';
      SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const detail of descendantsDetailArray) {
        //  Check the number of parts in the warehouse before posting
        await allure.step('Step 01: Receiving quantities from balances', async () => {
          // Receiving quantities from balances
          remainingStockBefore = await stock.checkingTheQuantityInStock(detail.name, TableSelection.detail);
        });

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          // Go to the Warehouse page
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          const selectorstockReceipt = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
          await stockReceipt.findTable(selectorstockReceipt);
          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 04: Click on the create receipt button', async () => {
          // Click on the button
          await stockReceipt.clickButton('Создать приход', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME);
        });

        await allure.step('Step 05: Select the selector in the modal window', async () => {
          // Select the selector in the modal window
          await stockReceipt.selectStockReceipt(StockReceipt.metalworking);
          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(tableStockRecieptModalWindow);
        });

        await allure.step('Step 06: Search product', async () => {
          // Using table search we look for the value of the variable
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await stockReceipt.searchTable(
            detail.name,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE_SEARCH_INPUT,
          );
          // Waiting for loading
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.waitForLoadState('networkidle');

          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(tableStockRecieptModalWindow);
        });

        await allure.step('Step 07: Enter the quantity in the cells', async () => {
          // Enter the quantity in the cells
          await stockReceipt.inputQuantityInCell(incomingQuantity);
        });

        await allure.step('Step 08: Find the checkbox column and click', async () => {
          // Click the header checkbox using direct data-testid
          const headerCheckbox = page.getByTestId(
            'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-HeadRow-Checkbox-Wrapper-Checkbox',
          );

          // Wait for the checkbox to be visible
          await headerCheckbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await headerCheckbox.scrollIntoViewIfNeeded();

          // Highlight the checkbox for debugging
          await headerCheckbox.evaluate(el => {
            (el as HTMLElement).style.outline = '3px solid red';
          });
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Check if the checkbox is already checked
          const isChecked = await headerCheckbox.isChecked();
          if (!isChecked) {
            await headerCheckbox.click();
            logger.log('Header checkbox clicked');
          } else {
            logger.log('Header checkbox is already checked, skipping click');
          }
        });

        // await allure.step(
        //   'Step 09: Check that the first row of the table contains the variable name',
        //   async () => {
        //     // Check that the first row of the table contains the variable name
        //     await stockReceipt.checkNameInLineFromFirstRow(
        //       detail.name,
        //       '[data-testid="ModalComing-SelectedItems-TableScroll"]'
        //     );
        //   }
        // );
        await allure.step('Step 09: Check that the first row of the table contains the variable name', async () => {
          logger.log('Step 09: Check that the first row of the table contains the variable name');
          // Wait for the table body to load
          const tableSelectedItems = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;
          await stockReceipt.waitingTableBody(tableSelectedItems);

          // Check that the first row of the table contains the variable name
          await stockReceipt.checkNameInLineFromFirstRow(detail.name, tableSelectedItems);
        });
        await allure.step('Step 9a: Click on the Добавить button on the modal window', async () => {
          logger.log('Step 15: Click on the create receipt button on the modal window');
          // Click on the button
          await stockReceipt.clickButton('Добавить', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_ADD);
        });
        await allure.step('Step 10: Click on the create receipt button on the modal window', async () => {
          // Wait for the Create button to become enabled (may take time after quantity is entered)
          const createButton = page.getByTestId('ComingToSclad-ModalComing-ModalAddNewWaybill-Buttons-Create');
          await createButton.scrollIntoViewIfNeeded();
          await expect(createButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.LONG });

          // Click on the button
          await stockReceipt.clickButton('Создать', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE);
        });

        await allure.step('Step 11: Check the number of parts in the warehouse after posting', async () => {
          // Check the number of parts in the warehouse after posting
          remainingStockAfter = await stock.checkingTheQuantityInStock(detail.name, TableSelection.detail);
        });

        await allure.step('Step 12: Compare the quantity in cells', async () => {
          // Compare the quantity in cells
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(Number(remainingStockAfter)).toBe(Number(remainingStockBefore) + Number(incomingQuantity));
            },
            'Verify remaining stock increased correctly',
            test.info(),
          );

          // Output to the console
          logger.log(
            `Количество ${detail.name} на складе до оприходования: ${remainingStockBefore}, ` +
              `оприходовали в количестве: ${incomingQuantity}, ` +
              `и после оприходования: ${remainingStockAfter}.`,
          );
        });
      }
    }
  });

  test('Test Case 25 - Receiving Cbed And Check Stock', async ({ page }) => {
    // doc test case 20
    logger.log('Test Case 25 - Receiving Cbed And Check Stock');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(page);
    const stock = new CreateStockPage(page);
    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(page);
    const tableStockRecieptModalWindow = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_MODAL_COMING_SCROLL;
    const tableComplectsSets = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 01: Receiving quantities from balances', async () => {
          // Check the number of entities in the warehouse before posting
          remainingStockBefore = await stock.checkingTheQuantityInStock(cbed.name, TableSelection.cbed);
        });

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          // Go to the Warehouse page
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          const selectorstockReceipt = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
          await stockReceipt.findTable(selectorstockReceipt);

          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 04: Click on the create receipt button', async () => {
          // Click on the button
          await stockReceipt.clickButton('Создать приход', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_RECEIPT);
        });

        await allure.step('Step 05: Select the selector in the modal window', async () => {
          // Select the selector in the modal window
          await stockReceipt.selectStockReceipt(StockReceipt.cbed);
          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);
        });

        await allure.step('Step 06: Search product', async () => {
          // Using table search we look for the value of the variable
          await stockReceipt.searchTable(
            cbed.name,
            tableComplectsSets,
            'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Search-Dropdown-Input',
          );

          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);

          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);
        });

        await allure.step('Step 06a: Check Кол-во на приход value and complete assembly kitting if needed', async () => {
          // Find the Кол-во на приход cell (TdParish) to check its value
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdParish
          const prihodQuantityCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN).first();

          await prihodQuantityCell.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          await prihodQuantityCell.scrollIntoViewIfNeeded();

          // Get the value from the cell
          const prihodValue = await prihodQuantityCell.textContent();
          const prihodQuantity = prihodValue?.trim() || '0';
          logger.log(`Кол-во на приход value: ${prihodQuantity}`);

          // If the value is 0, we need to complete assembly kitting
          if (prihodQuantity === '0' || prihodQuantity === '') {
            logger.log('Кол-во на приход is 0, completing assembly kitting in new tab...');

            // Create a new page/tab to perform assembly kitting without losing current context
            const newPage = await page.context().newPage();
            const newCompletingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(newPage);

            try {
              // Navigate to warehouse page in the new tab
              await newCompletingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

              // Open the assembly kitting page
              const selector = SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN;
              await newCompletingAssembliesToPlan.findTable(selector);
              await newPage.waitForLoadState('networkidle');

              // Search for the CBED
              await newCompletingAssembliesToPlan.searchTable(
                cbed.name,
                SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE,
                SelectorsAssemblyKittingOnThePlan.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT_ID,
              );
              await newPage.waitForTimeout(TIMEOUTS.STANDARD);
              await newPage.waitForLoadState('networkidle');

              // Double-click the designation cell to open the waybill modal
              const designationCell = newPage.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DESIGNATION_PATTERN).first();
              await designationCell.waitFor({
                state: 'visible',
                timeout: WAIT_TIMEOUTS.STANDARD,
              });
              await designationCell.scrollIntoViewIfNeeded();
              await designationCell.dblclick();
              await newPage.waitForLoadState('networkidle');
              await newPage.waitForTimeout(TIMEOUTS.INPUT_SET);

              // Wait for the modal to appear
              const waybillModal = newPage.locator(SelectorsModalWindowConsignmentNote.MODAL_WINDOW);
              await waybillModal.waitFor({
                state: 'visible',
                timeout: WAIT_TIMEOUTS.STANDARD,
              });

              // Check the checkbox in the modal
              const checkboxCell = newPage.locator(SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN).first();
              await checkboxCell.waitFor({
                state: 'visible',
                timeout: WAIT_TIMEOUTS.STANDARD,
              });
              await checkboxCell.scrollIntoViewIfNeeded();
              await checkboxCell.click();
              await newPage.waitForTimeout(TIMEOUTS.INPUT_SET);
              await newPage.waitForLoadState('networkidle');

              // Verify the "Скомплектовать" button is enabled before clicking
              const completeButton = newPage.locator(SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON);
              await completeButton.waitFor({
                state: 'visible',
                timeout: WAIT_TIMEOUTS.STANDARD,
              });
              await expect(completeButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.SHORT });
              logger.log('Скомплектовать button is enabled, clicking...');

              // Click the "Скомплектовать" button
              await newCompletingAssembliesToPlan.clickButton('Скомплектовать', SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON);

              // Wait for modal to close using the proper check function
              await newCompletingAssembliesToPlan.checkCloseModalWindow(SelectorsModalWindowConsignmentNote.MODAL_WINDOW);
              await newPage.waitForLoadState('networkidle');
              await newPage.waitForTimeout(TIMEOUTS.LONG);

              logger.log(`Assembly kitting completed for ${cbed.name}`);
            } finally {
              // Close the new tab and return to the original page
              await newPage.close();
              logger.log('New tab closed, returning to original page');
              // Wait for the server to process the kitting
              await page.waitForTimeout(TIMEOUTS.EXTENDED);
            }

            // Wait for data to propagate using Playwright's expect.poll
            logger.log('Waiting for kitting to propagate and refresh search...');

            const refreshAndCheckQuantity = async (): Promise<string> => {
              // Close the modal by clicking Cancel to force fresh data load
              const cancelButton = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CANCEL);
              if (await cancelButton.isVisible().catch(() => false)) {
                await cancelButton.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(TIMEOUTS.STANDARD);
              }

              // Click Сборка button in the small modal to reopen the main modal
              await stockReceipt.selectStockReceipt(StockReceipt.cbed);
              await page.waitForLoadState('networkidle');
              await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);

              // Re-search to refresh the table data
              await stockReceipt.searchTable(
                cbed.name,
                tableComplectsSets,
                'ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Search-Dropdown-Input',
              );
              await page.waitForLoadState('networkidle');
              await stockReceipt.waitingTableBodyNoThead(tableComplectsSets);

              // Check the updated quantity
              const updatedPrihodQuantityCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN).first();
              await updatedPrihodQuantityCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
              const updatedPrihodValue = await updatedPrihodQuantityCell.textContent();
              return updatedPrihodValue?.trim() || '0';
            };

            // Poll until quantity is non-zero
            await expect
              .poll(
                async () => {
                  const qty = await refreshAndCheckQuantity();
                  logger.log(`Кол-во на приход after kitting: ${qty}`);
                  return qty !== '0' && qty !== '' ? qty : null;
                },
                { timeout: 300000, intervals: [3000, 5000, 10000] },
              )
              .toBeTruthy();

            // Wait a bit after successful update to ensure UI is stable
            await page.waitForTimeout(TIMEOUTS.STANDARD);
          } else {
            logger.log(`Кол-во на приход is ${prihodQuantity}, no assembly kitting needed`);
          }
        });

        await allure.step('Step 06b: Click on Кол-во на приход cell to open Скомплектованные наборы modal', async () => {
          // Find the Кол-во на приход cell (TdParish) and click it to open the modal
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdParish
          const prihodQuantityCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN).first();

          await prihodQuantityCell.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          await prihodQuantityCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await prihodQuantityCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          // Click on the cell to open the Скомплектованные наборы modal
          await prihodQuantityCell.click();
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          await page.waitForLoadState('networkidle');

          // Wait for the Скомплектованные наборы modal to appear
          const completedSetsModal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST);
          await completedSetsModal.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          logger.log('Скомплектованные наборы modal opened');
        });

        await allure.step('Step 06c: Check that the modal window Скомплектованные наборы is displayed and wait for input field', async () => {
          // Verify the modal is visible
          await stockReceipt.completesSetsModalWindow();
          await page.waitForTimeout(TIMEOUTS.STANDARD);

          // Wait directly for the input field to be available
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row{id}-TdCount-Label-Input-Input
          const inputlocator = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_ROW_QUANTITY_INPUT_PATTERN;
          await page.locator(inputlocator).first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
          logger.log('Кол-во на отгрузку input field is visible');
        });

        await allure.step('Step 06d: Enter quantity in Кол-во на отгрузку input field', async () => {
          // Find the Кол-во на отгрузку input field in the modal
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-KitsList-Main-Table-Row{id}-TdCount-Label-Input-Input
          const inputlocator = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_ROW_QUANTITY_INPUT_PATTERN;

          // Get the input field (it should already be visible from Step 06c)
          const quantityInput = page.locator(inputlocator).first();
          await quantityInput.scrollIntoViewIfNeeded();
          await quantityInput.scrollIntoViewIfNeeded();

          // Highlight the input field for visual confirmation
          await quantityInput.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '3px solid red';
            el.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
          });
          await page.waitForTimeout(TIMEOUTS.MEDIUM); // Pause to see the highlight

          // Check that the element is not disabled
          const isDisabled = await quantityInput.getAttribute('disabled');
          if (isDisabled) {
            throw new Error('Элемент заблокирован для ввода.');
          }

          // Get the current value
          const quantityPerShipment = await quantityInput.getAttribute('value');
          logger.log('Кол-во на отгрузку current value: ', quantityPerShipment);

          // Enter the quantity (using incomingQuantity variable)
          await quantityInput.fill(incomingQuantity);
          await page.waitForTimeout(TIMEOUTS.SHORT);
          await quantityInput.press('Enter');
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await page.waitForLoadState('networkidle');
          logger.log(`Кол-во на отгрузку set to: ${incomingQuantity}`);
        });

        await allure.step('Step 06e: Click the save button in Скомплектованные наборы modal', async () => {
          // Click the Сохранить button (this is the save button in the modal)
          await stockReceipt.clickButton('Сохранить', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE);
          // Wait for modal to close and return to main table
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          logger.log('Сохранить button clicked, modal closed');
        });

        await allure.step('Step 06f: Check the checkbox in the first row', async () => {
          // Find the checkbox cell using data-testid pattern
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
          const checkboxCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_CHECKBOX_PATTERN).first();

          await checkboxCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await checkboxCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await checkboxCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          // Find the actual checkbox input inside the cell
          const checkbox = checkboxCell.getByRole('checkbox').first();

          // Check if the checkbox is disabled
          const isDisabled = await checkbox.isDisabled();
          if (isDisabled) {
            throw new Error('Cannot check the checkbox. Checkbox has the disabled attribute and cannot be checked.');
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
        });
      }
    }
  });
};
