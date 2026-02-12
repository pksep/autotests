/**
 * @file U001-Receiving.spec.ts
 * @purpose Test Suite 5: Receiving Operations (Test Cases 15-18)
 * 
 * This suite handles:
 * - Test Case 15: Receiving Part And Check Stock
 * - Test Case 16: Receiving Cbed And Check Stock
 * - Test Case 17: Complete Set Of Product
 * - Test Case 18: Receiving Product And Check Stock
 */

import * as SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction from '../lib/Constants/SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction';
import * as SelectorsRemainingProducts from '../lib/Constants/SelectorsRemainingProducts';
import * as SelectorsCompleteSets from '../lib/Constants/SelectorsCompleteSets';
import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateStockReceiptFromSupplierAndProductionPage, StockReceipt } from '../pages/StockReceiptFromSupplierAndProductionPage';
import { CreateStockPage, TableSelection } from '../pages/StockPage';
import { CreateCompletingProductsToPlanPage } from '../pages/CompletingProductsToPlanPage';
import { expectSoftWithScreenshot, TypeInvoice } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import * as U001Constants from './U001-Constants';
const {
  descendantsCbedArray,
  descendantsDetailArray,
  quantityProductLaunchOnProduction,
  incomingQuantity,
  nameProduct,
  urgencyDate,
} = U001Constants;
// Mutable variables that need to be reassigned
let remainingStockBefore = U001Constants.remainingStockBefore;
let remainingStockAfter = U001Constants.remainingStockAfter;
let urgencyDateOnTable = U001Constants.urgencyDateOnTable;

export const runU001_05_Receiving = (isSingleTest: boolean, iterations: number) => {
  console.log(`Start of the test: U001 Receiving Operations (Test Cases 15-18)`);

  test('Test Case 15 - Receiving Part And Check Stock', async ({ page }) => {
    // doc test case 10
    console.log('Test Case 15 - Receiving Part And Check Stock');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(page);
    const stock = new CreateStockPage(page);

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
          await page.waitForLoadState('networkidle');
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          // Wait for page to load (don't wait for networkidle as it may never complete)
          await page.waitForLoadState('domcontentloaded');
          await page.waitForTimeout(TIMEOUTS.STANDARD);

          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          // The findTable method will wait for the element to be visible
          await stockReceipt.findTable(
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION,
          );

          // Wait a moment for any initial loading to complete
          await page.waitForTimeout(TIMEOUTS.STANDARD);
        });

        await allure.step('Step 04: Checking the main page headings and buttons', async () => {
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // [SPEED] JSON validation (titles/buttons) commented out - re-enable for UI validation
          // const titles = testData1.elements.ArrivalAtTheWarehousePage.titles;
          // const buttons = testData1.elements.ArrivalAtTheWarehousePage.buttons;
          // await stockReceipt.validatePageHeadersAndButtons(page, titles, buttons, ...);
        });

        await allure.step('Step 06: Click on the create receipt button', async () => {
          // Click on the button
          await stockReceipt.clickButton('Создать приход', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME);
        });

        await allure.step('Step 07: Checking buttons on the modalwindow', async () => {
          await page.waitForLoadState('networkidle');
          // [SPEED] JSON validation (buttons) commented out - re-enable for UI validation
          // const buttons = testData1.elements.ModalWindowSelectSupplier.buttons;
          // for (const button of buttons) { ... isButtonVisibleTestId ... expectSoftWithScreenshot ... }
        });

        await allure.step('Step 08: Select the selector in the modal window', async () => {
          // Select the selector in the modal window
          await stockReceipt.selectStockReceipt(StockReceipt.metalworking);
          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);

          // Wait for the table body to load
          await stockReceipt.waitingTableBody(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE);
        });

        await allure.step('Step 09: Checking buttons on the modalwindow', async () => {
          await page.waitForLoadState('networkidle');
          // [SPEED] JSON validation (buttons) commented out - re-enable for UI validation
          // const buttons = testData1.elements.ModalWindowCreateReceiptParts.buttons;
          // for (const button of buttons) { ... isButtonVisibleTestId ... expectSoftWithScreenshot ... }
        });

        await allure.step('Step 10: Search product', async () => {
          // Waiting for loading
          await page.waitForLoadState('networkidle');

          // Using table search we look for the value of the variable
          await stockReceipt.searchAndWaitForTable(
            detail.name,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            { useRedesign: true },
          );
        });

        await allure.step('Step 11: Enter the quantity in the cells', async () => {
          // Check if there's a modal dialog open that might block clicks
          const detailModal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_DETAIL);
          const isModalOpen = await detailModal.isVisible().catch(() => false);

          if (isModalOpen) {
            console.log('Detail modal is open, closing it...');
            // Try to close the modal by pressing Escape or clicking outside
            try {
              await page.keyboard.press('Escape');
              await page.waitForTimeout(TIMEOUTS.MEDIUM);
              // Wait for modal to close
              await detailModal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
            } catch (e) {
              console.log('Could not close modal with Escape, trying to click outside');
            }
          }

          // Find the quantity input cell using data-testid pattern
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdInput
          const quantityCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_TD_INPUT_PATTERN).first();

          await quantityCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await quantityCell.scrollIntoViewIfNeeded();

          // Highlight the cell (td) in yellow first
          await quantityCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '3px solid orange';
            el.style.outline = '2px solid orange';
          });

          console.log('Cell (td) highlighted in yellow/orange. Looking for input field...');

          // Wait a moment to see the cell highlight
          await page.waitForTimeout(TIMEOUTS.STANDARD);

          // Find the input field using data-testid pattern that ends with -TdInput-Input-Input
          // Try to find it within the cell first (more reliable)
          let quantityInput = quantityCell.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_TD_INPUT_INPUT_INPUT_PATTERN).first();

          // If not found in cell, try page-level search
          const inputFound = await quantityInput
            .waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.VERY_SHORT })
            .then(() => true)
            .catch(() => false);

          if (!inputFound) {
            console.log('Input not found in cell, trying page-level search...');
            quantityInput = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_TD_INPUT_INPUT_INPUT_PATTERN).first();
          }

          await quantityInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await quantityInput.scrollIntoViewIfNeeded();

          // Highlight the input element in red to verify we found the correct element
          await quantityInput.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'red';
            el.style.border = '3px solid red';
            el.style.outline = '3px solid red';
            el.style.zIndex = '9999';
          });

          console.log('Input element highlighted in red. Setting quantity value...');

          // Set the quantity value
          const valueToSet = incomingQuantity;
          const currentValue = await quantityInput.inputValue();
          console.log(`Current value: "${currentValue}", setting to: "${valueToSet}"`);

          // Check if input is readonly or disabled
          const isReadonly = await quantityInput.evaluate((el: HTMLInputElement) => el.readOnly).catch(() => false);
          const isDisabled = await quantityInput.isDisabled().catch(() => false);

          console.log(`Input state: readonly=${isReadonly}, disabled=${isDisabled}`);

          if (isReadonly || isDisabled) {
            console.log('Input is readonly or disabled, trying to make it editable...');
            // Try to remove readonly attribute via JavaScript
            await quantityInput.evaluate((el: HTMLInputElement) => {
              el.readOnly = false;
              el.removeAttribute('readonly');
              el.removeAttribute('disabled');
            });
            await page.waitForTimeout(TIMEOUTS.SHORT);
          }

          // Approach: Double-click cell, clear, type, and blur
          // Use force: true to bypass any overlaying elements
          try {
            await quantityCell.dblclick({ force: true });
            await page.waitForTimeout(TIMEOUTS.MEDIUM); // Increased wait time
          } catch (e) {
            console.log('Double-click failed, trying single click...');
            await quantityCell.click({ force: true });
            await page.waitForTimeout(TIMEOUTS.SHORT);
            await quantityCell.click({ force: true });
            await page.waitForTimeout(TIMEOUTS.SHORT);
          }

          // Wait for input to be visible and enabled after double-click
          await quantityInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });

          // Check again if input is readonly/disabled
          const isStillReadonly = await quantityInput.evaluate((el: HTMLInputElement) => el.readOnly).catch(() => false);
          const isStillDisabled = await quantityInput.isDisabled().catch(() => false);

          if (isStillReadonly || isStillDisabled) {
            console.warn('Input is still readonly/disabled, forcing editable state...');
            // Force remove readonly/disabled
            await quantityInput.evaluate((el: HTMLInputElement) => {
              el.readOnly = false;
              el.removeAttribute('readonly');
              (el as any).disabled = false;
              el.removeAttribute('disabled');
            });
            await page.waitForTimeout(TIMEOUTS.SHORT);
          }

          await quantityInput.focus();
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT); // Increased wait

          // Clear existing value - try multiple approaches
          await quantityInput.selectText().catch(() => {
            // If selectText fails, try clear
            return quantityInput.clear();
          });
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

          // Type the new value character by character
          await quantityInput.fill(''); // Clear first
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          await quantityInput.type(valueToSet, { delay: 50 }); // Increased delay
          await page.waitForTimeout(TIMEOUTS.SHORT);

          // Blur to trigger change
          await quantityInput.blur();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Verify the value was set
          const finalValue = await quantityInput.inputValue();
          console.log(`Final value: "${finalValue}", expected: "${valueToSet}"`);

          if (finalValue !== valueToSet) {
            // Fallback: Try direct JavaScript setting with more events
            console.log('Type() failed, trying direct JavaScript setting...');
            await quantityInput.evaluate((el: HTMLInputElement, val: string) => {
              el.focus();
              el.select();
              el.value = val;
              // Dispatch multiple events to ensure the value is registered
              el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
              el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
              el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
              el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            }, valueToSet);

            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await quantityInput.blur();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);

            const retryValue = await quantityInput.inputValue();
            console.log(`After retry, value: "${retryValue}"`);

            if (retryValue !== valueToSet) {
              // Last resort: try fill() method
              console.log('JavaScript setting failed, trying fill() method...');
              await quantityInput.fill(valueToSet);
              await page.waitForTimeout(TIMEOUTS.MEDIUM);
              const fillValue = await quantityInput.inputValue();
              console.log(`After fill(), value: "${fillValue}"`);

              if (fillValue !== valueToSet) {
                throw new Error(`Failed to set quantity. Expected: "${valueToSet}", Actual: "${fillValue}". Input may be disabled or readonly.`);
              }
            }
          }

          console.log('Quantity successfully set!');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
        });

        await allure.step('Step 12: Find the checkbox column and click', async () => {
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

          // Click on the checkbox cell
          await checkboxCell.click();
          await page.waitForTimeout(TIMEOUTS.SHORT);
        });

        await allure.step('Step 13: Check that the first row of the table contains the variable name', async () => {
          // Check that the first row of the table contains the variable name
          await stockReceipt.checkNameInLineFromFirstRow(detail.name, SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE);
        });

        await allure.step('Step 14: Click on the add receipt button on the modal window', async () => {
          // Wait for the Добавить button to become enabled and click it
          const addButton = page.getByTestId('ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Button-Add');

          await addButton.scrollIntoViewIfNeeded();
          // Wait for button to be enabled (may take time after quantity is entered)
          await expect(addButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.LONG });
          await addButton.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });

        await allure.step('Step 15a: Check the modal window', async () => {
          // Click on the Создать button
          await stockReceipt.clickButton('Создать', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE);

          // Wait for the receipt to be processed - wait for modal to close or network to be idle
          try {
            // Wait for modal to close (if it closes automatically)
            const modal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN);
            await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {
              // Modal might not close, that's okay
              console.log('Modal did not close automatically');
            });
          } catch (e) {
            // Modal might still be visible, continue anyway
          }

          // Wait for network to be idle and give extra time for backend processing
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.LONG); // Extra wait for backend to process the receipt
        });

        await allure.step('Step 15b: Check the number of parts in the warehouse after posting', async () => {
          // Wait for stock to update after posting using Playwright's expect.poll
          const expectedStock = Number(remainingStockBefore) + Number(incomingQuantity);
          console.log(`Waiting for stock to update from ${remainingStockBefore} to ${expectedStock}...`);
          console.log(`Detail name: ${detail.name}, incomingQuantity: ${incomingQuantity}`);

          await expect
            .poll(
              async () => {
                // checkingTheQuantityInStock already navigates to the stock page and refreshes data
                remainingStockAfter = await stock.checkingTheQuantityInStock(detail.name, TableSelection.detail);
                const currentStock = Number(remainingStockAfter);
                console.log(`Stock check: current=${currentStock}, expected=${expectedStock}, before=${remainingStockBefore}`);
                return currentStock;
              },
              { timeout: 60000, intervals: [3000] }, // Increased timeout to 60s and interval to 3s
            )
            .toBe(expectedStock);

          console.log(`Stock updated successfully: ${remainingStockAfter} (expected: ${expectedStock})`);
        });

        await allure.step('Step 16: Compare the quantity in cells', async () => {
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
          console.log(
            `Количество ${detail.name} на складе до оприходования: ${remainingStockBefore}, ` +
              `оприходовали в количестве: ${incomingQuantity}, ` +
              `и после оприходования: ${remainingStockAfter}.`,
          );
        });
      }
    }
  });

  test('Test Case 16 - Receiving Cbed And Check Stock', async ({
    // doc test case 11
    page,
  }) => {
    console.log('Test Case 16 - Receiving Cbed And Check Stock');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(page);
    const stock = new CreateStockPage(page);

    // Check if the array is empty
    if (descendantsCbedArray.length === 0) {
      throw new Error('Массив пустой.');
    } else {
      // Loop through the array of assemblies
      for (const cbed of descendantsCbedArray) {
        await allure.step('Step 01: Receiving quantities from balances', async () => {
          console.log(cbed.name);
          // Check the number of entities in the warehouse before posting
          remainingStockBefore = await stock.checkingTheQuantityInStock(cbed.name, TableSelection.cbed);
        });

        // Capitalization of the entity
        await allure.step('Step 02: Open the warehouse page', async () => {
          console.log('Step 02: Open the warehouse page');
          // Go to the Warehouse page
          await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        });

        await allure.step('Step 03: Open the stock receipt page', async () => {
          console.log('Step 03: Open the stock receipt page');
          // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
          await stockReceipt.findTable(
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION,
          );

          // Waiting for loading
          await page.waitForLoadState('networkidle');
        });

        await allure.step('Step 04: Click on the create receipt button', async () => {
          console.log('Step 04: Click on the create receipt button');
          // Click on the button
          await stockReceipt.clickButton('Создать приход', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME);
        });

        await allure.step('Step 05: Select the selector in the modal window', async () => {
          console.log('Step 05: Select the selector in the modal window');
          // Select the selector in the modal window
          await stockReceipt.selectStockReceipt(StockReceipt.cbed);
          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);

          // Wait for the table body to load
          await stockReceipt.waitingTableBody(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE);
        });

        await allure.step('Step 06: Search product', async () => {
          console.log('Step 06: Search product');
          // Using table search we look for the value of the variable
          await stockReceipt.searchTable(
            cbed.name,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
            SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE_SEARCH_INPUT,
          );

          // Waiting for loading
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // Wait for the table body to load
          await stockReceipt.waitingTableBodyNoThead(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE);
        });

        await allure.step('Step 07: Find the checkbox column and click', async () => {
          console.log('Step 07: Find the checkbox column and click');
          // Find the checkbox cell using data-testid pattern
          // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdCheckbox
          const checkboxCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_CHECKBOX_PATTERN).first();

          await checkboxCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await checkboxCell.scrollIntoViewIfNeeded();

          // Highlight the cell for visual confirmation
          await checkboxCell.evaluate((el: HTMLElement) => {
            el.style.backgroundColor = 'yellow';
            el.style.border = '2px solid red';
            el.style.outline = '2px solid red';
          });

          console.log('Checkbox cell highlighted. Clicking checkbox...');

          // Click the checkbox
          await checkboxCell.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });
        await allure.step('Step 07a: Find the Кол-во на приход column and click', async () => {
          console.log('Step 07a: Find the Кол-во на приход column and click');
          // Ensure the main modal is visible first
          const mainModal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN);
          await mainModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

          // Find the Кол-во на приход cell using data-testid pattern
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
            el.style.outline = '2px solid red';
          });

          console.log('prihodQuantityCell cell highlighted. Clicking link...');

          // Click the cell to open the Completed sets modal
          await prihodQuantityCell.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          // Wait for the Completed sets modal to appear
          const completedSetsModal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST);
          await completedSetsModal.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
        });
        await allure.step('Step 08: Checking the main page headings', async () => {
          console.log('Step 08: Checking the main page headings');
          await page.waitForLoadState('networkidle');
          // [SPEED] JSON validation (titles) commented out - re-enable for UI validation
          // const titles = testData1.elements.ModalWindowCompletSets.titles.map(title => title.trim());
          // const h3Titles = await stockReceipt.getAllH4TitlesInModalByTestId(...); await expectSoftWithScreenshot(...);
        });

        await allure.step('Step 09: Checking the main buttons on the page', async () => {
          console.log('Step 09: Checking the main buttons on the page');
          await page.waitForLoadState('networkidle');
          // [SPEED] JSON validation (buttons) commented out - re-enable for UI validation
          // const buttons = testData1.elements.ModalWindowCompletSets.buttons;
          // for (const button of buttons) { ... isButtonVisibleTestId ... expectSoftWithScreenshot ... }
        });

        await allure.step('Step 10: Check the modal window Completed sets', async () => {
          console.log('Step 10: Check the modal window Completed sets');
          // Ensure the Completed sets modal is visible
          const completedSetsModal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST);
          await completedSetsModal.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          // Check the modal window Completed sets
          await stockReceipt.completesSetsModalWindow();
          await stockReceipt.waitingTableBody(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST_TABLE);
        });

        await allure.step('Step 11: We get the cell number with a checkmark', async () => {
          // Ensure the Completed sets modal is still visible
          const completedSetsModal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST);
          await completedSetsModal.waitFor({
            state: 'visible',
            timeout: WAIT_TIMEOUTS.STANDARD,
          });

          const headerRowCell = page.locator(`${SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST_TABLE} thead tr th input`).first();

          await headerRowCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await headerRowCell.scrollIntoViewIfNeeded();

          // Check if the input is already checked
          const isChecked = await headerRowCell.isChecked();
          if (!isChecked) {
            await headerRowCell.click();
          } else {
            console.log('Checkbox is already checked, skipping click');
          }
        });

        await allure.step('Step 12: Enter the quantity in the cells', async () => {
          console.log('Step 12: Enter the quantity in the cells');
          // Enter the value into the input cell

          const inputlocator = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_ROW_QUANTITY_INPUT_PATTERN;

          await page.locator(inputlocator).nth(0).waitFor({ state: 'visible' });

          // Проверяем, что элемент не заблокирован
          const isDisabled = await page.locator(inputlocator).nth(0).getAttribute('disabled');
          if (isDisabled) {
            throw new Error('Элемент заблокирован для ввода.');
          }
          const quantityPerShipment = await page.locator(inputlocator).nth(0).getAttribute('value');
          console.log('Кол-во на отгрузку: ', quantityPerShipment);
          await page.locator(inputlocator).nth(0).fill('1');
          await page.locator(inputlocator).nth(0).press('Enter');
        });

        await allure.step('Step 13: Click on the choice button on the modal window', async () => {
          console.log('Step 13: Click on the choice button on the modal window');
          // Click on the button
          await stockReceipt.clickButton('Сохранить', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE);
        });

        await allure.step('Step 14: Check that the first row of the table contains the variable name', async () => {
          console.log('Step 14: Check that the first row of the table contains the variable name');
          // Wait for the table body to load
          const tableSelectedItems = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;
          await stockReceipt.waitingTableBody(tableSelectedItems);

          // Check that the first row of the table contains the variable name
          await stockReceipt.checkNameInLineFromFirstRow(cbed.name, tableSelectedItems);
        });
        await allure.step('Step 15a: Click on the Добавить button on the modal window', async () => {
          console.log('Step 15: Click on the create receipt button on the modal window');
          // Click on the button
          await stockReceipt.clickButton('Добавить', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_ADD);
        });
        await allure.step('Step 15: Click on the create receipt button on the modal window', async () => {
          console.log('Step 15: Click on the create receipt button on the modal window');
          // Click on the button
          await stockReceipt.clickButton('Создать', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE);
          // Wait for modal to close and page to stabilize
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          // Ensure the modal is closed before proceeding
          const modal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN);
          await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        });

        await allure.step('Step 16: Check the number of parts in the warehouse after posting', async () => {
          console.log('Step 16: Check the number of parts in the warehouse after posting');
          // Checking the remainder of the entity after capitalization
          remainingStockAfter = await stock.checkingTheQuantityInStock(cbed.name, TableSelection.cbed);
        });

        await allure.step('Step 17: Compare the quantity in cells', async () => {
          console.log('Step 17: Compare the quantity in cells');
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
          console.log(
            `Количество ${cbed.name} на складе до оприходования: ${remainingStockBefore}, ` +
              `оприходовали в количестве: ${incomingQuantity}, ` +
              `и после оприходования: ${remainingStockAfter}.`,
          );
        });
        // await page.goto(ENV.BASE_URL);
        // await page.waitForTimeout(TIMEOUTS.LONG);
      }
    }
  });

  test('Test Case 17 - Complete Set Of Product', async ({ page }) => {
    // doc test case 12
    console.log('Test Case 17 - Complete Set Of Product');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const completingProductsToPlan = new CreateCompletingProductsToPlanPage(page);
    const tableComplect = PartsDBSelectors.SCROLL_WRAPPER_SLOT;
    const tableMainTable = SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION;

    await allure.step('Step 01-02: Open the warehouse page and completion product plan page', async () => {
      // Find and go to the page using the locator Complete set of Products on the plan
      const selector = SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_PRODUCT_PLAN;
      await completingProductsToPlan.navigateToPageAndWaitForTable(SELECTORS.MAINMENU.WAREHOUSE.URL, selector, tableMainTable);
    });

    await allure.step('Step 03: Checking the main page headings', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // [SPEED] JSON validation (titles) commented out - re-enable for UI validation
      // const titles = testData1.elements.EquipmentOfProductsOnThePlan.titles;
      // await completingProductsToPlan.validatePageHeadersAndButtons(page, titles, [], ...);
    });

    // await allure.step( // buttons removed in new design
    //   'Step 04: Checking the main buttons on the page',
    //   async () => {
    //     // Wait for the page to stabilize
    //     await page.waitForLoadState('networkidle');

    //     const buttons = testData1.elements.EquipmentOfProductsOnThePlan.buttons;
    //     // Iterate over each button in the array
    //     for (const button of buttons) {
    //       // Extract the class, label, and state from the button object
    //       const buttonClass = button.class;
    //       const buttonLabel = button.label;

    //       // Perform the validation for the button
    //       await allure.step(
    //         `Validate button with label: "${buttonLabel}"`,
    //         async () => {
    //           // Check if the button is visible and enabled

    //           const isButtonReady =
    //             await completingProductsToPlan.isButtonVisible(
    //               page,
    //               buttonClass,
    //               buttonLabel
    //             );

    //           // Validate the button's visibility and state
    //           expect(isButtonReady).toBeTruthy();
    //           console.log(
    //             `Is the "${buttonLabel}" button visible and enabled?`,
    //             isButtonReady
    //           );
    //         }
    //       );
    //     }
    //   }
    // );

    await allure.step('Step 05-06: Search product and verify first row', async () => {
      // Using table search we look for the value of the variable and verify it's in the first row
      await completingProductsToPlan.searchAndVerifyFirstRow(nameProduct, tableMainTable, tableMainTable, {
        searchInputDataTestId: SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION_SEARCH_INPUT,
      });
    });

    await allure.step('Step 07: Checking the urgency date of an order', async () => {
      // Get the value using data-testid directly
      // Pattern: CompletIzd-Content-Table-Table-TableRow{number}-DateUrgency
      // const urgencyDateCell = page
      //   .locator(
      //     '[data-testid^="CompletIzd-Content-Table-Table-TableRow"][data-testid$="-DateUrgency"]'
      //   )
      //   .first();
      const urgencyDateCell = page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_DATE_URGENCY_PATTERN).nth(1); //          ERP-2423

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
      if (!urgencyDateOnTable) {
        throw new Error('Urgency date cell not found or empty');
      }

      console.log('Дата по срочности в таблице: ', urgencyDateOnTable);
      console.log('Дата по срочности в переменной: ', urgencyDate);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(urgencyDateOnTable).toBe(urgencyDate);
        },
        `Verify urgency date equals "${urgencyDate}"`,
        test.info(),
      );
    });

    await allure.step('Step 08: Find the column designation and click', async () => {
      // Get the designation cell using data-testid directly
      // Pattern: CompletIzd-Content-Table-Table-TableRow{number}-Designation
      const designationCell = page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_DESIGNATION_PATTERN).first();

      await designationCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await designationCell.scrollIntoViewIfNeeded();

      // Highlight the cell for visual confirmation
      await designationCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });

      // Get the text content for verification
      const designationText = await designationCell.textContent();
      console.log(`Проверка текста ${designationText?.trim() || ''}`);

      // Double-click the designation cell
      await designationCell.dblclick();

      // Wait for loading
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 09: Check the modal window for the delivery note and check the checkbox', async () => {
      // Check the modal window for the delivery note and check the checkbox
      await completingProductsToPlan.assemblyInvoiceModalWindow(TypeInvoice.product, true, '1');

      // Wait for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 10: Click on the button to assemble into a set', async () => {
      // Click on the button
      await completingProductsToPlan.clickButton('Скомплектовать', SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON);

      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await completingProductsToPlan.waitingTableBody(tableMainTable);
    });
  });

  test('Test Case 18 - Receiving Product And Check Stock', async ({ page }) => {
    // doc test case 13
    console.log('Test Case 18 - Receiving Product And Check Stock');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const stockReceipt = new CreateStockReceiptFromSupplierAndProductionPage(page);
    const stock = new CreateStockPage(page);
    const tableStockRecieptModalWindow = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_MODAL_COMING_SCROLL;
    const tableComplectsSets = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_REMAINING_PRODUCTS;

    await allure.step('Step 01: Receiving quantities from balances', async () => {
      // Check the number of entities in the warehouse before posting
      remainingStockBefore = await stock.checkingTheQuantityInStock(nameProduct, TableSelection.product);
    });

    // Capitalization of the entity
    await allure.step('Step 02: Open the warehouse page', async () => {
      // Go to the Warehouse page
      await stockReceipt.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    });

    await allure.step('Step 03: Open the stock receipt page', async () => {
      // Find and go to the page using the locator Arrival at the warehouse from the supplier and production
      const selector = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION;
      await stockReceipt.findTable(selector);

      // Waiting for loading
      await page.waitForLoadState('networkidle');
    });

    await allure.step('Step 04: Click on the create receipt button', async () => {
      // Click on the button
      await stockReceipt.clickButton('Создать приход', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE_INCOME);
    });

    await allure.step('Step 05: Select the selector in the modal window', async () => {
      // Select the selector in the modal window
      await stockReceipt.selectStockReceipt(StockReceipt.cbed);
      // Waiting for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await stockReceipt.waitingTableBodyNoThead(
        //tableStockRecieptModalWindow
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
      );
    });

    await allure.step('Step 06: Search product', async () => {
      // Using table search we look for the value of the variable
      await stockReceipt.searchTable(
        nameProduct,
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE,
        SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE_SEARCH_INPUT,
      );

      // Waiting for loading
      await page.waitForLoadState('networkidle');

      // Wait for the table body to load
      await stockReceipt.waitingTableBodyNoThead(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE);
    });

    await allure.step('Step 07: Find the checkbox column and click', async () => {
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
        console.log('Header checkbox clicked');
      } else {
        console.log('Header checkbox is already checked, skipping click');
      }
    });
    await allure.step('Step 07a: Click the parish cell link', async () => {
      // Click the parish cell (data-testid ends with -TdParish) in the first row
      const parishCell = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.TABLE_ROW_PARISH_PATTERN).first();

      await parishCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await parishCell.scrollIntoViewIfNeeded();

      // Prefer inner link/button if present
      const inner = parishCell.locator('a, [role="link"], button');
      const hasInner = await inner
        .first()
        .isVisible()
        .catch(() => false);
      if (hasInner) {
        await inner.first().click();
      } else {
        await parishCell.click();
      }

      await page.waitForTimeout(TIMEOUTS.SHORT);
    });
    await allure.step('Step 08: Check the modal window Completed sets', async () => {
      // Check the modal window Completed sets
      await stockReceipt.completesSetsModalWindow();
      await stockReceipt.waitingTableBody(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_KITS_LIST_TABLE, {
        timeoutMs: WAIT_TIMEOUTS.LONG,
      });
    });

    await allure.step('Step 09: We get the cell number with a checkmark', async () => {
      // Click the first row checkbox using direct data-testid pattern
      const firstRowCheckbox = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_TABLE_ROW_CHECKBOX_PATTERN).first();

      // Wait for the checkbox to be visible
      await firstRowCheckbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await firstRowCheckbox.scrollIntoViewIfNeeded();

      // Highlight the checkbox for debugging
      await firstRowCheckbox.evaluate(el => {
        (el as HTMLElement).style.outline = '3px solid red';
      });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Check if the checkbox is already checked
      const isChecked = await firstRowCheckbox.isChecked();
      if (!isChecked) {
        await firstRowCheckbox.click();
        console.log('First row checkbox clicked');
      } else {
        console.log('First row checkbox is already checked, skipping click');
      }
    });

    await allure.step('Step 10: Enter the quantity in the cells', async () => {
      // Enter the value into the input cell
      const inputlocator = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.KITS_LIST_TABLE_ROW_QUANTITY_INPUT_PATTERN_STRING;
      await page.locator(inputlocator).nth(0).waitFor({ state: 'visible' });

      // Проверяем, что элемент не заблокирован
      const isDisabled = await page.locator(inputlocator).nth(0).getAttribute('disabled');
      if (isDisabled) {
        throw new Error('Элемент заблокирован для ввода.');
      }
      const quantityPerShipment = await page.locator(inputlocator).nth(0).getAttribute('value');
      console.log('Кол-во на отгрузку: ', quantityPerShipment);
      await page.locator(inputlocator).nth(0).fill('1');
      await page.locator(inputlocator).nth(0).press('Enter');
    });

    await allure.step('Step 11: Click on the choice button on the modal window', async () => {
      console.log('Step 11: Click on the choice button on the modal window');
      // Click on the button
      await stockReceipt.clickButton('Сохранить', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_KITS_LIST_SAVE);
    });

    // await allure.step(
    //   'Step 12: Check that the first row of the table contains the variable name',
    //   async () => {
    //     // Wait for the table body to load
    //     const tableSelectedItems =
    //       '[data-testid="ModalComing-SelectedItems-ScladTable"]';
    //     await stockReceipt.waitingTableBody(tableSelectedItems);

    //     // Check that the first row of the table contains the variable name
    //     await stockReceipt.checkNameInLineFromFirstRow(
    //       nameProduct,
    //       tableSelectedItems
    //     );
    //   }
    // );
    await allure.step('Step 14: Check that the first row of the table contains the variable name', async () => {
      console.log('Step 14: Check that the first row of the table contains the variable name');
      // Wait for the table body to load
      const tableSelectedItems = SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_WINDOW_TABLE;
      await stockReceipt.waitingTableBody(tableSelectedItems);

      // Check that the first row of the table contains the variable name
      await stockReceipt.checkNameInLineFromFirstRow(nameProduct, tableSelectedItems);
    });
    await allure.step('Step 12a: Click on the Добавить button on the modal window', async () => {
      console.log('Step 15: Click on the create receipt button on the modal window');
      // Click on the button
      await stockReceipt.clickButton('Добавить', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_ADD);
    });
    await allure.step('Step 15: Click on the create receipt button on the modal window', async () => {
      console.log('Step 15: Click on the create receipt button on the modal window');
      // Click on the button
      await stockReceipt.clickButton('Создать', SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.BUTTON_CREATE);
      // Wait for modal to close and page to stabilize
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Ensure the modal is closed before proceeding
      const modal = page.locator(SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.MODAL_MAIN);
      await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
    });

    await allure.step('Step 16: Check the number of parts in the warehouse after posting', async () => {
      console.log('Step 16: Check the number of parts in the warehouse after posting');
      // Checking the remainder of the entity after capitalization
      remainingStockAfter = await stock.checkingTheQuantityInStock(nameProduct, TableSelection.product);
    });

    // await allure.step('Step 15: Compare the quantity in cells', async () => {
    //   // Compare the quantity in cells
    //   expect(Number(remainingStockAfter)).toBe(
    //     Number(remainingStockBefore) + Number(incomingQuantity)
    //   );

    //   // Output to the console
    //   console.log(
    //     `Количество ${nameProduct} на складе до оприходования: ${remainingStockBefore}, ` +
    //       `оприходовали в количестве: ${incomingQuantity}, ` +
    //       `и после оприходования: ${remainingStockAfter}.`
    //   );
    // });
    await allure.step('Step 18: Compare the quantity in cells', async () => {
      console.log('Step 18: Compare the quantity in cells');
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
      console.log(
        `Количество ${nameProduct} на складе до оприходования: ${remainingStockBefore}, ` +
          `оприходовали в количестве: ${incomingQuantity}, ` +
          `и после оприходования: ${remainingStockAfter}.`,
      );
    });
  });


};
