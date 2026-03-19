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
const DEFAULT_PARALLEL_SUITE_KEYS = ['U001', 'U002', 'U003', 'suite01'] as const;

function parseParallelSuiteKeysFromEnv(): readonly string[] {
  // Override from .env:
  //   PARALLEL_SUITE_KEYS=U001,U002,U003,suite01
  const raw = process.env.PARALLEL_SUITE_KEYS;
  if (!raw) return [...DEFAULT_PARALLEL_SUITE_KEYS];

  const parts = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // If env var is empty/invalid, fall back to defaults (avoid workers=0).
  return parts.length > 0 ? parts : [...DEFAULT_PARALLEL_SUITE_KEYS];
}

export const PARALLEL_SUITE_KEYS = parseParallelSuiteKeysFromEnv();
