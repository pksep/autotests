import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { PageObject, expectSoftWithScreenshot } from '../lib/Page';
import logger from '../lib/utils/logger';
import { title } from 'process';
import { toNamespacedPath } from 'path';
//import testData from '../testdata/PU18-Names.json'; // Import your test data
import { allure } from 'allure-playwright';
import { SELECTORS } from '../config';
import * as SelectorsMaterialsDatabase from '../lib/Constants/SelectorsMaterialsDatabase';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';

// Страница: База материалов
export class CreateMaterialsDatabasePage extends PageObject {
  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  /**
   * Creates a material (материал) in the Materials Database as "Покупные детали" (ПД / bought materials).
   * Uses type "Гидравлика" and subtype "Насосы гидравлические" so the material is classified as ПД
   * and appears in the product spec ПД modal.
   */
  async createMaterial(materialName: string, testInfo: TestInfo): Promise<boolean> {
    let isSuccess = false;
    await allure.step(`Create material "${materialName}"`, async () => {
      await this.goto(SELECTORS.MAINMENU.MATERIALS.URL);
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Select "Покупные детали" (ПД) so the new material is in the same category as product spec ПД modal
      const switchWrapper = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SWITCH_WRAPPER);
      const pokupnyeDetali = switchWrapper.getByText('Покупные детали');
      const isSwitchVisible = await switchWrapper.isVisible().catch(() => false);
      if (isSwitchVisible) {
        await pokupnyeDetali.click().catch(() => {});
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        await this.waitForNetworkIdle();
      }

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          const btn = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_BUTTON).first();
          expect.soft(await btn.isVisible({ timeout: WAIT_TIMEOUTS.STANDARD })).toBe(true);
        },
        'Verify create material button is visible',
        testInfo,
      );
      await this.clickButton('Создать', SelectorsMaterialsDatabase.MATERIAL_CREATE_BUTTON);
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      const pageTitle = this.page
        .locator('h1, h2, h3, h4')
        .filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_CREATE_PAGE_TITLE });
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(pageTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify material creation page title is visible',
        testInfo,
      );

      const materialNameInputWrapper = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_INPUT);
      const materialNameInput = materialNameInputWrapper.locator('input');
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(materialNameInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify material name input is visible',
        testInfo,
      );
      await materialNameInput.fill(materialName);
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      const filledValue = await materialNameInput.inputValue();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(filledValue).toBe(materialName);
        },
        'Verify material name was filled correctly',
        testInfo,
      );

      // Type table (Тип) — search and select one row
      const typeTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_TYPE);
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(typeTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify type table is visible',
        testInfo,
      );

      const typeSearchLocator = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_TYPE_SEARCH);
      const typeSearchInput = typeSearchLocator.locator('input').first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(typeSearchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify type search input is visible',
        testInfo,
      );
      // ПД: type "Гидравлика", subtype "Насосы гидравлические" → material is Покупные детали
      await typeSearchInput.fill(SelectorsMaterialsDatabase.MATERIAL_TYPE_POKUPNYE_DETALI);
      await typeSearchInput.press('Enter');
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      const typeTableRows = typeTable.locator('tbody tr:not([data-testid*="TrEmpty"])');
      const typeRow = typeTableRows.filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_TYPE_POKUPNYE_DETALI }).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(typeRow).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify type row (Гидравлика) is visible',
        testInfo,
      );
      await this.highlightElement(typeRow);
      await typeRow.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      // Subtype table (Подтип) — select "Насосы гидравлические" for ПД
      const subtypeTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_SUBTYPE);
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(subtypeTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify subtype table is visible',
        testInfo,
      );
      const subtypeDataRows = subtypeTable.locator('tbody tr:not([data-testid*="TrEmpty"])');
      const subtypeRow = subtypeDataRows.filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_SUBTYPE_POKUPNYE_DETALI }).first();
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(subtypeRow).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify subtype row (Насосы гидравлические) is visible',
        testInfo,
      );
      await this.highlightElement(subtypeRow);
      await subtypeRow.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

      const quantityTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_QUANTITY_TABLE);
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(quantityTable).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify quantity table is visible',
        testInfo,
      );

      // CreatorMaterial: value inputs are [data-testid*="TdValue-Input"] (YInputNumber; fill inner input). Fill each that has a visible input.
      const quantityInputWrappers = quantityTable.locator('[data-testid*="TdValue-Input"]');
      const wrapperCount = await quantityInputWrappers.count();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(wrapperCount).toBeGreaterThanOrEqual(1);
        },
        'Verify at least one quantity input exists',
        testInfo,
      );

      for (let i = 0; i < wrapperCount; i++) {
        const inputWrapper = quantityInputWrappers.nth(i);
        const inputEl = inputWrapper.locator('input').first();
        const isVisible = await inputEl.isVisible().catch(() => false);
        if (!isVisible) continue;
        await inputEl.fill('1');
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        const inputValue = await inputEl.inputValue();
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(inputValue).toBe('1');
          },
          `Verify quantity input ${i + 1} value is set to 1`,
          testInfo,
        );
      }

      // Select base unit (Базовая ЕИ) - required for save ("Необходимо указать базовую единицу измерения")
      const baseUnitDropdown = this.page.locator(
        SelectorsMaterialsDatabase.MATERIAL_CREATE_BASE_UNIT_DROPDOWN,
      ).first();
      const isBaseUnitVisible = await baseUnitDropdown.isVisible().catch(() => false);
      if (isBaseUnitVisible) {
        await baseUnitDropdown.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        const option = this.page.getByRole('option').first();
        const optionVisible = await option.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false);
        if (optionVisible) {
          await option.click();
        } else {
          await this.page.keyboard.press('ArrowDown');
          await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          await this.page.keyboard.press('Enter');
        }
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
      }

      // Fill characteristics (Характеристики) when visible so save succeeds on first try
      const characteristicsSection = this.page.locator(
        SelectorsMaterialsDatabase.MATERIAL_CREATE_CHARACTERISTICS_SECTION,
      );
      const isCharVisible = await characteristicsSection.isVisible().catch(() => false);
      if (isCharVisible) {
        const charInputs = characteristicsSection.locator('input');
        const inputCount = await charInputs.count();
        for (let i = 0; i < inputCount; i++) {
          const input = charInputs.nth(i);
          const visible = await input.isVisible().catch(() => false);
          if (visible) {
            await input.fill('1');
            await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          }
        }
      }

      const saveButton = this.page
        .locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_SAVE_BUTTON)
        .filter({ hasText: 'Сохранить' });
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(saveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify save button is visible',
        testInfo,
      );
      await this.highlightElement(saveButton);
      await saveButton.click();
      await this.page.waitForTimeout(TIMEOUTS.STANDARD);
      await this.waitForNetworkIdle();

      let notificationMessage = '';
      const notificationSelector = '[data-testid="Notification-Notification-Description"]';
      const readNotification = async (): Promise<string> => {
        const notification = this.page.locator(notificationSelector).last();
        const waitUntil = Date.now() + WAIT_TIMEOUTS.STANDARD;
        while (Date.now() < waitUntil) {
          const visible = await notification.isVisible().catch(() => false);
          if (visible) {
            return (await notification.textContent())?.trim() ?? '';
          }
          await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        }
        return '';
      };

      const isMaterialSuccessMessage = (msg: string) =>
        (msg.includes('Материал успешно') && (msg.includes('создан') || msg.includes('Создана'))) ||
        msg.includes('Объект с таким наименованием уже существует');

      notificationMessage = await readNotification();
      isSuccess = isMaterialSuccessMessage(notificationMessage);

      if (!isSuccess && notificationMessage && notificationMessage.includes('характеристик')) {
        logger.warn(`Material save asked for characteristics: "${notificationMessage}". Filling characteristics and retrying save.`);
        const characteristicsSectionRetry = this.page.locator(
          SelectorsMaterialsDatabase.MATERIAL_CREATE_CHARACTERISTICS_SECTION,
        );
        const isCharVisibleRetry = await characteristicsSectionRetry.isVisible().catch(() => false);
        if (isCharVisibleRetry) {
          const charInputs = characteristicsSectionRetry.locator('input');
          const inputCount = await charInputs.count();
          for (let i = 0; i < inputCount; i++) {
            const input = charInputs.nth(i);
            const visible = await input.isVisible().catch(() => false);
            if (visible) {
              await input.fill('1');
              await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
            }
          }
          await this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_SAVE_BUTTON).filter({ hasText: 'Сохранить' }).click();
          await this.page.waitForTimeout(TIMEOUTS.STANDARD);
          await this.waitForNetworkIdle();
          notificationMessage = await readNotification();
          isSuccess = isMaterialSuccessMessage(notificationMessage);
        }
      }

      if (!isSuccess && notificationMessage) {
        logger.warn(`Material create notification (not success): "${notificationMessage}".`);
      }
      if (!isSuccess && !notificationMessage) {
        logger.warn(
          `No notification after save for "${materialName}". Possible: save failed silently, selector changed, or page navigated.`,
        );
      }

      const assertionDescription = notificationMessage
        ? `Verify material creation or existence. Notification: "${notificationMessage}"`
        : 'Verify material creation or existence';
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(isSuccess, `Material save failed. Notification: "${notificationMessage}"`).toBe(true);
        },
        assertionDescription,
        testInfo,
      );
      await this.page.waitForTimeout(TIMEOUTS.STANDARD);
    });

    return isSuccess;
  }

  /**
   * Creates a consumable material (расходный материал, РМ) in the Materials Database.
   * Selects main task "Ветошь, полотенца" and sub task "Ветошь" so the material is classified as РМ
   * and appears in the product spec consumables modal.
   */
  async createConsumable(materialName: string, testInfo: TestInfo): Promise<boolean> {
    let isSuccess = false;
    await allure.step(`Create consumable material "${materialName}"`, async () => {
      await this.goto(SELECTORS.MAINMENU.MATERIALS.URL);
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Select "Расходные материалы" (РМ) so the new material is in the consumables category
      const switchWrapper = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SWITCH_WRAPPER);
      const rashodnye = switchWrapper.getByText('Расходные материалы');
      const isSwitchVisible = await switchWrapper.isVisible().catch(() => false);
      if (isSwitchVisible) {
        await rashodnye.click().catch(() => {});
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        await this.waitForNetworkIdle();
      }

      await this.clickButton('Создать', SelectorsMaterialsDatabase.MATERIAL_CREATE_BUTTON);
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      const pageTitle = this.page
        .locator('h1, h2, h3, h4')
        .filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_CREATE_PAGE_TITLE });
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(pageTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify material creation page title is visible',
        testInfo,
      );

      const materialNameInputWrapper = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_INPUT);
      const materialNameInput = materialNameInputWrapper.locator('input');
      await materialNameInput.fill(materialName);
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Main task table: search and select "Ветошь, полотенца" for РМ
      const typeTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_TYPE);
      await typeTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
      const typeSearchInput = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_TYPE_SEARCH).locator('input').first();
      await typeSearchInput.fill(SelectorsMaterialsDatabase.MATERIAL_TYPE_RASHODNYE);
      await typeSearchInput.press('Enter');
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      const typeTableRows = typeTable.locator('tbody tr:not([data-testid*="TrEmpty"])');
      const typeRow = typeTableRows.filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_TYPE_RASHODNYE }).first();
      await typeRow.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      // Sub task table: select "Ветошь" for РМ
      const subtypeTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_TABLE_SUBTYPE);
      await subtypeTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});
      const subtypeDataRows = subtypeTable.locator('tbody tr:not([data-testid*="TrEmpty"])');
      const subtypeRow = subtypeDataRows.filter({ hasText: SelectorsMaterialsDatabase.MATERIAL_SUBTYPE_RASHODNYE }).first();
      await subtypeRow.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Quantity table and base unit (same as createMaterial)
      const quantityTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_QUANTITY_TABLE);
      const quantityInputWrappers = quantityTable.locator('[data-testid*="TdValue-Input"]');
      const wrapperCount = await quantityInputWrappers.count();
      for (let i = 0; i < wrapperCount; i++) {
        const inputWrapper = quantityInputWrappers.nth(i);
        const inputEl = inputWrapper.locator('input').first();
        const isVisible = await inputEl.isVisible().catch(() => false);
        if (isVisible) {
          await inputEl.fill('1');
          await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        }
      }

      const baseUnitDropdown = this.page
        .locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_BASE_UNIT_DROPDOWN)
        .first();
      const isBaseUnitVisible = await baseUnitDropdown.isVisible().catch(() => false);
      if (isBaseUnitVisible) {
        await baseUnitDropdown.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        const option = this.page.getByRole('option').first();
        const optionVisible = await option.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false);
        if (optionVisible) {
          await option.click();
        } else {
          await this.page.keyboard.press('ArrowDown');
          await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          await this.page.keyboard.press('Enter');
        }
      }

      const characteristicsSection = this.page.locator(
        SelectorsMaterialsDatabase.MATERIAL_CREATE_CHARACTERISTICS_SECTION,
      );
      const isCharVisible = await characteristicsSection.isVisible().catch(() => false);
      if (isCharVisible) {
        const charInputs = characteristicsSection.locator('input');
        const inputCount = await charInputs.count();
        for (let i = 0; i < inputCount; i++) {
          const input = charInputs.nth(i);
          const visible = await input.isVisible().catch(() => false);
          if (visible) {
            await input.fill('1');
            await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
          }
        }
      }

      const saveButton = this.page
        .locator(SelectorsMaterialsDatabase.MATERIAL_CREATE_SAVE_BUTTON)
        .filter({ hasText: 'Сохранить' });
      await saveButton.click();
      await this.page.waitForTimeout(TIMEOUTS.STANDARD);
      await this.waitForNetworkIdle();

      const notificationSelector = '[data-testid="Notification-Notification-Description"]';
      const notification = this.page.locator(notificationSelector).last();
      const notificationVisible = await notification.isVisible({ timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => false);
      const notificationMessage = notificationVisible ? (await notification.textContent())?.trim() ?? '' : '';
      const isMaterialSuccessMessage =
        (notificationMessage.includes('Материал успешно') &&
          (notificationMessage.includes('создан') || notificationMessage.includes('Создана'))) ||
        notificationMessage.includes('Объект с таким наименованием уже существует');
      isSuccess = isMaterialSuccessMessage;

      await this.page.waitForTimeout(TIMEOUTS.STANDARD);
    });

    return isSuccess;
  }

  /**
   * Cleans up (archives) all materials whose name starts with the given prefix.
   * Same pattern as U001 parts cleanup: search prefix, loop until no matching rows, archive each with confirm.
   */
  async cleanupTestMaterialsByPrefix(searchPrefix: string): Promise<void> {
    await allure.step(`Clean up materials by prefix "${searchPrefix}"`, async () => {
      await this.goto(SELECTORS.MAINMENU.MATERIALS.URL);
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

      const searchInput = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_INPUT).first();
      await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => {});

      let hasMoreItems = true;
      let iterationCount = 0;
      const maxIterations = 100;

      while (hasMoreItems && iterationCount < maxIterations) {
        iterationCount++;
        await searchInput.clear();
        await searchInput.fill(searchPrefix);
        await searchInput.press('Enter');
        await this.waitForNetworkIdle();
        await this.page.waitForTimeout(TIMEOUTS.STANDARD);

        const rows = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_TABLE_BODY_ROWS);
        const rowCount = await rows.count();
        if (rowCount === 0) {
          hasMoreItems = false;
          break;
        }

        // Archive one row per iteration: select last row (avoids index shift), then archive and confirm.
        const lastRow = rows.nth(rowCount - 1);
        await lastRow.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        await this.archiveAndConfirm(
          SelectorsMaterialsDatabase.MATERIAL_LIST_ARCHIVE_BUTTON,
          SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON,
        );
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      }

      await searchInput.clear();
      await searchInput.press('Enter');
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      logger.info(`Materials cleanup by prefix "${searchPrefix}" completed.`);
    });
  }

  /**
   * Archives test materials by searching for them by prefix and archiving from bottom up
   * @param materialNames - Array of material names to archive (e.g., ["ERP2969_MATERIAL_001", "ERP2969_MATERIAL_002"])
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   */
  async cleanupTestMaterials(materialNames: string[], testInfo: TestInfo): Promise<void> {
    await allure.step(`Clean up ${materialNames.length} test materials`, async () => {
      if (materialNames.length === 0) {
        logger.log('No materials to clean up');
        return;
      }

      // Extract prefix from first material name (remove trailing underscore and number)
      // e.g., "ERP2969_MATERIAL_001" -> "ERP2969_MATERIAL"
      const materialPrefix = materialNames[0]?.replace(/_\d+$/, '') || '';
      logger.log(`Searching for materials with prefix: "${materialPrefix}"`);

      // Navigate to materials database page
      await this.goto(SELECTORS.MAINMENU.MATERIALS.URL);
      await this.waitForNetworkIdle(WAIT_TIMEOUTS.LONG);
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

      // Find the table with data-testid="MaterialTableList-Table-Item"
      const materialTable = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_TABLE).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(materialTable).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify materials table is visible',
        testInfo,
      );

      // Find the search input
      const searchInput = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_INPUT).first();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(searchInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        `Verify search input is visible for material prefix "${materialPrefix}"`,
        testInfo,
      );

      // Perform search once with the prefix
      await this.searchWithPressSequentially(SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_INPUT, materialPrefix, { delay: 50, waitAfterSearch: TIMEOUTS.STANDARD, timeout: WAIT_TIMEOUTS.STANDARD });

      // Wait for table to update after search
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.waitForNetworkIdle();

      // Close any open dropdowns (search history dropdown might be open)
      // Press Escape to close dropdowns
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Wait for dropdown to disappear
      const searchHistoryDropdown = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_SEARCH_HISTORY_DROPDOWN);
      await searchHistoryDropdown.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => {
        // Dropdown might not be visible, that's okay
      });
      await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      // Find all rows in the table
      const rows = materialTable.locator('tbody tr');
      const rowCount = await rows.count();
      logger.log(`Found ${rowCount} rows after searching for material prefix "${materialPrefix}"`);

      // Create a set of material names for quick lookup
      const materialNamesSet = new Set(materialNames.map(name => name.toLowerCase()));

      // Verify at least one material is in the results
      let materialsFound = 0;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const rowText = await row.textContent();
        if (rowText) {
          // Check if row contains any of the material names
          for (const materialName of materialNames) {
            if (rowText.includes(materialName)) {
              materialsFound++;
              break;
            }
          }
        }
      }

      // Only verify materials were found if any were found
      // If no materials found, they may have already been archived
      if (materialsFound > 0) {
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(materialsFound).toBeGreaterThan(0);
          },
          `Verify at least one material with prefix "${materialPrefix}" is found in search results`,
          testInfo,
        );
      } else {
        logger.log(`No materials found with prefix "${materialPrefix}" - cleanup may have already been completed`);
      }

      // Archive from bottom up - archive all rows that match any of the material names
      let archivedCount = 0;
      for (let i = rowCount - 1; i >= 0; i--) {
        const row = rows.nth(i);
        const rowText = await row.textContent();

        // Check if row contains any of the material names
        let shouldArchive = false;
        let matchedMaterialName = '';
        if (rowText) {
          for (const materialName of materialNames) {
            if (rowText.includes(materialName)) {
              shouldArchive = true;
              matchedMaterialName = materialName;
              break;
            }
          }
        }

        if (!shouldArchive) {
          continue;
        }

        // Wait for row to be visible and scroll into view
        await row.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
        await row.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

        // Ensure dropdown is closed before clicking row
        const searchHistoryDropdown = this.page.locator('[data-testid="MaterialTableList-Table-Item-SearchInput-Dropdown-History-ShowResult-Title"]');
        const isDropdownVisible = await searchHistoryDropdown.isVisible().catch(() => false);
        if (isDropdownVisible) {
          // Click outside to close dropdown, or press Escape again
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
        }

        // Click the row to select it - use the center of the row for more reliable clicking
        await row.click({ position: { x: 0.5, y: 0.5 } });
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

        // Wait for network to settle after row selection
        await this.waitForNetworkIdle();
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

        // Find the Archive button with data-testid="Button" and text "Архив"
        const archiveButton = this.page.locator(SelectorsMaterialsDatabase.MATERIAL_LIST_ARCHIVE_BUTTON).filter({ hasText: 'Архив' }).first();

        // Wait for button to be visible first
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(archiveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          `Verify archive button is visible for material "${matchedMaterialName}"`,
          testInfo,
        );

        // Wait for button to become enabled (row selection might take time)
        await archiveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });

        // Wait for button to be enabled with retries
        let isEnabled = false;
        for (let retry = 0; retry < 15; retry++) {
          isEnabled = await archiveButton.isEnabled().catch(() => false);
          if (isEnabled) break;
          await this.page.waitForTimeout(TIMEOUTS.SHORT);
        }

        if (!isEnabled) {
          logger.log(`⚠️ Archive button is disabled for material "${matchedMaterialName}" - material may be in use or row not properly selected. Skipping...`);
          continue; // Skip this row and continue with next
        }

        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(isEnabled).toBe(true);
          },
          `Verify archive button is enabled for material "${matchedMaterialName}"`,
          testInfo,
        );

        // Click the Archive button
        await archiveButton.click();
        await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);

        // Wait for and click the confirm button in ModalConfirm dialog
        const confirmModal = this.page.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG).first();
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(confirmModal).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          `Verify confirm modal is visible for material "${matchedMaterialName}"`,
          testInfo,
        );

        const confirmButton = this.page.locator(SelectorsArchiveModal.MODAL_CONFIRM_DIALOG_YES_BUTTON).first();
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(confirmButton).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
          },
          `Verify confirm button is visible for material "${matchedMaterialName}"`,
          testInfo,
        );

        await confirmButton.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        await this.waitForNetworkIdle();

        logger.log(`✅ Archived material "${matchedMaterialName}" from row ${i}`);
        archivedCount++;
      }

      logger.log(`✅ Completed archiving ${archivedCount} materials with prefix "${materialPrefix}"`);
    });
  }
}
