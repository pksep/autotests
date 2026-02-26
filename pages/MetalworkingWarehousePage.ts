import { Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import logger from '../lib/utils/logger';
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
}
