/**
 * @file U001-Orders.spec.ts
 * @purpose Test Suite 2: Order Management (Test Cases 05-07)
 * 
 * This suite handles:
 * - Test Case 05: Deleting customer orders
 * - Test Case 06: Loading Task (CRITICAL - Sets orderNumber, descendantsCbedArray, descendantsDetailArray)
 * - Test Case 07: Checking the urgency date and quantity in a shipment task
 */

import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { test, expect } from '@playwright/test';
import { CreateLoadingTaskPage } from '../pages/LoadingTaskPage';
import { ISpetificationData, Click, expectSoftWithScreenshot } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { allure } from 'allure-playwright';
import testData1 from '../testdata/U001-PC1.json';
import * as U001Constants from './U001-Constants';
const {
  nameProductNew,
  nameProduct,
  nameBuyer,
  quantityProductLaunchOnProduction,
  urgencyDateNewFormat,
  descendantsCbedArray,
  descendantsDetailArray,
  orderNumber,
} = U001Constants;
// Mutable variable that needs to be reassigned
let urgencyDateOnTable = U001Constants.urgencyDateOnTable;

export const runU001_02_Orders = (isSingleTest: boolean, iterations: number) => {
  console.log(`Start of the test: U001 Order Management (Test Cases 05-07)`);

  test('Test Case 05 - Deleting customer orders', async ({ page }) => {
    console.log('Test Case 05 - Deleting customer orders');
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 04: Search product', async () => {
      // Using table search we look for the value of the variable
      await loadingTaskPage.searchAndWaitForTable(nameProductNew, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.SHIPMENTS_TABLE_BODY, {
        useRedesign: true,
        timeoutBeforeWait: 3000,
        searchInputDataTestId: LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT,
      });
    });

    // Цикл: пока в первой строке таблицы есть нужный продукт, архивируем
    while (true) {
      // Получаем первую строку таблицы
      const firstRow = await page.locator(`${LoadingTasksSelectors.SHIPMENTS_TABLE_BODY} tr`).first();
      const rowCount = await page.locator(`${LoadingTasksSelectors.SHIPMENTS_TABLE_BODY} tr`).count();
      if (rowCount === 0) {
        console.log(`No orders found for product "${nameProductNew}". Exiting...`);
        break;
      }

      // Получаем имя продукта из первой строки (5-я ячейка, индекс 4)
      const firstCell = await firstRow.locator('td').nth(4).textContent();
      if (!firstCell || !firstCell.includes(nameProductNew)) {
        // Если имя продукта не совпадает — выходим
        break;
      }

      // Получаем номер заказа (3-я ячейка, индекс 2)
      const orderNumber = await firstRow.locator('td').nth(2).textContent();
      console.log('AAAAAAAA' + orderNumber);

      // Select row and wait for archive button to be enabled using Playwright's built-in waiting
      const archiveButton = page.locator(LoadingTasksSelectors.buttonArchive, { hasText: 'Архив' });
      const currentRow = page.locator(`${LoadingTasksSelectors.SHIPMENTS_TABLE_BODY} tr`).first();

      // Click the order number cell to select the row
      const orderNumberCell = currentRow.locator('td').nth(2);
      await orderNumberCell.scrollIntoViewIfNeeded();
      await orderNumberCell.click();

      // Wait for archive button to be enabled using Playwright's expect
      await expect(archiveButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.LONG });
      console.log('Archive button enabled after row selection');

      // Archive and confirm
      await loadingTaskPage.archiveAndConfirm(LoadingTasksSelectors.buttonArchive, PartsDBSelectors.BUTTON_CONFIRM, {
        waitAfterConfirm: 1000,
      });

      // Wait for table to refresh after archiving
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.LONG);

      // Re-search to refresh the table before processing the next row
      console.log('Re-searching after archive to refresh table...');
      await loadingTaskPage.searchAndWaitForTable(nameProductNew, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.SHIPMENTS_TABLE_BODY, {
        useRedesign: true,
        timeoutBeforeWait: 3000,
      });
    }
  });

  test('Test Case 06 - Loading Task', async ({ page }) => {
    console.log('Test Case 06 - Loading Task');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 02-03: Checking the main page headings and buttons', async () => {
      // [SPEED] JSON validation (titles/buttons) commented out - re-enable for UI validation
      // const titles = testData1.elements.LoadingPage.titles;
      // const buttons = testData1.elements.LoadingPage.buttons;
      // await loadingTaskPage.validatePageHeadersAndButtons(page, titles, buttons, LoadingTasksSelectors.issueShipmentPage);
    });

    await allure.step('Step 04: Click on the Create order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Создать заказ', LoadingTasksSelectors.buttonCreateOrder);
    });

    await allure.step('Step 05-06: Checking the main page headings and buttons', async () => {
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // [SPEED] JSON validation (titles/buttons) commented out - re-enable for UI validation
      // const titles = testData1.elements.CreateOrderPage.titles;
      // const buttons = testData1.elements.CreateOrderPage.buttons;
      // await loadingTaskPage.validatePageHeadersAndButtons(page, titles, buttons, LoadingTasksSelectors.addOrderComponent);
    });

    await allure.step('Step 07: Click on the Select button', async () => {
      // Click on the button
      await page.locator(LoadingTasksSelectors.buttonChoiceIzd).click();

      await page.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 08: Checking the main page headings', async () => {
      // [SPEED] JSON validation (titles) commented out - re-enable for UI validation
      // const titles = testData1.elements.ModalWindowChoiceProduct.titles.map(title => title.trim());
      // const h3Titles = await loadingTaskPage.getAllH3TitlesInModalClassNew(page, '.modal-yui-kit__modal-content');
      // const normalizedH3Titles = h3Titles.map(title => title.trim());
      await loadingTaskPage.waitForNetworkIdle();
      // await expectSoftWithScreenshot( page, () => { expect.soft(normalizedH3Titles.length).toBe(titles.length); expect.soft(normalizedH3Titles).toEqual(titles); }, `Verify modal window titles match expected: ${titles.join(', ')}`, test.info(), );
    });

    await allure.step('Step 09: Checking the main buttons on the page', async () => {
      await loadingTaskPage.waitForNetworkIdle();
      // [SPEED] JSON validation (buttons) commented out - re-enable for UI validation
      // const buttons = testData1.elements.ModalWindowChoiceProduct.buttons;
      // for (const button of buttons) { const buttonLabel = button.label; const buttonDatatestId = button.datatestid; const expectedState = button.state === 'true'; await allure.step(`Validate button with label: "${buttonLabel}"`, async () => { if (!buttonDatatestId) throw new Error(`Button "${buttonLabel}" does not have a data-testid`); const isButtonReady = await loadingTaskPage.isButtonVisibleTestId(page, buttonDatatestId, buttonLabel, expectedState); await expectSoftWithScreenshot(page, () => { expect.soft(isButtonReady).toBeTruthy(); }, `Verify button "${buttonLabel}" is visible and enabled`, test.info()); }); }
    });

    await allure.step('Step 10: Checking filters on a page', async () => {
      await loadingTaskPage.waitForNetworkIdle();
      // [SPEED] JSON validation (filters) commented out - re-enable for UI validation
      // const buttons = testData1.elements.ModalWindowChoiceProduct.filters;
      // for (const button of buttons) { const buttonDataTestId = button.datatestid; const buttonLabel = button.label; const expectedState = button.state === 'true'; await allure.step(`Validate button with label: "${buttonLabel}"`, async () => { if (!buttonDataTestId) throw new Error(`Button "${buttonLabel}" does not have a data-testid`); const isButtonReady = await loadingTaskPage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState); await expectSoftWithScreenshot(page, () => { expect.soft(isButtonReady).toBeTruthy(); }, `Verify button "${buttonLabel}" is visible and enabled`, test.info()); }); }
    });

    await allure.step('Step 11: Search product on modal window', async () => {
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

    await allure.step('Step 12: Choice product in modal window', async () => {
      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit', 0);

      await loadingTaskPage.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 13: Click on the Select button on modal window', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Добавить', LoadingTasksSelectors.buttonChoiceIzdTEMPU001);
    });

    await allure.step('Step 14: Checking the selected product', async () => {
      // Check that the selected product displays the expected product
      await loadingTaskPage.checkProduct(nameProduct);
      await loadingTaskPage.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 15: Click on the Select buyer button', async () => {
      await loadingTaskPage.clickButton('Выбрать', LoadingTasksSelectors.buttonChoiceBuyer);

      // Wait for loading
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 16: Check modal window Company', async () => {
      // await loadingTaskPage.searchTable(nameBuyer, '.table-yui-kit__border.table-yui-kit-with-scroll')

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

    await allure.step('Step 17: Click on the Select button on modal window', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Добавить', LoadingTasksSelectors.buttonAddBuyerOnModalWindow);
    });

    await allure.step('Step 18: We change the quantity of the ordered product', async () => {
      const locator = '.input-yui-kit.initial.medium.add-order-component__input.initial';
      await loadingTaskPage.checkOrderQuantity(locator, '1', quantityProductLaunchOnProduction);

      await loadingTaskPage.waitForTimeout(TIMEOUTS.STANDARD);
    });

    await allure.step('Step 19: We set the date according to urgency', async () => {
      console.log('Step 19: We set the date according to urgency');
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

      // Pick the day 23 in January 2025 by aria-label
      await calendar.locator('button[role="gridcell"][aria-label="January 23rd, 2025"]').first().click();
    });

    await allure.step('Step 20: We save descendants from the specification into an array', async () => {
      // Clear array first to avoid duplicates
      // Note: descendantsCbedArray and descendantsDetailArray are imported from U001-Constants
      descendantsCbedArray.length = 0;
      descendantsDetailArray.length = 0;
      // Save Assembly units and Parts from the Specification to an array
      console.log('Before preservingDescendants:');
      console.log('descendantsCbedArray length:', descendantsCbedArray.length);
      console.log('descendantsDetailArray length:', descendantsDetailArray.length);
      
      await loadingTaskPage.preservingDescendants(descendantsCbedArray, descendantsDetailArray);
      
      // Verify that arrays were populated
      console.log('After preservingDescendants:');
      console.log('descendantsCbedArray:', descendantsCbedArray);
      console.log('descendantsDetailArray:', descendantsDetailArray);
      console.log('descendantsCbedArray length:', descendantsCbedArray.length);
      console.log('descendantsDetailArray length:', descendantsDetailArray.length);
      
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(descendantsCbedArray.length + descendantsDetailArray.length).toBeGreaterThan(0);
        },
        `Verify specification data was extracted: ${descendantsCbedArray.length} CBED, ${descendantsDetailArray.length} DETAIL`,
        test.info(),
      );
      
      if (descendantsDetailArray.length === 0) {
        throw new Error('CRITICAL: descendantsDetailArray is empty after preservingDescendants! The specification table may be empty or not loaded correctly.');
      }
    });

    await allure.step('Step 21: Click on the save order button', async () => {
      // Click on the button
      await loadingTaskPage.clickButton('Сохранить', LoadingTasksSelectors.buttonSaveOrder);
    });

    await allure.step('Step 22: Checking the ordered quantity', async () => {
      // Wait for page to reload after saving
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.LONG);

      // Wait for the order number to appear in the editTitle element
      const editTitleLocator = page.locator(LoadingTasksSelectors.editTitle);
      await editTitleLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      // Wait a bit more for the order number to be populated
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const orderInfo = await loadingTaskPage.getOrderInfoFromLocator('.add-order-component');
      // Update shared state
      orderNumber.orderNumber = orderInfo.orderNumber || '';
      orderNumber.orderDate = orderInfo.orderDate;
      console.log('orderNumber: ', orderNumber);
    });
  });

  test('Test Case 07 - Checking the urgency date and quantity in a shipment task', async ({ page }) => {
    console.log('Test Case 07 - Checking the urgency date and quantity in a shipment task');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const loadingTaskPage = new CreateLoadingTaskPage(page);
    const mainTableLoadingTask = 'IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Table';

    await allure.step('Step 01: Open the shipment task page', async () => {
      // Go to the Shipping tasks page
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 02: Search product', async () => {
      await loadingTaskPage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.LONG);
      // Using table search we look for the value of the variable
      await loadingTaskPage.searchAndWaitForTable(nameProduct, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.SHIPMENTS_TABLE_BODY, {
        searchInputDataTestId: LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT,
      });
    });

    await allure.step('Step 03: Checking the quantity in a task', async () => {
      // Find the quantity cell using data-testid pattern
      // Pattern: IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-Kol{id}
      const quantityCell = page.locator(LoadingTasksSelectors.SHIPMENTS_PRODUCT_QUANTITY_PATTERN).first();

      await quantityCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await quantityCell.scrollIntoViewIfNeeded();

      // Highlight the quantity cell
      await quantityCell.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'lightcyan';
        el.style.border = '2px solid blue';
      });

      // Get the quantity value from the cell
      const quantityValue = await quantityCell.textContent();
      const quantityOnTable = quantityValue?.trim() || '';

      console.log('Количество заказанных сущностей в заказе: ', quantityOnTable);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(quantityOnTable).toBe(quantityProductLaunchOnProduction);
        },
        `Verify quantity on table equals "${quantityProductLaunchOnProduction}"`,
        test.info(),
      );
    });

    await allure.step('Step 04: Checking the urgency date of an order', async () => {
      const urgencyDateText = await page.locator('tbody .date-picker-yui-kit__header-btn span').first().textContent();
      urgencyDateOnTable = urgencyDateText?.trim() || '';

      console.log('Дата по срочности в таблице: ', urgencyDateOnTable);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(urgencyDateOnTable).toBe(urgencyDateNewFormat);
        },
        `Verify urgency date equals "${urgencyDateNewFormat}"`,
        test.info(),
      );
    });
  });
};
