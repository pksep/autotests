import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

// Страница:  Ревизия
export class CreateRevisionPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async changeWarehouseBalances(quantity: string) {
    await this.page.locator('[data-testid="InputNumber-Input"]').fill(quantity);
    await this.page.locator('[data-testid="InputNumber-Input"]').press('Enter');
  }

  async checkWarehouseBalances(quantity: string) {
    await this.page.waitForTimeout(1000);
    const checkBalanceCell = this.page.locator(
      '[data-testid="TableRevisionPagination-TableData-Current"]'
    );
    await checkBalanceCell.waitFor({ state: 'visible', timeout: 10000 });
    await checkBalanceCell.scrollIntoViewIfNeeded();

    // Highlight the balance cell
    await checkBalanceCell.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'lightyellow';
      el.style.border = '2px solid orange';
    });
    await this.page.waitForTimeout(300);

    const checkBalance = await checkBalanceCell.textContent();
    expect(checkBalance).toBe(quantity);
  }
}
