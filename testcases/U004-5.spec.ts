import { test, expect, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { ENV, SELECTORS, CONST, PRODUCT_SPECS } from '../config';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import logger from '../lib/logger';
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

export const runU004_5 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 09- Редактирование изделия - Сравниваем комплектацию (Edit an Existing Material ПД - Comparing the complete set)', async ({ page }) => {
    // Placeholder for test logic: Open the parts database page
    test.setTimeout(180000);
    const shortagePage = new CreatePartsDatabasePage(page);
    // Placeholder for test logic: Open the parts database page
    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
        },
        'Step 01 complete'
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
        'Step 02 complete'
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
          'Products search visible (Step 03)'
        );
      }
    );
    await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
      // Locate the search field within the left table and fill it
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(CONST.TEST_PRODUCT);
      await page.waitForLoadState('networkidle');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Products search visible after fill (Step 04)'
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(CONST.TEST_PRODUCT);
        },
        'Step 04 complete'
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
        'Step 05 complete'
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
      await page.waitForTimeout(500);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await firstRow.isVisible()).toBe(true);
        },
        'Step 06 complete'
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
        'Step 07 complete'
      );
    });
    await allure.step(
      'Step 08: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
        await shortagePage.waitAndHighlight(addButton);

        addButton.click();
        await page.waitForTimeout(500);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await addButton.isVisible()).toBe(true);
          },
          'Step 08 complete'
        );
      }
    );

    await allure.step(
      'Step 09: Нажимаем по селектору из выпадающего списке "Cтандартную или покупную деталь". (Click on the selector from the drop-down list "Assembly unit (type Cтандартную или покупную деталь)".)',
      async () => {
        await page.waitForLoadState('networkidle');
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД);
        await shortagePage.waitAndHighlight(addButton);

        addButton.click();
        await page.waitForTimeout(500);
        const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modal.isVisible()).toBe(true);
          },
          'Step 09 complete'
        );
      }
    );
    const dialog = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
    table3Locator = dialog.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE);
    await allure.step('Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await table3Locator!.locator('input.search-yui-kit__input').fill(CONST.TESTCASE_2_PRODUCT_ПД);
      await table3Locator!.locator('input.search-yui-kit__input').press('Enter');
      await page.waitForLoadState('networkidle');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table3Locator!.locator('input.search-yui-kit__input')).toBeVisible();
        },
        'Search input visible (Step 10)'
      );
    });
    let firstCell: Locator | null = null;
    await allure.step(
      'Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        // Get the value of the first cell in the first row
        firstCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
        firstCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
        await shortagePage.waitAndHighlight(firstCell);
        firstCellValue = firstCellValue.trim();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(firstCellValue).toContain(CONST.TESTCASE_2_PRODUCT_ПД);
          },
          'First row contains search term (Step 11)'
        );
      }
    );

    await allure.step('Step 12: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(500);
      // Wait for loading
      await page.waitForLoadState('networkidle');
      await shortagePage.waitAndHighlight(firstCell!);
      firstCell!.hover();
      firstCell!.click();
      await page.waitForTimeout(500);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await firstCell!.isVisible()).toBe(true);
        },
        'Step 12 complete'
      );
    });
    await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      await page.waitForTimeout(500);
      const buttonLocator = page.locator(
        `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`
      );
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors

        const isButtonReady = await shortagePage.isButtonVisibleTestId(
          page,
          buttonDataTestId, // Use data-testid instead of class
          buttonLabel,
          expectedState
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isButtonReady).toBeTruthy();
          },
          'Button ready before add (Step 13)'
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(
        `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`
      );
      // Highlight button for debugging
      await shortagePage.waitAndHighlight(buttonLocator2);

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(500);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const bottomTable = dialog.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);
          const rowCount = await bottomTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 13 complete'
      );
    });

    await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      const selectedPartNumber = firstCellValue; // Replace with actual part number

      // Locate the bottom table
      const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
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
        'Bottom table has rows (Step 14)'
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partNumber = await row.locator('td').nth(1).textContent();
        const partNumberCell = await row.locator('td').nth(1);

        // Extract the partName from the second cell (assuming it's direct text)
        const partName = await row.locator('td').nth(1).textContent();

        logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

        // Compare the extracted values
        if (partName?.trim() === selectedPartNumber) {
          isRowFound = true;
          await shortagePage.waitAndHighlight(partNumberCell);
          logger.info(`Selected row found in row ${i + 1}`);
          //change the value in the Обозначение column

          // const assignmentCell = row.locator(
          //     'td.table-yui-kit__td fieldset input.input-yui-kit__input[type="text"]'
          // );
          const assignmentCell = row.locator('[data-testid="ModalBaseMaterial-Designation-Input-Input"]');

          assignmentCell.fill(CONST.TESTCASE_2_PRODUCT_ASSIGNEMENT);
          await page.waitForTimeout(1000);
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
        'Selected row found in bottom table (Step 14)'
      );
    });
    await allure.step(
      'Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        const buttonLocator = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`
        );
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Locate the button using data-testid instead of CSS class selectors

          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDataTestId, // Use data-testid instead of class
            buttonLabel,
            expectedState
          );
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            'Button ready before add-to-main (Step 15)'
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`
        );
        // Highlight button for debugging
        await shortagePage.waitAndHighlight(buttonLocator2);

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(1500);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            const nested = specTable.map(group => group.items).flat();
            const found = await shortagePage.isStringInNestedArray(nested, CONST.TESTCASE_2_PRODUCT_ASSIGNEMENT);
            expect.soft(found).toBeTruthy();
          },
          'Step 15 complete'
        );
      }
    );

    await allure.step('Step 16: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
      // Wait for loading
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
        'Step 16 complete (save)'
      );
    });
    await allure.step('Step 17: reload the page. (reload the page)', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 17 complete (reload)'
      );
    });

    await allure.step('Step 17b: Navigate back to edit page', async () => {
      await page.waitForLoadState('networkidle');
      // Navigate to parts database page first
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await page.waitForLoadState('networkidle');
      // Re-initialize table locator after navigation
      const productsTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      // Wait for search input to be visible
      const searchInput = productsTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      // Filter and click row again
      await searchInput.fill(CONST.TEST_PRODUCT);
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      const firstRow = productsTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
      await shortagePage.waitAndHighlight(firstRow);
      await firstRow.click({ force: true });
      await page.waitForTimeout(500);
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
      await shortagePage.waitAndHighlight(editButton);
      await editButton.click();
      await page.waitForURL('**/edit/**', { timeout: 15000 }).catch(() => {});
      await page.waitForLoadState('networkidle');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/edit');
        },
        'Step 17b complete (navigate to edit)'
      );
    });
    await allure.step(
      'Step 18: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        logger.info(tableData_full);
        await page.waitForTimeout(1000);
        const nestedArray = await tableData_full.map(group => group.items).flat();
        nestedArray.forEach((item, index) => console.log(`Index ${index}: ${typeof item} - ${JSON.stringify(item)}`));

        const result = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_ASSIGNEMENT); // Output: true

        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(result).toBeTruthy();
          },
          'All added items present (Step 18)'
        );
      }
    );
  });
  test('TestCase 10 - cleanup (Return to original state)', async ({ page }) => {
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
      await expectSoftWithScreenshot(
        page,
        async () => {
          // Verify cleanup completed by checking we can navigate to the page
          await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
          expect.soft(await page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID).isVisible()).toBe(true);
        },
        'Cleanup done (TestCase 10)'
      );
    });
  });
};
