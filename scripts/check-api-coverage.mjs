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

const coverageLevelRank = {
  missing: 0,
  smoke: 1,
  maintenance: 2,
  contract: 3,
  negative: 3.5,
  functional: 4,
};

const maintenanceRouteIds = new Set([
  'GET api/deficits/update-all-deficit',
  'GET api/production-task/update-all-task-relative',
  'DELETE api/assemble/complect/ban/:param',
  'GET api/assemble/complectkit/update_responsible/:param/:param',
  'GET api/sclad/complitass/:param/:param',
  'GET api/sclad/reset_in_sets',
  'GET api/settings/db/new',
  'PUT api/cbed/ava/update',
  'PUT api/detal/ava/update',
  'PUT api/product/ava/update',
  'PUT api/shipments/actual',
]);

if (!fs.existsSync(serverRoot)) {
  fail(`Server root not found: ${serverRoot}`);
}

const controllerFiles = walk(serverRoot)
  .filter((file) => file.endsWith('.controller.ts'))
  .filter((file) => includeHealth || !file.includes(`${path.sep}health${path.sep}`));
const apiPageFiles = walk(path.join(autotestsRoot, 'pages', 'API')).filter((file) => file.endsWith('.ts'));
const apiSpecFiles = walk(path.join(autotestsRoot, 'testcases', 'API')).filter((file) => file.endsWith('.ts'));

const routes = extractServerRoutes(controllerFiles);
const apiPageMethods = extractApiPageMethods(apiPageFiles);
const coveredCalls = extractCoveredCalls(apiSpecFiles, apiPageMethods);
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
    const source = stripSkippedTestBlocks(fs.readFileSync(file, 'utf8'));
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

function extractApiPageMethods(files) {
  const calls = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const bases = extractBaseMethods(source);
    const relFile = path.relative(autotestsRoot, file).replace(/\\/g, '/');
    for (const apiMethod of extractApiMethods(source)) {
      for (const call of extractRequestExpressions(apiMethod.body)) {
        const route = resolveRouteExpression(call.expression, bases);
        if (!route) continue;

        calls.push({
          id: `${call.method} ${route}`,
          method: call.method,
          route,
          source: relFile,
          methodName: apiMethod.name,
        });
      }
    }
  }

  return uniqueBy(calls, (call) => `${call.id} ${call.source}#${call.methodName}`).sort(compareById);
}

function extractCoveredCalls(files, apiPageMethods) {
  const calls = [];
  const apiMethodsBySourceAndName = groupBy(apiPageMethods, (call) => `${call.source}#${call.methodName}`);

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const relFile = path.relative(autotestsRoot, file).replace(/\\/g, '/');
    const apiVariables = extractApiVariables(source, file);

    for (const call of extractRequestExpressions(source)) {
      const route = resolveRouteExpression(call.expression, {});
      if (!route) continue;

      calls.push({
        id: `${call.method} ${route}`,
        method: call.method,
        route,
        source: relFile,
        via: 'direct request',
        coverageLevel: classifyCoverageLevel(source, call.index, `${call.method} ${route}`),
      });
    }

    for (const methodCall of extractApiMethodCalls(source, apiVariables)) {
      const apiCalls = apiMethodsBySourceAndName[`${methodCall.source}#${methodCall.methodName}`] || [];

      for (const apiCall of apiCalls) {
        calls.push({
          id: apiCall.id,
          method: apiCall.method,
          route: apiCall.route,
          source: relFile,
          via: `${apiCall.source}#${apiCall.methodName}`,
          coverageLevel: classifyCoverageLevel(source, methodCall.index, apiCall.id),
        });
      }
    }
  }

  return mergeCoverageCalls(calls).sort(compareById);
}

function stripSkippedTestBlocks(source) {
  return stripCallBlocks(source, ['test.skip', 'test.describe.skip', 'describe.skip']);
}

function stripCallBlocks(source, calleeNames) {
  let stripped = source;

  for (const calleeName of calleeNames) {
    let searchIndex = 0;

    while (searchIndex < stripped.length) {
      const callIndex = stripped.indexOf(calleeName, searchIndex);
      if (callIndex === -1) break;

      const parenIndex = stripped.indexOf('(', callIndex + calleeName.length);
      if (parenIndex === -1) break;

      const closeParenIndex = findMatchingParen(stripped, parenIndex);
      if (closeParenIndex === -1) {
        searchIndex = parenIndex + 1;
        continue;
      }

      stripped = `${stripped.slice(0, callIndex)}${stripped.slice(closeParenIndex + 1)}`;
      searchIndex = callIndex;
    }
  }

  return stripped;
}

function findMatchingParen(source, openParenIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openParenIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function extractApiMethods(source) {
  const methods = [];
  const methodRe = /async\s+([A-Za-z0-9_]+)\s*\([^)]*\)\s*\{/g;
  let match;

  while ((match = methodRe.exec(source))) {
    const bodyStart = methodRe.lastIndex;
    const bodyEnd = findMatchingBrace(source, bodyStart - 1);
    if (bodyEnd === -1) continue;

    methods.push({
      name: match[1],
      body: source.slice(bodyStart, bodyEnd),
    });

    methodRe.lastIndex = bodyEnd + 1;
  }

  return methods;
}

function findMatchingBrace(source, openBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return index;
  }

  return -1;
}

function extractApiVariables(source, specFile) {
  const imports = {};
  const variables = {};
  const importRe = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = importRe.exec(source))) {
    const importPath = match[2];
    if (!importPath.includes('/API/')) continue;

    const resolvedSource = normalizeImportSource(specFile, importPath);
    if (!resolvedSource) continue;

    for (const importedName of match[1].split(',').map((name) => name.trim().split(/\s+as\s+/).pop()).filter(Boolean)) {
      imports[importedName] = resolvedSource;
    }
  }

  const newRe = /\b(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*new\s+([A-Za-z0-9_]+)\s*\(/g;
  while ((match = newRe.exec(source))) {
    const sourceFile = imports[match[2]];
    if (sourceFile) variables[match[1]] = sourceFile;
  }

  return variables;
}

function normalizeImportSource(specFile, importPath) {
  const withExtension = importPath.endsWith('.ts') ? importPath : `${importPath}.ts`;
  const absolutePath = path.resolve(path.dirname(specFile), withExtension);
  if (!fs.existsSync(absolutePath)) return null;
  return path.relative(autotestsRoot, absolutePath).replace(/\\/g, '/');
}

function extractApiMethodCalls(source, apiVariables) {
  const calls = [];
  const methodCallRe = /\b([A-Za-z0-9_]+)\.([A-Za-z0-9_]+)\s*\(/g;
  let match;

  while ((match = methodCallRe.exec(source))) {
    const apiSource = apiVariables[match[1]];
    if (!apiSource) continue;

    calls.push({
      source: apiSource,
      methodName: match[2],
      index: match.index,
    });
  }

  return calls;
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

function classifyCoverageLevel(source, callIndex, routeId) {
  if (maintenanceRouteIds.has(routeId)) return 'maintenance';

  const context = getCoverageContext(source, callIndex);
  if (/expectClientError\s*\(|expectValidationError\s*\(|expectMissingResource\s*\(|expectUnauthorizedOrForbidden\s*\(|expectRouteNotExposed\s*\(|expectErrorResponseContract\s*\(/.test(context)) {
    return 'negative';
  }
  if (
    /expectApiContract\s*\(|expectPaginationContract\s*\(|expectJsonResponseHeaders\s*\(|expectSensitiveFieldsAreNotExposed\s*\(|expectSortedDescendingByKnownDate\s*\(|expectObjectResponse\s*\(|expectArrayResponse\s*\(|expect\([^)]*\.status[^)]*\)\.toBe\s*\(|successCodes[\s\S]{0,160}\.status/.test(context)
  ) {
    if (/\b(create|update|archive|delete|ban|restore|rollback|unpin|attach|detach)\b/i.test(context)) return 'functional';
    return 'contract';
  }
  if (/expectEndpointReached\s*\(/.test(context)) return 'smoke';
  if (/\.toBe\s*\(|\.toEqual\s*\(|\.toContain\s*\(|\.toBeTruthy\s*\(|\.toBeGreaterThan/.test(context)) {
    return 'functional';
  }
  if (/expectNoServerError\s*\(/.test(context)) return 'smoke';

  return 'smoke';
}

function getCoverageContext(source, callIndex) {
  const testBlock = findEnclosingCallBlock(source, callIndex, ['test.describe.serial', 'test.describe', 'test']);
  if (testBlock) return testBlock;

  const helperBlock = findEnclosingFunctionBlock(source, callIndex);
  if (helperBlock) return helperBlock;

  const start = Math.max(0, callIndex - 700);
  const end = Math.min(source.length, callIndex + 700);
  return source.slice(start, end);
}

function findEnclosingCallBlock(source, index, callees) {
  let best = null;

  for (const callee of callees) {
    let searchIndex = 0;
    while (searchIndex < index) {
      const callIndex = source.indexOf(`${callee}(`, searchIndex);
      const spacedCallIndex = source.indexOf(`${callee} (`, searchIndex);
      const found = [callIndex, spacedCallIndex].filter((value) => value >= 0).sort((left, right) => left - right)[0];
      if (found === undefined || found > index) break;

      const parenIndex = source.indexOf('(', found + callee.length);
      const closeParenIndex = parenIndex >= 0 ? findMatchingParen(source, parenIndex) : -1;
      if (closeParenIndex >= index && (!best || found > best.start)) {
        best = { start: found, end: closeParenIndex };
      }

      searchIndex = found + callee.length;
    }
  }

  return best ? source.slice(best.start, best.end + 1) : null;
}

function findEnclosingFunctionBlock(source, index) {
  const before = source.slice(0, index);
  const candidates = [...before.matchAll(/(?:const\s+[A-Za-z0-9_]+\s*=\s*async\s*\([^)]*\)\s*=>\s*|function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*|async\s+function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*)\{/g)];

  for (let candidateIndex = candidates.length - 1; candidateIndex >= 0; candidateIndex -= 1) {
    const candidate = candidates[candidateIndex];
    const openBraceIndex = candidate.index + candidate[0].length - 1;
    const closeBraceIndex = findMatchingBrace(source, openBraceIndex);
    if (closeBraceIndex >= index) return source.slice(candidate.index, closeBraceIndex + 1);
  }

  return null;
}

function mergeCoverageCalls(calls) {
  const byKey = new Map();

  for (const call of calls) {
    const key = `${call.id} ${call.source} ${call.via}`;
    const existing = byKey.get(key);
    if (!existing || coverageLevelRank[call.coverageLevel] > coverageLevelRank[existing.coverageLevel]) {
      byKey.set(key, call);
    }
  }

  return [...byKey.values()];
}

function extractRequestExpressions(source) {
  const calls = [];
  const apiRequestRe = /apiRequest\s*\(\s*request\s*,\s*['"`](GET|POST|PUT|PATCH|DELETE)['"`]\s*,\s*([\s\S]*?)(?=,\s*\{)/g;
  const postWithJsonHeadersRe = /postWithJsonHeaders\s*\(\s*request\s*,\s*([\s\S]*?)(?=,\s*[^,]+,\s*\{)/g;
  const requestWithOptionsRe = /request\.(get|post|put|patch|delete)\s*\(\s*([\s\S]*?)(?=,\s*\{)/g;
  const requestWithoutOptionsRe = /request\.(get|post|put|patch|delete)\s*\(\s*([^\n;]+?)\s*\)/g;
  let match;

  while ((match = apiRequestRe.exec(source))) {
    calls.push({ method: match[1].toUpperCase(), expression: match[2], index: match.index });
  }

  while ((match = postWithJsonHeadersRe.exec(source))) {
    calls.push({ method: 'POST', expression: match[1], index: match.index });
  }

  while ((match = requestWithOptionsRe.exec(source))) {
    calls.push({ method: match[1].toUpperCase(), expression: match[2], index: match.index });
  }

  while ((match = requestWithoutOptionsRe.exec(source))) {
    calls.push({ method: match[1].toUpperCase(), expression: match[2], index: match.index });
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
      coverageLevel: bestCoverageLevel(matches),
    };
  });
}

function bestCoverageLevel(matches) {
  if (matches.length === 0) return 'missing';
  return matches
    .map((match) => match.coverageLevel || 'smoke')
    .sort((left, right) => coverageLevelRank[right] - coverageLevelRank[left])[0];
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
  const byCoverageLevel = groupBy(rows, (row) => row.coverageLevel);
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
    '## Coverage By Level',
    '',
    '| Coverage Level | Routes |',
    '|---|---:|',
    ...Object.keys(coverageLevelRank)
      .filter((level) => byCoverageLevel[level]?.length)
      .sort((left, right) => coverageLevelRank[right] - coverageLevelRank[left])
      .map((level) => `| ${level} | ${byCoverageLevel[level].length} |`),
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
    '| Status | Coverage Level | Method | Route | Controller | Autotest Source |',
    '|---|---|---|---|---|---|',
    ...rows.map((row) => {
      const status = row.covered ? 'covered' : 'missing';
      const handler = row.handler ? `${row.controller}#${row.handler}` : row.controller;
      const source =
        row.matches.map((match) => `${match.route} [${match.coverageLevel || 'smoke'}] (${match.source}${match.via ? ` via ${match.via}` : ''})`).join('<br>') ||
        '-';
      return `| ${status} | ${row.coverageLevel} | ${row.method} | \`${row.route}\` | \`${handler}\` | ${source} |`;
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
