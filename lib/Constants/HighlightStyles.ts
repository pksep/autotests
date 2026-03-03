// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT STYLE constants (for highlightElement from PageObject)
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

/** Baseline row on actions table (captured before our actions) */
export const HIGHLIGHT_BASELINE = {
  backgroundColor: 'rebeccapurple',
  border: '2px solid purple',
  color: 'white',
};

/** New rows on actions table (added by our last action; scanning) */
export const HIGHLIGHT_NEW_ROW = {
  backgroundColor: 'yellow',
  border: '2px solid orange',
  color: 'black',
};

/** Distinct colors for "click feedback" (e.g. rapid Save clicks); pick one at random per click. */
export const HIGHLIGHT_CLICK_COLORS = [
  { backgroundColor: 'yellow', border: '3px solid orange', color: 'black' },
  { backgroundColor: 'cyan', border: '3px solid blue', color: 'black' },
  { backgroundColor: 'lime', border: '3px solid green', color: 'black' },
  { backgroundColor: 'magenta', border: '3px solid purple', color: 'white' },
  { backgroundColor: 'orange', border: '3px solid red', color: 'black' },
  { backgroundColor: 'deepskyblue', border: '3px solid navy', color: 'white' },
];

// ─────────────────────────────────────────────────────────────────────────────
// USAGE EXAMPLES:
// ─────────────────────────────────────────────────────────────────────────────
// await detailsPage.highlightElement(element, HIGHLIGHT_PENDING);
// await detailsPage.highlightElement(element, HIGHLIGHT_SUCCESS);
// await detailsPage.highlightElement(element, HIGHLIGHT_ERROR);
// ─────────────────────────────────────────────────────────────────────────────
