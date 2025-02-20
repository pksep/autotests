import { ENV } from './config'; // Import the selected suite from configuration
import { testSuites } from './testSuiteConfig'; // Import all test suites
import { test } from '@playwright/test'; // Import Playwright's test module

// Define the type for the keys of testSuites
type TestSuiteKeys = keyof typeof testSuites;

// Ensure selectedSuite is typed as one of the keys of testSuites
const selectedSuite: TestSuiteKeys = ENV.TEST_SUITE as TestSuiteKeys; // Type assertion

// Use the selected suite directly
const suite = testSuites[selectedSuite];

// Create a test.describe block for the selected test suite, including the suite description
test.describe(`Test Suite: ${selectedSuite} - ${suite.description}`, () => {
  // Loop through each test function in the suite and call it
  suite.tests.forEach(({ test: testFunc, description }) => {
    if (typeof testFunc === 'function') {
      // Format the full description with suite ID and individual test description
      const fullDescription = `Test Suite: ${selectedSuite} - ${description}`;

      // Invoke the test function directly with proper error handling
      try {
        testFunc();
      } catch (error) {
        console.error(
          `Error in test function for suite "${selectedSuite}":`,
          error
        );
      }
    } else {
      console.error(
        `Test function for suite "${selectedSuite}" is not a valid function.`
      );
    }
  });
});
