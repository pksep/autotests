# Weekly Check: Contacts Base

## Scope

Page: **База контактов**

Route: `/contactbase`

This checklist covers the main content area only.

## What Is On The Page

- Filter sections:
  - **По типу**
  - **По особенностям**
  - **По компании**
- Controls: **Сортировать по дате создания**, **Фильтр по отметке**, **Показать мои**, **Выбрать**
- Search field: **Поиск по ФИО**
- Contacts table columns:
  - **ФИО**
  - **Компания**
  - **E-mail**
  - **Тип**
  - **Дата создания**
  - request-history action
- Actions: **Создать**, **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База контактов**. | Page loads with the correct title and no stuck loader. | Not run |  |
| 2 | Check filter sections. | Type, feature, and company filters are visible. | Not run |  |
| 3 | Check feature controls. | Sort by date, mark filter, and show-my controls are visible; **Показать мои** may be disabled. | Not run |  |
| 4 | Check company filter. | **Выбрать** is visible for company filtering. | Not run |  |
| 5 | Check contacts table. | Table is visible with rows or a clear empty state. | Not run |  |
| 6 | Check headers. | Headers include **ФИО**, **Компания**, **E-mail**, **Тип**, and **Дата создания**. | Not run |  |
| 7 | Search by FIO. | **Поиск по ФИО** filters contacts or shows a clear empty state. | Not run |  |
| 8 | Clear search. | Contact list returns for the active filters. | Not run |  |
| 9 | Change type filter if safe. | Table updates to matching contact types or a clear empty state. | Not run |  |
| 10 | Use company filter. | Company selection opens and can be closed without blocking the page. | Not run |  |
| 11 | Click **Сортировать по дате создания**. | Row order changes or data refreshes without errors. | Not run |  |
| 12 | Click **Фильтр по отметке**. | Table refreshes and remains usable. | Not run |  |
| 13 | Select a contact row. | Row becomes active and **Архив** becomes enabled when archive is allowed. | Not run |  |
| 14 | Check **Создать**. | Button is visible and enabled. Do not save a new contact during this weekly check. | Not run |  |
| 15 | Use history action where visible. | History opens or shows a clear empty state without blocking the table. | Not run |  |
| 16 | Refresh the page. | Filters, search, table, and actions reload. | Not run |  |
| 17 | Check layout. | Contact names, company names, email values, and dates are readable. | Not run |  |

## Values To Record Each Week

| Date | Environment | Contact Sample | Company Sample | Type Sample | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage |  |  |  |  |

## Pass Criteria

- Contacts base loads successfully.
- Filters, search, table, and actions are visible.
- Search by FIO works and can be cleared.
- Company/type filters do not block the page.
- Contact rows remain readable with no technical placeholders.
