# Weekly Check: Shipping Tasks

## Scope

Page: **Задачи на отгрузку**

Route: `/issueshipment`

This checklist covers the shipping tasks list page only. It does not cover completing a full shipment order.

## What Is On The Page

- Date range controls
- Active filter chips, including **Статус: Заказано** and **Покупатели: Все**
- **Сбросить**
- Search field: **Поиск по номеру заказа, артиклу или наименованию**
- Actions: **Создать заказ**, **Редактировать**, **Печать**, **Архив**
- Main shipments table with columns:
  - **№**
  - **Заказ**
  - **Артикул изделия**
  - **Наименование изделия**
  - **Потребность по заказам покупателя**
  - **Кол-во дней**
  - **Осталось дней**
  - **Основание**
  - **Покупатель**
  - **Уровень комплектации**
  - **Статус**
  - planned/factual shipment dates and labor-time columns

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **Задачи на отгрузку**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check date range controls. | Start and end date controls are visible and open without breaking the page. | Not run |  |
| 3 | Check active filters. | Status and buyer filter chips are visible, including **Статус: Заказано** and **Покупатели: Все** or current equivalents. | Not run |  |
| 4 | Check reset button. | **Сбросить** is visible; it is disabled until filters change. | Not run |  |
| 5 | Check action buttons before row selection. | **Создать заказ** and **Печать** are enabled; **Редактировать** and **Архив** are disabled before row selection. | Not run |  |
| 6 | Check shipments table. | Table is visible with rows or a clear empty state. | Not run |  |
| 7 | Check required headers. | Headers include order, article, name, quantity, days, buyer, completion level, status, planned dates, and labor-time columns. | Not run |  |
| 8 | Search by order number. | Search filters matching rows or shows a clear empty state. | Not run |  |
| 9 | Search by article or product name. | Search filters matching rows or shows a clear empty state. | Not run |  |
| 10 | Clear search. | Shipment rows return for the active filters/date range. | Not run |  |
| 11 | Check row data quality. | Order number, article, product name, quantity, buyer, status, and dates are readable. | Not run |  |
| 12 | Check day counters. | **Кол-во дней** and **Осталось дней** values are numeric and visually understandable, including overdue negative values. | Not run |  |
| 13 | Check completion level. | **Уровень комплектации** values display as percentages. | Not run |  |
| 14 | Check date columns. | Planned warehouse readiness, planned shipment, and factual shipment date columns are visible and formatted consistently. | Not run |  |
| 15 | Check labor-time columns. | МО, assembly, and total labor time values are readable and do not show `NaN`, `undefined`, or blank broken values. | Not run |  |
| 16 | Select a shipment row. | **Редактировать** and **Архив** become enabled. | Not run |  |
| 17 | Click **Печать** only if safe. | Print action opens or starts expected print flow without blocking the page. | Not run |  |
| 18 | Check **Создать заказ**. | Button is visible and enabled. Do not save a new order during this weekly check. | Not run |  |
| 19 | Use history action where visible. | History opens or shows a clear empty state without blocking the table. | Not run |  |
| 20 | Refresh the page. | Filters, search, action buttons, and shipment table reload. | Not run |  |
| 21 | Check layout. | Wide table remains scrollable and readable; long buyer/product names do not hide critical columns. | Not run |  |

## Values To Record Each Week

| Date | Environment | Active Status | Buyer Filter | Row Count | Oldest Overdue Days | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  | Stage | Заказано | Все |  |  |  |

## Pass Criteria

- Shipping tasks page loads successfully.
- Date range, filters, search, and action buttons are visible.
- Shipment table columns and row values are readable.
- Search works and can be cleared.
- Row selection enables edit/archive actions.
- No stuck loaders, blocked overlays, or visible technical errors remain.
