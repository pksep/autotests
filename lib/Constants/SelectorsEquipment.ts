/**
 * @file SelectorsEquipment.ts
 * @date 2025-01-20
 * @purpose Selectors for Equipment creation and management pages
 */

// Base Equipment Page Selectors
export const BASE_EQUIPMENT_ADD_BUTTON = '[data-testid="BaseEquipment-ActionsButtons-Add"]';
export const BASE_EQUIPMENT_TABLE = '[data-testid="BasePaginationTable-Table-equipment"]';
export const BASE_EQUIPMENT_SEARCH_INPUT = '[data-testid="BasePaginationTable-Thead-SearchInput-Dropdown-Input"]';

// Creator Equipment Page Selectors
export const CREATOR_EQUIPMENT_NAME_INPUT = '[data-testid="CreatorEquipment-Layout-Left-Information-Inputs-InputName-Input"]';
export const CREATOR_EQUIPMENT_TYPE_TABLE = '[data-testid="CreatorEquipment-Layout-Left-Specification-DynamicComponentTableNewType-Element-Table"]';
export const CREATOR_EQUIPMENT_TYPE_TABLE_ROW_PREFIX = 'CreatorEquipment-Layout-Left-Specification-DynamicComponentTableNewType-Element-Table-Tbody-TableRow';
export const CREATOR_EQUIPMENT_SUBTYPE_TABLE = '[data-testid="CreatorEquipment-Layout-Left-Specification-DynamicComponentTableNewSubtype-Element-Table"]';
export const CREATOR_EQUIPMENT_SUBTYPE_TABLE_ROW_PREFIX = 'CreatorEquipment-Layout-Left-Specification-DynamicComponentTableNewSubtype-Element-Table-Tbody-TableRow';
export const CREATOR_EQUIPMENT_OPERATION_SELECT_FILTER_TITLE = '[data-testid="CreatorEquipment-Layout-Left-Additional-Parameters-Operation-SelectFilter-Title"]';
export const CREATOR_EQUIPMENT_OPERATION_SELECT_FILTER_OPTIONS_LIST = '[data-testid="CreatorEquipment-Layout-Left-Additional-Parameters-Operation-SelectFilter-OptionsList"]';
export const CREATOR_EQUIPMENT_SAVE_BUTTON = '[data-testid="CreatorEquipment-Buttons-ButtonsCenter-Save"]';

// Helper function to get type table row selector
export function getEquipmentTypeTableRowSelector(index: number = 0): string {
  return `[data-testid^="CreatorEquipment-Layout-Left-Specification-DynamicComponentTableNewType-Element-Table-Tbody-TableRow"]`;
}

// Helper function to get subtype table row selector
export function getEquipmentSubtypeTableRowSelector(index: number = 0): string {
  return `[data-testid^="CreatorEquipment-Layout-Left-Specification-DynamicComponentTableNewSubtype-Element-Table-Tbody-TableRow"]`;
}
