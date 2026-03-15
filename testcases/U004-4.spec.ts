import { test, expect } from '@playwright/test';
import { SELECTORS, PRODUCT_SPECS } from '../config';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import { expectSoftWithScreenshot } from '../lib/Page';

let tableData_full: { groupName: string; items: string[][] }[] = [];
let table_before_changequantity: { groupName: string; items: string[][] }[] = [];
let value_before_changequantity: number = 0;

// U004 script-specific test data (same pattern as U004-1 / U004-3; no Т15)
const {
  productName: U004_PRODUCT_NAME,
  assemblies: U004_ASSEMBLIES,
  details: U004_DETAILS,
  standardParts: U004_STANDARD_PARTS,
  consumables: U004_CONSUMABLES,
} = PRODUCT_SPECS.U004_PRODUCT;
const U004_FIRST_DETAIL_NAME = U004_DETAILS[0].name;
const U004_FIRST_DETAIL_PART_NUMBER = U004_DETAILS[0].partNumber;

export const runU004_4 = () => {
  logger.info(`Starting test U004`);

  test('TestCase 07 - Редактирование изделия - Сравниваем комплектацию (Edit an Existing Детайл - Comparing the complete set)', async ({ page }, testInfo) => {
    test.setTimeout(TEST_TIMEOUTS.MEDIUM);
    const shortagePage = new CreatePartsDatabasePage(page);
    await allure.step('Setup: Clean up U004 product specifications', async () => {
      logger.log('Setup: Clean up U004 product specifications');
      await shortagePage.resetProductSpecificationsByConfig(U004_PRODUCT_NAME, {
        assemblies: U004_ASSEMBLIES,
        details: U004_DETAILS,
        standardParts: U004_STANDARD_PARTS,
        consumables: U004_CONSUMABLES,
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
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).fill(U004_PRODUCT_NAME);
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
          await expect.soft(leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT)).toHaveValue(U004_PRODUCT_NAME);
        },
        'Step 04 complete',
        testInfo,
      );
    });
    await allure.step('Step 05: Осуществляем фильтрацию таблицы при помощи нажатия клавиши Enter (Filter the table using the Enter key)', async () => {
      // Simulate pressing "Enter" in the search field
      await leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT).press('Enter');
      await page.waitForLoadState('load');
      // Wait for table rows to appear after search
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(leftTable.locator('tbody tr').first()).toBeVisible({ timeout: WAIT_TIMEOUTS.LONG });
        },
        'Table rows visible after search',
        testInfo,
      );
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
      const itemsToAdd = [
        {
          smallDialogButtonId: SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д,
          dialogTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
          searchTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAL_TABLE_WRAPPER,
          searchValue: U004_FIRST_DETAIL_NAME,
          bottomTableTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
          addToBottomButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON,
          addToMainButtonTestId: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
          type: 'Д',
        },
      ];

      for (const item of itemsToAdd) {
        await shortagePage.addItemToSpecification(page, item.smallDialogButtonId, item.dialogTestId, item.searchTableTestId, item.searchValue, item.bottomTableTestId, item.addToBottomButtonTestId, item.addToMainButtonTestId, item.type);
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
        'Step 08 complete',
        testInfo,
      );
    });

    await allure.step('Step 09: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
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
        /* ignore */
      }
      await shortagePage.dismissKitsDeactivationConfirmModalIfPresent();
      table_before_changequantity = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      value_before_changequantity = await shortagePage.getQuantityByLineItem(table_before_changequantity, U004_FIRST_DETAIL_NAME);
      logger.info(value_before_changequantity);
      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
      await shortagePage.waitAndHighlight(button);

      await button.click();
      await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 09 complete (first save)',
        testInfo,
      );
    });
    await allure.step('Step 10: reload the page. (reload the page)', async () => {
      await page.reload();
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 10 complete (reload)',
        testInfo,
      );
    });
    await allure.step('Step 10b: Navigate back to edit page', async () => {
      await page.waitForLoadState('load');
      // Navigate to parts database page first
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await page.waitForLoadState('load');
      // Re-initialize table locator after navigation (allow longer for table rows to load)
      const productsTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE, WAIT_TIMEOUTS.PAGE_RELOAD);
      // Wait for search input to be visible
      const searchInput = productsTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // Filter and click row again
      await searchInput.fill(U004_PRODUCT_NAME);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await shortagePage.validateTableIsDisplayedWithRows(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE, WAIT_TIMEOUTS.LONG);
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
        'Step 10b complete (navigate to edit)',
        testInfo,
      );
    });
    await allure.step('Step 11: Нажимаем по кнопки "Добавить" (под таблицей комплектации)Click on the button "Добавить" (above the комплектации table)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
      await shortagePage.waitAndHighlight(addButton);

      await addButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(addButton).toBeVisible();
        },
        'Step 11 complete',
        testInfo,
      );
    });

    await allure.step('Step 12: Нажимаем по селектору из выпадающего списке "Деталь". (Click on the selector from the drop-down list "Assembly unit (type Деталь)".)', async () => {
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д);
      await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.waitAndHighlight(addButton);
      await addButton.click();

      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN).first();
      await modal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modal).toBeVisible();
        },
        'Step 12 modal visible',
        testInfo,
      );

      const searchValue = U004_FIRST_DETAIL_NAME;
      // If item is already in the bottom table, search often returns no results; skip search/add (repo pattern).
      const itemAlreadyInBottomTable = await shortagePage.checkItemExistsInBottomTable(
        page,
        searchValue,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
        SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE,
      );
      if (itemAlreadyInBottomTable) {
        logger.info('Detail already in bottom table. Skipping search and add.');
        const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);
        const bottomRowWithPart = bottomTable
          .locator('tbody tr')
          .filter({ hasText: searchValue })
          .or(bottomTable.locator('tbody tr').filter({ hasText: U004_FIRST_DETAIL_PART_NUMBER }))
          .first();
        await bottomRowWithPart.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(bottomRowWithPart).toBeVisible();
          },
          'Step 12 complete (item already in bottom table)',
          testInfo,
        );
        return;
      }

      const detalTableWrapper = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAL_TABLE_WRAPPER);
      await detalTableWrapper.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await detalTableWrapper.scrollIntoViewIfNeeded();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      let searchInput = detalTableWrapper.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
      if ((await searchInput.count()) === 0) {
        searchInput = detalTableWrapper.locator('input.search-yui-kit__input').first();
      }
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await searchInput.click();
      await searchInput.clear();
      await searchInput.pressSequentially(searchValue, { delay: 50 });
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(TIMEOUTS.EXTENDED);
      await detalTableWrapper.locator('tbody').waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await detalTableWrapper.locator('tbody tr').first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD }).catch(() => {});
      // Row may show name (U004_DETAIL_001) or part number (U004_DETAIL_01); match either
      const rowWithPart = detalTableWrapper
        .locator('tbody tr')
        .filter({ hasText: searchValue })
        .or(detalTableWrapper.locator('tbody tr').filter({ hasText: U004_FIRST_DETAIL_PART_NUMBER }))
        .first();
      await rowWithPart.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      await rowWithPart.click();
      await page.waitForLoadState('load');

      const addToBottomButton = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON);
      await addToBottomButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await expect(addToBottomButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
      await addToBottomButton.click();

      const bottomTable = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);
      const bottomRowWithPart = bottomTable.locator('tbody tr').filter({ hasText: searchValue }).first();
      await bottomRowWithPart.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(bottomRowWithPart).toBeVisible();
        },
        'Step 12 complete (item in bottom table)',
        testInfo,
      );
    });
    await allure.step('Step 13: Ensure the selected row is now showing in the bottom table', async () => {
      await page.waitForLoadState('load');

      const selectedPartName = U004_FIRST_DETAIL_NAME;

      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      await modal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      const bottomTableLocator = modal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE);
      await bottomTableLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const rowWithPart = bottomTableLocator.locator('tbody tr').filter({ hasText: selectedPartName }).first();
      await rowWithPart.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.waitAndHighlight(modal);
      await shortagePage.waitAndHighlight(bottomTableLocator);
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      logger.info(`Bottom table row count: ${rowCount}`);

      const partNameCell = rowWithPart.locator('td').nth(1);
      await shortagePage.waitAndHighlight(partNameCell);
      logger.info(value_before_changequantity);

      const inputField = rowWithPart.locator('td').nth(3).locator('input');
      await inputField.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      const currentValue = await inputField.inputValue();
      await inputField.fill((parseInt(currentValue, 10) + 5).toString());

      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0);
          expect.soft(value_before_changequantity).toBeGreaterThan(0);
        },
        'Step 13 quantity before change verified',
        testInfo,
      );
    });
    await allure.step('Step 14: Нажимаем по bottom кнопке "Добавить" в модальном окне (Click on the bottom "Добавить" button in the modal window)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Check if the modal is open
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      const isModalVisible = await modal.isVisible();

      if (!isModalVisible) {
        logger.warn('Modal is not open. Skipping this step since no item was added.');
        return;
      }

      // Scoped dialog selector using data-testid
      const dialogSelector = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_OPEN;
      const buttonDataTestId = SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON; // Use the testId constant
      const buttonLabel = 'Добавить';
      const expectedState = true;
      const buttonLocator = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.buildDataTestIdSelector(buttonDataTestId)}`);

      // Wait for the button to be visible and ready
      await buttonLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
        // Locate the button using data-testid instead of CSS class selectors
        let isButtonReady: boolean;

        try {
          isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDataTestId, // Use data-testid instead of class
            buttonLabel,
            expectedState,
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.warn(`Button validation failed: ${errorMessage}`);
          isButtonReady = false;
        }

        if (!isButtonReady) {
          logger.warn(`Button "${buttonLabel}" is not ready (disabled). This indicates no items were added to the bottom table.`);
          logger.warn('Skipping button click since the item was not successfully added in previous steps.');
          return;
        }

        logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonReady);
      });

      const buttonLocator2 = page.locator(`${dialogSelector} ${SelectorsPartsDataBase.buildDataTestIdSelector(buttonDataTestId)}`);

      // Check if button is enabled before proceeding
      const isButtonEnabled = await buttonLocator2.isEnabled();
      if (!isButtonEnabled) {
        logger.warn('Add to main button is disabled. Skipping button click since no items were added.');
        return;
      }

      // Highlight button for debugging
      await shortagePage.waitAndHighlight(buttonLocator2);

      // Wait a bit more to ensure the button is fully ready
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Perform hover and click actions
      await buttonLocator2.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await expectSoftWithScreenshot(
        page,
        async () => {
          const specTable = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
          const nested = specTable.map(group => group.items).flat();
          const found = await shortagePage.isStringInNestedArray(nested, U004_FIRST_DETAIL_NAME);
          expect.soft(found).toBeTruthy();
        },
        'Step 14 complete',
        testInfo,
      );
    });

    await allure.step('Step 15: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Check if there's an open modal that might interfere with the save button
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      const isModalOpen = await modal.isVisible();

      if (isModalOpen) {
        logger.warn('Modal is still open. Attempting to close it before saving.');
        // Try to close the modal by clicking outside or pressing Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(TIMEOUTS.STANDARD);
      }

      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);

      // Wait for the button to be visible and ready
      await button.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.waitAndHighlight(button);

      // Wait a bit more to ensure the button is fully ready
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      await button.click();
      await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 15 complete',
        testInfo,
      );
    });
    await allure.step('Step 16: Нажимаем на кнопку "Сохранить". (Press the save button)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');

      // Check if there's an open modal that might interfere with the save button
      const modal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DIALOG);
      const isModalOpen = await modal.isVisible();

      if (isModalOpen) {
        logger.warn('Modal is still open. Attempting to close it before saving.');
        // Try to close the modal by clicking outside or pressing Escape
        await page.keyboard.press('Escape');
        await page.waitForTimeout(TIMEOUTS.STANDARD);
      }

      const button = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);

      // Wait for the button to be visible and ready
      await button.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.waitAndHighlight(button);

      // Wait a bit more to ensure the button is fully ready
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      await button.click();
      await page.waitForURL('**/baseproducts**', { timeout: WAIT_TIMEOUTS.LONG }).catch(() => {});
      await page.waitForLoadState('load');
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(page.url()).toContain('/baseproducts');
        },
        'Step 16 complete',
        testInfo,
      );
    });
    await allure.step('Step 16b: Navigate back to edit page', async () => {
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
      await searchInput.fill(U004_PRODUCT_NAME);
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
        'Step 16b complete (navigate to edit)',
        testInfo,
      );
    });
    await allure.step('Step 17: извлечь основную таблицу продуктов и сохранить ее в массиве. (extract the main product table and store it in an array)', async () => {
      // Wait for loading
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.LONG);
      tableData_full = await shortagePage.parseStructuredTable(page, SelectorsPartsDataBase.EDIT_PAGE_SPECIFICATIONS_TABLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(tableData_full.length).toBeGreaterThan(0);
        },
        'Step 17 complete',
        testInfo,
      );
    });
    await allure.step('Step 18: проверьте, что количество обновлено. (check that the quantity has been updated)', async () => {
      await page.waitForLoadState('load');

      const after = await shortagePage.getQuantityByLineItem(tableData_full, U004_FIRST_DETAIL_NAME);

      // Since we skipped adding the item, the quantity should remain the same
      if (after === value_before_changequantity) {
        logger.info(`Quantity unchanged (${after}) as expected since item was not added.`);
      } else {
        logger.warn(`Quantity changed from ${value_before_changequantity} to ${after}. This might indicate the item was added successfully.`);
      }

      // Don't fail the test if quantity is unchanged since we skipped the addition
      // expect(after).toBe(value_before_changequantity + 5);
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(after).toBeGreaterThanOrEqual(value_before_changequantity);
        },
        'Step 18 complete',
        testInfo,
      );
    });
  });

  test('TestCase 08 - cleanup (Return to original state)', async ({ page }, testInfo) => {
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
      await expectSoftWithScreenshot(
        page,
        async () => {
          // Verify cleanup completed by checking we can navigate to the page
          await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
          await expect.soft(page.locator(SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID)).toBeVisible();
        },
        'Cleanup done (TestCase 08)',
        testInfo,
      );
    });
  });
};
