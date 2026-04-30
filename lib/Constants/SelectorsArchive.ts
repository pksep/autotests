/**
 * @file SelectorsArchive.ts
 * @purpose Selectors for the Archive page and its components.
 */

export const ARCHIVE_PAGE_TESTID = 'archive-page';
export const TITLE = '[data-testid="Archive-Title-Name"]';
export const ENTITY_DROPDOWN = '[data-testid="BaseFilter-Current"]';
export const ENTITY_SELECTED_BADGE_TEXT = '[data-testid="BaseFilter-Badge-BadgesText"]';
export const ENTITY_DROPDOWN_LIST = '[data-testid="BaseFilter-OptionsList"]';
export const ENTITY_OPTION_ITEM = '[data-testid^="BaseFilter-Options-"]';
export const ENTITY_OPTION = (text: string) => `[data-testid="BaseFilter-OptionsList"] [data-testid^="BaseFilter-Options-"]:has-text("${text}")`;
export const ENTITY_SEARCH_INPUT = '[data-testid="BaseFilter-Search-Dropdown-Input"]';

export const ARCHIVE_TABLE_UNITABLE = '[data-testid="UniTable-Table"]';
export const ARCHIVE_TABLE_CONTAINER = 'Archive-Content-Table';
export const ARCHIVE_TABLE_CONTAINER_SELECTOR = `[data-testid="${ARCHIVE_TABLE_CONTAINER}"]`;
export const ARCHIVE_TABLE_BODY = '[data-testid="UniTable-Table"] tbody';
export const ARCHIVE_TABLE_ROW = '[data-testid="UniTable-Table"] tbody tr';
export const ARCHIVE_TABLE_HEADER_CELL = '[data-testid="UniTable-Table"] th';
export const ARCHIVE_TABLE_DATA_CELL = '[data-testid="UniTable-Table"] tbody tr td';
export const ARCHIVE_TABLE_FIRST_ROW_DATA_CELL = '[data-testid="UniTable-Table"] tbody tr:first-child td';
export const ARCHIVE_TABLE_ROW_ACTION = '[data-testid="UniTable-Table"] tbody tr button, [data-testid="UniTable-Table"] tbody tr [role="button"]';

export const MODAL_CONTAINER = [
    '[data-testid="ModalRight-ModalContent"]',
    '[data-testid="ModalProduct-ModalContainer"]',
    '[data-testid="ModalProduct"]',
    '[data-testid="undefined-ModalHistoryAction-ModalContent"]',
    '[data-testid="ModalUser-ModalContent"]',
    '[data-testid="Modal-ModalContent"]',
    '[data-testid="ModalConfirm-ModalContent"]',
    '[data-testid="ModalTechProcess-ModalAddOperation-Modal-ModalContent"]',
].join(', ');
export const MODAL_CLOSE_BUTTON = '[data-testid="ModalRight-Button-Close"], [data-testid="ModalProduct-Button-Close"], [data-testid="Button"]';
export const MODAL_SAFE_CLOSE_BUTTON = [
    '[data-testid="ModalRight-Button-Close"]',
    '[data-testid="ModalProduct-Button-Close"]',
    'button:has-text("Закрыть")',
    'button:has-text("Close")',
    '[role="button"]:has-text("Закрыть")',
    '[role="button"]:has-text("Close")',
].join(', ');
export const MODAL_HEADING = 'h1, h2, h3, h4';
export const MODAL_BUTTON = 'button, [role="button"]';
export const MODAL_TABLE = 'table';
export const MODAL_LABEL_OR_TITLE = '[data-testid*="Label"], [data-testid*="Title"], [data-testid*="Heading"]';

export const SEARCH_CONTAINER = '[data-testid="Search-Dropdown"]';
export const SEARCH_INPUT = '[data-testid="Search-Dropdown-Input"]';
export const SEARCH_HISTORY_TOGGLE = '[data-testid="Search-Dropdown-History-ShowResult-Title"]';
export const SEARCH_HISTORY_TOGGLE_LEGACY = '[data-testid="Search-Cover-ShowHistoryParagraph"]';
export const SEARCH_HISTORY_CONTAINER = '[data-testid="Search-Cover-History"], [data-testid*="Search-Dropdown-History"]';
export const SEARCH_HISTORY_ITEM = '[data-testid="Search-Cover-HistoryParagraph"], [data-testid*="Search-Dropdown-History"]';
export const SEARCH_HISTORY_TITLE_TEXT = 'Просмотреть историю запросов';

export const BREADCRUMB_HOME = '[data-testid="BreadCrumbs-Checked0"]';
export const BREADCRUMB_ARCHIVE = '[data-testid="BreadCrumbs-Checked1"]';
export const ENTITY_FILTER_LABEL = '[data-testid="BaseFilter-Title"]';
export const COUNT_LABEL = '[data-testid="Archive-Content-Table-Count"]';

// Modal: Short Information Buttons & Nested Modals
export const MODAL_FULL_INFO_BUTTON = '[data-testid="ModalProduct-FullInfoButton-OpenInNewTableHandle"]';
export const MODAL_TECH_PROCESS_BUTTON = '[data-testid="ModalProduct-TechProcessButton"], [data-testid="undefined-Buttons-createTechProcessButton"]';
export const MODAL_HISTORY_BUTTON = '[data-testid="ModalProduct-HistoryButton"], [data-testid="undefined-HistoryButton"]'; // Note: Multiple buttons with this ID by text
export const MODAL_SPECIFICATION_BUTTON = '[data-testid="Specification-Buttons-openSpecification"]';

export const NESTED_MODAL_TECH_PROCESS = '[data-testid="ModalRight"]';
export const NESTED_MODAL_HISTORY = '[data-testid="ModalProduct-ModalHistoryAction"], [data-testid="undefined-ModalHistoryAction"]';
export const NESTED_MODAL_USER = '[data-testid="ModalUser"]';
export const NESTED_MODAL_EQUIPMENT = '[data-testid="ModalRight"]'; // Shares with Tech Process
export const NESTED_MODAL_SPECIFICATION = '[data-testid="Specification-ModalCbed"]';

export const MODAL_CANCEL_BUTTON = '[data-testid$="CancelButton"], [data-testid="Button"], button:has-text("Отменить"), button:has-text("Закрыть")';
export const MODAL_SAFE_CANCEL_BUTTON = [
    '[data-testid$="CancelButton"]',
    'button:has-text("Отменить")',
    'button:has-text("Cancel")',
    '[role="button"]:has-text("Отменить")',
    '[role="button"]:has-text("Cancel")',
].join(', ');
