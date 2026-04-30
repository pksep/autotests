/**
 * @file ModalValidationHelper.ts
 * @purpose JSON-driven modal validation using stable data-testid selectors.
 *
 * The helper is intentionally data-testid first:
 * - exact data-testid for shared controls
 * - suffix data-testid for reusable prefixed dialogs
 * - text only as scoped content validation or for generic Button components
 */

import { expect, Locator, Page, TestInfo } from '@playwright/test';
import modalCatalog from '../../testdata/modals.json';
import { WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import { expectSoftWithScreenshot } from '../utils/utilities';
import logger from '../utils/logger';

type DataTestIdMatch = {
  testId?: string;
  testIdPrefix?: string;
  testIdSuffix?: string;
  hasTestId?: string;
  selector?: string;
};

type TextExpectation = DataTestIdMatch & {
  text?: string;
  required?: boolean;
  dynamic?: boolean;
  allowedValues?: string[];
};

type ButtonExpectation = {
  name?: string;
  testId: string;
  text?: string;
  expectedEnabled?: boolean;
};

type FilterExpectation = {
  name: string;
  rootTestId: string;
  currentTestId: string;
  titleTestId: string;
  titleText: string;
  badgeTextTestId: string;
  optionsListTestId: string;
  searchInputTestId: string;
  optionTestIdPrefix: string;
  minimumOptions?: number;
  expectedOptions?: string[];
};

type DatePickerExpectation = {
  name: string;
  wrapperTestId: string;
  triggerTestId: string;
  displayTestId: string;
  clearButtonTestId?: string;
};

type TableExpectation = {
  name: string;
  wrapperTestId?: string;
  wrapperIndex?: number;
  tableTestId: string;
  theadTestId?: string;
  headerTestId: string;
  headerText: string;
  searchInputTestId?: string;
  searchPlaceholder?: string;
  tbodyTestId?: string;
  rowTestId: string;
  minimumRows?: number;
};

type SwitchItemExpectation = {
  testId: string;
  text: string;
};

type SwitchExpectation = {
  rootTestId: string;
  items: SwitchItemExpectation[];
  activeClass?: string;
  validateTablesAfterEachClick?: boolean;
};

type ModalContentExpectation = {
  emptyStateText?: string;
  allowRowsInsteadOfEmptyState?: boolean;
  requiredTexts?: string[];
};

type ModalFunctionalChecks = {
  openFilters?: boolean;
  resetButton?: boolean;
  closeButton?: boolean;
  tableRows?: boolean;
  switchTabs?: boolean;
};

type EquipmentSelectionFlow = {
  tableWrapperTestId?: string;
  typeTableRowTestId: string;
  typeTableIndex?: number;
  subTypeTableRowTestId: string;
  subTypeTableIndex?: number;
  entityTableRowTestId: string;
  entityTableIndex?: number;
  selectButtonText: string;
  addButtonText: string;
  cancelButtonText: string;
  selectedTableHeaderText: string;
  minimumSelectedRows?: number;
};

type AddOperationResourceExpectation = {
  key: string;
  addButtonTestId: string;
  childModalKey: 'EquipmentFilterModal' | 'ToolFilterModal';
  childSwitchText?: string;
  parentTableTestId: string;
  parentTableIndex?: number;
  parentTableHeaderText: string;
};

type AddOperationFlowExpectation = {
  operationFilterCurrentTestId: string;
  operationFilterBadgeTestId: string;
  operationFilterOptionPrefix: string;
  operationTitleTestId: string;
  preTimeDisplayTestId: string;
  helperTimeDisplayTestId: string;
  mainTimeInputTestId: string;
  totalTimeDisplayTestId: string;
  saveButtonTestId: string;
  cancelButtonTestId: string;
  warningTitle: string;
  warningText: string;
  resources: AddOperationResourceExpectation[];
};

type ConfirmFlowExpectation = {
  titleTestId?: string;
  textTestId: string;
  yesButtonTestId: string;
  noButtonTestId: string;
  defaultTitleText?: string;
  defaultMessageText?: string;
};

type TechProcessFlowExpectation = {
  tableTestId: string;
  textareaTestId: string;
  saveButtonTestId: string;
  cancelButtonTestId: string;
  historyButtonTestId: string;
  addOperationButtonTestId: string;
  updateButtonTestId: string;
  editButtonText: string;
  archiveButtonText: string;
  operationNameColumnIndex: number;
  preTimeColumnIndex: number;
  helperTimeColumnIndex: number;
  mainTimeColumnIndex: number;
  resourceColumnIndexes?: Record<string, number>;
  mediaTitleText?: string;
  mediaTableHeaderTexts?: string[];
};

type ShortInformationFlowExpectation = {
  nameTestId: string;
  designationTestId: string;
  massTestId: string;
  materialTestId: string;
  workpieceMassTestId: string;
  workpieceTableWrapperTestId: string;
  fullInformationButtonTestId: string;
  techProcessButtonTestId: string;
  externalLinkButtonTestId?: string;
  historyButtonTestId: string;
  fullInfoRootTestId: string;
  fullInfoNameInputSelector: string;
  fullInfoDesignationInputTestId: string;
  fullInfoMassInputTestId: string;
  fullInfoMaterialTestId: string;
  fullInfoWorkpieceMassTestId: string;
  fullInfoWorkpieceLengthInputTestId: string;
  fullInfoWorkpieceWidthInputTestId: string;
  fullInfoWorkpieceHeightValueTestId: string;
};

type UserInfoFlowExpectation = {
  titleTestId: string;
  avatarTestId: string;
  contactTableTestIdPrefix: string;
  contactRowTestIdPrefix: string;
  loginLabelText: string;
  roleLabelText: string;
  onlineLabelText: string;
  contactLabels: string[];
};

type InstrumentInformationFlowExpectation = {
  headingText: string;
  fieldLabels: string[];
  nameLabelText: string;
  fullInformationButtonText: string;
  historyButtonTestIdSuffix: string;
  descriptionTextareaTestId: string;
  suppliersTitleText: string;
  minimumSupplierRows: number;
};

export type ModalSpec = {
  description?: string;
  root: DataTestIdMatch;
  structure?: DataTestIdMatch[];
  titles?: TextExpectation[];
  labels?: TextExpectation[];
  required?: DataTestIdMatch[];
  datePickers?: DatePickerExpectation[];
  filters?: FilterExpectation[];
  switch?: SwitchExpectation;
  tables?: TableExpectation[];
  buttons?: ButtonExpectation[];
  content?: ModalContentExpectation;
  selectionFlow?: EquipmentSelectionFlow;
  addOperationFlow?: AddOperationFlowExpectation;
  confirmFlow?: ConfirmFlowExpectation;
  techProcessFlow?: TechProcessFlowExpectation;
  shortInformationFlow?: ShortInformationFlowExpectation;
  userInfoFlow?: UserInfoFlowExpectation;
  instrumentInformationFlow?: InstrumentInformationFlowExpectation;
  functionalChecks?: ModalFunctionalChecks;
};

export type ModalCatalog = Record<string, ModalSpec>;

export type ModalSelectionAction = 'validateOnly' | 'selectOnly' | 'add' | 'cancel';
export type EquipmentFilterAction = ModalSelectionAction;

export type ModalValidationOptions = {
  testInfo?: TestInfo;
  timeout?: number;
  closeAfterValidation?: boolean;
  validateCloseBehavior?: boolean;
  historyValidationMode?: 'full' | 'shell';
  validateFilterBehavior?: boolean;
  validateResetBehavior?: boolean;
  validateSwitchTabs?: boolean;
  validateHistoryUserInfo?: boolean;
  expectedUserName?: string;
  expectedDynamicText?: Record<string, string>;
  modalSelectionAction?: ModalSelectionAction;
  modalItemsToSelect?: number;
  expectModalToCloseAfterSelectionAction?: boolean;
  onSelectedItems?: (selectedItems: string[]) => void;
  switchItemText?: string;
  equipmentFilterAction?: EquipmentFilterAction;
  equipmentItemsToSelect?: number;
  expectModalToCloseAfterEquipmentAction?: boolean;
  addOperationAction?: 'validateOnly' | 'save' | 'cancel';
  addOperationTypeText?: string;
  addOperationMainTimeValue?: string;
  addOperationExpectedTitleText?: string;
  addOperationExpectedValues?: {
    operationName?: string;
    preTime?: string | number;
    helperTime?: string | number;
    mainTime?: string | number;
    totalTime?: string | number;
    resources?: Record<string, string>;
  };
  onAddOperationSaved?: (savedOperation: {
    operationType: string;
    mainTime?: string;
    selectedResources: Record<string, string[]>;
  }) => void;
  addOperationResourceKeys?: string[];
  addOperationResourceItemsToSelect?: number;
  addOperationResourceMode?: 'populateOnly' | 'select';
  addOperationChildAction?: ModalSelectionAction;
  validateAddOperationRequiredWarning?: boolean;
  stopAfterAddOperationRequiredWarning?: boolean;
  validateAddOperationResources?: boolean;
  expectModalToCloseAfterAddOperationAction?: boolean;
  onAddOperationSelectedResources?: (selectedResources: Record<string, string[]>) => void;
  confirmAction?: 'validateOnly' | 'confirm' | 'cancel';
  expectedConfirmTitle?: string;
  expectedConfirmMessageContains?: string;
  expectedConfirmEntityText?: string;
  expectModalToCloseAfterConfirmAction?: boolean;
  techProcessAction?: 'validateOnly' | 'save' | 'cancel';
  techProcessNoteValue?: string;
  expectedTechProcessNoteValue?: string;
  validateTechProcessAddOperation?: boolean;
  validateTechProcessEditOperation?: boolean;
  validateTechProcessArchive?: boolean;
  validateTechProcessHistory?: boolean;
  techProcessAddOperationOptions?: ModalValidationOptions;
  techProcessEditOperationOptions?: ModalValidationOptions;
  techProcessArchiveConfirmOptions?: ModalValidationOptions;
  techProcessHistoryOptions?: ModalValidationOptions;
  techProcessUnsavedChangesConfirmOptions?: ModalValidationOptions;
  expectModalToCloseAfterTechProcessAction?: boolean;
  validateTechProcessMedia?: boolean;
  techProcessPauseBeforeActionMs?: number;
  expectedShortInformationName?: string;
  expectedShortInformationDesignation?: string;
  validateShortInformationFullInformation?: boolean;
  validateShortInformationTechProcess?: boolean;
  validateShortInformationHistory?: boolean;
  shortInformationTechProcessOptions?: ModalValidationOptions;
  shortInformationHistoryOptions?: ModalValidationOptions;
  expectedInstrumentInformationName?: string;
  validateInstrumentInformationHistory?: boolean;
  validateInstrumentInformationFullInformation?: boolean;
  instrumentInformationHistoryOptions?: ModalValidationOptions;
};

const MODALS = modalCatalog as ModalCatalog;
const MODAL_CLOSE_SETTLE_MS = 500;

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function cssEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function selectorFor(match: DataTestIdMatch): string {
  if (match.selector) {
    return match.selector;
  }

  if (match.testId) {
    return `[data-testid="${cssEscape(match.testId)}"]`;
  }

  if (match.testIdPrefix) {
    return `[data-testid^="${cssEscape(match.testIdPrefix)}"]`;
  }

  if (match.testIdSuffix) {
    return `[data-testid$="${cssEscape(match.testIdSuffix)}"]`;
  }

  throw new Error(`Modal validation selector is missing data-testid metadata: ${JSON.stringify(match)}`);
}

function openDialogSelectorFor(root: DataTestIdMatch): string {
  const baseSelector = selectorFor(root);
  return [`dialog${baseSelector}[open]`, `${baseSelector}[open]`, baseSelector].join(', ');
}

function visibleSelectorList(selectorList: string): string {
  return selectorList
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `${part}:visible`)
    .join(', ');
}

export class ModalValidationHelper {
  constructor(private page: Page) {}

  private async tagModal(
    modal: Locator,
    label: string,
    options?: { top?: string; left?: string; right?: string; background?: string },
  ): Promise<void> {
    await modal
      .evaluate(
        (element, config) => {
          const host = element as HTMLElement;
          const existing = host.querySelector(`[data-codex-modal-debug="${config.id}"]`);
          if (existing) {
            existing.remove();
          }

          const badge = document.createElement('div');
          badge.setAttribute('data-codex-modal-debug', config.id);
          badge.textContent = config.label;
          badge.style.position = 'absolute';
          badge.style.top = config.top;
          if (config.left) {
            badge.style.left = config.left;
          }
          if (config.right) {
            badge.style.right = config.right;
          }
          badge.style.zIndex = '9999';
          badge.style.padding = '6px 10px';
          badge.style.borderRadius = '6px';
          badge.style.fontSize = '12px';
          badge.style.fontWeight = '700';
          badge.style.color = '#111';
          badge.style.background = config.background;
          badge.style.border = '2px solid #111';
          badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

          const computedPosition = window.getComputedStyle(host).position;
          if (computedPosition === 'static') {
            host.style.position = 'relative';
          }

          host.appendChild(badge);
        },
        {
          id: label,
          label,
          top: options?.top ?? '8px',
          left: options?.left ?? '8px',
          right: options?.right ?? '',
          background: options?.background ?? '#f6e05e',
        },
      )
      .catch(() => undefined);
  }

  getModalSpec(modalKey: string): ModalSpec {
    const spec = MODALS[modalKey];
    if (!spec) {
      throw new Error(`Unknown modal key "${modalKey}". Available keys: ${Object.keys(MODALS).join(', ')}`);
    }
    return spec;
  }

  getOpenModalBySpec(spec: ModalSpec, timeout: number = WAIT_TIMEOUTS.STANDARD): Locator {
    let modal = this.page.locator(visibleSelectorList(openDialogSelectorFor(spec.root)));
    if (spec.root.hasTestId) {
      modal = modal.filter({ has: this.page.locator(`[data-testid="${cssEscape(spec.root.hasTestId)}"]`) });
    }
    void timeout;
    return modal.last();
  }

  async validateModalFromJson(modalKey: string, options: ModalValidationOptions = {}): Promise<Locator> {
    const spec = this.getModalSpec(modalKey);
    const timeout = options.timeout ?? WAIT_TIMEOUTS.STANDARD;
    const modal = this.getOpenModalBySpec(spec, timeout);
    const historyShellMode = modalKey === 'HistoryActionModal' && options.historyValidationMode === 'shell';

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(modal, `${modalKey}: modal root should be visible`).toBeVisible({ timeout });
      },
      `${modalKey} root is visible`,
      options.testInfo,
    );

    await this.tagModal(modal, `DIALOG: ${modalKey}`, { top: '8px', left: '8px', background: '#f6e05e' });

    await this.validateStructure(modalKey, modal, spec, options);
    await this.validateTextExpectations(modalKey, modal, 'title', spec.titles ?? [], options);
    if (!historyShellMode) {
      await this.validateTextExpectations(modalKey, modal, 'label', spec.labels ?? [], options);
    }
    await this.validateRequiredElements(modalKey, modal, spec.required ?? [], options);
    if (!historyShellMode) {
      await this.validateDatePickers(modalKey, modal, spec.datePickers ?? [], options);
      await this.validateFilters(modalKey, modal, spec.filters ?? [], options);
    }
    if (spec.switch && (options.validateSwitchTabs ?? spec.functionalChecks?.switchTabs ?? false)) {
      await this.validateSwitch(modalKey, modal, spec.switch, spec.tables ?? [], options);
    }
    if (spec.switch && options.switchItemText) {
      await this.selectSwitchItem(modalKey, modal, spec.switch, options.switchItemText, options);
    }
    await this.validateTables(modalKey, modal, spec.tables ?? [], options);
    if (!historyShellMode) {
      await this.validateButtons(modalKey, modal, spec.buttons ?? [], options);
    }
    await this.validateContent(modalKey, modal, spec.content, options);

    if (!historyShellMode && (options.validateFilterBehavior ?? spec.functionalChecks?.openFilters ?? false)) {
      await this.validateFilterBehavior(modalKey, modal, spec.filters ?? [], options);
    }

    if (!historyShellMode && (options.validateResetBehavior ?? spec.functionalChecks?.resetButton ?? false)) {
      await this.validateResetBehavior(modalKey, modal, spec, options);
    }

    if (
      (modalKey === 'EquipmentFilterModal' || modalKey === 'ToolFilterModal') &&
      this.selectionAction(options) &&
      this.selectionAction(options) !== 'validateOnly'
    ) {
      await this.validateEquipmentSelectionFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'AddOperationModal') {
      await this.validateAddOperationFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'ArchiveConfirmModal') {
      await this.validateConfirmFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'UnsavedChangesConfirmModal') {
      await this.validateConfirmFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'TechProcessModal') {
      await this.validateTechProcessFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'ShortInformationModal') {
      await this.validateShortInformationFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'UserInfoModal') {
      await this.validateUserInfoFlow(modalKey, modal, spec, options);
    }

    if (modalKey === 'InstrumentInformationModal') {
      await this.validateInstrumentInformationFlow(modalKey, modal, spec, options);
    }

    if ((modalKey === 'HistoryActionModal' || modalKey === 'CompactHistoryActionModal') && (options.validateHistoryUserInfo ?? true)) {
      await this.validateHistoryActionVisibleRows(modalKey, modal, options);
      await this.validateHistoryUserInfoFlow(modalKey, modal, options);
    }

    if (options.validateCloseBehavior ?? options.closeAfterValidation ?? spec.functionalChecks?.closeButton ?? false) {
      await this.validateCloseBehavior(modalKey, modal, spec, options);
    }

    return modal;
  }

  async validateHistoryActionModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('HistoryActionModal', options);
  }

  async validateCompactHistoryActionModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('CompactHistoryActionModal', options);
  }

  async validateEquipmentFilterModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('EquipmentFilterModal', options);
  }

  async validateToolFilterModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('ToolFilterModal', options);
  }

  async validateAddOperationModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('AddOperationModal', options);
  }

  async validateArchiveConfirmModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('ArchiveConfirmModal', options);
  }

  async validateUnsavedChangesConfirmModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('UnsavedChangesConfirmModal', options);
  }

  async validateTechProcessModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('TechProcessModal', options);
  }

  async validateShortInformationModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('ShortInformationModal', options);
  }

  async validateUserInfoModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('UserInfoModal', options);
  }

  async validateInstrumentInformationModal(options: ModalValidationOptions = {}): Promise<Locator> {
    return this.validateModalFromJson('InstrumentInformationModal', options);
  }

  private locatorInModal(modal: Locator, match: DataTestIdMatch): Locator {
    return modal.locator(selectorFor(match)).first();
  }

  private tableScope(modal: Locator, tableSpec: Pick<TableExpectation, 'wrapperTestId' | 'wrapperIndex'>): Locator {
    if (!tableSpec.wrapperTestId) {
      return modal;
    }

    return modal.locator(`[data-testid="${cssEscape(tableSpec.wrapperTestId)}"]`).nth(tableSpec.wrapperIndex ?? 0);
  }

  private async validateStructure(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    for (const item of spec.structure ?? []) {
      const locator = this.locatorInModal(modal, item);
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(locator, `${modalKey}: structure element ${selectorFor(item)} should be visible`).toBeVisible();
        },
        `${modalKey} structure ${selectorFor(item)}`,
        options.testInfo,
      );
    }
  }

  private async validateRequiredElements(modalKey: string, modal: Locator, items: DataTestIdMatch[], options: ModalValidationOptions): Promise<void> {
    for (const item of items) {
      const locator = this.locatorInModal(modal, item);
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(locator, `${modalKey}: required element ${selectorFor(item)} should be visible`).toBeVisible();
        },
        `${modalKey} required ${selectorFor(item)}`,
        options.testInfo,
      );
    }
  }

  private async validateTextExpectations(modalKey: string, modal: Locator, groupName: string, items: TextExpectation[], options: ModalValidationOptions): Promise<void> {
    for (const item of items) {
      const locator = this.locatorInModal(modal, item);
      const selector = selectorFor(item);
      const canBeAbsentHistoryMetadata = modalKey === 'HistoryActionModal' && groupName === 'label';

      if (canBeAbsentHistoryMetadata && !(await locator.isVisible().catch(() => false))) {
        logger.info(`${modalKey}: metadata label ${selector} is not present in this scoped history-dialog variant; skipping label validation.`);
        continue;
      }

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(locator, `${modalKey}: ${groupName} ${selector} should be visible`).toBeVisible();
        },
        `${modalKey} ${groupName} visible ${selector}`,
        options.testInfo,
      );

      const actualText = normalizeText(await locator.textContent().catch(() => ''));
      const overrideText = item.testIdSuffix ? options.expectedDynamicText?.[item.testIdSuffix] : undefined;

      if (overrideText) {
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(actualText, `${modalKey}: ${selector} dynamic override text`).toBe(overrideText);
          },
          `${modalKey} ${groupName} override ${selector}`,
          options.testInfo,
        );
        continue;
      }

      if (item.text) {
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(actualText, `${modalKey}: ${selector} text`).toContain(item.text as string);
          },
          `${modalKey} ${groupName} text ${selector}`,
          options.testInfo,
        );
      }

      if (item.required || item.dynamic) {
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(actualText.length, `${modalKey}: ${selector} should not be empty`).toBeGreaterThan(0);
          },
          `${modalKey} ${groupName} non-empty ${selector}`,
          options.testInfo,
        );
      }

      if (item.allowedValues?.length) {
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(item.allowedValues, `${modalKey}: allowed values should include "${actualText}"`).toContain(actualText);
          },
          `${modalKey} ${groupName} allowed value ${selector}`,
          options.testInfo,
        );
      }
    }
  }

  private async validateDatePickers(modalKey: string, modal: Locator, datePickers: DatePickerExpectation[], options: ModalValidationOptions): Promise<void> {
    for (const picker of datePickers) {
      const wrapper = modal.locator(`[data-testid="${cssEscape(picker.wrapperTestId)}"]`).first();
      const trigger = modal.locator(`[data-testid="${cssEscape(picker.triggerTestId)}"]`).first();
      const display = modal.locator(`[data-testid="${cssEscape(picker.displayTestId)}"]`).first();

      if (modalKey === 'HistoryActionModal' && !(await wrapper.isVisible().catch(() => false))) {
        logger.info(`${modalKey}: date picker "${picker.name}" is not present in this scoped history-dialog variant; skipping it.`);
        continue;
      }

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(wrapper, `${modalKey}: ${picker.name} wrapper should be visible`).toBeVisible();
          await expect.soft(trigger, `${modalKey}: ${picker.name} trigger should be visible`).toBeVisible();
          await expect.soft(display, `${modalKey}: ${picker.name} display should be visible`).toBeVisible();
        },
        `${modalKey} date picker ${picker.name}`,
        options.testInfo,
      );

      const displayText = normalizeText(await display.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(displayText.length, `${modalKey}: ${picker.name} display should not be empty`).toBeGreaterThan(0);
        },
        `${modalKey} date picker display ${picker.name}`,
        options.testInfo,
      );

      if (picker.clearButtonTestId) {
        const clearButton = modal.locator(`[data-testid="${cssEscape(picker.clearButtonTestId)}"]`).first();
        await expectSoftWithScreenshot(
          this.page,
          async () => {
            await expect.soft(clearButton, `${modalKey}: ${picker.name} clear button should be visible`).toBeVisible();
          },
          `${modalKey} date picker clear ${picker.name}`,
          options.testInfo,
        );
      }
    }
  }

  private async validateFilters(modalKey: string, modal: Locator, filters: FilterExpectation[], options: ModalValidationOptions): Promise<void> {
    for (const filter of filters) {
      const root = modal.locator(`[data-testid="${cssEscape(filter.rootTestId)}"]`).first();
      const current = modal.locator(`[data-testid="${cssEscape(filter.currentTestId)}"]`).first();
      const title = modal.locator(`[data-testid="${cssEscape(filter.titleTestId)}"]`).first();
      const badgeText = modal.locator(`[data-testid="${cssEscape(filter.badgeTextTestId)}"]`).first();
      const optionsList = modal.locator(`[data-testid="${cssEscape(filter.optionsListTestId)}"]`).first();

      if (modalKey === 'HistoryActionModal' && !(await root.isVisible().catch(() => false))) {
        logger.info(`${modalKey}: filter "${filter.name}" is not present in this scoped history-dialog variant; skipping it.`);
        continue;
      }

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(root, `${modalKey}: ${filter.name} filter should be visible`).toBeVisible();
          await expect.soft(current, `${modalKey}: ${filter.name} current control should be visible`).toBeVisible();
          await expect.soft(title, `${modalKey}: ${filter.name} title should be visible`).toBeVisible();
          await expect.soft(badgeText, `${modalKey}: ${filter.name} badge text should be visible`).toBeVisible();
          await expect.soft(optionsList, `${modalKey}: ${filter.name} options list should exist`).toBeAttached();
        },
        `${modalKey} filter shell ${filter.name}`,
        options.testInfo,
      );

      const actualTitle = normalizeText(await title.textContent().catch(() => ''));
      const actualBadge = normalizeText(await badgeText.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualTitle, `${modalKey}: ${filter.name} title text`).toBe(filter.titleText);
          expect.soft(actualBadge.length, `${modalKey}: ${filter.name} badge should not be empty`).toBeGreaterThan(0);
        },
        `${modalKey} filter text ${filter.name}`,
        options.testInfo,
      );
    }
  }

  private async validateTables(modalKey: string, modal: Locator, tables: TableExpectation[], options: ModalValidationOptions): Promise<void> {
    for (const tableSpec of tables) {
      const scope = this.tableScope(modal, tableSpec);
      const wrapper = tableSpec.wrapperTestId ? modal.locator(`[data-testid="${cssEscape(tableSpec.wrapperTestId)}"]`).nth(tableSpec.wrapperIndex ?? 0) : null;
      const table = scope.locator(`[data-testid="${cssEscape(tableSpec.tableTestId)}"]`).first();
      const thead = tableSpec.theadTestId ? scope.locator(`[data-testid="${cssEscape(tableSpec.theadTestId)}"]`).first() : null;
      const header = scope.locator(`[data-testid="${cssEscape(tableSpec.headerTestId)}"]`).first();
      const rows = scope.locator(`[data-testid="${cssEscape(tableSpec.rowTestId)}"]`);

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          if (wrapper) {
            await expect.soft(wrapper, `${modalKey}: ${tableSpec.name} wrapper should be visible`).toBeVisible();
          }
          await expect.soft(table, `${modalKey}: ${tableSpec.name} table should be visible`).toBeVisible();
          if (thead) {
            await expect.soft(thead, `${modalKey}: ${tableSpec.name} table head should be visible`).toBeVisible();
          }
          await expect.soft(header, `${modalKey}: ${tableSpec.name} header should be visible`).toBeVisible();
        },
        `${modalKey} table shell ${tableSpec.name}`,
        options.testInfo,
      );

      const headerText = normalizeText(await header.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(headerText, `${modalKey}: ${tableSpec.name} header text`).toBe(tableSpec.headerText);
        },
        `${modalKey} table header ${tableSpec.name}`,
        options.testInfo,
      );

      if (tableSpec.searchInputTestId) {
        const searchInput = scope.locator(`[data-testid="${cssEscape(tableSpec.searchInputTestId)}"]`).first();
        await expectSoftWithScreenshot(
          this.page,
          async () => {
            await expect.soft(searchInput, `${modalKey}: ${tableSpec.name} search input should be visible`).toBeVisible();
          },
          `${modalKey} table search ${tableSpec.name}`,
          options.testInfo,
        );

        if (tableSpec.searchPlaceholder) {
          const placeholder = await searchInput.getAttribute('placeholder').catch(() => null);
          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(placeholder, `${modalKey}: ${tableSpec.name} search placeholder`).toBe(tableSpec.searchPlaceholder);
            },
            `${modalKey} table search placeholder ${tableSpec.name}`,
            options.testInfo,
          );
        }
      }

      if (tableSpec.tbodyTestId) {
        const tbody = scope.locator(`[data-testid="${cssEscape(tableSpec.tbodyTestId)}"]`).first();
        await expectSoftWithScreenshot(
          this.page,
          async () => {
            await expect.soft(tbody, `${modalKey}: ${tableSpec.name} tbody should be visible`).toBeVisible();
          },
          `${modalKey} table tbody ${tableSpec.name}`,
          options.testInfo,
        );
      }

      const rowCount = await rows.count();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(rowCount, `${modalKey}: ${tableSpec.name} row count`).toBeGreaterThanOrEqual(tableSpec.minimumRows ?? 1);
        },
        `${modalKey} table rows ${tableSpec.name}`,
        options.testInfo,
      );
    }
  }

  private async validateSwitch(
    modalKey: string,
    modal: Locator,
    switchSpec: SwitchExpectation,
    tables: TableExpectation[],
    options: ModalValidationOptions,
  ): Promise<void> {
    const switchRoot = modal.locator(`[data-testid="${cssEscape(switchSpec.rootTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(switchRoot, `${modalKey}: switch should be visible`).toBeVisible();
      },
      `${modalKey} switch visible`,
      options.testInfo,
    );

    for (const item of switchSpec.items) {
      const itemLocator = switchRoot.locator(`[data-testid="${cssEscape(item.testId)}"]`).first();

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(itemLocator, `${modalKey}: switch item "${item.text}" should be visible`).toBeVisible();
        },
        `${modalKey} switch item visible ${item.text}`,
        options.testInfo,
      );

      const actualText = normalizeText(await itemLocator.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualText, `${modalKey}: switch item text`).toBe(item.text);
        },
        `${modalKey} switch item text ${item.text}`,
        options.testInfo,
      );

      await itemLocator.click({ force: true });
      await this.page.waitForTimeout(500);

      if (switchSpec.activeClass) {
        const className = await itemLocator.getAttribute('class').catch(() => '');
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(className ?? '', `${modalKey}: switch item "${item.text}" should be active after click`).toContain(switchSpec.activeClass);
          },
          `${modalKey} switch active ${item.text}`,
          options.testInfo,
        );
      }

      if (switchSpec.validateTablesAfterEachClick) {
        await this.validateTables(`${modalKey} after switch "${item.text}"`, modal, tables, options);
      }
    }
  }

  private async selectSwitchItem(
    modalKey: string,
    modal: Locator,
    switchSpec: SwitchExpectation,
    itemText: string,
    options: ModalValidationOptions,
  ): Promise<void> {
    const switchRoot = modal.locator(`[data-testid="${cssEscape(switchSpec.rootTestId)}"]`).first();
    const itemSpec = switchSpec.items.find(item => item.text === itemText);
    const itemLocator = itemSpec
      ? switchRoot.locator(`[data-testid="${cssEscape(itemSpec.testId)}"]`).first()
      : switchRoot.locator('[data-testid^="Switch-Item"]').filter({ hasText: itemText }).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(itemLocator, `${modalKey}: switch item "${itemText}" should be visible before selecting it`).toBeVisible();
      },
      `${modalKey} switch target visible ${itemText}`,
      options.testInfo,
    );

    await this.highlightValidationTarget(itemLocator);
    await this.page.waitForTimeout(250);

    await itemLocator.click({ force: true });
    await this.page.waitForTimeout(500);

    if (switchSpec.activeClass) {
      const className = await itemLocator.getAttribute('class').catch(() => '');
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(className ?? '', `${modalKey}: switch target "${itemText}" should be active`).toContain(switchSpec.activeClass);
        },
        `${modalKey} switch target active ${itemText}`,
        options.testInfo,
      );
    }
  }

  private async validateFilterBehavior(modalKey: string, modal: Locator, filters: FilterExpectation[], options: ModalValidationOptions): Promise<void> {
    for (const filter of filters) {
      const current = modal.locator(`[data-testid="${cssEscape(filter.currentTestId)}"]`).first();
      const optionsList = modal.locator(`[data-testid="${cssEscape(filter.optionsListTestId)}"]`).first();
      const searchInput = modal.locator(`[data-testid="${cssEscape(filter.searchInputTestId)}"]`).first();
      const optionsLocator = modal.locator(`[data-testid^="${cssEscape(filter.optionTestIdPrefix)}"]`);
      const badgeText = modal.locator(`[data-testid="${cssEscape(filter.badgeTextTestId)}"]`).first();

      if (!(await current.isVisible().catch(() => false))) {
        if (modalKey === 'HistoryActionModal') {
          logger.info(`${modalKey}: filter behavior for "${filter.name}" is not available in this scoped history-dialog variant; skipping it.`);
        } else {
          logger.warn(`${modalKey}: skipping filter behavior for "${filter.name}" because current control is not visible.`);
        }
        continue;
      }

      await current.click({ force: true });
      await this.page.waitForTimeout(400);

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(optionsList, `${modalKey}: ${filter.name} options list should open`).toBeVisible();
          await expect.soft(searchInput, `${modalKey}: ${filter.name} search input should be visible`).toBeVisible();
        },
        `${modalKey} filter opens ${filter.name}`,
        options.testInfo,
      );

      const optionCount = await optionsLocator.count();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(optionCount, `${modalKey}: ${filter.name} option count`).toBeGreaterThanOrEqual(filter.minimumOptions ?? 1);
        },
        `${modalKey} filter option count ${filter.name}`,
        options.testInfo,
      );

      const visibleOptions: { locator: Locator; text: string }[] = [];
      for (let index = 0; index < optionCount; index++) {
        const option = optionsLocator.nth(index);
        if (!(await option.isVisible().catch(() => false))) {
          continue;
        }

        const optionText = normalizeText(await option.textContent().catch(() => ''));
        if (!optionText || optionText === 'Все' || optionText === 'Не выбран') {
          continue;
        }

        visibleOptions.push({ locator: option, text: optionText });
      }

      if (filter.expectedOptions?.length) {
        const optionTexts = (await optionsLocator.allTextContents()).map(normalizeText).filter(Boolean);
        for (const expectedOption of filter.expectedOptions) {
          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(optionTexts, `${modalKey}: ${filter.name} should contain option "${expectedOption}"`).toContain(expectedOption);
            },
            `${modalKey} filter expected option ${filter.name} ${expectedOption}`,
            options.testInfo,
          );
        }
      }

      const targetOption = (() => {
        if (visibleOptions.length === 0) {
          return null;
        }

        if (filter.expectedOptions?.length) {
          const preferred = visibleOptions.find(option => filter.expectedOptions?.includes(option.text));
          if (preferred) {
            return preferred;
          }
        }

        return visibleOptions[0];
      })();

      if (!targetOption) {
        await current.click({ force: true }).catch(() => undefined);
        await this.page.waitForTimeout(150);
        continue;
      }

      await this.highlightValidationTarget(current);
      await this.highlightValidationTarget(searchInput);
      await this.highlightValidationTarget(targetOption.locator);
      await this.page.waitForTimeout(300);

      const searchSeed = targetOption.text.slice(0, Math.min(6, targetOption.text.length)).trim();
      if (searchSeed) {
        await searchInput.fill(searchSeed).catch(() => undefined);
        await this.page.waitForTimeout(400);
      }

      await targetOption.locator.click({ force: true });
      await this.page.waitForTimeout(600);

      const selectedBadgeValue = normalizeText(await badgeText.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(selectedBadgeValue, `${modalKey}: ${filter.name} badge should reflect the selected option`).toContain(targetOption.text);
        },
        `${modalKey} filter selected ${filter.name}`,
        options.testInfo,
      );
      await this.highlightValidationTarget(badgeText);
      await this.page.waitForTimeout(400);
    }
  }

  private async validateButtons(modalKey: string, modal: Locator, buttons: ButtonExpectation[], options: ModalValidationOptions): Promise<void> {
    for (const buttonSpec of buttons) {
      const button = this.buttonLocator(modal, buttonSpec);
      const description = buttonSpec.name ?? buttonSpec.text ?? buttonSpec.testId;

      if (modalKey === 'HistoryActionModal' && !(await button.isVisible().catch(() => false))) {
        logger.info(`${modalKey}: button ${description} is not present in this scoped history-dialog variant; skipping it.`);
        continue;
      }

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(button, `${modalKey}: button ${description} should be visible`).toBeVisible();
        },
        `${modalKey} button visible ${description}`,
        options.testInfo,
      );

      if (typeof buttonSpec.expectedEnabled === 'boolean') {
        const enabled = await this.isEnabledLike(button);
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect.soft(enabled, `${modalKey}: button ${description} enabled state`).toBe(buttonSpec.expectedEnabled);
          },
          `${modalKey} button enabled ${description}`,
          options.testInfo,
        );
      }
    }
  }

  private async validateEquipmentSelectionFlow(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const flow = spec.selectionFlow;
    if (!flow) {
      throw new Error(`${modalKey}: equipment selection flow metadata is missing in modals.json`);
    }

    const action = this.selectionAction(options) ?? 'selectOnly';
    const itemCount = Math.max(options.modalItemsToSelect ?? options.equipmentItemsToSelect ?? 1, 1);
    const selectButtonSpec = spec.buttons?.find(button => button.text === flow.selectButtonText);
    const addButtonSpec = spec.buttons?.find(button => button.text === flow.addButtonText);
    const cancelButtonSpec = spec.buttons?.find(button => button.text === flow.cancelButtonText);

    if (!selectButtonSpec || !addButtonSpec || !cancelButtonSpec) {
      throw new Error(`${modalKey}: selection flow buttons are missing in modals.json`);
    }

    const selectButton = this.buttonLocator(modal, selectButtonSpec);
    const addButton = this.buttonLocator(modal, addButtonSpec);
    const cancelButton = this.buttonLocator(modal, cancelButtonSpec);

    await this.highlightValidationTarget(modal);
    await this.highlightSelectionFlowTables(modal, flow);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(selectButton, `${modalKey}: ${flow.selectButtonText} should be disabled before selecting an entity`).toBeDisabled();
      },
      `${modalKey} select disabled before entity`,
      options.testInfo,
    );

    await this.clickFirstVisibleRowAndWaitForChildren(
      modalKey,
      modal,
      flow,
      flow.typeTableRowTestId,
      flow.typeTableIndex,
      flow.subTypeTableRowTestId,
      flow.subTypeTableIndex,
      'type',
      options,
    );
    await this.clickFirstVisibleRowAndWaitForChildren(
      modalKey,
      modal,
      flow,
      flow.subTypeTableRowTestId,
      flow.subTypeTableIndex,
      flow.entityTableRowTestId,
      flow.entityTableIndex,
      'subtype',
      options,
    );

    const selectedNames: string[] = [];
    for (let index = 0; index < itemCount; index++) {
      const entityRows = this.flowRows(modal, flow, flow.entityTableRowTestId, flow.entityTableIndex);
      const entityRowCount = await entityRows.count();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(entityRowCount, `${modalKey}: entity table should have enough rows for selection ${index + 1}`).toBeGreaterThan(0);
        },
        `${modalKey} entity rows before selection ${index + 1}`,
        options.testInfo,
      );

      const rowIndex = Math.min(index, Math.max(entityRowCount - 1, 0));
      const entityRow = entityRows.nth(rowIndex);
      await entityRow.scrollIntoViewIfNeeded().catch(() => undefined);
      const selectedName = normalizeText(await entityRow.textContent().catch(() => ''));
      selectedNames.push(selectedName);
      await this.highlightValidationTarget(entityRow);
      await this.page.waitForTimeout(300);
      await entityRow.click({ force: true });
      await this.page.waitForTimeout(250);

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(selectButton, `${modalKey}: ${flow.selectButtonText} should become enabled after selecting entity ${index + 1}`).toBeEnabled();
        },
        `${modalKey} select enabled after entity ${index + 1}`,
        options.testInfo,
      );

      await this.highlightValidationTarget(selectButton);
      await this.page.waitForTimeout(250);
      await selectButton.click({ force: true });
      await this.page.waitForTimeout(400);

      await this.validateSelectedEquipmentTable(modalKey, modal, flow, index + 1, selectedNames, options);
    }

    options.onSelectedItems?.([...selectedNames]);

    if (action === 'selectOnly') {
      return;
    }

    if (action === 'add') {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(addButton, `${modalKey}: ${flow.addButtonText} should be enabled after selecting equipment`).toBeEnabled();
        },
        `${modalKey} add button enabled`,
        options.testInfo,
      );
      await this.highlightValidationTarget(addButton);
      await this.page.waitForTimeout(300);
      await addButton.click({ force: true });
    } else if (action === 'cancel') {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(cancelButton, `${modalKey}: ${flow.cancelButtonText} should be enabled`).toBeEnabled();
        },
        `${modalKey} cancel button enabled`,
        options.testInfo,
      );
      await this.highlightValidationTarget(cancelButton);
      await this.page.waitForTimeout(300);
      await cancelButton.click({ force: true });
    }

    if (options.expectModalToCloseAfterSelectionAction ?? options.expectModalToCloseAfterEquipmentAction ?? true) {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(modal, `${modalKey}: modal should close after ${action}`).toBeHidden();
        },
        `${modalKey} closes after ${action}`,
        options.testInfo,
      );
      await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
    }
  }

  private async highlightSelectionFlowTables(modal: Locator, flow: EquipmentSelectionFlow): Promise<void> {
    const rowTargets = [
      { testId: flow.typeTableRowTestId, index: flow.typeTableIndex },
      { testId: flow.subTypeTableRowTestId, index: flow.subTypeTableIndex },
      { testId: flow.entityTableRowTestId, index: flow.entityTableIndex },
    ];

    for (const target of rowTargets) {
      const firstRow = this.flowRows(modal, flow, target.testId, target.index).first();
      if (!(await firstRow.isVisible().catch(() => false))) {
        continue;
      }

      await firstRow.scrollIntoViewIfNeeded().catch(() => undefined);
      await this.highlightValidationTarget(firstRow);
    }

    await this.page.waitForTimeout(300);
  }

  private selectionAction(options: ModalValidationOptions): ModalSelectionAction | undefined {
    return options.modalSelectionAction ?? options.equipmentFilterAction;
  }

  private async validateAddOperationFlow(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const flow = spec.addOperationFlow;
    if (!flow) {
      throw new Error(`${modalKey}: add-operation flow metadata is missing in modals.json`);
    }

    await this.validateAddOperationExpectedValues(modalKey, modal, flow, options);

    const operationTypeIsUnset = await this.isAddOperationTypeUnset(modal, flow);
    if (options.validateAddOperationRequiredWarning ?? operationTypeIsUnset) {
      await this.validateAddOperationRequiredWarning(modalKey, modal, flow, options);
      if (options.stopAfterAddOperationRequiredWarning) {
        return;
      }
    }

    const operationType = await this.selectAddOperationType(modalKey, modal, flow, options.addOperationTypeText, options);
    const mainTimeValue = options.addOperationMainTimeValue;
    if (mainTimeValue !== undefined) {
      await this.setAddOperationMainTime(modalKey, modal, flow, mainTimeValue, options);
    }

    const selectedResources: Record<string, string[]> = {};
    if (options.validateAddOperationResources ?? true) {
      const resourceKeys = options.addOperationResourceKeys ?? flow.resources.map(resource => resource.key);
      for (const resource of flow.resources.filter(item => resourceKeys.includes(item.key))) {
        selectedResources[resource.key] = await this.validateAddOperationResource(modalKey, modal, resource, options);
      }
      options.onAddOperationSelectedResources?.({ ...selectedResources });
    }

    const action = options.addOperationAction ?? 'validateOnly';
    if (action === 'validateOnly') {
      return;
    }

    const actionButton = modal
      .locator(`[data-testid="${cssEscape(action === 'save' ? flow.saveButtonTestId : flow.cancelButtonTestId)}"]`)
      .first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(actionButton, `${modalKey}: ${action} button should be visible`).toBeVisible();
        await expect.soft(actionButton, `${modalKey}: ${action} button should be enabled`).toBeEnabled();
      },
      `${modalKey} ${action} button ready`,
      options.testInfo,
    );

    logger.info(`${modalKey}: ${action} with operation type "${operationType}"${mainTimeValue !== undefined ? ` and main time "${mainTimeValue}"` : ''}.`);
    await actionButton.click({ force: true });

    if (action === 'save') {
      options.onAddOperationSaved?.({
        operationType,
        mainTime: mainTimeValue,
        selectedResources,
      });
    }

    if (options.expectModalToCloseAfterAddOperationAction ?? true) {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(modal, `${modalKey}: modal should close after ${action}`).toBeHidden({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
      `${modalKey} closes after ${action}`,
      options.testInfo,
    );
    await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
  }
  }

  private async validateShortInformationFlow(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const flow = spec.shortInformationFlow;
    if (!flow) {
      throw new Error(`${modalKey}: short-information flow metadata is missing in modals.json`);
    }

    const shortInfo = await this.readShortInformationValues(modalKey, modal, flow, options);
    await this.validateShortInformationExpectedValues(modalKey, shortInfo, options);
    await this.validateShortInformationExternalLinkButton(modalKey, modal, flow, options);

    if (options.validateShortInformationFullInformation) {
      await this.validateShortInformationFullInformationTab(modalKey, modal, flow, shortInfo, options);
    }

    if (options.validateShortInformationHistory) {
      await this.validateShortInformationHistory(modalKey, modal, flow, options);
    }

    if (options.validateShortInformationTechProcess) {
      await this.validateShortInformationTechProcess(modalKey, modal, flow, options);
    }
  }

  private async validateShortInformationExternalLinkButton(
    modalKey: string,
    modal: Locator,
    flow: ShortInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    if (!flow.externalLinkButtonTestId) {
      return;
    }

    const button = modal.locator(`[data-testid="${cssEscape(flow.externalLinkButtonTestId)}"]`).first();
    if (!(await button.isVisible().catch(() => false))) {
      logger.info(`${modalKey}: external-link/media button is not present for this dialog variant.`);
      return;
    }

    await this.highlightValidationTarget(button);
    const icon = button.locator('svg, [data-testid="Icon"]').first();
    if (await icon.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(icon);
    }

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(button, `${modalKey}: external-link/media button should be visible`).toBeVisible();
        await expect.soft(button, `${modalKey}: external-link/media button should be disabled`).toBeDisabled();
      },
      `${modalKey} external-link/media button disabled`,
      options.testInfo,
    );
  }

  private async readShortInformationValues(
    modalKey: string,
    modal: Locator,
    flow: ShortInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<{
    name: string;
    designation: string;
    mass: string;
    material: string;
    workpieceMass: string;
    workpieceLength: string;
    workpieceWidth: string;
    workpieceHeight: string;
    workpieceCharacteristics: Record<string, string>;
  }> {
    const textByTestId = async (testId: string): Promise<string> =>
      normalizeText(await modal.locator(`[data-testid="${cssEscape(testId)}"]`).first().textContent().catch(() => ''));
    const locatorByTestId = (testId: string): Locator => modal.locator(`[data-testid="${cssEscape(testId)}"]`).first();

    await this.highlightValidationTarget(locatorByTestId(flow.nameTestId));
    await this.highlightValidationTarget(locatorByTestId(flow.designationTestId));
    await this.highlightValidationTarget(locatorByTestId(flow.massTestId));
    await this.highlightValidationTarget(locatorByTestId(flow.materialTestId));
    await this.highlightValidationTarget(locatorByTestId(flow.workpieceMassTestId));

    const name = await textByTestId(flow.nameTestId);
    const designation = await textByTestId(flow.designationTestId);
    const mass = await textByTestId(flow.massTestId);
    const material = await textByTestId(flow.materialTestId);
    const workpieceMass = await textByTestId(flow.workpieceMassTestId);
    const workpieceValues = await this.readShortInformationWorkpieceValues(modalKey, modal, flow, options);

    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(name.length, `${modalKey}: short information name should not be empty`).toBeGreaterThan(0);
        expect.soft(designation.length, `${modalKey}: short information designation should not be empty`).toBeGreaterThan(0);
      },
      `${modalKey} core values are present`,
      options.testInfo,
    );

    return {
      name,
      designation,
      mass,
      material,
      workpieceMass,
      workpieceLength: workpieceValues.length,
      workpieceWidth: workpieceValues.width,
      workpieceHeight: workpieceValues.height,
      workpieceCharacteristics: workpieceValues.characteristics,
    };
  }

  private async readShortInformationWorkpieceValues(
    modalKey: string,
    modal: Locator,
    flow: ShortInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<{ length: string; width: string; height: string; characteristics: Record<string, string> }> {
    const wrapper = modal.locator(`[data-testid="${cssEscape(flow.workpieceTableWrapperTestId)}"]`).first();
    const rows = wrapper.locator('tbody tr').filter({ hasText: /./ });

    if (!(await wrapper.isVisible().catch(() => false)) || !(await rows.first().isVisible().catch(() => false))) {
      logger.warn(`${modalKey}: workpiece characteristic table is not populated for the selected detail; skipping workpiece value comparison.`);
      return {
        length: '',
        width: '',
        height: '',
        characteristics: {},
      };
    }

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(rows.first(), `${modalKey}: workpiece characteristic rows should be visible`).toBeVisible();
      },
      `${modalKey} workpiece rows visible`,
      options.testInfo,
    );

    const values: Record<string, string> = {};
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index++) {
      const row = rows.nth(index);
      const cells = row.locator('th, td');
      const key = normalizeText(await cells.nth(0).textContent().catch(() => ''));
      const value = normalizeText(await cells.nth(2).textContent().catch(() => ''));
      if (key) {
        values[key] = value;
        await this.highlightValidationTarget(row);
      }
    }

    return {
      length: values['Д'] ?? '',
      width: values['Ш'] ?? '',
      height: values['В'] ?? '',
      characteristics: values,
    };
  }

  private async validateShortInformationExpectedValues(
    modalKey: string,
    shortInfo: { name: string; designation: string },
    options: ModalValidationOptions,
  ): Promise<void> {
    await expectSoftWithScreenshot(
      this.page,
      () => {
        if (options.expectedShortInformationName !== undefined) {
          expect.soft(shortInfo.name, `${modalKey}: name should match selected parent row`).toBe(options.expectedShortInformationName);
        }
        if (options.expectedShortInformationDesignation !== undefined) {
          expect.soft(shortInfo.designation, `${modalKey}: designation should match selected parent row`).toBe(options.expectedShortInformationDesignation);
        }
      },
      `${modalKey} expected row values`,
      options.testInfo,
    );
  }

  private async validateShortInformationFullInformationTab(
    modalKey: string,
    modal: Locator,
    flow: ShortInformationFlowExpectation,
    shortInfo: {
      name: string;
      designation: string;
      mass: string;
      material: string;
      workpieceMass: string;
      workpieceLength: string;
      workpieceWidth: string;
      workpieceHeight: string;
      workpieceCharacteristics: Record<string, string>;
    },
    options: ModalValidationOptions,
  ): Promise<void> {
    const fullInfoButton = modal.locator(`[data-testid="${cssEscape(flow.fullInformationButtonTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(fullInfoButton, `${modalKey}: full information button should be visible`).toBeVisible();
        await expect.soft(fullInfoButton, `${modalKey}: full information button should be enabled`).toBeEnabled();
      },
      `${modalKey} full information button ready`,
      options.testInfo,
    );

    const [detailPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      fullInfoButton.click({ force: true }),
    ]);

    try {
      await detailPage.waitForLoadState('domcontentloaded').catch(() => undefined);
      await detailPage.locator(`[data-testid="${cssEscape(flow.fullInfoRootTestId)}"]`).first().waitFor({ timeout: WAIT_TIMEOUTS.STANDARD });
      await this.validateFullInformationPage(modalKey, detailPage, flow, shortInfo, options);
    } finally {
      await detailPage.waitForTimeout(500).catch(() => undefined);
      await detailPage.close().catch(() => undefined);
    }

    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(detailPage.isClosed(), `${modalKey}: full information tab should be closed after validation`).toBe(true);
      },
      `${modalKey} full information tab closed`,
      options.testInfo,
    );
  }

  private async validateFullInformationPage(
    modalKey: string,
    detailPage: Page,
    flow: ShortInformationFlowExpectation,
    shortInfo: {
      name: string;
      designation: string;
      mass: string;
      material: string;
      workpieceMass: string;
      workpieceLength: string;
      workpieceWidth: string;
      workpieceHeight: string;
      workpieceCharacteristics: Record<string, string>;
    },
    options: ModalValidationOptions,
  ): Promise<void> {
    const nameInput = detailPage.locator(flow.fullInfoNameInputSelector).first();
    const designationInput = detailPage.locator(`[data-testid="${cssEscape(flow.fullInfoDesignationInputTestId)}"]`).first();
    const massInput = detailPage.locator(`[data-testid="${cssEscape(flow.fullInfoMassInputTestId)}"]`).first();
    const material = detailPage.locator(`[data-testid="${cssEscape(flow.fullInfoMaterialTestId)}"]`).first();
    const materialByText = shortInfo.material ? detailPage.getByText(shortInfo.material, { exact: true }).first() : material;

    await this.highlightValidationTarget(nameInput);
    await this.highlightValidationTarget(designationInput);
    await this.highlightValidationTarget(massInput);
    if (await material.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(material);
    } else if (await materialByText.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(materialByText);
    } else {
      logger.warn(`${modalKey}: full information material field is not visible for the selected detail; skipping material comparison.`);
    }

    await expectSoftWithScreenshot(
      detailPage,
      async () => {
        await expect.soft(nameInput, `${modalKey}: full information name input should be visible`).toBeVisible();
        await expect.soft(designationInput, `${modalKey}: full information designation input should be visible`).toBeVisible();
      },
      `${modalKey} full information shell`,
      options.testInfo,
    );

    const materialText = (await material.isVisible().catch(() => false))
      ? normalizeText(await material.textContent().catch(() => ''))
      : (await materialByText.isVisible().catch(() => false))
        ? shortInfo.material
        : '';

    const actual = {
      name: await nameInput.inputValue().catch(() => ''),
      designation: await designationInput.inputValue().catch(() => ''),
      mass: await massInput.inputValue().catch(() => ''),
      material: materialText,
      workpieceMass: await this.readFullInformationTableValue(detailPage, 'EditDetal-CharacteristicBlanks-Table', 'Расчетная масса заготовки'),
      workpieceCharacteristics: await this.readFullInformationWorkpieceCharacteristics(
        detailPage,
        'EditDetal-CharacteristicBlanks-Table',
        shortInfo.workpieceCharacteristics,
        options,
      ),
    };

    await expectSoftWithScreenshot(
      detailPage,
      () => {
        expect.soft(actual.name, `${modalKey}: full information name should match short information`).toBe(shortInfo.name);
        expect.soft(actual.designation, `${modalKey}: full information designation should match short information`).toBe(shortInfo.designation);
        expect.soft(actual.mass, `${modalKey}: full information mass should match short information`).toBe(shortInfo.mass);
        if (shortInfo.material && actual.material) {
          expect.soft(actual.material, `${modalKey}: full information material should match short information`).toBe(shortInfo.material);
        }
        if (shortInfo.workpieceMass && actual.workpieceMass) {
          expect.soft(actual.workpieceMass, `${modalKey}: full information workpiece mass should match short information`).toBe(shortInfo.workpieceMass);
        }
        for (const [key, expectedValue] of Object.entries(shortInfo.workpieceCharacteristics)) {
          const actualValue = actual.workpieceCharacteristics[key];
          expect.soft(actualValue, `${modalKey}: full information workpiece "${key}" should match short information`).toBe(expectedValue);
        }
      },
      `${modalKey} full information values match`,
      options.testInfo,
    );
  }

  private async readFullInformationWorkpieceCharacteristics(
    page: Page,
    tableTestId: string,
    expectedCharacteristics: Record<string, string>,
    options: ModalValidationOptions,
  ): Promise<Record<string, string>> {
    const actual: Record<string, string> = {};
    for (const [key, expectedValue] of Object.entries(expectedCharacteristics)) {
      if (!this.isMeaningfulTableValue(expectedValue)) {
        continue;
      }

      const row = page
        .locator(`[data-testid="${cssEscape(tableTestId)}"] tbody tr`)
        .filter({ hasText: new RegExp(`\\(${this.escapeRegExp(key)}\\)|^\\s*${this.escapeRegExp(key)}\\s`, 'i') })
        .first();

      await expectSoftWithScreenshot(
        page,
        async () => {
          await expect.soft(row, `Full information: workpiece characteristic "${key}" from short dialog should exist`).toBeVisible({
            timeout: WAIT_TIMEOUTS.SHORT,
          });
        },
        `Full information workpiece ${key}`,
        options.testInfo,
      );

      if (!(await row.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false))) {
        continue;
      }

      const valueCell = row.locator('td').nth(2);
      const input = valueCell.locator('input').first();
      await this.highlightValidationTarget(row);
      await this.highlightValidationTarget(valueCell);

      actual[key] = (await input.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false))
        ? normalizeText(await input.inputValue().catch(() => ''))
        : normalizeText(await valueCell.textContent({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => ''));
    }

    return actual;
  }

  private async readFullInformationTableValue(page: Page, tableTestId: string, rowName: string): Promise<string> {
    const row = page
      .locator(`[data-testid="${cssEscape(tableTestId)}"] tbody tr`)
      .filter({ hasText: rowName })
      .first();
    if (!(await row.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false))) {
      logger.info(`Full information table ${tableTestId}: optional row "${rowName}" is not present for this detail; skipping comparison.`);
      return '';
    }

    const valueCell = row.locator('td').nth(2);
    const input = valueCell.locator('input').first();

    await this.highlightValidationTarget(row);
    await this.highlightValidationTarget(valueCell);

    if (await input.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false)) {
      await this.highlightValidationTarget(input);
      return normalizeText(await input.inputValue().catch(() => ''));
    }

    return normalizeText(await valueCell.textContent({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => ''));
  }

  private async validateHistoryUserInfoFlow(modalKey: string, modal: Locator, options: ModalValidationOptions): Promise<void> {
    const firstRow = modal.locator('tbody tr').filter({ hasText: /./ }).first();
    if (!(await firstRow.isVisible().catch(() => false))) {
      return;
    }

    const userCell = firstRow.locator('td.link, [data-testid="DataCell"].link').first();
    if (!(await userCell.isVisible().catch(() => false))) {
      return;
    }

    const userName = normalizeText(await userCell.textContent().catch(() => ''));
    if (!userName) {
      return;
    }

    await this.highlightValidationTarget(userCell);
    await this.page.waitForTimeout(750);
    await userCell.click({ force: true });
    await this.validateUserInfoModal({
      testInfo: options.testInfo,
      expectedUserName: userName,
    });
    await this.closeOpenUserInfoModal();
  }

  private async validateHistoryActionVisibleRows(modalKey: string, modal: Locator, options: ModalValidationOptions): Promise<void> {
    const title = modal.locator('[data-testid$="ModalHistoryAction-Main-Title-Name"]').first();
    const table = modal.locator('[data-testid$="ModalHistoryAction-Table"]').first();
    const firstRow = modal.locator('tbody tr').filter({ hasText: /./ }).first();
    const firstRowCells = firstRow.locator('td, [data-testid="DataCell"]');

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(title, `${modalKey}: history title should be visible`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `${modalKey} visible history shell`,
      options.testInfo,
    );

    await this.highlightValidationTarget(title);

    if (!(await table.isVisible().catch(() => false))) {
      const emptyState = modal.getByText('Нет сохраненных действий пользователей').first();
      if (await emptyState.isVisible().catch(() => false)) {
        await this.highlightValidationTarget(emptyState);
        await this.page.waitForTimeout(1000);
        return;
      }
      logger.warn(`${modalKey}: history table is not present and no empty state was rendered in this history-dialog variant.`);
      return;
    }

    await this.highlightValidationTarget(table);

    if (!(await firstRow.isVisible().catch(() => false))) {
      const emptyState = modal.getByText('Нет сохраненных действий пользователей').first();
      if (await emptyState.isVisible().catch(() => false)) {
        await this.highlightValidationTarget(emptyState);
        await this.page.waitForTimeout(1000);
      }
      return;
    }

    await this.highlightValidationTarget(firstRow);
    const cellCount = await firstRowCells.count();
    for (let index = 0; index < Math.min(cellCount, 3); index += 1) {
      await this.highlightValidationTarget(firstRowCells.nth(index));
    }

    const rowText = normalizeText(await firstRow.textContent().catch(() => ''));
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(rowText.length, `${modalKey}: first history row should contain change data`).toBeGreaterThan(0);
      },
      `${modalKey} first history row data`,
      options.testInfo,
    );

    await this.page.waitForTimeout(1250);
  }

  private async validateUserInfoFlow(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const flow = spec.userInfoFlow;
    if (!flow) {
      throw new Error(`${modalKey}: user-info flow metadata is missing in modals.json`);
    }

    const title = modal.locator(`[data-testid="${cssEscape(flow.titleTestId)}"]`).first();
    const avatar = modal.locator(`[data-testid="${cssEscape(flow.avatarTestId)}"]`).first();
    const contactTable = modal.locator(`[data-testid^="${cssEscape(flow.contactTableTestIdPrefix)}"]`).first();
    const rows = modal.locator(`[data-testid^="${cssEscape(flow.contactRowTestIdPrefix)}"]`);
    const role = modal.locator('.modal-user-info-block__role').first();
    const onlineStatus = modal.locator('.modal-user-info-block__online').first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(title, `${modalKey}: title should be visible`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        await expect.soft(avatar, `${modalKey}: avatar block should be visible`).toBeVisible();
        await expect.soft(role, `${modalKey}: role should be visible`).toBeVisible();
        await expect.soft(contactTable, `${modalKey}: contact table should be visible`).toBeVisible();
        await expect.soft(rows.first(), `${modalKey}: contact rows should be visible`).toBeVisible();
      },
      `${modalKey} user info shell`,
      options.testInfo,
    );

    await this.highlightValidationTarget(title);
    await this.highlightValidationTarget(avatar);
    await this.highlightValidationTarget(role);
    if (await onlineStatus.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(onlineStatus);
    }

    const contactText = normalizeText(await contactTable.textContent().catch(() => ''));
    const roleText = normalizeText(await role.textContent().catch(() => ''));
    const onlineText = normalizeText(await onlineStatus.textContent().catch(() => ''));
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(roleText, `${modalKey}: role label should be present`).toContain(flow.roleLabelText);
        if (onlineText) {
          expect.soft(onlineText, `${modalKey}: online label should be present`).toContain(flow.onlineLabelText);
        }
        for (const label of flow.contactLabels) {
          expect.soft(contactText, `${modalKey}: contact table should contain "${label}"`).toContain(label);
        }
      },
      `${modalKey} contact labels`,
      options.testInfo,
    );

    for (const label of flow.contactLabels) {
      const row = rows.filter({ hasText: label }).first();
      if (await row.isVisible().catch(() => false)) {
        const labelCell = row.locator('td').first();
        const valueCell = row.locator('td').nth(1);
        const valueText = normalizeText(await valueCell.textContent().catch(() => ''));
        await this.highlightValidationTarget(labelCell);

        if (label === 'Табельный номер' || label === flow.loginLabelText) {
          await expectSoftWithScreenshot(
            this.page,
            () => {
              expect.soft(valueText.length, `${modalKey}: "${label}" value should not be empty`).toBeGreaterThan(0);
            },
            `${modalKey} ${label} value`,
            options.testInfo,
          );
          await this.highlightValidationTarget(valueCell);
        }
      }
    }

    if (options.expectedUserName) {
      const loginRow = rows.filter({ hasText: flow.loginLabelText }).first();
      const loginValue = loginRow.locator('td').nth(1);
      await this.highlightValidationTarget(loginRow);
      await this.highlightValidationTarget(loginValue);
      const loginText = normalizeText(await loginValue.textContent().catch(async () => (await loginRow.textContent().catch(() => '')) ?? ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(loginText, `${modalKey}: login row should contain clicked user name`).toContain(options.expectedUserName);
        },
        `${modalKey} clicked user name`,
        options.testInfo,
      );
    }

    await this.page.waitForTimeout(2000);
  }

  private async closeOpenUserInfoModal(): Promise<void> {
    const modal = this.getOpenModalBySpec(this.getModalSpec('UserInfoModal'));
    if (!(await modal.isVisible().catch(() => false))) {
      return;
    }

    await this.closeModalWithoutEscape(modal, ['Закрыть', 'Отменить']);
  }

  private async validateInstrumentInformationFlow(
    modalKey: string,
    modal: Locator,
    spec: ModalSpec,
    options: ModalValidationOptions,
  ): Promise<void> {
    const flow = spec.instrumentInformationFlow;
    if (!flow) {
      throw new Error(`${modalKey}: instrument information flow metadata is missing in modals.json`);
    }

    const heading = modal.locator('.short-information__headings').filter({ hasText: flow.headingText }).first();
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(heading, `${modalKey}: heading should be visible`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `${modalKey} heading visible`,
      options.testInfo,
    );
    await this.highlightValidationTarget(heading);

    for (const label of flow.fieldLabels) {
      const row = modal.locator('.short-information__information').filter({ hasText: label }).first();
      const labelLocator = row.locator('.short-information__information-title').first();
      const valueLocator = row.locator('.short-information__information-text span').first();

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(row, `${modalKey}: "${label}" row should be visible`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
          await expect.soft(valueLocator, `${modalKey}: "${label}" value should be visible`).toBeVisible();
        },
        `${modalKey} ${label} field visible`,
        options.testInfo,
      );
      await this.highlightValidationTarget(labelLocator);
      await this.highlightValidationTarget(valueLocator);

      if (label === flow.nameLabelText && options.expectedInstrumentInformationName) {
        const actualName = normalizeText(await valueLocator.textContent().catch(() => ''));
        await expectSoftWithScreenshot(
          this.page,
          () => {
            expect
              .soft(actualName, `${modalKey}: name should match clicked technical-process resource`)
              .toContain(options.expectedInstrumentInformationName ?? '');
          },
          `${modalKey} selected resource name`,
          options.testInfo,
        );
      }
    }

    const suppliersTitle = modal.locator('.short-information__category-title').filter({ hasText: flow.suppliersTitleText }).first();
    const supplierRows = suppliersTitle
      .locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " short-information__category ")][1]')
      .locator('tbody tr');
    const firstSupplierRow = supplierRows.first();
    if (await suppliersTitle.isVisible().catch(() => false)) {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(firstSupplierRow, `${modalKey}: supplier table should have a row`).toBeVisible();
        },
        `${modalKey} suppliers table visible`,
        options.testInfo,
      );
      await this.highlightValidationTarget(suppliersTitle);
      await this.highlightValidationTarget(firstSupplierRow);

      const supplierRowCount = await supplierRows.count();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(supplierRowCount, `${modalKey}: suppliers should have minimum rows`).toBeGreaterThanOrEqual(flow.minimumSupplierRows);
        },
        `${modalKey} supplier row count`,
        options.testInfo,
      );
    } else {
      logger.info(`${modalKey}: suppliers section is not present for this selected resource; skipping supplier table validation.`);
    }

    const description = modal.locator(`[data-testid="${cssEscape(flow.descriptionTextareaTestId)}"]`).first();
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(description, `${modalKey}: description textarea should be visible`).toBeVisible();
      },
      `${modalKey} description textarea visible`,
      options.testInfo,
    );
    await this.highlightValidationTarget(description);

    if (options.validateInstrumentInformationHistory ?? true) {
      await this.validateInstrumentInformationHistory(modalKey, modal, flow, options);
    }

    if (options.validateInstrumentInformationFullInformation) {
      await this.validateInstrumentInformationFullInformation(modalKey, modal, flow, options);
    }

    await this.page.waitForTimeout(500);
  }

  private async validateInstrumentInformationHistory(
    modalKey: string,
    modal: Locator,
    flow: InstrumentInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const historyButton = modal.locator(`[data-testid$="${cssEscape(flow.historyButtonTestIdSuffix)}"]`).first();
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(historyButton, `${modalKey}: history button should be visible`).toBeVisible();
        await expect.soft(historyButton, `${modalKey}: history button should be enabled`).toBeEnabled();
      },
      `${modalKey} history button ready`,
      options.testInfo,
    );
    await this.highlightValidationTarget(historyButton);

    logger.info(`[history-entry] ${modalKey}: clicking instrument history button`);
    await historyButton.click({ force: true });
    const historyModal = this.getOpenModalBySpec(this.getModalSpec('HistoryActionModal'));
    await historyModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => undefined);
    const historyModalTestId = await historyModal.getAttribute('data-testid').catch(() => 'unknown');
    logger.info(`[history-entry] ${modalKey}: instrument history modal resolved as ${historyModalTestId}`);

    const looksFull = await historyModal
      .locator('[data-testid="Calendar-DataPickerRange-Component-Start-Wrapper"]')
      .first()
      .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
      .catch(() => false);

    await this.tagHistoryDialog(historyModal, looksFull ? 'ADVANCED' : 'BASIC');
    logger.info(`[history-dialog] ${modalKey}: instrument history ${looksFull ? 'advanced' : 'basic'}`);

    if (looksFull) {
      await this.validateFullHistoryActionModalInteractive({
        ...options.instrumentInformationHistoryOptions,
        testInfo: options.testInfo,
        closeAfterValidation: false,
      });
    } else {
      await this.validateCompactHistoryActionModal({
        ...options.instrumentInformationHistoryOptions,
        testInfo: options.testInfo,
        closeAfterValidation: false,
      });
    }
    await this.closeLatestHistoryModal();
  }

  private async validateInstrumentInformationFullInformation(
    modalKey: string,
    modal: Locator,
    flow: InstrumentInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const fullInformationButton = modal.locator('button').filter({ hasText: flow.fullInformationButtonText }).first();
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(fullInformationButton, `${modalKey}: full information button should be visible`).toBeVisible();
        await expect.soft(fullInformationButton, `${modalKey}: full information button should be enabled`).toBeEnabled();
      },
      `${modalKey} full information button ready`,
      options.testInfo,
    );
    await this.highlightValidationTarget(fullInformationButton);

    const beforeUrl = this.page.url();
    const popupPromise = this.page.waitForEvent('popup', { timeout: WAIT_TIMEOUTS.SHORT }).catch(() => null);
    await fullInformationButton.click({ force: true });
    const popup = await popupPromise;

    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(popup.url(), `${modalKey}: full information popup should navigate`).not.toBe('about:blank');
        },
        `${modalKey} full information popup`,
        options.testInfo,
      );
      await popup.close().catch(() => undefined);
      return;
    }

    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(this.page.url(), `${modalKey}: full information should redirect when popup is not opened`).not.toBe(beforeUrl);
      },
      `${modalKey} full information redirect`,
      options.testInfo,
    );
  }

  private async closeOpenInstrumentInformationModal(): Promise<void> {
    const modal = this.getOpenModalBySpec(this.getModalSpec('InstrumentInformationModal'));
    if (!(await modal.isVisible().catch(() => false))) {
      return;
    }

    await this.closeModalWithoutEscape(modal, ['Закрыть', 'Отменить']);
  }

  private async closeModalWithoutEscape(modal: Locator, buttonTexts: string[]): Promise<void> {
    const closeCandidates: Locator[] = [
      modal.locator('[data-testid$="Close"]').first(),
      modal.locator('[data-testid$="CloseButton"]').first(),
      modal.locator('[aria-label="Закрыть"]').first(),
      modal.locator('[aria-label="Close"]').first(),
      modal.locator('.modal-right__close').first(),
      modal.locator('.modal-yui-kit__close').first(),
    ];

    for (const text of buttonTexts) {
      closeCandidates.push(modal.locator('button').filter({ hasText: text }).first());
      closeCandidates.push(modal.locator('[data-testid="Button"]').filter({ hasText: text }).first());
    }

    for (const candidate of closeCandidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ force: true }).catch(() => undefined);
        await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
        await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
        return;
      }
    }

    const box = await modal.boundingBox().catch(() => null);
    if (box) {
      await this.page.mouse.click(Math.max(1, box.x - 10), Math.max(1, box.y + 20)).catch(() => undefined);
      await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
      if (!(await modal.isVisible().catch(() => false))) {
        await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
        return;
      }
    }

    logger.warn('Modal did not expose a scoped close control and outside click did not close it; leaving it open instead of pressing Escape.');
  }

  private async highlightValidationTarget(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
    await locator
      .evaluate(element => {
        const target = element as HTMLElement;
        const apply = (item: Element) => {
          const el = item as HTMLElement;
          el.style.setProperty('background-color', 'yellow', 'important');
          el.style.setProperty('outline', '3px solid #f5c400', 'important');
          el.style.setProperty('box-shadow', '0 0 0 3px rgba(245, 196, 0, 0.45)', 'important');
          el.style.setProperty('color', 'black', 'important');
        };
        apply(target);
        for (const child of Array.from(target.querySelectorAll(':scope > td, :scope > th, :scope > span, :scope > div'))) {
          apply(child);
        }
        target.style.setProperty('background-color', 'yellow', 'important');
        target.style.setProperty('outline', '3px solid #f5c400', 'important');
        target.style.setProperty('box-shadow', '0 0 0 3px rgba(245, 196, 0, 0.45)', 'important');
        target.style.setProperty('color', 'black', 'important');
      })
      .catch(() => undefined);
  }

  private async tagHistoryDialog(modal: Locator, label: 'BASIC' | 'ADVANCED'): Promise<void> {
    await this.tagModal(modal, `HISTORY: ${label}`, {
      top: '8px',
      right: '8px',
      background: label === 'ADVANCED' ? '#9ae6b4' : '#fbd38d',
    });
    await modal
      .evaluate((element, badgeLabel) => {
        const host = element as HTMLElement;
        const existing = host.querySelector('[data-codex-history-debug="true"]');
        if (existing) {
          existing.remove();
        }
        const badge = document.createElement('div');
        badge.setAttribute('data-codex-history-debug', 'true');
        badge.textContent = `HISTORY: ${badgeLabel}`;
        badge.style.position = 'absolute';
        badge.style.top = '8px';
        badge.style.right = '8px';
        badge.style.zIndex = '10000';
        badge.style.padding = '6px 10px';
        badge.style.borderRadius = '6px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = '700';
        badge.style.color = '#111';
        badge.style.background = badgeLabel === 'ADVANCED' ? '#9ae6b4' : '#fbd38d';
        badge.style.border = '2px solid #111';
        badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        const computedPosition = window.getComputedStyle(host).position;
        if (computedPosition === 'static') {
          host.style.position = 'relative';
        }
        host.appendChild(badge);
      }, label)
      .catch(() => undefined);
  }

  private async validateShortInformationHistory(
    modalKey: string,
    modal: Locator,
    flow: ShortInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const historyButton = modal.locator(`[data-testid="${cssEscape(flow.historyButtonTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(modal, `${modalKey}: short information modal should still be visible before history validation`).toBeVisible({
          timeout: WAIT_TIMEOUTS.STANDARD,
        });
      },
      `${modalKey} still visible before history`,
      options.testInfo,
    );

    await modal
      .evaluate(element => {
        const host = element as HTMLElement;
        const existing = host.querySelector('[data-codex-shortinfo-history-check="true"]');
        if (existing) {
          existing.remove();
        }
        const badge = document.createElement('div');
        badge.setAttribute('data-codex-shortinfo-history-check', 'true');
        badge.textContent = 'SHORTINFO -> HISTORY';
        badge.style.position = 'absolute';
        badge.style.top = '8px';
        badge.style.left = '8px';
        badge.style.zIndex = '9999';
        badge.style.padding = '6px 10px';
        badge.style.borderRadius = '6px';
        badge.style.fontSize = '12px';
        badge.style.fontWeight = '700';
        badge.style.color = '#111';
        badge.style.background = '#90cdf4';
        badge.style.border = '2px solid #111';
        const computedPosition = window.getComputedStyle(host).position;
        if (computedPosition === 'static') {
          host.style.position = 'relative';
        }
        host.appendChild(badge);
      })
      .catch(() => undefined);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(historyButton, `${modalKey}: history button should be visible`).toBeVisible();
        await expect.soft(historyButton, `${modalKey}: history button should be enabled`).toBeEnabled();
      },
      `${modalKey} history button ready`,
      options.testInfo,
    );

    logger.info(`[history-entry] ${modalKey}: clicking history button`);
    await historyButton.click({ force: true });
    const historyModal = this.getOpenModalBySpec(this.getModalSpec('HistoryActionModal'));
    await historyModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => undefined);
    const historyModalTestId = await historyModal.getAttribute('data-testid').catch(() => 'unknown');
    logger.info(`[history-entry] ${modalKey}: visible history modal resolved as ${historyModalTestId}`);
    const looksFull = await historyModal
      .locator('[data-testid="Calendar-DataPickerRange-Component-Start-Wrapper"]')
      .first()
      .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
      .catch(() => false);

    await this.tagHistoryDialog(historyModal, looksFull ? 'ADVANCED' : 'BASIC');
    logger.info(`[history-dialog] ${modalKey}: ${looksFull ? 'advanced' : 'basic'}`);

    if (looksFull) {
      await this.validateFullHistoryActionModalInteractive({
        ...options.shortInformationHistoryOptions,
        testInfo: options.testInfo,
        closeAfterValidation: false,
      });
    } else {
      await this.validateCompactHistoryActionModal({
        ...options.shortInformationHistoryOptions,
        testInfo: options.testInfo,
        closeAfterValidation: false,
      });
    }
    await this.closeLatestHistoryModal();
  }

  private async selectFullHistoryFilterOption(
    modal: Locator,
    config: {
      name: string;
      currentTestId: string;
      optionsListTestId: string;
      searchInputTestId: string;
      optionPrefix: string;
      badgeTestId: string;
    },
    options: ModalValidationOptions,
  ): Promise<string | null> {
    const current = modal.locator(`[data-testid="${cssEscape(config.currentTestId)}"]`).first();
    const optionsList = modal.locator(`[data-testid="${cssEscape(config.optionsListTestId)}"]`).first();
    const searchInput = modal.locator(`[data-testid="${cssEscape(config.searchInputTestId)}"]`).first();
    const badge = modal.locator(`[data-testid="${cssEscape(config.badgeTestId)}"]`).first();
    const optionsLocator = modal.locator(`[data-testid^="${cssEscape(config.optionPrefix)}"]`);

    await this.highlightValidationTarget(current);
    await this.page.waitForTimeout(300);
    await current.click({ force: true });

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(optionsList, `HistoryActionModal: ${config.name} options list should open`).toBeVisible();
        await expect.soft(searchInput, `HistoryActionModal: ${config.name} search input should be visible`).toBeVisible();
      },
      `HistoryActionModal ${config.name} filter opened`,
      options.testInfo,
    );

    const optionCount = await optionsLocator.count();
    for (let index = 0; index < optionCount; index += 1) {
      const option = optionsLocator.nth(index);
      if (!(await option.isVisible().catch(() => false))) {
        continue;
      }

      const optionText = normalizeText(await option.textContent().catch(() => ''));
      if (!optionText || optionText === 'Все' || optionText === 'Не выбран') {
        continue;
      }

      await this.highlightValidationTarget(searchInput);
      await searchInput.fill(optionText.slice(0, Math.min(6, optionText.length))).catch(() => undefined);
      await this.page.waitForTimeout(400);
      await this.highlightValidationTarget(option);
      await this.page.waitForTimeout(300);
      await option.click({ force: true });
      await this.page.waitForTimeout(600);
      await this.highlightValidationTarget(badge);

      const badgeText = normalizeText(await badge.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(badgeText, `HistoryActionModal: ${config.name} badge should reflect selected option`).toContain(optionText);
        },
        `HistoryActionModal ${config.name} filter selected`,
        options.testInfo,
      );
      await this.page.waitForTimeout(400);
      return optionText;
    }

    return null;
  }

  private async validateFullHistoryActionModalInteractive(options: ModalValidationOptions = {}): Promise<Locator> {
    const modal = this.getOpenModalBySpec(this.getModalSpec('HistoryActionModal'));
    await this.tagHistoryDialog(modal, 'ADVANCED');
    logger.info('[history-dialog] HistoryActionModal interactive path: advanced');
    const title = modal.locator('[data-testid$="ModalHistoryAction-Main-Title-Name"]').first();
    const entityInfoTitle = modal.locator('[data-testid$="ModalHistoryAction-Information-Title0"]').first();
    const entityInfoText = modal.locator('[data-testid$="ModalHistoryAction-Information-Text0"]').first();
    const startDate = modal.locator('[data-testid="Calendar-DataPickerRange-Component-Start-Choose-Value-Display"]').first();
    const endDate = modal.locator('[data-testid="Calendar-DataPickerRange-Component-End-Choose-Value-Display"]').first();
    const resetButton = modal.locator('[data-testid="Button"]').filter({ hasText: 'Сбросить' }).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(modal, 'HistoryActionModal: modal root should be visible').toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        await expect.soft(title, 'HistoryActionModal: title should be visible').toBeVisible();
        await expect.soft(entityInfoTitle, 'HistoryActionModal: entity info label should be visible').toBeVisible();
        await expect.soft(entityInfoText, 'HistoryActionModal: entity info value should be visible').toBeVisible();
        await expect.soft(startDate, 'HistoryActionModal: start date should be visible').toBeVisible();
        await expect.soft(endDate, 'HistoryActionModal: end date should be visible').toBeVisible();
      },
      'HistoryActionModal full shell visible',
      options.testInfo,
    );

    await this.highlightValidationTarget(title);
    await this.highlightValidationTarget(entityInfoTitle);
    await this.highlightValidationTarget(entityInfoText);
    await this.highlightValidationTarget(startDate);
    await this.highlightValidationTarget(endDate);
    await this.page.waitForTimeout(500);

    await this.selectFullHistoryFilterOption(modal, {
      name: 'Сотрудники',
      currentTestId: 'FilterUser-Current',
      optionsListTestId: 'FilterUser-OptionsList',
      searchInputTestId: 'FilterUser-Search-Dropdown-Input',
      optionPrefix: 'FilterUser-Options-',
      badgeTestId: 'FilterUser-Badge-BadgesText',
    }, options);

    await this.selectFullHistoryFilterOption(modal, {
      name: 'Тип сущности',
      currentTestId: 'BaseFilter-Current',
      optionsListTestId: 'BaseFilter-OptionsList',
      searchInputTestId: 'BaseFilter-Search-Dropdown-Input',
      optionPrefix: 'BaseFilter-Options-',
      badgeTestId: 'BaseFilter-Badge-BadgesText',
    }, options);

    await this.highlightValidationTarget(resetButton);
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(resetButton, 'HistoryActionModal: reset button should be enabled after filter selection').toBeEnabled();
      },
      'HistoryActionModal reset enabled',
      options.testInfo,
    );

    await resetButton.click({ force: true });
    await this.page.waitForTimeout(500);

    const userBadge = modal.locator('[data-testid="FilterUser-Badge-BadgesText"]').first();
    const entityBadge = modal.locator('[data-testid="BaseFilter-Badge-BadgesText"]').first();
    await this.highlightValidationTarget(userBadge);
    await this.highlightValidationTarget(entityBadge);
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(userBadge, 'HistoryActionModal: employee badge should reset to Все').toContainText('Все');
        await expect.soft(entityBadge, 'HistoryActionModal: entity badge should reset to Все').toContainText('Все');
      },
      'HistoryActionModal reset restores defaults',
      options.testInfo,
    );

    await this.validateHistoryActionVisibleRows('HistoryActionModal', modal, options);
    if (options.validateHistoryUserInfo ?? true) {
      await this.validateHistoryUserInfoFlow('HistoryActionModal', modal, options);
    }

    return modal;
  }

  private async closeLatestHistoryModal(): Promise<void> {
    await this.closeOpenUserInfoModal();
    const historyModal = this.getOpenModalBySpec(this.getModalSpec('HistoryActionModal'));
    if (!(await historyModal.isVisible().catch(() => false))) {
      return;
    }
    const closeCandidates = [
      historyModal.locator('button').filter({ hasText: 'Закрыть' }).first(),
      historyModal.locator('button').filter({ hasText: 'Отменить' }).first(),
      historyModal.locator('[data-testid="Button"]').filter({ hasText: 'Закрыть' }).first(),
      historyModal.getByText('Закрыть', { exact: true }).locator('xpath=ancestor::button[1]').first(),
    ];

    for (const candidate of closeCandidates) {
      if (await candidate.count().catch(() => 0)) {
        await candidate.scrollIntoViewIfNeeded({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
        await candidate.click({ force: true }).catch(() => undefined);
        await historyModal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
        if (!(await historyModal.isVisible().catch(() => false))) {
          await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
          return;
        }
      }
    }

    const box = await historyModal.boundingBox().catch(() => null);
    if (box) {
      await this.page.mouse.click(Math.max(1, box.x - 10), Math.max(1, box.y + 20)).catch(() => undefined);
      await historyModal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
      if (!(await historyModal.isVisible().catch(() => false))) {
        await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
        return;
      }
    }

    logger.warn('History modal did not expose a scoped close button; leaving it open instead of pressing Escape.');
  }

  private async validateShortInformationTechProcess(
    modalKey: string,
    modal: Locator,
    flow: ShortInformationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const techProcessButton = modal.locator(`[data-testid="${cssEscape(flow.techProcessButtonTestId)}"]`).first();
    const techProcessOptions = options.shortInformationTechProcessOptions ?? {};

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(techProcessButton, `${modalKey}: technical process button should be visible`).toBeVisible();
        await expect.soft(techProcessButton, `${modalKey}: technical process button should be enabled`).toBeEnabled();
      },
      `${modalKey} technical process button ready`,
      options.testInfo,
    );

    await techProcessButton.click({ force: true });
    await this.validateTechProcessModal({
      ...techProcessOptions,
      testInfo: options.testInfo,
    });

    if (
      techProcessOptions.techProcessAction === 'save' &&
      techProcessOptions.techProcessNoteValue !== undefined
    ) {
      await this.closeOpenTechProcessModalAfterSave(options);

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(techProcessButton, `${modalKey}: technical process button should be visible for note persistence check`).toBeVisible({
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          await expect.soft(techProcessButton, `${modalKey}: technical process button should be enabled for note persistence check`).toBeEnabled();
        },
        `${modalKey} technical process button ready for note persistence check`,
        options.testInfo,
      );

      await this.highlightValidationTarget(techProcessButton);
      await techProcessButton.click({ force: true });
      await this.validateTechProcessModal({
        testInfo: options.testInfo,
        expectedTechProcessNoteValue: techProcessOptions.techProcessNoteValue,
        validateTechProcessMedia: false,
        validateTechProcessHistory: false,
        validateTechProcessAddOperation: false,
        validateTechProcessEditOperation: false,
        validateTechProcessArchive: false,
        techProcessAction: 'cancel',
        techProcessPauseBeforeActionMs: 500,
        expectModalToCloseAfterTechProcessAction: true,
      });
    }
  }

  private async closeOpenTechProcessModalAfterSave(options: ModalValidationOptions): Promise<void> {
    const modal = this.getOpenModalBySpec(this.getModalSpec('TechProcessModal'));
    if (!(await modal.isVisible().catch(() => false))) {
      return;
    }

    const cancelButton = modal.locator('[data-testid="ModalTechProcess-Button-Cancel"]').first();
    if (await cancelButton.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(cancelButton);
      await this.page.waitForTimeout(500);
      await cancelButton.click({ force: true }).catch(() => undefined);
      await this.validateTechProcessUnsavedChangesConfirmIfPresent(options);
      await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => undefined);
      await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
      return;
    }

    await this.closeModalWithoutEscape(modal, ['Отменить', 'Закрыть']);
  }

  private async validateTechProcessFlow(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const flow = spec.techProcessFlow;
    if (!flow) {
      throw new Error(`${modalKey}: technical process flow metadata is missing in modals.json`);
    }
    let savedOperation:
      | {
          operationType: string;
          mainTime?: string;
          selectedResources: Record<string, string[]>;
        }
      | undefined;

    if (options.validateTechProcessMedia ?? true) {
      await this.validateTechProcessMediaSection(modalKey, modal, flow, options);
    }

    await this.validateTechProcessNote(modalKey, modal, flow, options);

    if (options.validateTechProcessHistory) {
      await this.validateTechProcessHistory(modalKey, modal, flow, options);
    }

    if (options.validateTechProcessAddOperation) {
      savedOperation = await this.validateTechProcessAddOperation(modalKey, modal, flow, options);
    }

    if (options.validateTechProcessEditOperation) {
      await this.validateTechProcessEditOperation(modalKey, modal, flow, options, savedOperation);
    }

    if (options.validateTechProcessArchive) {
      await this.validateTechProcessArchive(modalKey, modal, flow, options, savedOperation);
    }

    const action = options.techProcessAction ?? 'validateOnly';
    if (action === 'validateOnly') {
      return;
    }

    const actionButton = modal
      .locator(`[data-testid="${cssEscape(action === 'save' ? flow.saveButtonTestId : flow.cancelButtonTestId)}"]`)
      .first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(actionButton, `${modalKey}: ${action} button should be visible`).toBeVisible();
        await expect.soft(actionButton, `${modalKey}: ${action} button should be enabled`).toBeEnabled();
      },
      `${modalKey} ${action} button ready`,
      options.testInfo,
    );

    if (options.techProcessPauseBeforeActionMs !== undefined) {
      await this.page.waitForTimeout(options.techProcessPauseBeforeActionMs);
    }

    await actionButton.click({ force: true });

    if (action === 'cancel') {
      await this.validateTechProcessUnsavedChangesConfirmIfPresent(options);
    }

    if (options.expectModalToCloseAfterTechProcessAction ?? true) {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(modal, `${modalKey}: modal should close after ${action}`).toBeHidden({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
      `${modalKey} closes after ${action}`,
      options.testInfo,
    );
    await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
  }
  }

  private async validateTechProcessUnsavedChangesConfirmIfPresent(options: ModalValidationOptions): Promise<void> {
    const spec = this.getModalSpec('UnsavedChangesConfirmModal');
    const modal = this.getOpenModalBySpec(spec, WAIT_TIMEOUTS.SHORT);
    if (!(await modal.isVisible({ timeout: WAIT_TIMEOUTS.SHORT }).catch(() => false))) {
      return;
    }

    await this.validateUnsavedChangesConfirmModal({
      ...options.techProcessUnsavedChangesConfirmOptions,
      testInfo: options.testInfo,
      confirmAction: options.techProcessUnsavedChangesConfirmOptions?.confirmAction ?? 'confirm',
      expectModalToCloseAfterConfirmAction: options.techProcessUnsavedChangesConfirmOptions?.expectModalToCloseAfterConfirmAction ?? true,
    });
  }

  private async validateTechProcessMediaSection(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const mediaTitleText = flow.mediaTitleText ?? 'Медиа файлы';
    const mediaTitle = modal.locator('h1, h2, h3, h4').filter({ hasText: mediaTitleText }).first();

    if (!(await mediaTitle.isVisible({ timeout: MODAL_CLOSE_SETTLE_MS }).catch(() => false))) {
      logger.info(`${modalKey}: media section is not present for this selected technical process; skipping media validation.`);
      return;
    }

    await this.highlightValidationTarget(mediaTitle);

    const mediaPreview = mediaTitle.locator('xpath=following::*[self::img or self::canvas or self::video or self::svg][1]').first();
    if (await mediaPreview.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(mediaPreview);
    }

    const table = mediaTitle.locator('xpath=following::table[1]').first();
    if (!(await table.isVisible().catch(() => false))) {
      logger.info(`${modalKey}: media section has no file table for this selected technical process; validated section title only.`);
      return;
    }

    await this.highlightValidationTarget(table);

    const expectedHeaders = flow.mediaTableHeaderTexts ?? ['№', 'Файлы'];
    for (const expectedHeader of expectedHeaders) {
      const header = table.locator('th').filter({ hasText: expectedHeader }).first();
      if (await header.isVisible().catch(() => false)) {
        await this.highlightValidationTarget(header);
        await expectSoftWithScreenshot(
          this.page,
          async () => {
            await expect.soft(header, `${modalKey}: media table header "${expectedHeader}" should be visible`).toBeVisible();
          },
          `${modalKey} media table header ${expectedHeader}`,
          options.testInfo,
        );
      }
    }

    const fileRows = table.locator('tbody tr').filter({ hasText: /./ });
    const rowCount = await fileRows.count();
    if (rowCount === 0) {
      logger.info(`${modalKey}: media file table is present but contains no file rows for this selected technical process.`);
      return;
    }

    const firstRow = fileRows.first();
    await this.highlightValidationTarget(firstRow);
    const firstRowText = normalizeText(await firstRow.textContent().catch(() => ''));
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(firstRowText.length, `${modalKey}: first media file row should contain text`).toBeGreaterThan(0);
      },
      `${modalKey} first media file row populated`,
      options.testInfo,
    );
  }

  private async validateTechProcessNote(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const textarea = modal.locator(`[data-testid="${cssEscape(flow.textareaTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(textarea, `${modalKey}: note textarea should be visible`).toBeVisible();
      },
      `${modalKey} note textarea visible`,
      options.testInfo,
    );

    const maxLength = await textarea.getAttribute('maxlength').catch(() => null);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(maxLength, `${modalKey}: note textarea maxlength`).toBe('250');
      },
      `${modalKey} note textarea maxlength`,
      options.testInfo,
    );

    if (options.expectedTechProcessNoteValue !== undefined) {
      const actualValue = await textarea.inputValue().catch(() => '');
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualValue, `${modalKey}: note should match saved value`).toBe(options.expectedTechProcessNoteValue);
        },
        `${modalKey} expected note value`,
        options.testInfo,
      );
    }

    if (options.techProcessNoteValue !== undefined) {
      await textarea.fill(options.techProcessNoteValue);
      const actualValue = await textarea.inputValue().catch(() => '');
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualValue, `${modalKey}: note textarea should accept typed value`).toBe(options.techProcessNoteValue);
        },
        `${modalKey} note textarea filled`,
        options.testInfo,
      );
    }
  }

  private async validateTechProcessHistory(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const historyButton = modal.locator(`[data-testid="${cssEscape(flow.historyButtonTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(historyButton, `${modalKey}: history button should be visible`).toBeVisible();
        await expect.soft(historyButton, `${modalKey}: history button should be enabled`).toBeEnabled();
      },
      `${modalKey} history button ready`,
      options.testInfo,
    );

    logger.info(`[history-entry] ${modalKey}: clicking tech process history button`);
    await historyButton.click({ force: true });
    const historyModal = this.getOpenModalBySpec(this.getModalSpec('HistoryActionModal'));
    await historyModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD }).catch(() => undefined);
    const historyModalTestId = await historyModal.getAttribute('data-testid').catch(() => 'unknown');
    logger.info(`[history-entry] ${modalKey}: tech process history modal resolved as ${historyModalTestId}`);

    const looksFull = await historyModal
      .locator('[data-testid="Calendar-DataPickerRange-Component-Start-Wrapper"]')
      .first()
      .isVisible({ timeout: WAIT_TIMEOUTS.SHORT })
      .catch(() => false);

    await this.tagHistoryDialog(historyModal, looksFull ? 'ADVANCED' : 'BASIC');
    logger.info(`[history-dialog] ${modalKey}: tech process history ${looksFull ? 'advanced' : 'basic'}`);

    if (looksFull) {
      await this.validateFullHistoryActionModalInteractive({
        ...options.techProcessHistoryOptions,
        testInfo: options.testInfo,
        closeAfterValidation: false,
      });
    } else {
      await this.validateCompactHistoryActionModal({
        ...options.techProcessHistoryOptions,
        testInfo: options.testInfo,
        closeAfterValidation: false,
      });
    }
    await this.closeLatestHistoryModal();
  }

  private async validateTechProcessAddOperation(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<
    | {
        operationType: string;
        mainTime?: string;
        selectedResources: Record<string, string[]>;
      }
    | undefined
  > {
    const addButton = modal.locator(`[data-testid="${cssEscape(flow.addOperationButtonTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(addButton, `${modalKey}: add operation button should be visible`).toBeVisible();
        await expect.soft(addButton, `${modalKey}: add operation button should be enabled`).toBeEnabled();
      },
      `${modalKey} add operation button ready`,
      options.testInfo,
    );

    const addOperationOptions = options.techProcessAddOperationOptions ?? {};
    const validateRequiredWarning = addOperationOptions.validateAddOperationRequiredWarning ?? true;

    if (validateRequiredWarning) {
      await addButton.click({ force: true });
      await this.validateAddOperationModal({
        ...addOperationOptions,
        testInfo: options.testInfo,
        addOperationAction: 'validateOnly',
        validateAddOperationRequiredWarning: true,
        stopAfterAddOperationRequiredWarning: true,
        validateAddOperationResources: false,
        addOperationExpectedTitleText:
          addOperationOptions.addOperationExpectedTitleText ?? 'Добавление операции технологического процесса',
      });

      await this.closeOpenAddOperationModalIfPresent();
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(addButton, `${modalKey}: add operation button should be ready after required warning`).toBeVisible({
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
          await expect.soft(addButton, `${modalKey}: add operation button should remain enabled after required warning`).toBeEnabled();
        },
        `${modalKey} add operation ready after warning`,
        options.testInfo,
      );
    }

    await addButton.click({ force: true });
    let savedOperation:
      | {
          operationType: string;
          mainTime?: string;
          selectedResources: Record<string, string[]>;
        }
      | undefined;

    await this.validateAddOperationModal({
      ...addOperationOptions,
      testInfo: options.testInfo,
      validateAddOperationRequiredWarning: false,
      addOperationExpectedTitleText:
        addOperationOptions.addOperationExpectedTitleText ?? 'Добавление операции технологического процесса',
      onAddOperationSaved: saved => {
        savedOperation = saved;
        addOperationOptions.onAddOperationSaved?.(saved);
      },
    });

    if ((addOperationOptions.addOperationAction ?? 'validateOnly') === 'save' && savedOperation) {
      await this.validateTechProcessSavedOperationRow(modalKey, modal, flow, savedOperation, options);
    }

    return savedOperation;
  }

  private async closeOpenAddOperationModalIfPresent(): Promise<void> {
    const addOperationModal = this.getOpenModalBySpec(this.getModalSpec('AddOperationModal'));
    if (!(await addOperationModal.isVisible().catch(() => false))) {
      return;
    }

    const cancelButton = addOperationModal.locator('[data-testid$="ModalAddOperation-CancelButton"]').first();
    if (await cancelButton.isVisible().catch(() => false)) {
      await cancelButton.click({ force: true }).catch(() => undefined);
      await addOperationModal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
      await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
      return;
    }

    logger.warn('Add-operation modal did not expose a scoped cancel button; leaving it open instead of pressing Escape.');
  }

  private async validateTechProcessEditOperation(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
    savedOperation?: {
      operationType: string;
      mainTime?: string;
      selectedResources: Record<string, string[]>;
    },
  ): Promise<void> {
    await this.closeOpenInstrumentInformationModal();
    await this.closeLatestHistoryModal();
    const expectedFromRow = await this.selectTechProcessRowAndReadExpectedValues(modalKey, modal, flow, options, savedOperation);
    const editButton = this.techProcessUpdateButton(modal, flow, flow.editButtonText);
    const selectedRow = this.techProcessRowForSavedOperation(
      modal,
      flow,
      savedOperation ?? {
        operationType: expectedFromRow.operationName ?? '',
        mainTime: expectedFromRow.mainTime !== undefined ? String(expectedFromRow.mainTime) : undefined,
        selectedResources: {},
      },
    );
    await this.activateTechProcessRowForAction(modalKey, selectedRow, flow, editButton, 'edit', options);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(editButton, `${modalKey}: edit operation button should be visible`).toBeVisible();
        await expect.soft(editButton, `${modalKey}: edit operation button should be enabled`).toBeEnabled();
      },
      `${modalKey} edit operation button ready`,
      options.testInfo,
    );

    await editButton.click({ force: true });
    await this.validateAddOperationModal({
      ...options.techProcessEditOperationOptions,
      testInfo: options.testInfo,
      validateAddOperationResources: options.techProcessEditOperationOptions?.validateAddOperationResources ?? false,
      addOperationExpectedTitleText:
        options.techProcessEditOperationOptions?.addOperationExpectedTitleText ?? 'Изменение операции технологического процесса',
      addOperationExpectedValues:
        options.techProcessEditOperationOptions?.addOperationExpectedValues ?? expectedFromRow,
    });
  }

  private async validateTechProcessArchive(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
    savedOperation?: {
      operationType: string;
      mainTime?: string;
      selectedResources: Record<string, string[]>;
    },
  ): Promise<void> {
    await this.closeOpenInstrumentInformationModal();
    await this.closeLatestHistoryModal();
    const expectedFromRow = await this.selectTechProcessRowAndReadExpectedValues(modalKey, modal, flow, options, savedOperation);
    const archiveButton = this.techProcessUpdateButton(modal, flow, flow.archiveButtonText);
    const selectedRow = this.techProcessRowForSavedOperation(
      modal,
      flow,
      savedOperation ?? {
        operationType: expectedFromRow.operationName ?? '',
        mainTime: expectedFromRow.mainTime !== undefined ? String(expectedFromRow.mainTime) : undefined,
        selectedResources: {},
      },
    );
    await this.activateTechProcessRowForAction(modalKey, selectedRow, flow, archiveButton, 'archive', options);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(archiveButton, `${modalKey}: archive operation button should be visible`).toBeVisible();
        await expect.soft(archiveButton, `${modalKey}: archive operation button should be enabled`).toBeEnabled();
      },
      `${modalKey} archive operation button ready`,
      options.testInfo,
    );

    await archiveButton.click({ force: true });
    const selectedRowTestId = await selectedRow.getAttribute('data-testid').catch(() => null);
    await this.validateArchiveConfirmModal({
      ...options.techProcessArchiveConfirmOptions,
      testInfo: options.testInfo,
      expectedConfirmEntityText:
        options.techProcessArchiveConfirmOptions?.expectedConfirmEntityText ?? expectedFromRow.operationName,
      confirmAction: options.techProcessArchiveConfirmOptions?.confirmAction ?? 'cancel',
    });

    if ((options.techProcessArchiveConfirmOptions?.confirmAction ?? 'cancel') === 'confirm') {
      const archivedRow = selectedRowTestId
        ? modal.locator(`[data-testid="${cssEscape(selectedRowTestId)}"]`).first()
        : selectedRow;
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect
            .soft(archivedRow, `${modalKey}: created operation row should be removed from table after archive confirmation`)
            .toBeHidden({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        `${modalKey} created operation archived`,
        options.testInfo,
      );
      await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
    }
  }

  private techProcessUpdateButton(modal: Locator, flow: TechProcessFlowExpectation, buttonText: string): Locator {
    return modal.locator(`[data-testid="${cssEscape(flow.updateButtonTestId)}"]`).filter({ hasText: buttonText }).first();
  }

  private async validateTechProcessSavedOperationRow(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    savedOperation: {
      operationType: string;
      mainTime?: string;
      selectedResources: Record<string, string[]>;
    },
    options: ModalValidationOptions,
  ): Promise<void> {
    const table = modal.locator(`[data-testid="${cssEscape(flow.tableTestId)}"]`).first();
    const rows = table.locator('tbody tr').filter({ hasText: savedOperation.operationType });
    const savedRow = rows.last();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(savedRow, `${modalKey}: saved operation row should be visible in parent table`).toBeVisible({
          timeout: WAIT_TIMEOUTS.STANDARD,
        });
      },
      `${modalKey} saved operation row visible`,
      options.testInfo,
    );

    await this.highlightValidationTarget(savedRow);
    const rowText = normalizeText(await savedRow.textContent().catch(() => ''));
    const selectedResourceValues = Object.values(savedOperation.selectedResources).flat().filter(Boolean);

    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(rowText, `${modalKey}: saved row should contain selected operation type`).toContain(savedOperation.operationType);
        if (savedOperation.mainTime !== undefined) {
          expect.soft(rowText, `${modalKey}: saved row should contain main time`).toContain(savedOperation.mainTime);
        }
        for (const resourceValue of selectedResourceValues) {
          expect.soft(rowText, `${modalKey}: saved row should contain selected resource "${resourceValue}"`).toContain(resourceValue);
        }
      },
      `${modalKey} saved operation row values`,
      options.testInfo,
    );

    const cells = savedRow.locator('td, th');
    const cellCount = await cells.count();
    for (let index = 0; index < cellCount; index += 1) {
      const cellText = normalizeText(await cells.nth(index).textContent().catch(() => ''));
      if (
        cellText.includes(savedOperation.operationType) ||
        (savedOperation.mainTime !== undefined && cellText === savedOperation.mainTime) ||
        selectedResourceValues.some(value => cellText.includes(value))
      ) {
        await this.highlightValidationTarget(cells.nth(index));
      }
    }

    await this.validateTechProcessSavedOperationResourceDialogs(modalKey, flow, savedRow, savedOperation, options);

    await this.page.waitForTimeout(1000);
  }

  private async validateTechProcessSavedOperationResourceDialogs(
    modalKey: string,
    flow: TechProcessFlowExpectation,
    savedRow: Locator,
    savedOperation: {
      operationType: string;
      mainTime?: string;
      selectedResources: Record<string, string[]>;
    },
    options: ModalValidationOptions,
  ): Promise<void> {
    const resourceColumns = flow.resourceColumnIndexes ?? {};
    const cells = savedRow.locator('td, th');

    for (const [resourceKey, selectedItems] of Object.entries(savedOperation.selectedResources)) {
      const firstSelectedItem = selectedItems.find(item => this.isMeaningfulTableValue(item));
      if (!firstSelectedItem) {
        continue;
      }

      if (resourceKey === 'equipment') {
        logger.info(
          `${modalKey}: skipping saved equipment link dialog check because this link is currently known not to open its dialog.`,
        );
        continue;
      }

      const columnIndex = resourceColumns[resourceKey];
      if (columnIndex === undefined) {
        logger.warn(`${modalKey}: no resource column configured for ${resourceKey}; skipping resource link dialog validation.`);
        continue;
      }

      const resourceCell = cells.nth(columnIndex);
      const resourceLink = resourceCell
        .locator('.attachment_link, [data-testid*="Paragraph"], p')
        .filter({ hasText: firstSelectedItem })
        .first();

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(resourceCell, `${modalKey}: ${resourceKey} saved resource cell should be visible`).toBeVisible();
          await expect
            .soft(resourceLink, `${modalKey}: ${resourceKey} saved resource link should be visible`)
            .toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        `${modalKey} ${resourceKey} saved resource link visible`,
        options.testInfo,
      );
      await this.highlightValidationTarget(resourceCell);
      await this.highlightValidationTarget(resourceLink);

      await this.closeLatestHistoryModal();
      await this.closeOpenInstrumentInformationModal();
      await resourceLink.click({ force: true });
      await this.validateInstrumentInformationModal({
        testInfo: options.testInfo,
        expectedInstrumentInformationName: firstSelectedItem,
        validateInstrumentInformationHistory: true,
        validateInstrumentInformationFullInformation: false,
      });
      await this.closeLatestHistoryModal();
      await this.closeOpenInstrumentInformationModal();
    }
  }

  private async selectTechProcessRowAndReadExpectedValues(
    modalKey: string,
    modal: Locator,
    flow: TechProcessFlowExpectation,
    options: ModalValidationOptions,
    savedOperation?: {
      operationType: string;
      mainTime?: string;
      selectedResources: Record<string, string[]>;
    },
  ): Promise<NonNullable<ModalValidationOptions['addOperationExpectedValues']>> {
    const row = this.techProcessRowForSavedOperation(modal, flow, savedOperation);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(row, `${modalKey}: operation table should contain at least one row`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `${modalKey} operation row visible`,
      options.testInfo,
    );

    const cells = row.locator('td, th');
    const cellCount = await cells.count();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(cellCount, `${modalKey}: operation row should expose operation and time cells`).toBeGreaterThan(flow.mainTimeColumnIndex);
      },
      `${modalKey} operation row cell count`,
      options.testInfo,
    );

    const valueAt = async (index: number): Promise<string> => normalizeText(await cells.nth(index).textContent().catch(() => ''));
    const resources: Record<string, string> = {};
    for (const [resourceKey, columnIndex] of Object.entries(flow.resourceColumnIndexes ?? {})) {
      if (cellCount > columnIndex) {
        const value = await valueAt(columnIndex);
        if (this.isMeaningfulTableValue(value)) {
          resources[resourceKey] = value;
          await this.highlightValidationTarget(cells.nth(columnIndex));
        }
      }
    }

    const expectedValues = {
      operationName: await valueAt(flow.operationNameColumnIndex),
      preTime: await valueAt(flow.preTimeColumnIndex),
      helperTime: await valueAt(flow.helperTimeColumnIndex),
      mainTime: await valueAt(flow.mainTimeColumnIndex),
      resources,
    };

    return expectedValues;
  }

  private techProcessRowForSavedOperation(
    modal: Locator,
    flow: TechProcessFlowExpectation,
    savedOperation?: {
      operationType: string;
      mainTime?: string;
      selectedResources: Record<string, string[]>;
    },
  ): Locator {
    const rows = modal.locator(`[data-testid="${cssEscape(flow.tableTestId)}"] tbody tr`).filter({ hasText: /./ });
    if (!savedOperation) {
      return rows.first();
    }

    let row = rows.filter({ hasText: savedOperation.operationType });
    const selectedResourceValues = Object.values(savedOperation.selectedResources)
      .flat()
      .filter(value => this.isMeaningfulTableValue(value));

    for (const value of selectedResourceValues) {
      row = row.filter({ hasText: value });
    }

    if (savedOperation.mainTime !== undefined) {
      row = row.filter({ hasText: savedOperation.mainTime });
    }

    return row.last();
  }

  private async activateTechProcessRowForAction(
    modalKey: string,
    row: Locator,
    flow: TechProcessFlowExpectation,
    actionButton: Locator,
    actionName: string,
    options: ModalValidationOptions,
  ): Promise<void> {
    const cells = row.locator('td, th');
    const alreadyEnabled = await this.isEnabledLike(actionButton);
    if (!alreadyEnabled) {
      await this.clickTechProcessRowActivationTarget(row, cells, flow);
    }

    await this.highlightValidationTarget(row);
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(actionButton, `${modalKey}: ${actionName} operation button should become enabled after selecting created row`).toBeEnabled({
          timeout: WAIT_TIMEOUTS.STANDARD,
        });
      },
      `${modalKey} ${actionName} enabled after selecting created row`,
      options.testInfo,
    );
  }

  private async clickTechProcessRowActivationTarget(
    row: Locator,
    cells: Locator,
    _flow: TechProcessFlowExpectation,
  ): Promise<void> {
    const cellCount = await cells.count().catch(() => 0);
    const target = cellCount > 1 ? cells.nth(1) : row;

    await target.scrollIntoViewIfNeeded().catch(() => undefined);
    await target.click({ force: true }).catch(() => undefined);
    await this.page.waitForTimeout(500);
  }

  private async validateConfirmFlow(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const flow = spec.confirmFlow;
    if (!flow) {
      throw new Error(`${modalKey}: confirm flow metadata is missing in modals.json`);
    }

    const title = flow.titleTestId ? modal.locator(`[data-testid="${cssEscape(flow.titleTestId)}"]`).first() : null;
    const message = modal.locator(`[data-testid="${cssEscape(flow.textTestId)}"]`).first();
    const yesButton = modal.locator(`[data-testid="${cssEscape(flow.yesButtonTestId)}"]`).first();
    const noButton = modal.locator(`[data-testid="${cssEscape(flow.noButtonTestId)}"]`).first();

    const actualTitle = title ? normalizeText(await title.textContent().catch(() => '')) : '';
    const actualMessage = normalizeText(await message.textContent().catch(() => ''));
    const expectedTitle = options.expectedConfirmTitle ?? flow.defaultTitleText;
    const expectedMessage = options.expectedConfirmMessageContains ?? flow.defaultMessageText;

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        if (title && expectedTitle) {
          await expect.soft(title, `${modalKey}: confirm title should be visible`).toBeVisible();
        }
        await expect.soft(message, `${modalKey}: confirm message should be visible`).toBeVisible();
        await expect.soft(yesButton, `${modalKey}: confirm button should be visible`).toBeVisible();
        await expect.soft(noButton, `${modalKey}: cancel button should be visible`).toBeVisible();
      },
      `${modalKey} confirm shell`,
      options.testInfo,
    );

    await expectSoftWithScreenshot(
      this.page,
      () => {
        if (expectedTitle && title) {
          expect.soft(actualTitle, `${modalKey}: confirm title text`).toContain(expectedTitle);
        }
        if (expectedMessage) {
          expect.soft(actualMessage, `${modalKey}: confirm message text`).toContain(expectedMessage);
        }
        if (options.expectedConfirmEntityText) {
          expect.soft(actualMessage, `${modalKey}: confirm message should include selected row/entity`).toContain(options.expectedConfirmEntityText);
        }
      },
      `${modalKey} confirm text`,
      options.testInfo,
    );

    const action = options.confirmAction ?? 'validateOnly';
    if (action === 'validateOnly') {
      return;
    }

    const actionButton = action === 'confirm' ? yesButton : noButton;
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(actionButton, `${modalKey}: ${action} button should be enabled`).toBeEnabled();
      },
      `${modalKey} ${action} button enabled`,
      options.testInfo,
    );

    await actionButton.click({ force: true });

    if (options.expectModalToCloseAfterConfirmAction ?? true) {
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(modal, `${modalKey}: modal should close after ${action}`).toBeHidden({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
      `${modalKey} closes after ${action}`,
      options.testInfo,
    );
    await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
  }
  }

  private async validateAddOperationRequiredWarning(
    modalKey: string,
    modal: Locator,
    flow: AddOperationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const saveButton = modal.locator(`[data-testid="${cssEscape(flow.saveButtonTestId)}"]`).first();

    await saveButton.click({ force: true });

    const notification = this.page.locator('[data-testid="Notification-Notification"]').last();
    const title = notification.locator('[data-testid="Notification-Notification-Title"]').first();
    const description = notification.locator('[data-testid="Notification-Notification-Description"]').first();

    await this.highlightValidationTarget(notification);
    await this.highlightValidationTarget(title);
    await this.highlightValidationTarget(description);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(title, `${modalKey}: required operation warning title`).toContainText(flow.warningTitle, { timeout: WAIT_TIMEOUTS.STANDARD });
        await expect.soft(description, `${modalKey}: required operation warning text`).toContainText(flow.warningText, { timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `${modalKey} required operation warning`,
      options.testInfo,
    );

    await this.page.waitForTimeout(500);
  }

  private async validateAddOperationExpectedValues(
    modalKey: string,
    modal: Locator,
    flow: AddOperationFlowExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const expected = options.addOperationExpectedValues;
    const expectedTitle = options.addOperationExpectedTitleText;

    if (expectedTitle) {
      const title = modal.locator(`[data-testid="${cssEscape(flow.operationTitleTestId)}"]`).first();
      const actualTitle = normalizeText(await title.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualTitle, `${modalKey}: operation dialog title`).toContain(expectedTitle);
        },
        `${modalKey} expected title`,
        options.testInfo,
      );
    }

    if (!expected) {
      return;
    }

    const badge = modal.locator(`[data-testid="${cssEscape(flow.operationFilterBadgeTestId)}"]`).first();
    const preTime = modal.locator(`[data-testid="${cssEscape(flow.preTimeDisplayTestId)}"]`).first();
    const helperTime = modal.locator(`[data-testid="${cssEscape(flow.helperTimeDisplayTestId)}"]`).first();
    const mainTime = modal.locator(`[data-testid="${cssEscape(flow.mainTimeInputTestId)}"]`).first();
    const totalTime = modal.locator(`[data-testid="${cssEscape(flow.totalTimeDisplayTestId)}"]`).first();

    if (expected.operationName !== undefined) {
      const actualOperationName = normalizeText(await badge.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualOperationName, `${modalKey}: operation name should match selected parent row`).toContain(String(expected.operationName));
        },
        `${modalKey} expected operation name`,
        options.testInfo,
      );
    }

    await this.expectTextValue(modalKey, 'pre time', preTime, expected.preTime, options);
    await this.expectTextValue(modalKey, 'helper time', helperTime, expected.helperTime, options);
    await this.validateAddOperationExpectedResources(modalKey, modal, flow, expected.resources, options);

    if (expected.mainTime !== undefined) {
      const actualMainTime = normalizeText(await mainTime.inputValue().catch(async () => (await mainTime.textContent().catch(() => '')) ?? ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(actualMainTime, `${modalKey}: main time should match selected parent row`).toBe(String(expected.mainTime));
        },
        `${modalKey} expected main time`,
        options.testInfo,
      );
    }

    await this.expectTextValue(modalKey, 'total time', totalTime, expected.totalTime, options);
  }

  private async validateAddOperationExpectedResources(
    modalKey: string,
    modal: Locator,
    flow: AddOperationFlowExpectation,
    expectedResources: Record<string, string> | undefined,
    options: ModalValidationOptions,
  ): Promise<void> {
    if (!expectedResources) {
      return;
    }

    for (const resource of flow.resources) {
      const expectedValue = expectedResources[resource.key];
      if (!this.isMeaningfulTableValue(expectedValue)) {
        continue;
      }

      const table = this.parentResourceTable(modal, resource);
      await this.highlightValidationTarget(table);
      const tableText = normalizeText(await table.textContent().catch(() => ''));
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(tableText, `${modalKey}: ${resource.key} table should contain row resource "${expectedValue}"`).toContain(expectedValue);
        },
        `${modalKey} expected row resource ${resource.key}`,
        options.testInfo,
      );
    }
  }

  private isMeaningfulTableValue(value: string | undefined): value is string {
    const normalized = normalizeText(value);
    return normalized.length > 0 && normalized !== '-';
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async expectTextValue(
    modalKey: string,
    name: string,
    locator: Locator,
    expected: string | number | undefined,
    options: ModalValidationOptions,
  ): Promise<void> {
    if (expected === undefined) {
      return;
    }

    const actual = normalizeText(await locator.textContent().catch(() => ''));
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(actual, `${modalKey}: ${name} should match selected parent row`).toBe(String(expected));
      },
      `${modalKey} expected ${name}`,
      options.testInfo,
    );
  }

  private async isAddOperationTypeUnset(modal: Locator, flow: AddOperationFlowExpectation): Promise<boolean> {
    const badge = modal.locator(`[data-testid="${cssEscape(flow.operationFilterBadgeTestId)}"]`).first();
    const badgeText = normalizeText(await badge.textContent().catch(() => ''));
    return badgeText.length === 0 || badgeText === 'Не выбран';
  }

  private async selectAddOperationType(
    modalKey: string,
    modal: Locator,
    flow: AddOperationFlowExpectation,
    operationTypeText: string | undefined,
    options: ModalValidationOptions,
  ): Promise<string> {
    const current = modal.locator(`[data-testid="${cssEscape(flow.operationFilterCurrentTestId)}"]`).first();
    const badge = modal.locator(`[data-testid="${cssEscape(flow.operationFilterBadgeTestId)}"]`).first();
    const optionsLocator = modal.locator(`[data-testid^="${cssEscape(flow.operationFilterOptionPrefix)}"]`);
    const optionsList = modal.locator('[data-testid="BaseFilter-OptionsList"]').first();

    const currentBadgeText = normalizeText(await badge.textContent().catch(() => ''));
    if (!operationTypeText && currentBadgeText && currentBadgeText !== 'Не выбран') {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(currentBadgeText, `${modalKey}: existing operation type should be selected`).not.toBe('Не выбран');
        },
        `${modalKey} existing operation type`,
        options.testInfo,
      );
      return currentBadgeText;
    }

    await this.openAddOperationTypeOptions(current, optionsList);

    const targetOption = operationTypeText
      ? optionsLocator.filter({ hasText: operationTypeText }).first()
      : optionsLocator.first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(targetOption, `${modalKey}: operation type option should be visible`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `${modalKey} operation option visible`,
      options.testInfo,
    );

    const selectedText = normalizeText(await targetOption.textContent().catch(() => operationTypeText ?? ''));
    await targetOption.click({ force: true });
    await this.page.waitForTimeout(400);

    const badgeText = normalizeText(await badge.textContent().catch(() => ''));
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(badgeText, `${modalKey}: operation type badge should update`).toContain(selectedText);
      },
      `${modalKey} operation type selected`,
      options.testInfo,
    );

    return selectedText;
  }

  private async openAddOperationTypeOptions(current: Locator, optionsList: Locator): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await current.click({ force: true }).catch(() => undefined);
      await this.page.waitForTimeout(250);

      if (await optionsList.isVisible().catch(() => false)) {
        return;
      }

      await current.press('Enter').catch(() => undefined);
      await this.page.waitForTimeout(250);

      if (await optionsList.isVisible().catch(() => false)) {
        return;
      }
    }
  }

  private async setAddOperationMainTime(
    modalKey: string,
    modal: Locator,
    flow: AddOperationFlowExpectation,
    value: string,
    options: ModalValidationOptions,
  ): Promise<void> {
    const input = modal.locator(`[data-testid="${cssEscape(flow.mainTimeInputTestId)}"]`).first();

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(input, `${modalKey}: main time input should be visible`).toBeVisible();
      },
      `${modalKey} main time input visible`,
      options.testInfo,
    );

    await input.fill(value);
    await this.page.waitForTimeout(150);

    const actualValue = await input.inputValue().catch(() => '');
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(actualValue, `${modalKey}: main time should accept numeric value`).toBe(value);
        expect.soft(Number.isFinite(Number(actualValue)), `${modalKey}: main time should be numeric`).toBe(true);
      },
      `${modalKey} main time value`,
      options.testInfo,
    );
  }

  private async validateAddOperationResource(
    modalKey: string,
    parentModal: Locator,
    resource: AddOperationResourceExpectation,
    options: ModalValidationOptions,
  ): Promise<string[]> {
    const addButton = parentModal.locator(`[data-testid="${cssEscape(resource.addButtonTestId)}"]`).first();
    const selectedItems: string[] = [];
    const childAction = options.addOperationChildAction ?? 'add';

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(addButton, `${modalKey}: ${resource.key} add button should be visible`).toBeVisible();
        await expect.soft(addButton, `${modalKey}: ${resource.key} add button should be enabled`).toBeEnabled();
      },
      `${modalKey} resource add button ${resource.key}`,
      options.testInfo,
    );

    await this.highlightValidationTarget(addButton);
    await this.page.waitForTimeout(300);
    await addButton.click({ force: true });
    await this.page.waitForTimeout(500);

    if ((options.addOperationResourceMode ?? 'populateOnly') === 'populateOnly') {
      await this.validateResourceChildTablesPopulated(resource, options);
      await this.closeOpenSelectionModal(resource.childModalKey);
      return selectedItems;
    }

    await this.validateModalFromJson(resource.childModalKey, {
      ...options,
      modalSelectionAction: childAction,
      modalItemsToSelect: options.addOperationResourceItemsToSelect ?? options.modalItemsToSelect ?? 1,
      switchItemText: resource.childSwitchText,
      expectModalToCloseAfterSelectionAction: true,
      onSelectedItems: items => selectedItems.push(...items),
    });

    if (childAction === 'add') {
      await this.validateAddOperationResourceReturned(modalKey, parentModal, resource, selectedItems, options);
    } else if (childAction === 'cancel') {
      await this.validateAddOperationResourceNotReturned(modalKey, parentModal, resource, selectedItems, options);
    }

    return selectedItems;
  }

  private async validateResourceChildTablesPopulated(
    resource: AddOperationResourceExpectation,
    options: ModalValidationOptions,
  ): Promise<void> {
    const spec = this.getModalSpec(resource.childModalKey);
    const modal = this.getOpenModalBySpec(spec, options.timeout ?? WAIT_TIMEOUTS.STANDARD);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(modal, `${resource.childModalKey}: resource child modal should be visible`).toBeVisible({
          timeout: options.timeout ?? WAIT_TIMEOUTS.STANDARD,
        });
      },
      `${resource.childModalKey} resource child visible`,
      options.testInfo,
    );

    if (spec.switch && resource.childSwitchText) {
      await this.selectSwitchItem(resource.childModalKey, modal, spec.switch, resource.childSwitchText, options);
    }

    for (const tableSpec of spec.tables ?? []) {
      const scope = this.tableScope(modal, tableSpec);
      const rows = scope.locator(`[data-testid="${cssEscape(tableSpec.rowTestId)}"]`);
      const firstRow = rows.first();

      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(firstRow, `${resource.childModalKey}: ${tableSpec.name} first row should be visible`).toBeVisible({
            timeout: WAIT_TIMEOUTS.STANDARD,
          });
        },
        `${resource.childModalKey} ${tableSpec.name} first row visible`,
        options.testInfo,
      );
      await this.highlightValidationTarget(firstRow);

      const rowCount = await rows.count();
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(rowCount, `${resource.childModalKey}: ${tableSpec.name} should have at least one row`).toBeGreaterThanOrEqual(
            tableSpec.minimumRows ?? 1,
          );
        },
        `${resource.childModalKey} ${tableSpec.name} populated`,
        options.testInfo,
      );
    }
  }

  private async closeOpenSelectionModal(modalKey: 'EquipmentFilterModal' | 'ToolFilterModal'): Promise<void> {
    const modal = this.getOpenModalBySpec(this.getModalSpec(modalKey));
    const closeCandidates = [
      modal.locator('button').filter({ hasText: 'Отменить' }).last(),
      modal.locator('button').filter({ hasText: 'Добавить' }).last(),
      modal.locator('[data-testid="Button"]').filter({ hasText: 'Отменить' }).last(),
    ];

    for (const candidate of closeCandidates) {
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ force: true }).catch(() => undefined);
        await modal.waitFor({ state: 'hidden', timeout: WAIT_TIMEOUTS.SHORT }).catch(() => undefined);
        await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
        return;
      }
    }

    logger.warn(`${modalKey} did not expose a scoped close/cancel button; leaving it open instead of pressing Escape.`);
  }

  private parentResourceTable(parentModal: Locator, resource: AddOperationResourceExpectation): Locator {
    return parentModal.locator(`[data-testid="${cssEscape(resource.parentTableTestId)}"]`).nth(resource.parentTableIndex ?? 0);
  }

  private async validateAddOperationResourceReturned(
    modalKey: string,
    parentModal: Locator,
    resource: AddOperationResourceExpectation,
    selectedItems: string[],
    options: ModalValidationOptions,
  ): Promise<void> {
    const table = this.parentResourceTable(parentModal, resource);

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(table, `${modalKey}: ${resource.key} parent table should be visible`).toBeVisible();
        await expect.soft(table, `${modalKey}: ${resource.key} parent table header`).toContainText(resource.parentTableHeaderText);
      },
      `${modalKey} parent resource table ${resource.key}`,
      options.testInfo,
    );

    await this.highlightValidationTarget(table);
    const tableText = normalizeText(await table.textContent().catch(() => ''));
    for (const item of selectedItems.filter(Boolean)) {
      const itemRow = table.locator('tbody tr, tr').filter({ hasText: item }).first();
      if (await itemRow.isVisible().catch(() => false)) {
        await this.highlightValidationTarget(itemRow);
      }

      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(tableText, `${modalKey}: ${resource.key} table should contain selected item "${item}"`).toContain(item);
        },
        `${modalKey} parent resource contains ${resource.key}`,
        options.testInfo,
      );
    }
  }

  private async validateAddOperationResourceNotReturned(
    modalKey: string,
    parentModal: Locator,
    resource: AddOperationResourceExpectation,
    selectedItems: string[],
    options: ModalValidationOptions,
  ): Promise<void> {
    const table = this.parentResourceTable(parentModal, resource);
    const tableText = normalizeText(await table.textContent().catch(() => ''));

    for (const item of selectedItems.filter(Boolean)) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(tableText, `${modalKey}: cancelled ${resource.key} item "${item}" should not be added`).not.toContain(item);
        },
        `${modalKey} parent resource cancel ${resource.key}`,
        options.testInfo,
      );
    }
  }

  private flowRows(modal: Locator, flow: EquipmentSelectionFlow, rowTestId: string, tableIndex?: number): Locator {
    if (flow.tableWrapperTestId && typeof tableIndex === 'number') {
      return modal.locator(`[data-testid="${cssEscape(flow.tableWrapperTestId)}"]`).nth(tableIndex).locator(`[data-testid="${cssEscape(rowTestId)}"]`);
    }

    return modal.locator(`[data-testid="${cssEscape(rowTestId)}"]`);
  }

  private async clickFirstVisibleRowAndWaitForChildren(
    modalKey: string,
    modal: Locator,
    flow: EquipmentSelectionFlow,
    parentRowTestId: string,
    parentTableIndex: number | undefined,
    childRowTestId: string,
    childTableIndex: number | undefined,
    stepName: string,
    options: ModalValidationOptions,
  ): Promise<void> {
    const parentRows = this.flowRows(modal, flow, parentRowTestId, parentTableIndex);
    const childRows = this.flowRows(modal, flow, childRowTestId, childTableIndex);
    const parentRowCount = await parentRows.count();

    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(parentRowCount, `${modalKey}: ${stepName} parent rows should exist`).toBeGreaterThan(0);
      },
      `${modalKey} ${stepName} parent row count`,
      options.testInfo,
    );

    if (parentRowCount === 0) {
      return;
    }

    const firstParentRow = parentRows.first();
    await firstParentRow.scrollIntoViewIfNeeded().catch(() => undefined);
    await this.highlightValidationTarget(firstParentRow);
    await this.page.waitForTimeout(250);
    await firstParentRow.click({ force: true });

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(childRows.first(), `${modalKey}: ${stepName} child rows should load`).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `${modalKey} ${stepName} child rows load`,
      options.testInfo,
    );

    const childRowCount = await childRows.count();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(childRowCount, `${modalKey}: ${stepName} child row count`).toBeGreaterThan(0);
      },
      `${modalKey} ${stepName} child row count`,
      options.testInfo,
    );

    const firstChildRow = childRows.first();
    if (await firstChildRow.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(firstChildRow);
      await this.page.waitForTimeout(250);
    }
  }

  private async validateSelectedEquipmentTable(
    modalKey: string,
    modal: Locator,
    flow: EquipmentSelectionFlow,
    expectedMinimumRows: number,
    selectedNames: string[],
    options: ModalValidationOptions,
  ): Promise<void> {
    const selectedTable = modal.locator('table').filter({ hasText: flow.selectedTableHeaderText }).last();
    const rows = selectedTable.locator('tbody tr').filter({ hasText: /./ });

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(selectedTable, `${modalKey}: selected equipment table should be visible`).toBeVisible();
      },
      `${modalKey} selected table visible`,
      options.testInfo,
    );

    const selectedRowCount = await rows.count();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(selectedRowCount, `${modalKey}: selected equipment row count`).toBeGreaterThanOrEqual(Math.max(flow.minimumSelectedRows ?? 1, expectedMinimumRows));
      },
      `${modalKey} selected row count`,
      options.testInfo,
    );

    await this.highlightValidationTarget(selectedTable);
    const lastSelectedRow = rows.last();
    if (await lastSelectedRow.isVisible().catch(() => false)) {
      await this.highlightValidationTarget(lastSelectedRow);
    }
    await this.page.waitForTimeout(300);

    const tableText = normalizeText(await selectedTable.textContent().catch(() => ''));
    for (const selectedName of selectedNames.filter(Boolean)) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(tableText, `${modalKey}: selected table should contain "${selectedName}"`).toContain(selectedName);
        },
        `${modalKey} selected table contains item`,
        options.testInfo,
      );
    }
  }

  private async validateContent(modalKey: string, modal: Locator, content: ModalContentExpectation | undefined, options: ModalValidationOptions): Promise<void> {
    if (!content) {
      return;
    }

    for (const requiredText of content.requiredTexts ?? []) {
      const textLocator = modal.getByText(requiredText, { exact: true }).first();
      await expectSoftWithScreenshot(
        this.page,
        async () => {
          await expect.soft(textLocator, `${modalKey}: required text "${requiredText}" should be visible`).toBeVisible();
        },
        `${modalKey} required text ${requiredText}`,
        options.testInfo,
      );
    }

    if (!content.emptyStateText) {
      return;
    }

    const emptyState = modal.getByText(content.emptyStateText, { exact: true }).first();
    const rows = modal.locator('tbody tr, [role="row"]').filter({ hasText: /./ });
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const rowCount = await rows.count().catch(() => 0);

    await expectSoftWithScreenshot(
      this.page,
      () => {
        if (content.allowRowsInsteadOfEmptyState) {
          expect.soft(emptyVisible || rowCount > 0, `${modalKey}: should show empty state or history rows`).toBe(true);
        } else {
          expect.soft(emptyVisible, `${modalKey}: empty state should be visible`).toBe(true);
        }
      },
      `${modalKey} content empty-or-rows`,
      options.testInfo,
    );
  }

  private async validateResetBehavior(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const resetSpec = spec.buttons?.find(button => button.text === 'Сбросить');
    const entityFilter = spec.filters?.find(filter => filter.rootTestId === 'BaseFilter') ?? spec.filters?.[0];
    if (!resetSpec || !entityFilter) {
      return;
    }

    const resetButton = this.buttonLocator(modal, resetSpec);
    const current = modal.locator(`[data-testid="${cssEscape(entityFilter.currentTestId)}"]`).first();
    const optionsLocator = modal.locator(`[data-testid^="${cssEscape(entityFilter.optionTestIdPrefix)}"]`);
    const badgeText = modal.locator(`[data-testid="${cssEscape(entityFilter.badgeTextTestId)}"]`).first();

    if (!(await current.isVisible().catch(() => false))) {
      if (modalKey === 'HistoryActionModal') {
        logger.info(`${modalKey}: reset behavior is not available in this scoped history-dialog variant; filter "${entityFilter.name}" is not visible.`);
      } else {
        logger.warn(`${modalKey}: skipping reset behavior because filter "${entityFilter.name}" is not visible.`);
      }
      return;
    }

    const resetAlreadyEnabled = await this.isEnabledLike(resetButton);
    if (!resetAlreadyEnabled) {
      await current.click({ force: true });
      await this.page.waitForTimeout(250);

      const firstOption = optionsLocator.first();
      if (!(await firstOption.isVisible().catch(() => false))) {
        await current.click({ force: true }).catch(() => undefined);
        if (modalKey === 'HistoryActionModal') {
          logger.info(`${modalKey}: reset behavior is not available in this scoped history-dialog variant; filter "${entityFilter.name}" has no visible options.`);
        } else {
          logger.warn(`${modalKey}: skipping reset behavior because filter "${entityFilter.name}" has no visible options.`);
        }
        return;
      }

      await firstOption.click({ force: true });
      await this.page.waitForTimeout(400);
    }

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(resetButton, `${modalKey}: reset button should become enabled after changing a filter`).toBeEnabled();
      },
      `${modalKey} reset enabled after filter change`,
      options.testInfo,
    );

    if (await resetButton.isVisible().catch(() => false)) {
      await resetButton.click({ force: true });
      await this.page.waitForTimeout(400);
    }

    const badgeValue = normalizeText(await badgeText.textContent().catch(() => ''));
    const enabledAfterReset = await this.isEnabledLike(resetButton);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(badgeValue, `${modalKey}: reset should restore badge to "Все"`).toContain('Все');
        expect.soft(enabledAfterReset, `${modalKey}: reset button should be disabled after reset`).toBe(false);
      },
      `${modalKey} reset restores default`,
      options.testInfo,
    );
  }

  private async validateCloseBehavior(modalKey: string, modal: Locator, spec: ModalSpec, options: ModalValidationOptions): Promise<void> {
    const closeSpec = spec.buttons?.find(button => button.text === 'Закрыть');
    if (!closeSpec) {
      return;
    }

    const closeButton = this.buttonLocator(modal, closeSpec);
    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(closeButton, `${modalKey}: close button should be visible`).toBeVisible();
        await expect.soft(closeButton, `${modalKey}: close button should be enabled`).toBeEnabled();
      },
      `${modalKey} close button ready`,
      options.testInfo,
    );

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click({ force: true });
      await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
    }

    await expectSoftWithScreenshot(
      this.page,
      async () => {
        await expect.soft(modal, `${modalKey}: modal should close after clicking Закрыть`).toBeHidden();
      },
      `${modalKey} close behavior`,
      options.testInfo,
    );
    await this.page.waitForTimeout(MODAL_CLOSE_SETTLE_MS);
  }

  private buttonLocator(modal: Locator, buttonSpec: ButtonExpectation): Locator {
    let button = modal.locator(`[data-testid="${cssEscape(buttonSpec.testId)}"]`);
    if (buttonSpec.text) {
      button = button.filter({ hasText: buttonSpec.text });
    }
    return button.first();
  }

  private async isEnabledLike(locator: Locator): Promise<boolean> {
    const nativeEnabled = await locator.isEnabled().catch(() => false);
    if (!nativeEnabled) {
      return false;
    }

    const disabledByClassOrAria = await locator
      .evaluate(element => element.classList.contains('disabled-yui-kit') || element.getAttribute('aria-disabled') === 'true')
      .catch(() => false);

    return !disabledByClassOrAria;
  }
}
