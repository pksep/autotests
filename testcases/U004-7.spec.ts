import { test, expect, Locator } from '@playwright/test';
import { SELECTORS } from '../config';
import * as TestDataU004 from '../lib/Constants/TestDataU004';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data
import { expectSoftWithScreenshot } from '../lib/Page';

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

export const runU004_7 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 14 - Сохранить без добавления каких-либо элементов в спецификацию и проверка сохранения (Save Without Adding Material)', async ({ page }) => {
    test.setTimeout(180000);
    const shortagePage = new CreatePartsDatabasePage(page);
    const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    let firstCellValue = '';
    let secondCellValue = '';
    let thirdCellValue = '';

    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
        },
        'Step 01 complete',
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
        'Step 02 complete',
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
          'Step 03 search input visible',
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
        'Step 04 search input visible',
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
      await page.waitForLoadState('networkidle');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const rowCount = await leftTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 05 complete',
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
        'Step 06 complete',
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
        'Step 07 complete',
      );
    });
    await allure.step('Step 08: Нажимаем по кнопке "Сохранить"  (Click on the "Сохранить" button in the main window)', async () => {
      tableData_temp = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await page.waitForLoadState('networkidle');
      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
      await shortagePage.waitAndHighlight(button);

      button.click();
      await page.waitForURL('**/baseproducts**', { timeout: 15000 }).catch(() => {});
      await page.waitForLoadState('networkidle');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 08 complete',
      );
    });
    await allure.step('Step 09: Compare arrays  (Compare arrays)', async () => {
      // Navigate back to edit page
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await page.waitForLoadState('networkidle');
      const productsTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      const searchInput = productsTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.fill(TestDataU004.TEST_PRODUCT);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      const firstRow = productsTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
      await shortagePage.waitAndHighlight(firstRow);
      await firstRow.click({ force: true });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
      await shortagePage.waitAndHighlight(editButton);
      await editButton.click();
      await page.waitForURL('**/edit/**', { timeout: 15000 }).catch(() => {});
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      const tableData_new = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await page.waitForLoadState('networkidle');
      const identical = await shortagePage.compareTableData(tableData_temp, tableData_new);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(identical).toBeTruthy();
        },
        'Step 09 compare arrays',
      );
    });
  });
  test('TestCase 15 - Перезагрузить без сохранения после добавления деталей в спецификацию и проверка (Reload without saving)', async ({ page }) => {
    test.setTimeout(900000);
    const shortagePage = new CreatePartsDatabasePage(page);

    // Placeholder for test logic: Open the parts database page
    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
        },
        'Step 01 complete',
      );
    });

    const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    let firstCellValue = '';
    let secondCellValue = '';
    let thirdCellValue = '';

    await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const rowCount = await leftTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 02 complete',
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
          'Step 03 search input visible',
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
        'Step 04 search input visible',
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
        },
        'Step 04 complete',
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
      await page.waitForLoadState('networkidle');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const rowCount = await leftTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 05 complete',
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
        'Step 06 complete',
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
      tableData_original_15 = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/edit');
          expect.soft(tableData_original_15.length).toBeGreaterThanOrEqual(0);
        },
        'Step 07 complete',
      );
    });
    await allure.step(
      'Step 08: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)',
      async () => {
        // Wait for loading
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
          'Step 08 add item complete',
        );
      },
    );

    await allure.step(
      'Step 09: перезагрузите страницу без сохранения (reload the page without saving) (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        //refresh the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.LONG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 09 reload without saving',
        );
      },
    );
    await allure.step('Step 10: извлечь текущую таблицу спецификаций (extract the current specifications table)', async () => {
      // get table from page
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      tableData_temp = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_temp.length).toBeGreaterThanOrEqual(0);
        },
        'Step 10 table extracted',
      );
    });
    await allure.step('Step 11: сравните исходную таблицу с текущей таблицей (compare the original table with the current table)', async () => {
      //compare extracted table with the original table - should be the same
      await page.waitForLoadState('networkidle');
      logger.info('dd');
      logger.info(tableData_temp);
      logger.info(tableData_original_15);
      const identical = await shortagePage.compareTableData(tableData_temp, tableData_original_15);

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(identical).toBeTruthy();
        },
        'Step 11 tables match',
      );
    });
  });
};
