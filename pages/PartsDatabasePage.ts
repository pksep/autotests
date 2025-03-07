import { Page, Locator } from "@playwright/test";
import { PageObject } from "../lib/Page";
import logger from "../lib/logger";

export type Item = {
    id: string;
    partNumber: string;
    name: string;
    quantity: number;
};

// Страница: Сборка
export class CreatePartsDatabasePage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    /**
     * Process table data to group items by their types (СБ, Д, ПД, РМ) and create an ALL group.
     * @param table - The Playwright Locator for the table element.
     * @returns An object with grouped items and the ALL group.
     */
    async processTableData(table: Locator): Promise<{
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
                if (groupTestId === 'TableSpecification-Header-AssemblyUnits') currentGroup = 'СБ';
                else if (groupTestId === 'TableSpecification-Header-Details') currentGroup = 'Д';
                else if (groupTestId === 'TableSpecification-Header-StandardDetails') currentGroup = 'ПД';
                else if (groupTestId === 'TableSpecification-Header-ConsumableMaterials') currentGroup = 'РМ';
                logger.info(`currentGroup set to: ${currentGroup}`);
                continue;
            }

            // Process data rows
            const isDataRow = (await row.getAttribute('class'))?.includes('td-row');
            if (isDataRow && currentGroup) {
                const id = await row.locator('td:nth-child(1)').textContent() ?? '';
                const partNumber = await row.locator('td:nth-child(2)').textContent() ?? '';
                const name = await row.locator('td:nth-child(3)').textContent() ?? '';
                const quantity = parseInt(await row.locator('td:nth-child(5)').textContent() ?? '0', 10);
                logger.info(`Item details: id=${id}, partNumber=${partNumber}, name=${name}, quantity=${quantity}`);

                if (id && name && quantity) {
                    const item: Item = { id: id.trim(), partNumber: partNumber.trim(), name: name.trim(), quantity };

                    // Add item to the current group
                    groups[currentGroup].push(item);
                    logger.info(`Added item to group ${currentGroup}:`, item);

                    // Add to ALL for groups Д, ПД, and РМ
                    if (currentGroup === 'Д' || currentGroup === 'ПД' || currentGroup === 'РМ') {
                        addToAll(item);
                    }
                }
            }
        }

        return groups;
    }


}