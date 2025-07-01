import { test, expect, Locator, Page } from "@playwright/test";
import { CreatePartsDatabasePage } from "../pages/PartsDatabasePage";
import { CreatePartsPage } from "../pages/CreatePartsPage";
import { CreateStockPage } from "../pages/StockPage";
import { CreateCompletingAssembliesToPlanPage } from "../pages/CompletingAssembliesToPlanPage";
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
const ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE = "AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save";
const EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL = "EditDetal-ButtonSaveAndCancel-ButtonsCenter-Cancel";
const MAIN_PAGE_EDIT_BUTTON = "BaseDetals-Button-Edit";

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
            await cleanupDetail(page, DETAIL_1_NAME, PARTS_PAGE_DETAL_TABLE);

            // Clean up existing detail 2
            await cleanupDetail(page, DETAIL_2_NAME, PARTS_PAGE_DETAL_TABLE);

            // Clean up existing assembly
            await cleanupDetail(page, ASSEMBLY_NAME, MAIN_PAGE_СБ_TABLE);
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
            await detailsPage.findAndClickElement(page, ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
        });

        await allure.step(`Step 3: Verify first detail "${DETAIL_1_NAME}" was saved`, async () => {
            // Click cancel to return to listing
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
            await detailsPage.findAndClickElement(page, ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
        });

        await allure.step(`Step 5: Verify second detail "${DETAIL_2_NAME}" was saved`, async () => {
            // Click cancel to return to listing
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
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART D: Create СБ assembly containing both details
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step(`Step 6: Create СБ assembly "${ASSEMBLY_NAME}" with both details`, async () => {
            // Navigate to the parts database page
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Open the create dialog
            await detailsPage.findAndClickElement(page, BASE_DETALS_BUTTON_CREATE, 500);

            // Select СБ (assembly) type
            await detailsPage.findAndClickElement(page, BASE_DETALS_CREAT_LINK_TITLE_BASE_OF_ASSEMBLY_UNITS, 500);

            // Fill in the assembly name
            const assemblyInput = page.locator(`[data-testid="${CREATOR_INFORMATION_INPUT}"]`);
            await expect(assemblyInput).toBeVisible({ timeout: 5000 });
            await assemblyInput.fill(ASSEMBLY_NAME);

            // Add first detail to assembly
            await addDetailToAssembly(page, DETAIL_1_NAME);

            // Add second detail to assembly
            await addDetailToAssembly(page, DETAIL_2_NAME);

            // Save the assembly (following ERP-969 pattern)
            const saveButton = await page.locator(`[data-testid="${CREATOR_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`);
            await saveButton.click();
            await page.waitForTimeout(1000);
        });

        await allure.step(`Step 7: Verify СБ assembly "${ASSEMBLY_NAME}" was created with both details`, async () => {
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
            await page.waitForTimeout(1000);

            await assemblySearchInput.fill(ASSEMBLY_NAME);
            await assemblySearchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);

            // Verify assembly exists
            const resultRows = cbedTable.locator("tbody tr");
            const count = await resultRows.count();
            console.log(`Found ${count} rows for assembly "${ASSEMBLY_NAME}"`);

            // If no rows found, let's check if there are any rows at all in the table
            if (count === 0) {
                const allRows = cbedTable.locator("tbody tr");
                const totalRows = await allRows.count();
                console.log(`Total rows in СБ table: ${totalRows}`);

                // Let's also check what's in the first few rows
                for (let i = 0; i < Math.min(totalRows, 3); i++) {
                    const rowText = await allRows.nth(i).textContent();
                    console.log(`Row ${i + 1}: ${rowText}`);
                }
            }

            expect(count).toBe(1);

            // Click on the assembly to open it
            await resultRows.first().click();
            await page.waitForTimeout(1000);

            // Click the edit button to open the assembly
            const editButton = page.locator(`[data-testid="${MAIN_PAGE_EDIT_BUTTON}"]`);
            await expect(editButton).toBeVisible();
            await editButton.click();
            await page.waitForTimeout(1000);

            // Verify both details are in the specification table
            const specsTable = page.locator(`[data-testid="${EDITOR_TABLE_SPECIFICATION_CBED}"]`);
            await expect(specsTable).toBeVisible({ timeout: 5000 });

            const specRows = specsTable.locator("tbody tr");
            const rowTexts = await specRows.allTextContents();

            // Check that both details are present
            const detail1Found = rowTexts.some(text => text.includes(DETAIL_1_NAME));
            const detail2Found = rowTexts.some(text => text.includes(DETAIL_2_NAME));

            expect(detail1Found).toBe(true);
            expect(detail2Found).toBe(true);

            console.log(`✅ Assembly "${ASSEMBLY_NAME}" created successfully with both details`);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART E: Clean up test data
        // ─────────────────────────────────────────────────────────────────────────────

        await allure.step("Step 8: Clean up test data", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");

            // Archive the assembly
            await cleanupDetail(page, ASSEMBLY_NAME, MAIN_PAGE_СБ_TABLE);

            // Archive both details
            await cleanupDetail(page, DETAIL_1_NAME, PARTS_PAGE_DETAL_TABLE);
            await cleanupDetail(page, DETAIL_2_NAME, PARTS_PAGE_DETAL_TABLE);

            console.log("✅ Test data cleanup completed");
        });
    });
};

// Helper function to clean up existing details/assemblies
async function cleanupDetail(page: Page, detailName: string, tableTestId: string) {
    const detailTable = page.locator(`[data-testid="${tableTestId}"]`);
    const searchInput = detailTable.locator(`[data-testid="${PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD}"]`);

    // Clear search and search for the detail
    await searchInput.fill("");
    await searchInput.press("Enter");
    await page.waitForTimeout(1000);
    await searchInput.fill(detailName);
    await searchInput.press("Enter");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Get all rows and find exact matches
    const rows = detailTable.locator("tbody tr");
    const rowCount = await rows.count();

    if (rowCount === 0) {
        console.log(`No existing ${detailName} found for cleanup`);
        return;
    }

    // Filter rows to find exact matches
    const matchingRows: Locator[] = [];
    for (let i = 0; i < rowCount; i++) {
        const rowText = await rows.nth(i).textContent();
        if (rowText && rowText.trim() === detailName) {
            matchingRows.push(rows.nth(i));
        }
    }

    // Archive each matching row
    for (let i = matchingRows.length - 1; i >= 0; i--) {
        const currentRow = matchingRows[i];

        // Click the row to select it
        await currentRow.click();
        await page.waitForTimeout(500);

        // Click the archive button
        const archiveButton = page.locator(`[data-testid="${PARTS_PAGE_ARCHIVE_BUTTON}"]`);
        await expect(archiveButton).toBeVisible();
        await archiveButton.click();
        await page.waitForLoadState("networkidle");

        // Confirm archive in modal
        const archiveModal = page.locator(`dialog[data-testid="${MODAL_CONFIRM_DIALOG}"]`);
        await expect(archiveModal).toBeVisible();
        const yesButton = archiveModal.locator(`[data-testid="${MODAL_CONFIRM_DIALOG_YES_BUTTON}"]`);
        await expect(yesButton).toBeVisible();
        await yesButton.click();
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);
    }

    console.log(`✅ Cleaned up ${matchingRows.length} instances of ${detailName}`);
}

// Helper function to add a detail to an assembly
async function addDetailToAssembly(page: Page, detailName: string) {
    // Click "Добавить" button to open the dialog
    await page.locator(`[data-testid="${SPECIFICATION_BUTTONS_ADDING_SPECIFICATION}"]`).click();
    await page.waitForTimeout(1000);

    // Select "Деталь" icon (use .first() to avoid strict mode violation)
    await page.locator(`[data-testid="${SPECIFICATION_DIALOG_CARD_BASE_DETAIL_1}"]`).first().click();
    await page.waitForTimeout(1000);

    // Wait for the dialog to be fully loaded
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Search for the detail in the dialog
    const dialogTable = page.locator(`[data-testid="${PARTS_PAGE_DETAL_TABLE}"]`);

    // Wait for the table to be visible first
    await expect(dialogTable).toBeVisible({ timeout: 10000 });

    const dialogSearchInput = dialogTable.locator(`[data-testid="${PARTS_PAGE_RIGHT_TABLE_SEARCH_FIELD}"]`);

    // Wait for the search input to be visible with a longer timeout
    await expect(dialogSearchInput).toBeVisible({ timeout: 10000 });

    // Clear any existing search and search for the detail
    await dialogSearchInput.fill("");
    await dialogSearchInput.press("Enter");
    await page.waitForTimeout(1000);

    await dialogSearchInput.fill(detailName);
    await dialogSearchInput.press("Enter");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Find and click the detail in search results
    const resultRows = dialogTable.locator("tbody tr");
    const rowCount = await resultRows.count();
    let found = false;

    for (let i = 0; i < rowCount; i++) {
        const rowText = await resultRows.nth(i).textContent();
        if (rowText && rowText.trim() === detailName) {
            await resultRows.nth(i).click();
            found = true;
            break;
        }
    }

    if (!found) {
        throw new Error(`Detail "${detailName}" not found in dialog results.`);
    }

    await page.waitForTimeout(1000);

    // Add the detail to the assembly
    await page.locator(`[data-testid="${SPECIFICATION_MODAL_BASE_DETAL_SELECT_BUTTON}"]`).click();
    await page.waitForTimeout(1000);
    await page.locator(`[data-testid="${SPECIFICATION_MODAL_BASE_DETAL_ADD_BUTTON}"]`).click();
    await page.waitForTimeout(1000);

    console.log(`✅ Added detail "${detailName}" to assembly`);
} 