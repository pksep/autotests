# U004 Test Suite: BOM & Specification Management

## Executive Summary
The `U004` test suite validates the **Bill of Materials (BOM)** and **Product Specification (Комплектация/Спецификация)** engine within the ERP system. It ensures that engineers and managers can accurately construct and edit the hierarchical relationships between top-level Products (Изделия), Sub-assemblies (СБ), Details (Детали), and Raw Materials (Материалы).

This suite is highly focused on UI and logic robustness during complex data entry. It exhaustively tests the addition, modification, deletion, and constraints of child components, guaranteeing structural data integrity before items ever hit the production floor.

## Sequential Test Execution Flow
To ensure data isolation and prevent test interference, the `U004` suite is executed in a strict chronological order across 19 individual test cases. The workflow pairs major functional actions with immediate cleanups.

### Phase 1: Sub-Assembly Integration
*   **Test Case 01 (Adding a Descendant):** Edits a top-level Product (Изделие) and adds a Sub-assembly (СБ) as a descendant component.
*   **Test Case 02 (Cleanup):** Reverts the product back to its original state to ensure a clean slate for the next test.

### Phase 2: Material Assignment Workflows
*   **Test Case 03 (Individual Addition):** Adds each allowed material type to a specification individually, sequentially confirming BOM updates.
*   **Test Case 04 (Cleanup):** Reverts the individual material additions.
*   **Test Case 05 (Bulk Addition):** Adds all required material types simultaneously (at once), verifying bulk operations don't drop data.
*   **Test Case 06 (Cleanup):** Reverts the bulk material additions.

### Phase 3: Deep Hierarchies (Details and Base Materials)
*   **Test Case 07 (Editing Details):** Tests editing an existing Detail (Деталь) and verifying its "complete set" (комплектация) maps accurately.
*   **Test Case 08 (Cleanup):** Reverts the Detail edits.
*   **Test Case 09 (Editing Base Materials):** Tests editing an existing Base Material (ПД), ensuring low-level materials can be managed properly.
*   **Test Case 10 (Cleanup):** Reverts the Base Material edits.

### Phase 4: Constraint Validation & Error Recovery
*   **Test Case 11 (Pre-Save Deletion):** Adds a material but deletes it *before* saving, ensuring no phantom data hits the database.
*   **Test Case 12 (Post-Save Deletion):** Successfully removes a material that was previously saved to the database.
*   **Test Case 13 (Verify Deletion):** Validates that previously removed UI elements are completely wiped from the database.
*   **Test Case 14 (Empty Save):** Attempts to save without adding any materials (intentionally leaving a blank spec).
*   **Test Case 15 (Interruption/Reload):** Simulates a browser reload after adding details but *before* saving, verifying no incomplete data is committed.
*   **Test Case 16 (Limit Violations):** Attempts to add more materials than the system limits allow, triggering validation errors.
*   **Test Case 17 (Cleanup):** Erases any residual data from the edge-case tests.

### Phase 5: Complex Editing Sessions
*   **Test Case 18 (Multi-Action Session):** Adds, modifies, and deletes multiple distinct elements within a single active editing session, stress-testing UI state management.
*   **Test Case 19 (Final Cleanup):** Performs a final system reset, ensuring no leftover data remains for subsequent suites.

## Business Value
By running the `U004` suite, the business ensures:
1. **Engineering Accuracy:** Production cannot succeed if the BOM is wrong. These tests guarantee that whatever the engineers construct on screen is perfectly mapped in the backend.
2. **Resilient Workflows:** Engineers often make mistakes, change their minds, or experience browser crashes during drafting. The system's ability to handle complex adding, deleting, and unexpected reloads without corrupting the product database protects critical company IP.
3. **Data Constraint Enforcement:** By testing limits and empty saves, we ensure the ERP system forces users to follow compliance rules when defining product architectures.
