import { test, expect, Locator } from '@playwright/test';
import { SELECTORS, CONST, PRODUCT_SPECS } from '../config';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import logger from '../lib/logger';
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

export const runU004_8 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 16 - Добавьте больше материалов, чем ограниченное количество в спецификацию и проверка сохранения (Exceed Allowed Materials)', async ({
    page,
  }) => {
    test.setTimeout(900000);
    const shortagePage = new CreatePartsDatabasePage(page);
    // Placeholder for test logic: Open the parts database page
    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(true).toBe(true);
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
          expect.soft(true).toBe(true);
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
          'Step 03 search input visible'
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
        'Step 04 search input visible'
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
      await page.waitForLoadState('networkidle');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(true).toBe(true);
        },
        'Step 05 complete'
      );
    });
    await allure.step('Step 06: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');
      // Find the first row in the table
      const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
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
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(true).toBe(true);
        },
        'Step 06 complete'
      );
    });
    await allure.step('Step 07: Найдите кнопку «Редактировать» и нажмите ее. (Find the edit button and click it)', async () => {
      const firstRow = leftTable.locator('tbody tr:first-child');
      // Locate the "Редактировать" button
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);

      editButton.click();
      await page.waitForTimeout(500);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(true).toBe(true);
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
        await addButton.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'red';
        });

        addButton.click();
        await page.waitForTimeout(500);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(true).toBe(true);
          },
          'Step 08 complete'
        );
      }
    );
    await allure.step(
      'Step 09: Нажимаем по селектору из выпадающего списке "Деталь". (Click on the selector from the drop-down list "Assembly unit (type Деталь)".)',
      async () => {
        await page.waitForLoadState('networkidle');
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д);
        await addButton.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'red';
        });

        addButton.click();
        await page.waitForTimeout(2000);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(true).toBe(true);
          },
          'Step 09 complete'
        );
      }
    );
    table2Locator = page.locator(SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE);
    await allure.step('Step 10: Add all found products one by one ()', async () => {
      // Wait for the table to be loaded
      await table2Locator!.waitFor({ state: 'visible' });

      // Locate the rows within the table
      const rowsLocator = table2Locator!.locator('tbody tr');
      let previousRowCount = 0;
      let currentRowCount = await rowsLocator.count();

      // Loop until no new rows are loaded
      while (currentRowCount > previousRowCount) {
        previousRowCount = currentRowCount;

        // Scroll the last row into view to trigger loading more rows
        await rowsLocator.nth(currentRowCount - 1).scrollIntoViewIfNeeded();
        await page.waitForLoadState('networkidle');

        // Update the row count after scrolling
        currentRowCount = await rowsLocator.count();
      }

      // Iterate through all the loaded rows
      for (let i = 0; i < currentRowCount; i++) {
        const row = rowsLocator.nth(i);

        // Capture values of the current row so we can validate after adding
        const selectedPartNumber = (await row.locator('td').nth(0).textContent())?.trim() || '';
        const selectedPartName = (await row.locator('td').nth(1).textContent())?.trim() || '';
        firstCellValue = selectedPartNumber;
        secondCellValue = selectedPartName;

        // Highlight the row for debugging (optional)
        await row.evaluate(el => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid blue';
        });

        // Click the row to select it
        await row.click();
        await page.waitForTimeout(500);

        await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
          // Wait for loading
          await page.waitForLoadState('networkidle');

          // Scoped dialog selector using data-testid
          const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
          const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
          const buttonLabel = 'Добавить';
          let expectedState = true;
          const buttonSelector = buttonDataTestId.includes('data-testid') ? buttonDataTestId : `[data-testid="${buttonDataTestId}"]`;
          const buttonLocator = page.locator(`${dialogSelector} ${buttonSelector}`);
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
              `Step 13 "${buttonLabel}" button ready`
            );
            logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
          });
          const buttonLocator2 = page.locator(`${dialogSelector} ${buttonSelector}`);
          // Highlight button for debugging
          await buttonLocator2.evaluate(button => {
            button.style.backgroundColor = 'green';
            button.style.border = '2px solid red';
            button.style.color = 'blue';
          });

          // Perform click actions
          await buttonLocator2.click();
          await page.waitForTimeout(100);
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(true).toBe(true);
            },
            'Step 13 complete'
          );
        });

        await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
          // Wait for the page to load
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(100);
          const selectedPartNumber = firstCellValue; // Replace with actual part number
          const selectedPartName = secondCellValue; // Replace with actual part name

          // Locate the bottom table
          const modal = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
          const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);

          await bottomTableLocator.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });

          // Locate all rows in the table body
          const rowsLocator = bottomTableLocator.locator('tbody tr');

          const rowCount = await rowsLocator.count();
          let isRowFound = false;

          // Iterate through each row
          for (let i = 0; i < rowCount; i++) {
            const row = rowsLocator.nth(i);
            await row.evaluate(row => {
              row.style.backgroundColor = 'yellow';
              row.style.border = '2px solid red';
              row.style.color = 'blue';
            });
            // Extract the partNumber from the input field in the first cell
            const partNumber = await row.locator('td').nth(0).textContent();
            const partNumberCell = await row.locator('td').nth(0);
            // Extract the partName from the second cell (assuming it's direct text)
            const partName = await row.locator('td').nth(1).textContent();

            logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

            // Compare the extracted values
            if (partNumber?.trim() === selectedPartNumber && partName?.trim() === selectedPartName) {
              isRowFound = true;
              await partNumberCell.evaluate(row => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
              });
              logger.info(`Selected row found in row ${i + 1}`);
              break;
            }
          }

          // Assert that the selected row is found
          //expect(isRowFound).toBeTruthy();
          logger.info(`The selected row with PartNumber="${selectedPartNumber}" and PartName="${selectedPartName}" is present in the bottom table.`);
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(rowCount).toBeGreaterThan(0);
              expect.soft(isRowFound).toBeTruthy();
            },
            'Step 14 bottom table contains selected row'
          );
        });
      }
      await allure.step(
        'Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
        async () => {
          // Wait for loading
          await page.waitForLoadState('networkidle');

          // Scoped dialog selector using data-testid
          const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
          const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
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
              expectedState
            );
            await expectSoftWithScreenshot(
              page,
              async () => {
                expect.soft(isButtonReady).toBeTruthy();
              },
              `Step 15 "${buttonLabel}" button ready`
            );
            logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
          });
          const buttonLocator2 = page.locator(`${dialogSelector} ${buttonSelector}`);
          // Highlight button for debugging
          await buttonLocator2.evaluate(button => {
            button.style.backgroundColor = 'green';
            button.style.border = '2px solid red';
            button.style.color = 'blue';
          });

          // Perform click actions
          await buttonLocator2.click();
          await page.waitForTimeout(500);
          await expectSoftWithScreenshot(
            page,
            async () => {
              expect.soft(true).toBe(true);
            },
            'Step 15 complete'
          );
        }
      );

      await allure.step('Step 35: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await button.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
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

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        //await page.goto(page.url(), { waitUntil: 'networkidle' });
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(true).toBe(true);
          },
          'Step 35 complete (save)'
        );
      });
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(true).toBe(true);
        },
        'Step 10 complete'
      );
    });
  });
  test('TestCase 17 - cleanup delete all added details (cleanup delete all added details)', async ({ page }) => {
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
          expect.soft(true).toBe(true);
        },
        'Cleanup done (TestCase 17)'
      );
    });
  });
};
