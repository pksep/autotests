/**
 * UI (E2E) test suites registry.
 * Subgroups: Bugs (ticket-driven), Suites (multi-step flows), Single (one-off scenarios).
 * Merged and exported as uiSuites for testSuiteConfig.ts. TEST_SUITE keys unchanged.
 */

import { runP001 } from './testcases/P001.spec';
import { runP002 } from './testcases/P002.spec';
import { runP003 } from './testcases/P003.spec';
import { runP004 } from './testcases/P004.spec';
import { runP005 } from './testcases/P005.spec';
import { runP006 } from './testcases/P006.spec';
import { runP007 } from './testcases/P007.spec';
import { runP008 } from './testcases/P008.spec';
import { runP009 } from './testcases/P009.spec';
import { runP010 } from './testcases/P010.spec';
import { runTC100 } from './testcases/TC100.spec';
import { runU001_01_Setup } from './testcases/U001-Setup.spec';
import { runU001_02_Orders } from './testcases/U001-Orders.spec';
import { runU001_03_Production } from './testcases/U001-Production.spec';
import { runU001_04_Assembly } from './testcases/U001-Assembly.spec';
import { runU001_05_Receiving } from './testcases/U001-Receiving.spec';
import { runU001_06_Shipment } from './testcases/U001-Shipment.spec';
import { runU001_07_SecondTask } from './testcases/U001-SecondTask.spec';
import { runU001_08_SecondProduction } from './testcases/U001-SecondProduction.spec';
import { runU001_09_FinalShipment } from './testcases/U001-FinalShipment.spec';
import { runU001_10_Archive } from './testcases/U001-Archive.spec';
import { runU001_11_Cleanup } from './testcases/U001-Cleanup.spec';
import { runU002_01_Setup } from './testcases/U002-Setup.spec';
import { runU002_02_UI } from './testcases/U002-UI.spec';
import { runU002_03_DataSetup } from './testcases/U002-DataSetup.spec';
import { runU002_04_Details } from './testcases/U002-Details.spec';
import { runU002_05_Cbed } from './testcases/U002-Cbed.spec';
import { runU002_06_Izd } from './testcases/U002-Izd.spec';
import { runU003 } from './testcases/U003.spec';
import { runU004_1 } from './testcases/U004-1.spec';
import { runU004_2 } from './testcases/U004-2.spec';
import { runU004_3 } from './testcases/U004-3.spec';
import { runU004_4 } from './testcases/U004-4.spec';
import { runU004_5 } from './testcases/U004-5.spec';
import { runU004_6 } from './testcases/U004-6.spec';
import { runU004_7 } from './testcases/U004-7.spec';
import { runU004_8 } from './testcases/U004-8.spec';
import { runU004_9 } from './testcases/U004-9.spec';
import { runU005 } from './testcases/U005.spec';
import { runU006 } from './testcases/U006.spec';
import { runU007 } from './testcases/U007.spec';
import { runU007_01_Actions } from './testcases/U007-Actions.spec';
import { runV001 } from './testcases/V001.spec';
import { runCheckTableTotals } from './testcases/CheckTableTotals.spec';
import { runERP_969 } from './testcases/ERP-969.spec';
import { runERP_3015 } from './testcases/ERP-3015.spec';
import { runERP_969_2 } from './testcases/ERP-969-2.spec';

// ——— Bugs: ticket-driven / regression suites ———
const uiSuitesBugs = {
  ERP_969: {
    description: 'ERP-969 test suite to verify functionalities specific to ERP-969.',
    tests: [
      { test: runERP_969, description: 'This test checks the ERP-969' },
      { test: runERP_969_2, description: 'This test checks the ERP-969-2' },
    ],
  },
  ERP_3015: {
    description: 'ERP-3015 test suite to verify functionalities specific to ERP-3015 (OrderedFromSuppliers, launch into production).',
    tests: [{ test: runERP_3015, description: 'This test checks the ERP-3015' }],
  },
  ERP_969_2: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runERP_969_2, description: 'verify changes to full specifications after adding items to the product' }],
  },
};

// ——— Suites: multi-step flows (U001 and slices, suite01/02) ———
const uiSuitesSuites = {
  suite01: {
    description: 'This is a group of full page tests p02 - P04',
    tests: [
      { test: runU004_1, description: 'This test checks the User Scenario series of tests U004_1' },
      { test: runU004_2, description: 'This test checks the User Scenario series of tests U004_2' },
      { test: runU004_3, description: 'This test checks the User Scenario series of tests U004_3' },
      { test: runU004_4, description: 'This test checks the User Scenario series of tests U004_4' },
      { test: runU004_5, description: 'This test checks the User Scenario series of tests U004_5' },
      { test: runU004_6, description: 'This test checks the User Scenario series of tests U004_6' },
      { test: runU004_7, description: 'This test checks the User Scenario series of tests U004_7' },
      { test: runU004_8, description: 'This test checks the User Scenario series of tests U004_8' },
      { test: runU004_9, description: 'This test checks the User Scenario series of tests U004_9' },
    ],
  },
  suite02: {
    description: 'This is a group of full page tests tests U005 U006',
    tests: [
      { test: runU005, description: 'This test checks the User Scenario series of tests U005' },
      { test: runU006, description: 'This test checks the User Scenario series of tests U006' },
    ],
  },
  U001: {
    description: 'U001 Complete Suite - All test cases 01-37 (grouped by logical suites).',
    tests: [
      { test: runU001_01_Setup, description: 'U001 Setup & Creation - Test Cases 01-04: Delete products, Create Parts, Create Cbed, Create Product.' },
      { test: runU001_02_Orders, description: 'U001 Order Management - Test Cases 05-07: Create order and extract specification data.' },
      { test: runU001_03_Production, description: 'U001 Production Launch - Test Cases 08-10: Launch products, CBEDs, and parts into production.' },
      { test: runU001_04_Assembly, description: 'U001 Assembly Operations - Test Cases 11-14: Marking parts, completing sets, disassembly.' },
      { test: runU001_05_Receiving, description: 'U001 Receiving Operations - Test Cases 15-18: Receiving parts, CBEDs, and products from production.' },
      { test: runU001_06_Shipment, description: 'U001 Shipment Operations - Test Cases 19-20: Uploading and checking shipment tasks.' },
      { test: runU001_07_SecondTask, description: 'U001 Second Task Cycle - Test Cases 21-27: Second order cycle operations.' },
      { test: runU001_08_SecondProduction, description: 'U001 Second Production Cycle - Test Cases 28-30: Second production launch cycle.' },
      { test: runU001_09_FinalShipment, description: 'U001 Final Shipment - Test Cases 31-32: Final shipment operations and urgency date verification.' },
      { test: runU001_10_Archive, description: 'U001 Archive Operations - Test Cases 33-35: Archiving metalworking, assembly, and shipment tasks.' },
      { test: runU001_11_Cleanup, description: 'U001 Cleanup Operations - Test Cases 36-37: Cleaning up warehouse residues and deleting products.' },
    ],
  },
  U001_Setup: {
    description: 'U001 Setup & Creation - Test Cases 01-04: Delete products, Create Parts, Create Cbed, Create Product.',
    tests: [{ test: runU001_01_Setup, description: 'Test Cases 01-04: Setup and creation of parts, cbed, and product.' }],
  },
  U001_Orders: {
    description: 'U001 Order Management - Test Cases 05-07: Delete orders, Loading Task, Verify urgency date and quantity.',
    tests: [{ test: runU001_02_Orders, description: 'Test Cases 05-07: Order management including creating loading task and verifying order details.' }],
  },
  U001_Production: {
    description: 'U001 Production Launch - Test Cases 08-10: Launch into production for Product, Cbed, and Parts.',
    tests: [{ test: runU001_03_Production, description: 'Test Cases 08-10: Launch products, assemblies, and parts into production.' }],
  },
  U001_Assembly: {
    description: 'U001 Assembly Operations - Test Cases 11-14: Marking parts, completing assemblies, etc.',
    tests: [{ test: runU001_04_Assembly, description: 'Test Cases 11-14: Assembly operations and marking.' }],
  },
  U001_Receiving: {
    description: 'U001 Receiving Operations - Test Cases 15-18: Receiving products from production.',
    tests: [{ test: runU001_05_Receiving, description: 'Test Cases 15-18: Receiving operations.' }],
  },
  U001_Shipment: {
    description: 'U001 Shipment Operations - Test Cases 19-20: Shipment tasks.',
    tests: [{ test: runU001_06_Shipment, description: 'Test Cases 19-20: Shipment operations.' }],
  },
  U001_SecondTask: {
    description: 'U001 Second Task Cycle - Test Cases 21-27: Second order cycle operations.',
    tests: [{ test: runU001_07_SecondTask, description: 'Test Cases 21-27: Second task cycle operations.' }],
  },
  U001_TestCase22_WithDependencies: {
    description:
      'U001 Test Cases 22-32 with dependencies - Runs dependencies and 22-28, then SecondProduction (28-30), then Final Shipment (31-32). Setup (01-04), Orders (05-07), Production (08-10), SecondTask (21-27), SecondProduction (28-30), FinalShipment (31-32). Use --grep to filter specific test cases.',
    tests: [
      { test: runU001_01_Setup, description: 'U001 Setup - Test Cases 01-04: Creates parts (0Т4.21, 0Т4.22) and product (0Т4.01) needed for Test Cases 22-28. All test cases in this suite run together.' },
      { test: runU001_02_Orders, description: 'U001 Orders - Test Cases 05-07: Creates first order and extracts specification data (populates descendantsDetailArray and descendantsCbedArray). All test cases in this suite run together.' },
      { test: runU001_03_Production, description: 'U001 Production - Test Cases 08-10: Launches parts into production, putting them in metalworking warehouse table. All test cases in this suite run together.' },
      { test: runU001_07_SecondTask, description: 'U001 Second Task - Test Cases 21-27: Creates second order (21), marks parts (22), checks urgency date (23), receives parts/CBEDs/products (24-27). All test cases in this suite run together sequentially.' },
      { test: runU001_08_SecondProduction, description: 'U001 Second Production - Test Case 28: Launches product into production for second task. Runs after SecondTask completes.' },
      { test: runU001_09_FinalShipment, description: 'U001 Final Shipment - Test Cases 31-32: Final shipment operations and urgency date verification.' },
    ],
  },
  U001_SecondProduction: {
    description: 'U001 Second Production Cycle - Test Cases 28-30: Second production launch cycle.',
    tests: [{ test: runU001_08_SecondProduction, description: 'Test Cases 28-30: Second production cycle.' }],
  },
  U001_FinalShipment: {
    description: 'U001 Final Shipment - Test Cases 31-32: Final shipment operations.',
    tests: [{ test: runU001_09_FinalShipment, description: 'Test Cases 31-32: Final shipment operations.' }],
  },
  U001_Archive: {
    description: 'U001 Archive Operations - Test Cases 33-35: Archiving orders.',
    tests: [{ test: runU001_10_Archive, description: 'Test Cases 33-35: Archive operations.' }],
  },
  U001_Cleanup: {
    description: 'U001 Cleanup Operations - Test Cases 36-37: Cleanup and verification (OPTIMIZE THESE).',
    tests: [{ test: runU001_11_Cleanup, description: 'Test Cases 36-37: Cleanup operations - needs optimization for performance.' }],
  },
  U001_Tail: {
    description: 'U001 Tail - Archive and Cleanup only (Test Cases 33-37). Non-functional teardown; run after 01-32 (e.g. after U001 or U001 through FinalShipment).',
    tests: [
      { test: runU001_10_Archive, description: 'U001 Archive - Test Cases 33-35.' },
      { test: runU001_11_Cleanup, description: 'U001 Cleanup - Test Cases 36-37.' },
    ],
  },
};

// ——— Single: one-off scenarios / single-spec runs ———
const uiSuitesSingle = {
  page001: {
    description: 'Page 001 test suite to verify functionalities specific to Page 001.',
    tests: [{ test: runP001, description: 'This test checks the responsiveness of Page 001.' }],
  },
  page002: {
    description: 'Page 002 test suite to verify functionalities specific to Page 002.',
    tests: [{ test: runP002, description: 'This test checks the responsiveness of Page 002.' }],
  },
  page003: {
    description: 'Page 003 test suite to verify functionalities specific to Page 003.',
    tests: [{ test: runP003, description: 'This test checks the responsiveness of Page 003.' }],
  },
  page004: {
    description: 'Page 004 test suite to verify functionalities specific to Page 004.',
    tests: [{ test: runP004, description: 'This test checks the responsiveness of Page 004.' }],
  },
  page005: {
    description: 'Page 005 test suite to verify functionalities specific to Page 005.',
    tests: [{ test: runP005, description: 'This test checks the responsiveness of Page 005.' }],
  },
  page006: {
    description: 'Page 006 test suite to verify functionalities specific to Page 006.',
    tests: [{ test: runP006, description: 'This test checks the responsiveness of Page 005.' }],
  },
  page007: {
    description: 'Page 007 test suite to verify functionalities specific to Page 007.',
    tests: [{ test: runP007, description: 'This test checks the responsiveness of Page 007.' }],
  },
  page008: {
    description: 'Page 008 test suite to verify functionalities specific to Page 008.',
    tests: [{ test: runP008, description: 'This test checks the responsiveness of Page 008.' }],
  },
  page009: {
    description: 'Page 009 test suite to verify functionalities specific to Page 009.',
    tests: [{ test: runP009, description: 'This test checks the responsiveness of Page 009.' }],
  },
  page010: {
    description: 'Ordered from suppliers.',
    tests: [{ test: runP010, description: 'Order a part.' }],
  },
  TC100: {
    description: 'Complete specifications verification.',
    tests: [{ test: runTC100, description: 'verifies the complete specifications matches the scanned product.' }],
  },
  V001: {
    description: 'V001 - Validation tour: walk the site page-by-page and validate titles, buttons, and filters from JSON (U001-PC1, U002-PC1). No functional testing; minimal actions only to open dialogs/sections.',
    tests: [{ test: runV001, description: 'V001 - Full validation tour (titles, buttons, filters from JSON).' }],
  },
  U002: {
    description: 'Launch into production (Orders from Suppliers & Warehouse).',
    tests: [
      { test: runU002_01_Setup, description: 'U002 Setup – cleanup and init test data arrays' },
      { test: runU002_02_UI, description: 'U002 UI – Cases 01–03: Ordered from suppliers, Metalworking, Assembly' },
      { test: runU002_03_DataSetup, description: 'U002 DataSetup – Cases 05–07: Create Parts, CBED, Product' },
      { test: runU002_04_Details, description: 'U002 Details – Cases 08, 10, 11: Metalworking warehouse flow' },
      { test: runU002_05_Cbed, description: 'U002 CBED – Cases 13–15: Assembly warehouse flow for sub-assemblies' },
      { test: runU002_06_Izd, description: 'U002 IZD – Cases 16–18: Assembly warehouse flow for products' },
    ],
  },
  U003: {
    description: 'Shipment Tasks Management.',
    tests: [{ test: runU003, description: 'Managing shipment tasks and products.' }],
  },
  U004_1: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_1, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_2: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_2, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_3: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_3, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_4: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_4, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_5: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_5, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_6: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_6, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_7: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_7, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_8: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_8, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U004_9: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU004_9, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U005: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU005, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U006: {
    description: 'verify changes to full specifications after adding items to the product',
    tests: [{ test: runU006, description: 'verify changes to full specifications after adding items to the product' }],
  },
  U007_Actions: {
    description: 'Actions Audit Log Verification.',
    tests: [{ test: runU007_01_Actions, description: 'Verify Create, Edit, and Archive logs for Detail in /actions' }],
  },
  CheckTableTotals: {
    description: 'Verifies that table row counts match the numeric values displayed in homepage cards.',
    tests: [{ test: runCheckTableTotals, description: 'Check table totals functionality by comparing card values with actual table row counts.' }],
  },
};

export const uiSuites = {
  ...uiSuitesBugs,
  ...uiSuitesSuites,
  ...uiSuitesSingle,
};
