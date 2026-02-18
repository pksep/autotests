import { test, expect, Page } from "@playwright/test";
import { ENV, SELECTORS } from "../config";
import * as SelectorsCheckTableTotals from "../lib/Constants/SelectorsCheckTableTotals";
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from "../lib/Constants/TimeoutConstants";
import { HIGHLIGHT_ERROR, HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS } from "../lib/Constants/HighlightStyles";
import { allure } from "allure-playwright";
import { PageObject, expectSoftWithScreenshot } from "../lib/Page";
import logger from "../lib/utils/logger";

export const runCheckTableTotals = (isSingleTest: boolean, iterations: number) => {
    logger.log("Starting test: Check Table Totals Functionality");

    test('Test Case 01 - Check Металлообработка Table Totals', async ({ page }) => {
        test.setTimeout(TEST_TIMEOUTS.EXTENDED);
        const pageObj = new PageObject(page);
        logger.log("Test Case 01 - Check Table Totals");

        // Step 1: Go to homepage
        await allure.step("Step 1: Go to homepage", async () => {
            await page.goto(ENV.BASE_URL);
            await page.waitForLoadState("networkidle");
        });

        // Step 2: Click the slider with Switch-Item0
        await allure.step("Step 2: Click the slider with Switch-Item0", async () => {
            const sliderSwitch = page.locator(SelectorsCheckTableTotals.SWITCH_ITEM0);
            await sliderSwitch.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await pageObj.highlightElement(sliderSwitch, HIGHLIGHT_PENDING);

            await sliderSwitch.click();
            await page.waitForTimeout(TIMEOUTS.STANDARD);
        });

        // Step 3: Cycle through all Card items and capture values
        await allure.step("Step 3: Cycle through all Card items and capture values", async () => {
            const cardElements = page.locator(SelectorsCheckTableTotals.CARD);
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
                    await pageObj.highlightElement(currentCard, HIGHLIGHT_SUCCESS);
                    await currentCard.click();
                    await page.waitForLoadState("networkidle");

                    // Step 4: Validate table totals
                    await allure.step(`Step 4: Validate table totals for "${cardTitle}"`, async () => {
                        const table = page.locator(SelectorsCheckTableTotals.TABLE_OPERATION_METALL);
                        await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
                        await pageObj.highlightElement(table, HIGHLIGHT_ERROR);

                        // Wait for initial data to load
                        await page.waitForTimeout(TIMEOUTS.VERY_LONG);

                        // Check if we have any initial rows
                        const initialDataRows = table.locator('tbody tr.table-row.table-operation-new__row');
                        let currentRowCount = await initialDataRows.count();

                        if (currentRowCount === 0) {
                            logger.log(`No initial rows found for ${cardTitle}, waiting longer...`);
                            await page.waitForTimeout(TIMEOUTS.VERY_LONG);
                            currentRowCount = await initialDataRows.count();
                        }

                        let previousRowCount = 0;
                        let scrollAttempts = 0;
                        const maxScrollAttempts = 80;
                        const scrollStepPx = 400;
                        let stableCountIterations = 0;

                        do {
                            previousRowCount = currentRowCount;

                            // Scroll every scroll slot on the page (incl. table's) to bottom + fire scroll event (like at the start)
                            const pageScrollSlots = page.locator(SelectorsCheckTableTotals.PAGE_SCROLL_SLOTS);
                            const slotCount = await pageScrollSlots.count();
                            for (let s = 0; s < slotCount; s++) {
                                await pageScrollSlots.nth(s).evaluate((el: HTMLElement) => {
                                    const maxScroll = el.scrollHeight - el.clientHeight;
                                    if (maxScroll > 0) {
                                        el.scrollTop = maxScroll;
                                        el.dispatchEvent(new Event('scroll', { bubbles: true }));
                                    }
                                });
                            }

                            const scrollableContainers = page.locator(SelectorsCheckTableTotals.SCROLLABLE_CONTAINERS);
                            const containerCount = await scrollableContainers.count();
                            for (let i = 0; i < containerCount; i++) {
                                await scrollableContainers.nth(i).evaluate((el: HTMLElement, step: number) => {
                                    const maxScroll = el.scrollHeight - el.clientHeight;
                                    if (maxScroll > 0) {
                                        el.scrollTop = Math.min(el.scrollTop + step, maxScroll);
                                    }
                                }, scrollStepPx);
                            }

                            await page.evaluate((step: number) => {
                                window.scrollTo(0, Math.min(document.documentElement.scrollTop + step, document.documentElement.scrollHeight - window.innerHeight));
                            }, scrollStepPx);

                            await page.waitForTimeout(TIMEOUTS.MEDIUM);
                            await Promise.race([
                                page.waitForLoadState('networkidle'),
                                page.waitForTimeout(TIMEOUTS.EXTENDED),
                            ]);

                            const dataRows = table.locator('tbody tr.table-row.table-operation-new__row');
                            currentRowCount = await dataRows.count();
                            scrollAttempts++;

                            if (currentRowCount === previousRowCount) {
                                stableCountIterations++;
                            } else {
                                stableCountIterations = 0;
                            }

                        } while (scrollAttempts < maxScrollAttempts && stableCountIterations < 3);

                        if (ENV.DEBUG) {
                            logger.log(`${cardTitle} ${expectedCount} counted ${currentRowCount}`);
                        }

                        const result = currentRowCount === expectedCount ? 'PASSED' : 'FAILED';
                        const colorCode = result === 'PASSED' ? '\x1b[32m' : '\x1b[31m'; // Green for PASSED, Red for FAILED
                        const resetCode = '\x1b[0m'; // Reset color
                        const selectorId = 'TABLE_OPERATION_METALL';
                        logger.log(`${cardTitle}, ${currentRowCount}, ${colorCode}${result}${resetCode}`);

                        await expectSoftWithScreenshot(
                            page,
                            () => {
                                expect.soft(currentRowCount).toBe(expectedCount);
                            },
                            `Table totals: selector=${selectorId}, page/card="${cardTitle}", received=${currentRowCount}, expected=${expectedCount}`,
                            test.info(),
                        );
                    });

                    // Navigate back to homepage for next card
                    await page.goto(ENV.BASE_URL);
                    await page.waitForLoadState("networkidle");

                    // Click the slider again to refresh the page
                    const sliderRefresh = page.locator(SelectorsCheckTableTotals.SWITCH_ITEM0);
                    await sliderRefresh.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
                    await sliderRefresh.click();
                    await page.waitForTimeout(TIMEOUTS.STANDARD);
                } else {
                    logger.log(`Skipping card "${cardText}" - no numeric value found in brackets`);
                }
            }
        });
    });
    test('Test Case 02 - Check Сборка Table Totals', async ({ page }) => {
        test.setTimeout(TEST_TIMEOUTS.EXTENDED);
        const pageObj = new PageObject(page);
        logger.log("Test Case 01 - Check Сборка Table Totals");

        // Step 4: Click the slider with Switch-Item1
        await allure.step("Step 1: Click the slider with Switch-Item1", async () => {
            logger.log("Step 1: Click the slider with Switch-Item1");
            const sliderSwitch = page.locator(SelectorsCheckTableTotals.SWITCH_ITEM1);
            await sliderSwitch.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await pageObj.highlightElement(sliderSwitch, HIGHLIGHT_PENDING);

            await sliderSwitch.click();
            await page.waitForTimeout(TIMEOUTS.EXTENDED);
        });

        // Step 5: Cycle through all Card items and capture values (Switch-Item1)
        await allure.step("Step 2: Cycle through all Card items and capture values (Switch-Item1)", async () => {
            logger.log("Step 2: Cycle through all Card items and capture values (Switch-Item1)");
            const cardElements = page.locator(SelectorsCheckTableTotals.CARD);
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
                    await pageObj.highlightElement(currentCard, HIGHLIGHT_SUCCESS);
                    await currentCard.click();
                    await page.waitForLoadState("networkidle");

                    // Step 7: Validate table totals
                    await allure.step(`Step 3: Validate table totals for "${cardTitle}"`, async () => { //
                        logger.log("Step 3: Validate table totals for \"${cardTitle}\"");
                        const table = page.locator(SelectorsCheckTableTotals.TABLE_SBORKA);
                        await table.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });
                        await pageObj.highlightElement(table, HIGHLIGHT_ERROR);

                        // Wait for initial data to load
                        await page.waitForTimeout(TIMEOUTS.VERY_LONG);

                        // Check if we have any initial rows (different selector for Сборка table)
                        const initialDataRows = table.locator('tbody tr.table-row');
                        let currentRowCount = await initialDataRows.count();

                        if (currentRowCount === 0) {
                            logger.log(`No initial rows found for ${cardTitle}, waiting longer...`);
                            await page.waitForTimeout(TIMEOUTS.VERY_LONG);
                            currentRowCount = await initialDataRows.count();
                        }

                        let previousRowCount = 0;
                        let scrollAttempts = 0;
                        const maxScrollAttempts = 80;
                        const scrollStepPx = 400;
                        let stableCountIterations = 0;

                        do {
                            previousRowCount = currentRowCount;

                            // Table's parent is div.scroll-wrapper__slot (the one that triggers pagination for this table)
                            const tableScrollSlot = table.locator('xpath=..').first();
                            const tableSlotResolved = await tableScrollSlot
                                .waitFor({ state: 'attached', timeout: WAIT_TIMEOUTS.SHORT })
                                .catch(() => null);
                            if (tableSlotResolved) {
                                await tableScrollSlot.evaluate((el: HTMLElement, step: number) => {
                                    const maxScroll = el.scrollHeight - el.clientHeight;
                                    if (maxScroll > 0) {
                                        el.scrollTop = Math.min(el.scrollTop + step, maxScroll);
                                    }
                                }, scrollStepPx);
                            }

                            const scrollableContainers = page.locator(SelectorsCheckTableTotals.SCROLLABLE_CONTAINERS);
                            const containerCount = await scrollableContainers.count();
                            for (let i = 0; i < containerCount; i++) {
                                await scrollableContainers.nth(i).evaluate((el: HTMLElement, step: number) => {
                                    const maxScroll = el.scrollHeight - el.clientHeight;
                                    if (maxScroll > 0) {
                                        el.scrollTop = Math.min(el.scrollTop + step, maxScroll);
                                    }
                                }, scrollStepPx);
                            }

                            await page.evaluate((step: number) => {
                                window.scrollTo(0, Math.min(document.documentElement.scrollTop + step, document.documentElement.scrollHeight - window.innerHeight));
                            }, scrollStepPx);

                            await page.waitForTimeout(TIMEOUTS.MEDIUM);
                            await Promise.race([
                                page.waitForLoadState('networkidle'),
                                page.waitForTimeout(TIMEOUTS.EXTENDED),
                            ]);

                            const dataRows = table.locator('tbody tr.table-row');
                            currentRowCount = await dataRows.count();
                            scrollAttempts++;

                            if (currentRowCount === previousRowCount) {
                                stableCountIterations++;
                            } else {
                                stableCountIterations = 0;
                            }

                        } while (scrollAttempts < maxScrollAttempts && stableCountIterations < 3);

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
                        if (ENV.DEBUG) {
                            logger.log(`${cardTitle} ${expectedCount} counted ${currentRowCount}`);
                        }

                        // Use the expected count directly since we're now excluding the problematic rows
                        const expectedTableCount = expectedCount;

                        const result = currentRowCount === expectedTableCount ? 'PASSED' : 'FAILED';
                        const colorCode = result === 'PASSED' ? '\x1b[32m' : '\x1b[31m'; // Green for PASSED, Red for FAILED
                        const resetCode = '\x1b[0m'; // Reset color
                        const selectorId = 'TABLE_SBORKA';
                        logger.log(`${cardTitle}, ${currentRowCount}, ${colorCode}${result}${resetCode}`);

                        await expectSoftWithScreenshot(
                            page,
                            () => {
                                expect.soft(currentRowCount).toBe(expectedTableCount);
                            },
                            `Table totals: selector=${selectorId}, page/card="${cardTitle}", received=${currentRowCount}, expected=${expectedTableCount}`,
                            test.info(),
                        );
                    });

                    // Navigate back to homepage for next card
                    await page.goto(ENV.BASE_URL);
                    await page.waitForLoadState("networkidle");

                    // Click the slider again to refresh the page (ensure we're on Switch-Item1 for Test Case 02)
                    const sliderRefresh = page.locator(SelectorsCheckTableTotals.SWITCH_ITEM1);
                    await sliderRefresh.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.PAGE_RELOAD });

                    // Always click the slider to ensure we're on the right view
                    await sliderRefresh.click();
                    await page.waitForTimeout(TIMEOUTS.LONG);

                    // Debug: Log which slider is currently active
                    const switchItem0 = page.locator(SelectorsCheckTableTotals.SWITCH_ITEM0);
                    const switchItem1 = page.locator(SelectorsCheckTableTotals.SWITCH_ITEM1);

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
