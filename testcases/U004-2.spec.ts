import { test, expect, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { ENV, SELECTORS, PRODUCT_SPECS } from '../config';
import * as TestDataU004 from '../lib/Constants/TestDataU004';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data
import { expectSoftWithScreenshot } from '../lib/Page';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

let tableData_original: { groupName: string; items: string[][] }[] = [];
let tableData_original_15: { groupName: string; items: string[][] }[] = []; //for test case 15, so that it doesnt rely on test case 1
let tableData_full: { groupName: string; items: string[][] }[] = [];
let tableData_temp: { groupName: string; items: string[][] }[] = [];
let tableData1: { groupName: string; items: string[][] }[] = [];
let tableData2: { groupName: string; items: string[][] }[] = [];
let tableData3: { groupName: string; items: string[][] }[] = [];
let tableData4: { groupName: string; items: string[][] }[] = [];
let table_before_changequantity: { groupName: string; items: string[][] }[] = [];
let value_before_changequantity: number = 0;
let detailvalue_original_before_changequantity: number = 5;
let table1Locator: Locator | null = null;
let table2Locator: Locator | null = null;
let table3Locator: Locator | null = null;

export const runU004_2 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 03 - Редактирование изделия - Добавьте каждый тип материала по отдельности. (Add Each Material Type Individually)', async ({ page }) => {
    test.setTimeout(900000);
    const shortagePage = new CreatePartsDatabasePage(page);
    const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    let firstCellValue = '';
    let secondCellValue = '';
    let thirdCellValue = '';
    await allure.step('Step 001: Добавить СБ к товару (Add СБ to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
          },
          'Step 01 complete (СБ)',
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
          },
          'Main products table has rows (Step 02 СБ)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 02 complete (СБ)',
        );
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
            },
            'Main products search visible (step 03)',
          );
        },
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(TestDataU004.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
          },
          'Step 04 search value set (СБ)',
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('networkidle');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (СБ)',
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await firstRow.isVisible()).toBe(true);
          },
          'Step 06 row selected (СБ)',
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button

        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: 20000 });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: 15000 }).catch(() => {});
        await page.waitForLoadState('networkidle');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 edit button clicked (СБ)',
        );
      });

      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_СБ,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE,
            searchValue: TestDataU004.TESTCASE_2_PRODUCT_СБ,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'СБ',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(
            page,
            item.smallDialogButtonId,
            item.dialogTestId,
            item.searchTableTestId,
            item.searchValue,
            item.bottomTableTestId,
            item.addToBottomButtonTestId,
            item.addToMainButtonTestId,
            item.type,
          );
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
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = await page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);
        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator('[data-testid$="Cancel-Button"], [data-testid*="Cancel"], button:has-text("Отмена"), button:has-text("Закрыть")');
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          }
        } catch {}
        await button.click();
        // Wait for navigation/load state after save
        await page.waitForLoadState('networkidle');
        // Wait for the table to be ready
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (СБ)',
        );
      });
    });
    await allure.step('Step 002: Добавить Д к товару (Add Д to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
          },
          'Step 01 complete (Д)',
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
          },
          'Main products table has rows (Step 02 Д)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 02 complete (Д)',
        );
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
            },
            'Main products search visible (step 03 - Д)',
          );
        },
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(TestDataU004.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04 - Д)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
          },
          'Step 04 search value set (Д)',
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('networkidle');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (Д)',
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await firstRow.isVisible()).toBe(true);
          },
          'Step 06 row selected (Д)',
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: 20000 });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: 15000 }).catch(() => {});
        await page.waitForLoadState('networkidle');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 edit button clicked (Д)',
        );
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE,
            searchValue: TestDataU004.TESTCASE_2_PRODUCT_Д,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'Д',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(
            page,
            item.smallDialogButtonId,
            item.dialogTestId,
            item.searchTableTestId,
            item.searchValue,
            item.bottomTableTestId,
            item.addToBottomButtonTestId,
            item.addToMainButtonTestId,
            item.type,
          );
        }
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        tableData_temp = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        detailvalue_original_before_changequantity = await shortagePage.getQuantityByLineItem(tableData_temp, TestDataU004.TESTCASE_2_PRODUCT_Д);
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
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator('[data-testid$="Cancel-Button"], [data-testid*="Cancel"], button:has-text("Отмена"), button:has-text("Закрыть")');
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          }
        } catch {}
        button.click();
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (Д)',
        );
      });
    });
    await allure.step('Step 003: Добавить ПД к товару (Add ПД to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
          },
          'Step 01 complete (ПД)',
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
        );
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
            },
            'Main products search visible (step 03 - ПД)',
          );
        },
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(TestDataU004.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04 - ПД)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
          },
          'Step 04 complete (ПД)',
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('networkidle');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (ПД)',
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await firstRow.isVisible()).toBe(true);
          },
          'Step 06 row selected (ПД)',
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        // Locate the "Редактировать" button
        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: 20000 });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: 15000 }).catch(() => {});
        await page.waitForLoadState('networkidle');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 edit button clicked (ПД)',
        );
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE,
            searchValue: TestDataU004.TESTCASE_2_PRODUCT_ПД,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'ПД',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(
            page,
            item.smallDialogButtonId,
            item.dialogTestId,
            item.searchTableTestId,
            item.searchValue,
            item.bottomTableTestId,
            item.addToBottomButtonTestId,
            item.addToMainButtonTestId,
            item.type,
          );
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
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator('[data-testid$="Cancel-Button"], [data-testid*="Cancel"], button:has-text("Отмена"), button:has-text("Закрыть")');
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          }
        } catch {}
        button.click();
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (ПД)',
        );
      });
    });
    await allure.step('Step 004: Добавить РМ к товару (Add РМ to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
          },
          'Step 01 complete (РМ)',
        );
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await expectSoftWithScreenshot(
          page,
          async () => {
            await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
          },
          'Main products table has rows (Step 02 РМ)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 02 complete (РМ)',
        );
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
            },
            'Main products search visible (step 03 - РМ)',
          );
        },
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(TestDataU004.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
          },
          'Main products search visible after fill (step 04 - РМ)',
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
          },
          'Step 04 search value set (РМ)',
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('networkidle');
        // Wait for table rows to appear after search
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
          },
          'Table rows visible after search',
        );
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const rowCount = await leftTable.locator('tbody tr').count();
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 05 complete (РМ)',
        );
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
        await shortagePage.waitAndHighlight(firstRow);
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await firstRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await firstRow.isVisible()).toBe(true);
          },
          'Step 06 row selected (РМ)',
        );
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

        await shortagePage.waitAndHighlight(editButton, { timeout: 20000 });
        await editButton.click();
        await page.waitForURL('**/edit/**', { timeout: 15000 }).catch(() => {});
        await page.waitForLoadState('networkidle');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 complete (РМ)',
        );
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const itemsToAdd = [
          {
            smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ,
            dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG,
            searchTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE,
            searchValue: TestDataU004.TESTCASE_2_PRODUCT_РМ,
            bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
            type: 'РМ',
          },
        ];

        for (const item of itemsToAdd) {
          await shortagePage.addItemToSpecification(
            page,
            item.smallDialogButtonId,
            item.dialogTestId,
            item.searchTableTestId,
            item.searchValue,
            item.bottomTableTestId,
            item.addToBottomButtonTestId,
            item.addToMainButtonTestId,
            item.type,
          );
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
        );
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        // Ensure any open modal is closed before saving
        try {
          const openDlg = page.locator('dialog[open]').first();
          if ((await openDlg.count()) > 0) {
            const cancel = openDlg.locator('[data-testid$="Cancel-Button"], [data-testid*="Cancel"], button:has-text("Отмена"), button:has-text("Закрыть")');
            if ((await cancel.count()) > 0) {
              await cancel.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape').catch(() => {});
            }
            await openDlg.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
          }
        } catch {}
        button.click();
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            expect.soft(specTable.length).toBeGreaterThan(0);
          },
          'Step 09 complete (РМ)',
        );
      });
    });
    await allure.step('Step 005: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_full.length).toBeGreaterThan(0);
        },
        'Step 005 complete (store main table)',
      );
    });
    await allure.step(
      'Step 006: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const nestedArray = tableData_full.map(group => group.items).flat();

        // Debug: Log all items in the nested array to see what's actually there
        logger.info(`DEBUG: All items in nestedArray: ${JSON.stringify(nestedArray)}`);
        logger.info(`DEBUG: Searching for СБ: "${TestDataU004.TESTCASE_2_PRODUCT_СБ}"`);
        logger.info(`DEBUG: Searching for Д: "${TestDataU004.TESTCASE_2_PRODUCT_Д}"`);
        logger.info(`DEBUG: Searching for ПД: "${TestDataU004.TESTCASE_2_PRODUCT_ПД}"`);
        logger.info(`DEBUG: Searching for РМ: "${TestDataU004.TESTCASE_2_PRODUCT_РМ}"`);

        const result1 = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_СБ); // Output: true
        const result2 = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_Д); // Output: true
        const result3 = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_ПД); // Output: true
        const result4 = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_РМ); // Output: true
        logger.info(result1);
        logger.info(result2);
        logger.info(result3);
        logger.info(result4);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(result1 && result2 && result3 && result4).toBeTruthy();
            expect.soft(result1).toBe(true);
            expect.soft(result2).toBe(true);
            expect.soft(result3).toBe(true);
            expect.soft(result4).toBe(true);
          },
          'Step 006 complete (verify all added items)',
        );
      },
    );
  });
  test('TestCase 04 - Очистка после теста. (Cleanup after test)', async ({ page }) => {
    test.setTimeout(240000);
    const shortagePage = new CreatePartsDatabasePage(page);
    const {
      productName: T15_PRODUCT_NAME,
      assemblies: T15_ASSEMBLIES,
      details: T15_DETAILS,
      standardParts: T15_STANDARD_PARTS,
      consumables: T15_CONSUMABLES,
    } = PRODUCT_SPECS.T15;

    await allure.step('Setup: Clean up Т15 product specifications', async () => {
      logger.log('Step: Clean up Т15 product specifications');
      await shortagePage.resetProductSpecificationsByConfig(T15_PRODUCT_NAME, {
        assemblies: T15_ASSEMBLIES,
        details: T15_DETAILS,
        standardParts: T15_STANDARD_PARTS,
        consumables: T15_CONSUMABLES,
      });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
          expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
        },
        'Cleanup done (TestCase 04)',
      );
    });
  });
};
