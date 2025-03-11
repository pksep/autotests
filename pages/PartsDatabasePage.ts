import { Page, Locator, expect } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";
import { title } from "process";
import { toNamespacedPath } from "path";
import testData from '../testdata/PU18-Names.json'; // Import your test data

export type Item = {
    id: string;
    parentPartNumber: string;
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
    // this item will store everything that we parse for later processing and validations
    static globalTableData = {
        СБ: [] as Item[],   // Сборочные единицы
        Д: [] as Item[],    // Детали
        ПМ: [] as Item[],   // Покупные материалы
        МД: [] as Item[],   // Материалы для деталей
        РМ: [] as Item[],   // Расходные материалы
        ПД: [] as Item[],   // Расходные материалы        
        ALL: new Map<string, Item>() // Consolidated details
    };
    /**
     * Process table data to group items by their types (СБ, Д, ПД, РМ) and create an ALL group.
     * @param table - The Playwright Locator for the table element.
     * @returns An object with grouped items and the ALL group.
     */
    async processTableData(table: Locator, title: string, parentQuantity: number): Promise<{
        СБ: Item[],
        Д: Item[],
        ПД: Item[],
        РМ: Item[],
        ALL: Map<string, Item>
    }> {
        // Debug logging
        logger.info('Table HTML:', await table.evaluate(el => el.outerHTML));
        logger.info('Table exists:', await table.count() > 0);
        logger.info('Table selector:', await table.evaluate(el => el.tagName));

        const rowsLocator = table.locator('tbody tr');
        logger.info('Rows count:', await rowsLocator.count());
        logger.info('Rows selector:', 'tbody tr');

        // Create groups for storing items
        const groups: {
            СБ: Item[],
            Д: Item[],
            ПД: Item[],
            РМ: Item[],
            ALL: Map<string, Item>
        } = {
            СБ: [],
            Д: [],
            ПД: [],
            РМ: [],
            ALL: new Map()
        };

        // Helper function to add to ALL group using concatenated `partNumber` and `name` as the unique key
        const addToAll = (item: Item) => {
            const uniqueKey = `${item.partNumber} ${item.partNumber} ${item.name}`.trim();
            const existingItem = groups.ALL.get(uniqueKey);

            // Update the groups.ALL map
            if (existingItem) {
                existingItem.quantity;
            } else {
                groups.ALL.set(uniqueKey, item);
            }
            logger.info(`ALL group updated: Current size = ${groups.ALL.size}`);

            // Also update the global ALL map
            const globalExistingItem = CreatePartsDatabasePage.globalTableData.ALL.get(uniqueKey);
            if (globalExistingItem) {
                globalExistingItem.quantity;
            } else {
                CreatePartsDatabasePage.globalTableData.ALL.set(uniqueKey, item);
            }
            logger.info(`Global ALL group updated: Current size = ${CreatePartsDatabasePage.globalTableData.ALL.size}`);
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
                let quantity = parseInt(await row.locator('td:nth-child(5)').textContent() ?? '0', 10);

                logger.info(`Item details: id=${id}, partNumber=${partNumber}, name=${name}, quantity=${quantity}, data-testid=${rowTestId}`);

                if (id && name && quantity) {
                    const item: Item = {
                        id: id.trim(),
                        parentPartNumber: title,
                        partNumber: partNumber.trim(),
                        name: name.trim(),
                        dataTestId: rowTestId,
                        material: '',
                        quantity

                    };

                    // Add item to the current group
                    groups[currentGroup].push(item);
                    if (Array.isArray(CreatePartsDatabasePage.globalTableData[currentGroup as keyof typeof CreatePartsDatabasePage.globalTableData])) {
                        (CreatePartsDatabasePage.globalTableData[currentGroup as keyof typeof CreatePartsDatabasePage.globalTableData] as Item[]).push(item);
                    }

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
        return groups;
    }



    async processProduct(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
        // Highlight and click the product row
        await row.evaluate((element) => {
            element.style.border = "3px solid red"; // Highlight
            element.style.backgroundColor = "yellow";
        });
        await row.click(); //opened the product page

        // Open the product editor
        await shortagePage.findAndClickElement(page, 'BaseDetals-Button-EditProduct', 500); //clicked the edit button
        let parentQuantity = 1;
        // Process the main table for the product
        const table = page.locator('[data-testid="TableSpecification-Root"]');


        const groups: {
            СБ: Item[],
            Д: Item[],
            ПД: Item[],
            РМ: Item[],
            ALL: Map<string, Item>
        } = await this.processTableDataAndHandleModals(table, shortagePage, page, title, parentQuantity);

        logger.info("Processed Groups:");
        logger.info(groups);
        return
    }
    printGlobalTableData(): void {
        logger.info("Global Table Data Overview:");

        // Iterate through each group in the globalTableData
        Object.keys(CreatePartsDatabasePage.globalTableData).forEach((key) => {
            // Handle ALL group separately since it's a Map
            if (key === 'ALL') {
                const totalCount = CreatePartsDatabasePage.globalTableData.ALL.size; // Count items in ALL (Map)
                logger.info(`\nALL (Consolidated Items: ${totalCount}):`);
                console.table(Array.from(CreatePartsDatabasePage.globalTableData.ALL.values()));
            } else {
                const groupItems = CreatePartsDatabasePage.globalTableData[key as keyof typeof CreatePartsDatabasePage.globalTableData];
                const totalCount = Array.isArray(groupItems) ? groupItems.length : 0; // Safely count items in the group
                logger.info(`\n${key} (Items in this Group: ${totalCount}):`);
                console.table(groupItems);
            }
        });

        logger.info("\nEnd of Global Table Data.");
    }



    async processTableDataAndHandleModals(
        table: Locator,
        shortagePage: any,
        page: any,
        title: string,
        parentQuantity: number
    ): Promise<{
        СБ: Item[],
        Д: Item[],
        ПД: Item[],
        РМ: Item[],
        ALL: Map<string, Item>
    }> {

        const groups = await this.processTableData(table, title, parentQuantity); // Process the main table

        // Handle rows in each group
        await this.processGroupRows(groups.Д, 'Д', page, parentQuantity);
        await this.processGroupRows(groups.ПД, 'ПД', page, parentQuantity);
        await this.processGroupRows(groups.РМ, 'РМ', page, parentQuantity);
        await this.processSBGroupRows(groups.СБ, page, shortagePage, parentQuantity);

        return groups; // Return all processed data
    }

    async processGroupRows(rows: Item[], groupType: string, page: any, parentQuantity: number): Promise<void> {

        for (const item of rows) {
            logger.info(`Processing ${groupType} item:`, item);

            // Locate and click the row to open the modal
            const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`).last(); // Adjust selector as necessary
            await rowLocator.waitFor({ state: 'attached', timeout: 30000 });
            await rowLocator.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            await rowLocator.click();
            expect(item.quantity).toBeGreaterThan(0);
            // Validate modal content

            switch (groupType) {
                case 'Д':
                    const modal = page.locator('div[data-testid="ModalDetal-destroyModalRight"]').last();
                    await modal.waitFor({ state: 'attached', timeout: 30000 });


                    // Code block for case value1
                    let el = await page.locator('[data-testid="ModalDetail-h3-BriefDetailInformation"]').last();
                    await el.waitFor({ state: 'attached', timeout: 30000 });
                    await el.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);

                    let elementValue = await page
                        .locator('[data-testid="ModalDetail-h3-BriefDetailInformation"]')
                        .last()
                        .textContent();

                    if (elementValue.trim() != testData.titles.Д.label) {
                        logger.error("Incorrect modal title for Type Д");
                        expect(elementValue.trim()).toBe(testData.titles.Д.label);
                    }
                    el = '';
                    elementValue = '';

                    el = await page.locator('[data-testid="ModalDetail-span-Name"]').last();
                    await el.waitFor({ state: 'attached', timeout: 30000 });
                    await el.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    elementValue = await page
                        .locator('[data-testid="ModalDetail-span-Name"]')
                        .last()
                        .textContent();
                    if (elementValue != item.name) {
                        logger.error("Incorrect Product Name for Type Д");
                        expect(elementValue.trim()).toBe(item.name);
                    }
                    el = '';
                    elementValue = '';
                    el = await page.locator('[data-testid="ModalDetail-span-Designation"]').last();
                    await el.waitFor({ state: 'attached', timeout: 30000 });
                    await el.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    elementValue = await page
                        .locator('[data-testid="ModalDetail-span-Designation"]')
                        .last()
                        .textContent();
                    if (elementValue != item.partNumber) {
                        logger.error("Incorrect Product Designation for Type Д");
                        expect(elementValue.trim()).toBe(item.partNumber);
                    }
                    el = '';
                    elementValue = '';
                    el = await page.locator('[data-testid="ModalDetail-span-Material"]').last();
                    await el.waitFor({ state: 'attached', timeout: 30000 });
                    await el.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    elementValue = await page
                        .locator('[data-testid="ModalDetail-span-Material"]')
                        .last()
                        .textContent();
                    if (!elementValue) {
                        logger.error("Incorrect Product Meterial not found for Type Д");
                    } else {
                        item.material = elementValue;
                    }
                    item.quantity *= parentQuantity;
                    break; // Exit the switch statement
                case 'ПД':
                    const modal2 = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]').last(); // Adjust selector for modal
                    await modal2.waitFor({ state: 'attached', timeout: 30000 });
                    // Code block for case value1
                    let el2 = await page.locator('[data-testid="ModalMaterialInformation-Title"]').last();
                    await el2.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    let elementValue2 = await page
                        .locator('[data-testid="ModalMaterialInformation-Title"]')
                        .last()
                        .textContent();
                    if (elementValue2.trim() != testData.titles.ПД.label) {
                        logger.error("Incorrect modal title for Type ПД");
                        expect(elementValue2.trim()).toBe(testData.titles.ПД.label);
                    }
                    el2 = '';
                    elementValue2 = '';
                    el2 = await page.locator('[data-testid="ModalMaterialInformation-NameValue"]').last();
                    await el2.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    elementValue2 = await page
                        .locator('[data-testid="ModalMaterialInformation-NameValue"]')
                        .last()
                        .textContent();
                    if (elementValue2 != item.name) {
                        logger.error("Incorrect Product Name for Type ПД");
                        expect(elementValue2.trim()).toBe(item.name);
                    } else {
                        item.material = elementValue2;
                    }
                    item.quantity *= parentQuantity;
                    break; // Exit the switch statement
                case 'РМ':
                    const modal3 = page.locator('div[data-testid="ModalMaterialInformation-RightContent"]').last(); // Adjust selector for modal
                    await modal3.waitFor({ state: 'attached', timeout: 30000 });
                    // Code block for case value1
                    let el3 = await page.locator('[data-testid="ModalMaterialInformation-Title"]').last();
                    await el3.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    let elementValue3 = await page
                        .locator('[data-testid="ModalMaterialInformation-Title"]')
                        .last()
                        .textContent();
                    if (elementValue3.trim() != testData.titles.РМ.label) {
                        logger.error("Incorrect modal title for Type РМ");
                        expect(elementValue3.trim()).toBe(testData.titles.ПД.label);
                    }
                    el3 = '';
                    elementValue3 = '';
                    el3 = await page.locator('[data-testid="ModalMaterialInformation-NameValue"]').last();
                    await el3.evaluate((element: HTMLElement) => {
                        element.style.border = "3px solid red"; // Highlight
                        element.style.backgroundColor = "yellow";
                    });
                    await page.waitForTimeout(1000);
                    elementValue3 = await page
                        .locator('[data-testid="ModalMaterialInformation-NameValue"]')
                        .last()
                        .textContent();
                    if (elementValue3 != item.name) {
                        logger.error("Incorrect Product Name for Type РМ");
                        expect(elementValue3.trim()).toBe(item.name);
                    } else {
                        item.material = elementValue3;
                    }
                    item.quantity *= parentQuantity;
                    break; // Exit the switch statementeak;

                default:
                    // Code block if no case matches
                    logger.error("No matching case");
                    break;
            }
            //const modalDetails = await modal.textContent();
            //logger.info(`Modal details for ${groupType} item:`, modalDetails);

            // Close the modal
            await page.mouse.click(1, 1);
        }
    }

    async processSBGroupRows(
        rows: Item[],
        page: any,
        shortagePage: any,
        parentQuantity: number
    ): Promise<void> {
        for (const item of rows) {
            logger.info(`Processing СБ item:`, item);
            //item.quantity *= parentQuantity;
            const rowLocator = page.locator(`[data-testid="${item.dataTestId}"]`).last();
            await rowLocator.waitFor();
            await rowLocator.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            await rowLocator.click();

            // Wait for modal and locate its table
            const modal = page.locator('div[data-testid="ModalCbed-destroyModalRight"]').last();
            await modal.waitFor();

            // Extract the title of the СБ
            const sbTitleElement = modal.locator('[data-testid="ModalCbed-Text-Designation"]').last();
            await sbTitleElement.waitFor({ state: 'attached', timeout: 30000 });
            await sbTitleElement.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            const title = (await sbTitleElement.textContent())?.trim();
            logger.info(`Extracted СБ Title: ${title}`);

            const tableInModal = modal.locator('[data-testid="TableSpecification-Table"]');
            let ele = await page.locator('[data-testid="ModalCbed-Title"]').last();
            await ele.waitFor({ state: 'attached', timeout: 30000 });
            await ele.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            ele = await page
                .locator('[data-testid="ModalCbed-Title"]')
                .last()
                .textContent();
            if (ele.trim() != testData.titles.СБ.label) {
                logger.error("Incorrect modal title for Type СБ");
                expect(ele.trim()).toBe(testData.titles.СБ.label);
            }
            await page.waitForTimeout(1000);
            let elem = await page.locator('[data-testid="ModalCbed-Text-Name"]').last();
            await elem.waitFor({ state: 'attached', timeout: 30000 });
            await elem.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            elem = await page
                .locator('[data-testid="ModalCbed-Text-Name"]')
                .last()
                .textContent();
            if (elem != item.name) {
                logger.error("Incorrect Product Name for Type СБ");
                expect(elem.trim()).toBe(item.name);
            }

            await page.waitForTimeout(1000);
            let eleme = await page.locator('[data-testid="ModalCbed-Text-Designation"]').last();
            await eleme.waitFor({ state: 'attached', timeout: 30000 });
            await eleme.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });
            eleme = await page
                .locator('[data-testid="ModalCbed-Text-Designation"]')
                .last()
                .textContent();
            if (eleme != item.partNumber) {
                logger.error("Incorrect Part Number for Type СБ");
                expect(elem.trim()).toBe(item.partNumber);
            }
            let eRow = await page.locator(`[data-testid="${item.dataTestId}"]`).last();
            await eRow.waitFor({ state: 'attached', timeout: 30000 });
            await eRow.evaluate((element: HTMLElement) => {
                element.style.border = "3px solid red"; // Highlight
                element.style.backgroundColor = "yellow";
            });

            item.quantity *= parentQuantity;

            // Process the modal's table recursively
            const subGroups = await this.processTableDataAndHandleModals(
                tableInModal,
                shortagePage,
                page,
                title,
                item.quantity
            );

            // Merge subGroups into the main structure or log them
            logger.info("Processed Sub-Groups for СБ item:", subGroups);

            // Close the modal
            await page.mouse.click(1, 1);
        }
    }



}