/**
 * Shared types and constants for U006 spec parts.
 * Each U006-*.spec.ts file imports test, expect, page objects, and constants directly;
 * this file only provides the shared type and data used across parts.
 */

/** Minimal type for input element in evaluate callbacks (avoids global HTMLInputElement). */
export type InputLike = {
  files?: { length: number };
  value?: string;
  dispatchEvent(e: Event): void;
};

/** Base file names (and extensions) used in filebase verification steps. */
export const baseFileNamesToVerify = [
  { name: 'Test_imagexx_1', extension: '.jpg' },
  { name: 'Test_imagexx_2', extension: '.png' },
];
