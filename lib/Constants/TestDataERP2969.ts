// ─────────────────────────────────────────────────────────────────────────────
// ERP-2969 TEST DATA VALUES
// ─────────────────────────────────────────────────────────────────────────────
// These are the actual test data values (names, quantities) used in ERP-2969 tests
// Selectors should be imported from their respective class constants files

export const TEST_DATA = {
  // Detail names - add as needed
  // NEW_DETAIL_A: 'ERP2969_DETAIL_001',
  // NEW_DETAIL_B: 'ERP2969_DETAIL_002',

  // Assembly names - add as needed
  // NEW_SB_A: 'ERP2969_SB_001',

  // Quantity constants - add as needed
  // NEW_ORDER_QUANTITY: '1',
  // DETAIL_NEW_QUANTITY: '9',

  // Table data-testid values for cleanup methods
  PARTS_PAGE_DETAL_TABLE: 'BasePaginationTable-Table-detal',
  MAIN_PAGE_СБ_TABLE: 'BasePaginationTable-Table-cbed',
} as const;

// Usage examples:
// await searchInput.fill(TEST_DATA.NEW_DETAIL_A);
// await detailsPage.findAndClickElement(page, TEST_DATA.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE);
