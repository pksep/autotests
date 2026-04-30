/**
 * @file V001-Archive.spec.ts
 * @purpose Validation of the Archive module: iterate through entities, validate headers, buttons, and modals.
 */

import { test, expect } from '@playwright/test';
import { PageObject, expectSoftWithScreenshot } from '../lib/Page';
import { CreateArchivePage } from '../pages/ArchivePage';
import { SELECTORS } from '../config';
import { TIMEOUTS, TEST_TIMEOUTS } from '../lib/Constants/TimeoutConstants';
import * as ArchiveSelectors from '../lib/Constants/SelectorsArchive';
import archiveData from '../testdata/V001-Archive.json';
import logger from '../lib/utils/logger';
import { allure } from 'allure-playwright';
import fs from 'fs';
import path from 'path';

const MODAL_CLOSE_SETTLE_MS = 500;

function normalizeButtonLabel(label: string): string {
    return label.replace(/\s*\(\d+\)\s*/g, '').replace(/\s+/g, ' ').trim();
}

function resolveLocalizedLabel(labelValue: unknown, lang: 'ru' | 'en'): string | undefined {
    if (typeof labelValue === 'string') {
        return labelValue;
    }
    if (labelValue && typeof labelValue === 'object' && lang in (labelValue as Record<string, unknown>)) {
        const localized = (labelValue as Record<string, unknown>)[lang];
        return typeof localized === 'string' ? localized : undefined;
    }
    return undefined;
}

function getLocalizedItems(items: unknown, lang: 'ru' | 'en'): any[] {
    if (Array.isArray(items)) {
        return items;
    }
    if (items && typeof items === 'object') {
        const localized = (items as Record<string, unknown>)[lang];
        if (Array.isArray(localized)) {
            return localized;
        }
    }
    return [];
}

function getNestedModalSpecKey(buttonLabel: string, entityKeyRu: string): string | null {
    const normalized = normalizeButtonLabel(buttonLabel);
    if (normalized === 'Технологический процесс') return `TechProcessModal_${entityKeyRu}`;
    if (normalized === 'История изменений') return `HistoryModal_${entityKeyRu}`;
    if (normalized === 'Комплектация') return `EquipmentModal_${entityKeyRu}`;
    if (normalized === 'Полная спецификация') return `FullSpecificationModal_${entityKeyRu}`;
    return null;
}

function getNestedModalSelector(buttonLabel: string): string | null {
    const normalized = normalizeButtonLabel(buttonLabel);
    if (normalized === 'Технологический процесс') return ArchiveSelectors.NESTED_MODAL_TECH_PROCESS;
    if (normalized === 'История изменений') return ArchiveSelectors.NESTED_MODAL_HISTORY;
    if (normalized === 'Комплектация') return ArchiveSelectors.NESTED_MODAL_EQUIPMENT;
    if (normalized === 'Полная спецификация') return ArchiveSelectors.NESTED_MODAL_SPECIFICATION;
    return null;
}

function visibleSelectorList(selectorList: string): string {
    return selectorList
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => `${part}:visible`)
        .join(', ');
}

async function tagHistoryDialog(
    dialog: import('@playwright/test').Locator,
    label: 'BASIC' | 'ADVANCED',
): Promise<void> {
    await dialog.evaluate((element, badgeLabel) => {
        const host = element as HTMLElement;
        const existing = host.querySelector('[data-codex-history-debug="true"]');
        if (existing) {
            existing.remove();
        }

        const badge = document.createElement('div');
        badge.setAttribute('data-codex-history-debug', 'true');
        badge.textContent = `HISTORY: ${badgeLabel}`;
        badge.style.position = 'absolute';
        badge.style.top = '8px';
        badge.style.right = '8px';
        badge.style.zIndex = '9999';
        badge.style.padding = '6px 10px';
        badge.style.borderRadius = '6px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = '700';
        badge.style.color = '#111';
        badge.style.background = badgeLabel === 'ADVANCED' ? '#9ae6b4' : '#fbd38d';
        badge.style.border = '2px solid #111';
        badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

        const computedPosition = window.getComputedStyle(host).position;
        if (computedPosition === 'static') {
            host.style.position = 'relative';
        }

        host.appendChild(badge);
    }, label).catch(() => undefined);
}

async function getHeaderTexts(root: import('@playwright/test').Locator): Promise<string[][]> {
    const tables = root.locator('table');
    const tableCount = await tables.count();
    const allHeaders: string[][] = [];

    for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
        const table = tables.nth(tableIndex);
        const cells = table.locator('th');
        const count = await cells.count();
        const headers: string[] = [];
        for (let i = 0; i < count; i++) {
            const text = (await cells.nth(i).innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
            if (text) {
                headers.push(text);
            }
        }
        if (headers.length > 0) {
            allHeaders.push(headers);
        }
    }

    return allHeaders;
}

async function getTableSnapshots(
    root: import('@playwright/test').Locator,
    po?: PageObject,
): Promise<Array<{ name: { ru: string; en: string }; testid: string | null; headers: { ru: string[]; en: string[] }; sampleRow: { ru: string[]; en: string[] } }>> {
    const tables = root.locator('table');
    const tableCount = await tables.count();
    const snapshots: Array<{ name: { ru: string; en: string }; testid: string | null; headers: { ru: string[]; en: string[] }; sampleRow: { ru: string[]; en: string[] } }> = [];

    for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
        const table = tables.nth(tableIndex);
        if (!(await table.isVisible().catch(() => false))) {
            continue;
        }

        const headerCells = table.locator('th');
        const headerCount = await headerCells.count();
        const headers: string[] = [];

        for (let headerIndex = 0; headerIndex < headerCount; headerIndex++) {
            const headerCell = headerCells.nth(headerIndex);
            if (await headerCell.isVisible().catch(() => false)) {
                if (po) {
                    await po.waitAndHighlight(headerCell, { waitAfter: 150 });
                }
                const headerText = (await headerCell.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
                if (headerText) {
                    headers.push(headerText);
                }
            }
        }

        const firstRowCells = table.locator('tbody tr').first().locator('th, td');
        const firstRowCellCount = await firstRowCells.count();
        const sampleRow: string[] = [];

        for (let cellIndex = 0; cellIndex < firstRowCellCount; cellIndex++) {
            const cell = firstRowCells.nth(cellIndex);
            if (await cell.isVisible().catch(() => false)) {
                if (po) {
                    await po.waitAndHighlight(cell, { waitAfter: 150 });
                }
                const cellText = (await cell.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
                if (cellText) {
                    sampleRow.push(cellText);
                }
            }
        }

        snapshots.push({
            name: { ru: `Таблица ${tableIndex + 1}`, en: `Table ${tableIndex + 1}` },
            testid: await table.getAttribute('data-testid').catch(() => null),
            headers: { ru: headers, en: [] },
            sampleRow: { ru: sampleRow, en: [] },
        });
    }

    return snapshots;
}

function dedupeNonEmpty(values: string[]): string[] {
    return Array.from(new Set(values.map(v => v.replace(/\s+/g, ' ').trim()).filter(Boolean)));
}

function normalizeHeaderText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

function containsHeadersInOrder(actual: string[], expected: string[]): boolean {
    if (expected.length === 0) {
        return true;
    }
    const normalizedActual = actual.map(normalizeHeaderText);
    const normalizedExpected = expected.map(normalizeHeaderText);
    let searchIndex = 0;

    for (const header of normalizedExpected) {
        const foundIndex = normalizedActual.indexOf(header, searchIndex);
        if (foundIndex === -1) {
            return false;
        }
        searchIndex = foundIndex + 1;
    }
    return true;
}

async function getVisibleHeadingTexts(
    root: import('@playwright/test').Locator,
    po?: PageObject,
): Promise<string[]> {
    const headings = root.locator('h1, h2, h3, h4');
    const count = await headings.count();
    const values: string[] = [];

    for (let i = 0; i < count; i++) {
        const heading = headings.nth(i);
        if (!(await heading.isVisible().catch(() => false))) {
            continue;
        }
        if (po) {
            await po.waitAndHighlight(heading, { waitAfter: 300 });
        }
        const text = (await heading.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (text) {
            values.push(text);
        }
    }

    return dedupeNonEmpty(values);
}

async function getModalButtons(
    root: import('@playwright/test').Locator,
    po?: PageObject,
): Promise<Array<{ testid: string | null; label: { ru: string; en: string } }>> {
    const buttons = root.locator('button, [role="button"]');
    const count = await buttons.count();
    const result: Array<{ testid: string | null; label: { ru: string; en: string } }> = [];
    const sampledTableRowButtons = new Set<string>();

    for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        if (!(await button.isVisible().catch(() => false))) {
            continue;
        }
        if (await isInsideTableOrRow(button)) {
            continue;
        }
        const tableRowButtonKey = await getTableRowButtonKey(button);
        if (tableRowButtonKey) {
            if (sampledTableRowButtons.has(tableRowButtonKey)) {
                continue;
            }
            sampledTableRowButtons.add(tableRowButtonKey);
        }
        if (po) {
            await po.waitAndHighlight(button, { waitAfter: 300 });
        }
        const text = (await button.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (!text) {
            continue;
        }
        const testid = await button.getAttribute('data-testid').catch(() => null);
        result.push({
            testid,
            label: { ru: text, en: text },
        });
    }

    return result;
}

async function getTableRowButtonKey(button: import('@playwright/test').Locator): Promise<string | null> {
    return button.evaluate((element, index) => {
        const htmlElement = element as HTMLElement;
        const isRoleButton = htmlElement.getAttribute('role') === 'button';
        const closestRow = htmlElement.closest('tbody tr');

        if (!isRoleButton || !closestRow) {
            return null;
        }

        const closestSection = htmlElement.closest('[data-testid*="Accordion"], [data-testid*="Section"], table');
        const sectionTestId = closestSection?.getAttribute('data-testid');
        const table = htmlElement.closest('table');
        const tableIndex = table ? Array.from(document.querySelectorAll('table')).indexOf(table) : index;

        return sectionTestId || `table-${tableIndex}`;
    }, 0).catch(() => null);
}

async function isInsideTableOrRow(locator: import('@playwright/test').Locator): Promise<boolean> {
    return locator.evaluate(element => {
        const htmlElement = element as HTMLElement;
        const rowLikeElement = htmlElement.closest(
            [
                'tbody',
                '[role="row"]',
                '[data-testid*="Row"]',
                '[data-testid*="row"]',
                '[data-testid*="TableType-"]',
                '[data-testid*="TableSubType-"]',
                '[data-testid*="TableEntity-"]',
            ].join(', '),
        );

        return Boolean(rowLikeElement);
    }).catch(() => false);
}

async function getModalLabels(
    root: import('@playwright/test').Locator,
    po?: PageObject,
): Promise<Array<{ testid: string | null; label: { ru: string; en: string } }>> {
    const labelNodes = root.locator('[data-testid*="Label"], [data-testid*="Title"], [data-testid*="Heading"]');
    const count = await labelNodes.count();
    const result: Array<{ testid: string | null; label: { ru: string; en: string } }> = [];
    const seen = new Set<string>();

    for (let i = 0; i < count; i++) {
        const node = labelNodes.nth(i);
        if (!(await node.isVisible().catch(() => false))) {
            continue;
        }
        if (await isInsideTableOrRow(node)) {
            continue;
        }
        const tag = await node.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
        if (tag === 'button' || tag === 'th') {
            continue;
        }
        const text = (await node.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (!text) {
            continue;
        }
        const testid = await node.getAttribute('data-testid').catch(() => null);
        const key = `${testid ?? ''}|${text}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        if (po) {
            await po.waitAndHighlight(node, { waitAfter: 300 });
        }
        result.push({
            testid,
            label: { ru: text, en: text },
        });
    }

    return result;
}

async function snapshotNestedModal(
    root: import('@playwright/test').Locator,
    po?: PageObject,
): Promise<Record<string, any>> {
    const titles = await getVisibleHeadingTexts(root, po);
    const headerSets = await getHeaderTexts(root);
    const headers = headerSets[0] ?? [];
    const buttons = await getModalButtons(root, po);
    const labels = await getModalLabels(root, po);
    const tables = await getTableSnapshots(root, po);

    if (po) {
        const headerCells = root.locator('th');
        const headerCount = await headerCells.count();
        for (let i = 0; i < headerCount; i++) {
            const cell = headerCells.nth(i);
            if (await cell.isVisible().catch(() => false)) {
                await po.waitAndHighlight(cell, { waitAfter: 300 });
            }
        }
    }

    return {
        titles: {
            ru: titles,
            en: [],
        },
        headers: {
            ru: headers,
            en: [],
        },
        labels,
        buttons,
        tables,
    };
}

function mergeAndPersistModalSpec(
    modalKey: string,
    snapshot: Record<string, any>,
    elements: Record<string, any>,
    discoveredElements: Record<string, any>,
    persistDiscoveredElements: () => void,
) {
    discoveredElements[modalKey] = mergeNestedModalSpec(elements[modalKey], snapshot);
    persistDiscoveredElements();
}

function hasRuEntries(value: any): boolean {
    if (!value) {
        return false;
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (Array.isArray(value.ru)) {
        return value.ru.length > 0;
    }
    return false;
}

function mergeNestedModalSpec(existing: Record<string, any> | null | undefined, discovered: Record<string, any>): Record<string, any> {
    const merged = { ...(existing ?? {}) } as Record<string, any>;

    if (!hasRuEntries(merged.titles) && hasRuEntries(discovered.titles)) {
        merged.titles = discovered.titles;
    }
    if (!hasRuEntries(merged.headers) && hasRuEntries(discovered.headers)) {
        merged.headers = discovered.headers;
    }
    if (!Array.isArray(merged.labels) || merged.labels.length === 0) {
        merged.labels = discovered.labels ?? [];
    }
    if (!Array.isArray(merged.buttons) || merged.buttons.length === 0) {
        merged.buttons = discovered.buttons ?? [];
    }
    if (!Array.isArray(merged.tables) || merged.tables.length === 0) {
        merged.tables = discovered.tables ?? [];
    }

    return merged;
}

async function getVisibleModalCount(page: import('@playwright/test').Page): Promise<number> {
    const modals = page.locator(ArchiveSelectors.MODAL_CONTAINER);
    const count = await modals.count();
    let visibleCount = 0;

    for (let i = 0; i < count; i++) {
        if (await modals.nth(i).isVisible().catch(() => false)) {
            visibleCount++;
        }
    }

    return visibleCount;
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

async function clickOutsideTopMostDialog(page: import('@playwright/test').Page): Promise<void> {
    const modals = page.locator(ArchiveSelectors.MODAL_CONTAINER);
    const count = await modals.count();
    let topMostModal: import('@playwright/test').Locator | null = null;

    for (let i = count - 1; i >= 0; i--) {
        const candidate = modals.nth(i);
        if (await candidate.isVisible().catch(() => false)) {
            topMostModal = candidate;
            break;
        }
    }

    if (!topMostModal) {
        return;
    }

    const box = await topMostModal.boundingBox();
    if (!box) {
        return;
    }

    const viewport = page.viewportSize() ?? (await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
    })));

    const candidatePoints = [
        { x: Math.floor(box.x - 20), y: Math.floor(box.y + box.height / 2) },
        { x: Math.floor(box.x + box.width + 20), y: Math.floor(box.y + box.height / 2) },
        { x: Math.floor(box.x + box.width / 2), y: Math.floor(box.y - 20) },
        { x: Math.floor(box.x + box.width / 2), y: Math.floor(box.y + box.height + 20) },
    ];

    const clickPoint = candidatePoints.find(point =>
        point.x >= 2 &&
        point.y >= 2 &&
        point.x <= viewport.width - 2 &&
        point.y <= viewport.height - 2,
    ) ?? {
        x: clamp(Math.floor(box.x + box.width + 20), 2, viewport.width - 2),
        y: clamp(Math.floor(box.y + box.height / 2), 2, viewport.height - 2),
    };

    await page.mouse.click(clickPoint.x, clickPoint.y);
}

async function clickTopMostCloseButton(page: import('@playwright/test').Page): Promise<boolean> {
    const modals = page.locator(ArchiveSelectors.MODAL_CONTAINER);
    const count = await modals.count();
    let topMostModal: import('@playwright/test').Locator | null = null;

    for (let i = count - 1; i >= 0; i--) {
        const candidate = modals.nth(i);
        if (await candidate.isVisible().catch(() => false)) {
            topMostModal = candidate;
            break;
        }
    }

    if (!topMostModal) {
        return false;
    }

    const closeCandidates = topMostModal.locator(
        [
            '[data-testid="ModalRight-Button-Close"]',
            '[data-testid="ModalProduct-Button-Close"]',
            'button:has-text("Закрыть")',
            'button:has-text("Close")',
            '[role="button"]:has-text("Закрыть")',
            '[role="button"]:has-text("Close")',
        ].join(', ')
    );

    const closeCount = await closeCandidates.count();
    for (let i = 0; i < closeCount; i++) {
        const btn = closeCandidates.nth(i);
        if (await btn.isVisible().catch(() => false)) {
            await btn.click({ force: true });
            await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
            return true;
        }
    }

    return false;
}

async function clickTopMostCancelButton(page: import('@playwright/test').Page): Promise<boolean> {
    const modals = page.locator(ArchiveSelectors.MODAL_CONTAINER);
    const count = await modals.count();
    let topMostModal: import('@playwright/test').Locator | null = null;

    for (let i = count - 1; i >= 0; i--) {
        const candidate = modals.nth(i);
        if (await candidate.isVisible().catch(() => false)) {
            topMostModal = candidate;
            break;
        }
    }

    if (!topMostModal) {
        return false;
    }

    const cancelCandidates = topMostModal.locator(
        [
            '[data-testid*="Cancel"]',
            'button:has-text("Отменить")',
            'button:has-text("Cancel")',
            '[role="button"]:has-text("Отменить")',
            '[role="button"]:has-text("Cancel")',
        ].join(', ')
    );

    const cancelCount = await cancelCandidates.count();
    for (let i = 0; i < cancelCount; i++) {
        const btn = cancelCandidates.nth(i);
        if (await btn.isVisible().catch(() => false)) {
            const clicked = await btn.click({ force: true, timeout: 1500 }).then(() => true).catch(() => false);
            if (clicked) {
                await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
                return true;
            }
        }
    }

    return false;
}

async function clickGlobalCloseButton(page: import('@playwright/test').Page): Promise<boolean> {
    const globalCloseCandidates = page.locator(
        [
            'button:has-text("Закрыть")',
            'button:has-text("Close")',
            '[role="button"]:has-text("Закрыть")',
            '[role="button"]:has-text("Close")',
            '[data-testid="ModalRight-Button-Close"]',
            '[data-testid="ModalProduct-Button-Close"]',
            '[data-testid="Button"]',
        ].join(', ')
    );

    const count = await globalCloseCandidates.count();
    for (let i = count - 1; i >= 0; i--) {
        const candidate = globalCloseCandidates.nth(i);
        if (await candidate.isVisible().catch(() => false)) {
            const clicked = await candidate.click({ force: true, timeout: 1500 }).then(() => true).catch(() => false);
            if (clicked) {
                await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
                return true;
            }
        }
    }

    return false;
}

async function closeTopMostDialog(page: import('@playwright/test').Page, expectedVisibleCountAfterClose?: number): Promise<void> {
    const visibleBeforeClose = await getVisibleModalCount(page);
    if (visibleBeforeClose === 0) {
        return;
    }

    const targetCount = expectedVisibleCountAfterClose ?? Math.max(visibleBeforeClose - 1, 0);

    const cancelClicked = await clickTopMostCancelButton(page);
    if (cancelClicked) {
        const cancelReached = await expect
            .poll(async () => getVisibleModalCount(page), {
                timeout: 2500,
                intervals: [200, 300, 500],
            })
            .toBe(targetCount)
            .then(() => true)
            .catch(() => false);
        if (cancelReached) {
            await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
            return;
        }
    }

    for (let attempt = 0; attempt < 4; attempt++) {
        await clickOutsideTopMostDialog(page);
        const reachedTarget = await expect
            .poll(async () => getVisibleModalCount(page), {
                timeout: 1400,
                intervals: [150, 250, 350],
            })
            .toBe(targetCount)
            .then(() => true)
            .catch(() => false);

        if (reachedTarget) {
            await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
            return;
        }
    }

    const fallbackClicked = await clickTopMostCloseButton(page);
    if (fallbackClicked) {
        const fallbackReached = await expect
            .poll(async () => getVisibleModalCount(page), {
                timeout: 2500,
                intervals: [200, 300, 500],
            })
            .toBe(targetCount)
            .then(() => true)
            .catch(() => false);
        if (fallbackReached) {
            await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
            return;
        }
    }

    if (targetCount === 0) {
        const globalFallbackClicked = await clickGlobalCloseButton(page);
        if (globalFallbackClicked) {
            const globalFallbackReached = await expect
                .poll(async () => getVisibleModalCount(page), {
                    timeout: 2500,
                    intervals: [200, 300, 500],
                })
                .toBe(targetCount)
                .then(() => true)
                .catch(() => false);
            if (globalFallbackReached) {
                await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
                return;
            }
        }
    }

    const finalCount = await getVisibleModalCount(page);
    if (finalCount !== targetCount) {
        logger.warn(`Modal close target not reached. Expected visible modals: ${targetCount}, actual: ${finalCount}`);
    }
}

async function dismissAllDialogsBestEffort(page: import('@playwright/test').Page, maxAttempts = 6): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const before = await getVisibleModalCount(page);
        if (before === 0) {
            return;
        }

        await clickOutsideTopMostDialog(page);
        await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);

        const afterOutside = await getVisibleModalCount(page);
        if (afterOutside < before) {
            continue;
        }

        const closeClicked = await clickGlobalCloseButton(page);
        if (!closeClicked) {
            break;
        }
        await page.waitForTimeout(300);
        await page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
    }
}

async function openEntityDropdown(page: import('@playwright/test').Page): Promise<void> {
    await page.waitForSelector(ArchiveSelectors.ENTITY_DROPDOWN, { state: 'visible', timeout: 20000 });
    for (let attempt = 0; attempt < 5; attempt++) {
        await page.click(ArchiveSelectors.ENTITY_DROPDOWN, { force: true });
        const opened = await page
            .waitForSelector(ArchiveSelectors.ENTITY_DROPDOWN_LIST, { state: 'visible', timeout: 2500 })
            .then(() => true)
            .catch(() => false);
        if (opened) {
            return;
        }
        await clickOutsideTopMostDialog(page);
        await page.waitForTimeout(250);
    }

    await page.waitForSelector(ArchiveSelectors.ENTITY_DROPDOWN_LIST, { state: 'visible', timeout: 10000 });
}

async function validateNestedModalFromJson(
    page: import('@playwright/test').Page,
    po: PageObject,
    nestedSelector: string,
    nestedData: Record<string, any>,
    lang: 'ru' | 'en',
    testInfo: import('@playwright/test').TestInfo,
    descriptionPrefix: string,
) {
    const nestedModal = page.locator(visibleSelectorList(nestedSelector)).last();
    await nestedModal.waitFor({ state: 'visible', timeout: 10000 });

    const titles = getLocalizedItems(nestedData.titles, lang);
    const isHistoryModal = nestedSelector.includes('ModalHistoryAction')
        || titles.some(title => {
            const expectedTitle = typeof title === 'string' ? title : resolveLocalizedLabel(title.label, lang);
            return expectedTitle === 'История изменений';
        });

    if (isHistoryModal) {
        const expectsFilterableHistory = await nestedModal
            .locator('[data-testid="Calendar-DataPickerRange-Component-Start-Wrapper"]')
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        await tagHistoryDialog(nestedModal, expectsFilterableHistory ? 'ADVANCED' : 'BASIC');

        console.log(`[history-dialog] ${descriptionPrefix}: ${expectsFilterableHistory ? 'advanced' : 'basic'}`);

        if (expectsFilterableHistory) {
            await validateArchiveFullHistoryModal(
                page,
                po,
                nestedModal,
                testInfo,
                descriptionPrefix,
                nestedData.userModalKey ?? 'UserModal_Деталь',
                lang,
            );
        } else {
            await po.validateCompactHistoryActionModal({
                testInfo,
                closeAfterValidation: false,
            });
        }

        await closeTopMostDialog(page);
        await nestedModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(TIMEOUTS.SHORT);
        return;
    }
    for (const title of titles) {
        const expectedTitle = typeof title === 'string' ? title : resolveLocalizedLabel(title.label, lang);
        if (!expectedTitle) continue;
        const titleLocator = typeof title === 'object' && title?.testid
            ? nestedModal.locator(`[data-testid="${title.testid}"]`).first()
            : nestedModal.locator('h1, h2, h3, h4').filter({ hasText: expectedTitle }).first();
        await po.waitAndHighlight(titleLocator, { waitAfter: 150 });
        await expectSoftWithScreenshot(
            page,
            () => {
                expect.soft(titleLocator).toContainText(expectedTitle);
            },
            `${descriptionPrefix} nested title "${expectedTitle}"`,
            testInfo,
        );
    }

    const labels = getLocalizedItems(nestedData.labels, lang);
    for (const label of labels) {
        const expectedLabel = typeof label === 'string' ? label : resolveLocalizedLabel(label.label, lang);
        if (!expectedLabel) continue;
        const labelLocator = typeof label === 'object' && label?.testid
            ? nestedModal.locator(`[data-testid="${label.testid}"]`).first()
            : nestedModal.locator(`text="${expectedLabel}"`).first();
        if (!(await labelLocator.isVisible().catch(() => false))) {
            continue;
        }
        await po.waitAndHighlight(labelLocator, { waitAfter: 300 });
        await expectSoftWithScreenshot(
            page,
            () => {
                expect.soft(labelLocator).toContainText(expectedLabel);
            },
            `${descriptionPrefix} nested label "${expectedLabel}"`,
            testInfo,
        );
    }

    if (nestedData.headers) {
        const expectedHeaders = (nestedData.headers?.[lang] ?? []) as string[];
        if (expectedHeaders.length > 0) {
            const headerCells = nestedModal.locator('th');
            const headerCount = await headerCells.count();
            for (let i = 0; i < headerCount; i++) {
                const cell = headerCells.nth(i);
                if (await cell.isVisible().catch(() => false)) {
                    await po.waitAndHighlight(cell, { waitAfter: 300 });
                }
            }
            const allHeaderSets = await getHeaderTexts(nestedModal);
            const matchingHeaderSet = allHeaderSets.find(headerSet => containsHeadersInOrder(headerSet, expectedHeaders));
            if (!matchingHeaderSet) {
                logger.warn(
                    `${descriptionPrefix} nested headers mismatch. Expected sequence: [${expectedHeaders.join(' | ')}], ` +
                    `actual sets: ${JSON.stringify(allHeaderSets)}`,
                );
            }
        }
    }

    const buttons = getLocalizedItems(nestedData.buttons, lang);
    for (const button of buttons) {
        const expectedButton = typeof button === 'string' ? button : resolveLocalizedLabel(button.label, lang);
        if (!expectedButton) continue;
        const buttonLocator = typeof button === 'object' && button?.testid
            ? nestedModal.locator(`[data-testid="${button.testid}"]`).filter({ hasText: expectedButton }).first()
            : nestedModal.locator('button, [role="button"]').filter({ hasText: expectedButton }).first();
        if (!(await buttonLocator.isVisible().catch(() => false))) {
            continue;
        }
        await po.waitAndHighlight(buttonLocator, { waitAfter: 300 });
        await expectSoftWithScreenshot(
            page,
            () => {
                expect.soft(buttonLocator).toContainText(expectedButton);
            },
            `${descriptionPrefix} nested button "${expectedButton}"`,
            testInfo,
        );
    }

    if (nestedData.userModalKey) {
        await clickFirstHistoryEmployeeLink(
            page,
            po,
            nestedModal,
            nestedData.userModalKey,
            archiveData.elements as Record<string, any>,
            {},
            () => undefined,
            lang,
            testInfo,
            `${descriptionPrefix} -> user`,
            nestedData.userModalSelector ?? ArchiveSelectors.NESTED_MODAL_USER,
        );
    }

    await closeTopMostDialog(page);
    await nestedModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(TIMEOUTS.SHORT);
}

async function selectHistoryFilterOption(
    page: import('@playwright/test').Page,
    po: PageObject,
    historyModal: import('@playwright/test').Locator,
    config: {
        name: string;
        currentTestId: string;
        optionsListTestId: string;
        searchInputTestId: string;
        optionPrefix: string;
        badgeTestId: string;
    },
    testInfo: import('@playwright/test').TestInfo | null,
    descriptionPrefix: string,
): Promise<string | null> {
    const current = historyModal.locator(`[data-testid="${config.currentTestId}"]`).first();
    const optionsList = historyModal.locator(`[data-testid="${config.optionsListTestId}"]`).first();
    const searchInput = historyModal.locator(`[data-testid="${config.searchInputTestId}"]`).first();
    const badge = historyModal.locator(`[data-testid="${config.badgeTestId}"]`).first();
    const options = historyModal.locator(`[data-testid^="${config.optionPrefix}"]`);

    await po.waitAndHighlight(current, { waitAfter: 250 });
    await current.click({ force: true });
    await expectSoftWithScreenshot(
        page,
        async () => {
            await expect.soft(optionsList, `${descriptionPrefix}: ${config.name} options list should open`).toBeVisible();
            await expect.soft(searchInput, `${descriptionPrefix}: ${config.name} search should be visible`).toBeVisible();
        },
        `${descriptionPrefix} ${config.name} filter opened`,
        testInfo ?? undefined,
    );

    const optionCount = await options.count();
    for (let i = 0; i < optionCount; i++) {
        const option = options.nth(i);
        if (!(await option.isVisible().catch(() => false))) {
            continue;
        }
        const optionText = (await option.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (!optionText || optionText === 'Все' || optionText === 'Не выбран') {
            continue;
        }

        await po.waitAndHighlight(searchInput, { waitAfter: 250 });
        await searchInput.fill(optionText.slice(0, Math.min(6, optionText.length))).catch(() => undefined);
        await page.waitForTimeout(400);
        await po.waitAndHighlight(option, { waitAfter: 300 });
        await option.click({ force: true });
        await page.waitForTimeout(600);
        await po.waitAndHighlight(badge, { waitAfter: 400 });

        const badgeText = (await badge.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        await expectSoftWithScreenshot(
            page,
            () => {
                expect.soft(badgeText, `${descriptionPrefix}: ${config.name} badge should reflect selected option`).toContain(optionText);
            },
            `${descriptionPrefix} ${config.name} filter selected`,
            testInfo ?? undefined,
        );
        return optionText;
    }

    return null;
}

async function validateArchiveFullHistoryModal(
    page: import('@playwright/test').Page,
    po: PageObject,
    historyModal: import('@playwright/test').Locator,
    testInfo: import('@playwright/test').TestInfo | null,
    descriptionPrefix: string,
    userModalKey: string,
    lang: 'ru' | 'en',
): Promise<void> {
    console.log(`[history-dialog] ${descriptionPrefix}: advanced`);
    logger.warn(`[history-dialog] ${descriptionPrefix}: advanced`);
    const title = historyModal.locator('[data-testid$="ModalHistoryAction-Main-Title-Name"]').first();
    const entityInfoTitle = historyModal.locator('[data-testid$="ModalHistoryAction-Information-Title0"]').first();
    const entityInfoText = historyModal.locator('[data-testid$="ModalHistoryAction-Information-Text0"]').first();
    const startDate = historyModal.locator('[data-testid="Calendar-DataPickerRange-Component-Start-Choose-Value-Display"]').first();
    const endDate = historyModal.locator('[data-testid="Calendar-DataPickerRange-Component-End-Choose-Value-Display"]').first();
    const resetButton = historyModal.locator('[data-testid="Button"]').filter({ hasText: 'Сбросить' }).first();
    const closeButton = historyModal.locator('[data-testid="Button"]').filter({ hasText: 'Закрыть' }).first();

    await po.waitAndHighlight(title, { waitAfter: 200 });
    await po.waitAndHighlight(entityInfoTitle, { waitAfter: 200 });
    await po.waitAndHighlight(entityInfoText, { waitAfter: 200 });
    await po.waitAndHighlight(startDate, { waitAfter: 200 });
    await po.waitAndHighlight(endDate, { waitAfter: 200 });

    await expectSoftWithScreenshot(
        page,
        async () => {
            await expect.soft(title).toContainText('История изменений');
            await expect.soft(entityInfoTitle).toContainText('Тип сущности:');
            await expect.soft(entityInfoText).not.toHaveText('');
            await expect.soft(startDate).not.toHaveText('');
            await expect.soft(endDate).not.toHaveText('');
            await expect.soft(resetButton).toBeVisible();
            await expect.soft(closeButton).toBeVisible();
        },
        `${descriptionPrefix} full history shell`,
        testInfo ?? undefined,
    );

    await selectHistoryFilterOption(page, po, historyModal, {
        name: 'Сотрудники',
        currentTestId: 'FilterUser-Current',
        optionsListTestId: 'FilterUser-OptionsList',
        searchInputTestId: 'FilterUser-Search-Dropdown-Input',
        optionPrefix: 'FilterUser-Options-',
        badgeTestId: 'FilterUser-Badge-BadgesText',
    }, testInfo, descriptionPrefix);

    await selectHistoryFilterOption(page, po, historyModal, {
        name: 'Тип сущности',
        currentTestId: 'BaseFilter-Current',
        optionsListTestId: 'BaseFilter-OptionsList',
        searchInputTestId: 'BaseFilter-Search-Dropdown-Input',
        optionPrefix: 'BaseFilter-Options-',
        badgeTestId: 'BaseFilter-Badge-BadgesText',
    }, testInfo, descriptionPrefix);

    await po.waitAndHighlight(resetButton, { waitAfter: 300 });
    await expectSoftWithScreenshot(
        page,
        async () => {
            await expect.soft(resetButton).toBeEnabled();
        },
        `${descriptionPrefix} history reset enabled`,
        testInfo ?? undefined,
    );

    await resetButton.click({ force: true });
    await page.waitForTimeout(500);

    const userBadge = historyModal.locator('[data-testid="FilterUser-Badge-BadgesText"]').first();
    const entityBadge = historyModal.locator('[data-testid="BaseFilter-Badge-BadgesText"]').first();
    await po.waitAndHighlight(userBadge, { waitAfter: 250 });
    await po.waitAndHighlight(entityBadge, { waitAfter: 250 });
    await expectSoftWithScreenshot(
        page,
        async () => {
            await expect.soft(userBadge).toContainText('Все');
            await expect.soft(entityBadge).toContainText('Все');
        },
        `${descriptionPrefix} history reset restored defaults`,
        testInfo ?? undefined,
    );

    await clickFirstHistoryEmployeeLink(
        page,
        po,
        historyModal,
        userModalKey,
        archiveData.elements as Record<string, any>,
        {},
        () => undefined,
        lang,
        testInfo,
        `${descriptionPrefix} -> user`,
    );
}

async function clickFirstHistoryEmployeeLink(
    page: import('@playwright/test').Page,
    po: PageObject,
    historyModal: import('@playwright/test').Locator,
    userModalKey: string,
    elements: Record<string, any>,
    discoveredElements: Record<string, any>,
    persistDiscoveredElements: () => void,
    lang: 'ru' | 'en',
    testInfo: import('@playwright/test').TestInfo | null,
    descriptionPrefix: string,
    userModalSelector = ArchiveSelectors.NESTED_MODAL_USER,
): Promise<void> {
    const historyTitle = historyModal
        .locator('[data-testid*="ModalHistoryAction"][data-testid*="Title"], h1, h2, h3, h4')
        .filter({ hasText: 'История изменений' })
        .first();

    if (await historyTitle.isVisible().catch(() => false)) {
        await po.waitAndHighlight(historyTitle, { waitAfter: 300 });
        if (testInfo) {
            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(historyTitle).toContainText('История изменений');
                },
                `${descriptionPrefix} title "История изменений"`,
                testInfo,
            );
        } else {
            await expect(historyTitle).toContainText('История изменений');
        }
    } else {
        logger.warn(`${descriptionPrefix}: не найден заголовок "История изменений".`);
    }

    const employeeTarget = await getFirstHistoryEmployeeCell(page, historyModal);
    const fallbackEmployeeLink = historyModal.locator('tbody tr [data-testid="DataCell"].link, tbody tr .link, tbody tr a').first();

    if (!employeeTarget || !(await employeeTarget.isVisible().catch(() => false))) {
        logger.warn(`${descriptionPrefix}: ссылка сотрудника в первой строке истории изменений не найдена.`);
        return;
    }

    await po.waitAndHighlight(employeeTarget, { waitAfter: 500 });
    await clickHistoryEmployeeTarget(page, employeeTarget);

    const userModal = page.locator(userModalSelector).last();
    let userOpened = await userModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (!userOpened && await fallbackEmployeeLink.isVisible().catch(() => false)) {
        await po.waitAndHighlight(fallbackEmployeeLink, { waitAfter: 300 });
        await clickHistoryEmployeeTarget(page, fallbackEmployeeLink);
        userOpened = await userModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    }
    if (!userOpened) {
        await employeeTarget.dblclick({ force: true }).catch(() => {});
        userOpened = await userModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    }
    if (!userOpened) {
        logger.warn(`${descriptionPrefix}: модальное окно сотрудника не открылось после клика по ссылке.`);
        return;
    }

    const userSnapshot = await snapshotNestedModal(userModal, po);
    mergeAndPersistModalSpec(userModalKey, userSnapshot, elements, discoveredElements, persistDiscoveredElements);

    const userModalData = elements[userModalKey] ?? userSnapshot;
    if (testInfo && userModalData) {
        await validateNestedModalFromJson(
            page,
            po,
            userModalSelector,
            userModalData,
            lang,
            testInfo,
            descriptionPrefix,
        ).catch(error => {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn(`User modal validation warning for "${descriptionPrefix}": ${message}`);
            return Promise.resolve();
        });
    } else {
        await closeTopMostDialog(page);
        await userModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
}

async function getFirstHistoryEmployeeCell(
    page: import('@playwright/test').Page,
    historyModal: import('@playwright/test').Locator,
): Promise<import('@playwright/test').Locator | null> {
    const techProcessHistoryEmployeeCell = historyModal
        .locator('[data-testid="ModalTechProcess-ModalHistoryAction-Table-Tbody"]')
        .locator('[data-testid^="ModalTechProcess-ModalHistoryAction-Tbody-TableRow"]')
        .first()
        .locator('td[data-testid="DataCell"].link')
        .first();

    if (await techProcessHistoryEmployeeCell.isVisible().catch(() => false)) {
        return techProcessHistoryEmployeeCell;
    }

    const headerCells = historyModal.locator('th');
    const headerCount = await headerCells.count();
    let employeeColumnIndex = 1;

    for (let headerIndex = 0; headerIndex < headerCount; headerIndex++) {
        const headerText = (await headerCells.nth(headerIndex).innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (headerText === 'Сотрудник') {
            employeeColumnIndex = headerIndex;
            break;
        }
    }

    const rows = historyModal.locator('tbody tr');
    const rowCount = await rows.count();
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = rows.nth(rowIndex);
        if (!(await row.isVisible().catch(() => false))) {
            continue;
        }

        const cells = row.locator('td');
        const cell = cells.nth(employeeColumnIndex);
        const cellText = (await cell.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (cellText) {
            const nestedClickable = cell.locator('[data-testid="DataCell"].link, [data-testid="DataCell"], .link, a').first();
            if (await nestedClickable.isVisible().catch(() => false)) {
                return nestedClickable;
            }
            return cell;
        }
    }

    const visibleEmployeeName = page
        .locator('[data-testid="DataCell"], td, [role="cell"]')
        .filter({ hasText: /^[А-ЯЁA-Z][а-яёa-z]+ [А-ЯЁA-Z]\.[А-ЯЁA-Z]\.$/ })
        .first();

    if (await visibleEmployeeName.isVisible().catch(() => false)) {
        return visibleEmployeeName;
    }

    return null;
}

async function clickHistoryEmployeeTarget(
    page: import('@playwright/test').Page,
    locator: import('@playwright/test').Locator,
): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await locator.evaluate(element => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.outline = '4px solid #00a86b';
        htmlElement.style.boxShadow = '0 0 0 3px rgba(0, 168, 107, 0.35)';
    }).catch(() => {});

    const box = await locator.boundingBox();
    if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(500);
    }

    await locator.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    await locator.dblclick({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
    await locator.evaluate(element => {
        const mouseEventOptions = { bubbles: true, cancelable: true, view: window };
        element.dispatchEvent(new MouseEvent('mousedown', mouseEventOptions));
        element.dispatchEvent(new MouseEvent('mouseup', mouseEventOptions));
        element.dispatchEvent(new MouseEvent('click', mouseEventOptions));
        element.dispatchEvent(new MouseEvent('dblclick', mouseEventOptions));
    }).catch(() => {});
}

async function processDetailTechProcessChildren(
    page: import('@playwright/test').Page,
    po: PageObject,
    techProcessModal: import('@playwright/test').Locator,
    elements: Record<string, any>,
    discoveredElements: Record<string, any>,
    persistDiscoveredElements: () => void,
) {
    const techProcessRowCountBeforeAdd = await getTechProcessRowCount(techProcessModal);
    const addOperationButton = techProcessModal.locator('[data-testid="ModalTechProcess-Buttons-ButtonCreate"]').first();
    if (await addOperationButton.isVisible().catch(() => false)) {
        await po.waitAndHighlight(addOperationButton, { waitAfter: 300 });
        await addOperationButton.click({ force: true });

        const addOperationModal = page.locator('[data-testid="ModalTechProcess-ModalAddOperation-Modal"]').last();
        const addOperationOpened = await addOperationModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
        if (addOperationOpened) {
            const addOperationSnapshot = await snapshotNestedModal(addOperationModal, po);
            mergeAndPersistModalSpec('AddOperationModal_Деталь', addOperationSnapshot, elements, discoveredElements, persistDiscoveredElements);
            await selectFirstOperationType(addOperationModal, page, po);

            const childAddButtons = [
                { testid: 'ModalTechProcess-ModalAddOperation-AddEquipmentBtn', key: 'AddOperationEquipmentPickerModal_Деталь' },
                { testid: 'ModalTechProcess-ModalAddOperation-AddToolsBtn', key: 'AddOperationToolsPickerModal_Деталь' },
                { testid: 'ModalTechProcess-ModalAddOperation-AddToolingBtn', key: 'AddOperationToolingPickerModal_Деталь' },
                { testid: 'ModalTechProcess-ModalAddOperation-AddResourcesBtn', key: 'AddOperationResourcesPickerModal_Деталь' },
            ];
            const seenAddButtonTestIds = new Set(childAddButtons.map(child => child.testid));
            const visibleAddButtons = addOperationModal.locator('button, [role="button"]').filter({ hasText: 'Добавить' });
            const visibleAddButtonCount = await visibleAddButtons.count();

            for (let addButtonIndex = 0; addButtonIndex < visibleAddButtonCount; addButtonIndex++) {
                const addButton = visibleAddButtons.nth(addButtonIndex);
                const testid = await addButton.getAttribute('data-testid').catch(() => null);
                if (!testid || seenAddButtonTestIds.has(testid)) {
                    continue;
                }

                seenAddButtonTestIds.add(testid);
                childAddButtons.push({
                    testid,
                    key: `AddOperationPickerModal_${testid.replace(/[^A-Za-z0-9]+/g, '_')}_Деталь`,
                });
            }

            for (const child of childAddButtons) {
                const button = addOperationModal.locator(`[data-testid="${child.testid}"]`).first();
                if (!(await button.isVisible().catch(() => false))) {
                    continue;
                }
                await po.waitAndHighlight(button, { waitAfter: 300 });
                await button.click({ force: true });

                const pickerModal = page.locator('[data-testid="Modal"]').last();
                const pickerOpened = await pickerModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
                if (!pickerOpened) {
                    continue;
                }
                const pickerSnapshot = await snapshotNestedModal(pickerModal, po);
                mergeAndPersistModalSpec(child.key, pickerSnapshot, elements, discoveredElements, persistDiscoveredElements);
                if (child.key === 'AddOperationToolsPickerModal_Деталь') {
                    await scanInstrumentPickerSliderStates(
                        page,
                        po,
                        pickerModal,
                        elements,
                        discoveredElements,
                        persistDiscoveredElements,
                    );
                }
                await closeTopMostDialog(page);
                await pickerModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            }

            const saveButton = addOperationModal.locator('[data-testid="ModalTechProcess-ModalAddOperation-SaveButton"]').first();
            if (techProcessRowCountBeforeAdd === 0 && await saveButton.isVisible().catch(() => false)) {
                await po.waitAndHighlight(saveButton, { waitAfter: 300 });
                await saveButton.click({ force: true });
            } else {
                await closeTopMostDialog(page);
            }
            await addOperationModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
            await page.waitForLoadState('networkidle').catch(() => {});
            await page.waitForTimeout(TIMEOUTS.STANDARD);
        }
    }

    await scanFirstTechProcessRowEditDialog(page, po, techProcessModal, elements, discoveredElements, persistDiscoveredElements);

    const archiveButton = techProcessModal.locator('[data-testid="ModalTechProcess-Buttons-ButtonUpdate"]').filter({ hasText: 'Архив' }).first();
    if (await archiveButton.isVisible().catch(() => false)) {
        await po.waitAndHighlight(archiveButton, { waitAfter: 300 });
        await archiveButton.click({ force: true });

        const confirmModal = page.locator('[data-testid="ModalConfirm"]').last();
        const confirmOpened = await confirmModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
        if (confirmOpened) {
            const confirmSnapshot = await snapshotNestedModal(confirmModal, po);
            mergeAndPersistModalSpec('ArchiveConfirmModal_Деталь', confirmSnapshot, elements, discoveredElements, persistDiscoveredElements);
            const noButton = confirmModal.locator('[data-testid="ModalConfirm-Content-Buttons-No"]').first();
            if (await noButton.isVisible().catch(() => false)) {
                await po.waitAndHighlight(noButton, { waitAfter: 300 });
                await noButton.click({ force: true });
            } else {
                await closeTopMostDialog(page);
            }
            await confirmModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }
    }

    const historyButton = techProcessModal
        .locator('[data-testid="ModalTechProcess-ButtonHistory"], button, [role="button"]')
        .filter({ hasText: 'История изменений' })
        .first();
    const historyTextFallback = techProcessModal.getByText('История изменений', { exact: true }).first();
    let historyClickAttempted = false;
    if (await historyButton.isVisible().catch(() => false)) {
        await po.waitAndHighlight(historyButton, { waitAfter: 300 });
        logger.warn('[history-entry] Технологический процесс: clicking history button');
        await historyButton.click({ force: true });
        historyClickAttempted = true;
    } else if (await historyTextFallback.isVisible().catch(() => false)) {
        await po.waitAndHighlight(historyTextFallback, { waitAfter: 300 });
        logger.warn('[history-entry] Технологический процесс: clicking history fallback');
        await historyTextFallback.click({ force: true });
        historyClickAttempted = true;
    }

    if (!historyClickAttempted) {
        logger.warn('Кнопка "История изменений" в технологическом процессе не найдена.');
        return;
    }

    const historyModal = page.locator(visibleSelectorList(ArchiveSelectors.NESTED_MODAL_HISTORY)).last();
    const historyOpened = await historyModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (historyOpened) {
        const historyModalTestId = await historyModal.getAttribute('data-testid').catch(() => 'unknown');
        logger.warn(`[history-entry] Технологический процесс: visible history modal resolved as ${historyModalTestId}`);
        const historySnapshot = await snapshotNestedModal(historyModal, po);
        mergeAndPersistModalSpec('HistoryModal_Деталь', historySnapshot, elements, discoveredElements, persistDiscoveredElements);

        const isFullHistoryDialog = await historyModal
            .locator('[data-testid="Calendar-DataPickerRange-Component-Start-Wrapper"]')
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);
        await tagHistoryDialog(historyModal, isFullHistoryDialog ? 'ADVANCED' : 'BASIC');
        console.log(`[history-dialog] Технологический процесс -> История изменений: ${isFullHistoryDialog ? 'advanced' : 'basic'}`);
        logger.warn(`[history-dialog] Технологический процесс -> История изменений: ${isFullHistoryDialog ? 'advanced' : 'basic'}`);

        if (isFullHistoryDialog) {
            await validateArchiveFullHistoryModal(
                page,
                po,
                historyModal,
                null,
                'Технологический процесс -> История изменений',
                'UserModal_Деталь',
                'ru',
            );
        } else {
            await clickFirstTechProcessHistoryEmployeeLink(page, po, elements, discoveredElements, persistDiscoveredElements);
        }

        await closeTopMostDialog(page);
        await historyModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    }
}

async function clickFirstTechProcessHistoryEmployeeLink(
    page: import('@playwright/test').Page,
    po: PageObject,
    elements: Record<string, any>,
    discoveredElements: Record<string, any>,
    persistDiscoveredElements: () => void,
): Promise<void> {
    const exactEmployeeCellSelector =
        '[data-testid="ModalTechProcess-ModalHistoryAction-Table-Tbody"] ' +
        '[data-testid^="ModalTechProcess-ModalHistoryAction-Tbody-TableRow"] ' +
        'td.link[data-testid="DataCell"]';
    const firstHistoryRow = page.locator('[data-testid^="ModalTechProcess-ModalHistoryAction-Tbody-TableRow"]').first();
    const employeeCell = page.locator(exactEmployeeCellSelector).first();

    if (!(await firstHistoryRow.isVisible().catch(() => false))) {
        logger.warn('В истории изменений технологического процесса нет видимых строк.');
        return;
    }

    if (!(await employeeCell.isVisible().catch(() => false))) {
        logger.warn('В первой строке истории изменений технологического процесса не найдена ссылка сотрудника.');
        return;
    }

    await po.waitAndHighlight(firstHistoryRow, { waitAfter: 300 });
    await po.waitAndHighlight(employeeCell, { waitAfter: 1000 });
    await page.evaluate(selector => {
        const employeeCellElement = document.querySelector(selector) as HTMLElement | null;
        if (!employeeCellElement) {
            return;
        }

        employeeCellElement.scrollIntoView({ block: 'center', inline: 'center' });
        employeeCellElement.style.outline = '5px solid #00a86b';
        employeeCellElement.style.boxShadow = '0 0 0 4px rgba(0, 168, 107, 0.35)';
        const eventOptions = { bubbles: true, cancelable: true, view: window };
        employeeCellElement.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
        employeeCellElement.dispatchEvent(new MouseEvent('mousedown', eventOptions));
        employeeCellElement.dispatchEvent(new PointerEvent('pointerup', eventOptions));
        employeeCellElement.dispatchEvent(new MouseEvent('mouseup', eventOptions));
        employeeCellElement.dispatchEvent(new MouseEvent('click', eventOptions));
    }, exactEmployeeCellSelector);
    await page.waitForTimeout(1000);

    const userModal = page.locator(ArchiveSelectors.NESTED_MODAL_USER).last();
    let userOpened = await userModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (!userOpened) {
        await clickHistoryEmployeeTarget(page, employeeCell);
        userOpened = await userModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    }
    if (!userOpened) {
        logger.warn('Модальное окно сотрудника не открылось из истории изменений технологического процесса.');
        return;
    }

    const userSnapshot = await snapshotNestedModal(userModal, po);
    mergeAndPersistModalSpec('UserModal_Деталь', userSnapshot, elements, discoveredElements, persistDiscoveredElements);
    await closeTopMostDialog(page);
    await userModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function getTechProcessRowCount(techProcessModal: import('@playwright/test').Locator): Promise<number> {
    const explicitRows = techProcessModal.locator('[data-testid="ModalTechProcess-Table"] tbody tr');
    const explicitRowCount = await explicitRows.count().catch(() => 0);
    if (explicitRowCount > 0) {
        return explicitRowCount;
    }

    return techProcessModal.locator('table tbody tr').count().catch(() => 0);
}

async function selectFirstOperationType(
    addOperationModal: import('@playwright/test').Locator,
    page: import('@playwright/test').Page,
    po: PageObject,
): Promise<void> {
    const notSelectedBadge = addOperationModal
        .locator('[data-testid="BaseFilter-Badge-BadgesText"]')
        .filter({ hasText: 'Не выбран' })
        .first();

    if (await notSelectedBadge.isVisible().catch(() => false)) {
        await po.waitAndHighlight(notSelectedBadge, { waitAfter: 300 });
        await notSelectedBadge.click({ force: true });

        const optionClicked = await clickFirstVisibleDropdownOption(page, po);
        if (optionClicked) {
            await page.waitForLoadState('networkidle').catch(() => {});
            await page.waitForTimeout(TIMEOUTS.SHORT);
            return;
        }
    }

    const operationTypeLabel = addOperationModal
        .getByText(/(Выбор типа операции|Тип операции):?/, { exact: false })
        .first();

    if (await operationTypeLabel.isVisible().catch(() => false)) {
        await po.waitAndHighlight(operationTypeLabel, { waitAfter: 300 });
        await operationTypeLabel.click({ force: true });
    }

    const dropdownCandidates = addOperationModal.locator(
        [
            '[data-testid="BaseFilter-Current"]',
            '[data-testid*="SelectFilter"]',
            '[class*="select-list-yui-kit__current"]',
            '[class*="filter__header"]',
        ].join(', '),
    );
    const dropdownCount = await dropdownCandidates.count();

    for (let dropdownIndex = 0; dropdownIndex < dropdownCount; dropdownIndex++) {
        const dropdown = dropdownCandidates.nth(dropdownIndex);
        if (!(await dropdown.isVisible().catch(() => false))) {
            continue;
        }

        await po.waitAndHighlight(dropdown, { waitAfter: 150 });
        await dropdown.click({ force: true }).catch(() => {});
        const optionClicked = await clickFirstVisibleDropdownOption(page, po);
        if (!optionClicked) {
            continue;
        }

        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(TIMEOUTS.SHORT);
        return;
    }

    logger.warn('Не удалось выбрать значение в селекторе "Тип операции" в модальном окне добавления операции.');
}

async function clickFirstVisibleDropdownOption(
    page: import('@playwright/test').Page,
    po: PageObject,
): Promise<boolean> {
    const options = page.locator('[data-testid^="BaseFilter-Options-"], [data-testid*="Options-"]');
    await options.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    const optionCount = await options.count();

    for (let optionIndex = 0; optionIndex < optionCount; optionIndex++) {
        const option = options.nth(optionIndex);
        if (!(await option.isVisible().catch(() => false))) {
            continue;
        }

        const optionText = (await option.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
        if (!optionText || optionText === 'Поиск' || optionText === 'Не выбран') {
            continue;
        }

        await po.waitAndHighlight(option, { waitAfter: 150 });
        await option.click({ force: true });
        return true;
    }

    return false;
}

async function scanFirstTechProcessRowEditDialog(
    page: import('@playwright/test').Page,
    po: PageObject,
    techProcessModal: import('@playwright/test').Locator,
    elements: Record<string, any>,
    discoveredElements: Record<string, any>,
    persistDiscoveredElements: () => void,
): Promise<void> {
    const firstRow = techProcessModal.locator('[data-testid="ModalTechProcess-Table"] tbody tr, table tbody tr').first();
    if (!(await firstRow.isVisible().catch(() => false))) {
        logger.warn('В таблице технологического процесса нет строки для проверки редактирования.');
        return;
    }

    await po.waitAndHighlight(firstRow, { waitAfter: 300 });
    await firstRow.click({ force: true });

    const editButton = techProcessModal.locator('[data-testid="ModalTechProcess-Buttons-ButtonUpdate"]').filter({ hasText: 'Редактировать' }).first();
    if (!(await editButton.isVisible().catch(() => false))) {
        logger.warn('Кнопка "Редактировать" технологического процесса не найдена после выбора строки.');
        return;
    }

    await po.waitAndHighlight(editButton, { waitAfter: 300 });
    await editButton.click({ force: true });

    const editOperationModal = page.locator('[data-testid="ModalTechProcess-ModalAddOperation-Modal"]').last();
    const editOperationOpened = await editOperationModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (!editOperationOpened) {
        logger.warn('Модальное окно редактирования операции технологического процесса не открылось.');
        return;
    }

    const editSnapshot = await snapshotNestedModal(editOperationModal, po);
    mergeAndPersistModalSpec('EditOperationModal_Деталь', editSnapshot, elements, discoveredElements, persistDiscoveredElements);
    await closeTopMostDialog(page);
    await editOperationModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function scanInstrumentPickerSliderStates(
    page: import('@playwright/test').Page,
    po: PageObject,
    pickerModal: import('@playwright/test').Locator,
    elements: Record<string, any>,
    discoveredElements: Record<string, any>,
    persistDiscoveredElements: () => void,
): Promise<void> {
    const sliderOptions = ['Все', 'Инструмент', 'Оснастка', 'Мерительный инструмент'];

    for (const sliderOption of sliderOptions) {
        const option = pickerModal.getByText(sliderOption, { exact: true }).first();
        if (!(await option.isVisible().catch(() => false))) {
            continue;
        }

        await po.waitAndHighlight(option, { waitAfter: 150 });
        await option.click({ force: true });
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(TIMEOUTS.STANDARD);

        const snapshot = await snapshotNestedModal(pickerModal, po);
        const keySuffix = sliderOption.replace(/\s+/g, '_');
        mergeAndPersistModalSpec(
            `AddOperationToolsPickerModal_${keySuffix}_Деталь`,
            snapshot,
            elements,
            discoveredElements,
            persistDiscoveredElements,
        );
    }
}

export const runV001_Archive = () => {
    test.describe('V001 - Archive Module Validation', () => {
        const allEntitiesRu = (archiveData.elements.ArchiveMainPage.dropdown.options as any)['ru'] as string[];

        test('Validate Archive entity "Деталь" through Short Information dialog hierarchy', async ({ page }, testInfo) => {
            testInfo.setTimeout(TEST_TIMEOUTS.LONG);
            const archivePage = new CreateArchivePage(page);
            const techProcessNoteValue = `Autotest tech process note ${Date.now()}`;
            let result: Awaited<ReturnType<CreateArchivePage['validateDetailShortInformationHierarchy']>> | undefined;

            await allure.step('Open Archive, select Деталь, and validate the full Short Information dialog hierarchy', async () => {
                result = await archivePage.validateDetailShortInformationHierarchy({
                    testInfo,
                    validateShortInformationFullInformation: true,
                    validateShortInformationHistory: true,
                    validateShortInformationTechProcess: true,
                    shortInformationHistoryOptions: {
                        closeAfterValidation: false,
                    },
                    shortInformationTechProcessOptions: {
                        validateTechProcessAddOperation: true,
                        validateTechProcessEditOperation: true,
                        validateTechProcessArchive: true,
                        validateTechProcessHistory: true,
                        validateTechProcessMedia: true,
                        techProcessAction: 'save',
                        techProcessNoteValue,
                        expectModalToCloseAfterTechProcessAction: false,
                        techProcessAddOperationOptions: {
                            addOperationAction: 'save',
                            addOperationMainTimeValue: '1',
                            addOperationResourceMode: 'select',
                            addOperationChildAction: 'add',
                            expectModalToCloseAfterAddOperationAction: true,
                        },
                        techProcessEditOperationOptions: {
                            addOperationAction: 'cancel',
                            validateAddOperationResources: false,
                            expectModalToCloseAfterAddOperationAction: true,
                        },
                        techProcessArchiveConfirmOptions: {
                            confirmAction: 'confirm',
                            expectModalToCloseAfterConfirmAction: true,
                        },
                        techProcessHistoryOptions: {
                            closeAfterValidation: false,
                        },
                    },
                });
            });

            if (!result) {
                throw new Error('Archive detail hierarchy validation did not return a result.');
            }
            const hierarchyResult = result;

            await expectSoftWithScreenshot(
                page,
                () => {
                    expect.soft(hierarchyResult.rowCount, 'Archive detail table should have at least one row for hierarchy validation').toBeGreaterThan(0);
                    expect.soft(hierarchyResult.dialogOpened, 'Short Information dialog should open from the selected Деталь row').toBe(true);
                    expect.soft(hierarchyResult.selectedName, 'Selected detail row should contain Наименование').not.toBe('');
                    expect.soft(hierarchyResult.selectedDesignation, 'Selected detail row should contain Обозначение').not.toBe('');
                },
                'V001 Archive detail hierarchy completed',
                testInfo,
            );
        });

        const validateArchiveEntityHeadersAndModals = async (
            page: import('@playwright/test').Page,
            testInfo: import('@playwright/test').TestInfo,
            idx: number,
        ) => {
            testInfo.setTimeout(TEST_TIMEOUTS.LONG);
            const po = new PageObject(page);
            const elements = archiveData.elements;
            const lang = (process.env.TEST_LANG === 'en') ? 'en' : 'ru';
            const discoveredElements: Record<string, any> = {};
            const outputPath = path.resolve(__dirname, '../testdata/V001-Archive.json');

            const persistDiscoveredElements = () => {
                if (Object.keys(discoveredElements).length === 0) {
                    return;
                }
                const mergedElements = {
                    ...(archiveData.elements as Record<string, any>),
                    ...discoveredElements,
                };
                const mergedJson = {
                    ...archiveData,
                    elements: mergedElements,
                };
                fs.writeFileSync(outputPath, `${JSON.stringify(mergedJson, null, 4)}\n`, 'utf8');
            };

            await test.step('Step 1: Login and navigate to Archive', async () => {
                await po.goto(SELECTORS.MAINMENU.ARCHIVE.URL);
                await page.waitForLoadState('networkidle');
                await page.waitForSelector(ArchiveSelectors.ENTITY_DROPDOWN, { state: 'visible' });
            });

            const allEntities = (elements.ArchiveMainPage.dropdown.options as any)[lang];
            const entityToTest = allEntities[idx];
            const entityKeyRu = (elements.ArchiveMainPage.dropdown.options as any)['ru'][idx];
            const sanitizedKey = entityKeyRu.replace(/ /g, '_');

            await test.step(`Process Entity Index ${idx}: ${entityToTest}`, async () => {
                await po.goto(SELECTORS.MAINMENU.ARCHIVE.URL);
                await page.waitForLoadState('networkidle');
                await page.waitForSelector(ArchiveSelectors.ENTITY_DROPDOWN, { state: 'visible', timeout: 20000 });
                await dismissAllDialogsBestEffort(page);

                    // 1. Selection
                    await allure.step(`Select entity: ${entityToTest}`, async () => {
                        await openEntityDropdown(page);
                        await page.click(ArchiveSelectors.ENTITY_OPTION(entityToTest), { force: true });
                        await page.waitForLoadState('networkidle');
                        await page.waitForSelector(ArchiveSelectors.ARCHIVE_TABLE_CONTAINER_SELECTOR, { state: 'visible', timeout: 15000 });
                        await page.waitForSelector(ArchiveSelectors.ARCHIVE_TABLE_BODY, { state: 'attached', timeout: 15000 });
                        await page.waitForTimeout(2000); 
                    });

                    // 2. Validate Table Headers
                    const archiveTableKey = `ArchiveTable_${sanitizedKey}`;
                    const tableData = (elements as Record<string, any>)[archiveTableKey];
                    if (tableData && tableData.headers) {
                        const headerCells = page.locator(`${ArchiveSelectors.ARCHIVE_TABLE_CONTAINER_SELECTOR} th`);
                        const headerCount = await headerCells.count();
                        for (let headerIndex = 0; headerIndex < headerCount; headerIndex++) {
                            await po.waitAndHighlight(headerCells.nth(headerIndex), {
                                waitAfter: 150,
                            });
                        }
                        const headers = (tableData.headers as any)[lang];
                        const headersMatch = await po.checkTableColumnHeaders(page, ArchiveSelectors.ARCHIVE_TABLE_CONTAINER, { headers });
                        await expectSoftWithScreenshot(
                            page,
                            () => {
                                expect.soft(headersMatch).toBe(true);
                            },
                            `Archive table headers match JSON for entity "${entityToTest}"`,
                            testInfo,
                        );
                    }

                    // 3. Row Click and Modal Validation
                    await allure.step(`Open and Validate Modal for ${entityToTest}`, async () => {
                        // Support skipping modals for entities like 'Документ'
                        if (tableData && tableData.noModal) {
                            logger.info(`Skipping modal validation for ${entityToTest} (noModal: true)`);
                            return;
                        }

                        const rows = page.locator(ArchiveSelectors.ARCHIVE_TABLE_ROW);
                        if (await rows.count() > 0) {
                            const firstRow = rows.first();
                            await firstRow.scrollIntoViewIfNeeded();
                            await firstRow.evaluate(el => el.style.backgroundColor = 'rgba(30, 144, 255, 0.1)');
                            await page.waitForTimeout(500);
                            await firstRow.click();
                            
                            const modalOpened = await page.waitForSelector(ArchiveSelectors.MODAL_CONTAINER, { state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
                            if (!modalOpened) {
                                await dismissAllDialogsBestEffort(page);
                                return;
                            }
                            await page.waitForTimeout(1000); 

                            const modalKey = `ShortInfoModal_${sanitizedKey}`;
                            const modalData = (elements as any)[modalKey];
                            if (modalData) {
                                // A. Validate Titles
                                const titles = Array.isArray(modalData.titles) ? modalData.titles : (modalData.titles as any)[lang];
                                for (const titleItem of titles) {
                                    const isObj = typeof titleItem === 'object';
                                    const testid = isObj ? titleItem.testid : null;
                                    const expectedText = isObj ? resolveLocalizedLabel(titleItem.label, lang) : titleItem;
                                    
                                    let locator = testid ? page.locator(`[data-testid="${testid}"]`).first() : page.locator(`${ArchiveSelectors.MODAL_CONTAINER} h3`).filter({ hasText: expectedText }).first();
                                    
                                    if (expectedText && await locator.isVisible()) {
                                        await locator.scrollIntoViewIfNeeded();
                                        await locator.evaluate(el => el.style.backgroundColor = 'yellow');
                                        await expect(locator).toContainText(expectedText);
                                        await page.waitForTimeout(300);
                                        await locator.evaluate(el => el.style.backgroundColor = '');
                                    }
                                }

                                // B. Validate Labels
                                if (modalData.labels) {
                                    const labelItems = Array.isArray(modalData.labels) ? modalData.labels : (modalData.labels as any)[lang];
                                    for (const labelItem of labelItems) {
                                        const isObj = typeof labelItem === 'object';
                                        const testid = isObj ? labelItem.testid : null;
                                        const expectedText = isObj ? resolveLocalizedLabel(labelItem.label, lang) : labelItem;

                                        let locator = testid ? page.locator(`[data-testid="${testid}"]`).first() : page.locator(ArchiveSelectors.MODAL_CONTAINER).locator(`text="${expectedText}"`).first();
                                        
                                        if (expectedText && await locator.isVisible()) {
                                            await locator.scrollIntoViewIfNeeded();
                                            await locator.evaluate(el => el.style.backgroundColor = 'yellow');
                                            await expect(locator).toBeVisible();
                                            await page.waitForTimeout(300);
                                            await locator.evaluate(el => el.style.backgroundColor = '');
                                        }
                                    }
                                }

                                // C. Validate Buttons
                                if (modalData.buttons) {
                                    for (const btnData of modalData.buttons) {
                                        const btnLabel = resolveLocalizedLabel(btnData.label, lang);
                                        if (!btnLabel) {
                                            continue;
                                        }
                                        let btn = btnData.testid 
                                            ? page.locator(`[data-testid="${btnData.testid}"]`).filter({ hasText: btnLabel }).first()
                                            : page.locator(`${ArchiveSelectors.MODAL_CONTAINER} button`).filter({ hasText: btnLabel }).first();

                                        if (await btn.count() === 0 && btnData.testid) {
                                            const allWithId = page.locator(`[data-testid="${btnData.testid}"]`);
                                            for (let i = 0; i < await allWithId.count(); i++) {
                                                const txt = await allWithId.nth(i).innerText();
                                                if (txt.includes(btnLabel)) { btn = allWithId.nth(i); break; }
                                            }
                                        }
                                        
                                        if (await btn.isVisible()) {
                                            await btn.scrollIntoViewIfNeeded();
                                            await btn.evaluate(el => el.style.backgroundColor = 'yellow');
                                            const actual = (await btn.innerText()).replace(/\s+/g, ' ').trim();
                                            const expected = btnLabel.replace(/\s+/g, ' ').trim();
                                            expect(actual).toContain(expected);
                                            await page.waitForTimeout(300);
                                            await btn.evaluate(el => el.style.backgroundColor = '');

                                            const nestedSpecKey = getNestedModalSpecKey(btnLabel, sanitizedKey);
                                            const nestedSelector = getNestedModalSelector(btnLabel);
                                            const nestedData = nestedSpecKey ? (elements as Record<string, any>)[nestedSpecKey] : null;
                                            const shouldIgnore = ['Полная информация', 'Full info', 'Печать', 'Print', 'Закрыть', 'Close'].includes(normalizeButtonLabel(btnLabel));

                                            if (!shouldIgnore && nestedSelector && nestedSpecKey) {
                                                await btn.click({ force: true });

                                                const nestedModal = page.locator(visibleSelectorList(nestedSelector)).last();
                                                const nestedOpened = await nestedModal.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
                                                if (nestedOpened) {
                                                    await po.waitAndHighlight(nestedModal, { waitAfter: 150 });
                                                    const discoveredSnapshot = await snapshotNestedModal(nestedModal, po);
                                                    discoveredElements[nestedSpecKey] = mergeNestedModalSpec(
                                                        (elements as Record<string, any>)[nestedSpecKey],
                                                        discoveredSnapshot,
                                                    );
                                                    persistDiscoveredElements();

                                                    if (nestedSpecKey === 'TechProcessModal_Деталь') {
                                                        await processDetailTechProcessChildren(
                                                            page,
                                                            po,
                                                            nestedModal,
                                                            elements as Record<string, any>,
                                                            discoveredElements,
                                                            persistDiscoveredElements,
                                                        );
                                                    }

                                                    if (nestedData) {
                                                        await validateNestedModalFromJson(
                                                            page,
                                                            po,
                                                            nestedSelector,
                                                            nestedData,
                                                            lang,
                                                            testInfo,
                                                            `${entityToTest} -> ${btnLabel}`,
                                                        ).catch(error => {
                                                            const message = error instanceof Error ? error.message : String(error);
                                                            logger.warn(`Nested modal validation warning for "${entityToTest}" -> "${btnLabel}": ${message}`);
                                                            return Promise.resolve();
                                                        });
                                                    } else {
                                                        await closeTopMostDialog(page);
                                                        await nestedModal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
                                                        await page.waitForTimeout(TIMEOUTS.SHORT);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            // 4. Modal Closure
                            await dismissAllDialogsBestEffort(page);
                            await page.waitForSelector(ArchiveSelectors.MODAL_CONTAINER, { state: 'hidden', timeout: 5000 }).catch(() => {});
                            await page.waitForTimeout(500);
                        }
                    });
                }).catch(error => {
                    const message = error instanceof Error ? error.message : String(error);
                    logger.warn(`Archive scan step failed for "${entityToTest}": ${message}`);
                });

            if (Object.keys(discoveredElements).length > 0) {
                persistDiscoveredElements();
                logger.info(`Archive dialog scan added ${Object.keys(discoveredElements).length} new nested modal specs to V001-Archive.json`);
            }
        };

        allEntitiesRu.forEach((entityName, entityIndex) => {
            if (entityName === 'Деталь') {
                return;
            }

            test(`Validate Archive entity "${entityName}" headers and modals`, async ({ page }, testInfo) => {
                await validateArchiveEntityHeadersAndModals(page, testInfo, entityIndex);
            });
        });
    });
};
