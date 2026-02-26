const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'U006.spec.ts');
const raw = fs.readFileSync(src, 'utf8');
const lines = raw.split('\n');

function extract(s, e) {
  return lines.slice(s - 1, e).join('\n');
}

const ARCHIVE_RANGES = [
  [28, 206], [207, 329], [330, 452],
  [1547, 1670], [1783, 1905], [2115, 2237], [2557, 2679], [2844, 2966],
  [3295, 3417], [3467, 3589], [3851, 3973], [4188, 4310], [4586, 4708],
  [4879, 5001], [5166, 5288], [5585, 5707], [5950, 6072], [6148, 6270],
  [6581, 6703], [6844, 6966], [7312, 7434],
];

const CREATE_RANGES = [
  [454, 1546], [1671, 1782], [1906, 2114], [2238, 2556], [2680, 2843],
  [2967, 3294], [3418, 3466], [3590, 3850],
];

const SAVE_RANGES = [
  [3974, 4187], [4311, 4585], [4709, 4878], [5002, 5165], [5289, 5584],
];

const EDGE_RANGES = [
  [5708, 5949], [6073, 6147], [6271, 6580], [6704, 6843], [6967, 7311], [7435, 8041],
];

const header = `import { test, expect, Locator } from '@playwright/test';
import { SELECTORS } from '../config';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import { CreatePartsDatabasePage } from '../pages/PartsDatabasePage';
import testData1 from '../testdata/U005-PC01.json';
import * as SelectorsFileComponents from '../lib/Constants/SelectorsFileComponents';
import * as SelectorsPartsDataBase from '../lib/Constants/SelectorsPartsDataBase';
import { TIMEOUTS, WAIT_TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import { HIGHLIGHT_PENDING, HIGHLIGHT_SUCCESS, HIGHLIGHT_ERROR } from '../lib/Constants/HighlightStyles';
import { expectSoftWithScreenshot } from '../lib/Page';
`;

const headerWithShared = header + "import { baseFileNamesToVerify, InputLike } from './U006-shared';\n";

fs.writeFileSync(
  path.join(__dirname, 'U006-Archive.spec.ts'),
  header + '\nexport const runU006Archive = () => {\n  ' + ARCHIVE_RANGES.map(([s, e]) => extract(s, e)).join('\n\n  ') + '\n};\n'
);

fs.writeFileSync(
  path.join(__dirname, 'U006-CreateAndValidation.spec.ts'),
  headerWithShared + '\nexport const runU006CreateAndValidation = () => {\n  ' + CREATE_RANGES.map(([s, e]) => extract(s, e)).join('\n\n  ') + '\n};\n'
);

fs.writeFileSync(
  path.join(__dirname, 'U006-SaveAndEdit.spec.ts'),
  headerWithShared + '\nexport const runU006SaveAndEdit = () => {\n  ' + SAVE_RANGES.map(([s, e]) => extract(s, e)).join('\n\n  ') + '\n};\n'
);

fs.writeFileSync(
  path.join(__dirname, 'U006-EdgeCasesAndBulk.spec.ts'),
  headerWithShared + '\nexport const runU006EdgeCasesAndBulk = () => {\n  ' + EDGE_RANGES.map(([s, e]) => extract(s, e)).join('\n\n  ') + '\n};\n'
);

console.log('Wrote U006-Archive, U006-CreateAndValidation, U006-SaveAndEdit, U006-EdgeCasesAndBulk');
console.log('CreateAndValidation uses InputLike? Check if needed.');
console.log('CreateAndValidation and others may need: type InputLike in file or import from shared - only if evaluate() is used.');