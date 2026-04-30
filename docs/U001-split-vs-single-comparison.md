# U001 split suite vs single script – comparison

Reference: working single script in `repo-at-single-U001/testcases/U001.spec.ts`.  
Target: split specs in `testcases/U001-*.spec.ts`.

## Fix applied (Case 31 – break at 31)

**Cause:** In Case 31 (Uploading Second Shipment Task), the split suite selected the row by **filtering with `searchTerm`** (first order number from Case 06). After Case 19 the first order is already shipped, so the warehouse “tasks for shipment” table usually only has the **second** order. No row contained the first order number → filter matched nothing → failure.

**Single script behavior:** It always clicks the **first row** number cell (`ROW_NUMBER_PATTERN.first()`), i.e. the only (second) task left.

**Change in split:**  
- **Step 05:** Use “click first row number cell” like the single script. Removed “find row by searchTerm and click.”  
- **Step 06:** Use plain `clickButton('Отгрузить', buttonUploading)` (no `waitForEnabled`).  
- **Step 08:** Use plain `clickButton` (removed try/catch and log).

File updated: `testcases/U001-FinalShipment.spec.ts`.

---

## Shared state (orderNumber)

- **Single:** `orderNumber` is set in Case 06 and never updated in Case 21 (Case 21 uses a local `orderNumber` for logging only). So in Case 31, `orderNumber` is still the **first** order.
- **Split:** `U001-Constants` exports a mutable object `orderNumber`; Case 06 in `U001-Orders.spec.ts` sets `orderNumber.orderNumber` and `orderNumber.orderDate`. Case 31 in `U001-FinalShipment.spec.ts` imports the same object, so it sees the first order number. That is consistent with the single script; the fix was to stop using that value to **select the row** and to click the first row instead.

---

## Case 32 – urgency date

- **Single:** Case 32 (product shortage) asserts `urgencyDateOnTable === urgencyDate` (first task date).
- **Split:** Asserts `urgencyDateOnTable === urgencyDateSecond` (second task date) for the product.

So after the second shipment, the split expects the second task’s urgency date on the product. If the single script is the source of truth, consider changing the split to expect `urgencyDate` for the product in Case 32 to match the single script; otherwise keep `urgencyDateSecond` if the product row is intended to show the second task.

---

## Missing test cases – ADDED

1. **Case 00** – Added to `U001-Setup.spec.ts` as first test (same flow as single: parts DB 0Т4 sweep + Step 08 warehouse residues).  
2. **Case 26** – Added to `U001-SecondTask.spec.ts` (Complete Set Of Product, second task).  
3. **Case 27** – Added to `U001-SecondTask.spec.ts` (Receiving Product And Check Stock, including Step 06a product kitting in new tab).  
4. **Case 37** – Enabled in `U001-Cleanup.spec.ts` and replaced with full cleanup (same as Case 00: parts DB 0Т4 sweep + Step 08 warehouse residues).

---

## Case-by-case comparison (00–37)

Systematic comparison: for each case, split should do the same steps and use the same selectors/assertions as the single script. Review and fix any differences.

| Case | Single (U001.spec.ts)           | Split file            | Status / notes |
|------|---------------------------------|------------------------|----------------|
| 00   | Cleanup before run              | U001-Setup             | Added; match single. |
| 01   | Delete Product before create    | U001-Setup             | Compare steps (clear search, Details/CBED/Product 0Т4 sweep). |
| 02   | Create Parts                    | U001-Setup             | Compare. |
| 03   | Create Cbed                     | U001-Setup             | Compare. |
| 04   | Create Product                  | U001-Setup             | Compare. |
| 05   | Deleting customer orders        | U001-Orders            | Compare. |
| 06   | Loading Task                    | U001-Orders            | Compare; must set orderNumber, descendantsCbedArray, descendantsDetailArray. |
| 07   | Checking urgency date and quantity | U001-Orders          | Compare. |
| 08   | Launch Into Production Product  | U001-Production        | Compare. |
| 09   | Launch Into Production Cbed     | U001-Production        | Compare. |
| 10   | Launch Into Production Parts     | U001-Production        | Compare. |
| 11   | Marking Parts                   | U001-Assembly          | Compare. |
| 11b  | Marking Parts Metalworking       | U001-Assembly          | Compare. |
| 12   | Complete Set Of Cbed            | U001-Assembly          | Compare. |
| 13   | Disassembly of the set          | U001-Assembly          | Compare. |
| 14   | Complete Set Of Cbed After Disassembly | U001-Assembly    | Compare. |
| 15   | Receiving Part And Check Stock  | U001-Receiving         | Compare (expect.poll for stock). |
| 16   | Receiving Cbed And Check Stock  | U001-Receiving         | Compare (expect.poll for stock). |
| 17   | Complete Set Of Product         | U001-Receiving         | Compare. |
| 18   | Receiving Product And Check Stock | U001-Receiving       | Compare. |
| 19   | Uploading Shipment Task         | U001-Shipment          | Compare. |
| 20   | Checking number of shipped entities | U001-Shipment      | Compare. |
| 21   | Loading The Second Task         | U001-SecondTask        | Compare; single does not update orderNumber. |
| 22   | Marking Parts                   | U001-SecondTask        | Compare. |
| 23   | Checking new date by urgency    | U001-SecondTask        | Compare. |
| 24   | Receiving Part And Check Stock  | U001-SecondTask        | Compare. |
| 25   | Receiving Cbed And Check Stock  | U001-SecondTask        | Compare. |
| 26   | Complete Set Of Product         | U001-SecondTask        | Added; match single. |
| 27   | Receiving Product And Check Stock | U001-SecondTask      | Added; match single (incl. Step 06a). |
| 28   | Launch Into Production Product  | U001-SecondProduction  | Compare. |
| 29   | Launch Into Production Cbed     | U001-SecondProduction  | Compare. |
| 30   | Launch Into Production Parts    | U001-SecondProduction  | Compare. |
| 31   | Uploading Second Shipment Task  | U001-FinalShipment     | Fixed (first row click). |
| 32   | Checking new date by urgency    | U001-FinalShipment     | Aligned: split now uses urgencyDate for product, CBED, and details (single is source of truth). |
| 33   | Archive Metalworking Warehouse Task All | U001-Archive     | Compare (minRows, timeout). |
| 34   | Archive Assembly Warehouse Task All | U001-Archive      | Compare (minRows: 1, timeout 30s in single). |
| 35   | Moving Task For Shipment To The Archive | U001-Archive    | Compare. |
| 36   | Cleaning up warehouse residues | U001-Cleanup           | Compare. |
| 37   | Delete Product after test       | U001-Cleanup           | Enabled; full cleanup as single. |

**Next:** Go through each row marked “Compare” and align split steps/selectors/assertions with the single script. Single file is the source of truth. Case 32 aligned (urgencyDate for product, CBED, details).
