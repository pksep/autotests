import { test, expect, Locator } from '@playwright/test';
import { SELECTORS } from '../config';
import * as TestDataU004 from '../lib/Constants/TestDataU004';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
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

export const runU004_6 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 11 - Delete a Material Before Saving', async ({ page }) => {
    /// INCOMPLETE DUE TO BUG
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
        'Step 07 complete',
      );
    });
    await allure.step(
      'Step 08: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
        await shortagePage.waitAndHighlight(addButton);

        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        addButton.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await addButton.isVisible()).toBe(true);
          },
          'Step 08 complete',
        );
      },
    );

    await allure.step(
      'Step 09: Нажимаем по Кнопка из выпадающего списке "Cтандартную или покупную деталь". (Click on the Кнопка from the list "Cтандартную или покупную деталь".)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД);
        await shortagePage.waitAndHighlight(addButton);

        addButton.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modal.isVisible()).toBe(true);
          },
          'Step 09 complete',
        );
      },
    );
    const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
    table3Locator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE);
    await allure.step('Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill(TestDataU004.TESTCASE_2_PRODUCT_ПД);
      await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT)).toBeVisible();
        },
        'Step 10 search input visible',
      );
    });
    let firstCell: Locator | null = null;
    await allure.step(
      'Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        // Wait for the page to stabilize
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await page.waitForLoadState('networkidle');

        // Get the value of the first cell in the first row
        firstCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
        firstCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
        await shortagePage.waitAndHighlight(firstCell);
        firstCellValue = firstCellValue.trim();
        // Get the value of the second cell in the first row

        // Confirm that the first cell contains the search term
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(firstCellValue).toContain(TestDataU004.TESTCASE_2_PRODUCT_ПД);
          },
          'Step 11 row contains search term',
        );
      },
    );

    await allure.step('Step 12: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Wait for loading
      await page.waitForLoadState('networkidle');
      await shortagePage.waitAndHighlight(firstCell!);
      //firstCell!.hover();
      firstCell!.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await firstCell!.isVisible()).toBe(true);
        },
        'Step 12 complete',
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
      const buttonLocator = page.locator(
        `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
      );
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors
        const isButtonReady = await shortagePage.isButtonVisibleTestId(
          page,
          buttonDataTestId, // Use data-testid instead of class
          buttonLabel,
          expectedState,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isButtonReady).toBeTruthy();
          },
          'TC12 Step 15 button ready',
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(
        `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
      );
      // Highlight button for debugging
      await shortagePage.waitAndHighlight(buttonLocator2);

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
          const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);
          const rowCount = await bottomTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Step 13 complete',
      );
    });
    await allure.step(
      'Step 14: Убедитесь, что выбранная строка теперь отображается в нижней таблице. (Ensure the selected row is now showing in the bottom table)',
      async () => {
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
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
          'Step 14 bottom table has rows',
        );

        let isRowFound = false;

        // Iterate through each row
        for (let i = 0; i < rowCount; i++) {
          const row = rowsLocator.nth(i);

          // Extract the partNumber from the input field in the first cell
          const partNumber = await row.locator('td').nth(1).textContent();
          const partNumberCell = await row.locator('td').nth(1);
          // Extract the partName from the second cell (assuming it's direct text)

          logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

          // Compare the extracted values
          if (partNumber?.trim() === selectedPartNumber) {
            isRowFound = true;
            await shortagePage.waitAndHighlight(partNumberCell);
            logger.info(`Selected row found in row ${i + 1}`);
            break;
          }
        }
        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        // Assert that the selected row is found
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isRowFound).toBeTruthy();
          },
          'Step 14 selected row found',
        );
        logger.info(`The selected row with PartNumber="${selectedPartNumber}" is present in the bottom table.`);
      },
    );
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
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
        );
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Locate the button using data-testid instead of CSS class selectors

          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDataTestId, // Use data-testid instead of class
            buttonLabel,
            expectedState,
          );
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Step 15 "${buttonLabel}" button ready`,
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
        );
        // Highlight button for debugging
        await shortagePage.waitAndHighlight(buttonLocator2);

        // Perform hover and click actions
        await buttonLocator2.click({ force: true });
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            const nested = specTable.map(group => group.items).flat();
            const found = await shortagePage.isStringInNestedArray(nested, TestDataU004.TESTCASE_2_PRODUCT_ПД);
            expect.soft(found).toBeTruthy();
          },
          'Step 15 add to main complete',
        );
      },
    );
    await allure.step('Step 16: Захват таблицы и сохранение ее в массиве. (Capture table and store it in an array)', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_full.length).toBeGreaterThan(0);
        },
        'Step 16 table captured',
      );
    });
    await allure.step('Step 17: Подтвердите, что элемент теперь находится в массиве. (Confirm that the item is now in the array)', async () => {
      const nestedArray = tableData_full.map(group => group.items).flat();
      const result = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_ПД); // Output: true

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result).toBeTruthy();
        },
        'Step 17 item present in array',
      );
    });
    await allure.step('Step 18: Удалить элемент без сохранения. (Remove the item without saving)', async () => {
      //remove the item we added ПД
      await page.waitForLoadState('networkidle');
      await allure.step('Step 007 sub step 1: find and click the Добавить button', async () => {
        const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
        await shortagePage.waitAndHighlight(addButton);

        addButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await addButton.isVisible()).toBe(true);
          },
          'Step 18 sub1 add clicked',
        );
      });
      await allure.step('Step 007 sub step 2: find and click the Cтандартную или покупную деталь button', async () => {
        const add2Button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД);
        await shortagePage.waitAndHighlight(add2Button);
        add2Button.click();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const modal2 = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modal2.isVisible()).toBe(true);
          },
          'Step 18 sub2 small dialog clicked',
        );
      });
      await allure.step('Step 007 sub step 3: find the bottom table', async () => {
        const selectedPartNumber = TestDataU004.TESTCASE_2_PRODUCT_ПД;

        const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
        const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);
        await page.waitForTimeout(TIMEOUTS.VERY_LONG);
        await shortagePage.waitAndHighlight(bottomTableLocator);
        // Locate all rows in the table body
        const rowsLocator = bottomTableLocator.locator('tbody tr');
        const rowCount = await rowsLocator.count();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'Step 18 sub3 bottom table has rows',
        );

        let isRowFound = false;

        // Iterate through each row
        for (let i = 0; i < rowCount; i++) {
          const row = rowsLocator.nth(i);

          // Extract the partNumber from the input field in the first cell
          const partNumber = await row.locator('td').nth(1).textContent();

          const partNumberCell = await row.locator('td').nth(1);
          // Extract the partName from the second cell (assuming it's direct text)
          //const partName = await row.locator('td').nth(2).textContent();

          logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

          // Compare the extracted values
          if (partNumber?.trim() === selectedPartNumber) {
            isRowFound = true;
            await shortagePage.waitAndHighlight(partNumberCell);
            logger.info(`Selected row found in row ${i + 1}`);
            const deleteCellValue = await row.locator('td').nth(4).textContent();

            const deleteCell = await row.locator('td').nth(4);
            await shortagePage.waitAndHighlight(deleteCell);
            deleteCell.click();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isRowFound).toBeTruthy();
          },
          'Step 18 sub3 selected row found',
        );
      });

      await allure.step(
        'Step 007 sub step 4: Нажимаем по кнопке "Добавить" в модальном окне (Click on the "Добавить" button in the modal window)',
        async () => {
          // Wait for loading
          await page.waitForLoadState('networkidle');

          // Scoped dialog selector using data-testid
          const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
          const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
          const buttonLabel = 'Добавить';
          let expectedState = true;
          const buttonSelector = buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`;
          const buttonLocator = page.locator(`${dialogSelector} ${buttonSelector}`);
          await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
            // Locate the button using data-testid instead of CSS class selectors

            const isButtonReady = await shortagePage.isButtonVisibleTestId(
              page,
              buttonDataTestId, // Use data-testid instead of class
              buttonLabel,
              expectedState,
            );
            await expectSoftWithScreenshot(
              page,
              async () => {
                expect.soft(isButtonReady).toBeTruthy();
              },
              'Step 18 sub4 button ready',
            );
            logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
          });
          const buttonLocator2 = page.locator(`${dialogSelector} ${buttonSelector}`);
          // Highlight button for debugging
          await shortagePage.waitAndHighlight(buttonLocator2);

          // Perform click actions
          await buttonLocator2.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          await expectSoftWithScreenshot(
            page,
            async () => {
              const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
              const nested = specTable.map(group => group.items).flat();
              const found = await shortagePage.isStringInNestedArray(nested, TestDataU004.TESTCASE_2_PRODUCT_ПД);
              expect.soft(found).toBeFalsy(); // Should NOT be found after deletion
            },
            'Step 18 sub4 click complete',
          );
        },
      );

      await allure.step('Step 007 sub step 5: Нажимаем по кнопке "Сохранить"  (Click on the "Сохранить" button in the main window)', async () => {
        await page.waitForLoadState('networkidle');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);

        button.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      });
      ////////////////// end of ПД deletion
    });
    await allure.step('Step 19: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
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
        'Step 19 complete (save)',
      );
    });
    await allure.step('Step 20: Захват таблицы и сохранение ее в массиве. (Capture table and store it in an array)', async () => {
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      // Navigate back to edit page first
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
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_full.length).toBeGreaterThan(0);
        },
        'Step 20 table captured',
      );
    });
    await allure.step('Step 21: Подтвердите, что элемент теперь НЕ находится в массиве. (Confirm that the item is now NOT in the array)', async () => {
      const nestedArray = tableData_full.map(group => group.items).flat();
      const result = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_ПД); // Output: true

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result).toBeFalsy();
        },
        'Step 21 item absent',
      );
    });
  });
  test('TestCase 12 - Удалить сохраненный материал (Remove Saved Material)', async ({ page }) => {
    //first add a material
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
        'TC12 Step 01 complete',
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
        'TC12 Step 02 complete',
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
          'TC12 Step 03 search input visible',
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
        'TC12 Step 04 search input visible',
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(TestDataU004.TEST_PRODUCT);
        },
        'TC12 Step 04 complete',
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
        'TC12 Step 05 complete',
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
        'TC12 Step 06 complete',
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
        'TC12 Step 07 complete',
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
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await addButton.isVisible()).toBe(true);
          },
          'TC12 Step 08 complete',
        );
      },
    );
    await allure.step(
      'Step 09: Нажимаем по Кнопка из выпадающего списке "Расходный материал". (Click on the Кнопка from the list "Расходный материал".)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ);
        await shortagePage.waitAndHighlight(addButton);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        //add
        addButton.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modal.isVisible()).toBe(true);
          },
          'TC12 Step 09 complete',
        );
      },
    );
    const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
    table3Locator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE);
    await allure.step('Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('networkidle');
      await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill(TestDataU004.TESTCASE_2_PRODUCT_РМ);
      await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).press('Enter');
      await page.waitForLoadState('networkidle');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT)).toBeVisible();
        },
        'TC12 Step 10 search input visible',
      );
    });
    let firstCell: Locator | null = null;
    await allure.step(
      'Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');

        // Get the value of the first cell in the first row
        firstCellValue = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
        firstCell = await table3Locator!.locator('tbody tr:first-child td:nth-child(1)');
        await shortagePage.waitAndHighlight(firstCell);
        firstCellValue = firstCellValue.trim();
        // Get the value of the second cell in the first row

        // Confirm that the first cell contains the search term
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(firstCellValue).toContain(TestDataU004.TESTCASE_2_PRODUCT_РМ);
          },
          'TC12 Step 11 row inspected',
        );
      },
    );

    await allure.step('Step 12: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Wait for loading
      await page.waitForLoadState('networkidle');
      await shortagePage.waitAndHighlight(firstCell!);
      //firstCell!.hover();
      firstCell!.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await firstCell!.isVisible()).toBe(true);
        },
        'TC12 Step 12 complete',
      );
    });
    await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      const buttonLocator = page.locator(
        `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
      );
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors

        const isButtonReady = await shortagePage.isButtonVisibleTestId(
          page,
          buttonDataTestId, // Use data-testid instead of class
          buttonLabel,
          expectedState,
        );
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isButtonReady).toBeTruthy();
          },
          'TC12 Step 13 button ready',
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(
        `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
      );
      // Highlight button for debugging
      await shortagePage.waitAndHighlight(buttonLocator2);

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE);
          const rowCount = await bottomTable.locator('tbody tr').count();
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'TC12 Step 13 complete',
      );
    });

    await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const selectedPartNumber = firstCellValue; // Replace with actual part number

      // Locate the bottom table
      const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE);
      await shortagePage.waitAndHighlight(bottomTableLocator);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');

      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'TC12 Step 14 bottom table has rows',
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partNumber = await row.locator('td').nth(1).textContent();
        const partNumberCell = await row.locator('td').nth(1);
        // Extract the partName from the second cell (assuming it's direct text)

        logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

        // Compare the extracted values
        if (partNumber?.trim() === selectedPartNumber) {
          isRowFound = true;
          await shortagePage.waitAndHighlight(partNumberCell);
          logger.info(`Selected row found in row ${i + 1}`);
          break;
        }
      }
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      // Assert that the selected row is found
      //expect(isRowFound).toBeTruthy();
      logger.info(`The selected row with PartNumber="${selectedPartNumber}" is present in the bottom table.`);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'TC12 Step 14 selected row found',
      );
    });
    await allure.step(
      'Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        const buttonLocator = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
        );
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Locate the button using data-testid instead of CSS class selectors

          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDataTestId, // Use data-testid instead of class
            buttonLabel,
            expectedState,
          );
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            'TC12 Step18 sub4 button ready',
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
        );
        // Highlight button for debugging
        await shortagePage.waitAndHighlight(buttonLocator2);

        // Perform hover and click actions
        await buttonLocator2.hover();
        await buttonLocator2.click();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            const nested = specTable.map(group => group.items).flat();
            const found = await shortagePage.isStringInNestedArray(nested, TestDataU004.TESTCASE_2_PRODUCT_РМ);
            expect.soft(found).toBeTruthy();
          },
          'TC12 Step 15 complete',
        );
      },
    );

    //second save
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
        'TC12 Step 16 complete',
      );
    });
    //third refresh and confirm saved
    await allure.step('Step 17: refresh and confirm saved. (refresh and confirm saved)', async () => {
      await page.reload({
        timeout: 30000, // Sets a 30 second timeout
        waitUntil: 'networkidle', // Waits until the page reaches network idle state
      });
      await page.waitForLoadState('networkidle');
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
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await page.waitForLoadState('networkidle');
      const nestedArray = tableData_full.map(group => group.items).flat();
      const result = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_РМ); // Output: true
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result).toBeTruthy();
        },
        'TC12 Step 17 item present after refresh',
      );
    });
    //fourth delete and save
    await allure.step('Step 18: delete and save. (delete and save)', async () => {
      test.setTimeout(180000);
      const shortagePage = new CreatePartsDatabasePage(page);
      const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      let firstCellValue = '';
      let secondCellValue = '';
      let thirdCellValue = '';
      await page.reload();
      //remove the item we added ПД
      await page.waitForLoadState('networkidle');
      await allure.step('Step 18 sub step 1: find and click the Добавить button', async () => {
        const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
        await shortagePage.waitAndHighlight(addButton);

        addButton.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page.waitForLoadState('networkidle');
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await addButton.isVisible()).toBe(true);
          },
          'TC12 Step18 sub1 add clicked',
        );
      });
      await allure.step('Step 18 sub step 2: find and click the Расходный материал button', async () => {
        const add2Button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ);
        await shortagePage.waitAndHighlight(add2Button);
        add2Button.click();
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        const modal2 = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modal2.isVisible()).toBe(true);
          },
          'TC12 Step18 sub2 small dialog clicked',
        );
      });
      await allure.step('Step 18 sub step 3: find the bottom table', async () => {
        const selectedPartNumber = TestDataU004.TESTCASE_2_PRODUCT_РМ; // Replace with actual part number

        const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
        const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE);
        await page.waitForTimeout(TIMEOUTS.STANDARD);
        await shortagePage.waitAndHighlight(bottomTableLocator);
        // Locate all rows in the table body
        const rowsLocator = bottomTableLocator.locator('tbody tr');
        const rowCount = await rowsLocator.count();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(rowCount).toBeGreaterThan(0);
          },
          'TC12 Step18 sub3 bottom table has rows',
        );

        let isRowFound = false;

        // Iterate through each row
        for (let i = 0; i < rowCount; i++) {
          const row = rowsLocator.nth(i);

          // Extract the partNumber from the input field in the first cell
          const partNumber = await row.locator('td').nth(1).textContent();

          const partNumberCell = await row.locator('td').nth(1);
          // Extract the partName from the second cell (assuming it's direct text)
          //const partName = await row.locator('td').nth(2).textContent();

          logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}`);

          // Compare the extracted values
          if (partNumber?.trim() === selectedPartNumber) {
            isRowFound = true;
            await shortagePage.waitAndHighlight(partNumberCell);
            logger.info(`Selected row found in row ${i + 1}`);
            const deleteCellValue = await row.locator('td').nth(4).textContent();

            const deleteCell = await row.locator('td').nth(4);
            await shortagePage.waitAndHighlight(deleteCell);
            deleteCell.click();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(isRowFound).toBeTruthy();
          },
          'TC12 Step18 sub3 selected row found',
        );
      });

      await allure.step('Step 18 sub step 4: Нажимаем по кнопке "Добавить" в модальном окне (Click on the "Добавить" button in the modal window)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        const buttonLocator = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
        );
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Locate the button using data-testid instead of CSS class selectors

          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDataTestId, // Use data-testid instead of class
            buttonLabel,
            expectedState,
          );
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Button "${buttonLabel}" validation`,
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(
          `${dialogSelector} ${buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`}`,
        );
        // Highlight button for debugging
        await shortagePage.waitAndHighlight(buttonLocator2);

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await expectSoftWithScreenshot(
          page,
          async () => {
            const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
            const nested = specTable.map(group => group.items).flat();
            const found = await shortagePage.isStringInNestedArray(nested, TestDataU004.TESTCASE_2_PRODUCT_РМ);
            expect.soft(found).toBeFalsy(); // Should NOT be found after deletion
          },
          'TC12 Step18 sub4 click complete',
        );
      });

      await allure.step('Step 18 sub step 5: Нажимаем по кнопке "Сохранить"  (Click on the "Сохранить" button in the main window)', async () => {
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
          'Step 18 sub5 save clicked',
        );
      });
      ////////////////// end of РМ deletion
    });
    //fifth refresh and confirm deleted
    await allure.step('Step 19: refresh and confirm deleted. (refresh and confirm deleted)', async () => {
      // Ensure any open modal is closed before reloading
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
      await page.reload({
        timeout: 30000, // Sets a 500ms timeout
        waitUntil: 'networkidle', // Waits until the page reaches network idle state
      });
      await page.waitForLoadState('networkidle');
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
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await page.waitForLoadState('networkidle');
      const nestedArray = tableData_full.map(group => group.items).flat();
      const result = await shortagePage.isStringInNestedArray(nestedArray, TestDataU004.TESTCASE_2_PRODUCT_РМ); // Output: true
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result).toBeFalsy();
        },
        'TC12 Step19 item absent after refresh',
      );
    });
  });
};
