# Weekly Check: Completed Kits

## Scope

Page: **Скомплектованные наборы**

Route: `/sclad/complect-kit/0/null/null`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Фильтр по заказу**
- **Сборщик: Все**
- **По наборам: Все**
- **Все наборы**
- **Измененные наборы**
- **Разкомплектовать**
- **Передать на сборку**

Required table/header content:

- **№**
- **Тип**
- **Обозначение**
- **Наименование**
- **Заказано на производстве**
- **Собрано**
- **Комментарии**
- **Наборы**
- **Информация о сборке набора**
- **Осталось собрать**
- **На складе**
- **Передано на сборку**
- **Осталось передать**
- **Кол-во**
- **№ заказа**
- **№ Комплектации**
- **Сотрудник**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Filter by order, assembler, and kit state. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Search by designation/name. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check assembled, on-stock, transferred, and remaining counts. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Do not decompose or transfer kits unless using intended test data. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
