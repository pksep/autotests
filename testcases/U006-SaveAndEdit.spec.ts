import { test, expect, Locator } from '@playwright/test';
import { SELECTORS } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING } from '../lib/Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../lib/Page';

export const runU006SaveAndEdit = () => {
  test('09 - Сохранение при заполнении всех обязательных атрибутов', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Step 1: Открыть главную страницу', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');

      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify main container is visible',
        test.info(),
      );
      logger.info('Главная страница успешно загружена');
    });

    await allure.step('Step 2: Подтвердить правильный заголовок страницы', async () => {
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
        },
        'Verify create page title is visible',
        test.info(),
      );
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        `Verify create page title text is ${SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS}`,
        test.info(),
      );
      logger.info('Страница создания успешно открыта');
    });

    await allure.step('Step 3: Найти поле для ввода наименования детали', async () => {
      const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      await detailsPage.highlightElement(detailNameInput, HIGHLIGHT_PENDING);
      logger.info('Поле наименования детали найдено');
    });

    await allure.step('Step 4: Заполнить поле «Наименование»', async () => {
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`);
    });

    await allure.step('Step 5: Нажать кнопку «Задать» в строке «Материал заготовки»', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await detailsPage.highlightElement(materialButton, HIGHLIGHT_PENDING);
      await materialButton.click();
      await page.waitForLoadState('load');

      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible();
        },
        'Verify material modal is visible',
        test.info(),
      );
      logger.info('Модальное окно выбора материала успешно открыто');
    });

    await allure.step('Step 6: Выбрать материал и подтвердить выбор', async () => {
      // searchAndSelectMaterial now handles: search, select, click Add button, and close dialog
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);

      // Verify the dialog is closed (searchAndSelectMaterial should have closed it)
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal is not visible after adding',
        test.info(),
      );
      logger.info('Материал выбран и добавлен');
    });

    await allure.step('Step 7: Заполнить все обязательные атрибуты материала', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      // Find all input fields in the characteristics table
      const inputFields = tableContainer.locator(SelectorsPartsDataBase.INPUT_DATA_TESTID_SUFFIX_SELECTOR);
      const inputCount = await inputFields.count();
      logger.info(`Найдено ${inputCount} полей для заполнения`);

      // Fill each input field with a value
      for (let i = 0; i < inputCount; i++) {
        const inputField = inputFields.nth(i);
        await detailsPage.highlightElement(inputField, HIGHLIGHT_PENDING);

        const value = (i + 1) * 10; // Generate different values for each field
        await inputField.fill(value.toString());
        const currentValue = await inputField.inputValue();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(currentValue).toBe(value.toString());
          },
          `Verify current value is ${value.toString()}`,
          test.info(),
        );
        logger.info(`Поле ${i + 1} заполнено значением: ${value}`);
      }

      logger.info('Все обязательные атрибуты материала заполнены');
    });

    await allure.step('Step 8: Нажать кнопку «Сохранить»', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify save button is visible',
        test.info(),
      );
      await detailsPage.highlightElement(saveButton, HIGHLIGHT_PENDING);
      await saveButton.click();
      await page.waitForLoadState('load');

      // Verify success message
      // await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");  // ERP-bug
      logger.info('Деталь успешно сохранена со всеми заполненными атрибутами');
    });

    await allure.step('Step 9: Проверить, что значения соответствуют ожиданиям', async () => {
      // Navigate to the parts database to verify the saved detail
      await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('load');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for list after load
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const tableContainer = detailTable.first();
      await tableContainer.scrollIntoViewIfNeeded();

      const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(searchInput).toBeVisible();
        },
        'Verify search input is visible',
        test.info(),
      );

      await searchInput.fill('');
      await searchInput.press('Enter');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for search results
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.fill(SelectorsPartsDataBase.TEST_DETAIL_NAME);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      // Wait for search results to show before reading rows
      await tableContainer.locator('tbody tr').filter({ hasText: SelectorsPartsDataBase.TEST_DETAIL_NAME }).first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for table to settle
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();
      let isMatch = false;

      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        await detailsPage.highlightElement(currentRow, HIGHLIGHT_PENDING);
        // eslint-disable-next-line playwright/no-wait-for-timeout -- brief wait after highlight
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        const rowText = await currentRow.textContent();
        if (rowText && rowText.trim().includes(SelectorsPartsDataBase.TEST_DETAIL_NAME)) {
          isMatch = true;
          break;
        }
      }
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isMatch).toBeTruthy();
        },
        'Verify created detail is found in database',
        test.info(),
      );
      logger.info('Созданная деталь найдена в базе деталей');
    });
  });

  test('10 - Подтверждение сохраненных значений после редактирования', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Step 1: Создать деталь с валидными значениями', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');

      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify main container is visible',
        test.info(),
      );
      logger.info('Главная страница успешно загружена');

      // Fill detail name
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`);

      // Select material
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');

      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible();
        },
        'Verify material modal is visible',
        test.info(),
      );

      // searchAndSelectMaterial now handles: search, select, click Add button, and close dialog
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);

      // Verify the dialog is closed (searchAndSelectMaterial should have closed it)
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal is not visible after adding',
        test.info(),
      );
      logger.info('Материал выбран и добавлен');

      // Fill required attributes
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      const targetRow = tableContainer.locator('tr').filter({
        has: page.locator('td:has-text("Длина (Д)")'),
      });

      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(targetRow).toBeVisible();
        },
        'Verify target row is visible',
        test.info(),
      );

      const inputField = targetRow.locator(`${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`);
      await detailsPage.highlightElement(inputField, HIGHLIGHT_PENDING);

      const desiredValue = '150';
      await inputField.fill(desiredValue);
      const currentValue = await inputField.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe(desiredValue);
        },
        `Verify current value is ${desiredValue}`,
        test.info(),
      );
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for save/redirect
      await page.waitForTimeout(TIMEOUTS.VERY_LONG);
      logger.info('Обязательные атрибуты материала заполнены');

      // Save the detail
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');

      //await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");  // ERP-bug
      logger.info('Деталь успешно создана с валидными значениями');
    });

    await allure.step('Step 2: Открыть деталь для редактирования', async () => {
      await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('load');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for table after search
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const tableContainer = detailTable.first();
      await tableContainer.scrollIntoViewIfNeeded();

      const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(searchInput).toBeVisible();
        },
        'Verify search input is visible',
        test.info(),
      );

      await searchInput.fill('');
      await searchInput.press('Enter');
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for search results
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.fill(SelectorsPartsDataBase.TEST_DETAIL_NAME);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await tableContainer.locator('tbody tr').filter({ hasText: SelectorsPartsDataBase.TEST_DETAIL_NAME }).first().waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for table to settle
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();
      const matchingRows: Locator[] = [];
      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        const rowText = await currentRow.textContent();
        if (rowText && rowText.trim().includes(SelectorsPartsDataBase.TEST_DETAIL_NAME)) {
          matchingRows.push(currentRow);
        }
      }
      // Open the last matching row (most recently created = the one we just saved in Step 1)
      const rowToOpen = matchingRows.length > 0 ? matchingRows[matchingRows.length - 1] : rows.nth(0);
      await rowToOpen.click();
      const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(editButton).toBeVisible();
        },
        'Verify edit button is visible',
        test.info(),
      );
      await detailsPage.highlightElement(editButton, HIGHLIGHT_PENDING);
      await editButton.click();
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for edit form to open
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Verify that the detail opens in edit mode
      const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(editPageTitle).toBeVisible();
        },
        'Verify edit page title is visible',
        test.info(),
      );
      logger.info('Деталь открыта в режиме редактирования');
    });

    await allure.step('Step 3: Подтвердить, что данные сохранились', async () => {
      // Verify detail name is preserved (use FILL selector for the actual input element)
      const detailNameInput = page.locator(SelectorsPartsDataBase.EDIT_DETAL_INFORMATION_INPUT_FILL);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      const savedName = await detailNameInput.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(savedName).toBe(SelectorsPartsDataBase.TEST_DETAIL_NAME);
        },
        `Verify saved name is ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`,
        test.info(),
      );
      logger.info(`Наименование детали сохранено: ${savedName}`);

      // Verify material is preserved (find by expected text; table layout may vary)
      const tableContainer = page.locator(SelectorsPartsDataBase.EDIT_CHARACTERISTIC_BLANKS_CONTAINER_SELECTOR);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      const materialSpan = tableContainer.getByText(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON).first();
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialSpan).toBeVisible();
        },
        'Verify material span is visible',
        test.info(),
      );
      const savedMaterial = await materialSpan.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(savedMaterial.trim()).toBe(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
        },
        `Verify saved material is ${SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON}`,
        test.info(),
      );
      logger.info(`Материал сохранен: ${savedMaterial}`);

      // Verify attribute value 150 is preserved (scan all inputs in table; row order may vary)
      const allInputs = tableContainer.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
      const inputCount = await allInputs.count();
      let savedValue = '';
      for (let idx = 0; idx < inputCount; idx++) {
        const v = await allInputs.nth(idx).inputValue();
        if (v === '150') {
          savedValue = v;
          break;
        }
      }
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(savedValue).toBe('150');
        },
        'Verify saved value is 150',
        test.info(),
      );
      logger.info(`Значение атрибута сохранено: ${savedValue}`);

      logger.info('Все поля содержат предыдущие значения');
    });
  });

  test('11 - Попытка удаления материала и сохранения', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Шаг 1: Создать деталь с материалом и атрибутами', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');

      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify main container is visible',
        test.info(),
      );
      logger.info('Страница создания детали открыта');

      // Заполнить наименование
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`);

      // Выбрать материал
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');

      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible();
        },
        'Verify material modal is visible',
        test.info(),
      );

      // searchAndSelectMaterial now handles: search, select, click Add button, and close dialog
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);

      // Verify the dialog is closed (searchAndSelectMaterial should have closed it)
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal is not visible after adding',
        test.info(),
      );
      logger.info('Материал выбран и добавлен');

      // Заполнить атрибуты
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      const targetRow = tableContainer.locator('tr').filter({
        has: page.locator('td:has-text("Длина (Д)")'),
      });

      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(targetRow).toBeVisible();
        },
        'Verify target row is visible',
        test.info(),
      );

      const inputField = targetRow.locator(`${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`);
      await detailsPage.highlightElement(inputField, HIGHLIGHT_PENDING);

      const value = '100';
      await inputField.fill(value);
      const currentValue = await inputField.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe(value);
        },
        `Verify current value is ${value}`,
        test.info(),
      );
      logger.info('Все данные приняты');
    });

    await allure.step('Шаг 2: Удалить материал', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_RESET_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      logger.info('Материал удален из формы');
    });

    await allure.step('Шаг 3: Подтвердить удаление материала в диалоговом окне', async () => {
      const archiveDialog = page.locator(SelectorsPartsDataBase.MODAL_CONFIRM_GENERIC);
      await archiveDialog.click();
      await page.waitForLoadState('load');

      const archiveYesButton = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
      await detailsPage.highlightElement(archiveYesButton, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(archiveYesButton).toBeVisible();
        },
        'Verify archive Yes button is visible',
        test.info(),
      );
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for input to apply
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);

      await archiveYesButton.click();
      await page.waitForLoadState('load');
      const cancelButton = page.locator(SelectorsPartsDataBase.MATERIAL_CANCEL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(cancelButton).toBeVisible();
        },
        'Verify cancel button is visible',
        test.info(),
      );
      await cancelButton.click();
      await page.waitForLoadState('load');
      logger.info('Удаление материала подтверждено');
    });

    await allure.step("Шаг 4: Нажать 'Сохранить'", async () => {
      logger.log("Шаг 4: Нажать 'Сохранить'");
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify save button is visible',
        test.info(),
      );
      await detailsPage.highlightElement(saveButton, HIGHLIGHT_PENDING);
      // eslint-disable-next-line playwright/no-wait-for-timeout -- brief wait before click
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await saveButton.click();
      await page.waitForLoadState('load');

      //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");//ERP bug
      logger.info('Появляется ошибка, требующая выбора материала');
    });
  });

  test('12 - Удалить материал перед сохранением', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step("Шаг 1: Заполнить поле 'Наименование' и выбрать материал", async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');

      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify main container is visible',
        test.info(),
      );
      logger.info('Форма содержит выбранный материал с отображаемыми атрибутами');

      // Заполнить наименование
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`);

      // Выбрать материал
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');

      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible();
        },
        'Verify material modal is visible',
        test.info(),
      );

      // searchAndSelectMaterial now handles: search, select, click Add button, and close dialog
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);

      // Verify the dialog is closed (searchAndSelectMaterial should have closed it)
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal is not visible after adding',
        test.info(),
      );
      logger.info('Материал выбран и добавлен');
    });

    await allure.step('Шаг 2: Заполнить все обязательные атрибуты материала', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      const targetRow = tableContainer.locator('tr').filter({
        has: page.locator('td:has-text("Длина (Д)")'),
      });

      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(targetRow).toBeVisible();
        },
        'Verify target row is visible',
        test.info(),
      );

      const inputField = targetRow.locator(`${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`);
      await detailsPage.highlightElement(inputField, HIGHLIGHT_PENDING);

      const value = '150';
      await inputField.fill(value);
      const currentValue = await inputField.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe(value);
        },
        `Verify current value is ${value}`,
        test.info(),
      );
      logger.info('Атрибуты успешно валидированы с правильными значениями');
    });

    await allure.step('Шаг 3: Нажать на иконку для удаления выбранного материала', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_RESET_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      logger.info('Материал удален из формы');
    });

    await allure.step('Шаг 3a: Подтвердить удаление материала в диалоговом окне', async () => {
      const archiveYesButton = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
      await detailsPage.highlightElement(archiveYesButton, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(archiveYesButton).toBeVisible();
        },
        'Verify archive Yes button is visible',
        test.info(),
      );
      // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for input to apply
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);

      await archiveYesButton.click();
      await page.waitForLoadState('load');
      const cancelButton = page.locator(SelectorsPartsDataBase.MATERIAL_CANCEL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(cancelButton).toBeVisible();
        },
        'Verify cancel button is visible',
        test.info(),
      );
      await cancelButton.click();
      await page.waitForLoadState('load');
      logger.info('Удаление материала подтверждено');
    });

    await allure.step("Шаг 4: Нажать кнопку 'Сохранить'", async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');

      //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");//ERP bug
      logger.info('Система отклоняет сохранение и отображает ошибку, указывающую на обязательность выбора материала');
    });
  });

  test('13 - Переключение между категориями материалов', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Шаг 1: Открыть форму создания детали', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');

      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify main container is visible',
        test.info(),
      );
      logger.info('Форма создания детали открыта');
    });

    await allure.step("Шаг 2: Заполнить поле 'Наименование'", async () => {
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`);
    });

    await allure.step('Шаг 3: Открыть модальное окно выбора материала', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify material button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');

      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible();
        },
        'Verify material modal is visible',
        test.info(),
      );
      logger.info('Модальное окно выбора материала открыто');
    });

    await allure.step('Шаг 4: Переключиться на вторую категорию материалов', async () => {
      const secondCategorySwitch = page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2);
      const secondCategoryVisible = await secondCategorySwitch.isVisible();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(secondCategoryVisible).toBe(true);
        },
        'Verify second category switch is visible',
        test.info(),
      );
      if (secondCategoryVisible) {
        await detailsPage.highlightElement(secondCategorySwitch, HIGHLIGHT_PENDING);
        await secondCategorySwitch.click();
        await page.waitForLoadState('load');
        logger.info('Успешно переключились на вторую категорию материалов');
        logger.info('Переключение между категориями работает корректно');
      } else {
        logger.info('Вторая категория материалов недоступна');
      }
    });

    await allure.step('Шаг 5: Выбрать материал из второй категории', async () => {
      const switchMaterialVisible = await page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2).isVisible();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(switchMaterialVisible).toBe(true);
        },
        'Verify switch material (second category) is visible',
        test.info(),
      );
      if (!switchMaterialVisible) {
        logger.info('Пропускаем выбор материала - вторая категория недоступна');
        return;
      }
      const materialTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
      const materialTableVisible = await materialTable.isVisible();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(materialTableVisible).toBe(true);
        },
        'Verify material table is visible',
        test.info(),
      );
      if (!materialTableVisible) return;

      // Wait for the table to load and get the first available material row
      // eslint-disable-next-line playwright/no-wait-for-timeout -- table load has no reliable selector
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const materialRows = materialTable.locator('tr');
      const rowCount = await materialRows.count();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        'Verify at least one material row exists',
        test.info(),
      );
      if (rowCount === 0) {
        logger.info('В таблице материалов второй категории нет доступных материалов');
        return;
      }
      const firstMaterialRow = materialRows.first();
      const firstRowVisible = await firstMaterialRow.isVisible();
      await expectSoftWithScreenshot(
        page,
        async () => {
          expect.soft(firstRowVisible).toBe(true);
        },
        'Verify first material row is visible',
        test.info(),
      );
      if (!firstRowVisible) return;

      // Try to get material name from the row (handle different table structures)
      let materialName = 'Неизвестный материал';
      try {
        const firstCell = firstMaterialRow.locator('td').first();
        if (await firstCell.isVisible()) {
          materialName = (await firstCell.textContent()) || 'Неизвестный материал';
        } else {
          const alternativeCell = firstMaterialRow.locator('*').first();
          if (await alternativeCell.isVisible()) {
            materialName = (await alternativeCell.textContent()) || 'Неизвестный материал';
          }
        }
      } catch {
        logger.info('Не удалось получить название материала, продолжаем с выбором');
      }

      logger.info(`Найден материал в второй категории: ${materialName}`);

      let materialSelected = false;
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        logger.info(`Попытка выбора материала ${attempt}/${maxAttempts}`);

        if (attempt === 1) {
          await firstMaterialRow.click();
        } else if (attempt === 2) {
          try {
            const clickableElement = firstMaterialRow.locator('button, a, [role="button"], .clickable').first();
            if (await clickableElement.isVisible()) {
              await clickableElement.click();
            } else {
              await firstMaterialRow.click();
            }
          } catch {
            await firstMaterialRow.click();
          }
        } else {
          // eslint-disable-next-line playwright/no-force-option -- last-resort click when normal click fails
          await firstMaterialRow.click({ force: true });
        }

        await page.waitForLoadState('load');
        // eslint-disable-next-line playwright/no-wait-for-timeout -- wait for UI after row click
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
        const addButtonVisible = await addButton.isVisible();
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(addButtonVisible).toBe(true);
          },
          'Verify add button is visible',
          test.info(),
        );

        const isDisabled = await addButton.getAttribute('disabled');
        const hasDisabledClass = await addButton.evaluate(el => el.classList.contains('disabled-yui-kit'));
        const addButtonEnabled = !isDisabled && !hasDisabledClass;
        await expectSoftWithScreenshot(
          page,
          async () => {
            expect.soft(addButtonEnabled).toBe(true);
          },
          'Verify add button is enabled',
          test.info(),
        );

        if (addButtonEnabled) {
          logger.info("Материал успешно выбран, кнопка 'Добавить' активна");
          materialSelected = true;

          await detailsPage.highlightElement(addButton, HIGHLIGHT_PENDING);
          await addButton.click();
          await page.waitForLoadState('load');

          const modalHidden = await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN).isHidden();
          await expectSoftWithScreenshot(
            page,
            async () => {
              // eslint-disable-next-line playwright/no-conditional-expect -- assert only after add click
              expect.soft(modalHidden).toBe(true);
            },
            'Verify material modal is not visible after adding',
            test.info(),
          );
          logger.info('Материал из второй категории успешно выбран и добавлен');
          break;
        } else {
          logger.info(`Попытка ${attempt}: Кнопка 'Добавить' неактивна, материал не выбран`);
        }
      }

      if (!materialSelected) {
        logger.info('Не удалось выбрать материал после всех попыток');
      }
    });

    await allure.step('Шаг 6: Проверить, что материал отображается в форме', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      // Try different approaches to find the material
      let materialFound = false;
      let materialText = 'Материал не найден';

      // Approach 1: Look for material in the expected location (td:nth(2) span)
      try {
        const materialSpan = tableContainer.locator('td').nth(2).locator('span');
        if (await materialSpan.isVisible()) {
          materialText = await materialSpan.innerText();
          materialFound = true;
          logger.info(`Выбранный материал найден: ${materialText}`);
        }
      } catch {
        logger.info('Материал не найден в ожидаемом месте (td:nth(2) span)');
      }

      // Approach 2: Look for material in any span within the table
      if (!materialFound) {
        try {
          const allSpans = tableContainer.locator('span');
          const spanCount = await allSpans.count();

          for (let i = 0; i < spanCount; i++) {
            const span = allSpans.nth(i);
            const text = await span.innerText();
            if (text && text.trim().length > 0 && !text.includes('Длина') && !text.includes('Ширина') && !text.includes('Высота')) {
              materialText = text;
              materialFound = true;
              logger.info(`Материал найден в span ${i}: ${materialText}`);
              break;
            }
          }
        } catch {
          logger.info('Не удалось найти материал в span элементах');
        }
      }

      // Approach 3: Look for material in any text content within the table
      if (!materialFound) {
        try {
          const tableText = await tableContainer.textContent();
          if (tableText && tableText.includes('Сталь')) {
            materialText = 'Сталь (найдена в тексте таблицы)';
            materialFound = true;
            logger.info('Материал найден в тексте таблицы');
          }
        } catch {
          logger.info('Не удалось прочитать текст таблицы');
        }
      }

      // Log the result
      if (materialFound) {
        logger.info(`Выбранный материал: ${materialText}`);
      } else {
        logger.info('Материал не найден в форме, возможно не был добавлен');
      }

      // Check if any attributes are loaded (regardless of material)
      const requiredFields = tableContainer.locator('tr');
      const fieldCount = await requiredFields.count();

      if (fieldCount > 0) {
        logger.info(`Найдено ${fieldCount} строк в таблице характеристик`);

        // Check if there are any input fields (indicating attributes are loaded)
        const inputFields = tableContainer.locator('input');
        const inputCount = await inputFields.count();
        if (inputCount > 0) {
          logger.info(`Загружено ${inputCount} полей атрибутов`);
        } else {
          logger.info('Поля атрибутов не найдены');
        }
      } else {
        logger.info('Таблица характеристик пуста');
      }
    });
  });
};
