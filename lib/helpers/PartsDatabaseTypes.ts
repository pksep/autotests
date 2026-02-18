/**
 * @file PartsDatabaseTypes.ts
 * @purpose Shared types for Parts Database page and helpers (extracted from PartsDatabasePage).
 */

export type Item = {
  id: string;
  parentPartNumber: string;
  partNumber: string;
  name: string;
  dataTestId: string;
  material: string;
  quantity: number;
};

export type TestProductSpecification = {
  assemblies: Array<{ partNumber: string; name: string; quantity: number }>;
  details: Array<{ partNumber: string; name: string; quantity: number }>;
  standardParts: Array<{ name: string; quantity: number }>;
  consumables: Array<{ name: string; quantity: number }>;
};

export type GlobalTableData = {
  СБ: Item[];
  Д: Item[];
  ПМ: Item[];
  МД: Item[];
  ПД: Item[];
  РМ: Item[];
  ALL: Map<string, Item>;
};
