import { test, expect, Page } from "@playwright/test";
import { ENV, SELECTORS, CONST } from "../config";
import { allure } from "allure-playwright";
import { PageObject } from "../lib/Page";
import logger from "../lib/utils/logger";

export const runCheckTableTotals = (isSingleTest: boolean, iterations: number) => {
    logger.log("Starting test: Check Table Totals Functionality");

    test('Test Case 01 - Check Металлообработка Table Totals', async ({ page }) => {
        test.setTimeout(920000);
        logger.log("Test Case 01 - Check Table Totals");

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

            logger.log(`Found ${cardCount} card elements`);

            for (let i = 0; i < cardCount; i++) {
                const currentCard = cardElements.nth(i);

                // Get the text content and extract the numeric value in brackets
                const cardText = await currentCard.textContent();
                const bracketMatch = cardText?.match(/\((\d+)\)/);

                if (bracketMatch) {
                    const expectedCount = parseInt(bracketMatch[1]);
                    const cardTitle = cardText?.replace(/\s*\(\d+\)/, '').trim();

                    logger.log(`Processing card: ${cardTitle} with expected count: ${expectedCount}`);

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
                            logger.log(`No initial rows found for ${cardTitle}, waiting longer...`);
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
                        logger.log(`${cardTitle}, ${currentRowCount}, ${colorCode}${result}${resetCode}`);

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
                    logger.log(`Skipping card "${cardText}" - no numeric value found in brackets`);
                }
            }
        });
    });
    test('Test Case 02 - Check Сборка Table Totals', async ({ page }) => {
        test.setTimeout(920000);
        logger.log("Test Case 01 - Check Сборка Table Totals");

        // Step 4: Click the slider with Switch-Item1
        await allure.step("Step 1: Click the slider with Switch-Item1", async () => {
            logger.log("Step 1: Click the slider with Switch-Item1");
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
            logger.log("Step 2: Cycle through all Card items and capture values (Switch-Item1)");
            const cardElements = page.locator(`[data-testid="${CONST.CARD}"]`);
            const cardCount = await cardElements.count();

            logger.log(`Found ${cardCount} card elements`);

            for (let i = 0; i < cardCount; i++) {
                const currentCard = cardElements.nth(i);

                // Get the text content and extract the numeric value in brackets
                const cardText = await currentCard.textContent();
                const bracketMatch = cardText?.match(/\((\d+)\)/);

                if (bracketMatch) {
                    const expectedCount = parseInt(bracketMatch[1]);
                    const cardTitle = cardText?.replace(/\s*\(\d+\)/, '').trim();

                    logger.log(`Processing card: ${cardTitle} with expected count: ${expectedCount}`);

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
                        logger.log("Step 3: Validate table totals for \"${cardTitle}\"");
                        const table = page.locator(`[data-testid="${CONST.TABLE_SBORKA}"]`);
                        await table.waitFor({ state: 'attached' });

                        // Wait for initial data to load
                        await page.waitForTimeout(5000);

                        // Check if we have any initial rows (different selector for Сборка table)
                        const initialDataRows = table.locator('tbody tr.table-row');
                        let currentRowCount = await initialDataRows.count();

                        if (currentRowCount === 0) {
                            logger.log(`No initial rows found for ${cardTitle}, waiting longer...`);
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

                        // Count the rows that meet our specifications and divide by 2
                        const specRows = table.locator('tbody tr.table-row');
                        const rowCount = await specRows.count();

                        // If odd, subtract 2 then divide by 2; if even, just divide by 2
                        if (rowCount % 2 === 1) {
                            currentRowCount = Math.floor((rowCount - 2) / 2);
                        } else {
                            currentRowCount = rowCount / 2;
                        }

                        logger.log(`Spec rows found: ${rowCount}`);
                        logger.log(`Calculated count: ${currentRowCount}`);
                        logger.log(`Expected count: ${expectedCount}`);

                        // Use the expected count directly since we're now excluding the problematic rows
                        const expectedTableCount = expectedCount;

                        const result = currentRowCount === expectedTableCount ? 'PASSED' : 'FAILED';
                        const colorCode = result === 'PASSED' ? '\x1b[32m' : '\x1b[31m'; // Green for PASSED, Red for FAILED
                        const resetCode = '\x1b[0m'; // Reset color
                        logger.log(`${cardTitle}, ${currentRowCount}, ${colorCode}${result}${resetCode}`);

                        expect(currentRowCount).toBe(expectedTableCount);
                    });

                    // Navigate back to homepage for next card
                    await page.goto(ENV.BASE_URL);
                    await page.waitForLoadState("networkidle");

                    // Click the slider again to refresh the page (ensure we're on Switch-Item1 for Test Case 02)
                    const sliderRefresh = page.locator(`[data-testid="${CONST.SWITCH_ITEM1}"]`);
                    await sliderRefresh.waitFor({ state: 'visible', timeout: 30000 });

                    // Always click the slider to ensure we're on the right view
                    await sliderRefresh.click();
                    await page.waitForTimeout(2000);

                    // Debug: Log which slider is currently active
                    const switchItem0 = page.locator(`[data-testid="${CONST.SWITCH_ITEM0}"]`);
                    const switchItem1 = page.locator(`[data-testid="${CONST.SWITCH_ITEM1}"]`);

                    const item0Selected = await switchItem0.evaluate((el: HTMLElement) => {
                        return el.getAttribute('aria-pressed') === 'true' ||
                            el.classList.contains('selected') ||
                            el.classList.contains('active');
                    });

                    const item1Selected = await switchItem1.evaluate((el: HTMLElement) => {
                        return el.getAttribute('aria-pressed') === 'true' ||
                            el.classList.contains('selected') ||
                            el.classList.contains('active');
                    });

                    logger.log(`After reload - Switch-Item0 selected: ${item0Selected}, Switch-Item1 selected: ${item1Selected}`);
                } else {
                    logger.log(`Skipping card "${cardText}" - no numeric value found in brackets`);
                }
            }
        });
    });
};
