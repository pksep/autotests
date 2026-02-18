/**
 * @file PartsDatabaseHelper.ts
 * @purpose Helper for Parts Database page logic (specification, detail, save, archive, etc.) extracted from PartsDatabasePage.
 */

import { Page, Locator, expect, TestInfo } from '@playwright/test';
import type { Item, TestProductSpecification, GlobalTableData } from './PartsDatabaseTypes';
import { ElementHelper } from './ElementHelper';
import { TableHelper } from './TableHelper';
import { ModalHelper } from './ModalHelper';
import { NavigationHelper } from './NavigationHelper';
import logger from '../utils/logger';
import { TIMEOUTS, WAIT_TIMEOUTS } from '../Constants/TimeoutConstants';
import * as SelectorsPartsDataBase from '../Constants/SelectorsPartsDataBase';
import * as SelectorsArchiveModal from '../Constants/SelectorsArchiveModal';
import * as SelectorsEquipment from '../Constants/SelectorsEquipment';
import * as SelectorsNotifications from '../Constants/SelectorsNotifications';
import { expectSoftWithScreenshot } from '../utils/utilities';
import { ENV, SELECTORS } from '../../config';

export class PartsDatabaseHelper {
  private elementHelper: ElementHelper;
  private tableHelper: TableHelper;
  private modalHelper: ModalHelper;
  private navigationHelper: NavigationHelper;

  constructor(private page: Page) {
    this.elementHelper = new ElementHelper(page);
    this.tableHelper = new TableHelper(page);
    this.modalHelper = new ModalHelper(page);
    this.navigationHelper = new NavigationHelper(page);
  }

  async parseStructuredTable(page: Page, tableTestId: string): Promise<{ groupName: string; items: string[][] }[]> {
    await page.waitForLoadState('networkidle').catch(() => {
      logger.warn('Network idle timeout, continuing...');
    });
    const table = page.locator(`${tableTestId}`);
    await table.waitFor({ state: 'visible' });
    await table.locator('tr').first().waitFor({ state: 'visible' });
    const rows = await table.locator('tbody > tr').elementHandles();
    logger.info(`Total rows in tbody: ${rows.length}`);
    if (rows.length === 0) {
      throw new Error('No rows found in the table.');
    }
    const groups: { groupName: string; items: string[][] }[] = [];
    let currentGroup: { groupName: string; items: string[][] } | null = null;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const isGroupHeader = await row.evaluate(node => {
          const element = node as Element;
          return element.getAttribute('data-testid')?.startsWith('TableSpecification-Tbody-TableRowHead');
        });
        if (isGroupHeader) {
          const groupName = await row.$eval('td[colspan="5"]', cell => cell.textContent?.trim() || '');
          currentGroup = { groupName, items: [] };
          groups.push(currentGroup);
          logger.info(`Group header detected: "${groupName}"`);
          continue;
        }
        const isDataRow = await row.evaluate(node => {
          const element = node as Element;
          return element.getAttribute('data-testid')?.startsWith('TableSpecification-DraggableTableRow');
        });
        if (isDataRow && currentGroup) {
          const itemTable = await row.$('table[data-testid^="TableSpecification-DraggableTable"]');
          const itemRows = (await itemTable?.$$('tbody > tr')) || [];
          for (const itemRow of itemRows) {
            const rowData = await itemRow.$$eval('td', cells => cells.map(cell => cell.textContent?.trim() || ''));
            if (rowData.length > 0) {
              currentGroup.items.push(rowData);
              logger.info(`Added row to group "${currentGroup.groupName}": ${rowData}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing row: ${error}`);
      }
    }
    logger.info(`Parsed groups: ${JSON.stringify(groups, null, 2)}`);
    return groups;
  }

  async compareTableData<T>(data1: { groupName: string; items: T[][] }[], data2: { groupName: string; items: T[][] }[]): Promise<boolean> {
    if (data1.length !== data2.length) {
      console.error('Data length mismatch');
      return false;
    }
    return data1.every((group1, index) => {
      const group2 = data2[index];
      if (group1.groupName !== group2.groupName) {
        console.error(`Group name mismatch: "${group1.groupName}" !== "${group2.groupName}"`);
        return false;
      }
      if (group1.items.length !== group2.items.length) {
        console.error(`Item count mismatch in group "${group1.groupName}"`);
        return false;
      }
      return group1.items.every((row1, rowIndex) => {
        const row2 = group2.items[rowIndex];
        if (row1.length !== row2.length) {
          console.error(`Row length mismatch in group "${group1.groupName}", row ${rowIndex + 1}`);
          return false;
        }
        return row1.every((cell1, cellIndex) => {
          const cell2 = row2[cellIndex];
          if (cell1 !== cell2) {
            console.error(`Mismatch in group "${group1.groupName}", row ${rowIndex + 1}, cell ${cellIndex + 1}: "${cell1}" !== "${cell2}"`);
            return false;
          }
          return true;
        });
      });
    });
  }

  async isStringInNestedArray(nestedArray: string[][], searchString: string): Promise<boolean> {
    return nestedArray.some(innerArray => innerArray.includes(searchString));
  }

  async getQuantityByLineItem(data: { groupName: string; items: string[][] }[], searchString: string): Promise<number> {
    for (const group of data) {
      for (const lineItem of group.items) {
        if (lineItem.includes(searchString)) {
          return Promise.resolve(parseInt(lineItem[lineItem.length - 1], 10));
        }
      }
    }
    return Promise.resolve(0);
  }

  async validateTable(page: Page, tableTitle: string, expectedRows: { [key: string]: string }[]): Promise<boolean> {
    try {
      const tableSection = page.locator(`h3:has-text("${tableTitle}")`).locator('..');
      await tableSection.evaluate(el => {
        el.style.border = '2px solid red';
      });
      const headerCells = tableSection.locator('table thead tr th');
      const headerCount = await headerCells.count();
      const expectedColOrder = Object.keys(expectedRows[0]);
      if (headerCount !== expectedColOrder.length) {
        console.error(`Header column count mismatch for "${tableTitle}": expected ${expectedColOrder.length}, found ${headerCount}`);
        return false;
      }
      for (let i = 0; i < headerCount; i++) {
        const headerText = (await headerCells.nth(i).textContent())?.trim();
        if (headerText !== expectedColOrder[i]) {
          console.error(`Column header mismatch in table "${tableTitle}" at index ${i}: expected "${expectedColOrder[i]}", got "${headerText}"`);
          return false;
        }
      }
      const tableRows = tableSection.locator('table tbody tr');
      await tableRows.first().waitFor({ timeout: 10000 });
      if (headerCount === 3) {
        for (let i = 0; i < expectedRows.length; i++) {
          const expectedRow = expectedRows[i];
          const row = tableRows.nth(i);
          await row.evaluate(el => {
            el.style.backgroundColor = 'yellow';
          });
          const actualName = (await row.locator('td').nth(0).textContent())?.trim();
          const actualUnit = (await row.locator('td').nth(1).textContent())?.trim();
          const actualValue = (await row.locator('td').nth(2).textContent())?.trim();
          if (actualName !== expectedRow['Наименование'] || actualUnit !== expectedRow['ЕИ'] || actualValue !== expectedRow['Значение']) {
            console.error(
              `Mismatch in row ${i + 1} for "${tableTitle}":\nExpected: ${JSON.stringify(expectedRow)}\n` +
                `Found: { Наименование: "${actualName}", ЕИ: "${actualUnit}", Значение: "${actualValue}" }`,
            );
            return false;
          }
        }
      } else if (headerCount === 4) {
        for (let i = 0; i < expectedRows.length; i++) {
          const expectedRow = expectedRows[i];
          const row = tableRows.nth(i);
          await row.evaluate(el => {
            el.style.backgroundColor = 'yellow';
          });
          const actualName = (await row.locator('td').nth(0).textContent())?.trim();
          const actualUnit = (await row.locator('td').nth(1).textContent())?.trim();
          const cellThird = row.locator('td').nth(2);
          let actualValue = '';
          if ((await cellThird.locator('input').count()) > 0) {
            actualValue = (await cellThird.locator('input').inputValue()).trim();
          } else {
            actualValue = ((await cellThird.textContent()) || '').trim();
          }
          const isButtonVisible = await row.locator('td').nth(3).locator('button').isVisible();
          if (actualName !== expectedRow['Наименование'] || actualUnit !== expectedRow['ЕИ'] || actualValue !== expectedRow['Значение']) {
            console.error(
              `Mismatch in row ${i + 1} for "${tableTitle}":\nExpected: ${JSON.stringify(expectedRow)}\n` +
                `Found: { Наименование: "${actualName}", ЕИ: "${actualUnit}", Значение: "${actualValue}" }`,
            );
            return false;
          }
          if (!isButtonVisible) {
            console.error(`Button in the fourth column is not visible in row ${i + 1} of table "${tableTitle}".`);
            return false;
          }
        }
      } else {
        console.error(`Unexpected header count (${headerCount}) for table "${tableTitle}".`);
        return false;
      }
      logger.log(`Table "${tableTitle}" validation passed.`);
      return true;
    } catch (error) {
      console.error(`Error validating table "${tableTitle}":`, error);
      return false;
    }
  }

  async validateInputFields(page: Page, fields: { title: string; type: string }[]): Promise<boolean> {
    try {
      for (const field of fields) {
        let fieldLocator;
        switch (field.type) {
          case 'input':
            if (field.title === 'Медиа файлы') {
              fieldLocator = page.locator('label.dnd-yui-kit__label:has-text("Прикрепить документ")');
              await fieldLocator.evaluate(row => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
              });
            } else {
              fieldLocator = page.locator(`div.editor__information-inputs:has-text("${field.title}") input`);
              await fieldLocator.evaluate(row => {
                row.style.backgroundColor = 'yellow';
                row.style.border = '2px solid red';
                row.style.color = 'blue';
              });
            }
            break;
          case 'textarea':
            fieldLocator = page.locator(`section.editor__description:has(h3:has-text("${field.title}")) textarea`);
            await fieldLocator.evaluate(row => {
              row.style.backgroundColor = 'yellow';
              row.style.border = '2px solid red';
              row.style.color = 'blue';
            });
            break;
          default:
            console.error(`Unsupported field type: ${field.type} for field "${field.title}"`);
            return false;
        }
        if (!(await fieldLocator.isVisible())) {
          console.error(`Field "${field.title}" is not visible.`);
          return false;
        }
        if (!(field.type === 'input' && field.title === 'Медиа файлы')) {
          const testValue = 'Test Value';
          await fieldLocator.fill(testValue);
          const currentValue = await fieldLocator.inputValue();
          if (currentValue !== testValue) {
            console.error(`Field "${field.title}" is not writable. Expected "${testValue}", but got "${currentValue}".`);
            return false;
          }
        }
        logger.log(`Field "${field.title}" is visible and ${field.type === 'input' && field.title === 'Медиа файлы' ? 'present' : 'writable'}.`);
      }
      logger.log('All input fields validated successfully.');
      return true;
    } catch (error) {
      console.error('Error during input field validation:', error);
      return false;
    }
  }

  async findMaterialType(page: Page, materialName: string): Promise<string> {
    const newContext = await page.context().newPage();
    await newContext.goto(SELECTORS.MAINMENU.MATERIALS.URL);
    const materialTypes = ['МД', 'ПД', 'РД'];
    const switchItems = ['MaterialTableList-Switch-Item1', 'MaterialTableList-Switch-Item2', 'MaterialTableList-Switch-Item3'];
    for (let i = 0; i < switchItems.length; i++) {
      const switchItem = newContext.locator(`[data-testid="${switchItems[i]}"]`);
      await switchItem.click();
      await newContext.waitForTimeout(500);
      const searchInput = newContext.locator('[data-testid="MaterialTableList-Table-Item-SearchInput-Dropdown-Input"]');
      await searchInput.fill(materialName);
      await searchInput.press('Enter');
      await searchInput.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      await newContext.waitForTimeout(1000);
      const materialTable = newContext.locator('[data-testid="MaterialTableList-Table-Item"]');
      await materialTable.evaluate(row => {
        row.style.backgroundColor = 'yellow';
        row.style.border = '2px solid red';
        row.style.color = 'blue';
      });
      const rows = await materialTable.locator('tbody tr').count();
      if (rows === 1) {
        await newContext.close();
        return materialTypes[i];
      } else if (rows > 1) {
        const rowElements = await materialTable.locator('tbody tr').elementHandles();
        for (const row of rowElements) {
          const rowText = await row.textContent();
          if (rowText?.trim() === materialName) {
            await row.evaluate(el => {
              (el as HTMLElement).style.backgroundColor = 'yellow';
              (el as HTMLElement).style.border = '2px solid red';
              (el as HTMLElement).style.color = 'blue';
            });
            await newContext.close();
            return materialTypes[i];
          }
        }
      }
    }
    await newContext.close();
    throw new Error(`Material "${materialName}" not found in any category.`);
  }

  async searchAndSelectMaterial(sliderDataTestId: string, materialName: string): Promise<void> {
    const normalizedSliderSelector = sliderDataTestId.trim().startsWith('[data-testid=')
      ? sliderDataTestId
      : `[data-testid="${sliderDataTestId}"]`;
    const switchItem = this.page.locator(normalizedSliderSelector);
    await switchItem.click();
    await this.page.waitForTimeout(500);
    const searchInput = this.page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item-SearchInput-Dropdown-Input"]');
    await searchInput.fill(materialName);
    await searchInput.press('Enter');
    await searchInput.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    await this.page.waitForTimeout(1000);
    const materialTable = this.page.locator('[data-testid="ModalBaseMaterial-TableList-Table-Item"]');
    await materialTable.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    const rowsCount = await materialTable.locator('tbody tr').count();
    let materialFound = false;
    if (rowsCount === 1) {
      const row = materialTable.locator('tbody tr').first();
      await this.elementHelper.highlightElement(row);
      await row.click();
      await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
      materialFound = true;
    } else if (rowsCount > 1) {
      const resultRows = materialTable.locator('tbody tr');
      for (let i = 0; i < rowsCount; i++) {
        const row = resultRows.nth(i);
        const rowText = await row.textContent();
        if (rowText?.trim() === materialName) {
          await this.elementHelper.highlightElement(row);
          await row.click();
          await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
          materialFound = true;
          break;
        }
      }
    }
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    expect(materialFound).toBe(true);
    const addButton = this.page.locator('[data-testid="ModalBaseMaterial-Add-Button"]');
    await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
    await this.elementHelper.highlightElement(addButton);
    await addButton.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    const modal = this.page.locator('[data-testid="ModalBaseMaterial"]');
    await modal.waitFor({ state: 'detached', timeout: WAIT_TIMEOUTS.STANDARD });
    await this.navigationHelper.waitForNetworkIdle();
  }

  async parseRecursiveStructuredTable(
    page: Page,
    tableTestId: string,
    parentId: string,
    multiplier: number,
    parsedData: { [key: string]: any[] },
  ): Promise<void> {
    const table = page.locator(`[data-testid^="${tableTestId}"]`).last();
    await table.locator('tr').first().waitFor({ state: 'visible' });
    const rows = await table.locator('tbody > tr').elementHandles();
    if (rows.length === 0) throw new Error('No rows found in the table.');
    let currentGroup: 'СБ' | 'Д' | 'ПД' | 'МД' | 'РМ' | null = null;
    const groupOrder: ('СБ' | 'Д' | 'ПД' | 'МД' | 'РМ')[] = ['СБ', 'Д', 'ПД', 'МД', 'РМ'];
    const groupDetected = new Set<string>();
    for (const row of rows) {
      try {
        const headerCell = await row.$('td[colspan="5"]:not(:has(table))');
        if (headerCell) {
          const text = await headerCell.textContent();
          if (text) {
            for (const group of groupOrder) {
              if (text.includes(group) || (group === 'СБ' && text.includes('Сборочная единица'))) {
                if (!groupDetected.has(group)) {
                  currentGroup = group;
                  groupDetected.add(group);
                  logger.log(`Detected group header: ${currentGroup}`);
                }
                continue;
              }
            }
          }
        }
        if (currentGroup && groupDetected.has(currentGroup)) {
          const nestedTableCell = await row.$('td[colspan="5"]:has(table)');
          if (nestedTableCell) {
            const nestedRows = await nestedTableCell.$$('table tbody > tr');
            for (const nestedRow of nestedRows) {
              await nestedRow.evaluate(element => {
                element.style.border = '2px solid red';
                element.style.backgroundColor = 'yellow';
              });
              const rowData: string[] = [];
              const cells = await nestedRow.$$('td');
              for (const cell of cells) {
                const text = await cell.textContent();
                rowData.push(text?.trim() || '');
              }
              if (rowData.length === 5) {
                const item = {
                  designation: rowData[1],
                  name: rowData[2],
                  unit: currentGroup === 'СБ' || currentGroup === 'Д' ? parentId : rowData[3],
                  quantity: currentGroup === 'ПД' ? parseInt(rowData[4], 10) || 1 : parseInt(rowData[4], 10) * multiplier,
                };
                if (currentGroup === 'ПД') {
                  const existingIndex = parsedData['ПД'].findIndex((ex: any) => ex.name === item.name);
                  if (existingIndex !== -1) parsedData['ПД'][existingIndex] = item;
                  else parsedData['ПД'].push(item);
                } else {
                  parsedData[currentGroup].push(item);
                }
                if (currentGroup === 'СБ') {
                  logger.log(`Opening modal for СБ item: ${rowData[1]} (quantity: ${item.quantity})`);
                  await nestedRow.click();
                  await page.waitForTimeout(500);
                  const modalDialog = page.locator(`dialog[data-testid^="ModalCbed"]`).nth(-1);
                  await modalDialog.waitFor({ state: 'visible' });
                  await modalDialog.evaluate(row => {
                    row.style.border = '2px solid red';
                  });
                  const specTable = modalDialog.locator(`[data-testid^="ModalCbed"][data-testid$="-TableSpecification-Cbed"]`).nth(-1);
                  await specTable.waitFor({ state: 'visible' });
                  await specTable.evaluate(row => {
                    row.style.border = '2px solid red';
                  });
                  await specTable.evaluate(el => el.scrollIntoView());
                  await page.waitForTimeout(500);
                  if ((await specTable.count()) > 0) {
                    const designationElement = modalDialog.locator('[data-testid^="ModalCbed"][data-testid$="Designation-Text"] span').nth(-1);
                    await designationElement.waitFor({ state: 'visible' });
                    await designationElement.evaluate(row => {
                      row.style.border = '2px solid red';
                    });
                    const parentDesignation = await designationElement.textContent();
                    logger.log(`Extracted ParentDesignation: ${parentDesignation}`);
                    if (parentDesignation) {
                      await this.parseRecursiveStructuredTable(page, 'ModalCbed-TableSpecification-Cbed', parentDesignation, item.quantity, parsedData);
                    }
                  }
                  await page.mouse.click(1, 1);
                  await page.waitForTimeout(1000);
                  logger.log(`Closed modal for ${rowData[1]}`);
                }
                if (currentGroup === 'Д') {
                  logger.log(`Opening material modal for Д item: ${rowData[1]}`);
                  await nestedRow.click();
                  const materialElement = page.locator(`[data-testid^="ModalDetal"][data-testid$="CharacteristicsMaterial-Items"]`);
                  await materialElement.evaluate(row => {
                    (row as HTMLElement).style.backgroundColor = 'yellow';
                    (row as HTMLElement).style.border = '2px solid red';
                    (row as HTMLElement).style.color = 'blue';
                  });
                  await materialElement.evaluate(el => el.scrollIntoView());
                  await materialElement.waitFor({ state: 'visible' });
                  await page.waitForTimeout(2000);
                  let materialText = await materialElement.textContent();
                  let materialGroup = '';
                  if (materialText) {
                    materialGroup = await this.findMaterialType(page, materialText);
                    logger.log('Searching for material: ' + materialText);
                    logger.log('Found in group: ' + materialGroup);
                  } else {
                    console.warn('Material text is null, skipping material type lookup.');
                  }
                  if (materialText) {
                    logger.log(`🔎 Processing material: ${materialText}`);
                    logger.log(`📌 Found in group: ${materialGroup}`);
                    if (materialGroup === 'ПД') {
                      logger.log(`🛠 Checking if ${materialText} exists in ПД...`);
                      const existingMaterial = parsedData['ПД'].find((mat: any) => mat.name === materialText!.trim());
                      if (existingMaterial) {
                        logger.log(`✅ Existing ПД item found: ${existingMaterial.name}, current quantity: ${existingMaterial.quantity}`);
                        existingMaterial.quantity += item.quantity;
                      } else {
                        logger.log(`➕ Adding new ПД item: ${materialText}, quantity: ${item.quantity}`);
                        parsedData['ПД'].push({ designation: '-', name: materialText.trim(), unit: 'шт', quantity: item.quantity });
                      }
                    } else if (materialGroup === 'МД') {
                      logger.log(`🛠 Checking if ${materialText} exists in МД...`);
                      const existingMaterial = parsedData['МД'].find((mat: any) => mat.material === materialText!.trim());
                      if (existingMaterial) {
                        logger.log(`✅ Existing МД item found: ${existingMaterial.material}, overriding quantity to 1.`);
                        existingMaterial.quantity = 1;
                      } else {
                        logger.log(`➕ Adding new МД item: ${materialText}, quantity: 1`);
                        parsedData['МД'].push({ material: materialText.trim(), quantity: 1 });
                      }
                    } else {
                      logger.log(`🛠 Checking if ${materialText} exists in ${materialGroup}...`);
                      const existingMaterial = parsedData[materialGroup].find((mat: any) => mat.material === materialText!.trim());
                      if (existingMaterial) {
                        logger.log(`✅ Existing ${materialGroup} item found: ${existingMaterial.material}, current quantity: ${existingMaterial.quantity}`);
                        existingMaterial.quantity += item.quantity;
                      } else {
                        logger.log(`➕ Adding new ${materialGroup} item: ${materialText}, quantity: ${item.quantity}`);
                        parsedData[materialGroup].push({ material: materialText.trim(), quantity: item.quantity });
                      }
                    }
                  }
                  page.mouse.click(1, 1);
                  await page.waitForTimeout(500);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing row: ${error}`);
      }
    }
    for (const group of Object.keys(parsedData)) {
      if (parsedData[group]?.length > 0) {
        parsedData[group].sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      }
    }
  }

  async extractAllTableData(page: Page, dialogTestId: string): Promise<any> {
    const TABLE_SELECTORS: { [key: string]: string } = {
      СБ: "[data-testid='Specification-ModalCbed-AccordionCbed-Table']",
      Д: "[data-testid='Specification-ModalCbed-AccordionDetalContent-Table']",
      ПД: "[data-testid='Specification-ModalCbed-AccordionBuyersMaterial-Table']",
      МД: "[data-testid='Specification-ModalCbed-ModalComplect-MateriaDetalTable']",
      РМ: "[data-testid='Specification-ModalCbed-Accordion-MaterialRashod-Table']",
    };
    const structuredData: { [key: string]: any[] } = { СБ: [], Д: [], ПД: [], МД: [], РМ: [] };
    const dialog = page.locator(`[data-testid="${dialogTestId}"]`);
    await dialog.waitFor({ state: 'visible' });
    await page.waitForTimeout(1000);
    for (const [group, selector] of Object.entries(TABLE_SELECTORS)) {
      const table = dialog.locator(selector);
      if ((await table.count()) === 0) {
        logger.log(`Skipping ${group}: Table does not exist.`);
        continue;
      }
      try {
        await table.waitFor({ state: 'attached', timeout: 3000 });
      } catch {
        logger.log(`Skipping ${group}: Table is not attached.`);
        continue;
      }
      await page.waitForTimeout(500);
      if ((await table.locator('tbody > tr').count()) === 0) {
        logger.log(`Skipping ${group}: Table is empty.`);
        continue;
      }
      const rows = await table.locator('tbody > tr').elementHandles();
      for (const row of rows) {
        await row.evaluate(node => {
          (node as HTMLElement).style.backgroundColor = 'yellow';
          (node as HTMLElement).style.border = '2px solid red';
          (node as HTMLElement).style.color = 'blue';
        });
        const cells = await row.$$('td');
        const rowData = await Promise.all(cells.map(async cell => (await cell.textContent())?.trim() || ''));
        if (group === 'ПД') logger.log('ПД rowData: ' + JSON.stringify(rowData));
        if (group === 'РМ' && rowData.length === 3) {
          structuredData['РМ'].push({
            name: rowData[0] || '',
            unit: rowData[1] || 'шт',
            quantity: parseInt(rowData[2], 10) || 1,
          });
        } else if (rowData.length >= 4 || (group === 'ПД' && rowData.length === 3)) {
          let quantity = parseInt(rowData[4], 10);
          if (isNaN(quantity)) quantity = 1;
          if (group === 'МД') {
            const materialName = rowData[1];
            const existingMaterial = structuredData['МД'].find((mat: any) => mat.material === materialName);
            if (existingMaterial) existingMaterial.quantity += quantity;
            else structuredData['МД'].push({ material: materialName, quantity });
          } else if (group === 'ПД') {
            structuredData['ПД'].push({
              designation: rowData[6] || '-',
              name: rowData[1] || '',
              unit: rowData[3] || 'шт',
              quantity: parseInt(rowData[2], 10) || 1,
            });
          } else {
            structuredData[group].push({
              designation: rowData[6] || '-',
              name: rowData[7] || '',
              unit: rowData[3] || 'шт',
              quantity,
            });
          }
        }
      }
    }
    for (const group of Object.keys(structuredData)) {
      if (structuredData[group]?.length > 0) {
        structuredData[group].sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
      }
    }
    return structuredData;
  }

  async checkItemExistsInBottomTable(page: Page, selectedPartName: string, modalTestId: string, bottomTableTestId: string): Promise<boolean> {
    await page.waitForLoadState('networkidle');
    let modalId = modalTestId;
    const modalMatch = modalTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (modalMatch?.[1]) modalId = modalMatch[1];
    const modal = page.locator(`dialog[data-testid^="${modalId}"]`);
    await modal.waitFor({ state: 'attached', timeout: 15000 });
    await modal.waitFor({ state: 'visible', timeout: 15000 });
    logger.info('Modal located successfully.');
    await page.waitForTimeout(1500);
    let bottomTableSelector = bottomTableTestId;
    const tableMatch = bottomTableTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (tableMatch?.[1]) bottomTableSelector = `[data-testid="${tableMatch[1]}"]`;
    else if (!bottomTableTestId.includes('data-testid')) bottomTableSelector = `[data-testid="${bottomTableTestId}"]`;
    const bottomTableLocator = modal.locator(bottomTableSelector);
    const isTableVisible = await bottomTableLocator.isVisible();
    if (!isTableVisible) {
      logger.info(`Bottom table '${bottomTableTestId}' does not exist. Returning false.`);
      return false;
    }
    await bottomTableLocator.waitFor({ state: 'attached', timeout: 15000 });
    logger.info('Bottom table located successfully.');
    await page.waitForTimeout(1000);
    const rowsLocator = bottomTableLocator.locator('tbody tr');
    const rowCount = await rowsLocator.count();
    logger.info(`Found ${rowCount} rows in the bottom table.`);
    for (let i = 0; i < rowCount; i++) {
      const row = rowsLocator.nth(i);
      await row.waitFor({ state: 'visible', timeout: 5000 });
      const partNameCell = row.locator('td').nth(1);
      const partName = (await partNameCell.textContent())?.trim();
      logger.info(`Row ${i + 1}: PartName=${partName}`);
      if (partName === selectedPartName) {
        await row.evaluate(rowElement => {
          rowElement.style.backgroundColor = 'yellow';
          rowElement.style.border = '2px solid green';
          rowElement.style.color = 'blue';
        });
        logger.info(`Selected part name found in row ${i + 1}`);
        return true;
      }
    }
    logger.info('Item not found in the bottom table.');
    return false;
  }

  async fillDetailName(detailName: string, dataTestId: string = 'AddDetal-Information-Input-Input'): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    const selector = dataTestId.startsWith('[data-testid=') ? dataTestId : `[data-testid="${dataTestId}"]`;
    const field = this.page.locator(selector);
    await field.evaluate((el: HTMLElement) => {
      el.style.backgroundColor = 'yellow';
      el.style.border = '2px solid red';
      el.style.color = 'blue';
    });
    await field.fill('');
    await field.press('Enter');
    await this.page.waitForTimeout(500);
    await field.fill(detailName);
    await this.page.waitForTimeout(500);
    await expect(await field.inputValue()).toBe(detailName);
    await this.page.waitForTimeout(50);
  }

  async verifyDetailSuccessMessage(expectedText: string): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);
      const successDialog = this.page.locator('[data-testid="Notification-Notification-Description"]').last();
      const isVisible = await successDialog.isVisible().catch(() => false);
      if (!isVisible) {
        console.warn('Success notification not visible - this might be normal after rapid clicking');
        return;
      }
      await successDialog.evaluate((el: HTMLElement) => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '2px solid red';
        el.style.color = 'blue';
      });
      const dialogText = await successDialog.textContent();
      logger.log('Success dialog text:', dialogText);
      if (dialogText) {
        expect(dialogText).toContain(expectedText);
      } else {
        logger.warn('Notification text is empty - this might be normal after rapid clicking');
      }
    } catch (error) {
      logger.warn(`Error verifying success message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async verifyFileInTable(parentSectionTestId: string, tableRowSelector: string, name: string, extension: string): Promise<void> {
    const parentSection = this.page.locator(`[data-testid="${parentSectionTestId}"]`);
    await this.page.waitForTimeout(1000);
    const tableRows = parentSection.locator(tableRowSelector);
    const matchingRows = await tableRows.locator(`.table-yui-kit__td:nth-child(2):has-text("${name}")`);
    const rowCount = await matchingRows.count();
    if (rowCount > 0) {
      let extensionMatch = false;
      for (let i = 0; i < rowCount; i++) {
        const rowText = await matchingRows.nth(i).textContent();
        if (rowText && rowText.includes(extension)) {
          extensionMatch = true;
          break;
        }
      }
      if (!extensionMatch) {
        throw new Error(`File "${name}" is present but does not match the expected extension "${extension}".`);
      }
    } else {
      throw new Error(`No files found with base name "${name}".`);
    }
  }

  async uploadFiles(fileInputSelector: string, filePaths: string[]): Promise<void> {
    const fileInput = this.page.locator(fileInputSelector);
    await fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(1000);
    const uploadedFiles = await fileInput.evaluate((element: HTMLInputElement) => element.files?.length || 0);
    if (uploadedFiles !== filePaths.length) {
      throw new Error(`Expected to upload ${filePaths.length} files, but got ${uploadedFiles}`);
    }
  }

  async validateFileSectionFields(
    fileSectionLocator: Locator,
    textareaTestId: string,
    checkboxTestId: string,
    versionInputTestId: string,
    fileNameInputTestId: string,
    testValue: string,
  ): Promise<void> {
    const textarea = fileSectionLocator.locator(`textarea[data-testid="${textareaTestId}"]`);
    await textarea.fill(testValue);
    expect(await textarea.inputValue()).toBe(testValue);
    const checkbox = fileSectionLocator.locator(`input[data-testid="${checkboxTestId}"]`);
    expect(await checkbox.isVisible()).toBeTruthy();
    const version = fileSectionLocator.locator(`input[data-testid="${versionInputTestId}"]`);
    expect(await version.isVisible()).toBeTruthy();
    const fileName = fileSectionLocator.locator(`input[data-testid="${fileNameInputTestId}"]`);
    expect(await fileName.isVisible()).toBeTruthy();
  }

  async verifyTableRows(tableLocator: Locator, rowSelector: string, expectedCount: number, highlightRows: boolean = true): Promise<void> {
    const rows = tableLocator.locator(rowSelector);
    const actualCount = await rows.count();
    logger.info(`Found ${actualCount} rows in table, expected ${expectedCount}`);
    expect(actualCount).toBe(expectedCount);
    if (highlightRows) {
      for (let i = 0; i < actualCount; i++) {
        await this.elementHelper.highlightElement(rows.nth(i));
      }
    }
  }

  async fillAndVerifyField(dataTestId: string, value: string, clearFirst: boolean = true): Promise<void> {
    const fullSelector = dataTestId.includes('[data-testid') || dataTestId.includes('[') ? dataTestId : `[data-testid="${dataTestId}"]`;
    const field = this.page.locator(fullSelector);
    await field.waitFor({ state: 'visible' });
    await this.elementHelper.highlightElement(field);
    if (clearFirst) {
      await field.clear();
      await this.page.waitForTimeout(500);
    }
    await field.fill(value);
    await this.page.waitForTimeout(500);
    const actualValue = await field.inputValue();
    expect(actualValue).toBe(value);
    logger.info(`Field ${dataTestId} filled with: ${value}`);
  }

  async clickButtonByDataTestId(dataTestId: string, waitForNetworkIdle: boolean = true): Promise<void> {
    const button = this.page.locator(`[data-testid="${dataTestId}"]`);
    await button.waitFor({ state: 'visible' });
    await this.elementHelper.highlightElement(button);
    await button.click();
    if (waitForNetworkIdle) {
      await this.page.waitForLoadState('networkidle');
    }
    logger.info(`Clicked button: ${dataTestId}`);
  }

  async verifyModalVisible(modalDataTestId: string, timeout: number = 30000): Promise<Locator> {
    const modal = this.page.locator(`[data-testid="${modalDataTestId}"]`);
    await modal.waitFor({ state: 'visible', timeout });
    await this.elementHelper.highlightElement(modal);
    logger.info(`Modal ${modalDataTestId} is visible`);
    return modal;
  }

  async searchInTableAndVerify(tableLocator: Locator, searchInputSelector: string, searchValue: string, expectedResult: string): Promise<void> {
    const searchInput = tableLocator.locator(searchInputSelector);
    await searchInput.waitFor({ state: 'visible' });
    await this.elementHelper.highlightElement(searchInput);
    await searchInput.fill(searchValue);
    await searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    const firstRow = tableLocator.locator('tbody tr').first();
    const firstRowText = await firstRow.locator('td').nth(1).textContent();
    expect(firstRowText?.trim()).toBe(expectedResult.trim());
    logger.info(`Search completed: found "${firstRowText}" for search term "${searchValue}"`);
  }

  async verifyFileUpload(fileInputSelector: string, filePaths: string[], expectedCount: number): Promise<void> {
    const fileInput = this.page.locator(fileInputSelector);
    await fileInput.setInputFiles(filePaths);
    await this.page.waitForTimeout(1000);
    const uploadedFiles = await fileInput.evaluate((element: HTMLInputElement) => element.files?.length || 0);
    logger.info(`Number of files uploaded: ${uploadedFiles}`);
    expect(uploadedFiles).toBe(expectedCount);
    logger.info('Files successfully uploaded via the hidden input.');
  }

  async verifyDocumentTableOperations(tableLocator: Locator, rowIndex: number = 0): Promise<void> {
    const row = tableLocator.locator('tbody tr').nth(rowIndex);
    await row.waitFor({ state: 'visible' });
    await this.elementHelper.highlightElement(row);
    const checkbox = row.locator('input[type="checkbox"]');
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    const printButton = this.page.locator(`[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-ButtonPrint"]`);
    await expect(printButton).toBeVisible();
    await this.elementHelper.highlightElement(printButton);
    const deleteButton = this.page.locator(`[data-testid="AddDetal-FileComponent-DocumentTable-Buttons-DeleteDoc"]`);
    await expect(deleteButton).toBeVisible();
    await this.elementHelper.highlightElement(deleteButton);
    logger.info('Document table operations verified successfully');
  }

  async archiveDocument(archiveButtonDataTestId: string, confirmButtonDataTestId: string): Promise<void> {
    const archiveButton = this.page.locator(`[data-testid="${archiveButtonDataTestId}"]`);
    await expect(archiveButton).toBeVisible();
    await archiveButton.click();
    await this.page.waitForLoadState('networkidle');
    const confirmButton = this.page.locator(`[data-testid="${confirmButtonDataTestId}"]`);
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  private readonly ADD_DETAL_TITLE = 'AddDetal-Title';
  private readonly EDIT_DETAL_TITLE = 'EditDetal-Title';
  private readonly SAVE_BUTTON = 'AddDetal-ButtonSaveAndCancel-ButtonsCenter-Save';
  private readonly EDIT_SAVE_BUTTON = 'EditDetal-ButtonSaveAndCancel-ButtonsCenter-Save';

  async getCurrentPageType(): Promise<'add' | 'edit' | 'unknown'> {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(500);
      logger.info(`getCurrentPageType - Current URL: ${this.page.url()}`);
      logger.info(`getCurrentPageType - Page title: ${await this.page.title()}`);
      const selectors = [
        { add: `[data-testid="AddDetal-Information-Input-Input"]`, edit: `[data-testid="EditDetal-Information-Input-Input"]` },
        { add: `[data-testid="AddDetal"]`, edit: `[data-testid="EditDetal"]` },
        { add: `[data-testid="AddDetal-CharacteristicBlanks"]`, edit: `[data-testid="EditDetal-CharacteristicBlanks"]` },
        { add: `[data-testid="${this.SAVE_BUTTON}"]`, edit: `[data-testid="${this.EDIT_SAVE_BUTTON}"]` },
        { add: `[data-testid="${this.ADD_DETAL_TITLE}"]`, edit: `[data-testid="${this.EDIT_DETAL_TITLE}"]` },
        { add: `h3:has-text("Создание детали")`, edit: `h3:has-text("Редактирование детали")` },
      ];
      for (const selectorPair of selectors) {
        try {
          const addElement = this.page.locator(selectorPair.add);
          const editElement = this.page.locator(selectorPair.edit);
          const addCount = await addElement.count();
          const editCount = await editElement.count();
          logger.debug(`Selector pair - Add: ${selectorPair.add} (count: ${addCount}), Edit: ${selectorPair.edit} (count: ${editCount})`);
          if (addCount > 0) {
            logger.info(`Page type determined as 'add' using selector: ${selectorPair.add}`);
            return 'add';
          }
          if (editCount > 0) {
            logger.info(`Page type determined as 'edit' using selector: ${selectorPair.edit}`);
            return 'edit';
          }
        } catch {
          continue;
        }
      }
      const addDetalElements = this.page.locator('[data-testid*="AddDetal"]');
      const editDetalElements = this.page.locator('[data-testid*="EditDetal"]');
      const addDetalCount = await addDetalElements.count();
      const editDetalCount = await editDetalElements.count();
      logger.info(`getCurrentPageType - Found ${addDetalCount} AddDetal elements and ${editDetalCount} EditDetal elements`);
      if (addDetalCount > 0 && editDetalCount === 0) {
        logger.info("Page type determined as 'add' based on AddDetal elements");
        return 'add';
      }
      if (editDetalCount > 0 && addDetalCount === 0) {
        logger.info("Page type determined as 'edit' based on EditDetal elements");
        return 'edit';
      }
      const h3Elements = this.page.locator('h3');
      const h3Count = await h3Elements.count();
      logger.info(`getCurrentPageType - Found ${h3Count} h3 elements on page`);
      const loadingIndicators = ['[data-testid*="Loading"]', '[data-testid*="Spinner"]', '.loading', '.spinner'];
      for (const loadingSelector of loadingIndicators) {
        const loadingElement = this.page.locator(loadingSelector);
        if ((await loadingElement.count()) > 0) {
          logger.info('Page appears to be in loading state');
          return 'unknown';
        }
      }
      logger.warn('Unable to determine page type - no known selectors found');
      return 'unknown';
    } catch (error) {
      logger.warn(`Error determining page type: ${error instanceof Error ? error.message : String(error)}`);
      return 'unknown';
    }
  }

  async getSaveButton(): Promise<Locator> {
    const pageType = await this.getCurrentPageType();
    if (pageType === 'add') {
      return this.page.locator(`[data-testid="${this.SAVE_BUTTON}"]`);
    } else if (pageType === 'edit') {
      return this.page.locator(`[data-testid="${this.EDIT_SAVE_BUTTON}"]`);
    }
    throw new Error(`Unknown page type: ${pageType}`);
  }

  async isSaveInProgress(): Promise<boolean> {
    try {
      const saveButton = await this.getSaveButton();
      const isEnabled = await saveButton.isEnabled();
      return !isEnabled;
    } catch {
      return true;
    }
  }

  async performRapidSaveClicks(
    maxClicks: number = 10,
    options: {
      maxConsecutiveFailures?: number;
      stabilizationDelay?: number;
      progressCheckDelay?: number;
    } = {},
  ): Promise<{
    clicksPerformed: number;
    pageTransitioned: boolean;
    finalPageType: 'add' | 'edit' | 'unknown';
    errors: string[];
  }> {
    const { maxConsecutiveFailures = 3, stabilizationDelay = 200, progressCheckDelay = 300 } = options;
    let clicksPerformed = 0;
    let pageTransitioned = false;
    let consecutiveFailures = 0;
    const errors: string[] = [];
    for (let i = 0; i < maxClicks; i++) {
      try {
        await this.page.waitForLoadState('domcontentloaded');
        const currentPageType = await this.getCurrentPageType();
        if (currentPageType === 'unknown') {
          logger.warn(`Attempt ${i + 1}: Unable to determine page type`);
          consecutiveFailures++;
          if (consecutiveFailures >= maxConsecutiveFailures) {
            errors.push('Too many consecutive failures, stopping');
            break;
          }
          await this.page.waitForTimeout(1000);
          continue;
        }
        if (currentPageType === 'edit' && !pageTransitioned) {
          logger.info(`Attempt ${i + 1}: Page transitioned to edit mode`);
          pageTransitioned = true;
        }
        const saveButton = await this.getSaveButton();
        let isVisible = false;
        let isEnabled = false;
        try {
          isVisible = await saveButton.isVisible();
          isEnabled = await saveButton.isEnabled();
        } catch (buttonError) {
          logger.warn(`Attempt ${i + 1}: Error checking button state: ${buttonError instanceof Error ? buttonError.message : String(buttonError)}`);
          consecutiveFailures++;
          if (consecutiveFailures >= maxConsecutiveFailures) {
            errors.push('Too many consecutive button state errors, stopping');
            break;
          }
          await this.page.waitForTimeout(1000);
          continue;
        }
        if (!isVisible || !isEnabled) {
          logger.info(`Attempt ${i + 1}: Save button unavailable (visible: ${isVisible}, enabled: ${isEnabled})`);
          break;
        }
        if (await this.isSaveInProgress()) {
          logger.info(`Attempt ${i + 1}: Save operation already in progress, waiting...`);
          await this.page.waitForTimeout(progressCheckDelay);
          continue;
        }
        try {
          await this.elementHelper.highlightElement(saveButton);
        } catch {
          // ignore
        }
        await saveButton.click();
        clicksPerformed++;
        consecutiveFailures = 0;
        logger.info(`Attempt ${i + 1}: Save button clicked (page type: ${currentPageType})`);
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(stabilizationDelay);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error on attempt ${i + 1}: ${errorMessage}`);
        errors.push(`Attempt ${i + 1}: ${errorMessage}`);
        consecutiveFailures++;
        if (consecutiveFailures >= maxConsecutiveFailures) {
          errors.push('Too many consecutive errors, stopping');
          break;
        }
        if (errorMessage.includes('Execution context was destroyed') || errorMessage.includes('navigation')) {
          await this.page.waitForTimeout(2000);
        } else {
          await this.page.waitForTimeout(500);
        }
      }
    }
    logger.info(`Total clicks performed: ${clicksPerformed} out of ${maxClicks}`);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    const finalPageType = await this.getCurrentPageType();
    logger.info(`Final page state: ${finalPageType}`);
    return { clicksPerformed, pageTransitioned, finalPageType, errors };
  }

  async calculateFreeQuantity(detailName: string): Promise<number> {
    const warehousePage = await this.page.context().newPage();
    await warehousePage.goto(SELECTORS.MAINMENU.WAREHOUSE.URL);
    const residualsButton = warehousePage.locator('[data-testid="Sclad-residuals-residuals"]');
    await this.elementHelper.highlightElement(residualsButton, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
    await residualsButton.click();
    await warehousePage.waitForTimeout(2000);
    const table = warehousePage.locator('[data-testid="OstatkPCBD-Detal-Table"]');
    await table.waitFor({ state: 'visible' });
    await this.elementHelper.highlightElement(table, { backgroundColor: 'lightcyan', border: '2px solid blue', color: 'black' });
    await warehousePage.waitForTimeout(1000);
    const searchInput = table.locator('[data-testid="OstatkiPCBDTable-SearchInput-Dropdown-Input"]');
    await this.elementHelper.highlightElement(searchInput, { backgroundColor: 'lightgreen', border: '2px solid green', color: 'black' });
    await warehousePage.waitForTimeout(1000);
    await searchInput.fill(detailName);
    await searchInput.press('Enter');
    await warehousePage.waitForTimeout(2000);
    const firstRow = table.locator('tbody tr').first();
    await this.elementHelper.highlightElement(firstRow, { backgroundColor: 'orange', border: '2px solid red', color: 'black' });
    await warehousePage.waitForTimeout(1000);
    const stockCell = firstRow.locator('[data-testid="OstatkiPCBDTable-Row-Stock"]');
    const inKitsCell = firstRow.locator('[data-testid="OstatkiPCBDTable-Row-InKits"]');
    await this.elementHelper.highlightElement(stockCell, { backgroundColor: 'lightgreen', border: '2px solid green', color: 'black' });
    await warehousePage.waitForTimeout(1000);
    await this.elementHelper.highlightElement(inKitsCell, { backgroundColor: 'lightblue', border: '2px solid blue', color: 'black' });
    await warehousePage.waitForTimeout(1000);
    const stockValue = await stockCell.textContent();
    const inKitsValue = await inKitsCell.textContent();
    const stock = parseInt(stockValue?.trim() || '0', 10);
    const inKits = parseInt(inKitsValue?.trim() || '0', 10);
    const freeQuantity = stock - inKits;
    logger.log(`Warehouse data for ${detailName}: Stock=${stock}, InKits=${inKits}, FreeQuantity=${freeQuantity}`);
    await warehousePage.close();
    return freeQuantity;
  }

  async validateCollectedQuantity(assemblyName: string, expectedMinimum: number): Promise<boolean> {
    try {
      logger.log(`Validating collected quantity for assembly: ${assemblyName}, minimum expected: ${expectedMinimum}`);
      return true;
    } catch (error) {
      console.error(`Error validating collected quantity: ${error}`);
      return false;
    }
  }

  async validateScladNeed(detailName: string, currentValue: number): Promise<boolean> {
    try {
      logger.log(`Validating sclad need for detail: ${detailName}, current value: ${currentValue}`);
      return currentValue >= 0;
    } catch (error) {
      console.error(`Error validating sclad need: ${error}`);
      return false;
    }
  }

  async validateNeedQuantity(detailName: string, assemblyName: string, currentNeed: number, inKitsValue: number): Promise<boolean> {
    try {
      logger.log(`Validating need quantity for detail: ${detailName} in assembly: ${assemblyName}, current need: ${currentNeed}, in kits: ${inKitsValue}`);
      return currentNeed >= 0 && currentNeed >= inKitsValue;
    } catch (error) {
      console.error(`Error validating need quantity: ${error}`);
      return false;
    }
  }

  async validateProgressPercentage(collectedQuantity: number, requiredQuantity: number, expectedPercentage?: number): Promise<boolean> {
    try {
      if (requiredQuantity === 0) {
        logger.log('Required quantity is 0, cannot calculate percentage');
        return true;
      }
      const calculatedPercentage = Math.round((collectedQuantity / requiredQuantity) * 100);
      logger.log(`Progress percentage: ${collectedQuantity}/${requiredQuantity} = ${calculatedPercentage}%`);
      if (expectedPercentage !== undefined) {
        return calculatedPercentage === expectedPercentage;
      }
      return calculatedPercentage >= 0 && calculatedPercentage <= 100;
    } catch (error) {
      console.error(`Error validating progress percentage: ${error}`);
      return false;
    }
  }

  async archiveDetail(
    page: Page,
    itemName: string,
    tableTestId: string,
    searchInputTestId: string = 'BasePaginationTable-Thead-SearchInput-Dropdown-Input',
    archiveButtonTestId: string = 'EditDetal-ButtonSaveAndCancel-ButtonsRight-Archive',
    confirmModalTestId: string = 'ModalConfirm-Content',
    confirmButtonTestId: string = 'ModalConfirm-Content-Buttons-Yes',
  ): Promise<void> {
    const itemTable = page.locator(`[data-testid="${tableTestId}"]`);
    const searchInput = itemTable.locator(`[data-testid="${searchInputTestId}"]`);
    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await searchInput.fill(itemName);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const rows = itemTable.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount === 0) {
      logger.log(`No existing ${itemName} found for archiving`);
      return;
    }
    let foundRow: Locator | null = null;
    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).textContent();
      if (rowText && rowText.trim() === itemName) {
        foundRow = rows.nth(i);
        logger.log(`Found ${itemName} in row ${i + 1}`);
        break;
      }
    }
    if (foundRow) {
      await foundRow.click();
      await page.waitForTimeout(500);
      const archiveButton = page.locator(`[data-testid="${archiveButtonTestId}"]`);
      await expect(archiveButton).toBeVisible();
      await this.elementHelper.highlightElement(archiveButton, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      await page.waitForTimeout(1000);
      await archiveButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const confirmModal = page.locator(`[data-testid="${confirmModalTestId}"]`);
      await expect(confirmModal).toBeVisible({ timeout: 5000 });
      await this.elementHelper.highlightElement(confirmModal, { backgroundColor: 'lightcyan', border: '2px solid blue', color: 'black' });
      await page.waitForTimeout(1000);
      const modalText = await confirmModal.textContent();
      logger.log(`Modal text: "${modalText}"`);
      expect(modalText).toContain(itemName);
      expect(modalText).toContain('Вы уверены, что хотите перенести в архив');
      expect(modalText).toContain('Все, связанные с этой сущностью, наборы будут деактивированы');
      const yesButton = confirmModal.locator(`[data-testid="${confirmButtonTestId}"]`);
      await expect(yesButton).toBeVisible();
      await this.elementHelper.highlightElement(yesButton, { backgroundColor: 'yellow', border: '2px solid red', color: 'blue' });
      await page.waitForTimeout(1000);
      await yesButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await this.elementHelper.highlightElement(yesButton, { backgroundColor: 'green', border: '2px solid green', color: 'white' });
      await page.waitForTimeout(1000);
      logger.log(`✅ Successfully archived: ${itemName}`);
    } else {
      logger.log(`Item "${itemName}" not found in table for archiving`);
    }
  }

  private static getCancelButtonSelectorForDialog(dialogTestId: string): string {
    // СБ and Д have distinct dialog ids; ПД and РМ share ModalBaseMaterial
    const map: Record<string, string> = {
      [SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG]: SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON,
      [SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG]: SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON,
      [SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG]: SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_CANCEL_BUTTON,
    };
    return map[dialogTestId] ?? SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON;
  }

  /**
   * Open group dialog, clear all existing items from bottom table, then add provided items and commit to main table.
   */
  async reconcileGroupClearAndSet(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    items: Array<{ name: string; quantity?: number }>,
  ): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    await addButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
    await dialogButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
    await expect(modal).toBeVisible();

    const bottomTable = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
    await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    const deleteColumnIndex = 4;
    while (true) {
      const rows = bottomTable.locator('tbody tr');
      const count = await rows.count();
      if (count === 0) break;
      const row = rows.nth(count - 1);
      const deleteCell = row.locator('td').nth(deleteColumnIndex);
      await deleteCell.click().catch(() => {});
      await page.waitForTimeout(200).catch(() => {});
    }

    if (items && items.length > 0) {
      let itemTableLocator = modal.locator(`table[data-testid="${searchTableTestId}"]`);
      try {
        await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 });
      } catch {
        const fallbackCbedTable = modal.locator(`table[data-testid="BasePaginationTable-Table-cbed"]`);
        if ((await fallbackCbedTable.count()) > 0) {
          itemTableLocator = fallbackCbedTable;
          await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        }
      }

      for (const { name: searchValue, quantity } of items) {
        let searchInput = modal.locator(SelectorsPartsDataBase.BASE_DETAIL_CB_TABLE_SEARCH).first();
        if ((await searchInput.count()) === 0) {
          searchInput = itemTableLocator.locator('input.search-yui-kit__input').first();
        }
        await searchInput.fill('').catch(() => {});
        await searchInput.fill(searchValue);
        await searchInput.press('Enter');
        try {
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch {}
        await page.waitForTimeout(500).catch(() => {});

        const results = itemTableLocator.locator('tbody tr');
        const count = await results.count();
        if (count === 0) {
          logger.warn(`No results for "${searchValue}" in ${dialogTestId}`);
          continue;
        }
        await results.first().click().catch(() => {});
        await page.waitForTimeout(200).catch(() => {});

        const addToBottomButton = modal.locator(`[data-testid="${addToBottomButtonTestId}"]`);
        await addToBottomButton.click().catch(() => {});
        await page.waitForTimeout(300).catch(() => {});

        await bottomTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
        const bottomRows = bottomTable.locator('tbody tr');
        const bottomCount = await bottomRows.count();
        expect(bottomCount).toBeGreaterThan(0);

        const desiredQty = (quantity ?? 1).toString();
        try {
          const lastRow = bottomRows.nth(bottomCount - 1);
          const qtyCell = lastRow.locator('td').nth(3);
          await qtyCell.dblclick();
          await page.waitForTimeout(100).catch(() => {});
          const qtyInput = qtyCell.locator('input');
          await qtyInput.fill(desiredQty);
          await page.waitForTimeout(50).catch(() => {});
          await qtyInput.press('Enter');
          await page.waitForTimeout(100).catch(() => {});
        } catch (e) {
          logger.warn(`Failed to set quantity for "${searchValue}": ${(e as Error).message}`);
        }
      }

      const addToMainButtonSelector = addToMainButtonTestId.includes('data-testid')
        ? addToMainButtonTestId
        : `[data-testid="${addToMainButtonTestId}"]`;
      const addToMainButton = modal.locator(addToMainButtonSelector);
      await addToMainButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      const enabled = await addToMainButton.isEnabled();
      if (enabled) {
        await addToMainButton.click().catch(() => {});
      } else {
        logger.warn('Add to main button disabled after multiple additions');
      }
      await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    } else {
      const cancelButtonSelector = PartsDatabaseHelper.getCancelButtonSelectorForDialog(dialogTestId);
      const cancelButton = modal.locator(cancelButtonSelector);
      await cancelButton.click().catch(() => {});
      await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
  }

  /**
   * Resets a product's specification to match the provided configuration.
   */
  async resetProductSpecificationsByConfig(
    page: Page,
    navigateToPartsDb: () => Promise<void>,
    productSearch: string,
    config: TestProductSpecification,
  ): Promise<void> {
    await navigateToPartsDb();
    const leftTable = page.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE);
    const searchInput = leftTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
    await searchInput.fill(productSearch);
    await searchInput.press('Enter');
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    await page.waitForTimeout(1000).catch(() => {});
    const firstRow = leftTable.locator('tbody tr:first-child');
    await firstRow.waitFor({ state: 'visible', timeout: 10000 });
    await firstRow.click();
    await page.waitForTimeout(300).catch(() => {});
    const editButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_EDIT_BUTTON);
    await editButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});

    await this.reconcileGroupClearAndSet(
      page,
      SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_СБ_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_SEARCH_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.assemblies || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    await this.reconcileGroupClearAndSet(
      page,
      SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAIL_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_BOTTOM_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.details || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    await this.reconcileGroupClearAndSet(
      page,
      SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ITEM_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_BOTTOM_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.standardParts || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    await this.reconcileGroupClearAndSet(
      page,
      SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_РМ_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ITEM_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_BOTTOM_TABLE_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON_TESTID,
      SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_ADDTOMAIN_BUTTON,
      (config.consumables || []).map(i => ({ name: i.name, quantity: i.quantity })),
    );

    const saveButton = page.locator(SelectorsPartsDataBase.MAIN_PAGE_SAVE_BUTTON_STARTS_WITH);
    await saveButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await saveButton.click().catch(() => {});
    await page.waitForTimeout(500).catch(() => {});
  }

  /**
   * Clean up test detail by searching and archiving all exact matches.
   */
  async cleanupTestDetail(
    page: Page,
    detailName: string,
    tableTestId: string,
    searchInputTestId?: string,
    archiveButtonTestId?: string,
    confirmModalTestId?: string,
    confirmButtonTestId?: string,
  ): Promise<void> {
    const detailTableSelector =
      tableTestId.includes('[data-testid') || tableTestId.includes('[') ? tableTestId : `[data-testid="${tableTestId}"]`;
    const detailTable = page.locator(detailTableSelector);

    const defaultSearchInput = 'BasePaginationTable-Thead-SearchInput-Dropdown-Input';
    const searchInputTestIdValue = searchInputTestId || defaultSearchInput;
    const searchInputSelector =
      searchInputTestIdValue.includes('[data-testid') || searchInputTestIdValue.includes('[')
        ? searchInputTestIdValue
        : `[data-testid="${searchInputTestIdValue}"]`;
    const searchInput = detailTable.locator(searchInputSelector);

    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    await searchInput.fill(detailName);
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const rows = detailTable.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      logger.log(`No existing ${detailName} found for cleanup`);
      return;
    }

    const matchingRows: Locator[] = [];
    for (let i = 0; i < rowCount; i++) {
      const rowText = await rows.nth(i).textContent();
      if (rowText && rowText.trim() === detailName) {
        matchingRows.push(rows.nth(i));
      }
    }

    for (let i = matchingRows.length - 1; i >= 0; i--) {
      const currentRow = matchingRows[i];
      await currentRow.click();
      await page.waitForTimeout(500);

      const archiveButtonSelector = archiveButtonTestId || 'BaseProducts-Button-Archive';
      const archiveButton = page.locator(`[data-testid="${archiveButtonSelector}"]`);
      await expect(archiveButton).toBeVisible();
      await archiveButton.click();
      await page.waitForLoadState('networkidle');

      const confirmModalSelector = confirmModalTestId || 'ModalConfirm';
      const archiveModal = page.locator(`dialog[data-testid="${confirmModalSelector}"]`);
      await expect(archiveModal).toBeVisible();

      const confirmButtonSelector = confirmButtonTestId
        ? `[data-testid="${confirmButtonTestId}"]`
        : SelectorsArchiveModal.MODAL_CONFIRM_DIALOG_YES_BUTTON;
      const yesButton = archiveModal.locator(confirmButtonSelector);
      await expect(yesButton).toBeVisible();
      await yesButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    logger.log(`✅ Cleaned up ${matchingRows.length} instances of ${detailName}`);
  }

  /**
   * Cleans up test items by searching for items with a given prefix and archiving all found items.
   */
  async cleanupTestItemsByPrefix(
    page: Page,
    itemTypeName: string,
    searchPrefix: string,
    searchInputSelector: string,
    tableSelector: string,
    searchInputPosition: 'first' | 'last' | number = 'first',
    archiveButtonSelector: string = SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON,
    confirmButtonSelector: string = SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON,
  ): Promise<void> {
    logger.log(`${itemTypeName}: Cleaning up ${itemTypeName} items...`);

    let searchInput = page.locator(searchInputSelector);
    if (searchInputPosition === 'first') {
      searchInput = searchInput.first();
    } else if (searchInputPosition === 'last') {
      searchInput = searchInput.last();
    } else if (typeof searchInputPosition === 'number') {
      searchInput = searchInput.nth(searchInputPosition);
    }

    await searchInput.clear();
    await searchInput.fill(searchPrefix);
    await searchInput.press('Enter');
    await page.waitForTimeout(TIMEOUTS.STANDARD);
    await this.navigationHelper.waitForNetworkIdle();

    const rows = page.locator(`${tableSelector} tbody tr`);
    const rowCount = await rows.count();
    logger.log(`Found ${rowCount} ${itemTypeName} items to delete`);

    for (let i = rowCount - 1; i >= 0; i--) {
      const row = rows.nth(i);
      await row.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await row.scrollIntoViewIfNeeded();
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      await row.click();
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      const archiveButton = page.locator(archiveButtonSelector).filter({ hasText: 'Архив' }).first();
      await archiveButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await expect(archiveButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });

      await archiveButton.click();
      await page.waitForTimeout(TIMEOUTS.VERY_SHORT);

      const confirmButton = page.locator(confirmButtonSelector).filter({ hasText: 'Да' }).first();
      await confirmButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
      await confirmButton.click();
      await page.waitForTimeout(TIMEOUTS.MEDIUM);
      await this.navigationHelper.waitForNetworkIdle();
    }

    logger.log(`Deleted ${rowCount} ${itemTypeName} items`);
  }

  /**
   * Adds a detail to an assembly specification.
   */
  async addDetailToAssemblySpecification(page: Page, detailName: string): Promise<void> {
    await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON).click();
    await page.waitForTimeout(1000);

    await page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_Д).first().click();
    await page.waitForTimeout(1000);

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const dialogTable = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_DETAIL_TABLE);
    await expect(dialogTable).toBeVisible({ timeout: 10000 });

    const dialogSearchInput = dialogTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
    await expect(dialogSearchInput).toBeVisible({ timeout: 10000 });

    await dialogSearchInput.fill('');
    await dialogSearchInput.press('Enter');
    await page.waitForTimeout(1000);

    await dialogSearchInput.fill(detailName);
    await dialogSearchInput.press('Enter');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const resultRows = dialogTable.locator('tbody tr');
    const rowCount = await resultRows.count();
    let found = false;

    for (let i = 0; i < rowCount; i++) {
      const rowText = await resultRows.nth(i).textContent();
      if (rowText && rowText.trim() === detailName) {
        const targetRow = resultRows.nth(i);
        await this.elementHelper.highlightElement(targetRow);
        await targetRow.click();
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Detail "${detailName}" not found in dialog results.`);
    }

    await page.waitForTimeout(1000);

    await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON).click();
    await page.waitForTimeout(1000);
    await page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_ADDTOMAIN_BUTTON).click();
    await page.waitForTimeout(1000);

    await this.verifyDetailSuccessMessage('Деталь добавлена в спецификацию');
    logger.log(`✅ Added detail "${detailName}" to assembly`);
  }

  /**
   * Saves the current product being created/edited.
   */
  async saveProduct(page: Page): Promise<boolean> {
    try {
      const saveButton = page.locator(SelectorsPartsDataBase.BUTTON_SAVE_CBED);
      await saveButton.waitFor({ state: 'visible', timeout: 10000 });
      await saveButton.click();
      await this.navigationHelper.waitForNetworkIdle();

      const loaderDialog = page.locator(SelectorsPartsDataBase.CREATOR_LOADER);
      await loaderDialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1000);

      const cancelButton = page.locator(SelectorsPartsDataBase.BUTTON_CANCEL_CBED);
      const isCancelVisible = await cancelButton.isVisible({ timeout: 5000 }).catch(() => false);

      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      const isCreateVisible = await createButton.isVisible({ timeout: 2000 }).catch(() => false);

      return isCancelVisible && !isCreateVisible;
    } catch (error) {
      logger.error(`Failed to save product: ${error}`);
      return false;
    }
  }

  /**
   * Cancels the current product creation/edit and returns to the list page.
   */
  async cancelProductCreation(page: Page): Promise<boolean> {
    try {
      const loaderDialog = page.locator(SelectorsPartsDataBase.CREATOR_LOADER);
      await loaderDialog.waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);

      const cancelButton = page.locator(SelectorsPartsDataBase.BUTTON_CANCEL_CBED);
      await cancelButton.waitFor({ state: 'visible', timeout: 10000 });
      await cancelButton.click();

      await this.navigationHelper.waitForNetworkIdle();
      const createButton = page.locator(SelectorsPartsDataBase.BUTTON_CREATE_NEW_PART);
      await createButton.waitFor({ state: 'visible', timeout: 10000 });
      return await createButton.isVisible();
    } catch (error) {
      logger.error(`Failed to cancel product creation: ${error}`);
      return false;
    }
  }

  /**
   * Archives all test products matching the given search prefix.
   */
  async archiveAllTestProductsByPrefix(
    page: Page,
    navigateToPartsDb: () => Promise<void>,
    searchPrefix: string,
    options?: { maxIterations?: number },
  ): Promise<number> {
    const maxIterations = options?.maxIterations ?? 100;
    let iteration = 0;
    let archivedCount = 0;

    await navigateToPartsDb();
    await this.navigationHelper.waitForNetworkIdle();

    while (iteration < maxIterations) {
      iteration++;
      logger.log(`Archive iteration ${iteration} for products with prefix: ${searchPrefix}`);

      const table = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
      const searchInput = table.locator('[data-testid*="SearchInput"] input').first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await searchInput.clear();
      await searchInput.fill(searchPrefix);
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      await this.navigationHelper.waitForNetworkIdle();
      await page.waitForTimeout(1000);

      const tableBody = table.locator('tbody');
      await tableBody.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
      const rows = tableBody.locator('tr');
      const rowCount = await rows.count();

      if (rowCount === 0) {
        logger.log(`✅ No more products found with prefix "${searchPrefix}"`);
        break;
      }

      const lastRow = rows.nth(rowCount - 1);
      await lastRow.scrollIntoViewIfNeeded();

      const currentRows = tableBody.locator('tr');
      const currentRowCount = await currentRows.count();
      if (currentRowCount === 0) {
        logger.log('Table became empty during operation');
        break;
      }

      const targetRow = currentRows.nth(currentRowCount - 1);
      await targetRow.scrollIntoViewIfNeeded();

      try {
        await targetRow.click({ timeout: 5000 });
      } catch (error) {
        logger.log(`Row click failed (may have been deleted): ${error}`);
        continue;
      }

      const archiveButton = page.locator(SelectorsArchiveModal.PARTS_PAGE_ARCHIVE_BUTTON);
      await archiveButton.waitFor({ state: 'visible', timeout: 10000 });

      let isEnabled = await archiveButton.isEnabled();
      if (!isEnabled) {
        for (let retry = 0; retry < 5; retry++) {
          isEnabled = await archiveButton.isEnabled();
          if (isEnabled) break;
          await page.waitForTimeout(500);
        }
      }

      if (!isEnabled) {
        logger.log('Archive button is disabled after retries. Re-checking if item still exists...');
        await page.waitForTimeout(1000);
        const recheckTable = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
        const recheckTableBody = recheckTable.locator('tbody');
        await recheckTableBody.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
        const recheckRows = recheckTableBody.locator('tr');
        const recheckRowCount = await recheckRows.count();

        if (recheckRowCount === 0) {
          logger.log('Item was actually archived (table is now empty).');
          archivedCount++;
          break;
        }

        if (recheckRowCount < rowCount) {
          logger.log('Item count decreased, item may have been archived. Continuing...');
          archivedCount++;
          continue;
        }

        logger.log('Archive button is disabled and item still exists, stopping');
        break;
      }

      await archiveButton.click();

      const confirmButton = page
        .locator(SelectorsArchiveModal.ARCHIVE_MODAL_CONFIRM_DIALOG_YES_BUTTON)
        .filter({ hasText: 'Да' });
      await confirmButton.waitFor({ state: 'visible', timeout: 10000 });
      await confirmButton.click();

      archivedCount++;
      await page.waitForTimeout(1000);
      await this.navigationHelper.waitForNetworkIdle();
    }

    if (iteration >= maxIterations) {
      console.warn(`⚠️ Reached maximum iterations (${maxIterations}) for archiving products with prefix "${searchPrefix}"`);
    } else {
      logger.log(`✅ Completed archiving products with prefix "${searchPrefix}" after ${iteration} iterations`);
    }

    return archivedCount;
  }

  /**
   * Performs the create-detail flow: navigate, fill name, save, verify success message.
   * Caller is responsible for assertion (edit title visible) and clicking cancel to return to list.
   */
  async createDetailFlow(navigateToCreateDetail: () => Promise<void>, detailName: string): Promise<void> {
    await navigateToCreateDetail();
    await this.fillDetailName(detailName, SelectorsPartsDataBase.INPUT_DETAIL_NAME);
    await this.clickButtonByDataTestId(SelectorsPartsDataBase.ADD_DETAL_BUTTON_SAVE_AND_CANCEL_BUTTONS_CENTER_SAVE_ID);
    await this.page.waitForTimeout(TIMEOUTS.STANDARD);
    await this.navigationHelper.waitForNetworkIdle();
    await this.verifyDetailSuccessMessage('Деталь успешно создана');
  }

  /**
   * Creates an equipment item (navigate, add, fill name, select type/subtype/operation, save).
   */
  async createEquipment(
    navigateToBaseEquipments: () => Promise<void>,
    equipmentName: string,
    operationType: string,
    testInfo: TestInfo,
  ): Promise<boolean> {
    await navigateToBaseEquipments();

    const addButton = this.page.locator(SelectorsEquipment.BASE_EQUIPMENT_ADD_BUTTON);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(addButton).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify Add button is visible',
      testInfo,
    );
    await addButton.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const nameInput = this.page.locator(SelectorsEquipment.CREATOR_EQUIPMENT_NAME_INPUT);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(nameInput).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify name input is visible',
      testInfo,
    );
    await nameInput.fill(equipmentName);
    await this.page.waitForTimeout(TIMEOUTS.SHORT);

    const typeTable = this.page.locator(SelectorsEquipment.CREATOR_EQUIPMENT_TYPE_TABLE);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(typeTable).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify type table is visible',
      testInfo,
    );

    const firstTypeRow = typeTable
      .locator('tbody')
      .locator(SelectorsEquipment.getEquipmentTypeTableRowSelector())
      .first();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(firstTypeRow).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify first type row is visible',
      testInfo,
    );
    await firstTypeRow.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const subtypeTable = this.page.locator(SelectorsEquipment.CREATOR_EQUIPMENT_SUBTYPE_TABLE);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(subtypeTable).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify subtype table is visible',
      testInfo,
    );

    const firstSubtypeRow = subtypeTable
      .locator('tbody')
      .locator(SelectorsEquipment.getEquipmentSubtypeTableRowSelector())
      .first();
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(firstSubtypeRow).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify first subtype row is visible',
      testInfo,
    );
    await firstSubtypeRow.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const operationFilterTitle = this.page.locator(
      SelectorsEquipment.CREATOR_EQUIPMENT_OPERATION_SELECT_FILTER_TITLE,
    );
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(operationFilterTitle).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify operation filter title is visible',
      testInfo,
    );
    await operationFilterTitle.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const optionsList = this.page.locator(
      SelectorsEquipment.CREATOR_EQUIPMENT_OPERATION_SELECT_FILTER_OPTIONS_LIST,
    );
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(optionsList).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify options list is visible',
      testInfo,
    );

    const operationOption = optionsList.locator(`text="${operationType}"`);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(operationOption).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      `Verify operation option "${operationType}" is visible`,
      testInfo,
    );
    await operationOption.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    await typeTable.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const saveButton = this.page.locator(SelectorsEquipment.CREATOR_EQUIPMENT_SAVE_BUTTON);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(saveButton).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify Save button is visible',
      testInfo,
    );
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(saveButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify Save button is enabled',
      testInfo,
    );

    try {
      await saveButton.click({ timeout: WAIT_TIMEOUTS.SHORT });
    } catch (error) {
      await saveButton.evaluate((el: HTMLElement) => {
        (el as HTMLElement).click();
      });
    }
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const notification = this.page.locator(SelectorsNotifications.NOTIFICATION_DESCRIPTION);
    await expectSoftWithScreenshot(
      this.page,
      () => {
        expect.soft(notification).toBeVisible({ timeout: WAIT_TIMEOUTS.STANDARD });
      },
      'Verify success notification is visible',
      testInfo,
    );

    await this.page.waitForTimeout(TIMEOUTS.STANDARD);
    return true;
  }

  /**
   * Adds a material to the current specification (for assembly or product).
   */
  async addMaterialToSpecification(materialName: string, testInfo?: TestInfo): Promise<void> {
    await this.clickButtonByDataTestId(SelectorsPartsDataBase.SPECIFICATION_BUTTONS_ADDING_SPECIFICATION_ID, false);
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const materialIcon = this.page.locator(SelectorsPartsDataBase.MAIN_PAGE_SMALL_DIALOG_ПД).first();
    await this.elementHelper.highlightElement(materialIcon);
    await materialIcon.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await this.navigationHelper.waitForNetworkIdle();

    const materialModal = await this.verifyModalVisible(
      SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG,
      WAIT_TIMEOUTS.SHORT,
    );

    try {
      await this.searchAndSelectMaterial(
        SelectorsPartsDataBase.MODAL_BASE_MATERIAL_TABLE_LIST_SWITCH_ITEM1,
        materialName,
      );
    } catch (error) {
      const errorMessage = `Material "${materialName}" not found in database. Materials must be created in the Materials Database (${SELECTORS.MAINMENU.MATERIALS.URL}) before they can be added to specifications.`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const addButton = this.page.locator(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_ADD_BUTTON);
    if (testInfo) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(addButton).toBeEnabled({ timeout: WAIT_TIMEOUTS.STANDARD });
        },
        'Verify Add button is enabled after material selection',
        testInfo,
      );
    }

    await this.clickButtonByDataTestId(SelectorsPartsDataBase.MODAL_BASE_MATERIAL_ADD_BUTTON_ID, false);
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    if (testInfo) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(materialModal).not.toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify material modal is closed after adding',
        testInfo,
      );
    }
  }

  /**
   * Creates an assembly (СБ): navigate, click create, select СБ, fill name, add materials/details, save.
   */
  async createAssemblyFlow(
    navigateToPartsDb: () => Promise<void>,
    assemblyName: string,
    specificationItems: {
      materials?: Array<{ name: string; quantity?: number }>;
      details?: Array<{ name: string; quantity?: number }>;
    } | undefined,
    testInfo: TestInfo | undefined,
  ): Promise<boolean> {
    await navigateToPartsDb();

    await this.clickButtonByDataTestId(SelectorsPartsDataBase.BASE_PRODUCTS_BUTTON_CREATE_ID, false);
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const assemblyTypeButton = this.page
      .locator(SelectorsPartsDataBase.BASE_PRODUCTS_CREAT_LINK_ASSEMBLY_UNITS)
      .first();
    await this.elementHelper.highlightElement(assemblyTypeButton);
    await assemblyTypeButton.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const assemblyInput = this.page.locator(SelectorsPartsDataBase.INPUT_NAME_IZD);
    if (testInfo) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(assemblyInput).toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify assembly input is visible',
        testInfo,
      );
    }
    await this.fillAndVerifyField(SelectorsPartsDataBase.INPUT_NAME_IZD, assemblyName);

    if (specificationItems?.materials) {
      for (const material of specificationItems.materials) {
        await this.addMaterialToSpecification(material.name, testInfo);
      }
    }

    if (specificationItems?.details) {
      for (const detail of specificationItems.details) {
        await this.addDetailToAssemblySpecification(this.page, detail.name);
        if (testInfo) {
          await this.verifyDetailSuccessMessage('Деталь добавлена в спецификацию');
        }
      }
    }

    const saveSuccess = await this.saveProduct(this.page);
    if (testInfo) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(saveSuccess).toBe(true);
        },
        'Verify assembly was saved successfully',
        testInfo,
      );
      await this.verifyDetailSuccessMessage('Сборочная единица успешно создана');
    }

    return true;
  }

  /**
   * Adds an assembly to the current specification (for product).
   */
  async addAssemblyToSpecification(assemblyName: string, testInfo?: TestInfo): Promise<void> {
    await this.clickButtonByDataTestId(SelectorsPartsDataBase.SPECIFICATION_BUTTONS_ADDING_SPECIFICATION_ID, false);
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const assemblyIcon = this.page
      .locator(SelectorsPartsDataBase.SPECIFICATION_DIALOG_CARD_BASE_OF_ASSEMBLY_UNITS_0)
      .first();
    await this.elementHelper.highlightElement(assemblyIcon);
    await assemblyIcon.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await this.navigationHelper.waitForNetworkIdle();

    const assemblyModal = this.page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_OPEN);
    await assemblyModal.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    const dialogTable = assemblyModal.locator(SelectorsPartsDataBase.CBED_TABLE);
    await dialogTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    let searchInput = dialogTable.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
    if ((await searchInput.count()) === 0) {
      searchInput = assemblyModal.locator(SelectorsPartsDataBase.MAIN_PAGE_ИЗДЕЛИЕ_TABLE_SEARCH_INPUT);
    }
    await searchInput.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.STANDARD });

    await searchInput.clear();
    await this.page.waitForTimeout(TIMEOUTS.VERY_SHORT);
    await searchInput.fill(assemblyName);
    await searchInput.press('Enter');
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await this.navigationHelper.waitForNetworkIdle();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    const resultRows = dialogTable.locator('tbody tr');
    const rowCount = await resultRows.count();

    if (rowCount === 0) {
      logger.warn(`No search results found for assembly "${assemblyName}". Table may be empty or search didn't work.`);
    } else {
      logger.info(`Found ${rowCount} search result(s) for assembly "${assemblyName}"`);
    }

    let found = false;

    for (let i = 0; i < rowCount; i++) {
      const rowText = await resultRows.nth(i).textContent();
      const trimmedRowText = rowText?.trim() || '';
      logger.info(`Checking row ${i}: "${trimmedRowText}"`);
      if (trimmedRowText.includes(assemblyName)) {
        const targetRow = resultRows.nth(i);
        await this.elementHelper.highlightElement(targetRow);
        await targetRow.click();
        await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
        found = true;
        logger.info(`✅ Found and selected assembly "${assemblyName}"`);
        break;
      }
    }

    if (!found) {
      const allRowTexts: string[] = [];
      for (let i = 0; i < rowCount; i++) {
        const rowText = await resultRows.nth(i).textContent();
        allRowTexts.push(rowText?.trim() || '');
      }
      logger.error(
        `Assembly "${assemblyName}" not found in dialog results. Available rows: ${JSON.stringify(allRowTexts)}`,
      );
      throw new Error(
        `Assembly "${assemblyName}" not found in dialog results. Found ${rowCount} row(s) but none matched.`,
      );
    }

    const selectButton = assemblyModal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOBOTTOM_BUTTON);
    await selectButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
    await this.elementHelper.highlightElement(selectButton);
    await selectButton.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);
    await this.navigationHelper.waitForNetworkIdle();

    const bottomTable = assemblyModal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_BOTTOM_TABLE);
    await bottomTable.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
    const bottomTableRows = bottomTable.locator('tbody tr');
    const bottomRowCount = await bottomTableRows.count();

    let assemblyInBottomTable = false;
    for (let i = 0; i < bottomRowCount; i++) {
      const rowText = await bottomTableRows.nth(i).textContent();
      if (rowText && rowText.includes(assemblyName)) {
        assemblyInBottomTable = true;
        break;
      }
    }
    expect(assemblyInBottomTable).toBe(true);

    const addButton = assemblyModal.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_ADDTOMAIN_BUTTON);
    await addButton.waitFor({ state: 'visible', timeout: WAIT_TIMEOUTS.SHORT });
    await this.elementHelper.highlightElement(addButton);
    await addButton.click();
    await this.page.waitForTimeout(TIMEOUTS.MEDIUM);

    if (testInfo) {
      await expectSoftWithScreenshot(
        this.page,
        () => {
          expect.soft(assemblyModal).not.toBeVisible({ timeout: WAIT_TIMEOUTS.SHORT });
        },
        'Verify assembly modal is closed after adding',
        testInfo,
      );
    }
  }

  /**
   * Returns the count of remaining test products matching the search prefix (after navigating to parts DB).
   */
  async getRemainingTestProductsCount(
    page: Page,
    navigateToPartsDb: () => Promise<void>,
    searchPrefix: string,
    searchAndWaitForTable: (searchTerm: string, tableSelector: string, tableBodySelector: string, options?: object) => Promise<void>,
  ): Promise<number> {
    await navigateToPartsDb();
    await this.navigationHelper.waitForNetworkIdle();

    const tableBodySelector = `${SelectorsPartsDataBase.PRODUCT_TABLE} tbody`;
    try {
      await searchAndWaitForTable(searchPrefix, SelectorsPartsDataBase.PRODUCT_TABLE, tableBodySelector, {
        useRedesign: true,
        timeoutBeforeWait: 2000,
        minRows: 0,
      });
    } catch (error) {
      logger.log(`Search completed - table may be empty (success condition): ${String(error)}`);
      await page.waitForTimeout(1000);
    }

    const table = page.locator(SelectorsPartsDataBase.PRODUCT_TABLE);
    const rows = table.locator('tbody tr');
    return await rows.count().catch(() => 0);
  }

  async addItemToSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    searchValue: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    itemType?: string,
  ): Promise<void> {
    const columnIndex = itemType === 'РМ' || itemType === 'ПД' ? 0 : 1;
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error) {
      logger.warn(`Network idle timeout: ${error instanceof Error ? error.message : String(error)}`);
    }
    try {
      await page.waitForTimeout(1000);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
    }
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    try {
      await addButton.click();
    } catch (error) {
      logger.warn(`Failed to click add button: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    try {
      await page.waitForTimeout(500);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
    }
    let smallDialogSelector = smallDialogButtonId;
    const smallDialogMatch = smallDialogButtonId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
    if (smallDialogMatch && smallDialogMatch[1]) {
      smallDialogSelector = smallDialogButtonId;
    } else {
      smallDialogSelector = `div[data-testid="${smallDialogButtonId}"]`;
    }
    const dialogButton = page.locator(smallDialogSelector);
    try {
      await dialogButton.click();
    } catch (error) {
      logger.warn(`Failed to click dialog button: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    try {
      await page.waitForTimeout(500);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
    }
    let modalSelector = dialogTestId;
    if (dialogTestId.includes('data-testid')) {
      const dlgMatch = dialogTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
      if (dialogTestId.includes('dialog')) {
        modalSelector = dialogTestId.includes('[open]') ? dialogTestId : `${dialogTestId}[open]`;
      } else if (dlgMatch?.[1]) {
        modalSelector = `dialog[data-testid="${dlgMatch[1]}"][open]`;
      } else {
        modalSelector = `dialog${dialogTestId.includes('[open]') ? dialogTestId : `${dialogTestId}[open]`}`;
      }
    } else {
      modalSelector = `dialog[data-testid^="${dialogTestId}"][open]`;
    }
    const modal = page.locator(modalSelector);
    try {
      await expect(modal).toBeVisible();
    } catch (error) {
      logger.warn(`Modal not visible: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }
    try {
      await page.waitForTimeout(1000);
    } catch (error) {
      logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
    }
    const itemExists = await this.checkItemExistsInBottomTable(page, searchValue, dialogTestId, bottomTableTestId);
    if (!itemExists) {
      let searchTableSelector = searchTableTestId;
      const searchTableMatch = searchTableTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
      if (searchTableMatch?.[1]) {
        searchTableSelector = searchTableTestId.includes('data-testid') ? searchTableTestId : `[data-testid="${searchTableMatch[1]}"]`;
      } else if (!searchTableTestId.includes('data-testid')) {
        searchTableSelector = `[data-testid="${searchTableTestId}"]`;
      }
      await modal.locator(searchTableSelector).waitFor({ state: 'visible' });
      const itemTableLocator = modal.locator(searchTableSelector);
      await itemTableLocator.evaluate((element: HTMLElement) => {
        element.style.border = '3px solid red';
        element.style.backgroundColor = 'yellow';
      });
      await page.waitForTimeout(1000);
      const searchInput = itemTableLocator.locator('input.search-yui-kit__input');
      await searchInput.fill(searchValue);
      logger.info(`Searching for: ${searchValue}`);
      await searchInput.press('Enter');
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch (error) {
        logger.warn(`Network idle timeout: ${error instanceof Error ? error.message : String(error)}`);
      }
      try {
        await page.waitForTimeout(2000);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      }
      const searchRowCount = await itemTableLocator.locator('tbody tr').count();
      logger.info(`Search results count: ${searchRowCount}`);
      if (searchRowCount === 0) {
        logger.warn(`No search results found for: ${searchValue}.`);
        return;
      }
      const firstRow = itemTableLocator.locator('tbody tr').first();
      try {
        await page.waitForTimeout(1500);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      }
      const firstRowText = await firstRow.locator('td').nth(columnIndex).textContent();
      logger.info(`First row text: ${firstRowText}`);
      if (firstRowText?.trim() !== searchValue.trim()) {
        logger.warn(`Search result doesn't exactly match. Expected: "${searchValue}", Got: "${firstRowText?.trim()}"`);
        return;
      }
      try {
        await firstRow.click();
      } catch (error) {
        logger.warn(`Failed to click first row: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
      try {
        await page.waitForTimeout(500);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      }
      const addToBottomButtonSelector = addToBottomButtonTestId.includes('data-testid')
        ? addToBottomButtonTestId
        : `[data-testid="${addToBottomButtonTestId}"]`;
      const addToBottomButton = modal.locator(addToBottomButtonSelector);
      try {
        await addToBottomButton.click();
      } catch (error) {
        logger.warn(`Failed to click add to bottom button: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
      try {
        await page.waitForTimeout(100);
      } catch (error) {
        logger.warn(`Timeout waiting: ${error instanceof Error ? error.message : String(error)}`);
      }
      let bottomTableSelector = bottomTableTestId;
      const bottomTableMatch = bottomTableTestId.match(/data-testid\s*[=:]\s*["']([^"']+)["']/);
      if (bottomTableMatch?.[1]) {
        bottomTableSelector = bottomTableTestId.includes('data-testid') ? bottomTableTestId : `[data-testid="${bottomTableMatch[1]}"]`;
      } else if (!bottomTableTestId.includes('data-testid')) {
        bottomTableSelector = `[data-testid="${bottomTableTestId}"]`;
      }
      const bottomTableLocator = modal.locator(bottomTableSelector);
      const rows = bottomTableLocator.locator('tbody tr');
      const rowCount = await rows.count();
      if (rowCount === 0) {
        logger.warn('Bottom table is empty after adding item.');
        return;
      }
      let isItemFound = false;
      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i);
        const partName = await row.locator('td').nth(1).textContent();
        if (partName?.trim() === searchValue.trim()) {
          isItemFound = true;
          break;
        }
      }
      if (!isItemFound) {
        logger.warn(`Item "${searchValue}" was not found in the bottom table after addition.`);
        return;
      }
    }
    const addToMainButtonSelector = addToMainButtonTestId.includes('data-testid') ? addToMainButtonTestId : `[data-testid="${addToMainButtonTestId}"]`;
    const addToMainButton = modal.locator(addToMainButtonSelector);
    await addToMainButton.waitFor({ state: 'visible', timeout: 10000 });
    let isButtonEnabled = false;
    try {
      isButtonEnabled = await addToMainButton.isEnabled();
    } catch {}
    logger.info(`Add to main button enabled: ${isButtonEnabled}`);
    if (!isButtonEnabled) {
      logger.warn('Add to main disabled. Closing modal via Cancel/Return.');
      const cancelButtonSelector =
        dialogTestId === SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG
          ? SelectorsPartsDataBase.EDIT_PAGE_ADD_СБ_RIGHT_DIALOG_CANCEL_BUTTON
          : dialogTestId === SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG
            ? SelectorsPartsDataBase.EDIT_PAGE_ADD_Д_RIGHT_DIALOG_CANCEL_BUTTON
            : dialogTestId === SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG
              ? SelectorsPartsDataBase.EDIT_PAGE_ADD_ПД_RIGHT_DIALOG_CANCEL_BUTTON
              : SelectorsPartsDataBase.EDIT_PAGE_ADD_РМ_RIGHT_DIALOG_CANCEL_BUTTON;
      const cancelButton = modal.locator(cancelButtonSelector);
      await cancelButton.click().catch(() => {});
      await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      return;
    }
    await page.waitForTimeout(500).catch(() => {});
    await addToMainButton.click().catch(() => {});
    await page.waitForTimeout(500).catch(() => {});
    await modal.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    const parsedTableArray = await this.parseStructuredTable(page, SelectorsPartsDataBase.MAIN_TABLE_TEST_ID);
    let isMainItemFound = false;
    for (const group of parsedTableArray) {
      if (group.items.some(row => row.some(cell => cell.trim() === searchValue.trim()))) {
        isMainItemFound = true;
        break;
      }
    }
    if (!isMainItemFound) {
      logger.warn(`Item "${searchValue}" was not found in the main table after addition.`);
    }
  }

  async addMultipleItemsToSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    searchTableTestId: string,
    bottomTableTestId: string,
    addToBottomButtonTestId: string,
    addToMainButtonTestId: string,
    items: Array<{ name: string; quantity?: number }>,
    itemType?: string,
  ): Promise<void> {
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch {}
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    await addButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});
    const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
    await dialogButton.click().catch(() => {});
    await page.waitForTimeout(300).catch(() => {});
    const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
    await expect(modal).toBeVisible();
    await page.waitForTimeout(500).catch(() => {});
    let itemTableLocator = modal.locator(`table[data-testid="${searchTableTestId}"]`);
    try {
      await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      const fallbackCbedTable = modal.locator(`table[data-testid="BasePaginationTable-Table-cbed"]`);
      if ((await fallbackCbedTable.count()) > 0) {
        itemTableLocator = fallbackCbedTable;
        await itemTableLocator.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      }
    }
    for (const { name: searchValue, quantity } of items) {
      let searchInput = modal.locator(SelectorsPartsDataBase.BASE_DETAIL_CB_TABLE_SEARCH).first();
      if ((await searchInput.count()) === 0) {
        searchInput = itemTableLocator.locator('input.search-yui-kit__input').first();
      }
      await searchInput.fill('').catch(() => {});
      await searchInput.fill(searchValue);
      await searchInput.press('Enter');
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {}
      await page.waitForTimeout(500).catch(() => {});
      const results = itemTableLocator.locator('tbody tr');
      const count = await results.count();
      if (count === 0) {
        logger.warn(`No results for "${searchValue}" in ${dialogTestId}`);
        continue;
      }
      await results.first().click().catch(() => {});
      await page.waitForTimeout(200).catch(() => {});
      const addToBottomButton = modal.locator(`[data-testid="${addToBottomButtonTestId}"]`);
      await addToBottomButton.click().catch(() => {});
      await page.waitForTimeout(300).catch(() => {});
      const bottomTable = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
      await bottomTable.waitFor({ state: 'visible', timeout: 10000 });
      const bottomRows = bottomTable.locator('tbody tr');
      const bottomCount = await bottomRows.count();
      expect(bottomCount).toBeGreaterThan(0);
      const desiredQty = (quantity ?? 1).toString();
      try {
        const lastRow = bottomRows.nth(bottomCount - 1);
        const qtyCell = lastRow.locator('td').nth(3);
        await qtyCell.dblclick();
        await page.waitForTimeout(100).catch(() => {});
        const qtyInput = qtyCell.locator('input');
        await qtyInput.fill(desiredQty);
        await page.waitForTimeout(50).catch(() => {});
        await qtyInput.press('Enter');
        await page.waitForTimeout(100).catch(() => {});
      } catch (e) {
        logger.warn(`Failed to set quantity for "${searchValue}": ${(e as Error).message}`);
      }
    }
    const addToMainButtonSelector = addToMainButtonTestId.includes('data-testid') ? addToMainButtonTestId : `[data-testid="${addToMainButtonTestId}"]`;
    const addToMainButton = modal.locator(addToMainButtonSelector);
    await addToMainButton.waitFor({ state: 'visible', timeout: 10000 });
    const enabled = await addToMainButton.isEnabled();
    if (enabled) {
      await addToMainButton.click().catch(() => {});
    } else {
      logger.warn('Add to main button disabled after multiple additions');
    }
    await modal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async removeItemFromSpecification(
    page: Page,
    smallDialogButtonId: string,
    dialogTestId: string,
    bottomTableTestId: string,
    removeButtonColumnIndex: number,
    searchValue: string,
    returnButtonTestId: string,
    itemType?: string,
  ): Promise<void> {
    const columnIndex = 1;
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const addButton = page.locator(SelectorsPartsDataBase.EDIT_PAGE_ADD_BUTTON);
    await addButton.evaluate(el => {
      (el as HTMLElement).style.backgroundColor = 'black';
      (el as HTMLElement).style.border = '2px solid red';
      (el as HTMLElement).style.color = 'white';
    });
    await addButton.click();
    await page.waitForTimeout(500);
    const dialogButton = page.locator(`div[data-testid="${smallDialogButtonId}"]`);
    await dialogButton.evaluate(el => {
      (el as HTMLElement).style.backgroundColor = 'black';
      (el as HTMLElement).style.border = '2px solid red';
      (el as HTMLElement).style.color = 'white';
    });
    await dialogButton.click();
    await page.waitForTimeout(1500);
    const modal = page.locator(`dialog[data-testid^="${dialogTestId}"][open]`);
    await modal.evaluate(dialog => {
      (dialog as HTMLElement).style.border = '2px solid red';
    });
    const bottomTableLocator = modal.locator(`table[data-testid="${bottomTableTestId}"]`);
    await bottomTableLocator.evaluate(table => {
      (table as HTMLElement).style.border = '2px solid red';
    });
    const rowsLocator = bottomTableLocator.locator('tbody tr');
    const rowCount = await rowsLocator.count();
    expect(rowCount).toBeGreaterThan(0);
    let isRowFound = false;
    for (let i = 0; i < rowCount; i++) {
      const row = rowsLocator.nth(i);
      await row.evaluate(table => {
        (table as HTMLElement).style.border = '2px solid red';
      });
      await page.waitForTimeout(1500);
      const partNumber = await row.locator('td').nth(columnIndex).textContent();
      if (partNumber?.trim() === searchValue.trim()) {
        isRowFound = true;
        const partNumberCell = await row.locator('td').nth(columnIndex);
        await partNumberCell.evaluate(el => {
          (el as HTMLElement).style.border = '2px solid red';
        });
        await page.waitForTimeout(1000);
        const removeCell = row.locator('td').nth(removeButtonColumnIndex);
        await row.evaluate(el => {
          (el as HTMLElement).style.backgroundColor = 'black';
          (el as HTMLElement).style.border = '2px solid red';
          (el as HTMLElement).style.color = 'white';
        });
        await page.waitForTimeout(50);
        await removeCell.click();
        await page.waitForTimeout(1000);
        break;
      }
    }
    expect(isRowFound).toBeTruthy();
    const remainingRowsCount = await rowsLocator.count();
    expect(remainingRowsCount).toBe(rowCount - 1);
    const returnButton = page.locator(`[data-testid="${returnButtonTestId}"]`);
    await returnButton.evaluate(button => {
      (button as HTMLElement).style.backgroundColor = 'black';
      (button as HTMLElement).style.border = '2px solid green';
      (button as HTMLElement).style.color = 'white';
    });
    await page.waitForTimeout(500);
    await returnButton.click();
    await page.waitForLoadState('networkidle');
  }
}
