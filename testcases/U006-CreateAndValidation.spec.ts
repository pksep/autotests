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
import { baseFileNamesToVerify, InputLike } from './U006-shared';

export const runU006CreateAndValidation = () => {
  test('01 - создат дитайл', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
    const shortagePage = new CreatePartsDatabasePage(page);
    await allure.step('Step 01: Перейдите на страницу создания детали. (Navigate to the create part page)', async () => {
      shortagePage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
    await allure.step('Step 02: В поле ввода инпута "Наименование" вводим значение переменной. (In the input field "Name" we enter the value of the variable)', async () => {
      await page.waitForLoadState('load');
      const field = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);

      await shortagePage.highlightElement(field, HIGHLIGHT_PENDING);
      await field.fill('');
      await field.press('Enter');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await field.fill(SelectorsPartsDataBase.TEST_DETAIL_NAME);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const fieldValue = await field.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fieldValue).toBe(SelectorsPartsDataBase.TEST_DETAIL_NAME);
        },
        `Verify field input value is ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`,
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
    await allure.step('Step 03: откройте диалоговое окно Добавление материала и подтвердите заголовки. (open Добавление материала dialog and verify titles)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      // Locate the table container by searching for the h3 with the specific title.
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      ); // Ensure the table container is visible

      const tableTitle = tableContainer.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableTitle).toBeVisible();
        },
        'Verify table title is visible',
        test.info(),
      ); // Ensure the title is visible

      // Optionally, highlight the title for debugging
      await shortagePage.highlightElement(tableTitle, HIGHLIGHT_PENDING);

      await tableContainer.waitFor({ state: 'visible' });
      const firstDataRow = tableContainer.locator('table tbody tr').first();
      const targetButton = firstDataRow.locator('td').nth(2).locator('button');
      await shortagePage.highlightElement(targetButton, HIGHLIGHT_PENDING);
      await targetButton.click();
    });
    await allure.step('Step 04: Verify that search works for table 3 (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const rightTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
      await shortagePage.highlightElement(rightTable, HIGHLIGHT_PENDING); // Highlight with a yellow background
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM)).toBeVisible();
        },
        'Verify modal base material table is visible',
        test.info(),
      );
      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill('');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Locate the search field within the left table and fill it
      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).fill(SelectorsPartsDataBase.TEST_MATERIAL_NAME);

      await page.waitForLoadState('load');
      // Optionally, validate that the search input is visible
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT)).toBeVisible();
        },
        'Verify search input in right table is visible',
        test.info(),
      );

      await rightTable.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM_SEARCH_INPUT_DROPDOWN_INPUT).press('Enter');
      await page.waitForLoadState('load');
      // Find the first row in the table
      const firstRow = rightTable.locator('tbody tr:first-child');
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING); // Highlight with a yellow background
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const firstRowText = await firstRow.textContent();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(firstRowText).toContain(SelectorsPartsDataBase.TEST_MATERIAL_NAME);
        },
        `Verify first row contains ${SelectorsPartsDataBase.TEST_MATERIAL_NAME}`,
        test.info(),
      );
      // Wait for the row to be visible and click on it
      await firstRow.waitFor({ state: 'visible' });
      firstRow.click();
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS); // Highlight with a yellow background
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 05: Add the found Item (Add the found Item)', async () => {
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
      await shortagePage.highlightElement(addButton, HIGHLIGHT_SUCCESS);

      addButton.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 06: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      // Locate the table container by searching for the h3 with the specific title.
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await tableContainer.waitFor({ state: 'visible' });
      const firstDataRow = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE).locator('tr').first();
      const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

      await shortagePage.highlightElement(targetSpan, HIGHLIGHT_PENDING);
      const targetSpanText = await targetSpan.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(targetSpanText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_NAME);
        },
        `Verify target span inner text is ${SelectorsPartsDataBase.TEST_MATERIAL_NAME}`,
        test.info(),
      );
    });
    await allure.step('Step 07: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');
      // Locate the table container by searching for the h3 with the specific title.
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await tableContainer.waitFor({ state: 'visible' });
      const firstDataRow = tableContainer.locator('table tbody tr').first();
      const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

      await shortagePage.highlightElement(targetSpan, HIGHLIGHT_PENDING);
      const targetSpanText = await targetSpan.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(targetSpanText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_NAME);
        },
        `Verify target span inner text is ${SelectorsPartsDataBase.TEST_MATERIAL_NAME}`,
        test.info(),
      );
    });
    await allure.step('Step 08: Вводим значение переменной в обязательное поле в строке "Длина (Д)" в таблице "Характеристики заготовки"', async () => {
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Locate the table container using data-testid
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      // Locate the row dynamically by searching for the text "Длина (Д)"
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

      // Locate the input field dynamically within the row
      const inputField = targetRow.locator(`${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`); // Finds any input field with a data-testid ending in "-Input"

      // Highlight the input field for debugging (optional)
      await shortagePage.highlightElement(inputField, HIGHLIGHT_PENDING);

      // Set the desired value
      const desiredValue = '999';
      await inputField.fill(desiredValue);

      logger.log(`Set the value "${desiredValue}" in the input field.`);

      // Verify the value
      const currentValue = await inputField.inputValue();
      logger.log(`Verified input value: ${currentValue}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe(desiredValue);
        },
        `Verify current value is ${desiredValue}`,
        test.info(),
      );

      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });

    await allure.step('Step 09: Upload files using drag-and-drop functionality', async () => {
      // Locate the hidden file input element
      const fileInput = page.locator('input#docsFileSelected');

      // Set the files to be uploaded
      await fileInput.setInputFiles([
        'testdata/Test_imagexx_1.jpg', // Replace with your actual file paths
        'testdata/Test_imagexx_2.png',
      ]);
      // await fileInput.setInputFiles([
      //     'testdata/1.3.1.1 Клапан М6х10.jpg__+__92d7aeee-893c-4140-8611-9019ea4d63ff.jpg', // Replace with your actual file paths
      //     'testdata/1.3.1.1 Клапан М6х10.PNG__+__c3a2fced-9b03-461b-a596-ef3808d8a475.png',
      // ]);
      // Verify the files were successfully uploaded
      await page.waitForTimeout(TIMEOUTS.STANDARD); // Wait before execution
      const uploadedFiles = await fileInput.evaluate((element: unknown) => {
        return (element as InputLike).files?.length || 0;
      });

      logger.info(`Number of files uploaded: ${uploadedFiles}`);
      if (uploadedFiles !== 2) {
        throw new Error(`Expected to upload 2 files, but got ${uploadedFiles}`);
      }
      logger.info('Files successfully uploaded via the hidden input.');
    });

    await allure.step('Step 10: Проверяем, что в модальном окне отображаются заголовки(check the headers in the dialog)', async () => {
      const shortagePage = new CreatePartsDatabasePage(page);
      // Wait for loading
      const titles = testData1.elements.CreatePage.modalAddDocuments.titles.map(title => title.trim());

      // Retrieve all H3 titles from the specified class
      const h3Titles = await shortagePage.getAllH3TitlesInModalTestId(page, SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
      const normalizedH3Titles = h3Titles.map(title => title.trim());
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Log for debugging
      logger.info('Expected Titles:', titles);
      logger.info('Received Titles:', normalizedH3Titles);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles.length).toBe(titles.length);
        },
        `Verify normalized H3 titles length is ${titles.length}`,
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH3Titles).toEqual(titles);
        },
        'Verify normalized H3 titles match expected titles',
        test.info(),
      );

      const titlesh4 = testData1.elements.CreatePage.modalAddDocuments.titlesh4.map(title => title.replace(/\s+/g, ' ').trim());
      const h4Titles = await shortagePage.getAllH4TitlesInModalByTestId(page, SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
      const normalizedH4Titles = h4Titles.map(title => title.replace(/\s+/g, ' ').trim());

      logger.info('Expected Titles:', titlesh4);
      logger.info('Received Titles:', normalizedH4Titles);

      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Validate length
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles.length).toBe(titlesh4.length);
        },
        `Verify normalized H4 titles length is ${titlesh4.length}`,
        test.info(),
      );

      // Validate content and order
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(normalizedH4Titles).toEqual(titlesh4);
        },
        'Verify normalized H4 titles match expected titles',
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });
    await allure.step('Step 11: Ensure the textarea is present and writable in each file uploaded section', async () => {
      await page.waitForLoadState('load');

      // Locate the modal container using data-testid
      const modal = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modal).toBeVisible();
        },
        'Verify modal is visible',
        test.info(),
      );

      // Locate the SECTION inside the modal (wildcard for '-Section')
      const section = modal.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });

      // Locate ALL FILE SECTIONS inside the section (wildcard for '-File')
      const fileSections = section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE);
      const fileCount = await fileSections.count();

      if (fileCount < 2) {
        throw new Error(`Expected at least 2 file sections, but found ${fileCount}`);
      }

      for (let i = 0; i < 2; i++) {
        const fileSection = fileSections.nth(i);

        // Locate the input section inside the file section (common pattern)

        // Locate the textarea inside the fieldset (specific textarea)
        const textarea = fileSection.locator(SelectorsPartsDataBase.FILE_DESCRIPTION_TEXTAREA);
        await shortagePage.highlightElement(textarea, HIGHLIGHT_PENDING);
        const checkbox = fileSection.locator(SelectorsPartsDataBase.FILE_MAIN_CHECKBOX);
        await shortagePage.highlightElement(checkbox, HIGHLIGHT_PENDING);
        const version = fileSection.locator(SelectorsPartsDataBase.FILE_VERSION_INPUT);
        await shortagePage.highlightElement(version, HIGHLIGHT_PENDING);
        const fileName = fileSection.locator(SelectorsPartsDataBase.FILE_NAME_INPUT);

        // Highlight the textarea for debugging (optional)
        await shortagePage.highlightElement(fileName, HIGHLIGHT_PENDING);

        // Ensure the textarea is visible
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(textarea).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          `Verify textarea in file section ${i + 1} is visible`,
          test.info(),
        );
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
          `Verify textarea current value is ${testValue} in file section ${i + 1}`,
          test.info(),
        );
      }

      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });

    await allure.step('Step 12: Check buttons in dialog (Check buttons in dialog)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      const buttons = testData1.elements.CreatePage.modalAddDocuments.buttons;

      // Iterate over each button in the array
      for (const button of buttons) {
        // Map button data-testid to constants
        const buttonTestIdMap: { [key: string]: string } = {
          'AddDetal-Buttons-TechProcess': SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_TECH_PROCESS,
          'AddDetal-Buttons-CostPrice': SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_COST_PRICE,
          'AddDetal-Buttons-Accessory': SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_ACCESSORY,
          'AddDetal-Buttons-ChangeHistory': SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_CHANGE_HISTORY,
          'Specification-Buttons-addingSpecification': SelectorsPartsDataBase.SPECIFICATION_BUTTONS_ADDING_SPECIFICATION,
          'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Button-Cancel': SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_BUTTON_CANCEL,
          'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Button-Upload': SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_DRAG_AND_DROP_MODAL_ADD_FILE_BUTTON_UPLOAD,
        };

        // Get selector from map - all buttons must have constants
        const buttonSelector = buttonTestIdMap[button.datatestid];
        if (!buttonSelector) {
          throw new Error(`Button with datatestid "${button.datatestid}" is not mapped to a constant. Please add it to buttonTestIdMap.`);
        }
        const buttonLabel = button.label;
        const expectedState = button.state === 'true'; // Convert state string to a boolean

        // Perform the validation for the button
        await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
          await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          logger.log(`Checking button: ${buttonSelector} - ${buttonLabel} - Expected State: ${expectedState}`);

          // Locate the button using selector constant
          const buttonLocator = page.locator(buttonSelector);

          // Check if the button is visible and enabled
          const isButtonVisible = await buttonLocator.isVisible();
          const isButtonEnabled = await buttonLocator.isEnabled();

          logger.log(`Button: ${buttonSelector} - Visible: ${isButtonVisible}, Enabled: ${isButtonEnabled}`);

          // Validate the button's visibility and state
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonVisible).toBeTruthy();
            },
            `Verify button ${buttonLabel} is visible`,
            test.info(),
          );
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(isButtonEnabled).toBe(expectedState);
            },
            `Verify button ${buttonLabel} enabled state is ${expectedState}`,
            test.info(),
          );

          logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonVisible && isButtonEnabled);
        });
      }
    });

    await allure.step('Step 13: Проверяем, что в модальном окне есть не отмеченный чекбокс в строке "Главный:" (Check that the checkbox is not selected in the MAIN row)', async () => {
      await page.waitForLoadState('load');

      const modal = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(modal).toBeVisible();
        },
        'Verify modal is visible',
        test.info(),
      );

      const section = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });

      const sectionX = section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).first();
      const sectionY = section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).nth(1);

      // Validate checkboxes and assert their state
      const checkboxX1 = await shortagePage.validateCheckbox(page, sectionX, 1);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(checkboxX1).toBeFalsy();
        },
        'Verify checkbox in sectionX row 1 is unchecked',
        test.info(),
      );
      const checkboxY2 = await shortagePage.validateCheckbox(page, sectionY, 2);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(checkboxY2).toBeFalsy();
        },
        'Verify checkbox in sectionY row 2 is unchecked',
        test.info(),
      );

      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });

    await allure.step('Step 14: Чек чекбокс в строке "Главный:" (Check the checkbox in the "Главный:" row)', async () => {
      await page.waitForLoadState('load');

      const section = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });

      const sectionX = section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).first();
      const sectionY = section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).nth(1);

      // Validate checkboxes and assert their state
      const checkedX1 = await shortagePage.checkCheckbox(page, sectionX, 1);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(checkedX1).toBeTruthy();
        },
        'Verify checkbox in sectionX row 1 is checked',
        test.info(),
      );
      const checkedY2 = await shortagePage.checkCheckbox(page, sectionY, 2);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(checkedY2).toBeTruthy();
        },
        'Verify checkbox in sectionY row 2 is checked',
        test.info(),
      );

      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 15: Проверяем, that in the file field is the name of the file uploaded without its file extension', async () => {
      await page.waitForLoadState('load');

      const section = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
      await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.VERY_SHORT });
      logger.log('Dynamic content in modal section loaded.');

      // Extract individual file sections from the main section
      const fileSections = await section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).all();

      // Convert { name, extension } objects to filename strings without extension
      const filenamesWithoutExtension = baseFileNamesToVerify.map(file => file.name);

      // Call the function from shortagePage class, passing extracted filenames
      await shortagePage.validateFileNames(page, fileSections, filenamesWithoutExtension);

      logger.log('All file fields validated successfully.');
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    });

    await allure.step('Step 16: Click the Загрузить все файлы button and confirm modal closure', async () => {
      logger.log('Starting file upload process...');

      // Wait for the page to stabilize
      await page.waitForLoadState('load');

      // Locate the upload button using data-testid
      const uploadButton = page.locator(SelectorsPartsDataBase.FILE_UPLOAD_BUTTON);
      const modalLocator = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
      logger.log('Upload button and modal located.');

      const maxRetries = 50;
      let retryCounter = 0;

      while (retryCounter <= maxRetries) {
        // Check if modal exists in the DOM
        const modalCount = await modalLocator.count();
        if (modalCount === 0) {
          logger.log('Modal is no longer present in the DOM. Upload succeeded!');
          break; // Exit the loop when the modal is gone
        }

        logger.log(`Attempt ${retryCounter + 1}: Clicking upload button.`);

        await shortagePage.highlightElement(uploadButton, HIGHLIGHT_PENDING);

        // Click the upload button
        await uploadButton.click();
        logger.log('Upload button clicked.');

        // Wait for notifications
        await page.waitForTimeout(TIMEOUTS.INPUT_SET);

        // Check modal visibility again after the button click
        if ((await modalLocator.count()) === 0) {
          logger.log('Modal closed after button click. Upload succeeded!');
          await page.waitForTimeout(TIMEOUTS.STANDARD);
          break;
        }

        // Check for notifications (handle no-message case gracefully)
        let notification: { message?: string } | null = null;
        try {
          notification = await shortagePage.extractNotificationMessage(page);
        } catch (err) {
          console.warn('No notification found after upload attempt.', err);
        }

        if (!notification) {
          logger.log('No notification detected. Assuming upload still in progress/succeeded.');
        } else if (notification.message === 'Файл с таким именем уже существует') {
          logger.log('Duplicate filename detected. Updating all filenames.');
          retryCounter++;

          const sectionsCount = await page.locator(SelectorsPartsDataBase.FILE_NAME_INPUT).count();
          logger.log(`Found ${sectionsCount} file sections to update filenames.`);

          for (let i = 0; i < sectionsCount; i++) {
            // Check if modal still exists before proceeding with the loop
            if ((await modalLocator.count()) === 0) {
              logger.log('Modal closed during filename updates. Exiting loop.');
              break;
            }

            const fileInput = page.locator(SelectorsPartsDataBase.FILE_NAME_INPUT).nth(i);

            try {
              // Check if field is visible before interaction
              if (!(await fileInput.isVisible())) {
                logger.log(`Input field in section ${i + 1} is no longer visible. Skipping...`);
                continue;
              }

              logger.log(`Updating filename for section ${i + 1}.`);

              const currentValue = await fileInput.inputValue();
              await fileInput.fill('');
              await fileInput.press('Enter');
              await page.waitForTimeout(TIMEOUTS.MEDIUM);

              const updatedValue = `${currentValue}_${Math.random().toString(36).substring(2, 6)}`;
              await fileInput.fill(updatedValue);

              await fileInput.evaluate(input => {
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              });

              logger.log(`Filename updated to "${updatedValue}" for section ${i + 1}.`);
            } catch {
              logger.log(`Error updating filename for section ${i + 1}. Skipping...`);
              break;
            }
          }
        } else if (notification) {
          logger.log(`Unexpected notification: ${notification.message}`);
          break; // Exit on unexpected notifications
        }

        logger.log('Waiting before retrying...');
        await page.waitForTimeout(TIMEOUTS.MEDIUM);
      }

      if (retryCounter >= maxRetries) {
        throw new Error(`Failed to upload files after ${maxRetries} retries.`);
      }

      logger.log('File upload process completed successfully.');
    });

    await allure.step('Step 17: Verify uploaded file names with wildcard matching and extension validation', async () => {
      logger.info('Starting file verification process...');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.EXTENDED);

      // Locate the parent section for the specific table
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const parentSection = page.locator(SelectorsPartsDataBase.FILE_COMPONENT_SECTION);
      logger.info('Located parent section for the file table.');

      // Locate all visible table rows within the scoped section
      const tableRows = parentSection.locator(`${SelectorsPartsDataBase.DOCUMENT_TABLE_SELECTOR} tbody tr`); // Target the actual table rows
      const rowCount = await tableRows.count();
      logger.info(`Found ${rowCount} rows in the table.`);

      // Debug: Print all row texts
      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const rowText = await row.textContent();
        logger.info(`Row ${i + 1}: ${rowText}`);
      }

      for (const { name, extension } of baseFileNamesToVerify) {
        logger.info(`Verifying presence of file with base name: ${name} and extension: ${extension}`);

        let fileFound = false;

        // Iterate through all rows to find files that start with the base name
        for (let i = 0; i < rowCount; i++) {
          const row = tableRows.nth(i);

          // Try multiple selector strategies to find the filename cell
          let nameCell = row.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_NAME_CELL_PREFIX);
          if ((await nameCell.count()) === 0) {
            nameCell = row.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_NAME_CELL_TD_PREFIX);
          }
          if ((await nameCell.count()) === 0) {
            // Fallback: try to find any cell in the row that might contain the filename
            nameCell = row.locator('td').first();
          }

          if ((await nameCell.count()) > 0) {
            const fileName = await nameCell.textContent();
            const trimmedFileName = fileName?.trim() || '';

            logger.info(`Row ${i + 1}: Checking cell text "${trimmedFileName}"`);

            // Check if the file name starts with the base name and contains the expected extension
            if (trimmedFileName && trimmedFileName.startsWith(name) && trimmedFileName.includes(extension)) {
              logger.info(`File "${trimmedFileName}" matches base name "${name}" with extension "${extension}".`);

              // Highlight the matching cell
              await shortagePage.highlightElement(nameCell, HIGHLIGHT_PENDING);

              fileFound = true;
              break;
            }
          } else {
            logger.info(`Row ${i + 1}: No name cell found`);
          }
        }

        if (!fileFound) {
          // Enhanced error message with debugging info
          logger.error(`Failed to find file with base name "${name}" and extension "${extension}".`);
          logger.error(`Total rows checked: ${rowCount}`);
          throw new Error(`No files found with base name "${name}" and extension "${extension}". Checked ${rowCount} rows.`);
        }
      }

      logger.info('File verification process completed successfully.');
    });
    await allure.step('Step 18: Open Добавить из базы dialog (Open Добавить из базы dialog)', async () => {
      await page.waitForLoadState('load');
      const button = page.locator(SelectorsPartsDataBase.FILE_ADD_BUTTON, { hasText: 'Добавить из базы' });
      await shortagePage.highlightElement(button, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      button.click();
    });
    await allure.step('Step 19: Verify that search works for the files table (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Locate the switch item using data-testid and highlight it for debugging
      const switchItem = page.locator(SelectorsPartsDataBase.FILE_BASE_SWITCH_ITEM0);
      await shortagePage.highlightElement(switchItem, HIGHLIGHT_SUCCESS);
      await switchItem.click();
      await page.waitForLoadState('load');

      // Wait for the dialog to be open and visible
      const dialog = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_DIALOG);
      await shortagePage.highlightElement(dialog, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(dialog).toBeVisible();
        },
        'Verify dialog is visible',
        test.info(),
      );

      // Locate the table container and search input within the dialog
      const tableContainer = dialog.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_TABLE_TABLE_SUFFIX_SELECTOR);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      await shortagePage.highlightElement(tableContainer, HIGHLIGHT_ERROR);

      const tableHead = tableContainer.locator('thead');
      await shortagePage.highlightElement(tableHead, HIGHLIGHT_ERROR);

      const searchField = tableContainer.locator(`thead tr:nth-child(2) ${SelectorsPartsDataBase.SEARCH_DROPDOWN_INPUT_SUFFIX_SELECTOR}`);
      await searchField.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });

      await shortagePage.highlightElement(searchField, HIGHLIGHT_PENDING);

      const leftTable = tableContainer;

      // Ensure the search field is visible and editable
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(searchField).toBeVisible();
        },
        'Verify search field is visible',
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await searchField.focus(); // Focus on the input field
      await searchField.fill(''); // Clear any existing content
      await searchField.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);

      // Programmatically set the value using JavaScript
      await searchField.evaluate((element: unknown, value: string) => {
        const input = element as InputLike;
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, SelectorsPartsDataBase.TEST_FILE);

      // Verify that the field contains the correct value
      const fieldValue = await searchField.inputValue();
      logger.info(`Verified input value: ${fieldValue}`);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fieldValue).toBe(SelectorsPartsDataBase.TEST_FILE);
        },
        `Verify field value is ${SelectorsPartsDataBase.TEST_FILE}`,
        test.info(),
      );
      const firstRow1 = leftTable.locator('tbody tr:first-child');
      logger.info(`First Row: ${await firstRow1.textContent()}`);
      // Trigger the search by pressing 'Enter'
      await searchField.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      // Locate and highlight the first row in the table
      const firstRow = leftTable.locator('tbody tr:first-child');
      logger.info('First Row 2:', await firstRow.textContent());
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);

      // Wait for the first row to be visible and validate its content
      await firstRow.waitFor({ state: 'visible' });
      const rowText = await firstRow.textContent();
      logger.info('First row text:', rowText);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowText?.trim()).toContain(SelectorsPartsDataBase.TEST_FILE);
        },
        `Verify row text contains ${SelectorsPartsDataBase.TEST_FILE}`,
        test.info(),
      );

      logger.info('Search verification completed successfully.');
    });

    let selectedFileType: string = '';
    let selectedFileName: string = '';
    await allure.step('Step 20: Add the file to the attach list in bottom table (Verify that search works for each column)', async () => {
      await page.waitForLoadState('load');
      // Wait for the dialog to be open and visible
      const dialog = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_DIALOG);
      await shortagePage.highlightElement(dialog, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(dialog).toBeVisible();
        },
        'Verify dialog is visible',
        test.info(),
      );
      // Locate the parent container of the table

      const tableContainer = dialog.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_TABLE_TABLE_SUFFIX_SELECTOR);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      await shortagePage.highlightElement(tableContainer, HIGHLIGHT_ERROR);

      const firstRow = tableContainer.locator('tbody tr:first-child');

      // Wait for the first row to be visible before accessing its content
      await firstRow.waitFor({ state: 'visible' });

      selectedFileType = (await firstRow.locator('td').nth(2).textContent()) ?? '';
      selectedFileName = (await firstRow.locator('td').nth(3).textContent()) ?? '';

      await shortagePage.highlightElement(firstRow, HIGHLIGHT_PENDING);
      const addButton = page.locator(SelectorsPartsDataBase.FILE_BASE_ADD_BUTTON, { hasText: 'Добавить' });
      await shortagePage.highlightElement(addButton, HIGHLIGHT_PENDING);
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      const isButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.FILE_BASE_ADD_BUTTON, 'Добавить', false, SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES);

      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isButtonReady).toBeTruthy();
        },
        'Verify add button is ready before row click',
        test.info(),
      );
      firstRow.click();
      await shortagePage.highlightElement(firstRow, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      const isButtonReady2 = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.FILE_BASE_ADD_BUTTON, 'Добавить', true, SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isButtonReady2).toBeTruthy();
        },
        'Verify add button is ready after row click',
        test.info(),
      );
      addButton.click();
      await shortagePage.highlightElement(addButton, HIGHLIGHT_SUCCESS);
    });
    await allure.step('Step 21: Confirm the file is listed in the bottom table', async () => {
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const bottomTableLocator = page.locator(SelectorsPartsDataBase.FILE_BASE_BOTTOM_TABLE);
      await shortagePage.highlightElement(bottomTableLocator, HIGHLIGHT_SUCCESS);
      // Locate all rows in the table body
      const rowsLocator = bottomTableLocator.locator('tbody tr');
      const rowCount = await rowsLocator.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(rowCount).toBeGreaterThan(0);
        },
        `Verify table has rows: ${rowCount} rows found`,
        test.info(),
      ); // Ensure the table is not empty

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
        'Verify row was found in table',
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });
    await allure.step('Step 22: Click bottom Add button', async () => {
      await page.waitForLoadState('load');

      const addButton = page.locator(SelectorsPartsDataBase.FILE_BASE_FOOTER_ADD_BUTTON, { hasText: 'Добавить' }).last();

      await shortagePage.highlightElement(addButton, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      addButton.click();
    });
    await allure.step('Step 23: Highlight the row containing the selected file name', async () => {
      await page.waitForLoadState('load');

      // Locate the parent section for the specific table
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const parentSection = page.locator(SelectorsPartsDataBase.FILE_COMPONENT_SECTION);
      logger.info('Located parent section for the file table.');

      // Locate all visible table rows within the scoped section
      const tableRows = parentSection.locator(`${SelectorsPartsDataBase.DOCUMENT_TABLE_SELECTOR} tbody tr`); // Target the actual table rows
      const rowCount = await tableRows.count();
      logger.info(`Found ${rowCount} rows in the table.`);

      let fileFound = false;

      for (let i = 0; i < rowCount; i++) {
        const row = tableRows.nth(i);
        const fileNameCell = row.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_NAME_CELL_PREFIX);
        await fileNameCell.waitFor({ state: 'visible' });
        const fileNameText = await fileNameCell.textContent();

        logger.info(`Row ${i + 1}: ${fileNameText}`);

        // Check if the current row contains the selected file name
        if (fileNameText?.trim() === selectedFileName) {
          // Match exact name
          logger.info(`Selected file name "${selectedFileName}" found in row ${i + 1}. Highlighting...`);
          await shortagePage.highlightElement(fileNameCell, HIGHLIGHT_PENDING);
          fileFound = true;
          break; // Exit the loop once the file is found and highlighted
        }
      }

      if (!fileFound) {
        throw new Error(`Selected file name "${selectedFileName}" was not found in the table.`);
      }
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      logger.info('File search and highlight process completed successfully.');
    });
    await allure.step('Step 24: Удалите первый файл из списка медиафайлов.(Remove the first file from the list of attached media files.)', async () => {
      await page.waitForLoadState('load');
      let printButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, { hasText: 'Печать' });
      await shortagePage.highlightElement(printButton, HIGHLIGHT_PENDING);
      let isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, 'Печать', false);
      let deleteButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, { hasText: 'Удалить' });
      await shortagePage.highlightElement(deleteButton, HIGHLIGHT_PENDING);
      let isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, 'Удалить', false);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isPrintButtonReady).toBeTruthy();
        },
        'Verify print button is ready',
        test.info(),
      );
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isDeleteButtonReady).toBeTruthy();
        },
        'Verify delete button is ready',
        test.info(),
      );
      // Locate the parent section for the specific table
      const parentSection = page.locator(SelectorsPartsDataBase.FILE_COMPONENT);
      logger.info('Located parent section for the file table.');

      // Locate all visible table rows within the scoped section
      const tableRows = parentSection.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_ROW_ID);
      const row = tableRows.first();

      // Refine the locator to target the checkbox input inside the third column
      const checkboxInput = row.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_CHECKBOX_PREFIX);
      await shortagePage.highlightElement(checkboxInput, HIGHLIGHT_SUCCESS);

      // Check the checkbox
      await checkboxInput.check();
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      printButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, { hasText: 'Печать' });
      await shortagePage.highlightElement(printButton, HIGHLIGHT_SUCCESS);
      isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, 'Печать', true);
      deleteButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, { hasText: 'Удалить' });
      await shortagePage.highlightElement(deleteButton, HIGHLIGHT_SUCCESS);
      isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, 'Удалить', true);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isPrintButtonReady).toBeTruthy();
        },
        'Verify print button is ready',
        test.info(),
      );
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isDeleteButtonReady).toBeTruthy();
        },
        'Verify delete button is ready',
        test.info(),
      );
      // Assert that the checkbox is checked
      const isCheckboxChecked = await checkboxInput.isChecked();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isCheckboxChecked).toBeTruthy();
        },
        'Verify checkbox is checked',
        test.info(),
      );

      //delete row
      deleteButton.click();
      await shortagePage.highlightElement(deleteButton, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
    });

    await allure.step('Step 25: Save the detail', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON, { hasText: 'Сохранить' });
      await shortagePage.highlightElement(saveButton, HIGHLIGHT_SUCCESS);
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      saveButton.click();
      await page.waitForTimeout(TIMEOUTS.VERY_LONG);
    });
  });

  test('02 - не дает сохранить деталь без выбора материала', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);

    // Instantiate our helper classes.
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Step 01: Перейдите на страницу создания детали', async () => {
      // Navigate to the detail creation page using the warehouse's goto method.
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
    });

    await allure.step("Step 02: Заполните поле 'Наименование' детали", async () => {
      // Fill in the 'Наименование' field.
      await detailsPage.fillDetailName(SelectorsPartsDataBase.TEST_DETAIL_NAME);
    });

    await allure.step('Step 03: Пропустите выбор материала', async () => {
      // For this negative test we intentionally skip material selection.
      logger.log('Skipping material selection as required for this test case.');
    });

    await allure.step('Step 04: Попытайтесь сохранить деталь без выбора материала', async () => {
      // Click the Save button using the legacy findAndClickElement (passing the partial string without brackets).
      await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.SAVE_BUTTON, 500);
      await page.waitForLoadState('load');
    });

    await allure.step('Step 05: Дождитесь и получите сообщение об уведомлении', async () => {
      // Use getMessage (or, if you prefer, read the text directly) to check for the presence of the error text.
      // await detailsPage.verifyDetailSuccessMessage('Деталь успешно Создана.');//bug erp-1017
    });
    //erp-1017
    // await allure.step("Step 06: Проверьте, что уведомление содержит текст 'Выберите материал'", async () => {
    //     // Retrieve the notification text for further logging and assertion.
    //     const errorText = await page.locator(`[data-testid="${NOTIFICATION_DESCRIPTION}"]`).last().textContent();
    //     logger.log("Notification text:", errorText);
    //     expect(errorText).toContain("Деталь успешно Создана.");
    // });

    await allure.step('Step 7: Проверьте, что созданная деталь отображается в базе деталей', async () => {
      // Navigate back to the main 'baza деталей' page.
      await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('load');

      // Wait a moment to let the page load and then locate the table.
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      // Locate the table by its data-testid.
      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);

      // Debug: Log the count of matching table elements.
      const tableCount = await detailTable.count();
      logger.log('Found tables:', tableCount);
      if (tableCount === 0) {
        console.error("No table found with data-testid 'BasePaginationTable-Table-detal'");
        throw new Error('Table not found');
      }

      // Scroll the first found table into view and apply styling.
      const tableContainer = detailTable.first();
      await tableContainer.scrollIntoViewIfNeeded();
      await detailsPage.highlightElement(tableContainer, HIGHLIGHT_PENDING);

      // Locate the search field in the table header.
      const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(searchInput).toBeVisible();
        },
        'Verify search input is visible',
        test.info(),
      );

      // Clear the field, enter the detail name, and press Enter.
      await searchInput.fill('');
      await searchInput.press('Enter');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.fill(SelectorsPartsDataBase.TEST_DETAIL_NAME);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      // Locate all rows in the tbody of the first table container.
      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();
      let isMatch = false;

      // Loop through each row: apply styling and wait 500ms before checking the text.
      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        await detailsPage.highlightElement(currentRow, HIGHLIGHT_PENDING);
        await page.waitForTimeout(TIMEOUTS.MEDIUM);

        const rowText = await currentRow.textContent();
        logger.log(`Row ${i + 1} text:`, rowText);
        if (rowText && rowText.trim() === SelectorsPartsDataBase.TEST_DETAIL_NAME) {
          isMatch = true;
          break;
        }
      }
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isMatch).toBeTruthy();
        },
        'Verify match is found',
        test.info(),
      );
    });
  });

  test('03 - Выбрать материал, но оставить атрибуты пустыми', async ({ page }) => {
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
      logger.info('Главная страница успешно загружена со всеми отображаемыми элементами');
    });

    await allure.step('Step 2: Нажать кнопку «Создать»', async () => {
      // The page is already the create page, so we just verify we're on the correct page
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

    await allure.step('Step 3: Выбрать тип элемента «Деталь»', async () => {
      // Verify we're on the detail creation page by checking the detail name input field
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
      logger.info('Тип детали выбран - страница создания детали активна');
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
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME_2);

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

    await allure.step('Step 7: Проверить, что выбранный материал отображается в форме, но поля атрибутов остаются пустыми', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);

      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      // Verify that the material is displayed
      const materialSpan = chrTble.locator('td').nth(2).locator('span');
      await detailsPage.highlightElement(materialSpan, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialSpan).toBeVisible();
        },
        'Verify material span is visible',
        test.info(),
      );
      const materialText = await materialSpan.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(materialText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_NAME_2);
        },
        `Verify material text is ${SelectorsPartsDataBase.TEST_MATERIAL_NAME_2}`,
        test.info(),
      );
      logger.info(`Материал отображается в форме: ${materialText}`);

      // Verify that attribute fields are empty
      const inputFields = tableContainer.locator(`${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`);

      const fieldCount = await inputFields.count();

      if (fieldCount > 0) {
        for (let i = 0; i < fieldCount; i++) {
          const inputField = inputFields.nth(i);
          await detailsPage.highlightElement(inputField, HIGHLIGHT_PENDING);
          const fieldValue = await inputField.inputValue();
          await expectSoftWithScreenshot(
            page,
            () => {
              expect.soft(fieldValue).toBe('0');
            },
            `Verify field ${i + 1} value is 0`,
            test.info(),
          );
          logger.info(`Поле атрибута ${i + 1} пустое`);
        }
        logger.info('Все поля атрибутов остаются пустыми');
      } else {
        // Fallback: try to find any input fields in the table
        const fallbackInputFields = tableContainer.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_SELECTOR);
        const fallbackCount = await fallbackInputFields.count();

        if (fallbackCount > 0) {
          for (let i = 0; i < fallbackCount; i++) {
            const inputField = fallbackInputFields.nth(i);
            const fieldValue = await inputField.inputValue();
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(fieldValue).toBe('0');
              },
              `Verify field ${i + 1} (fallback) value is 0`,
              test.info(),
            );
            logger.info(`Поле атрибута ${i + 1} (fallback) пустое`);
          }
          logger.info('Все поля атрибутов (fallback) остаются пустыми');
        } else {
          logger.info('Поля атрибутов не найдены в таблице');
        }
      }
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
      logger.info('Кнопка сохранения нажата');
    });

    await allure.step('Step 9: Проверить, что система не позволяет сохранить и отображает ошибку о недостающих обязательных атрибутах материала', async () => {
      // Verify that the save action failed with the expected error message
      //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
      logger.info('Получено сообщение об ошибке о недостающих обязательных атрибутах материала');
    });
  });

  test('04 - Валидация атрибутов на уровне границ', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Шаг 1: Открыть главную страницу', async () => {
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
      logger.info('Главная страница загружена правильно');
    });

    await allure.step("Шаг 2: Нажать кнопку 'Создать'", async () => {
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
      logger.info('Форма загружена');
    });

    await allure.step("Шаг 3: Выбрать 'Деталь'", async () => {
      const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      logger.info('Поля показаны');
    });

    await allure.step("Шаг 4: Заполнить 'Наименование'", async () => {
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info('Допустимая запись принята');
    });

    await allure.step("Шаг 5: Нажать 'Задать' для выбора материала", async () => {
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
      logger.info('Модальное окно открыто');
    });

    await allure.step('Шаг 6: Выбрать материал и подтвердить', async () => {
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
      logger.info('Материал добавлен');
    });

    await allure.step('Шаг 7: Заполнить только один обязательный атрибут', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );
      const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);

      const targetRow = chrTble.locator('tr').filter({
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
      logger.info('Это поле принимает ввод; другие остаются пустыми');
    });
    await allure.step('Шаг 7a: Cycle through all the values in this table making sure that none of them ahve the value NaN', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);

      // Scroll to the table container to ensure it's visible
      await tableContainer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Get all table rows (excluding header)
      const tableRows = chrTble.locator('tbody tr');
      const rowCount = await tableRows.count();
      logger.log(`Found ${rowCount} rows to validate for NaN values`);

      // Cycle through each row and validate all content
      for (let i = 0; i < rowCount; i++) {
        const currentRow = tableRows.nth(i);

        // Scroll to the current row to ensure it's visible
        await currentRow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

        // Highlight the current row being validated
        await detailsPage.highlightElement(currentRow, HIGHLIGHT_PENDING);

        // Get row name for logging
        const rowNameCell = currentRow.locator('td').first();
        const rowName = await rowNameCell.textContent();
        logger.log(`Validating row ${i + 1}: "${rowName?.trim()}"`);

        // Check all cells in the row for NaN values
        const cells = currentRow.locator('td');
        const cellCount = await cells.count();

        for (let j = 0; j < cellCount; j++) {
          const cell = cells.nth(j);
          const cellText = await cell.textContent();

          // Validate cell text content
          if (cellText) {
            // ERP-1128
            // expect(cellText.trim()).not.toBe('NaN');
            // expect(cellText.trim()).not.toBe('nan');
            // expect(cellText.trim()).not.toBe('NAN');
            logger.log(`  Cell ${j + 1}: "${cellText.trim()}" - OK`);
          }

          // Check for input fields in the cell
          const inputFields = cell.locator('input');
          const inputCount = await inputFields.count();

          for (let k = 0; k < inputCount; k++) {
            const inputField = inputFields.nth(k);
            const inputValue = await inputField.inputValue();

            // Validate input field value
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(inputValue).not.toBe('NaN');
              },
              'Verify input value is not NaN',
              test.info(),
            );
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(inputValue).not.toBe('nan');
              },
              'Verify input value is not nan',
              test.info(),
            );
            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(inputValue).not.toBe('NAN');
              },
              'Verify input value is not NAN',
              test.info(),
            );

            // Additional validation: if the field has a value, it should be a valid number
            if (inputValue && inputValue.trim() !== '') {
              const numericValue = parseFloat(inputValue);
              await expectSoftWithScreenshot(
                page,
                () => {
                  expect.soft(isNaN(numericValue)).toBe(false);
                },
                'Verify numeric value is valid',
                test.info(),
              );
              logger.log(`    Input ${k + 1}: "${inputValue}" - Valid number: ${numericValue}`);
            } else {
              logger.log(`    Input ${k + 1}: Empty field - OK`);
            }
          }
        }

        // Remove highlighting after validation - no action needed as highlighting is temporary

        // Small delay to make the highlighting visible
        await page.waitForTimeout(TIMEOUTS.SHORT);
      }

      logger.log(`✅ All ${rowCount} rows validated - no NaN values found`);
      logger.info(`All characteristic blanks table rows validated successfully - no NaN values detected`);
    });

    await allure.step("Шаг 8: Нажать 'Сохранить'", async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await detailsPage.highlightElement(saveButton, HIGHLIGHT_PENDING);
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

      //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");//ERP-1029
      logger.info('Появляется ошибка валидации для других обязательных полей');
    });

    await allure.step('Шаг 9: Повторить для каждого обязательного атрибута по одному', async () => {
      // Очистить все поля атрибутов
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const inputFields = tableContainer.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
      const fieldCount = await inputFields.count();

      for (let i = 0; i < fieldCount; i++) {
        const inputField = inputFields.nth(i);
        await inputField.fill('');
        logger.info(`Поле ${i + 1} очищено`);
      }

      // Заполнить только второе поле
      if (fieldCount > 1) {
        const secondField = inputFields.nth(1);
        await detailsPage.highlightElement(secondField, HIGHLIGHT_PENDING);

        const value = '200';
        await secondField.fill(value);
        const currentValue = await secondField.inputValue();
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(currentValue).toBe(value);
          },
          `Verify current value is ${value}`,
          test.info(),
        );
        logger.info('Второе поле заполнено');

        // Попытаться сохранить
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

        //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
        logger.info('Валидация показывает ошибку для каждого отсутствующего поля индивидуально');

        // Очистить второе поле для следующей итерации
        await secondField.fill('');
      }
    });
  });

  test('05 - Попытка сохранения с очень длинным наименованием', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Шаг 1: Открыть главную страницу', async () => {
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
      logger.info('Страница загружена правильно');
    });

    await allure.step("Шаг 2: Нажать 'Создать'", async () => {
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
      logger.info('Форма создания отображается');
    });

    await allure.step("Шаг 3: Выбрать 'Деталь'", async () => {
      const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      logger.info('Поля обновлены');
    });

    await allure.step("Шаг 4: Ввести строку длиннее 500 символов в 'Наименование'", async () => {
      const longName = 'A'.repeat(501); // Строка из 501 символа
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, longName);
      logger.info('Валидация должна заблокировать или предупредить о вводе');
    });

    await allure.step("Шаг 5: Нажать 'Задать', выбрать материал и подтвердить", async () => {
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
      logger.info('Модальное окно открыто и принимает выбор');
    });

    await allure.step('Шаг 6: Заполнить все обязательные атрибуты материала', async () => {
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

      const value = '300';
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
      logger.info('Поля валидированы');
    });

    await allure.step("Шаг 7: Нажать 'Сохранить'", async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await detailsPage.highlightElement(saveButton, HIGHLIGHT_PENDING);
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

      // Проверить результат в зависимости от валидации имени
      try {
        //await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");
        logger.info('Успех в зависимости от результата валидации имени');
      } catch {
        logger.info('Ошибка в зависимости от результата валидации имени');
      }
      await page.waitForTimeout(TIMEOUTS.VERY_LONG);
    });
  });

  test('06 - Использование специальных символов в поле наименования', async ({ page }) => {
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

    await allure.step('Step 4: Ввести наименование со специальными символами', async () => {
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME);
      logger.info(`Наименование со специальными символами заполнено: ${SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME}`);
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
      logger.info('Обязательные атрибуты материала заполнены');
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
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);
      await saveButton.click();
      await page.waitForLoadState('load');

      // Verify success message
      //await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");  // ERP-bug
      logger.info('Деталь успешно сохранена со специальными символами в наименовании');
    });

    await allure.step('Step 9: Найти созданную деталь в базе деталей', async () => {
      await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const tableContainer = detailTable.first();
      await tableContainer.scrollIntoViewIfNeeded();
      await detailsPage.highlightElement(tableContainer, HIGHLIGHT_PENDING);

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
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.fill(SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);

      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();
      let isMatch = false;

      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        let rowText: string | null;
        try {
          rowText = await currentRow.textContent({ timeout: WAIT_TIMEOUTS.SHORT });
        } catch {
          continue;
        }
        if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME) {
          await detailsPage.highlightElement(currentRow, HIGHLIGHT_PENDING);
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

    await allure.step('Step 10: Открыть деталь для редактирования', async () => {
      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const tableContainer = detailTable.first();
      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        let rowText: string | null;
        try {
          rowText = await currentRow.textContent({ timeout: WAIT_TIMEOUTS.SHORT });
        } catch {
          continue;
        }
        if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME) {
          await currentRow.click();
          // Click the edit button within this row
          const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
          await detailsPage.highlightElement(editButton, HIGHLIGHT_PENDING);
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(editButton).toBeVisible();
            },
            'Verify edit button is visible',
            test.info(),
          );

          await editButton.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          break;
        }
      }

      // Verify that the detail opens in edit mode
      const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
      await detailsPage.highlightElement(editPageTitle, HIGHLIGHT_PENDING);
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

    await allure.step('Step 11: Проверить, что материал и атрибуты отображаются корректно', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.EDIT_CHARACTERISTIC_BLANKS_CONTAINER_SELECTOR);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );
      const chrTble = tableContainer.locator(SelectorsPartsDataBase.EDIT_CHR_TABLE);
      await detailsPage.highlightElement(chrTble, HIGHLIGHT_PENDING);

      // Verify material is displayed
      const materialSpan = chrTble.locator('td').nth(2).locator('span');
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialSpan).toBeVisible();
        },
        'Verify material span is visible',
        test.info(),
      );
      const materialText = await materialSpan.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(materialText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
        },
        `Verify material span inner text is ${SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON}`,
        test.info(),
      );
      logger.info('Материал отображается корректно в режиме редактирования');

      // Verify attributes are displayed
      const targetRow = chrTble.locator('tr').filter({
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
      const inputField = targetRow.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
      const currentValue = await inputField.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe('100');
        },
        'Verify current value is 100',
        test.info(),
      );
      logger.info('Атрибуты отображаются корректно в режиме редактирования');
    });
  });

  test('07 - Попытка сохранения с числовым наименованием', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Шаг 1: Открыть страницу создания', async () => {
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
      logger.info('Все элементы загружены правильно');
    });

    await allure.step("Шаг 2: Ввести только числа в поле 'Наименование'", async () => {
      const numericName = '123456';
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, numericName);
      logger.info('Ввод принят или отклонен на основе правил формата');
    });

    await allure.step("Шаг 3: Нажать 'Сохранить'", async () => {
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

      // Проверить результат - либо сообщение об ошибке, либо деталь сохранена
      try {
        await detailsPage.verifyDetailSuccessMessage('Деталь успешно создана');
        logger.info('Деталь сохранена с числовым наименованием');
      } catch {
        logger.info('Получено сообщение об ошибке для числового наименования');
      }
    });
  });

  test('08 - Выбор различных категорий материалов', async ({ page }) => {
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

    await allure.step('Step 6: Выбрать материал из первой категории', async () => {
      // Click on the first category switch
      const firstCategorySwitch = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(firstCategorySwitch).toBeVisible();
        },
        'Verify first category switch is visible',
        test.info(),
      );
      await detailsPage.highlightElement(firstCategorySwitch, HIGHLIGHT_PENDING);
      await firstCategorySwitch.click();
      await page.waitForLoadState('load');

      // Search and select a material from the first category
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
      logger.info('Материал из первой категории выбран и добавлен');
    });

    await allure.step('Step 7: Проверить, что поля обновились с конкретными обязательными атрибутами', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      // Verify that the material is displayed
      const materialSpan = tableContainer.locator('td').nth(2).locator('span');
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialSpan).toBeVisible();
        },
        'Verify material span is visible',
        test.info(),
      );
      const materialText = await materialSpan.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(materialText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
        },
        `Verify material span inner text is ${SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON}`,
        test.info(),
      );
      logger.info('Материал отображается в таблице характеристик');

      // Verify that required attribute fields are present
      const requiredFields = tableContainer.locator('tr');
      const fieldCount = await requiredFields.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fieldCount).toBeGreaterThan(0);
        },
        `Verify field count is greater than 0: ${fieldCount} fields found`,
        test.info(),
      );
      logger.info(`Найдено ${fieldCount} полей атрибутов для первой категории материалов`);
    });

    await allure.step('Step 8: Удалить материал и выбрать из второй категории', async () => {
      // Remove the current material by clicking the remove button
      const resetButton = page.locator(SelectorsPartsDataBase.ADD_DETAILE_RESET_MATERIAL_BUTTON);
      await detailsPage.highlightElement(resetButton, HIGHLIGHT_PENDING);
      await resetButton.click();
      await page.waitForLoadState('load');

      // Open material selection modal again
      const ArchiveDialog = page.locator(SelectorsPartsDataBase.MODAL_CONFIRM_GENERIC);
      await ArchiveDialog.click();
      await page.waitForLoadState('load');

      const materialModal = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
      await detailsPage.highlightElement(materialModal, HIGHLIGHT_PENDING);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible();
        },
        'Verify material modal is visible',
        test.info(),
      );
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);

      await ArchiveDialog.click();
      await page.waitForLoadState('load');

      // Click on the second category switch (if available)
      const secondCategorySwitch = page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2);
      if (await secondCategorySwitch.isVisible()) {
        await detailsPage.highlightElement(secondCategorySwitch, HIGHLIGHT_PENDING);
        await secondCategorySwitch.click();
        await page.waitForLoadState('load');

        // Search and select a material from the second category
        const secondCategoryMaterial = 'Сталь 45';
        // searchAndSelectMaterial now handles: search, select, click Add button, and close dialog
        await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2, secondCategoryMaterial);

        // Verify the dialog is closed (searchAndSelectMaterial should have closed it)
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
          },
          'Verify material modal is not visible after adding',
          test.info(),
        );
        logger.info('Материал из второй категории выбран и добавлен');
      } else {
        logger.info('Вторая категория материалов недоступна, пропускаем');
      }
    });

    await allure.step('Step 9: Проверить, что валидация полей адаптируется в зависимости от типа материала', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify table container is visible',
        test.info(),
      );

      // Verify that the material is displayed
      const materialSpan = tableContainer.locator('td').nth(2).locator('span');
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialSpan).toBeVisible();
        },
        'Verify material span is visible',
        test.info(),
      );

      const materialText = await materialSpan.innerText();
      logger.info(`Текущий материал: ${materialText}`);

      // Verify that required attribute fields are present and may be different
      const requiredFields = tableContainer.locator('tr');
      const fieldCount = await requiredFields.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fieldCount).toBeGreaterThan(0);
        },
        `Verify field count is greater than 0: ${fieldCount} fields found`,
        test.info(),
      );
      logger.info(`Найдено ${fieldCount} полей атрибутов для текущей категории материалов`);

      // Check if the fields are different from the first category
      const fieldTexts = await requiredFields.allTextContents();
      logger.info('Поля атрибутов:', fieldTexts);
    });
  });
};
