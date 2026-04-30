import { test, expect } from "@playwright/test";
import { WAIT_TIMEOUTS } from "../lib/Constants/TimeoutConstants";
import logger from "../lib/utils/logger";
import { allure } from "allure-playwright";

import * as MetalworkingSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as ProductionSelectors from '../lib/Constants/SelectorsProductionPage';
import * as OnlineScoreboardSelectors from '../lib/Constants/SelectorsOnlineScoreboard';

const PAGE_CONFIGS = [
    {
        url: '/production/metalloworking',
        selectors: {
            GEAR_ICON: MetalworkingSelectors.METALWORKING_GEAR_ICON,
            SIDEBAR_MODAL: MetalworkingSelectors.METALWORKING_SIDEBAR_MODAL,
            CHECKBOX_NO: MetalworkingSelectors.METALWORKING_CHECKBOX_NO,
            CHECKBOX_NO_PZ: MetalworkingSelectors.METALWORKING_CHECKBOX_NO_PZ,
            SAVE_BUTTON: MetalworkingSelectors.METALWORKING_SAVE_BUTTON,
            TABLE_HEADER_NO: MetalworkingSelectors.METALWORKING_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: MetalworkingSelectors.METALWORKING_TABLE_HEADER_NO_PZ
        }
    },
    {
        url: '/production/board-production-mo',
        selectors: {
            GEAR_ICON: ProductionSelectors.PRODUCTION_GEAR_ICON,
            SIDEBAR_MODAL: ProductionSelectors.PRODUCTION_SIDEBAR_MODAL,
            CHECKBOX_NO: ProductionSelectors.PRODUCTION_CHECKBOX_NO,
            CHECKBOX_NO_PZ: ProductionSelectors.PRODUCTION_CHECKBOX_NO_PZ,
            SAVE_BUTTON: ProductionSelectors.PRODUCTION_SAVE_BUTTON,
            TABLE_HEADER_NO: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO_PZ
        }
    },
    {
        url: '/production/board-production',
        selectors: {
            GEAR_ICON: ProductionSelectors.PRODUCTION_GEAR_ICON,
            SIDEBAR_MODAL: ProductionSelectors.PRODUCTION_SIDEBAR_MODAL,
            CHECKBOX_NO: ProductionSelectors.PRODUCTION_CHECKBOX_NO,
            CHECKBOX_NO_PZ: ProductionSelectors.PRODUCTION_CHECKBOX_NO_PZ,
            SAVE_BUTTON: ProductionSelectors.PRODUCTION_SAVE_BUTTON,
            TABLE_HEADER_NO: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO_PZ
        }
    },
    {
        url: '/production/online-board',
        selectors: {
            GEAR_ICON: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_GEAR_ICON,
            SIDEBAR_MODAL: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_SIDEBAR_MODAL,
            CHECKBOX_NO: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_CHECKBOX_NO,
            CHECKBOX_NO_PZ: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_CHECKBOX_NO_PZ,
            SAVE_BUTTON: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_SAVE_BUTTON,
            TABLE_HEADER_NO: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: OnlineScoreboardSelectors.ONLINE_SCOREBOARD_TABLE_HEADER_NO_PZ
        }
    },
    {
        url: '/production/production-task/task-by-equipment/null/25',
        selectors: {
            GEAR_ICON: ProductionSelectors.PRODUCTION_GEAR_ICON,
            SIDEBAR_MODAL: ProductionSelectors.PRODUCTION_SIDEBAR_MODAL,
            CHECKBOX_NO: ProductionSelectors.PRODUCTION_CHECKBOX_NO,
            CHECKBOX_NO_PZ: ProductionSelectors.PRODUCTION_CHECKBOX_NO_PZ,
            SAVE_BUTTON: ProductionSelectors.PRODUCTION_SAVE_BUTTON,
            TABLE_HEADER_NO: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO_PZ
        }
    },
    {
        url: '/production/production-task/task-by-toperation-metalloworking?tOperationId=1',
        selectors: {
            GEAR_ICON: ProductionSelectors.PRODUCTION_GEAR_ICON,
            SIDEBAR_MODAL: ProductionSelectors.PRODUCTION_SIDEBAR_MODAL,
            CHECKBOX_NO: ProductionSelectors.PRODUCTION_CHECKBOX_NO,
            CHECKBOX_NO_PZ: ProductionSelectors.PRODUCTION_CHECKBOX_NO_PZ,
            SAVE_BUTTON: ProductionSelectors.PRODUCTION_SAVE_BUTTON,
            TABLE_HEADER_NO: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO_PZ
        }
    },
    {
        url: '/production/production-task/task-by-user/null/18',
        selectors: {
            GEAR_ICON: ProductionSelectors.PRODUCTION_GEAR_ICON,
            SIDEBAR_MODAL: ProductionSelectors.PRODUCTION_SIDEBAR_MODAL,
            CHECKBOX_NO: ProductionSelectors.PRODUCTION_CHECKBOX_NO,
            CHECKBOX_NO_PZ: ProductionSelectors.PRODUCTION_CHECKBOX_NO_PZ,
            SAVE_BUTTON: ProductionSelectors.PRODUCTION_SAVE_BUTTON,
            TABLE_HEADER_NO: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO,
            TABLE_HEADER_NO_PZ: ProductionSelectors.PRODUCTION_TABLE_HEADER_NO_PZ
        }
    }
];

export const runErp3371 = () => {
    PAGE_CONFIGS.forEach((config, index) => {
        test(`ERP-3371 TC ${index + 1} — Проверка видимости столбцов на ${config.url}`, async ({ page }) => {
            test.setTimeout(600000);

            await allure.step(`Step 1: Открыть страницу ${config.url}`, async () => {
                await page.goto(config.url);
                await page.waitForLoadState("networkidle");
                logger.info(`Страница ${config.url} успешно загружена`);
            });

            await allure.step("Step 2: Открыть модальное окно выбора столбцов (нажатие на шестеренку)", async () => {
                const gearIcon = page.locator(config.selectors.GEAR_ICON);
                await expect(gearIcon).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                await gearIcon.click();
                await page.waitForLoadState("networkidle");
                logger.info("Шестеренка нажата, процесс выбора столбцов инициализирован");
            });

            await allure.step("Step 3: Проверить открытие сайдбара 'Выбор столбцов'", async () => {
                const sidebar = page.locator(config.selectors.SIDEBAR_MODAL);
                await expect(sidebar).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                logger.info("Сайдбар настроек столбцов успешно открыт");
            });

            await allure.step("Step 4: Снять выделение со столбцов '№' и '№ ПЗ'", async () => {
                const checkboxNo = page.locator(config.selectors.CHECKBOX_NO);
                const checkboxNoPz = page.locator(config.selectors.CHECKBOX_NO_PZ);
                
                if (await checkboxNo.isVisible()) {
                    await checkboxNo.click();
                    logger.info("Галочка столбца '№' снята");
                } else {
                    logger.info("Столбец '№' отсутствует в настройках для данной таблицы");
                }
                
                if (await checkboxNoPz.isVisible()) {
                    await checkboxNoPz.click();
                    logger.info("Галочка столбца '№ ПЗ' снята");
                } else {
                    logger.info("Столбец '№ ПЗ' отсутствует в настройках для данной таблицы");
                }
            });

            await allure.step("Step 5: Нажать кнопку 'Сохранить' для применения изменений", async () => {
                const saveBtn = page.locator(config.selectors.SAVE_BUTTON);
                await expect(saveBtn).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                await saveBtn.click();
                await page.waitForLoadState("networkidle");
                logger.info("Кнопка 'Сохранить' нажата");
            });

            await allure.step("Step 6: Убедиться, что выбранные столбцы скрыты из таблицы", async () => {
                const headerNo = page.locator(config.selectors.TABLE_HEADER_NO);
                const headerNoPz = page.locator(config.selectors.TABLE_HEADER_NO_PZ);
                
                await expect(headerNo).not.toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                await expect(headerNoPz).not.toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
                logger.info("Изменения успешно применены: выбранные столбцы скрыты");
            });
        });
    });
};

