import { Locator, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';
import { SELECTORS } from '../config';
import * as SelectorsMetalWorkingWarhouse from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as SelectorsMetalworkingOperations from '../lib/Constants/SelectorsMetalworkingOperations';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

// Страница: Металлообработка склад
export class CreateMetalworkingWarehousePage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async openMetalworkingWarehousePage(): Promise<void> {
    await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    await this.waitForNetworkIdle();
    await this.page
      .locator(SelectorsMetalWorkingWarhouse.SELECTOR_METAL_WORKING_WARHOUSE)
      .waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
    await this.findTable(SelectorsMetalWorkingWarhouse.SELECTOR_METAL_WORKING_WARHOUSE);
    await this.waitForNetworkIdle();
    logger.info('Открыта страница Заказ склада на металлообработку');
  }

  async getPlannedWarehouseReadyDate(detailName: string): Promise<string> {
    await this.openMetalworkingWarehousePage();
    await this.searchTable(
      detailName,
      SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
      SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_SEARCH_INPUT,
    );
    await this.waitForNetworkIdle();

    const table = this.page.locator(SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE).first();
    await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    const row = table.locator('tbody tr').first();
    await this.waitAndHighlight(row, { timeout: WAIT_TIMEOUTS.STANDARD });

    const dateShipmentCell = row.locator(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_TABLE_ROW_DATE_SHIPMENT_PATTERN).first();
    await this.waitAndHighlight(dateShipmentCell, { timeout: WAIT_TIMEOUTS.STANDARD });
    await dateShipmentCell.click();

    const modal = this.page.locator(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_WORKERS_MODAL).first();
    await modal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const modalTable = modal.locator(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_WORKERS_MODAL_TABLE).first();
    await modalTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const firstRow = modalTable.locator('tbody tr').first();
    const warehouseReadyCell = firstRow
      .locator(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_WORKERS_MODAL_WAREHOUSE_READY_CELL_PATTERN)
      .first();
    await this.waitAndHighlight(warehouseReadyCell, { timeout: WAIT_TIMEOUTS.STANDARD });

    const dateDisplay = warehouseReadyCell.locator(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_WORKERS_MODAL_DATE_DISPLAY).first();
    if ((await dateDisplay.count()) === 0) {
      logger.info(`Дата плановой готовности склада для "${detailName}" не заполнена в модальном окне`);
      return '';
    }

    const dateText = this.normalizeTextValue(await dateDisplay.innerText());
    const timeDisplay = warehouseReadyCell.locator(SelectorsMetalWorkingWarhouse.METALWORKING_SCLAD_WORKERS_MODAL_TIME_DISPLAY).first();
    const timeText = (await timeDisplay.count()) > 0 ? this.normalizeTextValue(await timeDisplay.innerText()) : '';
    const date = this.formatWarehouseReadyDate(dateText, timeText);

    logger.info(`Дата плановой готовности склада для "${detailName}" из модального окна: ${date || 'не заполнена'}`);
    return date;
  }

  /**
   * Archives all metalworking warehouse tasks for the given detail (repeatedly: select first row, archive, confirm, search again until no rows).
   * Call when already on Metalworking Warehouse page. Uses searchAndWaitForTable and archiveAndConfirm.
   * @returns Number of tasks archived.
   */
  async archiveAllMetalworkingTasksForDetail(
    detailName: string,
    options?: { maxArchives?: number },
  ): Promise<number> {
    const maxArchives = options?.maxArchives ?? 10;
    let archivedCount = 0;

    await this.searchAndWaitForTable(
      detailName,
      SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
      SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
      { searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT },
    );

    let rows = this.page.locator(`${SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE} tbody tr`);
    let rowCount = await rows.count();
    logger.info(`Found ${rowCount} task(s) to archive for ${detailName}`);

    while (rowCount > 0 && archivedCount < maxArchives) {
      const firstRow = rows.first();
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      const checkbox = firstRow.locator(SelectorsMetalworkingOperations.METALWORKING_ROW_CHECKBOX_SELECTOR).first();
      await checkbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await checkbox.click();

      await this.archiveAndConfirm(
        SelectorsMetalWorkingWarhouse.BUTTON_MOVE_TO_ARCHIVE_NEW,
        SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON,
      );
      archivedCount++;

      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      await this.searchAndWaitForTable(
        detailName,
        SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
        SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE,
        { searchInputDataTestId: SelectorsMetalworkingOperations.ORDER_METALWORKING_PAGE_TABLE_SEARCH_INPUT },
      );

      rows = this.page.locator(`${SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE} tbody tr`);
      let newRowCount = await rows.count();
      if (newRowCount === rowCount) {
        await this.page.waitForTimeout(TIMEOUTS.LONG);
        await this.waitForNetworkIdle();
        rows = this.page.locator(`${SelectorsMetalWorkingWarhouse.TABLE_METAL_WORKING_WARHOUSE} tbody tr`);
        newRowCount = await rows.count();
      }
      if (newRowCount === rowCount) {
        logger.info(`Row count unchanged after archive (${rowCount}), stopping`);
        break;
      }
      rowCount = newRowCount;
      logger.info(`Archived 1 task, ${rowCount} task(s) remaining for ${detailName}`);
    }

    if (archivedCount >= maxArchives) {
      logger.info(`Reached maximum archive limit (${maxArchives}), stopping`);
    }
    logger.info(`Completed archiving ${archivedCount} task(s) for ${detailName}`);
    return archivedCount;
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

    throw new Error(`Не найден столбец "${headerText}" в таблице Заказ склада на металлообработку`);
  }

  private async getCellText(row: Locator, cellIndex: number): Promise<string> {
    const cell = row.locator('td').nth(cellIndex);
    if ((await cell.count()) === 0) {
      return '';
    }

    return this.normalizeTextValue(await cell.innerText());
  }

  private formatWarehouseReadyDate(dateText: string, timeText: string): string {
    const normalizedDate = this.convertRussianMonthDateToNumeric(dateText);
    if (!normalizedDate) {
      return [dateText, timeText].filter(Boolean).join(' ');
    }

    return [normalizedDate, timeText].filter(Boolean).join(' ');
  }

  private convertRussianMonthDateToNumeric(dateText: string): string {
    const monthNumbers: Record<string, string> = {
      янв: '01',
      фев: '02',
      мар: '03',
      апр: '04',
      май: '05',
      мая: '05',
      июн: '06',
      июл: '07',
      авг: '08',
      сен: '09',
      сент: '09',
      окт: '10',
      ноя: '11',
      дек: '12',
    };
    const match = dateText.trim().match(/^([А-Яа-яЁё]+)\.?\s+(\d{1,2}),\s*(\d{4})$/);
    if (!match) {
      return '';
    }

    const [, monthName, day, year] = match;
    const month = monthNumbers[monthName.toLowerCase()];
    if (!month) {
      return '';
    }

    return `${day.padStart(2, '0')}.${month}.${year}`;
  }

  private normalizeTextValue(value: string | null): string {
    return (value || '').replace(/\s+/g, ' ').trim();
  }
}
