/**
 * @file U001-Constants.ts
 * @purpose Shared constants and variables for U001 test suites
 * 
 * This file contains all shared constants, variables, and arrays used across U001 test suites.
 * These are shared state that test cases depend on.
 */

import { ISpetificationData } from '../lib/Page';
import * as SelectorsShortagePages from '../lib/Constants/SelectorsShortagePages';
import * as SelectorsStartProduction from '../lib/Constants/SelectorsStartProduction';
import * as SelectorsShipmentTasks from '../lib/Constants/SelectorsShipmentTasks';
import * as PartsDBSelectors from '../lib/Constants/SelectorsPartsDataBase';

// Shared state variables (will be set by test cases)
export let incomingQuantity = '1';
export let remainingStockBefore: string;
export let remainingStockAfter: string;
export let quantityProductLaunchOnProduction = '2';
export let quantityProductLaunchOnProductionBefore: string;
export let quantityProductLaunchOnProductionAfter: string;
export let quantitySumLaunchOnProduction: Number;
export let urgencyDateOnTable: string;
export let orderNumber: { orderNumber: string; orderDate: string } = { orderNumber: '', orderDate: '' };

// Constants
export const urgencyDate = '23.01.2025';
export const urgencyDateNewFormat = 'Янв 23, 2025';
export const urgencyDateSecond = '21.01.2025';
export const urgencyDateSecondNewFormat = 'Янв 21, 2025';
export const nameProduct = '0Т4.01';
export const designationProduct = '0Т4.01';
export const designation = '0Т4';
export const nameBuyer = 'М10';

// Arrays for test data (mutable - will be populated by test cases)
export const descendantsDetailArray: ISpetificationData[] = [];
export const descendantsCbedArray: ISpetificationData[] = [
  {
    name: '0Т4.11',
    designation: '-',
    quantity: 1,
  },
  {
    name: '0Т4.12',
    designation: '-',
    quantity: 1,
  },
];

export const arrayDetail = [
  {
    name: '0Т4.21',
    designation: '-',
  },
  {
    name: '0Т4.22',
    designation: '-',
  },
];

export const arrayCbed = [
  {
    name: '0Т4.11',
    designation: '-',
  },
  {
    name: '0Т4.12',
    designation: '-',
  },
];

export const nameProductNew = '0Т4.01';

// Selector constants
export const buttonLaunchIntoProductionModalWindow = SelectorsStartProduction.MODAL_START_PRODUCTION_COMPLECTATION_TABLE_IN_PRODUCTION;
export const choiceCbed = PartsDBSelectors.SPECIFICATION_DIALOG_CARD_BASE_OF_ASSEMBLY_UNITS_0;
export const choiceDetail = PartsDBSelectors.SPECIFICATION_DIALOG_CARD_BASE_DETAIL_1;

// DeficitIzd - using constants from SelectorsShortagePages
export const deficitTable = SelectorsShortagePages.TABLE_DEFICIT_IZD;
export const tableMain = SelectorsShortagePages.TABLE_DEFICIT_IZD_ID;
export const columnCheckbox = 'DeficitIzdTable-HeadRow-TotalCheckbox';
export const columnDateUrgency = 'DeficitIzdTable-HeadRow-DateUrgency';
export const columnOrderFromProduction = 'DeficitIzdTable-HeadRow-OrderFromProduction';
export const buttonLaunchIntoProduction = SelectorsShortagePages.BUTTON_LAUNCH_INTO_PRODUCTION;
export const modalWindowLaunchIntoProduction = SelectorsShortagePages.MODAL_START_PRODUCTION;

// DeficitCbed - using constants from SelectorsShortagePages
export const deficitTableCbed = SelectorsShortagePages.TABLE_DEFICIT_CBED;
export const tableMainCbed = SelectorsShortagePages.TABLE_DEFICIT_CBED_ID;
export const columnDateUrgencyCbed = 'DeficitCbed-TableHeader-ViewsDeficitsDuedate';
export const columnOrderFromProductionCbed = 'DeficitCbed-TableHeader-ViewsDeficitsOrderedforproduction';
export const columnCheckboxCbed = 'DeficitCbed-TableHeader-SelectAll';
export const buttonLaunchIntoProductionCbed = SelectorsShortagePages.BUTTON_LAUNCH_INTO_PRODUCTION_CBED;
export const modalWindowLaunchIntoProductionCbed = SelectorsShortagePages.MODAL_START_PRODUCTION_CBED;

// DeficitDetail - using constants from SelectorsShortagePages
export const deficitTableDetail = `table${SelectorsShortagePages.TABLE_DEFICIT_IZD}`;
export const tableMainDetail = SelectorsShortagePages.TABLE_DEFICIT_IZD_ID;
export const columnDateUrgencyDetail = 'DeficitIzdTable-HeadRow-DateUrgency';
export const columnOrderFromProductionDetail = 'DeficitIzdTable-HeadRow-OrderFromProduction';
export const columnCheckBoxDetail = 'DeficitIzdTable-HeadRow-TotalCheckbox';
export const buttonLaunchIntoProductionDetail = `button${SelectorsShortagePages.BUTTON_LAUNCH_INTO_PRODUCTION}`;
export const modalWindowLaunchIntoProductionDetail = SelectorsShortagePages.MODAL_START_PRODUCTION;

// Uploading - using constants from SelectorsShipmentTasks
export const tableMainUploading = SelectorsShipmentTasks.TABLE_SHIPMENT_TABLE;
export const tableMainUploadingID = SelectorsShipmentTasks.TABLE_SHIPMENT_TABLE_ID;
export const buttonUploading = SelectorsShipmentTasks.BUTTON_SHIP;
