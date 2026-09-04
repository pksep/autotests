import { createReadStream, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const botApiBaseUrl = (process.env.BOT_API_BASE_URL || '').replace(/\/$/, '');
const botToken = process.env.BOT_TOKEN || '';
const chatId = process.env.AUTOTESTS_REPORT_CHAT_ID || '';
const reportFile = process.argv[2];
const runDir = process.argv[3] || '';
const deliveryAttempts = Number(process.env.AUTOTESTS_REPORT_DELIVERY_ATTEMPTS || 12);
const deliveryRetryDelayMs = Number(process.env.AUTOTESTS_REPORT_RETRY_DELAY_MS || 3000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const callBot = async (method, payload) => {
  if (!botApiBaseUrl || !botToken) {
    throw new Error('BOT_API_BASE_URL and BOT_TOKEN are required');
  }

  const response = await fetch(`${botApiBaseUrl}/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || `${method} failed`);
  }
  return data.result;
};

const readStatus = () => {
  if (!runDir) return {};

  try {
    const statusPath = path.join(runDir, 'status.env');
    return Object.fromEntries(
      readFileSync(statusPath, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const separatorIndex = line.indexOf('=');
          return separatorIndex === -1
            ? [line, '']
            : [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
        }),
    );
  } catch {
    return {};
  }
};

const stripAnsi = (value) => String(value || '').replace(/\u001b\[[0-9;]*m/g, '');

const truncate = (value, maxLength = 180) => {
  const text = stripAnsi(value);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const readTestSummary = () => {
  if (!runDir) return null;

  try {
    const reportPath = path.join(runDir, 'test-results', 'results.json');
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      timedOut: 0,
      interrupted: 0,
      didNotRun: 0,
      failedTests: [],
    };

    const addTest = (test, titlePath = []) => {
      const results = Array.isArray(test.results) ? test.results : [];
      const status = results.at(-1)?.status || test.outcome || test.status || 'unknown';
      const title = [...titlePath, test.title].filter(Boolean).join(' > ');

      stats.total += 1;

      switch (status) {
        case 'passed':
        case 'expected':
          stats.passed += 1;
          break;
        case 'skipped':
          stats.skipped += 1;
          break;
        case 'timedOut':
          stats.timedOut += 1;
          stats.failed += 1;
          stats.failedTests.push(title);
          break;
        case 'interrupted':
          stats.interrupted += 1;
          stats.failed += 1;
          stats.failedTests.push(title);
          break;
        case 'failed':
        case 'unexpected':
          stats.failed += 1;
          stats.failedTests.push(title);
          break;
        default:
          stats.didNotRun += 1;
          break;
      }
    };

    const walkSuite = (suite, titlePath = []) => {
      const nextTitlePath = suite.title ? [...titlePath, suite.title] : titlePath;

      for (const spec of suite.specs || []) {
        const specPath = spec.title ? [...nextTitlePath, spec.title] : nextTitlePath;
        for (const test of spec.tests || []) addTest(test, specPath);
      }

      for (const child of suite.suites || []) walkSuite(child, nextTitlePath);
    };

    for (const suite of report.suites || []) walkSuite(suite);

    return stats;
  } catch {
    return null;
  }
};

const sendMessage = async (text) => {
  const message = await callBot('sendMessage', {
    chat_id: chatId,
    text,
  });

  if (!message?.message_id) {
    throw new Error('sendMessage returned ok without message_id');
  }

  return message;
};

const sendDocument = async (filePath, caption) => {
  const fileName = path.basename(filePath);
  const fileSize = statSync(filePath).size;
  const mimeType = 'application/gzip';

  const upload = await callBot('getUploadUrl', {
    file_name: fileName,
    mime_type: mimeType,
  });

  if (!upload?.file_id || !upload.upload_url) {
    throw new Error('getUploadUrl returned incomplete response');
  }

  const uploadResponse = await fetch(upload.upload_url, {
    method: 'PUT',
    headers: {
      'content-type': mimeType,
      'content-length': String(fileSize),
    },
    body: createReadStream(filePath),
    duplex: 'half',
  });

  if (!uploadResponse.ok) {
    throw new Error(`file upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  const message = await callBot('sendDocument', {
    chat_id: chatId,
    file_id: upload.file_id,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    type: 'FILE',
    caption,
  });

  if (!message?.message_id) {
    throw new Error('sendDocument returned ok without message_id');
  }

  return message;
};

const deliverWithRetry = async (deliver) => {
  let lastError;

  for (let attempt = 1; attempt <= deliveryAttempts; attempt += 1) {
    try {
      const message = await deliver();
      console.log(`Autotests report delivered, message_id=${message.message_id}`);
      return;
    } catch (err) {
      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      console.log(`Autotests report delivery attempt ${attempt}/${deliveryAttempts} failed: ${message}`);

      if (attempt < deliveryAttempts) {
        await sleep(deliveryRetryDelayMs);
      }
    }
  }

  throw lastError || new Error('Autotests report delivery failed');
};

if (!chatId) {
  console.log('AUTOTESTS_REPORT_CHAT_ID is not set; skipping report delivery');
  process.exit(0);
}

const status = readStatus();
const summary = readTestSummary();
const exitCode = Number(status.exit_code ?? process.env.AUTOTESTS_EXIT_CODE ?? 0);
const stateText = exitCode === 0 ? 'успешно' : `с ошибками, exit code ${exitCode}`;
const caption = [
  `Автотесты dev после обновления базы завершились ${stateText}.`,
  status.test_suite ? `Suite: ${status.test_suite}` : null,
  summary ? `Всего: ${summary.total} · успешно: ${summary.passed} · упало: ${summary.failed} · skipped: ${summary.skipped} · не запущено: ${summary.didNotRun}` : null,
  summary?.failedTests?.length ? `Упавшие тесты:\n${summary.failedTests.slice(0, 10).map((title) => `- ${truncate(title)}`).join('\n')}` : null,
  summary?.failedTests?.length > 10 ? `Еще упало: ${summary.failedTests.length - 10}` : null,
  reportFile ? 'В архиве есть HTML-отчет Playwright и Allure HTML-отчет.' : null,
  status.started_at ? `Старт: ${status.started_at}` : null,
  status.finished_at ? `Финиш: ${status.finished_at}` : null,
].filter(Boolean).join('\n');

if (reportFile) {
  await deliverWithRetry(() => sendDocument(reportFile, caption));
} else {
  await deliverWithRetry(() => sendMessage(caption));
}
