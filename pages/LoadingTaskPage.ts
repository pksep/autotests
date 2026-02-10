import { expect, Page, Locator, TestInfo } from '@playwright/test';
import { PageObject, ISpetificationData, expectSoftWithScreenshot } from '../lib/Page';
import { normalizeOrderNumber } from '../lib/utils/utilities';
import logger from '../lib/logger';
import { exec } from 'child_process';
import { time } from 'console';
import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import { SELECTORS } from '../config';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

// Страница: Задачи на отгрузку
export class CreateLoadingTaskPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  //  Выделить в таблице
  // async choiceProductInModal(nameProduct: string) {
  //     const firstRowCells = this.page.locator(
  //         '[data-testid="BasePaginationTable-TableBody-Dynamic"]:first-child td'
  //     );

  //     const cells = await firstRowCells.allInnerTexts();

  //     const index = cells.findIndex((cellText) =>
  //         cellText.includes(nameProduct)
  //     );

  //     if (index !== -1) {
  //         await firstRowCells.nth(index).click();
  //     } else {
  //         throw new Error(
  //             `Продукт "${nameProduct}" не найден в первой строке таблицы.`
  //         );
  //     }
  // }
  //  Выделить в таблице
  async choiceProductInModal(nameProduct: string) {
    // Получаем все ячейки из второго tbody (пропускаем первый tbody с поиском)
    const secondTbodyRows = this.page.locator('[data-testid="BasePaginationTable-TableBody-Dynamic"] tr');
    const firstRow = secondTbodyRows.first();
    const cells = firstRow.locator('td');

    // Получаем тексты всех ячеек первой строки
    const cellTexts = await cells.allInnerTexts();

    // Ищем индекс ячейки, содержащей искомый текст
    const index = cellTexts.findIndex(text => text.includes(nameProduct));

    if (index !== -1) {
      // Кликаем по найденной ячейке
      await cells.nth(index).click();
    } else {
      throw new Error(`Продукт "${nameProduct}" не найден в первой строке таблицы.`);
    }
  }

  // TEST
  async clickFromFirstRow(locator: string, cellIndex: number) {
    const rows = await this.page.locator(`${locator} tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex > cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);
    await firstRow.locator('td').nth(cellIndex).click();
    logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    return valueInCell;
  }

  // Проверить, что выбранное изделие отображается
  async checkProduct(nameProduct: string): Promise<boolean> {
    try {
      const product = await this.page.locator('.attachments-value .link').first().textContent();
      return (product?.trim() || '') === nameProduct;
    } catch (error) {
      logger.error(`Failed to check product: ${error}`);
      return false;
    }
  }

  // Выбрать покупателя
  async choiceBuyer(number: string) {
    const dropdownBuyer = this.page.locator('.buyer_select');
    expect(await dropdownBuyer.locator('option').count()).toBeGreaterThan(0);
    await expect(dropdownBuyer).toBeVisible();

    await dropdownBuyer.selectOption(number);
  }

  async getDateFromTableByName(variableName: string): Promise<string | null> {
    const firstRow = this.page.locator('table tr:first-child');

    const cells = await firstRow.locator('td').allInnerTexts(); // Получаем текст всех ячеек
    console.log('Cells:', cells); // Отладочное сообщение

    for (let i = 0; i < cells.length; i++) {
      console.log(`Checking cell: ${cells[i].trim()}`); // Отладочное сообщение
      if (cells[i].trim() === ' X ') {
        const dateInput = await firstRow.locator(`[data-testid="DatePicter-DatePicker-Input"]`).nth(i); // Получаем соответствующий input
        if ((await dateInput.count()) > 0) {
          try {
            const value = await dateInput.getAttribute('value');
            console.log('Found date:', value); // Отладочное сообщение
            return value; // Возвращаем значение из атрибута value
          } catch (error) {
            console.log('Error getting date value:', error);
            return null;
          }
        }
      }
    }

    return null; // Если имя не найдено или input не найден
  }

  async getOrderInfoFromLocator(locator: string) {
    // Get text from editTitle element where order number appears
    let orderNumber: string | null = null;
    let version: string | null = null;
    let orderDate: string | null = null;

    try {
      await this.waitForTimeout(2000);
      const editTitleText = await this.page.locator(LoadingTasksSelectors.editTitle).innerText();
      console.log('Text from editTitle:', editTitleText);

      // Trim "Редактирование заказа" from the start - the rest is the order number
      const trimmed = editTitleText
        .trim()
        .replace(/^Редактирование заказа\s*/, '')
        .trim();
      console.log('Trimmed text:', trimmed);

      // Extract order number (format: "№ 25-4899" or "25-4899" or "25-4899 /0")
      // Handle "№" character that may appear before the number
      const orderNumberMatch = trimmed.match(/№?\s*(\d+-\d+)(?:\s*\/(\d+))?/);
      if (orderNumberMatch) {
        orderNumber = orderNumberMatch[1];
        version = orderNumberMatch[2] || null;
      }
    } catch (e) {
      console.log('Could not get order number from editTitle:', e);
    }

    // Get date from the main locator
    const text = await this.page.locator(locator).innerText();
    console.log('Text to parse from main locator:', text);

    // Extract date
    const dateRegex = /Дата заказа:\s*([А-Яа-я]+ \d+, \d{4})/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      orderDate = dateMatch[1];
    }

    // Order number is required
    if (!orderNumber) {
      console.log('No order number found. editTitle text may not contain order number yet.');
      throw new Error('Не удалось извлечь номер заказа. Возможно, страница еще не перезагрузилась.');
    }

    // Order date is required
    if (!orderDate) {
      console.log('No order date found in text:', text);
      throw new Error('Не удалось извлечь дату заказа из текста: ' + text);
    }

    return {
      orderNumber: orderNumber,
      version: version,
      orderDate: orderDate,
    };
  }
  async getOrderDateInfoFromLocator(locator: string) {
    // Get text from editTitle element where order number appears
    let orderNumber: string | null = null;
    let version: string | null = null;
    let orderDate: string | null = null;

    try {
      await this.waitForTimeout(2000);
      const editTitleText = await this.page.locator(LoadingTasksSelectors.editTitle).innerText();
      console.log('Text from editTitle:', editTitleText);

      // Trim "Редактирование заказа" from the start - the rest is the order number
      const trimmed = editTitleText
        .trim()
        .replace(/^Редактирование заказа\s*/, '')
        .trim();
      console.log('Trimmed text:', trimmed);

      // Extract order number (format: "№ 25-4899" or "25-4899" or "25-4899 /0")
      // Handle "№" character that may appear before the number
      const orderNumberMatch = trimmed.match(/№?\s*(\d+-\d+)(?:\s*\/(\d+))?/);
      if (orderNumberMatch) {
        orderNumber = orderNumberMatch[1];
        version = orderNumberMatch[2] || null;
      }
    } catch (e) {
      console.log('Could not get order number from editTitle:', e);
    }

    // Get date from the main locator
    const text = await this.page.locator(locator).innerText();
    console.log('Text to parse from main locator:', text);

    // Extract date - get everything after "от"
    const dateRegex = /от\s+(.+)/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      orderDate = dateMatch[1].trim();
    }

    // Order number is required
    if (!orderNumber) {
      console.log('No order number found. editTitle text may not contain order number yet.');
      throw new Error('Не удалось извлечь номер заказа. Возможно, страница еще не перезагрузилась.');
    }

    // Order date is required
    if (!orderDate) {
      console.log('No order date found in text:', text);
      throw new Error('Не удалось извлечь дату заказа из текста: ' + text);
    }

    return {
      orderNumber: orderNumber,
      version: version,
      orderDate: orderDate,
    };
  }
  /** Checks and enters the quantity in the order modal window
   * @param locator - selector for the quantity input field
   * @param quantity - expected value in the input (checked only if quantityOrder is not provided)
   * @param quantityOrder - if specified, enters this value in the input field
   */
  async checkOrderQuantity(locator: string, quantity: string, quantityOrder?: string) {
    const input = this.page.locator(locator).locator('input');

    if (quantityOrder) {
      // Если указано quantityOrder, просто вводим его значение
      await input.fill(quantityOrder);
    } else {
      // Если quantityOrder не указан, проверяем текущее значение с quantity
      const currentValue = await input.inputValue();
      expect(currentValue).toBe(quantity);
    }
  }

  /** Checks if a button is visible and active/inactive
   * @param selector - selector for the button
   * @param expectedState - expected state of the button ('active' or 'inactive')
   * @returns Promise<boolean> - true if button state matches expected, false otherwise
   */
  async checkButtonState(selector: string, expectedState: 'active' | 'inactive'): Promise<boolean> {
    const button = this.page.locator(selector);

    // Проверяем, что кнопка видима
    await expect(button).toBeVisible();

    // Получаем классы кнопки
    const classes = await button.getAttribute('class');

    if (expectedState === 'active') {
      // Проверяем, что кнопка активна (нет класса disabled-yui-kit)
      return !classes?.includes('disabled-yui-kit');
    } else {
      // Проверяем, что кнопка неактивна (есть класс disabled-yui-kit)
      return classes?.includes('disabled-yui-kit') ?? false;
    }
  }

  async clickFromFirstRowBug(locator: string, cellIndex: number) {
    const modalWindow = await this.page.locator('.modal-yui-kit__modal-content');
    const rows = await modalWindow.locator(`${locator} tbody tr`);

    const rowCount = await rows.count();
    if (rowCount === 0) {
      throw new Error('В таблице нет строк.');
    }

    const firstRow = rows.nth(0);

    const cells = await firstRow.locator('td').allInnerTexts();

    if (cellIndex < 0 || cellIndex > cells.length) {
      throw new Error(`Индекс ячейки ${cellIndex} вне диапазона. Доступные ячейки: 0-${cells.length}.`);
    }

    const valueInCell = cells[cellIndex];

    logger.info(`Значение в ячейке ${cellIndex} первой строки: ${valueInCell}`);
    await firstRow.locator('td').nth(cellIndex).click();
    logger.info(`Кликнули по ячейке ${cellIndex} первой строки.`);
    return valueInCell;
  }

  async urgencyDate(month: Month, day: string) {
    await this.page.locator('.date-picker-yui-kit__header-btn').nth(2).click();
    await this.page.locator('.vc-popover-content-wrapper.is-interactive').nth(2).isVisible();

    await this.page.locator('.vc-title-wrapper').click();
    // Находим элемент с годом
    const yearElement = await this.page.locator('.vc-nav-title.vc-focus');
    const currentYear = await yearElement.textContent();
    if (!currentYear) throw new Error('Year element not found');

    const targetYear = 2025;
    const currentYearNum = parseInt(currentYear);
    console.log(`Current year: ${currentYear}, Target year: ${targetYear}`);

    // Если текущий год не равен целевому
    if (currentYearNum !== targetYear) {
      // Определяем, нужно ли увеличивать или уменьшать год
      const isYearLess = currentYearNum < targetYear;
      const arrowSelector = isYearLess ? '.vc-nav-arrow.is-right.vc-focus' : '.vc-nav-arrow.is-left.vc-focus';

      // Кликаем на стрелку, пока не достигнем нужного года
      while (currentYearNum !== targetYear) {
        await this.page.locator(arrowSelector).click();
        await this.page.waitForTimeout(500); // Небольшая задержка для обновления

        const newYear = await yearElement.textContent();
        if (!newYear) throw new Error('Year element not found');
        const newYearNum = parseInt(newYear);

        if (newYearNum === targetYear) {
          console.log(`Year successfully set to ${targetYear}`);
          break;
        }
      }
    } else {
      console.log(`Year is already set to ${targetYear}`);
    }

    // Проверяем, что год установлен правильно
    const finalYear = await yearElement.textContent();
    if (!finalYear) throw new Error('Year element not found');
    expect(parseInt(finalYear)).toBe(targetYear);

    await this.page.locator(`[aria-label="${month}"]`).click();
    await this.page.locator('.vc-day-content.vc-focusable.vc-focus.vc-attr', { hasText: day }).nth(0).click();
  }

  /**
   * Archives (moves to archive) all shipment tasks that contain the given product name
   * on the main "Задачи на отгрузку" (Shipping Tasks) page.
   *
   * This method:
   * - repeatedly searches by product name
   * - filters out "Итого" and colspan rows
   * - selects the last data row for that product
   * - clicks the Archive button and confirms dialogs
   * - stops when no data rows with the product name remain
   *
   * It is resilient to:
   * - the tbody becoming empty / only total row remaining
   * - stale row locators after deletion
   * - click interception by header controls (e.g. history buttons)
   */
  async archiveAllShipmentTasksByProduct(productName: string, options?: { maxIterations?: number }): Promise<number> {
    const page = this.page;
    const tableBody = page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE_BODY);
    const maxIterations = options?.maxIterations ?? 100;

    const waitForShipmentsTableReady = async () => {
      // Table body may be hidden when there are no data rows - that's OK
      await tableBody.waitFor({ state: 'attached', timeout: 10000 }).catch(async () => {
        await page.waitForTimeout(1000);
        await tableBody.waitFor({ state: 'attached', timeout: 5000 });
      });

      await tableBody.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
        // Hidden tbody usually means there are no rows (all archived) – treat as success
        logger.info('Shipments table body is hidden (likely no data rows)');
      });
    };

    const searchByProductName = async () => {
      const table = page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE);
      const searchContainer = table.locator(`[data-testid="${LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT}"]`).first();

      // Wait for search container to be visible
      await searchContainer.waitFor({ state: 'visible', timeout: 10000 });

      // For dropdown inputs, click the container first to open it
      try {
        await searchContainer.click({ timeout: 2000 });
        await page.waitForTimeout(300);
      } catch {
        // Container might already be open
      }

      // Find the input element inside the container (YSearch component)
      let searchInput = searchContainer.locator('input').first();

      // Try locating input directly with data-testid
      const directInput = table.locator(`input[data-testid="${LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT}"]`).first();

      try {
        await directInput.waitFor({ state: 'visible', timeout: 2000 });
        searchInput = directInput;
      } catch {
        // Fall back to container input
      }

      // Wait for the input to be visible or at least attached
      try {
        await searchInput.waitFor({ state: 'visible', timeout: 5000 });
      } catch {
        await searchInput.waitFor({ state: 'attached', timeout: 5000 });
      }

      // Clear and fill without clicking (dialogs may intercept clicks)
      await searchInput.evaluate((el: HTMLInputElement) => {
        el.value = '';
      });
      await page.waitForTimeout(200);
      await searchInput.fill(productName);
      await page.waitForTimeout(300);

      // Press Enter to trigger search
      await searchInput.press('Enter');
      await this.waitForNetworkIdle();
      await page.waitForTimeout(1000);

      // tbody may be attached but hidden when empty – that's OK
      await tableBody.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
      await waitForShipmentsTableReady();
    };

    const getMatchingRows = async (): Promise<{ count: number; lastRow: Locator | null }> => {
      const allRows = tableBody.locator('tr');
      const totalRowCount = await allRows.count();
      const matchingRowsList: Locator[] = [];

      for (let i = 0; i < totalRowCount; i++) {
        const row = allRows.nth(i);
        const rowText = await row.textContent();
        const hasItogo = rowText?.includes('Итого:') || false;

        const firstCell = row.locator('td').first();
        const colspan = await firstCell.getAttribute('colspan');
        const hasColspan15 = colspan === '15';

        if (!hasItogo && !hasColspan15) {
          const rowTextContent = rowText || '';
          if (rowTextContent.includes(productName)) {
            matchingRowsList.push(row);
          }
        }
      }

      const lastRow = matchingRowsList.length > 0 ? matchingRowsList[matchingRowsList.length - 1] : null;
      return { count: matchingRowsList.length, lastRow };
    };

    const archiveLastItem = async (lastRow: Locator): Promise<boolean> => {
      try {
        await lastRow.scrollIntoViewIfNeeded();
        await this.highlightElement(lastRow, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);

        // Click the DateOrder cell to select the row (same approach as selectRowAndClickEdit)
        const dateOrderCell = lastRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-DateOrder"]').first();

        const dateOrderCellExists = await dateOrderCell.count();
        if (dateOrderCellExists === 0) {
          logger.warn('DateOrder cell does not exist, row may have been deleted.');
          return false;
        }

        await dateOrderCell.waitFor({ state: 'visible', timeout: 10000 });
        await dateOrderCell.scrollIntoViewIfNeeded();
        await this.highlightElement(dateOrderCell, {
          backgroundColor: 'cyan',
          border: '2px solid blue',
          color: 'black',
        });
        await page.waitForTimeout(500);

        // Try normal click first, then force click if needed
        try {
          await dateOrderCell.click({ timeout: 10000 });
        } catch {
          // If normal click fails, try force click
          await dateOrderCell.click({ force: true, timeout: 10000 });
        }

        // Wait a bit for row selection to register
        await page.waitForTimeout(500);

        const archiveButton = page.locator(LoadingTasksSelectors.buttonArchive);
        await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

        // Check if button is enabled, retry a few times if needed
        let isEnabled = await archiveButton.isEnabled();
        if (!isEnabled) {
          // Retry enabling state a few times
          for (let retry = 0; retry < 5; retry++) {
            isEnabled = await archiveButton.isEnabled();
            if (isEnabled) break;
            await page.waitForTimeout(500);
          }
        }

        if (!isEnabled) {
          logger.error('Archive button is disabled after selecting row.');
          return false;
        }

        await this.highlightElement(archiveButton, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        await archiveButton.click();

        // Optional mini-prompt confirmation
        const promptModal = page.locator('[data-testid^="IssueShipment-ModalPromptMini-Archive"]').first();
        if (await promptModal.isVisible({ timeout: 3000 }).catch(() => false)) {
          const confirmPromptButton = promptModal.locator('[data-testid="ModalPromptMini-Button-Confirm"]');
          await confirmPromptButton.waitFor({ state: 'visible', timeout: 5000 });
          await this.highlightElement(confirmPromptButton, {
            backgroundColor: 'yellow',
            border: '2px solid red',
            color: 'blue',
          });
          await page.waitForTimeout(500);
          await confirmPromptButton.click();
        }

        const confirmButton = page.locator(SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON).first();
        await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
        await this.highlightElement(confirmButton, {
          backgroundColor: 'yellow',
          border: '2px solid red',
          color: 'blue',
        });
        await page.waitForTimeout(500);
        await confirmButton.click();

        const loader = page.locator('[data-testid="IssueShipment-ActionsButtons-Loader"]');
        await loader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
        await this.waitForNetworkIdle();
        await page.waitForTimeout(2000);

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.warn(`Failed to archive last item: ${errorMessage}`);
        return false;
      }
    };

    // Perform initial search
    await searchByProductName();
    let iteration = 1;
    let archivedCount = 0;

    // While results present
    while (true) {
      // Perform search (refresh)
      await searchByProductName();

      // Get matching rows
      const { count: remainingRows, lastRow } = await getMatchingRows();
      logger.info(`Archive iteration ${iteration}, remaining rows with "${productName}": ${remainingRows}`);

      // If no results, break
      if (remainingRows === 0 || lastRow === null) {
        logger.info('✅ All shipment rows for product have been archived. No more rows to delete.');
        break;
      }

      // If result is present, archive last item
      const archived = await archiveLastItem(lastRow);
      if (!archived) {
        logger.warn(`Failed to archive item at iteration ${iteration}. Re-searching to check if item was actually archived...`);
        // Re-search to see if the item was actually archived despite the error
        await searchByProductName();
        const { count: remainingAfterFailed, lastRow: remainingRow } = await getMatchingRows();
        if (remainingAfterFailed === 0 || remainingRow === null) {
          // Item was actually archived, just the button state check failed
          logger.info('Item was actually archived despite button state check failure.');
          archivedCount++;
          break;
        }
        // If item still exists and we can't archive it, try one more time with a longer wait
        if (remainingAfterFailed === remainingRows) {
          logger.warn('Item still exists after failed archive attempt. Waiting longer and retrying...');
          await page.waitForTimeout(2000);
          await searchByProductName();
          const { count: retryRemaining, lastRow: retryRow } = await getMatchingRows();
          if (retryRemaining > 0 && retryRow !== null) {
            const retryArchived = await archiveLastItem(retryRow);
            if (!retryArchived) {
              logger.error(`Failed to archive item after retry. Breaking to avoid infinite loop.`);
              break;
            }
            archivedCount++;
          } else {
            // Item was archived during the wait
            archivedCount++;
            break;
          }
        } else {
          // Item count changed, continue
          archivedCount++;
        }
      } else {
        archivedCount++;
      }

      iteration += 1;
      logger.info(`Completed archive iteration ${iteration - 1}. Re-running search to refresh the table...`);

      if (iteration > maxIterations) {
        throw new Error(
          `Превышено максимальное количество итераций архивирования (${maxIterations}). Остались строки с "${productName}" после ${iteration} итераций.`,
        );
      }
    }

    return archivedCount;
  }

  /**
   * Verifies that there are no shipment tasks for a given product name
   * on the main "Задачи на отгрузку" (Shipping Tasks) page.
   *
   * Treats empty / hidden tbody as success (all items deleted).
   */
  async verifyAllShipmentTasksDeleted(productName: string, testInfo?: TestInfo): Promise<number> {
    const page = this.page;
    const tableBody = page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE_BODY);

    const waitForShipmentsTableReady = async () => {
      // When all items are deleted, the table body might not exist or be visible
      // This is a success condition, so we handle it gracefully
      await tableBody.waitFor({ state: 'attached', timeout: 3000 }).catch(async () => {
        // Table body might not exist when there are no results - this is OK
        logger.info('Shipments table body not found - likely no results (success condition)');
        await page.waitForTimeout(1000);
      });
      await tableBody.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {
        // Table body might not be visible when there are no results - this is OK
        logger.info('Shipments table body not visible - likely no results (success condition)');
      });
    };

    const searchOrder = async (searchTerm: string) => {
      // When all items are deleted, the table might be empty - this is a success condition
      try {
        await this.searchAndWaitForTable(searchTerm, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.SHIPMENTS_TABLE_BODY, {
          searchInputDataTestId: LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT,
          timeoutBeforeWait: 1000,
          minRows: 0, // Allow 0 rows (items might not exist) - this is success when verifying deletion
        });
      } catch (error) {
        // If search fails because table is empty/hidden (no results), this is actually success
        logger.info(`Search completed - table may be empty (success condition): ${String(error)}`);
        await page.waitForTimeout(1000); // Give time for any UI updates
      }
    };

    await this.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
    await this.waitForNetworkIdle();

    const pageContainer = page.locator(LoadingTasksSelectors.issueShipmentPage);
    await pageContainer.waitFor({ state: 'visible', timeout: 3000 });
    expect.soft(await pageContainer.isVisible()).toBe(true);

    // Search for shipment tasks with productName
    logger.info(`Verifying no shipment tasks exist for product name: ${productName}`);
    await searchOrder(productName);
    await waitForShipmentsTableReady();

    // Filter out total rows and count data rows
    // When all items are deleted, the table body might be empty or not exist - this is success
    let dataRowCount = 0;
    let totalRowCount = 0;

    try {
      const rows = tableBody.locator('tr');
      totalRowCount = await rows.count();

      if (totalRowCount > 0) {
        for (let i = 0; i < totalRowCount; i++) {
          const row = rows.nth(i);
          const rowText = await row.textContent();
          const hasItogo = rowText?.includes('Итого:') || false;

          const firstCell = row.locator('td').first();
          const colspan = await firstCell.getAttribute('colspan');
          const hasColspan15 = colspan === '15';

          if (!hasItogo && !hasColspan15) {
            const rowTextContent = rowText || '';
            if (rowTextContent.includes(productName)) {
              dataRowCount++;
            }
          }
        }
      }
    } catch (error) {
      // If table body doesn't exist or has no rows, dataRowCount is already 0 (success)
      logger.info(`Shipments table body empty or not accessible - this is success (all items deleted): ${String(error)}`);
      dataRowCount = 0;
    }

    logger.info(`Verify shipments: found ${dataRowCount} shipment tasks with "${productName}" (total rows: ${totalRowCount})`);

    if (dataRowCount > 0) {
      logger.error(`❌ Expected 0 shipment tasks for "${productName}", but found ${dataRowCount}. Deletion is incomplete.`);
      throw new Error(`Shipment tasks deletion not complete. Found ${dataRowCount} remaining shipment tasks with "${productName}". Expected 0.`);
    }

    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(dataRowCount).toBe(0);
      },
      `Verify all shipment tasks are deleted: expected 0, found ${dataRowCount}.`,
      testInfo,
    );

    if (dataRowCount === 0) {
      logger.info(`✅ All shipment tasks with "${productName}" are deleted.`);
    }

    return dataRowCount;
  }

  /**
   * Verifies that there are no warehouse orders for a given product name
   * on the "Склад" (Warehouse) → "Задачи на отгрузку" page.
   */
  async verifyNoWarehouseOrdersForProduct(productName: string, testInfo?: TestInfo): Promise<number> {
    const page = this.page;

    await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    await this.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    // Click on shipping tasks button to go to orders page
    const shippingTasksButton = page.locator('[data-testid="Sclad-shippingTasks"]');
    await shippingTasksButton.waitFor({ state: 'visible', timeout: 3000 });
    await shippingTasksButton.scrollIntoViewIfNeeded();
    await this.highlightElement(shippingTasksButton, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await page.waitForTimeout(500);
    await shippingTasksButton.click();
    await this.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    // Locate the warehouse table
    const warehouseTable = page.locator('[data-testid="IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Table"]');
    await warehouseTable.waitFor({ state: 'visible', timeout: 10000 });
    await warehouseTable.scrollIntoViewIfNeeded();
    await this.highlightElement(warehouseTable, {
      backgroundColor: 'cyan',
      border: '2px solid blue',
      color: 'black',
    });
    await page.waitForTimeout(500);

    // Find and use the search input field (manual approach like Test Case 3)
    const searchInput = page.locator('[data-testid="IssueToPull-ShipmentsTableBlock-ShippingTasks-ShipmentsTable-Thead-SearchInput-Dropdown-Input"]');

    // Wait for search input with longer timeout and try multiple approaches
    try {
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    } catch (error) {
      // If not visible, try attached state
      try {
        await searchInput.waitFor({ state: 'attached', timeout: 5000 });
        logger.info('Search input found in DOM but not visible, attempting to interact anyway');
      } catch (e) {
        logger.error(`Could not find search input: ${error}`);
        throw new Error(`Search input not found on warehouse orders page: ${error}`);
      }
    }

    await searchInput.scrollIntoViewIfNeeded();
    await this.highlightElement(searchInput, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await page.waitForTimeout(500);

    // Try clicking the container first (for dropdown inputs)
    try {
      await searchInput.click({ timeout: 2000 });
      await page.waitForTimeout(300);
    } catch (e) {
      // Container might already be open, continue
      logger.info('Search input container might already be open');
    }

    // Find the actual input element inside the container
    let actualInput = searchInput.locator('input').first();
    const inputCount = await actualInput.count();
    if (inputCount === 0) {
      // If no input inside, try using the container itself
      actualInput = searchInput;
    }

    // Wait for input to be ready
    await actualInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      // Try attached state if not visible
      return actualInput.waitFor({ state: 'attached', timeout: 5000 });
    });

    // Search by product name
    await actualInput.fill('');
    await page.waitForTimeout(200);
    await actualInput.fill(productName);
    await page.waitForTimeout(300);

    const currentValue = await actualInput.inputValue();
    logger.info(`Search field value before Enter: "${currentValue}"`);

    await actualInput.press('Enter');
    await this.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    const finalValue = await actualInput.inputValue();
    logger.info(`Search field value after Enter: "${finalValue}"`);
    logger.info(`Search performed for: "${productName}"`);

    // Additional 1 second pause after searching before checking results
    await page.waitForTimeout(1000);

    // Wait for any loading indicators to disappear
    const loadingIndicator = page.locator('[data-testid*="loading"], [data-testid*="Loading"], .loading, .spinner').first();
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {
      // Loading indicator might not exist, which is fine
    });

    // Additional wait to ensure search results are rendered
    await page.waitForTimeout(1000);

    // Wait for table to stabilize - check row count multiple times to ensure it's not still loading
    const warehouseTableBody = warehouseTable.locator('tbody');
    let previousRowCount = -1;
    let stableCount = 0;
    const maxStabilityChecks = 3; // Reduced from 5 to limit total wait time

    for (let i = 0; i < maxStabilityChecks; i++) {
      await warehouseTableBody.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {
        // Table body might not exist when there are no results - this is OK (success)
        logger.info('Warehouse table body not found - likely no results (success condition)');
      });

      await page.waitForTimeout(500); // Reduced wait between checks

      const currentRows = warehouseTableBody.locator('tr');
      const currentRowCount = await currentRows.count().catch(() => 0);

      if (currentRowCount === previousRowCount) {
        stableCount++;
        if (stableCount >= 2) {
          // Row count has been stable for 2 checks, table is ready
          break;
        }
      } else {
        stableCount = 0;
        previousRowCount = currentRowCount;
      }
    }

    // Final wait to ensure table is fully rendered
    await page.waitForTimeout(500);
    await this.waitForNetworkIdle();

    // Additional 1 second pause after searching before validating results
    await page.waitForTimeout(1000);

    // Verify no rows are returned
    // When all items are deleted, the table body might be empty or not visible - this is success
    await warehouseTableBody.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
      // Table body might not be visible when there are no results - this is OK (success)
      logger.info('Warehouse table body not visible - likely no results (success condition)');
    });

    const warehouseRows = warehouseTableBody.locator('tr');
    const totalRowCount = await warehouseRows.count().catch(() => 0);

    // Filter rows to only count those that actually contain the product name
    // The search might return all rows if filtering isn't working, so we need to verify each row
    let warehouseRowCount = 0;
    if (totalRowCount > 0) {
      for (let i = 0; i < totalRowCount; i++) {
        const row = warehouseRows.nth(i);
        const rowText = await row.textContent().catch(() => '');
        if (rowText && rowText.includes(productName)) {
          warehouseRowCount++;
        }
      }
    }

    logger.info(`Verify warehouse: found ${warehouseRowCount} warehouse orders with "${productName}" (total rows in table: ${totalRowCount})`);

    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(warehouseRowCount).toBe(0);
      },
      `Verify all warehouse orders are deleted: expected 0, found ${warehouseRowCount}`,
      testInfo,
    );

    if (warehouseRowCount === 0) {
      logger.info(`✅ All warehouse orders with "${productName}" are deleted.`);
    } else {
      logger.warn(`⚠️ ${warehouseRowCount} warehouse orders with "${productName}" remain after deletion attempt.`);
    }

    return warehouseRowCount;
  }

  /**
   * Verifies that there are no deficit entries for a given product name
   * on the "Дефицит продукции" (Deficit Products) page.
   */
  async verifyNoDeficitEntriesForProduct(productName: string, testInfo?: TestInfo): Promise<number> {
    const page = this.page;

    await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    await this.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    // Open Дефицит продукции (Deficit Products) page
    const deficitProductionButton = page.locator(SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION);
    await deficitProductionButton.waitFor({ state: 'visible', timeout: 3000 });
    await deficitProductionButton.scrollIntoViewIfNeeded();
    await this.highlightElement(deficitProductionButton, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await page.waitForTimeout(500);
    await deficitProductionButton.click();
    await this.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    // Locate the deficit table
    const deficitMainTable = page.locator(SelectorsShortagePages.TABLE_DEFICIT_IZD);
    await deficitMainTable.waitFor({ state: 'visible', timeout: 3000 });
    await deficitMainTable.scrollIntoViewIfNeeded();
    await this.highlightElement(deficitMainTable, {
      backgroundColor: 'cyan',
      border: '2px solid blue',
      color: 'black',
    });
    await page.waitForTimeout(500);

    // Find and use the search input field
    const searchInput = deficitMainTable.locator('input[data-testid="DeficitIzdTable-Search-Dropdown-Input"]').first();
    await searchInput.waitFor({ state: 'visible', timeout: 3000 });
    await searchInput.scrollIntoViewIfNeeded();
    await this.highlightElement(searchInput, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await page.waitForTimeout(500);

    // Search by product name
    await searchInput.fill('');
    await searchInput.fill(productName);
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await this.waitForNetworkIdle();
    await page.waitForTimeout(1000);

    // Additional 1 second pause after searching before validating results
    await page.waitForTimeout(1000);

    // Verify no rows are returned
    // When all items are deleted, the table body might be empty or not visible - this is success
    const deficitTableBody = deficitMainTable.locator('tbody');
    await deficitTableBody.waitFor({ state: 'attached', timeout: 3000 }).catch(() => {
      logger.info('Deficit table body not found - likely no results (success condition)');
    });
    await deficitTableBody.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {
      logger.info('Deficit table body not visible - likely no results (success condition)');
    });

    const deficitRows = deficitTableBody.locator('tr');
    const deficitRowCount = await deficitRows.count().catch(() => 0); // If table doesn't exist, count is 0 (success)
    logger.info(`Verify deficit: found ${deficitRowCount} deficit entries with "${productName}"`);

    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(deficitRowCount).toBe(0);
      },
      `Verify all deficit entries are deleted: expected 0, found ${deficitRowCount}`,
      testInfo,
    );

    if (deficitRowCount === 0) {
      logger.info(`✅ All deficit entries with "${productName}" are deleted.`);
    } else {
      logger.warn(`⚠️ ${deficitRowCount} deficit entries with "${productName}" remain after deletion attempt.`);
    }

    return deficitRowCount;
  }

  /**
   * Searches for an order by order number and opens it for editing
   * @param orderNumber - The order number to search for
   * @returns true if the operation was successful, false otherwise
   */
  async findOrderAndClickEdit(orderNumber: string): Promise<boolean> {
    try {
      // Ensure we're on the shipping tasks page and it's fully loaded
      await this.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await this.waitForNetworkIdle();

      // Wait for IssueShipment page to load
      const issueShipmentPage = this.page.locator(LoadingTasksSelectors.issueShipmentPage);
      await issueShipmentPage.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for table body to load
      const initialTableBody = this.page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE_BODY);
      await initialTableBody.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();

      // Search for order number
      await this.searchAndWaitForTable(orderNumber, LoadingTasksSelectors.SHIPMENTS_TABLE, LoadingTasksSelectors.SHIPMENTS_TABLE_BODY, {
        useRedesign: true,
        searchInputDataTestId: LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT,
        timeoutBeforeWait: 1000,
      });

      // Wait for contents to finish loading
      await this.waitForNetworkIdle();

      // Find and click on the row containing the order number
      const orderRow = this.page.locator(`${LoadingTasksSelectors.SHIPMENTS_TABLE} tbody tr`).filter({ hasText: orderNumber }).first();
      await orderRow.waitFor({ state: 'visible', timeout: 10000 });

      // Click on the 3rd td in the row
      const thirdCell = orderRow.locator('td').nth(2);
      await thirdCell.waitFor({ state: 'visible', timeout: 10000 });
      await thirdCell.click();

      // Wait for table body to load after clicking
      const tableBodyAfterClick = this.page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE_BODY);
      await tableBodyAfterClick.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();

      // Find the edit button
      const editButton = this.page.locator('button[data-testid*="IssueShipment-ActionsButtons-EditOrder"]').filter({ hasText: 'Редактировать' });
      await editButton.waitFor({ state: 'visible', timeout: 10000 });

      // Check if button is enabled
      const isEnabled = await editButton.isEnabled();
      if (!isEnabled) {
        logger.error('Edit order button is disabled; cannot proceed.');
        return false;
      }

      // Click the edit button
      await editButton.scrollIntoViewIfNeeded();
      await this.highlightElement(editButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);
      await editButton.click();
      await this.waitForNetworkIdle();

      return true;
    } catch (error) {
      logger.error(`Failed to find order and click edit: ${error}`);
      return false;
    }
  }

  /**
   * Selects a row in the shipments table by clicking on the DateOrder cell and then clicks the edit button
   * @param tableBody - The table body locator
   * @returns true if the operation was successful, false otherwise
   */
  async selectRowAndClickEdit(tableBody: Locator): Promise<boolean> {
    try {
      const firstRow = tableBody.locator('tr').first();
      await firstRow.waitFor({ state: 'visible', timeout: 10000 });

      // Click the DateOrder cell to select the row
      const dateOrderCell = firstRow.locator('[data-testid^="IssueShipment-ShipmentsTableBlock-Main-ShipmentsTable-Product-DateOrder"]').first();
      await dateOrderCell.waitFor({ state: 'visible', timeout: 10000 });
      await dateOrderCell.scrollIntoViewIfNeeded();
      await this.highlightElement(dateOrderCell, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);
      await dateOrderCell.click();

      const editButton = this.page.locator('[data-testid="IssueShipment-ActionsButtons-EditOrder"]').filter({ hasText: 'Редактировать' }).first();
      await editButton.waitFor({ state: 'visible', timeout: 10000 });
      const isEnabled = await editButton.isEnabled();
      if (!isEnabled) {
        logger.error('Edit order button is disabled; cannot proceed.');
        return false;
      }
      await editButton.scrollIntoViewIfNeeded();
      await this.highlightElement(editButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);
      await editButton.click();
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      return true;
    } catch (error) {
      logger.error(`Failed to select row and click edit: ${error}`);
      return false;
    }
  }

  /**
   * Increases the order quantity by a specified amount and saves
   * @param increaseBy - Amount to increase by (default: 2)
   * @returns The new quantity value if successful, null otherwise
   */
  async increaseQuantityAndSave(increaseBy: number = 2): Promise<string | null> {
    try {
      const quantityInput = this.page.locator('[data-testid="AddOrder-Quantity-InputNumber-Input"]');
      await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
      await quantityInput.scrollIntoViewIfNeeded();
      await this.highlightElement(quantityInput, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);

      const currentValue = await quantityInput.inputValue();
      const currentValueNum = parseInt(currentValue, 10) || 0;
      const newValue = (currentValueNum + increaseBy).toString();

      await quantityInput.clear();
      await this.page.waitForTimeout(200);
      await quantityInput.fill(newValue);
      await this.page.waitForTimeout(300);

      const inputValueAfterFill = await quantityInput.inputValue();
      if (inputValueAfterFill !== newValue) {
        logger.error(`Failed to set quantity: expected ${newValue}, got ${inputValueAfterFill}`);
        return null;
      }

      // Click save button
      const saveButton = this.page.locator('[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Save"]').first();
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });

      // Scroll to bottom of page to avoid any overlaying elements
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(500);

      // Wait for table to finish rendering to avoid overlaying elements
      const positionsTable = this.page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]').first();
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Scroll the button into view
      await saveButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      await this.highlightElement(saveButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);

      // Always use JavaScript click to bypass any overlaying table cells
      // This ensures the click works even if a table cell is covering the button
      await saveButton.evaluate((button: HTMLElement) => {
        (button as HTMLButtonElement).click();
      });

      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(2000);

      // Wait for the positions table to reload
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      return newValue;
    } catch (error) {
      logger.error(`Failed to increase quantity and save: ${error}`);
      return null;
    }
  }

  /**
   * Decreases the order quantity by a specified amount and saves
   * @param decreaseBy - Amount to decrease by (default: 2)
   * @returns The new quantity value if successful, null otherwise
   */
  async decreaseQuantityAndSave(decreaseBy: number = 2): Promise<string | null> {
    try {
      const quantityInput = this.page.locator('[data-testid="AddOrder-Quantity-InputNumber-Input"]');
      await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
      await quantityInput.scrollIntoViewIfNeeded();
      await this.highlightElement(quantityInput, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);

      const currentValue = await quantityInput.inputValue();
      const currentValueNum = parseInt(currentValue, 10) || 0;
      // Minimum quantity is 1, not 0
      const newValue = Math.max(1, currentValueNum - decreaseBy).toString();

      await quantityInput.clear();
      await this.page.waitForTimeout(200);
      await quantityInput.fill(newValue);
      await this.page.waitForTimeout(300);

      const inputValueAfterFill = await quantityInput.inputValue();
      if (inputValueAfterFill !== newValue) {
        logger.error(`Failed to set quantity: expected ${newValue}, got ${inputValueAfterFill}`);
        return null;
      }

      // Click save button
      const saveButton = this.page.locator('[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Save"]').first();
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });

      // Scroll to bottom of page to avoid any overlaying elements
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(500);

      // Wait for table to finish rendering to avoid overlaying elements
      const positionsTable = this.page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]').first();
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Scroll the button into view
      await saveButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      await this.highlightElement(saveButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);

      // Always use JavaScript click to bypass any overlaying table cells
      // This ensures the click works even if a table cell is covering the button
      await saveButton.evaluate((button: HTMLElement) => {
        (button as HTMLButtonElement).click();
      });

      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(2000);

      // Wait for the positions table to reload
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      return newValue;
    } catch (error) {
      logger.error(`Failed to decrease quantity and save: ${error}`);
      return null;
    }
  }

  /**
   * Cancels the current edit operation and returns to the main orders page
   * @returns true if cancel was successful and we're back on the main orders page, false otherwise
   */
  async cancelEditOrder(): Promise<boolean> {
    try {
      const cancelButton = this.page.locator('[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsCenter-Cancel"]').first();
      await cancelButton.waitFor({ state: 'visible', timeout: 10000 });

      // Scroll to bottom of page to avoid any overlaying elements
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(500);

      // Wait for table to finish rendering to avoid overlaying elements
      const positionsTable = this.page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]').first();
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Scroll the button into view
      await cancelButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      await this.highlightElement(cancelButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);

      // Always use JavaScript click to bypass any overlaying table cells
      // This ensures the click works even if a table cell is covering the button
      await cancelButton.evaluate((button: HTMLElement) => {
        (button as HTMLButtonElement).click();
      });

      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Verify we're back on the main orders page
      const pageContainer = this.page.locator(LoadingTasksSelectors.issueShipmentPage);
      await pageContainer.waitFor({ state: 'visible', timeout: 10000 });
      const isVisible = await pageContainer.isVisible();

      return isVisible;
    } catch (error) {
      logger.error(`Failed to cancel edit order: ${error}`);
      return false;
    }
  }

  /**
   * Waits for a table to stabilize by checking row count remains constant
   * @param tableBody - locator for the table body
   * @param maxIterations - maximum number of iterations to check (default: 3)
   * @param checkInterval - interval between checks in ms (default: 500)
   */
  async waitForTableStable(tableBody: Locator, maxIterations: number = 3, checkInterval: number = 300): Promise<void> {
    const rows = tableBody.locator('tr');
    let previousRowCount = -1;

    for (let i = 0; i < maxIterations; i++) {
      const currentRowCount = await rows.count();
      if (currentRowCount === previousRowCount && currentRowCount > 0) {
        break; // Table is stable
      }
      previousRowCount = currentRowCount;
      if (i < maxIterations - 1) {
        // Don't wait on last iteration
        await this.page.waitForTimeout(checkInterval);
      }
    }
  }

  /**
   * Selects a product from the product modal dialog
   * Searches by product name or article number and selects the matching row
   * @param productName - name of the product to select
   * @param articleNumber - optional article number as fallback
   */
  async selectProductInModal(productName: string, articleNumber?: string): Promise<boolean> {
    try {
      const modal = this.page.locator(LoadingTasksSelectors.modalListProductNew);

      // Wait for modal to be visible
      await modal.waitFor({ state: 'visible', timeout: 10000 });

      // Wait for table body to load
      const tableBody = modal.locator('tbody');
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });

      // Get search input
      const searchInput = modal.locator(LoadingTasksSelectors.searchDropdownInputNew).first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });

      // Clear and enter product name in search
      await searchInput.fill('');
      await searchInput.fill(productName);
      await searchInput.press('Enter');

      // Wait for search results to load
      await this.page.waitForTimeout(1000);
      await this.waitForNetworkIdle();

      // Wait for table to stabilize
      await this.waitForTableStable(tableBody);

      // Find and click product row - use more flexible matching
      let productRow = tableBody.locator('tr').filter({ hasText: productName });

      if ((await productRow.count()) === 0 && articleNumber) {
        logger.warn(`Product "${productName}" not found by name. Trying article number "${articleNumber}".`);
        await searchInput.fill('');
        await searchInput.fill(articleNumber);
        await searchInput.press('Enter');

        // Wait for search results to load
        await this.page.waitForTimeout(1000);
        await this.waitForNetworkIdle();

        // Wait for table to stabilize
        await this.waitForTableStable(tableBody);

        productRow = tableBody.locator('tr').filter({ hasText: articleNumber });
      }

      // If still not found, try partial match
      if ((await productRow.count()) === 0) {
        logger.warn(`Exact match not found for "${productName}". Trying partial match.`);
        const allRows = tableBody.locator('tr');
        const rowCount = await allRows.count();

        for (let i = 0; i < rowCount; i++) {
          const row = allRows.nth(i);
          const rowText = (await row.textContent())?.trim() || '';
          if (rowText.includes(productName)) {
            productRow = row;
            break;
          }
        }
      }

      if ((await productRow.count()) === 0) {
        logger.error(`Could not find product row with name "${productName}" in the modal.`);
        return false;
      }

      await productRow.first().waitFor({ state: 'visible', timeout: 10000 });
      await productRow.first().click();
      logger.info('Clicked on product row in modal table');
      return true;
    } catch (error) {
      logger.error(`Failed to select product in modal: ${error}`);
      return false;
    }
  }

  /**
   * Selects a buyer from the buyer modal dialog
   * @param buyerName - name of the buyer to search for
   */
  async selectBuyerInModal(buyerName: string): Promise<void> {
    const modal = this.page.locator(LoadingTasksSelectors.modalListBuyer);

    // Wait for modal to be visible
    await modal.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for table body to be visible
    const tableBody = modal.locator('tbody');
    await tableBody.waitFor({ state: 'visible', timeout: 10000 });

    // Search for buyer
    const modalWindow = this.page.locator('.modal-yui-kit__modal-content');
    const searchTable = modalWindow.locator('.search-yui-kit__input').nth(0);
    await searchTable.fill(buyerName);
    await searchTable.press('Enter');

    // Wait for search results to appear in table (more targeted than network idle)
    await tableBody
      .locator('tr')
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});

    // Click first row in buyer modal table
    await this.clickFromFirstRowBug('.table-yui-kit__border.table-yui-kit-with-scroll', 0);

    // Click Add button
    await this.clickButton('Добавить', LoadingTasksSelectors.buttonAddBuyerOnModalWindow);
    logger.info('Selected buyer from modal');
  }

  /**
   * Selects a date using the calendar component
   * @param year - target year (e.g., 2025)
   * @param monthIndex - month index (1-12, where 1 = January, matching the calendar's nth() index)
   * @param day - day of month (e.g., 23)
   */
  async selectCalendarDate(year: number, monthIndex: number, day: number): Promise<boolean> {
    try {
      await this.page.locator(LoadingTasksSelectors.calendarTrigger).click();
      await this.page.locator(LoadingTasksSelectors.calendarPopover).isVisible();

      // Scope to the calendar component
      const calendar = this.page.locator(LoadingTasksSelectors.calendarComponent);

      // Open the years popup by clicking the header year button
      const yearButton = calendar.locator('button[id^="open-years-popup"]').first();
      await yearButton.waitFor({ state: 'visible' });
      await yearButton.click();

      // Scope to the open years popover
      const yearsPopover = this.page.locator('wa-popover[for^="open-years-popup"][open]').first();
      await yearsPopover.waitFor({ state: 'visible' });

      // Select target year directly inside the open years popover
      // Some builds render part="year " (with a trailing space) — use starts-with selector
      const yearCell = yearsPopover.locator('[part^="year"]', { hasText: String(year) }).first();
      await yearCell.waitFor({ state: 'visible', timeout: 10000 });
      await yearCell.click();

      // Verify selection reflects on the header year button
      const finalYearText = ((await yearButton.textContent()) || '').trim();
      expect(parseInt(finalYearText, 10)).toBe(year);

      // Open months popup and select month
      const monthButton = calendar.locator('button[id^="open-months-popup"]').first();
      await monthButton.waitFor({ state: 'visible' });
      await monthButton.click();

      const monthsPopover = this.page.locator('wa-popover[for^="open-months-popup"][open]').first();
      await monthsPopover.waitFor({ state: 'visible' });

      // Click month (Month index: 1 = January, so nth(monthIndex) matches calendar's indexing)
      const monthCell = monthsPopover.locator('div[part^="month"]').nth(monthIndex);
      await monthCell.waitFor({ state: 'visible' });
      await monthCell.click({ force: true });

      // Wait for month button to show month name to confirm selection
      await monthButton.waitFor({ state: 'visible' });
      await this.page.waitForTimeout(1000); // Give time for the selection to register

      // Pick the day by aria-label - construct aria-label like "January 23rd, 2025"
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = monthNames[monthIndex - 1]; // Convert from 1-based to 0-based for array

      // Determine day suffix (1st, 2nd, 3rd, 4th, etc.)
      let daySuffix = 'th';
      if (day === 1 || day === 21 || day === 31) {
        daySuffix = 'st';
      } else if (day === 2 || day === 22) {
        daySuffix = 'nd';
      } else if (day === 3 || day === 23) {
        daySuffix = 'rd';
      }

      const ariaLabel = `${monthName} ${day}${daySuffix}, ${year}`;
      await calendar.locator(`button[role="gridcell"][aria-label="${ariaLabel}"]`).first().click();
      logger.info(`Selected calendar date: ${day}.${monthIndex}.${year}`);
      return true;
    } catch (error) {
      logger.error(`Failed to select calendar date: ${error}`);
      return false;
    }
  }

  /**
   * Extracts order number, full order number, and order date from the edit title
   * @returns Object with shipmentTaskNumber, fullOrderNumber, and shipmentOrderDate
   */
  async extractOrderNumberFromTitle(): Promise<{ shipmentTaskNumber: string; fullOrderNumber: string; shipmentOrderDate: string }> {
    const editTitleElement = this.page.locator(LoadingTasksSelectors.editTitle);

    // Use waitForFunction for efficient polling
    await this.page.waitForFunction(
      testId => {
        const element = document.querySelector(`[data-testid="${testId}"]`);
        if (!element) return false;
        const text = element.textContent || '';
        return /Редактирование заказа\s+№\s+\d+-\d+/.test(text);
      },
      'AddOrder-EditTitle',
      { timeout: 30000 },
    );

    // Get the text
    const titleText = (await editTitleElement.textContent())?.trim() || '';
    logger.info('Title text:', titleText);

    // Extract order number: remove "Редактирование заказа" and everything from "/" onwards
    // Pattern: "Редактирование заказа  № 25-4546 /0 от 18.11.2025"
    const orderNumberMatch = titleText.match(/Редактирование заказа\s+№\s+([^/\s]+)/);
    let shipmentTaskNumber = orderNumberMatch ? orderNumberMatch[1].trim() : '';

    // Extract FULL order number: everything after "№" including the "от <date>" part
    const fullOrderNumberMatch = titleText.match(/Редактирование заказа\s+№\s+(.+)/);
    let fullOrderNumber = fullOrderNumberMatch ? fullOrderNumberMatch[1].trim() : '';

    // Extract order date: everything after "от "
    const orderDateMatch = titleText.match(/от\s+(.+)$/);
    let shipmentOrderDate = orderDateMatch ? orderDateMatch[1].trim() : '';

    // Fallback: if any values are missing, read from table and date display
    const hasDigits = (value?: string): boolean => !!value && /\d/.test(value);

    if (!hasDigits(shipmentTaskNumber) || !hasDigits(fullOrderNumber)) {
      const orderNumberCell = this.page.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-NumberOrder"]').first();
      await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
      const orderNumberCellText = (await orderNumberCell.textContent())?.trim() || '';

      if (!hasDigits(fullOrderNumber) && orderNumberCellText) {
        fullOrderNumber = orderNumberCellText;
      }

      if (!hasDigits(shipmentTaskNumber) && orderNumberCellText) {
        const baseOrderMatch = orderNumberCellText.match(/([0-9-]+)/);
        shipmentTaskNumber = baseOrderMatch ? baseOrderMatch[1] : orderNumberCellText;
      }
    }

    if (!shipmentOrderDate) {
      const orderDateDisplay = this.page.locator('[data-testid="AddOrder-DateOrder-Calendar-DataPicker-Choose-Value-Display"]');
      await orderDateDisplay.waitFor({ state: 'visible', timeout: 10000 });
      shipmentOrderDate = (await orderDateDisplay.textContent())?.trim() || '';
    }

    return {
      shipmentTaskNumber,
      fullOrderNumber,
      shipmentOrderDate,
    };
  }

  /**
   * Navigates to the Shipping Tasks page and waits for it to load
   */
  async navigateToShippingTasksPage(): Promise<boolean> {
    try {
      await this.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      // Wait for page to load by checking for the create button
      const createOrderButton = this.page.locator(LoadingTasksSelectors.buttonCreateOrder);
      await createOrderButton.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      logger.error(`Failed to navigate to shipping tasks page: ${error}`);
      return false;
    }
  }

  /**
   * Clicks the Create Order button on the Shipping Tasks page
   */
  async clickCreateOrderButton(): Promise<boolean> {
    try {
      await this.clickButton('Создать заказ', LoadingTasksSelectors.buttonCreateOrder);
      await this.waitForNetworkIdle();
      return true;
    } catch (error) {
      logger.error(`Failed to click create order button: ${error}`);
      return false;
    }
  }

  /**
   * Clicks the Изделие Выбрать (Product Select) button
   */
  async clickProductSelectButton(): Promise<boolean> {
    try {
      const choiceIzdButton = this.page.locator(LoadingTasksSelectors.buttonChoiceIzd, { hasText: 'Выбрать' }).first();
      await choiceIzdButton.waitFor({ state: 'visible', timeout: 10000 });
      await choiceIzdButton.click();
      logger.info('Clicked on Изделие Выбрать button');
      return true;
    } catch (error) {
      logger.error(`Failed to click product select button: ${error}`);
      return false;
    }
  }

  /**
   * Opens the product selection modal by clicking the Select button
   * @returns true if the operation was successful, false otherwise
   */
  async openProductSelectionModal(): Promise<boolean> {
    try {
      const selectAttachmentButton = this.page.locator('[data-testid="AddOrder-AttachmentsButtons-Select"]').first();
      await selectAttachmentButton.waitFor({ state: 'visible', timeout: 10000 });
      await selectAttachmentButton.scrollIntoViewIfNeeded();
      await this.highlightElement(selectAttachmentButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);
      await selectAttachmentButton.click();
      await this.waitForNetworkIdle();

      // Verify modal is visible
      const modal = this.page.locator(LoadingTasksSelectors.modalListProductNew).first();
      await modal.waitFor({ state: 'visible', timeout: 10000 });
      return true;
    } catch (error) {
      logger.error(`Failed to open product selection modal: ${error}`);
      return false;
    }
  }

  /**
   * Clicks the "Добавить новое изделие к заказу" (Add new product to order) button
   * @returns true if the operation was successful, false otherwise
   */
  async clickAddNewProductToOrderButton(): Promise<boolean> {
    try {
      const addNewProductButton = this.page
        .locator('button[data-testid="AddOrder-ButtonSaveAndCancel-ButtonsRight-AddNewIzd"]')
        .filter({ hasText: 'Добавить новое изделие к заказу' })
        .first();
      await addNewProductButton.waitFor({ state: 'visible', timeout: 10000 });

      // Scroll to bottom of page to avoid any overlaying elements at the top
      await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.page.waitForTimeout(500);

      // Wait for table to finish rendering to avoid overlaying elements
      const positionsTable = this.page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]').first();
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Scroll the button into view
      await addNewProductButton.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      await this.highlightElement(addNewProductButton, {
        backgroundColor: 'yellow',
        border: '2px solid red',
        color: 'blue',
      });
      await this.page.waitForTimeout(500);

      // Try regular click with force first
      try {
        await addNewProductButton.click({ force: true });
      } catch (clickError) {
        // If regular click fails due to overlay, use JavaScript click to bypass it
        logger.warn('Regular click failed, trying JavaScript click instead');
        await addNewProductButton.evaluate((button: HTMLElement) => {
          (button as HTMLButtonElement).click();
        });
      }

      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      logger.error(`Failed to click Add new product to order button: ${error}`);
      return false;
    }
  }

  /**
   * Clicks the Add button in the product modal and waits for product to be added
   */
  async clickAddButtonInProductModal(): Promise<boolean> {
    try {
      const addButton = this.page
        .locator(`${LoadingTasksSelectors.modalListProductNew} .base-modal__section-button-return button`, {
          hasText: 'Добавить',
        })
        .first();
      await addButton.waitFor({ state: 'visible', timeout: 10000 });
      await addButton.click({ force: true });
      // Wait for modal to close - check for product to appear instead of full network idle
      await this.page.locator('.attachments-value .link').first().waitFor({ state: 'visible', timeout: 10000 });
      logger.info('Clicked Add button in product modal');
      return true;
    } catch (error) {
      logger.error(`Failed to click add button in product modal: ${error}`);
      return false;
    }
  }

  /**
   * Selects a buyer by clicking the buyer button and selecting from modal
   * @param buyerName - name of the buyer to select
   */
  async selectBuyer(buyerName: string): Promise<boolean> {
    try {
      const choiceBuyerButton = this.page.locator(LoadingTasksSelectors.buttonChoiceBuyer);
      await choiceBuyerButton.waitFor({ state: 'visible', timeout: 10000 });
      await choiceBuyerButton.click();

      // Select buyer using the extracted method (it handles modal waiting internally)
      await this.selectBuyerInModal(buyerName);
      return true;
    } catch (error) {
      logger.error(`Failed to select buyer: ${error}`);
      return false;
    }
  }

  /**
   * Enters quantity in the Количество (Quantity) input field
   * @param quantity - quantity value to enter
   */
  async enterQuantity(quantity: string): Promise<boolean> {
    try {
      const quantityInput = this.page.locator(LoadingTasksSelectors.quantityInput);
      await quantityInput.waitFor({ state: 'visible', timeout: 10000 });
      await quantityInput.fill(quantity);

      // Verify value was set (retry if needed)
      let inputValue = await quantityInput.inputValue();
      if (inputValue !== quantity) {
        await quantityInput.fill(quantity);
        inputValue = await quantityInput.inputValue();
      }
      logger.info(`Entered quantity: ${quantity}`);
      return inputValue === quantity;
    } catch (error) {
      logger.error(`Failed to enter quantity: ${error}`);
      return false;
    }
  }

  /**
   * Saves the order by clicking the Save button and waiting for save to complete
   */
  async saveOrder(): Promise<boolean> {
    try {
      const saveButton = this.page.locator(LoadingTasksSelectors.buttonSaveOrder);
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.scrollIntoViewIfNeeded();
      // Highlight the save button and wait before clicking
      await this.waitAndHighlight(saveButton, { waitAfter: 500 });
      await saveButton.click({ force: true });
      // Wait for edit title to appear (indicates save completed) instead of full network idle
      await this.page.locator(LoadingTasksSelectors.editTitle).waitFor({ state: 'attached', timeout: 15000 });
      logger.info('Order saved successfully');
      return true;
    } catch (error) {
      logger.error(`Failed to save order: ${error}`);
      return false;
    }
  }

  /**
   * Extracts text content from a cell in the positions table with highlighting
   * @param cellSelector - The selector for the cell
   * @returns The trimmed text content of the cell
   */
  async getCellValueFromPositionsTable(cellSelector: string): Promise<string> {
    const cell = this.page.locator(cellSelector).first();
    await cell.waitFor({ state: 'visible', timeout: 10000 });
    await cell.scrollIntoViewIfNeeded();
    await this.highlightElement(cell, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(500);
    return ((await cell.textContent()) || '').trim();
  }

  /**
   * Searches for an order and verifies the first row matches expected values
   * @param searchTerm - The term to search for
   * @param expectedOrderNumber - Expected order number in the result
   * @param expectedArticleNumber - Expected article number in the result
   * @param expectedProductName - Expected product name in the result
   * @returns true if all verifications pass, false otherwise
   */
  async searchAndVerifyRowMatches(
    searchTerm: string,
    expectedOrderNumber: string,
    expectedArticleNumber: string,
    expectedProductName: string,
  ): Promise<boolean> {
    try {
      // Get search input
      const searchInputWrapper = this.page.locator(LoadingTasksSelectors.SHIPMENTS_SEARCH_INPUT_SELECTOR).first();
      await searchInputWrapper.waitFor({ state: 'visible', timeout: 10000 });
      await searchInputWrapper.scrollIntoViewIfNeeded();

      let searchInput: Locator;
      const tagName = await searchInputWrapper.evaluate((el: HTMLElement) => el.tagName.toLowerCase()).catch(() => '');
      if (tagName === 'input') {
        searchInput = searchInputWrapper;
        await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      } else {
        searchInput = searchInputWrapper.locator('input').first();
        const inputCount = await searchInput.count();
        if (inputCount > 0) {
          await searchInput.waitFor({ state: 'visible', timeout: 10000 });
          await searchInput.scrollIntoViewIfNeeded();
        } else {
          searchInput = searchInputWrapper;
        }
      }

      // Perform search
      await searchInput.fill('');
      await searchInput.fill(searchTerm);
      await searchInput.press('Enter');
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(1000);

      // Wait for table to load and find the row that matches expected order number
      const tableBody = this.page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE_BODY);
      await tableBody.waitFor({ state: 'visible', timeout: 10000 });

      // Normalize expected order number (remove "№" and extra spaces)
      const normalizedExpected = normalizeOrderNumber(expectedOrderNumber);

      // Find the row that matches the expected order number
      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();
      let matchingRow: Locator | null = null;

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const orderNumberCell = row.locator(LoadingTasksSelectors.SHIPMENTS_ORDER_NUMBER_PATTERN).first();
        if ((await orderNumberCell.count()) > 0) {
          await orderNumberCell.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
          const cellOrderNumber = ((await orderNumberCell.textContent()) || '').trim();
          const normalizedCell = normalizeOrderNumber(cellOrderNumber);

          // Check if this row matches the expected order number
          if (normalizedCell.includes(normalizedExpected) || normalizedExpected.includes(normalizedCell.split(' от ')[0])) {
            matchingRow = row;
            break;
          }
        }
      }

      if (!matchingRow) {
        logger.error(`Could not find row with expected order number "${expectedOrderNumber}"`);
        return false;
      }

      // Verify the matching row has correct article and product name
      // Check article number
      const articleCell = matchingRow.locator(LoadingTasksSelectors.SHIPMENTS_ARTICLE_PATTERN).first();
      await articleCell.waitFor({ state: 'visible', timeout: 10000 });
      const cellArticle = ((await articleCell.textContent()) || '').trim();
      if (cellArticle !== expectedArticleNumber) {
        logger.error(`Article number mismatch: expected "${expectedArticleNumber}", got "${cellArticle}"`);
        return false;
      }

      // Check product name
      const productNameCell = matchingRow.locator(LoadingTasksSelectors.SHIPMENTS_PRODUCT_NAME_PATTERN).first();
      await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
      const cellProductName = ((await productNameCell.textContent()) || '').trim();
      if (!cellProductName.includes(expectedProductName)) {
        logger.error(`Product name mismatch: expected "${expectedProductName}", got "${cellProductName}"`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Failed to search and verify row matches: ${error}`);
      return false;
    }
  }

  /**
   * Normalizes order numbers by removing "№" symbol and extra spaces
   * @param orderNum - The order number to normalize
   * @returns Normalized order number
   */

  /**
   * Finds a row in a table that matches the expected order number
   * @param tableBody - Locator for the table body
   * @param expectedOrderNumber - The expected order number to find
   * @param orderNumberCellSelector - Optional selector for the order number cell (defaults to common patterns)
   * @returns The matching row locator, or null if not found
   */
  async findRowByOrderNumber(tableBody: Locator, expectedOrderNumber: string, orderNumberCellSelector?: string): Promise<Locator | null> {
    try {
      const normalizedExpected = normalizeOrderNumber(expectedOrderNumber);
      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();

      // Use provided selector or default to common patterns
      const cellSelector = orderNumberCellSelector || '[data-testid*="NumberOrder"], [data-testid*="Order"]';

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const orderNumberCell = row.locator(cellSelector).first();
        if ((await orderNumberCell.count()) > 0) {
          await orderNumberCell.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
          const cellOrderNumber = ((await orderNumberCell.textContent()) || '').trim();
          const normalizedCell = normalizeOrderNumber(cellOrderNumber);

          // Check if this row matches the expected order number
          if (normalizedCell.includes(normalizedExpected) || normalizedExpected.includes(normalizedCell.split(' от ')[0])) {
            return row;
          }
        }
      }
      return null;
    } catch (error) {
      logger.error(`Failed to find row by order number: ${error}`);
      return null;
    }
  }

  /**
   * Gets a cell value from the shipments table (list page)
   * @param rowSelector - Selector for the row (e.g., 'tr.first()')
   * @param cellSelector - Selector for the cell within the row
   * @returns The trimmed text content of the cell
   */
  async getCellValueFromShipmentsTable(rowSelector: string, cellSelector: string): Promise<string> {
    const tableBody = this.page.locator(LoadingTasksSelectors.SHIPMENTS_TABLE_BODY);
    const row = tableBody.locator(rowSelector).first();
    const cell = row.locator(cellSelector).first();
    await cell.waitFor({ state: 'visible', timeout: 10000 });
    await cell.scrollIntoViewIfNeeded();
    await this.highlightElement(cell, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(500);
    return ((await cell.textContent()) || '').trim();
  }

  /**
   * Gets a cell value from the edit page positions table
   * @param cellSelector - The selector for the cell
   * @returns The trimmed text content of the cell
   */
  async getCellValueFromEditPage(cellSelector: string): Promise<string> {
    const cell = this.page.locator(cellSelector).first();
    await cell.waitFor({ state: 'visible', timeout: 10000 });
    await cell.scrollIntoViewIfNeeded();
    await this.highlightElement(cell, {
      backgroundColor: 'yellow',
      border: '2px solid red',
      color: 'blue',
    });
    await this.page.waitForTimeout(500);
    return ((await cell.textContent()) || '').trim();
  }

  /**
   * Opens an order in a new tab and returns the page
   * @param orderNumber - The order number to search for and open
   * @returns The new Page instance with the order opened in edit mode
   */
  async openOrderInNewTab(orderNumber: string): Promise<Page> {
    const context = this.page.context();
    const newPage = await context.newPage();
    const newPageLoadingTaskPage = new CreateLoadingTaskPage(newPage);

    try {
      await newPageLoadingTaskPage.goto(SELECTORS.MAINMENU.SHIPPING_TASKS.URL);
      await newPageLoadingTaskPage.waitForNetworkIdle();
      await newPage.waitForTimeout(1000);

      const success = await newPageLoadingTaskPage.findOrderAndClickEdit(orderNumber);
      if (!success) {
        throw new Error(`Failed to open order ${orderNumber} in new tab`);
      }

      return newPage;
    } catch (error) {
      await newPage.close().catch(() => {});
      throw error;
    }
  }

  /**
   * Verifies a row in the positions table matches expected values
   * @param rowIndex - The index of the row to verify (0-based)
   * @param expectedOrderSuffix - Expected order suffix (e.g., '/0', '/1', '/2')
   * @param expectedProductName - Expected product name (partial match)
   * @param expectedArticleNumber - Optional expected article number (exact match)
   * @returns true if all verifications pass, false otherwise
   */
  async verifyPositionsTableRow(rowIndex: number, expectedOrderSuffix: string, expectedProductName: string, expectedArticleNumber?: string): Promise<boolean> {
    try {
      const positionsTable = this.page.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Table"]').first();
      await positionsTable.waitFor({ state: 'visible', timeout: 10000 });
      const bodyRows = positionsTable.locator('tbody tr');
      const row = bodyRows.nth(rowIndex);
      await row.waitFor({ state: 'visible', timeout: 10000 });

      // Verify order number contains expected suffix
      const orderNumberCell = row.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-NumberOrder"]').first();
      if ((await orderNumberCell.count()) === 0) {
        logger.error(`Row ${rowIndex}: Order number cell not found`);
        return false;
      }
      await orderNumberCell.waitFor({ state: 'visible', timeout: 10000 });
      const orderNumberText = ((await orderNumberCell.textContent()) || '').trim();
      if (!orderNumberText.includes(expectedOrderSuffix)) {
        logger.error(`Row ${rowIndex}: Order number "${orderNumberText}" does not contain suffix "${expectedOrderSuffix}"`);
        return false;
      }

      // Verify product name
      const productNameCell = row.locator('[data-testid="AddOrder-PositionInAccount-ShipmentsTable-Product-Wrapper"]').first();
      if ((await productNameCell.count()) === 0) {
        logger.error(`Row ${rowIndex}: Product name cell not found`);
        return false;
      }
      await productNameCell.waitFor({ state: 'visible', timeout: 10000 });
      const productNameText = ((await productNameCell.textContent()) || '').trim();
      if (!productNameText.includes(expectedProductName)) {
        logger.error(`Row ${rowIndex}: Product name "${productNameText}" does not include "${expectedProductName}"`);
        return false;
      }

      // Verify article number if provided
      if (expectedArticleNumber) {
        const articleCell = row.locator('[data-testid^="AddOrder-PositionInAccount-ShipmentsTable-Tbody-Article"]').first();
        if ((await articleCell.count()) === 0) {
          logger.error(`Row ${rowIndex}: Article cell not found`);
          return false;
        }
        await articleCell.waitFor({ state: 'visible', timeout: 10000 });
        const articleText = ((await articleCell.textContent()) || '').trim();
        if (articleText !== expectedArticleNumber) {
          logger.error(`Row ${rowIndex}: Article number "${articleText}" does not match expected "${expectedArticleNumber}"`);
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error(`Failed to verify positions table row ${rowIndex}: ${error}`);
      return false;
    }
  }

  /**
   * Compares cell values between two tabs/pages
   * @param tab1 - First page/tab
   * @param tab2 - Second page/tab
   * @param tab1Selector - Selector for the cell in tab1
   * @param tab2Selector - Selector for the cell in tab2
   * @param normalizeFn - Optional normalization function to apply to both values before comparison
   * @returns Object with tab1Value, tab2Value, and match boolean
   */
  async compareCellValueBetweenTabs(
    tab1: Page,
    tab2: Page,
    tab1Selector: string,
    tab2Selector: string,
    normalizeFn?: (val: string) => string,
  ): Promise<{ tab1Value: string; tab2Value: string; match: boolean }> {
    try {
      // Get value from tab1
      await tab1.bringToFront();
      const tab1Cell = tab1.locator(tab1Selector).first();
      await tab1Cell.waitFor({ state: 'visible', timeout: 10000 });
      let tab1Value = ((await tab1Cell.textContent()) || '').trim();

      // Get value from tab2
      await tab2.bringToFront();
      const tab2Cell = tab2.locator(tab2Selector).first();
      await tab2Cell.waitFor({ state: 'visible', timeout: 10000 });
      let tab2Value = ((await tab2Cell.textContent()) || '').trim();

      // Normalize if function provided
      if (normalizeFn) {
        tab1Value = normalizeFn(tab1Value);
        tab2Value = normalizeFn(tab2Value);
      }

      const match = tab1Value === tab2Value;
      return { tab1Value, tab2Value, match };
    } catch (error) {
      logger.error(`Failed to compare cell values between tabs: ${error}`);
      return { tab1Value: '', tab2Value: '', match: false };
    }
  }

  /**
   * Helper function to validate cell values with highlighting and soft assertions
   * @param cellLocator - The locator for the cell element
   * @param expectedValue - Either a string to check if text includes, or a function that returns boolean
   * @param description - Description for the assertion (will include actual value)
   * @param page - Playwright Page object
   * @param testInfo - TestInfo for screenshot capture
   * @returns The text content of the cell
   */
  async validateCellValue(
    cellLocator: Locator,
    expectedValue: string | ((text: string) => boolean),
    description: string,
    page: Page,
    testInfo: TestInfo,
  ): Promise<string> {
    await this.waitAndHighlight(cellLocator);
    const text = (await cellLocator.textContent())?.trim() || '';

    await expectSoftWithScreenshot(
      page,
      () => {
        if (typeof expectedValue === 'function') {
          expect.soft(expectedValue(text)).toBe(true);
        } else {
          expect.soft(text.includes(expectedValue)).toBe(true);
        }
      },
      `${description}: actual "${text}"`,
      testInfo,
    );

    return text;
  }

  /**
   * Helper function to validate cell value with exact match
   * @param cellLocator - The locator for the cell element
   * @param expectedValue - Exact string value to match
   * @param description - Description for the assertion
   * @param page - Playwright Page object
   * @param testInfo - TestInfo for screenshot capture
   * @returns The text content of the cell
   */
  async validateCellValueExact(cellLocator: Locator, expectedValue: string, description: string, page: Page, testInfo: TestInfo): Promise<string> {
    await this.waitAndHighlight(cellLocator);
    const text = (await cellLocator.textContent())?.trim() || '';

    await expectSoftWithScreenshot(
      page,
      () => {
        expect.soft(text).toBe(expectedValue);
      },
      `${description}: expected "${expectedValue}", actual "${text}"`,
      testInfo,
    );

    return text;
  }

  /**
   * Helper function to wait for network idle and remove redundant waitForTimeout
   * @param page - Playwright Page object (optional, uses this.page if not provided)
   */
  async waitForNetworkStable(page?: Page): Promise<void> {
    const pageToUse = page || this.page;
    await this.waitForNetworkIdle();
    // Network idle is sufficient, no need for additional timeout
  }
}

export enum Month {
  Jan = 'январь',
  Feb = 'февраль',
  Mar = 'март',
  Apr = 'апрель',
  May = 'май',
  Jun = 'июнь',
  Jul = 'июль',
  Aug = 'август',
  Sep = 'сентябрь',
  Oct = 'октябрь',
  Nov = 'ноябрь',
  Dec = 'декабрь',
}
