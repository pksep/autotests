# U002 Test Suite: Orders from Suppliers & Warehouse Integration

## Executive Summary
The `U002` test suite focuses on validating the **Supplier Ordering** and **Warehouse Stock Calculation** workflows within the ERP system. While the U001 suite tests the standard internal manufacturing flow, U002 specifically targets the procurement of manufactured items (Details, Sub-assemblies, and Products) from external suppliers and validates how those external orders impact internal warehouse queues.

Additionally, this suite performs rigorous UI validation across the procurement and warehouse pages to ensure all interface elements are present and functional.

## Scope and Coverage
The suite is structured to independently test UI integrity, synthesize manufacturing data, and then validate the mathematical logic of the warehouse queues when items are ordered from suppliers instead of being produced in-house.

### 1. Environment Setup & Teardown (Setup)
*   **Purpose:** Ensures test idempotency and database hygiene.
*   **Coverage:** Clears out old test data before the run begins. It cleans up Details, CBEDs (sub-assemblies), and IZDs (Products) left over from previous test executions so that all quantity assertions start from a clean slate.

### 2. UI & Interface Validation (Test Cases 01-03)
*   **Purpose:** Verifies that critical procurement and warehouse interfaces render correctly.
*   **Coverage:** Systematically checks the "Ordered from Suppliers" (Заказы поставщикам), "Metalworking Warehouse" (Склад металлообработки), and "Assembly Warehouse" (Склад сборки) pages. It validates that all expected titles, tables, switchers, buttons, and creation modals are fully visible and enabled for the user.

### 3. Engineering Data Setup (Test Cases 05-07)
*   **Purpose:** Prepares foundational components required for the procurement tests.
*   **Coverage:** Programmatically creates a raw component (Detail), a sub-assembly (CBED), and a finished Product (IZD). It attaches a distinct "Technological Process" (routing) to each item, confirming they are recognized as active entities by the ERP system.

### 4. Details: Supplier Orders & Metalworking Warehouse (Test Cases 08-11)
*   **Purpose:** Validates the procurement flow for basic components.
*   **Coverage:** 
    *   Captures the baseline ordered quantity from the Metalworking Warehouse.
    *   Creates two concurrent supplier orders for the Detail (one for 50 units, another for 5 units).
    *   Validates that the warehouse correctly aggregates the expected incoming stock (`Total ordered = 55`).
    *   Simulates a partial order cancellation by archiving the second order (5 units), and verifies the warehouse queue immediately adjusts the expected stock down to 50.
    *   Finally, archives the remaining tasks to clean the queue.

### 5. Sub-assemblies (CBEDs): Supplier Orders & Assembly Warehouse (Test Cases 13-15)
*   **Purpose:** Validates the procurement flow for complex sub-assemblies.
*   **Coverage:** Mirrors the logic from Step 4, but directs the flow to the **Assembly Warehouse**. It creates split orders (50 + 5) for the CBED, verifies the aggregated stock math of 55 in the assembly queue, archives the smaller order, verifies the remaining quantity updates to 50, and cleans up the task.

### 6. Finished Products (IZDs): Supplier Orders & Assembly Warehouse (Test Cases 16-18)
*   **Purpose:** Validates the procurement flow for top-level finished products.
*   **Coverage:** Applies the same rigorous mathematical checks (Baseline -> 50 ordered -> 5 additional ordered -> 55 total -> archive 5 -> 50 remaining -> final cleanup) to the finished Product level, ensuring consistency across all tiers of the manufacturing hierarchy.

## Business Value
By executing the `U002` suite, we ensure that:
1. **Accurate External Procurement Forecasting:** The production floors (Metalworking and Assembly) have perfect visibility into what is being manufactured internally vs. what is being procured from external suppliers.
2. **Dynamic Stock Adjustment:** If a supplier order is cancelled or archived, the warehouse queues update immediately. This prevents phantom stock expectations and costly production delays.
3. **UI Reliability:** The purchasing and warehouse teams are guaranteed a stable, fully functional interface, preventing data entry errors or workflow blocks caused by broken UI components.
