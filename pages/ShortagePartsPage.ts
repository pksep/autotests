import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

// Страница: Дефицит деталей
export class CreatShortagePartsPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  /** Проверяем, что в первой строке содержится искомое имя
   * @param name - искомое значение
   * @param locator - локатор таблицы [data-testid=**]
   */
  async checkNameInLineFromFirstRowBUG(name: string, locator: string) {
    const cells = await this.page.locator(`${locator} tbody:nth-of-type(2) td`);

    const cellTexts = await cells.allInnerTexts();

    const containsSearchValue = cellTexts.some(cellText =>
      cellText.trim().toLowerCase().includes(name.trim().toLowerCase())
    );

    if (containsSearchValue) {
      logger.info('Имя найдено');

      const secondCell = cells.nth(1);
      const isSecondCellVisible = await secondCell.isVisible();

      if (isSecondCellVisible) {
        await secondCell.click();
        logger.info('Кликнули по второй ячейке');
      } else {
        logger.info('Вторая ячейка не видима для клика');
      }
    } else {
      logger.info('Имя не найдено');
    }

    await expect(containsSearchValue).toBe(true);
  }
}
