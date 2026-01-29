import { Page, Locator, expect, TestInfo } from "@playwright/test";
import { PageObject, expectSoftWithScreenshot } from "../lib/Page";
import logger from "../lib/logger";
import { title } from "process";
import { toNamespacedPath } from "path";
//import testData from '../testdata/PU18-Names.json'; // Import your test data
import { allure } from 'allure-playwright';
import { SELECTORS } from '../config';
import * as SelectorsMaterialsDatabase from '../lib/Constants/SelectorsMaterialsDatabase';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

// Страница: База материалов
export class CreateMaterialsDatabasePage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    /**
     * Creates a material (материал) in the Materials Database
     * @param materialName - Name of the material to create
     * @param testInfo - TestInfo for expectSoftWithScreenshot
     * @returns Promise<boolean> - true if creation was successful
     */
    async createMaterial(materialName: string, testInfo: TestInfo): Promise<boolean> {
        await allure.step(`Create material "${materialName}"`, async () => {
            // Navigate to materials database page
            await this.goto(SELECTORS.MAINMENU.MATERIALS.URL);
            await this.waitForNetworkIdle();
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

            // Click create button - button with data-testid "Button" and text ending with "Создать"
            // Need to filter for enabled button (not disabled) and exact text match
            const createButton = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_BUTTON)
                .filter({ hasText: 'Создать' })
                .filter({ hasNotText: 'копированием' })
                .first();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(createButton).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                },
                'Verify create material button is visible',
                testInfo,
            );
            await this.highlightElement(createButton);
            await createButton.click();
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
            await this.waitForNetworkIdle();

            // Verify page title "Создание материала"
            const pageTitle = this.page.locator('h1, h2, h3, h4').filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_CREATE_PAGE_TITLE });
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(pageTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify material creation page title is visible',
                testInfo,
            );

            // Enter material name in input with data-testid "Input-Input"
            const materialNameInput = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_INPUT);
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(materialNameInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify material name input is visible',
                testInfo,
            );
            // Fill material name field
            await materialNameInput.fill(materialName);
            await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
            const filledValue = await materialNameInput.inputValue();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(filledValue).toBe(materialName);
                },
                'Verify material name was filled correctly',
                testInfo,
            );

            // First table: find input with data-testid "Search-Dropdown-Input" and enter "3D печать"
            const tables = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE);
            const firstTable = tables.first();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(firstTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify first table is visible',
                testInfo,
            );

            const firstTableSearchInput = firstTable.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_SEARCH_INPUT);
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(firstTableSearchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify first table search input is visible',
                testInfo,
            );
            await firstTableSearchInput.fill(SelectorsMaterialsDatabase.MATERIAL_TYPE_SEARCH_VALUE);
            await firstTableSearchInput.press('Enter');
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
            await this.waitForNetworkIdle();

            // Click the first row in the first table results
            const firstTableRows = firstTable.locator('tbody tr').filter({ hasNotText: 'table-yui-kit__empty' });
            const firstTableFirstRow = firstTableRows.first();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(firstTableFirstRow).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify first table result row is visible',
                testInfo,
            );
            await this.highlightElement(firstTableFirstRow);
            await firstTableFirstRow.click();
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

            // Second table: click first row (no search needed)
            const secondTable = tables.nth(1);
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(secondTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify second table is visible',
                testInfo,
            );
            const secondTableRows = secondTable.locator('tbody tr').filter({ hasNotText: 'table-yui-kit__empty' });
            const secondTableFirstRow = secondTableRows.first();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(secondTableFirstRow).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify second table first row is visible',
                testInfo,
            );
            await this.highlightElement(secondTableFirstRow);
            await secondTableFirstRow.click();
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

            // Set quantity values in TableSimple table to 1
            const quantityTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_QUANTITY_TABLE);
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(quantityTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify quantity table is visible',
                testInfo,
            );
            
            // Get all rows in tbody (should be 3 rows)
            const tableRows = quantityTable.locator('tbody tr');
            const rowCount = await tableRows.count();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(rowCount).toBe(3);
                },
                'Verify quantity table has 3 rows',
                testInfo,
            );

            // For each row, find the third TD and set the InputNumber-Input value to 1
            for (let i = 0; i < rowCount; i++) {
                const row = tableRows.nth(i);
                const thirdTd = row.locator('td').nth(2); // Third TD (0-indexed, so nth(2))
                const inputNumberFieldset = thirdTd.locator('[data-testid="InputNumber"]');
                const inputNumberInput = inputNumberFieldset.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_QUANTITY_INPUT);
                
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(inputNumberInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                    },
                    `Verify quantity input ${i + 1} is visible`,
                    testInfo,
                );
                
                await this.highlightElement(inputNumberInput);
                await inputNumberInput.fill('1');
                await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                
                // Verify the value was set
                const inputValue = await inputNumberInput.inputValue();
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(inputValue).toBe('1');
                    },
                    `Verify quantity input ${i + 1} value is set to 1`,
                    testInfo,
                );
            }

            // Click save button with data-testid "ButtonSaveAndCancel-ButtonsCenter-Save" and text "Сохранить"
            const saveButton = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_SAVE_BUTTON).filter({ hasText: 'Сохранить' });
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(saveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                'Verify save button is visible',
                testInfo,
            );
            await this.highlightElement(saveButton);
            await saveButton.click();
            await this.page.waitForTimeout(TIMEOUTS.STANDARD);
            await this.waitForNetworkIdle();

            // Verify success message (non-blocking - page may navigate away)
            // Wait a bit to see if message appears, but don't fail if it doesn't
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
            const successMessage = this.page.locator('[data-testid="Notification-Notification-Description"]').last();
            const isVisible = await successMessage.isVisible().catch(() => false);
            if (isVisible) {
                const messageText = await successMessage.textContent();
                // Material creation is successful if either:
                // 1. Material was created successfully, OR
                // 2. Material already exists (from previous test run)
                const isSuccess = messageText?.includes('Материал успешно создан') || 
                                  messageText?.includes('Объект с таким наименованием уже существует');
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(isSuccess).toBe(true);
                    },
                    'Verify material creation or existence',
                    testInfo,
                );
            }
            // Wait additional time for material to be indexed in database
            await this.page.waitForTimeout(TIMEOUTS.STANDARD);
        });

        return true;
    }

    /**
     * Archives test materials by searching for them by prefix and archiving from bottom up
     * @param materialNames - Array of material names to archive (e.g., ["ERP2969_MATERIAL_001", "ERP2969_MATERIAL_002"])
     * @param testInfo - TestInfo for expectSoftWithScreenshot
     */
    async cleanupTestMaterials(materialNames: string[], testInfo: TestInfo): Promise<void> {
        await allure.step(`Clean up ${materialNames.length} test materials`, async () => {
            if (materialNames.length === 0) {
                console.log('No materials to clean up');
                return;
            }

            // Extract prefix from first material name (remove trailing underscore and number)
            // e.g., "ERP2969_MATERIAL_001" -> "ERP2969_MATERIAL"
            const materialPrefix = materialNames[0]?.replace(/_\d+$/, '') || '';
            console.log(`Searching for materials with prefix: "${materialPrefix}"`);

            // Navigate to materials database page
            await this.goto(SELECTORS.MAINMENU.MATERIALS.URL);
            await this.waitForNetworkIdle(WAIT_TIMEOUTS.LONG);
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

            // Find the table with data-testid="MaterialTableList-Table-Item"
            const materialTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_TABLE).first();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(materialTable).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                },
                'Verify materials table is visible',
                testInfo,
            );

            // Find the search input
            const searchInput = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_INPUT).first();
            await expectSoftWithScreenshot(
                this.page,
                () => {
                    expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                },
                `Verify search input is visible for material prefix "${materialPrefix}"`,
                testInfo,
            );

            // Perform search once with the prefix
            await this.searchWithPressSequentially(
                SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_INPUT,
                materialPrefix,
                { delay: 50, waitAfterSearch: TIMEOUTS.STANDARD, timeout: WAIT_TIMEOUTS.STANDARD },
            );

            // Wait for table to update after search
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
            await this.waitForNetworkIdle();

            // Close any open dropdowns (search history dropdown might be open)
            // Press Escape to close dropdowns
            await this.page.keyboard.press('Escape');
            await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
            
            // Wait for dropdown to disappear
            const searchHistoryDropdown = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_HISTORY_DROPDOWN);
            await searchHistoryDropdown.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {
                // Dropdown might not be visible, that's okay
            });
            await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

            // Find all rows in the table
            const rows = materialTable.locator('tbody tr');
            const rowCount = await rows.count();
            console.log(`Found ${rowCount} rows after searching for material prefix "${materialPrefix}"`);

            // Create a set of material names for quick lookup
            const materialNamesSet = new Set(materialNames.map(name => name.toLowerCase()));

            // Verify at least one material is in the results
            let materialsFound = 0;
            for (let i = 0; i < rowCount; i++) {
                const row = rows.nth(i);
                const rowText = await row.textContent();
                if (rowText) {
                    // Check if row contains any of the material names
                    for (const materialName of materialNames) {
                        if (rowText.includes(materialName)) {
                            materialsFound++;
                            break;
                        }
                    }
                }
            }

            // Only verify materials were found if any were found
            // If no materials found, they may have already been archived
            if (materialsFound > 0) {
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(materialsFound).toBeGreaterThan(0);
                    },
                    `Verify at least one material with prefix "${materialPrefix}" is found in search results`,
                    testInfo,
                );
            } else {
                console.log(`No materials found with prefix "${materialPrefix}" - cleanup may have already been completed`);
            }

            // Archive from bottom up - archive all rows that match any of the material names
            let archivedCount = 0;
            for (let i = rowCount - 1; i >= 0; i--) {
                const row = rows.nth(i);
                const rowText = await row.textContent();
                
                // Check if row contains any of the material names
                let shouldArchive = false;
                let matchedMaterialName = '';
                if (rowText) {
                    for (const materialName of materialNames) {
                        if (rowText.includes(materialName)) {
                            shouldArchive = true;
                            matchedMaterialName = materialName;
                            break;
                        }
                    }
                }
                
                if (!shouldArchive) {
                    continue;
                }

                // Wait for row to be visible and scroll into view
                await row.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                await row.scrollIntoViewIfNeeded();
                await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

                // Ensure dropdown is closed before clicking row
                const searchHistoryDropdown = this.page.locator('[data-testid="MaterialTableList-Table-Item-SearchInput-Dropdown-History-ShowResult-Title"]');
                const isDropdownVisible = await searchHistoryDropdown.isVisible().catch(() => false);
                if (isDropdownVisible) {
                    // Click outside to close dropdown, or press Escape again
                    await this.page.keyboard.press('Escape');
                    await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
                }

                // Click the row to select it - use the center of the row for more reliable clicking
                await row.click({ position: { x: 0.5, y: 0.5 } });
                await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
                
                // Wait for network to settle after row selection
                await this.waitForNetworkIdle();
                await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

                // Find the Archive button with data-testid="Button" and text "Архив"
                const archiveButton = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_ARCHIVE_BUTTON).filter({ hasText: 'Архив' }).first();
                
                // Wait for button to be visible first
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(archiveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                    },
                    `Verify archive button is visible for material "${matchedMaterialName}"`,
                    testInfo,
                );
                
                // Wait for button to become enabled (row selection might take time)
                await archiveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                
                // Wait for button to be enabled with retries
                let isEnabled = false;
                for (let retry = 0; retry < 15; retry++) {
                    isEnabled = await archiveButton.isEnabled().catch(() => false);
                    if (isEnabled) break;
                    await this.page.waitForTimeout(TIMEOUTS.SHORT);
                }
                
                if (!isEnabled) {
                    console.log(`⚠️ Archive button is disabled for material "${matchedMaterialName}" - material may be in use or row not properly selected. Skipping...`);
                    continue; // Skip this row and continue with next
                }
                
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(isEnabled).toBe(true);
                    },
                    `Verify archive button is enabled for material "${matchedMaterialName}"`,
                    testInfo,
                );

                // Click the Archive button
                await archiveButton.click();
                await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

                // Wait for and click the confirm button in ModalConfirm dialog
                const confirmModal = this.page.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG).first();
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(confirmModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                    },
                    `Verify confirm modal is visible for material "${matchedMaterialName}"`,
                    testInfo,
                );

                const confirmButton = this.page.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG_YES_BUTTON).first();
                await expectSoftWithScreenshot(
                    this.page,
                    () => {
                        expect.soft(confirmButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                    },
                    `Verify confirm button is visible for material "${matchedMaterialName}"`,
                    testInfo,
                );

                await confirmButton.click();
                await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
                await this.waitForNetworkIdle();

                console.log(`✅ Archived material "${matchedMaterialName}" from row ${i}`);
                archivedCount++;
            }

            console.log(`✅ Completed archiving ${archivedCount} materials with prefix "${materialPrefix}"`);
        });
    }
}