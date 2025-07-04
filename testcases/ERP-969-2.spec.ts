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

const SCLAD_COMPLETION_CBED_PLAN = "Sclad-completionCbedPlan";

// Additional test data variables for the new steps
let orderNumber: string | null = null; // Declare outside to share between steps
let orderedQuantity: number = 5; // Declare outside to share between steps
let targetRow: any = null; // Declare outside to share between steps
let specificationQuantity: number = 1; // Global variable for specification quantity from step 10
let waybillCollections: number = 0; // Global variable to track waybill collections
let currentBuildQuantity: number = 1; // Global variable for current build quantity (how many items we're building now)

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
const ADD_DETAL_INFORMATION_INPUT_INPUT = "AddDetal-Information-Input-Input";
const EDIT_DETAL_TITLE = "EditDetal-Title";
const CREATOR_TITLE = "Creator-Title";

// Revision page constants
const SCLAD_REVISION_REVISION = "Sclad-revision-revision";
const MINI_NAVIGATION_POS_DATA1 = "MiniNavigation-POS-Data1";
const REVISION_SWITCH_ITEM2 = "Revision-Switch-Item2";
const REVISION_TABLE_REVISION_PAGINATION_CBEDS = "Revision-TableRevisionPagination-Cbeds";
const REVISION_TABLE_REVISION_PAGINATION_DETALS = "Revision-TableRevisionPagination-Detals";
const TABLE_REVISION_PAGINATION_TABLE = "Revision-TableRevisionPagination-Detals-Table";
const TABLE_REVISION_PAGINATION_SEARCH_INPUT = "TableRevisionPagination-SearchInput-Dropdown-Input";
const TABLE_REVISION_PAGINATION_EDIT_PEN = "TableRevisionPagination-EditPen";
const INPUT_NUMBER_INPUT = "InputNumber-Input";
const TABLE_REVISION_PAGINATION_CONFIRM_DIALOG = "TableRevisionPagination-ConfirmDialog";
const TABLE_REVISION_PAGINATION_CONFIRM_DIALOG_APPROVE = "TableRevisionPagination-ConfirmDialog-Approve";
const MODAL_PROMPT_MINI_BUTTON_CONFIRM = "ModalPrompt-Mini-Button-Confirm";
const MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT = "ModalAddOrder-SupplierOrderCreationModal-Content";

// Additional constants for the new steps
const SEARCH_COVER_INPUT = "Search-Cover-Input";
const SELECT_TYPE_OBJECT_OPERATION_ASSEMBLIES = "SelectTypeObject-Operation-Assemblies";
const MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE = "ModalAddOrder-ProductionTable-Table";
const MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT = "ModalAddOrder-ProductionTable-TableRowYourQuantityInput";
const MODAL_ADD_ORDER_PRODUCTION_TABLE_ORDER_BUTTON = "ModalAddOrder-ProductionTable-OrderButton";
const MODAL_ADD_ORDER_MODALS_MODAL_START_PRODUCTION_TRUE = "ModalAddOrder-Modals-ModalStartProductiontrue";
const MODAL_START_PRODUCTION_ORDER_NUMBER_VALUE = "ModalStartProduction-OrderNumberValue";
const MODAL_START_PRODUCTION_COMPLECTATION_TABLE_CANCEL_BUTTON = "ModalStartProduction-ComplectationTable-CancelButton";
const MODAL_START_PRODUCTION_COMPLECTATION_TABLE_INPRODUCTION_BUTTON = "ModalStartProduction-ComplectationTable-InProduction";
const ORDER_SUPPLIERS_TABLE_ORDER_TABLE = "OrderSuppliers-Table-OrderTable";
const ORDER_MODAL_TABLE = "TableStockOrderItems-TableStockOrderItems-Table";
const ORDER_SUPPLIERS_MODAL_WORKER_WORKER_MODAL = "OrderSuppliers-ModalWorker-WorkerModal";

const SCLAD_ORDERING_SUPPLIERS = "Sclad-orderingSuppliers";
const ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON = "OrderSuppliers-Div-CreateOrderButton";
const ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON_CREATE_ORDER = "OrderSuppliers-Div-CreateOrderButton-CreateOrder";

// Constants for Step 15
const TABLE_COMPLECT_TABLE = "TableComplect-TableComplect-Table";
const MODAL_ADD_WAYBILL_WAYBILL_DETAILS_RIGHT = "ModalAddWaybill-WaybillDetails-Right";
const MODAL_ADD_WAYBILL_WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL = "ModalAddWaybill-WaybillDetails-RequiredQuantityCell";
const MODAL_ADD_WAYBILL_WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL = "ModalAddWaybill-WaybillDetails-CollectedQuantityCell";
const MODAL_ADD_WAYBILL_WAYBILL_DETAILS_NAME_CELL = "ModalAddWaybill-WaybillDetails-NameCell";
const MODAL_ADD_WAYBILL_WAYBILL_DETAILS_OWN_QUANTITY_INPUT = "ModalAddWaybill-WaybillDetails-OwnQuantityInput";
const MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_TOTAL_QUANTITY_LABEL = "ModalAddWaybill-ShipmentDetailsTable-TotalQuantityLabel";
const MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_SCLAD_SET_SELECTED_CHECKBOX = "ModalAddWaybill-ShipmentDetailsTable-ScladSetSelectedCheckbox";
const MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_ORDER_NUMBER_CELL = "ModalAddWaybill-ShipmentDetailsTable-StockOrderRow46940-OrderNumberCell";
const MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_STOCK_ORDER_ROW_REMAINING_QUANTITY_CELL = "ModalAddWaybill-ShipmentDetailsTable-StockOrderRow46940-RemainingQuantityCell";

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
            await detailsPage.fillDetailName(DETAIL_1_NAME, ADD_DETAL_INFORMATION_INPUT_INPUT);

            // Save the detail
            const saveButton = page.locator(`[data-testid="${ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`);
            await detailsPage.highlightElement(saveButton);
            await detailsPage.findAndClickElement(page, ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Check for success notification message
            await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");

            // Verify we're now in edit mode (page transitioned from add to edit)
            const editPageTitle = page.locator(`[data-testid="${EDIT_DETAL_TITLE}"]`);
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
            await detailsPage.fillDetailName(DETAIL_2_NAME, ADD_DETAL_INFORMATION_INPUT_INPUT);

            // Save the detail
            const saveButton = page.locator(`[data-testid="${ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE}"]`);
            await detailsPage.highlightElement(saveButton);
            await detailsPage.findAndClickElement(page, ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE, 500);
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            // Check for success notification message
            await detailsPage.verifyDetailSuccessMessage("Деталь успешно создана");

            // Verify we're now in edit mode (page transitioned from add to edit)
            const editPageTitle = page.locator(`[data-testid="${EDIT_DETAL_TITLE}"]`);
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
            const creatorPage = page.locator(`[data-testid="${CREATOR_TITLE}"]`);
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
            await detailsPage.highlightElement(revisionButton);
            await expect(revisionButton).toBeVisible();
            await revisionButton.click();
            await revisionPage.waitForTimeout(500);

            // Select the Детали (details) tab
            const detailsTab = revisionPage.locator(`[data-testid="${REVISION_SWITCH_ITEM2}"]`);
            await detailsPage.highlightElement(detailsTab);
            await expect(detailsTab).toBeVisible();
            await detailsTab.click();
            await revisionPage.waitForTimeout(500);

            // Find the search input and search for the first detail
            const revisionTable = revisionPage.locator(`[data-testid="${TABLE_REVISION_PAGINATION_TABLE}"]`);
            await detailsPage.highlightElement(revisionTable);
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


        const warehousePage = await page.context().newPage();
        await allure.step("Step 11: Create supplier order and start production for test SB", async () => {
            // Open a new tab for the warehouse page

            await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await warehousePage.waitForLoadState("networkidle");

            // Click the ordering suppliers button
            const orderingSuppliersButton = warehousePage.locator(`[data-testid="${SCLAD_ORDERING_SUPPLIERS}"]`);
            await orderingSuppliersButton.click();
            await warehousePage.waitForTimeout(500);
            await warehousePage.waitForLoadState("networkidle");

            // Click the create order button
            const createOrderButton = warehousePage.locator(`[data-testid="${ORDER_SUPPLIERS_DIV_CREATE_ORDER_BUTTON}"]`);
            await createOrderButton.click();
            await warehousePage.waitForTimeout(500);
            await warehousePage.waitForLoadState("networkidle");

            // Verify the supplier order creation modal is visible
            const supplierModal = warehousePage.locator(`[data-testid="${MODAL_ADD_ORDER_SUPPLIER_ORDER_CREATION_MODAL_CONTENT}"]`);
            await expect(supplierModal).toBeVisible({ timeout: 5000 });

            //Click the assemblies operation button 
            const assembliesButton = warehousePage.locator(`[data-testid="${SELECT_TYPE_OBJECT_OPERATION_ASSEMBLIES}"]`);
            await assembliesButton.click();
            await warehousePage.waitForTimeout(500);
            await warehousePage.waitForLoadState("networkidle");

            //Verify the production table is visible
            const productionTable = warehousePage.locator(`table[data-testid="${MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE}"]`).first();
            await expect(productionTable).toBeVisible({ timeout: 5000 });

            // Find and fill the search input
            const searchInput = productionTable.locator(`[data-testid="${SEARCH_COVER_INPUT}"]`);
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill(ASSEMBLY_NAME);
            await searchInput.press("Enter");
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1000);

            // Verify exactly one row is returned
            const rows = productionTable.locator("tbody tr");
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} row(s) in production table for SB "${ASSEMBLY_NAME}".`);
            expect(rowCount).toBe(1);

            // Enter quantity "2" in the 8th column
            const quantityInput = rows.first().locator(`[data-testid="${MODAL_ADD_ORDER_PRODUCTION_TABLE_TABLE_ROW_YOUR_QUANTITY_INPUT}"]`);
            await expect(quantityInput).toBeVisible({ timeout: 5000 });
            await quantityInput.fill(orderedQuantity.toString());
            await quantityInput.press("Enter");
            await warehousePage.waitForTimeout(500);

            // Click the order button without selecting checkbox (should show warning)
            const orderButton = warehousePage.locator(`[data-testid="${MODAL_ADD_ORDER_PRODUCTION_TABLE_ORDER_BUTTON}"]`);
            await orderButton.click();
            await warehousePage.waitForTimeout(500);
            await warehousePage.waitForLoadState("networkidle");

            // Verify warning notification appears
            //await detailsPage.verifyDetailSuccessMessage("Сначала выберите объекты для запуска в производство");

            // Check the checkbox in the first column of the results row
            // Try clicking on the parent td element first
            await rows.locator("td").nth(0).click();

            // Click the order button again (should open production modal)
            await orderButton.click();
            await warehousePage.waitForTimeout(500);
            await warehousePage.waitForLoadState("networkidle");

            // Verify the production start modal is visible
            const productionModal = warehousePage.locator(`[data-testid="${MODAL_ADD_ORDER_MODALS_MODAL_START_PRODUCTION_TRUE}"]`);
            await productionModal.evaluate((element) => {
                element.style.border = "2px solid red";
                element.style.backgroundColor = "yellow";
            });
            await expect(productionModal).toBeVisible({ timeout: 5000 });

            // Verify the modal title
            const modalTitle = productionModal.locator('h4');
            await modalTitle.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await expect(modalTitle).toHaveText("Запустить в производство", { timeout: 5000 });

            // Verify today's date is present (check for current date format)
            const today = new Date().toLocaleDateString('ru-RU');
            const modalContent = await productionModal.textContent();
            expect(modalContent).toContain(today);

            // Capture the order number
            const orderNumberSpan = productionModal.locator(`span[data-testid="${MODAL_START_PRODUCTION_ORDER_NUMBER_VALUE}"]`);
            await orderNumberSpan.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });
            await expect(orderNumberSpan).toBeVisible({ timeout: 5000 });
            orderNumber = await orderNumberSpan.textContent();
            console.log(`Captured order number: ${orderNumber}`);

            // Find and click the "В производство" button
            const startProductionButton = productionModal.locator(`[data-testid="${MODAL_START_PRODUCTION_COMPLECTATION_TABLE_INPRODUCTION_BUTTON}"]:has-text("В производство")`);
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

        await allure.step("Step 12: Search for the created order in the order table", async () => {
            // Verify the order table is visible
            await warehousePage.waitForLoadState("networkidle");
            const orderTable = warehousePage.locator(`table[data-testid="${ORDER_SUPPLIERS_TABLE_ORDER_TABLE}"]`);
            await expect(orderTable).toBeVisible({ timeout: 5000 });

            // Find and fill the search input with the captured order number
            const searchInput = orderTable.locator(`[data-testid="${SEARCH_COVER_INPUT}"]`);
            await expect(searchInput).toBeVisible({ timeout: 5000 });
            await searchInput.fill(ASSEMBLY_NAME);
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

        await allure.step("Step 13: Click the found order row and verify order details in modal", async () => {
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
            const orderModal = warehousePage.locator(`dialog[data-testid^="${ORDER_SUPPLIERS_MODAL_WORKER_WORKER_MODAL}"]`);
            await detailsPage.highlightElement(orderModal, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await expect(orderModal).toBeVisible({ timeout: 5000 });
            await detailsPage.highlightElement(orderModal, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Verify the modal title
            const modalTitle = orderModal.locator('h4');
            await detailsPage.highlightElement(modalTitle, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await expect(modalTitle).toHaveText("Заказ", { timeout: 5000 });
            await detailsPage.highlightElement(modalTitle, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Verify the order date in the modal
            const modalDateElement = orderModal.locator('.modal-worker__label-span').first();
            await detailsPage.highlightElement(modalDateElement, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await expect(modalDateElement).toBeVisible({ timeout: 5000 });
            const modalDate = await modalDateElement.textContent();
            console.log(`Modal date: "${modalDate}"`);
            expect(modalDate).toContain(orderDate?.trim() || "");
            await detailsPage.highlightElement(modalDateElement, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Verify the order number (without "C" prefix)
            const modalOrderNumberElement = orderModal.locator('.modal-worker__label-span').nth(1);
            await detailsPage.highlightElement(modalOrderNumberElement, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await expect(modalOrderNumberElement).toBeVisible({ timeout: 5000 });
            const modalOrderNumber = await modalOrderNumberElement.textContent();
            console.log(`Modal order number: "${modalOrderNumber}"`);
            expect(modalOrderNumber?.trim()).toBe(orderNumber?.trim());
            await detailsPage.highlightElement(modalOrderNumberElement, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Find and verify the table contents
            const table = orderModal.locator(`[data-testid="${ORDER_MODAL_TABLE}"]`);
            await detailsPage.highlightElement(table, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await expect(table).toBeVisible({ timeout: 5000 });
            await detailsPage.highlightElement(table, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Get the first data row (skip header if present)
            const firstDataRow = table.locator("tbody tr").first();
            await detailsPage.highlightElement(firstDataRow, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await expect(firstDataRow).toBeVisible({ timeout: 5000 });
            await detailsPage.highlightElement(firstDataRow, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Verify the first column contains order number with suffix
            const firstColumn = firstDataRow.locator("td").first();
            await detailsPage.highlightElement(firstColumn, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            const firstColumnText = await firstColumn.textContent();
            console.log(`First column (order number with suffix): "${firstColumnText}"`);
            expect(firstColumnText).toMatch(new RegExp(`^${orderNumber}_\\d+$`));

            // Verify the third column contains ASSEMBLY_NAME
            const thirdColumn = firstDataRow.locator("td").nth(2); // 3rd column (index 2)
            await detailsPage.highlightElement(thirdColumn, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            const thirdColumnText = await thirdColumn.textContent();
            console.log(`Third column (item): "${thirdColumnText}"`);
            expect(thirdColumnText?.trim()).toBe(ASSEMBLY_NAME);

            // Verify the fourth column contains "Заказано"
            const fourthColumn = firstDataRow.locator("td").nth(3); // 4th column (index 3)
            await detailsPage.highlightElement(fourthColumn, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            const fourthColumnText = await fourthColumn.textContent();
            console.log(`Fourth column (status): "${fourthColumnText}"`);
            expect(fourthColumnText?.trim()).toBe("Заказано");

            // Verify the fifth column contains the ordered quantity
            const fifthColumn = firstDataRow.locator("td").nth(4); // 5th column (index 4)
            await detailsPage.highlightElement(fifthColumn, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            const fifthColumnText = await fifthColumn.textContent();
            console.log(`Fifth column (quantity): "${fifthColumnText}"`);
            expect(parseInt(fifthColumnText?.trim() || "0")).toBe(orderedQuantity);

            // Verify the last column contains "0"
            const lastColumn = firstDataRow.locator("td").last();
            await detailsPage.highlightElement(lastColumn, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            const lastColumnText = await lastColumn.textContent();
            console.log(`Last column: "${lastColumnText}"`);
            expect(lastColumnText?.trim()).toBe("0");
            await warehousePage.waitForTimeout(1000);
            // Close the modal
            await warehousePage.mouse.click(1, 1);

        });
        await allure.step("Step 14: go to the warehouse page and click the Комплектация сборок на план button", async () => {
            await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await warehousePage.waitForLoadState("networkidle");
            await detailsPage.highlightElement(warehousePage.locator(`[data-testid="${SCLAD_COMPLETION_CBED_PLAN}"]`));
            await warehousePage.waitForTimeout(1000);
            await warehousePage.locator(`[data-testid="${SCLAD_COMPLETION_CBED_PLAN}"]`).click();

            await warehousePage.waitForTimeout(1000);
        });

        await allure.step("Step 15: Search for our СБ in the kitting table and verify modal details", async () => {
            // Find TableComplect-TableComplect-Table
            const kittingTable = warehousePage.locator(`[data-testid="${TABLE_COMPLECT_TABLE}"]`);
            await detailsPage.highlightElement(kittingTable, {
                border: '2px solid red',
            });
            await expect(kittingTable).toBeVisible({ timeout: 5000 });

            // Find input Search-Cover-Input and style it
            const searchInput = kittingTable.locator(`[data-testid="${SEARCH_COVER_INPUT}"]`);
            await expect(searchInput).toBeVisible({ timeout: 10000 });
            await searchInput.waitFor({ state: 'visible', timeout: 10000 });

            await detailsPage.highlightElement(searchInput, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });

            // Clear any existing value first
            await searchInput.clear();
            await warehousePage.waitForTimeout(500);

            // Focus the input and fill it
            await searchInput.focus();
            await warehousePage.waitForTimeout(500);
            await searchInput.fill(ASSEMBLY_NAME);

            // Verify the value was set
            const inputValue = await searchInput.inputValue();
            console.log(`Search input value after fill: "${inputValue}"`);
            expect(inputValue).toBe(ASSEMBLY_NAME);

            await warehousePage.waitForTimeout(1000);
            await searchInput.press("Enter");
            await warehousePage.waitForLoadState("networkidle");

            // Wait for results to show - should be one row
            const resultRows = kittingTable.locator("tbody tr");
            await expect(resultRows).toHaveCount(1, { timeout: 5000 });

            // Verify 4th column contains our СБ name
            const fourthColumn = resultRows.first().locator("td").nth(3); // 4th column (index 3)
            const fourthColumnText = await fourthColumn.textContent();
            expect(fourthColumnText?.trim()).toBe(ASSEMBLY_NAME);

            // Double click the third column to open modal
            const thirdColumn = resultRows.first().locator("td").nth(2); // 3rd column (index 2)
            await thirdColumn.dblclick();
            await warehousePage.waitForLoadState("networkidle");
            await warehousePage.waitForTimeout(1000);

            // Find the dialog with id ModalAddWaybill-WaybillDetails-Right
            const waybillModal = warehousePage.locator(`[data-testid="${MODAL_ADD_WAYBILL_WAYBILL_DETAILS_RIGHT}"]`);
            await expect(waybillModal).toBeVisible({ timeout: 5000 });

            // Find cell with id ModalAddWaybill-WaybillDetails-RequiredQuantityCell
            const requiredQuantityCell = waybillModal.locator(`[data-testid="${MODAL_ADD_WAYBILL_WAYBILL_DETAILS_REQUIRED_QUANTITY_CELL}"]`);
            await detailsPage.highlightElement(requiredQuantityCell, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });
            await warehousePage.waitForTimeout(1000);

            // Confirm it contains the value of our order quantity
            const requiredQuantity = await requiredQuantityCell.textContent();
            expect(parseInt(requiredQuantity?.trim() || "0")).toBe(orderedQuantity);
            await detailsPage.highlightElement(requiredQuantityCell, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Find cell with id ModalAddWaybill-WaybillDetails-CollectedQuantityCell
            const collectedQuantityCell = waybillModal.locator(`[data-testid="${MODAL_ADD_WAYBILL_WAYBILL_DETAILS_COLLECTED_QUANTITY_CELL}"]`);
            await detailsPage.highlightElement(collectedQuantityCell, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await warehousePage.waitForTimeout(1000);

            // Confirm it contains the value 0
            const collectedQuantity = await collectedQuantityCell.textContent();
            expect(parseInt(collectedQuantity?.trim() || "0")).toBe(0);
            await detailsPage.highlightElement(collectedQuantityCell, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Find cell with id ModalAddWaybill-WaybillDetails-NameCell
            const nameCell = waybillModal.locator(`[data-testid="${MODAL_ADD_WAYBILL_WAYBILL_DETAILS_NAME_CELL}"]`);
            await detailsPage.highlightElement(nameCell, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await warehousePage.waitForTimeout(1000);

            // Confirm it contains the name of our СБ
            const nameCellText = await nameCell.textContent();
            expect(nameCellText?.trim()).toBe(ASSEMBLY_NAME);
            await detailsPage.highlightElement(nameCell, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Find input with id ModalAddWaybill-WaybillDetails-OwnQuantityInput
            const ownQuantityInput = waybillModal.locator(`[data-testid="${MODAL_ADD_WAYBILL_WAYBILL_DETAILS_OWN_QUANTITY_INPUT}"]`);
            await detailsPage.highlightElement(ownQuantityInput, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await warehousePage.waitForTimeout(1000);

            // Set its value to 1
            await ownQuantityInput.fill("1");
            await ownQuantityInput.press("Enter");
            await warehousePage.waitForLoadState("networkidle");

            // Set its color to green
            await detailsPage.highlightElement(ownQuantityInput, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Find cell with id ModalAddWaybill-ShipmentDetailsTable-TotalQuantityLabel
            const totalQuantityLabel = waybillModal.locator(`[data-testid="${MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_TOTAL_QUANTITY_LABEL}"]`);
            await detailsPage.highlightElement(totalQuantityLabel, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await warehousePage.waitForTimeout(1000);

            // Confirm it contains "Всего: 0"
            const totalQuantityText = await totalQuantityLabel.textContent();
            expect(totalQuantityText?.trim()).toBe("Всего: 0");
            await detailsPage.highlightElement(totalQuantityLabel, {
                backgroundColor: 'green',
                border: '2px solid green',
                color: 'white'
            });

            // Find cell with id ModalAddWaybill-ShipmentDetailsTable-ScladSetSelectedCheckbox
            const checkboxCell = waybillModal.locator(`[data-testid="${MODAL_ADD_WAYBILL_SHIPMENT_DETAILS_TABLE_SCLAD_SET_SELECTED_CHECKBOX}"]`);
            await detailsPage.highlightElement(checkboxCell, {
                backgroundColor: 'yellow',
                border: '2px solid red',
                color: 'blue'
            });
            await warehousePage.waitForTimeout(1000);

            // Select the checkbox (click on the parent div)
            await checkboxCell.click();
            await warehousePage.waitForTimeout(1000);

            // Find cell with id ModalAddWaybill-ShipmentDetailsTable-StockOrderRow46940-OrderNumberCell
            const orderNumberCell = waybillModal.locator(`[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-OrderNumberCell"]`);
            await expect(orderNumberCell).toBeVisible({ timeout: 5000 });

            // Confirm it contains our order number
            const orderNumberCellText = await orderNumberCell.textContent();
            expect(orderNumberCellText?.trim()).toContain(orderNumber);

            // Find cell with id ModalAddWaybill-ShipmentDetailsTable-StockOrderRow46940-RemainingQuantityCell
            const remainingQuantityCell = waybillModal.locator(`[data-testid^="ModalAddWaybill-ShipmentDetailsTable-StockOrderRow"][data-testid$="-RemainingQuantityCell"]`);
            await expect(remainingQuantityCell).toBeVisible({ timeout: 5000 });

            // Confirm it contains our order quantity
            const remainingQuantity = await remainingQuantityCell.textContent();
            expect(parseInt(remainingQuantity?.trim() || "0")).toBe(orderedQuantity);
        });

        // ─────────────────────────────────────────────────────────────────────────────
        // PART G: Clean up test data
        // ─────────────────────────────────────────────────────────────────────────────

        // await allure.step("Step 10: Clean up test data", async () => {
        //     await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        //     await page.waitForLoadState("networkidle");

        //     // Archive the assembly
        //     await detailsPage.cleanupTestDetail(page, ASSEMBLY_NAME, MAIN_PAGE_СБ_TABLE);
        //     await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

        //     // Archive both details
        //     await detailsPage.cleanupTestDetail(page, DETAIL_1_NAME, PARTS_PAGE_DETAL_TABLE);
        //     await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

        //     await detailsPage.cleanupTestDetail(page, DETAIL_2_NAME, PARTS_PAGE_DETAL_TABLE);
        //     await detailsPage.verifyDetailSuccessMessage("Сущность перемещена в архив");

        //     console.log("✅ Test data cleanup completed");
        // });
    });

}; 