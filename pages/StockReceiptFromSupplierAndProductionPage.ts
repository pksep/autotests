import { Page, expect } from '@playwright/test';
import { PageObject, Click } from '../lib/Page';
import logger from '../lib/utils/logger';
import { table } from 'console';

export enum StockReceipt {
  metalworking = 'Металлообработка',
  cbed = 'Сборка',
  suppler = 'Поставщик',
}

// Страница: Приход на склад от поставщиков и производства
export class CreateStockReceiptFromSupplierAndProductionPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  /**  Выбираем поставщика и проверяем, что отображается выбранный тип поставщика
   * @param supplier - Выбираем от кого ожидаем посутпление
   */
  async selectStockReceipt(stockReceipt: StockReceipt) {
    // Map stock receipt types to their data-testid values
    const stockReceiptTestIds: Record<StockReceipt, string> = {
      [StockReceipt.suppler]: 'ComingToSclad-ModalComing-Main-Provider',
      [StockReceipt.metalworking]:
        'ComingToSclad-ModalComing-Main-Metalloworking',
      [StockReceipt.cbed]: 'ComingToSclad-ModalComing-Main-Assembly',
    };

    const testId = stockReceiptTestIds[stockReceipt];
    if (!testId) {
      throw new Error(`Unknown stock receipt type: ${stockReceipt}`);
    }

    // Click the button in the first modal (selection modal)
    const stockReceiptButton = this.page.getByTestId(testId);
    await stockReceiptButton.waitFor({ state: 'visible', timeout: 10000 });
    await stockReceiptButton.scrollIntoViewIfNeeded();
    logger.log(`Операция ${stockReceipt} выбрана.`);
    await stockReceiptButton.click();

    // Wait for the receipt modal dialog to appear after clicking
    await this.page
      .locator('[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill"]')
      .waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);

    // Check the selected supplier type by reading the block title in the modal
    // The title contains: "Потенциальные от {Type}" - we extract the last word
    const blockTitleElement = this.page.locator(
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-BlockTitle"]'
    );

    await blockTitleElement.waitFor({ state: 'visible', timeout: 10000 });

    // Highlight the element for visual confirmation
    await blockTitleElement.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });

    const blockTitle = await blockTitleElement.textContent();
    logger.log(`Заголовок блока: ${blockTitle}`);

    if (!blockTitle) {
      throw new Error('Block title not found or empty');
    }

    // Extract the last word from the title (e.g., "Потенциальные от Металлообработка" -> "Металлообработка")
    const words = blockTitle.trim().split(/\s+/);
    const extractedType = words[words.length - 1];
    logger.log(`Извлеченный тип поступления: ${extractedType}`);

    // Map "Поставщики" -> "Поставщик" for comparison
    const normalizedExtractedType =
      extractedType === 'Поставщики' ? 'Поставщик' : extractedType;

    // Verify the displayed type matches what we selected
    expect(normalizedExtractedType).toBe(stockReceipt);

    // Validate buttons in the modal
    await this.clickButton(
      'Добавить',
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Button-Add"]',
      Click.No
    );

    await this.clickButton(
      'Добавить из базы',
      '[data-testid="AttachFileComponent-AddFileButton"]',
      Click.No
    );

    await this.clickButton(
      'Отменить',
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Buttons-Cancel"]',
      Click.No
    );

    await this.clickButton(
      'Создать',
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill-Buttons-Create"]',
      Click.No
    );
  }

  async inputQuantityInCell(quantity: string) {
    // Ensure the dialog is visible
    const dialog = this.page.locator(
      '[data-testid="ComingToSclad-ModalComing-ModalAddNewWaybill"]'
    );
    await dialog.waitFor({ state: 'visible', timeout: 10000 });

    // Find the input in the first row of the table
    // Pattern: ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row{id}-TdInput-Input-Input
    const quantityInput = this.page
      .locator(
        'input[data-testid^="ComingToSclad-ModalComing-ModalAddNewWaybill-Main-TableWrapper-ContrastBlock-Table-Row"][data-testid$="-TdInput-Input-Input"]'
      )
      .first();

    await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
    await quantityInput.scrollIntoViewIfNeeded();

    // Fill the quantity
    await quantityInput.fill(quantity);

    // Verify the quantity was entered
    expect(await quantityInput.inputValue()).toBe(quantity);

    // Press Enter
    await quantityInput.press('Enter');
  }
}
