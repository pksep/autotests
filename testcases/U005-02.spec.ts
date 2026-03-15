import { test, expect } from '@playwright/test';
import { SELECTORS } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../lib/Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../lib/Page';
import { TEST_DETAIL_NAME, TEST_NAME, TEST_FILE, baseFileNamesToVerify } from './U005-Constants';

/** Minimal type for input element in evaluate callbacks (avoids global HTMLInputElement). */
type InputLike = { files?: { length: number }; value?: string; dispatchEvent(e: Event): void };

export const runU005_02 = () => {
  test('TestCase 02 - создат дитайл', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const shortagePage = new CreatePartsDatabasePage(page);
    await allure.step('Step 01: Перейдите на страницу создания детали. (Navigate to the create part page)', async () => {
      shortagePage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      await page
        .locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE)
        .waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD })
        .catch(() => {});
    });
    await allure.step('Step 02: В поле ввода инпута "Наименование" вводим значение переменной. (In the input field "Name" we enter the value of the variable)', async () => {
      await page.waitForLoadState('load');
      const field = page.locator(SelectorsPartsDataBase.ADD_DETAL_INFORMATION_INPUT_INPUT);
      await field.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.highlightElement(field, HIGHLIGHT_PENDING);
      await field.click();
      await field.fill('');
      await field.fill(TEST_DETAIL_NAME);
      await field.press('Tab');
      await expect(field).toHaveValue(TEST_DETAIL_NAME, { timeout: WAIT_TIMEOUTS.STANDARD });
      await expectSoftWithScreenshot(page, () => expect.soft(field).toHaveValue(TEST_DETAIL_NAME), 'Name field has TEST_DETAIL_NAME', test.info());
    });
    await allure.step('Step 03: откройте диалоговое окно Добавление материала и подтвердите заголовки. (open Добавление материала dialog and verify titles)', async () => {
      await page.waitForLoadState('load');
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await tableContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await expectSoftWithScreenshot(page, () => expect.soft(tableContainer).toBeVisible(), 'Table container is visible', test.info());
      const tableTitle = tableContainer.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_TITLE);
      await expectSoftWithScreenshot(page, () => expect.soft(tableTitle).toBeVisible(), 'Table title is visible', test.info());

      await shortagePage.highlightElement(tableTitle, HIGHLIGHT_PENDING);

      const firstDataRow = tableContainer.locator('table tbody tr').first();
      const targetButton = firstDataRow.locator('td').nth(2).locator('button');
      await targetButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await shortagePage.highlightElement(targetButton, HIGHLIGHT_PENDING);
      await targetButton.click();
      await page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 04: Verify that search works for table 3 (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');
      const rightTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
      await rightTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(rightTable, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(page, () => expect.soft(page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM)).toBeVisible(), 'Modal base material table item is visible', test.info());
      const searchInput = rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT);
      await searchInput.fill('');
      await searchInput.fill(TEST_NAME);
      await expectSoftWithScreenshot(page, () => expect.soft(searchInput).toBeVisible(), 'Right table search input is visible', test.info());
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      const firstRow = rightTable.locator('tbody tr:first-child');
      await expect(firstRow).toContainText(TEST_NAME, { timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(page, () => expect.soft(firstRow).toContainText(TEST_NAME), `Verify first row contains "${TEST_NAME}"`, test.info());
      await firstRow.waitFor({ state: 'visible' });
      await firstRow.click();
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);
      const addButton = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_ADD_BUTTON);
      await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await expect(addButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 05: Add the found Item (Add the found Item)', async () => {
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_ADD_BUTTON);
      await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await expect(addButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(addButton, HIGHLIGHT_SUCCESS);
      // Brief wait so selection is registered before Add click (backup pattern)
      // eslint-disable-next-line playwright/no-wait-for-timeout -- required so Add applies selected row
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await addButton.click();
      await page
        .locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH)
        .waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.STANDARD })
        .catch(() => {});
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const firstRow = tableContainer.locator('table tbody tr').first();
      await expect(firstRow).toContainText(TEST_NAME, { timeout: WAIT_TIMEOUTS.LONG });
    });
    await allure.step('Step 06: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)', async () => {
      await page.waitForLoadState('load');
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await tableContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      const firstDataRow = tableContainer.locator('table tbody tr').first();
      await expect(firstDataRow).toContainText(TEST_NAME, { timeout: WAIT_TIMEOUTS.STANDARD });
      const targetCell = firstDataRow.locator('td').nth(2);
      await shortagePage.highlightElement(targetCell, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(page, () => expect.soft(firstDataRow).toContainText(TEST_NAME), `Verify target row contains "${TEST_NAME}"`, test.info());
    });
    await allure.step('Step 08: Вводим значение переменной в обязательное поле в строке "Длина (Д)" в таблице "Характеристики заготовки"', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Locate the table container using data-testid
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(page, () => expect.soft(tableContainer).toBeVisible(), 'Table container is visible', test.info());

      // Locate the row dynamically by searching for the text "Длина (Д)"
      const targetRow = tableContainer.locator('tr').filter({
        has: page.locator('td:has-text("Длина (Д)")'),
      });

      await expectSoftWithScreenshot(page, () => expect.soft(targetRow).toBeVisible(), 'Target row with "Длина (Д)" is visible', test.info());
      const inputField = targetRow.locator(SelectorsPartsDataBase.INPUT_SUFFIX_INPUT);
      await shortagePage.highlightElement(inputField, HIGHLIGHT_PENDING);

      // Set the desired value
      const desiredValue = '999';
      await inputField.fill(desiredValue);

      logger.log(`Set the value "${desiredValue}" in the input field.`);

      // Verify the value
      const currentValue = await inputField.inputValue();
      logger.log('Verified input value:', currentValue);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe(desiredValue);
        },
        `Verify current value is "${desiredValue}"`,
        test.info(),
      );
    });

    await allure.step('Step 09: Upload files using drag-and-drop functionality', async () => {
      // Locate the hidden file input element
      const fileInput = page.locator('input#docsFileSelected');

      // Set the files to be uploaded (paths from U005-Constants so U005 uses its own files, no conflict with U006)
      await fileInput.setInputFiles(
        baseFileNamesToVerify.map(f => `testdata/${f.name}${f.extension}`),
      );
      // await fileInput.setInputFiles([
      //     'testdata/1.3.1.1 Клапан М6х10.jpg__+__92d7aeee-893c-4140-8611-9019ea4d63ff.jpg', // Replace with your actual file paths
      //     'testdata/1.3.1.1 Клапан М6х10.PNG__+__c3a2fced-9b03-461b-a596-ef3808d8a475.png',
      // ]);
      const uploadedFiles = await fileInput.evaluate((element: unknown) => {
        return (element as InputLike).files?.length || 0;
      });

      logger.log(`Number of files uploaded: ${uploadedFiles}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(uploadedFiles).toBe(2); // Ensure 2 files were uploaded
        },
        'Verify 2 files were uploaded',
        test.info(),
      );

      // Optional: Wait for visual or backend updates
      await page.waitForLoadState('load');

      logger.log('Files successfully uploaded via the hidden input.');
    });

    await allure.step('Step 10: Проверяем, что в модальном окне отображаются заголовки(check the headers in the dialog)', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      const modal = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL);
      await modal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await page.waitForLoadState('load');
      const titles = testData1.elements.CreatePage.modalAddDocuments.titles.map(title => title.trim());

      const h3Titles = await shortagePage.getAllH3TitlesInModalTestId(page, 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal');
      const normalizedH3Titles = h3Titles.map(title => title.trim());

      // Log for debugging
      logger.info('Expected Titles:', titles);
      logger.info('Received Titles:', normalizedH3Titles);

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

      const titlesh4 = testData1.elements.CreatePage.modalAddDocuments.titlesh4.map(title => title.replace(/\s+/g, ' ').trim());
      const h4Titles = await shortagePage.getAllH4TitlesInModalByTestId(page, 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal');
      const normalizedH4Titles = h4Titles.map(title => title.replace(/\s+/g, ' ').trim());

      logger.info('Expected Titles:', titlesh4);
      logger.info('Received Titles:', normalizedH4Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles.length).toBe(titlesh4.length);
        },
        'Verify H4 titles count matches expected',
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles).toEqual(titlesh4);
        },
        'Verify H4 titles content and order match expected',
        test.info(),
      );
    });
    await allure.step('Step 11: Ensure the textarea is present and writable in each file uploaded section', async () => {
      await page.waitForLoadState('load');
      const modal = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL);
      await expectSoftWithScreenshot(page, () => expect.soft(modal).toBeVisible(), 'Drag-and-drop modal is visible', test.info());

      // Locate the SECTION inside the modal (wildcard for '-Section')
      const section = modal.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });

      // Locate ALL FILE SECTIONS inside the section (wildcard for '-File')
      const fileSections = section.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE);
      const fileCount = await fileSections.count();

      if (fileCount < 2) {
        throw new Error(`Expected at least 2 file sections, but found ${fileCount}`);
      }

      for (let i = 0; i < 2; i++) {
        const fileSection = fileSections.nth(i);

        // Locate the input section inside the file section (common pattern)

        // Locate the textarea inside the fieldset (specific textarea)
        const textarea = fileSection.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_TEXTAREA_DESCRIPTION_TEXTAREA);
        await shortagePage.highlightElement(textarea, HIGHLIGHT_PENDING);
        const checkbox = fileSection.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_CHECKBOX_MAIN);
        await shortagePage.highlightElement(checkbox, HIGHLIGHT_PENDING);
        const version = fileSection.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_INPUT_NUMBER_VERSION_INPUT);
        await shortagePage.highlightElement(version, HIGHLIGHT_PENDING);
        const fileName = fileSection.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_INPUT_FILE_NAME_INPUT);
        await shortagePage.highlightElement(fileName, HIGHLIGHT_PENDING);

        // Ensure the textarea is visible
        await expectSoftWithScreenshot(page, () => expect.soft(textarea).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT }), 'Description textarea is visible', test.info());
        logger.log(`Textarea in file section ${i + 1} is visible.`);

        // Focus on the textarea to verify it is writable
        await textarea.focus();
        logger.log(`Textarea in file section ${i + 1} is focused.`);

        // Type text into the textarea
        const testValue = `Test note ${i + 1}`;
        await textarea.fill(testValue);
        logger.log(`Value entered into textarea in file section ${i + 1}: ${testValue}`);

        // Verify the entered value
        const currentValue = await textarea.inputValue();
        logger.log(`Textarea current value in file section ${i + 1}: ${currentValue}`);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(currentValue).toBe(testValue);
          },
          `Verify textarea value is "${testValue}"`,
          test.info(),
        );
      }
    });

    await allure.step('Step 12: Check buttons in dialog (Check buttons in dialog)', async () => {
      await page.waitForLoadState('load');
      const modal = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL);
      await modal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });

      const buttons = testData1.elements.CreatePage.modalAddDocuments.buttons;

      const modalAddDocumentsSelectors = SelectorsPartsDataBase.MODAL_ADD_DOCUMENTS_BUTTON_SELECTORS;
      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const buttonLabel = button.label;
        const expectedState = button.state === 'true';
        const buttonSelector = modalAddDocumentsSelectors[i];
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          logger.log(`Checking button: ${buttonLabel} - Expected State: ${expectedState}`);
          const buttonLocator = page.locator(buttonSelector);
          await buttonLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });

          // Check if the button is visible and enabled
          const isButtonVisible = await buttonLocator.isVisible();
          const isButtonEnabled = await buttonLocator.isEnabled();

          logger.log(`Button: ${buttonLabel} - Visible: ${isButtonVisible}, Enabled: ${isButtonEnabled}`);

          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonVisible).toBeTruthy();
              expect.soft(isButtonEnabled).toBe(expectedState);
            },
            `Verify button visibility and enabled state`,
            test.info(),
          );

          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonVisible && isButtonEnabled);
        });
      }
    });

    await allure.step('Step 13: Проверяем, что в модальном окне есть не отмеченный чекбокс в строке "Главный:" (Check that the checkbox is not selected in the MAIN row)', async () => {
      await page.waitForLoadState('load');
      const modal = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL);
      await expectSoftWithScreenshot(page, () => expect.soft(modal).toBeVisible(), 'Drag-and-drop modal is visible', test.info());

      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });

      const sectionX = section.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE).first();
      const sectionY = section.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE).nth(1);

      // Validate checkboxes and assert their state
      const checkboxX = await shortagePage.validateCheckbox(page, sectionX, 1);
      const checkboxY = await shortagePage.validateCheckbox(page, sectionY, 2);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(checkboxX).toBeFalsy();
          expect.soft(checkboxY).toBeFalsy();
        },
        'Verify checkboxes are unchecked',
        test.info(),
      );
    });

    await allure.step('Step 14: Чек чекбокс в строке "Главный:" (Check the checkbox in the "Главный:" row)', async () => {
      await page.waitForLoadState('load');

      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });

      const sectionX = section.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE).first();
      const sectionY = section.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE).nth(1);

      // Validate checkboxes and assert their state
      const checkboxCheckedX = await shortagePage.checkCheckbox(page, sectionX, 1);
      const checkboxCheckedY = await shortagePage.checkCheckbox(page, sectionY, 2);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(checkboxCheckedX).toBeTruthy();
          expect.soft(checkboxCheckedY).toBeTruthy();
        },
        'Verify checkboxes are checked',
        test.info(),
      );
    });
    await allure.step('Step 15: Проверяем, that in the file field is the name of the file uploaded without its file extension', async () => {
      await page.waitForLoadState('load');

      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
      logger.log('Dynamic content in modal section loaded.');

      // Extract individual file sections from the main section
      const fileSections = await section.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_FILE).all();

      // Convert { name, extension } objects to filename strings without extension
      const filenamesWithoutExtension = baseFileNamesToVerify.map(file => file.name);

      // Call the function from shortagePage class, passing extracted filenames
      await shortagePage.validateFileNames(page, fileSections, filenamesWithoutExtension);

      logger.log('All file fields validated successfully.');
    });

    await allure.step('Step 16: Click the Загрузить все файлы button and confirm modal closure', async () => {
      logger.log('Starting file upload process...');

      await page.waitForLoadState('load');

      const uploadButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_BUTTON_UPLOAD);
      const modalLocator = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL);
      logger.log('Upload button and drag-and-drop modal located.');

      await modalLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await uploadButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      logger.log('Drag-and-drop modal and upload button are visible.');

      const maxRetries = 50;
      let retryCounter = 0;

      while (retryCounter <= maxRetries) {
        const modalCount = await modalLocator.count();
        if (modalCount === 0) {
          logger.log('Modal is no longer present. Upload succeeded.');
          break;
        }

        logger.log(`Attempt ${retryCounter + 1}: Clicking upload button.`);
        await shortagePage.highlightElement(uploadButton, HIGHLIGHT_PENDING);
        await uploadButton.click();
        logger.log('Upload button clicked.');

        // Wait for notification to appear after click (duplicate or success) - same as U006
        // eslint-disable-next-line playwright/no-wait-for-timeout -- required so toast is visible before extractNotificationMessage
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);

        if ((await modalLocator.count()) === 0) {
          logger.log('Modal closed after click. Upload succeeded.');
          break;
        }

        let notification: { message?: string } | null = null;
        try {
          notification = await shortagePage.extractNotificationMessage(page);
        } catch {
          logger.log('No notification found after upload attempt.');
        }

        if (!notification) {
          logger.log('No notification detected. Will retry (click upload again).');
        } else if (notification.message === 'Файл с таким именем уже существует') {
          logger.log('Duplicate filename detected. Updating all filenames, then will click upload again.');
          retryCounter++;

          const fileNameInputs = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_INPUT_FILE_NAME_INPUT);
          const sectionsCount = await fileNameInputs.count();
          logger.log(`Found ${sectionsCount} file sections to update filenames.`);

          for (let i = 0; i < sectionsCount; i++) {
            if ((await modalLocator.count()) === 0) {
              logger.log('Modal closed during filename updates. Exiting loop.');
              break;
            }
            const fileInput = fileNameInputs.nth(i);
            if (!(await fileInput.isVisible())) continue;

            const currentValue = await fileInput.inputValue();
            await fileInput.fill('');
            await fileInput.press('Enter');
            // eslint-disable-next-line playwright/no-wait-for-timeout -- allow input to settle before filling new value (U006 pattern)
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            const updatedValue = `${currentValue}_${Math.random().toString(36).substring(2, 6)}`;
            await fileInput.fill(updatedValue);
            await fileInput.evaluate((input: unknown) => {
              const el = input as InputLike;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            });
            logger.log(`Filename updated for section ${i + 1} to "${updatedValue}".`);
          }
        } else if (notification) {
          logger.log(`Unexpected notification: ${notification.message}`);
          break;
        }

        logger.log('Waiting before next attempt (click upload again)...');
        // eslint-disable-next-line playwright/no-wait-for-timeout -- brief pause before next upload click (U006 pattern)
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }

      if (retryCounter >= maxRetries) {
        throw new Error(`Failed to upload files after ${maxRetries} retries (duplicate filename updates).`);
      }

      await modalLocator.waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
      logger.log('File upload process completed successfully.');
    });

    await allure.step('Step 17: Verify uploaded file names with wildcard matching and extension validation', async () => {
      logger.log('Starting file verification process...');
      await page.waitForLoadState('load');

      const documentTable = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TABLE);
      await documentTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD }).catch(() => {
        throw new Error('Document table did not appear after Step 16. Upload may have failed or the app may not have added files to the page.');
      });
      logger.log('Document table is visible.');

      const firstFileName = baseFileNamesToVerify[0].name;
      const documentTableSection = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT);
      const firstFileRow = documentTableSection
        .locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TABLE + ' tbody tr')
        .filter({ hasText: firstFileName })
        .first();
      await firstFileRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
      logger.log(`Row containing "${firstFileName}" is visible.`);

      const parentSection = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT);
      await shortagePage.highlightElement(parentSection, HIGHLIGHT_PENDING);

      const tableRows = parentSection.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TABLE + ' tbody tr');
      const allRowTexts = await tableRows.evaluateAll(rows => rows.map(row => row.textContent));
      logger.log('Table Rows Content:', allRowTexts);

      for (const { name, extension } of baseFileNamesToVerify) {
        logger.log(`Verifying presence of file with base name: ${name} and extension: ${extension}`);

        // Locate rows where the second column contains the base name
        const matchingRows = tableRows.locator(`td:nth-child(2):has-text("${name}")`);

        const rowCount = await matchingRows.count();

        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(rowCount, `File "${name}" should appear in document table after upload (Step 16). Found ${rowCount} rows.`).toBeGreaterThan(0);
          },
          `Verify uploaded file "${name}" appears in document table`,
          test.info(),
        );

        let extensionMatch = false;
        if (rowCount > 0) {
          await shortagePage.highlightElement(matchingRows.first(), HIGHLIGHT_PENDING);
          logger.log(`Found ${rowCount} rows matching base name "${name}".`);

          for (let i = 0; i < rowCount; i++) {
            const rowText = await matchingRows.nth(i).textContent();
            logger.log(`Row ${i + 1}: ${rowText}`);

            if (rowText && rowText.includes(extension)) {
              logger.log(`File "${name}" with extension "${extension}" is present.`);
              extensionMatch = true;
              break;
            }
          }
        }
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(extensionMatch, `File "${name}" row should contain extension "${extension}". Check table row content.`).toBe(true);
          },
          `Verify file "${name}" has extension "${extension}"`,
          test.info(),
        );
      }

      logger.log('File verification process completed successfully.');
    });
    await allure.step('Step 18: Open Добавить из базы dialog (Open Добавить из базы dialog)', async () => {
      await page.waitForLoadState('load');

      // Check if the drag and drop modal is open and close it if needed
      const dragDropModal = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_MODAL);
      const modalCount = await dragDropModal.count();
      if (modalCount > 0) {
        logger.log('Drag and drop modal is open, closing it...');
        await page.keyboard.press('Escape').catch(() => {});
        await dragDropModal.waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
        if ((await dragDropModal.count()) > 0) {
          await page.mouse.click(1, 1);
          await dragDropModal.waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {});
        }
      }

      const button = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_ADD_FILE_BUTTON, { hasText: 'Добавить из базы' });
      await button.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(button, HIGHLIGHT_SUCCESS);
      await button.click();
      await page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_DIALOG).waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
    });
    await allure.step('Step 19: Verify that search works for the files table (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');
      const dialog = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_DIALOG);
      await dialog.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(dialog, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(page, () => expect.soft(dialog).toBeVisible(), 'Add from base dialog is visible', test.info());
      const tableContainer = dialog.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_TABLE_TABLE_SUFFIX_SELECTOR);
      await expectSoftWithScreenshot(page, () => expect.soft(tableContainer).toBeVisible(), 'Table container is visible', test.info());
      await shortagePage.highlightElement(tableContainer, HIGHLIGHT_PENDING);
      const tableHead = tableContainer.locator('thead');
      await shortagePage.highlightElement(tableHead, HIGHLIGHT_PENDING);
      const searchField = tableContainer.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_THEAD_SEARCH_INPUT);
      await searchField.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await shortagePage.highlightElement(searchField, HIGHLIGHT_PENDING);
      const leftTable = tableContainer;
      await expectSoftWithScreenshot(page, () => expect.soft(searchField).toBeVisible(), 'Search field is visible', test.info());
      await searchField.focus();
      await searchField.fill('');
      await searchField.press('Enter');
      await searchField.fill(TEST_FILE);

      // Programmatically set the value using JavaScript (in case fill did not trigger search)
      await searchField.evaluate((element: unknown, value: string) => {
        const input = element as InputLike;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, TEST_FILE);

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
      const firstRow = leftTable.locator('tbody tr:first-child');
      await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await expect(firstRow).toContainText(TEST_FILE, { timeout: WAIT_TIMEOUTS.SHORT });
      logger.log('First Row:', await firstRow.textContent());
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

      const rowText = await firstRow.textContent();
      logger.log('First row text:', rowText);
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

    let selectedFileType: string = '';
    let selectedFileName: string = '';
    await allure.step('Step 20: Add the file to the attach list in bottom table (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');

      // Locate the parent container of the table
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE);
      const firstRow = tableContainer.locator('tbody tr:first-child');
      selectedFileType = (await firstRow.locator('td').nth(2).textContent()) ?? '';
      selectedFileName = (await firstRow.locator('td').nth(3).textContent()) ?? '';

      const shortagePage = new CreatePartsDatabasePage(page);
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);
      const addButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_ADD_BUTTON, { hasText: 'Добавить' });
      await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await shortagePage.highlightElement(addButton, HIGHLIGHT_PENDING);
      const isButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_ADD_BUTTON, 'Добавить', false, SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isButtonReady).toBeTruthy();
        },
        'Verify button is ready',
        test.info(),
      );
      await firstRow.click();
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);
      await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      const isButtonReady2 = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_ADD_BUTTON, 'Добавить', true, SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isButtonReady2).toBeTruthy();
        },
        'Verify second button is ready',
        test.info(),
      );
      await addButton.click();
      await shortagePage.highlightElement(addButton, HIGHLIGHT_SUCCESS);
    });
    await allure.step('Step 21: Confirm the file is listed in the bottom table', async () => {
      await page.waitForLoadState('load');
      const bottomTableLocator = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_TABLE);
      await bottomTableLocator.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(bottomTableLocator, HIGHLIGHT_SUCCESS);
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCount).toBeGreaterThan(0); // Ensure the table is not empty
        },
        'Verify table has rows',
        test.info(),
      );

      let isRowFound = false;
      logger.log(String(rowCount));
      // Iterate through each row
      for (let i = 0; i < rowCount; i++) {
        const row = rowsLocator.nth(i);

        // Extract the partNumber from the input field in the first cell
        const tableFileType = await row.locator('td').nth(1).textContent();
        const tableFileTypeCell = row.locator('td').nth(1);
        const tableFileName = await row.locator('td').nth(2).textContent();
        const tableFileNameCell = row.locator('td').nth(2);

        logger.log(`Row ${i + 1}: FileType=${tableFileType?.trim()}, FileName=${tableFileName?.trim()}`);

        // Compare the extracted values
        if (tableFileType?.trim() === selectedFileType) {
          isRowFound = true;
          await shortagePage.highlightElement(tableFileTypeCell, HIGHLIGHT_ERROR);
        }
        if (tableFileName?.trim() === selectedFileName) {
          isRowFound = true;
          await shortagePage.highlightElement(tableFileNameCell, HIGHLIGHT_ERROR);
          logger.log(`Selected row found in row ${i + 1}`);
        }
      }
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isRowFound).toBeTruthy();
        },
        'Verify row was found',
        test.info(),
      );
    });
    await allure.step('Step 22: Click bottom Add button', async () => {
      await page.waitForLoadState('load');
      const addButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FOOTER_BUTTONS_ADD_BUTTON, { hasText: 'Добавить' }).last();
      await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(addButton, HIGHLIGHT_SUCCESS);
      await addButton.click();
      await page
        .locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_DIALOG)
        .waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.STANDARD })
        .catch(() => {});
    });
    await allure.step('Step 23: Highlight the row containing the selected file name', async () => {
      await page.waitForLoadState('load');
      const parentSection = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT);
      await parentSection.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      logger.log('Located parent section for the file table.');

      // Locate all visible table rows within the scoped section
      //const tableRows = parentSection.locator('tbody .table-yui-kit__tr');
      const tableRows = parentSection.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TABLE + ' tbody tr'); // Target the actual table rows

      const rowCount = await tableRows.count();

      logger.log(`Found ${rowCount} rows in the table.`);

      let fileFound = false;

      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const fileNameCell = row.locator(SelectorsPartsDataBase.DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TBODY_NAME);
        await fileNameCell.waitFor({ state: 'visible' });
        const fileNameText = await fileNameCell.textContent();

        logger.log(`Row ${i + 1}: ${fileNameText}`);

        // Check if the current row contains the selected file name
        if (fileNameText?.trim() === selectedFileName) {
          // Match exact name
          logger.log(`Selected file name "${selectedFileName}" found in row ${i + 1}. Highlighting...`);
          await shortagePage.highlightElement(fileNameCell, HIGHLIGHT_PENDING);
          fileFound = true;
          break; // Exit the loop once the file is found and highlighted
        }
      }

      if (!fileFound) {
        throw new Error(`Selected file name "${selectedFileName}" was not found in the table.`);
      }
      logger.log('File search and highlight process completed successfully.');
    });
    await allure.step('Step 24: Удалите первый файл из списка медиафайлов.(Remove the first file from the list of attached media files.)', async () => {
      await page.waitForLoadState('load');
      let printButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_BUTTONS_BUTTON_PRINT, { hasText: 'Печать' });
      await shortagePage.highlightElement(printButton, HIGHLIGHT_PENDING);
      let isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint', 'Печать', false);
      let deleteButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_BUTTONS_DELETE_DOC, { hasText: 'Удалить' });
      await shortagePage.highlightElement(deleteButton, HIGHLIGHT_PENDING);
      let isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc', 'Удалить', false);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isPrintButtonReady).toBeTruthy();
          expect.soft(isDeleteButtonReady).toBeTruthy();
        },
        'Verify print and delete buttons are ready',
        test.info(),
      );
      // Locate the parent section for the specific table
      const parentSection = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT);
      logger.log('Located parent section for the file table.');

      // Locate all visible table rows within the scoped section
      const tableRows = parentSection.locator(SelectorsPartsDataBase.DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TBODY_TABLEROW);
      const row = tableRows.first();

      // Refine the locator to target the checkbox input inside the third column
      const checkboxInput = row.locator(SelectorsPartsDataBase.DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_CHECKBOX);
      await shortagePage.highlightElement(checkboxInput, HIGHLIGHT_SUCCESS);
      await checkboxInput.waitFor({ state: 'visible' });

      await checkboxInput.check();
      printButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_BUTTONS_BUTTON_PRINT, { hasText: 'Печать' });
      await shortagePage.highlightElement(printButton, HIGHLIGHT_SUCCESS);
      isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint', 'Печать', true);
      deleteButton = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_BUTTONS_DELETE_DOC, { hasText: 'Удалить' });
      await shortagePage.highlightElement(deleteButton, HIGHLIGHT_SUCCESS);
      isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc', 'Удалить', true);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isPrintButtonReady).toBeTruthy();
          expect.soft(isDeleteButtonReady).toBeTruthy();
        },
        'Verify print and delete buttons are ready',
        test.info(),
      );
      // Assert that the checkbox is checked
      const isChecked = await checkboxInput.isChecked();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isChecked).toBeTruthy();
        },
        'Verify checkbox is checked',
        test.info(),
      );

      await deleteButton.click();
      await shortagePage.highlightElement(deleteButton, HIGHLIGHT_SUCCESS);
      await page.waitForLoadState('load');
    });

    await allure.step('Step 25: Save the detail', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, { hasText: 'Сохранить' });
      await saveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await shortagePage.highlightElement(saveButton, HIGHLIGHT_PENDING);
      await saveButton.click();
      await Promise.race([page.waitForURL(/\/detail\/\d+/).catch(() => {}), page.waitForLoadState('load')]);
      await page.waitForLoadState('load');
    });

    await allure.step('Step 26: Refresh page, reopen the detail, and verify file from database is still present and highlighted', async () => {
      await page.reload();
      await page.waitForLoadState('load');

      const documentTable = page.locator(SelectorsPartsDataBase.DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TABLE);
      const tableVisible = await documentTable.isVisible().catch(() => false);
      if (!tableVisible) {
        logger.log('Document table not on current page (likely redirected to list after save). Navigating to parts database and opening the detail.');
        await shortagePage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        await page.waitForLoadState('load');
        await shortagePage.searchAndWaitForTable(TEST_DETAIL_NAME, SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE, SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE, {
          searchInputDataTestId: SelectorsPartsDataBase.TABLE_SEARCH_INPUT_TESTID,
        });
        await page.waitForLoadState('load');
        // After Enter in search, history dropdown stays open and blocks clicks. Move mouse up ~20px so dropdown closes, then click row.
        const tableSelector = SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE;
        const searchInput = page.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT).first();
        await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        const searchBox = await searchInput.boundingBox();
        if (searchBox) {
          const moveY = Math.max(10, searchBox.y - 25);
          await page.mouse.move(searchBox.x + searchBox.width / 2, moveY);
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
        const firstRow = page.locator(`${tableSelector} tbody tr`).first();
        await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await firstRow.scrollIntoViewIfNeeded();
        await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);
        await firstRow.click();
        const editButton = page.locator(SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_EDIT);
        await editButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
        await expect(editButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
        await shortagePage.highlightElement(editButton, HIGHLIGHT_PENDING);
        await editButton.click();
        await page.waitForLoadState('load');
      }

      await documentTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });

      const parentSection = page.locator(SelectorsPartsDataBase.DETAIL_FILE_COMPONENT);
      const nameCellWithFile = parentSection.locator(SelectorsPartsDataBase.DETAIL_FILE_COMPONENT_DOCUMENT_TABLE_TBODY_NAME).filter({ hasText: selectedFileName }).first();
      await nameCellWithFile.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.LONG });
      const fileRow = nameCellWithFile.locator('..');
      await shortagePage.highlightElement(fileRow, HIGHLIGHT_SUCCESS);

      const isFileRowVisible = await fileRow.isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isFileRowVisible, `File "${selectedFileName}" should still be present in document table after refresh.`).toBe(true);
        },
        `Verify file "${selectedFileName}" is present in document table after refresh`,
        test.info(),
      );
      logger.log(`File "${selectedFileName}" is present in document table after refresh.`);
    });
  });
};
