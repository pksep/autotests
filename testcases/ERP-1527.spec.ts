import { test, expect, Locator, Page } from "@playwright/test";
import { CreateAssemblyPage } from "../pages/AssemplyPage";

import { SELECTORS } from "../config";
import { allure } from "allure-playwright";
import logger from "../lib/logger";

// Constants for data-testid values
const ASSEMBLY_BUTTON_ASSEMBLY_BY_OPERATIONS = "Assembly-Button-AssemblyByOperations";
const MODAL_WORKINGS_OPERATIONS_DESTROY_MODAL_RIGHT = "ModalWorkingsOperations-DestroyModalRight";
const MODAL_WORKINGS_OPERATIONS_TYPE_OPERATION_PREFIX = "ModalWorkingsOperations-Type-Operation";
const MODAL_WORKINGS_OPERATIONS_TYPE_OPERATION_COUNTS_WORKING = "ModalWorkingsOperations-Type-OperationCounsWorking";
const MODAL_WORKINGS_OPERATIONS_OPERATION_BLOCK = "ModalWorkingsOperations-OperationBlock";

export const runERP_1527 = () => {
    test("TestCase 01 - Navigate to assembly page", async ({ page }) => {
        test.setTimeout(600000);
        const assembliesPage = new CreateAssemblyPage(page);

        // Declare variables that will be used across multiple steps
        let divContainer: any;

        await allure.step("Step 1: Перейдите на страницу 'Сборка'", async () => {
            await assembliesPage.goto(SELECTORS.SUBPAGES.ASSEMBLY.URL);
            await page.waitForLoadState("networkidle");
        });
        await allure.step("Step 2: open the 'Сборочные единицы по операциям'", async () => {
            // Find the button with the specified data-testid
            const assemblyByOperationsButton = page.locator(`[data-testid="${ASSEMBLY_BUTTON_ASSEMBLY_BY_OPERATIONS}"]`);

            // Wait for the button to be visible
            await expect(assemblyByOperationsButton).toBeVisible({ timeout: 10000 });

            // Highlight the button for visibility using the page class method
            await assembliesPage.highlightElement(assemblyByOperationsButton);

            // Click the button
            await assemblyByOperationsButton.click();

            // Wait for the page to load after clicking
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);

            logger.info("Clicked on 'Сборочные единицы по операциям' button");
        });

        await allure.step("Step 3: Find the div with the specified data-testid", async () => {
            divContainer = page.locator(`div[data-testid="${MODAL_WORKINGS_OPERATIONS_DESTROY_MODAL_RIGHT}"]`);

            // Wait for the div to be visible
            await expect(divContainer).toBeVisible({ timeout: 10000 });

            // Highlight the div for visibility
            //await assembliesPage.highlightElement(divContainer);

            logger.info("Found the div container");
        });

        await allure.step("Step 4: Process all operation divs and verify table contents", async () => {
            console.log('step 4');

            // Debug: Check if divContainer is visible and has content
            const isDivContainerVisible = await divContainer.isVisible();
            console.log(`divContainer visible: ${isDivContainerVisible}`);

            // Wait for the operation block to become visible
            const operationBlock = divContainer.locator(`[data-testid="${MODAL_WORKINGS_OPERATIONS_OPERATION_BLOCK}"]`);
            await operationBlock.waitFor({ state: 'visible', timeout: 10000 });

            const isOperationBlockVisible = await operationBlock.isVisible();
            console.log(`Operation block visible: ${isOperationBlockVisible}`);

            // Debug: Check what's actually inside the divContainer
            const allDivsInContainer = divContainer.locator('div[data-testid]');
            const allDivsCount = await allDivsInContainer.count();
            console.log(`Total divs with data-testid in container: ${allDivsCount}`);

            // Log all data-testid values found in the container
            for (let j = 0; j < allDivsCount; j++) {
                const div = allDivsInContainer.nth(j);
                const dataTestId = await div.getAttribute('data-testid');
                const isVisible = await div.isVisible();
                console.log(`Div ${j + 1}: data-testid="${dataTestId}", visible: ${isVisible}`);
            }

            // Find all divs with data-testid starting with the operation prefix within the operation block
            const operationDivs = operationBlock.locator(`div[data-testid^="${MODAL_WORKINGS_OPERATIONS_TYPE_OPERATION_PREFIX}"]`);
            const operationCount = await operationDivs.count();

            console.log(`Found ${operationCount} operation divs to process`);

            // Process each operation div
            for (let i = 0; i < operationCount; i++) {
                const operationDiv = operationDivs.nth(i);
                await assembliesPage.highlightElement(operationDiv);
                // Get the data-testid and text content
                const dataTestId = await operationDiv.getAttribute('data-testid');
                const operationText = await operationDiv.textContent();

                logger.info(`Processing operation ${i + 1}: ${dataTestId} - "${operationText}"`);

                // Find the nested div with the count information
                const countDiv = operationDiv.locator(`[data-testid="${MODAL_WORKINGS_OPERATIONS_TYPE_OPERATION_COUNTS_WORKING}"]`);
                const countDivCount = await countDiv.count();

                if (countDivCount === 0) {
                    logger.warn(`No count div found with data-testid "${MODAL_WORKINGS_OPERATIONS_TYPE_OPERATION_COUNTS_WORKING}"`);

                    // Debug: Look for any divs with data-testid inside the operation div
                    const allDivsWithTestId = operationDiv.locator('div[data-testid]');
                    const allDivsCount = await allDivsWithTestId.count();
                    logger.info(`Found ${allDivsCount} divs with data-testid inside operation div`);

                    // Log all data-testid values found
                    for (let j = 0; j < allDivsCount; j++) {
                        const div = allDivsWithTestId.nth(j);
                        const dataTestId = await div.getAttribute('data-testid');
                        const textContent = await div.textContent();
                        logger.info(`Div ${j + 1}: data-testid="${dataTestId}", text: "${textContent}"`);

                        // Highlight each div to see what we found
                        await assembliesPage.highlightElement(div, {
                            backgroundColor: 'pink',
                            border: '2px solid magenta',
                            color: 'black'
                        });
                        await page.waitForTimeout(500);
                    }

                    continue;
                }

                const countText = await countDiv.textContent();

                logger.info(`Count div text: "${countText}"`);

                // Highlight the count div to show which element contains the number
                await assembliesPage.highlightElement(countDiv, {
                    backgroundColor: 'yellow',
                    border: '2px solid purple',
                    color: 'black'
                });
                await page.waitForTimeout(1000);

                // Extract the number from the format (x)
                const numberMatch = countText?.match(/\((\d+)\)/);
                if (!numberMatch) {
                    console.warn(`No number found in count text: "${countText}"`);
                    continue;
                }

                const expectedItemCount = parseInt(numberMatch[1]);
                console.log(`🔢 Number from div: ${expectedItemCount}`);

                // Highlight the operation div
                await assembliesPage.highlightElement(operationDiv, {
                    backgroundColor: 'orange',
                    border: '2px solid red',
                    color: 'white'
                });
                await page.waitForTimeout(500);

                // Click on the operation div
                await operationDiv.click();
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(1000);

                // Look for a table in the opened page/modal
                const table = page.locator('table');
                const tableCount = await table.count();

                if (tableCount > 0) {
                    // Find the first table and scroll to load all rows
                    const firstTable = table.first();

                    // Scroll to bottom repeatedly until no new rows are loaded
                    let previousRowCount = 0;
                    let currentRowCount = 0;
                    let scrollAttempts = 0;
                    const maxScrollAttempts = 10; // Prevent infinite loop

                    do {
                        previousRowCount = currentRowCount;

                        // Count current rows
                        const tableRows = firstTable.locator('tbody tr');
                        currentRowCount = await tableRows.count();

                        console.log(`📊 Scroll attempt ${scrollAttempts + 1}: ${currentRowCount} rows`);

                        if (currentRowCount > previousRowCount) {
                            // New rows were loaded, scroll to bottom again
                            await firstTable.evaluate((el) => {
                                el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                            });
                            await page.waitForTimeout(2000); // Wait for new rows to load
                        }

                        scrollAttempts++;
                    } while (currentRowCount > previousRowCount && scrollAttempts < maxScrollAttempts);

                    const actualItemCount = currentRowCount;
                    console.log(`📋 Final table rows: ${actualItemCount}`);
                    console.log(`✅ Expected: ${expectedItemCount} | Actual: ${actualItemCount}`);

                    // Debug: Check table structure
                    const allTableRows = firstTable.locator('tr');
                    const allRowsCount = await allTableRows.count();
                    console.log(`📊 Table structure: ${allRowsCount} total rows, ${actualItemCount} tbody rows`);

                    // Debug: Log first few rows to understand structure
                    for (let k = 0; k < Math.min(allRowsCount, 3); k++) {
                        const row = allTableRows.nth(k);
                        const rowText = await row.textContent();
                        console.log(`📝 Row ${k + 1}: "${rowText?.substring(0, 100)}..."`);
                    }

                    logger.info(`Table found with ${actualItemCount} rows, expected ${expectedItemCount}`);

                    // Highlight the table
                    await assembliesPage.highlightElement(firstTable, {
                        backgroundColor: 'lightblue',
                        border: '2px solid blue',
                        color: 'black'
                    });
                    await page.waitForTimeout(500);

                    // Verify the item count matches
                    expect(actualItemCount).toBe(expectedItemCount);
                    logger.info(`✅ Operation ${i + 1} verified: ${actualItemCount} items found as expected`);
                } else {
                    console.error(`❌ No table found for operation ${i + 1}`);
                    throw new Error(`No table found for operation: ${operationText}`);
                }

                // Wait a bit before processing the next operation
                await page.waitForTimeout(1000);
            }

            logger.info(`✅ Successfully processed all ${operationCount} operations`);

            // Final 5-second pause at the end
            await page.waitForTimeout(5000);
            logger.info("Test completed with final 5-second pause");
        });

    });

}

