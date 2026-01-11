// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT STYLE CONSTANTS (for highlightElement from PageObject)
// ─────────────────────────────────────────────────────────────────────────────
// Standardized highlight styles for visual debugging across all test files

export const HIGHLIGHT_ERROR = {
  backgroundColor: 'red',
  border: '2px solid red',
  color: 'white',
};

export const HIGHLIGHT_PENDING = {
  backgroundColor: 'yellow',
  border: '2px solid red',
  color: 'blue',
};

export const HIGHLIGHT_SUCCESS = {
  backgroundColor: 'green',
  border: '2px solid green',
  color: 'white',
};

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES:
// ─────────────────────────────────────────────────────────────────────────────
// await detailsPage.highlightElement(element, HIGHLIGHT_PENDING);
// await detailsPage.highlightElement(element, HIGHLIGHT_SUCCESS);
// await detailsPage.highlightElement(element, HIGHLIGHT_ERROR);
// ─────────────────────────────────────────────────────────────────────────────
