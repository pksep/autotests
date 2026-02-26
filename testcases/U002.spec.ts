/**
 * @file U002.spec.ts
 * @purpose Orchestrator for U002 test suite (Verify Order From Suppliers Page Functionality).
 * Delegates to: U002-Setup, U002-UI, U002-DataSetup, U002-Details, U002-Cbed, U002-Izd.
 */

import { runU002_01_Setup } from './U002-Setup.spec';
import { runU002_02_UI } from './U002-UI.spec';
import { runU002_03_DataSetup } from './U002-DataSetup.spec';
import { runU002_04_Details } from './U002-Details.spec';
import { runU002_05_Cbed } from './U002-Cbed.spec';
import { runU002_06_Izd } from './U002-Izd.spec';
import logger from '../lib/utils/logger';

declare global {
  var firstItemName: string;
  var orderNumber: string;
  var initialOrderedQuantity: string;
  var pushedIntoProductionQuantity: string;
  var bothItemNames: string[];
  var orderNumber2: string;
}

export const runU002 = (isSingleTest: boolean, iterations: number) => {
  logger.info(`Starting test: Verify Order From Suppliers Page Functionality`);

  runU002_01_Setup(isSingleTest, iterations);
  runU002_02_UI(isSingleTest, iterations);
  runU002_03_DataSetup(isSingleTest, iterations);
  runU002_04_Details(isSingleTest, iterations);
  runU002_05_Cbed(isSingleTest, iterations);
  runU002_06_Izd(isSingleTest, iterations);
};
