import { expect, Locator, Page } from '@playwright/test';
import { PageObject } from '../lib/Page';
import * as SelectorsAssemblyPage from '../lib/Constants/SelectorsAssemblyPage';
import { HIGHLIGHT_SUCCESS } from '../lib/Constants/HighlightStyles';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';

export interface AssemblyComplectationRowData {
  rowKey: string;
  name: string;
  badgeText: string;
}

// Страница: Сборка
export class CreateAssemblyPage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  async openReadyComplectationAssemblyPage(): Promise<number> {
    await this.goto(SelectorsAssemblyPage.ASSEMBLY_PAGE_URL);
    await this.waitForNetworkIdle();

    const assemblyCard = this.page.locator(SelectorsAssemblyPage.ASSEMBLY_NAV_CARD).first();
    await this.waitAndHighlight(assemblyCard, { timeout: WAIT_TIMEOUTS.STANDARD });
    await assemblyCard.click();
    await this.waitForNetworkIdle();
    await this.page.locator(SelectorsAssemblyPage.ASSEMBLY_PAGE_TITLE_NAME).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.LONG,
    });
    await this.waitForNetworkIdle().catch(() => {});
    await this.waitForTimeout(TIMEOUTS.VERY_LONG);

    await this.selectReadyComplectationChip();
    const expectedRowCount = await this.getReadyComplectationChipCount();
    logger.info(`Количество строк в чипе Готовность к комплектации на странице Сборка: ${expectedRowCount}`);
    return expectedRowCount;
  }

  async collectReadyComplectationRowsByScrolling(): Promise<AssemblyComplectationRowData[]> {
    await this.scrollReadyComplectationTableToTop();

    const collectedRows: AssemblyComplectationRowData[] = [];
    const collectedRowKeys = new Set<string>();
    await this.page.locator(SelectorsAssemblyPage.ASSEMBLY_TABLE_NAME_CELL).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.LONG,
    });

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

    logger.info(`Собрано строк страницы Сборка после прокрутки: ${collectedRows.length}`);
    return collectedRows;
  }

  async scrollReadyComplectationTableToTop(firstRow?: AssemblyComplectationRowData): Promise<void> {
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
      throw new Error(`Не удалось вернуться к верхней строке страницы Сборка: "${firstRow.name}" (${firstRow.badgeText})`);
    }
  }

  async highlightReadyComplectationRow(rowData: AssemblyComplectationRowData): Promise<void> {
    await this.page.bringToFront();

    let stableIterations = 0;

    while (stableIterations < 3) {
      const visibleRows = await this.getVisibleReadyComplectationRows();
      const visibleIndex = visibleRows.findIndex(row => row.rowKey === rowData.rowKey);

      if (visibleIndex >= 0) {
        const matchingNameCell = this.page
          .locator(SelectorsAssemblyPage.ASSEMBLY_TABLE_NAME_CELL)
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

    throw new Error(`Не удалось найти строку для подсветки на странице Сборка: "${rowData.name}" (${rowData.badgeText})`);
  }

  private async selectReadyComplectationChip(): Promise<void> {
    const readinessChip = this.getReadyComplectationChip();
    await readinessChip.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const readinessChipInput = readinessChip.locator(SelectorsAssemblyPage.ASSEMBLY_CHIP_INPUT).first();
    await readinessChipInput.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });

    if (!(await readinessChipInput.isChecked())) {
      await expect(readinessChip).not.toHaveClass(new RegExp(SelectorsAssemblyPage.ASSEMBLY_CHIP_DISABLED_CLASS), {
        timeout: WAIT_TIMEOUTS.PAGE_RELOAD,
      });
      await this.waitAndHighlight(readinessChip, { timeout: WAIT_TIMEOUTS.STANDARD });
      await readinessChipInput.check({ force: true });
    }

    await this.waitForNetworkIdle();
    await this.waitForTimeout(TIMEOUTS.VERY_LONG);
    await this.page.locator(SelectorsAssemblyPage.ASSEMBLY_TABLE_NAME_CELL).first().waitFor({
      state: 'visible',
      timeout: WAIT_TIMEOUTS.LONG,
    });
    logger.info('Выбран чип Готовность к комплектации на странице Сборка');
  }

  private async getReadyComplectationChipCount(): Promise<number> {
    const readinessChip = this.getReadyComplectationChip();
    await readinessChip.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const chipText = (await readinessChip.textContent())?.trim() || '';
    const countMatch = chipText.match(/\((\d+)\)/);

    if (!countMatch) {
      throw new Error(`Не удалось получить количество строк из чипа на странице Сборка. Текст чипа: "${chipText}"`);
    }

    return Number(countMatch[1]);
  }

  private getReadyComplectationChip(): Locator {
    return this.page
      .locator(SelectorsAssemblyPage.ASSEMBLY_CHIP)
      .filter({
        has: this.page.locator(SelectorsAssemblyPage.ASSEMBLY_CHIP_INPUT),
        hasText: SelectorsAssemblyPage.ASSEMBLY_READINESS_CHIP_TEXT,
      })
      .first();
  }

  private async getVisibleReadyComplectationRows(): Promise<AssemblyComplectationRowData[]> {
    const nameCells = this.page.locator(SelectorsAssemblyPage.ASSEMBLY_TABLE_NAME_CELL);
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
      SelectorsAssemblyPage.ASSEMBLY_TABLE_BADGE_TEXT,
    );
  }

  private async isReadyComplectationRowVisible(rowData: AssemblyComplectationRowData): Promise<boolean> {
    const visibleRows = await this.getVisibleReadyComplectationRows();
    return visibleRows.some(row => row.rowKey === rowData.rowKey);
  }

  private async scrollReadyComplectationTable(direction: 'top' | 'down'): Promise<{ before: number; after: number; max: number }> {
    const nameCells = this.page.locator(SelectorsAssemblyPage.ASSEMBLY_TABLE_NAME_CELL);
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
}
