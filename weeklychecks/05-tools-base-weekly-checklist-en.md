# Weekly Check: Tools And Fixtures Base

## Scope

Page: **База инструмента и оснастки**

Route: `/basetools`

This checklist covers the main content area only.

## What Is On The Page

- Category switches: **Все**, **Инструмент**, **Оснастка**, **Мерительный инструмент**
- Filters: **Фильтровать по отметке**, **Сортировать по дате создания**, **Показать мои**
- Three linked tables:
  - **Тип (Инструмента или оснастки)**
  - **Подтип**
  - **Наименование (Марка/Типоразмер)**
- Search field in each table: **Поиск по наименованию**
- Actions: **Создать**, **Создать копированием**, **Редактировать**, **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База инструмента и оснастки**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check category switches. | **Все**, **Инструмент**, **Оснастка**, and **Мерительный инструмент** are visible; **Все** is active by default. | Not run |  |
| 3 | Check filters. | Filter by mark, sort by creation date, and show-my buttons are visible; **Показать мои** may be disabled. | Not run |  |
| 4 | Check Type table. | Type table is visible with rows such as tool/fixture categories. | Not run |  |
| 5 | Check Subtype table. | Subtype table is visible with rows such as tool subtypes. | Not run |  |
| 6 | Check Item table. | Item table is visible with **Наименование (Марка/Типоразмер)** values. | Not run |  |
| 7 | Switch to **Инструмент**. | Tables refresh to instrument-related rows. | Not run |  |
| 8 | Switch to **Оснастка**. | Tables refresh to fixture-related rows. | Not run |  |
| 9 | Switch to **Мерительный инструмент**. | Tables refresh to measuring-tool rows or show a clear empty state. | Not run |  |
| 10 | Search each table by a visible value. | Matching rows remain, or a clear empty state appears. | Not run |  |
| 11 | Clear each search. | Original rows return for the active switch. | Not run |  |
| 12 | Select Type and Subtype rows. | Dependent tables remain readable; row selection does not break layout. | Not run |  |
| 13 | Select an Item row. | **Создать копированием**, **Редактировать**, and **Архив** become available when item-level selection is expected. | Not run |  |
| 14 | Click **Фильтровать по отметке**. | Tables refresh and remain usable. | Not run |  |
| 15 | Click **Сортировать по дате создания**. | Row order changes or data refreshes without errors. | Not run |  |
| 16 | Check **Создать**. | Button is visible and enabled. Do not save a new item during this weekly check. | Not run |  |
| 17 | Use history action where visible. | History opens or shows a clear empty state without blocking the page. | Not run |  |
| 18 | Refresh the page. | Page reloads with switches, tables, searches, and actions visible. | Not run |  |

## Values To Record Each Week

| Date | Environment | Active Switch | Type Sample | Subtype Sample | Item Sample | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  | Stage | Все |  |  |  |  |
|  | Stage | Инструмент |  |  |  |  |
|  | Stage | Оснастка |  |  |  |  |
|  | Stage | Мерительный инструмент |  |  |  |  |

## Pass Criteria

- Title, switches, filters, and all three tables are visible.
- Searches work in the Type, Subtype, and Item tables.
- Category switches refresh the displayed data.
- Toolbar state changes correctly for selectable rows.
- No stuck loaders, broken text, or blocked overlays remain.
