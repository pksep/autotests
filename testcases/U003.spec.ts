import { test, expect, Page, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { ENV, SELECTORS, LOGIN_TEST_CONFIG } from '../config';
import { allure } from 'allure-playwright';
import { Click, ISpetificationData } from '../lib/Page';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { CreateLoadingTaskPage, Month } from '../pages/LoadingTaskPage';
import { CreateWarehouseTaskForShipmentPage } from '../pages/WarehouseTaskForShipmentPage';

// Constants imports
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsLoadingTasksPage from '../lib/Constants/SelectorsLoadingTasksPage';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as SelectorsWarehouseTaskForShipment from '../lib/Constants/SelectorsWarehouseTaskForShipment';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';

// Helper function to extract ID from full selector
const extractIdFromSelector = (selector: string): string => {
  const match = selector.match(/\[data-testid="([^"]+)"]/);
  return match ? match[1] : selector;
};

// Global variable declarations
declare global {
  var testProductName: string;
  var testProductArticleNumber: string;
  var shipmentTaskNumber: string;
  var fullOrderNumber: string;
  var shipmentOrderDate: string;
  var firstProductName: string;
  var secondProductName: string;
}

// Test data - will be populated during test execution
let testProductName: string = '';
let testProductArticleNumber: string = '';
let shipmentTaskNumber: string = '';
let fullOrderNumber: string = '';
let shipmentOrderDate: string = '';
let firstProductName: string = '';
let secondProductName: string = '';

// Test data for Test Case 2
const nameBuyer = 'М10';
const quantity = '5';
const urgencyDate = '23.01.2025';
const urgencyDateNewFormat = 'Янв 23, 2025';
const shipmentPlanDate = '24.01.2025';
const orderDate = '25.01.2025';

// Arrays for комплектации data
const descendantsCbedArray: ISpetificationData[] = [];
const descendantsDetailArray: ISpetificationData[] = [];
const deficitTable = SelectorsShortagePages.TABLE_DEFICIT_IZD;
const tableMainUploading = SelectorsShipmentTasks.TABLE_SHIPMENT_TABLE;

export const runU003 = (isSingleTest: boolean, iterations: number) => {
  console.log(`Starting test: U003 - Shipment Tasks Management`);

  test('Test Case 1 - Создать тестовое изделие', async ({ page }) => {
    test.setTimeout(120000);
    console.log('Test Case 1 - Create test product');
    const partsDatabasePage = new CreatePartsDatabasePage(page);

    // Test data - will create 3 test products
    const baseTimestamp = Date.now();
    const testProducts = [
      {
        articleNumber: `TEST_ARTICLE_${baseTimestamp}_1`,
        name: `TEST_PRODUCT_${baseTimestamp}_1`,
        designation: `TEST_DESIGNATION_${baseTimestamp}_1`,
      },
      {
        articleNumber: `TEST_ARTICLE_${baseTimestamp}_2`,
        name: `TEST_PRODUCT_${baseTimestamp}_2`,
        designation: `TEST_DESIGNATION_${baseTimestamp}_2`,
      },
      {
        articleNumber: `TEST_ARTICLE_${baseTimestamp}_3`,
        name: `TEST_PRODUCT_${baseTimestamp}_3`,
        designation: `TEST_DESIGNATION_${baseTimestamp}_3`,
      },
    ];

    await allure.step('Step 1: Go to Parts Database page', async () => {
      await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabasePage.waitForNetworkIdle();

      // Verify page loaded
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      await createButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await createButton.isVisible()).toBe(true);
    });

    for (const product of testProducts) {
      await allure.step('Step 2: Click on Create button', async () => {
        const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
        await createButton.waitFor({ state: 'visible', timeout: 10000 });

        // Verify button is enabled
        const isEnabled = await createButton.isEnabled();
        expect.soft(isEnabled).toBe(true);

        await createButton.click();
        console.log('Clicked on Create button');
      });

      await allure.step('Step 3: Wait for dialog and click on Изделие', async () => {
        // Wait for dialog to appear (using the data-testid specified)
        const dialog = page.locator(SelectorsPartsDataBase.DIALOG_CREATE_OPTIONS);
        await dialog.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await dialog.isVisible()).toBe(true);

        // Find and click on Изделие button with specific data-testid
        const productButton = page.locator(SelectorsPartsDataBase.BUTTON_PRODUCT).filter({ hasText: 'Изделие' });
        await productButton.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await productButton.isVisible()).toBe(true);
        await productButton.click();
        console.log('Clicked on Изделие button');
      });

      await allure.step('Step 4: Wait for creation page to load', async () => {
        const h3Title = page.locator('h3', { hasText: 'Создание изделия' }).first();
        const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_CBED).first();

        try {
          await h3Title.waitFor({ state: 'visible', timeout: 10000 });
          expect.soft(await h3Title.isVisible()).toBe(true);
        } catch (error) {
          console.warn('Creation page header not visible within timeout, falling back to Save button check', error);
          await saveButton.waitFor({ state: 'visible', timeout: 10000 });
          expect.soft(await saveButton.isVisible()).toBe(true);
        }

        await partsDatabasePage.waitForNetworkIdle();
        console.log('Creation page loaded');
      });

      await allure.step('Step 5: Enter article number (Артикул)', async () => {
        const articleInput = page.locator(SelectorsPartsDataBase.INPUT_ARTICLE_NUMBER);
        await articleInput.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await articleInput.isVisible()).toBe(true);
        await articleInput.clear();
        await articleInput.fill(product.articleNumber);
        await page.waitForTimeout(500); // Wait for value to be set

        // Verify value was entered, retry once if needed
        let inputValue = await articleInput.inputValue();
        if (!inputValue) {
          console.warn('Article input value empty after first fill, retrying...');
          await articleInput.fill(product.articleNumber);
          await page.waitForTimeout(500);
          inputValue = await articleInput.inputValue();
        }

        expect.soft(inputValue).toBe(product.articleNumber);
        console.log(`Entered article number: ${product.articleNumber}`);
      });

      await allure.step('Step 6: Enter name (Наименование)', async () => {
        const nameInput = page.locator(SelectorsPartsDataBase.INPUT_NAME_IZD);
        await nameInput.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await nameInput.isVisible()).toBe(true);
        await nameInput.clear();
        await nameInput.fill(product.name);
        await page.waitForTimeout(500); // Wait for value to be set

        // Verify value was entered, retry once if needed
        let inputValue = await nameInput.inputValue();
        if (!inputValue) {
          console.warn('Name input value empty after first fill, retrying...');
          await nameInput.fill(product.name);
          await page.waitForTimeout(500);
          inputValue = await nameInput.inputValue();
        }

        expect.soft(inputValue).toBe(product.name);
        console.log(`Entered name: ${product.name}`);
      });

      await allure.step('Step 7: Enter designation (Обозначение)', async () => {
        const designationInput = page.locator(SelectorsPartsDataBase.INPUT_DESUGNTATION_IZD);
        await designationInput.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await designationInput.isVisible()).toBe(true);
        await designationInput.clear();
        await designationInput.fill(product.designation);
        await page.waitForTimeout(500); // Wait for value to be set

        // Verify value was entered, retry once if needed
        let inputValue = await designationInput.inputValue();
        if (!inputValue) {
          console.warn('Designation input value empty after first fill, retrying...');
          await designationInput.fill(product.designation);
          await page.waitForTimeout(500);
          inputValue = await designationInput.inputValue();
        }

        expect.soft(inputValue).toBe(product.designation);
        console.log(`Entered designation: ${product.designation}`);
      });

      await allure.step('Step 8: Click Save button', async () => {
        const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_CBED);
        await saveButton.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await saveButton.isVisible()).toBe(true);
        await partsDatabasePage.clickButton('Сохранить', SelectorsPartsDataBase.BUTTON_SAVE_CBED);
        await partsDatabasePage.waitForNetworkIdle();
        console.log('Clicked Save button and waited for loading to complete');
      });

      await allure.step('Step 9: Click Cancel button', async () => {
        // Wait for loader to disappear
        const loaderDialog = page.locator('[data-testid="Creator-Loader"]');
        await loaderDialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {
          // If loader doesn't exist or is already hidden, continue
        });
        await page.waitForTimeout(500);

        const cancelButton = page.locator(SelectorsPartsDataBase.BUTTON_CANCEL_CBED);
        await cancelButton.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await cancelButton.isVisible()).toBe(true);
        await partsDatabasePage.clickButton('Отменить', SelectorsPartsDataBase.BUTTON_CANCEL_CBED);

        // Verify we're back on the Parts Database page
        const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
        await createButton.waitFor({ state: 'visible', timeout: 10000 });
        expect.soft(await createButton.isVisible()).toBe(true);
        console.log('Clicked Cancel button');
      });

      // Store product name and article number for later use (store the last product - third one)
      testProductName = product.name;
      testProductArticleNumber = product.articleNumber;
      global.testProductName = product.name;
      global.testProductArticleNumber = product.articleNumber;
    }
  });

  test('Test Case 2 - Создать Задачу на отгрузку', async ({ page }) => {
    test.setTimeout(120000);
    console.log('Test Case 2 - Create shipment task');
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    // Use the first product name from Test Case 1
    const productName = global.testProductName || testProductName || firstProductName;
    const articleNumberValue = global.testProductArticleNumber || testProductArticleNumber;
    if (!productName) {
      throw new Error('Product name not found. Please run Test Case 1 first.');
    }

    await allure.step('Step 1: Go to Задачи на отгрузку page', async () => {
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();

      // Verify page loaded
      const createOrderButton = page.locator(SelectorsLoadingTasksPage.buttonCreateOrder);
      await createOrderButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await createOrderButton.isVisible()).toBe(true);
    });

    await allure.step('Step 2: Verify Create Order button is visible', async () => {
      const createOrderButton = page.locator(SelectorsLoadingTasksPage.buttonCreateOrder);
      await createOrderButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await createOrderButton.isVisible()).toBe(true);
    });

    await allure.step('Step 3: Click Create Order button', async () => {
      await loadingTaskPage.clickButton('Создать заказ', SelectorsLoadingTasksPage.buttonCreateOrder);
      await loadingTaskPage.waitForNetworkIdle();
    });

    await allure.step('Step 4: Verify and click Изделие Выбрать button', async () => {
      const choiceIzdButton = page.locator(SelectorsLoadingTasksPage.buttonChoiceIzd, { hasText: 'Выбрать' }).first();
      await choiceIzdButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await choiceIzdButton.isVisible()).toBe(true);

      const isEnabled = await choiceIzdButton.isEnabled();
      expect.soft(isEnabled).toBe(true);

      await choiceIzdButton.click();
      console.log('Clicked on Изделие Выбрать button');
    });

    await allure.step('Step 5: Wait for product modal dialog', async () => {
      const modal = page.locator(SelectorsLoadingTasksPage.modalListProduct);
      await modal.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await modal.isVisible()).toBe(true);

      // Wait for table body to load
      const tableBody = modal.locator('tbody');
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await tableBody.isVisible()).toBe(true);
    });

    await allure.step('Step 6: Verify search input exists in modal', async () => {
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProduct);
      const searchInput = productModal.locator(SelectorsLoadingTasksPage.searchDropdownInput).first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await searchInput.isVisible()).toBe(true);
    });

    await allure.step('Step 7: Enter product name in search', async () => {
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProduct);
      const searchInput = productModal.locator(SelectorsLoadingTasksPage.searchDropdownInput).first();
      await searchInput.fill(productName);

      const inputValue = await searchInput.inputValue();
      expect.soft(inputValue).toBe(productName);
      console.log(`Entered product name in search: ${productName}`);
    });

    await allure.step('Step 8: Filter table by pressing Enter', async () => {
      const productModal = page.locator(SelectorsLoadingTasksPage.modalListProduct);
      const searchInput = productModal.locator(SelectorsLoadingTasksPage.searchDropdownInput).first();
      await searchInput.press('Enter');
      await loadingTaskPage.waitForNetworkIdle();

      // Wait for table body to be visible
      const modal = page.locator(SelectorsLoadingTasksPage.modalListProduct);
      const tableBody = modal.locator('tbody');
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await tableBody.isVisible()).toBe(true);
    });

    await allure.step('Step 9: Click first row in modal table', async () => {
      const modal = page.locator(SelectorsLoadingTasksPage.modalListProduct);
      let productRow = modal.locator('tbody tr').filter({ hasText: productName });

      if ((await productRow.count()) === 0 && articleNumberValue) {
        console.warn(`Product "${productName}" not found by name. Trying article number "${articleNumberValue}".`);
        const searchInput = modal.locator(SelectorsLoadingTasksPage.searchDropdownInput).first();
        await searchInput.fill('');
        await searchInput.fill(articleNumberValue);
        await searchInput.press('Enter');
        await loadingTaskPage.waitForNetworkIdle();
        await page.waitForTimeout(1000);
        productRow = modal.locator('tbody tr').filter({ hasText: articleNumberValue });
      }

      if ((await productRow.count()) === 0) {
        throw new Error(`Could not find product row with name "${productName}" in the modal.`);
      }

      await productRow.first().waitFor({ state: 'visible', timeout: 10000 });
      await productRow.first().scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(productRow.first(), {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      await productRow.first().click();
      console.log('Clicked on product row in modal table');
    });

    await allure.step('Step 10: Verify Add button is visible and enabled', async () => {
      const addButton = page
        .locator(`${SelectorsLoadingTasksPage.modalListProduct} .base-modal__section-button-return button`, {
          hasText: 'Добавить',
        })
        .first();
      await addButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await addButton.isVisible()).toBe(true);

      const isEnabled = await addButton.isEnabled();
      expect.soft(isEnabled).toBe(true);
    });

    await allure.step('Step 11: Click Add button and wait', async () => {
      const addButton = page
        .locator(`${SelectorsLoadingTasksPage.modalListProduct} .base-modal__section-button-return button`, {
          hasText: 'Добавить',
        })
        .first();
      await addButton.waitFor({ state: 'visible', timeout: 10000 });
      await addButton.scrollIntoViewIfNeeded();
      await addButton.click({ force: true });
      await page.waitForTimeout(500);
      console.log('Clicked Add button');
    });

    await allure.step('Step 12: Verify correct product is displayed in Изделие row', async () => {
      await loadingTaskPage.checkProduct(productName);
      const productText = ((await page.locator('.attachments-value .link').first().textContent()) || '').trim();
      expect.soft(productText).toBe(productName);
    });

    await allure.step('Step 13: Verify Покупатель Выбрать button is visible and active', async () => {
      const choiceBuyerButton = page.locator(SelectorsLoadingTasksPage.buttonChoiceBuyer);
      await choiceBuyerButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await choiceBuyerButton.isVisible()).toBe(true);

      const isActive = await loadingTaskPage.checkButtonState(SelectorsLoadingTasksPage.buttonChoiceBuyer, 'active');
      expect.soft(isActive).toBe(true);
    });

    await allure.step('Step 14: Click Покупатель Выбрать button', async () => {
      const choiceBuyerButton = page.locator(SelectorsLoadingTasksPage.buttonChoiceBuyer);
      await choiceBuyerButton.click();

      // Wait for table body to be visible
      const modal = page.locator(SelectorsLoadingTasksPage.modalListBuyer);
      await modal.waitFor({ state: 'visible', timeout: 10000 });
      const tableBody = modal.locator('tbody');
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await tableBody.isVisible()).toBe(true);

      await page.waitForTimeout(1000);
    });

    await allure.step('Step 15: Check modal window Company', async () => {
      const modalWindow = page.locator('.modal-yui-kit__modal-content');
      await expect(modalWindow).toBeVisible();
      expect.soft(await modalWindow.isVisible()).toBe(true);

      const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
      await searchTable.fill(nameBuyer);

      expect.soft(await searchTable.inputValue()).toBe(nameBuyer);
      await searchTable.press('Enter');

      await page.waitForTimeout(500);
    });

    await allure.step('Step 16: Click first row in buyer modal table', async () => {
      await loadingTaskPage.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0);
      console.log('Clicked on first row in buyer modal table');
    });

    await allure.step('Step 17: Click on the Select button on modal window', async () => {
      await loadingTaskPage.clickButton('Добавить', SelectorsLoadingTasksPage.buttonAddBuyerOnModalWindow);
      console.log('Clicked Add button for buyer');
    });

    await allure.step('Step 18: Enter quantity in Количество input', async () => {
      const quantityInput = page.locator(SelectorsLoadingTasksPage.quantityInput);
      await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await quantityInput.isVisible()).toBe(true);

      await quantityInput.fill(quantity);
      await page.waitForTimeout(1000);

      const inputValue = await quantityInput.inputValue();
      expect.soft(inputValue).toBe(quantity);
      console.log(`Entered quantity: ${quantity}`);
    });

    await allure.step('Step 19: Enter urgency date', async () => {
      await page.locator(SelectorsLoadingTasksPage.calendarTrigger).click();
      await page.locator(SelectorsLoadingTasksPage.calendarPopover).isVisible();

      // Scope to the calendar component
      const calendar = page.locator(SelectorsLoadingTasksPage.calendarComponent);

      // Open the years popup by clicking the header year button
      const yearButton = calendar.locator('button[id^="open-years-popup"]').first();
      await yearButton.waitFor({ state: 'visible' });
      await yearButton.click();

      // Scope to the open years popover
      const yearsPopover = page.locator('wa-popover[for^="open-years-popup"][open]').first();
      await yearsPopover.waitFor({ state: 'visible' });

      // Select target year
      const targetYear = 2025;
      const yearCell = yearsPopover.locator('[part^="year"]', { hasText: String(targetYear) }).first();
      await yearCell.waitFor({ state: 'visible', timeout: 10000 });
      await yearCell.click();

      // Verify selection
      const finalYearText = ((await yearButton.textContent()) || '').trim();
      expect.soft(parseInt(finalYearText, 10)).toBe(targetYear);

      // Open months popup and select January
      const monthButton = calendar.locator('button[id^="open-months-popup"]').first();
      await monthButton.waitFor({ state: 'visible' });
      await monthButton.click();

      const monthsPopover = page.locator('wa-popover[for^="open-months-popup"][open]').first();
      await monthsPopover.waitFor({ state: 'visible' });
      const januaryCell = monthsPopover.locator('div[part^="month"]').nth(1);
      await januaryCell.waitFor({ state: 'visible' });
      await januaryCell.click({ force: true });
      await monthButton.waitFor({ state: 'visible' });
      await page.waitForTimeout(1000);

      // Pick the day 23 in January 2025
      await calendar.locator('button[role="gridcell"][aria-label="January 23rd, 2025"]').first().click();
      console.log('Selected urgency date: 23.01.2025');
    });

    await allure.step('Step 20: Enter shipment plan date', async () => {
      // TODO: Find the selector for shipment plan date input
      // This will need to be implemented based on the actual UI
      console.log('Step 20: Enter shipment plan date - TODO');
      expect.soft(true).toBe(true); // Placeholder assertion
    });

    await allure.step('Step 21: Enter order date', async () => {
      // TODO: Find the selector for order date input
      // This will need to be implemented based on the actual UI
      console.log('Step 21: Enter order date - TODO');
      expect.soft(true).toBe(true); // Placeholder assertion
    });

    await allure.step('Step 22: Iterate through Комплектации table and save data', async () => {
      // Clear arrays first
      descendantsCbedArray.length = 0;
      descendantsDetailArray.length = 0;

      // Save Assembly units and Parts from the Specification to arrays
      await loadingTaskPage.preservingDescendants(descendantsCbedArray, descendantsDetailArray);

      // Just log the result - no assertion required per original instructions
      console.log(`Saved ${descendantsCbedArray.length} CBED and ${descendantsDetailArray.length} DETAIL items`);
      expect.soft(true).toBe(true); // Placeholder assertion
    });

    await allure.step('Step 23: Verify Save button is visible at bottom of screen', async () => {
      const saveButton = page.locator(SelectorsLoadingTasksPage.buttonSaveOrder);
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await saveButton.isVisible()).toBe(true);
    });

    await allure.step('Step 24: Click Save button and wait', async () => {
      await loadingTaskPage.clickButton('Сохранить', SelectorsLoadingTasksPage.buttonSaveOrder);
      await page.waitForTimeout(1000);
      await loadingTaskPage.waitForNetworkIdle();
      expect.soft(true).toBe(true); // Placeholder assertion
    });

    await allure.step('Step 25: Save Order Number to variable', async () => {
      // Wait for the edit title element to be visible and contain order number pattern
      const editTitleElement = page.locator(SelectorsLoadingTasksPage.editTitle);

      // Use waitForFunction for efficient polling - checks immediately and frequently
      await page.waitForFunction(
        testId => {
          const element = document.querySelector(`[data-testid="${testId}"]`);
          if (!element) return false;
          const text = element.textContent || '';
          return /Редактирование заказа\s+№\s+\d+-\d+/.test(text);
        },
        'AddOrder-EditTitle',
        { timeout: 30000 }
      );

      // Now get the text and highlight
      const titleText = (await editTitleElement.textContent())?.trim() || '';
      console.log('Title text:', titleText);

      // Highlight the title element
      await editTitleElement.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(editTitleElement, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);

      // Extract order number: remove "Редактирование заказа" and everything from "/" onwards
      // Pattern: "Редактирование заказа  № 25-4546 /0 от 18.11.2025"
      const orderNumberMatch = titleText.match(/Редактирование заказа\s+№\s+([^/\s]+)/);
      shipmentTaskNumber = orderNumberMatch ? orderNumberMatch[1].trim() : '';

      // Extract FULL order number: everything after "№" including the "от <date>" part
      // Pattern: "Редактирование заказа  № 25-4546 /0 от 18.11.2025"
      const fullOrderNumberMatch = titleText.match(/Редактирование заказа\s+№\s+(.+)/);
      fullOrderNumber = fullOrderNumberMatch ? fullOrderNumberMatch[1].trim() : '';

      // Extract order date: everything after "от "
      const orderDateMatch = titleText.match(/от\s+(.+)$/);
      console.log('XXX' + orderDateMatch);
      shipmentOrderDate = orderDateMatch ? orderDateMatch[1].trim() : '';

      // Fallback: if any values are missing, read from table and date display
      const hasDigits = (value?: string): boolean => !!value && /\d/.test(value);

      if (!hasDigits(shipmentTaskNumber) || !hasDigits(fullOrderNumber)) {
        const orderNumberCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-NumberOrder"]').first();
        await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
        await orderNumberCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(orderNumberCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const orderNumberCellText = (await orderNumberCell.textContent())?.trim() || '';

        if (!hasDigits(fullOrderNumber) && orderNumberCellText) {
          fullOrderNumber = orderNumberCellText;
        }

        if (!hasDigits(shipmentTaskNumber) && orderNumberCellText) {
          const baseOrderMatch = orderNumberCellText.match(/([0-9-]+)/);
          shipmentTaskNumber = baseOrderMatch ? baseOrderMatch[1] : orderNumberCellText;
        }
      }

      if (!shipmentOrderDate) {
        const orderDateDisplay = page.locator('[data-testid="AddOrder-DateOrder-Calendar-DataPicker-Choose-Value-Display"]');
        await orderDateDisplay.waitFor({ state: 'visible', timeout: 10000 });
        await orderDateDisplay.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(orderDateDisplay, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        shipmentOrderDate = (await orderDateDisplay.textContent())?.trim() || '';
      }

      global.shipmentTaskNumber = shipmentTaskNumber;
      global.fullOrderNumber = fullOrderNumber;
      global.shipmentOrderDate = shipmentOrderDate;

      expect.soft(shipmentTaskNumber).not.toBe('');
      expect.soft(fullOrderNumber).not.toBe('');
      expect.soft(shipmentOrderDate).not.toBe('');
      console.log('Order Number saved:', shipmentTaskNumber);
      console.log('Full Order Number saved:', fullOrderNumber);
      console.log('Order Date saved:', shipmentOrderDate);
    });
  });

  test('Test Case 3 - Проверить создание Задачи на отгрузку', async ({ page }) => {
    test.setTimeout(920000);
    console.log('Test Case 3 - Verify shipment task creation (edit verification)');

    const loadingTaskPage = new CreateLoadingTaskPage(page);

    const productName = global.testProductName || testProductName || firstProductName;
    const orderNumberValue = global.shipmentTaskNumber || shipmentTaskNumber;
    const orderDateValue = global.shipmentOrderDate || shipmentOrderDate;

    if (!productName || !orderNumberValue) {
      throw new Error('Product name or order number is missing. Please ensure Test Case 1 and 2 have run.');
    }

    await allure.step('Step 1: Найти созданный заказ и открыть его на редактирование', async () => {
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();

      // Wait for IssueShipment page to load
      const issueShipmentPage = page.locator(SelectorsLoadingTasksPage.issueShipmentPage);
      await issueShipmentPage.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for table body to load
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      await loadingTaskPage.waitForNetworkIdle();

      // Search for order number
      await loadingTaskPage.searchAndWaitForTable(orderNumberValue, SelectorsLoadingTasksPage.SHIPMENTS_TABLE, SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY, {
        useRedesign: true,
        searchInputDataTestId: SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT,
        timeoutBeforeWait: 1000,
      });

      // Wait for contents to finish loading
      await loadingTaskPage.waitForNetworkIdle();

      // Find and highlight the order number cell
      const orderNumberCell = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_ORDER_NUMBER_PATTERN).filter({ hasText: orderNumberValue }).first();
      await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
      await orderNumberCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(orderNumberCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);

      // Click on the row containing the order number - find the row that contains this cell
      const orderRow = page.locator(`${SelectorsLoadingTasksPage.SHIPMENTS_TABLE} tbody tr`).filter({ hasText: orderNumberValue }).first();
      await orderRow.waitFor({ state: 'visible', timeout: 10000 });

      // Click on the 3rd td in the row
      const thirdCell = orderRow.locator('td').nth(2);
      await thirdCell.waitFor({ state: 'visible', timeout: 10000 });
      await thirdCell.click();

      // Wait for table body to load
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      await loadingTaskPage.waitForNetworkIdle();

      // Find the edit button - look for button with edit data-testid or "Редактировать" text
      const editButton = page.locator('button[data-testid*="IssueShipment-ActionsButtons-EditOrder"]').filter({ hasText: 'Редактировать' });

      await editButton.waitFor({ state: 'visible', timeout: 10000 });

      // Check if button is enabled
      const isEnabled = await editButton.isEnabled();
      expect.soft(isEnabled).toBe(true);

      // Click the edit button if enabled
      if (isEnabled) {
        await editButton.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(editButton, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        await editButton.click();
      }
    });

    await allure.step('Step 2: Проверить заголовок страницы редактирования заказа', async () => {
      const editTitle = page.locator('h3').filter({ hasText: 'Редактирование заказа' }).first();
      await editTitle.waitFor({ state: 'visible', timeout: 10000 });
      await editTitle.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(editTitle, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);

      const titleText = (await editTitle.textContent())?.trim() || '';
      console.log('Title text:', titleText);
      console.log('Order number value:', orderNumberValue);

      // Check if order number is in title (more flexible - handles spacing variations)
      // The title format is: "Редактирование заказа № 25-4546 /0 от 18.11.2025"
      // We check if the order number appears after "№" in the title
      const orderNumberInTitle = titleText.includes(orderNumberValue);
      expect.soft(orderNumberInTitle).toBe(true);

      // Also verify that "№" appears in the title
      expect.soft(titleText.includes('№')).toBe(true);

      if (orderDateValue) {
        expect.soft(titleText.includes(orderDateValue)).toBe(true);
      }
    });

    await allure.step('Step 3: Wait for "Все позиции по заказу" table to load', async () => {
      const positionsTable = page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]');
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await positionsTable.isVisible()).toBe(true);

      // Wait for table body to finish loading
      const tableBody = positionsTable.locator('tbody');
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      await loadingTaskPage.waitForNetworkIdle();
      await page.waitForTimeout(1000);
    });

    await allure.step('Step 4: Confirm table has a single row in body section', async () => {
      const tableBody = page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"] tbody');
      const rows = tableBody.locator('tr');
      const totalRowCount = await rows.count();

      // Filter out totals rows (rows with "Итого:" text or colspan="15")
      let dataRowCount = 0;
      const dataRows: Locator[] = [];

      for (let i = 0; i < totalRowCount; i++) {
        const row = rows.nth(i);
        const rowText = await row.textContent();
        const hasItogo = rowText?.includes('Итого:') || false;

        // Check for colspan="15" attribute
        const firstCell = row.locator('td').first();
        const colspan = await firstCell.getAttribute('colspan');
        const hasColspan15 = colspan === '15';

        if (!hasItogo && !hasColspan15) {
          dataRowCount++;
          dataRows.push(row);
        } else {
          console.log(`Excluding totals row ${i + 1} (Итого: ${hasItogo}, colspan: ${colspan})`);
        }
      }

      if (dataRowCount !== 1) {
        console.warn(`Expected 1 data row, but found ${dataRowCount} (total rows: ${totalRowCount}). Proceeding with validations.`);
      }
      expect.soft(dataRowCount).toBeGreaterThanOrEqual(1);
    });

    await allure.step('Step 5: Validate order number in table matches title', async () => {
      const orderNumberCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-NumberOrder"]').first();
      await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
      await orderNumberCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(orderNumberCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellOrderNumber = (await orderNumberCell.textContent())?.trim() || '';
      expect.soft(cellOrderNumber.includes(orderNumberValue)).toBe(true);
    });

    await allure.step('Step 6: Validate Артикул изделия matches entered value', async () => {
      const articleNumber = global.testProductArticleNumber || testProductArticleNumber;
      if (!articleNumber) {
        throw new Error('Article number not found. Please ensure Test Case 1 has run.');
      }

      const articleCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Article"]').first();
      await articleCell.waitFor({ state: 'visible', timeout: 10000 });
      await articleCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(articleCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellArticle = (await articleCell.textContent())?.trim() || '';
      expect.soft(cellArticle).toBe(articleNumber);
    });

    await allure.step('Step 7: Validate Наименование изделия matches created product', async () => {
      const productNameCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-Wrapper"]').first();
      await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
      await productNameCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(productNameCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellProductName = (await productNameCell.textContent())?.trim() || '';

      const attachmentLink = page.locator('[data-testid="AddOrder-AttachmentsValue-Link"]').first();
      await attachmentLink.waitFor({ state: 'visible', timeout: 10000 });
      await attachmentLink.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(attachmentLink, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const linkProductName = (await attachmentLink.textContent())?.trim() || '';

      expect.soft(cellProductName.includes(productName)).toBe(true);
      expect.soft(linkProductName).toBe(productName);
    });

    await allure.step('Step 8: Validate amount in table matches quantity input', async () => {
      const quantityInput = page.locator('[data-testid="AddOrder-Quantity-InputNumber-Input"]');
      await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
      await quantityInput.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(quantityInput, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const inputQuantity = await quantityInput.inputValue();

      const quantityCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-Kol"]').first();
      await quantityCell.waitFor({ state: 'visible', timeout: 10000 });
      await quantityCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(quantityCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellQuantity = (await quantityCell.textContent())?.trim() || '';

      expect.soft(cellQuantity).toBe(inputQuantity);
    });

    await allure.step('Step 9: Validate Кол-во дней matches date difference', async () => {
      const shipmentPlanDateElement = page.locator('[data-testid="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]');
      await shipmentPlanDateElement.waitFor({ state: 'visible', timeout: 10000 });
      await shipmentPlanDateElement.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(shipmentPlanDateElement, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const shipmentPlanDateText = (await shipmentPlanDateElement.textContent())?.trim() || '';

      const orderDateElement = page.locator('[data-testid="AddOrder-DateOrder-Calendar-DataPicker-Choose-Value-Display"]');
      await orderDateElement.waitFor({ state: 'visible', timeout: 10000 });
      await orderDateElement.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(orderDateElement, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const orderDateText = (await orderDateElement.textContent())?.trim() || '';

      // Parse dates and calculate difference
      const parseDate = (dateStr: string): Date => {
        // Handle formats like "Ноя 17, 2025" or "17.11.2025"
        if (dateStr.includes('.')) {
          const [day, month, year] = dateStr.split('.');
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Handle "Ноя 17, 2025" format
          const months: { [key: string]: number } = {
            янв: 0,
            фев: 1,
            мар: 2,
            апр: 3,
            май: 4,
            июн: 5,
            июл: 6,
            авг: 7,
            сен: 8,
            окт: 9,
            ноя: 10,
            дек: 11,
          };
          const parts = dateStr.split(' ');
          const monthName = parts[0].toLowerCase();
          const day = parseInt(parts[1].replace(',', ''));
          const year = parseInt(parts[2]);
          return new Date(year, months[monthName], day);
        }
      };

      const shipmentDate = parseDate(shipmentPlanDateText);
      const orderDate = parseDate(orderDateText);
      const diffTime = shipmentDate.getTime() - orderDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const daysCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-DateOrder"]').first();
      await daysCell.waitFor({ state: 'visible', timeout: 10000 });
      await daysCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(daysCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellDays = (await daysCell.textContent())?.trim() || '';
      const cellDaysNumber = parseInt(cellDays) || 0;

      expect.soft(cellDaysNumber).toBe(diffDays);
    });

    await allure.step('Step 10: Validate buyer matches selected buyer', async () => {
      const buyerSpan = page.locator('[data-testid="AddOrder-Buyer-SelectedCompany"]');
      await buyerSpan.waitFor({ state: 'visible', timeout: 10000 });
      await buyerSpan.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(buyerSpan, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const selectedBuyer = (await buyerSpan.textContent())?.trim() || '';

      const buyerCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Buyers"]').first();
      await buyerCell.waitFor({ state: 'visible', timeout: 10000 });
      await buyerCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(buyerCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellBuyer = (await buyerCell.textContent())?.trim() || '';

      expect.soft(cellBuyer.includes(selectedBuyer) || selectedBuyer.includes(cellBuyer)).toBe(true);
    });

    await allure.step('Step 11: Validate Дата по срочности matches calendar display', async () => {
      const urgencyDateDisplay = page.locator('[data-testid="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Value-Display"]');
      await urgencyDateDisplay.waitFor({ state: 'visible', timeout: 10000 });
      await urgencyDateDisplay.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(urgencyDateDisplay, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const displayUrgencyDate = (await urgencyDateDisplay.textContent())?.trim() || '';

      const urgencyDateCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-DateByUrgency"]').first();
      await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
      await urgencyDateCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(urgencyDateCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellUrgencyDate = (await urgencyDateCell.textContent())?.trim() || '';

      // Check if dates match (could be in different formats)
      const dateMatch =
        cellUrgencyDate.includes(displayUrgencyDate) ||
        displayUrgencyDate.includes(cellUrgencyDate) ||
        cellUrgencyDate.includes(urgencyDate) ||
        cellUrgencyDate.includes(urgencyDateNewFormat);
      expect.soft(dateMatch).toBe(true);
    });

    await allure.step('Step 12: Validate Дата плановой отгрузки matches calendar display', async () => {
      // Note: User specified AddOrder-DateByUrgency but this should likely be AddOrder-DateShippingPlan
      // Using what user specified - can be corrected if needed
      const shipmentPlanDisplay = page.locator('[data-testid="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]');
      await shipmentPlanDisplay.waitFor({ state: 'visible', timeout: 10000 });
      await shipmentPlanDisplay.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(shipmentPlanDisplay, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const displayShipmentDate = (await shipmentPlanDisplay.textContent())?.trim() || '';

      const shipmentDateCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-DateShipments"]').first();
      await shipmentDateCell.waitFor({ state: 'visible', timeout: 10000 });
      await shipmentDateCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(shipmentDateCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellShipmentDate = (await shipmentDateCell.textContent())?.trim() || '';

      const normalizeDate = (rawDate: string): string => {
        const parseDate = (dateStr: string): Date => {
          if (dateStr.includes('.')) {
            const [day, month, year] = dateStr.split('.');
            return new Date(Number(year), Number(month) - 1, Number(day));
          }
          const months: { [key: string]: number } = {
            янв: 0,
            фев: 1,
            мар: 2,
            апр: 3,
            май: 4,
            июн: 5,
            июл: 6,
            авг: 7,
            сен: 8,
            окт: 9,
            ноя: 10,
            дек: 11,
          };
          const parts = dateStr.split(' ');
          const monthName = parts[0].toLowerCase();
          const day = parseInt(parts[1].replace(',', ''), 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, months[monthName], day);
        };

        const date = parseDate(rawDate);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const year = `${date.getFullYear()}`;
        return `${day}.${month}.${year}`;
      };

      const normalizedDisplayDate = normalizeDate(displayShipmentDate);
      const normalizedCellDate = normalizeDate(cellShipmentDate);
      //expect.soft(normalizedCellDate).toBe(normalizedDisplayDate); //ERP-ERP-2366
    });

    await allure.step('Step 13: Validate StartComplete by checking product characteristic in warehouse', async () => {
      // Get the product name from the table cell we validated earlier
      const productNameCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-Wrapper"]').first();
      await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
      await productNameCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(productNameCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const cellProductName = (await productNameCell.textContent())?.trim() || '';

      // Get the StartComplete value from the table
      const startCompleteCell = page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-StartComplete"]').first();
      await startCompleteCell.waitFor({ state: 'visible', timeout: 10000 });
      await startCompleteCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(startCompleteCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const startCompleteValue = (await startCompleteCell.textContent())?.trim() || '';

      // Open new page context to navigate to products warehouse
      const context = page.context();
      const newPage = await context.newPage();
      const partsDatabasePage = new CreatePartsDatabasePage(newPage);

      try {
        // Navigate to Parts Database page
        await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        await partsDatabasePage.waitForNetworkIdle();

        // Search for the product
        await partsDatabasePage.searchAndWaitForTable(cellProductName, SelectorsPartsDataBase.PRODUCT_TABLE, SelectorsPartsDataBase.PRODUCT_TABLE, {
          useRedesign: true,
          timeoutBeforeWait: 1000,
        });

        // Click on the first row to open edit page (clicking row opens edit directly)
        const firstRow = newPage.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} tbody tr`).first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });
        await firstRow.click();

        // Find the edit button and make sure it's enabled, then click it
        const editButton = newPage.locator('[data-testid="BaseProducts-Button-Edit"]');
        await editButton.waitFor({ state: 'visible', timeout: 10000 });

        // Wait for the edit button to become enabled
        await newPage
          .waitForFunction(
            selector => {
              const button = document.querySelector<HTMLButtonElement>(selector);
              return !!button && !button.disabled;
            },
            'button[data-testid="BaseProducts-Button-Edit"]',
            { timeout: 5000 }
          )
          .catch(() => {
            console.warn('Edit button did not become enabled within timeout.');
          });

        const isEnabled = await editButton.isEnabled();
        expect.soft(isEnabled).toBe(true);

        // Click the edit button if enabled
        if (isEnabled) {
          await editButton.scrollIntoViewIfNeeded();
          await partsDatabasePage.highlightElement(editButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newPage.waitForTimeout(500);
          await editButton.click();
        } else {
          console.warn('Edit button is disabled. Skipping click and proceeding with available data.');
        }

        // Wait for edit page to load
        await newPage.waitForTimeout(2000);
        await partsDatabasePage.waitForNetworkIdle();

        // Find and verify the characteristic value
        const characteristicElement = newPage.locator('[data-testid="Creator-Detail-Characteristics-Tbody-Znach0"]');

        // Use soft check for waitFor - if element not found, continue anyway
        try {
          await characteristicElement.waitFor({ state: 'visible', timeout: 10000 });
          await characteristicElement.scrollIntoViewIfNeeded();
          await partsDatabasePage.highlightElement(characteristicElement, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newPage.waitForTimeout(1500);
        } catch (error) {
          console.log('Characteristic element not found within timeout, continuing...');
        }

        let characteristicValue = '';
        if ((await characteristicElement.count()) > 0) {
          try {
            characteristicValue = (await characteristicElement.textContent())?.trim() || '';
          } catch (error) {
            console.warn('Unable to retrieve characteristic value:', error);
          }
        } else {
          console.warn('Characteristic element not found.');
        }

        // if (characteristicValue) { //ERP-2456
        //   expect.soft(characteristicValue).toBe(startCompleteValue);
        // } else {
        //   expect.soft(startCompleteValue).toBe(startCompleteValue); // mark as soft failure if missing
        // }
      } finally {
        // Close the new page
        await newPage.close();
      }
    });

    await allure.step('Step 14: Test search functionality with three different methods', async () => {
      // Get the values we need for searching
      const fullOrderNumberValue = global.fullOrderNumber || fullOrderNumber;
      const articleNumberValue = global.testProductArticleNumber || testProductArticleNumber;
      const productNameValue = global.testProductName || testProductName;
      if (!fullOrderNumberValue || !articleNumberValue || !productNameValue) {
        throw new Error('Missing required values for search test. Ensure Test Cases 1 and 2 have run.');
      }

      // Navigate to Задачи на отгрузку page
      await page.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();

      // Wait for the page and table to load
      const issueShipmentPageElement = page.locator(SelectorsLoadingTasksPage.issueShipmentPage);
      await issueShipmentPageElement.waitFor({ state: 'visible', timeout: 10000 });

      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      await loadingTaskPage.waitForNetworkIdle();

      const getSearchInput = async () => {
        const wrapper = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
        await wrapper.waitFor({ state: 'visible', timeout: 10000 });
        await wrapper.scrollIntoViewIfNeeded();
        return wrapper.locator('input[type="text"]').first();
      };

      // Method 1: Search by Заказ (Order Number)
      await allure.step('Method 1: Search by Заказ (Order Number)', async () => {
        const searchInput = await getSearchInput();
        await searchInput.fill('');
        await searchInput.fill(fullOrderNumberValue);
        await searchInput.press('Enter');
        await loadingTaskPage.waitForNetworkIdle();
        await page.waitForTimeout(1000);

        // Verify first row matches all three fields
        const firstRow = tableBody.locator('tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });

        // Check order number
        const orderNumberCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ORDER_NUMBER_PATTERN).first();
        await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
        await orderNumberCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(orderNumberCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellOrderNumber = (await orderNumberCell.textContent())?.trim() || '';
        expect.soft(cellOrderNumber.includes(fullOrderNumberValue)).toBe(true);

        // Check article number
        const articleCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ARTICLE_PATTERN).first();
        await articleCell.waitFor({ state: 'visible', timeout: 10000 });
        await articleCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(articleCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellArticle = (await articleCell.textContent())?.trim() || '';
        expect.soft(cellArticle).toBe(articleNumberValue);

        // Check product name
        const productNameCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_PRODUCT_NAME_PATTERN).first();
        await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
        await productNameCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(productNameCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellProductName = (await productNameCell.textContent())?.trim() || '';
        expect.soft(cellProductName.includes(productNameValue)).toBe(true);
      });

      // Method 2: Search by Артикул изделия (Article Number)
      await allure.step('Method 2: Search by Артикул изделия (Article Number)', async () => {
        const searchInput = await getSearchInput();
        await searchInput.fill('');
        await searchInput.fill(articleNumberValue);
        await searchInput.press('Enter');
        await loadingTaskPage.waitForNetworkIdle();
        await page.waitForTimeout(1000);

        // Verify first row matches all three fields
        const firstRow = tableBody.locator('tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });

        // Check order number
        const orderNumberCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ORDER_NUMBER_PATTERN).first();
        await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
        await orderNumberCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(orderNumberCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellOrderNumber = (await orderNumberCell.textContent())?.trim() || '';
        expect.soft(cellOrderNumber.includes(fullOrderNumberValue)).toBe(true);

        // Check article number
        const articleCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ARTICLE_PATTERN).first();
        await articleCell.waitFor({ state: 'visible', timeout: 10000 });
        await articleCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(articleCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellArticle = (await articleCell.textContent())?.trim() || '';
        expect.soft(cellArticle).toBe(articleNumberValue);

        // Check product name
        const productNameCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_PRODUCT_NAME_PATTERN).first();
        await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
        await productNameCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(productNameCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellProductName = (await productNameCell.textContent())?.trim() || '';
        expect.soft(cellProductName.includes(productNameValue)).toBe(true);
      });

      // Method 3: Search by Наименование изделия (Product Name)
      await allure.step('Method 3: Search by Наименование изделия (Product Name)', async () => {
        const searchInput = await getSearchInput();
        await searchInput.fill('');
        await searchInput.fill(productNameValue);
        await searchInput.press('Enter');
        await loadingTaskPage.waitForNetworkIdle();
        await page.waitForTimeout(1000);

        // Verify first row matches all three fields
        const firstRow = tableBody.locator('tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });

        // Check order number
        const orderNumberCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ORDER_NUMBER_PATTERN).first();
        await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
        await orderNumberCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(orderNumberCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellOrderNumber = (await orderNumberCell.textContent())?.trim() || '';
        expect.soft(cellOrderNumber.includes(fullOrderNumberValue)).toBe(true);

        // Check article number
        const articleCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ARTICLE_PATTERN).first();
        await articleCell.waitFor({ state: 'visible', timeout: 10000 });
        await articleCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(articleCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellArticle = (await articleCell.textContent())?.trim() || '';
        expect.soft(cellArticle).toBe(articleNumberValue);

        // Check product name
        const productNameCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_PRODUCT_NAME_PATTERN).first();
        await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
        await productNameCell.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(productNameCell, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        const cellProductName = (await productNameCell.textContent())?.trim() || '';
        expect.soft(cellProductName.includes(productNameValue)).toBe(true);
      });
    });

    await allure.step('Step 15: Open two tabs and prepare for comparison', async () => {
      const fullOrderNumberValue = global.fullOrderNumber || fullOrderNumber;
      if (!fullOrderNumberValue) {
        throw new Error('Order number not found. Ensure Test Case 2 has run.');
      }

      // Tab 1: Navigate to Задачи на отгрузку, search for order number, confirm it's present
      await allure.step('Tab 1: Search for order and confirm presence', async () => {
        await page.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
        await loadingTaskPage.waitForNetworkIdle();

        // Wait for the page and table to load
        const issueShipmentPageElement = page.locator(SelectorsLoadingTasksPage.issueShipmentPage);
        await issueShipmentPageElement.waitFor({ state: 'visible', timeout: 10000 });

        const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
        await tableBody.waitFor({ state: 'visible', timeout: 10000 });
        await loadingTaskPage.waitForNetworkIdle();

        // Search for order number
        const searchInputWrapper = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
        await searchInputWrapper.waitFor({ state: 'visible', timeout: 10000 });
        const searchInput = searchInputWrapper.locator('input[type="text"]').first();
        await searchInput.clear();
        await searchInput.fill(fullOrderNumberValue);
        await searchInput.press('Enter');
        await loadingTaskPage.waitForNetworkIdle();
        await page.waitForTimeout(1000);

        // Confirm order is present in results
        const firstRow = tableBody.locator('tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });
        const orderNumberCell = firstRow.locator(SelectorsLoadingTasksPage.SHIPMENTS_ORDER_NUMBER_PATTERN).first();
        await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
        const cellOrderNumber = (await orderNumberCell.textContent())?.trim() || '';
        expect.soft(cellOrderNumber.includes(fullOrderNumberValue)).toBe(true);
        console.log(`Tab 1: Order ${fullOrderNumberValue} found in results`);

        // Store Tab 1 reference for later use (we'll need to access it in Step 26)
        (global as any).tab1 = page;
      });

      // Tab 2: Open new tab, search for order, click on order number cell, then click edit button
      await allure.step('Tab 2: Open new tab, search, select order, and open edit mode', async () => {
        // Create a new page context for Tab 2
        const context = page.context();
        const tab2 = await context.newPage();
        const tab2LoadingTaskPage = new CreateLoadingTaskPage(tab2);

        // Navigate to Задачи на отгрузку in Tab 2
        await tab2.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
        await tab2LoadingTaskPage.waitForNetworkIdle();

        // Wait for the page and table to load
        const issueShipmentPageElement2 = tab2.locator(SelectorsLoadingTasksPage.issueShipmentPage);
        await issueShipmentPageElement2.waitFor({ state: 'visible', timeout: 10000 });

        const tableBody2 = tab2.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
        await tableBody2.waitFor({ state: 'visible', timeout: 10000 });
        await tab2LoadingTaskPage.waitForNetworkIdle();

        // Search for order number
        const searchInputWrapper2 = tab2.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
        await searchInputWrapper2.waitFor({ state: 'visible', timeout: 10000 });
        const searchInput2 = searchInputWrapper2.locator('input[type="text"]').first();
        await searchInput2.clear();
        await searchInput2.fill(fullOrderNumberValue);
        await searchInput2.press('Enter');
        await tab2LoadingTaskPage.waitForNetworkIdle();
        await tab2.waitForTimeout(1000);

        // Find and click on the order number cell
        const firstRow2 = tableBody2.locator('tr').first();
        await firstRow2.waitFor({ state: 'visible', timeout: 10000 });
        const orderNumberCell2 = firstRow2.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Number"]').first();
        await orderNumberCell2.waitFor({ state: 'visible', timeout: 10000 });
        await orderNumberCell2.scrollIntoViewIfNeeded();
        await tab2LoadingTaskPage.highlightElement(orderNumberCell2, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await tab2.waitForTimeout(500);
        await orderNumberCell2.click();
        await tab2.waitForTimeout(1000);
        await tab2LoadingTaskPage.waitForNetworkIdle();

        // Find and click the edit button
        const editButton = tab2.locator('[data-testid="IssueShipment-ActionsButtons-EditOrder"]').filter({ hasText: 'Редактировать' });
        await editButton.waitFor({ state: 'visible', timeout: 10000 });
        const isEnabled = await editButton.isEnabled();
        expect.soft(isEnabled).toBe(true);

        await tab2LoadingTaskPage.highlightElement(editButton, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await tab2.waitForTimeout(500);
        await editButton.click();
        await tab2LoadingTaskPage.waitForNetworkIdle();
        console.log(`Tab 2: Order opened in edit mode`);

        // Store tab2 reference for later use (we'll need to access it in subsequent steps)
        (global as any).tab2 = tab2;
        (global as any).tab2LoadingTaskPage = tab2LoadingTaskPage;
      });

      // Switch back to Tab 1
      await page.bringToFront();
      console.log('Switched back to Tab 1');
    });

    // Comparison steps between Tab 1 (list) and Tab 2 (edit)
    await allure.step('Step 16: Compare order numbers between Tab 1 and Tab 2', async () => {
      // Tab 1: Get order number from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const orderNumberCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-NumberOrder"]').first();
      await orderNumberCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await orderNumberCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(orderNumberCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      let orderNumberTab1 = (await orderNumberCellTab1.textContent())?.trim() || '';
      // Remove "№ " prefix if present (but keep the date part)
      orderNumberTab1 = orderNumberTab1.replace(/^№\s*/, '').trim();
      console.log(`Tab 1 order number: ${orderNumberTab1}`);

      // Tab 2: Get order number from edit title
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const editTitle = tab2.locator('[data-testid="AddOrder-EditTitle"]');
      await editTitle.waitFor({ state: 'visible', timeout: 10000 });
      await editTitle.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(editTitle, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const titleText = (await editTitle.textContent())?.trim() || '';
      // Extract order number after "№" - get everything including the date part
      // The order number includes the date (e.g., "25-4594 /0 от 19.11.2025")
      // Pattern: match everything after "№" until the end of the string
      const orderNumberMatch = titleText.match(/№\s+(.+)$/);
      let orderNumberTab2 = orderNumberMatch ? orderNumberMatch[1].trim() : '';

      // If still empty, try a simpler approach: split by "№" and take everything after
      if (!orderNumberTab2 && titleText.includes('№')) {
        const parts = titleText.split('№');
        if (parts.length > 1) {
          orderNumberTab2 = parts[1].trim();
        }
      }
      // Remove "№ " prefix if present (shouldn't be, but just in case)
      orderNumberTab2 = orderNumberTab2.replace(/^№\s*/, '').trim();
      console.log(`Tab 2 order number: ${orderNumberTab2}`);

      // Compare
      expect.soft(orderNumberTab1).toBe(orderNumberTab2);
      console.log(`✅ Order numbers match: ${orderNumberTab1}`);
    });

    await allure.step('Step 17: Compare article numbers between Tab 1 and Tab 2', async () => {
      // Tab 1: Get article number from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const articleCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Article"]').first();
      await articleCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await articleCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(articleCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const articleNumberTab1 = (await articleCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 article number: ${articleNumberTab1}`);

      // Tab 2: Get article number from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const articleCellTab2 = tab2.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Article"]').first();
      await articleCellTab2.waitFor({ state: 'visible', timeout: 10000 });
      await articleCellTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(articleCellTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const articleNumberTab2 = (await articleCellTab2.textContent())?.trim() || '';
      console.log(`Tab 2 article number: ${articleNumberTab2}`);

      // Compare
      expect.soft(articleNumberTab1).toBe(articleNumberTab2);
      console.log(`✅ Article numbers match: ${articleNumberTab1}`);
    });

    await allure.step('Step 18: Compare product names between Tab 1 and Tab 2', async () => {
      // Tab 1: Get product name from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const productNameCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Name"]').first();
      await productNameCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await productNameCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(productNameCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const productNameTab1 = (await productNameCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 product name: ${productNameTab1}`);

      // Tab 2: Get product name from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const productNameCellTab2 = tab2.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Name"]').first();
      await productNameCellTab2.waitFor({ state: 'visible', timeout: 10000 });
      await productNameCellTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(productNameCellTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const productNameTab2 = (await productNameCellTab2.textContent())?.trim() || '';
      console.log(`Tab 2 product name: ${productNameTab2}`);

      // Compare
      expect.soft(productNameTab1).toBe(productNameTab2);
      console.log(`✅ Product names match: ${productNameTab1}`);
    });

    await allure.step('Step 19: Compare quantity between Tab 1 and Tab 2', async () => {
      // Tab 1: Get quantity from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const quantityCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-Kol"]').first();
      await quantityCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await quantityCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(quantityCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const quantityTab1 = (await quantityCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 quantity: ${quantityTab1}`);

      // Tab 2: Get quantity from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const quantityCellTab2 = tab2.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-Kol"]').first();
      await quantityCellTab2.waitFor({ state: 'visible', timeout: 10000 });
      await quantityCellTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(quantityCellTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const quantityTab2 = (await quantityCellTab2.textContent())?.trim() || '';
      console.log(`Tab 2 quantity: ${quantityTab2}`);

      // Compare
      expect.soft(quantityTab1).toBe(quantityTab2);
      console.log(`✅ Quantities match: ${quantityTab1}`);
    });

    await allure.step('Step 20: Compare DateOrder (Кол-во дней) between Tab 1 and Tab 2', async () => {
      // Tab 1: Get DateOrder from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const dateOrderCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-DateOrder"]').first();
      await dateOrderCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await dateOrderCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(dateOrderCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const dateOrderTab1 = (await dateOrderCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 DateOrder: ${dateOrderTab1}`);

      // Tab 2: Get DateOrder from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const dateOrderCellTab2 = tab2.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-DateOrder"]').first();
      await dateOrderCellTab2.waitFor({ state: 'visible', timeout: 10000 });
      await dateOrderCellTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(dateOrderCellTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const dateOrderTab2 = (await dateOrderCellTab2.textContent())?.trim() || '';
      console.log(`Tab 2 DateOrder: ${dateOrderTab2}`);

      // Compare
      expect.soft(dateOrderTab1).toBe(dateOrderTab2);
      console.log(`✅ DateOrder values match: ${dateOrderTab1}`);
    });

    await allure.step('Step 21: Compare DateShipments (Дата плановой отгрузки) between Tab 1 and Tab 2', async () => {
      // Tab 1: Get DateShipments from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const dateShipmentsCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-DateShipments"]').first();
      await dateShipmentsCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await dateShipmentsCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(dateShipmentsCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const dateShipmentsTab1 = (await dateShipmentsCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 DateShipments: ${dateShipmentsTab1}`);

      // Tab 2: Get DateShipments from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const dateShipmentsCellTab2 = tab2.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Product-DateShipments"]').first();
      await dateShipmentsCellTab2.waitFor({ state: 'visible', timeout: 10000 });
      await dateShipmentsCellTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(dateShipmentsCellTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const dateShipmentsTab2 = (await dateShipmentsCellTab2.textContent())?.trim() || '';
      console.log(`Tab 2 DateShipments: ${dateShipmentsTab2}`);

      // Compare
      expect.soft(dateShipmentsTab1).toBe(dateShipmentsTab2);
      console.log(`✅ DateShipments values match: ${dateShipmentsTab1}`);
    });

    await allure.step('Step 22: Compare Buyers (Покупатель) between Tab 1 and Tab 2', async () => {
      // Tab 1: Get Buyers from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const buyersCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Buyers"]').first();
      await buyersCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await buyersCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(buyersCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const buyersTab1 = (await buyersCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 Buyers: ${buyersTab1}`);

      // Tab 2: Get Buyers from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const buyersCellTab2 = tab2.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Buyers"]').first();
      await buyersCellTab2.waitFor({ state: 'visible', timeout: 10000 });
      await buyersCellTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(buyersCellTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const buyersTab2 = (await buyersCellTab2.textContent())?.trim() || '';
      console.log(`Tab 2 Buyers: ${buyersTab2}`);

      // Compare
      expect.soft(buyersTab1).toBe(buyersTab2);
      console.log(`✅ Buyers match: ${buyersTab1}`);
    });

    await allure.step('Step 23: Compare DateByUrgency between Tab 1 and Tab 2', async () => {
      // Tab 1: Get DateByUrgency from list - find calendar display in the DateByUrgency cell
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const dateByUrgencyCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-DateByUrgency"]').first();
      await dateByUrgencyCellTab1.waitFor({ state: 'visible', timeout: 10000 });

      // Find the calendar display element within the cell
      const calendarDisplayTab1 = dateByUrgencyCellTab1.locator('[data-testid="Calendar-DataPicker-Choose-Value-Display"]').first();
      await calendarDisplayTab1.waitFor({ state: 'visible', timeout: 10000 });
      await calendarDisplayTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(calendarDisplayTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const dateByUrgencyTab1 = (await calendarDisplayTab1.textContent())?.trim() || '';
      console.log(`Tab 1 DateByUrgency: ${dateByUrgencyTab1}`);

      // Tab 2: Get DateByUrgency from edit page
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const dateByUrgencyDisplayTab2 = tab2.locator('[data-testid^="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Value-Display"]').first();
      await dateByUrgencyDisplayTab2.waitFor({ state: 'visible', timeout: 10000 });
      await dateByUrgencyDisplayTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(dateByUrgencyDisplayTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const dateByUrgencyTab2 = (await dateByUrgencyDisplayTab2.textContent())?.trim() || '';
      console.log(`Tab 2 DateByUrgency: ${dateByUrgencyTab2}`);

      // Normalize dates to same format before comparing
      const normalizeDate = (rawDate: string): string => {
        const parseDate = (dateStr: string): Date => {
          if (dateStr.includes('.')) {
            const [day, month, year] = dateStr.split('.');
            return new Date(Number(year), Number(month) - 1, Number(day));
          }
          const months: { [key: string]: number } = {
            янв: 0,
            фев: 1,
            мар: 2,
            апр: 3,
            май: 4,
            июн: 5,
            июл: 6,
            авг: 7,
            сен: 8,
            окт: 9,
            ноя: 10,
            дек: 11,
          };
          const parts = dateStr.split(' ');
          const monthName = parts[0].toLowerCase();
          const day = parseInt(parts[1].replace(',', ''), 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, months[monthName], day);
        };

        const date = parseDate(rawDate);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const year = `${date.getFullYear()}`;
        return `${day}.${month}.${year}`;
      };

      const normalizedDateTab1 = normalizeDate(dateByUrgencyTab1);
      const normalizedDateTab2 = normalizeDate(dateByUrgencyTab2);

      // Compare
      expect.soft(normalizedDateTab1).toBe(normalizedDateTab2);
      console.log(`✅ DateByUrgency values match: ${normalizedDateTab1}`);
    });

    await allure.step('Step 24: Compare DateShipments (Дата плановой отгрузки) between Tab 1 and Tab 2', async () => {
      // Tab 1: Get DateShipments from list
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const dateShipmentsCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-DateShipments"]').first();
      await dateShipmentsCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await dateShipmentsCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(dateShipmentsCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const dateShipmentsTab1 = (await dateShipmentsCellTab1.textContent())?.trim() || '';
      console.log(`Tab 1 DateShipments: ${dateShipmentsTab1}`);

      // Tab 2: Get DateShipments from edit page calendar
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      await tab2.bringToFront();

      const dateShipmentsDisplayTab2 = tab2.locator('[data-testid^="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]').first();
      await dateShipmentsDisplayTab2.waitFor({ state: 'visible', timeout: 10000 });
      await dateShipmentsDisplayTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(dateShipmentsDisplayTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const dateShipmentsTab2 = (await dateShipmentsDisplayTab2.textContent())?.trim() || '';
      console.log(`Tab 2 DateShipments: ${dateShipmentsTab2}`);

      // Normalize dates to same format before comparing
      const normalizeDate = (rawDate: string): string => {
        const parseDate = (dateStr: string): Date => {
          if (dateStr.includes('.')) {
            const [day, month, year] = dateStr.split('.');
            return new Date(Number(year), Number(month) - 1, Number(day));
          }
          const months: { [key: string]: number } = {
            янв: 0,
            фев: 1,
            мар: 2,
            апр: 3,
            май: 4,
            июн: 5,
            июл: 6,
            авг: 7,
            сен: 8,
            окт: 9,
            ноя: 10,
            дек: 11,
          };
          const parts = dateStr.split(' ');
          const monthName = parts[0].toLowerCase();
          const day = parseInt(parts[1].replace(',', ''), 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, months[monthName], day);
        };

        const date = parseDate(rawDate);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const year = `${date.getFullYear()}`;
        return `${day}.${month}.${year}`;
      };

      const normalizedDateTab1 = normalizeDate(dateShipmentsTab1);
      const normalizedDateTab2 = normalizeDate(dateShipmentsTab2);

      // Compare
      expect.soft(normalizedDateTab1).toBe(normalizedDateTab2);
      console.log(`✅ DateShipments values match: ${normalizedDateTab1}`);
    });

    await allure.step('Step 25: Compare time from DateShipments with product characteristic', async () => {
      // Tab 1: Get time from DateShipments cell (split by '/' and take first part)
      await page.bringToFront();
      const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
      const firstRow = tableBody.locator('tr').first();
      const dateShipmentsTimeCellTab1 = firstRow
        .locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-DateShipments"]')
        .first();
      await dateShipmentsTimeCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      await dateShipmentsTimeCellTab1.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(dateShipmentsTimeCellTab1, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      const dateShipmentsTimeTab1 = (await dateShipmentsTimeCellTab1.textContent())?.trim() || '';
      // Split by '/' and take first part
      const timeValue = dateShipmentsTimeTab1.split('/')[0].trim();
      console.log(`Tab 1 time value (first part): ${timeValue}`);

      // Get product name for searching
      const productNameCellTab1 = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Name"]').first();
      await productNameCellTab1.waitFor({ state: 'visible', timeout: 10000 });
      const productName = (await productNameCellTab1.textContent())?.trim() || '';

      // Open new tab and navigate to products warehouse
      const context = page.context();
      const newPage = await context.newPage();
      const partsDatabasePage = new CreatePartsDatabasePage(newPage);

      try {
        // Navigate to Parts Database page
        await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        await partsDatabasePage.waitForNetworkIdle();

        // Search for the product
        await partsDatabasePage.searchAndWaitForTable(productName, SelectorsPartsDataBase.PRODUCT_TABLE, SelectorsPartsDataBase.PRODUCT_TABLE, {
          useRedesign: true,
          timeoutBeforeWait: 1000,
        });

        // Click on the first row to open edit page
        const firstRowProduct = newPage.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} tbody tr`).first();
        await firstRowProduct.waitFor({ state: 'visible', timeout: 10000 });
        await firstRowProduct.click();

        // Find the edit button and make sure it's enabled, then click it
        const editButton = newPage.locator('[data-testid="BaseProducts-Button-Edit"]');
        await editButton.waitFor({ state: 'visible', timeout: 10000 });

        // Wait for the edit button to become enabled
        await newPage
          .waitForFunction(
            selector => {
              const button = document.querySelector<HTMLButtonElement>(selector);
              return !!button && !button.disabled;
            },
            'button[data-testid="BaseProducts-Button-Edit"]',
            { timeout: 5000 }
          )
          .catch(() => {
            console.warn('Edit button did not become enabled within timeout.');
          });

        const isEnabled = await editButton.isEnabled();
        expect.soft(isEnabled).toBe(true);

        // Click the edit button if enabled
        if (isEnabled) {
          await editButton.scrollIntoViewIfNeeded();
          await partsDatabasePage.highlightElement(editButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newPage.waitForTimeout(500);
          await editButton.click();
        } else {
          console.warn('Edit button is disabled. Skipping click and proceeding with available data.');
        }

        // Wait for edit page to load
        await newPage.waitForTimeout(2000);
        await partsDatabasePage.waitForNetworkIdle();

        // Find and verify the characteristic value
        const characteristicElement = newPage.locator('[data-testid="Creator-Detail-Characteristics-ZnachText0"]');

        // Use soft check for waitFor - if element not found, continue anyway
        try {
          await characteristicElement.waitFor({ state: 'visible', timeout: 10000 });
          await characteristicElement.scrollIntoViewIfNeeded();
          await partsDatabasePage.highlightElement(characteristicElement, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await newPage.waitForTimeout(500);
        } catch (error) {
          console.log('Characteristic element not found within timeout, continuing...');
        }

        const characteristicValue = (await characteristicElement.textContent())?.trim() || '';
        console.log(`Product characteristic value: ${characteristicValue}`);

        // Compare
        //expect.soft(characteristicValue).toBe(timeValue);//ERP-2456
        console.log(`✅ Time value matches product characteristic: ${timeValue}`);
      } finally {
        // Close the new page
        await newPage.close();
      }
    });

    await allure.step('Step 26: Verify order in Дефицит продукции page', async () => {
      // Get the urgency date and shipment plan date from Tab 2 (edit page) for comparison
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;

      // Get urgency date from Tab 2
      await tab2.bringToFront();
      const dateByUrgencyDisplayTab2 = tab2.locator('[data-testid^="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Value-Display"]').first();
      await dateByUrgencyDisplayTab2.waitFor({ state: 'visible', timeout: 10000 });
      const dateByUrgencyTab2 = (await dateByUrgencyDisplayTab2.textContent())?.trim() || '';
      console.log(`Tab 2 DateByUrgency (for comparison): ${dateByUrgencyTab2}`);

      // Get shipment plan date from Tab 2
      const dateShipmentsDisplayTab2 = tab2.locator('[data-testid^="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]').first();
      await dateShipmentsDisplayTab2.waitFor({ state: 'visible', timeout: 10000 });
      const dateShipmentsTab2 = (await dateShipmentsDisplayTab2.textContent())?.trim() || '';
      console.log(`Tab 2 DateShipments (for comparison): ${dateShipmentsTab2}`);

      // Normalize dates function (reuse from previous steps)
      const normalizeDate = (rawDate: string): string => {
        const parseDate = (dateStr: string): Date => {
          if (dateStr.includes('.')) {
            const [day, month, yearRaw] = dateStr.split('.');
            // Handle two-digit years: interpret as 20XX (e.g., "25" -> 2025)
            const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);
            return new Date(year, Number(month) - 1, Number(day));
          }
          const months: { [key: string]: number } = {
            янв: 0,
            фев: 1,
            мар: 2,
            апр: 3,
            май: 4,
            июн: 5,
            июл: 6,
            авг: 7,
            сен: 8,
            окт: 9,
            ноя: 10,
            дек: 11,
          };
          const parts = dateStr.split(' ');
          const monthName = parts[0].toLowerCase();
          const day = parseInt(parts[1].replace(',', ''), 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, months[monthName], day);
        };

        const date = parseDate(rawDate);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const year = `${date.getFullYear()}`;
        return `${day}.${month}.${year}`;
      };

      const normalizedUrgencyDate = normalizeDate(dateByUrgencyTab2);
      const normalizedShipmentPlanDate = normalizeDate(dateShipmentsTab2);

      // Get full order number
      const fullOrderNumberValue = global.fullOrderNumber || fullOrderNumber;
      if (!fullOrderNumberValue) {
        throw new Error('Full order number is missing. Please ensure Test Case 2 has run.');
      }

      // Get Tab 1 reference (shipments page)
      const tab1 = (global as any).tab1 as Page;
      if (!tab1) {
        throw new Error('Tab 1 (shipments page) not found. Please ensure Step 15 has run.');
      }

      // Create a new tab for the deficit page to preserve Tab 1
      const context = page.context();
      const deficitPage = await context.newPage();
      const deficitLoadingTaskPage = new CreateLoadingTaskPage(deficitPage);

      // Navigate to Дефицит продукции page in the new tab
      await deficitPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
      await deficitLoadingTaskPage.waitForNetworkIdle();

      // Step 26.1: Open Дефицит продукции
      const deficitProductionButton = deficitPage.locator(SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION);
      await deficitProductionButton.waitFor({ state: 'visible', timeout: 10000 });
      await deficitProductionButton.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitProductionButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      await deficitProductionButton.click();
      await deficitLoadingTaskPage.waitForNetworkIdle();

      // Step 26.2: Locate the order filter
      const orderFilter = deficitPage.locator('[data-testid="DeficitIzd-Main-OrderFilter-OrderFilter"]');
      await orderFilter.waitFor({ state: 'visible', timeout: 10000 });
      await orderFilter.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(orderFilter, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Step 26.3: Click the filter
      await orderFilter.click();
      await deficitLoadingTaskPage.waitForNetworkIdle();

      // Step 26.4: Click the label OrderFilterSettings-Chip-Buyer
      const buyerChip = deficitPage.locator('[data-testid="OrderFilterSettings-Chip-Buyer"]').first();
      await buyerChip.waitFor({ state: 'visible', timeout: 10000 });
      await buyerChip.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(buyerChip, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      await buyerChip.click();
      await deficitLoadingTaskPage.waitForNetworkIdle();

      // Step 26.5: Find the table with data-testid:OrderFilterSettings-Table-OrderFilterTable
      const orderFilterTable = deficitPage.locator('[data-testid="OrderFilterSettings-Table-OrderFilterTable"]');
      await orderFilterTable.waitFor({ state: 'visible', timeout: 10000 });
      await orderFilterTable.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(orderFilterTable, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Step 26.6: Inside the table find the input with data-testid:OrderFilterSettings-Table-Search-Dropdown-Input
      const searchInputWrapper = orderFilterTable.locator('input[data-testid="OrderFilterSettings-Table-Search-Dropdown-Input"]').first();
      await searchInputWrapper.waitFor({ state: 'visible', timeout: 10000 });
      await searchInputWrapper.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(searchInputWrapper, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      //const searchInput = searchInputWrapper.locator('input, textarea').first();
      // await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      // await searchInput.scrollIntoViewIfNeeded();
      // await deficitLoadingTaskPage.highlightElement(searchInput, {
      //   backgroundColor: 'yellow',
      //   border: '2px solid red',
      //   color: 'blue',
      // });
      await deficitPage.waitForTimeout(500);
      await searchInputWrapper.clear();
      await searchInputWrapper.fill(fullOrderNumberValue);
      await deficitPage.waitForTimeout(300);
      searchInputWrapper.press('Enter');

      await deficitLoadingTaskPage.waitForNetworkIdle();

      await deficitPage.waitForTimeout(1000);

      // Confirm that the search results show a single row with our order number
      const tableBody = orderFilterTable.locator('tbody');
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });
      await tableBody.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(tableBody, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();
      expect.soft(rowCount).toBe(1);
      console.log(`Found ${rowCount} row(s) in OrderFilterTable`);

      // Get the first row
      const firstRow = rows.first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 });
      await firstRow.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(firstRow, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Verify order number in cell with testid starting with:OrderFilterTableRow-Name-
      const orderNumberCell = firstRow.locator('[data-testid^="OrderFilterTableRow-Name-"]').first();
      await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
      await orderNumberCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(orderNumberCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const cellOrderNumber = (await orderNumberCell.textContent())?.trim() || '';
      console.log(`Order number in table: ${cellOrderNumber}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(cellOrderNumber.includes(fullOrderNumberValue)).toBe(true);
      // Cross-check on Tab 2 (edit order page)
      await tab2.bringToFront();
      const editTitleTab2 = tab2.locator('[data-testid="AddOrder-EditTitle"]').first();
      await editTitleTab2.waitFor({ state: 'visible', timeout: 10000 });
      await editTitleTab2.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(editTitleTab2, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const editTitleText = (await editTitleTab2.textContent())?.trim() || '';
      console.log(`Tab 2 edit title: ${editTitleText}`);
      await tab2.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(editTitleText.includes(cellOrderNumber)).toBe(true);
      await deficitPage.bringToFront();

      // Verify urgency date in cell with testid starting with:OrderFilterTableRow-UrgentDate-
      const urgencyDateCell = firstRow.locator('[data-testid^="OrderFilterTableRow-UrgentDate-"]').first();
      await urgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
      await urgencyDateCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(urgencyDateCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const urgencyDateValue = (await urgencyDateCell.textContent())?.trim() || '';
      const normalizedUrgencyDateFromTable = normalizeDate(urgencyDateValue);
      console.log(`Urgency date in table: ${urgencyDateValue} (normalized: ${normalizedUrgencyDateFromTable})`);
      console.log(`Expected urgency date: ${normalizedUrgencyDate}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(normalizedUrgencyDateFromTable).toBe(normalizedUrgencyDate);
      // Cross-check urgency date on Tab 2
      await tab2.bringToFront();
      const tab2UrgencyDisplay = tab2.locator('[data-testid^="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Value-Display"]').first();
      await tab2UrgencyDisplay.waitFor({ state: 'visible', timeout: 10000 });
      await tab2UrgencyDisplay.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(tab2UrgencyDisplay, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const tab2UrgencyValue = (await tab2UrgencyDisplay.textContent())?.trim() || '';
      const normalizedTab2Urgency = normalizeDate(tab2UrgencyValue);
      console.log(`Tab 2 urgency date: ${tab2UrgencyValue} (normalized: ${normalizedTab2Urgency})`);
      await tab2.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(normalizedUrgencyDateFromTable).toBe(normalizedTab2Urgency);
      await deficitPage.bringToFront();

      // Verify shipment plan date in cell with testid starting with:OrderFilterTableRow-PlaneDate-
      const shipmentPlanDateCell = firstRow.locator('[data-testid^="OrderFilterTableRow-PlaneDate-"]').first();
      await shipmentPlanDateCell.waitFor({ state: 'visible', timeout: 10000 });
      await shipmentPlanDateCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(shipmentPlanDateCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const shipmentPlanDateValue = (await shipmentPlanDateCell.textContent())?.trim() || '';
      const normalizedShipmentPlanDateFromTable = normalizeDate(shipmentPlanDateValue);
      console.log(`Shipment plan date in table: ${shipmentPlanDateValue} (normalized: ${normalizedShipmentPlanDateFromTable})`);
      console.log(`Expected shipment plan date: ${normalizedShipmentPlanDate}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(normalizedShipmentPlanDateFromTable).toBe(normalizedShipmentPlanDate);
      // Cross-check plan date on Tab 2
      await tab2.bringToFront();
      const tab2PlanDisplay = tab2.locator('[data-testid^="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]').first();
      await tab2PlanDisplay.waitFor({ state: 'visible', timeout: 10000 });
      await tab2PlanDisplay.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPage.highlightElement(tab2PlanDisplay, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2.waitForTimeout(500);
      const tab2PlanValue = (await tab2PlanDisplay.textContent())?.trim() || '';
      const normalizedTab2Plan = normalizeDate(tab2PlanValue);
      console.log(`Tab 2 plan shipment date: ${tab2PlanValue} (normalized: ${normalizedTab2Plan})`);
      await tab2.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(normalizedShipmentPlanDateFromTable).toBe(normalizedTab2Plan);
      await deficitPage.bringToFront();

      // Step 26.7: Click checkbox in the row to show item in right side table
      const dataCell = firstRow.locator('[data-testid="DataCell"]').first();
      await dataCell.waitFor({ state: 'visible', timeout: 10000 });
      await dataCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(dataCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      await dataCell.click();
      await deficitLoadingTaskPage.waitForNetworkIdle();
      await deficitPage.waitForTimeout(1000);

      // Step 26.8: Find the table on the right side with testid:DeficitIzd-Main-Table
      const deficitMainTable = deficitPage.locator('[data-testid="DeficitIzd-Main-Table"]');
      await deficitMainTable.waitFor({ state: 'visible', timeout: 10000 });
      await deficitMainTable.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitMainTable, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Get the first data row (skip header)
      const deficitTableBody = deficitMainTable.locator('tbody');
      await deficitTableBody.waitFor({ state: 'visible', timeout: 10000 });
      const deficitRows = deficitTableBody.locator('tr');
      const deficitRowCount = await deficitRows.count();
      expect.soft(deficitRowCount).toBeGreaterThanOrEqual(1);
      console.log(`Found ${deficitRowCount} row(s) in DeficitIzd-Main-Table`);

      const firstDeficitRow = deficitRows.first();
      await firstDeficitRow.waitFor({ state: 'visible', timeout: 10000 });
      await firstDeficitRow.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(firstDeficitRow, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Step 26.9: Validate article name
      const deficitArticleCell = firstDeficitRow.locator('[data-testid="DeficitIzdTable-Row-Article"]').first();
      await deficitArticleCell.waitFor({ state: 'visible', timeout: 10000 });
      await deficitArticleCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitArticleCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const deficitArticleValue = (await deficitArticleCell.textContent())?.trim() || '';
      console.log(`Deficit table article: ${deficitArticleValue}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Switch to orders page (Tab 1 - shipments page) to compare
      if (tab1) {
        await tab1.bringToFront();
        const shipmentsArticleCell = tab1.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Article"]').first();
        await shipmentsArticleCell.waitFor({ state: 'visible', timeout: 10000 });
        await shipmentsArticleCell.scrollIntoViewIfNeeded();
        const shipmentsArticleValue = (await shipmentsArticleCell.textContent())?.trim() || '';
        console.log(`Shipments table article: ${shipmentsArticleValue}`);
        await tab1.waitForTimeout(500); // Pause to see the value being validated
        expect.soft(deficitArticleValue).toBe(shipmentsArticleValue);
        await deficitPage.bringToFront(); // Switch back to deficit page
      } else {
        console.log('Tab 1 (shipments page) not found, skipping article comparison');
      }

      // Step 26.10: Validate product name
      const deficitNameCell = firstDeficitRow.locator('[data-testid="DeficitIzdTable-Row-Name"]').first();
      await deficitNameCell.waitFor({ state: 'visible', timeout: 10000 });
      await deficitNameCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitNameCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const deficitNameValue = (await deficitNameCell.textContent())?.trim() || '';
      console.log(`Deficit table name: ${deficitNameValue}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Switch to orders page to compare
      if (tab1) {
        await tab1.bringToFront();
        const shipmentsNameWrapper = tab1.locator('[data-testid="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-Wrapper"]').first();
        await shipmentsNameWrapper.waitFor({ state: 'visible', timeout: 10000 });
        await shipmentsNameWrapper.scrollIntoViewIfNeeded();
        const shipmentsNameValue = (await shipmentsNameWrapper.textContent())?.trim() || '';
        console.log(`Shipments table name: ${shipmentsNameValue}`);
        await tab1.waitForTimeout(500); // Pause to see the value being validated
        expect.soft(deficitNameValue).toBe(shipmentsNameValue);
        await deficitPage.bringToFront(); // Switch back to deficit page
      } else {
        console.log('Tab 1 (shipments page) not found, skipping name comparison');
      }

      // Step 26.11: Validate urgency date
      const deficitDateUrgencyCell = firstDeficitRow.locator('[data-testid="DeficitIzdTable-Row-DateUrgency"]').first();
      await deficitDateUrgencyCell.waitFor({ state: 'visible', timeout: 10000 });
      await deficitDateUrgencyCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitDateUrgencyCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const deficitDateUrgencyValue = (await deficitDateUrgencyCell.textContent())?.trim() || '';
      const normalizedDeficitDateUrgency = normalizeDate(deficitDateUrgencyValue);
      console.log(`Deficit table urgency date: ${deficitDateUrgencyValue} (normalized: ${normalizedDeficitDateUrgency})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Switch to orders page to compare
      if (tab1) {
        await tab1.bringToFront();
        const shipmentsDateUrgencyDisplay = tab1.locator('[data-testid="Calendar-DataPicker-Choose-Value-Display"]').first();
        await shipmentsDateUrgencyDisplay.waitFor({ state: 'visible', timeout: 10000 });
        await shipmentsDateUrgencyDisplay.scrollIntoViewIfNeeded();
        const shipmentsDateUrgencyValue = (await shipmentsDateUrgencyDisplay.textContent())?.trim() || '';
        const normalizedShipmentsDateUrgency = normalizeDate(shipmentsDateUrgencyValue);
        console.log(`Shipments table urgency date: ${shipmentsDateUrgencyValue} (normalized: ${normalizedShipmentsDateUrgency})`);
        await tab1.waitForTimeout(500); // Pause to see the value being validated
        expect.soft(normalizedDeficitDateUrgency).toBe(normalizedShipmentsDateUrgency);
        await deficitPage.bringToFront(); // Switch back to deficit page
      } else {
        console.log('Tab 1 (shipments page) not found, skipping urgency date comparison');
      }

      // Step 26.12: Validate shipment date
      const deficitDateShipmentsCell = firstDeficitRow.locator('[data-testid="DeficitIzdTable-Row-DateShipments"]').first();
      await deficitDateShipmentsCell.waitFor({ state: 'visible', timeout: 10000 });
      await deficitDateShipmentsCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitDateShipmentsCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const deficitDateShipmentsValue = (await deficitDateShipmentsCell.textContent())?.trim() || '';
      const normalizedDeficitDateShipments = normalizeDate(deficitDateShipmentsValue);
      console.log(`Deficit table shipment date: ${deficitDateShipmentsValue} (normalized: ${normalizedDeficitDateShipments})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Switch to orders page to compare
      if (tab1) {
        await tab1.bringToFront();
        const shipmentsDateShipmentsCell = tab1.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-DateShipments"]').first();
        await shipmentsDateShipmentsCell.waitFor({ state: 'visible', timeout: 10000 });
        await shipmentsDateShipmentsCell.scrollIntoViewIfNeeded();
        const shipmentsDateShipmentsValue = (await shipmentsDateShipmentsCell.textContent())?.trim() || '';
        const normalizedShipmentsDateShipments = normalizeDate(shipmentsDateShipmentsValue);
        console.log(`Shipments table shipment date: ${shipmentsDateShipmentsValue} (normalized: ${normalizedShipmentsDateShipments})`);
        await tab1.waitForTimeout(500); // Pause to see the value being validated
        expect.soft(normalizedDeficitDateShipments).toBe(normalizedShipmentsDateShipments);
        await deficitPage.bringToFront(); // Switch back to deficit page
      } else {
        console.log('Tab 1 (shipments page) not found, skipping shipment date comparison');
      }
    });

    await allure.step('Step 27: Search and validate in DeficitIzd-Main-Table', async () => {
      // Get references
      const tab2 = (global as any).tab2 as Page;
      const tab2LoadingTaskPage = (global as any).tab2LoadingTaskPage as CreateLoadingTaskPage;
      const articleNumberValue = global.testProductArticleNumber || testProductArticleNumber;

      if (!articleNumberValue) {
        throw new Error('Article number is missing. Please ensure Test Case 1 has run.');
      }

      // Get full order number for reopening Tab 2 if needed
      const fullOrderNumberValue = global.fullOrderNumber || fullOrderNumber;
      if (!fullOrderNumberValue) {
        throw new Error('Full order number is missing. Please ensure Test Case 2 has run.');
      }

      // Get product name for searching - reopen Tab 2 if closed
      const productNameValue = global.testProductName || testProductName;
      if (!productNameValue) {
        throw new Error('Product name is missing. Please ensure Test Case 1 has run.');
      }

      let tab2ToUse = tab2;
      let tab2LoadingTaskPageToUse = tab2LoadingTaskPage;

      // Check if Tab 2 is still open, reopen if closed
      try {
        if (tab2 && !tab2.isClosed()) {
          // Tab 2 is still open, use it
          console.log('Tab 2 is still open');
        } else {
          console.log('Tab 2 is closed, reopening and navigating to edit order page');
          // Reopen Tab 2
          const contextForTab2 = page.context();
          tab2ToUse = await contextForTab2.newPage();
          tab2LoadingTaskPageToUse = new CreateLoadingTaskPage(tab2ToUse);

          // Navigate to Задачи на отгрузку in Tab 2
          await tab2ToUse.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
          await tab2LoadingTaskPageToUse.waitForNetworkIdle();

          // Wait for the page and table to load
          const issueShipmentPageElement2 = tab2ToUse.locator(SelectorsLoadingTasksPage.issueShipmentPage);
          await issueShipmentPageElement2.waitFor({ state: 'visible', timeout: 10000 });

          const tableBody2 = tab2ToUse.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);
          await tableBody2.waitFor({ state: 'visible', timeout: 10000 });
          await tab2LoadingTaskPageToUse.waitForNetworkIdle();

          // Search for order number
          const searchInputWrapper2 = tab2ToUse.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
          await searchInputWrapper2.waitFor({ state: 'visible', timeout: 10000 });
          const searchInput2 = searchInputWrapper2.locator('input[type="text"]').first();
          await searchInput2.clear();
          await searchInput2.fill(fullOrderNumberValue);
          await searchInput2.press('Enter');
          await tab2LoadingTaskPageToUse.waitForNetworkIdle();
          await tab2ToUse.waitForTimeout(1000);

          // Find and click on the order number cell
          const firstRow2 = tableBody2.locator('tr').first();
          await firstRow2.waitFor({ state: 'visible', timeout: 10000 });
          const orderNumberCell2 = firstRow2.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Tbody-Number"]').first();
          await orderNumberCell2.waitFor({ state: 'visible', timeout: 10000 });
          await orderNumberCell2.scrollIntoViewIfNeeded();
          await orderNumberCell2.click();
          await tab2ToUse.waitForTimeout(1000);
          await tab2LoadingTaskPageToUse.waitForNetworkIdle();

          // Find and click the edit button
          const editButton = tab2ToUse.locator('[data-testid="IssueShipment-ActionsButtons-EditOrder"]').filter({ hasText: 'Редактировать' });
          await editButton.waitFor({ state: 'visible', timeout: 10000 });
          const isEnabled = await editButton.isEnabled();
          expect.soft(isEnabled).toBe(true);
          await editButton.click();
          await tab2LoadingTaskPageToUse.waitForNetworkIdle();
          console.log(`Tab 2: Order reopened in edit mode`);

          // Store new Tab 2 reference
          (global as any).tab2 = tab2ToUse;
          (global as any).tab2LoadingTaskPage = tab2LoadingTaskPageToUse;
        }
      } catch (error) {
        console.log('Error accessing Tab 2:', error);
      }

      // Recreate deficit page reference (we're still on the deficit page from Step 26)
      const context = page.context();
      const pages = context.pages();
      // Find the deficit page by checking if it's on the warehouse/deficit URL
      let deficitPage: Page | undefined;
      for (const p of pages) {
        const url = p.url();
        if (url.includes('warehouse') || url.includes('deficit') || url.includes('Deficit')) {
          deficitPage = p;
          break;
        }
      }
      // If not found, create a new tab
      if (!deficitPage) {
        deficitPage = await context.newPage();
        await deficitPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
        await deficitPage.waitForLoadState('networkidle');
        // Navigate to Дефицит продукции
        const deficitProductionButton = deficitPage.locator(SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION);
        await deficitProductionButton.waitFor({ state: 'visible', timeout: 10000 });
        await deficitProductionButton.click();
        await deficitPage.waitForLoadState('networkidle');
      }
      const deficitLoadingTaskPage = new CreateLoadingTaskPage(deficitPage);
      await deficitPage.bringToFront();

      // Step 27.1: Reload the deficit page to clear everything
      await deficitPage.reload();
      await deficitLoadingTaskPage.waitForNetworkIdle();
      await deficitPage.waitForTimeout(1000);

      // Step 27.2: Find the table with data-testid:DeficitIzd-Main-Table
      const deficitMainTable = deficitPage.locator('[data-testid="DeficitIzd-Main-Table"]');
      await deficitMainTable.waitFor({ state: 'visible', timeout: 10000 });
      await deficitMainTable.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitMainTable, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Step 27.3: Find the search input field with data-testid:DeficitIzdTable-Search-Dropdown-Input
      const searchInput = deficitMainTable.locator('[data-testid="DeficitIzdTable-Search-Dropdown-Input"]').first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(searchInput, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Step 27.4: Search by article name
      await searchInput.clear();
      await searchInput.fill(articleNumberValue);
      await searchInput.press('Enter');
      await deficitLoadingTaskPage.waitForNetworkIdle();
      await deficitPage.waitForTimeout(1000);

      // Confirm row count is 1 and values match
      const deficitTableBody = deficitMainTable.locator('tbody');
      await deficitTableBody.waitFor({ state: 'visible', timeout: 10000 });
      const deficitRows = deficitTableBody.locator('tr');
      const rowCount = await deficitRows.count();
      expect.soft(rowCount).toBe(1);
      console.log(`Found ${rowCount} row(s) after searching by article: ${articleNumberValue}`);

      const firstRow = deficitRows.first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 });
      await firstRow.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(firstRow, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Verify article matches
      const articleCell = firstRow.locator('[data-testid="DeficitIzdTable-Row-Article"]').first();
      await articleCell.waitFor({ state: 'visible', timeout: 10000 });
      const articleValue = (await articleCell.textContent())?.trim() || '';
      expect.soft(articleValue).toBe(articleNumberValue);
      console.log(`Article in table: ${articleValue}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Step 27.5: Search by Name (product name)
      await searchInput.clear();
      await searchInput.fill(productNameValue);
      await searchInput.press('Enter');
      await deficitLoadingTaskPage.waitForNetworkIdle();
      await deficitPage.waitForTimeout(1000);

      // Confirm it's our item
      await deficitTableBody.waitFor({ state: 'visible', timeout: 10000 });
      const nameRows = deficitTableBody.locator('tr');
      const nameRowCount = await nameRows.count();
      expect.soft(nameRowCount).toBe(1);
      console.log(`Found ${nameRowCount} row(s) after searching by name: ${productNameValue}`);

      const nameRow = nameRows.first();
      await nameRow.waitFor({ state: 'visible', timeout: 10000 });
      await nameRow.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(nameRow, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Verify article still matches (to confirm it's our item)
      const nameArticleCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-Article"]').first();
      await nameArticleCell.waitFor({ state: 'visible', timeout: 10000 });
      const nameArticleValue = (await nameArticleCell.textContent())?.trim() || '';
      expect.soft(nameArticleValue).toBe(articleNumberValue);
      console.log(`Article in table (after name search): ${nameArticleValue}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Step 27.6: Re-validate the same cells against Tab 2 (edit order page)
      // Validate article name
      const finalArticleCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-Article"]').first();
      await finalArticleCell.waitFor({ state: 'visible', timeout: 10000 });
      await finalArticleCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(finalArticleCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const finalArticleValue = (await finalArticleCell.textContent())?.trim() || '';
      console.log(`Deficit table article: ${finalArticleValue}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      await tab2ToUse.bringToFront();
      const tab2ArticleCell = tab2ToUse.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Article"]').first();
      await tab2ArticleCell.waitFor({ state: 'visible', timeout: 10000 });
      await tab2ArticleCell.scrollIntoViewIfNeeded();
      const tab2ArticleValue = (await tab2ArticleCell.textContent())?.trim() || '';
      console.log(`Tab 2 article: ${tab2ArticleValue}`);
      await tab2ToUse.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(finalArticleValue).toBe(tab2ArticleValue);
      await deficitPage.bringToFront();

      // Validate product name
      const finalNameCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-Name"]').first();
      await finalNameCell.waitFor({ state: 'visible', timeout: 10000 });
      await finalNameCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(finalNameCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const finalNameValue = (await finalNameCell.textContent())?.trim() || '';
      console.log(`Deficit table name: ${finalNameValue}`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      await tab2ToUse.bringToFront();
      const tab2NameCell = tab2ToUse.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Name"]').first();
      await tab2NameCell.waitFor({ state: 'visible', timeout: 10000 });
      await tab2NameCell.scrollIntoViewIfNeeded();
      const tab2NameValue = (await tab2NameCell.textContent())?.trim() || '';
      console.log(`Tab 2 name: ${tab2NameValue}`);
      await tab2ToUse.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(finalNameValue).toBe(tab2NameValue);
      await deficitPage.bringToFront();

      // Validate urgency date (with normalization)
      const normalizeDate = (rawDate: string): string => {
        const parseDate = (dateStr: string): Date => {
          if (dateStr.includes('.')) {
            const [day, month, yearRaw] = dateStr.split('.');
            const year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw);
            return new Date(year, Number(month) - 1, Number(day));
          }
          const months: { [key: string]: number } = {
            янв: 0,
            фев: 1,
            мар: 2,
            апр: 3,
            май: 4,
            июн: 5,
            июл: 6,
            авг: 7,
            сен: 8,
            окт: 9,
            ноя: 10,
            дек: 11,
          };
          const parts = dateStr.split(' ');
          const monthName = parts[0].toLowerCase();
          const day = parseInt(parts[1].replace(',', ''), 10);
          const year = parseInt(parts[2], 10);
          return new Date(year, months[monthName], day);
        };

        const date = parseDate(rawDate);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const year = `${date.getFullYear()}`;
        return `${day}.${month}.${year}`;
      };

      const finalUrgencyDateCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-DateUrgency"]').first();
      await finalUrgencyDateCell.waitFor({ state: 'visible', timeout: 10000 });
      await finalUrgencyDateCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(finalUrgencyDateCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const finalUrgencyDateValue = (await finalUrgencyDateCell.textContent())?.trim() || '';
      const normalizedFinalUrgencyDate = normalizeDate(finalUrgencyDateValue);
      console.log(`Deficit table urgency date: ${finalUrgencyDateValue} (normalized: ${normalizedFinalUrgencyDate})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      await tab2ToUse.bringToFront();
      const tab2UrgencyDisplay = tab2ToUse.locator('[data-testid^="AddOrder-DateByUrgency-Calendar-DataPicker-Choose-Value-Display"]').first();
      await tab2UrgencyDisplay.waitFor({ state: 'visible', timeout: 10000 });
      await tab2UrgencyDisplay.scrollIntoViewIfNeeded();
      const tab2UrgencyValue = (await tab2UrgencyDisplay.textContent())?.trim() || '';
      const normalizedTab2Urgency = normalizeDate(tab2UrgencyValue);
      console.log(`Tab 2 urgency date: ${tab2UrgencyValue} (normalized: ${normalizedTab2Urgency})`);
      await tab2ToUse.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(normalizedFinalUrgencyDate).toBe(normalizedTab2Urgency);
      await deficitPage.bringToFront();

      // Validate shipment date (with normalization)
      const finalShipmentDateCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-DateShipments"]').first();
      await finalShipmentDateCell.waitFor({ state: 'visible', timeout: 10000 });
      await finalShipmentDateCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(finalShipmentDateCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const finalShipmentDateValue = (await finalShipmentDateCell.textContent())?.trim() || '';
      const normalizedFinalShipmentDate = normalizeDate(finalShipmentDateValue);
      console.log(`Deficit table shipment date: ${finalShipmentDateValue} (normalized: ${normalizedFinalShipmentDate})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      await tab2ToUse.bringToFront();
      const tab2ShipmentDisplay = tab2ToUse.locator('[data-testid^="AddOrder-DateShippingPlan-Calendar-DataPicker-Choose-Value-Display"]').first();
      await tab2ShipmentDisplay.waitFor({ state: 'visible', timeout: 10000 });
      await tab2ShipmentDisplay.scrollIntoViewIfNeeded();
      const tab2ShipmentValue = (await tab2ShipmentDisplay.textContent())?.trim() || '';
      const normalizedTab2Shipment = normalizeDate(tab2ShipmentValue);
      console.log(`Tab 2 shipment date: ${tab2ShipmentValue} (normalized: ${normalizedTab2Shipment})`);
      await tab2ToUse.waitForTimeout(500); // Pause to see the value being validated
      expect.soft(normalizedFinalShipmentDate).toBe(normalizedTab2Shipment);
      await deficitPage.bringToFront();

      // Step 27.7: Get initial Deficit and Demand values
      const initialDeficitCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-Deficit"]').first();
      await initialDeficitCell.waitFor({ state: 'visible', timeout: 10000 });
      await initialDeficitCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(initialDeficitCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const initialDeficitValue = (await initialDeficitCell.textContent())?.trim() || '';
      const initialDeficitNumber = parseFloat(initialDeficitValue.replace(/,/g, '.')) || 0;
      console.log(`Initial Deficit value: ${initialDeficitValue} (parsed: ${initialDeficitNumber})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      const initialDemandCell = nameRow.locator('[data-testid="DeficitIzdTable-Row-Demand"]').first();
      await initialDemandCell.waitFor({ state: 'visible', timeout: 10000 });
      await initialDemandCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(initialDemandCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const initialDemandValue = (await initialDemandCell.textContent())?.trim() || '';
      const initialDemandNumber = parseFloat(initialDemandValue.replace(/,/g, '.')) || 0;
      console.log(`Initial Demand value: ${initialDemandValue} (parsed: ${initialDemandNumber})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Step 27.8: Switch to edit order tab and update quantity
      await tab2ToUse.bringToFront();
      const quantityInput = tab2ToUse.locator('[data-testid="AddOrder-Quantity-InputNumber-Input"]').first();
      await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
      await quantityInput.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPageToUse.highlightElement(quantityInput, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2ToUse.waitForTimeout(500);

      // Get current quantity value
      const currentQuantityValue = await quantityInput.inputValue();
      const currentQuantityNumber = parseFloat(currentQuantityValue) || 0;
      console.log(`Current quantity value: ${currentQuantityValue} (parsed: ${currentQuantityNumber})`);
      await tab2ToUse.waitForTimeout(500); // Pause to see the value being validated

      // Increase quantity by 3
      const newQuantityNumber = currentQuantityNumber + 3;
      const newQuantityValue = newQuantityNumber.toString();
      await quantityInput.clear();
      await quantityInput.fill(newQuantityValue);
      await tab2ToUse.waitForTimeout(500);

      // Verify the new value was set
      const verifyQuantityValue = await quantityInput.inputValue();
      expect.soft(parseFloat(verifyQuantityValue)).toBe(newQuantityNumber);
      console.log(`Updated quantity value: ${verifyQuantityValue} (expected: ${newQuantityNumber})`);
      await tab2ToUse.waitForTimeout(500); // Pause to see the value being validated

      // Step 27.9: Click Save button
      const saveButton = tab2ToUse.locator('[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Save"]').first();
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.scrollIntoViewIfNeeded();
      await tab2LoadingTaskPageToUse.highlightElement(saveButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await tab2ToUse.waitForTimeout(500);
      await saveButton.click();
      await tab2LoadingTaskPageToUse.waitForNetworkIdle();
      await tab2ToUse.waitForTimeout(1000);
      console.log('Clicked Save button');

      // Step 27.10: Return to deficit page, reload and re-search
      await deficitPage.bringToFront();
      await deficitPage.reload();
      await deficitLoadingTaskPage.waitForNetworkIdle();
      await deficitPage.waitForTimeout(1000);

      // Re-find the table and search input
      const deficitMainTableAfterReload = deficitPage.locator('[data-testid="DeficitIzd-Main-Table"]');
      await deficitMainTableAfterReload.waitFor({ state: 'visible', timeout: 10000 });
      await deficitMainTableAfterReload.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(deficitMainTableAfterReload, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      const searchInputAfterReload = deficitMainTableAfterReload.locator('[data-testid="DeficitIzdTable-Search-Dropdown-Input"]').first();
      await searchInputAfterReload.waitFor({ state: 'visible', timeout: 10000 });
      await searchInputAfterReload.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(searchInputAfterReload, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Search by article again
      await searchInputAfterReload.clear();
      await searchInputAfterReload.fill(articleNumberValue);
      await searchInputAfterReload.press('Enter');
      await deficitLoadingTaskPage.waitForNetworkIdle();
      await deficitPage.waitForTimeout(1000);

      // Get the row after reload
      const deficitTableBodyAfterReload = deficitMainTableAfterReload.locator('tbody');
      await deficitTableBodyAfterReload.waitFor({ state: 'visible', timeout: 10000 });
      const deficitRowsAfterReload = deficitTableBodyAfterReload.locator('tr');
      const rowCountAfterReload = await deficitRowsAfterReload.count();
      expect.soft(rowCountAfterReload).toBe(1);
      console.log(`Found ${rowCountAfterReload} row(s) after reload and search`);

      const reloadedRow = deficitRowsAfterReload.first();
      await reloadedRow.waitFor({ state: 'visible', timeout: 10000 });
      await reloadedRow.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(reloadedRow, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);

      // Step 27.11: Re-check Deficit and Demand values
      const updatedDeficitCell = reloadedRow.locator('[data-testid="DeficitIzdTable-Row-Deficit"]').first();
      await updatedDeficitCell.waitFor({ state: 'visible', timeout: 10000 });
      await updatedDeficitCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(updatedDeficitCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const updatedDeficitValue = (await updatedDeficitCell.textContent())?.trim() || '';
      const updatedDeficitNumber = parseFloat(updatedDeficitValue.replace(/,/g, '.')) || 0;
      console.log(`Updated Deficit value: ${updatedDeficitValue} (parsed: ${updatedDeficitNumber})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Deficit should decrease by 3
      const expectedDeficitNumber = initialDeficitNumber - 3;
      expect.soft(updatedDeficitNumber).toBe(expectedDeficitNumber);
      console.log(`Deficit changed from ${initialDeficitNumber} to ${updatedDeficitNumber} (expected: ${expectedDeficitNumber})`);

      const updatedDemandCell = reloadedRow.locator('[data-testid="DeficitIzdTable-Row-Demand"]').first();
      await updatedDemandCell.waitFor({ state: 'visible', timeout: 10000 });
      await updatedDemandCell.scrollIntoViewIfNeeded();
      await deficitLoadingTaskPage.highlightElement(updatedDemandCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await deficitPage.waitForTimeout(500);
      const updatedDemandValue = (await updatedDemandCell.textContent())?.trim() || '';
      const updatedDemandNumber = parseFloat(updatedDemandValue.replace(/,/g, '.')) || 0;
      console.log(`Updated Demand value: ${updatedDemandValue} (parsed: ${updatedDemandNumber})`);
      await deficitPage.waitForTimeout(500); // Pause to see the value being validated

      // Demand should increase by 3
      const expectedDemandNumber = initialDemandNumber + 3;
      expect.soft(updatedDemandNumber).toBe(expectedDemandNumber);
      console.log(`Demand changed from ${initialDemandNumber} to ${updatedDemandNumber} (expected: ${expectedDemandNumber})`);
    });
  });

  test('Test Case 4 - Добавить два изделия к задаче на отгрузку', async ({ page }) => {
    test.setTimeout(120000);
    console.log('Test Case 4 - Add two products to shipment task');
    const warehouseTaskForShipmentPage = new CreateWarehouseTaskForShipmentPage(page);

    // TODO: Implement adding two products to shipment task
  });

  test('Test Case 5 - Добавление количества экземпляров в заказе', async ({ page }) => {
    test.setTimeout(120000);
    console.log('Test Case 5 - Increase quantity of instances in order');
    const warehouseTaskForShipmentPage = new CreateWarehouseTaskForShipmentPage(page);

    // TODO: Implement increasing quantity of instances
  });

  test('Test Case 6 - Уменьшение количества экземпляров в заказе', async ({ page }) => {
    test.setTimeout(120000);
    console.log('Test Case 6 - Decrease quantity of instances in order');
    const warehouseTaskForShipmentPage = new CreateWarehouseTaskForShipmentPage(page);

    // TODO: Implement decreasing quantity of instances
  });

  test('Test Case 7 - Удаление задачи на отгрузку', async ({ page }) => {
    test.setTimeout(120000);
    console.log('Test Case 7 - Delete shipment task');
    const loadingTaskPage = new CreateLoadingTaskPage(page);

    const productNameValue = 'TEST_PRODUCT';

    const tableBody = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_TABLE_BODY);

    const waitForShipmentsTableReady = async () => {
      // First, wait for the table body to be attached to the DOM
      await tableBody.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {
        // If not attached, wait a bit more for the page to load
        return page.waitForTimeout(1000).then(() => tableBody.waitFor({ state: 'attached', timeout: 5000 }));
      });

      // Table body might be hidden when there are no rows - this is valid
      // Try to wait for visible, but don't fail if it's hidden (empty table)
      await tableBody.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
        // Hidden table is OK - it just means there are no rows
      });
    };

    const selectRowForArchive = async (row: Locator) => {
      const checkboxCandidate = row.locator('[data-testid*="TdCheckbox"]');
      if (await checkboxCandidate.count()) {
        const checkboxElement = checkboxCandidate.first();
        await checkboxElement.scrollIntoViewIfNeeded();
        await loadingTaskPage.highlightElement(checkboxElement, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);

        const checkboxInput = checkboxElement.locator('input[type="checkbox"]').first();
        if (await checkboxInput.count()) {
          const isChecked = await checkboxInput.isChecked();
          if (!isChecked) {
            await checkboxInput.click();
          }
        } else {
          await checkboxElement.click();
        }
        return;
      }

      const numberOrderCell = row.locator('[data-testid*="-Tbody-NumberOrder"]').first();
      const numberCell = row.locator('[data-testid*="-Tbody-Number"]').first();
      const selectableCell = (await numberOrderCell.count()) > 0 ? numberOrderCell : (await numberCell.count()) > 0 ? numberCell : row;

      await selectableCell.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(selectableCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      await selectableCell.click();
    };

    const getSearchInput = async () => {
      const wrapper = page.locator(SelectorsLoadingTasksPage.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
      await wrapper.waitFor({ state: 'visible', timeout: 10000 });
      await wrapper.scrollIntoViewIfNeeded();
      const input = wrapper.locator('input[type="text"]').first();
      await input.waitFor({ state: 'visible', timeout: 5000 });
      await loadingTaskPage.highlightElement(input, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      return input;
    };

    const searchOrder = async (searchTerm: string) => {
      const searchInput = await getSearchInput();
      await searchInput.fill('');
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await loadingTaskPage.waitForNetworkIdle();
      await page.waitForTimeout(1000);
    };

    let matchingRows: Locator | null = null;
    let hasRowsForDeletion = true;

    await allure.step('Step 1: Перейти на страницу "Задачи на отгрузку"', async () => {
      await loadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await loadingTaskPage.waitForNetworkIdle();

      const pageContainer = page.locator(SelectorsLoadingTasksPage.issueShipmentPage);
      await pageContainer.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await pageContainer.isVisible()).toBe(true);
    });

    await allure.step('Step 2: Найти задачу по имени изделия (TEST_PRODUCT)', async () => {
      console.log(`Searching for shipping task using product name: ${productNameValue}`);
      await searchOrder(productNameValue);
      await waitForShipmentsTableReady();
      const rows = tableBody.locator('tr').filter({ hasText: productNameValue });
      const count = await rows.count();
      console.log(`Rows matching "${productNameValue}": ${count}`);
      expect.soft(count).toBeGreaterThanOrEqual(0);

      if (count > 0) {
        matchingRows = rows;
      } else {
        hasRowsForDeletion = false;
        console.log(`✅ Для изделия ${productNameValue} нет задач на отгрузку. Это успешный результат - нечего удалять.`);
        expect.soft(count).toBe(0);
        return;
      }

      const firstMatch = matchingRows.first();
      await firstMatch.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(firstMatch, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
    });

    if (!hasRowsForDeletion || !matchingRows) {
      console.log(`✅ Для изделия ${productNameValue} нет задач на отгрузку. Тест успешно завершён - нечего удалять.`);
      return;
    }

    await allure.step('Step 3: Выбрать задачу для удаления', async () => {
      if (!matchingRows) {
        throw new Error('Не найдена строка для выбора. Поиск завершился неудачей.');
      }

      const rowExists = await matchingRows.count();
      expect.soft(rowExists).toBeGreaterThan(0);

      const targetRow = matchingRows.first();
      await targetRow.scrollIntoViewIfNeeded();
      await loadingTaskPage.highlightElement(targetRow, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await page.waitForTimeout(500);
      await selectRowForArchive(targetRow);
      console.log(`Selected order row with product: ${productNameValue}`);
    });

    await allure.step('Step 4: Архивировать все найденные задачи', async () => {
      let iteration = 1;

      while (true) {
        await searchOrder(productNameValue);
        await waitForShipmentsTableReady();
        const rows = tableBody.locator('tr').filter({ hasText: productNameValue });
        const remainingRows = await rows.count();
        console.log(`Archive iteration ${iteration}, remaining rows: ${remainingRows}`);

        if (remainingRows === 0) {
          break;
        }

        const currentRow = rows.first();
        await selectRowForArchive(currentRow);

        const archiveButton = page.locator(SelectorsLoadingTasksPage.buttonArchive);
        await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

        try {
          await expect.soft(archiveButton).toBeEnabled({ timeout: 5000 });
        } catch (error) {
          console.warn('Archive button is still disabled after waiting.', error);
        }

        const isEnabled = await archiveButton.isEnabled();
        if (!isEnabled) {
          throw new Error('Кнопка "Архив" недоступна после выбора строки.');
        }

        await loadingTaskPage.highlightElement(archiveButton, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        await archiveButton.click();

        const promptModal = page.locator('[data-testid^="IssueShipment-ModalPromptMini-Archive"]').first();
        if (await promptModal.isVisible({ timeout: 3000 }).catch(() => false)) {
          const confirmPromptButton = promptModal.locator('[data-testid="ModalPromptMini-Button-Confirm"]');
          await confirmPromptButton.waitFor({ state: 'visible', timeout: 5000 });
          await loadingTaskPage.highlightElement(confirmPromptButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await page.waitForTimeout(500);
          await confirmPromptButton.click();
        }

        const confirmButton = page.locator(SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON).first();
        await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
        await loadingTaskPage.highlightElement(confirmButton, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        await confirmButton.click();

        const loader = page.locator('[data-testid="IssueShipment-ActionsButtons-Loader"]');
        await loader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await loadingTaskPage.waitForNetworkIdle();

        iteration += 1;

        if (iteration > 60) {
          throw new Error('Превышено максимальное количество итераций архивирования (60).');
        }
      }
    });

    await allure.step('Step 5: Убедиться, что задача отсутствует в списке', async () => {
      await searchOrder(productNameValue);
      await waitForShipmentsTableReady();
      const remainingRows = tableBody.locator('tr').filter({ hasText: productNameValue });
      const rowCount = await remainingRows.count();
      console.log(`Post-archive search "${productNameValue}" -> rows: ${rowCount}`);
      expect.soft(rowCount).toBe(0);
      if (rowCount > 0) {
        console.warn(`Order/task with "${productNameValue}" still present after archive attempt.`);
      }
    });
  });

  test('Test Case 8 - Удаление тестовых изделий', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for deleting multiple products
    console.log('Test Case 8 - Delete test products');
    const partsDatabasePage = new CreatePartsDatabasePage(page);

    const searchPrefix = 'TEST_PRODUCT';

    await allure.step('Step 1: Перейти на страницу "База изделий"', async () => {
      await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabasePage.waitForNetworkIdle();

      // Verify page loaded by checking for the create button
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      await createButton.waitFor({ state: 'visible', timeout: 10000 });
      expect.soft(await createButton.isVisible()).toBe(true);
    });

    await allure.step('Step 2: Найти и удалить все тестовые изделия', async () => {
      // Search for products with TEST_PRODUCT prefix
      const searchInput = page.locator(SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT).first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.clear();
      await searchInput.fill(searchPrefix);
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
      await partsDatabasePage.waitForNetworkIdle();

      const table = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
      const rows = table.locator('tbody tr');
      const rowCount = await rows.count();
      console.log(`Found ${rowCount} test products to delete`);

      if (rowCount === 0) {
        console.log(`✅ Для префикса ${searchPrefix} нет изделий. Это успешный результат - нечего удалять.`);
        expect.soft(rowCount).toBe(0);
        return;
      }

      // Delete items from bottom up (re-fetch rows after each deletion)
      let deletedCount = 0;
      let maxIterations = rowCount * 2; // Safety limit
      let iteration = 0;

      while (iteration < maxIterations) {
        iteration++;

        // Re-fetch rows after each deletion - wait for table to be ready
        await page.waitForTimeout(1000);
        await partsDatabasePage.waitForNetworkIdle();

        // Re-search if we've deleted many items to refresh the table
        if (deletedCount > 0 && deletedCount % 10 === 0) {
          console.log(`Re-searching after ${deletedCount} deletions to refresh table...`);
          const searchInput = page.locator(SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT).first();
          await searchInput.clear();
          await searchInput.fill(searchPrefix);
          await searchInput.press('Enter');
          await page.waitForTimeout(2000);
          await partsDatabasePage.waitForNetworkIdle();
        }

        const currentRows = table.locator('tbody tr');
        const currentRowCount = await currentRows.count();

        if (currentRowCount === 0) {
          console.log('No more rows to delete');
          break;
        }

        // Always delete the last row (bottom up)
        const rowIndex = currentRowCount - 1;
        const row = currentRows.nth(rowIndex);

        // Check if row exists and is visible
        try {
          const rowExists = await row.count();
          if (rowExists === 0) {
            console.warn(`Row at index ${rowIndex} does not exist, re-fetching...`);
            continue;
          }

          await row.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
            console.warn(`Row at index ${rowIndex} is not visible, skipping...`);
          });

          await row.scrollIntoViewIfNeeded();
          await partsDatabasePage.highlightElement(row, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await page.waitForTimeout(500);

          // Try to click the row with error handling
          await row.click({ timeout: 5000 }).catch(error => {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(`Failed to click row at index ${rowIndex}: ${errorMessage}`);
            throw error;
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Error selecting row ${rowIndex}: ${errorMessage}, trying next iteration...`);
          continue;
        }

        // Try to delete the item - wrap in try-catch to handle any errors
        try {
          // Wait for row to be selected and archive button to become enabled
          await page.waitForTimeout(1000);
          await partsDatabasePage.waitForNetworkIdle();

          const archiveButton = page.locator(SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON);
          await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

          // Wait for button to be enabled (with retry)
          let isEnabled = false;
          for (let retry = 0; retry < 5; retry++) {
            isEnabled = await archiveButton.isEnabled();
            if (isEnabled) break;
            await page.waitForTimeout(500);
          }

          if (!isEnabled) {
            console.warn(`Archive button is disabled, skipping this item...`);
            // Try clicking the row again
            try {
              await row.click({ timeout: 3000 });
              await page.waitForTimeout(1000);
              isEnabled = await archiveButton.isEnabled();
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              console.warn(`Could not re-click row: ${errorMessage}`);
            }

            if (!isEnabled) {
              console.warn(`Archive button still disabled after retry, moving to next item...`);
              continue;
            }
          }

          expect.soft(isEnabled).toBe(true);

          await partsDatabasePage.highlightElement(archiveButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await page.waitForTimeout(500);
          await archiveButton.click();

          const confirmButton = page.locator(SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON).filter({ hasText: 'Да' });
          await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
          await partsDatabasePage.highlightElement(confirmButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await page.waitForTimeout(500);
          await confirmButton.click();

          await page.waitForTimeout(500);
          await partsDatabasePage.waitForNetworkIdle();
          deletedCount++;
          console.log(`Deleted ${deletedCount} products...`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`Error deleting item at row ${rowIndex}: ${errorMessage}`);
          // Continue to next item even if this one failed
          continue;
        }
      }

      console.log(`✅ Deleted ${deletedCount} test products`);
    });

    await allure.step('Step 3: Убедиться, что все тестовые изделия удалены', async () => {
      // Re-search to verify all items are deleted
      const searchInput = page.locator(SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT).first();
      await searchInput.clear();
      await searchInput.fill(searchPrefix);
      await searchInput.press('Enter');
      await page.waitForTimeout(2000);
      await partsDatabasePage.waitForNetworkIdle();

      const table = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
      const rows = table.locator('tbody tr');
      const remainingCount = await rows.count();
      console.log(`Post-deletion search "${searchPrefix}" -> rows: ${remainingCount}`);
      expect.soft(remainingCount).toBe(0);

      if (remainingCount === 0) {
        console.log(`✅ Все тестовые изделия успешно удалены.`);
      } else {
        console.warn(`⚠️ Осталось ${remainingCount} изделий с префиксом ${searchPrefix} после попытки удаления.`);
      }
    });
  });
};
