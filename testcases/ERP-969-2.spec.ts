import { test, expect, Locator, Page } from "@playwright/test";
import { CreatePartsDatabasePage } from "../pages/PartsDatabasePage";
import { CreatePartsPage } from "../pages/CreatePartsPage";
import { CreateStockPage } from "../pages/StockPage";
import { CreateCompletingAssembliesToPlanPage } from "../pages/CompletingAssembliesToPlanPage";
import { CreateRevisionPage } from "../pages/RevisionPage";
import { SELECTORS } from "../config";
import { allure } from "allure-playwright";

// Test Data
const DETAIL_1_NAME = "ERP9692_DETAIL_001";
const DETAIL_2_NAME = "ERP9692_DETAIL_002";
const ASSEMBLY_NAME = "ERP9692_ASSEMBLY_001";

// Constants for data-testid selectors
const PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD = "BasePaginationTable-Thead-SearchInput-Dropdown-Input";
const PARTS_PAGE_DETAL_TABLE = "BasePaginationTable-Table-detal";
const MAIN_PAGE_СБ_TABLE = "BasePaginationTable-Table-cbed";
const MODAL_CONFIRM_DIALOG = "ModalConfirm";
const MODAL_CONFIRM_DIALOG_YES_BUTTON = "ModalConfirm-Content-Buttons-Button-2";
const PARTS_PAGE_ARCHIVE_BUTTON = "BaseDetals-Button-Archive";
const BASE_DETALS_BUTTON_CREATE = "BaseDetals-Button-Create";
const BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS = "BaseDetals-CreatLink-Titlebase-of-assembly-units";
const CREATOR_INFORMATION_INPUT = "Creator-Information-Input-Input";
const SPECIFICATION_BUTTONS_ADDING_SPECIFICATION = "Specification-Buttons-addingSpecification";
const SPECIFICATION_DIALOG_CARD_BASE_DETAIL_1 = "Specification-Dialog-CardbaseDetail1";
const SPECIFICATION_MODAL_BASE_DETAL_SELECT_BUTTON = "Specification-ModalBaseDetal-Select-Button";
const SPECIFICATION_MODAL_BASE_DETAL_ADD_BUTTON = "Specification-ModalBaseDetal-Add-Button";
const EDITOR_TABLE_SPECIFICATION_CBED = "Editor-TableSpecification-Cbed";
const CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE = "Creator-ButtonSaveAndCancel-ButtonsCenter-Save";
const CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL = "Creator-ButtonSaveAndCancel-ButtonsCenter-Cancel";
const ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE = "AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save";
const EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL = "EditDetal-ButtonSaveAndCancel-ButtonsCenter-Cancel";
const MAIN_PAGE_EDIT_BUTTON = "BaseDetals-Button-Edit";

// Revision page constants
const SCLAD_REVISION_REVISION = "Sclad-revision-revision";
const MINI_NAVIGATION_POS_DATA1 = "MiniNavigation-POS-Data1";
const REVISION_SWITCH_ITEM2 = "Revision-Switch-Item2";
const REVISION_TABLE_REVISION_PAGINATION_CBEDS = "Revision-TableRevisionPagination-Cbeds";
const REVISION_TABLE_REVISION_PAGINATION_DETALS = "Revision-TableRevisionPagination-Detals";
const TABLE_REVISION_PAGINATION_TABLE = "Table";
const TABLE_REVISION_PAGINATION_SEARCH_INPUT = "TableRevisionPagination-SearchInput-Dropdown-Input";
const TABLE_REVISION_PAGINATION_EDIT_PEN = "TableRevisionPagination-EditPen";
const INPUT_NUMBER_INPUT = "InputNumber-Input";
const TABLE_REVISION_PAGINATION_CONFIRM_DIALOG = "TableRevisionPagination-ConfirmDialog";
const TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE = "TableRevisionPagination-ConfirmDialog-Approve";
const MODAL_PROMPT_MINI_BUTTON_CONFIRM = "ModalPrompt-Mini-Button-Confirm";

export const runERP_969_2 = () => {
    test("ERP-969-2 - Create 2 details and СБ assembly containing both details", async ({ page }) => {
        test.setTimeout(600000);
        const detailsPage = new CreatePartsDatabasePage(page);

        // ─────────────────────────────────────────────────────────────────────────────
        // PART A: Clean up any existing test data
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step("Step 1: Navigate to Parts Database page and clean up existing test data", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Clean up existing detail 1
            await detailsPage.cleanupTestDetail(page, DETAIL_1_NAME, PARTS_PAGE_DETAL_TABLE);
            await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

            // Clean up existing detail 2
            await detailsPage.cleanupTestDetail(page, DETAIL_2_NAME, PARTS_PAGE_DETAL_TABLE);
            await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

            // Clean up existing assembly
            await detailsPage.cleanupTestDetail(page, ASSEMBLY_NAME, MAIN_PAGE_СБ_TABLE);
            await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART B: Create first detail
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 2: Create first detail "${DETAIL_1_NAME}"`, async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            // Fill detail name
            await detailsPage.fillDetailName(DETAIL_1_NAME, 'AddDetal-Information-Input-Input');

            // Save the detail
            const saveButton = page.locator(`[data-testid="${ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`);
            await detailsPage.highlightElement(saveButton);
            await detailsPage.findAndClickElement(page, ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Check for success notification message
            await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");

            // Verify we're now in edit mode (page transitioned from add to edit)
            const editPageTitle = page.locator(`[data-testid="EditDetal-Title"]`);
            await expect(editPageTitle).toBeVisible();
        });

        await allure.step(`Step 3: Verify first detail "${DETAIL_1_NAME}" was saved`, async () => {
            // Click cancel to return to listing
            const cancelButton = page.locator(`[data-testid="${EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL}"]`);
            await detailsPage.highlightElement(cancelButton);
            await detailsPage.findAndClickElement(page, EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Search for the detail in the table
            const detalTable = page.locator(`[data-testid="${PARTS_PAGE_DETAL_TABLE}"]`);
            const detailSearchInput = detalTable.locator(`[data-testid="${PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD}"]`);
            await expect(detailSearchInput).toBeVisible();
            await detailSearchInput.fill(DETAIL_1_NAME);
            await detailSearchInput.press("Enter");
            await page.waitForTimeout(1000);

            const resultRows = detalTable.locator("tbody tr");
            const count = await resultRows.count();
            expect(count).toBe(1);

            // Verify the found row contains the correct detail name
            const foundRow = resultRows.first();
            const rowText = await foundRow.textContent();
            expect(rowText).toContain(DETAIL_1_NAME);

            // Highlight the found row
            await detailsPage.highlightElement(foundRow);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART C: Create second detail
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 4: Create second detail "${DETAIL_2_NAME}"`, async () => {
            await detailsPage.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL);
            await page.waitForLoadState("networkidle");

            // Fill detail name
            await detailsPage.fillDetailName(DETAIL_2_NAME, 'AddDetal-Information-Input-Input');

            // Save the detail
            const saveButton = page.locator(`[data-testid="${ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`);
            await detailsPage.highlightElement(saveButton);
            await detailsPage.findAndClickElement(page, ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Check for success notification message
            await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");

            // Verify we're now in edit mode (page transitioned from add to edit)
            const editPageTitle = page.locator(`[data-testid="EditDetal-Title"]`);
            await expect(editPageTitle).toBeVisible();
        });

        await allure.step(`Step 5: Verify second detail "${DETAIL_2_NAME}" was saved`, async () => {
            // Click cancel to return to listing
            const cancelButton = page.locator(`[data-testid="${EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL}"]`);
            await detailsPage.highlightElement(cancelButton);
            await detailsPage.findAndClickElement(page, EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Search for the detail in the table
            const detalTable = page.locator(`[data-testid="${PARTS_PAGE_DETAL_TABLE}"]`);
            const detailSearchInput = detalTable.locator(`[data-testid="${PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD}"]`);
            await expect(detailSearchInput).toBeVisible();
            await detailSearchInput.fill(DETAIL_2_NAME);
            await detailSearchInput.press("Enter");
            await page.waitForTimeout(1000);

            const resultRows = detalTable.locator("tbody tr");
            const count = await resultRows.count();
            expect(count).toBe(1);

            // Verify the found row contains the correct detail name
            const foundRow = resultRows.first();
            const rowText = await foundRow.textContent();
            expect(rowText).toContain(DETAIL_2_NAME);

            // Highlight the found row
            await detailsPage.highlightElement(foundRow);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART D: Create СБ assembly containing both details
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 6: Create assembly "${ASSEMBLY_NAME}" with both details`, async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Open the create dialog
            const createButton = page.locator(`[data-testid="${BASE_DETALS_BUTTON_CREATE}"]`);
            await detailsPage.highlightElement(createButton);
            await detailsPage.findAndClickElement(page, BASE_DETALS_BUTTON_CREATE, 500);

            // Select СБ (assembly) type
            const assemblyTypeButton = page.locator(`[data-testid="${BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS}"]`);
            await detailsPage.highlightElement(assemblyTypeButton);
            await detailsPage.findAndClickElement(page, BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS, 500);

            // Fill in the assembly name
            const assemblyInput = page.locator(`[data-testid="${CREATOR_INFORMATION_INPUT}"]`);
            await expect(assemblyInput).toBeVisible({ timeout: 5000 });
            await assemblyInput.fill(ASSEMBLY_NAME);

            // Add first detail to assembly
            await detailsPage.addDetailToAssemblySpecification(page, DETAIL_1_NAME);
            await detailsPage.verifyDetailSuccessMessage("Деталь добавлена в спецификацию");

            // Add second detail to assembly
            await detailsPage.addDetailToAssemblySpecification(page, DETAIL_2_NAME);
            await detailsPage.verifyDetailSuccessMessage("Деталь добавлена в спецификацию");

            // Verify both details are now in the specification table
            const specsTable = page.locator(`[data-testid="${EDITOR_TABLE_SPECIFICATION_CBED}"]`);
            await expect(specsTable).toBeVisible({ timeout: 5000 });

            const specRows = specsTable.locator("tbody tr");
            const rowTexts = await specRows.allTextContents();

            // Check that both details are present
            const detail1Found = rowTexts.some(text => text.includes(DETAIL_1_NAME));
            const detail2Found = rowTexts.some(text => text.includes(DETAIL_2_NAME));

            expect(detail1Found).toBe(true);
            expect(detail2Found).toBe(true);

            // Highlight the specification rows that contain our details
            for (let i = 0; i < rowTexts.length; i++) {
                const rowText = rowTexts[i];
                if (rowText.includes(DETAIL_1_NAME) || rowText.includes(DETAIL_2_NAME)) {
                    const detailRow = specRows.nth(i);
                    await detailsPage.highlightElement(detailRow);
                }
            }

            // Save the assembly with the added details
            const saveButton = page.locator(`[data-testid="${CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`);
            await detailsPage.highlightElement(saveButton);
            await detailsPage.findAndClickElement(page, CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Check for success notification message
            await detailsPage.verifyDetailSuccessMessage("Сборочная единица успешно создана");

            // Verify the assembly was created successfully by checking if we're still on the creator page
            // or if we've been redirected to the listing page
            const creatorPage = page.locator(`[data-testid="Creator-Title"]`);
            const listingPage = page.locator(`[data-testid="${PARTS_PAGE_DETAL_TABLE}"]`);

            // Check if we're still on creator page or have been redirected to listing
            const isCreatorPage = await creatorPage.isVisible().catch(() => false);
            const isListingPage = await listingPage.isVisible().catch(() => false);

            expect(isCreatorPage || isListingPage).toBe(true);

            console.log(`✅ Assembly "${ASSEMBLY_NAME}" created successfully with both details`);
        });

        await allure.step(`Step 7: Verify assembly "${ASSEMBLY_NAME}" was saved`, async () => {
            // Check if we're already on the listing page, if not navigate there
            const listingPage = page.locator(`[data-testid="${PARTS_PAGE_DETAL_TABLE}"]`);
            const isOnListingPage = await listingPage.isVisible().catch(() => false);

            if (!isOnListingPage) {
                // We're still on the creator page, click cancel to return to listing
                const cancelButton = page.locator(`[data-testid="${CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL}"]`);
                await detailsPage.highlightElement(cancelButton);
                await detailsPage.findAndClickElement(page, CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL, 500);
                await page.waitForTimeout(1000);
                await page.waitForLoadState("networkidle");
            }

            // Search for the assembly in the СБ table (not the details table)
            const cbedTable = page.locator(`[data-testid="${MAIN_PAGE_СБ_TABLE}"]`);
            const assemblySearchInput = cbedTable.locator(`[data-testid="${PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD}"]`);
            await expect(assemblySearchInput).toBeVisible();
            await assemblySearchInput.fill(ASSEMBLY_NAME);
            await assemblySearchInput.press("Enter");
            await page.waitForTimeout(1000);

            const resultRows = cbedTable.locator("tbody tr");
            const count = await resultRows.count();
            expect(count).toBe(1);

            // Verify the found row contains the correct assembly name
            const foundRow = resultRows.first();
            const rowText = await foundRow.textContent();
            expect(rowText).toContain(ASSEMBLY_NAME);

            // Highlight the found row
            await detailsPage.highlightElement(foundRow);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART E: Verify assembly with details in listing
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 8: Verify assembly with details in listing`, async () => {
            // Navigate back to parts database
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Search for the assembly in СБ table
            const cbedTable = page.locator(`[data-testid="${MAIN_PAGE_СБ_TABLE}"]`);
            const assemblySearchInput = cbedTable.locator(`[data-testid="${PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD}"]`);
            await expect(assemblySearchInput).toBeVisible();

            // Clear any existing search first
            await assemblySearchInput.fill("");
            await assemblySearchInput.press("Enter");
            await page.waitForTimeout(2000);

            // Search for the assembly
            await assemblySearchInput.fill(ASSEMBLY_NAME);
            await assemblySearchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);

            // Debug: Check total rows in table before filtering
            const allRows = cbedTable.locator("tbody tr");
            const totalRows = await allRows.count();
            console.log(`Total rows in СБ table: ${totalRows}`);

            // Debug: Log first few rows to see what's in the table
            for (let i = 0; i < Math.min(totalRows, 3); i++) {
                const rowText = await allRows.nth(i).textContent();
                console.log(`Row ${i + 1}: ${rowText}`);
            }

            // Verify assembly exists
            const resultRows = cbedTable.locator("tbody tr");
            const count = await resultRows.count();

            if (count === 0) {
                console.log(`❌ Assembly "${ASSEMBLY_NAME}" not found in СБ table`);
                console.log(`Search term used: "${ASSEMBLY_NAME}"`);
                console.log(`Total rows in table: ${totalRows}`);

                // Try a broader search to see if the assembly exists with a different name
                await assemblySearchInput.fill("ERP9692");
                await assemblySearchInput.press("Enter");
                await page.waitForTimeout(2000);

                const broaderResults = cbedTable.locator("tbody tr");
                const broaderCount = await broaderResults.count();
                console.log(`Broader search results for "ERP9692": ${broaderCount} rows`);

                for (let i = 0; i < Math.min(broaderCount, 5); i++) {
                    const rowText = await broaderResults.nth(i).textContent();
                    console.log(`Broader search row ${i + 1}: ${rowText}`);
                }
            }

            expect(count).toBe(1);

            // Highlight the found assembly row
            const foundAssemblyRow = resultRows.first();
            await detailsPage.highlightElement(foundAssemblyRow);

            // Click on the assembly to open it
            await foundAssemblyRow.click();
            await page.waitForTimeout(1000);

            // Click the edit button to open the assembly
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);
            await expect(editButton).toBeVisible();
            await detailsPage.highlightElement(editButton);
            await editButton.click();
            await page.waitForTimeout(1000);

            // Verify both details are in the specification table
            const specsTable = page.locator(`[data-testid="${EDITOR_TABLE_SPECIFICATION_CBED}"]`);
            await expect(specsTable).toBeVisible({ timeout: 5000 });

            const specRows = specsTable.locator("tbody tr");
            const rowTexts = await specRows.allTextContents();

            // Check that both details are present and highlight the rows
            const detail1Found = rowTexts.some(text => text.includes(DETAIL_1_NAME));
            const detail2Found = rowTexts.some(text => text.includes(DETAIL_2_NAME));

            expect(detail1Found).toBe(true);
            expect(detail2Found).toBe(true);

            // Highlight the specification rows that contain our details
            for (let i = 0; i < rowTexts.length; i++) {
                const rowText = rowTexts[i];
                if (rowText.includes(DETAIL_1_NAME) || rowText.includes(DETAIL_2_NAME)) {
                    const detailRow = specRows.nth(i);
                    await detailsPage.highlightElement(detailRow);
                }
            }

            console.log(`✅ Assembly "${ASSEMBLY_NAME}" created successfully with both details`);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART F: Set details quantity in revision page
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 9: Set details quantity to 5 in revision page`, async () => {
            // Open a new tab and navigate to the warehouse page
            const revisionPage = await page.context().newPage();
            await revisionPage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await revisionPage.waitForLoadState("networkidle");

            // Click the revision button
            const revisionButton = revisionPage.locator(`[data-testid="${SCLAD_REVISION_REVISION}"]`);
            await expect(revisionButton).toBeVisible();
            await revisionButton.click();
            await revisionPage.waitForTimeout(500);

            // Select the Детали (details) tab
            const detailsTab = revisionPage.locator(`[data-testid="${REVISION_SWITCH_ITEM2}"]`);
            await expect(detailsTab).toBeVisible();
            await detailsTab.click();
            await revisionPage.waitForTimeout(500);

            // Find the search input and search for the first detail
            const revisionTable = revisionPage.locator(`[data-testid="${TABLE_REVISION_PAGINATION_TABLE}"]`);
            const searchInput = revisionTable.locator(`[data-testid="${TABLE_REVISION_PAGINATION_SEARCH_INPUT}"]`);
            await expect(searchInput).toBeVisible();

            // Clear any existing search first
            await searchInput.fill("");
            await searchInput.press("Enter");
            await revisionPage.waitForTimeout(1000);

            // Set quantity for first detail
            console.log(`Setting quantity for detail "${DETAIL_1_NAME}"`);
            await searchInput.fill(DETAIL_1_NAME);
            await searchInput.press("Enter");
            await revisionPage.waitForLoadState("networkidle");
            await revisionPage.waitForTimeout(2000);

            // Find and update the first detail
            const resultRows = revisionTable.locator("tbody tr");
            const count = await resultRows.count();
            console.log(`Found ${count} rows for detail "${DETAIL_1_NAME}"`);

            if (count > 0) {
                // Find the row containing our detail
                let foundRow = null;
                for (let i = 0; i < count; i++) {
                    const rowText = await resultRows.nth(i).textContent();
                    if (rowText && rowText.includes(DETAIL_1_NAME)) {
                        foundRow = resultRows.nth(i);
                        console.log(`Found detail "${DETAIL_1_NAME}" in row ${i + 1}`);
                        break;
                    }
                }

                if (foundRow) {
                    // Highlight the found row
                    await detailsPage.highlightElement(foundRow);

                    // Select the row by clicking on it
                    await foundRow.click();
                    await revisionPage.waitForTimeout(500);

                    // Update the quantity in the 4th column (the editable element)
                    const fourthCell = foundRow.locator("td").nth(3);
                    await expect(fourthCell).toBeVisible();

                    // Inside the cell, locate the input with data-testid "InputNumber-Input"
                    const editField = fourthCell.locator(`[data-testid="${INPUT_NUMBER_INPUT}"]`);
                    await expect(editField).toBeVisible();

                    // Fill in "5" and press Enter to submit the change
                    await editField.fill("5");
                    await editField.press("Enter");
                    await revisionPage.waitForLoadState("networkidle");

                    // Confirm the update in the confirmation dialog
                    const confirmDialog = revisionPage.locator(`[data-testid="${TABLE_REVISION_PAGINATION_CONFIRM_DIALOG}"]`);
                    await expect(confirmDialog).toBeVisible({ timeout: 5000 });

                    // In the dialog, find and click the approve button
                    const confirmButton = confirmDialog.locator(`[data-testid="${TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE}"]`);
                    await expect(confirmButton).toBeVisible();
                    await detailsPage.highlightElement(confirmButton);
                    await revisionPage.waitForTimeout(1000);
                    await confirmButton.click();
                    await revisionPage.waitForLoadState("networkidle");

                    console.log(`✅ Detail "${DETAIL_1_NAME}" quantity set to 5`);
                }
            }

            // Now set quantity for second detail
            console.log(`Setting quantity for detail "${DETAIL_2_NAME}"`);

            // Clear search and search for second detail
            await searchInput.fill("");
            await searchInput.press("Enter");
            await revisionPage.waitForTimeout(1000);

            await searchInput.fill(DETAIL_2_NAME);
            await searchInput.press("Enter");
            await revisionPage.waitForLoadState("networkidle");
            await revisionPage.waitForTimeout(2000);

            // Find and update the second detail
            const resultRows2 = revisionTable.locator("tbody tr");
            const count2 = await resultRows2.count();
            console.log(`Found ${count2} rows for detail "${DETAIL_2_NAME}"`);

            if (count2 > 0) {
                // Find the row containing our detail
                let foundRow2 = null;
                for (let i = 0; i < count2; i++) {
                    const rowText = await resultRows2.nth(i).textContent();
                    if (rowText && rowText.includes(DETAIL_2_NAME)) {
                        foundRow2 = resultRows2.nth(i);
                        console.log(`Found detail "${DETAIL_2_NAME}" in row ${i + 1}`);
                        break;
                    }
                }

                if (foundRow2) {
                    // Highlight the found row
                    await detailsPage.highlightElement(foundRow2);

                    // Select the row by clicking on it
                    await foundRow2.click();
                    await revisionPage.waitForTimeout(500);

                    // Update the quantity in the 4th column (the editable element)
                    const fourthCell2 = foundRow2.locator("td").nth(3);
                    await expect(fourthCell2).toBeVisible();

                    // Inside the cell, locate the input with data-testid "InputNumber-Input"
                    const editField2 = fourthCell2.locator(`[data-testid="${INPUT_NUMBER_INPUT}"]`);
                    await expect(editField2).toBeVisible();

                    // Fill in "5" and press Enter to submit the change
                    await editField2.fill("5");
                    await editField2.press("Enter");
                    await revisionPage.waitForLoadState("networkidle");

                    // Confirm the update in the confirmation dialog
                    const confirmDialog2 = revisionPage.locator(`[data-testid="${TABLE_REVISION_PAGINATION_CONFIRM_DIALOG}"]`);
                    await expect(confirmDialog2).toBeVisible({ timeout: 5000 });

                    // In the dialog, find and click the approve button
                    const confirmButton2 = confirmDialog2.locator(`[data-testid="${TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE}"]`);
                    await expect(confirmButton2).toBeVisible();
                    await detailsPage.highlightElement(confirmButton2);
                    await revisionPage.waitForTimeout(1000);
                    await confirmButton2.click();
                    await revisionPage.waitForLoadState("networkidle");

                    console.log(`✅ Detail "${DETAIL_2_NAME}" quantity set to 5`);
                }
            }

            console.log(`✅ Both details quantities set to 5 in revision page`);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART G: Clean up test data
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step("Step 10: Clean up test data", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Archive the assembly
            await detailsPage.cleanupTestDetail(page, ASSEMBLY_NAME, MAIN_PAGE_СБ_TABLE);
            await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

            // Archive both details
            await detailsPage.cleanupTestDetail(page, DETAIL_1_NAME, PARTS_PAGE_DETAL_TABLE);
            await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

            await detailsPage.cleanupTestDetail(page, DETAIL_2_NAME, PARTS_PAGE_DETAL_TABLE);
            await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

            console.log("✅ Test data cleanup completed");
        });
    });
}; 