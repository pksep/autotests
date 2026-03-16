/**
 * @file U003-Constants.ts
 * @purpose Shared constants and state for U003 Shipment Tasks Management suites.
 */

import type { ISpetificationData } from '../lib/Page';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';

// Test products - static names since Case 0 cleans up all TEST_* items before each run
export const TEST_PRODUCTS = [
  { articleNumber: 'TEST_ARTICLE_1', name: 'TEST_PRODUCT_1', designation: '-' },
  { articleNumber: 'TEST_ARTICLE_2', name: 'TEST_PRODUCT_2', designation: '-' },
  { articleNumber: 'TEST_ARTICLE_3', name: 'TEST_PRODUCT_3', designation: '-' },
] as const;

export const TEST_PRODUCT_NAMES = TEST_PRODUCTS.map(p => p.name);

// Test data for Case 2 (create shipment task)
export const nameBuyer = 'М10';
export const quantity = '5';
export const urgencyDate = '23.01.2025';
export const urgencyDateNewFormat = 'Янв 23, 2025';
export const shipmentPlanDate = '24.01.2025';
export const orderDate = '25.01.2025';

// Shared state (set by Case 1 and Case 2; read by later cases)
declare global {
  var testProductName: string;
  var testProductArticleNumber: string;
  var shipmentTaskNumber: string;
  var fullOrderNumber: string;
  var shipmentOrderDate: string;
  var firstProductName: string;
  var secondProductName: string;
}

export let testProductName = '';
export let testProductArticleNumber = '';
export let shipmentTaskNumber = '';
export let fullOrderNumber = '';
export let shipmentOrderDate = '';
export let firstProductName = '';
export let secondProductName = '';

export function setU003ProductState(update: {
  testProductName?: string;
  testProductArticleNumber?: string;
  firstProductName?: string;
  secondProductName?: string;
}) {
  if (update.testProductName !== undefined) {
    testProductName = update.testProductName;
    global.testProductName = update.testProductName;
  }
  if (update.testProductArticleNumber !== undefined) {
    testProductArticleNumber = update.testProductArticleNumber;
    global.testProductArticleNumber = update.testProductArticleNumber;
  }
  if (update.firstProductName !== undefined) {
    firstProductName = update.firstProductName;
    global.firstProductName = update.firstProductName;
  }
  if (update.secondProductName !== undefined) {
    secondProductName = update.secondProductName;
    global.secondProductName = update.secondProductName;
  }
}

export function setU003OrderState(update: {
  shipmentTaskNumber?: string;
  fullOrderNumber?: string;
  shipmentOrderDate?: string;
}) {
  if (update.shipmentTaskNumber !== undefined) {
    shipmentTaskNumber = update.shipmentTaskNumber;
    global.shipmentTaskNumber = update.shipmentTaskNumber;
  }
  if (update.fullOrderNumber !== undefined) {
    fullOrderNumber = update.fullOrderNumber;
    global.fullOrderNumber = update.fullOrderNumber;
  }
  if (update.shipmentOrderDate !== undefined) {
    shipmentOrderDate = update.shipmentOrderDate;
    global.shipmentOrderDate = update.shipmentOrderDate;
  }
}

// Arrays for комплектации data (used across cases)
export const descendantsCbedArray: ISpetificationData[] = [];
export const descendantsDetailArray: ISpetificationData[] = [];
export const deficitTable = SelectorsShortagePages.TABLE_DEFICIT_IZD;
export const tableMainUploading = SelectorsShipmentTasks.TABLE_SHIPMENT_TABLE;
