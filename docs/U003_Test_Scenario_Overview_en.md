# U003 Test Suite: Shipment Tasks Management

## Executive Summary
The `U003` test suite systematically validates the **Shipment Tasks (Задачи на отгрузку)** workflows within the ERP system. It ensures that the sales and logistics departments can effectively create, manage, and modify customer orders, and that those modifications correctly propagate to downstream production and warehouse systems (e.g., Shortage/Deficit queues).

This suite is critical for verifying the resilience of the order management interface, particularly focusing on edge cases involving order expansion, reduction, and cancellation.

## Scope and Coverage
The suite covers the entire lifecycle of a Shipment Task, from generating the initial master data to creating the order, applying complex modifications, and finally archiving the task.

### 1. Master Data Setup & Hygiene (Test Cases 0-1)
*   **Purpose:** Ensures a pristine testing environment and prepares required test entities.
*   **Coverage:** 
    *   Initiates a thorough cleanup of the database, archiving any active shipment tasks and test products left over from previous runs.
    *   Programmatically creates specialized master data: Three unique Test Products (IZD) with specific names, article numbers, and designations. These items act as the targets for the subsequent shipment tasks.

### 2. Order Creation & UI Validation (Test Cases 2-3)
*   **Purpose:** Validates the core "Create Shipment Task" user flow.
*   **Coverage:** 
    *   Navigates through the UI to create a primary order for the first Test Product.
    *   Validates interaction with complex modal windows (e.g., product selection, buyer selection, and calendar date-pickers for urgency/shipment dates).
    *   Extracts dynamically generated Order Numbers and fully compares the values populated in the creation form against the saved details in the "Order View" mode to ensure perfect data retention.

### 3. Order Expansion: Adding Products (Test Case 4)
*   **Purpose:** Tests the system's ability to handle multi-line orders.
*   **Coverage:** Opens the previously created Shipment Task and adds two completely new products (Test Product 2 and Test Product 3) to the same existing order. Verifies that the UI correctly updates to display all three distinct products under a single Shipment Task number.

### 4. Quantity Adjustments & Deficit Tracking (Test Cases 5-9)
*   **Purpose:** Validates mathematical logic and the critical integration between Sales (Shipment Tasks) and Production Planning (Deficit/Shortages).
*   **Coverage:** 
    *   **Increase:** Significantly increases the ordered quantity of the items.
    *   **Decrease:** Reduces the ordered quantity.
    *   **Deficit Integration:** Crucially, during the decrease operation, the test specifically navigates to the "Deficit" (Shortage) monitoring pages. It verifies that when the sales quantity is reduced, the corresponding production deficit immediately shrinks, ensuring the shop floor does not blindly overproduce cancelled stock.
    *   **Boundary Checking:** Pushes the quantity logic to its limit by forcing an order modification down to a quantity of exactly '1' and validating the system accepts and propagates this change.

### 5. Warehouse Revisions & End-of-Life (Test Cases 10-13)
*   **Purpose:** Validates the conclusion of an order lifecycle and inventory resets.
*   **Coverage:**
    *   Resets related warehouse inventory revisions to '0'.
    *   Executes the deletion/archival of the active Shipment Task, ensuring it is properly removed from active operational views.
    *   Finalizes the suite by deleting all Test Products created in Step 1, validating the successful teardown of the test environment. 

## Business Value
By running the `U003` suite, the business ensures:
1. **Order Agility:** Sales teams can dynamically modify (expand or shrink) customer orders post-creation without breaking the system or requiring manual developer intervention.
2. **Production Synergy:** The critical link between "What was sold" and "What needs to be produced" (The Deficit queue) is mathematically sound. If a customer reduces an order, production sees the updated requirement instantly, saving raw material and labor costs.
3. **Data Integrity:** What a user inputs during order creation perfectly matches what is saved in the database and displayed on subsequent pages, preventing costly fulfillment errors.
