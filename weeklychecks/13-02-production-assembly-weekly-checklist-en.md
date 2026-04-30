# Weekly Check: Production Assembly

## Scope

Page: **Сборка**

Route: `/production/assembly`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Сборка по операциям**
- **Фильтр по заказу**
- **Тип: Все**
- **Готовность к сборке: Все**
- **Исполнители: Все**
- **Выбрать объект**
- **Сбросить**
- **Столбцы для печати**
- **Экспорт в EXCEL**
- **Архив**

Required table/header content:

- **№**
- **Изображение**
- **Тип**
- **Обозначение**
- **Наименование**
- **Заказано на производстве**
- **Начало работ**
- **Требуемое время готовности**
- **Расчётная дата изготовления**
- **Дата плановой отгрузки**
- **Операции**
- **Готовность в %**
- **Готово к комплектации**
- **Время на сборку, ч/мин**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Verify type, readiness, performer, order, and object filters. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Search by designation/name and clear the search. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check assembly dates, ordered quantities, readiness percent, and complectation readiness. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Open assembly-by-operations and confirm the view is readable. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
