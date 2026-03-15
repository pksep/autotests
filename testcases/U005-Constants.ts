/**
 * @file U005-Constants.ts
 * @purpose Shared constants and test data for U005 test suite (full specifications / add detail with files).
 * Used by: U005-01.spec.ts, U005-02.spec.ts.
 */

/** Prefix for test details created by U005; used by Test Case 0 (cleanup) to archive them before runs. Distinct from U006 (U006 uses U005_test2_DETAILName / SelectorsPartsDataBase.TEST_DETAIL_NAME) so U005 and U006 can run in parallel. */
export const U005_CLEANUP_PREFIX = 'U005_spec';

export const TEST_DETAIL_NAME = 'U005_spec_DETAILName';
export const TEST_CATEGORY = '3D печать';
export const TEST_MATERIAL = '09Г2С (Сталь)';
export const TEST_NAME = 'Круг Сталь 09Г2С Ø100мм';
export const TEST_FILE = '87.02-05.01.00СБ Маслобак (ДГП15)СБ.jpg';

/** File base names used by U005 for verification. Distinct from U006-shared (Test_imagexx_1/2) so U005 and U006 can run in parallel. */
export const baseFileNamesToVerify = [
  { name: 'U005_image_1', extension: '.jpg' },
  { name: 'U005_image_2', extension: '.png' },
];
