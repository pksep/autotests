import { expect, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

// Страница:  Комплектация Изделий на план
export class CreateCompletingProductsToPlanPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  /**
   * After product kitting on the completion plan, open the production path from the Operations cell,
   * select the packaging operation row, add a completion mark, and close modals.
   * Required when the product tech process treats packaging as a separate service operation before receipt.
   */
  async markPackagingCompletionOnCompletionPlan(options: {
    tableSelector: string;
    searchInputDataTestId: string;
    productName: string;
    productDesignation: string;
    packagingOperationFullName: string;
  }): Promise<void> {
    await this.searchAndVerifyFirstRow(
      options.productName,
      options.tableSelector,
      options.tableSelector,
      {
        searchInputDataTestId: options.searchInputDataTestId,
      },
    );

    const operationsCell = this.page.locator(SelectorsAssemblyKittingOnThePlan.TABLE_ROW_PRODUCT_OPERATIONS_PATTERN).first();
    await operationsCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await operationsCell.scrollIntoViewIfNeeded();
    await this.waitAndHighlight(operationsCell, { timeout: WAIT_TIMEOUTS.STANDARD });
    await operationsCell.click();
    await this.page.waitForLoadState('networkidle');

    const modalRoot = this.page.locator(SelectorsAssemblyKittingOnThePlan.MODAL_PRODUCT_COMPLETION_OPERATION_PATH);
    await modalRoot.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const loader = this.page.locator(SelectorsAssemblyKittingOnThePlan.MODAL_OPERATION_PATH_LOADER);
    if ((await loader.count()) > 0) {
      await loader.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.LONG });
    }

    const opTable = modalRoot.locator(SelectorsAssemblyKittingOnThePlan.OPERATION_PATH_INFO_TABLE);
    await opTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const packagingRow = opTable
      .locator('tbody tr.operation-path-info__operation-row')
      .filter({ hasText: options.packagingOperationFullName })
      .first();
    await packagingRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await packagingRow.click();

    const addMark = this.page.locator(SelectorsAssemblyKittingOnThePlan.MODAL_OPERATION_PATH_ADD_MARK_BUTTON);
    await expect(addMark).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
    await addMark.click();
    await this.page.waitForLoadState('networkidle');

    await this.completionMarkModalWindow(
      options.packagingOperationFullName,
      options.productName,
      options.productDesignation,
    );

    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(TIMEOUTS.STANDARD);
    logger.info(`Отметка выполнения для операции «${options.packagingOperationFullName}» сохранена`);
  }
}
