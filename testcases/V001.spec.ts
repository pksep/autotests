/**
 * @file V001.spec.ts
 * @purpose Validation-only suite: walk the site page-by-page and validate titles, buttons, and filters
 *         from JSON (e.g. U001-PC1.json). No functional testing; minimal actions only to open
 *         dialogs/sections so that their content can be validated.
 */

import { test } from '@playwright/test';
import testData from '../testdata/U001-PC1.json';
import testDataU002 from '../testdata/U002-PC1.json';
import testDataU004 from '../testdata/U004-PC01.json';
import testDataU005 from '../testdata/U005-PC01.json';
import { PageObject } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import * as SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction from '../lib/Constants/SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction';
import * as MetalWorkingWarhouseSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsCompleteSets from '../lib/Constants/SelectorsCompleteSets';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import logger from '../lib/utils/logger';

type ElementSpec = {
  titles?: string[];
  buttons?: Array<{ class?: string; datatestid?: string; label: string; state?: string | boolean }>;
  filters?: Array<{ class?: string; datatestid?: string; label: string; state?: string }>;
};

/** Normalize buttons/filters from JSON for validatePageHeadersAndButtons (state as boolean). */
function getButtonsForValidation(element: ElementSpec): Array<{ class?: string; datatestid?: string; label: string; state?: string | boolean }> {
  const buttons = (element?.buttons || []).map(b => ({
    ...b,
    state: typeof b.state === 'string' ? b.state === 'true' : (b.state ?? true),
  }));
  const filters = (element?.filters || []).map(f => ({
    class: f.class,
    datatestid: f.datatestid,
    label: f.label,
    state: f.state === 'true',
  }));
  return [...buttons, ...filters];
}

/** Validation step definition: how to open the page/section and which JSON + container to use. */
interface ValidationStep {
  stepName: string;
  jsonKey: string;
  containerSelector: string;
  url?: string;
  sectionSelector?: string;
  /** Wait for this table/body after navigating (after goto when no section, or after clicking section). */
  tableBodySelector?: string;
  /** If true, use waitingTableBodyNoThead instead of waitingTableBody. */
  waitTableNoThead?: boolean;
  useModalMethod?: boolean;
  openAction?: { clickSelector: string; waitAfter?: number };
  /** Optional second click after first openAction (e.g. click Create then click Деталь). */
  openAction2?: { clickSelector: string; waitAfter?: number };
  closeModalSelector?: string;
  skipTitleValidation?: boolean;
  skipButtonValidation?: boolean;
}

const V001_STEPS: ValidationStep[] = [
  {
    stepName: 'Loading (Shipping tasks)',
    jsonKey: 'LoadingPage',
    containerSelector: LoadingTasksSelectors.issueShipmentPage,
    url: SELECTORS.MAINMENU.SHIPPING_TASKS.URL,
    tableBodySelector: LoadingTasksSelectors.SHIPMENTS_TABLE_BODY,
  },
  {
    stepName: 'Create order page',
    jsonKey: 'CreateOrderPage',
    containerSelector: LoadingTasksSelectors.addOrderComponent,
    openAction: { clickSelector: LoadingTasksSelectors.buttonCreateOrder, waitAfter: TIMEOUTS.STANDARD },
  },
  {
    stepName: 'Modal: Choice product',
    jsonKey: 'ModalWindowChoiceProduct',
    containerSelector: '.modal-yui-kit__modal-content',
    useModalMethod: true,
    openAction: { clickSelector: LoadingTasksSelectors.buttonChoiceIzd, waitAfter: TIMEOUTS.STANDARD },
    closeModalSelector: '[data-testid="AddOrder-ModalListProduct-CancelButton"]',
  },
  {
    stepName: 'Product shortage (Warehouse)',
    jsonKey: 'ProductShortage',
    containerSelector: SelectorsShortagePages.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsShortagePages.SELECTOR_DEFICIT_PRODUCTION,
    tableBodySelector: SelectorsShortagePages.TABLE_DEFICIT_IZD,
  },
  {
    stepName: 'Cbed shortage (Warehouse)',
    jsonKey: 'CbedShortage',
    containerSelector: SelectorsShortagePages.PAGE_TESTID_CBED,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE,
    tableBodySelector: SelectorsShortagePages.TABLE_DEFICIT_CBED,
  },
  {
    stepName: 'Metalworking warehouse',
    jsonKey: 'MetalworkingWarhouse',
    containerSelector: MetalWorkingWarhouseSelectors.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE,
    tableBodySelector: MetalWorkingWarhouseSelectors.TABLE_METAL_WORKING_WARHOUSE,
  },
  {
    stepName: 'Assembly kitting on plan',
    jsonKey: 'AssemblyKittingOnThePlan',
    containerSelector: SelectorsAssemblyKittingOnThePlan.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN,
    tableBodySelector: SelectorsAssemblyKittingOnThePlan.TABLE_COMPLECT_TABLE,
  },
  {
    stepName: 'Disassembly (Complete sets)',
    jsonKey: 'DisassemblyPage',
    containerSelector: SelectorsCompleteSets.ASSEMBLY_PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsCompleteSets.SELECTOR_COMPLETE_SETS,
    tableBodySelector: SelectorsCompleteSets.TABLE_SCROLL,
  },
  {
    stepName: 'Arrival at warehouse',
    jsonKey: 'ArrivalAtTheWarehousePage',
    containerSelector: SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction.SELECTOR_ARRIVAL_AT_THE_WAREHOUSE_FROM_SUPPLIERS_AND_PRODUCTION,
  },
  {
    stepName: 'Warehouse: Loading tasks (shipment)',
    jsonKey: 'WarehouseLoadingTasks',
    containerSelector: SelectorsShipmentTasks.SELECTOR_SCLAD_SHIPPING_TASKS,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsShipmentTasks.SELECTOR_SHIPPING_TASKS,
    tableBodySelector: SelectorsShipmentTasks.SHIPMENTS_TABLE_BODY,
  },
  {
    stepName: 'Revision',
    jsonKey: 'RevisionPage',
    containerSelector: SelectorsRevision.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID,
    tableBodySelector: SelectorsRevision.WAREHOUSE_REVISION_PRODUCTS_TABLE,
    waitTableNoThead: true,
  },
  // --- U005: Parts database and Create detail flow (from U004-PC01, U005-PC01) ---
  {
    stepName: 'Parts database (Main page)',
    jsonKey: 'MainPage',
    containerSelector: SelectorsPartsDataBase.MAIN_PAGE_MAIN_DIV,
    url: SELECTORS.MAINMENU.PARTS_DATABASE.URL,
    tableBodySelector: SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE,
  },
  {
    stepName: 'Create popup (Изделие / СБ / Деталь)',
    jsonKey: 'modalAddButtonsPopup',
    containerSelector: '.modal-yui-kit__modal-content',
    openAction: { clickSelector: SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART, waitAfter: TIMEOUTS.STANDARD },
    skipTitleValidation: true,
  },
  {
    stepName: 'Create detail page (AddDetal)',
    jsonKey: 'CreatePage',
    containerSelector: SelectorsPartsDataBase.ADD_DETAIL_PAGE,
    openAction: { clickSelector: SelectorsPartsDataBase.BUTTON_DETAIL_DIV, waitAfter: TIMEOUTS.STANDARD },
  },
  {
    stepName: 'Modal: Добавление материала',
    jsonKey: 'modalAddMaterial',
    containerSelector: 'dialog[data-testid^="ModalBaseMaterial"]',
    useModalMethod: true,
    openAction: {
      clickSelector: `${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS} ${SelectorsPartsDataBase.ADD_DETAIL_CHARACTERISTIC_BLANKS_SELECTED_MATERIAL_NAME_SET}`,
      waitAfter: TIMEOUTS.STANDARD,
    },
    closeModalSelector: SelectorsPartsDataBase.MODAL_BASE_MATERIAL_CANCEL_BUTTON,
  },
  {
    stepName: 'Modal: Добавить из базы',
    jsonKey: 'modalAddFromBase',
    containerSelector: '[data-testid="AddDetal-FileComponent-ModalBaseFiles"]',
    useModalMethod: true,
    openAction: {
      clickSelector: SelectorsPartsDataBase.ADD_DETAIL_FILE_COMPONENT_ADD_FILE_BUTTON,
      waitAfter: TIMEOUTS.STANDARD,
    },
    closeModalSelector: '[data-testid="AddDetal-FileComponent-ModalBaseFiles-FooterButtons-CancelButton"]',
  },
];

/** U001, U002, U004, U005 element specs. */
const elementsU001 = testData.elements as Record<string, ElementSpec>;
const elementsU002 = testDataU002.elements as Record<string, ElementSpec>;
const elementsU004 = testDataU004.elements as Record<string, ElementSpec>;
const elementsU005 = testDataU005.elements as Record<string, ElementSpec>;

function getElement(jsonKey: string): ElementSpec | undefined {
  if (jsonKey === 'modalAddButtonsPopup') {
    const arr = (elementsU005 as Record<string, unknown>).modalAddButtonsPopup as ElementSpec['buttons'];
    return arr ? { buttons: arr } : undefined;
  }
  return elementsU001[jsonKey] ?? elementsU002[jsonKey] ?? elementsU004[jsonKey] ?? elementsU005[jsonKey];
}

export const runV001 = (_isSingleTest?: boolean, _iterations?: number) => {
  test.describe('V001 - Validate site pages against JSON', () => {
    test('V001 - Full validation tour (titles, buttons, filters)', async ({ page }, testInfo) => {
      testInfo.setTimeout(TEST_TIMEOUTS.LONG); // 10 min - many steps with navigation and waits
      // Login is done in setup.ts beforeEach; we start already on the homepage.
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const po = new PageObject(page);
      let currentUrl: string | null = null;

      for (const step of V001_STEPS) {
        await test.step(`Step: ${step.stepName}`, async () => {
          // Navigate to URL if step has its own url. Re-goto when we have a section to open so the sidebar is visible (e.g. Warehouse subsections).
          if (step.url) {
            const needGoto = step.url !== currentUrl || !!step.sectionSelector;
            if (needGoto) {
              await po.goto(step.url);
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(TIMEOUTS.INPUT_SET);
              currentUrl = step.url;
            }
            // Wait for page content when we have a table body selector but no section to click (e.g. Loading/Shipping tasks)
            if (step.tableBodySelector && !step.sectionSelector) {
              if (step.waitTableNoThead) {
                await po.waitingTableBodyNoThead(step.tableBodySelector);
              } else {
                await po.waitingTableBody(step.tableBodySelector, { minRows: 0, timeoutMs: 15000 });
              }
              await page.waitForTimeout(TIMEOUTS.INPUT_SET);
            }
          }

          // Open a section on the current page (e.g. warehouse menu item) — click sidebar/menu to open that view
          if (step.sectionSelector) {
            await po.findTable(step.sectionSelector);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);
            // Wait for section content (table) to load after clicking the section
            if (step.tableBodySelector) {
              if (step.waitTableNoThead) {
                await po.waitingTableBodyNoThead(step.tableBodySelector);
              } else {
                await po.waitingTableBody(step.tableBodySelector, { minRows: 0, timeoutMs: 15000 });
              }
              await page.waitForTimeout(TIMEOUTS.INPUT_SET);
            }
          }

          // Open modal or another view (e.g. Create order, Choice product modal)
          if (step.openAction) {
            await page.locator(step.openAction.clickSelector).first().click();
            await page.waitForTimeout(step.openAction.waitAfter ?? TIMEOUTS.STANDARD);
          }
          if (step.openAction2) {
            await page.locator(step.openAction2.clickSelector).first().click();
            await page.waitForTimeout(step.openAction2.waitAfter ?? TIMEOUTS.STANDARD);
          }

          const element = getElement(step.jsonKey);
          if (!element) {
            console.warn(`V001: No JSON element for key "${step.jsonKey}", skipping validation.`);
            if (step.closeModalSelector) {
              await page.locator(step.closeModalSelector).click();
              await page.waitForTimeout(TIMEOUTS.SHORT);
            }
            return;
          }

          const titles = (element.titles || []).map(t => t.trim());
          const buttons = getButtonsForValidation(element);

          await po.validatePageHeadersAndButtons(page, titles, buttons, step.containerSelector, {
            skipTitleValidation: step.skipTitleValidation || titles.length === 0,
            skipButtonValidation: step.skipButtonValidation || buttons.length === 0,
            useModalMethod: step.useModalMethod,
          });

          if (step.closeModalSelector) {
            await page.locator(step.closeModalSelector).click();
            await page.waitForTimeout(TIMEOUTS.SHORT);
          }
        });
      }
    });
  });
};
