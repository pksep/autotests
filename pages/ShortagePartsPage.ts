import { expect, Page } from '@playwright/test';
import { PageObject, Click } from '../lib/Page';
import logger from '../lib/utils/logger';
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

  async getValueOrClickFromFirstRowBug(
    locator: string,
    cellIndex: number,
    click: Click = Click.No,
    dblclick: Click = Click.No
) {
    const rows = await this.page.locator(`${locator} tbody:nth-of-type(2) tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
        throw new Error("В таблице нет строк.");
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator("td").allInnerTexts();

    if (cellIndex < 0 || cellIndex > cells.length) {
        throw new Error(
            `Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`
        );
    }

    const valueInCell = cells[cellIndex];

    logger.info(
        `Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`
    );

    if (click === Click.Yes) {
        await firstRow.locator("td").nth(cellIndex).click();
        logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }
    if (dblclick === Click.Yes) {
        await firstRow.locator("td").nth(cellIndex).dblclick();
        logger.info(
            `Дважды кликнули по ячейке ${cellIndex} первой строки.`
        );
    }

    return valueInCell;
}
}
