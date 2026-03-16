/**
 * @file U003.spec.ts
 * @purpose U003 Shipment Tasks Management – orchestrator only. Test cases live in U003-*.spec.ts.
 */

import logger from '../lib/utils/logger';
import { runU003_00_Cleanup } from './U003-Cleanup.spec';
import { runU003_01_Setup } from './U003-Setup.spec';
import { runU003_02_VerifyCreation } from './U003-VerifyCreation.spec';
import { runU003_03_AddProducts } from './U003-AddProducts.spec';
import { runU003_04_OrderQuantity } from './U003-OrderQuantity.spec';
import { runU003_05_Revision } from './U003-Revision.spec';
import { runU003_06_Teardown } from './U003-Teardown.spec';

export { TEST_PRODUCTS, TEST_PRODUCT_NAMES } from './U003-Constants';

export const runU003 = (isSingleTest: boolean, iterations: number) => {
  logger.log(`Starting test: U003 - Shipment Tasks Management`);

  runU003_00_Cleanup(isSingleTest, iterations);
  runU003_01_Setup(isSingleTest, iterations);
  runU003_02_VerifyCreation(isSingleTest, iterations);
  runU003_03_AddProducts(isSingleTest, iterations);
  runU003_04_OrderQuantity(isSingleTest, iterations);
  runU003_05_Revision(isSingleTest, iterations);
  runU003_06_Teardown(isSingleTest, iterations);
};
