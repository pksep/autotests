/**
 * @file U005-Constants.ts
 * @purpose Shared constants and test data for U005 test suite (full specifications / add detail with files).
 * Used by: U005-01.spec.ts, U005-02.spec.ts.
 */

/** Prefix for test details created by U005; used by Test Case 0 (cleanup) to archive them before runs. */
export const U005_CLEANUP_PREFIX = 'U005_test2';

export const TEST_DETAIL_NAME = 'U005_test2_DETAILName';
export const TEST_CATEGORY = '3D печать';
export const TEST_MATERIAL = '09Г2С (Сталь)';
export const TEST_NAME = 'Круг Сталь 09Г2С Ø100мм';
export const TEST_FILE = '87.02-05.01.00СБ Маслобак (ДГП15)СБ.jpg';

export const baseFileNamesToVerify = [
  { name: 'Test_imagexx_1', extension: '.jpg' },
  { name: 'Test_imagexx_2', extension: '.png' },
];
