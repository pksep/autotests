import { Page, Locator, expect, TestInfo } from '@playwright/test';

import { PageObject, expectSoftWithScreenshot } from '../lib/Page';
import { CreateMaterialsDatabasePage } from '../pages/MaterialsDatabasePage';
import { ENV, SELECTORS } from '../config';
import logger from '../lib/utils/logger';
import { title } from 'process';
import { toNamespacedPath } from 'path';
import testData from '../testdata/PU18-Names.json'; // Import your test data
import { allure } from 'allure-playwright';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import * as SelectorsArchiveModal from '../lib/Constants/SelectorsArchiveModal';
import * as SelectorsEquipment from '../lib/Constants/SelectorsEquipment';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import type { Item, TestProductSpecification, GlobalTableData } from '../lib/helpers/PartsDatabaseTypes';
import { PartsDatabaseTableHelper } from '../lib/helpers/PartsDatabaseTableHelper';
import { PartsDatabaseHelper } from '../lib/helpers/PartsDatabaseHelper';

export type { Item, TestProductSpecification };

const MAIN_TABLE_TEST_ID = SelectorsPartsDataBase.MAIN_TABLE_TEST_ID;

const TABLE_TEST_IDS = [
  'Specification-ModalCbed-AccordionCbed-Table',
  'Specification-ModalCbed-AccordionDetalContent-Table',
  'Specification-ModalCbed-AccordionBuyersMaterial-Table',
  'Specification-ModalCbed-ModalComplect-MateriaDetalTable',
  'Specification-ModalCbed-Accordion-MaterialRashod-Table',
];

// Страница: Сборка
export class CreatePartsDatabasePage extends PageObject {
  protected partsDatabaseTableHelper: PartsDatabaseTableHelper;
  protected partsDatabaseHelper: PartsDatabaseHelper;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.partsDatabaseTableHelper = new PartsDatabaseTableHelper(page);
    this.partsDatabaseHelper = new PartsDatabaseHelper(page);
  }
  // this item will store everything that we parse for later processing and validations
  static globalTableData = {
    СБ: [] as Item[], // Сборочные единицы
    Д: [] as Item[], // Детали
    ПМ: [] as Item[], // Покупные материалы
    МД: [] as Item[], // Материалы для деталей
    ПД: [] as Item[], // Расходные материалы
    РМ: [] as Item[], // Расходные материалы
    ALL: new Map<string, Item>(), // Consolidated details
  };
  static resetGlobalTableData(): void {
    const g = CreatePartsDatabasePage.globalTableData;
    g.СБ.length = 0;
    g.Д.length = 0;
    g.ПМ.length = 0;
    g.МД.length = 0;
    g.РМ.length = 0;
    g.ПД.length = 0;
    g.ALL.clear();
  }
  /**
   * Process table data to group items by their types (СБ, Д, ПД, РМ) and create an ALL group.
   * @param table - The Playwright Locator for the table element.
   * @returns An object with grouped items and the ALL group.
   */
  async processTableData(
    table: Locator,
    title: string,
    parentQuantity: number,
  ): Promise<{
    СБ: Item[];
    Д: Item[];
    ПД: Item[];
    РМ: Item[];
    ALL: Map<string, Item>;
  }> {
    return this.partsDatabaseTableHelper.processTableData(table, title, parentQuantity, CreatePartsDatabasePage.globalTableData);
  }

  async getProductSpecificationsTable(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
    return this.partsDatabaseTableHelper.getProductSpecificationsTable(row, page, title, CreatePartsDatabasePage.globalTableData);
  }

  async processProduct(row: Locator, shortagePage: any, page: any, title: string): Promise<void> {
    await this.partsDatabaseTableHelper.processProduct(row, page, title, CreatePartsDatabasePage.globalTableData);
  }
  async printParsedTableData(): Promise<void> {
    logger.log('Parsed Table Data Overview:');

    // Define the ordered keys for structured output
    const orderedKeys = ['СБ', 'Д', 'ПД', 'МД', 'РМ'];

    // Iterate through each group in the specified order
    orderedKeys.forEach(key => {
      const groupItems = this.parsedData[key] || [];
      const totalCount = Array.isArray(groupItems) ? groupItems.length : 0; // Count items in the group safely

      logger.log(`\n${key} (Items in this Group: ${totalCount}):`);
      console.table(groupItems);
    });

    logger.log('\nEnd of Parsed Table Data.');
  }

  async processTableDataAndHandleModals(
    table: Locator,
    shortagePage: any,
    page: any,
    title: string,
    parentQuantity: number,
  ): Promise<{
    СБ: Item[];
    Д: Item[];
    ПД: Item[];
    РМ: Item[];
    ALL: Map<string, Item>;
  }> {
    return this.partsDatabaseTableHelper.processTableDataAndHandleModals(table, page, title, parentQuantity, CreatePartsDatabasePage.globalTableData);
  }

  async processGroupRows(rows: Item[], groupType: string, page: any, parentQuantity: number): Promise<void> {
    return this.partsDatabaseTableHelper.processGroupRows(rows, groupType, page, parentQuantity, CreatePartsDatabasePage.globalTableData);
  }

  async processSBGroupRows(rows: Item[], page: any, shortagePage: any, parentQuantity: number): Promise<void> {
    return this.partsDatabaseTableHelper.processSBGroupRows(rows, page, parentQuantity, CreatePartsDatabasePage.globalTableData);
  }

  async parseStructuredTable(page: Page, tableTestId: string): Promise<{ groupName: string; items: string[][] }[]> {
    return this.partsDatabaseHelper.parseStructuredTable(page, tableTestId);
  }

  async addItemToSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    searchValue: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    itemType?: string,
  ): Promise<void> {
    return this.partsDatabaseHelper.addItemToSpecification(
      page,
      smallDialogButtonId,
      dialogTestId,
      searchTableTestId,
      searchValue,
      bottomTableTestId,
      addToBottomButtonTestId,
      addToMainButtonTestId,
      itemType,
    );
  }

  async addMultipleItemsToSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    items: Array<{ name: string; quantity?: number }>,
    itemType?: string,
  ): Promise<void> {
    return this.partsDatabaseHelper.addMultipleItemsToSpecification(
      page,
      smallDialogButtonId,
      dialogTestId,
      searchTableTestId,
      bottomTableTestId,
      addToBottomButtonTestId,
      addToMainButtonTestId,
      items,
      itemType,
    );
  }

  /**
   * Resets a product's specification to match the provided configuration.
   */
  async resetProductSpecificationsByConfig(productSearch: string, config: TestProductSpecification): Promise<void> {
    await this.partsDatabaseHelper.resetProductSpecificationsByConfig(
      this.page,
      () => this.navigateToPage(SELECTORS.MAINMENU.PARTS_DATABASE.URL, SelectorsPartsDataBase.MAIN_PAGE_TITLE_ID),
      productSearch,
      config,
    );
  }

  async removeItemFromSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    bottomTableTestId: string,
    removeButtonColumnIndex: number,
    searchValue: string,
    returnButtonTestId: string,
    itemType?: string,
  ): Promise<void> {
    return this.partsDatabaseHelper.removeItemFromSpecification(
      page,
      smallDialogButtonId,
      dialogTestId,
      bottomTableTestId,
      removeButtonColumnIndex,
      searchValue,
      returnButtonTestId,
      itemType,
    );
  }

  // async parseStructuredTable(page: Page, tableTestId: string): Promise<{ groupName: string; items: string[][] }[]> {
  //     // Locate the table using its data-testid
  //     const table = page.locator(`[data-testid="${tableTestId}"]`);

  //     // Wait for the first row of the table to be visible
  //     await table.locator('tr').first().waitFor({ state: 'visible' });

  //     // Fetch all rows inside tbody
  //     const rows = await table.locator('tbody tr').elementHandles();
  //     logger.info(`Total rows in tbody: ${rows.length}`);

  //     // Return error if no rows are found
  //     if (rows.length === 0) {
  //         throw new Error('No rows found in the table.');
  //     }

  //     // Initialize groups array
  //     const groups: { groupName: string; items: string[][] }[] = [];
  //     let currentGroup: { groupName: string; items: string[][] } | null = null;

  //     // Iterate over each row
  //     for (const row of rows) {
  //         try {
  //             // Check if the row is a group header
  //             const groupHeaderCell = await row.$eval('td[colspan]', (cell) => cell?.textContent?.trim()).catch(() => null);
  //             if (groupHeaderCell) {
  //                 // Create a new group with group name
  //                 currentGroup = { groupName: groupHeaderCell, items: [] };
  //                 groups.push(currentGroup);
  //                 logger.info(`Group header detected: "${currentGroup.groupName}"`);
  //             } else if (currentGroup) {
  //                 // Add data rows under the current group
  //                 const rowData = await row.$$eval('td', (cells) =>
  //                     cells.map((cell) => cell.textContent?.trim() || '')
  //                 );
  //                 currentGroup.items.push(rowData);
  //                 logger.info(`Added row to group "${currentGroup.groupName}": ${rowData}`);
  //             }
  //         } catch (error) {
  //             console.error(`Error processing row: ${error}`);
  //         }
  //     }

  //     // Debug final parsed result
  //     logger.info(`Parsed groups: ${JSON.stringify(groups, null, 2)}`);
  //     return groups;
  // }
  async compareTableData<T>(data1: { groupName: string; items: T[][] }[], data2: { groupName: string; items: T[][] }[]): Promise<boolean> {
    return this.partsDatabaseHelper.compareTableData(data1, data2);
  }

  async isStringInNestedArray(nestedArray: string[][], searchString: string): Promise<boolean> {
    return this.partsDatabaseHelper.isStringInNestedArray(nestedArray, searchString);
  }

  async getQuantityByLineItem(data: { groupName: string; items: string[][] }[], searchString: string): Promise<number> {
    return this.partsDatabaseHelper.getQuantityByLineItem(data, searchString);
  }

  async validateTable(page: Page, tableTitle: string, expectedRows: { [key: string]: string }[]): Promise<boolean> {
    return this.partsDatabaseHelper.validateTable(page, tableTitle, expectedRows);
  }

  async validateInputFields(page: Page, fields: { title: string; type: string }[]): Promise<boolean> {
    return this.partsDatabaseHelper.validateInputFields(page, fields);
  }

  /**
   * Recursively parses a structured table for product specifications.
   * The function starts from the given table's data-testid and dynamically extracts group information and item rows.
   * It:
   * • Identifies group headers (СБ, Д, ПД, РМ) and categorizes items accordingly.
   * • Extracts structured data from each row, ensuring correct parsing of №, Обозначение, Наименование, Ед., Кол-во.
   * • Detects nested tables inside rows and processes them recursively.
   * • Detects modal links inside rows (for СБ items) and processes them recursively.
   * • Highlights rows while processing and resets styles afterward.
   *
   * @param page - The Playwright page instance.
   * @param tableTestId - The data-testid of the table to parse.
   * @returns A Promise that resolves to an object containing categorized groups (СБ, Д, ПД, РМ).
   */
  parsedData: { [key: string]: any[] } = { СБ: [], Д: [], ПД: [], МД: [], РМ: [] };
  async parseRecursiveStructuredTable(
    page: Page,
    tableTestId: string,
    parentId: string, // Pass product designation from detail page
    multiplier: number = 1,
  ): Promise<void> {
    return this.partsDatabaseHelper.parseRecursiveStructuredTable(page, tableTestId, parentId, multiplier, this.parsedData);
  }

  async findMaterialType(page: Page, materialName: string): Promise<string> {
    return this.partsDatabaseHelper.findMaterialType(page, materialName);
  }

  async searchAndSelectMaterial(sliderDataTestId: string, materialName: string): Promise<void> {
    return this.partsDatabaseHelper.searchAndSelectMaterial(sliderDataTestId, materialName);
  }

  async extractAllTableData(page: Page, dialogTestId: string): Promise<any> {
    return this.partsDatabaseHelper.extractAllTableData(page, dialogTestId);
  }

  async checkItemExistsInBottomTable(page: Page, selectedPartName: string, modalTestId: string, bottomTableTestId: string): Promise<boolean> {
    return this.partsDatabaseHelper.checkItemExistsInBottomTable(page, selectedPartName, modalTestId, bottomTableTestId);
  }

  async fillDetailName(detailName: string, dataTestId: string = 'AddDetal-Information-Input-Input'): Promise<void> {
    return this.partsDatabaseHelper.fillDetailName(detailName, dataTestId);
  }

  async verifyDetailSuccessMessage(expectedText: string): Promise<void> {
    return this.partsDatabaseHelper.verifyDetailSuccessMessage(expectedText);
  }

  async verifyFileInTable(parentSectionTestId: string, tableRowSelector: string, name: string, extension: string): Promise<void> {
    return this.partsDatabaseHelper.verifyFileInTable(parentSectionTestId, tableRowSelector, name, extension);
  }

  async uploadFiles(fileInputSelector: string, filePaths: string[]): Promise<void> {
    return this.partsDatabaseHelper.uploadFiles(fileInputSelector, filePaths);
  }

  async validateFileSectionFields(
    fileSectionLocator: Locator,
    textareaTestId: string,
    checkboxTestId: string,
    versionInputTestId: string,
    fileNameInputTestId: string,
    testValue: string,
  ): Promise<void> {
    return this.partsDatabaseHelper.validateFileSectionFields(
      fileSectionLocator,
      textareaTestId,
      checkboxTestId,
      versionInputTestId,
      fileNameInputTestId,
      testValue,
    );
  }

  async verifyTableRows(tableLocator: Locator, rowSelector: string, expectedCount: number, highlightRows: boolean = true): Promise<void> {
    return this.partsDatabaseHelper.verifyTableRows(tableLocator, rowSelector, expectedCount, highlightRows);
  }

  async fillAndVerifyField(dataTestId: string, value: string, clearFirst: boolean = true): Promise<void> {
    return this.partsDatabaseHelper.fillAndVerifyField(dataTestId, value, clearFirst);
  }

  async clickButtonByDataTestId(dataTestId: string, waitForNetworkIdle: boolean = true): Promise<void> {
    return this.partsDatabaseHelper.clickButtonByDataTestId(dataTestId, waitForNetworkIdle);
  }

  async verifyModalVisible(modalDataTestId: string, timeout: number = 30000): Promise<Locator> {
    return this.partsDatabaseHelper.verifyModalVisible(modalDataTestId, timeout);
  }

  async searchInTableAndVerify(tableLocator: Locator, searchInputSelector: string, searchValue: string, expectedResult: string): Promise<void> {
    return this.partsDatabaseHelper.searchInTableAndVerify(tableLocator, searchInputSelector, searchValue, expectedResult);
  }

  async verifyFileUpload(fileInputSelector: string, filePaths: string[], expectedCount: number): Promise<void> {
    return this.partsDatabaseHelper.verifyFileUpload(fileInputSelector, filePaths, expectedCount);
  }

  async verifyDocumentTableOperations(tableLocator: Locator, rowIndex: number = 0): Promise<void> {
    return this.partsDatabaseHelper.verifyDocumentTableOperations(tableLocator, rowIndex);
  }

  async archiveDocument(archiveButtonDataTestId: string, confirmButtonDataTestId: string): Promise<void> {
    return this.partsDatabaseHelper.archiveDocument(archiveButtonDataTestId, confirmButtonDataTestId);
  }

  /**
   * Cleans up existing test details/assemblies by searching and archiving them.
   * @param page - The page object
   * @param detailName - The name of the detail/assembly to clean up
   * @param tableTestId - The data-testid of the table to search in
   * @param searchInputTestId - The data-testid of the search input field (optional, defaults to standard search input)
   * @param archiveButtonTestId - The data-testid of the archive button (optional, defaults to standard archive button)
   * @param confirmModalTestId - The data-testid of the confirm modal (optional, defaults to standard confirm modal)
   * @param confirmButtonTestId - The data-testid of the confirm button (optional, defaults to standard confirm button)
   */
  async cleanupTestDetail(
    page: Page,
    detailName: string,
    tableTestId: string,
    searchInputTestId?: string,
    archiveButtonTestId?: string,
    confirmModalTestId?: string,
    confirmButtonTestId?: string,
  ): Promise<void> {
    return this.partsDatabaseHelper.cleanupTestDetail(
      page,
      detailName,
      tableTestId,
      searchInputTestId,
      archiveButtonTestId,
      confirmModalTestId,
      confirmButtonTestId,
    );
  }

  /**
   * Cleans up test items by searching for items with a given prefix and archiving all found items.
   */
  async cleanupTestItemsByPrefix(
    itemTypeName: string,
    searchPrefix: string,
    searchInputSelector: string,
    tableSelector: string,
    searchInputPosition: 'first' | 'last' | number = 'first',
    archiveButtonSelector: string = SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON,
    confirmButtonSelector: string = SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON,
  ): Promise<void> {
    await allure.step(`Clean up ${itemTypeName} items`, async () => {
      await this.partsDatabaseHelper.cleanupTestItemsByPrefix(
        this.page,
        itemTypeName,
        searchPrefix,
        searchInputSelector,
        tableSelector,
        searchInputPosition,
        archiveButtonSelector,
        confirmButtonSelector,
      );
    });
  }

  /**
   * Adds a detail to an assembly specification.
   */
  async addDetailToAssemblySpecification(page: Page, detailName: string): Promise<void> {
    return this.partsDatabaseHelper.addDetailToAssemblySpecification(page, detailName);
  }

  async getCurrentPageType(): Promise<'add' | 'edit' | 'unknown'> {
    return this.partsDatabaseHelper.getCurrentPageType();
  }

  async getSaveButton(): Promise<Locator> {
    return this.partsDatabaseHelper.getSaveButton();
  }

  async isSaveInProgress(): Promise<boolean> {
    return this.partsDatabaseHelper.isSaveInProgress();
  }

  async performRapidSaveClicks(
    maxClicks: number = 10,
    options: {
      maxConsecutiveFailures?: number;
      stabilizationDelay?: number;
      progressCheckDelay?: number;
    } = {},
  ): Promise<{
    clicksPerformed: number;
    pageTransitioned: boolean;
    finalPageType: 'add' | 'edit' | 'unknown';
    errors: string[];
  }> {
    return this.partsDatabaseHelper.performRapidSaveClicks(maxClicks, options);
  }

  async calculateFreeQuantity(detailName: string): Promise<number> {
    return this.partsDatabaseHelper.calculateFreeQuantity(detailName);
  }

  async validateCollectedQuantity(assemblyName: string, expectedMinimum: number): Promise<boolean> {
    return this.partsDatabaseHelper.validateCollectedQuantity(assemblyName, expectedMinimum);
  }

  async validateScladNeed(detailName: string, currentValue: number): Promise<boolean> {
    return this.partsDatabaseHelper.validateScladNeed(detailName, currentValue);
  }

  async validateNeedQuantity(detailName: string, assemblyName: string, currentNeed: number, inKitsValue: number): Promise<boolean> {
    return this.partsDatabaseHelper.validateNeedQuantity(detailName, assemblyName, currentNeed, inKitsValue);
  }

  async validateProgressPercentage(collectedQuantity: number, requiredQuantity: number, expectedPercentage?: number): Promise<boolean> {
    return this.partsDatabaseHelper.validateProgressPercentage(collectedQuantity, requiredQuantity, expectedPercentage);
  }

  async archiveDetail(
    page: Page,
    itemName: string,
    tableTestId: string,
    searchInputTestId: string = 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
    archiveButtonTestId: string = 'EditDetal-ButtonSaveAndCancel-ButtonsRight-Archive',
    confirmModalTestId: string = 'ModalConfirm-Content',
    confirmButtonTestId: string = 'ModalConfirm-Content-Buttons-Yes',
  ): Promise<void> {
    return this.partsDatabaseHelper.archiveDetail(page, itemName, tableTestId, searchInputTestId, archiveButtonTestId, confirmModalTestId, confirmButtonTestId);
  }

  /**
   * Archives all test products matching the given search prefix.
   */
  async archiveAllTestProductsByPrefix(searchPrefix: string, options?: { maxIterations?: number }): Promise<number> {
    return this.partsDatabaseHelper.archiveAllTestProductsByPrefix(
      this.page,
      () => this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL).then(() => this.waitForNetworkIdle()),
      searchPrefix,
      options,
    );
  }

  /**
   * Archives all test equipment items with the given prefix.
   */
  async archiveAllTestEquipmentByPrefix(searchPrefix: string): Promise<void> {
    // Navigate to base equipment page
    await this.goto(`${ENV.BASE_URL}baseequipments`);
    await this.waitForNetworkIdle();
    await this.page.waitForTimeout(TIMEOUTS.STANDARD);

    // Use cleanupTestItemsByPrefix to archive equipment
    await this.cleanupTestItemsByPrefix(
      'EQUIPMENT',
      searchPrefix,
      `${SelectorsEquipment.BASE_EQUIPMENT_TABLE} ${SelectorsEquipment.BASE_EQUIPMENT_SEARCH_INPUT}`,
      SelectorsEquipment.BASE_EQUIPMENT_TABLE,
    );
  }

  /**
   * Creates an equipment item with the given name and operation type
   * @param equipmentName - Name of the equipment to create
   * @param operationType - Operation type (e.g., "Токарный-ЧПУ")
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   * @returns Promise<boolean> - true if creation was successful
   */
  async createEquipment(equipmentName: string, operationType: string = 'Токарный-ЧПУ', testInfo: TestInfo): Promise<boolean> {
    await allure.step(`Create equipment "${equipmentName}"`, async () => {
      const navigate = () =>
        this.goto(`${ENV.BASE_URL}baseequipments`).then(() => this.waitForNetworkIdle());
      await this.partsDatabaseHelper.createEquipment(navigate, equipmentName, operationType, testInfo);
    });
    return true;
  }

  async saveProduct(): Promise<boolean> {
    return this.partsDatabaseHelper.saveProduct(this.page);
  }

  async cancelProductCreation(): Promise<boolean> {
    return this.partsDatabaseHelper.cancelProductCreation(this.page);
  }

  /**
   * Verifies that all test products matching the given search prefix have been deleted.
   */
  async verifyAllTestProductsDeleted(searchPrefix: string, testInfo?: TestInfo): Promise<number> {
    const navigate = () => this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL).then(() => this.waitForNetworkIdle());
    const remainingCount = await this.partsDatabaseHelper.getRemainingTestProductsCount(
      this.page,
      navigate,
      searchPrefix,
      (term, tableSel, bodySel, opts) => this.searchAndWaitForTable(term, tableSel, bodySel, opts),
    );

    const createButton = this.page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
    await createButton.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    expect.soft(await createButton.isVisible()).toBe(true);

    logger.log(`Verify products: found ${remainingCount} test products with prefix "${searchPrefix}"`);

    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(remainingCount).toBe(0);
      },
      `Verify all test products are deleted: expected 0, found ${remainingCount}`,
      testInfo,
    );

    if (remainingCount === 0) {
      logger.log(`✅ Все тестовые изделия с префиксом "${searchPrefix}" успешно удалены.`);
    } else {
      console.warn(`⚠️ Осталось ${remainingCount} изделий с префиксом "${searchPrefix}" после удаления.`);
    }

    return remainingCount;
  }

  /**
   * Creates a detail (деталь) with the given name
   * @param detailName - Name of the detail to create
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   * @returns Promise<boolean> - true if creation was successful
   */
  async createDetail(detailName: string, testInfo: TestInfo): Promise<boolean> {
    await allure.step(`Create detail "${detailName}"`, async () => {
      const navigate = () =>
        this.goto(SELECTORS.SUBPAGES.CREATEDETAIL.URL).then(() => this.waitForNetworkIdle());
      await this.partsDatabaseHelper.createDetailFlow(navigate, detailName);

      const editPageTitle = this.page.locator(SelectorsPartsDataBase.EDIT_DETAL_TITLE);
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(editPageTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        `Verify detail "${detailName}" was saved and we're in edit mode`,
        testInfo,
      );

      await this.partsDatabaseHelper.clickButtonByDataTestId(
        SelectorsPartsDataBase.EDIT_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_CANCEL_ID,
      );
      await this.page.waitForTimeout(TIMEOUTS.STANDARD);
      await this.waitForNetworkIdle();
    });

    return true;
  }

  /**
   * Creates an assembly (СБ) with the given name and optional specification items
   * @param assemblyName - Name of the assembly to create
   * @param specificationItems - Optional items to add to assembly (materials, details)
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   * @returns Promise<boolean> - true if creation was successful
   */
  async createAssembly(
    assemblyName: string,
    specificationItems?: {
      materials?: Array<{ name: string; quantity?: number }>;
      details?: Array<{ name: string; quantity?: number }>;
    },
    testInfo?: TestInfo,
  ): Promise<boolean> {
    await allure.step(`Create assembly "${assemblyName}"`, async () => {
      const navigate = () =>
        this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL).then(() => this.page.waitForLoadState('networkidle'));
      await this.partsDatabaseHelper.createAssemblyFlow(
        navigate,
        assemblyName,
        specificationItems,
        testInfo,
      );
    });
    return true;
  }

  /**
   * Adds a material to the current specification (for assembly or product)
   * @param materialName - Name of the material to add
   * @param testInfo - Optional TestInfo for expectSoftWithScreenshot
   */
  async addMaterialToSpecification(materialName: string, testInfo?: TestInfo): Promise<void> {
    await allure.step(`Add material "${materialName}" to specification`, async () => {
      await this.partsDatabaseHelper.addMaterialToSpecification(materialName, testInfo);
    });
  }

  /**
   * Creates a complete product (изделие) with materials, assemblies, and details
   * @param spec - Product specification object defining the product structure
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   * @returns Promise<CreateProductResult> - Result of the creation operation
   */
  async createИзделие(spec: ProductSpecification, testInfo: TestInfo): Promise<CreateProductResult> {
    const result: CreateProductResult = {
      success: false,
      productName: spec.productName,
      createdDetails: [],
      createdAssemblies: [],
    };

    try {
      await allure.step(`Create product "${spec.productName}" with full specification`, async () => {
        // Step 0: Collect all unique materials needed and create them first
        const allMaterials = new Set<string>();
        if (spec.materials) {
          spec.materials.forEach(m => allMaterials.add(m.name));
        }
        if (spec.assemblies) {
          spec.assemblies.forEach(assembly => {
            if (assembly.materials) {
              assembly.materials.forEach(m => allMaterials.add(m.name));
            }
          });
        }

        // Step 0.5: Create all required materials first using MaterialsDatabasePage
        if (allMaterials.size > 0) {
          const materialsPage = new CreateMaterialsDatabasePage(this.page);
          for (const materialName of Array.from(allMaterials)) {
            await materialsPage.createMaterial(materialName, testInfo);
          }
        }

        // Step 1: Create all required details first
        if (spec.details) {
          for (const detail of spec.details) {
            await this.createDetail(detail.name, testInfo);
            result.createdDetails.push(detail.name);
          }
        }

        // Step 2: Create all required assemblies with their specifications
        if (spec.assemblies) {
          for (const assembly of spec.assemblies) {
            // Create details for this assembly if needed
            if (assembly.details) {
              for (const detail of assembly.details) {
                // Check if detail already exists in createdDetails
                if (!result.createdDetails.includes(detail.name)) {
                  await this.createDetail(detail.name, testInfo);
                  result.createdDetails.push(detail.name);
                }
              }
            }

            // Create the assembly with its specification
            // Note: Materials must exist in database before they can be added
            await this.createAssembly(
              assembly.name,
              {
                materials: assembly.materials,
                details: assembly.details,
              },
              testInfo,
            );
            result.createdAssemblies.push(assembly.name);
          }
        }

        // Step 3: Create the product itself
        await allure.step(`Create product "${spec.productName}"`, async () => {
          // Navigate to parts database
          await this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
          await this.page.waitForLoadState('networkidle');

          // Click create button using existing method
          await this.clickButtonByDataTestId(SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_CREATE_ID, false);
          await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Select product (изделие) type using existing method
          const productTypeButton = this.page.locator(SelectorsPartsDataBase.BUTTON_PRODUCT).first();
          await this.highlightElement(productTypeButton);
          await productTypeButton.click();
          await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

          // Fill in the product name using existing method
          const productInput = this.page.locator(SelectorsPartsDataBase.INPUT_NAME_IZD);
          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(productInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
            },
            'Verify product input is visible',
            testInfo,
          );
          await this.fillAndVerifyField(SelectorsPartsDataBase.INPUT_NAME_IZD, spec.productName);

          // Add direct materials to product if specified
          if (spec.materials) {
            for (const material of spec.materials) {
              await this.addMaterialToSpecification(material.name, testInfo);
            }
          }

          // Add assemblies to product specification
          if (spec.assemblies) {
            for (const assembly of spec.assemblies) {
              await this.addAssemblyToSpecification(assembly.name, testInfo);
            }
          }

          // Add direct details to product if specified
          if (spec.details) {
            for (const detail of spec.details) {
              await this.addDetailToAssemblySpecification(this.page, detail.name);
              await this.verifyDetailSuccessMessage('Деталь добавлена в спецификацию');
            }
          }

          // Save the product using existing method
          const saveSuccess = await this.saveProduct();
          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(saveSuccess).toBe(true);
            },
            'Verify product was saved successfully',
            testInfo,
          );

          // Verify success
          await this.verifyDetailSuccessMessage('Изделие успешно создано');

          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(true).toBe(true); // Product creation verified by success message
            },
            `Verify product "${spec.productName}" was created successfully`,
            testInfo,
          );
        });

        result.success = true;
      });
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to create product "${spec.productName}": ${result.error}`);
    }

    return result;
  }

  /**
   * Adds an assembly to the current specification (for product)
   * @param assemblyName - Name of the assembly to add
   * @param testInfo - Optional TestInfo for expectSoftWithScreenshot
   */
  async addAssemblyToSpecification(assemblyName: string, testInfo?: TestInfo): Promise<void> {
    await allure.step(`Add assembly "${assemblyName}" to specification`, async () => {
      await this.partsDatabaseHelper.addAssemblyToSpecification(assemblyName, testInfo);
    });
  }

  /**
   * Adds tech process operations to a detail, assembly, or product
   * @param objectName - Name of the object (detail, assembly, or product)
   * @param objectType - Type of object: 'detail', 'assembly', or 'product'
   * @param operationTypes - Array of operation type names to add (e.g., ["Сварочная", "Токарная"])
   * @param testInfo - TestInfo for expectSoftWithScreenshot
   * @param inCreatorMode - If true, object is still in creator modal (before saving). If false, object needs to be opened for editing.
   * @returns Promise<boolean> - true if all operations were added successfully
   */
  async addTechProcesses(
    objectName: string,
    objectType: 'detail' | 'assembly' | 'product',
    operationTypes: string[],
    testInfo?: TestInfo,
    inCreatorMode: boolean = false,
  ): Promise<boolean> {
    if (operationTypes.length === 0) {
      logger.log(`No tech processes to add for ${objectType} "${objectName}"`);
      return true;
    }

    await allure.step(`Add tech processes to ${objectType} "${objectName}"`, async () => {
      // If not in creator mode, we need to open the object for editing first
      if (!inCreatorMode) {
        // Navigate to parts database
        await this.goto(SELECTORS.MAINMENU.PARTS_DATABASE.URL);
        await this.waitForNetworkIdle();

        // Search for the object and open it for editing
        let tableSelector: string;
        if (objectType === 'detail') {
          tableSelector = SelectorsPartsDataBase.MAIN_PAGE_Д_TABLE;
        } else if (objectType === 'assembly') {
          tableSelector = SelectorsPartsDataBase.MAIN_PAGE_СБ_TABLE;
        } else {
          tableSelector = SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE;
        }

        // Use searchAndWaitForTable to search and wait for results
        // Extract plain data-testid value from selector (remove [data-testid="..."] wrapper)
        const searchInputTestId = SelectorsPartsDataBase.TABLE_SEARCH_INPUT.replace(/^\[data-testid="([^"]+)"\]$/, '$1');
        await this.searchAndWaitForTable(
          objectName,
          tableSelector,
          tableSelector,
          {
            searchInputDataTestId: searchInputTestId,
          },
        );

        // Wait a bit for the search to fully complete
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        await this.waitForNetworkIdle();
        
        // Close dropdown that intercepts clicks - press Escape multiple times to ensure it closes
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TIMEOUTS.SHORT);
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TIMEOUTS.SHORT);
        
        // Click outside the search area to close any dropdowns
        await this.page.click('body', { position: { x: 1, y: 1 } });
        await this.page.waitForTimeout(TIMEOUTS.SHORT);

        // Click the first row to select it (on products page, edit button is BaseProducts-Button-Edit)
        const firstRow = this.page.locator(`${tableSelector} tbody tr`).first();
        await firstRow.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
        await this.waitAndHighlight(firstRow);
        await firstRow.click(); // Normal click so the handler runs and enables the button
        
        // Wait for row to be selected and edit button to be enabled
        const editButton = this.page.locator(SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_EDIT);
        await editButton.waitFor({ state: 'attached', timeout: 30000 });
        
        // Wait for button to be enabled (same pattern as U003.spec.ts line 1088-1095)
        await this.page.waitForFunction(
          (buttonSelector) => {
            const button = document.querySelector(buttonSelector) as HTMLButtonElement;
            return button && !button.disabled;
          },
          SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_EDIT,
          { timeout: 30000 },
        );
        
        await editButton.click();
        
        // Wait for edit page to load
        await this.waitForNetworkIdle();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      }

      // Determine which button selector to use based on object type and mode
      let techProcessButtonSelector: string;
      if (objectType === 'detail') {
        // For details, use EditDetal button
        techProcessButtonSelector = SelectorsPartsDataBase.BUTTON_OPERATION;
      } else if (objectType === 'product' && !inCreatorMode) {
        // For products in edit mode, use Creator-Buttons-TechProcess
        techProcessButtonSelector = '[data-testid="Creator-Buttons-TechProcess"]';
      } else if (objectType === 'assembly' && !inCreatorMode) {
        // For assemblies in edit mode, try Creator first, then fall back
        const creatorButton = this.page.locator('[data-testid="Creator-Buttons-TechProcess"]');
        const creatorCount = await creatorButton.count();
        if (creatorCount > 0) {
          techProcessButtonSelector = '[data-testid="Creator-Buttons-TechProcess"]';
        } else {
          techProcessButtonSelector = SelectorsPartsDataBase.BUTTON_OPERATION_PROCESS_ASSYMBLY;
        }
      } else {
        // For products and assemblies in creator mode, use Creator button
        techProcessButtonSelector = SelectorsPartsDataBase.BUTTON_OPERATION_PROCESS_ASSYMBLY;
      }

      // Click on "Технологический процесс" button
      await this.waitForNetworkIdle();
      await this.page.waitForTimeout(TIMEOUTS.LONG);
      
      // Wait for the edit page to be fully loaded - check for either button pattern
      // Try both selectors to see which one is available
      let techProcessButton = this.page.locator(techProcessButtonSelector);
      let buttonCount = await techProcessButton.count();
      
      // If the selected button isn't found, try the alternative
      if (buttonCount === 0 && !inCreatorMode && objectType !== 'detail') {
        const alternativeButton = this.page.locator(SelectorsPartsDataBase.BUTTON_OPERATION);
        const altButtonCount = await alternativeButton.count();
        if (altButtonCount > 0) {
          techProcessButtonSelector = SelectorsPartsDataBase.BUTTON_OPERATION;
          techProcessButton = this.page.locator(techProcessButtonSelector);
        }
      }
      
      // Wait for the tech process button to be visible and enabled
      await techProcessButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
      await this.waitAndHighlight(techProcessButton);
      await techProcessButton.click();
      
      await this.page.waitForSelector(SelectorsPartsDataBase.MODAL_CONTENT, { timeout: WAIT_TIMEOUTS.STANDARD });

      // Add each operation
      for (let i = 0; i < operationTypes.length; i++) {
        const operationType = operationTypes[i];
        await allure.step(`Add operation "${operationType}" (${i + 1}/${operationTypes.length})`, async () => {
          logger.log(`🔄 Starting to add operation ${i + 1}/${operationTypes.length}: "${operationType}"`);
          
          // If this is not the first operation, the modal might have closed after saving
          // Check if modal is still open, if not, click the tech process button again
          if (i > 0) {
            logger.log(`📋 Checking if modal is still open for operation ${i + 1}...`);
            await this.waitForNetworkIdle();
            await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
            
            // Check if tech process modal is still open
            const modalContent = this.page.locator(SelectorsPartsDataBase.MODAL_CONTENT);
            const isModalOpen = await modalContent.isVisible().catch(() => false);
            
            logger.log(`📋 Modal is ${isModalOpen ? 'open' : 'closed'} for operation ${i + 1}`);
            
            if (!isModalOpen) {
              logger.log(`🔄 Modal closed, reopening for operation ${i + 1}...`);
              // Modal closed, reopen it
              // Wait for the page to be ready first
              await this.waitForNetworkIdle();
              await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
              
              // Wait for the tech process button to be visible and enabled
              const techProcessButton = this.page.locator(techProcessButtonSelector);
              await techProcessButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
              await this.waitAndHighlight(techProcessButton);
              await techProcessButton.click();
              
              // Wait for modal to open
              await this.page.waitForSelector(SelectorsPartsDataBase.MODAL_CONTENT, { timeout: WAIT_TIMEOUTS.STANDARD });
              await this.waitForNetworkIdle();
              await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
              logger.log(`✅ Modal reopened for operation ${i + 1}`);
            }
          }

          // Click on "Добавить операцию" (Add Operation)
          // For products/assemblies, try Creator pattern first, then fall back to EditDetal pattern
          let addOperationButtonSelector = SelectorsPartsDataBase.BUTTON_ADD_OPERATION;
          if (objectType === 'product' || objectType === 'assembly') {
            const creatorAddOperation = '[data-testid="Creator-ModalTechProcess-Buttons-ButtonCreate"]';
            const creatorButton = this.page.locator(creatorAddOperation);
            const creatorButtonCount = await creatorButton.count();
            if (creatorButtonCount > 0) {
              addOperationButtonSelector = creatorAddOperation;
            }
          }
          
          // Wait for the button to be visible and enabled before clicking
          const addButton = this.page.locator(addOperationButtonSelector);
          await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await this.waitAndHighlight(addButton);
          await this.clickButton('Добавить операцию', addOperationButtonSelector);

          // Click on the type of operation dropdown
          await this.waitForNetworkIdle();
          await this.page.locator(SelectorsPartsDataBase.BASE_FILTER_TITLE).click();

          // Search for operation type
          const searchTypeOperation = this.page.locator(SelectorsPartsDataBase.BASE_FILTER_SEARCH_INPUT);
          await searchTypeOperation.fill(operationType);

          if (testInfo) {
            await expectSoftWithScreenshot(
              this.page,
              async () => {
                expect.soft(await searchTypeOperation.inputValue()).toBe(operationType);
              },
              `Verify search type operation input value equals "${operationType}"`,
              testInfo,
            );
          }

          // Select first option from dropdown
          const filterOption = this.page.locator(SelectorsPartsDataBase.BASE_FILTER_OPTION_FIRST);
          await filterOption.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await this.waitAndHighlight(filterOption);
          await filterOption.click();
          await this.page.waitForTimeout(TIMEOUTS.STANDARD);

          // Save the operation (handle nested modal if exists)
          await this.waitForNetworkIdle();
          await this.page.waitForTimeout(TIMEOUTS.STANDARD);

          // Check for nested modal and save it first
          // For products/assemblies, try Creator pattern first, then fall back to EditDetal pattern
          let nestedModalSelector = SelectorsPartsDataBase.MODAL_ADD_OPERATION;
          let nestedSaveButtonSelector = SelectorsPartsDataBase.BUTTON_ADD_OPERATION_SAVE;
          if (objectType === 'product' || objectType === 'assembly') {
            const creatorNestedModal = '[data-testid="Creator-ModalTechProcess-ModalAddOperation-Modal"]';
            const creatorNestedModalCount = await this.page.locator(creatorNestedModal).count();
            if (creatorNestedModalCount > 0) {
              nestedModalSelector = creatorNestedModal;
              nestedSaveButtonSelector = '[data-testid="Creator-ModalTechProcess-ModalAddOperation-SaveButton"]';
            }
          }

          const nestedModal = this.page.locator(`${nestedModalSelector}[open]`);
          const isNestedModalVisible = await nestedModal.isVisible().catch(() => false);

          if (isNestedModalVisible) {
            // Use the selector directly - it already includes the button tag
            const nestedSaveButton = this.page.locator(nestedSaveButtonSelector);
            await nestedSaveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
            await this.waitAndHighlight(nestedSaveButton);
            await nestedSaveButton.click({ force: true });
            await this.page.waitForTimeout(TIMEOUTS.LONG);
            await this.waitForNetworkIdle();
          }

          // Save the main tech process modal
          // For products/assemblies, try Creator pattern first, then fall back to EditDetal pattern
          let saveOperationButtonSelector = SelectorsPartsDataBase.BUTTON_SAVE_OPERATION;
          if (objectType === 'product' || objectType === 'assembly') {
            const creatorSaveOperation = '[data-testid="Creator-ModalTechProcess-Button-Save"]';
            const creatorSaveButton = this.page.locator(creatorSaveOperation);
            const creatorSaveButtonCount = await creatorSaveButton.count();
            if (creatorSaveButtonCount > 0) {
              saveOperationButtonSelector = creatorSaveOperation;
            } else {
              // If Creator pattern not found, try EditDetal pattern as fallback
              const editDetalSaveOperation = SelectorsPartsDataBase.BUTTON_SAVE_OPERATION;
              const editDetalSaveButton = this.page.locator(editDetalSaveOperation);
              const editDetalSaveButtonCount = await editDetalSaveButton.count();
              if (editDetalSaveButtonCount > 0) {
                saveOperationButtonSelector = editDetalSaveOperation;
              }
            }
          }

          const mainSaveButton = this.page.locator(saveOperationButtonSelector);
          await mainSaveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });
          await this.waitAndHighlight(mainSaveButton);
          
          logger.log(`💾 Clicking save button for operation "${operationType}" (${i + 1}/${operationTypes.length})`);
          await mainSaveButton.click({ force: true });
          await this.page.waitForTimeout(TIMEOUTS.LONG);
          await this.waitForNetworkIdle();

          // Wait for modal to stabilize
          await this.page.waitForTimeout(TIMEOUTS.LONG);
          await this.waitForNetworkIdle();

          logger.log(`✅ Added operation "${operationType}" to ${objectType} "${objectName}"`);
        });
      }

      // Close tech process modal if still open (click Cancel or close)
      const cancelButton = this.page.locator(SelectorsPartsDataBase.BUTTON_PROCESS_CANCEL);
      const cancelButtonVisible = await cancelButton.isVisible().catch(() => false);
      if (cancelButtonVisible) {
        await this.clickButton('Отменить', SelectorsPartsDataBase.BUTTON_PROCESS_CANCEL);
        await this.waitForNetworkIdle();
      } else {
        // Try to close by clicking outside or Escape
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TIMEOUTS.SHORT);
      }
    });

    return true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Specification Data Structure (Exported for use in test files)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Interface for product specification structure
 * Allows flexible creation of products with materials, assemblies, and details
 */
export interface ProductSpecification {
  productName: string;
  materials?: Array<{ name: string; quantity?: number }>;
  assemblies?: Array<{
    name: string;
    materials?: Array<{ name: string; quantity?: number }>;
    details?: Array<{ name: string; quantity?: number }>;
  }>;
  details?: Array<{ name: string; quantity?: number }>;
}

/**
 * Result of product creation operation
 */
export interface CreateProductResult {
  success: boolean;
  productName: string;
  createdDetails: string[];
  createdAssemblies: string[];
  error?: string;
}
