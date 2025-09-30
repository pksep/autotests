import { test, expect, Page } from "@playwright/test";
import { ENV, SELECTORS, CONST } from "../config";
import { allure } from "allure-playwright";
import { PageObject } from "../lib/Page";

export const runCheckTableTotals = (isSingleTest: boolean, iterations: number) => {
    console.log("Starting test: Check Table Totals Functionality");

    test.skip('Test Case 01 - Check Металлообработка Table Totals', async ({ page }) => {
        test.setTimeout(920000);
        console.log("Test Case 01 - Check Table Totals");

        // Step 1: Go to homepage
        await allure.step("Step 1: Go to homepage", async () => {
            await page.goto(ENV.BASE_URL);
            await page.waitForLoadState("networkidle");
        });

        // Step 2: Click the slider with Switch-Item0
        await allure.step("Step 2: Click the slider with Switch-Item0", async () => {
            const sliderSwitch = page.locator(`[data-testid="${CONST.SWITCH_ITEM0}"]`);
            await sliderSwitch.waitFor({ state: 'visible', timeout: 10000 });

            // Visual highlighting for debugging
            await sliderSwitch.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });

            await sliderSwitch.click();
            await page.waitForTimeout(1000);
        });

        // Step 3: Cycle through all Card items and capture values
        await allure.step("Step 3: Cycle through all Card items and capture values", async () => {
            const cardElements = page.locator(`[data-testid="${CONST.CARD}"]`);
            const cardCount = await cardElements.count();

            console.log(`Found ${cardCount} card elements`);

            for (let i = 0; i < cardCount; i++) {
                const currentCard = cardElements.nth(i);

                // Get the text content and extract the numeric value in brackets
                const cardText = await currentCard.textContent();
                const bracketMatch = cardText?.match(/\((\d+)\)/);

                if (bracketMatch) {
                    const expectedCount = parseInt(bracketMatch[1]);
                    const cardTitle = cardText?.replace(/\s*\(\d+\)/, '').trim();

                    console.log(`Processing card: ${cardTitle} with expected count: ${expectedCount}`);

                    // Step 5: Click on the card
                    await currentCard.evaluate((el: HTMLElement) => {
                        el.style.backgroundColor = 'lightblue';
                        el.style.border = '2px solid green';
                        el.style.color = 'red';
                    });
                    await currentCard.click();
                    await page.waitForLoadState("networkidle");

                    // Step 4: Validate table totals
                    await allure.step(`Step 4: Validate table totals for "${cardTitle}"`, async () => {
                        const table = page.locator(`[data-testid="${CONST.TABLE}"]`).nth(1);
                        await table.waitFor({ state: 'attached' });

                        // Wait for initial data to load
                        await page.waitForTimeout(5000);

                        // Check if we have any initial rows
                        const initialDataRows = table.locator('tbody tr.table-row.table-operation-new__row');
                        let currentRowCount = await initialDataRows.count();

                        if (currentRowCount === 0) {
                            console.log(`No initial rows found for ${cardTitle}, waiting longer...`);
                            await page.waitForTimeout(5000);
                            currentRowCount = await initialDataRows.count();
                        }

                        let previousRowCount = 0;
                        let scrollAttempts = 0;
                        const maxScrollAttempts = 50;

                        do {
                            previousRowCount = currentRowCount;

                            const tableContainer = table.locator('xpath=..').first();
                            await tableContainer.evaluate((el: HTMLElement) => {
                                el.scrollTop = el.scrollHeight;
                            });

                            const scrollableContainers = page.locator('[data-testid*="Scroll"], .scroll-container, .table-container, .virtual-scroll');
                            for (let i = 0; i < await scrollableContainers.count(); i++) {
                                await scrollableContainers.nth(i).evaluate((el: HTMLElement) => {
                                    el.scrollTop = el.scrollHeight;
                                });
                            }

                            await page.evaluate(() => {
                                window.scrollTo(0, document.body.scrollHeight);
                            });

                            await page.waitForTimeout(2000);
                            await page.waitForLoadState('networkidle');

                            const dataRows = table.locator('tbody tr.table-row.table-operation-new__row');
                            currentRowCount = await dataRows.count();
                            scrollAttempts++;

                        } while (currentRowCount > previousRowCount && scrollAttempts < maxScrollAttempts);

                        const result = currentRowCount === expectedCount ? 'PASSED' : 'FAILED';
                        const colorCode = result === 'PASSED' ? '\x1b[32m' : '\x1b[31m'; // Green for PASSED, Red for FAILED
                        const resetCode = '\x1b[0m'; // Reset color
                        console.log(`${cardTitle}, ${currentRowCount}, ${colorCode}${result}${resetCode}`);

                        expect(currentRowCount).toBe(expectedCount);
                    });

                    // Navigate back to homepage for next card
                    await page.goto(ENV.BASE_URL);
                    await page.waitForLoadState("networkidle");

                    // Click the slider again to refresh the page
                    const sliderRefresh = page.locator(`[data-testid="${CONST.SWITCH_ITEM0}"]`);
                    await sliderRefresh.waitFor({ state: 'visible', timeout: 30000 });
                    await sliderRefresh.click();
                    await page.waitForTimeout(1000);
                } else {
                    console.log(`Skipping card "${cardText}" - no numeric value found in brackets`);
                }
            }
        });
    });
    test('Test Case 02 - Check Сборка Table Totals', async ({ page }) => {
        test.setTimeout(920000);
        console.log("Test Case 01 - Check Сборка Table Totals");

        // Step 4: Click the slider with Switch-Item1
        await allure.step("Step 1: Click the slider with Switch-Item1", async () => {
            console.log("Step 1: Click the slider with Switch-Item1");
            const sliderSwitch = page.locator(`[data-testid="${CONST.SWITCH_ITEM1}"]`);
            await sliderSwitch.waitFor({ state: 'visible', timeout: 10000 });

            // Visual highlighting for debugging
            await sliderSwitch.evaluate((el: HTMLElement) => {
                el.style.backgroundColor = 'yellow';
                el.style.border = '2px solid red';
                el.style.color = 'blue';
            });

            await sliderSwitch.click();
            await page.waitForTimeout(3000);
        });

        // Step 5: Cycle through all Card items and capture values (Switch-Item1)
        await allure.step("Step 2: Cycle through all Card items and capture values (Switch-Item1)", async () => {
            console.log("Step 2: Cycle through all Card items and capture values (Switch-Item1)");
            const cardElements = page.locator(`[data-testid="${CONST.CARD}"]`);
            const cardCount = await cardElements.count();

            console.log(`Found ${cardCount} card elements`);

            for (let i = 0; i < cardCount; i++) {
                const currentCard = cardElements.nth(i);

                // Get the text content and extract the numeric value in brackets
                const cardText = await currentCard.textContent();
                const bracketMatch = cardText?.match(/\((\d+)\)/);

                if (bracketMatch) {
                    const expectedCount = parseInt(bracketMatch[1]);
                    const cardTitle = cardText?.replace(/\s*\(\d+\)/, '').trim();

                    console.log(`Processing card: ${cardTitle} with expected count: ${expectedCount}`);

                    // Step 6: Click on the card
                    await currentCard.evaluate((el: HTMLElement) => {
                        el.style.backgroundColor = 'lightblue';
                        el.style.border = '2px solid green';
                        el.style.color = 'red';
                    });
                    await currentCard.click();
                    await page.waitForLoadState("networkidle");

                    // Step 7: Validate table totals
                    await allure.step(`Step 3: Validate table totals for "${cardTitle}"`, async () => { //
                        console.log("Step 3: Validate table totals for \"${cardTitle}\"");
                        const table = page.locator(`[data-testid="${CONST.TABLE_SBORKA}"]`);
                        await table.waitFor({ state: 'attached' });

                        // Wait for initial data to load
                        await page.waitForTimeout(5000);

                        // Check if we have any initial rows (different selector for Сборка table)
                        const initialDataRows = table.locator('tbody tr.table-row');
                        let currentRowCount = await initialDataRows.count();

                        if (currentRowCount === 0) {
                            console.log(`No initial rows found for ${cardTitle}, waiting longer...`);
                            await page.waitForTimeout(5000);
                            currentRowCount = await initialDataRows.count();
                        }

                        let previousRowCount = 0;
                        let scrollAttempts = 0;
                        const maxScrollAttempts = 50;

                        do {
                            previousRowCount = currentRowCount;

                            const tableContainer = table.locator('xpath=..').first();
                            await tableContainer.evaluate((el: HTMLElement) => {
                                el.scrollTop = el.scrollHeight;
                            });

                            const scrollableContainers = page.locator('[data-testid*="Scroll"], .scroll-container, .table-container, .virtual-scroll');
                            for (let i = 0; i < await scrollableContainers.count(); i++) {
                                await scrollableContainers.nth(i).evaluate((el: HTMLElement) => {
                                    el.scrollTop = el.scrollHeight;
                                });
                            }

                            await page.evaluate(() => {
                                window.scrollTo(0, document.body.scrollHeight);
                            });

                            await page.waitForTimeout(2000);
                            await page.waitForLoadState('networkidle');

                            const dataRows = table.locator('tbody tr.table-row');
                            currentRowCount = await dataRows.count();
                            scrollAttempts++;

                        } while (currentRowCount > previousRowCount && scrollAttempts < maxScrollAttempts);

                        // Debug: Print first few rows to see what we're counting
                        if (currentRowCount !== expectedCount) {
                            console.log(`=== DEBUG: Found ${currentRowCount} rows, expected ${expectedCount} ===`);
                            const allRows = table.locator('tbody tr');
                            const totalRows = await allRows.count();
                            console.log(`Total tbody rows: ${totalRows}`);

                            for (let i = 0; i < Math.min(5, totalRows); i++) {
                                const row = allRows.nth(i);
                                const rowClasses = await row.getAttribute('class');
                                const rowText = await row.textContent();
                                console.log(`Row ${i + 1}: classes="${rowClasses}", text="${rowText?.substring(0, 100)}..."`);
                            }
                            console.log("=== END DEBUG ===");
                        }

                        const result = currentRowCount === expectedCount ? 'PASSED' : 'FAILED';
                        const colorCode = result === 'PASSED' ? '\x1b[32m' : '\x1b[31m'; // Green for PASSED, Red for FAILED
                        const resetCode = '\x1b[0m'; // Reset color
                        console.log(`${cardTitle}, ${currentRowCount}, ${colorCode}${result}${resetCode}`);

                        expect(currentRowCount).toBe(expectedCount);
                    });

                    // Navigate back to homepage for next card
                    await page.goto(ENV.BASE_URL);
                    await page.waitForLoadState("networkidle");

                    // Click the slider again to refresh the page
                    const sliderRefresh = page.locator(`[data-testid="${CONST.SWITCH_ITEM1}"]`);
                    await sliderRefresh.waitFor({ state: 'visible', timeout: 30000 });
                    await sliderRefresh.click();
                    await page.waitForTimeout(1000);
                } else {
                    console.log(`Skipping card "${cardText}" - no numeric value found in brackets`);
                }
            }
        });
    });
};
