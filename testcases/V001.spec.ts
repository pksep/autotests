/**
 * @file V001.spec.ts
 * @purpose Validation-only suite: walk the site page-by-page and validate titles, buttons, and filters
 *         from JSON (e.g. U001-PC1.json). No functional testing; minimal actions only to open
 *         dialogs/sections so that their content can be validated.
 */

import { test } from '@playwright/test';
import { performLogin } from './TC000.spec';
import testData from '../testdata/U001-PC1.json';
import testDataU002 from '../testdata/U002-PC1.json';
import { PageObject } from '../lib/Page';
import { ENV, SELECTORS } from '../config';
import { TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import * as LoadingTasksSelectors from '../lib/Constants/SelectorsLoadingTasksPage';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as SelectorsRevision from '../lib/Constants/SelectorsRevision';
import * as SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction from '../lib/Constants/SelectorsArrivalAtTheWarehouseFromSuppliersAndProduction';
import * as MetalWorkingWarhouseSelectors from '../lib/Constants/SelectorsMetalWorkingWarhouse';
import * as SelectorsAssemblyKittingOnThePlan from '../lib/Constants/SelectorsAssemblyKittingOnThePlan';
import * as SelectorsCompleteSets from '../lib/Constants/SelectorsCompleteSets';

type ElementSpec = {
  titles?: string[];
  buttons?: Array<{ class?: string; datatestid?: string; label: string; state?: string | boolean }>;
  filters?: Array<{ class?: string; datatestid?: string; label: string; state?: string }>;
};

/** Normalize buttons/filters from JSON for validatePageHeadersAndButtons (state as boolean). */
function getButtonsForValidation(element: ElementSpec): Array<{ class?: string; datatestid?: string; label: string; state?: string | boolean }> {
  const buttons = (element?.buttons || []).map(b => ({
    ...b,
    state: typeof b.state === 'string' ? b.state === 'true' : b.state ?? true,
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
  jsonKey: keyof typeof testData.elements;
  containerSelector: string;
  url?: string;
  sectionSelector?: string;
  useModalMethod?: boolean;
  openAction?: { clickSelector: string; waitAfter?: number };
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
  },
  {
    stepName: 'Cbed shortage (Warehouse)',
    jsonKey: 'CbedShortage',
    containerSelector: SelectorsShortagePages.PAGE_TESTID_CBED,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsShortagePages.SELECTOR_DEFICIT_CBED_PAGE,
  },
  {
    stepName: 'Metalworking warehouse',
    jsonKey: 'MetalworkingWarhouse',
    containerSelector: MetalWorkingWarhouseSelectors.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: MetalWorkingWarhouseSelectors.SELECTOR_METAL_WORKING_WARHOUSE,
  },
  {
    stepName: 'Assembly kitting on plan',
    jsonKey: 'AssemblyKittingOnThePlan',
    containerSelector: SelectorsAssemblyKittingOnThePlan.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsAssemblyKittingOnThePlan.SELECTOR_COMPLETION_CBED_PLAN,
  },
  {
    stepName: 'Disassembly (Complete sets)',
    jsonKey: 'DisassemblyPage',
    containerSelector: SelectorsCompleteSets.ASSEMBLY_PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsCompleteSets.SELECTOR_COMPLETE_SETS,
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
  },
  {
    stepName: 'Revision',
    jsonKey: 'RevisionPage',
    containerSelector: SelectorsRevision.PAGE_TESTID,
    url: SELECTORS.MAINMENU.WAREHOUSE.URL,
    sectionSelector: SelectorsRevision.WAREHOUSE_PAGE_REVISIONS_TESTID,
  },
];

/** U001 has most elements; U002 has MetalworkingWarhouse. */
const elementsU001 = testData.elements as Record<string, ElementSpec>;
const elementsU002 = testDataU002.elements as Record<string, ElementSpec>;
function getElement(jsonKey: string): ElementSpec | undefined {
  return elementsU001[jsonKey] ?? elementsU002[jsonKey];
}

export const runV001 = (_isSingleTest?: boolean, _iterations?: number) => {
  test.describe('V001 - Validate site pages against JSON', () => {
    test('V001 - Full validation tour (titles, buttons, filters)', async ({ page }) => {
      await performLogin(page, '001', 'Перов Д.А.', '54321');
      await page.waitForTimeout(TIMEOUTS.STANDARD);

      const po = new PageObject(page);
      let currentUrl: string | null = null;

      for (const step of V001_STEPS) {
        await test.step(`Step: ${step.stepName}`, async () => {
          // Navigate to URL if step has its own url (or we need to open a section on a new base)
          if (step.url) {
            if (step.url !== currentUrl) {
              await po.goto(step.url);
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(TIMEOUTS.INPUT_SET);
              currentUrl = step.url;
            }
          }

          // Open a section on the current page (e.g. warehouse menu item)
          if (step.sectionSelector) {
            await po.findTable(step.sectionSelector);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(TIMEOUTS.INPUT_SET);
          }

          // Open modal or another view (e.g. Create order, Choice product modal)
          if (step.openAction) {
            await page.locator(step.openAction.clickSelector).click();
            await page.waitForTimeout(step.openAction.waitAfter ?? TIMEOUTS.STANDARD);
          }

          const element = getElement(step.jsonKey as string);
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

          await po.validatePageHeadersAndButtons(
            page,
            titles,
            buttons,
            step.containerSelector,
            {
              skipTitleValidation: step.skipTitleValidation || titles.length === 0,
              skipButtonValidation: step.skipButtonValidation || buttons.length === 0,
              useModalMethod: step.useModalMethod,
            },
          );

          if (step.closeModalSelector) {
            await page.locator(step.closeModalSelector).click();
            await page.waitForTimeout(TIMEOUTS.SHORT);
          }
        });
      }
    });
  });
};
