import { test, expect } from "@playwright/test";
import { SELECTORS } from "../config";
import logger from "../lib/utils/logger";
import { allure } from "allure-playwright";
import { CreatePartsDatabasePage } from "../pages/PartsDatabasePage";
import * as SelectorsPartsDataBase from "../lib/Constants/SelectorsPartsDataBase";
import { expectSoftWithScreenshot } from "../lib/Page";
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from "../lib/Constants/TimeoutConstants";

/**
 * U006 archive + parts DB cleanup (golden: repo-at-single-U001/testcases/U006.spec.ts lines 28–369).
 */
export const runU006Archive = () => {
    test('U006 TC 01 — Файловая база: архив строк по фильтру «Test»', async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);
        const detailsPage = new CreatePartsDatabasePage(page);
        const getVisibleFilteredRows = async () => {
            const table = page.locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE).first();
            const rows = table
                .locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE_ROWS)
                .filter({ hasText: SelectorsPartsDataBase.U006_SEARCH_PREFIX });
            const visibleRows = [];
            const count = await rows.count();

            for (let index = 0; index < count; index++) {
                const row = rows.nth(index);
                if (await row.isVisible().catch(() => false)) {
                    visibleRows.push(row);
                }
            }

            return visibleRows;
        };

        await allure.step("Step 1: Navigate to filebase page", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.FILES.URL);
            await page.waitForLoadState("networkidle");
            logger.info("Navigated to filebase page");
        });

        await allure.step("Step 2: Найти поле поиска в таблице файловой базы", async () => {
            const searchInput = page.locator(SelectorsPartsDataBase.FILEBASE_PAGE_TABLE_SEARCH_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                },
                "Step 2: Verify search input is visible",
                testInfo,
            );
            await detailsPage.highlightElement(searchInput);

            logger.info("Found search input for filebase filtering");
        });

        await allure.step("Step 3: Search for 'Test' and press Enter", async () => {
            const table = page.locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE).first();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                },
                "Step 3: Verify filebase results table is visible",
                testInfo,
            );

            const searchInput = page.locator(SelectorsPartsDataBase.FILEBASE_PAGE_TABLE_SEARCH_INPUT);
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                },
                "Step 3: Verify filebase table search input is visible before entering prefix",
                testInfo,
            );
            await detailsPage.highlightElement(searchInput);

            await searchInput.fill(SelectorsPartsDataBase.U006_SEARCH_PREFIX);
            await expectSoftWithScreenshot(
                page,
                async () => {
                    await expect.soft(searchInput).toHaveValue(SelectorsPartsDataBase.U006_SEARCH_PREFIX, {
                        timeout: WAIT_TIMEOUTS.SHORT,
                    });
                },
                "Step 3: Verify search value synced before Enter (Vue v-model)",
                testInfo,
            );
            await searchInput.press("Enter");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(TIMEOUTS.STANDARD);

            const filteredRows = table
                .locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE_ROWS)
                .filter({ hasText: SelectorsPartsDataBase.U006_SEARCH_PREFIX });
            // Do not require filteredCount === total row count: virtualized / DOM row count can include
            // many slots while only some rows contain the prefix text.
            await filteredRows.first().waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.PAGE_RELOAD }).catch(() => {
                logger.info(`No filtered rows visible for '${SelectorsPartsDataBase.U006_SEARCH_PREFIX}'`);
            });

            logger.info("Searched filebase for prefix");
        });

        await allure.step("Step 4: Archive all items in the table", async () => {
            const table = page.locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE).first();
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(table).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                },
                "Step 4: Verify filebase results table is visible before archiving",
                testInfo,
            );
            await page.waitForLoadState("load");
            await page.waitForTimeout(TIMEOUTS.STANDARD);

            let visibleFilteredRows = await getVisibleFilteredRows();
            let rowCount = visibleFilteredRows.length;
            if (rowCount === 0) {
                await page.waitForLoadState("networkidle");
                await page.waitForTimeout(TIMEOUTS.STANDARD);
                visibleFilteredRows = await getVisibleFilteredRows();
                rowCount = visibleFilteredRows.length;
            }
            console.log(`Found ${rowCount} rows to archive`);

            let archivedCount = 0;

            // Continue until no filtered rows remain (archive bottom-up).
            while (rowCount > 0) {
                const rowCountBeforeArchive = rowCount;
                // Re-evaluate visible filtered rows every iteration and take the last one.
                visibleFilteredRows = await getVisibleFilteredRows();
                rowCount = visibleFilteredRows.length;
                if (rowCount === 0) {
                    break;
                }
                const targetRow = visibleFilteredRows[rowCount - 1];

                await detailsPage.highlightElement(targetRow);

                console.log(`Processing row ${archivedCount + 1} of ${rowCount}`);

                // Find and click the Archive button
                const archiveButton = page.locator(SelectorsPartsDataBase.BASE_FILE_BUTTONS_BAN_BUTTON);
                await expectSoftWithScreenshot(
                    page,
                    () => {
                        expect.soft(archiveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                    },
                    "Step 4: Verify archive button is visible",
                    testInfo,
                );
                await detailsPage.highlightElement(archiveButton);

                let archivedThisRow = false;
                let currentRowCount = rowCountBeforeArchive;
                const maxArchiveAttempts = 3;
                for (let archiveAttempt = 1; archiveAttempt <= maxArchiveAttempts; archiveAttempt++) {
                    visibleFilteredRows = await getVisibleFilteredRows();
                    currentRowCount = visibleFilteredRows.length;
                    if (currentRowCount < rowCountBeforeArchive) {
                        archivedThisRow = true;
                        break;
                    }

                    const rowForAttempt = visibleFilteredRows[currentRowCount - 1];
                    await detailsPage.highlightElement(rowForAttempt);
                    await rowForAttempt.click({ force: true });
                    await page.waitForTimeout(TIMEOUTS.MEDIUM);

                    if (!(await archiveButton.isEnabled().catch(() => false))) {
                        if (await rowForAttempt.isVisible().catch(() => false)) {
                            await rowForAttempt.locator("td").first().click({ force: true });
                            await page.waitForTimeout(TIMEOUTS.MEDIUM);
                        }
                    }
                    await expect(archiveButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
                    await archiveButton.click();
                    await page.waitForTimeout(TIMEOUTS.STANDARD);

                    // Wait for and interact with the confirmation dialog
                    const confirmDialog = page.locator(SelectorsPartsDataBase.BASE_FILE_BAN_DIALOG);
                    await confirmDialog.waitFor({ state: "visible", timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
                    if (!(await confirmDialog.isVisible().catch(() => false))) {
                        await page.waitForLoadState("networkidle").catch(() => {});
                        await page.waitForTimeout(TIMEOUTS.STANDARD);
                        currentRowCount = (await getVisibleFilteredRows()).length;

                        if (currentRowCount < rowCountBeforeArchive) {
                            archivedThisRow = true;
                            console.log(`✅ Archived item ${archivedCount + 1} without confirmation dialog`);
                            break;
                        }
                    } else {
                        await expectSoftWithScreenshot(
                            page,
                            () => {
                                expect.soft(confirmDialog).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                            },
                            "Step 4: Verify confirmation dialog is visible",
                            testInfo,
                        );
                        await detailsPage.highlightElement(confirmDialog);

                        // Click the Yes button in the dialog
                        const yesButton = confirmDialog.locator(SelectorsPartsDataBase.BASE_FILE_BAN_DIALOG_CONTENT_BUTTONS_YES);
                        await expectSoftWithScreenshot(
                            page,
                            () => {
                                expect.soft(yesButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
                            },
                            "Step 4: Verify Yes button is visible in confirmation dialog",
                            testInfo,
                        );
                        await detailsPage.highlightElement(yesButton);

                        await yesButton.click();
                        await page.waitForLoadState("networkidle").catch(() => {});
                    }

                    currentRowCount = await expect
                        .poll(async () => (await getVisibleFilteredRows()).length, {
                            timeout: WAIT_TIMEOUTS.SHORT,
                        })
                        .toBeLessThan(rowCountBeforeArchive)
                        .then(async () => (await getVisibleFilteredRows()).length)
                        .catch(async () => (await getVisibleFilteredRows()).length);

                    if (currentRowCount < rowCountBeforeArchive) {
                        archivedThisRow = true;
                        break;
                    }

                    console.log(`Archive attempt ${archiveAttempt} did not remove a row; retrying.`);
                    await page.waitForTimeout(TIMEOUTS.STANDARD);
                }

                expect(archivedThisRow).toBeTruthy();

                archivedCount++;
                console.log(`✅ Archived item ${archivedCount}`);

                // Update row count after archiving
                rowCount = currentRowCount;
                console.log(`Remaining rows: ${rowCount}`);

                // Small delay to make the process visible
                await page.waitForTimeout(TIMEOUTS.MEDIUM);
            }

            console.log(`✅ Successfully archived all ${archivedCount} items`);
            logger.info(`All items have been archived successfully. Total archived: ${archivedCount}`);
        });

        await allure.step("Step 5: Verify no rows left for the search prefix", async () => {
            const table = page.locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE).first();
            const rowsMatchingPrefix = table
                .locator(SelectorsPartsDataBase.FILEBASE_RESULTS_TABLE_ROWS)
                .filter({ hasText: SelectorsPartsDataBase.U006_SEARCH_PREFIX });
            const remainingMatching = await rowsMatchingPrefix.count();

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingMatching).toBe(0);
                },
                "Step 5: Verify no filebase rows still match the archive prefix after archiving",
                testInfo,
            );
            console.log(`✅ No rows left matching prefix (${remainingMatching} matching rows)`);
            logger.info("Filebase verification complete — no remaining rows for prefix");
        });
    });


    test(`U006 CL 01 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_DETAIL_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            // Same flow as ERP-969 cleanup: search full name, exact row text match, archive bottom-up (PartsDatabaseHelper.cleanupTestDetail).
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_DETAIL_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 01: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
    test(`U006 CL 02 — Архивация совпадающих деталей: ${SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME}`, async ({ page }, testInfo) => {
        test.setTimeout(TEST_TIMEOUTS.LONG);


        const detailsPage = new CreatePartsDatabasePage(page);

        await allure.step("Step 1: Перейдите на страницу 'База деталей'", async () => {
            await detailsPage.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
            await page.waitForLoadState("networkidle");
        });

        await allure.step("Step 2: Архивировать все детали с точным совпадением имени", async () => {
            await detailsPage.cleanupTestDetail(
                page,
                SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
                undefined,
                undefined,
                undefined,
                undefined,
                testInfo,
            );
        });

        await allure.step("Step 3: Проверить, что не осталось строк с точным совпадением имени", async () => {
            const remainingExactMatches = await detailsPage.getExactMatchRowCount(
                page,
                SelectorsPartsDataBase.U006_TEST_SPECIAL_CHAR_NAME,
                SelectorsPartsDataBase.DETAIL_TABLE,
            );
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(remainingExactMatches).toBe(0);
                },
                "CL 02: Verify zero exact-match rows remain after archive cleanup",
                testInfo,
            );
        });
    });
};


