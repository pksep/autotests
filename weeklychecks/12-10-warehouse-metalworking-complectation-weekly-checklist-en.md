# Weekly Check: Metalworking Complectation

## Scope

Page: **Комплектация металлообработки**

Route: `/sclad/complectmetall`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Фильтр по заказу**
- **Статус: Все**
- **Выбрать объект**
- **Сбросить**
- **Столбцы для печати**
- **Экспорт в EXCEL**
- **Сформировать заявку**

Required table/header content:

- **№**
- **Создать отметку**
- **Обозначение**
- **Наименование**
- **Заказано на производстве**
- **Заготовка**
- **Операции**
- **Предыдущая операция**
- **Статус**
- **Сделано, шт**
- **Осталось, шт**
- **Дата исполнения**
- **Исполнитель**
- **Следущая операция**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Search by designation/name/blank. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Check queue and in-progress statuses. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Verify previous/next operation and performer data. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Check create-mark/request actions without submitting. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
