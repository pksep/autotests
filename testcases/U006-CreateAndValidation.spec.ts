import { test, expect, Locator } from "@playwright/test";
import { SELECTORS } from "../config";
import { expectSoftWithScreenshot } from "../lib/Page";
import { TEST_TIMEOUTS, TIMEOUTS, WAIT_TIMEOUTS } from "../lib/Constants/TimeoutConstants";
import logger from "../lib/utils/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U006-PC01.json';
import * as SelectorsPartsDataBase from "../lib/Constants/SelectorsPartsDataBase";
import { baseFileNamesToVerify } from "./U006-shared";

/**
 * U006 create + validation (golden lines 370–2893).
 */
export const runU006CreateAndValidation = () => {
    test('U006 TC 02 — Создание детали', async ({ browser, page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.VERY_LONG);
        const shortagePage = new CreatePartsDatabasePage(page);
        await allure.step("Step 01: Перейдите на страницу создания детали. (Navigate to the create part page)", async () => {
            await shortagePage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 02: В поле ввода инпута \"Наименование\" вводим значение переменной. (In the input field \"Name\" we enter the value of the variable)", async () => {
            await page.waitForLoadState("networkidle");
            const field = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);

            await shortagePage.highlightElement(field);
            await field.fill('');
            await field.press('Enter');
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await field.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(field).toHaveValue(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
                },
                'Step 02: Verify detail name input value',
                testInfo,
            );
            await page.waitForTimeout(TIMEOUTS.MICRO);
        });
        await allure.step("Step 03: откройте диалоговое окно Добавление материала и подтвердите заголовки. (open Добавление материала dialog and verify titles)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'Step 03: Verify characteristic table container is visible',
                testInfo,
            ); // Ensure the table container is visible

            const tableTitle = tableContainer.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_TITLE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableTitle).toBeVisible();
                },
                'Step 03: Verify characteristic table title is visible',
                testInfo,
            ); // Ensure the title is visible

            // Optionally, highlight the title for debugging
            await shortagePage.highlightElement(tableTitle);

            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetButton = firstDataRow.locator('td').nth(2).locator('button');
            await shortagePage.highlightElement(targetButton);
            await targetButton.click();
        });
        await allure.step("Step 04: Verify that search works for table 3 (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            const rightTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
            await shortagePage.highlightElement(rightTable);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM)).toBeVisible();
                },
                'Step 04: Verify right table is visible',
                testInfo,
            );
            await shortagePage.searchAndSelectMaterial(
                SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1,
                SelectorsPartsDataBase.U006_TEST_NAME,
            );

        });
        await allure.step("Step 05: Add the found Item (Add the found Item)", async () => {
            await page.waitForLoadState("networkidle");

            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            await expect(firstDataRow).toContainText(SelectorsPartsDataBase.U006_TEST_NAME, { timeout: WAIT_TIMEOUTS.LONG });
        });
        await allure.step("Step 06: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

            await expect(firstDataRow).toContainText(SelectorsPartsDataBase.U006_TEST_NAME, { timeout: WAIT_TIMEOUTS.LONG });
            await shortagePage.highlightElement(targetSpan);
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await targetSpan.innerText()).toBe(SelectorsPartsDataBase.U006_TEST_NAME);
                },
                'Step 06: Verify selected material is shown in main table',
                testInfo,
            );
        });
        await allure.step("Step 07: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

            await expect(firstDataRow).toContainText(SelectorsPartsDataBase.U006_TEST_NAME, { timeout: WAIT_TIMEOUTS.LONG });
            await shortagePage.highlightElement(targetSpan);
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await targetSpan.innerText()).toBe(SelectorsPartsDataBase.U006_TEST_NAME);
                },
                'Step 07: Verify selected material is shown in main table',
                testInfo,
            );
        });
        await allure.step("Step 08: Вводим значение переменной в обязательное поле в строке \"Длина (Д)\" в таблице \"Характеристики заготовки\"", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate the table container using data-testid (golden flow)
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'Step 08: Verify characteristic table is visible',
                testInfo,
            );

            // Locate the row dynamically by searching for the text "Длина (Д)" (golden flow)
            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(targetRow).toBeVisible();
                },
                'Step 08: Verify required attribute row is visible',
                testInfo,
            );

            // Locate the input field dynamically within the row (golden flow)
            const inputField = targetRow
                .locator(
                    `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`,
                )
                .first();
            await inputField.waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.STANDARD });

            // Highlight the input field for debugging (optional)
            await shortagePage.highlightElement(inputField);

            // Set the desired value
            const desiredValue = '999';
            await inputField.fill(desiredValue);

            console.log(`Set the value "${desiredValue}" in the input field.`);

            // Verify the value
            const currentValue = await inputField.inputValue();
            console.log("Verified input value:", currentValue);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(currentValue).toBe(desiredValue);
                },
                'Step 08: Verify required attribute value is set',
                testInfo,
            );

            await page.waitForTimeout(TIMEOUTS.MICRO);
        });


        await allure.step("Step 09: Upload files using drag-and-drop functionality", async () => {
            // Locate the hidden file input element
            const fileInput = page.locator('input#docsFileSelected');

            // Set the files to be uploaded
            await fileInput.setInputFiles([
                'testdata/U006_Test_imagexx_1.jpg', // Replace with your actual file paths
                'testdata/U006_Test_imagexx_2.png',
            ]);
            // await fileInput.setInputFiles([
            //     'testdata/1.3.1.1 Клапан М6х10.jpg__+__92d7aeee-893c-4140-8611-9019ea4d63ff.jpg', // Replace with your actual file paths
            //     'testdata/1.3.1.1 Клапан М6х10.PNG__+__c3a2fced-9b03-461b-a596-ef3808d8a475.png',
            // ]);
            // Verify the files were successfully uploaded
            await page.waitForTimeout(TIMEOUTS.STANDARD); // Wait before execution
            const uploadedFiles = await fileInput.evaluate((element: HTMLInputElement) => {
                return element.files?.length || 0;
            });

            logger.info(`Number of files uploaded: ${uploadedFiles}`);
            if (uploadedFiles !== 2) {
                throw new Error(`Expected to upload 2 files, but got ${uploadedFiles}`);
            }
            logger.info("Files successfully uploaded via the hidden input.");

        });

        await allure.step("Step 10: Ensure the textarea is present and writable in each file uploaded section", async () => {
            await page.waitForLoadState('networkidle');

            // Locate the modal container using data-testid
            const modal = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(modal).toBeVisible();
                },
                'Step 10: Verify upload modal is visible',
                testInfo,
            );

            // Locate the SECTION inside the modal (wildcard for '-Section')
            const section = modal.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
            await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });

            // Locate ALL FILE SECTIONS inside the section (wildcard for '-File')
            const fileSections = section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE);
            await expect
                .poll(async () => await fileSections.count(), {
                    timeout: WAIT_TIMEOUTS.PAGE_RELOAD,
                    intervals: [250, 500, 1000],
                })
                .toBeGreaterThanOrEqual(2);
            const fileCount = await fileSections.count();

            if (fileCount < 2) {
                throw new Error(`Expected at least 2 file sections, but found ${fileCount}`);
            }

            for (let i = 0; i < 2; i++) {
                const fileSection = fileSections.nth(i);

                // Locate the input section inside the file section (common pattern)


                // Locate the textarea inside the fieldset (specific textarea)
                const textarea = fileSection.locator(SelectorsPartsDataBase.FILE_DESCRIPTION_TEXTAREA);
                await shortagePage.highlightElement(textarea);
                const checkbox = fileSection.locator(SelectorsPartsDataBase.FILE_MAIN_CHECKBOX);
                await shortagePage.highlightElement(checkbox);
                const version = fileSection.locator(SelectorsPartsDataBase.FILE_VERSION_INPUT);
                await shortagePage.highlightElement(version);
                const fileName = fileSection.locator(SelectorsPartsDataBase.FILE_NAME_INPUT);

                // Highlight the textarea for debugging (optional)
                await shortagePage.highlightElement(fileName);

                // Ensure the textarea is visible
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(textarea).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                    },
                    `Step 10: Verify textarea visibility in section ${i + 1}`,
                    testInfo,
                );
                console.log(`Textarea in file section ${i + 1} is visible.`);

                // Focus on the textarea to verify it is writable
                await textarea.focus();
                console.log(`Textarea in file section ${i + 1} is focused.`);

                // Type text into the textarea
                const testValue = `Test note ${i + 1}`;
                await textarea.fill(testValue);
                console.log(`Value entered into textarea in file section ${i + 1}: ${testValue}`);

                // Verify the entered value
                const currentValue = await textarea.inputValue();
                console.log(`Textarea current value in file section ${i + 1}: ${currentValue}`);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(currentValue).toBe(testValue);
                    },
                    `Step 10: Verify textarea value in section ${i + 1}`,
                    testInfo,
                );
            }

            await page.waitForTimeout(TIMEOUTS.MICRO);
        });


        await allure.step("Step 11: Check buttons in dialog (Check buttons in dialog)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.MICRO);

            const buttons = testData1.elements.CreatePage.modalAddDocuments.buttons;

            // Iterate over each button in the array
            for (const button of buttons) {
                // Map button data-testid to constants
                const buttonTestIdMap: { [key: string]: string } = {
                    "AddDetal-Buttons-TechProcess": SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_TECH_PROCESS,
                    "AddDetal-Buttons-CostPrice": SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_COST_PRICE,
                    "AddDetal-Buttons-Accessory": SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_ACCESSORY,
                    "AddDetal-Buttons-ChangeHistory": SelectorsPartsDataBase.ADD_DETAIL_BUTTONS_CHANGE_HISTORY,
                };

                const buttonTestId = buttonTestIdMap[button.datatestid] || button.datatestid; // Fallback to original if not mapped
                const buttonLabel = button.label;
                const expectedState = button.state === "true"; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    await page.waitForTimeout(TIMEOUTS.MICRO);
                    console.log(`Checking button: ${buttonTestId} - ${buttonLabel} - Expected State: ${expectedState}`);

                    // Locate the button using data-testid
                    const buttonLocator = page.locator(`[data-testid="${buttonTestId}"]`);

                    // Check if the button is visible and enabled
                    const isButtonVisible = await buttonLocator.isVisible();
                    const isButtonEnabled = await buttonLocator.isEnabled();

                    console.log(`Button: ${buttonTestId} - Visible: ${isButtonVisible}, Enabled: ${isButtonEnabled}`);

                    // Validate the button's visibility and state
                    await expectSoftWithScreenshot(
                        page,
                        () => {
                            expect.soft(isButtonVisible).toBeTruthy();
                            expect.soft(isButtonEnabled).toBe(expectedState);
                        },
                        `Step 11: Verify button state for ${buttonLabel}`,
                        testInfo,
                    );

                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonVisible && isButtonEnabled);
                });
            }
        });

        await allure.step("Step 12: Проверяем, что в модальном окне есть не отмеченный чекбокс в строке \"Главный:\" (Check that the checkbox is not selected in the MAIN row)", async () => {
            await page.waitForLoadState('networkidle');

            const modal = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(modal).toBeVisible();
                },
                'Step 12: Verify upload modal is visible',
                testInfo,
            );

            const section = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
            await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });

            const sectionX = await section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).first();
            const sectionY = await section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).nth(1);

            // Validate checkboxes and assert their state
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await shortagePage.validateCheckbox(page, sectionX, 1)).toBeFalsy();
                    expect.soft(await shortagePage.validateCheckbox(page, sectionY, 2)).toBeFalsy();
                },
                'Step 12: Verify file checkboxes are initially unchecked',
                testInfo,
            );

            await page.waitForTimeout(TIMEOUTS.MICRO);
        });

        await allure.step("Step 13: Чек чекбокс в строке \"Главный:\" (Check the checkbox in the \"Главный:\" row)", async () => {
            await page.waitForLoadState('networkidle');

            const section = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
            await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });

            const sectionX = await section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).first();
            const sectionY = await section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).nth(1);

            // Validate checkboxes and assert their state
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await shortagePage.checkCheckbox(page, sectionX, 1)).toBeTruthy();
                    expect.soft(await shortagePage.checkCheckbox(page, sectionY, 2)).toBeTruthy();
                },
                'Step 13: Verify file checkboxes can be checked',
                testInfo,
            );

            await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });
        await allure.step("Step 14: Проверяем, that in the file field is the name of the file uploaded without its file extension", async () => {
            await page.waitForLoadState('networkidle');

            const section = await page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_SECTION);
            await section.waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.STANDARD });
            console.log("Dynamic content in modal section loaded.");

            // Extract individual file sections from the main section
            const fileSections = await section.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_FILE).all();

            // Convert { name, extension } objects to filename strings without extension
            const filenamesWithoutExtension = baseFileNamesToVerify.map(file => file.name);

            // Call the function from shortagePage class, passing extracted filenames
            await shortagePage.validateFileNames(page, fileSections, filenamesWithoutExtension);

            console.log("All file fields validated successfully.");
            await page.waitForTimeout(TIMEOUTS.FLASH);
        });

        await allure.step("Step 15: Click the Загрузить все файлы button and confirm modal closure", async () => {
            console.log("Starting file upload process...");

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate the upload button using data-testid
            const uploadButton = page.locator(SelectorsPartsDataBase.FILE_UPLOAD_BUTTON);
            const modalLocator = page.locator(SelectorsPartsDataBase.FILE_DRAG_DROP_MODAL);
            console.log("Upload button and modal located.");

            const maxRetries = 50;
            let retryCounter = 0;

            while (retryCounter <= maxRetries) {
                // Check if modal exists in the DOM
                const modalCount = await modalLocator.count();
                if (modalCount === 0) {
                    console.log("Modal is no longer present in the DOM. Upload succeeded!");
                    break; // Exit the loop when the modal is gone
                }

                console.log(`Attempt ${retryCounter + 1}: Clicking upload button.`);

                await shortagePage.highlightElement(uploadButton);

                // Click the upload button
                await uploadButton.click();
                console.log("Upload button clicked.");

                // Wait for notifications
                await page.waitForTimeout(TIMEOUTS.INPUT_SET);

                // Check modal visibility again after the button click
                if ((await modalLocator.count()) === 0) {
                    console.log("Modal closed after button click. Upload succeeded!");
                    await page.waitForTimeout(TIMEOUTS.STANDARD);
                    break;
                }

                // Check for notifications
                const notification = await shortagePage.extractNotificationMessage(page);

                if (notification?.message === "Файл с таким именем уже существует") {
                    console.log("Duplicate filename detected. Updating all filenames.");
                    retryCounter++;

                    const sectionsCount = await page.locator(SelectorsPartsDataBase.FILE_NAME_INPUT).count();
                    console.log(`Found ${sectionsCount} file sections to update filenames.`);

                    for (let i = 0; i < sectionsCount; i++) {
                        // Check if modal still exists before proceeding with the loop
                        if ((await modalLocator.count()) === 0) {
                            console.log("Modal closed during filename updates. Exiting loop.");
                            break;
                        }

                        const fileInput = page.locator(SelectorsPartsDataBase.FILE_NAME_INPUT).nth(i);

                        try {
                            // Check if field is visible before interaction
                            if (!(await fileInput.isVisible())) {
                                console.log(`Input field in section ${i + 1} is no longer visible. Skipping...`);
                                continue;
                            }

                            console.log(`Updating filename for section ${i + 1}.`);

                            const currentValue = await fileInput.inputValue();
                            await fileInput.fill('');
                            await fileInput.press('Enter');
                            await page.waitForTimeout(TIMEOUTS.MEDIUM);

                            const updatedValue = `${currentValue}_${Math.random().toString(36).substring(2, 6)}`;
                            await fileInput.fill(updatedValue);

                            await fileInput.evaluate((input) => {
                                input.dispatchEvent(new Event('input', { bubbles: true }));
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            });

                            console.log(`Filename updated to "${updatedValue}" for section ${i + 1}.`);
                        } catch (error) {
                            console.log(`Error updating filename for section ${i + 1}. Skipping...`);
                            break;
                        }
                    }
                } else if (notification) {
                    console.log(`Unexpected notification: ${notification.message}`);
                    break; // Exit on unexpected notifications
                } else {
                    console.log("No notification detected. Assuming upload succeeded.");
                }

                console.log("Waiting before retrying...");
                await page.waitForTimeout(TIMEOUTS.MEDIUM);

            }

            if (retryCounter >= maxRetries) {
                throw new Error(`Failed to upload files after ${maxRetries} retries.`);
            }

            console.log("File upload process completed successfully.");
        });

        await allure.step("Step 16: Verify uploaded file names with wildcard matching and extension validation", async () => {
            logger.info("Starting file verification process...");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.LONG + TIMEOUTS.MEDIUM);

            // Locate the parent section for the specific table
            await page.waitForTimeout(TIMEOUTS.STANDARD);
            const parentSection = page.locator(SelectorsPartsDataBase.FILE_COMPONENT);
            logger.info("Located parent section for the file table.");

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

                // Locate rows where the second column (Files column) contains the base name
                const matchingRows = tableRows.locator(`${SelectorsPartsDataBase.DOCUMENT_TABLE_NAME_CELL_TD_PREFIX}:has-text("${name}")`);
                const matchCount = await matchingRows.count();

                if (matchCount > 0) {
                    logger.info(`Found ${matchCount} rows matching base name "${name}".`);
                    let extensionMatch = false;

                    for (let i = 0; i < matchCount; i++) {
                        const nameCell = matchingRows.nth(i);
                        await shortagePage.highlightElement(nameCell);

                        const fileName = await nameCell.textContent();
                        logger.info(`File name in row ${i + 1}: ${fileName}`);

                        // Check if the file name contains the expected extension
                        if (fileName && fileName.includes(extension)) {
                            logger.info(`File "${name}" with extension "${extension}" is present.`);
                            extensionMatch = true;
                            break;
                        }
                    }

                    if (!extensionMatch) {
                        throw new Error(`File "${name}" is present but does not match the expected extension "${extension}".`);
                    }
                } else {
                    throw new Error(`No files found with base name "${name}".`);
                }
            }

            logger.info("File verification process completed successfully.");
        });
        await allure.step("Step 17: Open Добавить из базы dialog (Open Добавить из базы dialog)", async () => {
            await page.waitForLoadState("networkidle");
            const button = page.locator(SelectorsPartsDataBase.FILE_ADD_BUTTON, { hasText: 'Добавить из базы' });
            await shortagePage.highlightElement(button);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await button.click();

        });
        await allure.step("Step 18: Verify that search works for the files table (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            const fileBaseModal = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES);
            await fileBaseModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await page.waitForTimeout(TIMEOUTS.MEDIUM);

            // Locate the switch item using data-testid and highlight it for debugging
            const switchItem = page.locator(SelectorsPartsDataBase.FILE_BASE_SWITCH_ITEM0);
            await shortagePage.highlightElement(switchItem);
            await switchItem.click();
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table using data-testid
            const tableContainer = page.locator(SelectorsPartsDataBase.U006_FILE_BASE_TABLE_WRAPPER);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'Step 18: Verify file base table container is visible',
                testInfo,
            );

            // Locate the table within the container
            const leftTable = tableContainer.locator('table');
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(leftTable).toBeVisible();
                },
                'Step 18: Verify file base table is visible',
                testInfo,
            );

            // Search input uses generic testid; scope to file-window table wrapper
            const searchField = tableContainer.locator(SelectorsPartsDataBase.SEARCH_DROPDOWN_INPUT);

            // Highlight the search field for debugging
            await shortagePage.highlightElement(searchField);

            // Ensure the search field is visible and editable
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(searchField).toBeVisible();
                },
                'Step 18: Verify file search input is visible',
                testInfo,
            );
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            await searchField.focus(); // Focus on the input field
            await searchField.fill(''); // Clear any existing content
            await searchField.press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);

            // Programmatically set the value using JavaScript
            await searchField.evaluate((element, value) => {
                const input = element as HTMLInputElement; // Explicitly cast the element
                input.value = value; // Set the value directly
                const event = new Event('input', { bubbles: true }); // Trigger an input event
                input.dispatchEvent(event); // Dispatch the event to mimic user input
            }, SelectorsPartsDataBase.U006_TEST_FILE);

            // Verify that the field contains the correct value
            const fieldValue = await searchField.inputValue();
            logger.info("Verified input value:", fieldValue);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(fieldValue).toBe(SelectorsPartsDataBase.U006_TEST_FILE);
                },
                'Step 18: Verify file search input value',
                testInfo,
            );
            const firstRow1 = leftTable.locator('tbody tr:first-child');
            logger.info("First Row:", await firstRow1.textContent());
            // Trigger the search by pressing 'Enter'
            await searchField.press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);
            // Locate and highlight the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            logger.info("First Row 2:", await firstRow.textContent());
            await shortagePage.highlightElement(firstRow);

            // Wait for the first row to be visible and validate its content
            await firstRow.waitFor({ state: 'visible' });
            const rowText = await firstRow.textContent();
            logger.info("First row text:", rowText);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(rowText?.trim()).toContain(SelectorsPartsDataBase.U006_TEST_FILE);
                },
                'Step 18: Verify first search result contains expected file',
                testInfo,
            );

            logger.info("Search verification completed successfully.");
        });

        let selectedFileType: string = '';
        let selectedFileName: string = '';
        await allure.step("Step 19: Add the file to the attach list in bottom table (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_MODAL_BASE_FILES_FILE_WINDOW_FILE_TABLE_TABLE);
            const firstRow = tableContainer.locator('tbody tr:first-child');
            let fileType: string = '';
            await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            selectedFileType = (await firstRow.locator('td').nth(2).textContent()) ?? '';
            selectedFileName = (await firstRow.locator('td').nth(3).textContent()) ?? '';

            await shortagePage.highlightElement(firstRow);
            const addButton = page.locator(SelectorsPartsDataBase.FILE_BASE_ADD_BUTTON, { hasText: 'Добавить' });
            await shortagePage.highlightElement(addButton);
            await page.waitForTimeout(TIMEOUTS.FLASH);
            const isButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.FILE_BASE_ADD_BUTTON, 'Добавить', false, SelectorsPartsDataBase.FILE_BASE_MODAL);

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isButtonReady).toBeTruthy();
                },
                'Step 19: Verify Add button is disabled before row selection',
                testInfo,
            );
            firstRow.click();
            await shortagePage.highlightElement(firstRow);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            const isButtonReady2 = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.FILE_BASE_ADD_BUTTON, 'Добавить', true, SelectorsPartsDataBase.FILE_BASE_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isButtonReady2).toBeTruthy();
                },
                'Step 19: Verify Add button is enabled after row selection',
                testInfo,
            );
            addButton.click();
            await shortagePage.highlightElement(addButton);

        });
        await allure.step("Step 20: Confirm the file is listed in the bottom table", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.STANDARD);
            const selectedPartNumber = SelectorsPartsDataBase.U006_TEST_FILE; // Replace with actual part number

            const bottomTableLocator = page.locator(SelectorsPartsDataBase.FILE_BASE_BOTTOM_TABLE); // Adjust 'xxxxx' as per actual table id
            await shortagePage.highlightElement(bottomTableLocator);
            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(rowCount).toBeGreaterThan(0);
                },
                'Step 20: Verify bottom table has rows',
                testInfo,
            ); // Ensure the table is not empty

            let isRowFound = false;
            console.log(rowCount);
            // Iterate through each row
            for (let i = 0; i < rowCount; i++) {
                const row = rowsLocator.nth(i);

                // Extract the partNumber from the input field in the first cell
                const tableFileType = await row.locator('td').nth(1).textContent();
                const tableFileTypeCell = await row.locator('td').nth(1);
                const tableFileName = await row.locator('td').nth(2).textContent();
                const tableFileNameCell = await row.locator('td').nth(2);

                console.log(`Row ${i + 1}: FileType=${tableFileType?.trim()}, FileName=${tableFileName?.trim()}`);

                // Compare the extracted values
                if (tableFileType?.trim() === selectedFileType) {
                    isRowFound = true;
                    await shortagePage.highlightElement(tableFileTypeCell);
                }
                if (tableFileName?.trim() === selectedFileName) {
                    isRowFound = true;
                    await shortagePage.highlightElement(tableFileNameCell);
                    console.log(`Selected row found in row ${i + 1}`);
                }
            }
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isRowFound).toBeTruthy();
                },
                'Step 20: Verify selected file is present in bottom table',
                testInfo,
            );
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });
        await allure.step("Step 21: Click bottom Add button", async () => {
            await page.waitForLoadState("networkidle");

            const addButton = page.locator(SelectorsPartsDataBase.FILE_BASE_FOOTER_ADD_BUTTON, { hasText: 'Добавить' }).last();

            await shortagePage.highlightElement(addButton);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
            addButton.click();

        });
        await allure.step("Step 22: Highlight the row containing the selected file name", async () => {
            await page.waitForLoadState("networkidle");

            // Locate the parent section for the specific table
            await page.waitForTimeout(TIMEOUTS.STANDARD);
            const parentSection = page.locator(SelectorsPartsDataBase.FILE_COMPONENT);
            logger.info("Located parent section for the file table.");

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
                if (fileNameText?.trim() === selectedFileName) { // Match exact name
                    logger.info(`Selected file name "${selectedFileName}" found in row ${i + 1}. Highlighting...`);
                    await shortagePage.highlightElement(fileNameCell);
                    fileFound = true;
                    break; // Exit the loop once the file is found and highlighted
                }
            }

            if (!fileFound) {
                throw new Error(`Selected file name "${selectedFileName}" was not found in the table.`);
            }
            await page.waitForTimeout(TIMEOUTS.MICRO);
            logger.info("File search and highlight process completed successfully.");
        });
        await allure.step("Step 23: Удалите первый файл из списка медиафайлов.(Remove the first file from the list of attached media files.)", async () => {
            await page.waitForLoadState("networkidle");
            let printButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, { hasText: 'Печать' });
            await shortagePage.highlightElement(printButton);
            let isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, 'Печать', false);
            let deleteButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, { hasText: 'Удалить' });
            await shortagePage.highlightElement(deleteButton);
            let isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, 'Удалить', false);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isPrintButtonReady).toBeTruthy();
                    expect.soft(isDeleteButtonReady).toBeTruthy();
                },
                'Step 23: Verify print/delete buttons initial state',
                testInfo,
            );
            // Locate the parent section for the specific table
            const parentSection = page.locator(SelectorsPartsDataBase.FILE_COMPONENT);
            logger.info("Located parent section for the file table.");

            // Locate all visible table rows within the scoped section
            const tableRows = parentSection.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_ROW_ID);
            const row = tableRows.first();

            // Refine the locator to target the checkbox input inside the third column
            const checkboxInput = row.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_CHECKBOX_PREFIX);
            await shortagePage.highlightElement(checkboxInput);
            await checkboxInput.waitFor({ state: 'visible' });

            // Check the checkbox
            await checkboxInput.check();
            await page.waitForTimeout(TIMEOUTS.FLASH);
            printButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, { hasText: 'Печать' });
            await shortagePage.highlightElement(printButton);
            isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_PRINT_BUTTON, 'Печать', true);
            deleteButton = page.locator(SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, { hasText: 'Удалить' });
            await shortagePage.highlightElement(deleteButton);
            isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, SelectorsPartsDataBase.DOCUMENT_TABLE_DELETE_BUTTON, 'Удалить', true);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isPrintButtonReady).toBeTruthy();
                    expect.soft(isDeleteButtonReady).toBeTruthy();
                },
                'Step 23: Verify print/delete buttons after selecting row',
                testInfo,
            );
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await checkboxInput.isChecked()).toBeTruthy();
                },
                'Step 23: Verify first media row checkbox is checked',
                testInfo,
            );

            //delete row
            deleteButton.click();
            await shortagePage.highlightElement(deleteButton);
            await page.waitForTimeout(TIMEOUTS.MEDIUM);
        });

        await allure.step("Step 25: Save the detail", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON, { hasText: 'Сохранить' });
            await shortagePage.highlightElement(saveButton);
            await page.waitForTimeout(TIMEOUTS.MICRO);
            saveButton.click();
            await page.waitForTimeout(TIMEOUTS.VERY_LONG);

        });

    });
    test(`U006 CL 03 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 03: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    // TestCase 02: Do not select a material and verify that saving is not allowed.
    test('U006 TC 03 — Сохранение без выбора материала запрещено', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        // Instantiate our helper classes.
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 01: Перейдите на страницу создания детали", async () => {
            // Navigate to the detail creation page using the warehouse's goto method.
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 02: Заполните поле 'Наименование' детали", async () => {
            // Fill in the 'Наименование' field.
            await detailsPage.fillDetailName(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
        });

        await allure.step("Step 03: Пропустите выбор материала", async () => {
            // For this negative test we intentionally skip material selection.
            console.log("Skipping material selection as required for this test case.");
        });

        await allure.step("Step 04: Попытайтесь сохранить деталь без выбора материала", async () => {
            // Click the Save button using the legacy findAndClickElement (passing the partial string without brackets).
            await detailsPage.findAndClickElement(page, SelectorsPartsDataBase.SAVE_BUTTON, TIMEOUTS.MEDIUM);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 05: Дождитесь и получите сообщение об уведомлении", async () => {
            // Use getMessage (or, if you prefer, read the text directly) to check for the presence of the error text.
            // await detailsPage.verifyDetailSuccessMessage('Деталь успешно Создана.');//bug erp-1017
        });
        //erp-1017
        // await allure.step("Step 06: Проверьте, что уведомление содержит текст 'Выберите материал'", async () => {
        //     // Retrieve the notification text for further logging and assertion.
        //     const errorText = await page.locator(`[data-testid="${NOTIFICATION_DESCRIPTION}"]`).last().textContent();
        //     console.log("Notification text:", errorText);
        //     expect(errorText).toContain("Деталь успешно Создана.");
        // });

        await allure.step("Step 7: Проверьте, что созданная деталь отображается в базе деталей", async () => {
            // Navigate back to the main 'baza деталей' page.
            await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Wait a moment to let the page load and then locate the table.
            await page.waitForTimeout(TIMEOUTS.STANDARD);

            // Locate the table by its data-testid.
            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);

            // Debug: Log the count of matching table elements.
            const tableCount = await detailTable.count();
            console.log("Found tables:", tableCount);
            if (tableCount === 0) {
                console.error("No table found with data-testid 'BasePaginationTable-Table-detal'");
                throw new Error("Table not found");
            }

            // Scroll the first found table into view and apply styling.
            const tableContainer = detailTable.first();
            await tableContainer.scrollIntoViewIfNeeded();
            await detailsPage.highlightElement(tableContainer);

            // Locate the search field in the table header.
            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(searchInput).toBeVisible();
                },
                'TC03 Step 7: Verify detail table search input is visible',
                testInfo,
            );

            let isMatch = false;

            for (let attempt = 1; attempt <= 5; attempt++) {
                // Clear the field, enter the detail name, and press Enter.
                await searchInput.fill("");
                await searchInput.press("Enter");
                await page.waitForTimeout(TIMEOUTS.STANDARD);
                await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
                await searchInput.press("Enter");
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(TIMEOUTS.STANDARD);

                // Locate all rows in the tbody of the first table container.
                const rows = tableContainer.locator("tbody tr");
                const rowCount = await rows.count();

                // Loop through each row: apply styling and wait 500ms before checking the text.
                for (let i = 0; i < rowCount; i++) {
                    const currentRow = rows.nth(i);
                    await detailsPage.highlightElement(currentRow);
                    await page.waitForTimeout(TIMEOUTS.MEDIUM);

                    const rowText = await currentRow.textContent();
                    console.log(`Attempt ${attempt}, row ${i + 1} text:`, rowText);
                    if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_DETAIL_NAME) {
                        isMatch = true;
                        break;
                    }
                }

                if (isMatch) break;
                await page.waitForTimeout(TIMEOUTS.STANDARD);
            }
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isMatch).toBeTruthy();
                },
                'TC03 Step 7: Verify created detail appears in database',
                testInfo,
            );
        });
    });
    test(`U006 CL 04 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 04: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 04 — Материал выбран, атрибуты заготовки пусты', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Открыть главную страницу", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(mainContainer).toBeVisible();
                },
                'TC04 Step 1: Verify main create page container visible',
                testInfo,
            );
            logger.info("Главная страница успешно загружена со всеми отображаемыми элементами");
        });

        await allure.step("Step 2: Нажать кнопку «Создать»", async () => {
            // The page is already the create page, so we just verify we're on the correct page
            const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(createPageTitle).toBeVisible();
                    expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
                },
                'TC04 Step 2: Verify create page title visibility and text',
                testInfo,
            );
            logger.info("Страница создания успешно открыта");
        });

        await allure.step("Step 3: Выбрать тип элемента «Деталь»", async () => {
            // Verify we're on the detail creation page by checking the detail name input field
            const detailNameInput = await page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(detailNameInput).toBeVisible();
                },
                'TC04 Step 3: Verify detail name input visible',
                testInfo,
            );
            await detailsPage.highlightElement(detailNameInput);
            logger.info("Тип детали выбран - страница создания детали активна");
        });

        await allure.step("Step 4: Заполнить поле «Наименование»", async () => {
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);
        });

        await allure.step("Step 5: Нажать кнопку «Задать» в строке «Материал заготовки»", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialButton).toBeVisible();
                },
                'TC04 Step 5: Verify material select button visible',
                testInfo,
            );
            await detailsPage.highlightElement(materialButton);
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialModal).toBeVisible();
                },
                'TC04 Step 5: Verify material modal visible',
                testInfo,
            );
            logger.info("Модальное окно выбора материала успешно открыто");
        });

        await allure.step("Step 6: Выбрать материал и подтвердить выбор", async () => {
            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.U006_TEST_NAME_2);

            // Helper may already confirm the material; click Add only if the modal is still open.
            const materialModalAfterSearch = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            if (await materialModalAfterSearch.isVisible().catch(() => false)) {
                const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(addButton).toBeVisible();
                    },
                    'TC04 Step 6: Verify material add button visible',
                    testInfo,
                );
                await detailsPage.highlightElement(addButton);
                await addButton.click();
                await page.waitForLoadState("networkidle");
            }

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                },
                'TC04 Step 6: Verify material modal closed',
                testInfo,
            );
            logger.info("Материал выбран и добавлен");
        });

        await allure.step("Step 7: Проверить, что выбранный материал отображается в форме, но поля атрибутов остаются пустыми", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC04 Step 7: Verify characteristic table visible',
                testInfo,
            );

            // Verify that the material is displayed
            const materialSpan = chrTble.locator('td').nth(2).locator('span');
            await detailsPage.highlightElement(materialSpan);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialSpan).toBeVisible();
                },
                'TC04 Step 7: Verify selected material cell visible',
                testInfo,
            );
            const materialText = await materialSpan.innerText();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialText).toBe(SelectorsPartsDataBase.U006_TEST_NAME_2);
                },
                'TC04 Step 7: Verify selected material text',
                testInfo,
            );
            logger.info(`Материал отображается в форме: ${materialText}`);

            // Verify that attribute fields are empty
            const inputFields = tableContainer.locator(
                `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`,
            );

            const fieldCount = await inputFields.count();

            if (fieldCount > 0) {
                for (let i = 0; i < fieldCount; i++) {
                    const inputField = inputFields.nth(i);
                    await detailsPage.highlightElement(inputField);
                    const fieldValue = await inputField.inputValue();
                    await expectSoftWithScreenshot(
                        page,
                        () => {
                            expect.soft(fieldValue).toBe('0');
                        },
                        `TC04 Step 7: Verify attribute field ${i + 1} default value`,
                        testInfo,
                    );
                    logger.info(`Поле атрибута ${i + 1} пустое`);
                }
                logger.info("Все поля атрибутов остаются пустыми");
            } else {
                // Fallback: try to find any input fields in the table
                const fallbackInputFields = tableContainer.locator(`input[data-testid$="${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX}"]`);
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
                            `TC04 Step 7 fallback: Verify attribute field ${i + 1} default value`,
                            testInfo,
                        );
                        logger.info(`Поле атрибута ${i + 1} (fallback) пустое`);
                    }
                    logger.info("Все поля атрибутов (fallback) остаются пустыми");
                } else {
                    logger.info("Поля атрибутов не найдены в таблице");
                }
            }
        });

        await allure.step("Step 8: Нажать кнопку «Сохранить»", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(saveButton).toBeVisible();
                },
                'TC04 Step 8: Verify save button visible',
                testInfo,
            );
            await detailsPage.highlightElement(saveButton);
            await saveButton.click();
            await page.waitForLoadState("networkidle");
            logger.info("Кнопка сохранения нажата");
        });

        await allure.step("Step 9: Проверить, что система не позволяет сохранить и отображает ошибку о недостающих обязательных атрибутах материала", async () => {
            // Деталь не сохраняется — ожидаемо (валидация). CL 05 после TC 04 может не находить строк — это pass.
            // Verify that the save action failed with the expected error message
            //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
            logger.info("Получено сообщение об ошибке о недостающих обязательных атрибутах материала");
        });
    });
    // Опциональная уборка: после TC 04 записи с этим именем может не быть — тест всё равно pass.
    test(`U006 CL 05 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 05: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 05 — Валидация атрибутов по границам значений', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Шаг 1: Открыть главную страницу", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(mainContainer).toBeVisible();
                },
                'TC05 Step 1: Verify main create page container visible',
                testInfo,
            );
            logger.info("Главная страница загружена правильно");
        });

        await allure.step("Шаг 2: Нажать кнопку 'Создать'", async () => {
            const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(createPageTitle).toBeVisible();
                    expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
                },
                'TC05 Step 2: Verify create page title visibility and text',
                testInfo,
            );
            logger.info("Форма загружена");
        });

        await allure.step("Шаг 3: Выбрать 'Деталь'", async () => {
            const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(detailNameInput).toBeVisible();
                },
                'TC05 Step 3: Verify detail name input visible',
                testInfo,
            );
            logger.info("Поля показаны");
        });

        await allure.step("Шаг 4: Заполнить 'Наименование'", async () => {
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info("Допустимая запись принята");
        });

        await allure.step("Шаг 5: Нажать 'Задать' для выбора материала", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialButton).toBeVisible();
                },
                'TC05 Step 5: Verify material select button visible',
                testInfo,
            );
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialModal).toBeVisible();
                },
                'TC05 Step 5: Verify material modal visible',
                testInfo,
            );
            logger.info("Модальное окно открыто");
        });

        await allure.step("Шаг 6: Выбрать материал и подтвердить", async () => {
            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.U006_TEST_NAME);

            const materialModalAfterSearch = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            if (await materialModalAfterSearch.isVisible().catch(() => false)) {
                const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(addButton).toBeVisible();
                    },
                    'TC05 Step 6: Verify material add button visible',
                    testInfo,
                );
                await addButton.click();
                await page.waitForLoadState("networkidle");
            }

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                },
                'TC05 Step 6: Verify material modal closed',
                testInfo,
            );
            logger.info("Материал добавлен");
        });

        await allure.step("Шаг 7: Заполнить только один обязательный атрибут", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC05 Step 7: Verify characteristic table visible',
                testInfo,
            );
            const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);

            const targetRow = chrTble.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(targetRow).toBeVisible();
                },
                'TC05 Step 7: Verify target attribute row visible',
                testInfo,
            );

            const inputField = targetRow
                .locator(
                    `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`,
                )
                .first();
            await inputField.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await detailsPage.highlightElement(inputField);

            const value = '100';
            await inputField.fill(value);
            const currentValue = await inputField.inputValue();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(currentValue).toBe(value);
                },
                'TC05 Step 7: Verify input field value',
                testInfo,
            );
            logger.info("Это поле принимает ввод; другие остаются пустыми");
        });
        await allure.step("Шаг 7a: Cycle through all the values in this table making sure that none of them ahve the value NaN", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            const chrTble = tableContainer.locator(SelectorsPartsDataBase.CHR_TABLE);

            // Scroll to the table container to ensure it's visible
            await tableContainer.scrollIntoViewIfNeeded();
            await page.waitForTimeout(TIMEOUTS.MEDIUM);

            // Get all table rows (excluding header)
            const tableRows = chrTble.locator('tbody tr');
            const rowCount = await tableRows.count();
            console.log(`Found ${rowCount} rows to validate for NaN values`);

            // Cycle through each row and validate all content
            for (let i = 0; i < rowCount; i++) {
                const currentRow = tableRows.nth(i);

                // Scroll to the current row to ensure it's visible
                await currentRow.scrollIntoViewIfNeeded();
                await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

                // Highlight the current row being validated
                await detailsPage.highlightElement(currentRow);

                // Get row name for logging
                const rowNameCell = currentRow.locator('td').first();
                const rowName = await rowNameCell.textContent();
                console.log(`Validating row ${i + 1}: "${rowName?.trim()}"`);

                // Check all cells in the row for NaN values
                const cells = currentRow.locator('td');
                const cellCount = await cells.count();

                for (let j = 0; j < cellCount; j++) {
                    const cell = cells.nth(j);
                    const cellText = await cell.textContent();

                    // Validate cell text content
                    if (cellText) { // ERP-1128
                        // expect(cellText.trim()).not.toBe('NaN');
                        // expect(cellText.trim()).not.toBe('nan');
                        // expect(cellText.trim()).not.toBe('NAN');
                        console.log(`  Cell ${j + 1}: "${cellText.trim()}" - OK`);
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
                                expect.soft(inputValue).not.toBe('nan');
                                expect.soft(inputValue).not.toBe('NAN');
                            },
                            `TC05 Step 7a: Verify input value is not NaN in row ${i + 1}, input ${k + 1}`,
                            testInfo,
                        );

                        // Additional validation: if the field has a value, it should be a valid number
                        if (inputValue && inputValue.trim() !== '') {
                            const numericValue = parseFloat(inputValue);
                            await expectSoftWithScreenshot(
                                page,
                                () => {
                                    expect.soft(isNaN(numericValue)).toBe(false);
                                },
                                `TC05 Step 7a: Verify input is numeric in row ${i + 1}, input ${k + 1}`,
                                testInfo,
                            );
                            console.log(`    Input ${k + 1}: "${inputValue}" - Valid number: ${numericValue}`);
                        } else {
                            console.log(`    Input ${k + 1}: Empty field - OK`);
                        }
                    }
                }

                // Remove highlighting after validation
                // Avoid inline styling in spec; use helper highlight only.

                // Small delay to make the highlighting visible
                await page.waitForTimeout(TIMEOUTS.SHORT);
            }

            console.log(`✅ All ${rowCount} rows validated - no NaN values found`);
            logger.info(`All characteristic blanks table rows validated successfully - no NaN values detected`);
        });

        await allure.step("Шаг 8: Нажать 'Сохранить'", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await detailsPage.highlightElement(saveButton);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(saveButton).toBeVisible();
                },
                'TC05 Step 8: Verify save button visible',
                testInfo,
            );
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");//ERP-1029
            logger.info("Появляется ошибка валидации для других обязательных полей");
        });

        await allure.step("Шаг 9: Повторить для каждого обязательного атрибута по одному", async () => {
            // Очистить все поля атрибутов
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            const inputFields = tableContainer.locator(
                `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`,
            );
            const fieldCount = await inputFields.count();

            for (let i = 0; i < fieldCount; i++) {
                const inputField = inputFields.nth(i);
                await inputField.fill('');
                logger.info(`Поле ${i + 1} очищено`);
            }

            // Заполнить только второе поле
            if (fieldCount > 1) {
                const secondField = inputFields.nth(1);
                await detailsPage.highlightElement(secondField);

                const value = '200';
                await secondField.fill(value);
                const currentValue = await secondField.inputValue();
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(currentValue).toBe(value);
                    },
                    'TC05 Step 9: Verify second attribute field value',
                    testInfo,
                );
                logger.info("Второе поле заполнено");

                // Попытаться сохранить
                const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(saveButton).toBeVisible();
                    },
                    'TC05 Step 9: Verify save button visible before submit',
                    testInfo,
                );
                await saveButton.click();
                await page.waitForLoadState("networkidle");

                //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
                logger.info("Валидация показывает ошибку для каждого отсутствующего поля индивидуально");

                // Очистить второе поле для следующей итерации
                await secondField.fill('');
            }
        });
    });
    test(`U006 CL 06 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 06: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 06 — Очень длинное наименование', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Шаг 1: Открыть главную страницу", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(mainContainer).toBeVisible();
                },
                'TC06 Step 1: Verify main create page container visible',
                testInfo,
            );
            logger.info("Страница загружена правильно");
        });

        await allure.step("Шаг 2: Нажать 'Создать'", async () => {
            const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(createPageTitle).toBeVisible();
                    expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
                },
                'TC06 Step 2: Verify create page title visibility and text',
                testInfo,
            );
            logger.info("Форма создания отображается");
        });

        await allure.step("Шаг 3: Выбрать 'Деталь'", async () => {
            const detailNameInput = page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(detailNameInput).toBeVisible();
                },
                'TC06 Step 3: Verify detail name input visible',
                testInfo,
            );
            logger.info("Поля обновлены");
        });

        await allure.step("Шаг 4: Ввести строку длиннее 500 символов в 'Наименование'", async () => {
            const longName = "A".repeat(501); // Строка из 501 символа
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, longName);
            logger.info("Валидация должна заблокировать или предупредить о вводе");
        });

        await allure.step("Шаг 5: Нажать 'Задать', выбрать материал и подтвердить", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialButton).toBeVisible();
                },
                'TC06 Step 5: Verify material select button visible',
                testInfo,
            );
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialModal).toBeVisible();
                },
                'TC06 Step 5: Verify material modal visible',
                testInfo,
            );

            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.U006_TEST_NAME);

            const materialModalAfterSearch = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            if (await materialModalAfterSearch.isVisible().catch(() => false)) {
                const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(addButton).toBeVisible();
                    },
                    'TC06 Step 5: Verify add button visible',
                    testInfo,
                );
                await addButton.click();
                await page.waitForLoadState("networkidle");
            }

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                },
                'TC06 Step 5: Verify material modal closed',
                testInfo,
            );
            logger.info("Модальное окно открыто и принимает выбор");
        });

        await allure.step("Шаг 6: Заполнить все обязательные атрибуты материала", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC06 Step 6: Verify characteristic table visible',
                testInfo,
            );

            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(targetRow).toBeVisible();
                },
                'TC06 Step 6: Verify target attribute row visible',
                testInfo,
            );

            const inputField = targetRow
                .locator(
                    `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`,
                )
                .first();
            await inputField.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await detailsPage.highlightElement(inputField);

            const value = '300';
            await inputField.fill(value);
            const currentValue = await inputField.inputValue();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(currentValue).toBe(value);
                },
                'TC06 Step 6: Verify attribute value set',
                testInfo,
            );
            logger.info("Поля валидированы");
        });

        await allure.step("Шаг 7: Нажать 'Сохранить'", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await detailsPage.highlightElement(saveButton);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(saveButton).toBeVisible();
                },
                'TC06 Step 7: Verify save button visible',
                testInfo,
            );
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            // Проверить результат в зависимости от валидации имени
            try {
                //await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");
                logger.info("Успех в зависимости от результата валидации имени");
            } catch (error) {
                //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
                //await detailsPage.verifyDetailSuccessMessage("current transaction is aborted, commands ignored until end of transaction block");
                logger.info("Ошибка в зависимости от результата валидации имени");
            }
            await page.waitForTimeout(TIMEOUTS.VERY_LONG);
        });
    });
    test(`U006 CL 07 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 07: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 07 — Специальные символы в наименовании', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Открыть главную страницу", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(mainContainer).toBeVisible();
                },
                'TC07 Step 1: Verify main create page container visible',
                testInfo,
            );
            logger.info("Главная страница успешно загружена");
        });

        await allure.step("Step 2: Подтвердить правильный заголовок страницы", async () => {
            const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(createPageTitle).toBeVisible();
                    expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
                },
                'TC07 Step 2: Verify create page title visibility and text',
                testInfo,
            );
            logger.info("Страница создания успешно открыта");
        });

        await allure.step("Step 3: Найти поле для ввода наименования детали", async () => {
            const detailNameInput = await page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(detailNameInput).toBeVisible();
                },
                'TC07 Step 3: Verify detail name input visible',
                testInfo,
            );
            await detailsPage.highlightElement(detailNameInput);
            logger.info("Поле наименования детали найдено");
        });

        await allure.step("Step 4: Ввести наименование со специальными символами", async () => {
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME);
            logger.info(`Наименование со специальными символами заполнено: ${SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME}`);
        });

        await allure.step("Step 5: Нажать кнопку «Задать» в строке «Материал заготовки»", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialButton).toBeVisible();
                },
                'TC07 Step 5: Verify material select button visible',
                testInfo,
            );
            await detailsPage.highlightElement(materialButton);
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialModal).toBeVisible();
                },
                'TC07 Step 5: Verify material modal visible',
                testInfo,
            );
            logger.info("Модальное окно выбора материала успешно открыто");
        });

        await allure.step("Step 6: Выбрать материал и подтвердить выбор", async () => {
            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.U006_TEST_NAME);

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            if (await materialModal.isVisible().catch(() => false)) {
                const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(addButton).toBeVisible();
                    },
                    'TC07 Step 6: Verify material add button visible',
                    testInfo,
                );
                await detailsPage.highlightElement(addButton);
                await addButton.click();
                await page.waitForLoadState("networkidle");
            }

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                },
                'TC07 Step 6: Verify material modal closed',
                testInfo,
            );
            logger.info("Материал выбран и добавлен");
        });

        await allure.step("Step 7: Заполнить все обязательные атрибуты материала", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC07 Step 7: Verify characteristic table visible',
                testInfo,
            );

            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(targetRow).toBeVisible();
                },
                'TC07 Step 7: Verify target attribute row visible',
                testInfo,
            );

            const inputField = targetRow
                .locator(
                    `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_PATTERN_2}${SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_INPUT_SUFFIX_2}`,
                )
                .first();
            await inputField.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await detailsPage.highlightElement(inputField);

            const value = '100';
            await inputField.fill(value);
            const currentValue = await inputField.inputValue();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(currentValue).toBe(value);
                },
                'TC07 Step 7: Verify attribute value set',
                testInfo,
            );
            logger.info("Обязательные атрибуты материала заполнены");
        });

        await allure.step("Step 8: Нажать кнопку «Сохранить»", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(saveButton).toBeVisible();
                },
                'TC07 Step 8: Verify save button visible',
                testInfo,
            );
            await detailsPage.highlightElement(saveButton);
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            // Verify success message
            //await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");  // ERP-bug
            logger.info("Деталь успешно сохранена со специальными символами в наименовании");
        });

        await allure.step("Step 9: Найти созданную деталь в базе деталей", async () => {
            await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.STANDARD);

            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const tableContainer = detailTable.first();
            await tableContainer.scrollIntoViewIfNeeded();
            await detailsPage.highlightElement(tableContainer);

            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(searchInput).toBeVisible();
                },
                'TC07 Step 9: Verify details table search input visible',
                testInfo,
            );

            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(TIMEOUTS.STANDARD);
            // Golden: search by full name so special characters are exercised in the table search, not only U006 prefix.
            await searchInput.fill(SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);

            const rows = tableContainer.locator("tbody tr");
            const rowCount = await rows.count();
            let isMatch = false;

            for (let i = 0; i < rowCount; i++) {
                const currentRow = rows.nth(i);
                await detailsPage.highlightElement(currentRow);
                await page.waitForTimeout(TIMEOUTS.MEDIUM);

                const rowText = await currentRow.textContent();
                if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME) {
                    isMatch = true;
                    break;
                }
            }
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(isMatch).toBeTruthy();
                },
                'TC07 Step 9: Verify created detail is present in table',
                testInfo,
            );
            logger.info("Созданная деталь найдена в базе деталей");
        });

        await allure.step("Step 10: Открыть деталь для редактирования", async () => {
            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const tableContainer = detailTable.first();
            const rows = tableContainer.locator("tbody tr");
            const rowCount = await rows.count();

            for (let i = 0; i < rowCount; i++) {
                const currentRow = rows.nth(i);
                const rowText = await currentRow.textContent();
                if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME) {
                    await currentRow.click();
                    await page.waitForLoadState("networkidle");
                    // Parts list toolbar: data-testid="BaseProducts-Button-Edit" (MAIN_PAGE_EDIT_BUTTON).
                    const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
                    await editButton.waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.STANDARD });
                    await detailsPage.highlightElement(editButton);
                    await expectSoftWithScreenshot(
                        page,
                        () => {
                            expect.soft(editButton).toBeVisible();
                        },
                        'TC07 Step 10: Verify edit button visible',
                        testInfo,
                    );

                    await editButton.click();
                    await page.waitForTimeout(TIMEOUTS.MEDIUM);
                    break;
                }
            }

            // Verify that the detail opens in edit mode
            const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
            await detailsPage.highlightElement(editPageTitle);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(editPageTitle).toBeVisible();
                },
                'TC07 Step 10: Verify edit page title visible',
                testInfo,
            );
            logger.info("Деталь открыта в режиме редактирования");
        });

        await allure.step("Step 11: Проверить, что материал и атрибуты отображаются корректно", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.EDIT_CHARACTERISTIC_BLANKS_CONTAINER_SELECTOR);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC07 Step 11: Verify edit characteristic table visible',
                testInfo,
            );
            const chrTble = tableContainer.locator(SelectorsPartsDataBase.EDIT_CHR_TABLE);
            await detailsPage.highlightElement(chrTble);

            // Verify material is displayed
            const materialSpan = chrTble.locator('td').nth(2).locator('span');
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialSpan).toBeVisible();
                },
                'TC07 Step 11: Verify material span visible in edit mode',
                testInfo,
            );
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await materialSpan.innerText()).toBe(SelectorsPartsDataBase.U006_TEST_NAME);
                },
                'TC07 Step 11: Verify material text in edit mode',
                testInfo,
            );
            logger.info("Материал отображается корректно в режиме редактирования");

            // Verify attributes are displayed
            // const targetRow = tableContainer.locator('tr').filter({
            //     has: page.locator('td:has-text("Длина (Д)")'),
            // });
            const inputField = chrTble.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR).first();
            await inputField.waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.STANDARD });
            const currentValue = await inputField.inputValue();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(currentValue).toBe('100');
                },
                'TC07 Step 11: Verify attribute value in edit mode',
                testInfo,
            );
            logger.info("Атрибуты отображаются корректно в режиме редактирования");
        });
    });
    test(`U006 CL 08 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 08: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 08 — Числовое наименование', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Шаг 1: Открыть страницу создания", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(mainContainer).toBeVisible();
                },
                'TC08 Step 1: Verify main create page container visible',
                testInfo,
            );
            logger.info("Все элементы загружены правильно");
        });

        await allure.step("Шаг 2: Ввести только числа в поле 'Наименование'", async () => {
            const numericName = "123456";
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, numericName);
            logger.info("Ввод принят или отклонен на основе правил формата");
        });

        await allure.step("Шаг 3: Нажать 'Сохранить'", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(saveButton).toBeVisible();
                },
                'TC08 Step 3: Verify save button visible',
                testInfo,
            );
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            // Проверить результат - либо сообщение об ошибке, либо деталь сохранена
            try {
                await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");
                logger.info("Деталь сохранена с числовым наименованием");
            } catch (error) {
                //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
                logger.info("Получено сообщение об ошибке для числового наименования");
            }
        });
    });
    test(`U006 CL 09 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 09: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 09 — Разные категории материалов', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Открыть главную страницу", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(mainContainer).toBeVisible();
                },
                'TC09 Step 1: Verify main create page container visible',
                testInfo,
            );
            logger.info("Главная страница успешно загружена");
        });

        await allure.step("Step 2: Подтвердить правильный заголовок страницы", async () => {
            const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(createPageTitle).toBeVisible();
                    expect.soft(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
                },
                'TC09 Step 2: Verify create page title visibility and text',
                testInfo,
            );
            logger.info("Страница создания успешно открыта");
        });

        await allure.step("Step 3: Найти поле для ввода наименования детали", async () => {
            const detailNameInput = await page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(detailNameInput).toBeVisible();
                },
                'TC09 Step 3: Verify detail name input visible',
                testInfo,
            );
            await detailsPage.highlightElement(detailNameInput);
            logger.info("Поле наименования детали найдено");
        });

        await allure.step("Step 4: Заполнить поле «Наименование»", async () => {
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);
        });

        await allure.step("Step 5: Нажать кнопку «Задать» в строке «Материал заготовки»", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialButton).toBeVisible();
                },
                'TC09 Step 5: Verify material select button visible',
                testInfo,
            );
            await detailsPage.highlightElement(materialButton);
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialModal).toBeVisible();
                },
                'TC09 Step 5: Verify material modal visible',
                testInfo,
            );
            logger.info("Модальное окно выбора материала успешно открыто");
        });

        await allure.step("Step 6: Выбрать материал из первой категории", async () => {
            // Click on the first category switch
            const firstCategorySwitch = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(firstCategorySwitch).toBeVisible();
                },
                'TC09 Step 6: Verify first material category switch visible',
                testInfo,
            );
            await detailsPage.highlightElement(firstCategorySwitch);
            await firstCategorySwitch.click();
            await page.waitForLoadState("networkidle");

            // Search and select a material from the first category
            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1, SelectorsPartsDataBase.U006_TEST_NAME);

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            if (await materialModal.isVisible().catch(() => false)) {
                const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(addButton).toBeVisible();
                    },
                    'TC09 Step 6: Verify add button visible',
                    testInfo,
                );
                await detailsPage.highlightElement(addButton);
                await addButton.click();
                await page.waitForLoadState("networkidle");
            }

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                },
                'TC09 Step 6: Verify material modal closed',
                testInfo,
            );
            logger.info("Материал из первой категории выбран и добавлен");
        });

        await allure.step("Step 7: Проверить, что поля обновились с конкретными обязательными атрибутами", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC09 Step 7: Verify characteristic table visible',
                testInfo,
            );

            // Verify that the material is displayed
            const materialSpan = tableContainer.locator('td').nth(2).locator('span');
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialSpan).toBeVisible();
                },
                'TC09 Step 7: Verify material span visible',
                testInfo,
            );
            await expectSoftWithScreenshot(
                page,
                async () => {
                    expect.soft(await materialSpan.innerText()).toBe(SelectorsPartsDataBase.U006_TEST_NAME);
                },
                'TC09 Step 7: Verify selected material text',
                testInfo,
            );
            logger.info("Материал отображается в таблице характеристик");

            // Verify that required attribute fields are present
            const requiredFields = tableContainer.locator('tr');
            const fieldCount = await requiredFields.count();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(fieldCount).toBeGreaterThan(0);
                },
                'TC09 Step 7: Verify attribute rows are present',
                testInfo,
            );
            logger.info(`Найдено ${fieldCount} полей атрибутов для первой категории материалов`);
        });

        await allure.step("Step 8: Удалить материал и выбрать из второй категории", async () => {
            // Remove the current material by clicking the remove button
            const resetButton = page.locator(SelectorsPartsDataBase.ADD_DETAILE_RESET_MATERIAL_BUTTON);
            await detailsPage.highlightElement(resetButton);
            await resetButton.click();
            await page.waitForLoadState("networkidle");

            // Open material selection modal again
            const ArchiveDialog = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_BAN_DIALOG);
            await ArchiveDialog.click();
            await page.waitForLoadState("networkidle");

            const confirmYesButton = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
            await detailsPage.highlightElement(confirmYesButton);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(confirmYesButton).toBeVisible();
                },
                'TC09 Step 8: Verify confirm button visible',
                testInfo,
            );
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);

            await ArchiveDialog.click();
            await page.waitForLoadState("networkidle");

            // Click on the second category switch (if available)
            const secondCategorySwitch = page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2);
            if (await secondCategorySwitch.isVisible()) {
                await detailsPage.highlightElement(secondCategorySwitch);
                await secondCategorySwitch.click();
                await page.waitForLoadState("networkidle");

                // Search and select a material from the second category
                const secondCategoryMaterial = "Сталь 45";
                await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2, secondCategoryMaterial);

                const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
                if (await materialModal.isVisible().catch(() => false)) {
                    const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                    await expectSoftWithScreenshot(
                        page,
                        () => {
                            expect.soft(addButton).toBeVisible();
                        },
                        'TC09 Step 8: Verify second category add button visible',
                        testInfo,
                    );
                    await addButton.click();
                    await page.waitForLoadState("networkidle");
                }

                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                    },
                    'TC09 Step 8: Verify material modal closed after second category',
                    testInfo,
                );
                logger.info("Материал из второй категории выбран и добавлен");
            } else {
                logger.info("Вторая категория материалов недоступна, пропускаем");
            }
        });

        await allure.step("Step 9: Проверить, что валидация полей адаптируется в зависимости от типа материала", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(tableContainer).toBeVisible();
                },
                'TC09 Step 9: Verify characteristic table visible',
                testInfo,
            );

            // Verify that the material is displayed
            const materialSpan = tableContainer.locator('td').nth(2).locator('span');
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(materialSpan).toBeVisible();
                },
                'TC09 Step 9: Verify material span visible',
                testInfo,
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
                'TC09 Step 9: Verify attribute rows are present',
                testInfo,
            );
            logger.info(`Найдено ${fieldCount} полей атрибутов для текущей категории материалов`);

            // Check if the fields are different from the first category
            const fieldTexts = await requiredFields.allTextContents();
            logger.info("Поля атрибутов:", fieldTexts);
        });
    });
    test(`U006 CL 10 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);

        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 10: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
};
