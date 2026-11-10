// Offline fault injection for assertion helpers. Does not contact ERP or run server unit tests.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const {
  expectNoServerError,
  expectRowsResponse,
  expectPaginationContract,
  expectStatusIn,
} = require('../lib/helpers/APIAssertions');

let checked = 0;
const rejectInvalid = (action, message) => assert.throws(action,
  error => error.matcherResult?.pass === false, message);
for (const body of [null, undefined, 'error', 123, {}, { error: 'bad response' }, { rows: null }, { rows: {} }]) {
  rejectInvalid(() => expectRowsResponse(body), `Malformed list must fail: ${JSON.stringify(body)}`);
  checked++;
}
for (const body of [[], { rows: [] }, { data: [{ id: 1 }] }]) {
  assert.doesNotThrow(() => expectRowsResponse(body));
  checked++;
}
for (const body of [{ count: 3 }, { count: -1, rows: [] }, { count: 0, rows: [{}] }, { count: 1.5, rows: [] }, { rows: [] }, { count: 3, rows: 'broken' }]) {
  rejectInvalid(() => expectPaginationContract(body), `Malformed pagination must fail: ${JSON.stringify(body)}`);
  checked++;
}
for (const body of [{ count: 0, rows: [] }, { count: 2, rows: [{ id: 1 }] }, { total: 1, data: [{ id: 1 }] }]) {
  assert.doesNotThrow(() => expectPaginationContract(body));
  checked++;
}
for (const status of [500, 501, 502, 503, 504, 505, 599]) {
  rejectInvalid(() => expectNoServerError({ status, data: { message: 'simulated failure' } }));
  checked++;
}
for (const status of [401, 403, 404, 409, 429, 500, 502]) {
  rejectInvalid(() => expectStatusIn({ status, data: { message: 'simulated failure' } }, [200, 201]));
  checked++;
}
assert.doesNotThrow(() => expectStatusIn({ status: 200, data: true }, [200]));
checked++;
async function checkTransportFailures() {
  const { DeficitsAPI } = require('../pages/API/APIDeficits');
  for (const code of ['ECONNREFUSED', 'ETIMEDOUT']) {
    const error = new Error(`Simulated transport failure: ${code}`);
    const failingRequest = { get: async () => { throw error; } };
    await assert.rejects(() => new DeficitsAPI(null).updateAllDeficits(failingRequest), error);
    checked++;
  }
  console.log(`API response assertion fault injection: ${checked} checks passed`);
}
checkTransportFailures().catch(error => { console.error(error); process.exitCode = 1; });
