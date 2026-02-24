# U006 Test Suite: Data Validation & Error Handling

## Executive Summary
The `U006` test suite is a rigorous, adversarial testing pipeline focused on **Data Validation and Error Handling** within the Detail Creation (Создание детали) form. Where `U005` verifies that the UI components render and interact correctly, `U006` actively attempts to break the form by submitting invalid, incomplete, or boundary-pushing data.

This suite ensures that the ERP system’s frontend and backend validation rules act as an impenetrable gatekeeper, preventing corrupt, malformed, or incomplete product data from entering the database.

## Scope and Coverage
To ensure each validation rule is tested in an isolated environment, the suite runs a sequence of 20 targeted test cases, each immediately followed by a dedicated cleanup script (TestCase 00a through 00u) to archive and purge the created/attempted test data.

### 1. Mandatory Field Enforcement
*   **Purpose:** Ensures users cannot bypass required data checks.
*   **Coverage:**
    *   **Missing Materials:** Triggers an attempted save without selecting a required base material (TestCase 02).
    *   **Empty Attributes:** Selects a material but intentionally leaves required characteristic fields blank (TestCase 02a, TestCase 14).
    *   **Empty Form:** Attempts a completely blank save operation (TestCase 20).

### 2. Input Boundary and Syntax Validation
*   **Purpose:** Ensures text and numeric inputs adhere to database schema constraints and business logic.
*   **Coverage:**
    *   **Boundary Limits:** Tests input fields at their absolute maximum/minimum configured limits (TestCase 03).
    *   **Length Violations:** Attempts to save items with excessively long names that exceed the database column size (TestCase 04).
    *   **Syntax & Typing:** Injects special characters (TestCase 05) and strictly numeric strings (TestCase 06) into standard nomenclature fields to ensure proper escaping and rejection.
    *   **Duplication Prevention:** Attempts to create a detail using an already existing Name and Designation combination, verifying that the system catches the duplicate (TestCase 13).

### 3. State and Workflow Resilience
*   **Purpose:** Simulates erratic user behavior and complex editing sessions to ensure the application state remains stable.
*   **Coverage:**
    *   **Rapid Submission:** Stress-tests the form by rapidly double-clicking/spamming the "Save" button to ensure duplicate records aren't generated before the UI locks (TestCase 15).
    *   **Navigation Abandonment:** Attempts to navigate away from the form with unsaved changes, verifying warning prompts (TestCase 16).
    *   **Session Complexity:** Performs mass addition, deletion, and editing of materials inside a single editing session before saving (TestCase 19).
    *   **Material Switching & Deletion:** Switches material categories mid-edit (TestCase 12) and deletes base materials right before clicking save (TestCase 10, TestCase 11) to check for ghost data.

### 4. End-to-End Success Verification
*   **Purpose:** Confirms that when all rules are followed, the data persists correctly.
*   **Coverage:**
    *   **Perfect Entry:** Fills all mandatory fields perfectly and saves (TestCase 08).
    *   **Post-Edit Verification:** Edits a detail and confirms the saved values populate perfectly upon reopening (TestCase 09).
    *   **Backend Validation:** Asserts that the data visually confirmed in the UI definitively matches the structural backend data (TestCase 17).

## Business Value
By running the `U006` suite, the business ensures:
1. **Pristine Database Health:** By exhaustively testing the validation boundaries, the system is protected against incomplete configurations and duplicated parts, avoiding massive supply chain headaches downhill.
2. **Predictable User Guidance:** Ensures that when engineers make a mistake (e.g., forgetting a dimension or using illegal characters), the system provides clear, immediate error feedback rather than silently failing or throwing cryptic backend crashes.
3. **Resilience to Edge Cases:** Protects the system against common human errors like double-clicking the save button or navigating away from forms prematurely.
