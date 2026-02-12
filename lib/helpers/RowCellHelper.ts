/**
 * @file RowCellHelper.ts
 * @date 2025-01-20
 * @purpose Helper class for row and cell operations extracted from Page.ts
 * 
 * This helper handles:
 * - Getting values from table rows
 * - Clicking cells in rows
 * - Clicking icons in cells
 * - Checking names in rows
 * - Clicking table header cells
 */

import { Page, expect, Locator } from '@playwright/test';
import { Click } from '../Page';
import { expectSoftWithScreenshot } from '../utils/utilities';
import { TestInfo } from '@playwright/test';
import logger from '../logger';

export class RowCellHelper {
  constructor(private page: Page) {}

  /**
   * Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   * @param dblclick - whether to double-click on the cell
   * @returns The value in the cell
   */
  async getValueOrClickFromFirstRow(locator: string, cellIndex: number, click: Click = Click.No, dblclick: Click = Click.No) {
    const rows = await this.page.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);
    await firstRow.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    await this.page.waitForTimeout(5000);
    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex > cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];
    const cellLocator = firstRow.locator('td').nth(cellIndex);
    await cellLocator.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'red';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }
    if (dblclick === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).dblclick();
      logger.info(`Дважды кликнули по ячейке ${cellIndex} первой строки.`);
    }
    return valueInCell;
  }

  /**
   * Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the full locator of the table
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   * @param dblclick - whether to double-click on the cell
   */
  async getValueOrClickFromFirstRowNoThead(locator: string, cellIndex: number, click: Click = Click.No, dblclick: Click = Click.No) {
    const rows = await this.page.locator(`${locator} tbody tr.td-row`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex >= cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }
    if (dblclick === Click.Yes) {
      await firstRow.locator('td').nth(cellIndex).dblclick();
      logger.info(`Дважды кликнули по ячейке ${cellIndex} первой строки.`);
    }

    return valueInCell;
  }

  /**
   * Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the locator of the table [data-testid=**]
   * @param cellIndex - the index of the cell from which to extract the value
   * @param click - whether to click on the cell
   */
  async clickIconOperation(locator: string, cellIndex: number, click: Click = Click.No) {
    // Сначала дождемся появления таблицы
    await this.page.waitForSelector(`${locator} tbody tr.td-row`, {
      state: 'attached',
      timeout: 3000,
    });

    const rows = await this.page.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 1 || cellIndex > cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 1-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex - 1];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      const iconOperation = await firstRow
        .locator('td')
        .nth(cellIndex - 1)
        .locator('.link_img');
      await iconOperation.click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }

    return valueInCell;
  }

  /**
   * Retrieves the value from the cell in the first row of the table and can click on the cell
   * @param locator - the locator of the table [data-testid=**]
   * @param cellIndex - the index of the cell from which to extract the value (0-based)
   * @param click - whether to click on the cell
   */
  async clickIconOperationNew(locator: string, cellIndex: number, click: Click = Click.No) {
    const rows = await this.page.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    if (typeof cellIndex !== 'number') {
      throw new Error('Номер ячейки должен быть числом.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex >= cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);

    if (click === Click.Yes) {
      const iconOperation = await firstRow.locator('td').nth(cellIndex).locator('.link_img');
      await iconOperation.click();
      logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    }

    return valueInCell;
  }

  /**
   * Checks if the first row contains the specified name and marks the checkbox in the second cell
   * @param name - the value to search for
   * @param locator - the full locator of the table
   */
  async checkboxMarkNameInLineFromFirstRow(name: string, locator: string) {
    const cells = await this.page.locator(`${locator} tbody td`);

    const cellTexts = await cells.allInnerTexts();

    const containsSearchValue = cellTexts.some(cellText => cellText.trim().toLowerCase().includes(name.trim().toLowerCase()));

    if (containsSearchValue) {
      logger.info('Имя найдено');

      const secondCell = cells.nth(0);
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

  /**
   * Check that the first row contains the searched name
   * @param name - the searched value
   * @param locator - the full locator of the table
   * @param options - Optional configuration (testInfo for screenshots, description)
   */
  async checkNameInLineFromFirstRow(
    name: string,
    locator: string,
    options?: {
      testInfo?: TestInfo;
      description?: string;
    },
  ) {
    // Debug: Check if table has any rows at all
    const allRows = await this.page.locator(`${locator} tbody tr`);
    const rowCount = await allRows.count();
    console.log(`DEBUG: Total rows in table: ${rowCount}`);

    if (rowCount === 0) {
      console.log(`DEBUG: Table is empty - no rows found`);
      throw new Error(`Table is empty - no rows found in ${locator}`);
    }

    // Debug: Check what's in the first row
    const firstRow = await this.page.locator(`${locator} tbody tr:first-child`);
    const firstRowText = await firstRow.textContent();
    console.log(`DEBUG: First row text content: "${firstRowText?.trim()}"`);

    // Получаем ячейки только первой строки
    const cells = await this.page.locator(`${locator} tbody tr:first-child td`);

    const cellTexts = await cells.allInnerTexts();

    // Debug: Log all cell texts to see what's in the table
    console.log(`DEBUG: All cell texts in first row: [${cellTexts.map(text => `"${text.trim()}"`).join(', ')}]`);
    console.log(`DEBUG: Looking for: "${name.trim()}"`);

    // Находим ячейку, которая содержит искомое значение
    let foundValue = cellTexts.find(cellText => cellText.trim().toLowerCase().includes(name.trim().toLowerCase()));
    let foundRowIndex = 0;

    if (!foundValue) {
      // Дополнительная проверка: ищем значение в остальных строках таблицы
      const rows = await this.page.locator(`${locator} tbody tr`);
      const rowsCount = await rows.count();
      console.log(`DEBUG: Searching remaining ${rowsCount} rows for "${name.trim()}"`);

      for (let i = 0; i < rowsCount; i++) {
        const rowText = (await rows.nth(i).textContent())?.trim() || '';
        console.log(`DEBUG: Row ${i} content: "${rowText}"`);
        if (rowText.toLowerCase().includes(name.trim().toLowerCase())) {
          foundValue = rowText;
          foundRowIndex = i;
          console.warn(`Value "${name.trim()}" found in row ${i}, not in the first row.`);
          break;
        }
      }
    }

    // Логируем результат после проверки
    if (foundValue) {
      logger.info(`Имя найдено (row ${foundRowIndex})`);
    } else {
      logger.info('Имя не найдено');
    }

    // Проверяем, что значение найдено
    if (!foundValue) {
      // Provide more detailed error information
      const errorMessage =
        `Value "${name.trim()}" not found in table. ` +
        `Table has ${rowCount} row(s). ` +
        `First row content: "${firstRowText?.trim() || 'empty'}". ` +
        `All cell texts: [${cellTexts.map(text => `"${text.trim()}"`).join(', ')}]`;
      console.error(errorMessage);

      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(foundValue).toBeDefined();
        },
        options?.description ?? `Verify value "${name}" exists in first row. ${errorMessage}`,
        options?.testInfo,
      );
    } else {
      // Выводим найденное значение в консоль
      console.log(`Значение "${name}" найдено: ${foundValue || 'не найдено'}`);
    }

    return true;
  }

  /**
   * Click on the table header cell
   * @param cellIndex - the index of the header cell to click on (1-based)
   * @param locator - the full locator of the table
   */
  async clickOnTheTableHeaderCell(cellIndex: number, locator: string) {
    const headerCells = await this.page.locator(`${locator} thead th`);

    const cellCount = await headerCells.count();
    if (cellIndex < 1 || cellIndex > cellCount) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 1-${cellCount}.`);
    }

    await headerCells.nth(cellIndex - 1).click();
    logger.info(`Кликнули по ячейке ${cellIndex} заголовка таблицы.`);
  }
}
