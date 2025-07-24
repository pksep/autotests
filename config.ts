/**
 * @file config.ts
 * @date 2025-01-20
 * @purpose To define environment variables (ENV) and CSS selectors (SELECTORS) used throughout the test framework.
 *
 * @alterations
 * - 2025-01-20: Initial version for handling environment configuration and CSS selectors.
 * - 2025-01-20: Updated DEBUG parsing and added fallback for TIMEOUT value.
 *  Module requirements:
 *     npm install winston
 *     npm install playwright
 *     npm install winston-daily-rotate-file
 */

export const ENV = {
    BASE_URL: process.env.BASE_URL || "http://localhost:8080/",
    HEADLESS: process.env.HEADLESS === "true",
    TIMEOUT: process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 5000,
    TEST_SUITE: 'ERP_1527',
    TEST_DIR: '.',
    DEBUG: false,
};

export const SELECTORS = {
    LOGIN: {
        EMPLOYEE_NUMBER_INPUT: 'select[name="tabel"]',
        LOGIN_INPUT: 'select[name="initial"]',
        PASSWORD_INPUT: 'input[name="password"]',
        LOGIN_BUTTON: 'button[type="submit"]',
        ERROR_MESSAGE: ".alert.result.alert-danger",
    },

    MAINMENU: {
        PRODUCT: {
            URL: "product",
            TEXT_RUS: "продукция НПО Автомотив",
            TEXT_ENG: "Product",
            DATA_TESTID: "create-dataid", //changed for testing
            BREADCRUMB_SELECTOR: ".breadcrumb",
        },
        RESULTS: {
            URL: "resultwork",
            TEXT_RUS: "Результаты работы",
            TEXT_ENG: "Results",
            DATA_TESTID: "menu-results",
        },
        LIBRARY: {
            URL: "library",
            TEXT_RUS: "Библиотека",
            TEXT_ENG: "Library",
            DATA_TESTID: "menu-library",
        },
        TASKS: {
            URL: "issues",
            TEXT_RUS: "Задачи",
            TEXT_ENG: "Issues",
            DATA_TESTID: "menu-tasks",
        },
        ASSEMBLY_UNITS: {
            URL: "cbed",
            TEXT_RUS: "База сборочных единиц",
            TEXT_ENG: "Assembly Units",
            DATA_TESTID: "menu-assembly-units",
        },
        PARTS_DATABASE: {
            URL: "basedetals",
            TEXT_RUS: "База деталей",
            TEXT_ENG: "Parts",
            DATA_TESTID: "menu-parts",
        },
        MATERIALS: {
            URL: "basematerial",
            TEXT_RUS: "База материалов",
            TEXT_ENG: "Materials",
            DATA_TESTID: "menu-materials",
        },
        TOOLS: {
            URL: "basetools",
            TEXT_RUS: "База инструмента и оснастки",
            TEXT_ENG: "Tools",
            DATA_TESTID: "menu-tools",
        },
        EQUIPMENT: {
            URL: "baseequipment",
            TEXT_RUS: "База оборудования",
            TEXT_ENG: "Equipment",
            DATA_TESTID: "menu-equipment",
        },
        OPERATIONS: {
            URL: "inventary",
            TEXT_RUS: "База техники и инвентаря",
            TEXT_ENG: "Inventary",
            DATA_TESTID: "menu-operations",
        },
        SUPPLIERS: {
            URL: "baseprovider",
            TEXT_RUS: "База поставщиков",
            TEXT_ENG: "Suppliers",
            DATA_TESTID: "menu-suppliers",
        },
        BUYERS: {
            URL: "basebuyer",
            TEXT_RUS: "База покупателей",
            TEXT_ENG: "Customers",
            DATA_TESTID: "menu-buyers",
        },
        FILES: {
            URL: "filebase",
            TEXT_RUS: "База файлов",
            TEXT_ENG: "Files",
            DATA_TESTID: "menu-files",
        },
        SHIPPING_TASKS: {
            URL: "issueshipment",
            TEXT_RUS: "Задачи на отгрузку",
            TEXT_ENG: "Shipping Issues",
            DATA_TESTID: "menu-shipping-tasks",
        },
        WAREHOUSE: {
            URL: "sclad",
            TEXT_RUS: "Склад",
            TEXT_ENG: "Warehouse",
            DATA_TESTID: "MenuLeft-warehouse-read",
        },
        PRODUCTION: {
            URL: "production",
            TEXT_RUS: "Производство",
            TEXT_ENG: "Production",
            DATA_TESTID: "menu-production",
        },
        ACTIONS: {
            URL: "actions",
            TEXT_RUS: "Действия",
            TEXT_ENG: "Actions",
            DATA_TESTID: "menu-actions",
        },
        REJECT: {
            URL: "reject",
            TEXT_RUS: "Брак",
            TEXT_ENG: "Reject",
            DATA_TESTID: "menu-reject",
        },
        WASTE: {
            URL: "waste",
            TEXT_RUS: "Отходы",
            TEXT_ENG: "Waste",
            DATA_TESTID: "menu-waste",
        },
        WRITE_OFF: {
            URL: "write-off",
            TEXT_RUS: "Списание",
            TEXT_ENG: "Write Off",
            DATA_TESTID: "menu-write-off",
        },
        REPORTS: {
            URL: "reports",
            TEXT_RUS: "Отчеты",
            TEXT_ENG: "Reports",
            DATA_TESTID: "menu-reports",
        },
        COMPLAINT: {
            URL: "complaint",
            TEXT_RUS: "Рекламация",
            TEXT_ENG: "Complaint",
            DATA_TESTID: "menu-complaint",
        },
        ARCHIVE: {
            URL: "archive",
            TEXT_RUS: "Архив",
            TEXT_ENG: "Archive",
            DATA_TESTID: "menu-archive",
        },
    },
    SUBPAGES: {
        CREATEDETAIL: {
            URL: "detal/add",
            TEXT_RUS: "Создать деталь",
            TEXT_ENG: "Create Part",
            DATA_TESTID: "BaseDetals-Button-Create",
        },
        ASSEMBLY: {
            URL: "assembly",
            TEXT_RUS: "Сборка",
            TEXT_ENG: "Assembly",
            DATA_TESTID: "Assembly-Button-AssemblyByOperations",
        },
    },


};

