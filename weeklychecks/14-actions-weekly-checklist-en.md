# Weekly Check: Actions

## Scope

Page: **Действия**

Route: `/actions`

Main content title: **История изменений**

This checklist covers the change-history page only.

## What Is On The Page

- Date range controls
- Filter: **Сотрудники**
- Filter: **Тип сущности**
- **Сбросить**
- Audit/history table with columns:
  - **Дата и время**
  - **Сотрудник**
  - **Тип сущности**
  - **Индетификатор сущности**
  - **Действие**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **Действия**. | Page loads with **История изменений** and no stuck loader. | Not run |  |
| 2 | Check date range controls. | Start and end date controls are visible and show the expected current period. | Not run |  |
| 3 | Open the start date picker. | Calendar opens and can be closed without blocking the page. | Not run |  |
| 4 | Open the end date picker. | Calendar opens and can be closed without blocking the page. | Not run |  |
| 5 | Check **Сотрудники** filter. | Filter is visible and shows **Все** or the selected employee. | Not run |  |
| 6 | Check **Тип сущности** filter. | Filter is visible and shows **Все** or the selected entity type. | Not run |  |
| 7 | Change employee filter if safe. | Table refreshes to matching employee actions or shows a clear empty state. | Not run |  |
| 8 | Change entity-type filter if safe. | Table refreshes to matching entity actions or shows a clear empty state. | Not run |  |
| 9 | Check **Сбросить**. | Button is visible; it becomes enabled after filters change and resets filters when clicked. | Not run |  |
| 10 | Check history table. | Table is visible with rows or a clear empty state. | Not run |  |
| 11 | Check required headers. | Headers include **Дата и время**, **Сотрудник**, **Тип сущности**, **Индетификатор сущности**, and **Действие**. | Not run |  |
| 12 | Check row date/time values. | Values are formatted consistently, such as `14.04.2026 15:31:13`. | Not run |  |
| 13 | Check row employee values. | Employee names are readable or intentionally blank for system actions. | Not run |  |
| 14 | Check entity type values. | Entity types are readable, such as product, assembly, shipment task, warehouse order item, or completion mark. | Not run |  |
| 15 | Check entity identifier values. | Entity identifiers are readable and not replaced by raw technical values. | Not run |  |
| 16 | Check action text. | Action descriptions are understandable and not `undefined`, `null`, or broken text. | Not run |  |
| 17 | Refresh the page. | Date controls, filters, and history table reload. | Not run |  |
| 18 | Check layout. | Table columns are readable and long action text does not overlap critical information. | Not run |  |

## Values To Record Each Week

| Date | Environment | Date Range | Employee Filter | Entity Type Filter | First Action Time | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  | Stage |  | Все | Все |  |  |

## Pass Criteria

- **История изменений** loads successfully.
- Date range, employee filter, entity-type filter, and reset button are visible.
- History table headers and rows are readable.
- Filters refresh the table and can be reset.
- No stuck loaders, blocked calendars, or visible technical errors remain.
