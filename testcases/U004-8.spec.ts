import { test, expect, Locator } from '@playwright/test';
import { SELECTORS, PRODUCT_SPECS } from '../config';
import * as TestDataU004 from '../lib/Constants/TestDataU004';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { expectSoftWithScreenshot } from '../lib/Page';

let table2Locator: Locator | null = null;

const { productName: T15_PRODUCT_NAME, assemblies: T15_ASSEMBLIES, details: T15_DETAILS, standardParts: T15_STANDARD_PARTS, consumables: T15_CONSUMABLES } = PRODUCT_SPECS.T15;

export const runU004_8 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 16 - Добавьте больше материалов, чем ограниченное количество в спецификацию и проверка сохранения (Exceed Allowed Materials)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
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
    let secondCellValue = '';

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
        'Step 03 search input visible',
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
        'Step 04 search input visible',
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
      // Locate the "Редактировать" button
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
    await allure.step('Step 09: Нажимаем по селектору из выпадающего списке "Деталь". (Click on the selector from the drop-down list "Assembly unit (type Деталь)".)', async () => {
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д);
      await shortagePage.waitAndHighlight(addButton);

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.LONG);
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modal).toBeVisible();
        },
        'Step 09 complete',
        testInfo,
      );
    });
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
        await page.waitForLoadState('load');

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

        // Highlight the row for debugging (optional) - use minimal wait in loops
        await shortagePage.waitAndHighlight(row, { waitAfter: 50 });

        // Click the row to select it
        await row.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
          // Wait for loading
          await page.waitForLoadState('load');

          // Scoped dialog selector using data-testid
          const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
          const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
          const buttonLabel = 'Добавить';
          const expectedState = true;
          const buttonSelector = SelectorsPartsDataBase.buildDataTestIdSelector(buttonDataTestId);
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
              `Step 13 "${buttonLabel}" button ready`,
              testInfo,
            );
            logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
          });
          const buttonLocator2 = page.locator(`${dialogSelector} ${buttonSelector}`);
          // Highlight button for debugging
          await shortagePage.waitAndHighlight(buttonLocator2);

          // Perform click actions
          await buttonLocator2.click();
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(buttonLocator2).toBeVisible();
            },
            'Step 13 complete',
            testInfo,
          );
        });

        await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
          // Wait for the page to load
          await page.waitForLoadState('load');
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          const selectedPartNumber = firstCellValue; // Replace with actual part number
          const selectedPartName = secondCellValue; // Replace with actual part name

          // Locate the bottom table
          const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
          const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);

          await shortagePage.waitAndHighlight(bottomTableLocator);

          // Locate all rows in the table body
          const rowsLocator = bottomTableLocator.locator('tbody tr');

          const rowCount = await rowsLocator.count();
          let isRowFound = false;

          // Iterate through each row
          for (let i = 0; i < rowCount; i++) {
            const row = rowsLocator.nth(i);
            // Extract the partNumber from the input field in the first cell
            const partNumber = await row.locator('td').nth(0).textContent();
            const partNumberCell = row.locator('td').nth(0);
            // Extract the partName from the second cell (assuming it's direct text)
            const partName = await row.locator('td').nth(1).textContent();

            logger.info(`Row ${i + 1}: PartNumber=${partNumber?.trim()}, PartName=${partName?.trim()}`);

            // Compare the extracted values
            if (partNumber?.trim() === selectedPartNumber && partName?.trim() === selectedPartName) {
              isRowFound = true;
              await shortagePage.waitAndHighlight(partNumberCell);
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
            'Step 14 bottom table contains selected row',
            testInfo,
          );
        });
      }
      await allure.step('Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        const expectedState = true;
        const buttonSelector = SelectorsPartsDataBase.buildDataTestIdSelector(buttonDataTestId);
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
            testInfo,
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(`${dialogSelector} ${buttonSelector}`);
        // Highlight button for debugging
        await shortagePage.waitAndHighlight(buttonLocator2);

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        await page.waitForLoadState('load');
        await expectSoftWithScreenshot(
          page,
          async () => {
            // After clicking "Добавить", we should still be on the edit page
            expect.soft(page.url()).toContain('/edit');
            // The modal might close or items should be added - check we're still on edit page
          },
          'Step 15 complete',
          testInfo,
        );
      });

      await allure.step('Step 35: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
        // Wait for loading
        await page.waitForLoadState('load');
        const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
        await shortagePage.waitAndHighlight(button);
        await page.waitForLoadState('load');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
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
          void 0;
        }
        button.click();

        await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
        await page.waitForLoadState('load');
        await page.waitForTimeout(TIMEOUTS.EXTENDED);
        //await page.goto(page.url(), { waitUntil: 'networkidle' });
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(page.url()).toContain('/baseproducts');
          },
          'Step 35 complete (save)',
          testInfo,
        );
      });
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(currentRowCount).toBeGreaterThan(0);
        },
        'Step 10 complete',
        testInfo,
      );
    });
  });

  test('TestCase 17 - cleanup delete all added details (cleanup delete all added details)', async ({ page }, testInfo) => {
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
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await expectSoftWithScreenshot(
        page,
        async () => {
          // After cleanup, we should be on the baseproducts page
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Cleanup done (TestCase 17)',
        testInfo,
      );
    });
  });
};
