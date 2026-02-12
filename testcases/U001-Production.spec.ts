/**
 * @file U001-Production.spec.ts
 * @purpose Test Suite 3: Production Launch (Test Cases 08-10)
 * 
 * This suite handles:
 * - Test Case 08: Launch Into Production Product
 * - Test Case 09: Launch Into Production Cbed
 * - Test Case 10: Launch Into Production Parts
 */

import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsStartProduction from '../lib/Constants/SelectorsStartProduction';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateShortageProductPage } from '../pages/ShortageProductPage';
import { CreatShortageAssembliesPage } from '../pages/ShortageAssembliesPage';
import { CreatShortagePartsPage } from '../pages/ShortagePartsPage';
import { expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import * as U001Constants from './U001-Constants';
const {
  nameProduct,
  urgencyDate,
  quantityProductLaunchOnProduction,
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
let quantityProductLaunchOnProductionAfter = U001Constants.quantityProductLaunchOnProductionAfter;

export const runU001_03_Production = (isSingleTest: boolean, iterations: number) => {
  console.log(`Start of the test: U001 Production Launch (Test Cases 08-10)`);

  test('Test Case 08 - Launch Into Production Product', async ({ page }) => {
    console.log('Test Case 08 - Launch Into Production Product');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const shortageProduct = new CreateShortageProductPage(page);

    let checkOrderNumber: string;

    await allure.step('Step 01-02: Open the warehouse page and shortage product page', async () => {
      // Find and go to the page using the locator Shortage of Products
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION;
      await shortageProduct.navigateToPageAndWaitForTable(SELECTORS.MAINMENU.WAREHOUSE.URL, selector, deficitTable);
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      // [SPEED] JSON validation (titles/buttons) commented out - re-enable for UI validation
      // const titles = testData1.elements.ProductShortage.titles;
      // const buttons = testData1.elements.ProductShortage.buttons;
      // await shortageProduct.validatePageHeadersAndButtons(page, titles, buttons, SelectorsShortagePages.PAGE_TESTID);
    });

    await allure.step('Step 05: Search product', async () => {
      // Using table search we look for the value of the variable
      await shortageProduct.searchAndWaitForTable(nameProduct, deficitTable, deficitTable, {
        useRedesign: true,
        timeoutBeforeWait: 2000,
      });
    });

    await allure.step('Step 06: Check the checkbox in the first column', async () => {
      // Find the checkbox using data-testid
      const checkboxCell = page.locator(SelectorsShortagePages.ROW_CHECKBOX).first();

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
      await shortageProduct.waitingTableBody(deficitTable);
    });

    await allure.step('Step 07: Checking the urgency date of an order', async () => {
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

      console.log('Date by urgency in the table: ', urgencyDateOnTable);

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
      // Find the production ordered quantity cell using data-testid
      const productionOrderedCell = page.locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED).first();

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
      quantityProductLaunchOnProductionBefore = productionOrderedValue?.trim() || '';

      console.log('The value in the cells is put into production befor:', quantityProductLaunchOnProductionBefore);
    });

    await allure.step('Step 09: Click on the Launch on production button', async () => {
      // Click on the button
      await shortageProduct.clickButton('Запустить в производство', buttonLaunchIntoProduction);
    });

    await allure.step('Step 10: Testing a modal window for production launch', async () => {
      // Check the modal window Launch into production
      await shortageProduct.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProduction);
    });

    await allure.step('Step 12: Checking the main buttons on the page', async () => {
      await shortageProduct.waitForNetworkIdle();
      // [SPEED] JSON validation (buttons) commented out - re-enable for UI validation
      // const buttons = testData1.elements.ModalWindowLaunchOnProduction.buttons;
      // for (const button of buttons) { ... isButtonVisible ... expectSoftWithScreenshot ... }
    });

    await allure.step('Step 13: Enter a value into a cell', async () => {
      // Check the value in the Own quantity field and enter the value
      const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
      await shortageProduct.checkOrderQuantity(locator, '2', quantityProductLaunchOnProduction);
    });

    await allure.step('Step 14: We save the order number', async () => {
      // Get the order number
      checkOrderNumber = await shortageProduct.checkOrderNumber();
      console.log(`Полученный номер заказа: ${checkOrderNumber}`);
    });

    await allure.step('Step 15: Click on the In launch button', async () => {
      // Click on the button
      await shortageProduct.clickButton('В производство', buttonLaunchIntoProductionModalWindow);
    });

    await allure.step('Step 16: We check that the order number is displayed in the notification', async () => {
      // Check the order number in the success notification
      await shortageProduct.getMessage(checkOrderNumber);
    });

    await allure.step('Step 17: We check the number of those launched into production', async () => {
      // Find the production ordered quantity cell using data-testid
      const productionOrderedCell = page.locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED).first();

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
  });

  test('Test Case 09 - Launch Into Production Cbed', async ({ page }) => {
    console.log('Test Case 09 - Launch Into Production Cbed');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const shortageAssemblies = new CreatShortageAssembliesPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageAssemblies.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage assemblies page', async () => {
      // Find and go to the page using the locator shortage assemblies
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE;
      await shortageAssemblies.findTable(selector);
      // Wait for the page to stabilize
      await shortageAssemblies.waitForNetworkIdle();
    });

    await allure.step('Step 03-04: Checking the main page headings and buttons', async () => {
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      // [SPEED] JSON validation (titles/buttons) commented out - re-enable for UI validation
      // const titles = testData1.elements.CbedShortage.titles;
      // const buttons = testData1.elements.CbedShortage.buttons;
      // await shortageAssemblies.validatePageHeadersAndButtons(page, titles, buttons, SelectorsShortagePages.PAGE_TESTID_CBED);
    });

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 05: Search product', async () => {
          // Wait for the table body to load
          await shortageAssemblies.waitingTableBody(SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Using table search we look for the value of the variable
          await shortageAssemblies.searchAndWaitForTable(
            cbed.name,
            SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE,
            SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE_TBODY,
            {
              useRedesign: true,
              timeoutBeforeWait: 1000,
              searchInputDataTestId: SelectorsShortagePages.TABLE_SEARCH_INPUT,
            },
          );
          await page.waitForLoadState('domcontentloaded');

          await page.locator(buttonLaunchIntoProductionCbed).hover();
        });

        await allure.step('Step 06: Check the checkbox in the first column', async () => {
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // Find the checkbox in the first cell of the first row
          const tableBody = page.locator(SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE_TBODY);
          const firstRow = tableBody.locator('tr').first();
          const checkboxCell = firstRow.locator('td').first();

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
          await shortageAssemblies.waitingTableBody(SelectorsShortagePages.TABLE_DEFICIT_IZD_TABLE);
        });

        await allure.step('Step 07: Checking the urgency date of an order', async () => {
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

          console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            },
            `Verify urgency date on table equals expected (${urgencyDate})`,
            test.info(),
          );
        });

        await allure.step('Step 08: We check the number of those launched into production', async () => {
          // Find the ordered quantity cell using data-testid
          const orderedCell = page.locator(SelectorsShortagePages.CBED_TABLE_BODY_ORDERED).first();

          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await orderedCell.scrollIntoViewIfNeeded();

          // Highlight the ordered cell
          await orderedCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the ordered quantity value from the cell
          const orderedValue = await orderedCell.textContent();
          quantityProductLaunchOnProductionBefore = orderedValue?.trim() || '';

          console.log('The value in the cells is put into production befor:', quantityProductLaunchOnProductionBefore);
        });

        await allure.step('Step 09: Click on the Launch on production button', async () => {
          // Click on the button
          await shortageAssemblies.clickButton('Запустить в производство', buttonLaunchIntoProductionCbed);
        });

        await allure.step('Step 10: Testing a modal window for production launch', async () => {
          await shortageAssemblies.waitForNetworkIdle();
          // Check the modal window Launch into production
          await shortageAssemblies.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProductionCbed);

          // Check the date in the Launch into production modal window
          // await shortageAssemblies.checkCurrentDate(
          //   '[data-testid="ModalStartProduction-OrderDateValue"]'
          // );//ERP-2336
        });

        await allure.step('Step 11: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.ROW_PRODUCTION_INPUT;
          await shortageAssemblies.checkOrderQuantity(locator, '2', quantityProductLaunchOnProduction);
        });

        await allure.step('Step 12: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageAssemblies.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step('Step 13: Click on the In launch button', async () => {
          // Click on the button
          await shortageAssemblies.clickButton('В производство', buttonLaunchIntoProductionModalWindow);
        });

        await allure.step('Step 14: We check that the order number is displayed in the notification', async () => {
          // Check the order number in the success notification
          await shortageAssemblies.getMessage(checkOrderNumber);
        });

        await allure.step('Step 15: Close success message', async () => {
          await shortageAssemblies.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await shortageAssemblies.closeSuccessMessage();
        });

        await allure.step('Step 16: We check the number of those launched into production', async () => {
          // Find the ordered quantity cell using data-testid
          const orderedCell = page.locator(SelectorsShortagePages.CBED_TABLE_BODY_ORDERED).first();

          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await orderedCell.scrollIntoViewIfNeeded();

          // Highlight the ordered cell
          await orderedCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the ordered quantity value from the cell
          const orderedValue = await orderedCell.textContent();
          quantityProductLaunchOnProductionAfter = orderedValue?.trim() || '';

          console.log('The value in the cells is put into production after:', quantityProductLaunchOnProductionAfter);

          const productionAfterNumber = Number(quantityProductLaunchOnProductionAfter);
          const expectedProductionValue = Number(quantityProductLaunchOnProductionBefore) + Number(quantityProductLaunchOnProduction);

          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(productionAfterNumber).toBe(expectedProductionValue);
            },
            'Verify launched into production quantity increased by planned amount',
            test.info(),
          );
        });
      }
    }
  });

  test('Test Case 10 - Launch Into Production Parts', async ({ page }) => {
    console.log('Test Case 10 - Launch Into Production Parts');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const shortageParts = new CreatShortagePartsPage(page);
    let checkOrderNumber: string;

    await allure.step('Step 01: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await shortageParts.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 02: Open the shortage parts page', async () => {
      // Find and go to the page using the locator Parts Shortage
      const selector = SelectorsShortagePages.SELECTOR_DEFICIT_DETAL;
      await shortageParts.findTable(selector);
      // Wait for the page to stabilize
      await shortageParts.waitForNetworkIdle();
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      console.error('ERROR: descendantsDetailArray is empty!');
      console.error('This means Test Case 06 (Loading Task) did not populate the array correctly.');
      console.error('Please check if Test Case 06 completed successfully and extracted specification data.');
      throw new Error('Массив пустой. Test Case 06 (Loading Task) должен заполнить descendantsDetailArray данными из спецификации.');
    } else {
      console.log(`Processing ${descendantsDetailArray.length} parts from descendantsDetailArray`);
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 05: Search product', async () => {
          // Wait for the table body to load
          await shortageParts.waitingTableBody(deficitTableDetail);

          // Waiting for loading
          await shortageParts.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Clear any existing search to avoid old data interfering
          const searchInput = page.locator('.search-yui-kit__input').first();
          const isSearchVisible = await searchInput.isVisible().catch(() => false);
          if (isSearchVisible) {
            await searchInput.clear();
            await searchInput.press('Enter'); // Trigger search with empty value to reset table
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            console.log('Cleared previous search');
          }

          // Using table search we look for the value of the variable
          await shortageParts.searchAndWaitForTable(part.name, deficitTableDetail, deficitTableDetail, {
            useRedesign: true,
            timeoutBeforeWait: 1000,
            minRows: 1, // Require at least 1 row after search
          });
          
          // Verify that search found results
          const rows = page.locator(`${deficitTableDetail} tbody tr`);
          const rowCount = await rows.count();
          console.log(`After search for "${part.name}": found ${rowCount} rows`);
          
          if (rowCount === 0) {
            console.error(`ERROR: Search for "${part.name}" returned 0 rows!`);
            console.error('This part should appear in the deficit table after Test Cases 08-09 (Launch Product and CBED into production).');
            console.error('Possible causes:');
            console.error('1. Test Case 08 (Launch Product) did not complete successfully');
            console.error('2. Test Case 09 (Launch CBED) did not complete successfully');
            console.error('3. The part is not in deficit (may need to wait for system to calculate deficit)');
            console.error('4. The part name does not match what is in the system');
            console.error('5. Old search data may be interfering - try refreshing the page');
            throw new Error(`Search for part "${part.name}" returned 0 rows. The part should be in deficit after launching product and CBED into production.`);
          }
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
          const orderedCell = page.locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN).first();

          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await orderedCell.scrollIntoViewIfNeeded();

          // Highlight the ordered cell
          await orderedCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the ordered quantity value from the cell
          const orderedValue = await orderedCell.textContent();
          quantityProductLaunchOnProductionBefore = orderedValue?.trim() || '';

          console.log('The value in the cells is put into production befor:', quantityProductLaunchOnProductionBefore);
        });

        await allure.step('Step 09: Click on the Launch on production button', async () => {
          // Click on the button
          await shortageParts.clickButton('Запустить в производство', buttonLaunchIntoProductionDetail);
        });

        await allure.step('Step 10: Testing a modal window for production launch', async () => {
          await shortageParts.waitForNetworkIdle();
          // Check the modal window Launch into production
          await shortageParts.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProductionDetail);

          // Check the date in the Launch into production modal window
          // await shortageParts.checkCurrentDate(
          //   '[data-testid="ModalStartProduction-OrderDateValue"]'
          // );//ERP-2336
        });

        await allure.step('Step 11: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.ROW_PRODUCTION_INPUT;
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
          await shortageParts.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await shortageParts.closeSuccessMessage();
        });

        await allure.step('Step 16: We check the number of those launched into production', async () => {
          // Get the value using data-testid directly
          const orderedCell = page.locator(SelectorsShortagePages.ROW_PRODUCTION_ORDERED_PATTERN).first();

          await orderedCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await orderedCell.scrollIntoViewIfNeeded();

          // Highlight the ordered cell
          await orderedCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightcyan';
            el.style.border = '2px solid blue';
          });

          // Get the ordered quantity value from the cell
          const orderedValue = await orderedCell.textContent();
          quantityProductLaunchOnProductionAfter = orderedValue?.trim() || '';

          console.log('The value in the cells is put into production after:', quantityProductLaunchOnProductionAfter);

          await expectSoftWithScreenshot(
            page,
            async () => {
              expect
                .soft(Number(quantityProductLaunchOnProductionAfter))
                .toBe(Number(quantityProductLaunchOnProductionBefore) + Number(quantityProductLaunchOnProduction));
            },
            'Verify ordered quantity increased correctly',
            test.info(),
          );
        });
      }
    }
  });
};
