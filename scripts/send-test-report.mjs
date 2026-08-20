import { createReadStream, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const botApiBaseUrl = (process.env.BOT_API_BASE_URL || '').replace(/\/$/, '');
const botToken = process.env.BOT_TOKEN || '';
const chatId = process.env.AUTOTESTS_REPORT_CHAT_ID || '';
const reportFile = process.argv[2];
const runDir = process.argv[3] || '';

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

const sendMessage = async (text) => {
  await callBot('sendMessage', {
    chat_id: chatId,
    text,
  });
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
    headers: { 'content-type': mimeType },
    body: createReadStream(filePath),
    duplex: 'half',
  });

  if (!uploadResponse.ok) {
    throw new Error(`file upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  await callBot('sendDocument', {
    chat_id: chatId,
    file_id: upload.file_id,
    file_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    type: 'FILE',
    caption,
  });
};

if (!chatId) {
  console.log('AUTOTESTS_REPORT_CHAT_ID is not set; skipping report delivery');
  process.exit(0);
}

const status = readStatus();
const exitCode = Number(status.exit_code ?? process.env.AUTOTESTS_EXIT_CODE ?? 0);
const stateText = exitCode === 0 ? 'успешно' : `с ошибками, exit code ${exitCode}`;
const caption = [
  `Автотесты dev после обновления базы завершились ${stateText}.`,
  status.test_suite ? `Suite: ${status.test_suite}` : null,
  status.started_at ? `Старт: ${status.started_at}` : null,
  status.finished_at ? `Финиш: ${status.finished_at}` : null,
].filter(Boolean).join('\n');

if (reportFile) {
  await sendDocument(reportFile, caption);
} else {
  await sendMessage(caption);
}
