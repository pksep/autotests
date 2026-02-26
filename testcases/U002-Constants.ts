/**
 * @file U002-Constants.ts
 * @purpose Shared state and constants for U002 test suites (Orders from Suppliers & Warehouse).
 *
 * Used by: U002-Setup, U002-UI, U002-DataSetup, U002-Details, U002-Cbed, U002-Izd.
 */

// Test data arrays - populated by Setup (cleared) and DataSetup (Cases 05–07)
export let arrayDetail: Array<{ name: string; designation?: string }> = [];
export let arrayCbed: Array<{ name: string; designation?: string }> = [];
export let arrayIzd: Array<{ name: string; designation?: string }> = [];

// Operation/process names captured during creation (Cases 05–07)
export let nameOprerationOnProcess: string;
export let nameOprerationOnProcessAssebly: string;
export let nameOprerationOnProcessIzd: string;
export function setNameOprerationOnProcess(v: string) {
  nameOprerationOnProcess = v;
}
export function setNameOprerationOnProcessAssebly(v: string) {
  nameOprerationOnProcessAssebly = v;
}
export function setNameOprerationOnProcessIzd(v: string) {
  nameOprerationOnProcessIzd = v;
}

// Quantity and order state used across Details/Cbed/Izd flows
export const quantityOrder = '5';
export let checkOrderNumber: string;
export let quantityLaunchInProduct: number;
export function setQuantityLaunchInProduct(v: number) {
  quantityLaunchInProduct = v;
}

// Legacy/optional state (used where referenced in specs)
export let numberColumnQunatityMade: number;
export let firstOperation: string;
export let valueLeftToDo: unknown;
