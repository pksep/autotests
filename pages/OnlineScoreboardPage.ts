import { Locator, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import * as SelectorsOnlineScoreboard from '../lib/Constants/SelectorsOnlineScoreboard';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS } from '../lib/Constants/HighlightStyles';
import logger from '../lib/utils/logger';

export interface OnlineScoreboardRowData {
  detailName: string;
  requiredReadyTime: string;
}

export interface OnlineBoardComplectationRowData {
  rowKey: string;
  name: string;
  badgeText: string;
}

export interface DateCandidate {
  source: string;
  itemName: string;
  value: string;
}

// Страница: Онлайн табло по ПЗ
export class CreateOnlineScoreboardPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async openOnlineScoreboard(): Promise<void> {
    await this.goto(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_URL);
    await this.waitForNetworkIdle();
    logger.info('Открыта страница Онлайн табло по ПЗ');
  }

  async openOnlineTable(): Promise<void> {
    await this.goto(SelectorsOnlineScoreboard.ONLINE_TABLE_URL);
    await this.waitForNetworkIdle();
    logger.info('Открыта страница Онлайн табло');
  }

  async selectMetalworkingTab(): Promise<void> {
    await this.selectTabByText(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_METALWORKING_SWITCH_TEXT);
    logger.info('Выбран переключатель Металлообработка на Онлайн табло');
  }

  async selectAssemblyTab(): Promise<void> {
    await this.selectTabByText(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_ASSEMBLY_SWITCH_TEXT);
    logger.info('Выбран переключатель Сборка на Онлайн табло');
  }

  async openReadyComplectationBoardByPZ(): Promise<number> {
    await this.openOnlineScoreboard();
    await this.selectAssemblyBoardBySwitcher();
    await this.selectReadyComplectationChip();

    const expectedRowCount = await this.getReadyComplectationChipCount();
    logger.info(`Количество строк в чипе Готовность к комплектации: ${expectedRowCount}`);
    return expectedRowCount;
  }

  async openReadyComplectationOnlineTable(): Promise<number> {
    await this.openOnlineTable();
    await this.selectAssemblyBoardBySwitcher();
    await this.selectReadyComplectationChip();

    const expectedRowCount = await this.getReadyComplectationChipCount();
    logger.info(`Количество строк в чипе Готовность к комплектации на странице Онлайн табло: ${expectedRowCount}`);
    return expectedRowCount;
  }

  async collectReadyComplectationRowsByScrolling(): Promise<OnlineBoardComplectationRowData[]> {
    await this.scrollReadyComplectationTableToTop();

    const collectedRows: OnlineBoardComplectationRowData[] = [];
    const collectedRowKeys = new Set<string>();
    const nameCells = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_NAME_CELL);
    await nameCells.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });

    let previousCollectedCount = -1;
    let stableIterations = 0;

    while (stableIterations < 3) {
      const visibleRows = await this.getVisibleReadyComplectationRows();

      for (const row of visibleRows) {
        if (!collectedRowKeys.has(row.rowKey)) {
          collectedRowKeys.add(row.rowKey);
          collectedRows.push(row);
        }
      }

      const scrollState = await this.scrollReadyComplectationTable('down');

      await this.waitForNetworkIdle().catch(() => {});
      await this.waitForTimeout(TIMEOUTS.INPUT_SET);

      const collectedCount = collectedRows.length;
      const reachedScrollEnd = scrollState.after >= scrollState.max || scrollState.after === scrollState.before;

      if (collectedCount === previousCollectedCount && reachedScrollEnd) {
        stableIterations++;
      } else {
        stableIterations = 0;
      }

      previousCollectedCount = collectedCount;
    }

    logger.info(`Собрано строк Онлайн табло по ПЗ после прокрутки: ${collectedRows.length}`);
    return collectedRows;
  }

  async scrollReadyComplectationTableToTop(firstRow?: OnlineBoardComplectationRowData): Promise<void> {
    for (let attempt = 0; attempt < 5; attempt++) {
      await this.page.evaluate(() => {
        const scrollableElements = Array.from(document.querySelectorAll<HTMLElement>('*')).filter(
          element => element.scrollHeight > element.clientHeight,
        );

        for (const element of scrollableElements) {
          element.scrollTop = 0;
          element.dispatchEvent(new Event('scroll', { bubbles: true }));
        }

        window.scrollTo(0, 0);
      });

      await this.waitForNetworkIdle().catch(() => {});
      await this.waitForTimeout(TIMEOUTS.INPUT_SET);

      if (!firstRow || (await this.isReadyComplectationRowVisible(firstRow))) {
        return;
      }
    }

    if (firstRow) {
      throw new Error(`Не удалось вернуться к верхней строке Онлайн табло по ПЗ: "${firstRow.name}" (${firstRow.badgeText})`);
    }
  }

  async highlightReadyComplectationRow(rowData: OnlineBoardComplectationRowData): Promise<void> {
    await this.page.bringToFront();

    let stableIterations = 0;

    while (stableIterations < 3) {
      const visibleRows = await this.getVisibleReadyComplectationRows();
      const visibleIndex = visibleRows.findIndex(row => row.rowKey === rowData.rowKey);

      if (visibleIndex >= 0) {
        const matchingNameCell = this.page
          .locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_NAME_CELL)
          .filter({ hasText: rowData.name })
          .nth(visibleRows.slice(0, visibleIndex + 1).filter(row => row.name === rowData.name).length - 1);

        await matchingNameCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
        await matchingNameCell.scrollIntoViewIfNeeded();
        await this.highlightElement(matchingNameCell, HIGHLIGHT_SUCCESS);
        await this.waitForTimeout(TIMEOUTS.STANDARD);
        return;
      }

      const scrollState = await this.scrollReadyComplectationTable('down');
      await this.waitForNetworkIdle().catch(() => {});
      await this.waitForTimeout(TIMEOUTS.INPUT_SET);

      const reachedScrollEnd = scrollState.after >= scrollState.max || scrollState.after === scrollState.before;
      stableIterations = reachedScrollEnd ? stableIterations + 1 : 0;
    }

    throw new Error(`Не удалось найти строку для подсветки на Онлайн табло по ПЗ: "${rowData.name}" (${rowData.badgeText})`);
  }

  async searchByName(name: string): Promise<void> {
    const searchInput = await this.findOnlineScoreboardSearchInput();
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await searchInput.click();
    await searchInput.press('Control+A');
    await searchInput.press('Delete');
    await searchInput.fill(name);
    await searchInput.press('Enter');
    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.STANDARD);
    logger.info(`Выполнен поиск на Онлайн табло: ${name}`);
  }

  async getFirstMetalworkingDetailForReadyTimeCheck(): Promise<OnlineScoreboardRowData> {
    await this.selectMetalworkingTab();
    const table = await this.findVisibleTableWithRows(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE);
    const nameColumnIndex = await this.findColumnIndexByHeaderText(table, SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_NAME_COLUMN_TEXT);
    const requiredReadyTimeColumnIndex = await this.findColumnIndexByHeaderText(
      table,
      SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_REQUIRED_READY_TIME_COLUMN_TEXT,
    );
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = rows.nth(rowIndex);
      const detailName = await this.getCellText(row, nameColumnIndex);
      const requiredReadyTime = await this.getCellText(row, requiredReadyTimeColumnIndex);

      if (detailName && requiredReadyTime) {
        await this.highlightElement(row);
        logger.info(`Для проверки выбрана деталь "${detailName}" с требуемым временем "${requiredReadyTime}"`);
        return { detailName, requiredReadyTime };
      }
    }

    throw new Error('Не найдена строка металлообработки с заполненными Наименованием и Требуемым временем готовности');
  }

  async openDetailDialogByName(detailName: string): Promise<void> {
    const table = await this.findVisibleTableWithRows(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE);
    const nameColumnIndex = await this.findColumnIndexByHeaderText(table, SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_NAME_COLUMN_TEXT);
    const row = await this.findRowByCellText(table, detailName, nameColumnIndex);
    const nameCell = row.locator('td').nth(nameColumnIndex);

    await this.waitAndHighlight(nameCell, { timeout: WAIT_TIMEOUTS.STANDARD });
    await nameCell.click();
    await this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_DIALOG).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.STANDARD,
    });
    logger.info(`Открыт диалог детали "${detailName}"`);
  }

  async getBelongingNamesFromOpenDetailDialog(): Promise<string[]> {
    const belongingHeader = await this.scrollOpenDetailDialogToBelongingSection();
    if ((await belongingHeader.count()) === 0 || !(await belongingHeader.isVisible())) {
      logger.info('Секция Принадлежность не найдена в диалоге детали');
      return [];
    }

    await this.waitAndHighlight(belongingHeader, { timeout: WAIT_TIMEOUTS.STANDARD });
    await this.clickBelongingSectionToggleIfPresent(belongingHeader);

    const namesFromAccessoryTable = await this.getBelongingNamesFromAccessoryTable();
    if (namesFromAccessoryTable.length > 0) {
      logger.info(`В таблице Принадлежность найдено элементов: ${namesFromAccessoryTable.join(', ')}`);
      return namesFromAccessoryTable;
    }

    const rows = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_ROW);
    const rowCount = await rows.count();
    const names: string[] = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = rows.nth(rowIndex);
      if (!(await row.isVisible())) {
        continue;
      }

      const name = await this.extractMostLikelyNameFromRow(row);
      if (name && !names.includes(name)) {
        await this.highlightElement(row, HIGHLIGHT_PENDING);
        names.push(name);
      }
    }

    logger.info(`В секции Принадлежность найдено элементов: ${names.join(', ') || 'нет'}`);
    return names;
  }

  async closeOpenDialog(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.waitForTimeout(TIMEOUTS.MEDIUM);
  }

  async getAssemblyWorkStartDate(itemName: string): Promise<string> {
    await this.openOnlineScoreboard();
    await this.selectAssemblyTab();
    await this.searchByName(itemName);

    const firstRow = await this.getFirstOperationTableProductionRow();
    const nameCell = firstRow.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_OPERATION_TABLE_NAME_CELL).first();
    const urgencyDateCell = firstRow.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_OPERATION_TABLE_URGENCY_DATE_CELL).first();

    await this.waitAndHighlight(nameCell, { timeout: WAIT_TIMEOUTS.STANDARD });
    const actualName = this.normalizeTextValue(await nameCell.innerText());
    if (actualName !== itemName) {
      throw new Error(`Первый результат поиска не совпадает с родителем. Ожидали "${itemName}", получили "${actualName}"`);
    }

    await this.waitAndHighlight(urgencyDateCell, { timeout: WAIT_TIMEOUTS.STANDARD });
    const date = this.normalizeTextValue(await urgencyDateCell.innerText());

    logger.info(`Дата Начало работ для "${itemName}" на Онлайн табло: ${date || 'не заполнена'}`);
    return date;
  }

  getEarliestDate(candidates: DateCandidate[]): DateCandidate | null {
    const parsedCandidates = candidates
      .map(candidate => ({ candidate, date: this.parseDate(candidate.value) }))
      .filter((entry): entry is { candidate: DateCandidate; date: Date } => entry.date !== null);

    if (parsedCandidates.length === 0) {
      return null;
    }

    parsedCandidates.sort((left, right) => left.date.getTime() - right.date.getTime());
    return parsedCandidates[0].candidate;
  }

  normalizeDateForComparison(value: string): string {
    const parsed = this.parseDate(value);
    if (!parsed) {
      return value.trim();
    }

    const day = `${parsed.getDate()}`.padStart(2, '0');
    const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
    const year = `${parsed.getFullYear()}`;
    const hours = `${parsed.getHours()}`.padStart(2, '0');
    const minutes = `${parsed.getMinutes()}`.padStart(2, '0');

    return value.includes(':') ? `${day}.${month}.${year} ${hours}:${minutes}` : `${day}.${month}.${year}`;
  }

  private async selectTabByText(tabText: string): Promise<void> {
    const tab = this.page.getByText(tabText, { exact: true }).first();
    await this.waitAndHighlight(tab, { timeout: WAIT_TIMEOUTS.STANDARD });
    await tab.click();
    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.STANDARD);
  }

  private async selectAssemblyBoardBySwitcher(): Promise<void> {
    const switcher = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_SWITCH_TYPE).first();
    const assemblySwitchItem =
      (await switcher.count()) > 0
        ? switcher.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_ASSEMBLY_SWITCH_ITEM).first()
        : this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_ASSEMBLY_SWITCH_ITEM).first();

    await this.waitAndHighlight(assemblySwitchItem, { timeout: WAIT_TIMEOUTS.STANDARD });
    await assemblySwitchItem.click();
    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.VERY_LONG);
    await this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_NAME_CELL).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.LONG,
    });
    logger.info('Выбран переключатель Сборка на Онлайн табло по ПЗ');
  }

  private async selectReadyComplectationChip(): Promise<void> {
    const readinessChip = this.getReadyComplectationChip();
    await readinessChip.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const readinessChipInput = readinessChip.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_CHIP_INPUT).first();
    await readinessChipInput.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });

    if (!(await readinessChipInput.isChecked())) {
      await this.waitAndHighlight(readinessChipInput, { timeout: WAIT_TIMEOUTS.STANDARD });
      await readinessChipInput.click();
    }

    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.VERY_LONG);
    await this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_NAME_CELL).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.LONG,
    });
    logger.info('Выбран чип Готовность к комплектации на Онлайн табло по ПЗ');
  }

  private async getReadyComplectationChipCount(): Promise<number> {
    const readinessChip = this.getReadyComplectationChip();

    await readinessChip.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const chipText = (await readinessChip.textContent())?.trim() || '';
    const countMatch = chipText.match(/\((\d+)\)/);

    if (!countMatch) {
      throw new Error(`Не удалось получить количество строк из чипа. Текст чипа: "${chipText}"`);
    }

    return Number(countMatch[1]);
  }

  private getReadyComplectationChip(): Locator {
    return this.page
      .locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_CHIP)
      .filter({
        has: this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_CHIP_INPUT),
        hasText: SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_READINESS_CHIP_TEXT,
      })
      .first();
  }

  private async getVisibleReadyComplectationRows(): Promise<OnlineBoardComplectationRowData[]> {
    const nameCells = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_NAME_CELL);
    await nameCells.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    return nameCells.evaluateAll((elements, badgeSelector) =>
      elements
        .filter(element => {
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        })
        .map(element => {
          const row = element.closest('tr');
          const badge = row?.querySelector(badgeSelector);
          const rowText = (row?.textContent || '').trim().replace(/\s+/g, ' ');
          const rowTestId = row?.getAttribute('data-testid') || '';

          return {
            rowKey: rowText || rowTestId,
            name: (element.textContent || '').trim(),
            badgeText: (badge?.textContent || '').trim(),
          };
        })
        .filter(row => row.rowKey && row.name && row.badgeText),
      SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_BADGE_TEXT,
    );
  }

  private async isReadyComplectationRowVisible(rowData: OnlineBoardComplectationRowData): Promise<boolean> {
    const visibleRows = await this.getVisibleReadyComplectationRows();
    return visibleRows.some(row => row.rowKey === rowData.rowKey);
  }

  private async scrollReadyComplectationTable(direction: 'top' | 'down'): Promise<{ before: number; after: number; max: number }> {
    const nameCells = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_NAME_CELL);
    await nameCells.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });

    return nameCells.first().evaluate((element, scrollDirection) => {
      let scrollParent: HTMLElement | null = element.parentElement;

      while (scrollParent) {
        const style = window.getComputedStyle(scrollParent);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && scrollParent.scrollHeight > scrollParent.clientHeight;

        if (canScroll) {
          const before = scrollParent.scrollTop;
          scrollParent.scrollTop =
            scrollDirection === 'top' ? 0 : Math.min(scrollParent.scrollTop + scrollParent.clientHeight, scrollParent.scrollHeight);
          scrollParent.dispatchEvent(new Event('scroll', { bubbles: true }));

          return {
            before,
            after: scrollParent.scrollTop,
            max: scrollParent.scrollHeight - scrollParent.clientHeight,
          };
        }

        scrollParent = scrollParent.parentElement;
      }

      const before = document.documentElement.scrollTop;
      if (scrollDirection === 'top') {
        window.scrollTo(0, 0);
      } else {
        window.scrollBy(0, window.innerHeight);
      }

      return {
        before,
        after: document.documentElement.scrollTop,
        max: document.documentElement.scrollHeight - window.innerHeight,
      };
    }, direction);
  }

  private async findOnlineScoreboardSearchInput(): Promise<Locator> {
    const operationTableSearchInput = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_OPERATION_TABLE_SEARCH_INPUT).first();
    if ((await operationTableSearchInput.count()) > 0 && (await operationTableSearchInput.isVisible())) {
      return operationTableSearchInput;
    }

    const searchInputs = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_TABLE_SEARCH_INPUT);
    await searchInputs.first().waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
    const searchInputCount = await searchInputs.count();

    for (let inputIndex = 0; inputIndex < searchInputCount; inputIndex++) {
      const searchInput = searchInputs.nth(inputIndex);
      if (await searchInput.isVisible()) {
        return searchInput;
      }
    }

    throw new Error('Не найдено видимое поле поиска на странице Онлайн табло');
  }

  private async getFirstOperationTableProductionRow(): Promise<Locator> {
    const nameCells = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_OPERATION_TABLE_NAME_CELL);
    await nameCells.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    const firstNameCell = nameCells.first();
    return firstNameCell.locator('xpath=ancestor::tr[1]');
  }

  private async scrollOpenDetailDialogToBelongingSection(): Promise<Locator> {
    const dialog = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_DIALOG).first();
    await dialog.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    await dialog.evaluate((element: HTMLElement) => {
      const scrollableElements = [element, ...Array.from(element.querySelectorAll<HTMLElement>('*'))].filter(
        child => child.scrollHeight > child.clientHeight,
      );
      scrollableElements.forEach(child => {
        child.scrollTop = child.scrollHeight;
      });
    });
    await this.waitForTimeout(TIMEOUTS.MEDIUM);

    const dialogBox = await dialog.boundingBox();
    if (dialogBox) {
      await this.page.mouse.move(dialogBox.x + dialogBox.width / 2, dialogBox.y + dialogBox.height / 2);
      await this.page.mouse.wheel(0, dialogBox.height);
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
    }

    const belongingHeader = this.getBelongingHeaderLocator(dialog);
    if ((await belongingHeader.count()) > 0) {
      await belongingHeader.scrollIntoViewIfNeeded();
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
    }

    logger.info('Диалог детали прокручен к секции Принадлежность');
    return belongingHeader;
  }

  private getBelongingHeaderLocator(dialog: Locator): Locator {
    return dialog
      .locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_HEADER)
      .or(dialog.getByText(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_HEADER_TEXT, { exact: true }))
      .first();
  }

  private async clickBelongingSectionToggleIfPresent(belongingHeader: Locator): Promise<void> {
    const exactSummary = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_SUMMARY_EXACT).first();
    if ((await exactSummary.count()) > 0 && (await exactSummary.isVisible())) {
      await this.waitAndHighlight(exactSummary, { timeout: WAIT_TIMEOUTS.STANDARD });
      await exactSummary.click();
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
      logger.info('Нажата секция Принадлежность по точному data-testid Summary');
      return;
    }

    const dynamicSummary = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_SUMMARY).first();
    if ((await dynamicSummary.count()) > 0 && (await dynamicSummary.isVisible())) {
      await this.waitAndHighlight(dynamicSummary, { timeout: WAIT_TIMEOUTS.STANDARD });
      await dynamicSummary.click();
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
      logger.info('Нажата секция Принадлежность по динамическому data-testid Summary');
      return;
    }

    const directChevron = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_CHEVRON_DOWN).first();
    if ((await directChevron.count()) > 0 && (await directChevron.isVisible())) {
      await this.waitAndHighlight(directChevron, { timeout: WAIT_TIMEOUTS.STANDARD });
      await directChevron.click();
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
      logger.info('Нажата стрелка секции Принадлежность по data-testid ChevronDown');
      return;
    }

    const ancestorPaths = ['..', '../..', '../../..', '../../../..'];

    for (const ancestorPath of ancestorPaths) {
      const sectionContainer = belongingHeader.locator(`xpath=${ancestorPath}`);
      const toggleCandidates = sectionContainer.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_TOGGLE);
      const toggleCount = await toggleCandidates.count();

      for (let toggleIndex = toggleCount - 1; toggleIndex >= 0; toggleIndex--) {
        const toggle = toggleCandidates.nth(toggleIndex);
        if (!(await toggle.isVisible())) {
          continue;
        }

        await this.waitAndHighlight(toggle, { timeout: WAIT_TIMEOUTS.STANDARD });
        await toggle.click();
        await this.waitForTimeout(TIMEOUTS.MEDIUM);
        logger.info('Нажата стрелка секции Принадлежность для раскрытия списка родителей');
        return;
      }
    }

    logger.info('Стрелка секции Принадлежность не найдена, продолжаем проверку без раскрытия');
  }

  private async getBelongingNamesFromAccessoryTable(): Promise<string[]> {
    const exactTable = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_TABLE_EXACT).first();
    const dynamicTable = this.page.locator(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_TABLE).first();
    const table = (await exactTable.count()) > 0 ? exactTable : dynamicTable;

    if ((await table.count()) === 0) {
      logger.info('Таблица Принадлежность не найдена после раскрытия секции');
      return [];
    }

    await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(table, { timeout: WAIT_TIMEOUTS.STANDARD });

    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    const names: string[] = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = rows.nth(rowIndex);
      const nameCell = row.locator('td').nth(SelectorsOnlineScoreboard.ONLINE_SCOREBOARD_DETAIL_BELONGING_PARENT_NAME_CELL_INDEX);
      if ((await nameCell.count()) === 0) {
        continue;
      }

      const parentName = this.normalizeTextValue(await nameCell.innerText());
      if (!parentName || names.includes(parentName)) {
        continue;
      }

      await this.highlightElement(row, HIGHLIGHT_PENDING);
      names.push(parentName);
    }

    return names;
  }

  private async findVisibleTableWithRows(tableSelector: string): Promise<Locator> {
    await this.page.locator(tableSelector).first().waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
    const tables = this.page.locator(tableSelector);
    const tableCount = await tables.count();

    for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
      const table = tables.nth(tableIndex);
      if ((await table.isVisible()) && (await table.locator('tbody tr').count()) > 0) {
        return table;
      }
    }

    throw new Error('Не найдена видимая таблица со строками на странице Онлайн табло');
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

    throw new Error(`Не найден столбец "${headerText}" в таблице Онлайн табло`);
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

    throw new Error(`Не найдена строка с текстом "${expectedText}" в таблице Онлайн табло`);
  }

  private async getCellText(row: Locator, cellIndex: number): Promise<string> {
    const cell = row.locator('td').nth(cellIndex);
    if ((await cell.count()) === 0) {
      return '';
    }

    return this.normalizeTextValue(await cell.innerText());
  }

  private async extractMostLikelyNameFromRow(row: Locator): Promise<string> {
    const cells = row.locator('td');
    const cellCount = await cells.count();
    const values: string[] = [];

    for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
      const value = this.normalizeTextValue(await cells.nth(cellIndex).innerText());
      if (value && !/^\d+$/.test(value) && value !== '-') {
        values.push(value);
      }
    }

    if (values.length === 0) {
      return this.normalizeTextValue(await row.innerText());
    }

    return values.sort((left, right) => right.length - left.length)[0];
  }

  private parseDate(value: string): Date | null {
    const match = value.match(/\b(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?\b/);
    if (!match) {
      return null;
    }

    const [, day, month, year, hour = '00', minute = '00'] = match;
    const parsed = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      Number.parseInt(day, 10),
      Number.parseInt(hour, 10),
      Number.parseInt(minute, 10),
    );

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private normalizeTextValue(value: string | null): string {
    return (value || '').replace(/\s+/g, ' ').trim();
  }
}
