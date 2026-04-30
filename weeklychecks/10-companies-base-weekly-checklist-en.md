# Weekly Check: Companies Base

## Scope

Page: **База компаний**

Route: `/companybase`

This checklist covers the main content area only.

## What Is On The Page

- Filter sections:
  - **По типу**
  - **По особенностям**
  - **По поставке/покупке**
- Controls: **Сортировать по дате создания**, **Фильтр по отметке**, **Показать мои**, **Выбрать**
- Search field: **Поиск по ИНН и наименованию**
- Companies table columns:
  - **ИНН**
  - **Наименование**
  - **Тип компании**
  - **Дата создания**
  - request-history action
- Actions: **Создать**, **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База компаний**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check filter sections. | Type, feature, and supply/purchase filters are visible. | Not run |  |
| 3 | Check feature controls. | Sort by date, mark filter, and show-my controls are visible; **Показать мои** may be disabled. | Not run |  |
| 4 | Check supply/purchase filter. | **Выбрать** is visible and opens a selector when used. | Not run |  |
| 5 | Check companies table. | Table is visible with rows or a clear empty state. | Not run |  |
| 6 | Check headers. | Headers include **ИНН**, **Наименование**, **Тип компании**, and **Дата создания**. | Not run |  |
| 7 | Search by INN or company name. | **Поиск по ИНН и наименованию** filters companies or shows a clear empty state. | Not run |  |
| 8 | Clear search. | Company list returns for the active filters. | Not run |  |
| 9 | Change type filter if safe. | Table updates to matching company types or a clear empty state. | Not run |  |
| 10 | Click **Сортировать по дате создания**. | Row order changes or data refreshes without errors. | Not run |  |
| 11 | Click **Фильтр по отметке**. | Table refreshes and remains usable. | Not run |  |
| 12 | Select a company row. | Row becomes active and **Архив** becomes enabled when archive is allowed. | Not run |  |
| 13 | Check **Создать**. | Button is visible and enabled. Do not save a new company during this weekly check. | Not run |  |
| 14 | Use history action where visible. | History opens or shows a clear empty state without blocking the table. | Not run |  |
| 15 | Refresh the page. | Filters, search, table, and actions reload. | Not run |  |
| 16 | Check layout. | INN, company name, type, and creation date values are readable. | Not run |  |

## Values To Record Each Week

| Date | Environment | INN Sample | Company Sample | Type Sample | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage |  |  |  |  |

## Pass Criteria

- Companies base loads successfully.
- Filters, search, table, and actions are visible.
- Search by INN/name works and can be cleared.
- Filters do not block the page.
- Company rows remain readable with no technical placeholders.
