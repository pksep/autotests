import { Page, TestInfo } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";
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
     * Searches for items by prefix, opens orders modal, and archives all orders found.
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
                    // Search for items with this prefix
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
                        console.log(`No items found with prefix "${itemPrefix}" - skipping order cleanup`);
                        continue;
                    }

                    // For each row, check for orders and archive them
                    for (let i = 0; i < rowCount; i++) {
                        try {
                            const row = rows.nth(i);
                            await row.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            const rowText = await row.textContent();
                            
                            // Verify this row matches the prefix
                            if (!rowText || !rowText.toLowerCase().includes(itemPrefix.toLowerCase())) {
                                continue;
                            }

                            // Find popover within this row (scoped to the row)
                            const popoverInRow = row.locator(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_HEAD_POPOVER);
                            const popoverVisible = await popoverInRow.isVisible().catch(() => false);
                            
                            if (!popoverVisible) {
                                console.log(`No popover found for row ${i} with prefix "${itemPrefix}"`);
                                continue;
                            }

                            // Click the popover in this row
                            await popoverInRow.click();
                            await this.waitForTimeout(TIMEOUTS.SHORT);

                            // Click on 'Заказы' in context menu
                            const ordersMenuItem = this.page.locator(SelectorsPartsDataBase.POPOVER_ITEM0).first();
                            await ordersMenuItem.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                            await ordersMenuItem.click();
                            await this.waitForTimeout(TIMEOUTS.SHORT);

                            // Wait for orders modal to appear
                            const ordersModal = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_RIGHT_MENU_MODAL);
                            await ordersModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {
                                console.log(`Orders modal did not appear for row ${i} with prefix "${itemPrefix}"`);
                            });

                            // Get all order numbers from the modal
                            const orderNumberCells = this.page.locator(SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER);
                            const orderCount = await orderNumberCells.count();

                            if (orderCount === 0) {
                                console.log(`No orders found for row ${i} with prefix "${itemPrefix}"`);
                                // Close modal and continue
                                await this.page.click('body', { position: { x: 1, y: 1 } });
                                await this.waitForTimeout(TIMEOUTS.SHORT);
                                continue;
                            }

                            // Archive all orders found
                            const orderNumbers: string[] = [];
                            for (let j = 0; j < orderCount; j++) {
                                const orderText = await orderNumberCells.nth(j).textContent();
                                if (orderText) {
                                    // Extract order number (format: "26-7656" or "№26-7656")
                                    const orderMatch = orderText.match(/(\d+-\d+)/);
                                    if (orderMatch) {
                                        orderNumbers.push(orderMatch[1]);
                                    }
                                }
                            }

                            console.log(`Found ${orderNumbers.length} order(s) for row ${i} with prefix "${itemPrefix}": ${orderNumbers.join(', ')}`);

                            // Archive each order
                            for (const orderNum of orderNumbers) {
                                try {
                                    // Click on order to open edit dialog
                                    await this.clickOrderToOpenEditDialog(
                                        SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_TBODY_SCLAD_NUMBER,
                                        orderNum,
                                        `Could not find order ${orderNum} in the orders list`,
                                    );

                                    // Archive the order
                                    await this.selectCheckboxAndArchiveOrder(
                                        orderNum,
                                        SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_CHECKBOX_PREFIX,
                                        SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_TABLE_DATA_NUMBER_PREFIX,
                                        SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER_BUTTONS_BUTTON_ARCHIVE,
                                        SelectorsPartsDataBase.BUTTON_CONFIRM,
                                        SelectorsOrderedFromSuppliers.MODAL_SHIPMENTS_TO_IZED_MODAL_WORKER,
                                        `Could not find checkbox for order ${orderNum}`,
                                    );

                                    console.log(`✅ Archived order ${orderNum} for item with prefix "${itemPrefix}"`);
                                    totalArchivedOrders++;

                                    // Close dialogs and refresh
                                    await this.page.click('body', { position: { x: 1, y: 1 } });
                                    await this.waitForTimeout(TIMEOUTS.STANDARD);
                                    await this.page.reload();
                                    await this.waitForNetworkIdle();

                                    // Re-search for item prefix
                                    await this.searchAndWaitForTable(
                                        itemPrefix,
                                        SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                                        SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE,
                                        {
                                            searchInputDataTestId: SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_SEARCH_INPUT,
                                        },
                                    );

                                    // Re-open orders modal for the same row
                                    const rowsAfterRefresh = this.page.locator(`${SelectorsAssemblyWarehouse.ZAKAZ_SCLAD_TABLE_ASSEMBLY_WARHOUSE} tbody tr`);
                                    const rowAfterRefresh = rowsAfterRefresh.nth(i);
                                    await rowAfterRefresh.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                                    
                                    const popoverAfterRefresh = rowAfterRefresh.locator(SelectorsAssemblyWarehouse.ASSEMBLY_SCLAD_TABLE_HEAD_POPOVER);
                                    await popoverAfterRefresh.click();
                                    await this.waitForTimeout(TIMEOUTS.SHORT);
                                    
                                    const ordersMenuItemAfterRefresh = this.page.locator(SelectorsPartsDataBase.POPOVER_ITEM0).first();
                                    await ordersMenuItemAfterRefresh.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
                                    await ordersMenuItemAfterRefresh.click();
                                    await this.waitForTimeout(TIMEOUTS.SHORT);
                                    
                                    await ordersModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
                                } catch (error) {
                                    console.log(`⚠️ Could not archive order ${orderNum} for item with prefix "${itemPrefix}": ${error}`);
                                    // Close dialogs and continue
                                    await this.page.click('body', { position: { x: 1, y: 1 } });
                                    await this.waitForTimeout(TIMEOUTS.SHORT);
                                }
                            }

                            // Close modal after processing all orders for this row
                            await this.page.click('body', { position: { x: 1, y: 1 } });
                            await this.waitForTimeout(TIMEOUTS.SHORT);
                        } catch (error) {
                            console.log(`⚠️ Could not process orders for row ${i} with prefix "${itemPrefix}": ${error}`);
                            // Close any open dialogs
                            await this.page.click('body', { position: { x: 1, y: 1 } });
                            await this.waitForTimeout(TIMEOUTS.SHORT);
                        }
                    }
                } catch (error) {
                    console.log(`⚠️ Could not process orders for item prefix "${itemPrefix}": ${error}`);
                    // Continue with next prefix
                }
            }

            console.log(`✅ Completed archiving ${totalArchivedOrders} order(s) for test items`);
        });
        
        return totalArchivedOrders;
    }
}
