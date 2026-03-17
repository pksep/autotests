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

/** Suite keys to run in parallel when TEST_SUITE=parallel. Each suite's tests still run sequentially. */
export const PARALLEL_SUITE_KEYS = ['U001', 'U002', 'U003', 'suite01', 'U005', 'U006'] as const;
