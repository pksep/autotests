# Weekly Check: Archive

## Scope

Page: **Архив**

Route: `/archive`

This checklist covers the main archive list page only.

## What Is On The Page

- Filter: **Тип сущности**
- Count value: **Кол-во**
- Search field: **Поиск по обозначению, артиклу и наименованию**
- Archive table with columns:
  - **№**
  - **Обозначение**
  - **Артикул**
  - **Наименование**
  - request-history action

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **Архив**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check **Тип сущности** filter. | Filter is visible and shows the active entity type, such as **Изделие**. | Not run |  |
| 3 | Change entity type if safe. | Archive table refreshes for the selected entity type or shows a clear empty state. | Not run |  |
| 4 | Check count. | **Кол-во** is visible and numeric for the active entity type. | Not run |  |
| 5 | Check search field. | **Поиск по обозначению, артиклу и наименованию** is visible. | Not run |  |
| 6 | Search by designation. | Matching archive rows remain or a clear empty state appears. | Not run |  |
| 7 | Search by article or name. | Matching archive rows remain or a clear empty state appears. | Not run |  |
| 8 | Clear search. | Archive rows return for the active entity type. | Not run |  |
| 9 | Check archive table. | Table is visible with rows or a clear empty state. | Not run |  |
| 10 | Check required headers. | Headers include **№**, **Обозначение**, **Артикул**, and **Наименование**. | Not run |  |
| 11 | Check row data quality. | Designation, article, and name values are readable. Question marks are acceptable only if they are expected legacy data. | Not run |  |
| 12 | Use history action where visible. | History opens or shows a clear empty state without blocking the table. | Not run |  |
| 13 | Refresh the page. | Entity filter, count, search, and archive table reload. | Not run |  |
| 14 | Check layout. | Long archived item names remain readable and table columns do not overlap. | Not run |  |

## Values To Record Each Week

| Date | Environment | Entity Type | Count | Search Sample | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage | Изделие |  |  |  |

## Pass Criteria

- Archive page loads successfully.
- Entity-type filter, count, search, and table are visible.
- Search works and can be cleared.
- Archive rows are readable.
- No stuck loaders, blocked overlays, or visible technical errors remain.
