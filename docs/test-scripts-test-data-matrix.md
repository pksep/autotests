# Test scripts vs entity test data (for parallel runs)

This document maps **which scripts use which entity names** (detail, material, assembly/CBED, product names). Two scripts that use the **same** entity data must **not** run in parallel (they would create/change the same DB entities). Scripts that use **different** entity data can run in parallel.

**“Test data” here = entity names only** (detail, material, assembly, product), not JSON files used for UI validation (titles, buttons).

---

## Entity data sources

| Source | Entity names (examples) | Used by |
|--------|-------------------------|--------|
| **U001-Constants.ts** | Product: `0Т4.01`. Details: `0Т4.21`, `0Т4.22`. CBED: `0Т4.11`, `0Т4.12`. Designation: `0Т4`. Buyer: `М10`. | All U001-* specs |
| **U002-Constants.ts** | Entity name *values* are created at runtime by U002-DataSetup and stored in the DB; the constants file only defines the array *names* (`arrayDetail`, `arrayCbed`, `arrayIzd`) that hold those values. | All U002-* specs |
| **U005-Constants.ts** | Detail: `U005_spec_DETAILName`. Cleanup prefix: `U005_spec` (parts DB). Filebase cleanup search: `U005_image`. File base names: `U005_image_1`, `U005_image_2`. Also `TEST_NAME`, `TEST_MATERIAL`, `TEST_FILE` (reference existing DB data). **No overlap with U006.** | U005-01, U005-02 |
| **TestDataU004.ts** | Product: `Т15`. Assembly/product: `Опора (Траверса Т10А)СБ`, `СБ Маслобака 2 Литра`, `Опора штока d45мм`, `22" (21,5) Сенсорный...`, `Рулон бумажных полотенец`, etc. | All U004-* specs |
| **SelectorsPartsDataBase.ts** + **U006-shared.ts** + **testdata/U006-PC01.json** | Detail: `U006_test2_DETAILName` (TEST_DETAIL_NAME), `Деталь@#!$%^&*()_+` (U006_SPECIAL_CHAR_NAME). Materials: `Круг Сталь 09Г2С Ø100мм`, `Шестигранник Сталь 40х S22`, `Войлок акустический 10мм`. File base names: `U006_image_1`, `U006_image_2`. Filebase cleanup: `U006_image`. **No overlap with U005.** | All U006-* specs |

---

## Script → entity data (parallel-safety)

- Scripts in the **same group** share the same entity names → **do not run in parallel** with each other.
- Scripts in **different groups** use different entity names → **safe to run in parallel** (e.g. one U001-* worker, one U004-* worker).

| Entity data group | Scripts | Parallel with same group? |
|-------------------|--------|----------------------------|
| **U001 (0Т4.xx)** | U001-Setup, U001-Orders, U001-Assembly, U001-Receiving, U001-SecondTask, U001-SecondProduction, U001-FinalShipment, U001-Shipment, U001-Production, U001-Cleanup, U001-Archive | No — run sequentially or in one worker |
| **U002 (DataSetup-created)** | U002-Setup, U002-DataSetup, U002-Details, U002-Cbed, U002-Izd | No — run sequentially or in one worker |
| **U005 (U005_spec*)** | U005-01, U005-02 | No — run sequentially or in one worker |
| **U004 (TestDataU004)** | U004-1, U004-2, U004-3, U004-4, U004-5, U004-6, U004-7, U004-8, U004-9 | No — run sequentially or in one worker |
| **U006 (U006 / SelectorsPartsDataBase)** | U006-Archive, U006-CreateAndValidation, U006-SaveAndEdit, U006-EdgeCasesAndBulk (and U006.spec.ts entry point) | No — run sequentially with each other |

---

## Summary

- **Five entity-data groups:** U001, U002, U004, U005, U006. Each uses distinct entity names (detail/product/file base names).
- **U005 and U006 do not overlap entity names:** U005 uses `U005_spec_DETAILName` + filebase `U005_image*`; U006 uses `U006_test2_DETAILName` + `U006-PC01.json` + filebase `U006_image*`. **U005 and U006 can run in parallel** on one tenant if each suite stays in its own worker (sequential tests within the suite).
- Within each group, scripts use the same entity names → no parallel runs within the group.
- Across groups, parallel runs are safe (e.g. U001 + U002 + U004 + U005 + U006 all in parallel, each in its own worker).
