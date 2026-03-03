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
      await page.waitForLoadState('load');
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const characteristicBlanksTable = tableContainer.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_TBODY);
      const materialCell = characteristicBlanksTable.getByText(SelectorsPartsDataBase.TEST_MATERIAL_NAME, { exact: false });
      await tableContainer.waitFor({ state: 'visible' });
      await materialCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.highlightElement(materialCell, HIGHLIGHT_PENDING);
      const materialText = await materialCell.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(materialText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_NAME);
        },
        `Verify target span inner text is ${SelectorsPartsDataBase.TEST_MATERIAL_NAME}`,
        test.info(),
      );
    });
    await allure.step('Step 07: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)', async () => {
      await page.waitForLoadState('load');
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const characteristicBlanksTable = tableContainer.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_TBODY);
      const materialCell = characteristicBlanksTable.getByText(SelectorsPartsDataBase.TEST_MATERIAL_NAME, { exact: false });
      await tableContainer.waitFor({ state: 'visible' });
      await materialCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

      await shortagePage.highlightElement(materialCell, HIGHLIGHT_PENDING);
      const materialText = await materialCell.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(materialText).toBe(SelectorsPartsDataBase.TEST_MATERIAL_NAME);
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

    await allure.step('Step 1: Открыть страницу создания детали', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify create page is visible',
        test.info(),
      );
      logger.info('Страница создания детали загружена');
    });

    await allure.step('Step 2: Проверить заголовок и заполнить наименование', async () => {
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        'Verify create page title',
        test.info(),
      );
      const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info(`Наименование заполнено: ${SelectorsPartsDataBase.TEST_DETAIL_NAME}`);
    });

    await allure.step('Step 3: Открыть модальное окно выбора материала', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify "Задать" button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material modal is open',
        test.info(),
      );
      logger.info('Модальное окно выбора материала открыто');
    });

    await allure.step('Step 4: Выбрать материал Войлок акустический 10мм и нажать Добавить', async () => {
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME_2);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal closed after Add',
        test.info(),
      );
      logger.info('Материал выбран, модальное окно закрыто');
    });

    await allure.step('Step 5: Дождаться появления материала в форме (атрибуты не заполняем)', async () => {
      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(section).toBeVisible();
        },
        'Verify Characteristic Blanks section is visible',
        test.info(),
      );
      const materialCell = section.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_TBODY_SELECTED_MATERIAL_NAME).getByText(SelectorsPartsDataBase.TEST_MATERIAL_NAME_2, { exact: false });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialCell).toBeVisible({ timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        },
        'Verify selected material name is visible in form (material was added)',
        test.info(),
      );
      await detailsPage.highlightElement(materialCell, HIGHLIGHT_PENDING);
      logger.info('Материал отображается в форме; атрибуты не заполняем');
    });

    await allure.step('Step 6: Нажать Сохранить', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify Save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');
      logger.info('Кнопка Сохранить нажата');
    });

    await allure.step('Step 7: Проверить сообщение об ошибке валидации', async () => {
      const notificationText = await detailsPage.waitForNotificationContaining(SelectorsPartsDataBase.VALIDATION_ERROR_ALL_CHARACTERISTICS_REQUIRED);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(notificationText).not.toBeNull();
          expect.soft(notificationText).toContain(SelectorsPartsDataBase.VALIDATION_ERROR_ALL_CHARACTERISTICS_REQUIRED);
        },
        'Verify validation error: fill all characteristics',
        test.info(),
      );
      logger.info('Система отобразила ошибку о необходимости заполнить все характеристики');
    });
  });

  test('04 - Валидация атрибутов на уровне границ', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Step 1: Открыть страницу создания детали и заполнить наименование', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify create page is visible',
        test.info(),
      );
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        'Verify create page title',
        test.info(),
      );
      const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info('Страница создания открыта, наименование заполнено');
    });

    await allure.step('Step 2: Открыть модальное окно выбора материала', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify "Задать" button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material modal is open',
        test.info(),
      );
      logger.info('Модальное окно выбора материала открыто');
    });

    await allure.step('Step 3: Выбрать материал Войлок акустический 10мм и нажать Добавить', async () => {
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME_2);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal closed after Add',
        test.info(),
      );
      logger.info('Материал выбран, модальное окно закрыто');
    });

    await allure.step('Step 4: Дождаться появления материала в форме (атрибуты не заполняем)', async () => {
      await page.waitForLoadState('load');
      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(section).toBeVisible();
        },
        'Verify Characteristic Blanks section is visible',
        test.info(),
      );
      // Wait for material name anywhere in section (cell or nested element)
      const materialInSection = section.getByText(SelectorsPartsDataBase.TEST_MATERIAL_NAME_2, { exact: false });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialInSection).toBeVisible({ timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        },
        'Verify selected material name is visible in form',
        test.info(),
      );
      logger.info('Материал отображается в форме; атрибуты не заполняем');
    });

    await allure.step('Step 5: Проверить таблицу атрибутов на отсутствие NaN в полях', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);
      await tableContainer.scrollIntoViewIfNeeded();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);

      const tableRows = chrTble.locator('tbody tr');
      const rowCount = await tableRows.count();
      logger.log(`Found ${rowCount} rows to validate for NaN values`);

      for (let i = 0; i < rowCount; i++) {
        const currentRow = tableRows.nth(i);
        await currentRow.scrollIntoViewIfNeeded();
        await page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        await detailsPage.highlightElement(currentRow, HIGHLIGHT_PENDING);

        const rowNameCell = currentRow.locator('td').first();
        const rowName = await rowNameCell.textContent();
        logger.log(`Validating row ${i + 1}: "${rowName?.trim()}"`);

        const cells = currentRow.locator('td');
        const cellCount = await cells.count();
        for (let j = 0; j < cellCount; j++) {
          const cell = cells.nth(j);
          const cellText = await cell.textContent();
          if (cellText) {
            logger.log(`  Cell ${j + 1}: "${cellText.trim()}" - OK`);
          }

          const inputFields = cell.locator('input');
          const inputCount = await inputFields.count();
          for (let k = 0; k < inputCount; k++) {
            const inputField = inputFields.nth(k);
            const inputValue = await inputField.inputValue();

            await expectSoftWithScreenshot(
              page,
              () => {
                expect.soft(inputValue).not.toBe('NaN');
                expect.soft(inputValue).not.toBe('nan');
                expect.soft(inputValue).not.toBe('NAN');
              },
              'Verify input value is not NaN/nan/NAN',
              test.info(),
            );
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
        await page.waitForTimeout(TIMEOUTS.SHORT);
      }

      logger.info(`All ${rowCount} rows validated - no NaN values found`);
    });

    await allure.step('Step 6: Нажать Сохранить и проверить ошибку валидации', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify Save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');

      const notificationText = await detailsPage.waitForNotificationContaining(SelectorsPartsDataBase.VALIDATION_ERROR_ALL_CHARACTERISTICS_REQUIRED);
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(notificationText).not.toBeNull();
          expect.soft(notificationText).toContain(SelectorsPartsDataBase.VALIDATION_ERROR_ALL_CHARACTERISTICS_REQUIRED);
        },
        'Verify validation error for missing required attributes',
        test.info(),
      );
      logger.info('Ошибка валидации отображается');
    });

    await allure.step('Step 7: Заполнить только второе поле атрибута и снова проверить ошибку валидации', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const inputFields = tableContainer.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
      const fieldCount = await inputFields.count();

      for (let i = 0; i < fieldCount; i++) {
        await inputFields.nth(i).fill('');
      }
      logger.info('Все поля атрибутов очищены');

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
          `Verify second field value is ${value}`,
          test.info(),
        );

        const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(saveButton).toBeVisible();
          },
          'Verify Save button is visible',
          test.info(),
        );
        await saveButton.click();
        await page.waitForLoadState('load');

        const notificationTextStep7 = await detailsPage.waitForNotificationContaining(SelectorsPartsDataBase.VALIDATION_ERROR_ALL_CHARACTERISTICS_REQUIRED);
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(notificationTextStep7).not.toBeNull();
            expect.soft(notificationTextStep7).toContain(SelectorsPartsDataBase.VALIDATION_ERROR_ALL_CHARACTERISTICS_REQUIRED);
          },
          'Verify validation error when one attribute is still missing',
          test.info(),
        );
        await secondField.fill('');
        logger.info('Валидация показывает ошибку при одном незаполненном поле');
      }
    });
  });

  test('05 - Попытка сохранения с очень длинным наименованием', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);

    await allure.step('Step 1: Открыть страницу создания и ввести наименование 501 символ', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify create page is visible',
        test.info(),
      );
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        'Verify create page title',
        test.info(),
      );
      const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(detailNameInput).toBeVisible();
        },
        'Verify detail name input is visible',
        test.info(),
      );
      const longName = 'A'.repeat(501);
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, longName);
      logger.info('Наименование 501 символ заполнено');
    });

    await allure.step('Step 2: Открыть модальное окно выбора материала', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify "Задать" button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material modal is open',
        test.info(),
      );
      logger.info('Модальное окно выбора материала открыто');
    });

    await allure.step('Step 3: Выбрать материал Шестигранник и нажать Добавить', async () => {
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal closed after Add',
        test.info(),
      );
      logger.info('Материал выбран, модальное окно закрыто');
    });

    await allure.step('Step 4: Дождаться появления материала в форме', async () => {
      await page.waitForLoadState('load');
      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(section).toBeVisible();
        },
        'Verify Characteristic Blanks section is visible',
        test.info(),
      );
      const materialInSection = section.getByText(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON, { exact: false });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialInSection).toBeVisible({ timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        },
        'Verify selected material name is visible in form',
        test.info(),
      );
      logger.info('Материал отображается в форме');
    });

    await allure.step('Step 5: Заполнить атрибут Длина (Д) значением 300', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const targetRow = tableContainer.locator('tr').filter({ has: page.locator('td:has-text("Длина (Д)")') });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(targetRow).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify row Длина (Д) is visible',
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
        `Verify Длина (Д) value is ${value}`,
        test.info(),
      );
      logger.info('Атрибут Длина (Д) заполнен');
    });

    await allure.step('Step 6: Нажать Сохранить и проверить ответ системы', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify Save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const notificationText = await detailsPage.getNotificationMessage();
      const hasNotification = notificationText != null && notificationText.length > 0;
      const stillOnCreatePage = await page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE).isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(hasNotification || stillOnCreatePage).toBe(true);
        },
        'Verify system shows a notification or create page remains (save blocked or validation)',
        test.info(),
      );
      logger.info(hasNotification ? 'Получен ответ системы' : 'Страница создания осталась (сохранение не выполнено или валидация)');
    });
  });

  test('06 - Использование специальных символов в поле наименования', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);
    const specialName = SelectorsPartsDataBase.U006_SPECIAL_CHAR_NAME;

    await allure.step('Step 1: Открыть страницу создания и ввести наименование со специальными символами', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify create page is visible',
        test.info(),
      );
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        'Verify create page title',
        test.info(),
      );
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, specialName);
      logger.info(`Наименование заполнено: ${specialName}`);
    });

    await allure.step('Step 2: Открыть модальное окно выбора материала', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify "Задать" button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material modal is open',
        test.info(),
      );
      logger.info('Модальное окно выбора материала открыто');
    });

    await allure.step('Step 3: Выбрать материал Шестигранник и нажать Добавить', async () => {
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal closed after Add',
        test.info(),
      );
      logger.info('Материал выбран, модальное окно закрыто');
    });

    await allure.step('Step 4: Дождаться появления материала в форме', async () => {
      await page.waitForLoadState('load');
      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(section).toBeVisible();
        },
        'Verify Characteristic Blanks section is visible',
        test.info(),
      );
      const materialInSection = section.getByText(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON, { exact: false });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialInSection).toBeVisible({ timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        },
        'Verify selected material name is visible in form',
        test.info(),
      );
      logger.info('Материал отображается в форме');
    });

    await allure.step('Step 5: Заполнить атрибут Длина (Д) значением 100', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      const targetRow = tableContainer.locator('tr').filter({ has: page.locator('td:has-text("Длина (Д)")') });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(targetRow).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify row Длина (Д) is visible',
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
        `Verify Длина (Д) value is ${value}`,
        test.info(),
      );
      logger.info('Атрибут Длина (Д) заполнен');
    });

    await allure.step('Step 6: Нажать Сохранить', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify Save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');
      logger.info('Деталь сохранена');
    });

    await allure.step('Step 7: Перейти в базу деталей и найти созданную деталь по наименованию', async () => {
      await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
      await page.waitForLoadState('load');
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
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      await searchInput.fill(specialName);
      await searchInput.press('Enter');
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.INPUT_SET);

      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();
      let isMatch = false;
      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        const rowText = await currentRow.textContent({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => null);
        if (rowText && rowText.includes(specialName)) {
          await detailsPage.highlightElement(currentRow, HIGHLIGHT_PENDING);
          isMatch = true;
          break;
        }
      }
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(isMatch).toBe(true);
        },
        'Verify created detail is found in database',
        test.info(),
      );
      logger.info('Созданная деталь найдена в базе деталей');
    });

    await allure.step('Step 8: Открыть деталь для редактирования', async () => {
      const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
      const tableContainer = detailTable.first();
      const rows = tableContainer.locator('tbody tr');
      const rowCount = await rows.count();
      for (let i = 0; i < rowCount; i++) {
        const currentRow = rows.nth(i);
        const rowText = await currentRow.textContent({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => null);
        if (rowText && rowText.includes(specialName)) {
          await currentRow.click();
          const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(editButton).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            },
            'Verify edit button is visible',
            test.info(),
          );
          await editButton.click();
          await page.waitForTimeout(TIMEOUTS.MEDIUM);
          break;
        }
      }
      const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(editPageTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify edit page title is visible',
        test.info(),
      );
      logger.info('Деталь открыта в режиме редактирования');
    });

    await allure.step('Step 9: Проверить материал и атрибут Длина (Д) на странице редактирования', async () => {
      const tableContainer = page.locator(SelectorsPartsDataBase.EDIT_CHARACTERISTIC_BLANKS_CONTAINER_SELECTOR);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(tableContainer).toBeVisible();
        },
        'Verify edit table container is visible',
        test.info(),
      );
      const chrTble = tableContainer.locator(SelectorsPartsDataBase.EDIT_CHR_TABLE);
      const materialCell = chrTble.getByText(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON, { exact: false });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialCell).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material is visible in edit table',
        test.info(),
      );
      const materialText = await materialCell.innerText();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(materialText).toContain(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
        },
        'Verify material text in edit',
        test.info(),
      );
      const targetRow = chrTble.locator('tr').filter({ has: page.locator('td:has-text("Длина (Д)")') });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(targetRow).toBeVisible();
        },
        'Verify row Длина (Д) is visible',
        test.info(),
      );
      const inputField = targetRow.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
      const currentValue = await inputField.inputValue();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(currentValue).toBe('100');
        },
        'Verify Длина (Д) value is 100 in edit',
        test.info(),
      );
      logger.info('Материал и атрибуты отображаются корректно');
    });
  });

  test('07 - Попытка сохранения с числовым наименованием', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);
    const numericName = '123456';

    await allure.step('Step 1: Открыть страницу создания и ввести только числа в наименование', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify create page is visible',
        test.info(),
      );
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        'Verify create page title',
        test.info(),
      );
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, numericName);
      logger.info(`Наименование заполнено числами: ${numericName}`);
    });

    await allure.step('Step 2: Нажать Сохранить и проверить ответ системы', async () => {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(saveButton).toBeVisible();
        },
        'Verify Save button is visible',
        test.info(),
      );
      await saveButton.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(TIMEOUTS.STANDARD);
      const notificationText = await detailsPage.getNotificationMessage();
      const hasNotification = notificationText != null && notificationText.length > 0;
      const stillOnCreatePage = await page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE).isVisible();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(hasNotification || stillOnCreatePage).toBe(true);
        },
        'Verify system shows a notification or create page remains',
        test.info(),
      );
      logger.info(hasNotification ? 'Получен ответ системы' : 'Страница создания осталась');
    });
  });

  test('08 - Выбор различных категорий материалов', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUTS.LONG);
    const detailsPage = new CreatePartsDatabasePage(page);
    const secondCategoryMaterial = SelectorsPartsDataBase.TEST_MATERIAL_SECOND_CATEGORY;

    await allure.step('Step 1: Открыть страницу создания и заполнить наименование', async () => {
      await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
      await page.waitForLoadState('load');
      const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(mainContainer).toBeVisible();
        },
        'Verify create page is visible',
        test.info(),
      );
      const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(createPageTitle).toBeVisible();
          await expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
        },
        'Verify create page title',
        test.info(),
      );
      await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.TEST_DETAIL_NAME);
      logger.info('Наименование заполнено');
    });

    await allure.step('Step 2: Открыть модальное окно и выбрать материал из первой категории', async () => {
      const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialButton).toBeVisible();
        },
        'Verify "Задать" button is visible',
        test.info(),
      );
      await materialButton.click();
      await page.waitForLoadState('load');
      const materialModal = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModal).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material modal is open',
        test.info(),
      );
      await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
        },
        'Verify material modal closed after Add',
        test.info(),
      );
      logger.info('Материал из первой категории выбран');
    });

    await allure.step('Step 3: Дождаться появления материала в форме и проверить атрибуты', async () => {
      await page.waitForLoadState('load');
      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(section).toBeVisible();
        },
        'Verify Characteristic Blanks section is visible',
        test.info(),
      );
      const materialInSection = section.getByText(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON, { exact: false });
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialInSection).toBeVisible({ timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
        },
        'Verify first category material is visible in form',
        test.info(),
      );
      const rows = section.locator('tr');
      const fieldCount = await rows.count();
      await expectSoftWithScreenshot(
        page,
        () => {
          expect.soft(fieldCount).toBeGreaterThan(0);
        },
        'Verify attribute rows present for first category',
        test.info(),
      );
      logger.info(`Первая категория: найдено ${fieldCount} строк атрибутов`);
    });

    await allure.step('Step 4: Сбросить материал и подтвердить в диалоге', async () => {
      const resetButton = page.locator(SelectorsPartsDataBase.ADD_DETAILE_RESET_MATERIAL_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(resetButton).toBeVisible();
        },
        'Verify reset material button is visible',
        test.info(),
      );
      await resetButton.click();
      await page.waitForLoadState('load');
      const confirmYes = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(confirmYes).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify confirm dialog Yes button is visible',
        test.info(),
      );
      await confirmYes.click();
      await page.waitForLoadState('load');
      await page
        .locator(SelectorsPartsDataBase.MODAL_CONFIRM_GENERIC)
        .waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD })
        .catch(() => null);
      await page
        .locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)
        .waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD })
        .catch(() => null);
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      logger.info('Материал сброшен');
    });

    await allure.step('Step 5: Открыть модальное окно снова и выбрать материал из второй категории (если доступна)', async () => {
      const materialModalOpen = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      const modalAlreadyOpen = await materialModalOpen.isVisible().catch(() => false);
      if (!modalAlreadyOpen) {
        const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
        await expectSoftWithScreenshot(
          page,
          async () => {
            await expect.soft(materialButton).toBeVisible();
          },
          'Verify "Задать" button is visible after reset',
          test.info(),
        );
        await materialButton.click();
        await page.waitForLoadState('load');
      }
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(materialModalOpen).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify material modal is open',
        test.info(),
      );
      const secondCategorySwitch = page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2);
      const secondCategoryVisible = await secondCategorySwitch.isVisible().catch(() => false);
      if (secondCategoryVisible) {
        try {
          await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2, secondCategoryMaterial);
          await expectSoftWithScreenshot(
            page,
            async () => {
              await expect.soft(page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)).toBeHidden();
            },
            'Verify material modal closed after Add',
            test.info(),
          );
          logger.info('Материал из второй категории выбран');
        } catch {
          await page.keyboard.press('Escape');
          await page
            .locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)
            .waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD })
            .catch(() => null);
          logger.info('Материал из второй категории не найден, закрываем модальное окно');
        }
      } else {
        await page.keyboard.press('Escape');
        await page
          .locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN)
          .waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD })
          .catch(() => null);
        logger.info('Вторая категория недоступна, пропускаем');
      }
      const dialogStillOpen = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_OPEN);
      if (await dialogStillOpen.isVisible().catch(() => false)) {
        const cancelInDialog = dialogStillOpen.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_CANCEL_BUTTON);
        await cancelInDialog.click({ timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => null);
        await page.keyboard.press('Escape');
        await dialogStillOpen.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => null);
        logger.info('Модальное окно закрыто');
      }
    });

    await allure.step('Step 6: Проверить таблицу атрибутов (первая или вторая категория)', async () => {
      const section = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(section).toBeVisible();
        },
        'Verify Characteristic Blanks section is visible',
        test.info(),
      );
      const hasFirst = await section
        .getByText(SelectorsPartsDataBase.TEST_MATERIAL_HEXAGON, { exact: false })
        .isVisible()
        .catch(() => false);
      const hasSecond = await section
        .getByText(secondCategoryMaterial, { exact: false })
        .isVisible()
        .catch(() => false);
      const rows = section.locator('tr');
      const fieldCount = await rows.count();
      if (hasFirst || hasSecond) {
        await expectSoftWithScreenshot(
          page,
          () => {
            expect.soft(fieldCount).toBeGreaterThan(0);
          },
          'Verify attribute rows present when material is selected',
          test.info(),
        );
      }
      logger.info(`Материал: ${hasFirst ? 'первая' : hasSecond ? 'вторая' : 'нет'}, строк: ${fieldCount}`);
    });
  });
};
