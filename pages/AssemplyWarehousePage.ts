import { Page, TestInfo } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/utils/logger";
import { SELECTORS } from "../config";
import * as SelectorsAssemblyWarehouse from "../lib/Constants/SelectorsAssemblyWarehouse";
import * as SelectorsOrderedFromSuppliers from "../lib/Constants/SelectorsOrderedFromSuppliers";
import * as SelectorsPartsDataBase from "../lib/Constants/SelectorsPartsDataBase";
import { TIMEOUTS, WAIT_TIMEOUTS } from "../lib/Constants/TimeoutConstants";
import { allure } from "allure-playwright";

// Страница: Сборка склад
export class CreateAssemblyWarehousePage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    /**
     * Archives all orders for items matching the given prefixes.
     * Follows the exact process:
     * 1. Search for product on "Заказ склада на сборку" page
     * 2. Verify first row matches our product by checking name cell
     * 3. Click second cell to open context menu
     * 4. Click "Заказы" menu item
     * 5. Open order edit dialog and archive orders using SelectAll checkbox
     * 6. Archive the row itself
     * @param itemPrefixes Array of item prefixes to search for (e.g., ["ERPTEST_PRODUCT", "ERPTEST_SB"])
     * @returns Number of orders archived
     */
    async archiveOrdersByItemPrefixes(itemPrefixes: string[]): Promise<number> {
        let totalArchivedOrders = 0;
        
        await allure.step(`Archive orders for items with prefixes: ${itemPrefixes.join(', ')}`, async () => {
            await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
            await this.page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
            await this.waitForNetworkIdle();
            await this.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });

            // Archive orders for each item prefix
            for (const itemPrefix of itemPrefixes) {
                try {
                    // Ensure we're still on the assembly warehouse page before searching
                    // Check if the table is still present
                    const tableExists = await this.page.locator(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE).isVisible().catch(() => false);
                    if (!tableExists) {
                        logger.log(`Table not found, navigating back to assembly warehouse page for prefix "${itemPrefix}"`);
                        await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
                        await this.page.locator(SelectorsAssemblyWarehouse.WAREHOUSE_PAGE_STOCK_ORDER_ASSEMBLY_BUTTON).click();
                        await this.waitForNetworkIdle();
                        await this.waitingTableBody(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE, { minRows: 0 });
                    }

                    // Step 1: Search for items with this prefix
                    await this.searchAndWaitForTable(
                        itemPrefix,
                        SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                        SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                        {
                            searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
                        },
                    );

                    // Get all rows matching the prefix
                    const rows = this.page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
                    const rowCount = await rows.count();

                    if (rowCount === 0) {
                        logger.log(`No items found with prefix "${itemPrefix}" - skipping order cleanup`);
                        continue;
                    }

                    // Process each row
                    for (let i = 0; i < rowCount; i++) {
                        const row = rows.nth(i); // Define row outside try block so it's accessible in catch
                        try {
                            await row.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
                            
                            // Step 2: Verify this is our product by checking the name cell
                            const nameCell = row.locator(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_BODY_TD_NAME).first();
                            const nameText = await nameCell.textContent();
                            
                            if (!nameText || !nameText.toLowerCase().includes(itemPrefix.toLowerCase())) {
                                logger.log(`Row ${i} name "${nameText}" does not match prefix "${itemPrefix}" - skipping`);
                                continue;
                            }

                            logger.log(`✅ Found matching product "${nameText}" in row ${i}`);

                            // Step 3: Click the second cell to open context menu
                            // The second cell should be the one with the popover
                            const secondCell = row.locator('td').nth(1);
                            await secondCell.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await this.waitAndHighlight(secondCell);
                            await secondCell.click();
                            await this.waitForTimeout(TIMEOUTS.MEDIUM); // Wait longer for popover to open

                            // Step 4: Click on 'Заказы' in context menu
                            // Wait for popover to appear and become visible
                            await this.waitForTimeout(TIMEOUTS.MEDIUM); // Wait for popover animation
                            
                            // Find the visible popover that contains "Заказы"
                            const popoverContainer = this.page.locator('.popover-yui-kit__options:visible').filter({ hasText: 'Заказы' }).first();
                            await popoverContainer.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
                            
                            // Now find the Popover-Item0 with text "Заказы" within this visible popover
                            const ordersMenuItem = popoverContainer.locator(SelectorsPartsDataBase.POPOVER_ITEM0).filter({ hasText: 'Заказы' }).first();
                            await ordersMenuItem.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await this.waitAndHighlight(ordersMenuItem);
                            await ordersMenuItem.click();
                            await this.waitForTimeout(TIMEOUTS.LONG);

                            // Step 5: Wait for "Список заказов" modal to appear
                            // Try with [open] attribute first, then fall back to without it
                            let ordersListModal = this.page.locator(`${SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_RIGHT_MENU_MODAL}[open]`);
                            await this.highlightElement(ordersListModal, { border: '3px solid red' });

                            let ordersListModalTable = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD);
                            await this.highlightElement(ordersListModalTable, { border: '3px solid red' });
                            
                            if (!ordersListModalTable) {
                                logger.log(`Orders modal did not appear for row ${i} with prefix "${itemPrefix}"`);
                                // Close any open dialogs and continue
                                await this.page.keyboard.press('Escape');
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                continue;
                            }

                            // // Wait for modal to fully open and stabilize
                            // await this.waitForNetworkIdle();
                            // await this.waitForTimeout(TIMEOUTS.LONG);

                            // // Step 6: Find and highlight the table with "Заказы склада" (should have testid: ModalShipmentsToIzed-Table-Sclad)
                            // const ordersTable = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD);
                            // await ordersTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
                            // await this.waitAndHighlight(ordersTable);
                            // const ordersTableRows = ordersTable.locator('tbody tr');
                            // const ordersTableRowCount = await ordersTableRows.count();

                            // if (ordersTableRowCount === 0) {
                            //     logger.log(`No orders found in "Заказы склада" table for row ${i} with prefix "${itemPrefix}" - orders already deleted`);
                            //     // Close modal and continue to delete the row
                            //     await this.page.keyboard.press('Escape');
                            //     await this.waitForTimeout(TIMEOUTS.SHORT);
                                
                            //     // Proceed to delete the row itself
                            //     await this.deleteRowFromMainTable(row, itemPrefix, i);
                            //     continue;
                            // }

                            logger.log(`Found ${ordersListModalTable} order(s) in "Заказы склада" table`);

                            // Step 7: Click on the first row in the orders table to open the edit modal
                            const firstOrderRow = ordersListModalTable.locator('tbody tr').first();
                            await this.waitAndHighlight(firstOrderRow);
                            await firstOrderRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await this.waitAndHighlight(firstOrderRow);
                            await firstOrderRow.click();
                            await this.waitForTimeout(TIMEOUTS.LONG);

                            // Step 8: Wait for "Заказ (редактирование)" modal to appear
                            const editOrderModal = this.page.locator(`${SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER}[open]`);
                            await this.highlightElement(editOrderModal, { border: '3px solid red' });
                            await this.waitForTimeout(TIMEOUTS.LONG);
                            // const isEditModalVisible = await editOrderModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => false);

                            // if (!isEditModalVisible) {
                            //     logger.log(`Edit order modal did not appear for row ${i} with prefix "${itemPrefix}"`);
                            //     await this.page.keyboard.press('Escape');
                            //     await this.waitForTimeout(TIMEOUTS.SHORT);
                            //     continue;
                            // }

                            // // Wait for modal to fully open and stabilize
                            // await this.waitForNetworkIdle();
                            // await this.waitForTimeout(TIMEOUTS.LONG);

                            // // Highlight the edit modal with red border
                            // await this.highlightElement(editOrderModal, { border: '3px solid red' });

                            // Step 9: Check if the table with orders exists
                            const stockOrderItemsTable = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_STOCK_ORDER_ITEMS);
                            //const tableExists = await stockOrderItemsTable.isVisible().catch(() => false);
                            await this.waitAndHighlight(stockOrderItemsTable);
                            await this.waitForTimeout(TIMEOUTS.LONG);
                            if (!stockOrderItemsTable) {
                                logger.log(`No "Заказы склада" table found in edit dialog - orders already deleted`);
                                // Close dialogs and continue to delete the row
                                await this.page.keyboard.press('Escape');
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                await this.page.keyboard.press('Escape');
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                
                                // Proceed to delete the row itself
                                await this.deleteRowFromMainTable(row, itemPrefix, i);
                                // Break after deletion to re-search and get fresh rows
                                break;
                            }

                            // Step 10: Click the SelectAll checkbox in the edit modal
                            const selectAllCheckbox = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_SELECT_ALL_CHECKBOX);
                            await selectAllCheckbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await this.waitAndHighlight(selectAllCheckbox);
                            await selectAllCheckbox.click();
                            await this.waitForTimeout(TIMEOUTS.MEDIUM);

                            // Step 11: Wait for Archive button to be enabled and click it
                            const archiveButton = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_BUTTONS_BUTTON_ARCHIVE);
                            await archiveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            
                            // Wait for button to be enabled
                            let isEnabled = await archiveButton.isEnabled();
                            let retries = 0;
                            while (!isEnabled && retries < 10) {
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                isEnabled = await archiveButton.isEnabled();
                                retries++;
                            }

                            if (!isEnabled) {
                                logger.log(`Archive button not enabled for row ${i} with prefix "${itemPrefix}"`);
                                await this.page.keyboard.press('Escape');
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                continue;
                            }

                            await this.waitAndHighlight(archiveButton);
                            await archiveButton.click();
                            await this.waitForTimeout(TIMEOUTS.MEDIUM);

                            // Step 12: Click Yes in the archive confirmation dialog
                            const confirmButton = this.page.locator(SelectorsPartsDataBase.BUTTON_CONFIRM);
                            await confirmButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await this.waitAndHighlight(confirmButton);
                            await confirmButton.click();
                            await this.waitForTimeout(TIMEOUTS.LONG); // Wait for dialogs to close

                            logger.log(`✅ Archived all order(s) for row ${i} with prefix "${itemPrefix}"`);
                            const rowCount = await ordersListModalTable.locator('tbody tr').count();
                            totalArchivedOrders += rowCount;

                            // Step 13: Wait for dialogs to close, then press Escape to close last dialog
                            await this.waitForTimeout(TIMEOUTS.STANDARD);
                            await this.page.keyboard.press('Escape');
                            await this.waitForTimeout(TIMEOUTS.SHORT);

                            // Step 11: Search again to verify all orders are gone
                            await this.searchAndWaitForTable(
                                itemPrefix,
                                SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                                SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                                {
                                    searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
                                },
                            );
                            
                            // Open context menu again to verify orders are gone
                            const secondCellForVerification = row.locator('td').nth(1);
                            await secondCellForVerification.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await secondCellForVerification.click();
                            await this.waitForTimeout(TIMEOUTS.MEDIUM);
                            
                            // Click on 'Заказы' in context menu - scope to the popover
                            const popoverContainerForVerification = this.page.locator('.popover-yui-kit__options').filter({ hasText: 'Заказы' }).first();
                            await popoverContainerForVerification.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
                            const ordersMenuItemForVerification = popoverContainerForVerification.locator(SelectorsPartsDataBase.POPOVER_ITEM0).filter({ hasText: 'Заказы' }).first();
                            await ordersMenuItemForVerification.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await ordersMenuItemForVerification.click();
                            await this.waitForTimeout(TIMEOUTS.MEDIUM);
                            
                            // Wait for orders modal to appear
                            await ordersListModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {
                                logger.log(`Orders modal did not appear for verification`);
                            });
                            
                            // Check if orders table is empty
                            const ordersTableForVerification = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TABLE_SCLAD);
                            const ordersTableRowsForVerification = ordersTableForVerification.locator('tbody tr');
                            const finalOrderCount = await ordersTableRowsForVerification.count();
                            
                            if (finalOrderCount === 0) {
                                logger.log(`✅ Verified: All orders are archived for row ${i} with prefix "${itemPrefix}"`);
                            } else {
                                logger.log(`⚠️ Warning: ${finalOrderCount} order(s) still remain after archiving`);
                            }
                            
                            // Close orders modal
                            await this.page.keyboard.press('Escape');
                            await this.waitForTimeout(TIMEOUTS.SHORT);

                            // Step 14: Now delete the row itself from the main table
                            await this.deleteRowFromMainTable(row, itemPrefix, i);

                            // Step 15: Search again to verify deletion
                            await this.searchAndWaitForTable(
                                itemPrefix,
                                SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                                SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                                {
                                    searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
                                },
                            );

                            const rowsAfterDeletion = this.page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
                            const rowCountAfterDeletion = await rowsAfterDeletion.count();
                            logger.log(`After deletion, found ${rowCountAfterDeletion} row(s) with prefix "${itemPrefix}"`);

                            // Break out of the loop after successful deletion to re-search and get fresh rows
                            break;

                        } catch (error) {
                            logger.log(`⚠️ Could not process orders for row ${i} with prefix "${itemPrefix}": ${error}`);
                            // Close any open dialogs
                            try {
                                await this.page.keyboard.press('Escape');
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                await this.page.keyboard.press('Escape');
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                            } catch (e) {
                                // Ignore errors when closing dialogs
                            }
                            
                            // Still try to delete the row from main table even if order processing failed
                            try {
                                await this.deleteRowFromMainTable(row, itemPrefix, i);
                                // Break after deletion attempt to re-search and get fresh rows
                                break;
                            } catch (deleteError) {
                                logger.log(`⚠️ Could not delete row ${i} from main table: ${deleteError}`);
                                // Break even if deletion failed, as table state may have changed
                                break;
                            }
                        }
                    }
                } catch (error) {
                    logger.log(`⚠️ Could not process orders for item prefix "${itemPrefix}": ${error}`);
                    // Continue with next prefix
                }
            }

            logger.log(`✅ Completed archiving ${totalArchivedOrders} order(s) for test items`);
        });
        
        return totalArchivedOrders;
    }

    /**
     * Deletes a row from the main table by clicking checkbox and archive button
     * @param row The row locator to delete
     * @param itemPrefix The item prefix for logging
     * @param rowIndex The row index for logging
     */
    private async deleteRowFromMainTable(row: any, itemPrefix: string, rowIndex: number): Promise<void> {
        await allure.step(`Delete row ${rowIndex} from main table for prefix "${itemPrefix}"`, async () => {
            try {
                // Step 17: Click the checkbox in the first cell of the row
                const rowCheckbox = row.locator(SelectorsAssemblyWarehouse.DEFICIT_CBED_TABLE_DATA_CHECKBOX).first();
                await rowCheckbox.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                await this.waitAndHighlight(rowCheckbox);
                await rowCheckbox.click();
                await this.waitForTimeout(TIMEOUTS.MEDIUM);

                // Step 18: Wait for Archive button to be enabled and click it
                const archiveButton = this.page.locator(SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_BUTTON_ARCHIVE_ASSEMBLY);
                await archiveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                
                // Wait for button to be enabled
                let isEnabled = await archiveButton.isEnabled();
                let retries = 0;
                while (!isEnabled && retries < 10) {
                    await this.waitForTimeout(TIMEOUTS.SHORT);
                    isEnabled = await archiveButton.isEnabled();
                    retries++;
                }

                if (!isEnabled) {
                    logger.log(`Archive button not enabled for row ${rowIndex} with prefix "${itemPrefix}"`);
                    return;
                }

                await this.waitAndHighlight(archiveButton);
                await archiveButton.click();
                await this.waitForTimeout(TIMEOUTS.MEDIUM);

                // Step 19: Click Yes in the archive confirmation dialog
                const confirmButton = this.page.locator(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_BAN_MODAL_YES_BUTTON);
                await confirmButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                await this.waitAndHighlight(confirmButton);
                await confirmButton.click();
                await this.waitForTimeout(TIMEOUTS.LONG);

                logger.log(`✅ Deleted row ${rowIndex} from main table for prefix "${itemPrefix}"`);
            } catch (error) {
                logger.log(`⚠️ Could not delete row ${rowIndex} from main table: ${error}`);
            }
        });
    }
}
