import { expect, Page, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import { CreateOnlineScoreboardPage, OnlineBoardComplectationRowData } from '../pages/OnlineScoreboardPage';
import { ASSEMBLY_BADGE_TEXT, REQUIRED_OWN_QUANTITY } from '../lib/Constants/TestDataERP3623';
import { TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../lib/utils/utilities';
import logger from '../lib/utils/logger';

export const runERP_3623 = () => {
  test('ERP-3623 - Проверка доступности комплектации сборок из Онлайн табло по ПЗ', async ({ page, context }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

    const onlineScoreboardPage = new CreateOnlineScoreboardPage(page);
    let expectedRowCount = 0;
    let onlineBoardRows: OnlineBoardComplectationRowData[] = [];
    let assemblyComplectationPage: Page | undefined;
    let productComplectationPage: Page | undefined;
    let assemblyComplectationPageObject: CreateCompletingAssembliesToPlanPage | undefined;
    let productComplectationPageObject: CreateCompletingAssembliesToPlanPage | undefined;

    await allure.step('Шаг 1: Открыть Онлайн табло по ПЗ и проверить количество строк', async () => {
      expectedRowCount = await onlineScoreboardPage.openReadyComplectationBoardByPZ();
      onlineBoardRows = await onlineScoreboardPage.collectReadyComplectationRowsByScrolling();
      await onlineScoreboardPage.scrollReadyComplectationTableToTop(onlineBoardRows[0]);

      logger.info(`Ожидаемое количество строк из чипа: ${expectedRowCount}`);
      logger.info(`Собрано строк после прокрутки Онлайн табло по ПЗ: ${onlineBoardRows.length}`);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(expectedRowCount).toBeGreaterThan(0);
          expect.soft(onlineBoardRows).toHaveLength(expectedRowCount);
        },
        'Проверка количества строк на Онлайн табло по ПЗ',
        testInfo,
      );

      if (onlineBoardRows.length !== expectedRowCount) {
        throw new Error(
          `Количество собранных строк Онлайн табло по ПЗ не совпадает с чипом. Ожидалось: ${expectedRowCount}, собрано: ${onlineBoardRows.length}. Обработка строк остановлена.`,
        );
      }
    });

    try {
      assemblyComplectationPage = await context.newPage();
      productComplectationPage = await context.newPage();
      assemblyComplectationPageObject = new CreateCompletingAssembliesToPlanPage(assemblyComplectationPage);
      productComplectationPageObject = new CreateCompletingAssembliesToPlanPage(productComplectationPage);

      for (let rowIndex = 0; rowIndex < onlineBoardRows.length; rowIndex++) {
        const rowData = onlineBoardRows[rowIndex];
        const target = assemblyComplectationPageObject.getComplectationTargetByBadge(rowData.badgeText);
        const targetPage = target.badgeText === ASSEMBLY_BADGE_TEXT ? assemblyComplectationPage : productComplectationPage;
        const targetPageObject =
          target.badgeText === ASSEMBLY_BADGE_TEXT ? assemblyComplectationPageObject : productComplectationPageObject;

        await allure.step(`Шаг 2.${rowIndex + 1}: Проверить комплектацию ${target.badgeText} "${rowData.name}"`, async () => {
          await page.bringToFront();
          await onlineScoreboardPage.highlightReadyComplectationRow(rowData);

          await targetPage.bringToFront();
          await targetPageObject.openComplectationTarget(target);
          await targetPageObject.searchComplectationByName(target, rowData.name);
          await targetPageObject.openWaybillFromSearchResult(target);

          const actualOwnQuantity = await targetPageObject.setOwnQuantityToRequiredValue();
          await expectSoftWithScreenshot(
            targetPage,
            () => {
              expect.soft(actualOwnQuantity).toBe(REQUIRED_OWN_QUANTITY);
            },
            `Проверка количества в накладной для "${rowData.name}"`,
            testInfo,
          );

          const buttonState = await targetPageObject.getCompleteSetButtonStateAndHighlight();
          await expectSoftWithScreenshot(
            targetPage,
            () => {
              expect.soft(buttonState.hasDisabledAttribute).toBe(false);
              expect.soft(buttonState.hasDisabledClass).toBe(false);
              expect.soft(buttonState.isEnabled).toBe(true);
            },
            `Проверка доступности кнопки Скомплектовать для "${rowData.name}"`,
            testInfo,
          );

          const actualModalTitle = await targetPageObject.getOpenWaybillTitle(target.expectedModalTitle);
          await expectSoftWithScreenshot(
            targetPage,
            () => {
              expect.soft(actualModalTitle).toBe(target.expectedModalTitle);
            },
            `Проверка заголовка накладной для "${rowData.name}"`,
            testInfo,
          );

          const isWaybillClosed = await targetPageObject.closeOpenWaybill();
          await expectSoftWithScreenshot(
            targetPage,
            () => {
              expect.soft(isWaybillClosed).toBe(true);
            },
            `Проверка закрытия накладной для "${rowData.name}"`,
            testInfo,
          );
        });
      }
    } finally {
      if (assemblyComplectationPage && !assemblyComplectationPage.isClosed()) {
        await assemblyComplectationPage.close();
      }

      if (productComplectationPage && !productComplectationPage.isClosed()) {
        await productComplectationPage.close();
      }
    }
  });
};
