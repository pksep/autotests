import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';

export enum Supplier {
  Сборка = 'Сборка',
  Детали = 'Детали',
  Изделия = 'Изделия',
  Поставщики = 'Поставщики'
}

// Страница: Заказаны у поставщиков
export class CreateOrderedFromSuppliersPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  // Выбираем поставщика и проверяем, что отображается выбранный тип поставщика
  async selectSupplier(supplier: Supplier) {
    const typeOperations = await this.page.$$('.type-operation');
    for (const typeOperation of typeOperations) {
      const nameOperation = (await typeOperation.textContent())!.trim();

      if (nameOperation === supplier) {
        console.log(`Операция ${nameOperation} выбрана.`);
        await typeOperation.click();
        break;
      }
    }

    // Заголовко Поставщик:
    const headerSuppler = await this.page
      .locator(
        '[data-testid="ModalAddOrder-SupplierOrderDetails-SupplierLabel"]'
      )
      .textContent();
    console.log(`Проверка заголовка поставщиков ${headerSuppler}`);
    expect(headerSuppler?.trim()).toBe('Поставщик:');

    // Проверка выбранного поставщика
    const selectSuppler = await this.page
      .locator(
        '[data-testid="ModalAddOrder-SupplierOrderDetails-TypeComingDisplay"]'
      )
      .textContent();

    console.log(`Поставщик: ${selectSuppler}`);
    if ((await selectSuppler) == 'Сборки') {
      return selectSuppler as 'Сборка';
    }
    expect(selectSuppler).toBe(supplier);
  }

  // Поиск в модальном окне
  async searchModalWindow(nameSearch: string) {
    await this.waitingTableBodyModalWindow();

    const searchModalWindow = this.page
      .locator('[data-testid="Search-Cover-Input"]')
      .nth(1);
    await searchModalWindow.fill(nameSearch);
    expect(await searchModalWindow.inputValue()).toBe(nameSearch);
    await searchModalWindow.press('Enter');

    await this.waitingTableBodyModalWindow();

    const cells = await this.page
      .locator('table tbody tr:first-child td')
      .allInnerTexts();

    // Проверяем, содержится ли искомое значение в одной из ячеек
    const containsSearchValue = cells.some(cellText =>
      cellText.includes(nameSearch)
    );

    // Ожидаем, что хотя бы одна ячейка содержит искомое значение
    await expect(containsSearchValue).toBe(true);
  }

  // Отметка чекбокса
  async checkTheBox() {
    const checkbox = this.page.locator('.checkbox_block').nth(0);
    await checkbox.click();
  }

  // Водим количество для заказа
  async enteringOrderQuantity(qunatity: string) {
    const cellOwnQuantity = this.page.locator(
      '[data-testid="ModalAddOrder-ProductionTable-TableRowYourQuantityCell-4439"] input'
    );
    expect(await cellOwnQuantity.inputValue()).toBe('');
    await cellOwnQuantity.fill(qunatity);
    expect(await cellOwnQuantity.inputValue()).toBe(qunatity);
  }

  // Проверяем, что в последнем созданном заказе номер заказа совпадает
  async compareOrderNumbers(orderNumber: string) {
    await this.page
      .locator('[data-testid="OrderSuppliers-LinkImage"]')
      .last()
      .click();
    const headerModalWindow = this.page
      .locator('[data-testid="ModalWorker-StockOrderModal-Heading"]')
      .first();
    expect(await headerModalWindow.textContent()).toBe('Заказ');

    const checkOrderNumberLocator = this.page.locator(
      '[data-testid="ModalWorker-StockOrderModal-OrderNumber"] span'
    );

    await expect(checkOrderNumberLocator).toBeVisible();
    const checkOrderNumber = checkOrderNumberLocator.textContent();

    expect(await checkOrderNumber).toBe(orderNumber);
    console.log(`Номера заказов совпадают.`);
  }

  // Нажатие на кнопку отменить
  async clickButtonCansel() {
    const buttonCansel = this.page.locator(
      '[data-testid="ModalAddOrder-ProductionTable-CancelButton"]'
    );
    await expect(buttonCansel).toBeVisible();
    await buttonCansel.click();
  }

  // Ожидание тела таблицы в модальном окне создание заказа поставщика
  private async waitingTableBodyModalWindow() {
    await this.page.waitForSelector(
      '[data-testid="ModalAddOrder-ProductionTable-TableRow-0"]'
    );
  }
}
