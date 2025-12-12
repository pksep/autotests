import { test, expect, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { ENV, SELECTORS, CONST, PRODUCT_SPECS } from '../config';
import logger from '../lib/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data

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
    const leftTable = page.locator(`[data-testid="${CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE}"]`);
    let firstCellValue = '';
    let secondCellValue = '';
    let thirdCellValue = '';
    await allure.step('Step 001: Добавить СБ к товару (Add СБ to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await shortagePage.validateTableIsDisplayedWithRows(CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        }
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator('input.search-yui-kit__input').fill(CONST.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator('input.search-yui-kit__input').press('Enter');
        await page.waitForLoadState('networkidle');
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator('tbody tr:first-child');
        await firstRow.evaluate(row => {
          row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
          row.style.border = '2px solid red'; // Add a red border for extra visibility
          row.style.color = 'blue'; // Change text color to blue
        });
        // Wait for the row to be visible and click on it
        await firstRow.waitFor({ state: 'visible' });
        await firstRow.hover();
        await firstRow.click();
        await page.waitForTimeout(500);
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button

        const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);

        editButton.click();
        await page.waitForTimeout(500);
      });

      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: CONST.MAIN_PAGE_SMALL_DIALOG_СБ,
            dialogTestId: CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG,
            searchTableTestId: CONST.MAIN_PAGE_СБ_TABLE,
            searchValue: CONST.TEST_PRODUCT_СБ,
            bottomTableTestId: CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: CONST.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
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
            item.type
          );
        }
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = await page.locator(`[data-testid="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
        await button.evaluate(row => {
          row.style.backgroundColor = 'red';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
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
        await page.waitForTimeout(1500);
      });
    });
    await allure.step('Step 002: Добавить Д к товару (Add Д to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await shortagePage.validateTableIsDisplayedWithRows(CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        }
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator('input.search-yui-kit__input').fill(CONST.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator('input.search-yui-kit__input').press('Enter');
        await page.waitForLoadState('networkidle');
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator('tbody tr:first-child');
        await firstRow.evaluate(row => {
          row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
          row.style.border = '2px solid red'; // Add a red border for extra visibility
          row.style.color = 'blue'; // Change text color to blue
        });

        await firstRow.click();
        await page.waitForTimeout(500);
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);

        editButton.click();
        await page.waitForTimeout(500);
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: CONST.MAIN_PAGE_SMALL_DIALOG_Д,
            dialogTestId: CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
            searchTableTestId: CONST.MAIN_PAGE_Д_TABLE,
            searchValue: CONST.TESTCASE_2_PRODUCT_Д,
            bottomTableTestId: CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: CONST.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
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
            item.type
          );
        }
        await page.waitForTimeout(1500);
        tableData_temp = await shortagePage.parseStructuredTable(page, CONST.EDIT_PAGE_SPECIFICATIONS_TABLE);
        detailvalue_original_before_changequantity = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_Д);
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
        await button.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });

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
        await page.waitForTimeout(1500);
      });
    });
    await allure.step('Step 003: Добавить ПД к товару (Add ПД to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await shortagePage.validateTableIsDisplayedWithRows(CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        }
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator('input.search-yui-kit__input').fill(CONST.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator('input.search-yui-kit__input').press('Enter');
        await page.waitForLoadState('networkidle');
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator('tbody tr:first-child');
        await firstRow.evaluate(row => {
          row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
          row.style.border = '2px solid red'; // Add a red border for extra visibility
          row.style.color = 'blue'; // Change text color to blue
        });
        // Wait for the row to be visible and click on it
        await firstRow.waitFor({ state: 'visible' });
        await firstRow.hover();
        await firstRow.click();
        await page.waitForTimeout(500);
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        await page.waitForTimeout(500);
        // Locate the "Редактировать" button
        const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);

        editButton.click();
        await page.waitForTimeout(500);
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        const itemsToAdd = [
          {
            smallDialogButtonId: CONST.MAIN_PAGE_SMALL_DIALOG_ПД,
            dialogTestId: CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
            searchTableTestId: CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE,
            searchValue: CONST.TESTCASE_2_PRODUCT_ПД,
            bottomTableTestId: CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: CONST.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
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
            item.type
          );
        }
        await page.waitForTimeout(1000);
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
        await button.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });

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
        await page.waitForTimeout(1500);
      });
    });
    await allure.step('Step 004: Добавить РМ к товару (Add РМ to the product and save)', async () => {
      await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
        await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, CONST.MAIN_PAGE_TITLE_ID);
      });
      await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
        await shortagePage.validateTableIsDisplayedWithRows(CONST.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      });
      await allure.step(
        'Step 03: Проверяем, что поиск в первой таблицы "Изделий" отображается (Ensure search functionality in the first table \'Products\' is available)',
        async () => {
          await page.waitForLoadState('networkidle');
          await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
        }
      );
      await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
        // Locate the search field within the left table and fill it
        await leftTable.locator('input.search-yui-kit__input').fill(CONST.TEST_PRODUCT);
        await page.waitForLoadState('networkidle');
        // Optionally, validate that the search input is visible
        await expect(leftTable.locator('input.search-yui-kit__input')).toBeVisible();
      });
      await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
        // Simulate pressing "Enter" in the search field
        await leftTable.locator('input.search-yui-kit__input').press('Enter');
        await page.waitForLoadState('networkidle');
      });
      await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        // Find the first row in the table
        const firstRow = leftTable.locator('tbody tr:first-child');
        await firstRow.evaluate(row => {
          row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
          row.style.border = '2px solid red'; // Add a red border for extra visibility
          row.style.color = 'blue'; // Change text color to blue
        });
        // Wait for the row to be visible and click on it
        await firstRow.waitFor({ state: 'visible' });
        await firstRow.hover();
        await firstRow.click();
        await page.waitForTimeout(500);
      });
      await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
        const firstRow = leftTable.locator('tbody tr:first-child');
        // Locate the "Редактировать" button
        const editButton = page.locator(`[data-testid="${CONST.MAIN_PAGE_EDIT_BUTTON}"]`);

        editButton.click();
      });
      await allure.step('Step 08: Add and Validate Items in Specifications', async () => {
        await page.waitForTimeout(1000);
        const itemsToAdd = [
          {
            smallDialogButtonId: CONST.MAIN_PAGE_SMALL_DIALOG_РМ,
            dialogTestId: CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG,
            searchTableTestId: CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE,
            searchValue: CONST.TESTCASE_2_PRODUCT_РМ,
            bottomTableTestId: CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE,
            addToBottomButtonTestId: CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
            addToMainButtonTestId: CONST.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
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
            item.type
          );
        }
      });

      await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(`[data-testid^="${CONST.MAIN_PAGE_SAVE_BUTTON}"]`);
        await button.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });

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
        await page.waitForTimeout(1500);
      });
    });
    await allure.step('Step 005: Получить и сохранить текущую основную таблицу продуктов. (Get and store the current main product table)', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      tableData_full = await shortagePage.parseStructuredTable(page, CONST.EDIT_PAGE_SPECIFICATIONS_TABLE);
    });
    await allure.step(
      'Step 006: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        const nestedArray = tableData_full.map(group => group.items).flat();

        // Debug: Log all items in the nested array to see what's actually there
        logger.info(`DEBUG: All items in nestedArray: ${JSON.stringify(nestedArray)}`);
        logger.info(`DEBUG: Searching for СБ: "${CONST.TEST_PRODUCT_СБ}"`);
        logger.info(`DEBUG: Searching for Д: "${CONST.TESTCASE_2_PRODUCT_Д}"`);
        logger.info(`DEBUG: Searching for ПД: "${CONST.TESTCASE_2_PRODUCT_ПД}"`);
        logger.info(`DEBUG: Searching for РМ: "${CONST.TESTCASE_2_PRODUCT_РМ}"`);

        const result1 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TEST_PRODUCT_СБ); // Output: true
        const result2 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_Д); // Output: true
        const result3 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_ПД); // Output: true
        const result4 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_РМ); // Output: true
        logger.info(result1);
        logger.info(result2);
        logger.info(result3);
        logger.info(result4);
        expect(result1 && result2 && result3 && result4).toBeTruthy();
      }
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
      console.log('Step: Clean up Т15 product specifications');
      await shortagePage.resetProductSpecificationsByConfig(T15_PRODUCT_NAME, {
        assemblies: T15_ASSEMBLIES,
        details: T15_DETAILS,
        standardParts: T15_STANDARD_PARTS,
        consumables: T15_CONSUMABLES,
      });
    });
  });
};
