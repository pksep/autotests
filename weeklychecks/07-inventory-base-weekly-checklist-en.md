# Weekly Check: Technique And Inventory Base

## Scope

Page: **База техники и инвентаря**

Route: `/inventary`

This checklist covers the main content area only.

## What Is On The Page

- Filters: **Фильтровать по отметке**, **Сортировать по дате создания**, **Показать мои**
- Three linked tables:
  - **Тип**
  - **Подтип**
  - **Наименование (Марка/Типоразмер)**
- Search field in each table: **Поиск по наименованию**
- Actions: **Создать**, **Создать копированием**, **Редактировать**, **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База техники и инвентаря**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check filters. | Filter by mark, sort by creation date, and show-my controls are visible. | Not run |  |
| 3 | Check default toolbar state. | **Создать** is enabled; copy, edit, and archive are disabled before item selection. | Not run |  |
| 4 | Check Type table. | Table is visible with **Тип** header, rows, or a clear empty state. | Not run |  |
| 5 | Check Subtype table. | Table is visible with **Подтип** header, rows, or a clear empty state. | Not run |  |
| 6 | Check Item table. | Table is visible with **Наименование (Марка/Типоразмер)** header, rows, or a clear empty state. | Not run |  |
| 7 | Search each table. | Search by visible value filters results or shows a clear empty state. | Not run |  |
| 8 | Clear each search. | Data returns for the active view. | Not run |  |
| 9 | Select Type and Subtype rows. | Dependent data remains readable and layout stays stable. | Not run |  |
| 10 | Select an Item row if available. | Copy, edit, and archive actions become enabled when item-level selection is expected. | Not run |  |
| 11 | Click **Фильтровать по отметке**. | Tables refresh and remain usable. | Not run |  |
| 12 | Click **Сортировать по дате создания**. | Data refreshes or row order changes without errors. | Not run |  |
| 13 | Check **Создать**. | Button is visible and enabled. Do not save a new inventory item during this weekly check. | Not run |  |
| 14 | Refresh the page. | Title, filters, tables, searches, and actions reload. | Not run |  |
| 15 | Check layout. | Empty states and populated rows are readable; controls do not overlap. | Not run |  |

## Values To Record Each Week

| Date | Environment | Type Sample | Subtype Sample | Item Sample | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage |  |  |  |  |

## Pass Criteria

- The page loads successfully.
- Type, Subtype, and Item tables are visible.
- Empty states are clear if no rows are present.
- Searches and filters do not break the page.
- Toolbar actions follow row-selection state.
