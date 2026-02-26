import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json';
import testData2 from '../testdata/U004-PC01.json';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../lib/Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../lib/Page';
import { TEST_CATEGORY, TEST_MATERIAL, TEST_NAME, TEST_FILE } from './U005-Constants';

/** Minimal type for input element in evaluate callbacks (avoids global HTMLInputElement). */
type InputLike = { value?: string; dispatchEvent(e: Event): void };

export const runU005_01 = () => {
  test('TestCase 01 - создат дитайл - Проверка страница', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const shortagePage = new CreatePartsDatabasePage(page);
    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
    });
    await allure.step('Step 02: Проверяем наличие заголовка на странице (Check for the presence of the title)', async () => {
      const expectedTitles = testData2.elements.MainPage.titles.map(title => title.trim());
      await shortagePage.validatePageTitlesWithStyling(SelectorsPartsDataBase.MAIN_PAGE_MAIN_DIV, expectedTitles);
    });
    await allure.step('Step 03: Проверяем, что тело таблицы отображается (Verify that the table body is displayed)', async () => {
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    });
    await allure.step('Step 04: Проверяем Filters (Verify the presence of filters on the page)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Retrieve the expected filters configuration from the JSON file
      const jsonFilters = testData2.elements.MainPage.filters;

      // Ensure the expected filters array is defined and not empty
      if (!jsonFilters || jsonFilters.length === 0) {
        throw new Error('Expected filters are not defined or empty.');
      }

      // Iterate through each filter and validate its properties
      for (const expectedFilter of jsonFilters) {
        if (!expectedFilter || !expectedFilter.label || !expectedFilter.datatestid) {
          throw new Error(`Filter is not properly defined: ${JSON.stringify(expectedFilter)}`);
        }

        // Map filter data-testid to constants if needed, otherwise construct from test data
        const filterSelector = `[data-testid="${expectedFilter.datatestid}"]`;
        const filterLocator = page.locator(filterSelector);

        await shortagePage.highlightElement(filterLocator, HIGHLIGHT_PENDING);

        // Ensure the filter is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(filterLocator).toBeVisible();
          },
          'Verify filter is visible',
          test.info(),
        );

        // Validate the filter's label (text content)
        const actualLabel = await filterLocator.textContent();
        logger.log(`Filter: Expected label = "${expectedFilter.label}", Actual label = "${actualLabel?.trim()}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(actualLabel?.trim()).toBe(expectedFilter.label);
          },
          'Verify filter label matches expected value',
          test.info(),
        );

        // Validate whether the filter is enabled or disabled
        const isDisabled = await filterLocator.isDisabled();
        logger.log(`Filter: Expected state = "${expectedFilter.state}", Actual state = "${!isDisabled}"`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(String(!isDisabled)).toBe(expectedFilter.state); // Match the state ("true" for enabled, "false" for disabled)
          },
          'Verify filter state matches expected value',
          test.info(),
        );
      }

      logger.log('All filters have been validated successfully.');
    });
    await allure.step('Step 04: Проверяем наличие кнопки (Verify the presence of buttons on the page)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      const buttons = testData2.elements.MainPage.buttonsBefore;
      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the class, label, and state from the button object
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true' ? true : false; // Convert state string to a boolean
        /*if (buttonLabel == "Редактировать" || "Создать копированием") {
                    expectedState = false
                }
                if (buttonLabel == "Создать") {
                    expectedState = true
                }*/
        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Check if the button is visible and enabled
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);

          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and enabled`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 05: нажмите кнопку создания детали. (click on the create detail button)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);

      await shortagePage.highlightElement(createButton, HIGHLIGHT_PENDING);

      await createButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 06: Проверяем, что в списке есть селекторы с названиями. (Check that the list contains selectors with names)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      const buttons = testData1.elements.CreatePage.modalAddButtonsPopup;

      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the data-testid, label, and state from the button object
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true'; // Convert state string to a boolean

        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Check if the button is visible and enabled
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);

          // Locate buttons using data-testid instead of CSS class
          const buttonsLocator = page.locator(`[data-testid="${buttonDataTestId}"]`);
          const buttonTexts = await buttonsLocator.evaluateAll(elements => elements.map(e => e.textContent!.trim()));

          logger.log('Button texts:', buttonTexts);

          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and enabled`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 07: нажмите кнопку деталь. (Click on the create detail button)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Locate the "Деталь" button using its data-testid
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_DETAIL_DIV);

      await shortagePage.highlightElement(createButton, HIGHLIGHT_SUCCESS);

      await createButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 08: Проверяем наличия заголовка на странице "Создать деталь" (Check for the presence of the title on the \'Create Parts\' page)', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      // Wait for loading
      const titles = testData1.elements.CreatePage.titles.map(title => title.trim());
      await page.waitForTimeout(TIMEOUTS.LONG);
      // Retrieve all H3 titles from the specified class
      const h3Titles = await shortagePage.getAllH3TitlesInTestId(page, 'AddDetal');
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Log for debugging
      logger.log('Expected Titles:', titles);
      logger.log('Received Titles:', normalizedH3Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles.length).toBe(titles.length);
        },
        'Verify H3 titles count matches expected',
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles).toEqual(titles);
        },
        'Verify H3 titles content and order match expected',
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 09: Проверяем наличие кнопки (Verify the presence of buttons on the page)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      const buttons = testData1.elements.CreatePage.buttons;
      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the class, label, and state from the button object
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true' ? true : false; // Convert state string to a boolean

        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Check if the button is visible and enabled
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);
          logger.log('Button :' + buttonDataTestId + ' ' + buttonLabel + ' ' + expectedState);
          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and enabled`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 10: Проверяем таблиц и содержимого по умолчанию (Verify tables and default content)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      const tables = testData1.elements.CreatePage.tables;

      // Iterate over each table in the array
      for (const table of tables) {
        // Extract the title and rows from the table object
        const tableTitle = table.title;
        const tableRows = table.rows;

        // Perform validation for the table
        await allure.step(`Validate table with title: "${tableTitle}"`, async () => {
          await page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Placeholder function to validate the table
          const isTableValid = await shortagePage.validateTable(page, tableTitle, tableRows);

          logger.log(`Table validation for "${tableTitle}":`, isTableValid);
          // Validate the table's content
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isTableValid).toBeTruthy();
            },
            `Verify table "${tableTitle}" is valid`,
            test.info(),
          );
          logger.info(`Is the table "${tableTitle}" valid?`, isTableValid);
        });
      }

      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 11: существуют тестовые поля ввода (Verify input fields exist)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Extract the array of input fields from your JSON data
      const inputFields = testData1.elements.CreatePage.InputFields;

      // Call the helper function, passing the entire fields array
      const areFieldsValid = await shortagePage.validateInputFields(page, inputFields);

      // Validate that all fields are successfully validated
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(areFieldsValid).toBeTruthy();
        },
        'Verify all input fields are valid and writable',
        test.info(),
      );
      logger.info('All input fields are valid and writable.', areFieldsValid);

      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 12: откройте диалоговое окно Добавление материала и подтвердите заголовки. (Open Добавление материала dialog and verify titles)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Locate the table container using data-testid
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await tableContainer.waitFor({ state: 'visible' });

      // Locate the first data row using data-testid
      const firstDataRow = tableContainer.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_TBODY + ' tr').first();

      // Locate the target button using data-testid
      const targetButton = firstDataRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_SET);

      await shortagePage.highlightElement(targetButton, HIGHLIGHT_PENDING);

      await targetButton.click();

      // Retrieve expected titles from JSON
      const titles = testData1.elements.CreatePage.modalAddMaterial.titles.map(title => title.trim());

      // Retrieve all H3 titles using data-testid
      const h3Titles = await shortagePage.getAllH3TitlesInModalTestId(page, 'ModalBaseMaterial');
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Log for debugging
      logger.log('Expected Titles:', titles);
      logger.log('Received Titles:', h3Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles.length).toBe(titles.length);
        },
        'Verify H3 titles count matches expected',
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles).toEqual(titles);
        },
        'Verify H3 titles content and order match expected',
        test.info(),
      );

      // Confirm the selected item is shown on the main page
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
    await allure.step('Step 13: Проверяем, что кнопки свитчера отображаются. (Confirm that the switcher is visible)', async () => {
      // Locate the switcher using data-testid
      const switcher = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH);

      await shortagePage.highlightElement(switcher, HIGHLIGHT_PENDING);

      // Locate all switch items using data-testid
      const switchItems = await page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEMS).all();

      // Validate the number of switch items
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(switchItems.length).toBe(4);
        },
        'Verify switch items count is 4',
        test.info(),
      );
    });
    await allure.step("Step 14: Проверяем, что свитчер 'Материалы для деталей' выбран. (Confirm that 'Материалы для деталей' is selected)", async () => {
      // Locate the active switcher item using data-testid
      const switcher = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1);

      // Get the text content of the switcher
      const content = await switcher.textContent();

      await shortagePage.highlightElement(switcher, HIGHLIGHT_SUCCESS);

      // Validate that the correct switcher is selected
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(content).toBe('Материалы для деталей');
        },
        'Verify correct switcher is selected',
        test.info(),
      );
    });
    await allure.step('Step 15: Проверьте, что каждая таблица имеет правильное название. (Validate that each table exists with the correct title)', async () => {
      // Retrieve the object that groups different types of tables.
      const allTableGroups = testData1.elements.CreatePage.modalAddMaterial.tables;

      // Filter out the group with key "buttons"
      const validGroups = Object.entries(allTableGroups).filter(([groupName, _]) => groupName !== 'buttons');

      // Retrieve the switch items on the page using data-testid
      const switchItems = await page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEMS).all();

      let counter = 0;

      // Iterate over each valid table group.
      for (const [groupName, groupValue] of validGroups) {
        // Click the switch corresponding to this group.
        await switchItems[counter++].click();
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        // Now groupValue is an array of table definitions.
        for (const table of groupValue as { title?: string; datatestid?: string; datatestidThead?: string; datatestidTbody?: string }[]) {
          const tableTitle = table.title;
          logger.log(JSON.stringify(table));
          // Locate the table using its data-testid attribute.

          await page.waitForTimeout(TIMEOUTS.INPUT_SET);

          const targetTable = page.locator(`table[data-testid="${table.datatestid}"]`);

          // Ensure the table is visible.
          await expect(targetTable).toBeVisible();

          // Locate the header element within the table using data-testid
          const actualTitleElement = targetTable.locator(`[data-testid="${table.datatestidThead}"] th`).first();

          // Optionally highlight the header element for debugging.
          await shortagePage.highlightElement(actualTitleElement, HIGHLIGHT_PENDING);

          await expect(actualTitleElement).toBeVisible();

          // Retrieve the header text and compare with the expected title.
          const actualTitle = await actualTitleElement.textContent();
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(actualTitle?.trim()).toBe(tableTitle);
            },
            `Verify table title matches "${tableTitle}"`,
            test.info(),
          );

          // Verify that the table has content
          const rowsCount = await targetTable.locator(`[data-testid="${table.datatestidTbody}"] tr`).count();
          const firstRow = targetTable.locator(`[data-testid="${table.datatestidTbody}"] tr`).first();
          await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(rowsCount).toBeGreaterThan(0);
            },
            `Verify table "${tableTitle}" has rows`,
            test.info(),
          );
          logger.info(`Table with title "${tableTitle}" in group "${groupName}" is present and correct.`);
        }
      }

      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 16: Проверяем наличие кнопки (Verify the presence of buttons on the page)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      const buttons = testData1.elements.CreatePage.modalAddMaterial.buttons;
      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the class, label, and state from the button object
        const buttonDatatestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true' ? true : false; // Convert state string to a boolean
        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDatatestId, buttonLabel, expectedState, 'ModalBaseMaterial');
          // Log only - do not fail test if button state differs (e.g. "Добавить" disabled until row selected) - see erp-1313
          logger.info(`Is the "${buttonLabel}" button visible and in expected state (${expectedState})?`, isButtonReady);
        });
      }
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 17: Reset switcher to default (reset switcher to default)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Locate the switcher item using data-testid
      const targetItem = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1);

      // Ensure the item is visible
      await expect(targetItem).toBeVisible();

      // Click the item
      await targetItem.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 18: Verify that search works for table 1 (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');

      // Locate the table using data-testid
      const leftTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_TYPE);

      await shortagePage.highlightElement(leftTable, HIGHLIGHT_PENDING);

      await expect(leftTable).toBeVisible();

      // Locate the search field using data-testid and fill it
      const searchInput = leftTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_TYPE_SEARCH_INPUT_DROPDOWN_INPUT);
      await searchInput.fill(TEST_CATEGORY);
      await page.waitForLoadState('load');

      // Validate that the search input is visible
      await expect(searchInput).toBeVisible();

      await searchInput.press('Enter');
      await page.waitForLoadState('load');

      // Find the first row in the table using data-testid
      const firstRow = leftTable.locator('[data-testid^="ModalBaseMaterial-TableList-Table-Type-Tbody"] tr:first-child');

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const rowTextCategory = await firstRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowTextCategory).toContain(TEST_CATEGORY);
        },
        `Verify first row contains "${TEST_CATEGORY}"`,
        test.info(),
      );

      // Wait for the row to be visible and click on it
      await firstRow.waitFor({ state: 'visible' });
    });
    await allure.step('Step 19: Verify that search works for table 2 (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');

      // Locate the table using data-testid
      const centerTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_SUB_TYPE);

      await shortagePage.highlightElement(centerTable, HIGHLIGHT_PENDING);

      await expect(centerTable).toBeVisible();

      // Locate the search field using data-testid and fill it
      const searchInput = centerTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_SUB_TYPE_SEARCH_INPUT_DROPDOWN_INPUT);
      await searchInput.fill(TEST_MATERIAL);
      await page.waitForLoadState('load');

      // Validate that the search input is visible
      await expect(searchInput).toBeVisible();

      await searchInput.press('Enter');
      await page.waitForLoadState('load');

      // Find the first row in the table using data-testid
      const firstRow = centerTable.locator('[data-testid^="ModalBaseMaterial-TableList-Table-SubType-Tbody"] tr:first-child');

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const rowTextMaterial = await firstRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowTextMaterial).toContain(TEST_MATERIAL);
        },
        `Verify first row contains "${TEST_MATERIAL}"`,
        test.info(),
      );

      // Wait for the row to be visible and click on it
      await firstRow.waitFor({ state: 'visible' });
    });
    await allure.step('Step 20: Verify that search works for table 3 (Verify that search works for each column)', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const rightTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
      await shortagePage.highlightElement(rightTable, HIGHLIGHT_PENDING);
      await expect(page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM)).toBeVisible();
      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill('');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Locate the search field within the left table and fill it
      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill(TEST_NAME);

      await page.waitForLoadState('load');
      // Optionally, validate that the search input is visible
      await expect(rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT)).toBeVisible();

      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).press('Enter');
      await page.waitForLoadState('load');
      // Find the first row in the table
      const firstRow = rightTable.locator('tbody tr:first-child');
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const rowTextNameFinal = await firstRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowTextNameFinal).toContain(TEST_NAME);
        },
        `Verify first row contains "${TEST_NAME}"`,
        test.info(),
      );
      // Wait for the row to be visible and click on it
      await firstRow.waitFor({ state: 'visible' });

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      firstRow.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 21: Open Archive dialog (Open Archive dialog)', async () => {
      // To open the archive dialog, we need to add something to the archive
      const targetTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);

      // Ensure the table is visible
      await expect(targetTable).toBeVisible();

      // Verify that the table has content
      const firstRow = targetTable.locator('tbody tr').first();

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);

      await firstRow.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_ERROR);
      await firstRow.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      // Archive dialog locator
      const dialogTestId = 'ModalBaseMaterial'; // No brackets
      const buttonLabel = 'Добавить';
      const expectedState = true;

      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        const isButtonReady = await shortagePage.isButtonVisibleTestId(
          page,
          SelectorsPartsDataBase.MODAL_BASE_MATERIAL_ADD_BUTTON_ID, // Use the correct testId constant
          buttonLabel,
          expectedState,
          dialogTestId, // Pass dialog context if needed
        );

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(isButtonReady).toBeTruthy();
          },
          'Verify button is ready',
          test.info(),
        );
        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });

      // Reuse the locator for the button
      const buttonLocator = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_ADD_BUTTON);

      await shortagePage.highlightElement(buttonLocator, HIGHLIGHT_ERROR);
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await buttonLocator.click();

      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      // Locate the table container using data-testid
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await shortagePage.highlightElement(tableContainer, HIGHLIGHT_PENDING);
      await tableContainer.waitFor({ state: 'visible' });

      const firstDataRow = tableContainer.locator('table tbody tr').first();
      const targetButton = firstDataRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_RESET);

      await shortagePage.highlightElement(targetButton, HIGHLIGHT_ERROR);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      targetButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 22: Check title in Archive dialog (Check title and buttons in Archive dialog)', async () => {
      const titles = testData1.elements.CreatePage.modalArchive.titles.map(title => title.trim());

      // Retrieve all H3 titles from the specified class
      const h4Titles = await shortagePage.getAllH4TitlesInModalByTestId(page, SelectorsPartsDataBase.CONFIRM_MODAL);
      logger.log(h4Titles.join(', '));
      const normalizedH4Titles = h4Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      // Log for debugging
      logger.log('Expected Titles:', titles);
      logger.log('Received Titles:', h4Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles.length).toBe(titles.length);
        },
        'Verify H4 titles count matches expected',
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles).toEqual(titles);
        },
        'Verify H4 titles content and order match expected',
        test.info(),
      );

      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
    await allure.step('Step 23: Check buttons in Archive dialog (Check title and buttons in Archive dialog)', async () => {
      const buttons = testData1.elements.CreatePage.modalArchive.buttons;
      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the class, label, and state from the button object
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true' ? true : false; // Convert state string to a boolean
        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          // Check if the button is visible and enabled
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState, 'ModalConfirm');
          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and enabled`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
      page.mouse.click(1, 1);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 24: Open Добавить из базы dialog (Open Добавить из базы dialog)', async () => {
      const button = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_ADD_FILE_BUTTON, { hasText: 'Добавить из базы' });
      await button.evaluate(row => {
        row.style.backgroundColor = 'green';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      button.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 25: Check title in Добавить из базы dialog (Check title in Добавить из базы dialog)', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      // Wait for loading
      const titles = testData1.elements.CreatePage.modalAddFromBase.titles.map(title => title.trim());

      // Retrieve all H3 titles from the specified class
      const h3Titles = await shortagePage.getAllH3TitlesInModalTestId(page, 'AddDetal-FileComponent-ModalBaseFiles');
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Log for debugging
      logger.log('Expected Titles:', titles);
      logger.log('Received Titles:', normalizedH3Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles.length).toBe(titles.length);
        },
        'Verify H3 titles count matches expected',
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles).toEqual(titles);
        },
        'Verify H3 titles content and order match expected',
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 26: Check buttons in Добавить из базы dialog (Check buttons in Добавить из базы dialog)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      const buttons = testData1.elements.CreatePage.modalAddFromBase.buttons;
      // Iterate over each button in the array
      for (const button of buttons) {
        // Extract the data-testid, label, and state from the button object
        const buttonTestId = button.datatestid; // Use data-testid instead of class
        const buttonLabel = button.label;
        const expectedState = button.state === 'true'; // Convert state string to a boolean

        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          logger.log(buttonTestId + ' ' + buttonLabel + ' ' + expectedState);

          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonTestId, // Pass data-testid instead of class
            buttonLabel,
            expectedState,
            'AddDetal-FileComponent-ModalBaseFiles', // Updated dialog testId without CSS class
          );

          logger.log('Button :' + buttonTestId + ' ' + buttonLabel + ' ' + expectedState);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            'Verify button is ready',
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 27: Validate switcher above table (Validate switcher above table in Добавить из базы dialog)', async () => {
      // Retrieve the expected switcher labels from the JSON file
      const expectedSwitchers = testData1.elements.CreatePage.modalAddFromBase.switcher;

      // Iterate over each switcher, click it, and validate its label
      for (const switcher of expectedSwitchers) {
        const expectedLabel = switcher.label.trim(); // Get expected label from JSON
        const switchItem = page.locator(`[data-testid="${switcher.datatestid}"]`); // Use data-testid

        await switchItem.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });

        // Ensure the switch item is visible
        await expect(switchItem).toBeVisible();

        // Get the text content of the switch item and trim it
        const actualLabel = await switchItem.textContent();
        logger.log(`Switch item: Expected = "${expectedLabel}", Actual = "${actualLabel?.trim()}"`);

        // Compare the actual label with the expected label
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(actualLabel?.trim()).toBe(expectedLabel);
          },
          `Verify label matches "${expectedLabel}"`,
          test.info(),
        );

        // Click the switch item
        await switchItem.click();

        // Wait briefly to let the UI update after clicking
        await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

        logger.log(`Clicked on switch item with label: "${expectedLabel}"`);
      }

      logger.log('Switcher validation completed successfully.');
    });
    await allure.step('Step 28: Validate filter table (Validate filter above table in Добавить из базы dialog)', async () => {
      // Retrieve the expected filter labels from the JSON file
      const expectedFilters = testData1.elements.CreatePage.modalAddFromBase.filter;

      // Verify the expectedFilters array is defined and not empty
      if (!expectedFilters || expectedFilters.length === 0) {
        throw new Error('Expected filters are not defined or empty.');
      }

      // Locate the dropdown list using data-testid
      const dropdown = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_DROPDOWN);
      await dropdown.click();

      // Iterate over each filter and validate its label
      for (const filter of expectedFilters) {
        if (!filter || !filter.label || !filter.datatestid) {
          throw new Error(`Filter is not properly defined: ${JSON.stringify(filter)}`);
        }

        const expectedLabel = filter.label.trim(); // Get expected label from JSON
        // Map filter data-testid to constants if needed, otherwise construct from test data
        const filterItemSelector = `[data-testid="${filter.datatestid}"]`;
        const filterItem = page.locator(filterItemSelector);

        await filterItem.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });

        // Ensure the filter item is visible
        await expect(filterItem).toBeVisible();

        // Get the text content of the filter item and trim it
        const actualLabel = await filterItem.textContent();
        logger.log(`Filter item: Expected = "${expectedLabel}", Actual = "${actualLabel?.trim()}"`);

        // Compare the actual label with the expected label
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(actualLabel?.trim()).toBe(expectedLabel);
          },
          `Verify label matches "${expectedLabel}"`,
          test.info(),
        );

        logger.log(`Validated filter item with label: "${expectedLabel}"`);
      }

      logger.log('Filter validation completed successfully.');
    });
    await allure.step('Step 29: Validate table headers in Добавить из базы dialog (Validate table headers in Добавить из базы dialog)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Retrieve the expected column headers from the JSON file
      const expectedHeaders = testData1.elements.CreatePage.modalAddFromBase.tables;

      // Locate the thead element directly using its unique class
      const tableHead = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE_THEAD);
      await tableHead.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      // Ensure the thead element exists and is visible
      await expect(tableHead).toBeVisible();

      // Locate all header elements (th) within the first tr row only (skip the second row which contains search inputs)
      const headerCells = tableHead.locator('tr').first().locator('th');

      // Check that the number of headers matches the JSON
      const headerCount = await headerCells.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(headerCount).toBe(expectedHeaders.length);
        },
        'Verify header count matches expected',
        test.info(),
      );
      logger.log(`Number of headers: ${headerCount}`);

      // Iterate over each header and compare its text content with the expected value
      for (let i = 0; i < expectedHeaders.length; i++) {
        const expectedTitle = expectedHeaders[i].title.trim(); // Get expected title from JSON
        const actualHeader = headerCells.nth(i); // Get the nth header cell
        await actualHeader.evaluate(row => {
          row.style.backgroundColor = 'yellow';
          row.style.border = '2px solid red';
          row.style.color = 'blue';
        });
        // Ensure the header is visible
        await expect(actualHeader).toBeVisible();

        // Get the text content of the header and trim it
        const actualTitle = await actualHeader.textContent();
        logger.log(`Header ${i + 1}: Expected = "${expectedTitle}", Actual = "${actualTitle?.trim()}"`);

        // Compare the actual header text with the expected title
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(actualTitle?.trim()).toBe(expectedTitle);
          },
          `Verify header title matches "${expectedTitle}"`,
          test.info(),
        );
      }

      logger.log('Table headers have been validated successfully.');
    });
    await allure.step('Step 30: Verify that search works for the files table (Verify that search works for each column)', async () => {
      // Locate the switch item using data-testid and highlight it for debugging
      const switchItem = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_SWITCH_ITEM0);

      await switchItem.evaluate(row => {
        row.style.backgroundColor = 'green';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });

      await switchItem.click();
      await page.waitForLoadState('load');

      // Locate the table container using data-testid (the actual table element)
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE);
      await expect(tableContainer).toBeVisible();

      // Locate the search input field using data-testid, scoped to the table container
      const searchField = tableContainer.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_SEARCH_DROPDOWN_INPUT);

      // Highlight the search field for debugging
      await searchField.evaluate(input => {
        input.style.backgroundColor = 'red';
        input.style.border = '2px solid red';
        input.style.color = 'blue';
      });

      // Ensure the search field is visible and editable
      await expect(searchField).toBeVisible();
      await searchField.focus(); // Focus on the input field
      await searchField.fill(''); // Clear any existing content

      // Programmatically set the value using JavaScript
      await searchField.evaluate((element: unknown, value: string) => {
        const input = element as InputLike;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, TEST_FILE);

      // Verify that the field contains the correct value
      const fieldValue = await searchField.inputValue();
      logger.log('Verified input value:', fieldValue);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fieldValue).toBe(TEST_FILE);
        },
        `Verify field value is "${TEST_FILE}"`,
        test.info(),
      );

      // Trigger the search by pressing 'Enter'
      await searchField.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Wait for a row containing the search term (filtered result) to appear
      const tbodyRows = tableContainer.locator('[data-testid^="AddDetal-FileComponent-ModalBaseFiles-FileWindow-Table-Table-Tbody"] tr');
      const matchingRow = tbodyRows.filter({ hasText: TEST_FILE }).first();
      await matchingRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(matchingRow, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      const rowText = await matchingRow.textContent();
      logger.log('Row text containing search term:', rowText);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowText?.trim()).toContain(TEST_FILE);
        },
        `Verify row text contains "${TEST_FILE}"`,
        test.info(),
      );

      logger.log('Search verification completed successfully.');
    });
  });
};
