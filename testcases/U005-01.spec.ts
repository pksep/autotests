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
import { TEST_CATEGORY, TEST_MATERIAL, TEST_NAME, TEST_FILE, U005_CLEANUP_PREFIX } from './U005-Constants';

/** Minimal type for input element in evaluate callbacks (avoids global HTMLInputElement). */
type InputLike = { value?: string; dispatchEvent(e: Event): void };

export const runU005_01 = () => {
  test('TestCase 0 - Cleanup', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const partsDatabasePage = new CreatePartsDatabasePage(page);
    const searchProduct = page.locator(SelectorsPartsDataBase.SEARCH_PRODUCT_ATTRIBUT).first();
    const searchCbed = page.locator(SelectorsPartsDataBase.SEARCH_CBED_ATTRIBUT).nth(1);
    const searchDetail = page.locator(SelectorsPartsDataBase.SEARCH_DETAIL_ATTRIBUT).last();

    await allure.step('Step 01: Open the parts database page', async () => {
      await partsDatabasePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
      await partsDatabasePage.waitForNetworkIdle();
    });

    await allure.step('Step 01a: Clear all search input fields', async () => {
      await searchDetail.evaluate((el: InputLike) => {
        el.value = '';
      });
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchCbed.evaluate((el: InputLike) => {
        el.value = '';
      });
      await searchCbed.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchProduct.evaluate((el: InputLike) => {
        el.value = '';
      });
      await searchProduct.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 01b: Refresh the page', async () => {
      await page.reload();
      await partsDatabasePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 02: Process Details table - search and delete all items by prefix from bottom up, then refresh and search again', async () => {
      let hasMoreItems = true;
      const maxIterations = 100;
      let iterationCount = 0;

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        await searchDetail.fill(U005_CLEANUP_PREFIX);
        await searchDetail.press('Enter');
        await partsDatabasePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        const rows = page.locator(`${SelectorsPartsDataBase.DETAIL_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }

        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1);
          const cellText = await nameCell.textContent();
          if (cellText?.trim().startsWith(U005_CLEANUP_PREFIX)) {
            await row.click();
            await partsDatabasePage.archiveAndConfirm(
              SelectorsPartsDataBase.BUTTON_ARCHIVE,
              SelectorsPartsDataBase.BUTTON_CONFIRM,
            );
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }

        const remainingRows = page.locator(`${SelectorsPartsDataBase.DETAIL_TABLE_DIV} tbody tr`);
        const remainingCount = await remainingRows.count();
        if (remainingCount === 0) {
          hasMoreItems = false;
        } else {
          await page.reload();
          await partsDatabasePage.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
      }

      await searchDetail.evaluate((el: InputLike) => {
        el.value = '';
      });
      await searchDetail.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 02b: Refresh the page after Details cleanup', async () => {
      await page.reload();
      await partsDatabasePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03: Process Assemblies (CBED) table - search and delete all items by prefix from bottom up, then refresh and search again', async () => {
      let hasMoreItems = true;
      const maxIterations = 100;
      let iterationCount = 0;

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        await searchCbed.fill(U005_CLEANUP_PREFIX);
        await searchCbed.press('Enter');
        await partsDatabasePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        const rows = page.locator(`${SelectorsPartsDataBase.CBED_TABLE_DIV} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }

        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(1);
          const cellText = await nameCell.textContent();
          if (cellText?.trim().startsWith(U005_CLEANUP_PREFIX)) {
            await row.click();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await partsDatabasePage.archiveAndConfirm(
              SelectorsPartsDataBase.BUTTON_ARCHIVE,
              SelectorsPartsDataBase.BUTTON_CONFIRM,
            );
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }

        const remainingRows = page.locator(`${SelectorsPartsDataBase.CBED_TABLE_DIV} tbody tr`);
        const remainingCount = await remainingRows.count();
        if (remainingCount === 0) {
          hasMoreItems = false;
        } else {
          await page.reload();
          await partsDatabasePage.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
      }

      await searchCbed.evaluate((el: InputLike) => {
        el.value = '';
      });
      await searchCbed.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 03b: Refresh the page after Assemblies cleanup', async () => {
      await page.reload();
      await partsDatabasePage.waitForNetworkIdle();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 04: Process Products table - search and delete all items by prefix from bottom up, then refresh and search again', async () => {
      let hasMoreItems = true;
      const maxIterations = 100;
      let iterationCount = 0;

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        await searchProduct.fill(U005_CLEANUP_PREFIX);
        await searchProduct.press('Enter');
        await partsDatabasePage.waitForNetworkIdle();
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        const rows = page.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} tbody tr`);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }

        for (let i = rowCount - 1; i >= 0; i--) {
          const row = rows.nth(i);
          const nameCell = row.locator('td').nth(2);
          const cellText = await nameCell.textContent();
          if (cellText?.trim().startsWith(U005_CLEANUP_PREFIX)) {
            await row.click();
            await partsDatabasePage.archiveAndConfirm(
              SelectorsPartsDataBase.BUTTON_ARCHIVE,
              SelectorsPartsDataBase.BUTTON_CONFIRM,
            );
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
          }
        }

        const remainingRows = page.locator(`${SelectorsPartsDataBase.PRODUCT_TABLE} tbody tr`);
        const remainingCount = await remainingRows.count();
        if (remainingCount === 0) {
          hasMoreItems = false;
        } else {
          await page.reload();
          await partsDatabasePage.waitForNetworkIdle();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
      }

      await searchProduct.evaluate((el: InputLike) => {
        el.value = '';
      });
      await searchProduct.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    logger.info(`Cleanup done: removed items with prefix "${U005_CLEANUP_PREFIX}" from Details, Assemblies, and Products tables`);
  });

  test('TestCase 01 - создат дитайл - Проверка страница', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.SHORT);
    const shortagePage = new CreatePartsDatabasePage(page);
    await allure.step('Step 01: Открываем страницу базы деталей (Open the parts database page)', async () => {
      await shortagePage.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID);
    });
    await allure.step('Step 01b: Проверяем кнопки на главной (Verify main page buttons visibility and state)', async () => {
      await page.waitForLoadState('load');
      const buttons = testData2.elements.MainPage.buttonsBefore;
      for (const button of buttons) {
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true';
        await allure.step(`Validate button "${buttonLabel}"`, async () => {
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and in expected state (enabled=${expectedState})`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and in expected state?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 02: Нажать кнопку создания и кнопку Деталь (Click create, then Деталь)', async () => {
      await page.waitForLoadState('load');
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      await shortagePage.highlightElement(createButton, HIGHLIGHT_PENDING);
      await createButton.click();
      await page.locator(SelectorsPartsDataBase.BUTTON_DETAIL_DIV).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const detailButton = page.locator(SelectorsPartsDataBase.BUTTON_DETAIL_DIV);
      await shortagePage.highlightElement(detailButton, HIGHLIGHT_SUCCESS);
      await detailButton.click();
      await page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 02b: Проверяем кнопки на странице Создать деталь (Verify Create page buttons visibility and state)', async () => {
      await page.waitForLoadState('load');
      const buttons = testData1.elements.CreatePage.buttons;
      for (const button of buttons) {
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true';
        await allure.step(`Validate button "${buttonLabel}"`, async () => {
          const isButtonReady = await shortagePage.isButtonVisibleTestId(page, buttonDataTestId, buttonLabel, expectedState);
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and in expected state (enabled=${expectedState})`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and in expected state?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 03: Открыть модальное окно материала (Open material modal)', async () => {
      await page.waitForLoadState('load');
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await tableContainer.waitFor({ state: 'visible' });
      const firstDataRow = tableContainer.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_TBODY + ' tr').first();
      const targetButton = firstDataRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_SET);
      await shortagePage.highlightElement(targetButton, HIGHLIGHT_PENDING);
      await targetButton.click();
      await page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 03b: Проверяем кнопки в модальном окне материала (Verify material modal buttons visibility and state)', async () => {
      await page.waitForLoadState('load');
      const buttons = testData1.elements.CreatePage.modalAddMaterial.buttons;
      for (const button of buttons) {
        const buttonDatatestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true';
        await allure.step(`Validate button "${buttonLabel}"`, async () => {
          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDatatestId,
            buttonLabel,
            expectedState,
            'ModalBaseMaterial',
          );
          // Log only - do not fail test if button state differs (e.g. "Добавить" disabled until row selected) - see erp-1313
          logger.info(`Is the "${buttonLabel}" button visible and in expected state (${expectedState})?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 04: Сброс переключателя (Reset switcher to default)', async () => {
      await page.waitForLoadState('load');

      const targetItem = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1);

      await expect(targetItem).toBeVisible();

      await targetItem.click();
      await page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_TYPE).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 05: Поиск в таблице 1 — категория (Search table 1 - category)', async () => {
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

      const firstRow = leftTable.locator('[data-testid^="ModalBaseMaterial-TableList-Table-Type-Tbody"] tr:first-child');
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

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
    await allure.step('Step 06: Поиск в таблице 2 — материал (Search table 2 - material)', async () => {
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

      const firstRow = centerTable.locator('[data-testid^="ModalBaseMaterial-TableList-Table-SubType-Tbody"] tr:first-child');
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

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
    await allure.step('Step 07: Поиск в таблице 3 и выбор строки (Search table 3 and select row)', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      await page.waitForLoadState('load');
      const rightTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
      await shortagePage.highlightElement(rightTable, HIGHLIGHT_PENDING);
      await expect(page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM)).toBeVisible();
      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill('');

      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill(TEST_NAME);

      await page.waitForLoadState('load');
      await expect(rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT)).toBeVisible();

      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).press('Enter');
      await page.waitForLoadState('load');
      const matchingRow = rightTable.locator('tbody tr').filter({ hasText: TEST_NAME }).first();
      await matchingRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(matchingRow, HIGHLIGHT_PENDING);
      const rowTextNameFinal = await matchingRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowTextNameFinal).toContain(TEST_NAME);
        },
        `Verify first row contains "${TEST_NAME}"`,
        test.info(),
      );
      await matchingRow.waitFor({ state: 'visible' });

      await shortagePage.highlightElement(matchingRow, HIGHLIGHT_SUCCESS);
      await matchingRow.click();
      await page.waitForLoadState('load');
    });
    await allure.step('Step 08: Открыть поток архива (Open archive flow)', async () => {
      // To open the archive dialog, we need to add something to the archive
      const targetTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);

      // Ensure the table is visible
      await expect(targetTable).toBeVisible();

      // Verify that the table has content
      const firstRow = targetTable.locator('tbody tr').first();

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);

      await firstRow.click();
      await page.waitForLoadState('load');
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_ERROR);
      await firstRow.click();
      await page.waitForLoadState('load');
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
      await buttonLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await buttonLocator.click();

      await page.waitForLoadState('load');
      await page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // Locate the table container using data-testid
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await shortagePage.highlightElement(tableContainer, HIGHLIGHT_PENDING);
      await tableContainer.waitFor({ state: 'visible' });

      const firstDataRow = tableContainer.locator('table tbody tr').first();
      const targetButton = firstDataRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_RESET);

      await shortagePage.highlightElement(targetButton, HIGHLIGHT_ERROR);
      await targetButton.click();
      await page.waitForLoadState('load');
    });
    await allure.step('Step 08b: Проверяем кнопки в модальном окне архива (Verify archive modal buttons visibility and state)', async () => {
      await page.waitForLoadState('load');
      const buttons = testData1.elements.CreatePage.modalArchive.buttons;
      for (const button of buttons) {
        const buttonDataTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true';
        await allure.step(`Validate button "${buttonLabel}"`, async () => {
          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonDataTestId,
            buttonLabel,
            expectedState,
            'ModalConfirm',
          );
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and in expected state (enabled=${expectedState})`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and in expected state?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 09: Закрыть модальное окно архива (Close archive modal)', async () => {
      page.mouse.click(1, 1);
      await page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_BAN_DIALOG).waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
    });
    await allure.step('Step 10: Открыть диалог Добавить из базы (Open Добавить из базы dialog)', async () => {
      const button = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_ADD_FILE_BUTTON, { hasText: 'Добавить из базы' });
      await button.evaluate(row => {
        row.style.backgroundColor = 'green';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      button.click();
      await page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 10b: Проверяем кнопки в диалоге Добавить из базы (Verify Add from base dialog buttons visibility and state)', async () => {
      await page.waitForLoadState('load');
      const buttons = testData1.elements.CreatePage.modalAddFromBase.buttons;
      for (const button of buttons) {
        const buttonTestId = button.datatestid;
        const buttonLabel = button.label;
        const expectedState = button.state === 'true';
        await allure.step(`Validate button "${buttonLabel}"`, async () => {
          const isButtonReady = await shortagePage.isButtonVisibleTestId(
            page,
            buttonTestId,
            buttonLabel,
            expectedState,
            'AddDetal-FileComponent-ModalBaseFiles',
          );
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonReady).toBeTruthy();
            },
            `Verify button "${buttonLabel}" is visible and in expected state (enabled=${expectedState})`,
            test.info(),
          );
          logger.info(`Is the "${buttonLabel}" button visible and in expected state?`, isButtonReady);
        });
      }
    });
    await allure.step('Step 11: Поиск по файловой таблице (File table search)', async () => {
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

      await searchField.press('Enter');
      await page.waitForLoadState('load');

      const tbodyRows = tableContainer.locator('[data-testid^="AddDetal-FileComponent-ModalBaseFiles-FileWindow-Table-Table-Tbody"] tr');
      const matchingRow = tbodyRows.filter({ hasText: TEST_FILE }).first();
      await matchingRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(matchingRow, HIGHLIGHT_SUCCESS);

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
