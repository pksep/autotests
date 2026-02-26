/**
 * @file U002-DataSetup.spec.ts
 * @purpose U002 Data setup: Create Parts (Case 05), Create Cbed (Case 06), Create Product (Case 07).
 */

import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { SELECTORS } from '../config';
import { expectSoftWithScreenshot } from '../lib/Page';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { arrayDetail, arrayCbed, arrayIzd, setNameOprerationOnProcess, setNameOprerationOnProcessAssebly, setNameOprerationOnProcessIzd } from './U002-Constants';

export const runU002_03_DataSetup = (_isSingleTest: boolean, _iterations: number) => {
  logger.info('U002 DataSetup - Cases 05, 06, 07');

  test('Case 05 - Create Parts', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    logger.info('Test Case 05 - Create Parts');
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabsePage.waitForNetworkIdle();
    });

    const detailName = 'DEFAULT_DETAIL';
    const detailDesignation = '-';
    arrayDetail.length = 0;
    arrayDetail.push({ name: detailName, designation: detailDesignation });

    await partsDatabsePage.verifyTestDataAvailable(arrayDetail, 'DETAIL');
    for (const detail of arrayDetail) {
      await allure.step('Step 02: Click on the Create button', async () => {
        await partsDatabsePage.clickButton('Создать', SelectorsPartsDataBase.U002_BUTTON_CREATE_NEW_PART);
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton('Деталь', SelectorsPartsDataBase.U002_BUTTON_DETAIL);
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        const nameParts = page.locator(SelectorsPartsDataBase.ADD_DETAL_INFORMATION_INPUT_INPUT).first();
        await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await nameParts.fill(detail.name || '');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(nameParts).toHaveValue(detail.name || '');
          },
          'Verify detail name input value',
          test.info(),
        );
      });

      await allure.step('Step 05: Enter the designation of the part', async () => {
        const designationInput = page.locator(SelectorsPartsDataBase.ADD_DETAL_DESIGNATION_INPUT_INPUT).first();
        await designationInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await designationInput.fill(detail.designation || '-');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(designationInput).toHaveValue(detail.designation || '-');
          },
          'Verify detail designation input value',
          test.info(),
        );
      });

      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton('Сохранить', SelectorsPartsDataBase.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
        await page.waitForTimeout(TIMEOUTS.LONG);
      });

      await allure.step('Step 07: Click on the Process', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const techProcessBtn = page.locator(SelectorsPartsDataBase.BUTTON_OPERATION);
        await techProcessBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await partsDatabsePage.clickButton('Технологический процесс', SelectorsPartsDataBase.BUTTON_OPERATION);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });

      await allure.step('Step 08: Click on the Add Operation', async () => {
        await page.waitForSelector(SelectorsPartsDataBase.MODAL_CONTENT);
        await partsDatabsePage.clickButton('Добавить операцию', SelectorsPartsDataBase.BUTTON_ADD_OPERATION);
      });

      await allure.step('Step 09: Click on the type of operation', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.locator(SelectorsPartsDataBase.BASE_FILTER_TITLE).click();
      });

      await allure.step('Step 10: Search in dropdown menu', async () => {
        const searchTypeOperation = page.locator(SelectorsPartsDataBase.BASE_FILTER_SEARCH_INPUT);
        const typeOperation = 'Сварочная';
        await searchTypeOperation.fill(typeOperation);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(searchTypeOperation).toHaveValue(typeOperation);
          },
          'Verify search type operation input value',
          test.info(),
        );
      });

      await allure.step('Step 11: Choice type operation', async () => {
        const filterOption = page.locator(SelectorsPartsDataBase.BASE_FILTER_OPTION_FIRST);
        await filterOption.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await partsDatabsePage.waitAndHighlight(filterOption);
        logger.info('🎯 Highlighted first filter option');
        await filterOption.click();
        logger.info('✅ Clicked on first filter option');
        await page.waitForTimeout(TIMEOUTS.STANDARD);
      });

      await allure.step('Step 12: Click on the Save button', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const nestedModal = page.locator(`${SelectorsPartsDataBase.MODAL_ADD_OPERATION}[open]`);
        const isNestedModalVisible = await nestedModal.isVisible();
        if (isNestedModalVisible) {
          logger.info('🔍 Found nested modal, saving it first');
          const nestedSaveButton = nestedModal.locator(`button${SelectorsPartsDataBase.BUTTON_ADD_OPERATION_SAVE}`);
          const nestedSaveButtonCount = await nestedSaveButton.count();
          if (nestedSaveButtonCount > 0) {
            await partsDatabsePage.waitAndHighlight(nestedSaveButton);
            await nestedSaveButton.click({ force: true });
            await page.waitForTimeout(TIMEOUTS.LONG);
          }
        }
        const mainSaveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_OPERATION);
        const mainSaveButtonCount = await mainSaveButton.count();
        if (mainSaveButtonCount > 0) {
          await partsDatabsePage.waitAndHighlight(mainSaveButton);
          await mainSaveButton.click({ force: true });
          await page.waitForTimeout(TIMEOUTS.LONG);
        }
        await page.waitForTimeout(TIMEOUTS.LONG);
        await partsDatabsePage.waitForNetworkIdle();
        const remainingSaveButtons = page.locator('button').filter({ hasText: 'Сохранить' });
        const remainingCount = await remainingSaveButtons.count();
        if (remainingCount > 0) {
          await page.keyboard.press('Enter');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
        }
      });

      await allure.step('Step 13: Getting the name of the operation', async () => {
        const allModals = page.locator(SelectorsPartsDataBase.DEBUG_ALL_MODALS_SELECTOR);
        const modalCount = await allModals.count();
        if (modalCount > 0) return;
        const expectedTable = page.locator(SelectorsPartsDataBase.TABLE_PROCESS);
        const tableExists = (await expectedTable.count()) > 0;
        if (!tableExists) return;
        await partsDatabsePage.waitingTableBody(SelectorsPartsDataBase.TABLE_PROCESS);
        const headerCells = page.locator(`${SelectorsPartsDataBase.TABLE_PROCESS} thead th`);
        const headerCount = await headerCells.count();
        let nameColIndex = -1;
        for (let i = 0; i < headerCount; i++) {
          const dt = await headerCells.nth(i).getAttribute('data-testid');
          if (dt === SelectorsPartsDataBase.TABLE_PROCESS_NAME_OPERATION) {
            nameColIndex = i;
            break;
          }
        }
        if (nameColIndex === -1) {
          throw new Error('Не удалось найти столбец имени операции в заголовке таблицы процесса');
        }
        const nameVal = await partsDatabsePage.getValueOrClickFromFirstRow(SelectorsPartsDataBase.TABLE_PROCESS, nameColIndex);
        setNameOprerationOnProcess(nameVal);
        logger.info('Name process: ', nameVal);
      });

      await allure.step('Step 14: Click on the Save button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page.locator(SelectorsPartsDataBase.EDIT_SAVE_BUTTON).click();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await partsDatabsePage.waitForNetworkIdle(WAIT_TIMEOUTS.STANDARD);
      });

      await allure.step('Step 15: Click on the cancel button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const cancelButton = page.locator(SelectorsPartsDataBase.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL).filter({ hasText: 'Отменить' });
        const cancelButtonCount = await cancelButton.count();
        if (cancelButtonCount === 0) return;
        await cancelButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
        await cancelButton.scrollIntoViewIfNeeded();
        await partsDatabsePage.clickButton('Отменить', SelectorsPartsDataBase.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL);
      });
    }
  });

  test('Case 06 - Create Cbed', async ({ page }) => {
    logger.info('Test Case 06 - Create Cbed');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabsePage.waitingTableBody(SelectorsPartsDataBase.TABLE_PROCESS_CBED);
    });

    const cbedName = 'DEFAULT_CBED';
    const cbedDesignation = '-';
    arrayCbed.length = 0;
    arrayCbed.push({ name: cbedName, designation: cbedDesignation });

    await partsDatabsePage.verifyTestDataAvailable(arrayCbed, 'CBED');
    for (const cbed of arrayCbed) {
      await allure.step('Step 02: Click on the Create button', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await partsDatabsePage.clickButton('Создать', SelectorsPartsDataBase.U002_BUTTON_CREATE_NEW_PART);
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton('Сборочную единицу', SelectorsPartsDataBase.U002_BUTTON_CBED);
        const loader = page.locator(SelectorsPartsDataBase.CREATOR_LOADER);
        await loader.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        const nameParts = page.locator(SelectorsPartsDataBase.CREATOR_INFORMATION_INPUT).first();
        await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await nameParts.fill(cbed.name || '');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(nameParts).toHaveValue(cbed.name || '');
          },
          'Verify CBED name input value',
          test.info(),
        );
      });

      await allure.step('Step 05: Enter the designation of the part', async () => {
        const nameParts = page.locator(SelectorsPartsDataBase.INPUT_DESUGNTATION_IZD);
        await nameParts.fill(cbed.designation || '-');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(nameParts).toHaveValue(cbed.designation || '-');
          },
          'Verify CBED designation input value',
          test.info(),
        );
      });

      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton('Сохранить', SelectorsPartsDataBase.U002_CREATOR_SAVE_BUTTON);
        await page.waitForTimeout(TIMEOUTS.LONG);
      });

      await allure.step('Step 07: Click on the Process', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const techProcessBtn = page.locator(SelectorsPartsDataBase.U002_CREATOR_BUTTONS_TECHPROCESS);
        await techProcessBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await partsDatabsePage.clickButton('Технологический процесс', SelectorsPartsDataBase.U002_CREATOR_BUTTONS_TECHPROCESS);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });

      await allure.step('Step 08: Getting the name of the operation', async () => {
        await partsDatabsePage.waitingTableBody(SelectorsPartsDataBase.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER, {
          minRows: 1,
          timeoutMs: WAIT_TIMEOUTS.LONG,
        });
        const headerCells = page.locator(`${SelectorsPartsDataBase.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER} thead th`);
        const headerCount = await headerCells.count();
        let nameColIndex = -1;
        for (let i = 0; i < headerCount; i++) {
          const dt = await headerCells.nth(i).getAttribute('data-testid');
          if (dt === SelectorsPartsDataBase.TABLE_PROCESS_ASSYMBLY_NAME) {
            nameColIndex = i;
            break;
          }
        }
        if (nameColIndex === -1) {
          throw new Error('Не удалось найти столбец имени операции в заголовке таблицы процесса (сборка)');
        }
        const nameValAssembly = await partsDatabsePage.getValueOrClickFromFirstRow(SelectorsPartsDataBase.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER, nameColIndex);
        setNameOprerationOnProcessAssebly(nameValAssembly);
        logger.info('Name process Assembly: ', nameValAssembly);
      });

      await allure.step('Step 09: Click on the Save button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.clickButton('Отменить', SelectorsPartsDataBase.BUTTON_PROCESS_CANCEL);
      });

      await allure.step('Step 10: Click on the Create by copyinp', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await partsDatabsePage.clickButton('Отменить', SelectorsPartsDataBase.U002_CREATOR_CANCEL_BUTTON);
      });
    }
  });

  test('Case 07 - Create Product', async ({ page }) => {
    logger.info('Test Case 07 - Create Product');
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabsePage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabsePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await partsDatabsePage.waitingTableBody(SelectorsPartsDataBase.PRODUCT_TABLE);
    });

    const izdName = 'DEFAULT_IZD';
    const izdDesignation = '-';
    arrayIzd.length = 0;
    arrayIzd.push({ name: izdName, designation: izdDesignation });

    await partsDatabsePage.verifyTestDataAvailable(arrayIzd, 'IZD');
    for (const izd of arrayIzd) {
      await allure.step('Step 02: Click on the Create button', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await partsDatabsePage.clickButton('Создать', SelectorsPartsDataBase.U002_BUTTON_CREATE_NEW_PART);
      });

      await allure.step('Step 03: Click on the Detail button', async () => {
        await partsDatabsePage.clickButton('Изделие', SelectorsPartsDataBase.U002_BUTTON_PRODUCT);
        const loader = page.locator(SelectorsPartsDataBase.CREATOR_LOADER);
        await loader.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });

      await allure.step('Step 04: Enter the name of the part', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        const nameParts = page.locator(SelectorsPartsDataBase.CREATOR_INFORMATION_INPUT).first();
        await nameParts.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await nameParts.fill(izd.name || '');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(nameParts).toHaveValue(izd.name || '');
          },
          'Verify IZD name input value',
          test.info(),
        );
      });

      await allure.step('Step 05: Enter the designation of the part', async () => {
        const designationInput = page.locator(SelectorsPartsDataBase.INPUT_DESUGNTATION_IZD).first();
        await designationInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await designationInput.fill(izd.designation || '-');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(designationInput).toHaveValue(izd.designation || '-');
          },
          'Verify IZD designation input value',
          test.info(),
        );
      });
      await allure.step('Step 06: Click on the Save button', async () => {
        await partsDatabsePage.clickButton('Сохранить', SelectorsPartsDataBase.U002_CREATOR_SAVE_BUTTON);
        await page.waitForTimeout(TIMEOUTS.LONG);
      });

      await allure.step('Step 07: Click on the Process', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const techProcessBtn = page.locator(SelectorsPartsDataBase.U002_CREATOR_BUTTONS_TECHPROCESS);
        await techProcessBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await partsDatabsePage.clickButton('Технологический процесс', SelectorsPartsDataBase.U002_CREATOR_BUTTONS_TECHPROCESS);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });

      await allure.step('Step 08: Getting the name of the operation', async () => {
        await partsDatabsePage.waitingTableBody(SelectorsPartsDataBase.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER, {
          minRows: 1,
          timeoutMs: WAIT_TIMEOUTS.LONG,
        });
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const numberColumnOnNameProcess = await partsDatabsePage.findColumn(page, SelectorsPartsDataBase.TABLE_PROCESS_ID, SelectorsPartsDataBase.TABLE_PROCESS_ASSYMBLY_NAME);
        logger.info('Column number with process: ', numberColumnOnNameProcess);
        const nameValIzd = await partsDatabsePage.getValueOrClickFromFirstRow(SelectorsPartsDataBase.U002_CREATOR_TECHPROCESS_TABLE_WRAPPER, numberColumnOnNameProcess);
        setNameOprerationOnProcessIzd(nameValIzd);
        logger.info('Name process Izd: ', nameValIzd);
      });

      await allure.step('Step 09: Click on the Save button', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await partsDatabsePage.clickButton('Отменить', SelectorsPartsDataBase.BUTTON_PROCESS_CANCEL);
      });

      await allure.step('Step 10: Click on the Create by copying', async () => {
        await partsDatabsePage.waitForNetworkIdle();
        await partsDatabsePage.clickButton('Отменить', SelectorsPartsDataBase.U002_CREATOR_CANCEL_BUTTON);
      });
    }
  });
};
