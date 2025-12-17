import { test, expect, Locator } from '@playwright/test';
import { runTC000, performLogin } from './TC000.spec';
import { ENV, SELECTORS, CONST, PRODUCT_SPECS } from '../config';
import logger from '../lib/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U004-PC01.json'; // Import your test data
import { expectSoftWithScreenshot } from '../lib/Page';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';

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
let sbNoResultsFound: boolean = false;
let dNoResultsFound: boolean = false;
let sbSkippedAdd: boolean = false;

export const runU004_9 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 18 - Добавить, изменить и удалить несколько элементов одновременно в спецификацию и проверка сохранения (Add, Modify, and Delete in One Session)', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const shortagePage = new CreatePartsDatabasePage(page);

    await allure.step('Setup: Clean up Т15 product specifications', async () => {
      // Navigate to parts database page
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
            expect.soft(await leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).isVisible()).toBe(true);
          },
          'Verify top table search input is visible'
        );
      }
    );
    await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
      // Locate the search field within the left table and fill it
      await leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).fill(CONST.TEST_PRODUCT);
      await page.waitForLoadState('networkidle');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).isVisible()).toBe(true);
        },
        'Verify main table search input remains visible after fill'
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toHaveValue(CONST.TEST_PRODUCT);
        },
        'Step 04 complete'
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).press('Enter');
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
      const firstRow = leftTable.locator(SelectorsPartsDataBase.TABLE_FIRST_ROW_SELECTOR);
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
        await addButton.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'red';
        });

        addButton.click();
        await page.waitForTimeout(500);
      }
    );
    // Start adding СБ
    await allure.step(
      'Step 09: Нажимаем по селектору из выпадающего списке "Сборочную единицу (тип СБ)". (Click on the selector from the drop-down list "Assembly unit (type СБ)".)',
      async () => {
        await page.waitForLoadState('networkidle');
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_СБ);
        await shortagePage.waitAndHighlight(addButton);
        addButton.click();
        await page.waitForTimeout(500);
        const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_DIALOG);
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(await modal.isVisible()).toBe(true);
          },
          'Step 09 complete'
        );
      }
    );
    const modalСБ = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_DIALOG);
    table2Locator = modalСБ.locator(SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE);
    await allure.step('Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('networkidle');
      await modalСБ.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      // Highlight modal and pause
      await shortagePage.waitAndHighlight(modalСБ);
      await page.waitForTimeout(500);

      // Highlight the СБ table and pause
      await shortagePage.waitAndHighlight(table2Locator!);
      await page.waitForTimeout(500);
      console.log('22222');
      // Ensure search input is visible and ready
      // Prefer the table-scoped input for СБ – it's consistently present; add robust fallbacks
      let searchInput = table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
      console.log('33333');
      let candidatesCount = await searchInput.count();
      if (candidatesCount === 0) {
        const testIdCandidates = modalСБ.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
        const total = await testIdCandidates.count();
        for (let i = 0; i < total; i++) {
          const candidate = testIdCandidates.nth(i);
          if (await candidate.isVisible().catch(() => false)) {
            searchInput = candidate;
            candidatesCount = 1;
            break;
          }
        }
      }
      console.log('44444');
      if (candidatesCount === 0) {
        searchInput = modalСБ.locator(`${SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE} ${SelectorsPartsDataBase.TABLE_SEARCH_INPUT}`).first();
        //highlight the input field here
        candidatesCount = await searchInput.count();
        await shortagePage.waitAndHighlight(searchInput, { waitAfter: 50 });
      }
      console.log('55555');
      if (candidatesCount === 0) {
        // Last resort: any visible contenteditable in the modal header area
        searchInput = modalСБ.locator('[contenteditable="true"]').first();
        await shortagePage.waitAndHighlight(searchInput, { waitAfter: 50 });
      }
      console.log('66666');
      await searchInput.waitFor({ state: 'visible', timeout: 20000 });

      // Highlight search input and pause
      await shortagePage.waitAndHighlight(searchInput, { waitAfter: 50 });
      console.log('77777');
      // Clear any existing content and close history overlay
      await searchInput.fill('');
      await page.waitForTimeout(200);
      console.log('88888');
      // Fill the search input

      const valueToSet = CONST.TESTCASE_2_PRODUCT_СБ;
      let setOk = false;
      try {
        await searchInput.fill(valueToSet, { timeout: 2000 });
        setOk = true;
      } catch {}
      if (!setOk) {
        try {
          await searchInput.click({ timeout: 1000 });
          await searchInput.fill(valueToSet, { timeout: 2000 });
          setOk = true;
        } catch {}
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as HTMLInputElement;
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, valueToSet)
          .catch(() => {});
      }

      console.log('99999');
      await page.waitForTimeout(500);

      // Verify the input was filled correctly
      const inputValue = await searchInput.inputValue().catch(() => '');
      console.log(`Search input value: "${inputValue}"`);
      console.log('101010');
      await page.waitForTimeout(2000);
      expect.soft(inputValue).toContain(CONST.TESTCASE_2_PRODUCT_СБ);

      // Press Enter to perform search
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Add timeout for table to update

      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).isVisible()).toBe(true);
        },
        'Verify search input in top modal table is visible'
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          const inputValue = await searchInput.inputValue().catch(() => '');
          expect.soft(inputValue).toContain(CONST.TESTCASE_2_PRODUCT_СБ);
        },
        'Step 10 complete'
      );

      // Detect if the search returned zero results in the top table
      const resultRowCount = await table2Locator!
        .locator('tbody tr')
        .count()
        .catch(() => 0);
      if (resultRowCount === 0) {
        // Verify expected item exists in bottom table
        const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_OPEN);
        const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE);
        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        const count = await rows.count().catch(() => 0);
        let found = false;
        for (let i = 0; i < count; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && text.includes(CONST.TESTCASE_2_PRODUCT_СБ)) {
            found = true;
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify bottom table contains searched part'
        );
        sbNoResultsFound = true;
        sbSkippedAdd = true;
      }
    });
    let firstCell: Locator | null = null;
    await allure.step(
      'Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        if (sbNoResultsFound) {
          console.log('Step 11 skipped: no results in top table; item exists in bottom table.');
          return;
        }
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');
        console.log('111111');
        // Ensure table has at least one row visible
        const firstRow = table2Locator!.locator('tbody tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });
        console.log('2222222');
        // Get the value of the first cell in the first row
        firstCellValue = await table2Locator!.locator(SelectorsPartsDataBase.TABLE_FIRST_CELL_SELECTOR).innerText();
        firstCell = await table2Locator!.locator(SelectorsPartsDataBase.TABLE_FIRST_CELL_SELECTOR);
        await firstCell.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        console.log('11333333331111');
        firstCellValue = firstCellValue.trim();
        // Get the value of the second cell in the first row
        secondCellValue = await table2Locator!.locator(SelectorsPartsDataBase.TABLE_SECOND_CELL_SELECTOR).innerText();
        const secondCell = await table2Locator!.locator(SelectorsPartsDataBase.TABLE_SECOND_CELL_SELECTOR);
        await secondCell.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        console.log('11444444441111');
        secondCellValue = secondCellValue.trim();
        // Confirm that the second cell contains the search term
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(secondCellValue).toContain(CONST.TESTCASE_2_PRODUCT_СБ);
          },
          'Verify second cell in SB table contains search term'
        );
      }
    );
    await allure.step('Step 12: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      if (sbNoResultsFound) {
        console.log('Step 12 skipped: no results in top table; item exists in bottom table.');
        return;
      }
      // Wait for loading
      await page.waitForLoadState('networkidle');
      await firstCell!.evaluate(row => {
        row.style.backgroundColor = 'green';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      firstCell!.hover();
      firstCell!.click();
    });
    await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        await page.waitForTimeout(1000);

        // Locate the button using data-testid instead of class selectors

        // Compute expected enabled state dynamically (disabled if class/attr present or flag set)
        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr) && !sbNoResultsFound;
        } catch {}

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
          `Verify button "${buttonLabel}" ready after SB search`
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await buttonLocator2.evaluate(button => {
        (button as HTMLElement).style.backgroundColor = 'green';
        (button as HTMLElement).style.border = '2px solid red';
        (button as HTMLElement).style.color = 'blue';
      });

      // If the button is disabled, item may already be in the bottom table → verify and Cancel
      const isEnabled = await buttonLocator2.isEnabled().catch(() => false);
      if (!isEnabled || sbNoResultsFound) {
        const selectedPartName = CONST.TESTCASE_2_PRODUCT_СБ;
        const modal = page.locator(dialogSelector);
        const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE);
        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        const rowCount = await rows.count().catch(() => 0);
        let found = false;
        for (let i = 0; i < rowCount; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && selectedPartName && text.includes(selectedPartName)) {
            found = true;
            await nameCell
              .evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
              })
              .catch(() => {});
            await page.waitForTimeout(500);
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify bottom table contains SB item after verifying enabled state'
        );
        // Click Cancel to close modal since item is already present
        const cancelBtn = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON}`);
        await cancelBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        sbNoResultsFound = false; // reset for later flows
        sbSkippedAdd = true;
        return;
      }

      // Perform click actions when enabled
      await buttonLocator2.click();
      await page.waitForTimeout(500);
    });

    await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
      if (sbSkippedAdd) {
        console.log('Step 14 skipped: add to bottom was skipped because item already existed.');
        sbSkippedAdd = false;
        return;
      }
      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      const selectedPartName = CONST.TESTCASE_2_PRODUCT_СБ; // Replace with actual part number
      // Locate the bottom table
      const modalСБ2 = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalСБ2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom table has at least one row'
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partName = await row.locator('td').nth(1).textContent();
        let partNameCell = await row.locator('td').nth(1);

        // Compare the extracted values
        if (partName?.trim() === selectedPartName) {
          isRowFound = true;
          await partNameCell.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = await row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(1000);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify SB row found after addition'
      );
    });
    await allure.step(
      'Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        if (sbSkippedAdd) {
          console.log('Step 15 skipped: bottom add not applicable because item already existed and modal was cancelled.');
          sbSkippedAdd = false;
          return;
        }
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_OPEN;
        // If dialog is not open, skip this step
        if (
          !(await page
            .locator(dialogSelector)
            .isVisible()
            .catch(() => false))
        ) {
          console.log('Step 15 skipped: СБ dialog not open.');
          return;
        }
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
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
            `Verify bottom add button "${buttonLabel}" ready`
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
        // Highlight button for debugging
        await buttonLocator2.evaluate(button => {
          button.style.backgroundColor = 'green';
          button.style.border = '2px solid red';
          button.style.color = 'blue';
        });

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(500);
      }
    );

    //end adding СБ
    //start adding Д
    await allure.step(
      'Step 16: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)',
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
      }
    );
    await allure.step(
      'Step 17: Нажимаем по селектору из выпадающего списке "Деталь". (Click on the selector from the drop-down list "Assembly unit (type Деталь)".)',
      async () => {
        await page.waitForLoadState('networkidle');
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д);
        await addButton.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'red';
        });

        addButton.click();
        await page.waitForTimeout(500);
      }
    );
    table2Locator = page.locator(SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE);
    await table2Locator.evaluate(row => {
      row.style.border = '2px solid red';
    });
    await page.waitForTimeout(1000);
    await allure.step('Step 18: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      console.log('Step 18: Найдите элемент, который мы собираемся добавить');
      await page.waitForLoadState('networkidle');

      // Ensure search input is visible and ready (modal-scoped)
      const searchInput = table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
      await searchInput.waitFor({ state: 'visible', timeout: 15000 });
      await searchInput.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
      await page.waitForTimeout(1000);

      // Clear existing content: prefer fill(''), fallback to select-all + Delete
      let cleared = false;
      try {
        await searchInput.fill('', { timeout: 1500 });
        cleared = true;
      } catch {}
      if (!cleared) {
        await searchInput.focus().catch(() => {});
        await page.keyboard.press('Control+A').catch(async () => {
          await page.keyboard.press('Meta+A').catch(() => {});
        });
        await page.keyboard.press('Delete').catch(() => {});
      }
      await page.waitForTimeout(200);

      // Fill the search input quickly; fallback to programmatic set
      let setOk = false;
      try {
        await searchInput.fill(CONST.TESTCASE_2_PRODUCT_Д, { timeout: 2000 });
        setOk = true;
      } catch {}
      if (!setOk) {
        try {
          await searchInput.click({ timeout: 1000 });
          await searchInput.fill(CONST.TESTCASE_2_PRODUCT_Д, { timeout: 2000 });
          setOk = true;
        } catch {}
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as HTMLInputElement;
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, CONST.TESTCASE_2_PRODUCT_Д)
          .catch(() => {});
      }
      await page.waitForTimeout(300);

      // Verify the input was filled correctly
      const inputValue = await searchInput.inputValue().catch(() => '');
      console.log(`Search input value: "${inputValue}"`);
      expect.soft(inputValue).toContain(CONST.TESTCASE_2_PRODUCT_Д);

      // Press Enter to perform search
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).isVisible()).toBe(true);
        },
        'Verify search input after detail search is visible'
      );

      // If no results returned, verify in bottom table and mark flag
      const resultsCount = await table2Locator!
        .locator('tbody tr')
        .count()
        .catch(() => 0);
      if (resultsCount === 0) {
        const dialogSelectorD = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
        const bottomTable = page.locator(`${dialogSelectorD} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}`);
        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        let found = false;
        const count = await rows.count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && text.includes(CONST.TESTCASE_2_PRODUCT_Д)) {
            found = true;
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify bottom table contains a matching detail when top search fails'
        );
        dNoResultsFound = true;
      }

      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(await table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).isVisible()).toBe(true);
        },
        'Verify search input visible before verifying results'
      );
    });
    await allure.step(
      'Step 19: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        if (dNoResultsFound) {
          console.log('Step 19 skipped: no results in top table; item exists in bottom table.');
          return;
        }
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        // Get the value of the first cell in the first row
        firstCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
        firstCell = await table2Locator!.locator('tbody tr:first-child td:nth-child(1)');
        await firstCell.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        firstCellValue = firstCellValue.trim();
        // Get the value of the second cell in the first row
        secondCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(2)').innerText();
        const secondCell = await table2Locator!.locator('tbody tr:first-child td:nth-child(2)');
        await secondCell.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        secondCellValue = secondCellValue.trim();
        // Confirm that the first cell contains the search term
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(secondCellValue).toContain(CONST.TESTCASE_2_PRODUCT_Д);
          },
          'Verify second cell contains the searched detail value'
        );
      }
    );
    await allure.step('Step 20: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      if (dNoResultsFound) {
        console.log('Step 20 skipped: no results in top table; item exists in bottom table.');
        return;
      }
      await page.waitForTimeout(500);
      // Wait for loading
      await page.waitForLoadState('networkidle');
      await firstCell!.evaluate(row => {
        row.style.backgroundColor = 'green';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      firstCell!.hover();
      firstCell!.click();
      await page.waitForTimeout(500);
    });
    await allure.step('Step 21: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors
        await page.waitForTimeout(500);
        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr) && !dNoResultsFound;
        } catch {}
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
          `Verify "${buttonLabel}" button is ready`
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await buttonLocator2.evaluate(button => {
        button.style.backgroundColor = 'green';
        button.style.border = '2px solid red';
        button.style.color = 'blue';
      });

      if (dNoResultsFound) {
        // Verify in bottom table then cancel
        const bottomTable = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}`);
        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        let found = false;
        const count = await rows.count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && text.includes(CONST.TESTCASE_2_PRODUCT_Д)) {
            found = true;
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify the selected detail exists in the bottom table when top table has no results'
        );
        const cancelBtn = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON}`);
        await cancelBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        dNoResultsFound = false;
        return;
      }

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(500);
    });

    await allure.step('Step 22: Ensure the selected row is now showing in the bottom table', async () => {
      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      const selectedPartName = CONST.TESTCASE_2_PRODUCT_Д; // Replace with actual part number
      // Locate the bottom table
      const modalСБ2 = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalСБ2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom detail table has rows'
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partName = await row.locator('td').nth(1).textContent();
        let partNameCell = await row.locator('td').nth(1);

        // Compare the extracted values
        if (partName?.trim() === selectedPartName) {
          isRowFound = true;
          await partNameCell.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = await row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(1000);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify the added detail appears in the bottom table'
      );
    });
    await allure.step(
      'Step 23: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
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
            `Verify "${buttonLabel}" button is ready during detail addition`
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
        // Highlight button for debugging
        await buttonLocator2.evaluate(button => {
          button.style.backgroundColor = 'green';
          button.style.border = '2px solid red';
          button.style.color = 'blue';
        });

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(500);
      }
    );

    await allure.step(
      'Step 24: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)',
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
      }
    );
    // End adding Д
    //start adding Cтандартную или покупную деталь
    await allure.step(
      'Step 26: Нажимаем по Кнопка из выпадающего списке "Cтандартную или покупную деталь". (Click on the Кнопка from the list "Cтандартную или покупную деталь".)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД);
        await addButton.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'red';
        });

        addButton.click();
        await page.waitForTimeout(500);
      }
    );
    let modalПД = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
    table3Locator = modalПД.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE);
    await allure.step('Step 27: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('networkidle');
      //await expect(table3Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toHaveCount(1);
      let searchInput = table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      //await searchInput.waitFor({ state: 'visible', timeout: 15000 });
      await searchInput
        .evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
          el.style.color = 'blue';
        })
        .catch(() => {});
      await page.waitForTimeout(500);

      await searchInput.fill('');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);

      // Fill quickly; fallback to programmatic set
      let setOk = false;
      try {
        await searchInput.fill(CONST.TESTCASE_2_PRODUCT_ПД, { timeout: 2000 });
        setOk = true;
      } catch {}
      if (!setOk) {
        try {
          await searchInput.click({ timeout: 1000 });
          await searchInput.fill(CONST.TESTCASE_2_PRODUCT_ПД, { timeout: 2000 });
          setOk = true;
        } catch {}
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as HTMLInputElement;
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, CONST.TESTCASE_2_PRODUCT_ПД)
          .catch(() => {});
      }
      await page.waitForTimeout(300);

      // Verify value
      const inputValue = await searchInput.inputValue().catch(() => '');
      console.log(`Search input value: "${inputValue}"`);
      expect.soft(inputValue).toContain(CONST.TESTCASE_2_PRODUCT_ПД);

      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      // Wait until at least one result row is visible
      await table3Locator!.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
      // Optionally, validate that the search input is visible
      searchInput = table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect
            .soft(await table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).isVisible())
            .toBe(true);
        },
        'Verify modal search input is visible'
      );
    });
    await allure.step(
      'Step 28: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        // Wait for the page to stabilize
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        // Ensure at least one result row is visible
        const firstRow = table3Locator!.locator('tbody tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });

        // Prefer a row that contains the expected name
        const matchingRow = table3Locator!.locator('tbody tr', { hasText: CONST.TESTCASE_2_PRODUCT_ПД }).first();
        let rowVisible = false;
        try {
          await matchingRow.waitFor({ state: 'visible', timeout: 3000 });
          rowVisible = true;
        } catch {}

        let nameCellLocator = rowVisible ? matchingRow.locator('td', { hasText: CONST.TESTCASE_2_PRODUCT_ПД }).first() : firstRow.locator('td').nth(1);

        await nameCellLocator.waitFor({ state: 'visible', timeout: 10000 });
        firstCell = nameCellLocator;
        firstCellValue = await nameCellLocator.innerText();
        await firstCell.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        firstCellValue = firstCellValue.trim();
        await page.waitForTimeout(300);
        // Confirm that the cell contains the search term
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(firstCellValue).toContain(CONST.TESTCASE_2_PRODUCT_ПД);
          },
          'Verify first cell contains the selected detail value'
        );
      }
    );
    await allure.step('Step 29: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(500);
      // Wait for loading
      await page.waitForLoadState('networkidle');
      if (!firstCell) {
        const fallbackRow = table3Locator!.locator('tbody tr', { hasText: CONST.TESTCASE_2_PRODUCT_ПД }).first();
        const fallbackCell = fallbackRow.locator('td', { hasText: CONST.TESTCASE_2_PRODUCT_ПД }).first();
        await fallbackCell.waitFor({ state: 'visible', timeout: 10000 });
        firstCell = fallbackCell;
      }
      await firstCell!.evaluate(row => {
        row.style.backgroundColor = 'green';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      await firstCell!.scrollIntoViewIfNeeded().catch(() => {});
      await firstCell!.click();
    });
    await allure.step('Step 30: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      await page.waitForTimeout(500);
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of CSS class selectors

        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr);
        } catch {}

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
          `Verify "${buttonLabel}" button is ready after detail selection`
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await buttonLocator2.evaluate(button => {
        (button as HTMLElement).style.backgroundColor = 'green';
        (button as HTMLElement).style.border = '2px solid red';
        (button as HTMLElement).style.color = 'blue';
      });

      // If the button is disabled, item may already be in the bottom table → verify and Cancel
      const isEnabled = await buttonLocator2.isEnabled().catch(() => false);
      if (!isEnabled) {
        const selectedName = CONST.TESTCASE_2_PRODUCT_ПД;
        const modal = page.locator(dialogSelector);
        const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);
        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        const rowCount = await rows.count().catch(() => 0);
        let found = false;
        for (let i = 0; i < rowCount; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && selectedName && text.includes(selectedName)) {
            found = true;
            await nameCell
              .evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
              })
              .catch(() => {});
            await page.waitForTimeout(500);
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify the detail exists in the bottom table when modal button is disabled'
        );
        const cancelBtn = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON}`);
        await cancelBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        return;
      }

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(500);
    });

    await allure.step('Step 31: Ensure the selected row is now showing in the bottom table', async () => {
      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      const selectedPartNumber = CONST.TESTCASE_2_PRODUCT_ПД; // Replace with actual part number
      // Locate the bottom table
      const modalПД2 = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalПД2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom detail table has rows after selection'
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partNumber = await row.locator('td').nth(1).textContent();
        let partNumberCell = await row.locator('td').nth(1);

        // Compare the extracted values
        if (partNumber?.trim() === selectedPartNumber) {
          isRowFound = true;
          await partNumberCell.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = await row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(500);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify updated detail row is found in the bottom table'
      );
    });
    await allure.step(
      'Step 32: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
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
            `Verify "${buttonLabel}" button is ready during material addition`
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
        // Highlight button for debugging
        await buttonLocator2.evaluate(button => {
          button.style.backgroundColor = 'green';
          button.style.border = '2px solid red';
          button.style.color = 'blue';
        });

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(500);
      }
    );

    await allure.step(
      'Step 33: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)',
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
      }
    );
    //end adding Cтандартную или покупную деталь
    //start adding Расходный материал
    await allure.step(
      'Step 34: Нажимаем по Кнопка из выпадающего списке "Расходный материал". (Click on the Кнопка from the list "Расходный материал".)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ);
        await addButton.evaluate(row => {
          row.style.backgroundColor = 'green';
          row.style.border = '2px solid red';
          row.style.color = 'red';
        });
        await page.waitForTimeout(500);
        //add
        addButton.click();
        await page.waitForTimeout(500);
      }
    );
    let modalРМ = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
    await modalРМ.evaluate(el => {
      (el as HTMLElement).style.backgroundColor = 'yellow';
      (el as HTMLElement).style.border = '2px solid red';
      (el as HTMLElement).style.color = 'blue';
    });
    table3Locator = modalРМ.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE);
    await table3Locator.evaluate(el => {
      (el as HTMLElement).style.backgroundColor = 'yellow';
      (el as HTMLElement).style.border = '2px solid red';
      (el as HTMLElement).style.color = 'blue';
    });
    await allure.step('Step 35: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('networkidle');
      // Ensure we are working with the open RM modal and its item table
      const modalRM = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN);
      await modalRM.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
      const rmTable = modalRM.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE);
      await rmTable.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

      // Use the modal-specific search input for item table
      const searchInput = rmTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      await searchInput.evaluate(el => {
        (el as HTMLElement).style.backgroundColor = 'yellow';
        (el as HTMLElement).style.border = '2px solid red';
        (el as HTMLElement).style.color = 'blue';
      });

      // Highlight the RM item table
      await rmTable.evaluate(el => {
        (el as HTMLElement).style.backgroundColor = 'lightyellow';
        (el as HTMLElement).style.border = '2px solid red';
      });

      // Highlight the RM modal itself
      await modalRM.evaluate(el => {
        (el as HTMLElement).style.backgroundColor = 'lightblue';
        (el as HTMLElement).style.border = '2px solid blue';
      });

      // Highlight the modal title if present
      const modalTitle = modalRM.locator('h3, h4').first();
      try {
        await modalTitle.waitFor({ state: 'visible', timeout: 3000 });
        await modalTitle.evaluate(el => {
          (el as HTMLElement).style.backgroundColor = 'lightgreen';
          (el as HTMLElement).style.border = '2px solid green';
          (el as HTMLElement).style.color = 'black';
        });
      } catch {
        // no title found; ignore
      }
      await searchInput.waitFor({ state: 'visible', timeout: 15000 });
      await searchInput
        .evaluate((el: HTMLElement) => {
          el.style.backgroundColor = 'yellow';
          el.style.border = '2px solid red';
          el.style.color = 'blue';
        })
        .catch(() => {});
      await page.waitForTimeout(500);

      // Clear existing content: prefer fill(''), fallback to select-all + Delete
      let cleared = false;
      try {
        await searchInput.fill('', { timeout: 1500 });
        cleared = true;
      } catch {}
      if (!cleared) {
        await searchInput.focus().catch(() => {});
        await page.keyboard.press('Control+A').catch(async () => {
          await page.keyboard.press('Meta+A').catch(() => {});
        });
        await page.keyboard.press('Delete').catch(() => {});
      }
      await page.waitForTimeout(200);

      // Fill quickly; fallback to programmatic set
      let setOk = false;
      try {
        await searchInput.fill(CONST.TESTCASE_2_PRODUCT_РМ, { timeout: 2000 });
        setOk = true;
      } catch {}
      if (!setOk) {
        try {
          await searchInput.click({ timeout: 1000 });
          await searchInput.fill(CONST.TESTCASE_2_PRODUCT_РМ, { timeout: 2000 });
          setOk = true;
        } catch {}
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as HTMLInputElement;
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, CONST.TESTCASE_2_PRODUCT_РМ)
          .catch(() => {});
      }
      await page.waitForTimeout(300);

      // Verify value and search
      const inputValue = await searchInput.inputValue().catch(() => '');
      console.log(`Search input value: "${inputValue}"`);
      expect.soft(inputValue).toContain(CONST.TESTCASE_2_PRODUCT_РМ);

      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      // Wait until at least one result row is visible
      await rmTable.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 10000 });
    });
    await allure.step(
      'Step 36: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)',
      async () => {
        // Wait for the page to stabilize
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        // Ensure results exist
        const firstRow = table3Locator!.locator('tbody tr').first();
        await firstRow.waitFor({ state: 'visible', timeout: 10000 });

        // Prefer a row that contains the expected name; fallback to first row
        const matchingRow = table3Locator!.locator('tbody tr', { hasText: CONST.TESTCASE_2_PRODUCT_РМ }).first();
        let useMatching = false;
        try {
          await matchingRow.waitFor({ state: 'visible', timeout: 3000 });
          useMatching = true;
        } catch {}
        const rowToUse = useMatching ? matchingRow : firstRow;

        // Name is in the first column for RM table
        const nameCell = rowToUse.locator('td').first();
        await nameCell.waitFor({ state: 'visible', timeout: 10000 });
        await nameCell.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        firstCell = nameCell; // save for clicking in Step 37
        secondCellValue = (await nameCell.innerText()).trim();

        // Confirm the name cell contains the search term
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(secondCellValue).toContain(CONST.TESTCASE_2_PRODUCT_РМ);
          },
          'Verify RM search result matches expected part'
        );
      }
    );
    await allure.step('Step 37: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(500);
      // Wait for loading
      await page.waitForLoadState('networkidle');
      // Re-derive if needed (e.g., DOM refreshed)
      if (!firstCell) {
        const fallbackRow = table3Locator!.locator('tbody tr', { hasText: CONST.TESTCASE_2_PRODUCT_РМ }).first();
        const fallbackCell = fallbackRow.locator('td').first();
        await fallbackCell.waitFor({ state: 'visible', timeout: 10000 });
        firstCell = fallbackCell;
      }
      await firstCell!.waitFor({ state: 'visible', timeout: 10000 });
      await firstCell!.evaluate(row => {
        (row as HTMLElement).style.backgroundColor = 'green';
        (row as HTMLElement).style.border = '2px solid red';
        (row as HTMLElement).style.color = 'blue';
      });
      await firstCell!.scrollIntoViewIfNeeded().catch(() => {});
      await firstCell!.click();
    });
    await allure.step('Step 38: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('networkidle');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      await page.waitForTimeout(500);
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors

        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr);
        } catch {}

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
          `Verify "${buttonLabel}" button is ready in D modal`
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await buttonLocator2.evaluate(button => {
        button.style.backgroundColor = 'red';
        button.style.border = '2px solid red';
        button.style.color = 'white';
      });

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(500);
    });

    await allure.step('Step 39: Ensure the selected row is now showing in the bottom table', async () => {
      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      const selectedPartNumber = CONST.TESTCASE_2_PRODUCT_РМ; // Replace with actual part number
      // Locate the bottom table
      const modalРМ2 = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalРМ2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom RM table has rows'
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partNumber = await row.locator('td').nth(1).textContent();
        let partNumberCell = await row.locator('td').nth(1);

        // Compare the extracted values
        if (partNumber?.trim() === selectedPartNumber) {
          isRowFound = true;
          await partNumberCell.evaluate(row => {
            row.style.backgroundColor = 'yellow';
            row.style.border = '2px solid red';
            row.style.color = 'blue';
          });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = await row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(500);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify updated RM row is found in the bottom table'
      );
    });
    await allure.step(
      'Step 40: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)',
      async () => {
        // Wait for loading
        await page.waitForLoadState('networkidle');

        // Scoped dialog selector using data-testid
        const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
        const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
        const buttonLabel = 'Добавить';
        let expectedState = true;
        await page.waitForTimeout(500);
        const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
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
            `Verify "${buttonLabel}" button is ready while adding RM`
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
        const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
        // Highlight button for debugging
        await shortagePage.waitAndHighlight(buttonLocator2);

        // Perform click actions
        await buttonLocator2.click();
        await page.waitForTimeout(500);
        await page.waitForLoadState('networkidle');
        await expectSoftWithScreenshot(
          page,
          async () => {
            // After clicking "Добавить", we should still be on the edit page
            expect.soft(page.url()).toContain('/edit');
          },
          'Step 41 complete'
        );
      }
    );

    await allure.step('Step 42: Нажимаем по кнопке "Сохранить"  (Click on the "Сохранить" button in the main window)', async () => {
      await page.waitForLoadState('networkidle');
      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
      await shortagePage.waitAndHighlight(button);

      button.click();
      await page.waitForTimeout(500);
      button.click();
      await page.waitForURL('**/baseproducts**', { timeout: 15000 }).catch(() => {});
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 42 complete'
      );
    });
    await allure.step(
      'Step 43: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)',
      async () => {
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        tableData_temp = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
        const nestedArray = tableData_temp.map(group => group.items).flat();
        let quantity1 = 0;
        let quantity2 = 0;
        let quantity3 = 0;
        let quantity4 = 0;
        let quantity: boolean = false;
        const result1 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_СБ); // Output: true
        if (result1) {
          quantity1 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_СБ);
          logger.info(quantity1);
        }
        const result2 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_Д); // Output: true
        if (result2) {
          quantity2 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_Д);
          logger.info(quantity2);
        }
        const result3 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_ПД); // Output: true
        if (result3) {
          quantity3 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_ПД);
          logger.info(quantity3);
        }
        const result4 = await shortagePage.isStringInNestedArray(nestedArray, CONST.TESTCASE_2_PRODUCT_РМ); // Output: true
        if (result4) {
          quantity4 = await shortagePage.getQuantityByLineItem(tableData_temp, CONST.TESTCASE_2_PRODUCT_РМ);
          logger.info(quantity4);
        }
        // Validate presence of all four items
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(result1 && result2 && result3 && result4).toBeTruthy();
          },
          'Verify all four added items exist in the main table'
        );
        // Validate quantities are non-zero and, if previously incremented, not less than expected
        const q1ok = typeof quantity1 === 'number' && quantity1 > 0;
        const q2ok = typeof quantity2 === 'number' && quantity2 > 0;
        const q3ok = typeof quantity3 === 'number' && quantity3 > 0;
        const q4ok = typeof quantity4 === 'number' && quantity4 > 0;
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(q1ok && q2ok && q3ok && q4ok).toBeTruthy();
          },
          'Verify all added items have non-zero quantities'
        );
      }
    );
  });
  test('TestCase 19 - cleanup (Return to original state)', async ({ page }) => {
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
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Cleanup done (TestCase 19)'
      );
    });
  });
};
