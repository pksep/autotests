# Weekly Check: Production

## Scope

Page: **Производство**

Route: `/production`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key controls and sections:

- **Металлообработка**
- **Сборка**
- **Производственные задания**
- **Онлайн табло**
- **Онлайн табло по пз**
- **Онлайн табло для МО по ПЗ Сборки**
- **Загрузка оборудования**
- **Пользователи по производственным заданиям**
- **Оборудование по производственным заданиям металлообработки**
- **Результаты работ**

Required table/header content:

- **№**
- **Табель**
- **ФИО**
- **Кол-во позиций**
- **Кол-во сущностей**
- **Затраченное время ч/мин**
- **Итого**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Confirm all production navigation cards open the expected module page. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Expand summary sections and verify data or empty states. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check work-results filters: Все, Сборка, Склад, Металлообработка. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Check date controls and print without changing production data. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
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
