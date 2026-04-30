import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreateOnlineScoreboardPage, DateCandidate } from '../pages/OnlineScoreboardPage';
import { CreateMetalworkingWarehousePage } from '../pages/MetalworkingWarehousePage';
import { TEST_TIMEOUTS, TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../lib/utils/utilities';
import logger from '../lib/utils/logger';

export const runERP_3372 = () => {
  test('ERP-3372 - Проверка поля Требуемое время готовности на Онлайн табло по ПЗ', async ({ page, context }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    const onlineScoreboardPage = new CreateOnlineScoreboardPage(page);
    const dateCandidates: DateCandidate[] = [];
    let detailName = '';
    let requiredReadyTime = '';
    let belongingNames: string[] = [];
    let assemblyWorkStartDates: string[] = [];
    let warehouseReadyDate = '';

    await allure.step('Шаг 1: Открыть Онлайн табло и выбрать деталь из таблицы металлообработки', async () => {
      await onlineScoreboardPage.openOnlineTable();
      const rowData = await onlineScoreboardPage.getFirstMetalworkingDetailForReadyTimeCheck();
      detailName = rowData.detailName;
      requiredReadyTime = rowData.requiredReadyTime;

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(detailName).not.toBe('');
          expect.soft(requiredReadyTime).not.toBe('');
        },
        'Проверка выбранной детали и значения Требуемое время готовности',
        testInfo,
      );
    });

    await allure.step('Шаг 2: Открыть карточку детали и проверить секцию Принадлежность', async () => {
      await onlineScoreboardPage.openDetailDialogByName(detailName);
      belongingNames = await onlineScoreboardPage.getBelongingNamesFromOpenDetailDialog();
      await onlineScoreboardPage.closeOpenDialog();

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(Array.isArray(belongingNames)).toBe(true);
        },
        'Проверка получения списка Принадлежность',
        testInfo,
      );
    });

    await allure.step('Шаг 3: Получить дату Начало работ для всех элементов из секции Принадлежность', async () => {
      for (const belongingName of belongingNames) {
        console.log(`[ERP-3372] Начинаем поиск даты 1: Онлайн табло по ПЗ / Сборка / Начало работ для родителя "${belongingName}"`);
        await onlineScoreboardPage.waitForTimeout(TIMEOUTS.MEDIUM);
        const tab = await context.newPage();
        const onlineScoreboardTab = new CreateOnlineScoreboardPage(tab);
        try {
          const workStartDate = await onlineScoreboardTab.getAssemblyWorkStartDate(belongingName);
          console.log(`[ERP-3372] Извлечена дата 1 для родителя "${belongingName}": "${workStartDate || 'не заполнена'}"`);
          assemblyWorkStartDates.push(workStartDate);
          if (workStartDate && workStartDate !== '-') {
            dateCandidates.push({
              source: 'Онлайн табло по ПЗ - Сборка - Начало работ',
              itemName: belongingName,
              value: workStartDate,
            });
          }
        } finally {
          await tab.close();
        }
      }

      await expectSoftWithScreenshot(
        page,
        () => {
          if (belongingNames.length > 0) {
            expect.soft(assemblyWorkStartDates.filter(date => date && date !== '-')).toHaveLength(belongingNames.length);
          } else {
            expect.soft(assemblyWorkStartDates).toHaveLength(0);
          }
        },
        'Проверка дат Начало работ из родительских элементов',
        testInfo,
      );
    });

    await allure.step('Шаг 4: Получить дату Дата плановой готовности склада', async () => {
      console.log(`[ERP-3372] Начинаем поиск даты 2: Заказ склада на металлообработку / Дата плановой готовности склада для детали "${detailName}"`);
      await onlineScoreboardPage.waitForTimeout(TIMEOUTS.MEDIUM);
      const tab = await context.newPage();
      const metalworkingWarehousePage = new CreateMetalworkingWarehousePage(tab);
      try {
        warehouseReadyDate = await metalworkingWarehousePage.getPlannedWarehouseReadyDate(detailName);
        console.log(`[ERP-3372] Извлечена дата 2 для детали "${detailName}": "${warehouseReadyDate || 'не заполнена'}"`);
        if (warehouseReadyDate && warehouseReadyDate !== '-') {
          dateCandidates.push({
            source: 'Заказ склада на металлообработку - Дата плановой готовности склада',
            itemName: detailName,
            value: warehouseReadyDate,
          });
        }

        await expectSoftWithScreenshot(
          tab,
          () => {
            expect.soft(warehouseReadyDate).toBeDefined();
          },
          'Проверка даты плановой готовности склада',
          testInfo,
        );
      } finally {
        await tab.close();
      }
    });

    await allure.step('Шаг 5: Проверить, что Онлайн табло показывает самую раннюю дату', async () => {
      const earliestDate = onlineScoreboardPage.getEarliestDate(dateCandidates);
      logger.info(`ERP-3372 кандидаты дат: ${JSON.stringify(dateCandidates, null, 2)}`);
      logger.info(`ERP-3372 самая ранняя дата: ${JSON.stringify(earliestDate)}`);
      logger.info(`ERP-3372 Требуемое время готовности в таблице: ${requiredReadyTime}`);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(earliestDate, 'Должна быть найдена хотя бы одна дата-кандидат').not.toBeNull();
          if (earliestDate) {
            expect.soft(onlineScoreboardPage.normalizeDateForComparison(requiredReadyTime)).toBe(
              onlineScoreboardPage.normalizeDateForComparison(earliestDate.value),
            );
          }
        },
        'Проверка соответствия Требуемого времени готовности самой ранней дате',
        testInfo,
      );
    });
  });
};
