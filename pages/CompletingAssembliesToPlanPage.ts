import { expect, Page } from '@playwright/test';
import { ENV } from '../config';
import { PageObject } from '../lib/Page';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsModalWindowConsignmentNote from '../lib/Constants/SelectorsModalWindowConsignmentNote';
import { HIGHLIGHT_ERROR, HIGHLIGHT_SUCCESS } from '../lib/Constants/HighlightStyles';
import {
  ASSEMBLY_BADGE_TEXT,
  ASSEMBLY_WAYBILL_TITLE,
  PRODUCT_BADGE_TEXT,
  PRODUCT_WAYBILL_TITLE,
  REQUIRED_OWN_QUANTITY,
} from '../lib/Constants/TestDataERP3623';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

export type ComplectationTarget = {
  badgeText: string;
  route: string;
  searchInputSelector: string;
  numberCellSelector: string;
  expectedModalTitle: string;
};

export type CompleteSetButtonState = {
  hasDisabledAttribute: boolean;
  hasDisabledClass: boolean;
  isEnabled: boolean;
};

// Страница: Комплектация сборок на план
export class CreateCompletingAssembliesToPlanPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  getComplectationTargetByBadge(badgeText: string): ComplectationTarget {
    const normalizedBadgeText = badgeText.trim();

    if (normalizedBadgeText.includes(ASSEMBLY_BADGE_TEXT)) {
      return {
        badgeText: ASSEMBLY_BADGE_TEXT,
        route: SelectorsAssemblyKittingOnThePlan.PAGE_URL,
        searchInputSelector: SelectorsAssemblyKittingOnThePlan.COMPLEX_SBORKA_BY_PLAN_SEARCH_INPUT,
        numberCellSelector: SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE_ROW_CELL_NUMBER_PATTERN,
        expectedModalTitle: ASSEMBLY_WAYBILL_TITLE,
      };
    }

    if (normalizedBadgeText.includes(PRODUCT_BADGE_TEXT)) {
      return {
        badgeText: PRODUCT_BADGE_TEXT,
        route: SelectorsAssemblyKittingOnThePlan.PRODUCT_PAGE_URL,
        searchInputSelector: SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION_SEARCH_INPUT_SELECTOR,
        numberCellSelector: SelectorsAssemblyKittingOnThePlan.TABLE_PRODUCT_COMPLETION_ROW_NUMBER_PT_PATTERN,
        expectedModalTitle: PRODUCT_WAYBILL_TITLE,
      };
    }

    throw new Error(`Неизвестный тип строки на Онлайн табло по ПЗ: "${badgeText}"`);
  }

  async openComplectationTarget(target: ComplectationTarget): Promise<void> {
    const targetUrl = new URL(target.route, ENV.BASE_URL);
    const currentPath = this.page.url() ? new URL(this.page.url()).pathname : '';

    if (currentPath !== targetUrl.pathname) {
      await this.goto(targetUrl.toString());
      await this.waitForNetworkIdle();
      logger.info(`Открыта страница комплектации для типа ${target.badgeText}`);
    } else {
      logger.info(`Страница комплектации для типа ${target.badgeText} уже открыта`);
    }
  }

  async searchComplectationByName(target: ComplectationTarget, itemName: string): Promise<void> {
    const searchInput = this.page.locator(target.searchInputSelector).first();
    await this.waitAndHighlight(searchInput, { timeout: WAIT_TIMEOUTS.STANDARD });
    await searchInput.click();
    await searchInput.fill(itemName);
    await searchInput.press('Enter');
    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.INPUT_SET);
    logger.info(`Выполнен поиск комплектации: ${itemName}`);
  }

  async openWaybillFromSearchResult(target: ComplectationTarget): Promise<void> {
    const numberCell = this.page.locator(target.numberCellSelector).first();
    await this.waitAndHighlight(numberCell, { timeout: WAIT_TIMEOUTS.STANDARD });
    await numberCell.dblclick();

    const waybillModal = this.getOpenWaybillModal();
    await waybillModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitForTimeout(TIMEOUTS.STANDARD);
    logger.info('Открыта накладная на комплектацию');
  }

  async getOpenWaybillTitle(expectedTitle?: string): Promise<string> {
    const title = this.getOpenWaybillModal().locator(SelectorsModalWindowConsignmentNote.MODAL_WINDOW_TITLE_NAME).first();
    await title.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    if (expectedTitle) {
      await expect(title).toHaveText(expectedTitle, { timeout: WAIT_TIMEOUTS.VERY_SHORT }).catch(() => undefined);
    }

    const actualTitle = (await title.textContent())?.trim() || '';
    await this.highlightElement(title, !expectedTitle || actualTitle === expectedTitle ? HIGHLIGHT_SUCCESS : HIGHLIGHT_ERROR);
    await this.waitForTimeout(TIMEOUTS.MEDIUM);

    return actualTitle;
  }

  async setOwnQuantityToRequiredValue(): Promise<string> {
    const ownQuantityInput = this.page.locator(SelectorsModalWindowConsignmentNote.WAYBILL_DETAILS_OWN_QUANTITY_INPUT).first();
    await this.waitAndHighlight(ownQuantityInput, { timeout: WAIT_TIMEOUTS.STANDARD });

    if (await ownQuantityInput.isDisabled()) {
      throw new Error('Поле собственного количества недоступно для ввода');
    }

    await ownQuantityInput.click();
    await ownQuantityInput.fill(REQUIRED_OWN_QUANTITY);
    await this.waitForTimeout(TIMEOUTS.MEDIUM);

    const actualValue = await ownQuantityInput.inputValue();
    if (actualValue !== REQUIRED_OWN_QUANTITY) {
      await ownQuantityInput.press('Control+A');
      await ownQuantityInput.press('Delete');
      await ownQuantityInput.pressSequentially(REQUIRED_OWN_QUANTITY);
      await this.waitForTimeout(TIMEOUTS.MEDIUM);
    }

    const finalValue = await ownQuantityInput.inputValue();
    if (finalValue !== REQUIRED_OWN_QUANTITY) {
      throw new Error(`Не удалось установить собственное количество в ${REQUIRED_OWN_QUANTITY}. Текущее значение: "${finalValue}"`);
    }

    logger.info(`Собственное количество установлено в ${REQUIRED_OWN_QUANTITY}`);
    return finalValue;
  }

  async getCompleteSetButtonStateAndHighlight(): Promise<CompleteSetButtonState> {
    const completeSetButton = this.page.locator(SelectorsModalWindowConsignmentNote.COMPLETE_SET_BUTTON).first();
    await completeSetButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.waitForTimeout(TIMEOUTS.MEDIUM);

    const state = await completeSetButton.evaluate((button: HTMLElement, disabledClass: string) => {
      const hasDisabledAttribute = button.hasAttribute('disabled');
      const hasDisabledClass = button.classList.contains(disabledClass);

      return {
        hasDisabledAttribute,
        hasDisabledClass,
        isEnabled: !hasDisabledAttribute && !hasDisabledClass,
      };
    }, SelectorsModalWindowConsignmentNote.DISABLED_BUTTON_CLASS);

    await this.highlightElement(completeSetButton, state.isEnabled ? HIGHLIGHT_SUCCESS : HIGHLIGHT_ERROR);
    await this.waitForTimeout(TIMEOUTS.MEDIUM);
    logger.info(`Состояние кнопки Скомплектовать: ${state.isEnabled ? 'активна' : 'неактивна'}`);

    return state;
  }

  async closeOpenWaybill(): Promise<boolean> {
    const waybillModal = this.getOpenWaybillModal();
    await this.page.keyboard.press('Escape');
    await waybillModal.waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => undefined);
    return (await waybillModal.count()) === 0 || !(await waybillModal.isVisible());
  }

  private getOpenWaybillModal() {
    return this.page.locator(SelectorsModalWindowConsignmentNote.MODAL_WINDOW_OPEN).first();
  }
}
