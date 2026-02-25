/* eslint-disable playwright/no-wait-for-timeout */
import { test, expect } from '@playwright/test';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { ActionsPage } from '../pages/ActionsPage';
import { expectSoftWithScreenshot } from '../lib/Page';
import { SELECTORS, LOGIN_TEST_CONFIG } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

const PAUSE = TIMEOUTS.VISUAL_FOLLOW;

export const runU007_01_Actions = () => {
  test('Case 01 - Verify Create, Edit, and Archive logs for Detail', async ({ page, context }, testInfo) => {
    logger.log('Test Case 01 - Verify Create, Edit, and Archive logs for Detail in /actions');
    test.setTimeout(TEST_TIMEOUTS.LONG);

    const productsPage = page;
    const partsDatabasePage = new CreatePartsDatabasePage(productsPage);

    const actionsPage = await context.newPage();
    const actionsPagePO = new ActionsPage(actionsPage);

    const timestamp = Date.now().toString().slice(-6);
    const detailName = `TEST_AuditDetail_${timestamp}`;
    const detailDesig = `AuditDesig_${timestamp}`;
    let baselineRowSignature = '';

    await allure.step('Step 1: Open /actions page and set filters for Detail', async () => {
      await actionsPagePO.goto();
      await actionsPagePO.setTypeFilterToDetail();

      const loginUsername = LOGIN_TEST_CONFIG.TEST_CREDENTIALS.username;
      const loginTabel = LOGIN_TEST_CONFIG.TEST_CREDENTIALS.tabel;
      const searchTerm = loginUsername || loginTabel || '';
      await actionsPagePO.openUserFilter();
      await actionsPagePO.fillUserSearch(searchTerm);
      const matchText = loginTabel || loginUsername || (searchTerm && searchTerm.split(/\s+/)[0]) || searchTerm;
      const topRow = actionsPagePO.getFirstUserSearchResultRow();
      await expectSoftWithScreenshot(
        actionsPage,
        async () => {
          await expect.soft(topRow).toContainText(matchText);
        },
        'User filter search result contains expected user',
        testInfo,
      );
      await actionsPagePO.selectFirstUserAndClickAdd();
      const chosenTbody = actionsPagePO.getChosenEmployeesTbody();
      await expectSoftWithScreenshot(
        actionsPage,
        async () => {
          await expect.soft(chosenTbody).toContainText(matchText);
        },
        'Chosen employees table contains selected user',
        testInfo,
      );
      await actionsPagePO.confirmUserSelection();
      await actionsPagePO.waitForActionsTableVisible();
      const tableRows = actionsPagePO.getTableRows();
      baselineRowSignature = await actionsPagePO.getBaselineSignatureFromTopRowAndHighlight(tableRows);
    });

    await allure.step('Step 2: Create a new Detail in the Products tab', async () => {
      await productsPage.bringToFront();
      await partsDatabasePage.createDetailFromPartsDatabaseMain(detailName);
      await expectSoftWithScreenshot(
        productsPage,
        async () => {
          await expect.soft(productsPage.locator(PartsDBSelectors.EDIT_DETAL_TITLE)).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Edit page visible after creating detail',
        testInfo,
      );
    });

    await allure.step('Step 3: Verify Creation in Actions tab', async () => {
      await actionsPage.bringToFront();
      await actionsPagePO.refreshAndWaitForLoader();

      const tableRows = actionsPagePO.getTableRows();
      const baselineIdx = await actionsPagePO.findBaselineRowIndex(tableRows, baselineRowSignature);
      await expectSoftWithScreenshot(
        actionsPage,
        () => {
          expect.soft(baselineIdx >= 0, 'Baseline row should be found after refresh').toBe(true);
        },
        'Baseline row found after refresh',
        testInfo,
      );
      await actionsPagePO.highlightBaselineAndNewRows(tableRows, baselineIdx);
      const expectedCreate = /Создал Деталь/;
      for (let i = 0; i < baselineIdx; i++) {
        const descriptionText = await actionsPagePO.getRowDescriptionText(tableRows.nth(i));
        logger.info(`Create new row ${i + 1} (description): ${descriptionText}`);
        await expectSoftWithScreenshot(
          actionsPage,
          () => {
            expect.soft(descriptionText, `New row description should be "Создал Деталь" (no extra e.g. "Прикрепил тех процесс")`).toMatch(expectedCreate);
          },
          `Create log row ${i + 1} description matches "Создал Деталь"`,
          testInfo,
        );
      }
      baselineRowSignature = await actionsPagePO.getBaselineSignatureFromTopRowAndHighlight(tableRows);
      await actionsPagePO.refreshAndWaitForLoader();
      const tableRowsAfter = actionsPagePO.getTableRows();
      const baselineIdxAfter = await actionsPagePO.findBaselineRowIndex(tableRowsAfter, baselineRowSignature);
      await actionsPagePO.highlightBaselineRow(tableRowsAfter, baselineIdxAfter);
    });

    await allure.step('Step 4: Edit Name and verify log', async () => {
      await productsPage.bringToFront();
      await partsDatabasePage.setDetailName(`${detailName}_edited`);
      await partsDatabasePage.saveDetailEdit();

      await actionsPage.bringToFront();
      await actionsPagePO.refreshAndWaitForLoader();

      const tableRows = actionsPagePO.getTableRows();
      const baselineIdx = await actionsPagePO.findBaselineRowIndex(tableRows, baselineRowSignature);
      await expectSoftWithScreenshot(
        actionsPage,
        () => {
          expect.soft(baselineIdx >= 0, 'Baseline row should be found after refresh').toBe(true);
        },
        'Baseline row found after refresh',
        testInfo,
      );
      await actionsPagePO.highlightBaselineAndNewRows(tableRows, baselineIdx);
      const expectedEditName = /название|наименование/i;
      for (let i = 0; i < baselineIdx; i++) {
        const descriptionText = await actionsPagePO.getRowDescriptionText(tableRows.nth(i));
        logger.info(`Edit name new row ${i + 1} (description): ${descriptionText}`);
        await expectSoftWithScreenshot(
          actionsPage,
          () => {
            expect.soft(descriptionText, 'Description must identify what was changed (e.g. название/наименование изменено с ... на ...)').toMatch(expectedEditName);
          },
          `Edit name log row ${i + 1} description matches название/наименование`,
          testInfo,
        );
      }
      baselineRowSignature = await actionsPagePO.getBaselineSignatureFromTopRowAndHighlight(tableRows);
      await actionsPagePO.refreshAndWaitForLoader();
      const tableRowsAfter = actionsPagePO.getTableRows();
      const baselineIdxAfter = await actionsPagePO.findBaselineRowIndex(tableRowsAfter, baselineRowSignature);
      await actionsPagePO.highlightBaselineRow(tableRowsAfter, baselineIdxAfter);
    });

    await allure.step('Step 5: Edit Designation and verify log', async () => {
      await productsPage.bringToFront();
      await partsDatabasePage.setDetailDesignation(`${detailDesig}_edited`);
      await partsDatabasePage.saveDetailEdit();

      await actionsPage.bringToFront();
      await actionsPagePO.refreshAndWaitForLoader();

      const tableRows = actionsPagePO.getTableRows();
      const baselineIdx = await actionsPagePO.findBaselineRowIndex(tableRows, baselineRowSignature);
      await expectSoftWithScreenshot(
        actionsPage,
        () => {
          expect.soft(baselineIdx >= 0, 'Baseline row should be found after refresh').toBe(true);
        },
        'Baseline row found after refresh',
        testInfo,
      );
      await actionsPagePO.highlightBaselineAndNewRows(tableRows, baselineIdx);
      const expectedEditDesig = /обозначение/i;
      for (let i = 0; i < baselineIdx; i++) {
        const descriptionText = await actionsPagePO.getRowDescriptionText(tableRows.nth(i));
        logger.info(`Edit designation new row ${i + 1} (description): ${descriptionText}`);
        await expectSoftWithScreenshot(
          actionsPage,
          () => {
            expect.soft(descriptionText, 'Description must identify what was changed (e.g. обозначение изменено с ... на ...)').toMatch(expectedEditDesig);
          },
          `Edit designation log row ${i + 1} description matches обозначение`,
          testInfo,
        );
      }
      baselineRowSignature = await actionsPagePO.getBaselineSignatureFromTopRowAndHighlight(tableRows);
      await actionsPagePO.refreshAndWaitForLoader();
      const tableRowsAfter = actionsPagePO.getTableRows();
      const baselineIdxAfter = await actionsPagePO.findBaselineRowIndex(tableRowsAfter, baselineRowSignature);
      await actionsPagePO.highlightBaselineRow(tableRowsAfter, baselineIdxAfter);
    });

    await allure.step('Step 6: Archive Detail and verify log', async () => {
      await productsPage.bringToFront();
      await partsDatabasePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabasePage.waitForNetworkIdle();
      await productsPage.waitForTimeout(PAUSE);

      await partsDatabasePage.cleanupTestItemsByPrefix('Detail', 'TEST_AuditDetail', PartsDBSelectors.TABLE_SEARCH_INPUT, PartsDBSelectors.MAIN_PAGE_Д_TABLE, 'last');
      await productsPage.waitForTimeout(PAUSE);

      await actionsPage.bringToFront();
      await actionsPagePO.refreshAndWaitForLoader();

      const tableRows = actionsPagePO.getTableRows();
      const baselineIdx = await actionsPagePO.findBaselineRowIndex(tableRows, baselineRowSignature);
      await expectSoftWithScreenshot(
        actionsPage,
        () => {
          expect.soft(baselineIdx >= 0, 'Baseline row should be found after refresh').toBe(true);
        },
        'Baseline row found after refresh',
        testInfo,
      );
      await actionsPagePO.highlightBaselineAndNewRows(tableRows, baselineIdx);
      const expectedArchive = /архив|перемещени/i;
      for (let i = 0; i < baselineIdx; i++) {
        const descriptionText = await actionsPagePO.getRowDescriptionText(tableRows.nth(i));
        logger.info(`Archive new row ${i + 1} (description): ${descriptionText}`);
        await expectSoftWithScreenshot(
          actionsPage,
          () => {
            expect.soft(descriptionText, 'New row description should match archive action').toMatch(expectedArchive);
          },
          `Archive log row ${i + 1} description matches archive action`,
          testInfo,
        );
      }
    });
  });
};
