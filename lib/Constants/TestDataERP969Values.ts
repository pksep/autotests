// ─────────────────────────────────────────────────────────────────────────────
// ERP-969 TEST DATA VALUES
// ─────────────────────────────────────────────────────────────────────────────
// These are the actual test data values (names, quantities) used in ERP-969 tests

export const TEST_DATA = {
  // Detail names
  NEW_DETAIL_A: 'ERP969_DETAIL_001',
  NEW_DETAIL_B: 'ERP969_DETAIL_002',
  DETAIL_1_NAME: 'ERP9692_DETAIL_001',
  DETAIL_2_NAME: 'ERP9692_DETAIL_002',

  // Assembly names
  NEW_SB_A: '0T5.11',
  ASSEMBLY_NAME: 'ERP9692_ASSEMBLY_001',

  // Quantity constants
  NEW_ORDER_QUANTITY: '1',
  DETAIL_NEW_QUANTITY: '9',
} as const;
