import { test, expect, Locator } from '@playwright/test';
import { SELECTORS, PRODUCT_SPECS } from '../config';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { expectSoftWithScreenshot } from '../lib/Page';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future steps
const _tableData_original: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- for test case 15
const _tableData_original_15: { groupName: string; items: string[][] }[] = [];
let tableData_full: { groupName: string; items: string[][] }[] = [];
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved
const _tableData_temp: { groupName: string; items: string[][] }[] = [];
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
const _detailvalue_original_before_changequantity: number = 5;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by steps
const _table1Locator: Locator | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by steps
const _table2Locator: Locator | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used by steps
const _table3Locator: Locator | null = null;

// U004 script-specific test data (same pattern as U004-1; no Т15)
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

export const runU004_3 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 05 - Adding All Material Types at Once', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM);
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
        await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
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
          'Main products search visible (Step 03 СБ)',
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
          'Main products search visible after fill (Step 04 СБ)',
          testInfo,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
          },
          'Step 04 complete (СБ)',
          testInfo,
        );
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
        await page.waitForLoadState('load');
        await page.waitForTimeout(TIMEOUTS.STANDARD); // Wait for table to update
        // Wait for table to have rows using Playwright's built-in waiting
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
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
        // Wait for the row to be visible and click on a safe cell to avoid header interception
        await firstRow.waitFor({ state: 'visible' });
        await firstRow.evaluate(node => node.scrollIntoView({ block: 'center', behavior: 'instant' }));
        const firstCellInRow = firstRow.locator('td').first();
        await firstCellInRow.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(firstRow).toBeVisible();
          },
          'Step 06 complete (СБ)',
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
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 07 complete (СБ)',
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
            for (const item of itemsToAdd) {
              const nested = specTable.map(group => group.items).flat();
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (СБ)',
          testInfo,
        );
      });
    });
    await allure.step('Step 002: Добавить Д к товару (Add Д to the product and save)', async () => {
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
        const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            for (const item of itemsToAdd) {
              const nested = specTable.map(group => group.items).flat();
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (Д)',
          testInfo,
        );
      });
    });
    await allure.step('Step 003: Добавить ПД к товару (Add ПД to the product and save)', async () => {
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
        const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            for (const item of itemsToAdd) {
              const nested = specTable.map(group => group.items).flat();
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (ПД)',
          testInfo,
        );
      });
    });
    await allure.step('Step 004: Добавить РМ к товару (Add РМ to the product and save)', async () => {
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        await page.waitForTimeout(TIMEOUTS.VERY_LONG);
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
            for (const item of itemsToAdd) {
              const nested = specTable.map(group => group.items).flat();
              const found = await shortagePage.isStringInNestedArray(nested, item.searchValue);
              expect.soft(found).toBeTruthy();
            }
          },
          'Step 08 complete (РМ)',
          testInfo,
        );
      });
    });
    await allure.step('Step 005: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');
      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
      await shortagePage.waitAndHighlight(button);

      // Ensure any open modal is closed before saving to avoid pointer interception
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
        /* Intentionally ignore when no modal is open */
      }
      await button.click();
      await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 005 complete (save)',
        testInfo,
      );
    });
    await allure.step('Step 006: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_full.length).toBeGreaterThan(0);
        },
        'Step 006 complete (store table)',
        testInfo,
      );
    });
    await allure.step('Step 007: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)', async () => {
      await page.waitForLoadState('load');
      const nestedArray = tableData_full.map(group => group.items).flat();

      const result1 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_ASSEMBLY_NAME); // Output: true
      const result2 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_DETAIL_NAME); // Output: true
      const result3 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_STANDARD_PART_NAME); // Output: true
      const result4 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_CONSUMABLE_NAME); // Output: true
      logger.info(result1);
      logger.info(result2);
      logger.info(result3);
      logger.info(result4);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result1 && result2 && result3 && result4).toBeTruthy();
        },
        'Step 007 complete (verify items)',
        testInfo,
      );
    });
  });

  test('TestCase 06 - Очистка после теста. (Cleanup after test)', async ({ page }, testInfo) => {
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
        'Cleanup done (TestCase 06)',
        testInfo,
      );
    });
  });
};
