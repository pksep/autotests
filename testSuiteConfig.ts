/**
 * Suite registry: single entry point for main.spec.ts and config.
 * UI and API suites are defined in testSuiteConfig.ui.ts and testSuiteConfig.api.ts.
 * TEST_SUITE (config / env) keys are unchanged; no changes required to config.ts or env variables.
 */

import { apiSuites } from './testSuiteConfig.api';
import { uiSuites } from './testSuiteConfig.ui';

export const testSuites = {
  ...uiSuites,
  ...apiSuites,
};
