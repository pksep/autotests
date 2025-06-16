import { test, expect, Locator } from "@playwright/test";
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json'; // Import your test data
import testData2 from '../testdata/U004-PC01.json';
import { notDeepStrictEqual } from "assert";
import exp from "constants";
const LEFT_DATA_TABLE = "BasePaginationTable-Table-product";
const TEST_DETAIL_NAME = "U005_test2_DETAILName";
const TEST_CATEGORY = "3D печать";
const TEST_MATERIAL = "09Г2С (Сталь)";
const TEST_NAME = "Круг Сталь 09Г2С Ø100мм";
const TEST_FILE = "87.02-05.01.00СБ Маслобак (ДГП15)СБ.jpg";

const TEST_MATERIAL_NAME = "Круг (шнур) РТИ Ø8";


const MAIN_PAGE_MAIN_DIV = "BaseDetals-Container-MainContainer";
const MAIN_PAGE_ИЗДЕЛИЕ_TABLE = "BasePaginationTable-Table-product";
const MAIN_PAGE_TITLE_ID = "BaseDetals-Header-Title";

const baseFileNamesToVerify = [
    { name: "Test_imagexx_1", extension: ".jpg" },
    { name: "Test_imagexx_2", extension: ".png" }
];


export const runU006 = () => {
    test.skip("TestCase 01 - создат дитайл", async ({ browser, page }) => {
        test.setTimeout(900000);
        const shortagePage = new CreatePartsDatabasePage(page);
        await allure.step("Step 01: Перейдите на страницу создания детали. (Navigate to the create part page)", async () => {
            shortagePage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 02: В поле ввода инпута \"Наименование\" вводим значение переменной. (In the input field \"Name\" we enter the value of the variable)", async () => {
            await page.waitForLoadState("networkidle");
            const field = page.locator('[data-testid="AddDetal-Information-Input-Input"]');

            await field.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await field.fill('');
            await field.press('Enter');
            await page.waitForTimeout(500);
            await field.fill(TEST_DETAIL_NAME);
            await page.waitForTimeout(500);
            await expect(await field.inputValue()).toBe(TEST_DETAIL_NAME);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 03: откройте диалоговое окно Добавление материала и подтвердите заголовки. (open Добавление материала dialog and verify titles)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('[data-testid="AddDetal-CharacteristicBlanks"]');
            await expect(tableContainer).toBeVisible(); // Ensure the table container is visible

            const tableTitle = tableContainer.locator('[data-testid="AddDetal-CharacteristicBlanks-Title"]');
            await expect(tableTitle).toBeVisible(); // Ensure the title is visible

            // Optionally, highlight the title for debugging
            await tableTitle.evaluate((el) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });

            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetButton = firstDataRow.locator('td').nth(2).locator('button');
            await targetButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await targetButton.click();
        });
        await allure.step("Step 04: Verify that search works for table 3 (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
            const rightTable = page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item"]');
            await rightTable.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await expect(page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item"]')).toBeVisible();
            await rightTable.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input"]').fill('');
            await page.waitForTimeout(1000);
            // Locate the search field within the left table and fill it
            await rightTable.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input"]').fill(TEST_NAME);

            await page.waitForLoadState("networkidle");
            // Optionally, validate that the search input is visible
            await expect(rightTable.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input"]')).toBeVisible();

            await rightTable.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input"]').press('Enter');
            await page.waitForLoadState("networkidle");
            // Find the first row in the table
            const firstRow = rightTable.locator('tbody tr:first-child');
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(1000);
            expect(await firstRow.textContent()).toContain(TEST_NAME);
            // Wait for the row to be visible and click on it
            await firstRow.waitFor({ state: 'visible' });
            firstRow.click();
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'green'; // Highlight with a yellow background
                row.style.border = '2px solid red';  // Add a red border for extra visibility
                row.style.color = 'blue'; // Change text color to blue
            });
            await page.waitForTimeout(500);

        });
        await allure.step("Step 05: Add the found Item (Add the found Item)", async () => {
            await page.waitForLoadState("networkidle");

            const addButton = page.locator('[data-testid="ModalBaseMaterial-Add-Button"]');
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });

            addButton.click();
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);
        });
        await allure.step("Step 06: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('[data-testid="AddDetal-CharacteristicBlanks"]');
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

            await targetSpan.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            expect(await targetSpan.innerText()).toBe(TEST_NAME);
        });
        await allure.step("Step 07: Verify that the item is now shown in the main page table (Verify that the item is now shown in the main page table)", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");
            // Locate the table container by searching for the h3 with the specific title.
            const tableContainer = page.locator('[data-testid="AddDetal-CharacteristicBlanks"]');
            await tableContainer.waitFor({ state: 'visible' });
            const firstDataRow = tableContainer.locator('table tbody tr').first();
            const targetSpan = firstDataRow.locator('td').nth(2).locator('span');

            await targetSpan.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            expect(await targetSpan.innerText()).toBe(TEST_NAME);
        });
        await allure.step("Step 08: Вводим значение переменной в обязательное поле в строке \"Длина (Д)\" в таблице \"Характеристики заготовки\"", async () => {
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate the table container using data-testid
            const tableContainer = page.locator('[data-testid="AddDetal-CharacteristicBlanks"]');
            await expect(tableContainer).toBeVisible();

            // Locate the row dynamically by searching for the text "Длина (Д)"
            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expect(targetRow).toBeVisible();

            // Locate the input field dynamically within the row
            const inputField = targetRow.locator('input[data-testid$="-Input"]'); // Finds any input field with a data-testid ending in "-Input"

            // Highlight the input field for debugging (optional)
            await inputField.evaluate((input) => {
                input.style.backgroundColor = 'yellow';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            // Set the desired value
            const desiredValue = '999';
            await inputField.fill(desiredValue);

            console.log(`Set the value "${desiredValue}" in the input field.`);

            // Verify the value
            const currentValue = await inputField.inputValue();
            console.log("Verified input value:", currentValue);
            expect(currentValue).toBe(desiredValue);

            await page.waitForTimeout(50);
        });


        await allure.step("Step 09: Upload files using drag-and-drop functionality", async () => {
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
            await page.waitForTimeout(1000); // Wait before execution
            const uploadedFiles = await fileInput.evaluate((element: HTMLInputElement) => {
                return element.files?.length || 0;
            });

            console.log(`Number of files uploaded: ${uploadedFiles}`);
            expect(uploadedFiles).toBe(2); // Ensure 2 files were uploaded

            // Optional: Wait for visual or backend updates
            await page.waitForLoadState('networkidle');

            console.log("Files successfully uploaded via the hidden input.");

        });

        await allure.step("Step 10: Проверяем, что в модальном окне отображаются заголовки(check the headers in the dialog)", async () => {
            const shortagePage = new CreatePartsDatabasePage(page);
            // Wait for loading
            const titles = testData1.elements.CreatePage.modalAddDocuments.titles.map((title) => title.trim());

            // Retrieve all H3 titles from the specified class
            const h3Titles = await shortagePage.getAllH3TitlesInModalTestId(page, 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal');
            const normalizedH3Titles = h3Titles.map((title) => title.trim());
            await page.waitForTimeout(50);
            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Log for debugging
            logger.info('Expected Titles:', titles);
            logger.info('Received Titles:', normalizedH3Titles);

            // Validate length
            expect(normalizedH3Titles.length).toBe(titles.length);

            // Validate content and order
            expect(normalizedH3Titles).toEqual(titles);

            const titlesh4 = testData1.elements.CreatePage.modalAddDocuments.titlesh4.map((title) => title.replace(/\s+/g, ' ').trim());
            const h4Titles = await shortagePage.getAllH4TitlesInModalByTestId(page, 'AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal');
            const normalizedH4Titles = h4Titles.map((title) => title.replace(/\s+/g, ' ').trim());

            logger.info('Expected Titles:', titlesh4);
            logger.info('Received Titles:', normalizedH4Titles);

            await page.waitForTimeout(50);

            // Validate length
            expect(normalizedH4Titles.length).toBe(titlesh4.length);

            // Validate content and order
            expect(normalizedH4Titles).toEqual(titlesh4);
            await page.waitForTimeout(50);
        });
        await allure.step("Step 11: Ensure the textarea is present and writable in each file uploaded section", async () => {
            await page.waitForLoadState('networkidle');

            // Locate the modal container using data-testid
            const modal = page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal"]');
            await expect(modal).toBeVisible();

            // Locate the SECTION inside the modal (wildcard for '-Section')
            const section = await modal.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Section"]');
            await section.waitFor({ state: 'attached', timeout: 50 });

            // Locate ALL FILE SECTIONS inside the section (wildcard for '-File')
            const fileSections = await section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-File"]');
            const fileCount = await fileSections.count();

            if (fileCount < 2) {
                throw new Error(`Expected at least 2 file sections, but found ${fileCount}`);
            }

            for (let i = 0; i < 2; i++) {
                const fileSection = fileSections.nth(i);

                // Locate the input section inside the file section (common pattern)


                // Locate the textarea inside the fieldset (specific textarea)
                const textarea = fileSection.locator('textarea[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Textarea-Description-Textarea"]');
                await textarea.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                const checkbox = fileSection.locator('input[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Checkbox-Main"]');
                await checkbox.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                const version = fileSection.locator('input[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-InputNumber-Version-Input"]');
                await version.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });
                const fileName = fileSection.locator('input[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Input-FileName-Input"]');

                // Highlight the textarea for debugging (optional)
                await fileName.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });

                // Ensure the textarea is visible
                await expect(textarea).toBeVisible({ timeout: 5000 });
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
                expect(currentValue).toBe(testValue);
            }

            await page.waitForTimeout(50);
        });


        await allure.step("Step 12: Check buttons in dialog (Check buttons in dialog)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(50);

            const buttons = testData1.elements.CreatePage.modalAddDocuments.buttons;

            // Iterate over each button in the array
            for (const button of buttons) {
                const buttonTestId = button.datatestid; // Assuming testData1 contains data-testid for each button
                const buttonLabel = button.label;
                const expectedState = button.state === "true"; // Convert state string to a boolean

                // Perform the validation for the button
                await allure.step(`Validate button with label: "${buttonLabel}"`, async () => {
                    await page.waitForTimeout(50);
                    console.log(`Checking button: ${buttonTestId} - ${buttonLabel} - Expected State: ${expectedState}`);

                    // Locate the button using data-testid
                    const buttonLocator = page.locator(`[data-testid="${buttonTestId}"]`);

                    // Check if the button is visible and enabled
                    const isButtonVisible = await buttonLocator.isVisible();
                    const isButtonEnabled = await buttonLocator.isEnabled();

                    console.log(`Button: ${buttonTestId} - Visible: ${isButtonVisible}, Enabled: ${isButtonEnabled}`);

                    // Validate the button's visibility and state
                    expect(isButtonVisible).toBeTruthy();
                    expect(isButtonEnabled).toBe(expectedState);

                    logger.info(`Is the "${buttonLabel}" button visible and enabled?`, isButtonVisible && isButtonEnabled);
                });
            }
        });

        await allure.step("Step 13: Проверяем, что в модальном окне есть не отмеченный чекбокс в строке \"Главный:\" (Check that the checkbox is not selected in the MAIN row)", async () => {
            await page.waitForLoadState('networkidle');

            const modal = page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal"]');
            await expect(modal).toBeVisible();

            const section = page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Section"]');
            await section.waitFor({ state: 'attached', timeout: 50 });

            const sectionX = await section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-File"]').first();
            const sectionY = await section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-File"]').nth(1);

            // Validate checkboxes and assert their state
            expect(await shortagePage.validateCheckbox(page, sectionX, 1)).toBeFalsy();
            expect(await shortagePage.validateCheckbox(page, sectionY, 2)).toBeFalsy();

            await page.waitForTimeout(50);
        });

        await allure.step("Step 14: Чек чекбокс в строке \"Главный:\" (Check the checkbox in the \"Главный:\" row)", async () => {
            await page.waitForLoadState('networkidle');

            const section = page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Section"]');
            await section.waitFor({ state: 'attached', timeout: 50 });

            const sectionX = await section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-File"]').first();
            const sectionY = await section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-File"]').nth(1);

            // Validate checkboxes and assert their state
            expect(await shortagePage.checkCheckbox(page, sectionX, 1)).toBeTruthy();
            expect(await shortagePage.checkCheckbox(page, sectionY, 2)).toBeTruthy();

            await page.waitForTimeout(500);
        });
        await allure.step("Step 15: Проверяем, that in the file field is the name of the file uploaded without its file extension", async () => {
            await page.waitForLoadState('networkidle');

            const section = await page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Section"]');
            await section.waitFor({ state: 'attached', timeout: 50 });
            console.log("Dynamic content in modal section loaded.");

            // Extract individual file sections from the main section
            const fileSections = await section.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-File"]').all();

            // Convert { name, extension } objects to filename strings without extension
            const filenamesWithoutExtension = baseFileNamesToVerify.map(file => file.name);

            // Call the function from shortagePage class, passing extracted filenames
            await shortagePage.validateFileNames(page, fileSections, filenamesWithoutExtension);

            console.log("All file fields validated successfully.");
            await page.waitForTimeout(100);
        });

        await allure.step("Step 16: Click the Загрузить все файлы button and confirm modal closure", async () => {
            console.log("Starting file upload process...");

            // Wait for the page to stabilize
            await page.waitForLoadState("networkidle");

            // Locate the upload button using data-testid
            const uploadButton = page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Button-Upload"]');
            const modalLocator = page.locator('dialog[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Modal"]');
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

                // Change button color for debugging
                const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                await uploadButton.evaluate((button, color) => {
                    button.style.backgroundColor = color;
                    button.style.borderColor = color;
                }, randomColor);
                console.log(`Button color changed to ${randomColor}.`);

                // Click the upload button
                await uploadButton.click();
                console.log("Upload button clicked.");

                // Wait for notifications
                await page.waitForTimeout(1500);

                // Check modal visibility again after the button click
                if ((await modalLocator.count()) === 0) {
                    console.log("Modal closed after button click. Upload succeeded!");
                    await page.waitForTimeout(1000);
                    break;
                }

                // Check for notifications
                const notification = await shortagePage.extractNotificationMessage(page);

                if (notification?.message === "Файл с таким именем уже существует") {
                    console.log("Duplicate filename detected. Updating all filenames.");
                    retryCounter++;

                    const sectionsCount = await page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Input-FileName-Input"]').count();
                    console.log(`Found ${sectionsCount} file sections to update filenames.`);

                    for (let i = 0; i < sectionsCount; i++) {
                        // Check if modal still exists before proceeding with the loop
                        if ((await modalLocator.count()) === 0) {
                            console.log("Modal closed during filename updates. Exiting loop.");
                            break;
                        }

                        const fileInput = page.locator('[data-testid="AddDetal-FileComponent-DragAndDrop-ModalAddFile-Input-FileName-Input"]').nth(i);

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
                            await page.waitForTimeout(500);

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
                await page.waitForTimeout(500);

            }

            if (retryCounter >= maxRetries) {
                throw new Error(`Failed to upload files after ${maxRetries} retries.`);
            }

            console.log("File upload process completed successfully.");
        });

        await allure.step("Step 17: Verify uploaded file names with wildcard matching and extension validation", async () => {
            console.log("Starting file verification process...");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2500);
            // Locate the parent section for the specific table
            const parentSection = page.locator('section.attach-file-component');
            console.log("Located parent section for the file table.");


            await page.waitForTimeout(1000);

            // Locate the table rows within the scoped section
            const tableRows = parentSection.locator('.table-yui-kit__tr'); // Only rows inside the specific section

            // Debug: Print all row texts
            tableRows.evaluateAll(rows => rows.map(row => row.textContent)).then(texts => {
                console.log("Table Rows Content:", texts);
            });

            for (const { name, extension } of baseFileNamesToVerify) {
                console.log(`Verifying presence of file with base name: ${name} and extension: ${extension}`);

                // Locate rows where the second column contains the base name
                const matchingRows = await tableRows.locator(`.table-yui-kit__td:nth-child(2):has-text("${name}")`);
                await matchingRows.evaluate((row) => {
                    row.style.backgroundColor = 'yellow';
                    row.style.border = '2px solid red';
                    row.style.color = 'blue';
                });

                const rowCount = await matchingRows.count();

                if (rowCount > 0) {
                    console.log(`Found ${rowCount} rows matching base name "${name}".`);
                    let extensionMatch = false;

                    for (let i = 0; i < rowCount; i++) {
                        const rowText = await matchingRows.nth(i).textContent();
                        console.log(`Row ${i + 1}: ${rowText}`);

                        // Check if the row text contains the expected extension
                        if (rowText && rowText.includes(extension)) {
                            console.log(`File "${name}" with extension "${extension}" is present.`);
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

            console.log("File verification process completed successfully.");
        });
        await allure.step("Step 18: Open Добавить из базы dialog (Open Добавить из базы dialog)", async () => {
            await page.waitForLoadState("networkidle");
            const button = page.locator('[data-testid="AddDetal-FileComponent-AddFileButton"]', { hasText: 'Добавить из базы' });
            await button.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.waitForTimeout(500);
            button.click();

        });
        await allure.step("Step 19: Verify that search works for the files table (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(500);

            // Locate the switch item using data-testid and highlight it for debugging
            const switchItem = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-FileWindow-Switch-Item0"]');
            await switchItem.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await switchItem.click();
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table using data-testid
            const tableContainer = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable"]');
            await expect(tableContainer).toBeVisible();

            // Locate the table within the container
            const leftTable = tableContainer.locator('table');
            await expect(leftTable).toBeVisible();

            // Locate the search input field using data-testid
            const searchField = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable-Search-Dropdown-Input"]');

            // Highlight the search field for debugging
            await searchField.evaluate((input) => {
                input.style.backgroundColor = 'red';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            // Ensure the search field is visible and editable
            await expect(searchField).toBeVisible();
            await page.waitForTimeout(500);
            await searchField.focus(); // Focus on the input field
            await searchField.fill(''); // Clear any existing content
            await searchField.press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);

            // Programmatically set the value using JavaScript
            await searchField.evaluate((element, value) => {
                const input = element as HTMLInputElement; // Explicitly cast the element
                input.value = value; // Set the value directly
                const event = new Event('input', { bubbles: true }); // Trigger an input event
                input.dispatchEvent(event); // Dispatch the event to mimic user input
            }, TEST_FILE);

            // Verify that the field contains the correct value
            const fieldValue = await searchField.inputValue();
            console.log("Verified input value:", fieldValue);
            expect(fieldValue).toBe(TEST_FILE);
            const firstRow1 = leftTable.locator('tbody tr:first-child');
            console.log("First Row:", await firstRow1.textContent());
            // Trigger the search by pressing 'Enter'
            await searchField.press('Enter');
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1500);
            // Locate and highlight the first row in the table
            const firstRow = leftTable.locator('tbody tr:first-child');
            console.log("First Row 2:", await firstRow.textContent());
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

            // Wait for the first row to be visible and validate its content
            await firstRow.waitFor({ state: 'visible' });
            const rowText = await firstRow.textContent();
            console.log("First row text:", rowText);
            expect(rowText?.trim()).toContain(TEST_FILE);

            console.log("Search verification completed successfully.");
        });

        let selectedFileType: string = '';
        let selectedFileName: string = '';
        await allure.step("Step 20: Add the file to the attach list in bottom table (Verify that search works for each column)", async () => {
            await page.waitForLoadState("networkidle");

            // Locate the parent container of the table
            const tableContainer = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-FileWindow-FileTable-Table"]');
            const firstRow = tableContainer.locator('tbody tr:first-child');
            let fileType: string = '';
            selectedFileType = (await firstRow.locator('td').nth(2).textContent()) ?? '';
            selectedFileName = (await firstRow.locator('td').nth(3).textContent()) ?? '';

            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            const addButton = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-FileWindow-AddButton"]', { hasText: 'Добавить' });
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.waitForTimeout(100);
            const isButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-AddButton', 'Добавить', false, 'AddDetal-FileComponent-ModalBaseFiles');

            expect(isButtonReady).toBeTruthy();
            firstRow.click();
            await firstRow.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            await page.waitForTimeout(500);
            const isButtonReady2 = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-ModalBaseFiles-FileWindow-AddButton', 'Добавить', true, 'AddDetal-FileComponent-ModalBaseFiles');
            expect(isButtonReady2).toBeTruthy();
            addButton.click();
            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });

        });
        await allure.step("Step 21: Confirm the file is listed in the bottom table", async () => {
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            const selectedPartNumber = TEST_FILE; // Replace with actual part number

            const bottomTableLocator = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-Table"]'); // Adjust 'xxxxx' as per actual table id
            await bottomTableLocator.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
            });
            // Locate all rows in the table body
            const rowsLocator = bottomTableLocator.locator('tbody tr');
            const rowCount = await rowsLocator.count();
            expect(rowCount).toBeGreaterThan(0); // Ensure the table is not empty

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
                    await tableFileTypeCell.evaluate((row) => {
                        row.style.backgroundColor = 'black';
                        row.style.border = '2px solid red';
                        row.style.color = 'white';
                    });
                }
                if (tableFileName?.trim() === selectedFileName) {
                    isRowFound = true;
                    await tableFileNameCell.evaluate((row) => {
                        row.style.backgroundColor = 'black';
                        row.style.border = '2px solid red';
                        row.style.color = 'white';
                    });
                    console.log(`Selected row found in row ${i + 1}`);
                }
            }
            expect(isRowFound).toBeTruthy();
            await page.waitForTimeout(500);
        });
        await allure.step("Step 22: Click bottom Add button", async () => {
            await page.waitForLoadState("networkidle");

            const addButton = page.locator('[data-testid="AddDetal-FileComponent-ModalBaseFiles-FooterButtons-AddButton"]', { hasText: 'Добавить' }).last();

            await addButton.evaluate((row) => {
                row.style.backgroundColor = 'green';
                row.style.border = '2px solid red';
                row.style.color = 'red';
            });
            await page.waitForTimeout(500);
            addButton.click();

        });
        await allure.step("Step 23: Highlight the row containing the selected file name", async () => {
            await page.waitForLoadState("networkidle");

            // Locate the parent section for the specific table
            const parentSection = page.locator('section.attach-file-component');
            console.log("Located parent section for the file table.");

            // Locate all visible table rows within the scoped section
            const tableRows = parentSection.locator('tbody .table-yui-kit__tr');
            const rowCount = await tableRows.count();

            console.log(`Found ${rowCount} rows in the table.`);

            let fileFound = false;

            for (let i = 0; i < rowCount; i++) {
                const row = tableRows.nth(i);
                const rowHtml = await row.evaluate((rowElement) => rowElement.outerHTML);
                //console.log(`Row ${i + 1} HTML: ${rowHtml}`);
                const fileNameCell = row.locator('.table-yui-kit__td:nth-child(2)');
                await fileNameCell.waitFor({ state: 'visible' });
                const fileNameText = await fileNameCell.textContent();

                console.log(`Row ${i + 1}: ${fileNameText}`);

                // Check if the current row contains the selected file name
                if (fileNameText?.trim() === selectedFileName) { // Match exact name
                    console.log(`Selected file name "${selectedFileName}" found in row ${i + 1}. Highlighting...`);
                    await fileNameCell.evaluate((rowElement) => {
                        rowElement.style.backgroundColor = 'yellow';
                        rowElement.style.border = '2px solid red';
                        rowElement.style.color = 'blue';
                    });
                    fileFound = true;
                    break; // Exit the loop once the file is found and highlighted
                }
            }

            if (!fileFound) {
                throw new Error(`Selected file name "${selectedFileName}" was not found in the table.`);
            }
            await page.waitForTimeout(50);
            console.log("File search and highlight process completed successfully.");
        });
        await allure.step("Step 24: Удалите первый файл из списка медиафайлов.(Remove the first file from the list of attached media files.)", async () => {
            await page.waitForLoadState("networkidle");
            let printButton = page.locator('[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint"]', { hasText: 'Печать' });
            await printButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'yellow';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            let isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint', 'Печать', false);
            let deleteButton = page.locator('button.button-yui-kit.small.disabled-yui-kit.primary-yui-kit', { hasText: 'Удалить' });
            await deleteButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'yellow';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            let isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc', 'Удалить', false);
            expect(isPrintButtonReady).toBeTruthy();
            expect(isDeleteButtonReady).toBeTruthy();
            // Locate the parent section for the specific table
            const parentSection = page.locator('[data-testid="AddDetal-FileComponent"]');
            console.log("Located parent section for the file table.");

            // Locate all visible table rows within the scoped section
            const tableRows = parentSection.locator('[data-testid^="AddDetal-FileComponent-DocumentTable-Tbody-TableRow"]');
            const row = tableRows.first();

            // Refine the locator to target the checkbox input inside the third column
            const checkboxInput = row.locator('[data-testid^="AddDetal-FileComponent-DocumentTable-Checkbox"]');
            await checkboxInput.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'green';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            await checkboxInput.waitFor({ state: 'visible' });

            // Check the checkbox
            await checkboxInput.check();
            await page.waitForTimeout(100);
            printButton = page.locator('[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint"]', { hasText: 'Печать' });
            await printButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'green';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            isPrintButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint', 'Печать', true);
            deleteButton = page.locator('[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc"]', { hasText: 'Удалить' });
            await deleteButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'green';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            isDeleteButtonReady = await shortagePage.isButtonVisibleTestId(page, 'AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc', 'Удалить', true);
            expect(isPrintButtonReady).toBeTruthy();
            expect(isDeleteButtonReady).toBeTruthy();
            // Assert that the checkbox is checked
            expect(await checkboxInput.isChecked()).toBeTruthy();

            //delete row
            deleteButton.click();
            await deleteButton.evaluate((checkboxElement) => {
                checkboxElement.style.backgroundColor = 'green';
                checkboxElement.style.border = '2px solid red';
                checkboxElement.style.color = 'blue';
            });
            await page.waitForTimeout(500);
        });

        await allure.step("Step 25: Save the detail", async () => {
            const saveButton = page.locator('[data-testid="AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save"]', { hasText: 'Сохранить' });
            await saveButton.evaluate((rowElement) => {
                rowElement.style.backgroundColor = 'green';
                rowElement.style.border = '2px solid red';
                rowElement.style.color = 'blue';
            });
            await page.waitForTimeout(50);
            saveButton.click();
            await page.waitForTimeout(5000);

        });

    });
    // TestCase 02: Do not select a material and verify that saving is not allowed.
    test.skip("TestCase 02 - не дает сохранить деталь без выбора материала", async ({ page }) => {
        test.setTimeout(600000);

        // Instantiate our helper classes.
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 01: Перейдите на страницу создания детали", async () => {
            // Navigate to the detail creation page using the warehouse’s goto method.
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 02: Заполните поле 'Наименование' детали", async () => {
            // Fill in the 'Наименование' field.
            await detailsPage.fillDetailName(TEST_DETAIL_NAME);
        });

        await allure.step("Step 03: Пропустите выбор материала", async () => {
            // For this negative test we intentionally skip material selection.
            console.log("Skipping material selection as required for this test case.");
        });

        await allure.step("Step 04: Попытайтесь сохранить деталь без выбора материала", async () => {
            // Click the Save button using the legacy findAndClickElement (passing the partial string without brackets).
            await detailsPage.findAndClickElement(page, "AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save", 500);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 05: Дождитесь и получите сообщение об уведомлении", async () => {
            // Use getMessage (or, if you prefer, read the text directly) to check for the presence of the error text.
            await detailsPage.verifyDetailSuccessMessage('Деталь успешно Создана.');
        });

        await allure.step("Step 06: Проверьте, что уведомление содержит текст 'Выберите материал'", async () => {
            // Retrieve the notification text for further logging and assertion.
            const errorText = await page.locator('[data-testid="Notification-Notification-Description"]').last().textContent();
            console.log("Notification text:", errorText);
            expect(errorText).toContain("Деталь успешно Создана.");
        });

        await allure.step("Step 7: Проверьте, что созданная деталь отображается в базе деталей", async () => {
            // Navigate back to the main 'baza деталей' page.
            await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Wait a moment to let the page load and then locate the table.
            await page.waitForTimeout(1000);

            // Locate the table by its data-testid.
            const detailTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');

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
            await tableContainer.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });

            // Locate the search field in the table header.
            const searchInput = detailTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await expect(searchInput).toBeVisible();

            // Clear the field, enter the detail name, and press Enter.
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);
            await searchInput.fill(TEST_DETAIL_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Locate all rows in the tbody of the first table container.
            const rows = tableContainer.locator("tbody tr");
            const rowCount = await rows.count();
            let isMatch = false;

            // Loop through each row: apply styling and wait 500ms before checking the text.
            for (let i = 0; i < rowCount; i++) {
                const currentRow = rows.nth(i);
                await currentRow.evaluate((el: HTMLElement) => {
                    el.style.backgroundColor = 'yellow';
                    el.style.border = '2px solid red';
                    el.style.color = 'blue';
                });
                await page.waitForTimeout(500);

                const rowText = await currentRow.textContent();
                console.log(`Row ${i + 1} text:`, rowText);
                if (rowText && rowText.trim() === TEST_DETAIL_NAME) {
                    isMatch = true;
                    break;
                }
            }
            expect(isMatch).toBeTruthy();
        });

    });
    test("TestCase 04 - Невалидное добавление материала без обязательных атрибутов", async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу создания детали", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Заполните поле 'Наименование' детали", async () => {
            await detailsPage.fillDetailName(TEST_DETAIL_NAME);
        });

        await allure.step("Step 3: Откройте модальное окно выбора материала", async () => {
            await detailsPage.findAndClickElement(page, "AddDetal-CharacteristicBlanks-SelectedMaterialName-Set", 500);
            const materialModal = page.locator('[data-testid="ModalBaseMaterial"]');
            await expect(materialModal).toBeVisible({ timeout: 5000 });
        });

        await allure.step("Step 4: Выберите материал, но не заполните обязательные поля", async () => {
            // Search and select a material from the specified slider.
            // sliderDataTestId is passed in to target a specific material category.
            await detailsPage.searchAndSelectMaterial(TEST_MATERIAL_NAME, 'ModalBaseMaterial-TableList-Switch-Item1');
        });

        await allure.step("Step 5: Нажмите кнопку 'Добавить материал'", async () => {
            // Instead of a dedicated addMaterialItem() method, use the generic click function.
            await detailsPage.findAndClickElement(page, "ModalBaseMaterial-Add-Button", 500);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 6: Нажмите кнопку 'Сохранить'", async () => {
            await detailsPage.findAndClickElement(page, "AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save", 500);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 7: Проверьте, что появляется сообщение об ошибке", async () => {
            // Validate that the expected error is displayed.
            await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");
        });
    });


    test.skip("TestCase 06 - Архивация всех совпадающих деталей (Cleanup)", async ({ page }) => {
        test.setTimeout(600000);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите все детали с точным совпадением имени", async () => {
            const detailTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');
            const searchInput = detailTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await expect(searchInput).toBeVisible();

            // Perform the search for TEST_DETAIL_NAME
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);
            await searchInput.fill(TEST_DETAIL_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve all rows
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results.`);

            if (rowCount === 0) {
                console.error("No matching rows found for archiving.");
                return;
            }

            // Filter rows to find exact matches
            const matchingRows: Locator[] = [];

            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === TEST_DETAIL_NAME) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${TEST_DETAIL_NAME}'.`);

            if (matchingRows.length === 0) {
                console.error("No exact matches found for archiving.");
                return;
            }

            for (let i = matchingRows.length - 1; i >= 0; i--) {
                await allure.step(`Archiving row ${i + 1} out of ${matchingRows.length}`, async () => {
                    const currentRow = matchingRows[i];

                    // Highlight the row for debugging
                    await currentRow.evaluate((el: HTMLElement) => {
                        el.style.backgroundColor = "red";
                        el.style.border = "2px solid red";
                        el.style.color = "blue";
                    });
                    await page.waitForTimeout(500);

                    // Click the row to select the detail
                    await currentRow.click();
                    await page.waitForTimeout(500);

                    // Click the archive button
                    const archiveButton = page.locator('[data-testid="BaseDetals-Button-Archive"]');
                    await expect(archiveButton).toBeVisible();
                    await archiveButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify archive modal appears
                    const archiveModal = page.locator('dialog[data-testid="ModalConfirm"]');
                    await expect(archiveModal).toBeVisible();

                    const yesButton = archiveModal.locator('[data-testid="ModalConfirm-Content-Buttons-Button-2"]');
                    await expect(yesButton).toBeVisible();
                    await yesButton.click();
                    await page.waitForLoadState("networkidle");

                    // Ensure success message appears
                    //await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");//BUG ERP-960
                    await detailsPage.verifyDetailSuccessMessage("Файл успешно перенесён в архив");

                    await page.waitForTimeout(1000);
                });
            }

            console.log(`All ${matchingRows.length} exact matching details have been archived.`);
        });
    });
}
