# Weekly Main Page Checklist

## Page Under Test

Main page content area: **Operations Plan** dashboard.

Route: `/`

The main page contains:

- Page title: **План по операциям**
- Two dashboard tabs:
  - **Металлообработка**
  - **Сборка**
- Operation cards with counts, such as:
  - **Заготовительная-резка ленточнопильная (286)**
  - **Токарный-ЧПУ (208)**
  - **Листовая резка (129)**
  - **Фрезер-ЧПУ (82)**
- Operation detail pages opened by clicking an operation card.

## Purpose

Run this check once a week to confirm that the main dashboard loads correctly, shows current operation counts, supports switching between the two tabs, and opens operation details without broken loaders or layout issues.

## Weekly Checklist

| Area | What To Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| Main page load | Open the main page after login. | The central dashboard loads without a blank page or permanent loader. | Not run |  |
| Page title | Check the main content heading. | **План по операциям** is visible. | Not run |  |
| Tab visibility | Check the dashboard tabs. | Both **Металлообработка** and **Сборка** are visible. | Not run |  |
| Металлообработка tab | Click **Металлообработка**. | Metalworking operation cards load with readable names and numeric counts. | Not run |  |
| Сборка tab | Click **Сборка**. | Assembly operation cards load with readable names and numeric counts, or a clear empty state appears if there is no data. | Not run |  |
| Tab switching | Switch between **Металлообработка** and **Сборка** several times. | Cards update correctly; no duplicated cards, missing content, or stuck loader appears. | Not run |  |
| Card counts | Review several operation cards. | Counts are visible and numeric, formatted like `(286)`. | Not run |  |
| Card text | Scan operation names. | Names are readable and not clipped, overlapped, or replaced by technical values such as `undefined`, `null`, or `[object Object]`. | Not run |  |
| Card layout | Review the card grid at normal desktop size. | Cards are aligned and easy to click. | Not run |  |
| High-volume cards | Record counts for key cards. | Large unexpected changes from last week are investigated. | Not run |  |
| Card navigation | Click one operation card with a non-zero count. | The operation detail page opens. | Not run |  |
| Detail heading | Check the operation detail page heading. | Heading starts with **Операция:** and includes the clicked operation name. | Not run |  |
| Detail table | Check the operation detail table. | Table headers and rows load, or a clear empty state is shown. | Not run |  |
| Detail loader | Watch the operation detail page after opening. | Any loader disappears within an acceptable time. | Not run |  |
| Return to dashboard | Return to the main page from the detail page. | The **План по операциям** dashboard loads again without requiring a new login. | Not run |  |
| Refresh behavior | Refresh the main page. | The dashboard reloads and operation cards return. | Not run |  |
| Visual scan | Look for broken layout or broken content. | No broken icons, clipped text, overlapping cards, or visible technical errors. | Not run |  |
| VPN/slow connection behavior | Use the dashboard over the weekly test connection. | The page remains usable even if loading is slower than usual. | Not run |  |
| Screenshot record | Save a screenshot of the dashboard. | Screenshot is saved with date and environment for weekly comparison. | Not run |  |

## Weekly Counts To Record

| Date | Environment | Tab | Operation Card | Count | Notes |
| --- | --- | --- | --- | --- | --- |
|  | Stage | Металлообработка | Заготовительная-резка ленточнопильная |  |  |
|  | Stage | Металлообработка | Токарный-ЧПУ |  |  |
|  | Stage | Металлообработка | Листовая резка |  |  |
|  | Stage | Металлообработка | Фрезер-ЧПУ |  |  |
|  | Stage | Сборка |  |  |  |

## Pass Criteria

- The **План по операциям** dashboard loads.
- Both **Металлообработка** and **Сборка** tabs are visible and usable.
- Operation cards display readable names and numeric counts.
- Switching tabs updates the dashboard correctly.
- Clicking a non-zero operation card opens the correct operation detail page.
- The operation detail page is not blocked by a permanent loader.
- Returning to the main dashboard works.

