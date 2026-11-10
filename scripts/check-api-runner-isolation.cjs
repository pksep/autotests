// Exercise main.spec.ts with synthetic API modules; no ERP requests or credentials.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
const directory = fs.mkdtempSync(path.join(root, 'test-results', 'api-runner-isolation-'));
const reportFile = path.join(directory, 'results.json');
const source = `
import { test, expect } from '@playwright/test';
import { testSuites } from '../../testSuiteConfig';
import { loginAfterCooldown } from '../../lib/helpers/APILogin';

testSuites.all_api_tests.tests = [
  { description: 'Setup failure', test: function failingSetupModule() {
    test.beforeAll(() => { throw new Error('Intentional module setup failure'); });
    test('depends on failed setup', () => {});
  } },
  { description: 'Independent setup', test: function healthyModule() {
    let ready = false;
    test.beforeAll(() => { ready = true; });
    test('other module still runs', () => { expect(ready).toBe(true); });
  } },
  { description: 'Rate-limited setup', test: function cooldownSetupModule() {
    let attempts = 0;
    test.beforeAll(async () => {
      test.setTimeout(500);
      const response = await loginAfterCooldown(async () => ({
        status: ++attempts === 1 ? 429 : 201, headers: { 'retry-after': '0' },
      }));
      expect(response.status).toBe(201);
    });
    test('login cooldown fits the beforeAll timeout', () => { expect(attempts).toBe(2); });
  } },
  { description: 'Serial flow', test: function serialModule() {
    test.describe.serial('stateful flow', () => {
      test('serial failure', () => { throw new Error('Intentional serial failure'); });
      test('dependent serial step', () => {});
    });
  } },
  { description: 'After serial flow', test: function finalModule() {
    test('module after serial failure still runs', () => {});
  } },
] as typeof testSuites.all_api_tests.tests;
require('../../main.spec');
`;
// The generated spec is two directories below the repository root.
fs.writeFileSync(path.join(directory, 'isolation.spec.ts'), source);
fs.writeFileSync(path.join(directory, 'playwright.config.cjs'), `module.exports = {
  testDir: '.', testMatch: 'isolation.spec.ts', workers: 1, retries: 0,
  timeout: 10000, reporter: [['json', { outputFile: ${JSON.stringify(reportFile)} }]],
};`);

const child = spawnSync(process.execPath, [
  path.join(root, 'node_modules/@playwright/test/cli.js'), 'test',
  '--config', path.join(directory, 'playwright.config.cjs'),
  '--output', path.join(directory, 'artifacts'),
], {
  cwd: root,
  env: { ...process.env, TEST_SUITE: 'all_api_tests', LOG_LEVEL: 'error', API_NO_AUTH: '', API_INDEPENDENT_TESTS: '' },
  encoding: 'utf8', timeout: 60000,
});
fs.unlinkSync(path.join(directory, 'isolation.spec.ts'));
fs.unlinkSync(path.join(directory, 'playwright.config.cjs'));
assert.ifError(child.error);
assert.equal(child.status, 1, 'Synthetic setup/serial failures must be reported');
assert.ok(fs.existsSync(reportFile), 'Playwright must produce a report');
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
assert.deepEqual(report.errors, [], 'Registration must succeed');
const specs = suite => [...(suite.specs || []), ...(suite.suites || []).flatMap(specs)];
const outcomes = Object.fromEntries(report.suites.flatMap(specs).map(spec => [spec.title, spec.tests[0].results[0].status]));
assert.deepEqual(outcomes, {
  'depends on failed setup': 'failed',
  'other module still runs': 'passed',
  'login cooldown fits the beforeAll timeout': 'passed',
  'serial failure': 'failed',
  'dependent serial step': 'skipped',
  'module after serial failure still runs': 'passed',
});
console.log('API runner isolation passed: module failures stay local, login cooldown fits beforeAll, serial dependencies are preserved.');
