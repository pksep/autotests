# Weekly Work Results Page Checklist

## Page Under Test

Page: **Результаты работы** / **Work Results**

Route: `/resultworks`

The page contains:

- Page title: **Результаты работы**
- Date range controls
- Employee filter: **Сотрудники**
- Operation type filter: **Тип операции**
- Reset button: **Сбросить**
- Results table with completed work records
- Search input: **Поиск по детали, сборке и изделию**
- Row action/popover for viewing request history
- Total row: **Итого**
- Print button: **Печать**

## Purpose

Run this check once a week to confirm that work-result records are visible, filterable, searchable, and printable, and that totals/time values look sane.

## Weekly Checklist

| Area | What To Check | Expected Result | Result | Notes |
| --- | --- | --- | --- | --- |
| Page load | Open **Результаты работы**. | The page loads without a blank screen or permanent loader. | Not run |  |
| Page title | Check the main heading. | **Результаты работы** is visible. | Not run |  |
| Date range | Check the start and end date controls. | Both dates are visible and default to the expected current period. | Not run |  |
| Start date picker | Open the start date picker. | Calendar opens and can be closed without breaking the page. | Not run |  |
| End date picker | Open the end date picker. | Calendar opens and can be closed without breaking the page. | Not run |  |
| Employee filter | Open **Сотрудники**. | Employee selector opens and shows available choices or a clear empty/loading state. | Not run |  |
| Operation filter | Open **Тип операции**. | Operation selector opens and includes operation names such as metalworking, assembly, packaging, repair, and testing operations. | Not run |  |
| Apply operation filter | Select one operation type if safe to do so. | Table updates to matching records or shows a clear empty state. | Not run |  |
| Reset filters | Click **Сбросить** after changing filters. | Filters return to default values and table refreshes. | Not run |  |
| Results table | Check the main table. | Table is visible and has headers and rows, or a clear empty state. | Not run |  |
| Required columns | Check table headers. | Headers include: №, Табельный номер, Сотрудник, Дата, Операция, Сущность, Тип, Обозначение, Наименование, Кол-во, time columns, and Всего н-ч/мин. | Not run |  |
| Search field | Use **Поиск по детали, сборке и изделию** with a visible row value. | Search filters the table to matching records. | Not run |  |
| Clear search | Clear the search input. | Full result set returns for the selected filters/date range. | Not run |  |
| Row data quality | Scan several rows. | Employee, date, operation, entity type, name/designation, quantity, and time values are readable. | Not run |  |
| Date values | Check row dates. | Row dates match the selected date range. | Not run |  |
| Quantity values | Check **Кол-во** values. | Quantities are numeric and reasonable for the record. | Not run |  |
| Time values | Check time cells such as `0.17 / 10` and `0.2 / 12`. | Time values are formatted consistently and do not show `NaN`, `undefined`, or blank broken values. | Not run |  |
| Total row | Check **Итого**. | Total row is visible and totals match the displayed table/filter state. | Not run |  |
| Row action/history | Open the row action/popover for a result row. | The row action opens without blocking the page; request history option is visible if available. | Not run |  |
| Print button | Check **Печать**. | Button is visible and enabled when printing is expected. | Not run |  |
| Layout | Review horizontal table layout. | Columns are readable; scrolling does not hide critical information. | Not run |  |
| Refresh behavior | Refresh the page. | Filters/table reload without requiring a new login. | Not run |  |
| Visual errors | Scan the page. | No broken icons, clipped filter badges, overlapping text, or raw technical errors. | Not run |  |

## Weekly Values To Record

| Date | Environment | Date Range | Employee Filter | Operation Filter | Row Count | Total Time | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | Stage |  | Все | Все |  |  |  |

## Pass Criteria

- The **Результаты работы** page loads.
- Date, employee, and operation filters are visible and usable.
- The results table loads with required headers.
- Search works and can be cleared.
- Row values and total time values are readable and correctly formatted.
- The page does not remain blocked by loaders or overlays.
- Print button is visible.

