import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '..', 'pages', 'API');
const files = [
  ['APIWorkflows.ts', 'WorkflowsAPI'],
  ['APIVersioning.ts', 'VersioningAPI'],
  ['APITasks.ts', 'TasksAPI'],
  ['APITemplates.ts', 'TemplatesAPI'],
  ['APISettings.ts', 'SettingsAPI'],
  ['APISecurity.ts', 'SecurityAPI'],
  ['APIScheduling.ts', 'SchedulingAPI'],
  ['APISearch.ts', 'SearchAPI'],
  ['APIReports.ts', 'ReportsAPI'],
  ['APIOrders.ts', 'OrdersAPI'],
  ['APIQuality.ts', 'QualityAPI'],
  ['APIMonitoring.ts', 'MonitoringAPI'],
  ['APIMessaging.ts', 'MessagingAPI'],
  ['APIManufacturing.ts', 'ManufacturingAPI'],
  ['APIMaintenance.ts', 'MaintenanceAPI'],
  ['APILogs.ts', 'LogsAPI'],
  ['APIIntegrations.ts', 'IntegrationsAPI'],
  ['APIImportExport.ts', 'ImportExportAPI'],
  ['APIFiles.ts', 'FilesAPI'],
  ['APIDashboard.ts', 'DashboardAPI'],
  ['APIChat.ts', 'ChatAPI'],
  ['APICalendar.ts', 'CalendarAPI'],
  ['APIBackup.ts', 'BackupAPI'],
];

const re = /async\s+(\w+)\s*\(/g;
for (const [file, cls] of files) {
  const p = path.join(dir, file);
  const src = fs.readFileSync(p, 'utf8');
  const methods = [];
  let m;
  while ((m = re.exec(src))) methods.push(m[1]);
  const uniq = [...new Set(methods)];
  const body = uniq
    .map(
      fn => `  async ${fn}(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: '${fn}', args };
    return this.apiProbe(request, '${cls}.${fn}', payload, accessToken);
  }`,
    )
    .join('\n\n');

  const out = `import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class ${cls} extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

${body}
}
`;
  fs.writeFileSync(p, out);
  console.log(file, uniq.length);
}
