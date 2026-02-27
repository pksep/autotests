import { test, expect, Locator } from '@playwright/test';
import { SELECTORS, PRODUCT_SPECS } from '../config';
import * as TestDataU004 from '../lib/Constants/TestDataU004';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { expectSoftWithScreenshot } from '../lib/Page';

let tableData_full: { groupName: string; items: string[][] }[] = [];
let table3Locator: Locator | null = null;

const { productName: T15_PRODUCT_NAME, assemblies: T15_ASSEMBLIES, details: T15_DETAILS, standardParts: T15_STANDARD_PARTS, consumables: T15_CONSUMABLES } = PRODUCT_SPECS.T15;

export const runU004_5 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 09- Редактирование изделия - Сравниваем комплектацию (Edit an Existing Material ПД - Comparing the complete set)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM_SHORT);
    const shortagePage = new CreatePartsDatabasePage(page);
    await allure.step('Setup: Clean up Т15 product specifications', async () => {
      logger.log('Setup: Clean up Т15 product specifications');
      await shortagePage.resetProductSpecificationsByConfig(T15_PRODUCT_NAME, {
        assemblies: T15_ASSEMBLIES,
        details: T15_DETAILS,
        standardParts: T15_STANDARD_PARTS,
        consumables: T15_CONSUMABLES,
      });
    });
    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
        },
        'Step 01 complete',
        testInfo,
      );
    });

    const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    let firstCellValue = '';

    await allure.step('Step 02: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const rowCount = await leftTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 02 complete',
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
        'Products search visible (Step 03)',
        testInfo,
      );
    });
    await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
      // Locate the search field within the left table and fill it
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(TestDataU004.TEST_PRODUCT);
      await page.waitForLoadState('load');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Products search visible after fill (Step 04)',
        testInfo,
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
        },
        'Step 04 complete',
        testInfo,
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
      await page.waitForLoadState('load');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const rowCount = await leftTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 05 complete',
        testInfo,
      );
    });
    await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');
      // Find the first row in the table
      const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
      await shortagePage.waitAndHighlight(firstRow);
      await firstRow.scrollIntoViewIfNeeded();
      await firstRow.click({ force: true });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(firstRow).toBeVisible();
        },
        'Step 06 complete',
        testInfo,
      );
    });
    await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

      await shortagePage.waitAndHighlight(editButton, { timeout: WAIT_TIMEOUTS.LONG });
      await editButton.click();
      await page.waitForURL('**/edit/**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/edit');
        },
        'Step 07 complete',
        testInfo,
      );
    });
    await allure.step('Step 08: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
      await shortagePage.waitAndHighlight(addButton);

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(addButton).toBeVisible();
        },
        'Step 08 complete',
        testInfo,
      );
    });

    await allure.step('Step 09: Нажимаем по селектору из выпадающего списке "Cтандартную или покупную деталь". (Click on the selector from the drop-down list "Assembly unit (type Cтандартную или покупную деталь)".)', async () => {
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД);
      await shortagePage.waitAndHighlight(addButton);

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modal).toBeVisible();
        },
        'Step 09 complete',
        testInfo,
      );
    });
    const dialog = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
    table3Locator = dialog.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE);
    await allure.step('Step 10: Найдите элемент, который мы собираемся добавить.. (Search for the item we are going to add)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill(TestDataU004.TESTCASE_2_PRODUCT_ПД);
      await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const rowWithMaterial = table3Locator!.locator('tbody tr').filter({ hasText: TestDataU004.TESTCASE_2_PRODUCT_ПД }).first();
      await rowWithMaterial.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT)).toBeVisible();
        },
        'Search input visible (Step 10)',
        testInfo,
      );
    });
    let firstCell: Locator | null = null;
    await allure.step('Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      const rowWithMaterial = table3Locator!.locator('tbody tr').filter({ hasText: TestDataU004.TESTCASE_2_PRODUCT_ПД }).first();
      await rowWithMaterial.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      firstCell = rowWithMaterial.locator('td').first();
      firstCellValue = (await rowWithMaterial.locator('td').nth(1).innerText()).trim();
      await shortagePage.waitAndHighlight(firstCell);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(firstCellValue).toContain(TestDataU004.TESTCASE_2_PRODUCT_ПД);
        },
        'First row contains search term (Step 11)',
        testInfo,
      );
    });

    await allure.step('Step 12: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Wait for loading
      await page.waitForLoadState('load');
      await shortagePage.waitAndHighlight(firstCell!);
      firstCell!.hover();
      firstCell!.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(firstCell!).toBeVisible();
        },
        'Step 12 complete',
        testInfo,
      );
    });
    await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      const expectedState = true;
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isButtonReady).toBeTruthy();
          },
          'Button ready before add (Step 13)',
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.buildDataTestIdSelector(buttonDataTestId)}`);
      // Highlight button for debugging
      await shortagePage.waitAndHighlight(buttonLocator2);

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const bottomTable = dialog.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);
          const rowCount = await bottomTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 13 complete',
        testInfo,
      );
    });

    await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
      // Wait for the page to load
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const selectedPartNumber = firstCellValue; // Replace with actual part number

      // Locate the bottom table
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);

      await shortagePage.waitAndHighlight(bottomTableLocator);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');

      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Bottom table has rows (Step 14)',
        testInfo,
      );

      let isRowFound = false;
      const materialName = TestDataU004.TESTCASE_2_PRODUCT_ПД;

      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);
        const td0 = row.locator('td').nth(0);
        const td1 = row.locator('td').nth(1);
        const cell0 = (await td0.locator('input').count()) > 0 ? (await td0.locator('input').inputValue()).trim() : ((await td0.textContent())?.trim() ?? '');
        const cell1 = (await td1.locator('input').count()) > 0 ? (await td1.locator('input').inputValue()).trim() : ((await td1.textContent())?.trim() ?? '');
        const partNumberCell = row.locator('td').nth(1);

        logger.info(`Row ${i + 1}: cell0=${cell0}, cell1=${cell1}`);

        const matches = cell0 === selectedPartNumber || cell1 === selectedPartNumber || cell1.includes(selectedPartNumber) || selectedPartNumber.includes(cell1) || cell0.includes(materialName) || cell1.includes(materialName);
        if (matches) {
          isRowFound = true;
          await shortagePage.waitAndHighlight(partNumberCell);
          logger.info(`Selected row found in row ${i + 1}`);
          const assignmentCell = row.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_DESIGNATION_INPUT);
          assignmentCell.fill(TestDataU004.TESTCASE_2_PRODUCT_ASSIGNEMENT);
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          break;
        }
      }

      // Assert that the selected row is found
      //expect(isRowFound).toBeTruthy();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Selected row found in bottom table (Step 14)',
        testInfo,
      );
    });
    await allure.step('Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON;
      const buttonLabel = 'Добавить';
      const expectedState = true;
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isButtonReady).toBeTruthy();
          },
          'Button ready before add-to-main (Step 15)',
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.buildDataTestIdSelector(buttonDataTestId)}`);
      await shortagePage.waitAndHighlight(buttonLocator2);
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
          const nested = specTable.map(group => group.items).flat();
          const found = await shortagePage.isStringInNestedArray(nested, TestDataU004.TESTCASE_2_PRODUCT_ASSIGNEMENT);
          expect.soft(found).toBeTruthy();
        },
        'Step 15 complete',
        testInfo,
      );
    });

    await allure.step('Step 16: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');
      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
      await shortagePage.waitAndHighlight(button);

      button.click();
      await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 16 complete (save)',
        testInfo,
      );
    });
    await allure.step('Step 17: reload the page. (reload the page)', async () => {
      await page.reload();
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 17 complete (reload)',
        testInfo,
      );
    });

    await allure.step('Step 17b: Navigate back to edit page', async () => {
      await page.waitForLoadState('load');
      // Navigate to parts database page first
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await page.waitForLoadState('load');
      // Re-initialize table locator after navigation
      const productsTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      // Wait for search input to be visible
      const searchInput = productsTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // Filter and click row again
      await searchInput.fill(TestDataU004.TEST_PRODUCT);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      const firstRow = productsTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
      await shortagePage.waitAndHighlight(firstRow);
      await firstRow.click({ force: true });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
      await shortagePage.waitAndHighlight(editButton);
      await editButton.click();
      await page.waitForURL('**/edit/**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/edit');
        },
        'Step 17b complete (navigate to edit)',
      );
    });
    await allure.step('Step 18: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)', async () => {
      await page.waitForLoadState('load');
      const specTable = page.locator(SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await specTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      logger.info(tableData_full);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const nestedArray = tableData_full.map(group => group.items).flat();
      nestedArray.forEach((item, index) => logger.log(`Index ${index}: ${typeof item} - ${JSON.stringify(item)}`));

      const result = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_ASSIGNEMENT); // Output: true

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result).toBeTruthy();
        },
        'All added items present (Step 18)',
        testInfo,
      );
    });
  });

  test('TestCase 10 - cleanup (Return to original state)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM);
    const shortagePage = new CreatePartsDatabasePage(page);
    const { productName: T15_PRODUCT_NAME, assemblies: T15_ASSEMBLIES, details: T15_DETAILS, standardParts: T15_STANDARD_PARTS, consumables: T15_CONSUMABLES } = PRODUCT_SPECS.T15;

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
          // Verify cleanup completed by checking we can navigate to the page
          await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
          await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
        },
        'Cleanup done (TestCase 10)',
        testInfo,
      );
    });
  });
};
