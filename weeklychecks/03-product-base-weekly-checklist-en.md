# Weekly Check: Product Base

## Scope

Page: **База продукции**

Route: `/baseproducts`

Main content title: **База изделий, сборок и деталей**

This checklist covers only the main content area of the Product Base page. It does not cover login, navigation menu behavior, or full create/edit/archive workflows.

## What Is On The Page

During inspection, the page contained three side-by-side database tables:

| Table | Required Headers | Search Field |
| --- | --- | --- |
| **Изделие** | **Обозначение**, **Артикул**, **Наименование**, history action | **Поиск по обозначению, артикулу и наименованию** |
| **Сборочная единица (Тип СБ)** | **Обозначение**, **Наименование**, history action | **Поиск по обозначению и наименованию** |
| **Деталь (Тип Д)** | **Обозначение**, **Наименование**, history action | **Поиск по обозначению и наименованию** |

The page also contains these shared controls:

- **Фильтровать по отметке**
- **Сортировать по дате создания**
- **Показать мои**
- **Снято с производства**
- **Создать**
- **Создать копированием**
- **Редактировать**
- **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База продукции**. | The page opens on **База изделий, сборок и деталей** without a stuck loader. | Not run |  |
| 2 | Confirm the three main tables are present. | **Изделие**, **Сборочная единица (Тип СБ)**, and **Деталь (Тип Д)** are all visible in the main content area. | Not run |  |
| 3 | Check table counts. | Each table shows a **Кол-во** value and a **Без операций** value where available. Values are numeric and not blank. | Not run |  |
| 4 | Check the **Изделие** table headers. | Headers include **Обозначение**, **Артикул**, and **Наименование**. | Not run |  |
| 5 | Check the **Сборочная единица (Тип СБ)** table headers. | Headers include **Обозначение** and **Наименование**. | Not run |  |
| 6 | Check the **Деталь (Тип Д)** table headers. | Headers include **Обозначение** and **Наименование**. | Not run |  |
| 7 | Scan the first visible rows in **Изделие**. | Rows contain readable designation, article, and name values. No row shows raw technical text such as `undefined`, `null`, or `[object Object]`. | Not run |  |
| 8 | Scan the first visible rows in **Сборочная единица (Тип СБ)**. | Rows contain readable designation and name values. | Not run |  |
| 9 | Scan the first visible rows in **Деталь (Тип Д)**. | Rows contain readable designation and name values. | Not run |  |
| 10 | Search in **Изделие** using a visible designation, article, or name. | Product rows update to matching results or show a clear empty state. | Not run |  |
| 11 | Clear the **Изделие** search. | The product table returns to the unsearched result set. | Not run |  |
| 12 | Search in **Сборочная единица (Тип СБ)** using a visible designation or name. | Assembly rows update to matching results or show a clear empty state. | Not run |  |
| 13 | Clear the **Сборочная единица (Тип СБ)** search. | The assembly table returns to the unsearched result set. | Not run |  |
| 14 | Search in **Деталь (Тип Д)** using a visible designation or name. | Detail rows update to matching results or show a clear empty state. | Not run |  |
| 15 | Clear the **Деталь (Тип Д)** search. | The detail table returns to the unsearched result set. | Not run |  |
| 16 | Check toolbar state before selecting a row. | **Создать** is enabled. **Создать копированием**, **Редактировать**, and **Архив** are disabled. | Not run |  |
| 17 | Select one row in **Изделие**. | The row becomes active, and **Создать копированием**, **Редактировать**, and **Архив** become enabled. | Not run |  |
| 18 | Select one row in **Сборочная единица (Тип СБ)**. | Toolbar actions update for the selected assembly row. | Not run |  |
| 19 | Select one row in **Деталь (Тип Д)**. | Toolbar actions update for the selected detail row. | Not run |  |
| 20 | Click **Создать**. | A chooser opens with **Изделие**, **Сборочную единицу**, and **Деталь**. | Not run |  |
| 21 | Close the create chooser without selecting anything. | The chooser closes and the tables remain usable. | Not run |  |
| 22 | Click **Фильтровать по отметке**. | The table data and counts refresh. The page does not freeze or keep an overlay open. | Not run |  |
| 23 | Click **Сортировать по дате создания**. | Row order changes and the current data remains readable. | Not run |  |
| 24 | Click **Снято с производства**. | The page switches to removed-from-production records and counts update. | Not run |  |
| 25 | Return filters to the normal working view. | The three tables return to normal active product-base data. | Not run |  |
| 26 | Use the history action if visible in a table row or search/history area. | The history view opens or shows a clear empty state without blocking the page. | Not run |  |
| 27 | Refresh the browser page. | The page reloads and returns to **База изделий, сборок и деталей** with the three tables visible. | Not run |  |
| 28 | Check layout at the weekly test resolution. | Three tables are readable; long names do not overlap buttons, headers, or adjacent tables. | Not run |  |

## Values To Record Each Week

| Date | Environment | Table | Кол-во | Без операций | Search Tested | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  | Stage | Изделие |  |  |  |  |
|  | Stage | Сборочная единица (Тип СБ) |  |  |  |  |
|  | Stage | Деталь (Тип Д) |  |  |  |  |

## Pass Criteria

- **База изделий, сборок и деталей** loads successfully.
- All three tables are visible and populated, or show a clear empty state.
- Searches work independently for product, assembly, and detail tables.
- Global filters refresh the data without breaking the page.
- Toolbar buttons are disabled before row selection and enabled after row selection as expected.
- **Создать** opens the chooser for **Изделие**, **Сборочную единицу**, and **Деталь**.
