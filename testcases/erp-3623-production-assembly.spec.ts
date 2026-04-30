import { expect, Page, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreateAssemblyPage, AssemblyComplectationRowData } from '../pages/AssemplyPage';
import { CreateCompletingAssembliesToPlanPage } from '../pages/CompletingAssembliesToPlanPage';
import { ASSEMBLY_BADGE_TEXT, REQUIRED_OWN_QUANTITY } from '../lib/Constants/TestDataERP3623';
import { TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../lib/utils/utilities';
import logger from '../lib/utils/logger';

export const runERP_3623_ProductionAssembly = () => {
  test('ERP-3623 - Проверка доступности комплектации сборок из Производство Сборка', async ({ page, context }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);

    const assemblyPage = new CreateAssemblyPage(page);
    let expectedRowCount = 0;
    let assemblyRows: AssemblyComplectationRowData[] = [];
    let assemblyComplectationPage: Page | undefined;
    let productComplectationPage: Page | undefined;
    let assemblyComplectationPageObject: CreateCompletingAssembliesToPlanPage | undefined;
    let productComplectationPageObject: CreateCompletingAssembliesToPlanPage | undefined;

    await allure.step('Шаг 1: Открыть Производство -> Сборка и проверить количество строк', async () => {
      expectedRowCount = await assemblyPage.openReadyComplectationAssemblyPage();
      assemblyRows = await assemblyPage.collectReadyComplectationRowsByScrolling();
      await assemblyPage.scrollReadyComplectationTableToTop(assemblyRows[0]);

      logger.info(`Ожидаемое количество строк из чипа Производство -> Сборка: ${expectedRowCount}`);
      logger.info(`Собрано строк после прокрутки Производство -> Сборка: ${assemblyRows.length}`);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(expectedRowCount).toBeGreaterThan(0);
          expect.soft(assemblyRows).toHaveLength(expectedRowCount);
        },
        'Проверка количества строк на странице Производство -> Сборка',
        testInfo,
      );

      if (assemblyRows.length !== expectedRowCount) {
        throw new Error(
          `Количество собранных строк Производство -> Сборка не совпадает с чипом. Ожидалось: ${expectedRowCount}, собрано: ${assemblyRows.length}. Обработка строк остановлена.`,
        );
      }
    });

    try {
      assemblyComplectationPage = await context.newPage();
      productComplectationPage = await context.newPage();
      assemblyComplectationPageObject = new CreateCompletingAssembliesToPlanPage(assemblyComplectationPage);
      productComplectationPageObject = new CreateCompletingAssembliesToPlanPage(productComplectationPage);

      for (let rowIndex = 0; rowIndex < assemblyRows.length; rowIndex++) {
        const rowData = assemblyRows[rowIndex];
        const target = assemblyComplectationPageObject.getComplectationTargetByBadge(rowData.badgeText);
        const targetPage = target.badgeText === ASSEMBLY_BADGE_TEXT ? assemblyComplectationPage : productComplectationPage;
        const targetPageObject =
          target.badgeText === ASSEMBLY_BADGE_TEXT ? assemblyComplectationPageObject : productComplectationPageObject;

        await allure.step(`Шаг 2.${rowIndex + 1}: Проверить комплектацию ${target.badgeText} "${rowData.name}"`, async () => {
          await page.bringToFront();
          await assemblyPage.highlightReadyComplectationRow(rowData);

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
