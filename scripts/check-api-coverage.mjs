import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const autotestsRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(autotestsRoot, '..');
const defaultServerRoot = path.join(workspaceRoot, 'sep_erp_server', 'sep_erp_server');

const args = parseArgs(process.argv.slice(2));
const serverRoot = path.resolve(args.serverRoot || process.env.API_COVERAGE_SERVER_ROOT || defaultServerRoot);
const outputPath = path.resolve(
  args.output || process.env.API_COVERAGE_OUTPUT || path.join(autotestsRoot, 'docs', 'api-coverage-matrix.md'),
);
const minCoverage = toNumber(args.minCoverage ?? process.env.API_COVERAGE_MIN, 0);
const includeHealth = Boolean(args.includeHealth || process.env.API_COVERAGE_INCLUDE_HEALTH === '1');

if (!fs.existsSync(serverRoot)) {
  fail(`Server root not found: ${serverRoot}`);
}

const controllerFiles = walk(serverRoot)
  .filter((file) => file.endsWith('.controller.ts'))
  .filter((file) => includeHealth || !file.includes(`${path.sep}health${path.sep}`));
const apiSourceFiles = [
  ...walk(path.join(autotestsRoot, 'pages', 'API')),
  ...walk(path.join(autotestsRoot, 'testcases', 'API')),
  path.join(autotestsRoot, 'lib', 'APIPage.ts'),
].filter((file) => file.endsWith('.ts') && fs.existsSync(file));

const routes = extractServerRoutes(controllerFiles);
const coveredCalls = extractCoveredCalls(apiSourceFiles);
const matched = matchCoverage(routes, coveredCalls);
const markdown = buildMarkdown(matched, routes, coveredCalls);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, markdown, 'utf8');

const coveredCount = matched.filter((row) => row.covered).length;
const percent = routes.length ? (coveredCount / routes.length) * 100 : 0;
const uncoveredCount = routes.length - coveredCount;

console.log(`API coverage matrix`);
console.log(`Server root: ${serverRoot}`);
console.log(`Routes: ${routes.length}`);
console.log(`Covered: ${coveredCount}`);
console.log(`Uncovered: ${uncoveredCount}`);
console.log(`Coverage: ${percent.toFixed(1)}%`);
console.log(`Report: ${path.relative(autotestsRoot, outputPath)}`);

if (minCoverage > 0 && percent < minCoverage) {
  fail(`API coverage ${percent.toFixed(1)}% is below required ${minCoverage}%`);
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (!arg.startsWith('--')) continue;
    const [key, inlineValue] = arg.slice(2).split('=');
    parsed[toCamelCase(key)] = inlineValue ?? rawArgs[index + 1] ?? true;
    if (inlineValue === undefined && rawArgs[index + 1] && !rawArgs[index + 1].startsWith('--')) {
      index += 1;
    }
  }
  return parsed;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function walk(root) {
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory() && ['node_modules', 'dist', 'build', 'coverage', '.git'].includes(entry.name)) {
      return [];
    }
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function extractServerRoutes(files) {
  const routes = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const controllerMatch = source.match(/@Controller\s*\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/);
    if (!controllerMatch) continue;

    const controllerPath = controllerMatch[1] ?? '';
    const decoratorRe = /@(Get|Post|Put|Patch|Delete)\s*\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/g;
    let match;

    while ((match = decoratorRe.exec(source))) {
      const method = match[1].toUpperCase();
      const methodPath = match[2] ?? '';
      const afterDecorator = source.slice(decoratorRe.lastIndex, decoratorRe.lastIndex + 500);
      const methodName = afterDecorator.match(/(?:async\s+)?([A-Za-z0-9_]+)\s*\(/)?.[1] ?? '';
      const route = normalizeRoute(joinRoute('api', controllerPath, methodPath));

      routes.push({
        id: `${method} ${route}`,
        method,
        route,
        normalizedRoute: route,
        controller: path.relative(serverRoot, file).replace(/\\/g, '/'),
        handler: methodName,
      });
    }
  }

  return uniqueBy(routes, (route) => route.id).sort(compareById);
}

function extractCoveredCalls(files) {
  const calls = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const bases = extractBaseMethods(source);
    const relFile = path.relative(autotestsRoot, file).replace(/\\/g, '/');

    for (const call of extractRequestExpressions(source)) {
      const route = resolveRouteExpression(call.expression, bases);
      if (!route) continue;

      calls.push({
        id: `${call.method} ${route}`,
        method: call.method,
        route,
        source: relFile,
      });
    }
  }

  return uniqueBy(calls, (call) => `${call.id} ${call.source}`).sort(compareById);
}

function extractBaseMethods(source) {
  const bases = {};
  const baseRe = /private\s+([A-Za-z0-9_]+)\s*=\s*\(\)\s*=>\s*([^;\n]+);/g;
  let match;

  while ((match = baseRe.exec(source))) {
    const route = resolveRouteExpression(match[2], bases);
    if (route) bases[match[1]] = route;
  }

  return bases;
}

function extractRequestExpressions(source) {
  const calls = [];
  const apiRequestRe = /apiRequest\s*\(\s*request\s*,\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]\s*,\s*([\s\S]*?)(?=,\s*\{)/g;
  const requestWithOptionsRe = /request\.(get|post|put|patch|delete)\s*\(\s*([\s\S]*?)(?=,\s*\{)/g;
  const requestWithoutOptionsRe = /request\.(get|post|put|patch|delete)\s*\(\s*([^\n;]+?)\s*\)/g;
  let match;

  while ((match = apiRequestRe.exec(source))) {
    calls.push({ method: match[1].toUpperCase(), expression: match[2] });
  }

  while ((match = requestWithOptionsRe.exec(source))) {
    calls.push({ method: match[1].toUpperCase(), expression: match[2] });
  }

  while ((match = requestWithoutOptionsRe.exec(source))) {
    calls.push({ method: match[1].toUpperCase(), expression: match[2] });
  }

  return calls;
}

function resolveRouteExpression(expression, bases) {
  let expr = expression
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [name, route] of Object.entries(bases)) {
    expr = expr.replaceAll(`this.${name}()`, `'${route}'`);
  }

  expr = expr
    .replaceAll('ENV.API_BASE_URL', "''")
    .replaceAll('ENV.BASE_URL', "''")
    .replaceAll('config.API_BASE_URL', "''");

  const literalRe = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  const parts = [];
  let match;

  while ((match = literalRe.exec(expr))) {
    const literal = match[2].replace(/\\`/g, '`').replace(/\\'/g, "'").replace(/\\"/g, '"');
    const normalized = match[1] === '`' ? literal.replace(/\$\{[^}]+\}/g, ':param') : literal;
    parts.push(normalized);
  }

  const joined = parts.join('');
  if (!joined.includes('api/')) return null;

  return normalizeRoute(joined.slice(joined.indexOf('api/')));
}

function joinRoute(...parts) {
  return parts
    .filter((part) => part !== undefined && part !== null && String(part).length > 0)
    .map(String)
    .join('/');
}

function normalizeRoute(route) {
  let normalized = route
    .replace(/\\/g, '/')
    .replace(/\?.*$/, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');

  normalized = normalized
    .split('/')
    .map((segment) => {
      if (!segment) return segment;
      if (segment.startsWith(':')) return ':param';
      if (/^%5B%5D$/i.test(segment)) return ':param';
      if (/^\d+$/.test(segment)) return ':param';
      if (/^(true|false|null|undefined)$/i.test(segment)) return ':param';
      return segment;
    })
    .join('/');

  return normalized || 'api';
}

function matchCoverage(routes, coveredCalls) {
  return routes.map((route) => {
    const matches = coveredCalls.filter((call) => {
      if (call.method !== route.method) return false;
      return routeMatches(route.normalizedRoute, call.route) || routeMatches(call.route, route.normalizedRoute);
    });

    return {
      ...route,
      covered: matches.length > 0,
      matches,
    };
  });
}

function routeMatches(expected, actual) {
  const expectedParts = expected.split('/');
  const actualParts = actual.split('/');
  if (expectedParts.length !== actualParts.length) return false;

  return expectedParts.every((part, index) => {
    const actualPart = actualParts[index];
    return part === ':param' || actualPart === ':param' || part === actualPart;
  });
}

function buildMarkdown(rows, routes, coveredCalls) {
  const coveredRows = rows.filter((row) => row.covered);
  const uncoveredRows = rows.filter((row) => !row.covered);
  const percent = routes.length ? (coveredRows.length / routes.length) * 100 : 0;
  const byModule = groupBy(rows, (row) => row.route.split('/')[1] ?? 'api');
  const generatedAt = new Date().toISOString();

  const lines = [
    '# API Autotest Coverage Matrix',
    '',
    `Generated: ${generatedAt}`,
    '',
    `Server routes: ${routes.length}`,
    `Covered routes: ${coveredRows.length}`,
    `Uncovered routes: ${uncoveredRows.length}`,
    `Coverage: ${percent.toFixed(1)}%`,
    `Detected autotest calls: ${coveredCalls.length}`,
    '',
    '## Coverage By Module',
    '',
    '| Module | Routes | Covered | Coverage |',
    '|---|---:|---:|---:|',
    ...Object.entries(byModule)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([module, moduleRows]) => {
        const covered = moduleRows.filter((row) => row.covered).length;
        const modulePercent = moduleRows.length ? (covered / moduleRows.length) * 100 : 0;
        return `| ${module} | ${moduleRows.length} | ${covered} | ${modulePercent.toFixed(1)}% |`;
      }),
    '',
    '## Route Matrix',
    '',
    '| Status | Method | Route | Controller | Autotest Source |',
    '|---|---|---|---|---|',
    ...rows.map((row) => {
      const status = row.covered ? 'covered' : 'missing';
      const handler = row.handler ? `${row.controller}#${row.handler}` : row.controller;
      const source = row.matches.map((match) => `${match.route} (${match.source})`).join('<br>') || '-';
      return `| ${status} | ${row.method} | \`${row.route}\` | \`${handler}\` | ${source} |`;
    }),
    '',
  ];

  return `${lines.join('\n')}\n`;
}

function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareById(left, right) {
  return left.id.localeCompare(right.id);
}
