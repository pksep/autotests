import { Locator, Page } from '@playwright/test';
import { PageObject, type ModalValidationOptions } from '../lib/Page';
import { SELECTORS } from '../config';
import * as SelectorsArchive from '../lib/Constants/SelectorsArchive';
import {
  WEEKLY_ARCHIVE_DEFAULT_ENTITY,
  WEEKLY_ARCHIVE_EMPTY_STATE_TEXTS,
  WEEKLY_ARCHIVE_ENTITY_TYPES,
  WEEKLY_ARCHIVE_REQUIRED_HEADERS,
  WEEKLY_ARCHIVE_SEARCH_PLACEHOLDER,
} from '../lib/Constants/TestDataWeeklyArchive';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

export interface ArchivePageState {
  title: string;
  breadcrumb: string;
  entityFilterLabel: string;
  activeEntity: string;
  countText: string;
  countValue: number | null;
  searchPlaceholder: string;
  tableVisible: boolean;
  tableHasRows: boolean;
  emptyStateVisible: boolean;
  headers: string[];
}

export interface ArchiveEntityChangeResult {
  beforeEntity: string;
  afterEntity: string;
  changed: boolean;
  tableReady: boolean;
  rowCountAfterChange: number;
}

export interface ArchiveSearchResult {
  performed: boolean;
  searchTermAvailable: boolean;
  searchTerm: string;
  rowCount: number;
  matchingRows: number;
  emptyStateVisible: boolean;
}

export interface ArchivePersistenceResult {
  checkedValue: string;
  valueAfterRefresh: string;
  persisted: boolean;
  warning?: string;
}

export interface ArchiveHistoryActionResult {
  attempted: boolean;
  opened: boolean;
  emptyStateVisible: boolean;
}

export interface ArchiveSearchHistoryResult {
  checkedTerms: string[];
  toggleVisible: boolean;
  opened: boolean;
  historyItems: string[];
  foundTerms: string[];
  missingTerms: string[];
}

export interface ArchiveCellInteractionProbeResult {
  checkedCells: number;
  singleClickOpenedCount: number;
  doubleClickOpenedCount: number;
  openedModalTexts: string[];
}

export interface ArchiveDetailHierarchyResult {
  entityType: 'Деталь';
  rowCount: number;
  dialogOpened: boolean;
  selectedName: string;
  selectedDesignation: string;
  emptyStateVisible: boolean;
}

export interface ArchiveEntityDialogProbeResult {
  entityType: string;
  rowCount: number;
  dialogOpened: boolean;
  dialogText: string;
  dialogValidation: ArchiveDialogValidationResult | null;
}

export interface ArchiveNestedDialogValidationResult {
  buttonLabel: string;
  attempted: boolean;
  opened: boolean;
  contentVisible: boolean;
  closed: boolean;
}

export interface ArchiveDialogValidationResult {
  contentVisible: boolean;
  headingCount: number;
  labelCount: number;
  buttonCount: number;
  tableCount: number;
  hasMeaningfulText: boolean;
  closeWorked: boolean;
  nestedResults: ArchiveNestedDialogValidationResult[];
  warnings: string[];
}

export class CreateArchivePage extends PageObject {
  private entityDropdownWarmupDone = false;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async openArchivePage(): Promise<void> {
    await this.navigateToPage(SELECTORS.MAINMENU.ARCHIVE.URL, SelectorsArchive.TITLE);
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForArchiveTableReady();
    logger.info('Открыта страница Архив');
  }

  async getMainPageState(): Promise<ArchivePageState> {
    const title = this.page.locator(SelectorsArchive.TITLE).first();
    const entityFilterLabel = this.page.locator(SelectorsArchive.ENTITY_FILTER_LABEL).first();
    const entityDropdown = this.page.locator(SelectorsArchive.ENTITY_DROPDOWN).first();
    const countLabel = this.page.locator(SelectorsArchive.COUNT_LABEL).first();
    const searchInput = this.page.locator(SelectorsArchive.SEARCH_INPUT).first();
    const table = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_UNITABLE).first();

    await this.waitAndHighlight(title, { timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(entityFilterLabel, { timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(entityDropdown, { timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(countLabel, { timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(table, { timeout: WAIT_TIMEOUTS.STANDARD });

    const countText = await this.getLocatorText(countLabel);

    return {
      title: await this.getLocatorText(title),
      breadcrumb: await this.getBreadcrumbText(),
      entityFilterLabel: await this.getLocatorText(entityFilterLabel),
      activeEntity: await this.getLocatorText(entityDropdown),
      countText,
      countValue: this.parseCount(countText),
      searchPlaceholder: (await searchInput.getAttribute('placeholder')) ?? '',
      tableVisible: await table.isVisible().catch(() => false),
      tableHasRows: (await this.getArchiveRowCount()) > 0,
      emptyStateVisible: await this.isEmptyStateVisible(),
      headers: await this.getArchiveHeaders(),
    };
  }

  async selectAnotherEntityIfAvailable(): Promise<ArchiveEntityChangeResult> {
    const beforeEntity = await this.getActiveEntity();
    const options = await this.getEntityOptions();
    const targetEntity = options.find(option => option !== beforeEntity);

    if (!targetEntity) {
      return {
        beforeEntity,
        afterEntity: beforeEntity,
        changed: false,
        tableReady: await this.isArchiveTableReady(),
        rowCountAfterChange: await this.getArchiveRowCount(),
      };
    }

    await this.selectEntityType(targetEntity);

    const afterEntity = await this.getActiveEntity();
    logger.info(`Тип сущности в архиве изменен: "${beforeEntity}" -> "${afterEntity}"`);

    return {
      beforeEntity,
      afterEntity,
      changed: afterEntity !== beforeEntity,
      tableReady: await this.isArchiveTableReady(),
      rowCountAfterChange: await this.getArchiveRowCount(),
    };
  }

  async probeDialogsForEveryEntityType(): Promise<ArchiveEntityDialogProbeResult[]> {
    const entityTypes = await this.getEntityOptions();
    const results: ArchiveEntityDialogProbeResult[] = [];

    for (const entityType of entityTypes) {
      await this.selectEntityType(entityType);
      const rowCount = await this.getArchiveRowCount();
      const result: ArchiveEntityDialogProbeResult = {
        entityType,
        rowCount,
        dialogOpened: false,
        dialogText: '',
        dialogValidation: null,
      };

      if (rowCount > 0) {
        const firstRow = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW).first();
        await this.waitAndHighlight(firstRow, { timeout: WAIT_TIMEOUTS.STANDARD, waitAfter: TIMEOUTS.FLASH });
        await firstRow.click({ force: true });
        await this.waitForTimeout(TIMEOUTS.MEDIUM);

        const modalTexts: string[] = [];
        let dialogValidation = await this.validateAndCloseVisibleModal(modalTexts);
        result.dialogOpened = dialogValidation !== null;
        if (!result.dialogOpened) {
          await firstRow.dblclick({ force: true });
          await this.waitForTimeout(TIMEOUTS.MEDIUM);
          dialogValidation = await this.validateAndCloseVisibleModal(modalTexts);
          result.dialogOpened = dialogValidation !== null;
        }
        result.dialogText = modalTexts[0] ?? '';
        result.dialogValidation = dialogValidation;
      }

      logger.info(
        `Проверка диалога архива для типа "${entityType}": строк ${result.rowCount}, диалог открыт: ${result.dialogOpened}`,
      );
      results.push(result);
    }

    if (entityTypes.includes(WEEKLY_ARCHIVE_DEFAULT_ENTITY)) {
      await this.selectEntityType(WEEKLY_ARCHIVE_DEFAULT_ENTITY);
    }

    return results;
  }

  async selectDefaultProductEntity(): Promise<void> {
    await this.selectEntityType(WEEKLY_ARCHIVE_DEFAULT_ENTITY);
  }

  async validateDetailShortInformationHierarchy(options: ModalValidationOptions = {}): Promise<ArchiveDetailHierarchyResult> {
    await this.openArchivePage();
    await this.validateArchiveMainShell();
    await this.selectEntityType('Деталь');

    const rowCount = await this.getArchiveRowCount();
    if (rowCount === 0) {
      logger.warn('Проверка иерархии диалогов архива для "Деталь" пропущена: таблица пустая.');
      return {
        entityType: 'Деталь',
        rowCount,
        dialogOpened: false,
        selectedName: '',
        selectedDesignation: '',
        emptyStateVisible: await this.isEmptyStateVisible(),
      };
    }

    await this.validateDetailArchiveTableHeaders();

    const firstRow = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW).first();
    const cells = firstRow.locator('td');
    const selectedDesignation = await this.getLocatorText(cells.nth(1));
    const selectedName = await this.getLocatorText(cells.nth(2));

    await this.waitAndHighlight(firstRow, { timeout: WAIT_TIMEOUTS.STANDARD, waitAfter: TIMEOUTS.FLASH });
    await firstRow.click({ force: true });

    const shortInfoRoot = this.page
      .locator('dialog[data-testid="ModalRight"][open]')
      .filter({ has: this.page.locator('[data-testid="undefined-SectionInformation"]') })
      .last();

    await shortInfoRoot.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    await this.validateShortInformationModal({
      ...options,
      expectedShortInformationName: options.expectedShortInformationName ?? selectedName,
      expectedShortInformationDesignation: options.expectedShortInformationDesignation ?? selectedDesignation,
    });

    return {
      entityType: 'Деталь',
      rowCount,
      dialogOpened: true,
      selectedName,
      selectedDesignation,
      emptyStateVisible: false,
    };
  }

  async runDesignationSearchFromFirstRow(): Promise<ArchiveSearchResult> {
    const designation = await this.getFirstNonEmptyCellText(1);
    return this.searchArchive(designation);
  }

  async runArticleOrNameSearchFromFirstRow(): Promise<ArchiveSearchResult> {
    const articleOrName = (await this.getFirstNonEmptyCellText(2)) || (await this.getFirstNonEmptyCellText(3));
    return this.searchArchive(articleOrName);
  }

  async clearSearch(): Promise<ArchiveSearchResult> {
    const searchInput = this.page.locator(SelectorsArchive.SEARCH_INPUT).first();
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await searchInput.click();
    await searchInput.press('Control+A');
    await searchInput.press('Delete');
    await searchInput.press('Enter');
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForArchiveTableReady();

    return {
      performed: true,
      searchTermAvailable: true,
      searchTerm: '',
      rowCount: await this.getArchiveRowCount(),
      matchingRows: await this.getArchiveRowCount(),
      emptyStateVisible: await this.isEmptyStateVisible(),
    };
  }

  async checkEntityFilterPersistenceAfterRefresh(): Promise<ArchivePersistenceResult> {
    const checkedValue = await this.getActiveEntity();
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForArchiveTableReady();

    const valueAfterRefresh = await this.getActiveEntity();
    const persisted = checkedValue === valueAfterRefresh;
    const warning = persisted
      ? undefined
      : `Фильтр типа сущности не сохранился после обновления страницы. До: "${checkedValue}", после: "${valueAfterRefresh}".`;

    if (warning) {
      logger.warn(warning);
    }

    return {
      checkedValue,
      valueAfterRefresh,
      persisted,
      warning,
    };
  }

  async tryOpenHistoryAction(): Promise<ArchiveHistoryActionResult> {
    const rowCount = await this.getArchiveRowCount();
    if (rowCount === 0) {
      return {
        attempted: false,
        opened: false,
        emptyStateVisible: await this.isEmptyStateVisible(),
      };
    }

    const actions = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW_ACTION);
    const actionCount = await actions.count();
    if (actionCount === 0) {
      return {
        attempted: false,
        opened: false,
        emptyStateVisible: false,
      };
    }

    const firstAction = actions.first();
    await this.waitAndHighlight(firstAction, { timeout: WAIT_TIMEOUTS.STANDARD });
    await firstAction.click({ force: true });
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForTimeout(TIMEOUTS.MEDIUM);

    const modal = this.page.locator(SelectorsArchive.MODAL_CONTAINER).first();
    const opened = await modal.isVisible().catch(() => false);
    if (opened) {
      await this.waitAndHighlight(modal, { timeout: WAIT_TIMEOUTS.STANDARD });
      await this.closeOpenModal();
    }

    return {
      attempted: true,
      opened,
      emptyStateVisible: await this.isEmptyStateVisible(),
    };
  }

  async checkSearchHistoryDropdown(expectedTerms: string[]): Promise<ArchiveSearchHistoryResult> {
    const checkedTerms = expectedTerms.map(term => this.normalizeText(term)).filter(Boolean);
    const searchInput = this.page.locator(SelectorsArchive.SEARCH_INPUT).first();
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await searchInput.click();
    await searchInput.press('Control+A');
    await searchInput.press('Delete');
    await searchInput.hover();

    const historyToggle = await this.getVisibleSearchHistoryToggle();
    const toggleVisible = historyToggle !== null;

    if (historyToggle) {
      await this.waitAndHighlight(historyToggle, { timeout: WAIT_TIMEOUTS.STANDARD });
      await historyToggle.click();
    }

    if (!toggleVisible) {
      logger.warn('Выпадающий список истории поиска в архиве не появился.');
      return {
        checkedTerms,
        toggleVisible,
        opened: false,
        historyItems: [],
        foundTerms: [],
        missingTerms: checkedTerms,
      };
    }

    const historyItems = await this.getVisibleSearchHistoryItems();
    const opened = historyItems.length > 0;

    if (!opened) {
      logger.warn('Контейнер истории поиска в архиве не открылся после клика.');
      return {
        checkedTerms,
        toggleVisible,
        opened,
        historyItems: [],
        foundTerms: [],
        missingTerms: checkedTerms,
      };
    }

    const firstHistoryItem = this.page.locator(SelectorsArchive.SEARCH_HISTORY_ITEM).filter({ hasText: historyItems[0] }).first();
    await this.waitAndHighlight(firstHistoryItem, { timeout: WAIT_TIMEOUTS.STANDARD });
    const foundTerms = checkedTerms.filter(term => historyItems.some(item => item === term));
    const missingTerms = checkedTerms.filter(term => !foundTerms.includes(term));

    await this.page.keyboard.press('Escape');

    if (missingTerms.length > 0) {
      logger.warn(`В истории поиска архива не найдены значения: ${missingTerms.join(', ')}`);
    }

    return {
      checkedTerms,
      toggleVisible,
      opened,
      historyItems,
      foundTerms,
      missingTerms,
    };
  }

  private async getVisibleSearchHistoryToggle(): Promise<Locator | null> {
    const toggleSelectors = [SelectorsArchive.SEARCH_HISTORY_TOGGLE, SelectorsArchive.SEARCH_HISTORY_TOGGLE_LEGACY];

    for (const toggleSelector of toggleSelectors) {
      const toggles = this.page.locator(toggleSelector);
      const toggleCount = await toggles.count();

      for (let toggleIndex = 0; toggleIndex < toggleCount; toggleIndex++) {
        const toggle = toggles.nth(toggleIndex);
        if (await toggle.isVisible().catch(() => false)) {
          return toggle;
        }
      }
    }

    return null;
  }

  private async getVisibleSearchHistoryItems(): Promise<string[]> {
    const historyItemLocators = this.page.locator(SelectorsArchive.SEARCH_HISTORY_ITEM);
    const historyItemCount = await historyItemLocators.count();
    const historyItems: string[] = [];

    for (let itemIndex = 0; itemIndex < historyItemCount; itemIndex++) {
      const item = historyItemLocators.nth(itemIndex);
      if (!(await item.isVisible().catch(() => false))) {
        continue;
      }

      const text = await this.getLocatorText(item);
      if (text && text !== SelectorsArchive.SEARCH_HISTORY_TITLE_TEXT && !historyItems.includes(text)) {
        historyItems.push(text);
      }
    }

    return historyItems;
  }

  async probeFirstRowCellInteractions(): Promise<ArchiveCellInteractionProbeResult> {
    const result: ArchiveCellInteractionProbeResult = {
      checkedCells: 0,
      singleClickOpenedCount: 0,
      doubleClickOpenedCount: 0,
      openedModalTexts: [],
    };

    await this.clearSearch();
    const cells = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_FIRST_ROW_DATA_CELL);
    const cellCount = await cells.count();

    for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
      const cell = cells.nth(cellIndex);
      if (!(await cell.isVisible().catch(() => false))) {
        continue;
      }

      result.checkedCells++;
      await this.waitAndHighlight(cell, { timeout: WAIT_TIMEOUTS.STANDARD, waitAfter: TIMEOUTS.FLASH });

      await cell.click({ force: true });
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
      if (await this.captureAndCloseVisibleModal(result.openedModalTexts)) {
        result.singleClickOpenedCount++;
        continue;
      }

      await cell.dblclick({ force: true });
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
      if (await this.captureAndCloseVisibleModal(result.openedModalTexts)) {
        result.doubleClickOpenedCount++;
      }
    }

    logger.info(
      `Проверка кликов по ячейкам архива: ячеек ${result.checkedCells}, одиночных открытий ${result.singleClickOpenedCount}, двойных открытий ${result.doubleClickOpenedCount}`,
    );

    return result;
  }

  hasRequiredHeaders(headers: string[]): boolean {
    return WEEKLY_ARCHIVE_REQUIRED_HEADERS.every(header => headers.includes(header));
  }

  private async validateArchiveMainShell(): Promise<void> {
    const state = await this.getMainPageState();
    if (state.title !== 'Архив') {
      throw new Error(`Archive page title mismatch. Expected "Архив", got "${state.title}".`);
    }
    if (!state.entityFilterLabel.includes('Тип сущности')) {
      throw new Error(`Archive entity filter label mismatch. Got "${state.entityFilterLabel}".`);
    }
    if (!state.tableVisible) {
      throw new Error('Archive table should be visible before opening detail hierarchy.');
    }
  }

  private async validateDetailArchiveTableHeaders(): Promise<void> {
    const headers = await this.getArchiveHeaders();
    const requiredHeaders = ['№', 'Обозначение', 'Наименование'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
      throw new Error(`Archive detail table is missing headers: ${missingHeaders.join(', ')}. Actual headers: ${headers.join(', ')}`);
    }
  }

  async getReadableRowQuality(): Promise<{ checked: boolean; readableCells: number; questionMarkCells: number }> {
    const cellTexts = await this.getFirstRowCellTexts();
    const relevantCells = cellTexts.slice(1, 4).filter(Boolean);

    const cells = await this.page.locator(SelectorsArchive.ARCHIVE_TABLE_FIRST_ROW_DATA_CELL).all();
    for (const cell of cells) {
      await this.waitAndHighlight(cell, { timeout: WAIT_TIMEOUTS.STANDARD, waitAfter: TIMEOUTS.FLASH });
    }

    return {
      checked: relevantCells.length > 0,
      readableCells: relevantCells.filter(text => text.replace(/\?/g, '').trim().length > 0).length,
      questionMarkCells: relevantCells.filter(text => text.includes('?')).length,
    };
  }

  async verifyLayoutCanShowLongNames(): Promise<{ checked: boolean; maxNameLength: number }> {
    const rows = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW);
    const rowCount = await rows.count();
    let maxNameLength = 0;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const cells = rows.nth(rowIndex).locator('td');
      const nameText = await this.getLocatorText(cells.nth(3));
      maxNameLength = Math.max(maxNameLength, nameText.length);
    }

    const table = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_UNITABLE).first();
    await this.waitAndHighlight(table, { timeout: WAIT_TIMEOUTS.STANDARD });

    return {
      checked: rowCount > 0,
      maxNameLength,
    };
  }

  private async searchArchive(searchTerm: string): Promise<ArchiveSearchResult> {
    if (!searchTerm) {
      return {
        performed: false,
        searchTermAvailable: false,
        searchTerm,
        rowCount: await this.getArchiveRowCount(),
        matchingRows: 0,
        emptyStateVisible: await this.isEmptyStateVisible(),
      };
    }

    const searchInput = this.page.locator(SelectorsArchive.SEARCH_INPUT).first();
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await searchInput.click();
    await searchInput.press('Control+A');
    await searchInput.press('Delete');
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForArchiveTableReady();

    const rowCount = await this.getArchiveRowCount();
    const matchingRows = await this.countRowsContainingText(searchTerm);

    return {
      performed: true,
      searchTermAvailable: true,
      searchTerm,
      rowCount,
      matchingRows,
      emptyStateVisible: await this.isEmptyStateVisible(),
    };
  }

  private async waitForArchiveTableReady(): Promise<void> {
    await this.page.locator(SelectorsArchive.ARCHIVE_TABLE_CONTAINER_SELECTOR).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.PAGE_RELOAD,
    });
    await this.page.locator(SelectorsArchive.ARCHIVE_TABLE_BODY).first().waitFor({
      state: 'attached',
      timeout: WAIT_TIMEOUTS.PAGE_RELOAD,
    });
  }

  private async isArchiveTableReady(): Promise<boolean> {
    const tableVisible = await this.page.locator(SelectorsArchive.ARCHIVE_TABLE_UNITABLE).first().isVisible().catch(() => false);
    const bodyAttached = (await this.page.locator(SelectorsArchive.ARCHIVE_TABLE_BODY).count()) > 0;
    return tableVisible && bodyAttached;
  }

  private async getArchiveRowCount(): Promise<number> {
    return this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW).count();
  }

  private async getArchiveHeaders(): Promise<string[]> {
    const headers = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_HEADER_CELL);
    const headerCount = await headers.count();
    const values: string[] = [];

    for (let headerIndex = 0; headerIndex < headerCount; headerIndex++) {
      const headerText = await this.getLocatorText(headers.nth(headerIndex));
      if (headerText) {
        values.push(headerText);
      }
    }

    return values;
  }

  private async getFirstRowCellTexts(): Promise<string[]> {
    const cells = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_FIRST_ROW_DATA_CELL);
    const cellCount = await cells.count();
    const values: string[] = [];

    for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
      values.push(await this.getLocatorText(cells.nth(cellIndex)));
    }

    return values;
  }

  private async getFirstNonEmptyCellText(cellIndex: number): Promise<string> {
    const rows = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW);
    const rowCount = await rows.count();

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const cellText = await this.getLocatorText(rows.nth(rowIndex).locator('td').nth(cellIndex));
      if (cellText) {
        return cellText;
      }
    }

    return '';
  }

  private async countRowsContainingText(searchTerm: string): Promise<number> {
    const normalizedSearchTerm = this.normalizeText(searchTerm).toLowerCase();
    const rows = this.page.locator(SelectorsArchive.ARCHIVE_TABLE_ROW);
    const rowCount = await rows.count();
    let matches = 0;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowText = this.normalizeText(await this.getLocatorText(rows.nth(rowIndex))).toLowerCase();
      if (rowText.includes(normalizedSearchTerm)) {
        matches++;
      }
    }

    return matches;
  }

  private async getEntityOptions(): Promise<string[]> {
    return WEEKLY_ARCHIVE_ENTITY_TYPES;
  }

  private async selectEntityType(entityType: string): Promise<void> {
    await this.openEntityDropdown();
    await this.clickEntityOption(entityType);
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForArchiveTableReady();
    await this.page.locator(SelectorsArchive.ENTITY_SELECTED_BADGE_TEXT).filter({ hasText: entityType }).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.LONG,
    });
  }

  private async openEntityDropdown(): Promise<void> {
    if (!this.entityDropdownWarmupDone) {
      this.entityDropdownWarmupDone = true;
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.waitForNetworkIdle().catch(() => {});
      await this.waitForArchiveTableReady();
    }

    const selectedBadgeText = this.page.locator(SelectorsArchive.ENTITY_SELECTED_BADGE_TEXT).first();
    const entityDropdown = this.page.locator(SelectorsArchive.ENTITY_DROPDOWN).first();
    await this.waitAndHighlight(selectedBadgeText, { timeout: WAIT_TIMEOUTS.STANDARD });

    const openAttempts = [
      async () => selectedBadgeText.click(),
      async () => selectedBadgeText.click({ force: true }),
      async () => entityDropdown.click(),
      async () => entityDropdown.click({ force: true }),
      async () => {
        await entityDropdown.focus();
        await this.page.keyboard.press('Enter');
      },
    ];

    for (const openAttempt of openAttempts) {
      await openAttempt().catch(() => {});
      await this.waitForTimeout(TIMEOUTS.SHORT);
      if (await this.hasVisibleEntityOptions()) {
        return;
      }
    }

    await this.page.locator(SelectorsArchive.ENTITY_OPTION_ITEM).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.STANDARD,
    });
  }

  private async clickEntityOption(entityType: string): Promise<void> {
    const targetOption = this.page.locator(SelectorsArchive.ENTITY_OPTION_ITEM).filter({ hasText: entityType }).first();

    if (await targetOption.isVisible().catch(() => false)) {
      await this.waitAndHighlight(targetOption, { timeout: WAIT_TIMEOUTS.STANDARD });
      await targetOption.click();
      return;
    }

    const targetTextOption = this.page.getByText(entityType, { exact: true }).last();
    await this.waitAndHighlight(targetTextOption, { timeout: WAIT_TIMEOUTS.STANDARD });
    await targetTextOption.click();
  }

  private async hasVisibleEntityOptions(): Promise<boolean> {
    const options = this.page.locator(SelectorsArchive.ENTITY_OPTION_ITEM);
    const optionCount = await options.count();

    for (let optionIndex = 0; optionIndex < optionCount; optionIndex++) {
      if (await options.nth(optionIndex).isVisible().catch(() => false)) {
        return true;
      }
    }

    return false;
  }

  async isEntityDropdownSearchVisible(): Promise<boolean> {
    await this.openEntityDropdown();
    const searchInput = this.page.locator(SelectorsArchive.ENTITY_SEARCH_INPUT).first();
    const isVisible = await searchInput.isVisible().catch(() => false);
    if (isVisible) {
      await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    }
    await this.page.keyboard.press('Escape');
    return isVisible;
  }

  private async getOpenEntityDropdownList(): Promise<Locator> {
    const dropdownLists = this.page.locator(SelectorsArchive.ENTITY_DROPDOWN_LIST);
    await dropdownLists.first().waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });

    const listCount = await dropdownLists.count();
    for (let listIndex = 0; listIndex < listCount; listIndex++) {
      const dropdownList = dropdownLists.nth(listIndex);
      if (await dropdownList.isVisible().catch(() => false)) {
        await this.bringEntityDropdownListToFront(dropdownList);
        return dropdownList;
      }
    }

    throw new Error('Открытый видимый список фильтра "Тип сущности" не найден.');
  }

  private async isEntityDropdownListOpen(): Promise<boolean> {
    return this.getOpenEntityDropdownList()
      .then(() => true)
      .catch(() => false);
  }

  private async bringEntityDropdownListToFront(dropdownList: Locator): Promise<void> {
    await dropdownList.evaluate(element => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.zIndex = '999999';
      htmlElement.style.position = htmlElement.style.position || 'absolute';
      htmlElement.style.pointerEvents = 'auto';
      const parent = htmlElement.parentElement as HTMLElement | null;
      if (parent) {
        parent.style.zIndex = '999999';
        parent.style.position = parent.style.position || 'relative';
        parent.style.pointerEvents = 'auto';
      }
    });
  }

  private async getActiveEntity(): Promise<string> {
    return this.getLocatorText(this.page.locator(SelectorsArchive.ENTITY_SELECTED_BADGE_TEXT).first());
  }

  private async getBreadcrumbText(): Promise<string> {
    const breadcrumb = this.page.locator(SelectorsArchive.BREADCRUMB_ARCHIVE).first();
    if (await breadcrumb.isVisible().catch(() => false)) {
      await this.waitAndHighlight(breadcrumb, { timeout: WAIT_TIMEOUTS.STANDARD });
      return this.getLocatorText(breadcrumb);
    }
    return '';
  }

  private parseCount(countText: string): number | null {
    const countMatch = countText.match(/\d+/);
    return countMatch ? Number(countMatch[0]) : null;
  }

  private async isEmptyStateVisible(): Promise<boolean> {
    for (const emptyStateText of WEEKLY_ARCHIVE_EMPTY_STATE_TEXTS) {
      const emptyState = this.page.getByText(emptyStateText, { exact: false }).first();
      if (await emptyState.isVisible().catch(() => false)) {
        await this.waitAndHighlight(emptyState, { timeout: WAIT_TIMEOUTS.SHORT });
        return true;
      }
    }

    return false;
  }

  private async closeOpenModal(): Promise<void> {
    await this.closeAllVisibleModals();
  }

  private async closeTopVisibleModal(): Promise<boolean> {
    const beforeCount = await this.getVisibleModalCount();
    if (beforeCount === 0) {
      return true;
    }

    const targetCount = Math.max(beforeCount - 1, 0);
    const closeAttempts = [
      async () => this.clickTopVisibleModalButton(SelectorsArchive.MODAL_SAFE_CANCEL_BUTTON),
      async () => this.clickOutsideTopVisibleModal(),
      async () => this.clickTopVisibleModalButton(SelectorsArchive.MODAL_SAFE_CLOSE_BUTTON),
      async () => {
        await this.page.keyboard.press('Escape');
        return true;
      },
    ];

    for (const closeAttempt of closeAttempts) {
      await closeAttempt().catch(() => false);
      await this.waitForTimeout(TIMEOUTS.SHORT);
      if ((await this.getVisibleModalCount()) <= targetCount) {
        return true;
      }
    }

    logger.warn(`Не удалось закрыть верхний диалог архива. Было диалогов: ${beforeCount}, осталось: ${await this.getVisibleModalCount()}.`);
    return false;
  }

  private async clickTopVisibleModalButton(buttonSelector: string): Promise<boolean> {
    const modal = await this.getVisibleModal();
    if (!modal) {
      return false;
    }

    const buttons = modal.locator(buttonSelector);
    const buttonCount = await buttons.count();

    for (let buttonIndex = buttonCount - 1; buttonIndex >= 0; buttonIndex--) {
      const button = buttons.nth(buttonIndex);
      if (!(await button.isVisible().catch(() => false))) {
        continue;
      }

      await button.click({ force: true, timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
      return true;
    }

    return false;
  }

  private async clickOutsideTopVisibleModal(): Promise<boolean> {
    const modal = await this.getVisibleModal();
    if (!modal) {
      return false;
    }

    const modalBox = await modal.boundingBox();
    if (!modalBox) {
      return false;
    }

    const viewport = this.page.viewportSize() ?? await this.page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));
    const candidatePoints = [
      { x: Math.floor(modalBox.x - 20), y: Math.floor(modalBox.y + modalBox.height / 2) },
      { x: Math.floor(modalBox.x + modalBox.width + 20), y: Math.floor(modalBox.y + modalBox.height / 2) },
      { x: Math.floor(modalBox.x + modalBox.width / 2), y: Math.floor(modalBox.y - 20) },
      { x: Math.floor(modalBox.x + modalBox.width / 2), y: Math.floor(modalBox.y + modalBox.height + 20) },
    ];
    const clickPoint = candidatePoints.find(point =>
      point.x >= 2 &&
      point.y >= 2 &&
      point.x <= viewport.width - 2 &&
      point.y <= viewport.height - 2,
    ) ?? {
      x: this.clamp(Math.floor(modalBox.x + modalBox.width + 20), 2, viewport.width - 2),
      y: this.clamp(Math.floor(modalBox.y + modalBox.height / 2), 2, viewport.height - 2),
    };

    await this.page.mouse.click(clickPoint.x, clickPoint.y);
    return true;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private async getVisibleModal(): Promise<Locator | null> {
    const modals = this.page.locator(SelectorsArchive.MODAL_CONTAINER);
    const modalCount = await modals.count();

    for (let modalIndex = modalCount - 1; modalIndex >= 0; modalIndex--) {
      const modal = modals.nth(modalIndex);
      if (await modal.isVisible().catch(() => false)) {
        return modal;
      }
    }

    return null;
  }

  private async closeAllVisibleModals(): Promise<boolean> {
    for (let attempt = 0; attempt < 6; attempt++) {
      const visibleCount = await this.getVisibleModalCount();
      if (visibleCount === 0) {
        return true;
      }
      await this.closeTopVisibleModal();
    }

    return (await this.getVisibleModalCount()) === 0;
  }

  private async captureAndCloseVisibleModal(openedModalTexts: string[]): Promise<boolean> {
    const modal = await this.getVisibleModal();

    if (!modal) {
      return false;
    }

    openedModalTexts.push(await this.getLocatorText(modal));
    await this.closeOpenModal();
    return true;
  }

  private async validateAndCloseVisibleModal(openedModalTexts: string[]): Promise<ArchiveDialogValidationResult | null> {
    const modal = await this.getVisibleModal();

    if (!modal) {
      return null;
    }

    await this.waitForTimeout(TIMEOUTS.MEDIUM);
    const dialogText = await this.getLocatorText(modal);
    openedModalTexts.push(dialogText);

    const headingCount = await this.countVisibleLocators(modal.locator(SelectorsArchive.MODAL_HEADING));
    const labelCount = await this.countVisibleLocators(modal.locator(SelectorsArchive.MODAL_LABEL_OR_TITLE));
    const buttonCount = await this.countVisibleLocators(modal.locator(SelectorsArchive.MODAL_BUTTON));
    const tableCount = await modal.locator(SelectorsArchive.MODAL_TABLE).count();
    const warnings: string[] = [];

    await this.highlightVisibleDialogContent(modal);

    if (headingCount === 0) {
      warnings.push('В диалоге архива не найден видимый заголовок.');
    }
    if (!dialogText) {
      warnings.push('В диалоге архива нет читаемого текста.');
    }
    if (buttonCount === 0) {
      warnings.push('В диалоге архива не найдено видимых управляющих кнопок.');
    }

    const nestedResults = await this.validateSafeNestedDialogButtons(modal);
    const closeWorked = await this.closeAllVisibleModals();

    return {
      contentVisible: headingCount > 0 || labelCount > 0 || tableCount > 0,
      headingCount,
      labelCount,
      buttonCount,
      tableCount,
      hasMeaningfulText: dialogText.length > 0,
      closeWorked,
      nestedResults,
      warnings,
    };
  }

  private async highlightVisibleDialogContent(modal: Locator): Promise<void> {
    const visibleContent = modal.locator(
      [
        SelectorsArchive.MODAL_HEADING,
        SelectorsArchive.MODAL_LABEL_OR_TITLE,
        SelectorsArchive.MODAL_BUTTON,
        `${SelectorsArchive.MODAL_TABLE} th`,
      ].join(', '),
    );
    const contentCount = await visibleContent.count();

    for (let contentIndex = 0; contentIndex < contentCount; contentIndex++) {
      const content = visibleContent.nth(contentIndex);
      if (await content.isVisible().catch(() => false)) {
        await this.waitAndHighlight(content, { timeout: WAIT_TIMEOUTS.SHORT, waitAfter: TIMEOUTS.FLASH });
      }
    }
  }

  private async validateSafeNestedDialogButtons(modal: Locator): Promise<ArchiveNestedDialogValidationResult[]> {
    return this.scanNestedDialogButtons(modal, 1);
  }

  private async scanNestedDialogButtons(modal: Locator, depth: number): Promise<ArchiveNestedDialogValidationResult[]> {
    const results: ArchiveNestedDialogValidationResult[] = [];
    const maxDepth = 3;

    if (depth > maxDepth) {
      return results;
    }

    const buttons = modal.locator(SelectorsArchive.MODAL_BUTTON);
    const buttonCount = await buttons.count().catch(error => {
      logger.warn(`Не удалось получить кнопки вложенного диалога архива: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    });

    for (let buttonIndex = 0; buttonIndex < buttonCount; buttonIndex++) {
      const button = buttons.nth(buttonIndex);
      if (!(await button.isVisible().catch(() => false))) {
        continue;
      }

      const buttonLabel = await this.getLocatorText(button);
      if (!this.shouldClickNestedDialogButton(buttonLabel)) {
        await this.waitAndHighlight(button, { timeout: WAIT_TIMEOUTS.SHORT, waitAfter: TIMEOUTS.FLASH }).catch(() => {});
        results.push({
          buttonLabel,
          attempted: false,
          opened: false,
          contentVisible: false,
          closed: false,
        });
        continue;
      }

      const nestedResult: ArchiveNestedDialogValidationResult = {
        buttonLabel,
        attempted: true,
        opened: false,
        contentVisible: false,
        closed: false,
      };

      const visibleModalCountBeforeClick = await this.getVisibleModalCount();
      const urlBeforeClick = this.page.url();
      const clicked = await this.waitAndHighlight(button, { timeout: WAIT_TIMEOUTS.SHORT, waitAfter: TIMEOUTS.FLASH })
        .then(async () => {
          await button.click({ force: true });
          return true;
        })
        .catch(error => {
          logger.warn(`Не удалось открыть вложенный диалог архива "${nestedResult.buttonLabel}": ${error instanceof Error ? error.message : String(error)}`);
          return false;
        });

      if (!clicked) {
        results.push(nestedResult);
        continue;
      }

      await this.waitForTimeout(TIMEOUTS.MEDIUM);

      if (this.page.url() !== urlBeforeClick) {
        logger.warn(`Кнопка вложенного диалога архива "${nestedResult.buttonLabel}" изменила страницу вместо открытия диалога.`);
        await this.page.goto(urlBeforeClick, { waitUntil: 'domcontentloaded' }).catch(() => {});
        results.push(nestedResult);
        continue;
      }

      const opened = await this.page
        .waitForFunction(
          ({ selector, count }) => {
            const visibleCount = Array.from(document.querySelectorAll(selector)).filter(element => {
              const htmlElement = element as HTMLElement;
              const style = window.getComputedStyle(htmlElement);
              const rect = htmlElement.getBoundingClientRect();
              return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
            }).length;
            return visibleCount > count;
          },
          { selector: SelectorsArchive.MODAL_CONTAINER, count: visibleModalCountBeforeClick },
          { timeout: WAIT_TIMEOUTS.SHORT },
        )
        .then(() => true)
        .catch(() => false);

      nestedResult.opened = opened;

      if (opened) {
        const nestedModal = await this.getVisibleModalExcluding(modal);
        if (nestedModal) {
          await this.highlightVisibleDialogContent(nestedModal);
          const nestedText = await this.getLocatorText(nestedModal);
          const nestedHeadingCount = await this.countVisibleLocators(nestedModal.locator(SelectorsArchive.MODAL_HEADING));
          const nestedLabelCount = await this.countVisibleLocators(nestedModal.locator(SelectorsArchive.MODAL_LABEL_OR_TITLE));
          const nestedButtonCount = await this.countVisibleLocators(nestedModal.locator(SelectorsArchive.MODAL_BUTTON));
          const nestedTableCount = await nestedModal.locator(SelectorsArchive.MODAL_TABLE).count();

          nestedResult.contentVisible =
            nestedText.length > 0 ||
            nestedHeadingCount > 0 ||
            nestedLabelCount > 0 ||
            nestedButtonCount > 0 ||
            nestedTableCount > 0;

          const childResults = await this.scanNestedDialogButtons(nestedModal, depth + 1);
          results.push(...childResults);
          nestedResult.closed = await this.closeTopVisibleModal();
        }
      }

      if (!nestedResult.opened || !nestedResult.contentVisible || !nestedResult.closed) {
        logger.warn(
          `Вложенный диалог архива "${nestedResult.buttonLabel}" не прошел проверку: opened=${nestedResult.opened}, content=${nestedResult.contentVisible}, closed=${nestedResult.closed}`,
        );
      }

      results.push(nestedResult);
    }

    return results;
  }

  private shouldClickNestedDialogButton(buttonLabel: string): boolean {
    const normalizedLabel = buttonLabel.replace(/\s*\(\d+\)\s*/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!normalizedLabel) {
      return false;
    }

    const blockedLabels = [
      'закрыть',
      'close',
      'отменить',
      'cancel',
      'сохранить',
      'save',
      'да',
      'yes',
      'нет',
      'no',
      'удалить',
      'delete',
      'печать',
      'print',
      'полная информация',
      'full info',
      'редактировать',
      'edit',
      'архив',
      'archive',
    ];

    return !blockedLabels.includes(normalizedLabel);
  }

  private async getVisibleModalExcluding(excludedModal: Locator): Promise<Locator | null> {
    const excludedText = await this.getLocatorText(excludedModal);
    const modals = this.page.locator(SelectorsArchive.MODAL_CONTAINER);
    const modalCount = await modals.count();

    for (let modalIndex = modalCount - 1; modalIndex >= 0; modalIndex--) {
      const modal = modals.nth(modalIndex);
      if (!(await modal.isVisible().catch(() => false))) {
        continue;
      }

      const modalText = await this.getLocatorText(modal);
      if (modalText !== excludedText || modalIndex !== 0) {
        return modal;
      }
    }

    return null;
  }

  private async getVisibleModalCount(): Promise<number> {
    return this.countVisibleLocators(this.page.locator(SelectorsArchive.MODAL_CONTAINER));
  }

  private async countVisibleLocators(locator: Locator): Promise<number> {
    const count = await locator.count();
    let visibleCount = 0;

    for (let index = 0; index < count; index++) {
      if (await locator.nth(index).isVisible().catch(() => false)) {
        visibleCount++;
      }
    }

    return visibleCount;
  }

  private async getLocatorText(locator: Locator): Promise<string> {
    return this.normalizeText((await locator.innerText().catch(() => '')) || (await locator.textContent().catch(() => '')) || '');
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  async validateSearchPlaceholderValue(): Promise<boolean> {
    const searchInput = this.page.locator(SelectorsArchive.SEARCH_INPUT).first();
    return ((await searchInput.getAttribute('placeholder')) ?? '') === WEEKLY_ARCHIVE_SEARCH_PLACEHOLDER;
  }
}
