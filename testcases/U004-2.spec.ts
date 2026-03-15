import { test, expect, Locator } from '@playwright/test';
import { SELECTORS, PRODUCT_SPECS } from '../config';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { expectSoftWithScreenshot } from '../lib/Page';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future steps
const _tableData_original: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for test case 15
const _tableData_original_15: { groupName: string; items: string[][] }[] = [];
let tableData_full: { groupName: string; items: string[][] }[] = [];
let tableData_temp: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- written by steps
const _tableData1: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- written by steps
const _tableData2: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- written by steps
const _tableData3: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- written by steps
const _tableData4: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
const _table_before_changequantity: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
const _value_before_changequantity: number = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
let _detailvalue_original_before_changequantity: number = 5;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
const _table1Locator: Locator | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
const _table2Locator: Locator | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
const _table3Locator: Locator | null = null;

// U004 script-specific test data (same pattern as U004-1 / U004-3; no Т15)
const {
  productName: U004_PRODUCT_NAME,
  assemblies: U004_ASSEMBLIES,
  details: U004_DETAILS,
  standardParts: U004_STANDARD_PARTS,
  consumables: U004_CONSUMABLES,
} = PRODUCT_SPECS.U004_PRODUCT;
const U004_FIRST_ASSEMBLY_NAME = U004_ASSEMBLIES[0].name;
const U004_FIRST_DETAIL_NAME = U004_DETAILS[0].name;
const U004_FIRST_STANDARD_PART_NAME = U004_STANDARD_PARTS[0].name;
const U004_FIRST_CONSUMABLE_NAME = U004_CONSUMABLES[0].name;

export const runU004_2 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 03 - Редактирование изделия - Добавьте каждый тип материала по отдельности. (Add Each Material Type Individually)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const shortagePage = new CreatePartsDatabasePage(page);
    const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    await allure.step('Setup: Clean up U004 product specifications', async () => {
      logger.log('Setup: Clean up U004 product specifications');
      await shortagePage.resetProductSpecificationsByConfig(U004_PRODUCT_NAME, {
        assemblies: U004_ASSEMBLIES,
        details: U004_DETAILS,
        standardParts: U004_STANDARD_PARTS,
        consumables: U004_CONSUMABLES,
      });
    });
    await allure.step('Step 001: Добавить СБ к товару (Add СБ to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
          },
          'Step 01 complete (СБ)',
          testInfo,
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
          },
          'Main products table has rows (Step 02 СБ)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 02 complete (СБ)',
          testInfo,
        );
      });
      await allure.step('Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)', async () => {
        await page.waitForLoadState('load');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible (step 03)',
          testInfo,
        );
      });
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(U004_PRODUCT_NAME);
        await page.waitForLoadState('load');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
          },
          'Step 04 search value set (СБ)',
          testInfo,
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('load');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
          testInfo,
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (СБ)',
          testInfo,
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(firstRow).toBeVisible();
          },
          'Step 06 row selected (СБ)',
          testInfo,
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        // Locate the "Редактировать" button

        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
        await page.waitForLoadState('load');
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 edit button clicked (СБ)',
          testInfo,
        );
      });

      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_СБ,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_SEARCH_TABLE_TESTID,
            searchValue: U004_FIRST_ASSEMBLY_NAME,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'СБ',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(page, item.smallDialogButtonId, item.dialogTestId, item.searchTableTestId, item.searchValue, item.bottomTableTestId, item.addToBottomButtonTestId, item.addToMainButtonTestId, item.type);
        }
        const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const nested = specTable.map(group => group.items).flat();
            for (const item of itemsToAdd) {
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (СБ)',
          testInfo,
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);
        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator(SelectorsPartsDataBase.MODAL_CANCEL_BUTTON_LOCATOR);
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
          }
        } catch {
          /* ignore */
        }
        await button.click();
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        // Wait for navigation/load state after save
        await page.waitForLoadState('load');
        // Wait for the table to be ready
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (СБ)',
          testInfo,
        );
      });
    });
    await allure.step('Step 002: Добавить Д к товару (Add Д to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
          },
          'Step 01 complete (Д)',
          testInfo,
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
          },
          'Main products table has rows (Step 02 Д)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 02 complete (Д)',
          testInfo,
        );
      });
      await allure.step('Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)', async () => {
        await page.waitForLoadState('load');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible (step 03 - Д)',
          testInfo,
        );
      });
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(U004_PRODUCT_NAME);
        await page.waitForLoadState('load');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04 - Д)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
          },
          'Step 04 search value set (Д)',
          testInfo,
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('load');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
          testInfo,
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (Д)',
          testInfo,
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(firstRow).toBeVisible();
          },
          'Step 06 row selected (Д)',
          testInfo,
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        // Locate the "Редактировать" button
        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
        await page.waitForLoadState('load');
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 edit button clicked (Д)',
          testInfo,
        );
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE,
            searchValue: U004_FIRST_DETAIL_NAME,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'Д',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(page, item.smallDialogButtonId, item.dialogTestId, item.searchTableTestId, item.searchValue, item.bottomTableTestId, item.addToBottomButtonTestId, item.addToMainButtonTestId, item.type);
        }
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        tableData_temp = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        _detailvalue_original_before_changequantity = await shortagePage.getQuantityByLineItem(tableData_temp, U004_FIRST_DETAIL_NAME);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const nested = tableData_temp.map(group => group.items).flat();
            for (const item of itemsToAdd) {
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (Д)',
          testInfo,
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator(SelectorsPartsDataBase.MODAL_CANCEL_BUTTON_LOCATOR);
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
          }
        } catch {
          /* ignore */
        }
        await button.click();
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (Д)',
          testInfo,
        );
      });
    });
    await allure.step('Step 003: Добавить ПД к товару (Add ПД to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
          },
          'Step 01 complete (ПД)',
          testInfo,
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Main products table has rows (Step 02 ПД)',
          testInfo,
        );
      });
      await allure.step('Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)', async () => {
        await page.waitForLoadState('load');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible (step 03 - ПД)',
          testInfo,
        );
      });
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(U004_PRODUCT_NAME);
        await page.waitForLoadState('load');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04 - ПД)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
          },
          'Step 04 complete (ПД)',
          testInfo,
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('load');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
          testInfo,
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (ПД)',
          testInfo,
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(firstRow).toBeVisible();
          },
          'Step 06 row selected (ПД)',
          testInfo,
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        // Locate the "Редактировать" button
        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
        await page.waitForLoadState('load');
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 edit button clicked (ПД)',
          testInfo,
        );
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE,
            searchValue: U004_FIRST_STANDARD_PART_NAME,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'ПД',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(page, item.smallDialogButtonId, item.dialogTestId, item.searchTableTestId, item.searchValue, item.bottomTableTestId, item.addToBottomButtonTestId, item.addToMainButtonTestId, item.type);
        }
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const nested = specTable.map(group => group.items).flat();
            for (const item of itemsToAdd) {
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (ПД)',
          testInfo,
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator(SelectorsPartsDataBase.MODAL_CANCEL_BUTTON_LOCATOR);
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
          }
        } catch {
          /* ignore */
        }
        await button.click();
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (ПД)',
          testInfo,
        );
      });
    });
    await allure.step('Step 004: Добавить РМ к товару (Add РМ to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
          },
          'Step 01 complete (РМ)',
          testInfo,
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
          },
          'Main products table has rows (Step 02 РМ)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 02 complete (РМ)',
          testInfo,
        );
      });
      await allure.step('Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)', async () => {
        await page.waitForLoadState('load');
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible (step 03 - РМ)',
          testInfo,
        );
      });
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(U004_PRODUCT_NAME);
        await page.waitForLoadState('load');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04 - РМ)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
          },
          'Step 04 search value set (РМ)',
          testInfo,
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('load');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
          testInfo,
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (РМ)',
          testInfo,
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(firstRow).toBeVisible();
          },
          'Step 06 row selected (РМ)',
          testInfo,
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
        await page.waitForLoadState('load');
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 complete (РМ)',
          testInfo,
        );
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE,
            searchValue: U004_FIRST_CONSUMABLE_NAME,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'РМ',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(page, item.smallDialogButtonId, item.dialogTestId, item.searchTableTestId, item.searchValue, item.bottomTableTestId, item.addToBottomButtonTestId, item.addToMainButtonTestId, item.type);
        }
        const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const nested = specTable.map(group => group.items).flat();
            for (const item of itemsToAdd) {
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (РМ)',
          testInfo,
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator(SelectorsPartsDataBase.MODAL_CANCEL_BUTTON_LOCATOR);
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
          }
        } catch {
          /* ignore */
        }
        await button.click();
        await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (РМ)',
          testInfo,
        );
      });
    });
    await allure.step('Step 005: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      const specTableLocator = page.locator(SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await specTableLocator.locator('tbody tr').filter({ hasText: U004_FIRST_ASSEMBLY_NAME }).first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      try {
        await page.waitForLoadState('networkidle', { timeout: WAIT_TIMEOUTS.STANDARD });
      } catch {
        /* continue */
      }
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_full.length).toBeGreaterThan(0);
        },
        'Step 005 complete (store main table)',
        testInfo,
      );
    });
    await allure.step('Step 006: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const nestedArray = tableData_full.map(group => group.items).flat();

      // Debug: Log all items in the nested array to see what's actually there
      logger.info(`DEBUG: All items in nestedArray: ${JSON.stringify(nestedArray)}`);
      logger.info(`DEBUG: Searching for СБ: "${U004_FIRST_ASSEMBLY_NAME}"`);
      logger.info(`DEBUG: Searching for Д: "${U004_FIRST_DETAIL_NAME}"`);
      logger.info(`DEBUG: Searching for ПД: "${U004_FIRST_STANDARD_PART_NAME}"`);
      logger.info(`DEBUG: Searching for РМ: "${U004_FIRST_CONSUMABLE_NAME}"`);

      const result1 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_ASSEMBLY_NAME);
      const result2 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_DETAIL_NAME);
      const result3 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_STANDARD_PART_NAME);
      const result4 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_CONSUMABLE_NAME);
      if (!result1) logger.warn(`СБ "${U004_FIRST_ASSEMBLY_NAME}" not found in main table`);
      if (!result2) logger.warn(`Д "${U004_FIRST_DETAIL_NAME}" not found in main table`);
      if (!result3) logger.warn(`ПД "${U004_FIRST_STANDARD_PART_NAME}" not found in main table`);
      if (!result4) logger.warn(`РМ "${U004_FIRST_CONSUMABLE_NAME}" not found in main table`);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result1, 'СБ should be in main table').toBe(true);
          expect.soft(result2, 'Д should be in main table').toBe(true);
          expect.soft(result3, 'ПД should be in main table').toBe(true);
          expect.soft(result4, 'РМ should be in main table').toBe(true);
        },
        'Step 006 complete (verify all added items)',
        testInfo,
      );
    });
  });

  test('TestCase 04 - Очистка после теста. (Cleanup after test)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM);
    const shortagePage = new CreatePartsDatabasePage(page);

    await allure.step('Setup: Clean up U004 product specifications', async () => {
      logger.log('Step: Clean up U004 product specifications');
      await shortagePage.resetProductSpecificationsByConfig(U004_PRODUCT_NAME, {
        assemblies: U004_ASSEMBLIES,
        details: U004_DETAILS,
        standardParts: U004_STANDARD_PARTS,
        consumables: U004_CONSUMABLES,
      });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
          await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
        },
        'Cleanup done (TestCase 04)',
        testInfo,
      );
    });
  });
};
