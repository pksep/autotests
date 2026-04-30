# Weekly Check: Metalworking Board For Assembly Tasks

## Scope

Page: **Онлайн табло для МО по ПЗ Сборки**

Route: `/production/board-production-mo`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Date range**
- **Сотрудники: Все**
- **Тип операции: Все**
- **Фильтр по заказу**
- **Фильтр по ПЗ**
- **Выбрать объект**
- **Сбросить**
- **Печать**

Required table/header content:

- **№**
- **Номер ПЗ сборки**
- **Дата выполнения ПЗ**
- **Обозначение**
- **Наименование**
- **Начало работ по ПЗ сборки**
- **Требуемое время готовности**
- **Расчетная дата изготовления**
- **Дефицит по ПЗ**
- **Заказано по ПЗ МО**
- **Заказано на производстве**
- **Операции**
- **Оставшиеся**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Filter by assembly PZ and verify MO deficit rows stay linked. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Check readiness and calculated manufacturing dates. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Verify deficit, ordered-by-MO-PZ, and ordered-on-production values. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Search by designation/name and check print. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
