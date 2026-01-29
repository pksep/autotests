// Users Page selectors
// Keep selectors centralized here (Rule 1) and use descriptive UPPER_SNAKE_CASE names (Rule 2)

// Users list page
export const USERS_PAGE_CREATE_USER_BUTTON = '[data-testid="UsersPage-Content-Buttons-Button-1"]';

// New user form
export const USERS_FORM_USERNAME_INPUT = '[data-testid="UsersBlock-Block-1-Header-Head-input-Input"]';
export const USERS_FORM_SAVE_BUTTON = '[data-testid="UsersBlock-Bottom-Save"]';

// Job type dropdown (opens dropdown when clicked)
// Version number may vary (v-423 initially, v-19 after selection) - use pattern matching
export const USERS_FORM_JOB_TYPE_DROPDOWN_SELECTED_TEXT = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-dropdown-SelectedText"]';
export const USERS_FORM_JOB_TYPE_DROPDOWN_OPTIONS_LIST = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-dropdown-OptionsList"]';

// Phone input (fieldset -> input) - version number changes after job type selection
// Use pattern matching to handle dynamic version numbers (v-423 becomes v-19 after job type selection)
export const USERS_FORM_PHONE_INPUT = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-2-Input-Input"]';
export const USERS_FORM_PHONE_FIELDSET = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-2-Input"]';

// Login / Password inputs - version number changes after job type selection (v-423 -> v-19)
// Use pattern matching to handle dynamic version numbers
export const USERS_FORM_LOGIN_INPUT = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-3-input-Input"]';
export const USERS_FORM_PASSWORD_INPUT = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-6-input-Input"]';

// Department dropdown - version number changes after job type selection (v-423 -> v-19)
// Use pattern matching to handle dynamic version numbers
export const USERS_FORM_DEPARTMENT_DROPDOWN_CURRENT = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-dropdown-Current"]';
export const USERS_FORM_DEPARTMENT_DROPDOWN_OPTIONS_LIST = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-dropdown-OptionsList"]';

// Table number input (Табельный номер) - version number may change after department selection
// Use pattern matching to handle dynamic version numbers
export const USERS_FORM_TABLE_NUMBER_INPUT = '[data-testid^="StableContactInfo-v-"][data-testid$="RowInfo-2-Input-Input"]';

// Users list table and search
export const USERS_LIST_TABLE = '[data-testid="Table"]';
export const USERS_LIST_SEARCH_INPUT = '[data-testid="Search-Dropdown-Input"]';
export const USERS_LIST_ARCHIVE_BUTTON = '[data-testid="UsersPage-Content-Buttons-Button-4"]';
export const USERS_ARCHIVE_CONFIRM_MODAL = 'dialog[data-testid="ModalConfirm"][open]';
export const USERS_ARCHIVE_CONFIRM_BUTTON = '[data-testid="ModalConfirm-Content-Buttons-Yes"]';
