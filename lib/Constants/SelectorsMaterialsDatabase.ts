// Material creation page selectors (use BaseMaterials-CreateBtn to avoid matching "Создать копированием")
export const MATERIAL_CREATE_BUTTON = '[data-tour-id="BaseMaterials-CreateBtn"]';
export const MATERIAL_CREATE_BUTTON_ALT = 'button[data-testid="Button"]';
// CreatorMaterial.vue (material add/edit page)
export const MATERIAL_CREATE_INPUT = '[data-testid="CreatorMaterial-Layout-Left-Information-Top-Inputs-InputName"]';
export const MATERIAL_CREATE_TABLE = '[data-testid^="CreatorMaterial-Layout-Left-Specification-TableWrapper-Table"]';
/** Type table (Тип) - select one row before subtype loads */
export const MATERIAL_CREATE_TABLE_TYPE = '[data-testid="CreatorMaterial-Layout-Left-Specification-TableWrapper-TableType"]';
/** Subtype table (Подтип) - select one row after type; rows load after type selection */
export const MATERIAL_CREATE_TABLE_SUBTYPE = '[data-testid="CreatorMaterial-Layout-Left-Specification-TableWrapper-TableSubtype"]';
// SelectMaterialTypeTable: search is at ...-TableType-Wrapper-Border-Table-Thead-TrSearch-Td-Search
export const MATERIAL_CREATE_TABLE_TYPE_SEARCH = '[data-testid="CreatorMaterial-Layout-Left-Specification-TableWrapper-TableType-Wrapper-Border-Table-Thead-TrSearch-Td-Search"]';
export const MATERIAL_CREATE_TABLE_SEARCH_INPUT = '[data-testid*="SearchInput-Dropdown-Input"]';
export const MATERIAL_CREATE_SAVE_BUTTON = '[data-testid="CreatorMaterial-Layout-ButtonSaveAndCancel-ButtonsCenter-Save"]';
export const MATERIAL_CREATE_PAGE_TITLE = 'Создание материала';
// Type/subtype combinations determine material category (instance_type). Use these when creating materials.
/** Покупные детали (ПД / bought materials): type Гидравлика, subtype Насосы гидравлические */
export const MATERIAL_TYPE_POKUPNYE_DETALI = 'Гидравлика';
export const MATERIAL_SUBTYPE_POKUPNYE_DETALI = 'Насосы гидравлические';
/** Расходные материалы (РМ / consumables): main task Ветошь, полотенца; sub task Ветошь */
export const MATERIAL_TYPE_RASHODNYE = 'Ветошь, полотенца';
export const MATERIAL_SUBTYPE_RASHODNYE = 'Ветошь';
/** Материалы для деталей (materials for details): type 3D печать, subtype Bflex */
export const MATERIAL_TYPE_MATERIALS_FOR_DETAILS = '3D печать';
export const MATERIAL_SUBTYPE_MATERIALS_FOR_DETAILS = 'Bflex';
/** @deprecated Use MATERIAL_TYPE_MATERIALS_FOR_DETAILS */
export const MATERIAL_TYPE_SEARCH_VALUE = '3D печать';
export const MATERIAL_CREATE_QUANTITY_TABLE = '[data-testid="CreatorMaterial-Layout-Left-Parameters-Table"]';
export const MATERIAL_CREATE_QUANTITY_INPUT = '[data-testid*="TdValue-Input"]';
/** Characteristics section (Характеристики) - may appear after subtype selection; fill values when save says required */
export const MATERIAL_CREATE_CHARACTERISTICS_SECTION =
  '[data-testid="CreatorMaterial-Layout-Left-Additional-Characteristics-Characteristics"]';
/** Base unit dropdown (Базовая ЕИ) - required before save */
export const MATERIAL_CREATE_BASE_UNIT_DROPDOWN =
  '[data-testid="CreatorMaterial-Layout-Left-Parameters-Units-LabelWrapper-EdizmDropdown"]';

// Materials list page selectors (BaseMaterial.vue uses data-tour-id)
/** Switch to filter by category; must select "Покупные детали" before creating materials for product ПД */
export const MATERIAL_LIST_SWITCH_WRAPPER = '[data-testid="MaterialTableList-Switch-Wrapper"]';
export const MATERIAL_LIST_SWITCH = '[data-testid="MaterialTableList-Switch"]';
export const MATERIAL_LIST_TABLE = '[data-testid="MaterialTableList-Table-Item"]';
export const MATERIAL_LIST_TABLE_BODY_ROWS = '[data-testid="MaterialTableList-Table-Item"] tbody tr';
export const MATERIAL_LIST_SEARCH_INPUT = '[data-testid="MaterialTableList-Table-Item-SearchInput-Dropdown-Input"]';
export const MATERIAL_LIST_SEARCH_HISTORY_DROPDOWN = '[data-testid="MaterialTableList-Table-Item-SearchInput-Dropdown-History-ShowResult-Title"]';
// Combined so ERP-3015 cleanupTestMaterials and U004 cleanupTestMaterialsByPrefix work with either UI
export const MATERIAL_LIST_ARCHIVE_BUTTON = '[data-tour-id="BaseMaterials-ArchiveBtn"], [data-testid="Button"]';
export const MATERIAL_LIST_ARCHIVE_BUTTON_ALT = '[data-testid="Button"]';
