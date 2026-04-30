# Weekly Check: Warehouse Assembly Orders

## Scope

Page: **Заказ склада на сборку**

Route: `/sclad/assemblesclad`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Сборка по операциям**
- **Фильтр по заказу**
- **Тип: Все**
- **Исполнители: Все**
- **Выбрать объект**
- **Сбросить**

Required table/header content:

- **№**
- **Изображение**
- **Тип**
- **Обозначение**
- **Наименование**
- **Заказано по ПЗ**
- **Заказано на производстве**
- **Дата плановой готовности склада**
- **Дата плановой отгрузки**
- **Потребность**
- **Дефицит**
- **Кол-во**
- **Операции**
- **Готовность в %**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Search by designation/name. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Filter by type, performer, and order. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check demand, deficit, quantity, operation count, and readiness percent. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Open assembly-by-operations and return. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
