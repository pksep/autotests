import { Locator, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import * as SelectorsProductionTasks from '../lib/Constants/SelectorsProductionTasks';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

// Страница: Производственные задания
export class ProductionTasksPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async openProductionTasksPage(): Promise<void> {
    await this.goto(SelectorsProductionTasks.PRODUCTION_TASKS_URL);
    await this.waitForNetworkIdle();
    logger.info('Открыта страница Производственные задания');
  }

  async getProductionTaskDate(detailName: string): Promise<string> {
    await this.openProductionTasksPage();
    await this.searchByName(detailName);

    const table = await this.findVisibleTableWithRows();
    const nameColumnIndex = await this.findColumnIndexByHeaderText(table, SelectorsProductionTasks.PRODUCTION_TASKS_NAME_COLUMN_TEXT);
    const row = await this.findRowByCellText(table, detailName, nameColumnIndex);

    await this.waitAndHighlight(row, { timeout: WAIT_TIMEOUTS.STANDARD });
    await row.dblclick();
    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.STANDARD);

    const dateText = await this.findFirstDateOnPage();
    logger.info(`Дата из карточки Производственного задания для "${detailName}": ${dateText || 'не найдена'}`);
    return dateText;
  }

  private async searchByName(detailName: string): Promise<void> {
    const searchInput = this.page.locator(SelectorsProductionTasks.PRODUCTION_TASKS_TABLE_SEARCH_INPUT).first();
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await searchInput.fill(detailName);
    await searchInput.press('Enter');
    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.STANDARD);
    logger.info(`Выполнен поиск на странице Производственные задания: ${detailName}`);
  }

  private async findVisibleTableWithRows(): Promise<Locator> {
    await this.page.locator(SelectorsProductionTasks.PRODUCTION_TASKS_TABLE).first().waitFor({
      state: 'attached',
      timeout: WAIT_TIMEOUTS.STANDARD,
    });

    const tables = this.page.locator(SelectorsProductionTasks.PRODUCTION_TASKS_TABLE);
    const tableCount = await tables.count();
    for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
      const table = tables.nth(tableIndex);
      if ((await table.isVisible()) && (await table.locator('tbody tr').count()) > 0) {
        return table;
      }
    }

    throw new Error('Не найдена видимая таблица со строками на странице Производственные задания');
  }

  private async findColumnIndexByHeaderText(table: Locator, headerText: string): Promise<number> {
    const headers = table.locator('thead th, thead td');
    const headerCount = await headers.count();

    for (let headerIndex = 0; headerIndex < headerCount; headerIndex++) {
      const actualText = this.normalizeTextValue(await headers.nth(headerIndex).innerText());
      if (actualText.includes(headerText)) {
        return headerIndex;
      }
    }

    throw new Error(`Не найден столбец "${headerText}" в таблице Производственные задания`);
  }

  private async findRowByCellText(table: Locator, expectedText: string, cellIndex: number): Promise<Locator> {
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = rows.nth(rowIndex);
      const cellText = await this.getCellText(row, cellIndex);
      if (cellText.includes(expectedText)) {
        return row;
      }
    }

    throw new Error(`Не найдена строка с текстом "${expectedText}" в таблице Производственные задания`);
  }

  private async getCellText(row: Locator, cellIndex: number): Promise<string> {
    const cell = row.locator('td').nth(cellIndex);
    if ((await cell.count()) === 0) {
      return '';
    }

    return this.normalizeTextValue(await cell.innerText());
  }

  private async findFirstDateOnPage(): Promise<string> {
    const pageText = await this.page.locator('body').innerText();
    const match = pageText.match(SelectorsProductionTasks.PRODUCTION_TASKS_DATE_PATTERN);
    return match ? match[0] : '';
  }

  private normalizeTextValue(value: string | null): string {
    return (value || '').replace(/\s+/g, ' ').trim();
  }
}
