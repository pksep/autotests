# Weekly Check: Sheet Cutting

## Scope

Page: **Резка листа**

Route: `/sclad/cuttinglist`

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
- **Изображение**
- **Обозначение**
- **Наименование**
- **Заказано на производстве**
- **Параметры заготовки**
- **Заготовка**
- **Операции**
- **Статус**
- **Сделано, шт**
- **Осталось, шт**
- **Исполнитель**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Search by designation, name, and blank. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Check create-mark buttons. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Verify status, done, remaining, norm time, performer, and next operation columns. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Open column/export/request controls without saving. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
