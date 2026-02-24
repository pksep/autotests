# U005 Test Suite: Detail Creation & UI Validation

## Executive Summary
The `U005` test suite provides an exhaustive, deep-dive validation of the **Detail Creation (Создание детали)** page within the ERP system's Parts Database. Unlike E2E workflow tests, this suite serves as a rigorous UI/UX regression checkpoint. It ensures that every single interactive element, validation rule, and modal window on the Detail Creation page functions exactly as designed to prevent user-error and UI degradation.

## Scope and Coverage
The suite is structured into two massive, highly granular test cases that systematically dissect the page component by component.

### 1. Initial UI & State Validation (Test Case 01)
*   **Purpose:** Ensures the page loads correctly and all static/dynamic components are in their expected default states before any user interaction occurs.
*   **Coverage:**
    *   **Layout Verification:** Validates the presence and correctness of all page titles, headers, and structural div containers.
    *   **Tables & Grids:** Confirms that the main data tables (e.g., product lists, characteristic blanks) render correctly with the expected default column layout and no phantom data.
    *   **Filters & Controls:** Iterates through every configured filter and button (e.g., Create, Edit, Copy) to verify they are visible, properly labeled, and in the correct enabled/disabled state according to the business rules.
    *   **Input Fields:** Verifies all form input fields are writable and lack unexpected default values.

### 2. Deep Component Interaction & Modals (Test Case 02)
*   **Purpose:** Simulates a user actively filling out a complex "Detail" record, heavily testing the interactive modal windows and file handling.
*   **Coverage:**
    *   **Data Entry:** Fills out basic information (Name, Designation) and verifies input retention.
    *   **Material Assignment Modal:** Opens the "Add Material" modal. Validates the complex multi-table structure within the modal (Categories, Sub-types, Specific Items).
    *   **Search Functionality:** Extensively tests the independent search bars above *each* table within the material modal, ensuring users can quickly filter down to specific raw materials (e.g., "09Г2С (Сталь)").
    *   **Drag-and-Drop File Upload:** Simulates uploading multiple technical documents/images (e.g., `.jpg`, `.png`) via drag-and-drop. Validates that the UI recognizes the correct number of uploaded files and strips extensions where required.
    *   **File Metadata:** Interacts with the uploaded file sections, asserting that users can add descriptions to text areas, set versions, and toggle "Main" (Главный) file checkboxes.
    *   **Dialog Lifecycles:** Tests the opening, validation, and cancellation of the "Archive" and "Add from Base" dialogs.

> [!WARNING]
> **Current Testing Limitation:** While `U005` rigorously tests the UI mechanisms for uploading and mapping files to a Part prior to saving, it ends immediately upon clicking "Save". It currently **does not** perform a post-save verification (i.e., reloading the saved Part from the database to assert that the file attachments physically persisted and are retrievable).

## Business Value
By running the `U005` suite, the business ensures:
1. **Flawless Data Entry Experience:** The "Create Detail" process is one of the most frequently used and critical actions for engineers. This suite guarantees a frictionless, bug-free UI, improving engineering velocity.
2. **Preventing Silenced UI Bugs:** Often, UI updates break small elements like a specific filter or search bar without erroring the backend. This test catches visual and frontend state regressions immediately.
3. **Document Management Integrity:** Ensures that crucial manufacturing blueprints and files can be reliably attached to parts, avoiding scenarios where a part hits the shop floor without its accompanying documentation.
