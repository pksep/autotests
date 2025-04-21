
import { test, expect } from "@playwright/test";
import { performLogin } from "./TC000.spec"; //
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage, TypeOfOperationMW } from "../pages/PartsDatabasePage";
import { SELECTORS } from "../config";
import { Click } from "../lib/Page";

const nameDetail = 'test 3'
export const runU003 = (isSignleTest: boolean, iterations: number) => {
    console.log(
        `Starting test: Verify Order From Suppliers Page Functionality`
    );
};

test.beforeEach("Test Case 00 - Authorization", async ({ page }) => {
    await performLogin(page, "001", "Перов Д.А.", "54321");
    await page.click("button.btn.blues");
});

test.skip("Test Case 01 - Changing the material of the workpiece", async ({ page }) => {
    const partsDatabase = new CreatePartsDatabasePage(page)
    const detailsTable = '[data-testid="TableDetal-BasePaginationTable"]'

    await allure.step("Step 1: Open the warehouse page", async () => {
        // Go to the Warehouse page
        await partsDatabase.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        await partsDatabase.waitingTableBody(detailsTable);
    });

    await allure.step("Step 2: Search product", async () => {
        // Using table search we look for the value of the variable
        await partsDatabase.searchTable(
            nameDetail,
            detailsTable
        );

        // Wait for the table body to load
        await partsDatabase.waitingTableBody(detailsTable);

        // Wait for loading
        await page.waitForLoadState("networkidle");
    });

    await allure.step('Step 3: ', async () => {
        await partsDatabase.checkNameInLineFromFirstRow(nameDetail, detailsTable)
    })

    await allure.step('Step 4:', async () => {
        await partsDatabase.getValueOrClickFromFirstRowNoThead(detailsTable, 1, Click.Yes, Click.No)
    })

    await allure.step('Step 5: ', async () => {
        await partsDatabase.clickButton(' Редактировать ', '[data-testid="BaseDetals-Button-EditDetal"]')
    })

    await allure.step('Step 6: ', async () => {
        await partsDatabase.checkingTheEditorPageDetails(TypeOfOperationMW.edit)
    })
})

