import { runU006Archive } from './U006-Archive.spec';
import { runU006CreateAndValidation } from './U006-CreateAndValidation.spec';
import { runU006SaveAndEdit } from './U006-SaveAndEdit.spec';
import { runU006EdgeCasesAndBulk } from './U006-EdgeCasesAndBulk.spec';

/**
 * U006 suite entry point. Registers all U006 tests in order:
 * Archive (filebase + cleanup) → Create/Validation (01–07) → Save/Edit (08–12) → Edge/Bulk (13–17, 19).
 */
export const runU006 = () => {
  runU006Archive();
  runU006CreateAndValidation();
  runU006SaveAndEdit();
  runU006EdgeCasesAndBulk();
};
