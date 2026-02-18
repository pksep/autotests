# Page.ts – Further Refactoring Analysis

**Current:** ~1681 lines. Most methods already delegate to helpers; the remaining bloat is **duplicate logic** and **dead code**.

---

## 1. Quick wins (no behavior change)

### 1.1 Remove dead code (~82 lines)

- **Lines 601–682:** Entire method `checkTableRowOrdering` is commented out (legacy date-ordering check).
- **Action:** Delete this block. No callers; TableHelper has no equivalent that depends on it.

### 1.2 Replace duplicate table logic with delegation (~165 lines)

**TableHelper** already implements the same behavior. Page.ts reimplements it instead of delegating.

| Page.ts method           | Lines (approx) | TableHelper has same method? | Action |
|--------------------------|----------------|-------------------------------|--------|
| `searchTable`            | 708–776 (~69)  | Yes, same signature           | Delegate: `return this.tableHelper.searchTable(nameSearch, locator, searchInputDataTestId)` |
| `searchTableRedesign`    | 785–808 (~24)  | Yes                           | Delegate: `return this.tableHelper.searchTableRedesign(nameSearch, locator)` |
| `searchTableByIcon`      | 817–832 (~16)  | Yes                           | Delegate: `return this.tableHelper.searchTableByIcon(nameSearch, locator)` |
| `waitingTableBody`       | 840–885 (~46)  | Yes, same options             | Delegate: `return this.tableHelper.waitingTableBody(locator, { minRows, timeoutMs })` |
| `waitingTableBodyNoThead`| 949–957 (~9)   | Yes                           | Delegate: `return this.tableHelper.waitingTableBodyNoThead(locator)` |

**Note:** `searchAndWaitForTable` and `navigateToPageAndWaitForTable` in Page already call `this.tableHelper.searchTable` / `this.tableHelper.waitingTableBody` internally. The duplication is the **standalone** `searchTable`, `searchTableRedesign`, `searchTableByIcon`, `waitingTableBody`, and `waitingTableBodyNoThead` that are fully inlined in Page. Replacing those five with one-liner delegations keeps the public API (used by U002, OrderHelper, etc.) unchanged.

**Estimated saving:** ~82 + ~165 ≈ **247 lines** → Page.ts down to ~1434 lines.

---

## 2. Optional next steps (audit before doing)

### 2.1 Row/cell/table “check” methods

These live in Page and may contain non-trivial logic. Worth checking whether they belong in **RowCellHelper** or **TableHelper**:

- `getValueOrClickFromFirstRow` / `getValueOrClickFromFirstRowNoThead`
- `clickIconOperation` / `clickIconOperationNew`
- `checkboxMarkNameInLineFromFirstRow`, `checkNameInLineFromFirstRow`
- `clickOnTheTableHeaderCell`
- `checkTableColumns`, `checkTableColumnHeaders`
- `checkOrderQuantity`, `checkOrderQuantityNew`, `checkOrderNumber`
- `checkCurrentDate`, `checkModalWindowLaunchIntoProduction`, `checkModalWindowForTransferringToArchive`
- `checkHeader`, `ordersListVerifyModalDates`, `checkDatesWithOrderList` (already delegates to orderHelper)

If any of these are multi-line and table/row-specific, moving them into TableHelper or RowCellHelper would shrink Page further and keep “table/row” concerns in one place.

### 2.2 Login / nav / assertion helpers

- `fillLoginForm`, `newFillLoginForm` → already delegate to **LoginHelper**.
- `nav`, `checkUrl`, `checkTitle`, `checkLanguage`, `checkBreadCrumb` → could be grouped in a small **NavigationAssertionsHelper** or stay in ValidationHelper if they are one-liners. Low priority.

### 2.3 Modal / completion helpers

- `completionMarkModalWindow`, `completesSetsModalWindow`, `assemblyInvoiceModalWindow`, `checkCloseModalWindow` → if they only call ModalHelper or are thin wrappers, keep; if they contain real logic, consider moving to **ModalHelper**.

---

## 3. Summary

| Action                                      | Lines saved (approx) | Risk   |
|--------------------------------------------|----------------------|--------|
| Remove commented `checkTableRowOrdering`   | ~82                  | None   |
| Delegate search/wait table to TableHelper  | ~165                 | Low    |
| **Total for section 1**                   | **~247**             | Low    |

After that, Page.ts is ~1434 lines. Further reduction would come from auditing the row/cell/check methods (section 2) and moving any that contain real logic into the right helper.
