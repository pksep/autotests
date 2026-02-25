# ERP System Test Coverage Analysis & Gap Identification

Based on a comprehensive review of the ERP system map and the existing `U001-U007` test suites, this document identifies what is currently covered and the **modules slated for upcoming automation**.

## 🟩 Fully Covered Modules

These modules have robust UI automation test scripts in place.

| Module | Core Functionality | Covering Suites |
| :--- | :--- | :--- |
| **Product Database** (/baseproducts) | Creating and managing Products, Assemblies, and Details. This includes BOM structure, UI validations, and adversarial error handling. | `U001-Setup`, `U004`, `U005`, `U006` |
| **Production / Warehouse** (/production) | Launching production shortages, moving materials between warehouse and production queues. | `U001-Assembly`, `U001-Production`, `U001-Receiving` |
| **Shipment Tasks** (/issues) | End-to-end task creation for customer orders, including fulfillment routing. | `U001-Orders`, `U001-Shipment`, `U003` |
| **Actions (Audit Log)** (/actions) | Persistent tracking of user-generated events (creation, edits, archiving). | `U007-Actions` |

## 🟨 Partially Covered Modules

These modules are touched by tests but act mostly as supporting dependencies. They lack dedicated deep-dive validation tests.

| Module | Core Functionality | Current State |
| :--- | :--- | :--- |
| **Materials Database** (/basematerials) | Standard raw materials and purchased items database. | Created dynamically during `U001-Setup`, but no dedicated adversarial tests exist like `U006` does for Details. |
| **Work Results** (/resultwork) | Employee shift logs and time tracking based on completed tasks via the Online Board. | Poked briefly by `ERP-3015.spec.ts` but lacks rigorous calculation verifications (e.g. asserting logged hours mathematically match production metrics). |

## 🟦 To Do: The Auxiliary Databases

The ERP system contains several "Auxiliary Databases" that are prioritized for upcoming UI automation coverage. These modules handle inventory valuation, equipment tracking, and document retrieval.

| Module | Purpose | Proposed Action |
| :--- | :--- | :--- |
| **File Base** (/filebase) | Central repository for Technical Specs (PDF, SLDDRW, DXF). | High Priority. We need to test and confirm file attachments to Materials, Details, Assemblies, and Products, and ensure they properly sync with the global File Base. |
| **Tools and Equipment Base** (/basetools) | Tracking manufacturing tools, molds, and measuring devices (e.g., Calipers, Chucks). | Medium Priority. Needs a basic CRUD test script mimicking `U005` to ensure UI components work. |
| **Machinery Base** (/baseequipment) | Managing heavy machinery and production line assets. | Low/Medium Priority. Needs standard creation/editing tests. |
| **Inventory Base** (/inventary) | Tracking facility inventory (lifts, external vehicles). | Low Priority. Needs standard CRUD coverage. |
| **Contacts / Companies Base** (/baseprovider, /basebuyer) | CRM functionalities handling suppliers, clients, and individual contacts. | Medium Priority. Requires ensuring data properly links into Shipment Tasks (Order Shipping destinations). |

## 🟦 To Do: The Global Settings Console (/settings)

The `/settings` dashboard serves as the master configuration portal for the entire ERP system. It houses 15 different control tables. These configuration pages are the foundation for all other modules and are scheduled for automated UI test coverage soon.

| Configuration Area | Purpose | Proposed Action |
| :--- | :--- | :--- |
| **System Settings** (`/settings/savebasedata`) | Core system enumerations and global constants. | High Priority. This dictates global app state. |
| **Staff & Auth** (`/settings/employee`, `rolesuser`, `dolznuser`) | User creation, role assignment, and job titles. | High Priority. Required for RBAC (Role-Based Access Control) testing. |
| **Financial/Time Settings** (`/settings/pricehors`, `uthetwtime`) | Hourly rates and work time tracking parameters. | High Priority. Directly feeds into Work Results accuracy. |
| **Databases Configuration** (`/settings/materials/:id`, `instrosn`, `baseoborud`, `basetech`) | The administrative backend for populating Blanks, Purchased Materials, Consumables, Tools, Equipment, and Inventory. | Medium Priority. Need basic CRUD tests to ensure administrators can add/remove tracking attributes. |
| **Production Configuration** (`/settings/opertechproc`, `diffsklad`, `edizm`) | Units of measurement, routing points (Operations), and shortage calculators. | Medium Priority. |

## Next Steps

To close the most critical gaps, we recommend writing test scripts in the following order:

1.  **File Attachment Persistence (`U008-Files.spec.ts`)**: While `U005` handles the initial file upload UI, we must verify that those attachments persist post-save across Materials, Details, Assemblies, and Products. We also need to confirm they are registered correctly in the global `/filebase`.
2.  **Work Results Calculation (`U009-WorkResults.spec.ts`)**: Because Work Results deals closely with payroll/employee efficiency metrics, bugs here have real financial impact. We need strict mathematical assertions on this table.
3.  **CRM / Auxiliary Bases (`U010-AuxiliaryBases.spec.ts`)**: Bundle the creation/deletion of Tools, Equipment, and Companies into a single, efficient test suite to quickly pad out the remaining coverage.
