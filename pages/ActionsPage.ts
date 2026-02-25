/**
 * @file ActionsPage.ts
 * Page object for the /actions (History) page: filters, actions table, baseline row tracking.
 */

import { Page, Locator } from '@playwright/test';
import { PageObject } from '../lib/Page';
import { ENV } from '../config';
import * as SelectorsActions from '../lib/Constants/SelectorsActions';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_BASELINE, HIGHLIGHT_NEW_ROW } from '../lib/Constants/HighlightStyles';
import { normalizeText } from '../lib/utils/utilities';

const PAUSE = TIMEOUTS.VISUAL_FOLLOW;

export class ActionsPage extends PageObject {
  constructor(page: Page) {
    super(page);
  }

  /** Navigate to the actions (history) page. */
  async goto(): Promise<void> {
    await this.page.goto(`${ENV.BASE_URL}actions`);
    await this.page.waitForLoadState('networkidle');
    await this.page.locator(SelectorsActions.ACTIONS_PAGE_LOADER).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.page.waitForTimeout(PAUSE);
  }

  /** Set entity type filter to "Деталь". */
  async setTypeFilterToDetail(): Promise<void> {
    const typeFilter = this.page.locator(SelectorsActions.ACTIONS_PAGE_TYPE_FILTER);
    await this.waitAndHighlight(typeFilter.locator(SelectorsActions.ACTIONS_PAGE_TYPE_FILTER_TRIGGER));
    await this.page.waitForTimeout(PAUSE);
    await typeFilter.locator(SelectorsActions.ACTIONS_PAGE_TYPE_FILTER_TRIGGER).click();
    await this.page.waitForTimeout(PAUSE);
    await typeFilter.locator(SelectorsActions.ACTIONS_PAGE_FILTER_OPTION).first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
    const detalOption = typeFilter.locator(SelectorsActions.ACTIONS_PAGE_FILTER_OPTION).filter({ hasText: 'Деталь' }).first();
    await this.waitAndHighlight(detalOption);
    await this.page.waitForTimeout(PAUSE);
    await detalOption.click();
    await this.page.locator(SelectorsActions.ACTIONS_PAGE_LOADER).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.page.waitForTimeout(PAUSE);
  }

  /** Open the user/employee filter dropdown. */
  async openUserFilter(): Promise<void> {
    const userFilter = this.page.locator(SelectorsActions.ACTIONS_PAGE_USER_FILTER);
    await this.waitAndHighlight(userFilter.locator(SelectorsActions.ACTIONS_PAGE_TYPE_FILTER_TRIGGER));
    await this.page.waitForTimeout(PAUSE);
    await userFilter.locator(SelectorsActions.ACTIONS_PAGE_TYPE_FILTER_TRIGGER).click();
    await this.page.waitForTimeout(PAUSE);
  }

  /** Fill user search and press Enter; wait for first result row. */
  async fillUserSearch(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator(SelectorsActions.USER_TABLE_LIST_SEARCH_INPUT_DROPDOWN);
    await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitAndHighlight(searchInput);
    await this.page.waitForTimeout(PAUSE);
    await searchInput.fill(searchTerm);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(PAUSE);
    const resultsTbody = this.page.locator(SelectorsActions.USER_TABLE_LIST_ROW);
    await resultsTbody.first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
  }

  /** Locator for the first user search result row (use after fillUserSearch). */
  getFirstUserSearchResultRow(): Locator {
    return this.page.locator(SelectorsActions.USER_TABLE_LIST_ROW).first();
  }

  /** Select first user checkbox and click Add. */
  async selectFirstUserAndClickAdd(): Promise<void> {
    const rowCheckbox = this.page.locator(SelectorsActions.USER_TABLE_LIST_ROW_CHECKBOX).first();
    await this.waitAndHighlight(rowCheckbox);
    await this.page.waitForTimeout(PAUSE);
    await rowCheckbox.click();
    await this.page.waitForTimeout(PAUSE);
    const addSelectedBtn = this.page.locator(SelectorsActions.MODAL_LIST_USER_ADD_SELECTED);
    await this.waitAndHighlight(addSelectedBtn);
    await this.page.waitForTimeout(PAUSE);
    await addSelectedBtn.click();
    await this.page.locator(SelectorsActions.MODAL_LIST_USER_TABLE).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
  }

  /** Locator for chosen employees tbody (use after selectFirstUserAndClickAdd, before confirmUserSelection). */
  getChosenEmployeesTbody(): Locator {
    return this.page.locator(SelectorsActions.MODAL_LIST_USER_TABLE_TBODY);
  }

  /** Click confirm to apply user selection and close modal. */
  async confirmUserSelection(): Promise<void> {
    const confirmBtn = this.page.locator(SelectorsActions.MODAL_LIST_USER_CONFIRM);
    await this.waitAndHighlight(confirmBtn);
    await this.page.waitForTimeout(PAUSE);
    await confirmBtn.click();
    await this.page.locator(SelectorsActions.MODAL_LIST_USER_SECTION).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.page.locator(SelectorsActions.ACTIONS_PAGE_LOADER).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.page.waitForTimeout(PAUSE);
  }

  /** Locator for actions table rows. */
  getTableRows(): Locator {
    return this.page.locator(SelectorsActions.ACTIONS_TABLE_ROW);
  }

  /** Stable signature from date, user, type, description (omits entity identifier so it still matches after rename). */
  async getStableRowSignature(row: Locator): Promise<string> {
    const cells = await Promise.all([
      row.locator('td').nth(1).innerText(),
      row.locator('td').nth(2).innerText(),
      row.locator('td').nth(3).innerText(),
      row.locator('td').nth(SelectorsActions.ACTIONS_TABLE_DESCRIPTION_CELL_INDEX).innerText()
    ]);
    return normalizeText(cells.join(' '));
  }

  /** Find row index in actions table that matches the stable baseline signature. */
  async findBaselineRowIndex(tableRows: Locator, baselineSignature: string): Promise<number> {
    const count = await tableRows.count();
    const normBase = normalizeText(baselineSignature);
    for (let i = 0; i < count; i++) {
      const rowSig = await this.getStableRowSignature(tableRows.nth(i));
      if (rowSig === normBase || normBase.includes(rowSig) || rowSig.includes(normBase)) return i;
    }
    return -1;
  }

  /** Get the description (Действие) cell text for a table row. */
  async getRowDescriptionText(row: Locator): Promise<string> {
    return row.locator('td').nth(SelectorsActions.ACTIONS_TABLE_DESCRIPTION_CELL_INDEX).innerText();
  }

  /** Reload page and wait for loader to hide. */
  async refreshAndWaitForLoader(): Promise<void> {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    await this.page.locator(SelectorsActions.ACTIONS_PAGE_LOADER).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.page.waitForTimeout(PAUSE);
  }

  /** Highlight baseline row (purple) and all new rows above it (yellow). */
  async highlightBaselineAndNewRows(tableRows: Locator, baselineIdx: number): Promise<void> {
    if (baselineIdx < 0) return;
    await this.highlightElement(tableRows.nth(baselineIdx), HIGHLIGHT_BASELINE);
    await this.page.waitForTimeout(PAUSE);
    for (let i = 0; i < baselineIdx; i++) {
      await this.highlightElement(tableRows.nth(i), HIGHLIGHT_NEW_ROW);
      await this.page.waitForTimeout(PAUSE);
    }
  }

  /** Get stable signature from the top row (row 0) and highlight it as baseline. */
  async getBaselineSignatureFromTopRowAndHighlight(tableRows: Locator): Promise<string> {
    const signature = await this.getStableRowSignature(tableRows.nth(0));
    await this.highlightElement(tableRows.nth(0), HIGHLIGHT_BASELINE);
    await this.page.waitForTimeout(PAUSE);
    return signature;
  }

  /** Highlight a single row as baseline (e.g. after refresh). */
  async highlightBaselineRow(tableRows: Locator, index: number): Promise<void> {
    if (index >= 0) {
      await this.highlightElement(tableRows.nth(index), HIGHLIGHT_BASELINE);
      await this.page.waitForTimeout(PAUSE);
    }
  }

  /** Wait for first actions table row to be visible (e.g. after filters applied). */
  async waitForActionsTableVisible(): Promise<void> {
    await this.page.locator(SelectorsActions.ACTIONS_TABLE_ROW).first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
  }
}
