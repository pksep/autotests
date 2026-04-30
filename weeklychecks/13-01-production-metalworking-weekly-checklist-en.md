# Weekly Check: Production Metalworking

## Scope

Page: **Металлообработка**

Route: `/production/metalloworking`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Детали по операциям**
- **Фильтр по заказу**
- **Исполнитель: Все**
- **Выбрать объект**
- **Сбросить**
- **Столбцы для печати**
- **Экспорт в EXCEL**
- **Архив**

Required table/header content:

- **№**
- **Изображение**
- **Обозначение**
- **Наименование**
- **Требуемое время готовности**
- **Расчётная дата изготовления**
- **Заказано по ПЗ**
- **Заказано на производстве**
- **Дата плановой отгрузки**
- **Параметры заготовки**
- **Материал**
- **Операции**
- **Готовность в %**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Verify filters, search, and object selection controls. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Search by visible designation/name and clear the search. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check operations, readiness percent, planned dates, material, and blank parameters. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Open columns-for-print and confirm export/archive enabled states. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
