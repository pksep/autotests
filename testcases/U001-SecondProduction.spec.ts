/**
 * @file U001-SecondProduction.spec.ts
 * @purpose Test Suite 8: Second Production Launch (Test Cases 28-30)
 * 
 * This suite handles:
 * - Test Case 28: Launch Into Production Product (Second Task)
 * - Test Case 29: Launch Into Production Cbed (Second Task)
 * - Test Case 30: Launch Into Production Parts (Second Task)
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
  urgencyDateSecond,
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
let quantitySumLaunchOnProduction = U001Constants.quantitySumLaunchOnProduction;

export const runU001_08_SecondProduction = (isSingleTest: boolean, iterations: number) => {
  console.log(`Start of the test: U001 Second Production Launch (Test Cases 28-30)`);

  test('Test Case 28 - Launch Into Production Product', async ({ page }) => {
    // doc test case 23
    console.log('Test Case 28 - Launch Into Production Product');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
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
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
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

      console.log('Date by urgency in the table: ', urgencyDateOnTable);

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

    await allure.step('Step 07: Click on the Launch on production button', async () => {
      // Click on the button
      await shortageProduct.clickButton('Запустить в производство', buttonLaunchIntoProduction);
    });

    await allure.step('Step 08: Testing a modal window for production launch', async () => {
      // Check the modal window Launch into production
      await shortageProduct.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProduction);

      // Check the date in the Launch into production modal window
      await shortageProduct.checkCurrentDate(SelectorsStartProduction.MODAL_START_PRODUCTION_ORDER_DATE_VALUE);
    });

    await allure.step('Step 09: Enter a value into a cell', async () => {
      // Check the value in the Own quantity field and enter the value
      const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
      await shortageProduct.checkOrderQuantity(locator, '2', quantityProductLaunchOnProduction);
    });

    await allure.step('Step 10: We save the order number', async () => {
      // Get the order number
      checkOrderNumber = await shortageProduct.checkOrderNumber();
      console.log(`Полученный номер заказа: ${checkOrderNumber}`);
    });

    await allure.step('Step 11: Click on the In launch button', async () => {
      // Click on the button
      await shortageProduct.clickButton('В производство', buttonLaunchIntoProductionModalWindow);
    });

    await allure.step('Step 12: We check that the order number is displayed in the notification', async () => {
      // Check the order number in the success notification
      await shortageProduct.getMessage(checkOrderNumber);
    });

    await allure.step('Step 13: We check the number of those launched into production', async () => {
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
  });

  test('Test Case 29 - Launch Into Production Cbed', async ({ page }) => {
    // doc test case 24
    console.log('Test Case 29 - Launch Into Production Cbed');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
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
    });

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 03: Search product', async () => {
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

        await allure.step('Step 04: Check the checkbox in the first column', async () => {
          // Find the checkbox using data-testid
          const checkboxCell = page.locator(SelectorsShortagePages.CBED_TABLE_BODY_SELECT).first();

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

        await allure.step('Step 05: Checking the urgency date of an order', async () => {
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
          const urgencyDateText = await urgencyDateCell.textContent();
          urgencyDateOnTable = urgencyDateText?.trim() || '';

          console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

          // Test Cases 29-30 are part of the "Second Production Launch" suite, which is for the second task.
          // The second task uses urgencyDateSecond ('21.01.2025'), so we expect that date here.
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

        await allure.step('Step 07: Click on the Launch on production button', async () => {
          // Find the button and verify it's enabled (should be enabled after checkbox is checked)
          const launchButton = page.locator(buttonLaunchIntoProductionCbed);
          await launchButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await launchButton.scrollIntoViewIfNeeded();

          // Verify the button is enabled
          await expect(launchButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });

          // Highlight the button
          await launchButton.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'lightgreen';
            el.style.border = '3px solid green';
            el.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
          });
          await page.waitForTimeout(TIMEOUTS.SHORT);

          // Click on the button
          await shortageAssemblies.clickButton('Запустить в производство', buttonLaunchIntoProductionCbed);
        });

        await allure.step('Step 08: Testing a modal window for production launch', async () => {
          // Check the modal window Launch into production
          await shortageAssemblies.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProductionCbed);

          // Check the date in the Launch into production modal window
          await shortageAssemblies.checkCurrentDate(SelectorsStartProduction.MODAL_START_PRODUCTION_ORDER_DATE_VALUE);
        });

        await allure.step('Step 09: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.ROW_PRODUCTION_INPUT;
          await shortageAssemblies.checkOrderQuantity(locator, '2', quantityProductLaunchOnProduction);
        });

        await allure.step('Step 10: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageAssemblies.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step('Step 11: Click on the In launch button', async () => {
          // Click on the button
          await shortageAssemblies.clickButton('В производство', buttonLaunchIntoProductionModalWindow);
        });

        await allure.step('Step 12: We check that the order number is displayed in the notification', async () => {
          // Check the order number in the success notification
          await shortageAssemblies.getMessage(checkOrderNumber);
        });

        await allure.step('Step 13: Close success message', async () => {
          // Close the success notification
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          await shortageAssemblies.closeSuccessMessage();
        });

        await allure.step('Step 14: We check the number of those launched into production', async () => {
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

  test('Test Case 30 - Launch Into Production Parts', async ({ page }) => {
    // doc test case 25
    console.log('Test Case 30 - Launch Into Production Parts');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
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
    });

    // Check if the array is empty
    if (descendantsDetailArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Iterate through the array of parts
      for (const part of descendantsDetailArray) {
        await allure.step('Step 03: Search product', async () => {
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

        await allure.step('Step 04: Check that the first row of the table contains the variable name', async () => {
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

        await allure.step('Step 05: Checking the urgency date of an order', async () => {
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

          // Test Cases 29-30 are part of the "Second Production Launch" suite, which is for the second task.
          // The second task uses urgencyDateSecond ('21.01.2025'), so we expect that date here.
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(urgencyDateOnTable).toBe(urgencyDate);
            },
            `Verify urgency date equals "${urgencyDate}"`,
            test.info(),
          );
        });

        await allure.step('Step 06: We check the number of those launched into production', async () => {
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
          quantityProductLaunchOnProductionBefore = productionOrderedValue?.trim() || '';

          console.log('The value in the cells is put into production befor:', quantityProductLaunchOnProductionBefore);
        });

        await allure.step('Step 07: Click on the Launch on production button ', async () => {
          // Click on the button
          await shortageParts.clickButton('Запустить в производство', buttonLaunchIntoProductionDetail);
        });

        await allure.step('Step 08: Testing a modal window for production launch', async () => {
          // Check the modal window Launch into production
          await shortageParts.checkModalWindowLaunchIntoProduction(modalWindowLaunchIntoProductionDetail);

          // Check the date in the Launch into production modal window
          await shortageParts.checkCurrentDate(SelectorsStartProduction.MODAL_START_PRODUCTION_ORDER_DATE_VALUE);
        });

        await allure.step('Step 09: Enter a value into a cell', async () => {
          // Check the value in the Own quantity field and enter the value
          const locator = SelectorsShortagePages.MODAL_START_PRODUCTION;
          await shortageParts.checkOrderQuantity(locator, '2', quantityProductLaunchOnProduction);
        });

        await allure.step('Step 10: We save the order number', async () => {
          // Get the order number
          checkOrderNumber = await shortageParts.checkOrderNumber();
          console.log(`Полученный номер заказа: ${checkOrderNumber}`);
        });

        await allure.step('Step 11: Click on the In launch button', async () => {
          // Click on the button
          await shortageParts.clickButton('В производство', buttonLaunchIntoProductionModalWindow);
        });

        await allure.step('Step 12: We check that the order number is displayed in the notification', async () => {
          // Check the order number in the success notification
          await shortageParts.getMessage(checkOrderNumber);
        });

        await allure.step('Step 13: Close success message', async () => {
          // Close the success notification
          await shortageParts.closeSuccessMessage();
        });

        await allure.step('Step 14: We check the number of those launched into production', async () => {
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
};
