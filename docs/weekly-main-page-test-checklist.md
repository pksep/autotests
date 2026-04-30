# Weekly Main Page Content Checklist

This checklist is based on the actual main page content area observed on the site.

The main page is the **План по операциям** dashboard. Its central content contains:

- A page title: **План по операциям**
- A two-option switch: **Металлообработка** and **Сборка**
- Operation cards with counts, for example:
  - **Заготовительная-резка ленточнопильная (286)**
  - **Токарный-ЧПУ (208)**
  - **Листовая резка (129)**
  - **Слесарно-сверлильная и нарезание резьбы (128)**
  - **Фрезер-ЧПУ (82)**
- Clicking an operation card opens an operation page with a heading like **Операция: Заготовительная-резка ленточнопильная** and a detailed operation table.

Use this once a week to verify the main dashboard is current and usable.

## Weekly Checklist

| Area | What To Test | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| Main page title | Open the main page and check the central content heading. | **План по операциям** is visible. | Not run |  |
| Initial dashboard load | Wait for the operation dashboard to finish loading. | The switch and operation cards appear; no permanent loader or blank content remains. | Not run |  |
| Main switch visibility | Check the two dashboard switch options. | **Металлообработка** and **Сборка** are both visible. | Not run |  |
| Default card list | Review the operation cards shown after page load. | Cards display operation names and numeric counts in parentheses. | Not run |  |
| Card count format | Check several cards. | Counts are numeric, visible, and formatted like `(286)`, not blank, `NaN`, `undefined`, or negative unless negative values are expected by business rules. | Not run |  |
| Card text quality | Scan the operation names. | Operation names are readable and not clipped, duplicated, or overlapping. | Not run |  |
| Card layout | Check the grid/wrapping of cards. | Cards are aligned and usable at normal desktop width. | Not run |  |
| Металлообработка tab | Click **Металлообработка**. | The dashboard remains usable and shows the metalworking operation cards/counts. | Not run |  |
| Сборка tab | Click **Сборка**. | The dashboard updates to the assembly-related operation cards/counts, or clearly shows an empty state if no assembly operations exist. | Not run |  |
| Tab switching stability | Switch between **Металлообработка** and **Сборка** more than once. | Cards update without duplicating, disappearing incorrectly, or leaving a loader. | Not run |  |
| Card click navigation | Click a card with a non-zero count. | An operation detail page opens for that operation. | Not run |  |
| Operation detail heading | After clicking a card, check the opened page heading. | Heading starts with **Операция:** and includes the clicked operation name. | Not run |  |
| Operation detail table | Check the table on the operation page. | Table headers are visible, including columns for item information, production quantity/status, remaining work, completion marks, executor, and dates. | Not run |  |
| Operation detail loader | Watch the operation detail page after opening. | Any **Загрузка...** loader finishes or the page presents a clear empty state. | Not run |  |
| Back navigation | Return from the operation detail page to the main page. | The **План по операциям** dashboard returns without requiring a new login. | Not run |  |
| Refresh behavior | Refresh the main page. | The dashboard reloads and cards return without a permanent loader. | Not run |  |
| Data sanity | Compare this week’s high-volume operation counts with last week’s numbers. | Large unexpected changes are investigated. | Not run |  |
| No broken values | Scan the main content area. | No visible `undefined`, `null`, `[object Object]`, broken icons, or raw technical errors. | Not run |  |
| Slow VPN behavior | Use the page normally over VPN. | Cards and detail pages still load within an acceptable weekly-test window. | Not run |  |
| Screenshot record | Take a weekly screenshot of the main dashboard. | Screenshot is saved with date and environment for future comparison. | Not run |  |

## Suggested Weekly Data To Record

Record a few card counts each week so unexpected changes are easy to spot.

| Date | Environment | Металлообработка Card | Count | Сборка Card | Count | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  | Stage | Заготовительная-резка ленточнопильная |  |  |  |  |
|  | Stage | Токарный-ЧПУ |  |  |  |  |
|  | Stage | Листовая резка |  |  |  |  |
|  | Stage | Фрезер-ЧПУ |  |  |  |  |

## Pass Criteria

- The main page title **План по операциям** is visible.
- Both switch options are visible and usable.
- Operation cards load with readable names and numeric counts.
- Clicking a non-zero operation card opens the correct operation detail page.
- Returning to the dashboard works.
- No permanent loader blocks the dashboard or operation detail page.

