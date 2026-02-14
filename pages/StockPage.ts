import { expect, Page } from "@playwright/test";
import { PageObject } from "../lib/Page";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/utils/logger";

export enum TableSelection {
    product = "Изделие",
    cbed = "Сборка",
    detail = "Детали",
}

// Страница:  Остатки продукции, сборок и деталей на складе
export class CreateStockPage extends PageObject {
    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    // Check the number of parts in the warehouse posting
    async checkingTheQuantityInStock(
        serachName: string,
        tableSelection: TableSelection
    ) {
        let tableLocator: string = '[data-testid="OstatkPCBD-Product-Table"]';
        let tableDataTestId: string = "";

        if (tableSelection === TableSelection.cbed) {
            tableLocator = '[data-testid="OstatkPCBD-Cbed-Table"]';
            tableDataTestId = "ModalAddWaybill-ShipmentDetailsTable-Table";
        } else if (tableSelection === TableSelection.detail) {
            tableLocator = '[data-testid="OstatkPCBD-Detal-Table"]';
        }

        if (!tableLocator) {
            throw new Error(`Invalid table selection: ${tableSelection}`);
        }

        // Check the number of parts in the warehouse before posting
        // Go to the warehouse page
        await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Remains of products, assemblies and parts in warehouse
        const selector = '[data-testid="Sclad-residuals-residuals"]';
        await this.findTable(selector);

        // Wait for the table body to load
        await this.waitingTableBody(tableLocator);

        // Using table search we look for the value of the variable
        await this.searchTableRedesign(serachName, tableLocator);

        // Wait for the table body to load
        await this.waitingTableBody(tableLocator);

        // Check that the first row of the table contains the variable name
        await this.checkNameInLineFromFirstRow(serachName, tableLocator);

        // const numberColumn = await this.findColumnNew(
        //     this.page,
        //     tableDataTestId,
        //     "ModalAddWaybill-ShipmentDetailsTable-SelectColumn"
        // );
        // logger.log("numberColumn: ", numberColumn);
        let remainingStock
        if (tableSelection === TableSelection.product) {
            remainingStock = await this.getValueOrClickFromFirstRow(
                tableLocator,
                3
            );
        } else {
            remainingStock = await this.getValueOrClickFromFirstRow(
                tableLocator,
                2
            );
        }
        // Output to the console
        logger.log(
            `Количество ${serachName} на складе ${remainingStock}`
        );

        return remainingStock;
    }

    async checkingTheQuantityInStockNew(
        serachName: string,
        tableSelection: TableSelection
    ) {
        let tableLocator: string = ".scroll-table.product";

        if (tableSelection === TableSelection.cbed) {
            tableLocator = ".scroll-table.cbed";
        } else if (tableSelection === TableSelection.detail) {
            tableLocator = ".scroll-table.detal";
        }

        if (!tableLocator) {
            throw new Error(`Invalid table selection: ${tableSelection}`);
        }

        // Check the number of parts in the warehouse before posting
        // Go to the warehouse page
        await this.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);

        // Find and go to the page using the locator Remains of products, assemblies and parts in warehouse
        const selector = '[data-testid="Sclad-residuals-residuals"]';
        await this.findTable(selector);

        // Wait for the table body to load
        await this.waitingTableBody(tableLocator);

        // Using table search we look for the value of the variable
        await this.searchTable(serachName, tableLocator);

        // Wait for the table body to load
        await this.waitingTableBody(tableLocator);

        // Check that the first row of the table contains the variable name
        await this.checkNameInLineFromFirstRow(serachName, tableLocator);

        const numberColumn = await this.findColumn(
            this.page,
            ".scroll-table.detal",
            "OstatkiPCBDTable-Header-Stock"
        );
        logger.log("numberColumn: ", numberColumn);
        // Upd:
        let remainingStock = await this.getValueOrClickFromFirstRow(
            tableLocator,
            2
        );

        // Output to the console
        logger.log(
            `Количество ${serachName} на складе до оприходования  ${remainingStock}`
        );

        return remainingStock;
    }
}
