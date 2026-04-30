# Weekly Check: Warehouse

## Scope

Page: **Склад**

Route: `/sclad`

This checklist covers the main content area of this page. It does not cover login or unrelated side-menu behavior.

## What Is On The Page

Key sections and links:

- **Дефицит**: **Дефицит продукции**, **Дефицит сборочных единиц**, **Дефицит деталей**, **Дефицит материалов**
- **Заказ и приход**: **Заказаны у поставщиков**, **Заказано/в пути**, **Приход на склад от поставщиков и производства**
- **Металлообработка**: **Резка листа**, **Заказ склада на металлообработку**, **Комплектация металлообработки**, **Резка круга/профиля**
- **Сборка**: **Комплектация сборок на план**, **Скомплектованные наборы**, **Комплектация изделий на план**, **Заказ склада на сборку**
- **Остатки**: **Остатки продукции, сборок и деталей на складе**
- **Аналитика**: **Расход со склада**
- **Задачи на отгрузку**: **Задачи на отгрузку**, **Отгруженные заказы**
- **Дополнительно**: **Ревизия**, **Онлайн табло**, **Онлайн табло по ПЗ**, **Движение Изд. Сб. Д**, **Стеллажи**

Required page content:

- Section headings are visible.
- Each link opens the matching Warehouse document/page.

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open every visible warehouse link and confirm the matching page loads. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 2 | Return to Warehouse after visiting linked pages. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 3 | Check no link opens a blank page or unrelated module. | Expected result matches the page purpose; data is readable and actions do not block the page. | Not run |  |
| 4 | Refresh the page. | The title, filters, actions, and table return without a stuck loader. | Not run |  |
| 5 | Check row/data quality. | No visible `undefined`, `null`, `NaN`, broken dates, or raw technical objects are shown. | Not run |  |
| 6 | Check layout at the weekly test resolution. | Long names and wide tables remain readable; key actions are not hidden. | Not run |  |

## Values To Record Each Week

| Date | Environment | Active Filters | Row Count / Visible State | Search Tested | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage |  |  |  |  |

## Pass Criteria

- The page opens with the expected title.
- Filters, search, table headers, and main actions are visible.
- Rows are readable, or the page shows a clear empty state.
- Weekly checks can be completed without saving unintended business data.
