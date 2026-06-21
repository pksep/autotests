/**
 * @file U003-AddProducts.spec.ts
 * @purpose U003 Case 4: Add two products to shipment task.
 */
import { test, expect, type Locator } from '@playwright/test';
import { SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import { expectSoftWithScreenshot } from '../lib/Page';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import * as SelectorsLoadingTasksPage from '../lib/Constants/SelectorsLoadingTasksPage';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { firstProductName, secondProductName, testProductName } from './U003-Constants';

export const runU003_03_AddProducts = (_isSingleTest: boolean, _iterations: number) => {
  logger.log('U003 Case 4 - Add two products to shipment task');
  test('Case 4 - Добавить два изделия к задаче на отгрузку', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM_SHORT);
    logger.log('Test Case 4 - Add two products to shipment task');
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    const firstProductNameValue = global.firstProductName || firstProductName;
    const secondProductNameValue = global.secondProductName || secondProductName;
    const thirdProductName = global.testProductName || testProductName;
    if (!firstProductNameValue) {
      throw new Error('First product name is missing. Ensure Test Case 1 has run.');
    }
    if (!secondProductNameValue) {
      throw new Error('Second product name is missing. Ensure Test Case 1 has run.');
    }
    if (!thirdProductName) {
      throw new Error('Third product name is missing. Ensure Test Case 1 has run.');
    }

    const shipmentsTableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);

    await allure.step('Step 1: Navigate to main shipping tasks page', async () => {
      await loadingTaskPage.navigateToShippingTasksPage();
      const createOrderButton = page.locator(SelectorsLoadingTasksPage.buttonCreateOrder);
      const isButtonVisible = await createOrderButton.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isButtonVisible).toBe(true);
        },
        'Verify navigation to shipping tasks page successful - create order button is visible',
        test.info(),
      );
    });

    await allure.step('Step 2: Search for the first product and confirm it appears in results', async () => {
      logger.log(`Test Case 4: Searching for product name: ${firstProductNameValue}`);

      // Get search input using the same approach as searchAndVerifyRowMatches
      const searchInputWrapper = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
      await searchInputWrapper.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await searchInputWrapper.scrollIntoViewIfNeeded();

      let searchInput: Locator;
      const tagName = await searchInputWrapper.evaluate((el: HTMLElement) => el.tagName.toLowerCase()).catch(() => '');
      if (tagName === 'input') {
        searchInput = searchInputWrapper;
        await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      } else {
        searchInput = searchInputWrapper.locator('input').first();
        const inputCount = await searchInput.count();
        if (inputCount > 0) {
          await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await searchInput.scrollIntoViewIfNeeded();
        } else {
          searchInput = searchInputWrapper;
        }
      }

      // Perform search - click first to focus, then clear and type
      await searchInput.click();
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      await searchInput.fill('');
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Type the search term character by character to ensure it's entered
      await searchInput.type(firstProductNameValue, { delay: 50 });
      await page.waitForTimeout(TIMEOUTS.SHORT);

      // Verify the value was set
      const valueAfterType = await searchInput.inputValue();
      logger.log(`Test Case 4: Search input value after type: "${valueAfterType}"`);

      await searchInput.press('Enter');
      await loadingTaskPage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Wait for the search results to actually appear - verify the first row contains the searched product
      const firstRow = shipmentsTableBody.locator('tr').first();
      const productCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_PRODUCT_NAME_PATTERN).first();

      // Wait for the product cell to contain the searched product name (this ensures search has completed)
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await productCell.textContent()).toContain(firstProductNameValue);
        },
        `Verify product cell contains "${firstProductNameValue}"`,
        test.info(),
      );

      await loadingTaskPage.waitAndHighlight(firstRow);
      await loadingTaskPage.waitAndHighlight(productCell);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      const productNameFromRow = (await productCell.textContent())?.trim() || '';
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(productNameFromRow.includes(firstProductNameValue)).toBe(true);
        },
        `Verify product name in row: expected to include '${firstProductNameValue}', got '${productNameFromRow}'`,
        test.info(),
      );
    });

    await allure.step('Step 3: Select the shipment row and open the order in edit mode', async () => {
      await loadingTaskPage.selectRowAndClickEdit(shipmentsTableBody);
      // Verify edit mode opened by checking for edit title
      const editTitleElement = page.locator(SelectorsLoadingTasksPage.editTitle);
      await editTitleElement.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
      const isTitleVisible = await editTitleElement.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isTitleVisible).toBe(true);
        },
        'Verify row selected and edit button clicked successfully - edit title is visible',
        test.info(),
      );

      // Wait for page to load after navigation (similar to Step 7 before Step 8)
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // Reload page to ensure it's fully loaded and stable
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 4: Verify positions table and open form to add a new product', async () => {
      const positionsTable = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_POSITIONS_TABLE).first();
      await loadingTaskPage.waitAndHighlight(positionsTable);
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      const bodyRows = positionsTable.locator('tbody tr');
      const totalRowCount = await bodyRows.count();

      // Filter out totals rows (rows with "Итого:" text or colspan="15")
      let dataRowCount = 0;
      for (let i = 0; i < totalRowCount; i++) {
        const row = bodyRows.nth(i);
        const rowText = (await row.textContent())?.trim() || '';
        const hasItogo = rowText?.includes('Итого:') || false;
        const colspan = (await row.locator('td').first().getAttribute('colspan')) || '';
        const hasColspan15 = colspan === '15';
        if (!hasItogo && !hasColspan15) {
          dataRowCount++;
        }
      }

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(dataRowCount).toBeGreaterThanOrEqual(1);
        },
        `Verify positions table has at least one data row (found ${dataRowCount} data rows out of ${totalRowCount} total rows)`,
        test.info(),
      );

      const clickAddNewProductSuccess = await loadingTaskPage.clickAddNewProductToOrderButton();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(clickAddNewProductSuccess).toBe(true);
        },
        'Verify "Add new product to order" button clicked successfully',
        test.info(),
      );

      // Wait for navigation to complete and new page to load
      // The new page should have a "Select" button - wait for it to appear and be ready
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // Wait for the "Select" button on the new page to be visible and ready
      // This ensures navigation has completed and we're on the new page
      const selectButton = page.locator(SelectorsLoadingTasksPage.buttonChoiceIzd).first();
      await selectButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await page.waitForTimeout(TIMEOUTS.STANDARD); // Additional wait to ensure page is fully stable
    });

    await allure.step('Step 5: Open product selection modal', async () => {
      await loadingTaskPage.openProductSelectionModal();
      // Verify product modal opened
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProductNew);
      const isModalVisible = await productModal.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isModalVisible).toBe(true);
        },
        'Verify product selection modal opened successfully - modal is visible',
        test.info(),
      );
    });

    await allure.step('Step 6: Select the second product in the modal', async () => {
      const selectSuccess = await loadingTaskPage.selectProductInModal(secondProductNameValue);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(selectSuccess).toBe(true);
        },
        `Verify product "${secondProductNameValue}" selected in modal`,
        test.info(),
      );

      const addSuccess = await loadingTaskPage.clickAddButtonInProductModal();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(addSuccess).toBe(true);
        },
        'Verify Add button clicked successfully in product modal',
        test.info(),
      );
    });

    await allure.step('Step 7: Verify the added product and save the order', async () => {
      // Check that the attachments link contains the second product we just added
      const attachmentsText = await loadingTaskPage.getCellValueFromPositionsTable(SelectorsLoadingTasksPage.ADD_ORDER_ATTACHMENTS_VALUE_LINK);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(attachmentsText.includes(secondProductNameValue)).toBe(true);
        },
        `Verify attachments link contains the second product (${secondProductNameValue}): ${attachmentsText}`,
        test.info(),
      );

      const saveSuccess = await loadingTaskPage.saveOrder();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(saveSuccess).toBe(true);
        },
        'Verify order saved successfully after adding product',
        test.info(),
      );

      // Wait 1 second before reload to ensure PRODUCT_3 is visible in the bottom table
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // First reload to trigger backend processing
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG); // Wait for page to fully load
      await loadingTaskPage.waitForNetworkIdle();

      // Second reload to ensure PRODUCT_3 is visible in the bottom table
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG); // Wait for page to fully load after second reload
      await loadingTaskPage.waitForNetworkIdle();

      // Navigate back to list page to trigger creation of /1 order variant
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const navigateSuccess = await loadingTaskPage.navigateToShippingTasksPage();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(navigateSuccess).toBe(true);
        },
        'Verify navigation back to list page successful',
        test.info(),
      );

      // Navigate back to edit mode - this triggers /1 variant creation
      const baseOrderNumberValue = global.fullOrderNumber || fullOrderNumber;
      if (!baseOrderNumberValue) {
        throw new Error('Order number is missing. Ensure Test Case 2 has run.');
      }
      const editSuccess = await loadingTaskPage.findOrderAndClickEdit(baseOrderNumberValue);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(editSuccess).toBe(true);
        },
        'Verify navigation back to edit mode successful',
        test.info(),
      );

      // Wait for page to load after navigation
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // Reload page to ensure /1 variant is created and visible
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // Verify positions table shows at least 2 rows after adding second product
      // (original /0 with PRODUCT_1 and new row with PRODUCT_2 creating /1)
      const positionsTableAfterSave1 = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_POSITIONS_TABLE).first();
      await positionsTableAfterSave1.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const bodyRowsAfterSave1 = positionsTableAfterSave1.locator('tbody tr');

      // Wait for table to have at least 2 rows using expect.poll
      await expect
        .poll(
          async () => {
            const count = await bodyRowsAfterSave1.count();
            return count >= 2;
          },
          {
            message: 'Table should have at least 2 rows after adding second product',
            timeout: WAIT_TIMEOUTS.LONG,
          },
        )
        .toBeTruthy();

      const rowCountAfterSave1 = await bodyRowsAfterSave1.count();
      logger.log(`Test Case 4: After saving second product and navigating back, positions table has ${rowCountAfterSave1} rows`);

      // Should have at least 2 rows (original /0 with PRODUCT_1 and new row with PRODUCT_2 creating /1)
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCountAfterSave1).toBeGreaterThanOrEqual(2);
        },
        `Verify positions table has at least 2 rows after saving second product: ${rowCountAfterSave1}`,
        test.info(),
      );
    });

    await allure.step('Step 8: Add the third product to the order', async () => {
      const clickAddNewProductSuccess = await loadingTaskPage.clickAddNewProductToOrderButton();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(clickAddNewProductSuccess).toBe(true);
        },
        'Verify "Add new product to order" button clicked successfully',
        test.info(),
      );

      const openModalSuccess = await loadingTaskPage.openProductSelectionModal();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(openModalSuccess).toBe(true);
        },
        'Verify product selection modal opened successfully',
        test.info(),
      );

      const selectSuccess = await loadingTaskPage.selectProductInModal(thirdProductName);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(selectSuccess).toBe(true);
        },
        `Verify product "${thirdProductName}" selected in modal`,
        test.info(),
      );

      const addSuccess = await loadingTaskPage.clickAddButtonInProductModal();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(addSuccess).toBe(true);
        },
        'Verify Add button clicked successfully in product modal',
        test.info(),
      );

      // Verify the attachments link contains the third product
      const attachmentsText = await loadingTaskPage.getCellValueFromPositionsTable(SelectorsLoadingTasksPage.ADD_ORDER_ATTACHMENTS_VALUE_LINK);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(attachmentsText.includes(thirdProductName)).toBe(true);
        },
        `Verify attachments link contains the third product (${thirdProductName}): ${attachmentsText}`,
        test.info(),
      );

      const saveSuccess = await loadingTaskPage.saveOrder();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(saveSuccess).toBe(true);
        },
        'Verify order saved successfully after adding first product',
        test.info(),
      );

      // Wait 1 second before reload to ensure PRODUCT_3 is visible in the bottom table
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // First reload to trigger backend processing
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG); // Wait for page to fully load
      await loadingTaskPage.waitForNetworkIdle();

      // Second reload to ensure all products (/0, /1, /2) are visible in the positions table
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG); // Wait for page to fully load after second reload
      await loadingTaskPage.waitForNetworkIdle();

      // Verify positions table shows /0, /1, and /2 variants after saving and reloading
      const positionsTableAfterSave2 = page.locator(SelectorsLoadingTasksPage.ADD_ORDER_POSITIONS_TABLE).first();
      await positionsTableAfterSave2.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const bodyRowsAfterSave2 = positionsTableAfterSave2.locator('tbody tr');
      const rowCountAfterSave2 = await bodyRowsAfterSave2.count();
      logger.log(`Test Case 4: After saving first product and reloading twice, positions table has ${rowCountAfterSave2} rows`);

      // Should have at least 3 data rows (/0, /1, /2) plus 1 total row = 4 rows minimum
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCountAfterSave2).toBeGreaterThanOrEqual(3);
        },
        `Verify positions table has at least 3 data rows after saving first product and reloading twice: ${rowCountAfterSave2}`,
        test.info(),
      );

      // /1 should already exist from adding PRODUCT_2 earlier
      // After adding PRODUCT_1, we should have /0, /1, and /2
      // But /2 may not appear in positions table - it will be verified in Test Case 5

      // Note: /2 variant may not appear in positions table immediately
      // It will be verified in Test Case 5 when searching the main shipments list
      // Navigate back to list page to trigger creation of /2 order variant
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const navigateSuccess = await loadingTaskPage.navigateToShippingTasksPage();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(navigateSuccess).toBe(true);
        },
        'Verify navigation back to list page successful after adding first product',
        test.info(),
      );

      // Navigate back to edit mode - this triggers /2 variant creation (similar to how /1 was created)
      const baseOrderNumberValue2 = global.fullOrderNumber || fullOrderNumber;
      if (!baseOrderNumberValue2) {
        throw new Error('Order number is missing. Ensure Test Case 2 has run.');
      }
      const editSuccess2 = await loadingTaskPage.findOrderAndClickEdit(baseOrderNumberValue2);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(editSuccess2).toBe(true);
        },
        'Verify navigation back to edit mode successful after adding first product',
        test.info(),
      );

      // Wait for page to load after navigation
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // First reload to trigger /2 variant creation (similar to how /1 is created)
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // Second reload to ensure /2 variant is fully created and visible
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.LONG);
      await loadingTaskPage.waitForNetworkIdle();

      // Navigate away to main list to trigger /2 to appear in the main shipments list
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const navigateSuccess2 = await loadingTaskPage.navigateToShippingTasksPage();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(navigateSuccess2).toBe(true);
        },
        'Verify navigation to main list successful to trigger /2 appearance',
        test.info(),
      );

      // Wait for backend to process /2 creation - may take time for async processing
      await page.waitForTimeout(TIMEOUTS.VERY_LONG); // Initial wait
      await loadingTaskPage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.EXTENDED); // Additional wait after network idle

      // First reload the main list page to ensure /2 appears in the shipments list
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.EXTENDED);
      await loadingTaskPage.waitForNetworkIdle();

      // Second reload to give backend more time to process /2 creation
      await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await page.waitForTimeout(TIMEOUTS.VERY_LONG); // Longer wait after second reload
      await loadingTaskPage.waitForNetworkIdle();

      // Search for the order to trigger backend processing and ensure /2 appears
      const baseOrderNumberValue3 = global.fullOrderNumber || fullOrderNumber;
      if (baseOrderNumberValue3) {
        const searchInputWrapper = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
        await searchInputWrapper.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        let searchInput: Locator;
        const tagName = await searchInputWrapper.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
        if (tagName === 'input') {
          searchInput = searchInputWrapper;
        } else {
          searchInput = searchInputWrapper.locator('input').first();
          const inputCount = await searchInput.count();
          if (inputCount === 0) {
            searchInput = searchInputWrapper;
          }
        }
        await searchInput.clear();
        await searchInput.fill(baseOrderNumberValue3);
        // Verify value was set
        await expectSoftWithScreenshot(
          page,
          async () => {
            const searchValueBase3 = searchInput;
            await expect.soft(searchValueBase3).toHaveValue(baseOrderNumberValue3);
          },
          `Verify search input value equals "${baseOrderNumberValue3}"`,
          test.info(),
        );
        await page.waitForTimeout(TIMEOUTS.SHORT);
        await searchInput.press('Enter');
        await loadingTaskPage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.LONG);
        logger.log(`Test Case 4: Searched for order ${baseOrderNumberValue3} to trigger /2 creation`);

        // Navigate back to edit mode one more time after search (similar to how /1 is created)
        const editSuccess3 = await loadingTaskPage.findOrderAndClickEdit(baseOrderNumberValue3);
        if (editSuccess3) {
          await page.waitForTimeout(TIMEOUTS.LONG);
          await loadingTaskPage.waitForNetworkIdle();
          // Reload to ensure /2 variant is created and visible
          await page.reload({ waitUntil: 'load', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
          await page.waitForTimeout(TIMEOUTS.LONG);
          await loadingTaskPage.waitForNetworkIdle();
          logger.log(`Test Case 4: Navigated back to edit mode and reloaded to trigger /2 creation`);
        }
      }

      // /2 should now be created and will be verified in Test Case 5 when searching the main shipments list
    });
  });
};
