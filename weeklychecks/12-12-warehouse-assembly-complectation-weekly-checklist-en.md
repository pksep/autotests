# Weekly Check: Assembly Complectation To Plan

## Scope

Page: **Комплектация сборок на план**

Route: `/sclad/completcbed`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Фильтр по заказу**
- **Выбрать объект**
- **Сбросить**
- **Все наборы**
- **Измененные наборы**

Required table/header content:

- **№**
- **Номер ПЗ**
- **Обозначение**
- **Наименование**
- **Заказано на производстве**
- **Заказано по ПЗ**
- **Начало работ**
- **Требуемое время готовности**
- **Операции**
- **Готово к комплектации**
- **Статус**
- **Дефициты**
- **Уровень готовности к комплектации**
- **Наборы**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Switch all/changed kit filters. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Search by designation/name. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check readiness, deficit, status, kit, and comment columns. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Verify PZ number and planned dates. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
