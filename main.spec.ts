import { test } from '@playwright/test';
import { ENV } from './config';
import { testSuites, PARALLEL_SUITE_KEYS } from './testSuiteConfig';
import { apiSuites, serialApiSuiteKeys } from './testSuiteConfig.api';
import { runSetup } from './setup';
import logger from './lib/utils/logger';
import { tagBrowserScript } from './lib/utils/scriptBadge';
import { enableUnauthenticatedAudit } from './lib/helpers/APITestUtils';

// Suppress allure-js-commons NoopTestRuntime warning (appears when using allure.step() with dynamic test registration)
const ALLURE_NOOP_MESSAGE = 'no test runtime is found. Please check test framework configuration';
const _consoleLog = console.log;
console.log = (...args: unknown[]) => {
  if (args[0] === ALLURE_NOOP_MESSAGE) return;
  _consoleLog.apply(console, args);
};

// The complete API run includes stateful flows; preserve their serial groups and hooks.
const runApiTestsIndependently = ENV.TEST_SUITE !== 'all_api_tests' &&
  (process.env.API_NO_AUTH === 'true' || process.env.API_INDEPENDENT_TESTS === 'true');

if (runApiTestsIndependently) {
  // Keep API cases independent: Playwright otherwise skips later serial cases after a failure.
  (test.describe as any).serial = test.describe;
}

if (process.env.API_NO_AUTH === 'true') {
  // Unauthenticated probes must not share setup that requires a valid session.
  (test as any).beforeAll = () => {};
} else if (runApiTestsIndependently && process.env.API_INDEPENDENT_TESTS === 'true') {
  const originalBeforeAll = test.beforeAll.bind(test) as any;
  (test as any).beforeAll = (...args: any[]) => {
    const hook = args[args.length - 1];
    if (typeof hook !== 'function') return originalBeforeAll(...args);

    let setupError: unknown;
    originalBeforeAll(...args.slice(0, -1), async ({ request }: any) => {
      try {
        await hook({ request });
      } catch (error) {
        setupError = error;
        logger.error('Independent API setup failed; dependent tests will be reported individually.', error);
      }
    });
    test.beforeEach(() => {
      if (setupError) throw setupError;
    });
  };
}

type TestSuiteKeys = keyof typeof testSuites;
type SuiteLoginCredentials = {
  tabel: string;
  username: string;
  password: string;
};

function getSuiteLoginCredentials(suiteKey: string): SuiteLoginCredentials | undefined {
  const prefix = `PARALLEL_${suiteKey}_`;
  const tabel = process.env[`${prefix}LOGIN_TABEL`];
  const username = process.env[`${prefix}LOGIN_USERNAME`];
  const password = process.env[`${prefix}LOGIN_PASSWORD`];

  if (!tabel && !username && !password) {
    return undefined;
  }

  if (!tabel || !username || !password) {
    throw new Error(`Incomplete login override for ${suiteKey}. Set ${prefix}LOGIN_TABEL, ${prefix}LOGIN_USERNAME, and ${prefix}LOGIN_PASSWORD.`);
  }

  return { tabel, username, password };
}

function registerSuite(suiteKey: TestSuiteKeys) {
  const suite = testSuites[suiteKey];
  const isApi = Object.keys(apiSuites).includes(suiteKey);
  const isSerialApi = (serialApiSuiteKeys as readonly string[]).includes(suiteKey);
  
  if (!suite) {
    logger.error(`Suite "${suiteKey}" not found in registry. Skipping.`);
    return;
  }
  const describeSuite = isApi ? test.describe : test.describe.serial;

  describeSuite(`Test Suite: ${suiteKey} - ${suite.description}`, () => {
    if (isApi && !isSerialApi) {
      test.describe.configure({ mode: 'parallel' });
    }

    if (isApi && process.env.API_NO_AUTH === 'true') {
      test.beforeEach(async ({ request }) => {
        enableUnauthenticatedAudit(request);
      });
    }

    if (!isApi) {
      test.beforeEach(`Tag browser as ${suiteKey}`, async ({ page }) => {
        await tagBrowserScript(page, suiteKey);
      });
      runSetup(getSuiteLoginCredentials(suiteKey));
    }
    
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
