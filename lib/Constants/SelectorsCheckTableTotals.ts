/**
 * Selectors for CheckTableTotals spec (homepage/warehouse cards and table totals).
 * Replaces obsolete CONST from config.ts for this flow.
 */

export const SWITCH_ITEM0 = '[data-testid="Switch-Item0"]';
export const SWITCH_ITEM1 = '[data-testid="Switch-Item1"]';
export const CARD = '[data-testid="Card"]';
/** Generic table (legacy); prefer TABLE_METALWORKING for Металлообработка cards. */
export const TABLE = '[data-testid="Table"]';
/** Metalworking operations table (Switch-Item0 / Металлообработка). */
export const TABLE_METALWORKING = '[data-testid="MetalloworkingSclad-Content-WithFilters-TableWrapper-Table"]';
/** Operation detail table (Металлообработка card click). */
export const TABLE_OPERATION_METALL = '[data-testid="OperationMetall-Body-TableOperation-Element-Modifier"]';
export const TABLE_SBORKA = '[data-testid="TableOperationBody-TableOperation-TableOperation"]';
/** Scrollable container selectors for scroll-to-load (data-testid only). */
export const SCROLLABLE_CONTAINERS = '[data-testid*="Scroll"], [data-testid*="TableWrapper"]';
/** XPath from table: ancestor that is the table scroll slot (YTable / handleScroll). Class in constants only. */
export const TABLE_SCROLL_SLOT_ANCESTOR_XPATH = 'ancestor::*[contains(@class, "scroll-wrapper__slot")]';
/** All scroll slots on page (YTable pagination). Scrolling all triggers the table's slot. Class in constants only. */
export const PAGE_SCROLL_SLOTS = '.scroll-wrapper__slot';
