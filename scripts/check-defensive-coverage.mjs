import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const autotestsRoot = path.resolve(__dirname, '..');
const apiSpecsRoot = path.join(autotestsRoot, 'testcases', 'API');

const defensivePattern = /defensive|безопасн|невалид|несуществ|ошибочн|защит/i;
const bannedSoftFailPattern = /known-api-defect|test\.info\(\)\.annotations|test\.fail\(true/i;
const strictHelperPattern =
  /expect(ClientError|ValidationError|MissingResource|UnauthorizedOrForbidden|RouteNotExposed|ErrorResponseContract|StatusIn)/;

const allowlistedFlowSpecs = new Set([
  'APIProductionShipmentFlow.spec.ts',
  'APIWaybillProviderFlow.spec.ts',
]);

const specFiles = fs
  .readdirSync(apiSpecsRoot)
  .filter((file) => file.endsWith('.spec.ts'))
  .sort();

const missingDefensive = [];
const missingStrictHelpers = [];
const softFails = [];

for (const file of specFiles) {
  const fullPath = path.join(apiSpecsRoot, file);
  const source = fs.readFileSync(fullPath, 'utf8');
  const relPath = path.relative(autotestsRoot, fullPath).replace(/\\/g, '/');

  if (bannedSoftFailPattern.test(source)) {
    softFails.push(relPath);
  }

  if (allowlistedFlowSpecs.has(file)) {
    continue;
  }

  if (!defensivePattern.test(source)) {
    missingDefensive.push(relPath);
    continue;
  }

  if (!strictHelperPattern.test(source)) {
    missingStrictHelpers.push(relPath);
  }
}

console.log('Defensive API coverage gate');
console.log(`Specs checked: ${specFiles.length}`);
console.log(`Flow specs excluded from per-file defensive requirement: ${allowlistedFlowSpecs.size}`);
console.log(`Missing defensive scenarios: ${missingDefensive.length}`);
console.log(`Defensive specs without strict helpers (warning): ${missingStrictHelpers.length}`);
console.log(`Banned soft-fail patterns: ${softFails.length}`);

if (missingDefensive.length) {
  console.error('\nSpecs without defensive coverage:');
  for (const file of missingDefensive) console.error(`- ${file}`);
}

if (missingStrictHelpers.length) {
  console.warn('\nDefensive specs without strict helper assertions:');
  for (const file of missingStrictHelpers) console.warn(`- ${file}`);
}

if (softFails.length) {
  console.error('\nSoft-fail patterns are not allowed in API defensive specs:');
  for (const file of softFails) console.error(`- ${file}`);
}

if (missingDefensive.length || softFails.length) {
  process.exit(1);
}
