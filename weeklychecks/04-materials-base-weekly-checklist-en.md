# Weekly Check: Materials Base

## Scope

Page: **База материалов**

Route: `/basematerials`

This checklist covers the main content area of the Materials Base page and the first screen opened by **Создать**. It does not cover login, side-menu behavior, or saving a new material.

## What Is On The Page

The page contains these category switches:

- **Все**
- **Материалы для деталей**
- **Покупные детали**
- **Расходные материалы**

The page contains three linked material tables:

| Table | Required Header Examples | Search Field |
| --- | --- | --- |
| Type | **Тип (Тип профиля заготовки)** or **Тип (Категория)** | **Поиск по наименованию** |
| Subtype | **Подтип (Материал заготовки)** or **Подтип (Материал)** | **Поиск по наименованию** |
| Item | **Наименование (Марка / типоразмер)** | **Поиск по наименованию** |

The page also contains:

- **Фильтровать по отметке**
- **Сортировать по дате создания**
- **Показать мои**
- **Создать**
- **Создать копированием**
- **Редактировать**
- **Архив**

## Weekly Checklist

| Step | Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| 1 | Open **База материалов**. | The page loads with the title **База материалов** and no stuck loader. | Not run |  |
| 2 | Check the category switches. | **Все**, **Материалы для деталей**, **Покупные детали**, and **Расходные материалы** are visible. | Not run |  |
| 3 | Check the default switch. | **Все** is selected by default. | Not run |  |
| 4 | Check global filters. | **Фильтровать по отметке**, **Сортировать по дате создания**, and **Показать мои** are visible. | Not run |  |
| 5 | Check default toolbar state. | **Создать** is enabled; **Создать копированием**, **Редактировать**, and **Архив** are disabled. | Not run |  |
| 6 | Check the Type table. | The Type table is visible and contains material type rows such as `3D печать`, `Гидравлика`, or other current values. | Not run |  |
| 7 | Check the Subtype table. | The Subtype table is visible and contains subtype rows such as steel grades, fastener groups, or other current values. | Not run |  |
| 8 | Check the Item table. | The Item table is visible and contains material/item names. | Not run |  |
| 9 | Check table headers in **Все**. | Type header reads like **Тип (Тип профиля заготовки)**; Subtype header reads like **Подтип (Материал заготовки)**; Item header is **Наименование (Марка / типоразмер)**. | Not run |  |
| 10 | Switch to **Материалы для деталей**. | The switch becomes active and the three tables refresh to detail-material data. | Not run |  |
| 11 | Check **Материалы для деталей** rows. | Type rows include production material categories such as `3D печать`, `Круг`, `Лист`, or similar current categories. | Not run |  |
| 12 | Switch to **Покупные детали**. | The switch becomes active and the Type/Subtype headers change to category/material wording where applicable. | Not run |  |
| 13 | Check **Покупные детали** rows. | Type rows include purchased-part categories such as `Гидравлика`, `Метизы`, `Пневматика`, or similar current categories. | Not run |  |
| 14 | Switch to **Расходные материалы**. | The switch becomes active and the tables refresh to consumable material data. | Not run |  |
| 15 | Check **Расходные материалы** rows. | Type rows include consumable categories such as `Ветошь, полотенца`, `Жидкости, смазки`, or similar current categories. | Not run |  |
| 16 | Return to **Все**. | The switch becomes active and the full materials list returns. | Not run |  |
| 17 | Search the Type table. | Typing a visible type value into **Поиск по наименованию** filters the Type table or shows a clear empty state. | Not run |  |
| 18 | Clear the Type search. | Type rows return for the active category switch. | Not run |  |
| 19 | Search the Subtype table. | Typing a visible subtype value filters the Subtype table or shows a clear empty state. | Not run |  |
| 20 | Clear the Subtype search. | Subtype rows return for the active category switch. | Not run |  |
| 21 | Search the Item table. | Typing a visible item value filters the Item table or shows a clear empty state. | Not run |  |
| 22 | Clear the Item search. | Item rows return for the active category switch. | Not run |  |
| 23 | Select a Type row. | The row becomes active and dependent table data remains readable. Toolbar edit/archive actions remain disabled. | Not run |  |
| 24 | Select a Subtype row. | The row becomes active and the Item table updates or remains consistent with the selected subtype. Toolbar edit/archive actions remain disabled. | Not run |  |
| 25 | Select an Item row. | **Создать копированием**, **Редактировать**, and **Архив** become enabled. | Not run |  |
| 26 | Use the history action where visible. | Request history opens or shows a clear empty state without blocking the page. | Not run |  |
| 27 | Click **Фильтровать по отметке**. | Tables refresh and remain usable. | Not run |  |
| 28 | Click **Сортировать по дате создания**. | Table ordering changes and data remains readable. | Not run |  |
| 29 | Click **Создать**. | Browser opens `/basematerials/add` and shows **Создание материала**. | Not run |  |
| 30 | Check the creation page first screen. | The page shows **Наименование**, **Выбор типа и подтипа**, **Параметры**, **Поставщики**, **Описание / Примечание**, **Медиа файлы**, **Отменить**, and **Сохранить**. | Not run |  |
| 31 | Return to **База материалов** without saving. | The original materials page returns with the category switches and three tables visible. | Not run |  |
| 32 | Refresh the page. | The page reloads and remains on **База материалов** with usable tables and filters. | Not run |  |
| 33 | Check layout. | Three tables are readable; long item names do not overlap headers, searches, or action buttons. | Not run |  |

## Values To Record Each Week

| Date | Environment | Active Switch | Type Sample | Subtype Sample | Item Sample | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  | Stage | Все |  |  |  |  |
|  | Stage | Материалы для деталей |  |  |  |  |
|  | Stage | Покупные детали |  |  |  |  |
|  | Stage | Расходные материалы |  |  |  |  |

## Pass Criteria

- **База материалов** loads successfully.
- All four category switches are visible and usable.
- Type, Subtype, and Item tables are visible and refresh when switches change.
- Search works independently in all three tables and can be cleared.
- Toolbar actions stay disabled for Type/Subtype selection and become enabled for Item selection.
- **Создать** opens the **Создание материала** page.
- No stuck loaders, blocked overlays, broken text, or visible technical errors remain on the page.
