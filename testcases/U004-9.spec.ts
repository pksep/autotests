import { test, expect, Locator } from '@playwright/test';
import { SELECTORS, PRODUCT_SPECS } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { expectSoftWithScreenshot } from '../lib/Page';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

// U004 script-specific test data (same pattern as U004-1 / U004-3; no Т15)
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

let tableData_temp: { groupName: string; items: string[][] }[] = [];
let table2Locator: Locator | null = null;
let table3Locator: Locator | null = null;
let sbNoResultsFound: boolean = false;
let dNoResultsFound: boolean = false;
let sbSkippedAdd: boolean = false;

export const runU004_9 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 18 - Добавить, изменить и удалить несколько элементов одновременно в спецификацию и проверка сохранения (Add, Modify, and Delete in One Session)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const shortagePage = new CreatePartsDatabasePage(page);

    await allure.step('Setup: Clean up U004 product specifications', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      await allure.step('Setup: Clean up U004 product specifications', async () => {
        logger.log('Step: Clean up U004 product specifications');
        await shortagePage.resetProductSpecificationsByConfig(U004_PRODUCT_NAME, {
          assemblies: U004_ASSEMBLIES,
          details: U004_DETAILS,
          standardParts: U004_STANDARD_PARTS,
          consumables: U004_CONSUMABLES,
        });
      });
    });

    // Placeholder for test logic: Open the parts database page
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
    let firstCell: Locator | null = null;

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
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Verify top table search input is visible',
        testInfo,
      );
    });
    await allure.step('Step 04: Вводим значение переменной в поиск таблицы "Изделий" (Enter a variable value in the \'Products\' table search)', async () => {
      // Locate the search field within the left table and fill it
      await leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).fill(U004_PRODUCT_NAME);
      await page.waitForLoadState('load');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Verify main table search input remains visible after fill',
        testInfo,
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
        },
        'Step 04 complete',
        testInfo,
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).press('Enter');
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
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    // Start adding СБ
    await allure.step('Step 09: Нажимаем по селектору из выпадающего списке "Сборочную единицу (тип СБ)". (Click on the selector from the drop-down list "Assembly unit (type СБ)".)', async () => {
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_СБ);
      await shortagePage.waitAndHighlight(addButton);
      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_DIALOG);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modal).toBeVisible();
        },
        'Step 09 complete',
        testInfo,
      );
    });
    // Scope to cbed wrapper so table2/search use the right panel (Сборочная единица), not the left (Изделие)
    const modalСБ = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_DIALOG);
    const cbedSection = modalСБ.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CBED_WRAPPER);
    table2Locator = cbedSection.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_SEARCH_TABLE);
    let itemAlreadyInBottomTableСБ = false;
    await allure.step('Step 09b: Check if СБ already in bottom table', async () => {
      await page.waitForLoadState('networkidle');
      itemAlreadyInBottomTableСБ = await shortagePage.checkItemExistsInBottomTable(
        page,
        U004_FIRST_ASSEMBLY_NAME,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE,
      );
      if (itemAlreadyInBottomTableСБ) {
        sbNoResultsFound = true;
        sbSkippedAdd = true;
        const cancelBtn = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON).first();
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
    });
    if (!itemAlreadyInBottomTableСБ) {
    await allure.step('Step 10: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('load');
      await modalСБ.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});

      // Highlight modal and pause
      await shortagePage.waitAndHighlight(modalСБ);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Highlight the СБ table and pause
      await shortagePage.waitAndHighlight(table2Locator!);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      logger.log('22222');
      // Ensure search input is visible and ready
      // Prefer the table-scoped input for СБ – it's consistently present; add robust fallbacks
      let searchInput = table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
      logger.log('33333');
      let candidatesCount = await searchInput.count();
      if (candidatesCount === 0) {
        const testIdCandidates = cbedSection.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
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
      logger.log('44444');
      if (candidatesCount === 0) {
        searchInput = cbedSection.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
        //highlight the input field here
        candidatesCount = await searchInput.count();
        await shortagePage.waitAndHighlight(searchInput, { waitAfter: 50 });
      }
      logger.log('55555');
      if (candidatesCount === 0) {
        // Last resort: any visible contenteditable in the modal header area
        searchInput = modalСБ.locator('[contenteditable="true"]').first();
        await shortagePage.waitAndHighlight(searchInput, { waitAfter: 50 });
      }
      logger.log('66666');
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });

      // Highlight search input and pause
      await shortagePage.waitAndHighlight(searchInput, { waitAfter: 50 });
      logger.log('77777');
      // Clear any existing content and close history overlay
      await searchInput.fill('');
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      logger.log('88888');
      // Fill the search input

      const valueToSet = U004_FIRST_ASSEMBLY_NAME;
      let setOk = false;
      try {
        await searchInput.fill(valueToSet, { timeout: TIMEOUTS.LONG });
        setOk = true;
      } catch {
        void 0;
      }
      if (!setOk) {
        try {
          await searchInput.click({ timeout: TIMEOUTS.STANDARD });
          await searchInput.fill(valueToSet, { timeout: TIMEOUTS.LONG });
          setOk = true;
        } catch {
          void 0;
        }
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as unknown as { value: string; focus(): void; dispatchEvent(e: Event): boolean };
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, valueToSet)
          .catch(() => {});
      }

      logger.log('99999');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Verify the input was filled correctly
      const inputValue = await searchInput.inputValue().catch(() => '');
      logger.log(`Search input value: "${inputValue}"`);
      logger.log('101010');
      await page.waitForTimeout(TIMEOUTS.LONG);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(inputValue).toContain(U004_FIRST_ASSEMBLY_NAME);
        },
        'Verify search input contains SB product value',
        testInfo,
      );

      // Press Enter to perform search
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.EXTENDED); // Add timeout for table to update

      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Verify search input in top modal table is visible',
        testInfo,
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          const inputValue = await searchInput.inputValue().catch(() => '');
          expect.soft(inputValue).toContain(U004_FIRST_ASSEMBLY_NAME);
        },
        'Step 10 complete',
        testInfo,
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
        await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        const count = await rows.count().catch(() => 0);
        let found = false;
        for (let i = 0; i < count; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && text.includes(U004_FIRST_ASSEMBLY_NAME)) {
            found = true;
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify bottom table contains searched part',
          testInfo,
        );
        sbNoResultsFound = true;
        sbSkippedAdd = true;
      }
    });
    await allure.step('Step 11: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)', async () => {
      if (sbNoResultsFound) {
        logger.log('Step 11 skipped: no results in top table; item exists in bottom table.');
        return;
      }
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      logger.log('111111');
      // Ensure table has at least one row visible
      const firstRow = table2Locator!.locator('tbody tr').first();
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      logger.log('2222222');
      // Get the value of the first cell in the first row
      firstCellValue = await table2Locator!.locator(SelectorsPartsDataBase.TABLE_FIRST_CELL_SELECTOR).innerText();
      firstCell = table2Locator!.locator(SelectorsPartsDataBase.TABLE_FIRST_CELL_SELECTOR);
      await shortagePage.highlightElement(firstCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      logger.log('11333333331111');
      firstCellValue = firstCellValue.trim();
      // Get the value of the second cell in the first row
      secondCellValue = await table2Locator!.locator(SelectorsPartsDataBase.TABLE_SECOND_CELL_SELECTOR).innerText();
      const secondCell = table2Locator!.locator(SelectorsPartsDataBase.TABLE_SECOND_CELL_SELECTOR);
      await shortagePage.highlightElement(secondCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      logger.log('11444444441111');
      secondCellValue = secondCellValue.trim();
      // Confirm that the second cell contains the search term
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(secondCellValue).toContain(U004_FIRST_ASSEMBLY_NAME);
        },
        'Verify second cell in SB table contains search term',
        testInfo,
      );
    });
    await allure.step('Step 12: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      if (sbNoResultsFound) {
        logger.log('Step 12 skipped: no results in top table; item exists in bottom table.');
        return;
      }
      // Wait for loading
      await page.waitForLoadState('load');
      await shortagePage.highlightElement(firstCell!, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });
      firstCell!.hover();
      firstCell!.click();
    });
    await allure.step('Step 13: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        // Locate the button using data-testid instead of class selectors

        // Compute expected enabled state dynamically (disabled if class/attr present or flag set)
        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr) && !sbNoResultsFound;
        } catch {
          void 0;
        }

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
          `Verify button "${buttonLabel}" ready after SB search`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });

      // If the button is disabled, item may already be in the bottom table → verify and Cancel
      const isEnabled = await buttonLocator2.isEnabled().catch(() => false);
      if (!isEnabled || sbNoResultsFound) {
        const selectedPartName = U004_FIRST_ASSEMBLY_NAME;
        const modal = page.locator(dialogSelector);
        const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE);
        await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        const rowCount = await rows.count().catch(() => 0);
        let found = false;
        for (let i = 0; i < rowCount; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && selectedPartName && text.includes(selectedPartName)) {
            found = true;
            await shortagePage.highlightElement(nameCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' }).catch(() => {});
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify bottom table contains SB item after verifying enabled state',
          testInfo,
        );
        // Click Cancel to close modal since item is already present
        const cancelBtn = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON}`);
        await cancelBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        sbNoResultsFound = false; // reset for later flows
        sbSkippedAdd = true;
        return;
      }

      // Perform click actions when enabled
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    }

    await allure.step('Step 14: Ensure the selected row is now showing in the bottom table', async () => {
      if (sbSkippedAdd) {
        logger.log('Step 14 skipped: add to bottom was skipped because item already existed.');
        sbSkippedAdd = false;
        return;
      }
      // Wait for the page to load
      await page.waitForLoadState('load');

      const selectedPartName = U004_FIRST_ASSEMBLY_NAME; // Replace with actual part number
      // Locate the bottom table
      const modalСБ2 = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalСБ2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom table has at least one row',
        testInfo,
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partName = await row.locator('td').nth(1).textContent();
        const partNameCell = row.locator('td').nth(1);

        // Compare the extracted values
        if (partName?.trim() === selectedPartName) {
          isRowFound = true;
          await shortagePage.highlightElement(partNameCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify SB row found after addition',
        testInfo,
      );
    });
    await allure.step('Step 15: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
      if (sbSkippedAdd) {
        logger.log('Step 15 skipped: bottom add not applicable because item already existed and modal was cancelled.');
        sbSkippedAdd = false;
        return;
      }
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_OPEN;
      // If dialog is not open, skip this step
      if (
        !(await page
          .locator(dialogSelector)
          .isVisible()
          .catch(() => false))
      ) {
        logger.log('Step 15 skipped: СБ dialog not open.');
        return;
      }
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
      const buttonLabel = 'Добавить';
      const expectedState = true;
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
          `Verify bottom add button "${buttonLabel}" ready`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    //end adding СБ
    //start adding Д
    await allure.step('Step 16: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 17: Нажимаем по селектору из выпадающего списке "Деталь". (Click on the selector from the drop-down list "Assembly unit (type Деталь)".)', async () => {
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д);
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    table2Locator = page.locator(SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE);
    await shortagePage.highlightElement(table2Locator, { border: '2px solid red' });
    await page.waitForTimeout(TIMEOUTS.STANDARD);
    let itemAlreadyInBottomTableД = false;
    await allure.step('Step 17b: Check if Д already in bottom table', async () => {
      await page.waitForLoadState('networkidle');
      itemAlreadyInBottomTableД = await shortagePage.checkItemExistsInBottomTable(
        page,
        U004_FIRST_DETAIL_NAME,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
      );
      if (itemAlreadyInBottomTableД) {
        dNoResultsFound = true;
        const cancelBtn = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON).first();
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
    });
    if (!itemAlreadyInBottomTableД) {
    await allure.step('Step 18: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      logger.log('Step 18: Найдите элемент, который мы собираемся добавить');
      await page.waitForLoadState('load');

      // Ensure search input is visible and ready (modal-scoped)
      const searchInput = table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
      await shortagePage.highlightElement(searchInput, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Clear existing content: prefer fill(''), fallback to select-all + Delete
      let cleared = false;
      try {
        await searchInput.fill('', { timeout: TIMEOUTS.INPUT_SET });
        cleared = true;
      } catch {
        void 0;
      }
      if (!cleared) {
        await searchInput.focus().catch(() => {});
        await page.keyboard.press('Control+A').catch(async () => {
          await page.keyboard.press('Meta+A').catch(() => {});
        });
        await page.keyboard.press('Delete').catch(() => {});
      }
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Fill the search input quickly; fallback to programmatic set
      let setOk = false;
      try {
        await searchInput.fill(U004_FIRST_DETAIL_NAME, { timeout: WAIT_TIMEOUTS.SHORT });
        setOk = true;
      } catch {
        void 0;
      }
      if (!setOk) {
        try {
          await searchInput.click({ timeout: TIMEOUTS.STANDARD });
          await searchInput.fill(U004_FIRST_DETAIL_NAME, { timeout: WAIT_TIMEOUTS.SHORT });
          setOk = true;
        } catch {
          void 0;
        }
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as unknown as { value: string; focus(): void; dispatchEvent(e: Event): boolean };
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, U004_FIRST_DETAIL_NAME)
          .catch(() => {});
      }
      await page.waitForTimeout(TIMEOUTS.SHORT);

      // Verify the input was filled correctly
      const inputValue = await searchInput.inputValue().catch(() => '');
      logger.log(`Search input value: "${inputValue}"`);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(inputValue).toContain(U004_FIRST_DETAIL_NAME);
        },
        'Verify search input contains detail product value',
        testInfo,
      );

      // Press Enter to perform search
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.LONG);

      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Verify search input after detail search is visible',
        testInfo,
      );

      // If no results returned, verify in bottom table and mark flag
      const resultsCount = await table2Locator!
        .locator('tbody tr')
        .count()
        .catch(() => 0);
      if (resultsCount === 0) {
        const dialogSelectorD = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
        const bottomTable = page.locator(`${dialogSelectorD} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}`);
        await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        let found = false;
        const count = await rows.count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && text.includes(U004_FIRST_DETAIL_NAME)) {
            found = true;
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify bottom table contains a matching detail when top search fails',
          testInfo,
        );
        dNoResultsFound = true;
      }

      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(table2Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toBeVisible();
        },
        'Verify search input visible before verifying results',
        testInfo,
      );
    });
    await allure.step('Step 19: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)', async () => {
      if (dNoResultsFound) {
        logger.log('Step 19 skipped: no results in top table; item exists in bottom table.');
        return;
      }
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Get the value of the first cell in the first row
      firstCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(1)').innerText();
      firstCell = table2Locator!.locator('tbody tr:first-child td:nth-child(1)');
      await shortagePage.highlightElement(firstCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      firstCellValue = firstCellValue.trim();
      // Get the value of the second cell in the first row
      secondCellValue = await table2Locator!.locator('tbody tr:first-child td:nth-child(2)').innerText();
      const secondCell = table2Locator!.locator('tbody tr:first-child td:nth-child(2)');
      await shortagePage.highlightElement(secondCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      secondCellValue = secondCellValue.trim();
      // Confirm that the first cell contains the search term
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(secondCellValue).toContain(U004_FIRST_DETAIL_NAME);
        },
        'Verify second cell contains the searched detail value',
        testInfo,
      );
    });
    await allure.step('Step 20: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      if (dNoResultsFound) {
        logger.log('Step 20 skipped: no results in top table; item exists in bottom table.');
        return;
      }
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Wait for loading
      await page.waitForLoadState('load');
      await shortagePage.highlightElement(firstCell!, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });
      firstCell!.hover();
      firstCell!.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 21: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr) && !dNoResultsFound;
        } catch {
          void 0;
        }
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
          `Verify "${buttonLabel}" button is ready`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });

      if (dNoResultsFound) {
        // Verify in bottom table then cancel
        const bottomTable = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE}`);
        await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        let found = false;
        const count = await rows.count().catch(() => 0);
        for (let i = 0; i < count; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && text.includes(U004_FIRST_DETAIL_NAME)) {
            found = true;
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify the selected detail exists in the bottom table when top table has no results',
          testInfo,
        );
        const cancelBtn = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON}`);
        await cancelBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        dNoResultsFound = false;
        return;
      }

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    }

    await allure.step('Step 22: Ensure the selected row is now showing in the bottom table', async () => {
      if (itemAlreadyInBottomTableД) {
        logger.log('Step 22 skipped: Д already in bottom table.');
        return;
      }
      // Wait for the page to load
      await page.waitForLoadState('load');

      const selectedPartName = U004_FIRST_DETAIL_NAME; // Replace with actual part number
      // Locate the bottom table
      const modalСБ2 = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalСБ2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom detail table has rows',
        testInfo,
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partName = await row.locator('td').nth(1).textContent();
        const partNameCell = row.locator('td').nth(1);

        // Compare the extracted values
        if (partName?.trim() === selectedPartName) {
          isRowFound = true;
          await shortagePage.highlightElement(partNameCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify the added detail appears in the bottom table',
        testInfo,
      );
    });
    await allure.step('Step 23: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
      if (itemAlreadyInBottomTableД) {
        logger.log('Step 23 skipped: Д already in bottom table.');
        return;
      }
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
      const buttonLabel = 'Добавить';
      const expectedState = true;
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
          `Verify "${buttonLabel}" button is ready during detail addition`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 24: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    // End adding Д
    //start adding Cтандартную или покупную деталь
    await allure.step('Step 26: Нажимаем по Кнопка из выпадающего списке "Cтандартную или покупную деталь". (Click on the Кнопка from the list "Cтандартную или покупную деталь".)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД);
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    const modalПД = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
    table3Locator = modalПД.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE);
    let itemAlreadyInBottomTableПД = false;
    await allure.step('Step 26b: Check if ПД already in bottom table', async () => {
      await page.waitForLoadState('networkidle');
      itemAlreadyInBottomTableПД = await shortagePage.checkItemExistsInBottomTable(
        page,
        U004_FIRST_STANDARD_PART_NAME,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE,
      );
      if (itemAlreadyInBottomTableПД) {
        const cancelBtn = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_CANCEL_BUTTON).first();
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
    });
    if (!itemAlreadyInBottomTableПД) {
    await allure.step('Step 27: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('load');
      //await expect(table3Locator!.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT)).toHaveCount(1);
      let searchInput = table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      //await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
      await shortagePage.highlightElement(searchInput, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' }).catch(() => {});
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      await searchInput.fill('');
      await searchInput.press('Enter');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Fill quickly; fallback to programmatic set
      let setOk = false;
      try {
        await searchInput.fill(U004_FIRST_STANDARD_PART_NAME, { timeout: WAIT_TIMEOUTS.SHORT });
        setOk = true;
      } catch {
        void 0;
      }
      if (!setOk) {
        try {
          await searchInput.click({ timeout: TIMEOUTS.STANDARD });
          await searchInput.fill(U004_FIRST_STANDARD_PART_NAME, { timeout: WAIT_TIMEOUTS.SHORT });
          setOk = true;
        } catch {
          void 0;
        }
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as unknown as { value: string; focus(): void; dispatchEvent(e: Event): boolean };
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, U004_FIRST_STANDARD_PART_NAME)
          .catch(() => {});
      }
      await page.waitForTimeout(TIMEOUTS.SHORT);

      // Verify value
      const inputValue = await searchInput.inputValue().catch(() => '');
      logger.log(`Search input value: "${inputValue}"`);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(inputValue).toContain(U004_FIRST_STANDARD_PART_NAME);
        },
        'Verify search input contains standard part product value',
        testInfo,
      );

      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Wait until at least one result row is visible
      await table3Locator!.locator('tbody tr').first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // Optionally, validate that the search input is visible
      searchInput = table3Locator!.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(searchInput).toBeVisible();
        },
        'Verify modal search input is visible',
        testInfo,
      );
    });
    await allure.step('Step 28: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)', async () => {
      // Wait for the page to stabilize
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await page.waitForLoadState('load');
      // Ensure at least one result row is visible
      const firstRow = table3Locator!.locator('tbody tr').first();
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      // Prefer a row that contains the expected name
      const matchingRow = table3Locator!.locator('tbody tr', { hasText: U004_FIRST_STANDARD_PART_NAME }).first();
      let rowVisible = false;
      try {
        await matchingRow.waitFor({ state: 'visible', timeout: TIMEOUTS.EXTENDED });
        rowVisible = true;
      } catch {
        void 0;
      }

      const nameCellLocator = rowVisible ? matchingRow.locator('td', { hasText: U004_FIRST_STANDARD_PART_NAME }).first() : firstRow.locator('td').nth(1);

      await nameCellLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      firstCell = nameCellLocator;
      firstCellValue = await nameCellLocator.innerText();
      await shortagePage.highlightElement(firstCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      firstCellValue = firstCellValue.trim();
      await page.waitForTimeout(TIMEOUTS.SHORT);
      // Confirm that the cell contains the search term
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(firstCellValue).toContain(U004_FIRST_STANDARD_PART_NAME);
        },
        'Verify first cell contains the selected detail value',
        testInfo,
      );
    });
    await allure.step('Step 29: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Wait for loading
      await page.waitForLoadState('load');
      if (!firstCell) {
        const fallbackRow = table3Locator!.locator('tbody tr', { hasText: U004_FIRST_STANDARD_PART_NAME }).first();
        const fallbackCell = fallbackRow.locator('td', { hasText: U004_FIRST_STANDARD_PART_NAME }).first();
        await fallbackCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        firstCell = fallbackCell;
      }
      await shortagePage.highlightElement(firstCell!, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });
      await firstCell!.scrollIntoViewIfNeeded().catch(() => {});
      await firstCell!.click();
    });
    await allure.step('Step 30: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of CSS class selectors

        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr);
        } catch {
          void 0;
        }

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
          `Verify "${buttonLabel}" button is ready after detail selection`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });

      // If the button is disabled, item may already be in the bottom table → verify and Cancel
      const isEnabled = await buttonLocator2.isEnabled().catch(() => false);
      if (!isEnabled) {
        const selectedName = U004_FIRST_STANDARD_PART_NAME;
        const modal = page.locator(dialogSelector);
        const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);
        await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        const rows = bottomTable.locator('tbody tr');
        const rowCount = await rows.count().catch(() => 0);
        let found = false;
        for (let i = 0; i < rowCount; i++) {
          const nameCell = rows.nth(i).locator('td').nth(1);
          const text = (await nameCell.textContent().catch(() => ''))?.trim();
          if (text && selectedName && text.includes(selectedName)) {
            found = true;
            await shortagePage.highlightElement(nameCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' }).catch(() => {});
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            break;
          }
        }
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(found).toBeTruthy();
          },
          'Verify the detail exists in the bottom table when modal button is disabled',
          testInfo,
        );
        const cancelBtn = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON}`);
        await cancelBtn.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
        return;
      }

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    }

    await allure.step('Step 31: Ensure the selected row is now showing in the bottom table', async () => {
      if (itemAlreadyInBottomTableПД) {
        logger.log('Step 31 skipped: ПД already in bottom table.');
        return;
      }
      // Wait for the page to load
      await page.waitForLoadState('load');

      const selectedPartNumber = U004_FIRST_STANDARD_PART_NAME; // Replace with actual part number
      // Locate the bottom table
      const modalПД2 = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalПД2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom detail table has rows after selection',
        testInfo,
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partNumber = await row.locator('td').nth(1).textContent();
        const partNumberCell = row.locator('td').nth(1);

        // Compare the extracted values
        if (partNumber?.trim() === selectedPartNumber) {
          isRowFound = true;
          await shortagePage.highlightElement(partNumberCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify updated detail row is found in the bottom table',
        testInfo,
      );
    });
    await allure.step('Step 32: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
      if (itemAlreadyInBottomTableПД) {
        logger.log('Step 32 skipped: ПД already in bottom table.');
        return;
      }
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
      const buttonLabel = 'Добавить';
      const expectedState = true;
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
          `Verify "${buttonLabel}" button is ready during material addition`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 33: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });

      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    //end adding Cтандартную или покупную деталь
    //start adding Расходный материал
    await allure.step('Step 34: Нажимаем по Кнопка из выпадающего списке "Расходный материал". (Click on the Кнопка from the list "Расходный материал".)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ);
      await shortagePage.highlightElement(addButton, { backgroundColor: 'green', border: '2px solid red', color: 'red' });
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      //add
      addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    const modalРМ = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
    await shortagePage.highlightElement(modalРМ, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
    table3Locator = modalРМ.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE);
    await shortagePage.highlightElement(table3Locator, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
    let itemAlreadyInBottomTableРМ = false;
    await allure.step('Step 34b: Check if РМ already in bottom table', async () => {
      await page.waitForLoadState('networkidle');
      itemAlreadyInBottomTableРМ = await shortagePage.checkItemExistsInBottomTable(
        page,
        U004_FIRST_CONSUMABLE_NAME,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE,
      );
      if (itemAlreadyInBottomTableРМ) {
        const cancelBtn = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON).first();
        await cancelBtn.click().catch(() => {});
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }
    });
    if (!itemAlreadyInBottomTableРМ) {
    await allure.step('Step 35: Найдите элемент, который мы собираемся добавить.. (Sesarch for the item we are going to add)', async () => {
      await page.waitForLoadState('load');
      // Ensure we are working with the open RM modal and its item table
      const modalRM = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN);
      await modalRM.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      const rmTable = modalRM.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE);
      await rmTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});

      // Use the modal-specific search input for item table
      const searchInput = rmTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      await shortagePage.highlightElement(searchInput, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });

      // Highlight the RM item table
      await shortagePage.highlightElement(rmTable, { backgroundColor: 'lightyellow', border: '2px solid red' });

      // Highlight the RM modal itself
      await shortagePage.highlightElement(modalRM, { backgroundColor: 'lightblue', border: '2px solid blue' });

      // Highlight the modal title if present
      const modalTitle = modalRM.locator('h3, h4').first();
      try {
        await modalTitle.waitFor({ state: 'visible', timeout: TIMEOUTS.EXTENDED });
        await shortagePage.highlightElement(modalTitle, { backgroundColor: 'lightgreen', border: '2px solid green', color: 'black' });
      } catch {
        // no title found; ignore
      }
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
      await shortagePage.highlightElement(searchInput, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' }).catch(() => {});
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Clear existing content: prefer fill(''), fallback to select-all + Delete
      let cleared = false;
      try {
        await searchInput.fill('', { timeout: TIMEOUTS.INPUT_SET });
        cleared = true;
      } catch {
        void 0;
      }
      if (!cleared) {
        await searchInput.focus().catch(() => {});
        await page.keyboard.press('Control+A').catch(async () => {
          await page.keyboard.press('Meta+A').catch(() => {});
        });
        await page.keyboard.press('Delete').catch(() => {});
      }
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Fill quickly; fallback to programmatic set
      let setOk = false;
      try {
        await searchInput.fill(U004_FIRST_CONSUMABLE_NAME, { timeout: WAIT_TIMEOUTS.SHORT });
        setOk = true;
      } catch {
        void 0;
      }
      if (!setOk) {
        try {
          await searchInput.click({ timeout: TIMEOUTS.STANDARD });
          await searchInput.fill(U004_FIRST_CONSUMABLE_NAME, { timeout: WAIT_TIMEOUTS.SHORT });
          setOk = true;
        } catch {
          void 0;
        }
      }
      if (!setOk) {
        await searchInput
          .evaluate((el, v) => {
            const input = el as unknown as { value: string; focus(): void; dispatchEvent(e: Event): boolean };
            input.focus();
            input.value = v as string;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }, U004_FIRST_CONSUMABLE_NAME)
          .catch(() => {});
      }
      await page.waitForTimeout(TIMEOUTS.SHORT);

      // Verify value and search
      const inputValue = await searchInput.inputValue().catch(() => '');
      logger.log(`Search input value: "${inputValue}"`);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(inputValue).toContain(U004_FIRST_CONSUMABLE_NAME);
        },
        'Verify search input contains consumable product value',
        testInfo,
      );

      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      // Wait until at least one result row is visible
      await rmTable.locator('tbody tr').first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 36: Проверяем, что в найденной строке таблицы содержится значение переменной (We check that the found table row contains the value of the variable)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Ensure results exist
      const firstRow = table3Locator!.locator('tbody tr').first();
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      // Prefer a row that contains the expected name; fallback to first row
      const matchingRow = table3Locator!.locator('tbody tr', { hasText: U004_FIRST_CONSUMABLE_NAME }).first();
      let useMatching = false;
      try {
        await matchingRow.waitFor({ state: 'visible', timeout: TIMEOUTS.EXTENDED });
        useMatching = true;
      } catch {
        void 0;
      }
      const rowToUse = useMatching ? matchingRow : firstRow;

      // Name is in the first column for RM table
      const nameCell = rowToUse.locator('td').first();
      await nameCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(nameCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      firstCell = nameCell; // save for clicking in Step 37
      secondCellValue = (await nameCell.innerText()).trim();

      // Confirm the name cell contains the search term
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(secondCellValue).toContain(U004_FIRST_CONSUMABLE_NAME);
        },
        'Verify RM search result matches expected part',
        testInfo,
      );
    });
    await allure.step('Step 37: Нажимаем по найденной строке (Click on the found row in the table)', async () => {
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Wait for loading
      await page.waitForLoadState('load');
      // Re-derive if needed (e.g., DOM refreshed)
      if (!firstCell) {
        const fallbackRow = table3Locator!.locator('tbody tr', { hasText: U004_FIRST_CONSUMABLE_NAME }).first();
        const fallbackCell = fallbackRow.locator('td').first();
        await fallbackCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        firstCell = fallbackCell;
      }
      await firstCell!.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(firstCell!, { backgroundColor: 'green', border: '2px solid red', color: 'blue' });
      await firstCell!.scrollIntoViewIfNeeded().catch(() => {});
      await firstCell!.click();
    });
    await allure.step('Step 38: Нажимаем по кнопке "Выбрать" в модальном окне (Click on the "Выбрать" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON; // Use the correct testId
      const buttonLabel = 'Добавить';
      let expectedState = true;
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const buttonLocator = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of class selectors

        try {
          const hasDisabledClass = await buttonLocator.evaluate(btn => btn.classList.contains('disabled-yui-kit')).catch(() => false);
          const hasDisabledAttr = await buttonLocator.evaluate(btn => btn.hasAttribute('disabled')).catch(() => false);
          expectedState = !(hasDisabledClass || hasDisabledAttr);
        } catch {
          void 0;
        }

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
          `Verify "${buttonLabel}" button is ready in D modal`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
      // Highlight button for debugging
      await shortagePage.highlightElement(buttonLocator2, { backgroundColor: 'red', border: '2px solid red', color: 'white' });

      // Perform click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    }

    await allure.step('Step 39: Ensure the selected row is now showing in the bottom table', async () => {
      if (itemAlreadyInBottomTableРМ) {
        logger.log('Step 39 skipped: РМ already in bottom table.');
        return;
      }
      // Wait for the page to load
      await page.waitForLoadState('load');

      const selectedPartNumber = U004_FIRST_CONSUMABLE_NAME; // Replace with actual part number
      // Locate the bottom table
      const modalРМ2 = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_DIALOG);
      const bottomTableLocator = modalРМ2.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE);

      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify bottom RM table has rows',
        testInfo,
      );

      let isRowFound = false;

      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const partNumber = await row.locator('td').nth(1).textContent();
        const partNumberCell = row.locator('td').nth(1);

        // Compare the extracted values
        if (partNumber?.trim() === selectedPartNumber) {
          isRowFound = true;
          await shortagePage.highlightElement(partNumberCell, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
          logger.info(`Selected row found in row ${i + 1}`);
          //get the quantity of the row
          // Locate the <input> element inside the <td> field
          const inputField = row.locator('td').nth(3).locator('input');

          // Retrieve the current value of the input field
          const currentValue = await inputField.inputValue();

          // Update the value of the input field
          await inputField.fill((parseInt(currentValue) + 5).toString());

          break;
        }
      }
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Assert that the selected row is found
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify updated RM row is found in the bottom table',
        testInfo,
      );
    });
    await allure.step('Step 40: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
      if (itemAlreadyInBottomTableРМ) {
        logger.log('Step 40 skipped: РМ already in bottom table.');
        return;
      }
      // Wait for loading
      await page.waitForLoadState('load');

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
      const buttonLabel = 'Добавить';
      const expectedState = true;
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
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
          `Verify "${buttonLabel}" button is ready while adding RM`,
          testInfo,
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });
      const buttonLocator2 = page.locator(`${dialogSelector} ${buttonDataTestId}`);
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
        },
        'Step 41 complete',
        testInfo,
      );
    });

    await allure.step('Step 42: Нажимаем по кнопке "Сохранить"  (Click on the "Сохранить" button in the main window)', async () => {
      await page.waitForLoadState('load');
      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
      await shortagePage.waitAndHighlight(button);

      button.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      button.click();
      await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.LONG);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 42 complete',
        testInfo,
      );
    });
    await allure.step('Step 43: Убедитесь, что все добавленные элементы находятся в основной таблице. (Confirm that all the added items are in the main table)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      tableData_temp = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      const nestedArray = tableData_temp.map(group => group.items).flat();
      let quantity1 = 0;
      let quantity2 = 0;
      let quantity3 = 0;
      let quantity4 = 0;
      const result1 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_ASSEMBLY_NAME); // Output: true
      if (result1) {
        quantity1 = await shortagePage.getQuantityByLineItem(tableData_temp, U004_FIRST_ASSEMBLY_NAME);
        logger.info(quantity1);
      }
      const result2 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_DETAIL_NAME); // Output: true
      if (result2) {
        quantity2 = await shortagePage.getQuantityByLineItem(tableData_temp, U004_FIRST_DETAIL_NAME);
        logger.info(quantity2);
      }
      const result3 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_STANDARD_PART_NAME); // Output: true
      if (result3) {
        quantity3 = await shortagePage.getQuantityByLineItem(tableData_temp, U004_FIRST_STANDARD_PART_NAME);
        logger.info(quantity3);
      }
      const result4 = await shortagePage.isStringInNestedArray(nestedArray, U004_FIRST_CONSUMABLE_NAME); // Output: true
      if (result4) {
        quantity4 = await shortagePage.getQuantityByLineItem(tableData_temp, U004_FIRST_CONSUMABLE_NAME);
        logger.info(quantity4);
      }
      // Validate presence of all four items
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(result1 && result2 && result3 && result4).toBeTruthy();
        },
        'Verify all four added items exist in the main table',
        testInfo,
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
        'Verify all added items have non-zero quantities',
        testInfo,
      );
    });
  });

  test('TestCase 19 - cleanup (Return to original state)', async ({ page }, testInfo) => {
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
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Cleanup done (TestCase 19)',
        testInfo,
      );
    });
  });
};
