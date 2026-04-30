# Weekly Check: Production Online Board

## Scope

Page: **Онлайн табло**

Route: `/production/online-board/`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Date range**
- **Сотрудники: Все**
- **Тип операции: Все**
- **Фильтр по заказу**
- **Фильтр по ПЗ**
- **Металлообработка**
- **Сборка**
- **Печать**

Required table/header content:

- **№**
- **Изображение**
- **Обозначение**
- **Наименование**
- **Требуемое время готовности**
- **Расчётная дата изготовления**
- **Дата плановой отгрузки**
- **Заказано по ПЗ**
- **Заказано на производстве**
- **Операции**
- **Время выполнения, ч/мин**
- **1 шт**
- **Все**
- **Оставшиеся**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Check both Металлообработка and Сборка tabs. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Use employee, operation, order, PZ, and date filters. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Search by designation/name and clear it. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Verify operation quantities and remaining time columns. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 5 | Refresh the page. | The title, filters, actions, and table return without a stuck loader. | Not run |  |
| 6 | Check row/data quality. | No visible `undefined`, `null`, `NaN`, broken dates, or raw technical objects are shown. | Not run |  |
| 7 | Check layout at the weekly test resolution. | Long names and wide tables remain readable; key actions are not hidden. | Not run |  |

## Values To Record Each Week

| Date | Environment | Active Filters | Row Count / Visible State | Search Tested | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage |  |  |  |  |

## Pass Criteria

- The page opens with the expected title.
- Filters, search, table headers, and main actions are visible.
- Rows are readable, or the page shows a clear empty state.
- Weekly checks can be completed without saving unintended business data.
