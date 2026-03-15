import { test } from '@playwright/test';
import { ENV } from './config';
import { testSuites } from './testSuiteConfig';
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
const selectedSuite: TestSuiteKeys = ENV.TEST_SUITE as TestSuiteKeys;
const suite = testSuites[selectedSuite];

test.describe.serial(`Test Suite: ${selectedSuite} - ${suite.description}`, () => {
  runSetup();

  suite.tests.forEach(({ test: testFunc }) => {
    if (typeof testFunc === 'function') {
      try {
        (testFunc as () => void)();
      } catch (error) {
        logger.error(`Error in test function for suite "${selectedSuite}":`, error);
      }
    } else {
      logger.error(`Test function for suite "${selectedSuite}" is not a valid function.`);
    }
  });
});
