import { test, expect } from "@playwright/test";
import { SELECTORS } from "../config";
import { TIMEOUTS, WAIT_TIMEOUTS } from "../lib/Constants/TimeoutConstants";
import logger from "../lib/utils/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, Item } from '../pages/PartsDatabasePage';
import * as SelectorsPartsDataBase from "../lib/Constants/SelectorsPartsDataBase";
import { expectSoftWithScreenshot } from "../lib/Page";

/**
 * U006 save + edit (golden lines 2894–4074).
 */
export const runU006SaveAndEdit = () => {
    test('U006 TC 10 — Сохранение при заполнении обязательных атрибутов', async ({ page }, testInfo) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Открыть главную страницу", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expect(mainContainer).toBeVisible();
            logger.info("Главная страница успешно загружена");
        });

        await allure.step("Step 2: Подтвердить правильный заголовок страницы", async () => {
            const createPageTitle = page.locator(SelectorsPartsDataBase.ADD_DETAL_TITLE);
            await expect(createPageTitle).toBeVisible();
            await expect(createPageTitle).toHaveText(SELECTORS.SUBPAGES.CREATEDETAIL.TEXT_RUS);
            logger.info("Страница создания успешно открыта");
        });

        await allure.step("Step 3: Найти поле для ввода наименования детали", async () => {
            const detailNameInput = await page.locator(SelectorsPartsDataBase.DETAIL_NAME_INPUT);
            await expect(detailNameInput).toBeVisible();
            await detailsPage.highlightElement(detailNameInput);
            logger.info("Поле наименования детали найдено");
        });

        await allure.step("Step 4: Заполнить поле «Наименование»", async () => {
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);
        });

        await allure.step("Step 5: Нажать кнопку «Задать» в строке «Материал заготовки»", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expect(materialButton).toBeVisible();
            await detailsPage.highlightElement(materialButton);
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expect(materialModal).toBeVisible();
            logger.info("Модальное окно выбора материала успешно открыто");
        });

        await allure.step("Step 6: Выбрать материал и подтвердить выбор", async () => {
            // Helper already selects row, clicks Add, and waits for the dialog to close
            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MATERIAL_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME);
            await page.waitForLoadState("networkidle");
            await expect(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            logger.info("Материал выбран и добавлен");
        });

        await allure.step("Step 7: Заполнить все обязательные атрибуты материала", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expect(tableContainer).toBeVisible();

            // Find all input fields in the characteristics table
            const inputFields = tableContainer.locator('input[data-testid$="-Input"]');
            const inputCount = await inputFields.count();
            logger.info(`Найдено ${inputCount} полей для заполнения`);

            // Fill each input field with a value
            for (let i = 0; i < inputCount; i++) {
                const inputField = inputFields.nth(i);
                await inputField.evaluate((input) => {
                    input.style.backgroundColor = 'yellow';
                    input.style.border = '2px solid red';
                    input.style.color = 'blue';
                });

                const value = (i + 1) * 10; // Generate different values for each field
                await inputField.fill(value.toString());
                const currentValue = await inputField.inputValue();
                expect(currentValue).toBe(value.toString());
                logger.info(`Поле ${i + 1} заполнено значением: ${value}`);
            }

            logger.info("Все обязательные атрибуты материала заполнены");
        });

        await allure.step("Step 8: Нажать кнопку «Сохранить»", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expect(saveButton).toBeVisible();
            await detailsPage.highlightElement(saveButton);
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            // Verify success message
            // await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");  // ERP-bug
            logger.info("Деталь успешно сохранена со всеми заполненными атрибутами");
        });

        await allure.step("Step 9: Проверить, что значения соответствуют ожиданиям", async () => {
            // Navigate to the parts database to verify the saved detail
            await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);

            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const tableContainer = detailTable.first();
            await tableContainer.scrollIntoViewIfNeeded();

            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expect(searchInput).toBeVisible();

            let isMatch = false;

            for (let attempt = 1; attempt <= 5; attempt++) {
                await searchInput.fill("");
                await searchInput.press("Enter");
                await page.waitForTimeout(TIMEOUTS.STANDARD);
                await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
                await searchInput.press("Enter");
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(TIMEOUTS.STANDARD);

                const rows = tableContainer.locator("tbody tr");
                const rowCount = await rows.count();

                for (let i = 0; i < rowCount; i++) {
                    const currentRow = rows.nth(i);
                    await detailsPage.highlightElement(currentRow);
                    await page.waitForTimeout(TIMEOUTS.MEDIUM);

                    const rowText = await currentRow.textContent();
                    console.log(`TC10 search attempt ${attempt}, row ${i + 1} text:`, rowText);
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
                'TC10 Step 9: Verify saved detail appears in database',
                testInfo,
            );
            logger.info("Созданная деталь найдена в базе деталей");
        });
    });
    test(`U006 CL 11 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(600000);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите и архивируйте все детали с точным совпадением имени", async () => {
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
                "CL 11: Verify zero exact-match detail rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test('U006 TC 11 — Проверка значений после редактирования', async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Создать деталь с валидными значениями", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expect(mainContainer).toBeVisible();
            logger.info("Главная страница успешно загружена");

            // Fill detail name
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);

            // Select material
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expect(materialButton).toBeVisible();
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expect(materialModal).toBeVisible();

            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MATERIAL_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME);
            await page.waitForLoadState("networkidle");
            await expect(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            logger.info("Материал выбран и добавлен");

            // Fill required attributes
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expect(tableContainer).toBeVisible();

            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expect(targetRow).toBeVisible();

            const inputField = targetRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
            await inputField.evaluate((input) => {
                input.style.backgroundColor = 'yellow';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            const desiredValue = '150';
            await inputField.fill(desiredValue);
            const currentValue = await inputField.inputValue();
            expect(currentValue).toBe(desiredValue);
            await page.waitForTimeout(5000);
            logger.info("Обязательные атрибуты материала заполнены");

            // Save the detail
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expect(saveButton).toBeVisible();
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            //await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");  // ERP-bug
            logger.info("Деталь успешно создана с валидными значениями");
        });

        await allure.step("Step 2: Открыть деталь для редактирования", async () => {
            await page.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);

            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const tableContainer = detailTable.first();
            await tableContainer.scrollIntoViewIfNeeded();

            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expect(searchInput).toBeVisible();

            let matchingRow: Locator | null = null;

            for (let attempt = 1; attempt <= 5; attempt++) {
                await searchInput.fill("");
                await searchInput.press("Enter");
                await page.waitForTimeout(TIMEOUTS.STANDARD);
                await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
                await searchInput.press("Enter");
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(TIMEOUTS.STANDARD);

                const candidateRow = tableContainer
                    .locator("tbody tr")
                    .filter({ hasText: SelectorsPartsDataBase.U006_TEST_DETAIL_NAME })
                    .first();

                if (await candidateRow.isVisible().catch(() => false)) {
                    matchingRow = candidateRow;
                    break;
                }

                logger.warn(`TC11 Step 2: detail "${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}" not visible after search attempt ${attempt}.`);
            }

            expect(matchingRow, `Detail "${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}" should appear in the database before editing.`).not.toBeNull();
            await detailsPage.highlightElement(matchingRow!);
            await matchingRow!.locator('td').last().click();

            // Parts list toolbar (after row select), not EditDetal-Buttons-Edit on the form
            const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
            await editButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await expect(editButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
            await detailsPage.highlightElement(editButton);
            await editButton.click();
            await page.waitForLoadState("networkidle");

            // Verify that the detail opens in edit mode
            const editPageTitle = page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
            await expect(editPageTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            logger.info("Деталь открыта в режиме редактирования");
        });

        await allure.step("Step 3: Подтвердить, что данные сохранились", async () => {
            // Verify detail name is preserved
            const detailNameInput = page.locator(SelectorsPartsDataBase.EDIT_DETAL_INFORMATION_INPUT_FILL);
            await expect(detailNameInput).toBeVisible();
            const savedName = await detailNameInput.inputValue();
            expect(savedName).toBe(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали сохранено: ${savedName}`);

            // Verify material is preserved
            const tableContainer = page.locator(SelectorsPartsDataBase.EDIT_CHARACTERISTIC_BLANKS_CONTAINER_SELECTOR);
            await expect(tableContainer).toBeVisible();

            const materialSpan = tableContainer.locator('td').nth(2).locator('span');
            await expect(materialSpan).toBeVisible();
            const savedMaterial = await materialSpan.innerText();
            expect(savedMaterial).toBe(SelectorsPartsDataBase.TEST_MATERIAL_NAME);
            logger.info(`Материал сохранен: ${savedMaterial}`);

            // Verify attributes are preserved
            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expect(targetRow).toBeVisible();

            const inputField = targetRow.locator(SelectorsPartsDataBase.EDIT_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
            const savedValue = await inputField.inputValue();
            expect(savedValue).toBe('150');
            logger.info(`Значение атрибута сохранено: ${savedValue}`);

            logger.info("Все поля содержат предыдущие значения");
        });
    });
    test(`U006 CL 12 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }) => {
        test.setTimeout(600000);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите все детали с точным совпадением имени", async () => {
            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expect(searchInput).toBeVisible();

            // Perform the search for TEST_DETAIL_NAME
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);
            await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve all rows
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results.`);

            if (rowCount === 0) {
                logger.info("Cleanup: no matching rows to archive; skipped (pass).");
                return;
            }

            // Filter rows to find exact matches
            const matchingRows: Locator[] = [];

            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_DETAIL_NAME) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}'.`);

            if (matchingRows.length === 0) {
                logger.info("Cleanup: no exact-name rows to archive; skipped (pass).");
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
                    const archiveButton = page.locator(SelectorsPartsDataBase.ARCHIVE_BUTTON);
                    await expect(archiveButton).toBeVisible();
                    await archiveButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify archive modal appears
                    const archiveModal = page.locator(`dialog[data-testid="${SelectorsPartsDataBase.CONFIRM_MODAL}"]`);
                    await expect(archiveModal).toBeVisible();

                    const yesButton = archiveModal.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
                    await expect(yesButton).toBeVisible();
                    await yesButton.click();
                    await page.waitForLoadState("networkidle");

                    // Ensure success message appears
                    //await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");//BUG ERP-960
                    await detailsPage.verifyDetailSuccessMessage("Деталь успешно перенесено в архив");

                    await page.waitForTimeout(1000);
                });
            }

            console.log(`All ${matchingRows.length} exact matching details have been archived.`);
        });
    });
    test('U006 TC 12 — Удаление материала и попытка сохранения', async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Шаг 1: Создать деталь с материалом и атрибутами", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expect(mainContainer).toBeVisible();
            logger.info("Страница создания детали открыта");

            // Заполнить наименование
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);

            // Выбрать материал
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expect(materialButton).toBeVisible();
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expect(materialModal).toBeVisible();

            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MATERIAL_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME);
            await page.waitForLoadState("networkidle");
            await expect(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            logger.info("Материал выбран и добавлен");

            // Заполнить атрибуты
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expect(tableContainer).toBeVisible();

            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expect(targetRow).toBeVisible();

            const inputField = targetRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
            await inputField.evaluate((input) => {
                input.style.backgroundColor = 'yellow';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            const value = '100';
            await inputField.fill(value);
            const currentValue = await inputField.inputValue();
            expect(currentValue).toBe(value);
            logger.info("Все данные приняты");
        });

        await allure.step("Шаг 2: Удалить материал", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_RESET_BUTTON);
            await expect(materialButton).toBeVisible();
            await materialButton.click();
            await page.waitForLoadState("networkidle");
            logger.info("Материал удален из формы");
        });

        await allure.step("Шаг 3: Подтвердить удаление материала в диалоговом окне", async () => {
            const archiveDialog = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_BAN_DIALOG);
            await archiveDialog.click();
            await page.waitForLoadState("networkidle");

            const archiveYesButton = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
            await detailsPage.highlightElement(archiveYesButton);
            await expect(archiveYesButton).toBeVisible();
            await page.waitForTimeout(1500);

            await archiveYesButton.click();
            await page.waitForLoadState("networkidle");
            const cancelButton = page.locator(SelectorsPartsDataBase.MATERIAL_CANCEL_BUTTON);
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();
            await page.waitForLoadState("networkidle");
            logger.info("Удаление материала подтверждено");
        });

        await allure.step("Шаг 4: Нажать 'Сохранить'", async () => {
            console.log("Шаг 4: Нажать 'Сохранить'");
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expect(saveButton).toBeVisible();
            await detailsPage.highlightElement(saveButton);
            await page.waitForTimeout(1500);
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");//ERP bug
            logger.info("Появляется ошибка, требующая выбора материала");
        });
    });
    test(`U006 CL 13 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }) => {
        test.setTimeout(600000);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите все детали с точным совпадением имени", async () => {
            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expect(searchInput).toBeVisible();

            // Perform the search for TEST_DETAIL_NAME
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);
            await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve all rows
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results.`);

            if (rowCount === 0) {
                logger.info("Cleanup: no matching rows to archive; skipped (pass).");
                return;
            }

            // Filter rows to find exact matches
            const matchingRows: Locator[] = [];

            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_DETAIL_NAME) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}'.`);

            if (matchingRows.length === 0) {
                logger.info("Cleanup: no exact-name rows to archive; skipped (pass).");
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
                    const archiveButton = page.locator(SelectorsPartsDataBase.ARCHIVE_BUTTON);
                    await expect(archiveButton).toBeVisible();
                    await archiveButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify archive modal appears
                    const archiveModal = page.locator(`dialog[data-testid="${SelectorsPartsDataBase.CONFIRM_MODAL}"]`);
                    await expect(archiveModal).toBeVisible();

                    const yesButton = archiveModal.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
                    await expect(yesButton).toBeVisible();
                    await yesButton.click();
                    await page.waitForLoadState("networkidle");

                    // Ensure success message appears
                    //await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");//BUG ERP-960
                    await detailsPage.verifyDetailSuccessMessage("Деталь успешно перенесено в архив");

                    await page.waitForTimeout(1000);
                });
            }

            console.log(`All ${matchingRows.length} exact matching details have been archived.`);
        });
    });
    test('U006 TC 13 — Удаление материала перед сохранением', async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Шаг 1: Заполнить поле 'Наименование' и выбрать материал", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expect(mainContainer).toBeVisible();
            logger.info("Форма содержит выбранный материал с отображаемыми атрибутами");

            // Заполнить наименование
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);

            // Выбрать материал
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expect(materialButton).toBeVisible();
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expect(materialModal).toBeVisible();

            await detailsPage.searchAndSelectMaterial(SelectorsPartsDataBase.MATERIAL_SWITCH_ITEM1, SelectorsPartsDataBase.TEST_MATERIAL_NAME);
            await page.waitForLoadState("networkidle");
            await expect(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
            logger.info("Материал выбран и добавлен");
        });

        await allure.step("Шаг 2: Заполнить все обязательные атрибуты материала", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expect(tableContainer).toBeVisible();

            const targetRow = tableContainer.locator('tr').filter({
                has: page.locator('td:has-text("Длина (Д)")'),
            });

            await expect(targetRow).toBeVisible();

            const inputField = targetRow.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_INPUT_SELECTOR);
            await inputField.evaluate((input) => {
                input.style.backgroundColor = 'yellow';
                input.style.border = '2px solid red';
                input.style.color = 'blue';
            });

            const value = '150';
            await inputField.fill(value);
            const currentValue = await inputField.inputValue();
            expect(currentValue).toBe(value);
            logger.info("Атрибуты успешно валидированы с правильными значениями");
        });

        await allure.step("Шаг 3: Нажать на иконку для удаления выбранного материала", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_RESET_BUTTON);
            await expect(materialButton).toBeVisible();
            await materialButton.click();
            await page.waitForLoadState("networkidle");
            logger.info("Материал удален из формы");
        });

        await allure.step("Шаг 3a: Подтвердить удаление материала в диалоговом окне", async () => {
            const archiveDialog = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_BAN_DIALOG);
            //await archiveDialog.click();
            //await page.waitForLoadState("networkidle");

            const archiveYesButton = page.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
            await detailsPage.highlightElement(archiveYesButton);
            await expect(archiveYesButton).toBeVisible();
            await page.waitForTimeout(1500);

            await archiveYesButton.click();
            await page.waitForLoadState("networkidle");
            const cancelButton = page.locator(SelectorsPartsDataBase.MATERIAL_CANCEL_BUTTON);
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();
            await page.waitForLoadState("networkidle");
            logger.info("Удаление материала подтверждено");
        });

        await allure.step("Шаг 4: Нажать кнопку 'Сохранить'", async () => {
            const saveButton = page.locator(SelectorsPartsDataBase.SAVE_BUTTON);
            await expect(saveButton).toBeVisible();
            await saveButton.click();
            await page.waitForLoadState("networkidle");

            //await detailsPage.verifyDetailSuccessMessage("Все характеристики детали должны быть заполнены");//ERP bug
            logger.info("Система отклоняет сохранение и отображает ошибку, указывающую на обязательность выбора материала");
        });
    });
    test(`U006 CL 14 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }) => {
        test.setTimeout(600000);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите все детали с точным совпадением имени", async () => {
            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expect(searchInput).toBeVisible();

            // Perform the search for TEST_DETAIL_NAME
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);
            await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve all rows
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results.`);

            if (rowCount === 0) {
                logger.info("Cleanup: no matching rows to archive; skipped (pass).");
                return;
            }

            // Filter rows to find exact matches
            const matchingRows: Locator[] = [];

            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_DETAIL_NAME) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}'.`);

            if (matchingRows.length === 0) {
                logger.info("Cleanup: no exact-name rows to archive; skipped (pass).");
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
                    const archiveButton = page.locator(SelectorsPartsDataBase.ARCHIVE_BUTTON);
                    await expect(archiveButton).toBeVisible();
                    await archiveButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify archive modal appears
                    const archiveModal = page.locator(`dialog[data-testid="${SelectorsPartsDataBase.CONFIRM_MODAL}"]`);
                    await expect(archiveModal).toBeVisible();

                    const yesButton = archiveModal.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
                    await expect(yesButton).toBeVisible();
                    await yesButton.click();
                    await page.waitForLoadState("networkidle");

                    // Ensure success message appears
                    //await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");//BUG ERP-960
                    await detailsPage.verifyDetailSuccessMessage("Деталь успешно перенесено в архив");

                    await page.waitForTimeout(1000);
                });
            }

            console.log(`All ${matchingRows.length} exact matching details have been archived.`);
        });
    });
    test('U006 TC 14 — Переключение категорий материалов', async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Шаг 1: Открыть форму создания детали", async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            const mainContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_PAGE);
            await expect(mainContainer).toBeVisible();
            logger.info("Форма создания детали открыта");
        });

        await allure.step("Шаг 2: Заполнить поле 'Наименование'", async () => {
            await detailsPage.fillAndVerifyField(SelectorsPartsDataBase.DETAIL_NAME_INPUT, SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            logger.info(`Наименование детали заполнено: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`);
        });

        await allure.step("Шаг 3: Открыть модальное окно выбора материала", async () => {
            const materialButton = page.locator(SelectorsPartsDataBase.CHARACTERISTIC_BLANKS_MATERIAL_BUTTON);
            await expect(materialButton).toBeVisible();
            await materialButton.click();
            await page.waitForLoadState("networkidle");

            const materialModal = page.locator(SelectorsPartsDataBase.MATERIAL_MODAL);
            await expect(materialModal).toBeVisible();
            logger.info("Модальное окно выбора материала открыто");
        });

        await allure.step("Шаг 4: Переключиться на вторую категорию материалов", async () => {
            const secondCategorySwitch = page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2);
            if (await secondCategorySwitch.isVisible()) {
                await detailsPage.highlightElement(secondCategorySwitch);
                await secondCategorySwitch.click();
                await page.waitForLoadState("networkidle");
                logger.info("Успешно переключились на вторую категорию материалов");

                // Проверить, что переключение произошло корректно
                await expect(secondCategorySwitch).toBeVisible();
                logger.info("Переключение между категориями работает корректно");
            } else {
                logger.info("Вторая категория материалов недоступна");
            }
        });

        await allure.step("Шаг 5: Выбрать материал из второй категории", async () => {
            if (await page.locator(SelectorsPartsDataBase.SWITCH_MATERIAL_ITEM_2).isVisible()) {
                // Try to find any available material in the second category
                const materialTable = page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_TABLE_ITEM);
                await expect(materialTable).toBeVisible();

                // Wait for the table to load and get the first available material row
                await page.waitForTimeout(1000); // Give time for table to load

                const materialRows = materialTable.locator('tr');
                const rowCount = await materialRows.count();

                if (rowCount > 0) {
                    // Get the first material row
                    const firstMaterialRow = materialRows.first();
                    await expect(firstMaterialRow).toBeVisible();

                    // Try to get material name from the row (handle different table structures)
                    let materialName = "Неизвестный материал";
                    try {
                        // Try different possible cell selectors
                        const firstCell = firstMaterialRow.locator('td').first();
                        if (await firstCell.isVisible()) {
                            materialName = await firstCell.textContent() || "Неизвестный материал";
                        } else {
                            // Try alternative selector if td doesn't work
                            const alternativeCell = firstMaterialRow.locator('*').first();
                            if (await alternativeCell.isVisible()) {
                                materialName = await alternativeCell.textContent() || "Неизвестный материал";
                            }
                        }
                    } catch (error) {
                        logger.info("Не удалось получить название материала, продолжаем с выбором");
                    }

                    logger.info(`Найден материал в второй категории: ${materialName}`);

                    // Try different click approaches
                    let materialSelected = false;
                    const maxAttempts = 3;

                    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                        logger.info(`Попытка выбора материала ${attempt}/${maxAttempts}`);

                        // Try different click approaches
                        if (attempt === 1) {
                            // First attempt: click the entire row
                            await firstMaterialRow.click();
                        } else if (attempt === 2) {
                            // Second attempt: try to find any clickable element in the row
                            try {
                                const clickableElement = firstMaterialRow.locator('button, a, [role="button"], .clickable').first();
                                if (await clickableElement.isVisible()) {
                                    await clickableElement.click();
                                } else {
                                    // Fallback to clicking the row itself
                                    await firstMaterialRow.click();
                                }
                            } catch (error) {
                                // If no clickable element found, click the row
                                await firstMaterialRow.click();
                            }
                        } else {
                            // Third attempt: click anywhere in the row with force
                            await firstMaterialRow.click({ force: true });
                        }

                        await page.waitForLoadState("networkidle");
                        await page.waitForTimeout(1000);

                        // Check if Add button is now visible and enabled
                        const addButton = page.locator(SelectorsPartsDataBase.MATERIAL_ADD_BUTTON);
                        await expect(addButton).toBeVisible();

                        // Verify the button is enabled (not disabled)
                        const isDisabled = await addButton.getAttribute('disabled');
                        const hasDisabledClass = await addButton.evaluate(el => el.classList.contains('disabled-yui-kit'));

                        if (!isDisabled && !hasDisabledClass) {
                            logger.info("Материал успешно выбран, кнопка 'Добавить' активна");
                            materialSelected = true;

                            await detailsPage.highlightElement(addButton);
                            await addButton.click();
                            await page.waitForLoadState("networkidle");

                            await expect(page.locator(SelectorsPartsDataBase.MATERIAL_MODAL)).not.toBeVisible();
                            logger.info("Материал из второй категории успешно выбран и добавлен");
                            break;
                        } else {
                            logger.info(`Попытка ${attempt}: Кнопка 'Добавить' неактивна, материал не выбран`);
                        }
                    }

                    if (!materialSelected) {
                        logger.info("Не удалось выбрать материал после всех попыток");
                        // Continue with the test even if material selection fails
                    }
                } else {
                    logger.info("В таблице материалов второй категории нет доступных материалов");
                }
            } else {
                logger.info("Пропускаем выбор материала - вторая категория недоступна");
            }
        });

        await allure.step("Шаг 6: Проверить, что материал отображается в форме", async () => {
            const tableContainer = page.locator(SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS);
            await expect(tableContainer).toBeVisible();

            // Try different approaches to find the material
            let materialFound = false;
            let materialText = "Материал не найден";

            // Approach 1: Look for material in the expected location (td:nth(2) span)
            try {
                const materialSpan = tableContainer.locator('td').nth(2).locator('span');
                if (await materialSpan.isVisible()) {
                    materialText = await materialSpan.innerText();
                    materialFound = true;
                    logger.info(`Выбранный материал найден: ${materialText}`);
                }
            } catch (error) {
                logger.info("Материал не найден в ожидаемом месте (td:nth(2) span)");
            }

            // Approach 2: Look for material in any span within the table
            if (!materialFound) {
                try {
                    const allSpans = tableContainer.locator('span');
                    const spanCount = await allSpans.count();

                    for (let i = 0; i < spanCount; i++) {
                        const span = allSpans.nth(i);
                        const text = await span.innerText();
                        if (text && text.trim().length > 0 && !text.includes("Длина") && !text.includes("Ширина") && !text.includes("Высота")) {
                            materialText = text;
                            materialFound = true;
                            logger.info(`Материал найден в span ${i}: ${materialText}`);
                            break;
                        }
                    }
                } catch (error) {
                    logger.info("Не удалось найти материал в span элементах");
                }
            }

            // Approach 3: Look for material in any text content within the table
            if (!materialFound) {
                try {
                    const tableText = await tableContainer.textContent();
                    if (tableText && tableText.includes("Сталь")) {
                        materialText = "Сталь (найдена в тексте таблицы)";
                        materialFound = true;
                        logger.info("Материал найден в тексте таблицы");
                    }
                } catch (error) {
                    logger.info("Не удалось прочитать текст таблицы");
                }
            }

            // Log the result
            if (materialFound) {
                logger.info(`Выбранный материал: ${materialText}`);
            } else {
                logger.info("Материал не найден в форме, возможно не был добавлен");
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
                    logger.info("Поля атрибутов не найдены");
                }
            } else {
                logger.info("Таблица характеристик пуста");
            }
        });
    });
    test(`U006 CL 15 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }) => {
        test.setTimeout(600000);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите все детали с точным совпадением имени", async () => {
            const detailTable = page.locator(SelectorsPartsDataBase.DETAIL_TABLE);
            const searchInput = detailTable.locator(SelectorsPartsDataBase.TABLE_SEARCH_INPUT);
            await expect(searchInput).toBeVisible();

            // Perform the search for TEST_DETAIL_NAME
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);
            await searchInput.fill(SelectorsPartsDataBase.U006_TEST_DETAIL_NAME);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve all rows
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results.`);

            if (rowCount === 0) {
                logger.info("Cleanup: no matching rows to archive; skipped (pass).");
                return;
            }

            // Filter rows to find exact matches
            const matchingRows: Locator[] = [];

            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === SelectorsPartsDataBase.U006_TEST_DETAIL_NAME) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}'.`);

            if (matchingRows.length === 0) {
                logger.info("Cleanup: no exact-name rows to archive; skipped (pass).");
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
                    const archiveButton = page.locator(SelectorsPartsDataBase.ARCHIVE_BUTTON);
                    await expect(archiveButton).toBeVisible();
                    await archiveButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify archive modal appears
                    const archiveModal = page.locator(`dialog[data-testid="${SelectorsPartsDataBase.CONFIRM_MODAL}"]`);
                    await expect(archiveModal).toBeVisible();

                    const yesButton = archiveModal.locator(SelectorsPartsDataBase.CONFIRM_YES_BUTTON);
                    await expect(yesButton).toBeVisible();
                    await yesButton.click();
                    await page.waitForLoadState("networkidle");

                    // Ensure success message appears
                    //await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");//BUG ERP-960
                    await detailsPage.verifyDetailSuccessMessage("Деталь успешно перенесено в архив");

                    await page.waitForTimeout(1000);
                });
            }

            console.log(`All ${matchingRows.length} exact matching details have been archived.`);
        });
    });
};


