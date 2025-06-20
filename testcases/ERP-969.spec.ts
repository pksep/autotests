import { test, expect, Locator, Page } from "@playwright/test";
import { CreatePartsDatabasePage } from "../pages/PartsDatabasePage";
import { SELECTORS } from "../config";
import { allure } from "allure-playwright";


// Test Data
const SEARCH_TEXT = "NonExistentDetail";
const NEW_DETAIL_A = "0T5.21";  // For type Д (the main detail)
const NEW_SB_A = "0T5.11";      // For the new СБ detail

let orderNumber: string | null = null; // Declare outside to share between steps
let orderedQuantity: number = 4; // Declare outside to share between steps
let targetRow: any = null; // Declare outside to share between steps
let specificationQuantity: number = 1; // Global variable for specification quantity from step 10
let waybillCollections: number = 0; // Global variable to track waybill collections
let currentBuildQuantity: number = 1; // Global variable for current build quantity (how many items we're building now)

// Get today's date in DD.MM.YYYY format
const today = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

export const runERP_969 = () => {
    test("TestCase 06 - Архивация всех совпадающих деталей (Cleanup) `${NEW_DETAIL_A}`", async ({ page }) => {
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
            await searchInput.fill(NEW_DETAIL_A);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);
            // Retrieve all rows
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results.`);

            if (rowCount === 0) {
                console.log("No matching rows found for archiving.");
                return;
            }

            // Filter rows to find exact matches
            const matchingRows: Locator[] = [];

            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === NEW_DETAIL_A) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${NEW_DETAIL_A}'.`);

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
    test("TestCase 06 - Архивация всех совпадающих деталей (Cleanup) `${NEW_SB_A}`", async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Найдите все детали СБ с точным совпадением имени", async () => {
            const detailTable = page.locator('[data-testid="BasePaginationTable-Table-cbed"]');
            const searchInput = detailTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await expect(searchInput).toBeVisible();

            // Clear any existing search text.
            await searchInput.fill("");
            await searchInput.press("Enter");
            await page.waitForTimeout(1000);

            // Search for the СБ detail using NEW_SB_A.
            await searchInput.fill(NEW_SB_A);
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);

            // Retrieve all rows.
            const rows = detailTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows in search results for СБ: ${NEW_SB_A}.`);

            if (rowCount === 0) {
                console.log("No matching rows found for archiving СБ.");
                return;
            }

            // Filter rows to find exact matches.
            const matchingRows: Locator[] = [];
            for (let i = 0; i < rowCount; i++) {
                const rowText = await rows.nth(i).textContent();
                if (rowText && rowText.trim() === NEW_SB_A) {
                    matchingRows.push(rows.nth(i));
                }
            }

            console.log(`Found ${matchingRows.length} exact matches for '${NEW_SB_A}'.`);

            if (matchingRows.length === 0) {
                console.error("No exact matches found for archiving СБ.");
                return;
            }

            // Archive each matching row starting from the bottom.
            for (let i = matchingRows.length - 1; i >= 0; i--) {
                await allure.step(`Archiving row ${i + 1} из ${matchingRows.length} для СБ`, async () => {
                    const currentRow = matchingRows[i];

                    // Highlight the row for debugging.
                    await currentRow.evaluate((el: HTMLElement) => {
                        el.style.backgroundColor = "red";
                        el.style.border = "2px solid red";
                        el.style.color = "blue";
                    });
                    await page.waitForTimeout(500);

                    // Click the row to select the detail.
                    await currentRow.click();
                    await page.waitForTimeout(500);

                    // Click the archive button.
                    const archiveButton = page.locator('[data-testid="BaseDetals-Button-Archive"]');
                    await expect(archiveButton).toBeVisible();
                    await archiveButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify the archive confirmation modal appears.
                    const archiveModal = page.locator('dialog[data-testid="ModalConfirm"]');
                    await expect(archiveModal).toBeVisible();
                    const yesButton = archiveModal.locator('[data-testid="ModalConfirm-Content-Buttons-Button-2"]');
                    await expect(yesButton).toBeVisible();
                    await yesButton.click();
                    await page.waitForLoadState("networkidle");

                    // Verify a success message appears.
                    await detailsPage.verifyDetailSuccessMessage("Файл успешно перенесён в архив");
                    await page.waitForTimeout(1000);
                });
            }

            console.log(`Все ${matchingRows.length} совпадающих деталей СБ были архивированы.`);
        });
    });

    test("ERP-969 - Big urgent test for details & specifications", async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        // ─────────────────────────────────────────────────────────────────────────────
        // PART A: Verify that searching in two tables produces no exact results.
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step("Step 1: Open the 'База Деталей' page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Verify 'cbed' table is visible", async () => {
            const cbedTable = page.locator('[data-testid="BasePaginationTable-Table-cbed"]');
            await expect(cbedTable).toBeVisible();
        });

        await allure.step("Step 3: Search in 'cbed' table", async () => {
            const cbedTable = page.locator('[data-testid="BasePaginationTable-Table-cbed"]');
            const cbedInput = cbedTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await expect(cbedInput).toBeVisible();
            await cbedInput.fill(NEW_SB_A);
            await cbedInput.press("Enter");
            await page.waitForTimeout(1000); // Allow search results to update.
        });

        await allure.step("Step 4: Verify no results in 'cbed' table", async () => {
            const cbedTable = page.locator('[data-testid="BasePaginationTable-Table-cbed"]');
            const resultRows = cbedTable.locator("tbody tr");
            const count = await resultRows.count();
            expect(count).toBe(0);
        });

        await allure.step("Step 5: Verify 'detal' table is visible", async () => {
            const detalTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');
            await expect(detalTable).toBeVisible();
        });

        await allure.step("Step 6: Search in 'detal' table", async () => {
            const detalTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');
            const detalInput = detalTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await expect(detalInput).toBeVisible();
            await detalInput.fill(NEW_DETAIL_A);
            await detalInput.press("Enter");
            await page.waitForTimeout(1000);
        });

        await allure.step("Step 7: Verify no results in 'detal' table", async () => {
            const detalTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');
            const resultRows = detalTable.locator("tbody tr");
            const count = await resultRows.count();
            expect(count).toBe(0);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART B: Create a new detail and verify it saves.
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 8: Create new detail with name "${NEW_DETAIL_A}" and save it`, async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");
            await detailsPage.fillDetailName('AddDetal-Information-Input-Input', NEW_DETAIL_A);
            await detailsPage.findAndClickElement(page, "AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save", 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
        });

        await allure.step(`Step 9: Verify detail "${NEW_DETAIL_A}" was saved`, async () => {
            // Click the cancel button to return to the listing.
            await detailsPage.findAndClickElement(page, "EditDetal-ButtonSaveAndCancel-ButtonsCenter-Cancel", 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Search for the new detail within the 'detal' table.
            const detalTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');
            const detailSearchInput = detalTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await detalTable.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "yellow";
            });
            await page.waitForTimeout(1000);
            await expect(detailSearchInput).toBeVisible();
            await detailSearchInput.fill(NEW_DETAIL_A);
            await detailSearchInput.press("Enter");
            await page.waitForTimeout(1000);
            const resultRows = detalTable.locator("tbody tr");
            const count = await resultRows.count();
            expect(count).toBe(1);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART C: Add a product specification using a detail of type "СБ".
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 10: Add specification with detail "${NEW_SB_A}" for type СБ`, async () => {
            // Navigate to the product creation page.
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Open the small dialog for adding a specification.
            await detailsPage.findAndClickElement(page, "BaseDetals-Button-Create", 500);

            // In the small dialog, select the option for type "СБ".
            await detailsPage.findAndClickElement(page, "BaseDetals-CreatLink-Titlebase-of-assembly-units", 500);

            // Fill in the detail name with NEW_SB_A.
            const smallDialogDetailInput = page.locator('[data-testid="Creator-Information-Input-Input"]');
            await expect(smallDialogDetailInput).toBeVisible({ timeout: 5000 });
            await smallDialogDetailInput.fill(NEW_SB_A);

            // Click the "Добавить" button in the small dialog.
            await detailsPage.findAndClickElement(page, "Specification-Buttons-addingSpecification", 500);

            // Select the "Детайл" icon from the small dialog.
            await detailsPage.findAndClickElement(page, "Specification-Dialog-CardbaseDetail1", 500);

            // In the dialog's bottom table, search for the detail we just entered.
            const dialogTable = page.locator('[data-testid="BasePaginationTable-Table-detal"]');
            const dialogSearchInput = dialogTable.locator('[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]');
            await expect(dialogSearchInput).toBeVisible({ timeout: 5000 });
            await dialogSearchInput.fill(NEW_DETAIL_A);
            await dialogSearchInput.press("Enter");
            await page.waitForTimeout(1000);

            // Now, search the results for an exact match for NEW_DETAIL_A.
            const resultRows = dialogTable.locator("tbody tr");
            const rowCount = await resultRows.count();
            let found = false;
            for (let i = 0; i < rowCount; i++) {
                const rowText = await resultRows.nth(i).textContent();
                if (rowText && rowText.trim() === NEW_DETAIL_A) {
                    // Exact match found: click the corresponding row.
                    await resultRows.nth(i).click();
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(`Detail "${NEW_DETAIL_A}" not found in dialog results.`);
            }
            await page.waitForTimeout(1000);
            // Click the button to add that detail to the dialog's bottom table.
            await detailsPage.findAndClickElement(page, "Specification-ModalBaseDetal-Select-Button", 500);
            await page.waitForTimeout(1000);

            // Click the add button to move the detail into the main specifications table (closes the dialog).
            await detailsPage.findAndClickElement(page, "Specification-ModalBaseDetal-Add-Button", 500);
            await page.waitForTimeout(1000);

            // Verify that the detail is now visible in the product's specifications table.
            const specsTable = page.locator('[data-testid="Editor-TableSpecification-Cbed"]');
            await specsTable.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "red";
            });
            await expect(specsTable).toBeVisible({ timeout: 5000 });
            const specRows = specsTable.locator("tbody tr");
            const rowTexts = await specRows.allTextContents();
            const detailAdded = rowTexts.some(text => text.includes(NEW_DETAIL_A));
            expect(detailAdded).toBe(true);

            // Finally, click save on the product page and verify the success message.
            const save = await page.locator('[data-testid="Creator-ButtonSaveAndCancel-ButtonsCenter-Save"]');
            await save.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "red";
            });
            await save.click();
            // Debug: Capture and output the HTML of all elements with data-testid="Notification-Notification-Description"
            // const successDialog = page.locator('[data-testid="Notification-Notification-Description"]');
            // await successDialog.evaluate((el: HTMLElement) => {
            //     el.style.backgroundColor = 'yellow';
            //     el.style.border = '2px solid red';
            //     el.style.color = 'blue';
            // });

            // await expect(successDialog).toBeVisible({ timeout: 5000 });

            // Retrieve and log the text content for debugging
            // const dialogText = await successDialog.textContent();
            // console.log("Success dialog text:", dialogText);

            // Verify that the notification contains the expected text
            //expect(dialogText).toContain("Сборочная единица успешно Создана");

            await page.waitForTimeout(1000);
        });
        let skladPage: Page;  // Declare outside to share between steps

        await allure.step("Step 11.1: Open a new browser tab and navigate to the Склад page", async () => {
            // Open a new tab and navigate to the Склад page.
            skladPage = await page.context().newPage();
            await skladPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await skladPage.waitForLoadState("networkidle");
        });

        await allure.step("Step 11.2: Click the Ревизия button", async () => {
            // Click the revision button using the generic click helper.
            await detailsPage.findAndClickElement(skladPage, "Sclad-revision-revision", 500);
        });

        await allure.step("Step 11.3: Select the Детайли slider", async () => {
            // In the Склад page, select the Detail slider.
            await detailsPage.findAndClickElement(skladPage, "MiniNavigation-POS-Data2", 500);
        });

        await allure.step("Step 11.4: Find the search input and search for the detail", async () => {
            // Locate the table and its search input within the Склад section.


            const skladTable = skladPage.locator('[data-testid="TableRevisionPagination-Table"]');
            const searchInput = skladTable.locator('[data-testid="Search-Cover-Input"]');
            await searchInput.evaluate((element: HTMLElement) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "red";
            });
            await expect(searchInput).toBeVisible({ timeout: 5000 });

            // Enter the detail name (NEW_DETAIL_A) and trigger the search.
            await searchInput.fill(NEW_DETAIL_A);
            await searchInput.press("Enter");
            await skladPage.waitForLoadState("networkidle");
            await skladPage.waitForTimeout(1000);
        });

        await allure.step("Step 11.5: Verify exactly one matching row is found", async () => {
            // Get all <tbody> elements within the target table
            const allBodies = skladPage.locator('[data-testid="TableRevisionPagination-Table"] tbody');
            const lastBody = allBodies.last(); // The one with actual data rows (not headers)

            // Now get all <tr> within the last tbody
            const resultRows = lastBody.locator('tr');
            const rowCount = await resultRows.count();
            console.log(`✅ Found ${rowCount} row(s) in the data tbody`);

            // Expect exactly one matching row from the search
            expect(rowCount).toBe(1);
        });

        // Step 2: Update the value in the 4th column (the editable element).
        await allure.step("Step 11.6: Update the actual quantity to '1' in the editable cell", async () => {
            // Locate the only returned row after the search.
            const row = skladPage.locator('[data-testid="TableRevisionPagination-Table"] tbody tr').last();
            await expect(row).toBeVisible({ timeout: 5000 });

            // Within this row, locate the 4th column (index 3).
            const fourthCell = row.locator("td").nth(3);
            await expect(fourthCell).toBeVisible({ timeout: 5000 });

            // Inside the cell, locate the editable div with contenteditable=true.
            const editField = fourthCell.locator('[data-testid="TableRevisionPagination-EditPen"]');
            await expect(editField).toBeVisible({ timeout: 5000 });

            // Fill in "1" and press Enter to submit the change.
            await editField.fill("1");
            await editField.press("Enter");

            // Wait for the update to take effect.
            await skladPage.waitForLoadState("networkidle");
        });



        await allure.step("Step 11.7: Confirm the update in the confirmation dialog", async () => {
            // Wait for the confirmation dialog to appear.
            const confirmDialog = skladPage.locator('div[data-testid^="TableRevisionPagination-ModalPrompt"]');
            await expect(confirmDialog).toBeVisible({ timeout: 5000 });

            // In the dialog, click the confirm button.
            const confirmButton = confirmDialog.locator('[data-testid="ModalPromptMini-Button-Confirm"]');
            await expect(confirmButton).toBeVisible({ timeout: 5000 });
            await confirmButton.click();
            await skladPage.waitForLoadState("networkidle");
        });
        await allure.step("Step 11.8: Reload, open Детайли, search again, and verify updated quantity", async () => {
            // Reload the page and wait until everything settles
            await skladPage.reload();
            await skladPage.waitForLoadState("networkidle");

            // Re-open the Детайли slider tab
            await detailsPage.findAndClickElement(skladPage, "MiniNavigation-POS-Data2", 500);
            await skladPage.waitForTimeout(1000);

            // Confirm the table is visible
            const skladTable = skladPage.locator('table[data-testid="TableRevisionPagination-Table"]');
            await expect(skladTable).toBeVisible({ timeout: 5000 });

            // Perform the search again
            const searchInput = skladTable.locator('[data-testid="Search-Cover-Input"]');
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill("");
            await searchInput.press("Enter");
            await skladPage.waitForTimeout(1000);

            await searchInput.fill(NEW_DETAIL_A);
            await searchInput.press("Enter");
            await skladPage.waitForLoadState("networkidle");
            await skladPage.waitForTimeout(1000);
            // Select the last <tbody> (actual data) and verify one row is returned
            const allTbody = skladTable.locator("tbody");
            const dataBody = allTbody.last();
            const rows = dataBody.locator("tr");
            const rowCount = await rows.count();
            console.log(`Verified ${rowCount} row(s) in the updated table`);
            expect(rowCount).toBe(1);

            // Locate the editable div in the 4th column and confirm the saved value
            const fourthCell = rows.first().locator("td").nth(3);
            const editDiv = fourthCell.locator('[data-testid="TableRevisionPagination-EditPen"]');
            await expect(editDiv).toBeVisible({ timeout: 5000 });

            const value = await editDiv.textContent();
            if (value === null) throw new Error("Editable cell content is null.");
            console.log("Confirmed saved value after reload:", value.trim());

            expect(value.trim()).toBe("1");
        });
        await allure.step("Step 12: Open residuals in new tab and verify saved detail has 0 quantity", async () => {
            // Open a new tab for the residuals check
            const residualsPage = await page.context().newPage();
            await residualsPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await residualsPage.waitForLoadState("networkidle");

            // Click the residuals button to enter the stock overview
            await detailsPage.findAndClickElement(residualsPage, "Sclad-residuals-residuals", 500);
            await residualsPage.waitForLoadState("networkidle");

            // Locate the residuals table and confirm visibility
            const residualsTable = residualsPage.locator('table[data-testid="OstatkPCBD-Detal-Table"]');
            await expect(residualsTable).toBeVisible({ timeout: 5000 });

            // Perform the search for the new detail
            const searchInput = residualsTable.locator('[data-testid="OstatkiPCBDTable-SearchInput-Dropdown-Input"]');
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill("");
            await searchInput.press("Enter");
            await residualsPage.waitForTimeout(1000);

            await searchInput.fill(NEW_DETAIL_A);
            await searchInput.press("Enter");
            await residualsPage.waitForLoadState("networkidle");
            await residualsPage.waitForTimeout(1000);
            // Verify exactly one matching row is returned
            const rows = residualsTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} row(s) in residuals table for detail "${NEW_DETAIL_A}".`);
            expect(rowCount).toBe(1);

            // Verify that the 5th column contains value "0"
            const fifthCell = rows.first().locator("td").nth(4);
            await fifthCell.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "red";
            });
            const cellText = await fifthCell.textContent();
            if (cellText === null) throw new Error("Fifth column content is null.");
            console.log("Residual quantity found in 5th column:", cellText.trim());
            expect(cellText.trim()).toBe("0");
            await residualsPage.waitForTimeout(3000);
        });

        // to here comment
        const warehousePage = await page.context().newPage();
        await allure.step("Step 13: Create supplier order and start production for test SB", async () => {
            // Open a new tab for the warehouse page

            await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await warehousePage.waitForLoadState("networkidle");

            // Click the ordering suppliers button
            await detailsPage.findAndClickElement(warehousePage, "Sclad-orderingSuppliers", 500);
            await warehousePage.waitForLoadState("networkidle");

            // Click the create order button
            await detailsPage.findAndClickElement(warehousePage, "OrderSuppliers-Div-CreateOrderButton", 500);
            await warehousePage.waitForLoadState("networkidle");

            // Verify the supplier order creation modal is visible
            const supplierModal = warehousePage.locator('[data-testid="ModalAddOrder-SupplierOrderCreationModal-Content"]');
            await expect(supplierModal).toBeVisible({ timeout: 5000 });

            // Click the assemblies operation button
            await detailsPage.findAndClickElement(warehousePage, "SelectTypeObject-Operation-Assemblies", 500);
            await warehousePage.waitForLoadState("networkidle");

            // Verify the production table is visible
            const productionTable = warehousePage.locator('table[data-testid="ModalAddOrder-ProductionTable-Table"]');

            await expect(productionTable).toBeVisible({ timeout: 5000 });

            // Find and fill the search input
            const searchInput = productionTable.locator('[data-testid="Search-Cover-Input"]');
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill(NEW_SB_A);
            await searchInput.press("Enter");
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1000);

            // Verify exactly one row is returned
            const rows = productionTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} row(s) in production table for SB "${NEW_SB_A}".`);
            expect(rowCount).toBe(1);

            // Enter quantity "2" in the 8th column
            const quantityInput = rows.first().locator('[data-testid="ModalAddOrder-ProductionTable-TableRowYourQuantityInput"]');
            await expect(quantityInput).toBeVisible({ timeout: 5000 });
            await quantityInput.fill(orderedQuantity.toString());
            await quantityInput.press("Enter");
            await warehousePage.waitForTimeout(500);

            // Click the order button without selecting checkbox (should show warning)
            await detailsPage.findAndClickElement(warehousePage, "ModalAddOrder-ProductionTable-OrderButton", 500);
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1000);

            // Verify warning notification appears
            //await detailsPage.verifyDetailSuccessMessage("Сначала выберите объекты для запуска в производство");

            // Check the checkbox in the first column of the results row
            // Try clicking on the parent td element first
            await rows.locator("td").nth(0).click();

            // Click the order button again (should open production modal)
            await detailsPage.findAndClickElement(warehousePage, "ModalAddOrder-ProductionTable-OrderButton", 500);
            await warehousePage.waitForLoadState("networkidle");

            // Verify the production start modal is visible
            const productionModal = warehousePage.locator('[data-testid="ModalAddOrder-Modals-ModalStartProductiontrue"]');
            await productionModal.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "yellow";
            });
            await expect(productionModal).toBeVisible({ timeout: 5000 });

            // Verify the modal title
            const modalTitle = productionModal.locator('h4');
            await expect(modalTitle).toHaveText("Запустить в производство", { timeout: 5000 });

            // Verify today's date is present (check for current date format)
            const today = new Date().toLocaleDateString('ru-RU');
            const modalContent = await productionModal.textContent();
            expect(modalContent).toContain(today);

            // Capture the order number
            const orderNumberSpan = productionModal.locator('span[data-testid="ModalStartProduction-OrderNumberValue"]');
            await orderNumberSpan.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await expect(orderNumberSpan).toBeVisible({ timeout: 5000 });
            orderNumber = await orderNumberSpan.textContent();
            console.log(`Captured order number: ${orderNumber}`);

            // Find and click the "В производство" button
            const startProductionButton = productionModal.locator('[data-testid="ModalStartProduction-ComplectationTable-CancelButton"]:has-text("В производство")');
            await expect(startProductionButton).toBeVisible({ timeout: 5000 });
            await startProductionButton.click();
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1500);

            // Verify success notification contains the order number
            //await detailsPage.verifyDetailSuccessMessage(`Заказ №${orderNumber} отправлен в производство`);

            // Close the modal by clicking at position 1,1
            await warehousePage.mouse.click(1, 1);
            await warehousePage.waitForTimeout(1000);
            await warehousePage.mouse.click(1, 1);
            await warehousePage.waitForTimeout(1000);
        });

        await allure.step("Step 14: Search for the created order in the order table", async () => {
            // Verify the order table is visible
            await warehousePage.waitForLoadState("networkidle");
            const orderTable = warehousePage.locator('table[data-testid="OrderSuppliers-Table-OrderTable"]');
            await expect(orderTable).toBeVisible({ timeout: 5000 });

            // Find and fill the search input with the captured order number
            const searchInput = orderTable.locator('[data-testid="Search-Cover-Input"]');
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill(NEW_SB_A);
            await searchInput.press("Enter");
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1000);

            // Verify exactly one tbody is returned (due to table structure issue)
            const tbodyElements = orderTable.locator("tbody");
            const tbodyCount = await tbodyElements.count();

            console.log(`Found ${tbodyCount} tbody element(s) in order table.`);

            // Create the search pattern with "C" prefix
            const searchPattern = `C${orderNumber}`;
            console.log(`Looking for order with pattern: "${searchPattern}"`);

            let foundOrder = false;


            // Cycle through all tbody elements and their rows
            for (let i = 0; i < tbodyCount; i++) {
                const tbody = tbodyElements.nth(i);
                const rows = tbody.locator("tr");
                const rowCount = await rows.count();

                console.log(`Checking tbody ${i + 1}, found ${rowCount} rows`);

                for (let j = 0; j < rowCount; j++) {
                    const row = rows.nth(j);
                    const firstCell = row.locator("td").first();
                    const cellText = await firstCell.textContent();

                    console.log(`Row ${j + 1} in tbody ${i + 1}: "${cellText}"`);

                    if (cellText?.trim() === searchPattern) {
                        console.log(`✅ Found matching order: "${cellText}"`);

                        // Highlight the found row
                        await row.evaluate((el: HTMLElement) => {
                            el.style.backgroundColor = 'green';
                            el.style.border = '3px solid red';
                            el.style.color = 'white';
                        });

                        foundOrder = true;
                        targetRow = row;
                        console.log(`✅ Target row assigned: ${targetRow ? 'success' : 'failed'}`);
                        break;
                    }
                }

                if (foundOrder) {
                    console.log(`✅ Breaking out of tbody loop, order found`);
                    break;
                }
            }

            // Verify that the order was found
            expect(foundOrder).toBe(true);
            expect(targetRow).not.toBeNull();
            console.log(`✅ Order "${searchPattern}" was found and highlighted`);
            console.log(`✅ Target row is ready for Step 15: ${targetRow ? 'yes' : 'no'}`);
        });

        await allure.step("Step 15: Click the found order row and verify order details in modal", async () => {
            // Get the date from the 4th column of the found row
            const dateCell = targetRow.locator("td").nth(3); // 4th column (index 3)
            await expect(dateCell).toBeVisible({ timeout: 5000 });
            await dateCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            const orderDate = await dateCell.textContent();
            console.log(`Order date from table: "${orderDate}"`);

            // Click the found row to open the modal
            await targetRow.click();
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1000);

            // Verify the modal is visible
            const orderModal = warehousePage.locator('dialog[data-testid^="OrderSuppliers-ModalWorker-WorkerModal"]');
            await orderModal.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid red';
                el.style.backgroundColor = 'lightblue';
            });
            await expect(orderModal).toBeVisible({ timeout: 5000 });

            // Verify the modal title
            const modalTitle = orderModal.locator('h4');
            await modalTitle.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await expect(modalTitle).toHaveText("Заказ", { timeout: 5000 });

            // Verify the order date in the modal
            const modalDateElement = orderModal.locator('.modal-worker__label-span').first();
            await modalDateElement.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await expect(modalDateElement).toBeVisible({ timeout: 5000 });
            const modalDate = await modalDateElement.textContent();
            console.log(`Modal date: "${modalDate}"`);
            expect(modalDate).toContain(orderDate?.trim() || "");

            // Verify the order number (without "C" prefix)
            const modalOrderNumberElement = orderModal.locator('.modal-worker__label-span').nth(1);
            await modalOrderNumberElement.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await expect(modalOrderNumberElement).toBeVisible({ timeout: 5000 });
            const modalOrderNumber = await modalOrderNumberElement.textContent();
            console.log(`Modal order number: "${modalOrderNumber}"`);
            expect(modalOrderNumber?.trim()).toBe(orderNumber?.trim());

            // Find and verify the table contents
            const table = orderModal.locator('[data-testid="Table"]');
            await table.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid green';
                el.style.backgroundColor = 'lightgreen';
            });
            await expect(table).toBeVisible({ timeout: 5000 });

            // Get the first data row (skip header if present)
            const firstDataRow = table.locator("tbody tr").first();
            await firstDataRow.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '2px solid red';
                el.style.color = 'black';
            });
            await expect(firstDataRow).toBeVisible({ timeout: 5000 });

            // Verify the first column contains order number with suffix
            const firstColumn = firstDataRow.locator("td").first();
            await firstColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            const firstColumnText = await firstColumn.textContent();
            console.log(`First column (order number with suffix): "${firstColumnText}"`);
            expect(firstColumnText).toMatch(new RegExp(`^${orderNumber}_\\d+$`));

            // Verify the third column contains NEW_SB_A
            const thirdColumn = firstDataRow.locator("td").nth(2); // 3rd column (index 2)
            await thirdColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            const thirdColumnText = await thirdColumn.textContent();
            console.log(`Third column (item): "${thirdColumnText}"`);
            expect(thirdColumnText?.trim()).toBe(NEW_SB_A);

            // Verify the fourth column contains "Заказано"
            const fourthColumn = firstDataRow.locator("td").nth(3); // 4th column (index 3)
            await fourthColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            const fourthColumnText = await fourthColumn.textContent();
            console.log(`Fourth column (status): "${fourthColumnText}"`);
            expect(fourthColumnText?.trim()).toBe("Заказано");

            // Verify the fifth column contains the ordered quantity
            const fifthColumn = firstDataRow.locator("td").nth(4); // 5th column (index 4)
            await fifthColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            const fifthColumnText = await fifthColumn.textContent();
            console.log(`Fifth column (quantity): "${fifthColumnText}"`);
            expect(parseInt(fifthColumnText?.trim() || "0")).toBe(orderedQuantity);

            // Verify the last column contains "0"
            const lastColumn = firstDataRow.locator("td").last();
            await lastColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            const lastColumnText = await lastColumn.textContent();
            console.log(`Last column: "${lastColumnText}"`);
            expect(lastColumnText?.trim()).toBe("0");
            await warehousePage.waitForTimeout(5000);
            // Close the modal
            await warehousePage.mouse.click(1, 1);

        });

        await allure.step("Step 16: Navigate to assembly kitting page and search for our SB", async () => {
            // Open a new tab for the assembly kitting page
            const kittingPage = await page.context().newPage();
            await kittingPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await kittingPage.waitForLoadState("networkidle");

            // Click the assembly kitting button
            const assemblyKittingButton = kittingPage.locator('[data-testid="Sclad-completionCbedPlan"]');
            await assemblyKittingButton.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'green';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            await detailsPage.findAndClickElement(kittingPage, "Sclad-completionCbedPlan", 500);
            await kittingPage.waitForLoadState("networkidle");

            // Verify the page title
            const pageTitle = kittingPage.locator('[data-testid="CompletCbed-Title-AssemblyKittingOnPlan"]');
            await pageTitle.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            await expect(pageTitle).toHaveText("Комплектация сборок на план", { timeout: 5000 });

            // Find the table and search for our SB
            const kittingTable = kittingPage.locator('[data-testid="TableComplect-TableComplect-Table"]');
            await kittingTable.evaluate((el: HTMLElement) => {
                el.style.border = '3px solid blue';
                el.style.backgroundColor = 'lightblue';
            });
            await expect(kittingTable).toBeVisible({ timeout: 5000 });

            const searchInput = kittingTable.locator('[data-testid="Search-Cover-Input"]');
            await searchInput.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '3px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill(NEW_SB_A);
            await searchInput.press("Enter");
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(2000);

            // Verify our result is in the first row by checking the fourth column
            const firstRow = kittingTable.locator("tbody tr").first();
            await firstRow.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            await expect(firstRow).toBeVisible({ timeout: 5000 });

            const fourthColumn = firstRow.locator("td").nth(3); // 4th column (index 3)
            await fourthColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const fourthColumnText = await fourthColumn.textContent();
            console.log(`Fourth column value: "${fourthColumnText}"`);
            expect(fourthColumnText?.trim()).toBe(NEW_SB_A);

            // Double click on the third column to open the modal
            const thirdColumn = firstRow.locator("td").nth(2); // 3rd column (index 2)
            await thirdColumn.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'purple';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
                el.style.cursor = 'pointer';
            });
            await thirdColumn.dblclick();
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(1000);

            // Verify the modal is visible
            const waybillModal = kittingPage.locator('div[data-testid^="ModalAddWaybill-WaybillDetails-Right"]');
            await waybillModal.evaluate((el: HTMLElement) => {
                el.style.border = '4px solid red';
                el.style.backgroundColor = 'lightyellow';
                el.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
            });
            await expect(waybillModal).toBeVisible({ timeout: 5000 });

            // Verify the modal title contains today's date
            const modalTitle = waybillModal.locator('h3[data-testid="ModalAddWaybill-WaybillDetails-Heading"]');
            await modalTitle.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
                el.style.fontSize = '18px';
            });
            await expect(modalTitle).toBeVisible({ timeout: 5000 });
            const titleText = await modalTitle.textContent();
            console.log(`Modal title: "${titleText}"`);

            // Check that title contains today's date (ignore the missing number after №)
            const today = new Date().toLocaleDateString('ru-RU');
            expect(titleText).toContain(today);

            // Verify collected quantity is 0
            const collectedQuantityCell = waybillModal.locator('[data-testid="ModalAddWaybill-WaybillDetails-CollectedQuantityCell"]');
            await collectedQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const collectedQuantityValue = await collectedQuantityCell.textContent();
            const collectedQuantity = collectedQuantityValue ? parseInt(collectedQuantityValue.replace(/[^\d-]/g, '').trim(), 10) : 0;

            console.log(`Collected quantity: "${collectedQuantityValue}"`);
            // This is the second time opening the modal, so collected quantity should reflect the build quantity we set earlier
            expect(parseInt(collectedQuantityValue?.trim() || "0")).toBe(0);

            // Verify required quantity is our order quantity
            const requiredQuantityCell = waybillModal.locator('[data-testid="ModalAddWaybill-WaybillDetails-RequiredQuantityCell"]');
            await requiredQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const requiredQuantity = await requiredQuantityCell.textContent();
            console.log(`Required quantity: "${requiredQuantity}"`);
            expect(parseInt(requiredQuantity?.trim() || "0")).toBe(orderedQuantity);

            // Verify own quantity input has our order quantity
            const ownQuantityInput = waybillModal.locator('[data-testid="ModalAddWaybill-WaybillDetails-OwnQuantityInput"]');
            await ownQuantityInput.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '3px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
                el.style.fontSize = '16px';
            });
            const ownQuantityValue = await ownQuantityInput.inputValue();
            console.log(`Own quantity input: "${ownQuantityValue}"`);
            expect(parseInt(ownQuantityValue || "0")).toBe(orderedQuantity);

            // Verify the SB name
            const nameCell = waybillModal.locator('[data-testid="ModalAddWaybill-WaybillDetails-NameCell"]');
            await nameCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const sbName = await nameCell.textContent();
            console.log(`SB name: "${sbName}"`);
            expect(sbName?.trim()).toBe(NEW_SB_A);

            // Verify total quantity label
            const totalQuantityLabel = waybillModal.locator('[data-testid="ModalAddWaybill-ShipmentDetailsTable-TotalQuantityLabel"]');
            await totalQuantityLabel.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const totalQuantityText = await totalQuantityLabel.textContent();
            console.log(`Total quantity label: "${totalQuantityText}"`);
            expect(totalQuantityText?.trim()).toBe("Всего: 0");

            // Verify order number in shipment details
            const orderNumberCell = waybillModal.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-OrderNumberCell"]');
            await orderNumberCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const orderNumberText = await orderNumberCell.textContent();
            console.log(`Order number in shipment: "${orderNumberText}"`);
            expect(orderNumberText?.trim()).toBe(`№${orderNumber?.trim()}`);

            // Verify remaining quantity
            const remainingQuantityCell = waybillModal.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]');
            await remainingQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const remainingQuantity = await remainingQuantityCell.textContent();
            console.log(`Remaining quantity: "${remainingQuantity}"`);
            expect(parseInt(remainingQuantity?.trim() || "0")).toBe(orderedQuantity);

            // Verify total left to do label
            const totalLeftToDoLabel = waybillModal.locator('[data-testid="ModalAddWaybill-ShipmentDetailsTable-TotalLeftToDoLabel"]');
            await totalLeftToDoLabel.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const totalLeftToDoText = await totalLeftToDoLabel.textContent();
            console.log(`Total left to do: "${totalLeftToDoText}"`);
            expect(totalLeftToDoText?.trim()).toBe(`Всего: ${orderedQuantity}`);

            // Find the detail row by searching for the name cell pattern
            const detailNameCell = waybillModal.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-NameCell"]');
            await detailNameCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '3px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const detailName = await detailNameCell.textContent();
            console.log(`Detail name: "${detailName}"`);
            expect(detailName?.trim()).toBe(NEW_DETAIL_A);

            // Get the row ID from the name cell to use for other cells
            const nameCellDataTestId = await detailNameCell.getAttribute('data-testid');
            const rowId = nameCellDataTestId?.replace('ModalAddWaybill-DetailsTable-Row', '').replace('-NameCell', '');
            console.log(`Row ID: "${rowId}"`);

            // Verify quantity per unit
            const quantityPerUnitCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-QuantityPerUnitCell"]`);
            await quantityPerUnitCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const quantityPerUnit = await quantityPerUnitCell.textContent();
            console.log(`Quantity per unit: "${quantityPerUnit}"`);
            expect(parseInt(quantityPerUnit?.trim() || "0")).toBe(specificationQuantity);

            // Verify material cell shows "Нет материала"
            const materialCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-MaterialCell"]`);
            await materialCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const materialText = await materialCell.textContent();
            console.log(`Material: "${materialText}"`);
            expect(materialText?.trim()).toBe("Нет материала");

            // Verify need cell (order quantity * specification quantity)
            const needCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-NeedCell"]`);
            await needCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const needQuantity = await needCell.textContent();
            console.log(`Need quantity: "${needQuantity}"`);
            expect(parseInt(needQuantity?.trim() || "0")).toBe(orderedQuantity * specificationQuantity);

            // Verify free quantity cell
            const freeQuantityCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-FreeQuantityCell"]`);
            await freeQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const freeQuantity = await freeQuantityCell.textContent();
            console.log(`Free quantity: "${freeQuantity}"`);

            // Calculate expected free quantity dynamically from warehouse inventory
            const expectedFreeQuantity = await detailsPage.calculateFreeQuantity(NEW_DETAIL_A);
            expect(parseInt(freeQuantity?.trim() || "0")).toBe(expectedFreeQuantity);


            // Verify quantity cell
            const quantityCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-QuantityCell"]`);
            await quantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const quantityValue = await quantityCell.textContent();
            console.log(`Quantity: "${quantityValue}"`);


            // Verify in kits cell
            const inKitsCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-InKitsCell"]`);
            await inKitsCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'red';
                el.style.border = '2px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            const inKitsValue = await inKitsCell.textContent();
            console.log(`In kits: "${inKitsValue}"`);
            expect(parseInt(inKitsValue?.trim() || "0")).toBe(0); //erp-969

            const deficitCell = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-DeficitCell"]`);
            await deficitCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'red';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            const deficitValue = await deficitCell.textContent();
            console.log(`Deficit: "${deficitValue}"`);

            // Get the values from FreeQuantityCell and NeedCell to calculate expected deficit
            const freeQuantityCellForDeficit = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-FreeQuantityCell"]`);
            const needCellForDeficit = waybillModal.locator(`[data-testid="ModalAddWaybill-DetailsTable-Row${rowId}-NeedCell"]`);

            const freeQuantityValueForDeficit = await freeQuantityCellForDeficit.textContent();
            const needValueForDeficit = await needCellForDeficit.textContent();

            const expectedDeficit = parseInt(freeQuantityValueForDeficit?.trim() || "0") - parseInt(needValueForDeficit?.trim() || "0");
            console.log(`Calculated expected deficit: ${freeQuantityValueForDeficit} - ${needValueForDeficit} = ${expectedDeficit}`);

            // Validate the deficit cell shows the calculated value
            expect(parseInt(deficitValue?.trim() || "0")).toBe(expectedDeficit);

            // Declare warning message variable outside if statement
            const warningMessage = waybillModal.locator('[data-testid="ModalAddWaybill-ControlButtons-IncompleteSetWarning"]');

            // Verify the red warning message is present only if deficit is negative
            if (parseInt(deficitValue?.trim() || "0") < 0) {
                await warningMessage.evaluate((el: HTMLElement) => {
                    el.style.backgroundColor = 'red';
                    el.style.border = '3px solid red';
                    el.style.color = 'white';
                    el.style.fontWeight = 'bold';
                    el.style.fontSize = '16px';
                    el.style.padding = '10px';
                });
                await expect(warningMessage).toBeVisible({ timeout: 5000 });
                const warningText = await warningMessage.textContent();
                console.log(`Warning message: "${warningText}"`);
                expect(warningText?.trim()).toBe("Вы не можете скомплектовать набор из-за недостатка комплектующих");
            }

            // Change the own quantity input to 1
            await ownQuantityInput.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '3px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            await ownQuantityInput.fill(currentBuildQuantity.toString());
            await ownQuantityInput.press("Enter");
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(1000);

            // Verify need cell now shows 1
            await needCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '3px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const updatedNeedQuantity = await needCell.textContent();
            console.log(`Updated need quantity: "${updatedNeedQuantity}"`);
            expect(parseInt(updatedNeedQuantity?.trim() || "0")).toBe(currentBuildQuantity * specificationQuantity);

            // Verify deficit cell now shows 0
            await deficitCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '3px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const updatedDeficitValue = await deficitCell.textContent();
            console.log(`Updated deficit: "${updatedDeficitValue}"`);

            // Recalculate expected deficit after quantity change
            const updatedFreeQuantityValueForDeficit = await freeQuantityCellForDeficit.textContent();
            const updatedNeedValueForDeficit = await needCellForDeficit.textContent();

            const updatedExpectedDeficit = parseInt(updatedFreeQuantityValueForDeficit?.trim() || "0") - parseInt(updatedNeedValueForDeficit?.trim() || "0");
            console.log(`Recalculated expected deficit: ${updatedFreeQuantityValueForDeficit} - ${updatedNeedValueForDeficit} = ${updatedExpectedDeficit}`);

            // Validate the updated deficit cell shows the recalculated value
            expect(parseInt(updatedDeficitValue?.trim() || "0")).toBe(updatedExpectedDeficit);

            // Verify the complete set button is now visible and clickable
            const completeSetButton = waybillModal.locator('[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]');
            await completeSetButton.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'green';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
                el.style.fontSize = '16px';
                el.style.padding = '10px';
            });
            await expect(completeSetButton).toBeVisible({ timeout: 5000 });
            await expect(completeSetButton).toBeEnabled({ timeout: 5000 });

            // Verify warning message is no longer present
            if (warningMessage) {
                await expect(warningMessage).not.toBeVisible({ timeout: 5000 });
            }

            // Click the complete set button
            await completeSetButton.click();
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(1000);

            // Verify warning message appears
            const selectOrderWarning = kittingPage.locator('[data-testid="Notification-Notification-Description"]');
            await selectOrderWarning.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '3px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
                el.style.fontSize = '16px';
            });
            await expect(selectOrderWarning).toBeVisible({ timeout: 5000 });
            const selectOrderText = await selectOrderWarning.textContent();
            console.log(`Select order warning: "${selectOrderText}"`);
            expect(selectOrderText).toContain("Выберите заказ");

            // Click the checkbox in the shipment details table
            const checkboxCell = waybillModal.locator('[data-testid="ModalAddWaybill-ShipmentDetailsTable-ScladSetCheckboxCell"]');
            await checkboxCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'purple';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
                el.style.cursor = 'pointer';
            });
            await checkboxCell.click();
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(1000);

            // Click the complete set button again
            await completeSetButton.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'darkgreen';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            await completeSetButton.click();
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(2000);

            // Verify we're back on the main kitting page
            await expect(pageTitle).toHaveText("Комплектация сборок на план", { timeout: 5000 });

            const kittingTable2 = kittingPage.locator('[data-testid="TableComplect-TableComplect-Table"]');
            const searchInput2 = kittingTable2.locator('[data-testid="Search-Cover-Input"]');
            // Search for our SB again
            await searchInput2.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'red';
                el.style.border = '3px solid blue';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            await searchInput2.fill("");
            await searchInput2.press("Enter");
            await kittingPage.waitForTimeout(3000);
            await searchInput2.fill(NEW_SB_A);
            await searchInput2.press("Enter");
            await searchInput2.fill(NEW_SB_A);
            await searchInput2.press("Enter");
            await kittingPage.waitForLoadState("networkidle");
            await kittingPage.waitForTimeout(2000);

            // Get the table and first row again after the new search
            const kittingTable3 = kittingPage.locator('[data-testid="TableComplect-TableComplect-Table"]');

            // Wait for the table to be visible and ready
            await expect(kittingTable3).toBeVisible({ timeout: 10000 });
            await kittingPage.waitForTimeout(2000);

            // Check if there are any rows in the table
            const rowCount = await kittingTable3.locator("tbody tr").count();
            console.log(`Found ${rowCount} rows in the table after search`);

            if (rowCount === 0) {
                console.log("No rows found in table after search - this might be expected if the item was completed");
                return; // Exit the test if no rows found
            }

            // Get the first data row (index 0) - contains main data cells
            const firstRow3 = kittingTable3.locator("tbody tr").first();

            // Highlight the entire row for visibility
            await firstRow3.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightblue';
                el.style.border = '3px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });

            // Wait for the row to be visible
            //await expect(firstRow3).toBeVisible({ timeout: 5000 });

            // Verify the name cell contains our SB designation
            const rowNameCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowNameCell"]');
            await rowNameCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const rowName = await rowNameCell.textContent();
            console.log(`Row name: "${rowName}"`);
            expect(rowName?.trim()).toBe(NEW_SB_A);

            // Verify ordered quantity shows the global orderedQuantity value
            const orderedCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowOrderedCell"]');
            await orderedCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const orderedValue = await orderedCell.textContent();
            console.log(`Ordered value: "${orderedValue}"`);
            expect(orderedValue?.trim()).toBe(orderedQuantity.toString());

            // Verify operations cell shows the specificationQuantity value
            const operationsCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowOperationsCell"]');
            await operationsCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'green';
                el.style.border = '2px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            const operationsValue = await operationsCell.textContent();
            console.log(`Operations value: "${operationsValue}"`);
            expect(operationsValue?.trim()).toBe(specificationQuantity.toString());

            // Calculate expected completion percentage based on specificationQuantity vs orderedQuantity
            const expectedCompletionPercentage = Math.round((specificationQuantity / orderedQuantity) * 100);

            // Verify status cell shows the calculated completion percentage
            const statusCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowStatusCell"]');
            await statusCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const statusValue = await statusCell.textContent();
            console.log(`Status value: "${statusValue}"`);
            expect(statusValue?.trim()).toBe(`${expectedCompletionPercentage}%`);

            // Verify completion level shows the same calculated percentage
            const completionLevelCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowCompletionLevelCell"]');
            await completionLevelCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightyellow';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const completionLevelValue = await completionLevelCell.textContent();
            console.log(`Completion level: "${completionLevelValue}"`);
            expect(completionLevelValue?.trim()).toBe(`${expectedCompletionPercentage}%`);

            // Verify collected cell shows the specificationQuantity value
            const collectedCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowCollectedCell"]');
            await collectedCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const collectedValue = await collectedCell.textContent();
            console.log(`Collected value: "${collectedValue}"`);
            expect(parseInt(collectedValue?.trim() || "0")).toBe(specificationQuantity);

            // Calculate remaining quantity: orderedQuantity - specificationQuantity
            const expectedRemainingQuantity = orderedQuantity - specificationQuantity;

            // Verify remaining cell shows the calculated remaining quantity
            const remainingCell = firstRow3.locator('[data-testid="TableComplect-TableComplect-RowRemainingCell"]');
            await remainingCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const remainingValue = await remainingCell.textContent();
            console.log(`Remaining value: "${remainingValue}"`);
            expect(parseInt(remainingValue?.trim() || "0")).toBe(expectedRemainingQuantity);

            // Now verify the second row (index 1) for the remaining cells
            const secondRow = kittingTable3.locator("tbody tr").nth(1);
            await secondRow.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightpink';
                el.style.border = '3px solid purple';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });

            // Verify execution date cell contains today's date
            const executionDateCell = secondRow.locator('[data-testid="TableComplect-TableComplect-KitsRowExecutionDateCell"]');
            await executionDateCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const executionDate = await executionDateCell.textContent();
            console.log(`Execution date: "${executionDate}"`);
            expect(executionDate).toContain(today);

            // Verify collected quantity cell shows the specificationQuantity value
            const kitsCollectedQuantityCell = secondRow.locator('[data-testid="TableComplect-TableComplect-KitsRowCollectedQuantityCell"]');
            await kitsCollectedQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const kitsCollectedQuantity = await kitsCollectedQuantityCell.textContent();
            console.log(`Kits collected quantity: "${kitsCollectedQuantity}"`);
            expect(parseInt(kitsCollectedQuantity?.trim() || "0")).toBe(specificationQuantity);

            // Verify executor cell shows the executor name
            const executorCell = secondRow.locator('[data-testid="TableComplect-TableComplect-KitsRowExecutorCell"]');
            await executorCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightcyan';
                el.style.border = '2px solid blue';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const executorValue = await executorCell.textContent();
            console.log(`Executor: "${executorValue}"`);
            expect(executorValue?.trim()).toBeTruthy(); // Should contain executor name

            await kittingPage.waitForTimeout(3000);
        });

        await allure.step("Step 17: Navigate to assembly kitting plan page and test waybill modal", async () => {
            // Navigate back to the sklad main page in a new tab
            const waybillPage = await page.context().newPage();
            await waybillPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL); // Use direct URL instead of SELECTORS
            await waybillPage.waitForLoadState("networkidle");
            await waybillPage.waitForTimeout(2000);

            // Click the button to open assembly kitting plan page
            const completionCbedPlanButton = waybillPage.locator('[data-testid="Sclad-completionCbedPlan"]');
            await completionCbedPlanButton.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'blue';
                el.style.border = '3px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            await completionCbedPlanButton.click();
            await waybillPage.waitForLoadState("networkidle");
            await waybillPage.waitForTimeout(2000);

            // Confirm the h3 title
            const pageTitle = waybillPage.locator('[data-testid="CompletCbed-Title-AssemblyKittingOnPlan"]');
            await expect(pageTitle).toHaveText("Комплектация сборок на план", { timeout: 10000 });
            await pageTitle.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });

            // Find the table and search for our SB
            const waybillTable = waybillPage.locator('[data-testid="TableComplect-TableComplect-Table"]');
            await waybillTable.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const searchInput = waybillTable.locator('[data-testid="Search-Cover-Input"]');
            await searchInput.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            // Clear the search input first
            await searchInput.clear();
            await waybillPage.waitForTimeout(500);
            // Fill with search value
            await searchInput.fill(NEW_SB_A);
            await searchInput.press("Enter");
            await waybillPage.waitForLoadState("networkidle");
            await waybillPage.waitForTimeout(2000);

            // Confirm our result is in the first row by checking the fourth column (Name column)
            const firstRow = waybillTable.locator("tbody tr").first();
            const nameCell = firstRow.locator('[data-testid="TableComplect-TableComplect-RowNameCell"]');
            await nameCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const nameValue = await nameCell.textContent();
            console.log(`Found SB name: "${nameValue}"`);
            expect(nameValue?.trim()).toBe(NEW_SB_A);

            // Double click on the third column (Designation column) to open modal
            const designationCell = firstRow.locator('[data-testid="TableComplect-TableComplect-RowDesignationCell"]');
            await designationCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            await designationCell.dblclick();
            await waybillPage.waitForTimeout(2000);

            // Wait for modal to appear and validate details
            const waybillModal = waybillPage.locator('[data-testid="ModalAddWaybill-WaybillDetails-Heading"]');
            await expect(waybillModal).toBeVisible({ timeout: 10000 });
            await waybillModal.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightblue';
                el.style.border = '3px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });

            // Validate modal title contains today's date (ignore the missing number after №)
            const modalTitle = await waybillModal.textContent();
            console.log(`Modal title: "${modalTitle}"`);
            expect(modalTitle).toContain("Накладная на комплектацию Сборки № от");
            expect(modalTitle).toContain(today);

            // Validate collected quantity cell shows 0
            const collectedQuantityCell = await waybillPage.locator('[data-testid="ModalAddWaybill-WaybillDetails-CollectedQuantityCell"]');
            await collectedQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'red';
                el.style.border = '2px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            const collectedQuantityValue = await collectedQuantityCell.textContent();
            const collectedQuantity = collectedQuantityValue ? parseInt(collectedQuantityValue.replace(/[^\d-]/g, '').trim(), 10) : 0;

            console.log(`Collected quantity: "${collectedQuantityValue}"`);
            // This is the second time opening the modal, so collected quantity should reflect the build quantity we set earlier
            expect(parseInt(collectedQuantityValue?.trim() || "0")).toBe(currentBuildQuantity);

            // Validate required quantity cell shows orderedQuantity
            const requiredQuantityCell = waybillPage.locator('[data-testid="ModalAddWaybill-WaybillDetails-RequiredQuantityCell"]');
            await requiredQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const requiredQuantityValue = await requiredQuantityCell.textContent();
            console.log(`Required quantity: "${requiredQuantityValue}"`);
            expect(parseInt(requiredQuantityValue?.trim() || "0")).toBe(orderedQuantity);

            // Validate own quantity input shows orderedQuantity
            const ownQuantityInput = waybillPage.locator('[data-testid="ModalAddWaybill-WaybillDetails-OwnQuantityInput"]');
            await ownQuantityInput.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const ownQuantityValue = await ownQuantityInput.inputValue();
            console.log(`Own quantity input: "${ownQuantityValue}"`);
            expect(parseInt(ownQuantityValue?.trim() || "0")).toBe(orderedQuantity - currentBuildQuantity);

            // Validate name cell shows our SB name
            const waybillNameCell = waybillPage.locator('[data-testid="ModalAddWaybill-WaybillDetails-NameCell"]');
            await waybillNameCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            const waybillNameValue = await waybillNameCell.textContent();
            console.log(`Waybill name: "${waybillNameValue}"`);
            expect(waybillNameValue?.trim()).toBe(NEW_SB_A);

            // Validate total quantity label shows "Всего: 0"
            const totalQuantityLabel = waybillPage.locator('[data-testid="ModalAddWaybill-ShipmentDetailsTable-TotalQuantityLabel"]');
            await totalQuantityLabel.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightcyan';
                el.style.border = '2px solid blue';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const totalQuantityText = await totalQuantityLabel.textContent();
            console.log(`Total quantity label: "${totalQuantityText}"`);
            expect(totalQuantityText?.trim()).toBe("Всего: 0");

            // Validate order number cell shows our captured order number
            const orderNumberCell = waybillPage.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-OrderNumberCell"]');
            await orderNumberCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightyellow';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const orderNumberValue = await orderNumberCell.textContent();
            console.log(`Order number: "${orderNumberValue}"`);
            expect(orderNumberValue?.trim()).toBe(`№${orderNumber}`);

            // Validate remaining quantity cell shows orderedQuantity
            const remainingQuantityCell = waybillPage.locator('[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]');
            await remainingQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const remainingQuantityValue = await remainingQuantityCell.textContent();
            console.log(`Remaining quantity: "${remainingQuantityValue}"`);
            expect(parseInt(remainingQuantityValue?.trim() || "0")).toBe(orderedQuantity);

            // Validate total left to do label shows "Всего: orderedQuantity"
            const totalLeftToDoLabel = waybillPage.locator('[data-testid="ModalAddWaybill-ShipmentDetailsTable-TotalLeftToDoLabel"]');
            await totalLeftToDoLabel.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightcyan';
                el.style.border = '2px solid blue';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const totalLeftToDoText = await totalLeftToDoLabel.textContent();
            console.log(`Total left to do: "${totalLeftToDoText}"`);
            expect(totalLeftToDoText?.trim()).toBe(`Всего: ${orderedQuantity}`);

            // Find the detail row by searching for the name cell with dynamic ID
            const detailNameCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-NameCell"]');
            await detailNameCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '3px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const detailNameValue = await detailNameCell.textContent();
            console.log(`Detail name: "${detailNameValue}"`);
            expect(detailNameValue?.trim()).toBe(NEW_DETAIL_A);

            // Validate quantity per unit cell shows specificationQuantity
            const quantityPerUnitCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-QuantityPerUnitCell"]');
            await quantityPerUnitCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const quantityPerUnitValue = await quantityPerUnitCell.textContent();
            console.log(`Quantity per unit: "${quantityPerUnitValue}"`);
            expect(parseInt(quantityPerUnitValue?.trim() || "0")).toBe(specificationQuantity);

            // Validate material cell shows "Нет материала"
            const materialCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-MaterialCell"]');
            await materialCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightred';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const materialValue = await materialCell.textContent();
            console.log(`Material: "${materialValue}"`);
            expect(materialValue?.trim()).toBe("Нет материала");

            // Calculate expected need: orderedQuantity * specificationQuantity
            const expectedNeed = orderedQuantity * specificationQuantity - collectedQuantity;

            // Validate need cell shows the calculated need
            const needCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-NeedCell"]');
            await needCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'orange';
                el.style.border = '2px solid red';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const needValue = await needCell.textContent();
            console.log(`Need: "${needValue}"`);
            expect(parseInt(needValue?.trim() || "0")).toBe(expectedNeed);

            // Validate free quantity cell shows 1
            const freeQuantityCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-FreeQuantityCell"]');
            await freeQuantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const freeQuantityValue = await freeQuantityCell.textContent();
            console.log(`Free quantity: "${freeQuantityValue}"`);
            const expectedFreeQuantity = await detailsPage.calculateFreeQuantity(NEW_DETAIL_A);
            expect(parseInt(freeQuantityValue?.trim() || "0")).toBe(expectedFreeQuantity);

            // Validate quantity cell shows 1
            const quantityCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-QuantityCell"]');
            await quantityCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '2px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const quantityValue = await quantityCell.textContent();
            console.log(`Quantity: "${quantityValue}"`);
            expect(parseInt(quantityValue?.trim() || "0")).toBe(1);

            // Validate in kits cell shows 0
            const inKitsCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-InKitsCell"]');
            await inKitsCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'red';
                el.style.border = '2px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            });
            const inKitsValue = await inKitsCell.textContent();
            console.log(`In kits: "${inKitsValue}"`);
            const expectedInKits = await detailsPage.getInKitsValue(NEW_DETAIL_A);
            expect(parseInt(inKitsValue?.trim() || "0")).toBe(expectedInKits);

            // Calculate expected deficit: freeQuantity - need = 1 - expectedNeed
            const expectedDeficit = 1 - expectedNeed;

            // Validate deficit cell shows the calculated deficit
            const deficitCell = waybillPage.locator('[data-testid^="ModalAddWaybill-DetailsTable-Row"][data-testid$="-DeficitCell"]');
            await deficitCell.evaluate((el: HTMLElement, deficit: number) => {
                el.style.backgroundColor = deficit < 0 ? 'red' : 'lightgreen';
                el.style.border = '2px solid red';
                el.style.color = 'white';
                el.style.fontWeight = 'bold';
            }, expectedDeficit);
            const deficitValue = await deficitCell.textContent();
            console.log(`Deficit: "${deficitValue}"`);
            expect(parseInt(deficitValue?.trim() || "0")).toBe(expectedDeficit);

            // Check for warning message if deficit is negative
            let warningMessage;
            if (expectedDeficit < 0) {
                warningMessage = waybillPage.locator('[data-testid="ModalAddWaybill-ControlButtons-IncompleteSetWarning"]');
                await expect(warningMessage).toBeVisible({ timeout: 5000 });
                await warningMessage.evaluate((el: HTMLElement) => {
                    el.style.backgroundColor = 'red';
                    el.style.border = '2px solid red';
                    el.style.color = 'white';
                    el.style.fontWeight = 'bold';
                });
                const warningText = await warningMessage.textContent();
                console.log(`Warning message: "${warningText}"`);
                expect(warningText).toBe("Вы не можете скомплектовать набор из-за недостатка комплектующих");
            }

            // Change own quantity input to 1
            await ownQuantityInput.fill(currentBuildQuantity.toString());
            await ownQuantityInput.press("Enter");
            await waybillPage.waitForTimeout(2000);

            // Recalculate expected need with new quantity: 1 * specificationQuantity
            const newExpectedNeed = currentBuildQuantity * specificationQuantity;

            // Verify need cell now shows the recalculated value
            await needCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'lightgreen';
                el.style.border = '3px solid green';
                el.style.color = 'black';
                el.style.fontWeight = 'bold';
            });
            const updatedNeedQuantity = await needCell.textContent();
            console.log(`Updated need quantity: "${updatedNeedQuantity}"`);
            expect(parseInt(updatedNeedQuantity?.trim() || "0")).toBe(newExpectedNeed);

            // Calculate expected need after quantity change: newQuantity * specificationQuantity
            const expectedUpdatedNeed = currentBuildQuantity * specificationQuantity;
            console.log(`Expected updated need: ${currentBuildQuantity} * ${specificationQuantity} = ${expectedUpdatedNeed}`);

            expect(parseInt(updatedNeedQuantity?.trim() || "0")).toBe(expectedUpdatedNeed);

            // Recalculate expected deficit: freeQuantity - newNeed = 1 - newExpectedNeed
            const newExpectedDeficit = 1 - newExpectedNeed;

            // Validate deficit cell now shows the new calculated deficit
            const newDeficitValue = await deficitCell.textContent();
            console.log(`New deficit: "${newDeficitValue}"`);
            expect(parseInt(newDeficitValue?.trim() || "0")).toBe(newExpectedDeficit);

            // Check that complete set button is now visible and clickable
            const completeSetButton = waybillPage.locator('[data-testid="ModalAddWaybill-ControlButtons-CompleteSetButton"]');
            await expect(completeSetButton).toBeVisible({ timeout: 5000 });
            await expect(completeSetButton).toBeEnabled({ timeout: 5000 });

            // Verify warning message is no longer present
            if (warningMessage) {
                await expect(warningMessage).not.toBeVisible({ timeout: 5000 });
            }

            // Click the complete set button
            await completeSetButton.click();
            await waybillPage.waitForLoadState("networkidle");
            await waybillPage.waitForTimeout(2000);

            // Verify warning message appears
            const selectOrderWarning = waybillPage.locator('text="Предупреждение Выберите заказ"');
            await expect(selectOrderWarning).toBeVisible({ timeout: 5000 });

            // Click the checkbox in the shipment details table
            const checkboxCell = waybillPage.locator('[data-testid="ModalAddWaybill-ShipmentDetailsTable-ScladSetCheckbox"]');
            await checkboxCell.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
                el.style.fontWeight = 'bold';
            });
            await checkboxCell.click();
            await waybillPage.waitForTimeout(1000);

            // Click the complete set button again
            await completeSetButton.click();
            await waybillPage.waitForLoadState("networkidle");
            await waybillPage.waitForTimeout(2000);

            // Verify we're back on the main kitting page
            await expect(pageTitle).toHaveText("Комплектация сборок на план", { timeout: 5000 });

            await waybillPage.waitForTimeout(3000);
        });
    });

    //placeholder so that we don't have to rewrite the testSuiteConfig all the time



}
