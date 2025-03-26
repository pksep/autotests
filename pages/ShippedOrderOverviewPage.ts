import { expect, Page } from '@playwright/test';
import { PageObject, Click } from '../lib/Page';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';
import exp from 'constants';

// Страница:  Отгруженные заказы
export class CreateShippedOrderOverviewPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

      /** Retrieves the value from the cell in the first row of the table and can click on the cell
     * @param locator - the full locator of the table
     * @param cellIndex - the index of the cell from which to extract the value
     * @param click - whether to click on the cell
     */
      async getValueOrClickFromFirstRowNoTheadBUG(
        locator: string,
        cellIndex: number,
        click: Click = Click.No,
        dblclick: Click = Click.No
    ) {
        const rows = await this.page.locator(`${locator} tbody tr.td-row`);

        const rowCount = await rows.count();
        if (rowCount === 0) {
            throw new Error("В таблице нет строк.");
        }

        const firstRow = rows.nth(0);

        const cells = await firstRow.locator("td").allInnerTexts();

        if (cellIndex < 0 || cellIndex >= cells.length) {
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

    async shippingInformationModalWindow() {

    const locatorModalWindow = '[data-testid="ModalShComlitUpdate-RightDestroyModal"]';
    const modalWindow = await this.page.locator(locatorModalWindow);

    await expect(modalWindow).toBeVisible();
    await this.waitingTableBody(locatorModalWindow);

    await expect(
        modalWindow.locator("h3", { hasText: " Информация об Отгрузке " })
    ).toBeVisible();
    await expect(
      modalWindow.locator("h3", { hasText: "Примечание" })
  ).toBeVisible();
  await expect(
    modalWindow.locator("h3", { hasText: "Файлы" })
).toBeVisible();
await expect(
  modalWindow.locator("h3", { hasText: " Информация об отгруженном товаре " })
).toBeVisible();

// Check button
await this.clickButton(
  "  Отменить  ",
  '[data-testid="ModalShComlitUpdate-ButtonControlCancel"]',
  Click.No
);
await this.clickButton(
  " Отменить отгрузку ",
  '[data-testid="ModalShComlitUpdate-ButtonControlCancelShipment"]',
  Click.No
);
await this.clickButton(
  " Внести изменения в отгрузку ",
  '[data-testid="ModalShComlitUpdate-ButtonControlUpdateShipment"]',
  Click.No
);


  }
}
