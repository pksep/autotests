import { expect, Page, Locator } from '@playwright/test';
import { PageObject, ISpetificationData } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';

// Страница: Задачи на отгрузку
export class CreateLoadingTaskPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  //  Выделить в таблице
  async choiceProductInModal(nameProduct: string) {
    const firstRowCells = this.page.locator(
      '[data-testid="TableProduct-TableRow"]:first-child td'
    );

    const cells = await firstRowCells.allInnerTexts();

    const index = cells.findIndex(cellText => cellText.includes(nameProduct));

    if (index !== -1) {
      await firstRowCells.nth(index).click();
    } else {
      throw new Error(
        `Продукт "${nameProduct}" не найден в первой строке таблицы.`
      );
    }
  }

  // Проверить, что выбранное изделие отображается
  async checkProduct(nameProduct: string) {
    const product = this.page
      .locator('[data-testid="AddAddOrder-SelectProductLink"]')
      .textContent();
    expect(await product).toBe(nameProduct);
  }

  // Выбрать покупателя
  async choiceBuyer(number: string) {
    const dropdownBuyer = this.page.locator('.buyer_select');
    expect(await dropdownBuyer.locator('option').count()).toBeGreaterThan(0);
    await expect(dropdownBuyer).toBeVisible();

    await dropdownBuyer.selectOption(number);
  }
}
