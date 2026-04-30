# Weekly Check: File Base

## Scope

Page: **База файлов**

Route: `/filebase`

This checklist covers the main content area only.

## What Is On The Page

- Switches: **Все**, **Архив**, **Без связи**, **Без типа**
- Filter area: **Фильтрация по типу**
- Search field: **Поиск по наименованию**
- File table columns:
  - **№**
  - **Тип**
  - **Наименование**
  - **Дата**
  - **Примечание**
  - request-history action
- Actions: **Редактировать**, **Присвоить**, **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База файлов**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check switches. | **Все**, **Архив**, **Без связи**, and **Без типа** are visible; **Все** is active by default. | Not run |  |
| 3 | Check file table. | Table is visible with file rows or a clear empty state. | Not run |  |
| 4 | Check headers. | Headers include **№**, **Тип**, **Наименование**, **Дата**, and **Примечание**. | Not run |  |
| 5 | Check search. | Searching by a visible filename filters the table or shows a clear empty state. | Not run |  |
| 6 | Clear search. | Full list returns for the active switch. | Not run |  |
| 7 | Switch to **Архив**. | Archived files load or a clear empty state appears. | Not run |  |
| 8 | Switch to **Без связи**. | Unlinked files load or a clear empty state appears. | Not run |  |
| 9 | Switch to **Без типа**. | Files without type load or a clear empty state appears. | Not run |  |
| 10 | Return to **Все**. | Normal file list returns. | Not run |  |
| 11 | Select a file row. | Row becomes active and row actions become available when expected. | Not run |  |
| 12 | Check **Редактировать**. | Button becomes enabled after selecting a file if editing is allowed. | Not run |  |
| 13 | Check **Присвоить**. | Button becomes enabled after selecting a file if assignment is allowed. | Not run |  |
| 14 | Check **Архив**. | Button becomes enabled after selecting a file if archive action is allowed. | Not run |  |
| 15 | Use history action where visible. | History opens or shows a clear empty state without blocking the table. | Not run |  |
| 16 | Refresh the page. | Switches, search, file table, and actions reload. | Not run |  |
| 17 | Check layout. | Long filenames and notes remain readable; table columns do not overlap. | Not run |  |

## Values To Record Each Week

| Date | Environment | Active Switch | File Sample | Date Sample | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage | Все |  |  |  |
|  | Stage | Архив |  |  |  |
|  | Stage | Без связи |  |  |  |
|  | Stage | Без типа |  |  |  |

## Pass Criteria

- The file base loads successfully.
- All four switches are visible and usable.
- Search works and can be cleared.
- File table columns and rows are readable.
- Row actions are disabled before selection and enabled after selection when expected.
