import { test } from '@playwright/test';
import { ENV } from './config';
import { testSuites, PARALLEL_SUITE_KEYS } from './testSuiteConfig';
import { runSetup } from './setup';
import logger from './lib/utils/logger';

// Suppress allure-js-commons NoopTestRuntime warning (appears when using allure.step() with dynamic test registration)
const ALLURE_NOOP_MESSAGE = 'no test runtime is found. Please check test framework configuration';
const _consoleLog = console.log;
console.log = (...args: unknown[]) => {
  if (args[0] === ALLURE_NOOP_MESSAGE) return;
  _consoleLog.apply(console, args);
};

type TestSuiteKeys = keyof typeof testSuites;

function registerSuite(suiteKey: TestSuiteKeys) {
  const suite = testSuites[suiteKey];
  if (!suite) {
    logger.error(`Suite "${suiteKey}" not found in registry. Skipping.`);
    return;
  }
  test.describe.serial(`Test Suite: ${suiteKey} - ${suite.description}`, () => {
    runSetup();
    suite.tests.forEach(({ test: testFunc }) => {
      if (typeof testFunc === 'function') {
        try {
          (testFunc as () => void)();
        } catch (error) {
          logger.error(`Error in test function for suite "${suiteKey}":`, error);
        }
      } else {
        logger.error(`Test function for suite "${suiteKey}" is not a valid function.`);
      }
    });
  });
}

if (ENV.TEST_SUITE === 'parallel') {
  PARALLEL_SUITE_KEYS.forEach((key) => registerSuite(key as TestSuiteKeys));
} else {
  const selectedSuite = ENV.TEST_SUITE as TestSuiteKeys;
  const suite = testSuites[selectedSuite];
  if (!suite) {
    throw new Error(`Suite "${selectedSuite}" not found. Check TEST_SUITE (env or config).`);
  }
  registerSuite(selectedSuite);
}
