import { Page, Locator, expect } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";
import { title } from "process";
import { toNamespacedPath } from "path";
import testData from '../testdata/PU18-Names.json'; // Import your test data

export type Item = {
    id: string;
    partNumber: string;
    name: string;
    dataTestId: string;
    material: string;
    quantity: number;
};

// Страница: Сборка
export class CreatePartsDatabasePage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }
    static groups = {
        СБ: [] as Item[],
        Д: [] as Item[],
        ПД: [] as Item[],
        РМ: [] as Item[],
        ALL: new Map<string, Item>(),
    };
    /**
     * Process table data to group items by their types (СБ, Д, ПД, РМ) and create an ALL group.
     * @param table - The Playwright Locator for the table element.
     * @returns An object with grouped items and the ALL group.
     */
    async processTableData(table: Locator): Promise<void> {
        // Debug logging
        logger.info('Table HTML:', await table.evaluate(el => el.outerHTML));
        logger.info('Table exists:', await table.count() > 0);
        logger.info('Table selector:', await table.evaluate(el => el.tagName));

        const rowsLocator = table.locator('tbody tr');
        logger.info('Rows count:', await rowsLocator.count());
        logger.info('Rows selector:', 'tbody tr');

        // Access the global groups object
        const groups = CreatePartsDatabasePage.groups;

        // Helper function to add to ALL group using concatenated `partNumber` and `name` as the unique key
        const addToAll = (item: Item) => {
            const uniqueKey = `${item.partNumber} ${item.name}`.trim();
            const existingItem = groups.ALL.get(uniqueKey);

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                groups.ALL.set(uniqueKey, item);
            }
            logger.info(`ALL group updated: Current size = ${groups.ALL.size}`);
        };

        // Initialize the first group as 'СБ' by default (header in <thead>)
        let currentGroup: keyof typeof groups = 'СБ';
        logger.info(`Initialized currentGroup: ${currentGroup}`);

        // Process all rows
        const rowCount = await rowsLocator.count();
        for (let i = 0; i < rowCount; i++) {
            const row = rowsLocator.nth(i);

            // Check if the row is a header
            const isHeader = !(await row.getAttribute('class'))?.includes('td-row');
            if (isHeader) {
                const groupTestId = await row.locator('[data-testid]').getAttribute('data-testid');
                logger.info(`Header row ${i}: groupTestId = ${groupTestId}`);

                if (groupTestId === 'TableSpecification-Header-AssemblyUnits') {
                    currentGroup = 'СБ';
                } else if (groupTestId === 'TableSpecification-Header-Details') {
                    currentGroup = 'Д';
                } else if (groupTestId === 'TableSpecification-Header-StandardDetails') {
                    currentGroup = 'ПД';
                } else if (groupTestId === 'TableSpecification-Header-ConsumableMaterials') {
                    currentGroup = 'РМ';
                } else {
                    logger.warn(`Unknown header groupTestId: ${groupTestId}`);
                    currentGroup = 'СБ'; // Default fallback
                }

                logger.info(`currentGroup set to: ${currentGroup}`);
                continue;
            }

            // Process data rows
            const isDataRow = (await row.getAttribute('class'))?.includes('td-row');
            if (isDataRow && currentGroup) {
                const rowTestId = (await row.getAttribute('data-testid')) ?? ""; // Ensure rowTestId is a string
                const id = await row.locator('td:nth-child(1)').textContent() ?? '';
                const partNumber = await row.locator('td:nth-child(2)').textContent() ?? '';
                const name = await row.locator('td:nth-child(3)').textContent() ?? '';
                const quantity = parseInt(await row.locator('td:nth-child(5)').textContent() ?? '0', 10);

                logger.info(`Item details: id=${id}, partNumber=${partNumber}, name=${name}, quantity=${quantity}, data-testid=${rowTestId}`);

                if (id && name && quantity) {
                    const item: Item = {
                        id: id.trim(),
                        partNumber: partNumber.trim(),
                        name: name.trim(),
                        dataTestId: rowTestId,
                        material: '',
                        quantity
                    };

                    // Add item to the current group
                    groups[currentGroup].push(item);
                    logger.info(`Added item to group ${currentGroup}: ${JSON.stringify(item)}`);

                    // Add to ALL for groups Д, ПД, and РМ
                    if (currentGroup === 'Д' || currentGroup === 'ПД' || currentGroup === 'РМ') {
                        addToAll(item);
                    }
                } else {
                    logger.warn(`Skipped row ${i}: Missing required data (id, name, or quantity)`);
                }
            } else if (!isDataRow) {
                logger.warn(`Skipped row ${i}: Not a data row`);
            }
        }

        logger.info(`Final groups: СБ=${groups.СБ.length}, Д=${groups.Д.length}, ПД=${groups.ПД.length}, РМ=${groups.РМ.length}, ALL size=${groups.ALL.size}`);
    }




    async processProduct(row: Locator, shortagePage: any, page: any): Promise<void> {
        // Highlight and click the product row
        await row.evaluate((element) => {
            element.style.border = "3px solid red"; // Highlight
            element.style.backgroundColor = "yellow";
        });
        await row.click();

        // Open the product editor
        await this.findAndClickElement(page, 'BaseDetals-Button-EditProduct', 500);

        // Process the main table for the product
        const table = page.locator('[data-testid="TableSpecification-Root"]');

        // Use the global groups object from the class
        await this.processTableDataAndHandleModals(table, shortagePage, page);

        // Log the global groups for debugging purposes
        logger.info("Processed Groups:");
        logger.info(CreatePartsDatabasePage.groups);

        return;
    }



    async processTableDataAndHandleModals(
        table: Locator,
        shortagePage: any,
        page: any
    ): Promise<void> {
        // Directly update the global groups object
        await this.processTableData(table); // Updates CreatePartsDatabasePage.groups

        // Handle rows in each group using the global groups object directly
        //await this.processGroupRows('Д', page);
        //await this.processGroupRows('ПД', page);
        //await this.processGroupRows('РМ', page);
        await this.processSBGroupRows(page, shortagePage);

        // No need to return groups as they are now globally accessible
        return;
    }


    async processGroupRows(groupType: string, page: any): Promise<void> {
        console.log("Entry");
        // Access the group rows directly from the global groups object
        const rows = CreatePartsDatabasePage.groups[groupType as keyof typeof CreatePartsDatabasePage.groups] as Item[];

        for (const item of rows) {

            console.log(`Processing ${groupType} item:`, item);

            // Locate and click the row to open the modal
            const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`).last(); // Adjust selector as necessary
            await rowLocator.waitFor({ state: 'attached', timeout: 30000 });
            await rowLocator.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            await rowLocator.click();

            // Validate modal content based on groupType
            switch (groupType) {
                case 'Д':
                    // Process 'Д' group logic
                    await this.validateModalForD(item, page);
                    break;

                case 'ПД':
                    // Process 'ПД' group logic
                    await this.validateModalForPD(item, page);
                    await page.waitForTimeout(1000);
                    console.log("DDDD")
                    break;

                case 'РМ':
                    // Process 'РМ' group logic
                    await this.validateModalForRM(item, page);
                    break;

                default:
                    logger.error("No matching case for groupType:", groupType);
                    break;
            }

            // Close the modal
            await page.mouse.click(1, 1);
        }
    }
    async validateModalForD(item: Item, page: any): Promise<void> {
        const modal = page.locator('div[data-testid="ModalDetal-destroyModalRight"]').last();
        await modal.waitFor({ state: 'attached', timeout: 30000 });

        const titleElement = await page.locator('[data-testid="ModalDetail-h3-BriefDetailInformation"]').last();
        await titleElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const titleText = await titleElement.textContent();
        if (titleText?.trim() !== testData.titles.Д.label) {
            logger.error("Incorrect modal title for Type Д");
            expect(titleText?.trim()).toBe(testData.titles.Д.label);
        }

        const nameElement = await page.locator('[data-testid="ModalDetail-span-Name"]').last();
        await nameElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const nameText = await nameElement.textContent();
        if (nameText?.trim() !== item.name) {
            logger.error("Incorrect Product Name for Type Д");
            expect(nameText?.trim()).toBe(item.name);
        }

        const partNumberElement = await page.locator('[data-testid="ModalDetail-span-Designation"]').last();
        await partNumberElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const partNumberText = await partNumberElement.textContent();
        if (partNumberText?.trim() !== item.partNumber) {
            logger.error("Incorrect Product Designation for Type Д");
            expect(partNumberText?.trim()).toBe(item.partNumber);
        }

        const materialElement = await page.locator('[data-testid="ModalDetail-span-Material"]').last();
        await materialElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const materialText = await materialElement.textContent();
        if (!materialText) {
            logger.error("Material not found for Type Д");
        } else {
            item.material = materialText.trim();
        }
    }
    async validateModalForPD(item: Item, page: any): Promise<void> {

        const modal = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]').last();
        await modal.waitFor({ state: 'attached', timeout: 30000 });
        await page.waitForTimeout(1000);
        const titleElement = await page.locator('[data-testid="ModalMaterialInformation-Title"]').last();
        await titleElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        await page.waitForTimeout(1000);
        const titleText = await titleElement.textContent();
        if (titleText?.trim() !== testData.titles.ПД.label) {
            logger.error("Incorrect modal title for Type ПД");
            expect(titleText?.trim()).toBe(testData.titles.ПД.label);
        }
        await page.waitForTimeout(1000);
        const nameElement = await page.locator('[data-testid="ModalMaterialInformation-NameValue"]').last();
        await nameElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const nameText = await nameElement.textContent();

        if (nameText?.trim() !== item.name) {
            logger.error("Incorrect Product Name for Type ПД");
            expect(nameText?.trim()).toBe(item.name);
        } else {
            item.material = nameText.trim();
        }
    }
    async validateModalForRM(item: Item, page: any): Promise<void> {
        const modal = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]').last();
        await modal.waitFor({ state: 'attached', timeout: 30000 });

        const titleElement = await page.locator('[data-testid="ModalMaterialInformation-Title"]').last();
        await titleElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const titleText = await titleElement.textContent();
        if (titleText?.trim() !== testData.titles.РМ.label) {
            logger.error("Incorrect modal title for Type РМ");
            expect(titleText?.trim()).toBe(testData.titles.РМ.label);
        }

        const nameElement = await page.locator('[data-testid="ModalMaterialInformation-NameValue"]').last();
        await nameElement.evaluate((element: HTMLElement) => {
            element.style.border = "3px solid red";
            element.style.backgroundColor = "yellow";
        });
        const nameText = await nameElement.textContent();
        if (nameText?.trim() !== item.name) {
            logger.error("Incorrect Product Name for Type РМ");
            expect(nameText?.trim()).toBe(item.name);
        } else {
            item.material = nameText.trim();
        }
    }


    async processSBGroupRows(page: any, shortagePage: any): Promise<void> {
        // Access the СБ group directly from the global groups object
        const rows = CreatePartsDatabasePage.groups.СБ;

        for (const item of rows) {
            logger.info(`Processing СБ item:`, item);

            // Locate and click the row to open the modal
            const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`); // Adjust selector as necessary
            await rowLocator.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            await rowLocator.click();

            // Wait for modal and locate its table
            const modal = page.locator('div[data-testid="ModalCbed-destroyModalRight"]').last();
            await modal.waitFor();
            const tableInModal = modal.locator('[data-testid="TableSpecification-Table"]');

            // Validate modal content
            const titleElement = await page.locator('[data-testid="ModalCbed-Title"]').last();
            await titleElement.waitFor({ state: 'attached', timeout: 30000 });
            await titleElement.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            const titleText = await titleElement.textContent();
            if (titleText?.trim() !== testData.titles.СБ.label) {
                logger.error("Incorrect modal title for Type СБ");
                expect(titleText?.trim()).toBe(testData.titles.СБ.label);
            }

            // Validate name
            const nameElement = await page.locator('[data-testid="ModalCbed-Text-Name"]').last();
            await nameElement.waitFor({ state: 'attached', timeout: 30000 });
            await nameElement.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            const nameText = await nameElement.textContent();
            if (nameText?.trim() !== item.name) {
                logger.error("Incorrect Product Name for Type СБ");
                expect(nameText?.trim()).toBe(item.name);
            }

            // Validate part number
            const partNumberElement = await page.locator('[data-testid="ModalCbed-Text-Designation"]').last();
            await partNumberElement.waitFor({ state: 'attached', timeout: 30000 });
            await partNumberElement.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            const partNumberText = await partNumberElement.textContent();
            if (partNumberText?.trim() !== item.partNumber) {
                logger.error("Incorrect Part Number for Type СБ");
                expect(partNumberText?.trim()).toBe(item.partNumber);
            }

            // Process the modal's table recursively
            await this.processTableDataAndHandleModals(tableInModal, shortagePage, page);

            // Close the modal
            await page.mouse.click(1, 1);
        }
    }
    /**
     * Print the groups object in a clean table format.
     */
    static printGroups(): void {
        const groups = CreatePartsDatabasePage.groups;

        // Function to format a group as a table
        const formatGroup = (group: Item[]) => {
            if (group.length === 0) {
                return "No items found.";
            }
            return group.map((item) => {
                return `| ${item.id.padEnd(10)} | ${item.partNumber.padEnd(15)} | ${item.name.padEnd(20)} | ${item.quantity.toString().padEnd(8)} | ${item.material.padEnd(15)} |`;
            }).join('\n');
        };

        // Helper to format the ALL group (Map structure)
        const formatAllGroup = (allGroup: Map<string, Item>) => {
            if (allGroup.size === 0) {
                return "No items found.";
            }
            return Array.from(allGroup.entries()).map(([key, item]) => {
                return `| ${key.padEnd(25)} | ${item.partNumber.padEnd(15)} | ${item.name.padEnd(20)} | ${item.quantity.toString().padEnd(8)} | ${item.material.padEnd(15)} |`;
            }).join('\n');
        };

        console.log("\n===== Global Groups =====");

        // Print each group
        console.log("\nСБ Group:");
        console.log("| ID        | Part Number     | Name                | Quantity | Material        |");
        console.log("|-----------|-----------------|---------------------|----------|-----------------|");
        console.log(formatGroup(groups.СБ));

        console.log("\nД Group:");
        console.log("| ID        | Part Number     | Name                | Quantity | Material        |");
        console.log("|-----------|-----------------|---------------------|----------|-----------------|");
        console.log(formatGroup(groups.Д));

        console.log("\nПД Group:");
        console.log("| ID        | Part Number     | Name                | Quantity | Material        |");
        console.log("|-----------|-----------------|---------------------|----------|-----------------|");
        console.log(formatGroup(groups.ПД));

        console.log("\nРМ Group:");
        console.log("| ID        | Part Number     | Name                | Quantity | Material        |");
        console.log("|-----------|-----------------|---------------------|----------|-----------------|");
        console.log(formatGroup(groups.РМ));

        console.log("\nALL Group:");
        console.log("| Unique Key                | Part Number     | Name                | Quantity | Material        |");
        console.log("|---------------------------|-----------------|---------------------|----------|-----------------|");
        console.log(formatAllGroup(groups.ALL));

        console.log("\n=========================");
    }



}