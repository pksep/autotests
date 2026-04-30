import { runU006Archive } from './U006-Archive.spec';
import { runU006CreateAndValidation } from './U006-CreateAndValidation.spec';
import { runU006SaveAndEdit } from './U006-SaveAndEdit.spec';
import { runU006EdgeCasesAndBulk } from './U006-EdgeCasesAndBulk.spec';

/**
 * U006 suite entry point. Split bodies match `repo-at-single-U001/testcases/U006.spec.ts` (golden).
 * Regenerate from golden: `python scripts/regenerate_u006_from_golden.py` (then verify locator fixes if constants drift).
 * Order: Archive (TC 01, CL 01–02) → Create/Validation (TC 02–09, CL 03–10) → Save/Edit (TC 10–14, CL 11–15) → Edge/Bulk (TC 15–21, CL 16–22).
 */
export const runU006 = () => {
  runU006Archive();
  runU006CreateAndValidation();
  runU006SaveAndEdit();
  runU006EdgeCasesAndBulk();
};
