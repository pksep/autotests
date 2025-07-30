import { test, expect, Locator } from "@playwright/test";
import workResultsData from '../testdata/WorkResultsPage.json';
import { CreateWorkResultsPage } from '../pages/WorkResultsPage';
import { runTC000, performLogin } from "./TC000.spec";
import { ENV, SELECTORS } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

// Constants for data-testids
const BREADCRUMBS = "BreadCrumbs";
const START_DATE_PICKER = "ResultWork-ResponsibleBlock-Calendar-DataPickerRange-Component-Start-Choose-Value-Display";
const END_DATE_PICKER = "ResultWork-ResponsibleBlock-Calendar-DataPickerRange-Component-End-Choose-Value-Display";
const OPERATION_TYPE_SELECT = "ResultWork-ResponsibleBlock-SelectOperation-Current";
const EMPLOYEE_SELECT = "BaseFilter-Current";
const WORK_RESULTS_TABLE = "ResultWork-TableSection-ScrollTable";
const SEARCH_DROPDOWN_INPUT = "Search-Dropdown-Input";
const PAGINATION = "pagination";
const SUMMARY_INFO = "summary-info";

const TEST_SEARCH_DETAILS = "Упорное кольцо 65х70х2 (3Д печать)";

export const runWorkResults = (isSingleTest: boolean, iterations: number) => {
    test.skip('Test Case 01:Verify Work Results Page Functionality', async ({ page }) => {
        console.log(`Starting test: Verify Work Results Page Functionality`);

        const detailsPage = new CreateWorkResultsPage(page);

        await allure.step("Step 1: Navigate to Work Results page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.RESULTSWORK.URL);
            logger.info("Navigated to Work Results page");
        });

        await allure.step("Step 2: Verify page title", async () => {
            const titleElement = page.locator('h3');
            await expect(titleElement).toHaveText(workResultsData.pageTitle);
            await detailsPage.highlightElement(titleElement);
            logger.info("Page title verified");
        });

        await allure.step("Step 3: Verify breadcrumbs", async () => {
            const breadcrumbs = page.locator(`ul[data-testid="${BREADCRUMBS}"]`);
            await detailsPage.highlightElement(breadcrumbs);

            // Verify each breadcrumb item using the correct data-testid pattern
            for (let i = 0; i < workResultsData.breadcrumbs.length; i++) {
                const breadcrumbItem = page.locator(`[data-testid="BreadCrumbs-Crumbs${i}"]`);
                const breadcrumbText = page.locator(`[data-testid="BreadCrumbs-Checked${i}"]`);

                await expect(breadcrumbItem).toBeVisible();
                await expect(breadcrumbText).toHaveText(workResultsData.breadcrumbs[i]);
            }
            logger.info("Breadcrumbs verified");
        });

        await allure.step("Step 4: Verify date pickers", async () => {
            const startDatePicker = page.locator(`[data-testid="${START_DATE_PICKER}"]`);
            const endDatePicker = page.locator(`[data-testid="${END_DATE_PICKER}"]`);

            await expect(startDatePicker).toBeVisible();
            await expect(endDatePicker).toBeVisible();

            await detailsPage.highlightElement(startDatePicker);
            await detailsPage.highlightElement(endDatePicker);
            logger.info("Date pickers verified");
        });

        await allure.step("Step 5: Verify select lists", async () => {
            const employeeSelect = page.locator(`[data-testid="${EMPLOYEE_SELECT}"]`);
            const operationsSelect = page.locator(`[data-testid="${OPERATION_TYPE_SELECT}"]`);

            await expect(employeeSelect).toBeVisible();
            await expect(operationsSelect).toBeVisible();

            await detailsPage.highlightElement(employeeSelect);
            await detailsPage.highlightElement(operationsSelect);

            // Click to open the operation type dropdown
            await operationsSelect.click();

            // Wait for the dropdown to open
            const optionsList = page.locator(`[data-testid="ResultWork-ResponsibleBlock-SelectOperation-OptionsList"]`);
            await expect(optionsList).toBeVisible();

            // Verify operation type options are available using the correct data-testid pattern
            for (let i = 0; i < workResultsData.selectLists.operationType.options.length; i++) {
                const optionElement = page.locator(`[data-testid="ResultWork-ResponsibleBlock-SelectOperation-Options-${i}"]`);
                await expect(optionElement).toBeVisible();
                await expect(optionElement).toHaveText(workResultsData.selectLists.operationType.options[i]);
            }

            logger.info("Select lists verified");
        });

        await allure.step("Step 6: Verify buttons", async () => {
            logger.info("Button verification - scanning all buttons within the ResultWork main element");

            // First, locate the main ResultWork container
            const resultWorkContainer = page.locator('[data-testid="ResultWork"]');
            await expect(resultWorkContainer).toBeVisible();
            logger.info("Found ResultWork main container");

            // Get all buttons within the ResultWork container only
            const allButtons = resultWorkContainer.locator('button');
            const totalButtonCount = await allButtons.count();
            logger.info(`Total buttons found within ResultWork container: ${totalButtonCount}`);

            // Create a list of all buttons with their properties
            const buttonList = [];
            logger.info("Scanning all buttons within ResultWork container and creating list:");

            for (let i = 0; i < totalButtonCount; i++) {
                const button = allButtons.nth(i);
                const buttonText = await button.textContent();
                const buttonTestId = await button.getAttribute('data-testid');
                const buttonClass = await button.getAttribute('class');
                const buttonType = await button.getAttribute('type');
                const buttonId = await button.getAttribute('id');

                // Highlight the button
                await detailsPage.highlightElement(button, {
                    backgroundColor: 'lightgreen',
                    border: '3px solid green',
                    color: 'black'
                });

                const buttonInfo = {
                    number: i + 1,
                    text: buttonText || '',
                    dataTestId: buttonTestId || 'none',
                    class: buttonClass || 'none',
                    type: buttonType || 'none',
                    id: buttonId || 'none'
                };

                buttonList.push(buttonInfo);

                logger.info(`Button ${i + 1}: "${buttonText}" (data-testid: ${buttonTestId || 'none'}, class: ${buttonClass || 'none'})`);

                // Pause for half second to show highlighting
                await page.waitForTimeout(500);
            }

            // Display the complete button list
            logger.info("=== COMPLETE BUTTON LIST (ResultWork Container Only) ===");
            for (const button of buttonList) {
                logger.info(`Button ${button.number}:`);
                logger.info(`  Text: "${button.text}"`);
                logger.info(`  Data-testid: ${button.dataTestId}`);
                logger.info(`  Class: ${button.class}`);
                logger.info(`  Type: ${button.type}`);
                logger.info(`  ID: ${button.id}`);
                logger.info(`  ---`);
            }
            logger.info("=== END BUTTON LIST ===");

            logger.info(`Total buttons scanned within ResultWork container: ${totalButtonCount}`);
            logger.info("Button scanning completed successfully");
        });

        await allure.step("Step 7: Verify table", async () => {
            const table = page.locator(`[data-testid="${WORK_RESULTS_TABLE}"]`);
            await expect(table).toBeVisible();
            await detailsPage.highlightElement(table);

            // Get the thead element
            const thead = table.locator('thead');
            await expect(thead).toBeVisible();

            // Get all rows in thead
            const allRows = thead.locator('tr');
            const rowCount = await allRows.count();
            logger.info(`Found ${rowCount} rows in thead`);

            // Get the first two rows (actual headers) - exclude the search row
            const headerRows = thead.locator('tr').nth(0); // First row
            const subHeaderRows = thead.locator('tr').nth(1); // Second row

            // Count headers from both rows
            const mainHeaders = headerRows.locator('th');
            const subHeaders = subHeaderRows.locator('th');

            const mainHeaderCount = await mainHeaders.count();
            const subHeaderCount = await subHeaders.count();

            // Count only non-empty sub headers
            let actualSubHeaderCount = 0;
            for (let i = 0; i < subHeaderCount; i++) {
                const headerText = await subHeaders.nth(i).textContent();
                if (headerText && headerText.trim() !== "") {
                    actualSubHeaderCount++;
                }
            }

            const totalHeaderCount = mainHeaderCount + actualSubHeaderCount;

            console.log(`First row (main headers): ${mainHeaderCount} columns`);
            console.log(`Second row (sub headers): ${subHeaderCount} columns (${actualSubHeaderCount} non-empty)`);
            console.log(`Total columns scanned: ${totalHeaderCount}`);

            logger.info(`Main headers (row 1): ${mainHeaderCount}`);
            logger.info(`Sub headers (row 2): ${subHeaderCount} total, ${actualSubHeaderCount} non-empty`);
            logger.info(`Total headers: ${totalHeaderCount}`);

            // Log the text of each header for debugging
            logger.info("Main headers:");
            for (let i = 0; i < mainHeaderCount; i++) {
                const headerText = await mainHeaders.nth(i).textContent();
                logger.info(`  ${i + 1}: "${headerText}"`);
            }

            logger.info("Sub headers:");
            for (let i = 0; i < subHeaderCount; i++) {
                const headerText = await subHeaders.nth(i).textContent();
                logger.info(`  ${i + 1}: "${headerText}"`);
            }

            // Log the actual sub headers structure for debugging
            logger.info("=== ACTUAL SUB HEADERS STRUCTURE ===");
            const actualSubHeaders = [];
            for (let i = 0; i < subHeaderCount; i++) {
                const headerText = await subHeaders.nth(i).textContent();
                if (headerText && headerText.trim() !== "") {
                    actualSubHeaders.push({
                        position: i + 1,
                        text: headerText.trim()
                    });
                }
            }

            logger.info("Non-empty sub headers found:");
            for (const header of actualSubHeaders) {
                logger.info(`  Position ${header.position}: "${header.text}"`);
            }
            logger.info(`Total non-empty sub headers: ${actualSubHeaders.length}`);
            logger.info("=== END ACTUAL SUB HEADERS STRUCTURE ===");

            const expectedMainHeaderCount = workResultsData.table.mainHeaders.length;
            const expectedSubHeaderCount = workResultsData.table.subHeaders.length;

            // Count expected non-empty sub headers
            const expectedNonEmptySubHeaders = workResultsData.table.subHeaders.filter(header => header.trim() !== "").length;
            const expectedTotalCount = expectedMainHeaderCount + expectedNonEmptySubHeaders;

            // Validate main headers count
            await expect(mainHeaderCount).toBe(expectedMainHeaderCount);
            logger.info(`Main headers count verified: ${mainHeaderCount} = ${expectedMainHeaderCount}`);

            // Validate sub headers count (non-empty only)
            await expect(actualSubHeaderCount).toBe(expectedNonEmptySubHeaders);
            logger.info(`Sub headers count verified: ${actualSubHeaderCount} = ${expectedNonEmptySubHeaders}`);

            // Validate total count
            await expect(totalHeaderCount).toBe(expectedTotalCount);
            logger.info(`Total headers count verified: ${totalHeaderCount} = ${expectedTotalCount}`);

            // Verify main headers (first row)
            for (let i = 0; i < Math.min(mainHeaderCount, expectedMainHeaderCount); i++) {
                const headerElement = mainHeaders.nth(i);
                const expectedHeaderText = workResultsData.table.mainHeaders[i];

                // Highlight the current header being validated
                await detailsPage.highlightElement(headerElement, {
                    backgroundColor: 'lightblue',
                    border: '3px solid blue',
                    color: 'black'
                });

                // Verify the header text (handle empty strings)
                if (expectedHeaderText === "") {
                    // For empty headers, just verify the element exists
                    await expect(headerElement).toBeVisible();
                    logger.info(`Main header ${i + 1} verified: empty header`);
                } else {
                    await expect(headerElement).toHaveText(expectedHeaderText);
                    logger.info(`Main header ${i + 1} verified: "${expectedHeaderText}"`);
                }

                // Pause for 500ms to show the highlighting
                await page.waitForTimeout(500);
            }

            // Verify sub headers (second row)
            for (let i = 0; i < Math.min(subHeaderCount, expectedSubHeaderCount); i++) {
                const headerElement = subHeaders.nth(i);
                const expectedHeaderText = workResultsData.table.subHeaders[i];

                // Highlight the current header being validated
                await detailsPage.highlightElement(headerElement, {
                    backgroundColor: 'lightgreen',
                    border: '3px solid green',
                    color: 'black'
                });

                // Verify the header text (handle empty strings)
                if (expectedHeaderText === "") {
                    // For empty headers, just verify the element exists
                    await expect(headerElement).toBeVisible();
                    logger.info(`Sub header ${i + 1} verified: empty header`);
                } else {
                    await expect(headerElement).toHaveText(expectedHeaderText);
                    logger.info(`Sub header ${i + 1} verified: "${expectedHeaderText}"`);
                }

                // Pause for 500ms to show the highlighting
                await page.waitForTimeout(500);
            }

            logger.info("Table structure verified");
        });

        console.log('Test complete');
    });

    test('Test Case 02: Verify table data correctly', async ({ page }) => {
        const detailsPage = new CreateWorkResultsPage(page);

        await allure.step("Step 1: Navigate to page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.RESULTSWORK.URL);
        });

        await allure.step("Step 2: Verify page title", async () => {
            const titleElement = page.locator('h3');
            await expect(titleElement).toHaveText(workResultsData.pageTitle);
            await detailsPage.highlightElement(titleElement);
            logger.info("Page title verified");
        });

        await allure.step("Step 3: Verify table data", async () => {
            const table = page.locator(`[data-testid="${WORK_RESULTS_TABLE}"]`);

            // Perform search functionality
            await expect(table).toBeVisible();
            logger.info("Work results table found for search");

            // Find the search field
            const searchField = table.locator(`input[data-testid="${SEARCH_DROPDOWN_INPUT}"]`);
            await expect(searchField).toBeVisible();
            await detailsPage.highlightElement(searchField, {
                backgroundColor: 'blue',
                color: 'white'
            });
            logger.info("Search field found");

            // Debug: check field properties
            const isEnabled = await searchField.isEnabled();
            const currentValue = await searchField.inputValue();
            const placeholder = await searchField.getAttribute('placeholder');
            logger.info(`Search field - enabled: ${isEnabled}, current value: "${currentValue}", placeholder: "${placeholder}"`);

            // Enter search value and press Enter
            await searchField.click(); // Click to focus
            await searchField.clear(); // Clear any existing text
            await searchField.type(TEST_SEARCH_DETAILS); // Type the value
            logger.info(`Typed search value: "${TEST_SEARCH_DETAILS}"`);

            // Verify the value was entered
            const newValue = await searchField.inputValue();
            logger.info(`Search field value after typing: "${newValue}"`);

            await searchField.press('Enter');
            logger.info(`Searched for: "${TEST_SEARCH_DETAILS}"`);
            await page.waitForTimeout(1000);

            // Wait for results and verify
            await page.waitForTimeout(2000);
            const tableRows = table.locator('tbody tr');
            const resultCount = await tableRows.count();
            await expect(resultCount).toBe(1);
            logger.info(`Found ${resultCount} result`);

            // Verify the 10th column contains our search term
            const searchResultRow = tableRows.first();
            const tenthColumn = searchResultRow.locator('td').nth(9);
            await expect(tenthColumn).toContainText(TEST_SEARCH_DETAILS);
            await detailsPage.highlightElement(tenthColumn);
            logger.info("Search result verified");

            await detailsPage.highlightElement(table);

            // Verify table has data rows
            const rows = table.locator('tbody tr');
            await expect(rows).toHaveCount(workResultsData.table.rows.length);

            // Verify first row data
            const firstRow = rows.first();
            await detailsPage.highlightElement(firstRow);

            await expect(firstRow.locator('td').nth(0)).toHaveText(workResultsData.table.rows[0].rowNumber);
            await expect(firstRow.locator('td').nth(1)).toHaveText(workResultsData.table.rows[0].employee);
            await expect(firstRow.locator('td').nth(2)).toHaveText(workResultsData.table.rows[0].department);
            await expect(firstRow.locator('td').nth(3)).toHaveText(workResultsData.table.rows[0].date);
            await expect(firstRow.locator('td').nth(4)).toHaveText(workResultsData.table.rows[0].task);
            await expect(firstRow.locator('td').nth(5)).toHaveText(workResultsData.table.rows[0].status);
            await expect(firstRow.locator('td').nth(6)).toHaveText(workResultsData.table.rows[0].executionTime);
            await expect(firstRow.locator('td').nth(7)).toHaveText(workResultsData.table.rows[0].comment);

            logger.info("Table data verified");
        });

        await allure.step("Step 4: Perform search functionality", async () => {
            const table = page.locator(`[data-testid="${WORK_RESULTS_TABLE}"]`);
            await expect(table).toBeVisible();
            logger.info("Work results table found for search");

            // Try to find the search field - first within the table, then on the page
            let searchField = null;

            // First attempt: search within the table
            const searchFieldInTable = table.locator(`[data-testid="${SEARCH_DROPDOWN_INPUT}"]`);
            const searchFieldInTableCount = await searchFieldInTable.count();

            if (searchFieldInTableCount > 0) {
                searchField = searchFieldInTable.first();
                logger.info("Found search field within table");
            } else {
                // Second attempt: search on the entire page
                const searchFieldOnPage = page.locator(`[data-testid="${SEARCH_DROPDOWN_INPUT}"]`);
                const searchFieldOnPageCount = await searchFieldOnPage.count();

                if (searchFieldOnPageCount > 0) {
                    searchField = searchFieldOnPage.first();
                    logger.info("Found search field on page (outside table)");
                } else {
                    // Third attempt: look for any input field that might be a search
                    const allInputs = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="поиск"], input[placeholder*="Поиск"]');
                    const allInputsCount = await allInputs.count();
                    logger.info(`Found ${allInputsCount} potential search input fields`);

                    if (allInputsCount > 0) {
                        searchField = allInputs.first();
                        logger.info("Using first available input field as search field");
                    } else {
                        logger.error("No search field found on the page");
                        throw new Error("Search field not found");
                    }
                }
            }

            await expect(searchField).toBeVisible();
            await detailsPage.highlightElement(searchField, {
                backgroundColor: 'lightblue',
                border: '3px solid blue',
                color: 'black'
            });
            logger.info("Search field found and highlighted");

            // Get the current value and placeholder for debugging
            const currentValue = await searchField.inputValue();
            const placeholder = await searchField.getAttribute('placeholder');
            logger.info(`Search field current value: "${currentValue}", placeholder: "${placeholder}"`);

            // Clear the field first, then enter the test search value
            await searchField.clear();
            await searchField.fill(TEST_SEARCH_DETAILS);
            logger.info(`Entered search value: "${TEST_SEARCH_DETAILS}"`);

            // Press Enter to perform the search
            await searchField.press('Enter');
            logger.info("Pressed Enter to perform search");

            // Wait for search results to load
            await page.waitForTimeout(3000);
            logger.info("Waited for search results to load");

            // Count the results in the table
            const tableRows = table.locator('tbody tr');
            const resultCount = await tableRows.count();
            logger.info(`Found ${resultCount} result(s) in the table`);

            // Verify that result count is 1
            await expect(resultCount).toBe(1);
            logger.info("Verified result count is 1");

            // Verify that the 10th column contains the name we are searching for
            const firstRow = tableRows.first();
            const tenthColumn = firstRow.locator('td').nth(9); // 10th column (0-indexed)
            await expect(tenthColumn).toContainText(TEST_SEARCH_DETAILS);

            // Highlight the 10th column to show the match
            await detailsPage.highlightElement(tenthColumn, {
                backgroundColor: 'lightgreen',
                border: '3px solid green',
                color: 'black'
            });
            logger.info(`Verified 10th column contains search term: "${TEST_SEARCH_DETAILS}"`);
        });
    });

    test('Test Case 03: Verify pagination elements', async ({ page }) => {
        const detailsPage = new CreateWorkResultsPage(page);

        await allure.step("Step 1: Navigate to page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.RESULTSWORK.URL);
        });

        await allure.step("Step 2: Verify pagination elements", async () => {
            const pagination = page.locator(`[data-testid="${PAGINATION}"]`);
            await expect(pagination).toBeVisible();
            await detailsPage.highlightElement(pagination);

            // Verify pagination elements
            await expect(pagination.locator('text=Предыдущая')).toBeVisible();
            await expect(pagination.locator('text=Следующая')).toBeVisible();
            await expect(pagination.locator('text=Страница 1 из 5')).toBeVisible();

            logger.info("Pagination elements verified");
        });
    });

    test('Test Case 04: Handle operation type selection', async ({ page }) => {
        const detailsPage = new CreateWorkResultsPage(page);

        await allure.step("Step 1: Navigate to page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.RESULTSWORK.URL);
        });

        await allure.step("Step 2: Verify operation type options", async () => {
            const operationsSelect = page.locator(`[data-testid="${OPERATION_TYPE_SELECT}"]`);
            await detailsPage.highlightElement(operationsSelect);

            // Click to open the dropdown
            await operationsSelect.click();

            // Wait for the dropdown to open
            const optionsList = page.locator(`[data-testid="ResultWork-ResponsibleBlock-SelectOperation-OptionsList"]`);
            await expect(optionsList).toBeVisible();

            // Verify all options are available using the correct data-testid pattern
            for (let i = 0; i < workResultsData.selectLists.operationType.options.length; i++) {
                const optionElement = page.locator(`[data-testid="ResultWork-ResponsibleBlock-SelectOperation-Options-${i}"]`);
                await expect(optionElement).toBeVisible();
                await expect(optionElement).toHaveText(workResultsData.selectLists.operationType.options[i]);
            }

            logger.info("Operation type options verified");
        });

        await allure.step("Step 3: Select operation type", async () => {
            const operationsSelect = page.locator(`[data-testid="${OPERATION_TYPE_SELECT}"]`);

            // Click to open the dropdown if not already open
            await operationsSelect.click();

            // Select an operation type and verify selection
            const optionElement = page.locator(`[data-testid="ResultWork-ResponsibleBlock-SelectOperation-Options-4"]`); // Фрезерный-универсал
            await optionElement.click();
            await expect(optionElement).toBeVisible();

            logger.info("Operation type selected successfully");
        });
    });

    test('Test Case 05: Handle employee selection', async ({ page }) => {
        const detailsPage = new CreateWorkResultsPage(page);

        await allure.step("Step 1: Navigate to page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.RESULTSWORK.URL);
        });

        await allure.step("Step 2: Verify employee options", async () => {
            const employeeSelect = page.locator(`[data-testid="${EMPLOYEE_SELECT}"]`);
            await detailsPage.highlightElement(employeeSelect);

            // Verify all options are available
            for (const option of workResultsData.selectLists.employee.options) {
                await expect(employeeSelect.locator(`option:has-text("${option}")`)).toBeVisible();
            }

            logger.info("Employee options verified");
        });

        await allure.step("Step 3: Select employee", async () => {
            const employeeSelect = page.locator(`[data-testid="${EMPLOYEE_SELECT}"]`);

            // Select an employee and verify selection
            await employeeSelect.selectOption('Иванов И.И.');
            await expect(employeeSelect).toHaveValue('Иванов И.И.');

            logger.info("Employee selected successfully");
        });
    });
}