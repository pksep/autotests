/**
 * @file TimeoutConstants.ts
 * @date 2025-01-09
 * @purpose Centralized timeout constants for test automation
 *
 * These constants standardize timeout values across all test files to ensure
 * consistent behavior and easier maintenance.
 */

// Timeout constants for waitForTimeout() operations (in milliseconds)
export const TIMEOUTS = {
  VERY_SHORT: 200, // Quick pauses
  SHORT: 300, // Brief waits
  MEDIUM: 500, // Standard wait / pause for validation
  STANDARD: 1000, // Common wait / page render
  INPUT_SET: 1500, // Input value setting
  LONG: 2000, // Longer operations
  EXTENDED: 3000, // Extended waits for async processing
  VERY_LONG: 5000, // Very long waits for complex operations
} as const;

// Wait timeout constants for waitFor() operations (in milliseconds)
export const WAIT_TIMEOUTS = {
  VERY_SHORT: 2000, // 2 seconds - very quick element waits
  SHORT: 5000, // 5 seconds - quick element waits
  STANDARD: 10000, // 10 seconds - standard element waits
  LONG: 15000, // 15 seconds - longer element waits
  PAGE_RELOAD: 30000, // 30 seconds - page reload operations
} as const;

// Test timeout constants (in milliseconds)
export const TEST_TIMEOUTS = {
  SHORT: 120000, // 2 minutes - quick tests
  MEDIUM_SHORT: 180000, // 3 minutes - medium-short tests
  MEDIUM: 300000, // 5 minutes - medium tests
  LONG: 600000, // 10 minutes - long tests
  VERY_LONG: 900000, // 15 minutes - very long tests
  EXTENDED: 920000, // ~15.3 minutes - extended tests
} as const;
