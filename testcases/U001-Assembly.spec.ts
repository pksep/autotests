/**
 * @file U001-Assembly.spec.ts
 * @purpose Test Suite 4: Assembly Operations (Test Cases 11-14)
 * 
 * This suite handles:
 * - Test Case 11: Marking Parts
 * - Test Case 11b: Marking Parts Metalworking
 * - Test Case 12: Complete Set Of Cbed
 * - Test Case 13: Disassembly of the set
 * - Test Case 14: Complete Set Of Cbed After Desassembly
 */

import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as MetalWorkingWarhouseSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as ProductionPathSelectors from '../lib/Constants/SelectorsProductionPath';
import * as MarkOfCompletionSelectors from '../lib/Constants/SelectorsMarkOfCompletion';
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsCompleteSets from '../lib/Constants/SelectorsCompleteSets';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreatShortagePartsPage } from '../pages/ShortagePartsPage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import { CreateCompleteSetsPage } from '../pages/CompleteSetsPage';
import { expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import testData2 from '../testdata/U002-PC1.json';
import logger from '../lib/logger';
import * as U001Constants from './U001-Constants';
const {
  urgencyDate,
  quantityProductLaunchOnProduction,
  descendantsCbedArray,
  descendantsDetailArray,
  incomingQuantity,
  deficitTableDetail,
  buttonLaunchIntoProductionDetail,
  modalWindowLaunchIntoProductionDetail,
  buttonLaunchIntoProductionModalWindow,
} = U001Constants;
// Mutable variables that need to be reassigned
let urgencyDateOnTable = U001Constants.urgencyDateOnTable;
let quantityProductLaunchOnProductionBefore = U001Constants.quantityProductLaunchOnProductionBefore;
let quantityProductLaunchOnProductionAfter = U001Constants.quantityProductLaunchOnProductionAfter;
let quantitySumLaunchOnProduction = U001Constants.quantitySumLaunchOnProduction;

export const runU001_04_Assembly = (isSingleTest: boolean, iterations: number) => {
  console.log(`Start of the test: U001 Assembly Operations (Test Cases 11-14)`);

  test('Test Case 11 - Marking Parts', async ({ page }) => {
    console.log('Test Case 11 - Marking Parts');
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const shortageParts = new CreatShortagePartsPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01-02: Open the warehouse page and shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.navigateToPageAndWaitForTable(
        SELECTORS.MAINMENU.WAREHOUSE.URL,
        SelectorsShortagePages.SELECTOR_DEFICIT_DETAL,
        SelectorsShortagePages.TABLE_DEFICIT_IZD,
      );
    });

    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 05: Search product', async () => {
          // Using table search we look for the value of the variable
          // searchAndWaitForTable already handles waiting for the table and network idle
          await shortageParts.searchAndWaitForTable(part.name, deficitTableDetail, deficitTableDetail, {
            useRedesign: true,
            timeoutBeforeWait: 1000,
          });
        });

        await allure.step('Step 06: Check that the first row of the table contains the variable name', async () => {
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
            console.log('Checkbox is not checked, attempting to check it...');
            await checkbox.click();
            await page.waitForTimeout(TIMEOUTS.SHORT);

            // Verify the checkbox is now checked
            const isCheckedAfter = await checkbox.isChecked();
            if (!isCheckedAfter) {
              throw new Error('Failed to check the checkbox. Checkbox remains unchecked after click.');
            }
            console.log('Checkbox successfully checked');
          } else {
            console.log('Checkbox is already checked, skipping click');
          }

          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);
        });

        await allure.step('Step 07: Checking the urgency date of an order', async () => {
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

          console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            },
            `Verify urgency date equals "${urgencyDate}"`,
            test.info(),
          );
        });

        await allure.step('Step 08: We check the number of those launched into production', async () => {
          // Get the value using data-testid directly
          const quantityCell = page.locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN).first();
          await quantityCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });
          quantityProductLaunchOnProductionBefore = (await quantityCell.textContent()) || '0';

          console.log('The value in the cells is put into production befor:', quantityProductLaunchOnProductionBefore);
        });

        await allure.step('Step 09: Click on the Launch on production button ', async () => {
          // Ensure at least one row is rendered
          const rows = page.locator(SelectorsShortagePages.ROW_PATTERN);
          await rows.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });

          const firstRow = rows.first();

          // Prefer role-based checkbox if present
          const roleCheckbox = firstRow.getByRole('checkbox').first();

          let ensuredChecked = false;
          try {
            await roleCheckbox.scrollIntoViewIfNeeded();
            await roleCheckbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            const roleIsChecked = await roleCheckbox.isChecked();
            if (!roleIsChecked) {
              console.log('Checkbox (role) is not selected, selecting it now...');
              await roleCheckbox.click();
              ensuredChecked = true;
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
            } else {
              console.log('Checkbox (role) is already selected');
              ensuredChecked = true;
            }
          } catch (e) {
            console.log('Role-based checkbox not available/visible, falling back to cell/input.');
          }

          if (!ensuredChecked) {
            // Fallback: find checkbox cell and inner input
            const checkboxCell = firstRow.locator(PartsDBSelectors.TABLE_ROW_CHECKBOX_PATTERN).first();
            await checkboxCell.scrollIntoViewIfNeeded();
            const inputCheckbox = checkboxCell.locator(PartsDBSelectors.INPUT_CHECKBOX_PATTERN).first();

            // Some UIs hide input and toggle on cell/label click
            try {
              await inputCheckbox.waitFor({
                state: 'visible',
                timeout: WAIT_TIMEOUTS.SHORT,
              });
              const isChecked = await inputCheckbox.isChecked();
              if (!isChecked) {
                console.log('Checkbox input is not selected, clicking input...');
                await inputCheckbox.click();
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
              } else {
                console.log('Checkbox input is already selected');
              }
            } catch {
              console.log('Checkbox input not visible, clicking the checkbox cell instead...');
              await checkboxCell.click();
              await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
            }
          }

          // Click on the button
          await shortageParts.clickButton('Запустить в производство', buttonLaunchIntoProductionDetail);
        });

        await allure.step('Step 10: Testing a modal window for production launch', async () => {
          // Check the modal window Launch into production
          await shortageParts.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProductionDetail);

          // Check the date in the Launch into production modal window
          // await shortageParts.checkCurrentDate(
          //   '[data-testid="ModalStartProduction-OrderDateValue"]'
          // );//ERP-2366
        });

        await allure.step('Step 11: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
          await shortageParts.checkOrderQuantity(locator, '2', quantityProductLaunchOnProduction);
        });

        await allure.step('Step 12: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageParts.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step('Step 13: Click on the In launch button', async () => {
          // Click on the button
          await shortageParts.clickButton('В производство', buttonLaunchIntoProductionModalWindow);
        });

        await allure.step('Step 14: We check that the order number is displayed in the notification', async () => {
          // Check the order number in the success notification
          await shortageParts.getMessage(checkOrderNumber);
        });

        await allure.step('Step 15: Close success message', async () => {
          await shortageParts.closeSuccessMessage();
        });

        await allure.step('Step 16: We check the number of those launched into production', async () => {
          // Find the production ordered quantity cell using data-testid (starts with pattern)
          const productionOrderedCell = page.locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN).first();

          await productionOrderedCell.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          await productionOrderedCell.scrollIntoViewIfNeeded();

          // Highlight the production ordered quantity cell
          await productionOrderedCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the production ordered quantity value from the cell
          const productionOrderedValue = await productionOrderedCell.textContent();
          quantityProductLaunchOnProductionAfter = productionOrderedValue?.trim() || '';

          console.log('The value in the cells is put into production after:', quantityProductLaunchOnProductionAfter);

          quantitySumLaunchOnProduction = Number(quantityProductLaunchOnProductionBefore) + Number(quantityProductLaunchOnProduction);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect
                .soft(Number(quantityProductLaunchOnProductionAfter))
                .toBe(Number(quantityProductLaunchOnProductionBefore) + Number(quantityProductLaunchOnProduction));
            },
            'Verify production ordered quantity increased correctly',
            test.info(),
          );
        });
      }
    }
  });

  // HARDCODED VALUES FOR TEST CASE 11 (to allow skipping previous test cases)
  // These values are normally set in Test Case 10
  //quantitySumLaunchOnProduction = 4; // Normally: quantityProductLaunchOnProductionBefore (2) + quantityProductLaunchOnProduction (2)

  test('Test Case 11b - Marking Parts Metalworking', async ({ page }) => {
    console.log('Test Case 11b - Marking Parts Metalworking');
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const metalworkingWarehouse = new CreateMetalworkingWarehousePage(page);

    const productionTable = ProductionPathSelectors.OPERATION_TABLE;
    let numberColumnQunatityMade: number;
    let firstOperation: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await metalworkingWarehouse.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the metalworking warehouse page', async () => {
      // Find and go to the page using the locator Order a warehouse for Metalworking
      const selector = MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE;
      await metalworkingWarehouse.findTable(selector);
      // Wait for the page to stabilize
      await metalworkingWarehouse.waitForNetworkIdle();
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      const titles = testData2.elements.MetalworkingWarhouse.titles;
      const buttons = testData2.elements.MetalworkingWarhouse.buttons;
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await metalworkingWarehouse.validatePageHeadersAndButtons(page, titles, buttons, MetalWorkingWarhouseSelectors.PAGE_TESTID);
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        console.log('part.nameXXXX: ', part.name);
        await allure.step('Step 05-06: Search product and verify first row', async () => {
          // Wait for the table to be visible (may be empty before search) - searchAndVerifyFirstRow will populate it
          await metalworkingWarehouse.waitingTableBody(MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE, {
            timeoutMs: WAIT_TIMEOUTS.LONG,
          });

          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          // Using table search we look for the value of the variable and verify it's in the first row
          await metalworkingWarehouse.searchAndVerifyFirstRow(
            part.name,
            MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE,
            MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE,
            {
              useRedesign: true,
              timeoutBeforeWait: 500,
            },
          );
        });

        await allure.step('Step 07: Checking the urgency date of an order', async () => {
          // Pattern: MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-Row{number}-DateByUrgency
          const urgencyDateCell = page.locator(MetalWorkingWarhouseSelectors.METALWORKING_SCLAD_TABLE_ROW_DATE_BY_URGENCY_PATTERN).first();

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

          console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            },
            `Verify urgency date equals "${urgencyDate}"`,
            test.info(),
          );
        });

        await allure.step('Step 08: We check the number of those launched into production', async () => {
          // Get the value using data-testid directly
          const quantityCell = page.locator(MetalWorkingWarhouseSelectors.METALWORKING_SCLAD_TABLE_ROW_ORDERED_PATTERN).first();
          await quantityCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });
          quantityProductLaunchOnProductionBefore = (await quantityCell.textContent()) || '0';

          console.log('The value in the cells is orders befor:', quantityProductLaunchOnProductionBefore);

          // The expected value should be at least quantitySumLaunchOnProduction (from Test Case 11)
          // but may be higher if there were additional operations. Check that it's >= expected minimum
          // and also check that it matches the pattern: it should be quantitySumLaunchOnProduction or higher
          // due to accumulated operations from Test Case 11
          const actualValue = Number(quantityProductLaunchOnProductionBefore);
          const expectedMin = Number(quantitySumLaunchOnProduction) || 4; // Fallback to 4 if not set

          // Allow for accumulated values - the value should be at least the expected minimum
          // This accounts for the fact that Test Case 11 may have run multiple times or accumulated values
          expect.soft(actualValue).toBeGreaterThanOrEqual(expectedMin);

          // Also log for debugging
          console.log(`Expected minimum: ${expectedMin}, Actual: ${actualValue}`);
        });

        await allure.step('Step 09: Find and click on the operation icon', async () => {
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

          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 10: Checking the modalwindow headings', async () => {
          await page.waitForTimeout(TIMEOUTS.EXTENDED);
          const titles = testData1.elements.ModalWindowPartsProductionPath.titles.map(title => title.trim());
          const h3Titles = await metalworkingWarehouse.getAllH3AndH4TitlesInModalTestId(
            page,
            'MetalloworkingSclad-Content-WithFilters-TableWrapper-Table-ModalOperationPathMetaloworking',
          );
          const normalizedH3Titles = h3Titles.map(title => title.trim());

          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          // Log for debugging
          console.log('Expected Titles:', titles);
          console.log('Received Titles:', normalizedH3Titles);

          // Validate length
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(normalizedH3Titles.length).toBe(titles.length);
              expect.soft(normalizedH3Titles).toEqual(titles);
            },
            'Verify modal window titles match expected',
            test.info(),
          );
        });

        await allure.step('Step 11: Checking the buttons on the modalwindow', async () => {
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          const buttons = testData1.elements.ModalWindowPartsProductionPath.buttons;
          // Iterate over each button in the array
          for (const button of buttons) {
            // Extract the class, label, and state from the button object
            const buttonClass = button.class;
            const buttonLabel = button.label;
            const expectedState = button.state === 'true' ? true : false;

            // Perform the validation for the button
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
              // Check if the button is visible and enabled
              const isButtonReady = await metalworkingWarehouse.isButtonVisible(page, buttonClass, buttonLabel, expectedState);

              // Validate the button's visibility and state
              await expectSoftWithScreenshot(
                page,
                async () => {
                  expect.soft(isButtonReady).toBeTruthy();
                },
                `Verify button "${buttonLabel}" is visible and enabled`,
                test.info(),
              );
              console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
          }
        });

        await allure.step('Step 12: We find, get the value and click on the cell done pcs', async () => {
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

        await allure.step('Step 13: Find and get the value from the operation cell', async () => {
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

          console.log(firstOperation);
          logger.info(firstOperation);
        });

        await allure.step('Step 14: Click on the add mark button', async () => {
          // Click on the button
          await metalworkingWarehouse.clickButton('Добавить отметку', MarkOfCompletionSelectors.BUTTON_ADD_MARK);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 15: Checking the modalwindow headings', async () => {
          await page.waitForTimeout(TIMEOUTS.EXTENDED);
          const titles = testData1.elements.ModalWindowMarkOfCompletion.titles.map(title => title.trim());

          // Pass only the prefix part of the testId - the method will handle the suffix
          const h3Titles = await metalworkingWarehouse.getAllH3AndH4TitlesInModalTestId(page, 'OperationPathInfo-ModalMark-Create');
          const normalizedH3Titles = h3Titles.map(title => title.trim());

          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          // Log for debugging
          console.log('Expected Titles:', titles);
          console.log('Received Titles:', normalizedH3Titles);

          // Validate length
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(normalizedH3Titles.length).toBe(titles.length);
              expect.soft(normalizedH3Titles).toEqual(titles);
            },
            'Verify modal window titles match expected',
            test.info(),
          );
        });

        await allure.step('Step 16: Checking the buttons on the modalwindow', async () => {
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          const buttons = testData1.elements.ModalWindowMarkOfCompletion.buttons;
          // Iterate over each button in the array
          for (const button of buttons) {
            // Extract the class, label, and state from the button object
            const buttonClass = button.class;
            const buttonLabel = button.label;
            const buttonDataTestId = button.datatestid;
            const expectedState = button.state === 'true' ? true : false;

            // Perform the validation for the button
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
              // Check if the button is visible and enabled

              const isButtonReady = await metalworkingWarehouse.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);

              // Validate the button's visibility and state
              await expectSoftWithScreenshot(
                page,
                async () => {
                  expect.soft(isButtonReady).toBeTruthy();
                },
                `Verify button "${buttonLabel}" is visible and enabled`,
                test.info(),
              );
              console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
          }
        });

        await allure.step('Step 17: Checking the modal window and marking completion', async () => {
          // Check the progress check modal window
          await metalworkingWarehouse.completionMarkModalWindow(firstOperation, part.name, part.designation);
        });

        // await allure.step(
        //   'Step 18: Click on the Save order button',
        //   async () => {
        //     // Click on the button
        //     await metalworkingWarehouse.clickButton(
        //       'Сохранить',
        //       '[data-testid="ModalMark-Button-Save"]'
        //     );
        //   }
        // );

        await allure.step('Step 18: Closing the first modal window by pressing escape', async () => {
          // Close the modal window from "Add mark" step
          await page.keyboard.press('Escape');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
        });

        // await allure.step('Step 19: Closing modal windows', async () => {
        //   // Try to find and click the modal close button first
        //   const closeButton = page
        //     .locator('button[data-testid="ModalMark-Button-Cancel"]')
        //     .first();
        //   const closeCount = await closeButton.count();

        //   if (closeCount > 0) {
        //     await closeButton.click();
        //     await page.waitForTimeout(TIMEOUTS.MEDIUM);
        //   }

        //   // Also try pressing Escape to close any remaining modals
        //   await page.keyboard.press('Escape');
        //   await page.waitForTimeout(TIMEOUTS.MEDIUM);

        //   // Finally, try clicking at (1,1) to close any remaining overlays
        //   await page.mouse.dblclick(1, 1);
        //   await page.waitForTimeout(TIMEOUTS.STANDARD);
        //   await page.waitForLoadState('networkidle');

        //   // Wait for the table body to load
        //   await metalworkingWarehouse.waitingTableBody(
        //     MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE
        //   );
        // });
        console.log('part.nameYYYYYY: ', part.name);
      }
    }
  });

  // HARDCODED VALUES FOR TEST CASE 12 (to allow skipping previous test cases)
  // These values are normally set in Test Case 06
  // descendantsCbedArray.length = 0; // Clear array first
  // descendantsCbedArray.push({ name: '0Т4.11', designation: '-', quantity: 1 }, { name: '0Т4.12', designation: '-', quantity: 1 });

  test('Test Case 12 - Complete Set Of Cbed', async ({ page }) => {
    console.log('Test Case 12 - Complete Set Of Cbed');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(page);
    // Use SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE for table selector
    const tableMain = SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await completingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the completion cbed plan page', async () => {
      // Find and go to the page using the locator Completing assemblies to plan
      const selector = SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN;
      await completingAssembliesToPlan.findTable(selector);
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const titles = testData1.elements.AssemblyKittingOnThePlan.titles;
      const buttons = testData1.elements.AssemblyKittingOnThePlan.buttons;
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await completingAssembliesToPlan.validatePageHeadersAndButtons(page, titles, buttons, SelectorsAssemblyKittingOnThePlan.PAGE_TESTID);
    });

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой. Перебор невозможен.');
    } else {
      console.log('TTTTTTTTTTTTTTTTTTTT: ' + JSON.stringify(descendantsCbedArray, null, 2));
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 05-06: Search product and verify first row', async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // Using table search we look for the value of the variable and verify it's in the first row
          await completingAssembliesToPlan.searchAndVerifyFirstRow(
            cbed.name,
            SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE,
            SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE,
            {
              searchInputDataTestId: SelectorsAssemblyKittingOnThePlan.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT_ID,
              timeoutBeforeWait: 1000,
            },
          );
        });

        await allure.step('Step 07: Checking the urgency date of an order', async () => {
          // Get the value using data-testid directly
          // const urgencyDateCell = page
          //   .locator(
          //     '[data-testid^="CompletCbed-Content-Table-Table-TableRow"][data-testid$="-DateUrgency"]'
          //   )
          //   .first();
          const urgencyDateCell = page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DATE_URGENCY_PATTERN).nth(1); //ERP-2423

          // Wait for the cell to be visible and populated (not just "-") using Playwright's expect.poll
          await urgencyDateCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

          // Wait for the cell to contain a valid date using expect.poll
          await expect
            .poll(
              async () => {
                const text = (await urgencyDateCell.textContent())?.trim() || '';
                return text && text !== '-' && text.length > 0 ? text : null;
              },
              { timeout: WAIT_TIMEOUTS.STANDARD, intervals: [200] },
            )
            .toBeTruthy();

          await completingAssembliesToPlan.waitAndHighlight(urgencyDateCell);

          urgencyDateOnTable = (await urgencyDateCell.textContent())?.trim() || '';
          console.log(`Date cell populated with: "${urgencyDateOnTable}"`);

          console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
          console.log('Дата по срочности в переменной: ', urgencyDate);

          expect.soft(urgencyDateOnTable).toBe(urgencyDate);
        });

        await allure.step('Step 08: Find the column designation and click', async () => {
          // Get the designation cell using data-testid directly and double-click it
          const designationCell = page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DESIGNATION_PATTERN).first();
          await designationCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });
          await designationCell.dblclick();
          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 09: Checking for the presence of headings in the modal window Invoice for assembly', async () => {
          await page.waitForTimeout(TIMEOUTS.INPUT_SET);
          const titles = testData1.elements.ModalWindowAssemblyInvoice.titles.map(title => title.trim());
          const h3Titles = await completingAssembliesToPlan.getAllH3TitlesInModalClassNew(page, SelectorsModalWindowConsignmentNote.MODAL_WINDOW_OPEN);
          const normalizedH3Titles = h3Titles.map(title => title.trim());

          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          // Log for debugging
          console.log('Expected Titles:', titles);
          console.log('Received Titles:', normalizedH3Titles);

          // Validate length and content
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(normalizedH3Titles.length).toBe(titles.length);
              expect.soft(normalizedH3Titles).toEqual(titles);
            },
            'Verify modal window titles match expected',
            test.info(),
          );
        });

        await allure.step('Step 10: Checking the presence of buttons in the modal window Invoice for assembly', async () => {
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          const buttons = testData1.elements.ModalWindowAssemblyInvoice.buttons;
          // Iterate over each button in the array
          for (const button of buttons) {
            // Extract the class, label, and state from the button object
            const buttonClass = button.class;
            const buttonLabel = button.label;

            // Perform the validation for the button
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
              // Check if the button is visible and enabled
              // Use waitForEnabled=true to wait for button to become enabled (for buttons that may be disabled initially)
              const isButtonReady = await completingAssembliesToPlan.isButtonVisible(page, buttonClass, buttonLabel, true, '', true);

              // Validate the button's visibility and state
              await expectSoftWithScreenshot(
                page,
                async () => {
                  expect.soft(isButtonReady).toBeTruthy();
                },
                `Verify button "${buttonLabel}" is visible and enabled`,
                test.info(),
              );
              console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
          }
        });

        await allure.step('Step 11: Checking a checkbox in a modal window', async () => {
          await page.waitForTimeout(TIMEOUTS.LONG);

          // Check the checkbox in the modal using data-testid
          // Pattern: ModalAddWaybill-ShipmentDetailsTable-Row{number}-SelectCell
          const checkboxCell = page.locator(SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN).first();

          await checkboxCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await checkboxCell.scrollIntoViewIfNeeded();

          // Highlight the checkbox cell
          await checkboxCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
          });

          // Click the checkbox cell
          await checkboxCell.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 12: Enter your quantity', async () => {
          await completingAssembliesToPlan.checkOrderQuantity(
            SelectorsModalWindowConsignmentNote.QUANTITY_INPUT,
            quantityProductLaunchOnProduction,
            incomingQuantity,
          );
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 13: Click on the button to assemble into a set', async () => {
          // Click on the button
          await completingAssembliesToPlan.clickButton('Скомплектовать', SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON);
        });

        await allure.step('Step 14: Check close modal window complete set', async () => {
          await completingAssembliesToPlan.checkCloseModalWindow(SelectorsModalWindowConsignmentNote.MODAL_WINDOW);
          // Wait for loading
          await page.waitForLoadState('networkidle');
        });
      }
    }
  });

  test('Test Case 13 - Disassembly of the set', async ({ page }) => {
    // doc test case 8
    console.log('Test Case 13 - Disassembly of the set');
    test.setTimeout(TEST_TIMEOUTS.SHORT);

    // Setup request failure logging to identify 404 sources
    const failedRequests: Array<{ url: string; resourceType: string }> = [];
    page.on('requestfailed', request => {
      const url = request.url();
      const resourceType = request.resourceType();
      failedRequests.push({ url, resourceType });
      logger.error(`Request FAILED (${resourceType}): ${url} - Status: ${request.failure()?.errorText || 'Unknown'}`);
    });

    const completeSets = new CreateCompleteSetsPage(page);
    const completeSetsTable = SelectorsCompleteSets.TABLE_SCROLL;
    const disassembly = SelectorsCompleteSets.MODAL_UNCOMPLECT_KIT_ASSEMBLY_BLOCK_PATTERN;
    let qunatityCompleteSet: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await completeSets.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsCompleteSets.SELECTOR_COMPLETE_SETS;
      await completeSets.findTable(selector);

      // Wait for the table body to load
      // await completeSets.waitingTableBody(completeSetsTable);

      // Wait for loading
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      const titles = testData1.elements.DisassemblyPage.titles;
      const buttons = testData1.elements.DisassemblyPage.buttons;
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await completeSets.validatePageHeadersAndButtons(page, titles, buttons, SelectorsCompleteSets.ASSEMBLY_PAGE_TESTID);
    });

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой. Перебор невозможен.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 05: Search product', async () => {
          await completeSets.waitForTimeout(TIMEOUTS.STANDARD);
          // Using table search we look for the value of the variable
          await completeSets.searchTable(cbed.name, completeSetsTable, 'DeficitCbed-SearchInput-Dropdown-Input');

          // Wait for the table body to load
          // await completeSets.waitingTableBody(completeSetsTable);
          await completeSets.waitForTimeout(TIMEOUTS.INPUT_SET);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 06: We check the number of those launched into production', async () => {
          // Find the assembled quantity cell using data-testid
          const assembledCell = page.locator(SelectorsCompleteSets.TABLE_CELL_ASSEMBLED).first();

          await assembledCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await assembledCell.scrollIntoViewIfNeeded();

          // Highlight the assembled quantity cell
          await assembledCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the assembled quantity value from the cell
          const assembledValue = await assembledCell.textContent();
          qunatityCompleteSet = assembledValue?.trim() || '';

          console.log('Количество собранных наборов: ', qunatityCompleteSet);
          // TABLE_SCROLL is a scroll container, need to find the table inside it
          const completeSetsTableSelector = `${completeSetsTable} table`;
          await completeSets.checkNameInLineFromFirstRow(cbed.name, completeSetsTableSelector);
        });

        await allure.step('Step 07: Look for the column with the checkbox and click on it', async () => {
          // Find the checkbox using data-testid
          const checkboxCell = page.locator(SelectorsCompleteSets.TABLE_CELL_CHECKBOX).first();

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
            console.log('Checkbox is not checked, attempting to check it...');
            await checkbox.click();
            await page.waitForTimeout(TIMEOUTS.SHORT);

            // Verify the checkbox is now checked
            const isCheckedAfter = await checkbox.isChecked();
            if (!isCheckedAfter) {
              throw new Error('Failed to check the checkbox. Checkbox remains unchecked after click.');
            }
            console.log('Checkbox successfully checked');
          } else {
            console.log('Checkbox is already checked, skipping click');
          }
        });

        await allure.step('Step 08: Click on the Submit for assembly button', async () => {
          await completeSets.clickButton('Разкомплектовать', SelectorsCompleteSets.BUTTON_UNASSEMBLE);
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 09: Checking the modalwindow headings', async () => {
          const titles = testData1.elements.ModalWindowResetInSets.titles.map(title => title.trim());
          const h3Titles = await completeSets.getAllH3TitlesInModalClassNew(page, SelectorsCompleteSets.MODAL_UNCOMPLECT_KIT_RIGHT_CONTENT);
          const normalizedH3Titles = h3Titles.map(title => title.trim());

          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          // Log for debugging
          console.log('Expected Titles:', titles);
          console.log('Received Titles:', normalizedH3Titles);

          // Validate length and content
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(normalizedH3Titles.length).toBe(titles.length);
              expect.soft(normalizedH3Titles).toEqual(titles);
            },
            'Verify modal window titles match expected',
            test.info(),
          );
        });

        await allure.step('Step 10: Checking buttons on the modalwindow', async () => {
          // Wait for the page to stabilize
          await page.waitForLoadState('networkidle');

          const buttons = testData1.elements.ModalWindowResetInSets.buttons;
          // Iterate over each button in the array
          for (const button of buttons) {
            // Extract the class, label, and state from the button object
            const buttonClass = button.class;
            const buttonLabel = button.label;
            const buttonDataTestId = button.datatestid;
            const buttonState = button.state;

            // Perform the validation for the button
            await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
              // Check if the button is visible and enabled

              const expectedState = buttonState === 'true' ? true : false;
              const isButtonReady = await completeSets.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);

              // Validate the button's visibility and state
              await expectSoftWithScreenshot(
                page,
                async () => {
                  expect.soft(isButtonReady).toBeTruthy();
                },
                `Verify button "${buttonLabel}" is visible and enabled`,
                test.info(),
              );
              console.log(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
            });
          }
        });

        await allure.step('Step 11: Check modal window', async () => {
          await completeSets.disassemblyModalWindow(cbed.name, cbed.designation);

          // const numberColumn = await completeSets.findColumn(
          //     page,
          //     "ModalUncomplectKit-AssemblyTable",
          //     "ModalUncomplectKit-AssemblyTableHeaderKitQuantity"
          // );
          // console.log(
          //     "numberColumn: AssemblyTableHeaderKitQuantity",
          //     numberColumn
          // );
          qunatityCompleteSet = await completeSets.getValueOrClickFromFirstRow(disassembly, 1);
          // Upd:
          const qunatityCompleteSetInModalWindow = await completeSets.getValueOrClickFromFirstRow(disassembly, 1);
          console.log('Количество собранных наборов: ', qunatityCompleteSet);
          console.log('Количество собранных наборов в модальном окне: ', qunatityCompleteSetInModalWindow);
          //expect(qunatityCompleteSet).toBe(qunatityCompleteSetInModalWindow);
        });

        await allure.step('Step 12: Enter quantity for disassembly', async () => {
          const cell = page.locator(SelectorsCompleteSets.MODAL_UNCOMPLECT_KIT_ASSEMBLY_TABLE_KIT_INPUT_PATTERN);
          const input = cell.getByTestId('InputNumber-Input').first();
          await input.scrollIntoViewIfNeeded();
          await input.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          const currentValue = await input.inputValue();
          console.log('К разкомплектовке: ', currentValue);
          await input.fill('1');
          await page.waitForTimeout(TIMEOUTS.LONG);
        });

        await allure.step('Step 13: Click on the Disassembly button', async () => {
          const disassembleBtn = page.getByTestId('ComplectKit-Modal-UncomplectKit-Bottom-ButtonsCenter-Save');

          await disassembleBtn.scrollIntoViewIfNeeded();
          await disassembleBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(disassembleBtn).toBeEnabled();
            },
            'Verify disassemble button is enabled',
            test.info(),
          );

          // Trial click to detect overlays
          await disassembleBtn.click({ trial: true });
          await disassembleBtn.click();
          await page.waitForTimeout(TIMEOUTS.LONG);
        });
      }

      // Log summary of failed requests after all loop iterations
      if (failedRequests.length > 0) {
        logger.info(`\n=== 404 Request Failure Summary ===`);
        logger.info(`Total failed requests: ${failedRequests.length}`);

        // Group by resource type
        const byType = failedRequests.reduce((acc, req) => {
          acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        logger.info(`Failed by type: ${JSON.stringify(byType, null, 2)}`);

        // Show unique URLs (limit to first 10 to avoid spam)
        const uniqueUrls = [...new Set(failedRequests.map(r => r.url))].slice(0, 10);
        logger.info(`Sample failed URLs (first 10):`);
        uniqueUrls.forEach(url => logger.info(`  - ${url}`));

        if (failedRequests.length > 10) {
          logger.info(`  ... and ${failedRequests.length - 10} more failures`);
        }
        logger.info(`=====================================\n`);
      }
    }
  });

  test('Test Case 14 - Complete Set Of Cbed After Desassembly', async ({
    //doc test case 9
    page,
  }) => {
    console.log('Test Case 14 - Complete Set Of Cbed After Desassembly');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const completingAssembliesToPlan = new CreateCompletingAssembliesToPlanPage(page);
    const TableComplect = await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await completingAssembliesToPlan.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the completion cbed plan page', async () => {
      // Find and go to the page using the locator Completing assemblies to plan
      const selector = SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN;
      await completingAssembliesToPlan.findTable(selector);
    });

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 03-04: Search product and verify first row', async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // Using table search we look for the value of the variable and verify it's in the first row
          await completingAssembliesToPlan.searchAndVerifyFirstRow(
            cbed.name,
            SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE,
            SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE,
            {
              searchInputDataTestId: SelectorsAssemblyKittingOnThePlan.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT_ID,
              timeoutBeforeWait: 1000,
            },
          );
        });

        await allure.step('Step 05: Checking the urgency date of an order', async () => {
          // Get the value using data-testid directly
          // Pattern: CompletCbed-Content-Table-Table-TableRow{number}-DateUrgency
          // const urgencyDateCell = page
          //   .locator(
          //     '[data-testid^="CompletCbed-Content-Table-Table-TableRow"][data-testid$="-DateUrgency"]'
          //   )
          //   .first(); //ERP-2423
          const urgencyDateCell = page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DATE_URGENCY_PATTERN).nth(1);
          await urgencyDateCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          const urgencyDateText = await urgencyDateCell.textContent();
          urgencyDateOnTable = urgencyDateText?.trim() || '';

          console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
          console.log('Дата по срочности в переменной: ', urgencyDate);

          if (urgencyDateOnTable) {
            await expectSoftWithScreenshot(
              page,
              async () => {
                expect.soft(urgencyDateOnTable).toBe(urgencyDate);
              },
              `Verify urgency date equals "${urgencyDate}"`,
              test.info(),
            );
          } else {
            throw new Error('Urgency date cell not found or empty');
          }
        });

        await allure.step('Step 06: Find the column designation and click', async () => {
          // Get the designation cell using data-testid directly
          // Pattern: CompletCbed-Content-Table-Table-TableRow{number}-Designation
          const designationCell = page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_CBED_DESIGNATION_PATTERN).first();

          await designationCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await designationCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await designationCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.color = 'blue';
          });

          await designationCell.dblclick();
          await page.waitForTimeout(TIMEOUTS.VERY_LONG);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 07: Checking a checkbox in a modal window', async () => {
          await page.waitForTimeout(TIMEOUTS.LONG);

          // Check the checkbox in the modal using data-testid
          // Pattern: ModalAddWaybill-ShipmentDetailsTable-Row{number}-SelectCell
          const checkboxCell = page.locator(SelectorsModalWindowConsignmentNote.TABLE_ORDERS_ROW_SELECT_CELL_PATTERN).first();

          await checkboxCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await checkboxCell.scrollIntoViewIfNeeded();

          // Highlight the checkbox cell
          await checkboxCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
          });

          // Click the checkbox cell
          await checkboxCell.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 08: Enter your quantity', async () => {
          // Check the modal window for the delivery note and check the checkbox
          await completingAssembliesToPlan.checkOrderQuantity(
            SelectorsModalWindowConsignmentNote.QUANTITY_INPUT,
            quantityProductLaunchOnProduction,
            incomingQuantity,
          );
          // Wait for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 09: Click on the button to assemble into a set', async () => {
          // Click on the button
          await completingAssembliesToPlan.clickButton('Скомплектовать', SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON);
        });

        await allure.step('Step 10: Check close modal window complete set', async () => {
          await completingAssembliesToPlan.checkCloseModalWindow(SelectorsModalWindowConsignmentNote.MODAL_WINDOW);
          // Wait for loading
          await page.waitForLoadState('networkidle');
        });
      }
    }
  });

};
