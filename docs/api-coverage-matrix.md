# API Autotest Coverage Matrix

Generated: 2026-07-02T14:43:28.395Z

Server routes: 450
Covered routes: 373
Uncovered routes: 77
Coverage: 82.9%
Detected autotest calls: 390

## Coverage By Module

| Module | Routes | Covered | Coverage |
|---|---:|---:|---:|
| actions | 1 | 1 | 100.0% |
| actions-chain | 1 | 1 | 100.0% |
| assemble | 28 | 28 | 100.0% |
| auth | 4 | 4 | 100.0% |
| buyer | 10 | 0 | 0.0% |
| cbed | 19 | 16 | 84.2% |
| comments | 7 | 0 | 0.0% |
| companies | 9 | 9 | 100.0% |
| contacts | 7 | 7 | 100.0% |
| deficits | 7 | 7 | 100.0% |
| deliveries | 7 | 7 | 100.0% |
| detal | 19 | 18 | 94.7% |
| documents | 14 | 14 | 100.0% |
| equipment | 23 | 22 | 95.7% |
| exclusion | 5 | 0 | 0.0% |
| expenditure | 1 | 0 | 0.0% |
| external | 1 | 1 | 100.0% |
| instrument | 23 | 23 | 100.0% |
| inventary | 21 | 21 | 100.0% |
| marks | 8 | 8 | 100.0% |
| material | 33 | 33 | 100.0% |
| metaloworking | 13 | 13 | 100.0% |
| movement-object | 2 | 2 | 100.0% |
| moving | 2 | 2 | 100.0% |
| neo4j | 1 | 0 | 0.0% |
| online-board | 2 | 2 | 100.0% |
| operation | 13 | 13 | 100.0% |
| product | 17 | 14 | 82.4% |
| production-task | 33 | 31 | 93.9% |
| provider | 8 | 0 | 0.0% |
| rack | 8 | 0 | 0.0% |
| roles | 8 | 8 | 100.0% |
| sclad | 9 | 9 | 100.0% |
| settings | 14 | 0 | 0.0% |
| shipments | 23 | 21 | 91.3% |
| solidworks | 3 | 0 | 0.0% |
| specification | 3 | 3 | 100.0% |
| stock-order | 16 | 16 | 100.0% |
| supply | 1 | 0 | 0.0% |
| tech-process | 2 | 2 | 100.0% |
| users | 16 | 9 | 56.3% |
| waybill | 8 | 8 | 100.0% |

## Route Matrix

| Status | Method | Route | Controller | Autotest Source |
|---|---|---|---|---|
| covered | DELETE | `api/assemble/:param` | `src/modules/assemble/assemble.controller.ts#deleteAssemblyEvent` | api/assemble/:param (pages/API/APIAssemble.ts) |
| covered | DELETE | `api/assemble/complect/ban/:param` | `src/modules/assemble/assemble.controller.ts#banComplect` | api/assemble/complect/ban/:param (pages/API/APIAssemble.ts) |
| covered | DELETE | `api/assemble/uncomplect/:param/:param` | `src/modules/assemble/assemble.controller.ts#uncomplectKit` | api/assemble/uncomplect/:param/:param (pages/API/APIAssemble.ts) |
| missing | DELETE | `api/buyer/:param` | `src/modules/buyer/buyer.controller.ts#banBuyer` | - |
| covered | DELETE | `api/cbed/:param` | `src/modules/cbed/cbed.controller.ts#banCbed` | api/cbed/:param (pages/API/APICBED.ts) |
| missing | DELETE | `api/comments/:param` | `src/modules/thread/thread.controller.ts#deleteCommentById` | - |
| covered | DELETE | `api/companies/:param` | `src/modules/company/companies.controller.ts#banCompany` | api/companies/:param (pages/API/APICompanies.ts) |
| covered | DELETE | `api/companies/bulk/:param` | `src/modules/company/companies.controller.ts#banBulk` | api/companies/bulk/:param (pages/API/APICompanies.ts) |
| covered | DELETE | `api/contacts/:param` | `src/modules/contact/contacts.controller.ts#banContact` | api/contacts/:param (pages/API/APIContacts.ts) |
| covered | DELETE | `api/contacts/bulk/:param` | `src/modules/contact/contacts.controller.ts#banContactsBulk` | api/contacts/bulk/:param (pages/API/APIContacts.ts) |
| covered | DELETE | `api/deliveries/banned/:param` | `src/modules/deliveries/deliveries.controller.ts#banDelivery` | api/deliveries/banned/:param (pages/API/APIDeliveries.ts) |
| covered | DELETE | `api/detal/:param` | `src/modules/detal/detal.controller.ts#removeDetalById` | api/detal/:param (pages/API/APIDetails.ts)<br>api/detal/:param (pages/API/APIParts.ts) |
| covered | DELETE | `api/documents/:param/:param` | `src/modules/documents/documents.controller.ts#banDocument` | api/documents/:param/:param (pages/API/APIDocuments.ts) |
| covered | DELETE | `api/equipment/:param` | `src/modules/equipment/equipment.controller.ts#removeEquipmentType` | api/equipment/:param (pages/API/APIEquipment.ts) |
| covered | DELETE | `api/equipment/ban/:param` | `src/modules/equipment/equipment.controller.ts#banEquipment` | api/equipment/ban/:param (pages/API/APIEquipment.ts) |
| missing | DELETE | `api/equipment/file/:param` | `src/modules/equipment/equipment.controller.ts#removeFileEquipment` | - |
| covered | DELETE | `api/equipment/pt/:param` | `src/modules/equipment/equipment.controller.ts#removeEquipmentPType` | api/equipment/pt/:param (pages/API/APIEquipment.ts) |
| missing | DELETE | `api/exclusion/:param` | `src/modules/exclusion/exclusion.controller.ts#bunExclusionById` | - |
| covered | DELETE | `api/instrument/:param` | `src/modules/instrument/instrument.controller.ts#banTInstrument` | api/instrument/:param (pages/API/APITools.ts) |
| covered | DELETE | `api/instrument/ban/:param` | `src/modules/instrument/instrument.controller.ts#banNameInstrument` | api/instrument/ban/:param (pages/API/APITools.ts) |
| covered | DELETE | `api/instrument/file/:param` | `src/modules/instrument/instrument.controller.ts#removeFileInstrument` | api/instrument/file/:param (pages/API/APITools.ts) |
| covered | DELETE | `api/instrument/pt/:param` | `src/modules/instrument/instrument.controller.ts#banPTInstrument` | api/instrument/pt/:param (pages/API/APITools.ts) |
| covered | DELETE | `api/inventary/:param` | `src/modules/inventary/inventary.controller.ts#deletePInventary` | api/inventary/:param (pages/API/APIInventory.ts) |
| covered | DELETE | `api/inventary/name/:param` | `src/modules/inventary/inventary.controller.ts#deleteInventaryById` | api/inventary/name/:param (pages/API/APIInventory.ts) |
| covered | DELETE | `api/inventary/pt/:param` | `src/modules/inventary/inventary.controller.ts#deletePTInventary` | api/inventary/pt/:param (pages/API/APIInventory.ts) |
| covered | DELETE | `api/marks/delete/mark/:param` | `src/modules/marks/marks.controller.ts#banMarkById` | api/marks/delete/mark/:param (pages/API/APIMarks.ts) |
| covered | DELETE | `api/material/ban/:param` | `src/modules/material/material.controller.ts#banMaterial` | api/material/ban/:param (pages/API/APIMaterials.ts) |
| covered | DELETE | `api/material/subtype/:param` | `src/modules/material/material.controller.ts#removeSubtypeMaterial` | api/material/subtype/:param (pages/API/APIMaterials.ts) |
| covered | DELETE | `api/material/type-material/:param` | `src/modules/material/material.controller.ts#removeTypeMaterial` | api/material/type-material/:param (pages/API/APIMaterials.ts) |
| covered | DELETE | `api/metaloworking/:param` | `src/modules/metaloworking/metaloworking.controller.ts#deleteMetolloworkingEvent` | api/metaloworking/:param (pages/API/APIMetaloworking.ts) |
| covered | DELETE | `api/operation/operation/:param` | `src/modules/operation/operation.controller.ts#banOperation` | api/operation/operation/:param (pages/API/APIOperation.ts) |
| covered | DELETE | `api/operation/typeoperation/:param` | `src/modules/operation/operation.controller.ts#deleteTypeOperationById` | api/operation/typeoperation/:param (pages/API/APIOperation.ts) |
| covered | DELETE | `api/product/:param` | `src/modules/product/product.controller.ts#banProduct` | api/product/:param (pages/API/APIProducts.ts) |
| covered | DELETE | `api/production-task/ban/:param` | `src/modules/production-tasks/production-tasks.controller.ts#banProductionTask` | api/production-task/ban/:param (pages/API/APIProductionTasks.ts) |
| covered | DELETE | `api/production-task/ban/operation/pos/:param` | `src/modules/production-tasks/production-tasks.controller.ts#banProductionOperationPos` | api/production-task/ban/operation/pos/:param (pages/API/APIProductionTasks.ts) |
| missing | DELETE | `api/rack/:param` | `src/modules/rack/rack.controller.ts#banRack` | - |
| missing | DELETE | `api/rack/delete/cell` | `src/modules/rack/rack.controller.ts#deleteDataByIds` | - |
| covered | DELETE | `api/roles/:param` | `src/modules/roles/roles.controller.ts#removeRoleById` | api/roles/:param (pages/API/APIRoles.ts) |
| missing | DELETE | `api/settings/db/:param` | `src/modules/settings/settings.controller.ts#dropDumpDB` | - |
| covered | DELETE | `api/shipments/:param` | `src/modules/shipments/shipments.controller.ts#deleteShipmentsById` | api/shipments/:param (pages/API/APIShipments.ts) |
| covered | DELETE | `api/shipments/combackcomplit/:param` | `src/modules/shipments/shipments.controller.ts#combackComplit` | api/shipments/combackcomplit/:param (pages/API/APIShipments.ts) |
| covered | DELETE | `api/stock-order/banned/:param` | `src/modules/stock-order/stock-order.controller.ts#bannedOneStockOrder` | api/stock-order/banned/:param (pages/API/APIStockOrder.ts) |
| covered | DELETE | `api/stock-order/items/:param` | `src/modules/stock-order/stock-order.controller.ts#bannedStockOrderItem` | api/stock-order/items/:param (pages/API/APIStockOrder.ts) |
| covered | DELETE | `api/users/ban` | `src/modules/users/users.controller.ts#banUser` | api/users/ban (pages/API/APIUsers.ts) |
| covered | DELETE | `api/users/files/:param/:param` | `src/modules/users/users.controller.ts#removeFileToUser` | api/users/files/:param/:param (pages/API/APIDocuments.ts)<br>api/users/files/:param/:param (pages/API/APIUsers.ts) |
| covered | DELETE | `api/waybill/:param` | `src/modules/waybill/waybill.controller.ts#deleteWaybill` | api/waybill/:param (pages/API/APIWaybill.ts) |
| covered | GET | `api/actions-chain/childs/:param` | `src/modules/actions-chain/actions-chain.controller.ts#getAllActionChilds` | api/actions-chain/childs/:param (pages/API/APIActionsChain.ts) |
| covered | GET | `api/assemble/:param` | `src/modules/assemble/assemble.controller.ts#getAssembleById` | api/assemble/:param (pages/API/APIAssemble.ts)<br>api/assemble/complects (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/byizd/:param/:param` | `src/modules/assemble/assemble.controller.ts#getAssembleByIzdId` | api/assemble/byizd/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/byizd/light/:param/:param` | `src/modules/assemble/assemble.controller.ts#getAssembleByIzdIdLight` | api/assemble/byizd/light/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/complectkit/:param` | `src/modules/assemble/assemble.controller.ts#getAssembleKitById` | api/assemble/complectkit/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/complectkit/active/count/:param/:param` | `src/modules/assemble/assemble.controller.ts#countDisactiveKitsById` | api/assemble/complectkit/active/count/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/complectkit/disactive/count/:param` | `src/modules/assemble/assemble.controller.ts#countDisactiveKits` | api/assemble/complectkit/disactive/count/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/complectkit/getbyassembly/:param` | `src/modules/assemble/assemble.controller.ts#getManyAssembleKitByAssId` | api/assemble/complectkit/getbyassembly/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/complectkit/update_responsible/:param/:param` | `src/modules/assemble/assemble.controller.ts#updateResponsibleKit` | api/assemble/complectkit/update_responsible/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/complects` | `src/modules/assemble/assemble.controller.ts#getAllAssemble` | api/assemble/:param (pages/API/APIAssemble.ts)<br>api/assemble/complects (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/count_value_by_obj/:param/:param` | `src/modules/assemble/assemble.controller.ts#countValueByEntity` | api/assemble/count_value_by_obj/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/kits-by-parents/:param/:param` | `src/modules/assemble/assemble.controller.ts#getKitsByParents` | api/assemble/kits-by-parents/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/light/:param` | `src/modules/assemble/assemble.controller.ts#getAssembleByIdLight` | api/assemble/light/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/relative/kit/child/:param/:param` | `src/modules/assemble/assemble.controller.ts#findRelativeInKitBychild` | api/assemble/relative/kit/child/:param/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/upload_to_excel` | `src/modules/assemble/assemble.controller.ts#uploadToExcel` | api/assemble/:param (pages/API/APIAssemble.ts) |
| covered | GET | `api/assemble/waybill/:param` | `src/modules/assemble/assemble.controller.ts#getAssemblyWaybill` | api/assemble/waybill/:param (pages/API/APIAssemble.ts) |
| missing | GET | `api/buyer/by_id/:param` | `src/modules/buyer/buyer.controller.ts#getById` | - |
| missing | GET | `api/buyer/files/:param/:param` | `src/modules/buyer/buyer.controller.ts#attachFileToBuyer` | - |
| missing | GET | `api/buyer/light/:param` | `src/modules/buyer/buyer.controller.ts#getBuyers` | - |
| covered | GET | `api/cbed/belongs/:param` | `src/modules/cbed/cbed.controller.ts#getOneCbedBelongs` | api/cbed/belongs/:param (pages/API/APICBED.ts) |
| missing | GET | `api/cbed/drafts/:param` | `src/modules/cbed/cbed.controller.ts#openDrafts` | - |
| covered | GET | `api/cbed/one/spetification/:param/:param` | `src/modules/cbed/cbed.controller.ts#getOneCbedSpetification` | api/cbed/one/spetification/:param/:param (pages/API/APICBED.ts) |
| missing | GET | `api/cbed/relatives/production/task/:param` | `src/modules/cbed/cbed.controller.ts#getRelativesProductionTask` | - |
| covered | GET | `api/cbed/shipments/:param` | `src/modules/cbed/cbed.controller.ts#getShipmentsAndOrders` | api/cbed/shipments/:param (pages/API/APICBED.ts) |
| covered | GET | `api/cbed/tech-process/:param` | `src/modules/cbed/cbed.controller.ts#getTechByCbedId` | api/cbed/tech-process/:param (pages/API/APICBED.ts) |
| missing | GET | `api/comments/by-entity/:param/:param` | `src/modules/thread/thread.controller.ts#getListCommentEntity` | - |
| missing | GET | `api/comments/by-thread/:param` | `src/modules/thread/thread.controller.ts#getThreadById` | - |
| covered | GET | `api/companies/:param` | `src/modules/company/companies.controller.ts#getCompanyById` | api/companies/:param (pages/API/APICompanies.ts) |
| covered | GET | `api/companies/check/:param` | `src/modules/company/companies.controller.ts#checkName` | api/companies/check/:param (pages/API/APICompanies.ts) |
| covered | GET | `api/contacts/:param` | `src/modules/contact/contacts.controller.ts#getContactById` | api/contacts/:param (pages/API/APIContacts.ts) |
| covered | GET | `api/deficits/materialonecshipments/:param` | `src/modules/deficits/deficits.controller.ts#getMaterialShipmentsAttations` | api/deficits/materialonecshipments/:param (pages/API/APIDeficits.ts) |
| covered | GET | `api/deficits/materialparents/:param` | `src/modules/deficits/deficits.controller.ts#getMaterialParents` | api/deficits/materialparents/:param (pages/API/APIDeficits.ts) |
| covered | GET | `api/deficits/materials/shipments/:param/:param` | `src/modules/deficits/deficits.controller.ts#materialForOneShipmentsType` | api/deficits/materials/shipments/:param/:param (pages/API/APIDeficits.ts) |
| covered | GET | `api/deficits/table_deficit` | `src/modules/deficits/deficits.controller.ts#getDeficit` | api/deficits/table_deficit (pages/API/APIDeficits.ts) |
| covered | GET | `api/deficits/update-all-deficit` | `src/modules/deficits/deficits.controller.ts#updateAllDeficits` | api/deficits/update-all-deficit (pages/API/APIDeficits.ts) |
| covered | GET | `api/deliveries` | `src/modules/deliveries/deliveries.controller.ts#getAllDeliveries` | api/deliveries (pages/API/APIDeliveries.ts) |
| covered | GET | `api/deliveries/:param` | `src/modules/deliveries/deliveries.controller.ts#getOneDelivery` | api/deliveries/:param (pages/API/APIDeliveries.ts) |
| covered | GET | `api/deliveries/:param/positions` | `src/modules/deliveries/deliveries.controller.ts#getDeliveryPositionsById` | api/deliveries/:param/positions (pages/API/APIDeliveries.ts) |
| covered | GET | `api/detal/all/:param/:param` | `src/modules/detal/detal.controller.ts#getAllDetals` | api/detal/all/:param/:param (pages/API/APIDetails.ts)<br>api/detal/all/:param/:param (pages/API/APIParts.ts) |
| covered | GET | `api/detal/one/spetification/:param/:param` | `src/modules/detal/detal.controller.ts#getOneDetalSpetification` | api/detal/one/spetification/:param/:param (pages/API/APIDetails.ts) |
| missing | GET | `api/detal/relatives/production/task/:param` | `src/modules/detal/detal.controller.ts#getRelativesProductionTask` | - |
| covered | GET | `api/detal/shipments/:param` | `src/modules/detal/detal.controller.ts#getShipmentsAndOrders` | api/detal/shipments/:param (pages/API/APIDetails.ts)<br>api/detal/shipments/:param (pages/API/APIParts.ts) |
| covered | GET | `api/detal/tech_by_id_detal/:param` | `src/modules/detal/detal.controller.ts#getTechByDetalId` | api/detal/tech_by_id_detal/:param (pages/API/APIDetails.ts) |
| covered | GET | `api/documents/:param/:param` | `src/modules/documents/documents.controller.ts#getFileById` | api/documents/:param/:param (pages/API/APIDocuments.ts)<br>api/documents/avachanges/:param (pages/API/APIDocuments.ts)<br>api/documents/avatar:param/:param (pages/API/APIDocuments.ts)<br>api/documents/cdn/:param (pages/API/APIDocuments.ts) |
| covered | GET | `api/documents/avachanges/:param` | `src/modules/documents/documents.controller.ts#avatarChangeBoolean` | api/documents/:param/:param (pages/API/APIDocuments.ts)<br>api/documents/avachanges/:param (pages/API/APIDocuments.ts) |
| covered | GET | `api/documents/avatar:typeEntity/:param` | `src/modules/documents/documents.controller.ts#ApiOperation` | api/documents/:param/:param (pages/API/APIDocuments.ts) |
| covered | GET | `api/documents/cdn/:param` | `src/modules/documents/documents.controller.ts#getFile` | api/documents/:param/:param (pages/API/APIDocuments.ts)<br>api/documents/cdn/:param (pages/API/APIDocuments.ts) |
| covered | GET | `api/documents/names` | `src/modules/documents/documents.controller.ts#getAllNamesDocuments` | api/documents/names (pages/API/APIDocuments.ts) |
| covered | GET | `api/equipment` | `src/modules/equipment/equipment.controller.ts#getEquipmentType` | api/equipment (pages/API/APIEquipment.ts) |
| covered | GET | `api/equipment/by-type-operation/:param` | `src/modules/equipment/equipment.controller.ts#getEquipmentsByTypeOperation` | api/equipment/by-type-operation/:param (pages/API/APIEquipment.ts) |
| covered | GET | `api/equipment/eq/:param` | `src/modules/equipment/equipment.controller.ts#getOneEquipment` | api/equipment/eq/:param (pages/API/APIEquipment.ts) |
| covered | GET | `api/equipment/eq/all/:param` | `src/modules/equipment/equipment.controller.ts#getAllEquipment` | api/equipment/eq/all/:param (pages/API/APIEquipment.ts) |
| covered | GET | `api/equipment/pt` | `src/modules/equipment/equipment.controller.ts#getAllEquipmentPType` | api/equipment/pt (pages/API/APIEquipment.ts) |
| covered | GET | `api/equipment/pt/:param` | `src/modules/equipment/equipment.controller.ts#getOneEquipmentPType` | api/equipment/pt/:param (pages/API/APIEquipment.ts) |
| covered | GET | `api/equipment/type/:param` | `src/modules/equipment/equipment.controller.ts#getTEquipmentById` | api/equipment/type/:param (pages/API/APIEquipment.ts) |
| missing | GET | `api/exclusion/:param` | `src/modules/exclusion/exclusion.controller.ts#getExclusionById` | - |
| covered | GET | `api/instrument` | `src/modules/instrument/instrument.controller.ts#getAllTInstrument` | api/instrument (pages/API/APITools.ts) |
| covered | GET | `api/instrument/instrumentdeficit` | `src/modules/instrument/instrument.controller.ts#getDeficitInstruments` | api/instrument/instrumentdeficit (pages/API/APITools.ts) |
| covered | GET | `api/instrument/name/:param` | `src/modules/instrument/instrument.controller.ts#getNameInstrument` | api/instrument/name/:param (pages/API/APITools.ts) |
| covered | GET | `api/instrument/nameinstrument` | `src/modules/instrument/instrument.controller.ts#getAllNameInstrument` | api/instrument/nameinstrument (pages/API/APITools.ts) |
| covered | GET | `api/instrument/pt` | `src/modules/instrument/instrument.controller.ts#getAllPInstrument` | api/instrument/pt (pages/API/APITools.ts) |
| covered | GET | `api/instrument/pt/:param` | `src/modules/instrument/instrument.controller.ts#getPTInstrumentById` | api/instrument/pt/:param (pages/API/APITools.ts) |
| covered | GET | `api/instrument/type/:param` | `src/modules/instrument/instrument.controller.ts#getOneTInstrument` | api/instrument/type/:param (pages/API/APITools.ts) |
| covered | GET | `api/inventary` | `src/modules/inventary/inventary.controller.ts#getAllPInventary` | api/inventary (pages/API/APIInventory.ts) |
| covered | GET | `api/inventary/name` | `src/modules/inventary/inventary.controller.ts#getAllInventary` | api/inventary/name (pages/API/APIInventory.ts) |
| covered | GET | `api/inventary/name/:param` | `src/modules/inventary/inventary.controller.ts#getInventaryById` | api/inventary/name/:param (pages/API/APIInventory.ts) |
| covered | GET | `api/inventary/pt` | `src/modules/inventary/inventary.controller.ts#getAllPTInventary` | api/inventary/pt (pages/API/APIInventory.ts) |
| covered | GET | `api/inventary/pt/:param` | `src/modules/inventary/inventary.controller.ts#getPTInventaryById` | api/inventary/pt/:param (pages/API/APIInventory.ts) |
| covered | GET | `api/inventary/type/:param` | `src/modules/inventary/inventary.controller.ts#getTInventaryById` | api/inventary/type/:param (pages/API/APIInventory.ts) |
| covered | GET | `api/marks/mark/:param/:param` | `src/modules/marks/marks.controller.ts#getOneMark` | api/marks/mark/:param/:param (pages/API/APIMarks.ts) |
| covered | GET | `api/marks/marks` | `src/modules/marks/marks.controller.ts#getMarks` | api/marks/marks (pages/API/APIMarks.ts) |
| covered | GET | `api/marks/marks/byoperation/:param` | `src/modules/marks/marks.controller.ts#getMarksByOperation` | api/marks/marks/byoperation/:param (pages/API/APIMarks.ts) |
| covered | GET | `api/material/aliases/:param` | `src/modules/material/material.controller.ts#getMaterialAliases` | api/material/aliases/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/files/:param/:param` | `src/modules/material/material.controller.ts#attachFileToMaterial` | api/material/files/:param/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/material` | `src/modules/material/material.controller.ts#getMaterial` | api/material/material (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/material/get/:param/:param` | `src/modules/material/material.controller.ts#getOneMaterial` | api/material/material/get/:param/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/materialdeficit` | `src/modules/material/material.controller.ts#getAllDeficit` | api/material/materialdeficit (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/materials/one/:param` | `src/modules/material/material.controller.ts#getOneTypeMaterial` | api/material/materials/one/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/relatives/production/task/:param` | `src/modules/material/material.controller.ts#getRelativesProductionTask` | api/material/relatives/production/task/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/restrictions/measurement-coefficient/:param` | `src/modules/material/material.controller.ts#getMeasurementCoefficientRestrictionsInfo` | api/material/restrictions/measurement-coefficient/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/restrictions/measurement-unit/:param` | `src/modules/material/material.controller.ts#getMeasurementUnitRestrictionsInfo` | api/material/restrictions/measurement-unit/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/shipments/:param` | `src/modules/material/material.controller.ts#getShipmentsAndOrders` | api/material/shipments/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/subtype-material/:param` | `src/modules/material/material.controller.ts#getAllSubtypeMaterial` | api/material/subtype-material/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/type-material` | `src/modules/material/material.controller.ts#getAllTypeMaterial` | api/material/type-material (pages/API/APIMaterials.ts) |
| covered | GET | `api/material/typematerialid/:param` | `src/modules/material/material.controller.ts#getSubtypeMaterialById` | api/material/typematerialid/:param (pages/API/APIMaterials.ts) |
| covered | GET | `api/metaloworking/:param` | `src/modules/metaloworking/metaloworking.controller.ts#getOneMetaloworkingById` | api/metaloworking/:param (pages/API/APIMetaloworking.ts) |
| covered | GET | `api/metaloworking/bydetal/light/:param` | `src/modules/metaloworking/metaloworking.controller.ts#getAssembleByIzdIdLight` | api/metaloworking/bydetal/light/:param (pages/API/APIMetaloworking.ts) |
| covered | GET | `api/metaloworking/light/:param` | `src/modules/metaloworking/metaloworking.controller.ts#getMetaloworkingByIdLight` | api/metaloworking/light/:param (pages/API/APIMetaloworking.ts) |
| covered | GET | `api/metaloworking/upload_to_excel` | `src/modules/metaloworking/metaloworking.controller.ts#uploadToExcel` | api/metaloworking/:param (pages/API/APIMetaloworking.ts) |
| covered | GET | `api/movement-object/one/:param` | `src/modules/movement-object/movement-object.controller.ts#getOneMovementObject` | api/movement-object/one/:param (pages/API/APIMovementObject.ts) |
| covered | GET | `api/moving` | `src/modules/moving/moving.controller.ts#getAllMoving` | api/moving (pages/API/APIMoving.ts) |
| missing | GET | `api/neo4j/stairs/:param/:param` | `src/modules/neo4j/neo4j.controller.ts#getRelativesStairs` | - |
| covered | GET | `api/operation/operation/get` | `src/modules/operation/operation.controller.ts#getAllOperation` | api/operation/operation/get (pages/API/APIOperation.ts) |
| covered | GET | `api/operation/operation/get/:param` | `src/modules/operation/operation.controller.ts#getOneOperationById` | api/operation/operation/get/:param (pages/API/APIOperation.ts) |
| covered | GET | `api/operation/typeoperation/:param` | `src/modules/operation/operation.controller.ts#getAllTypeOperation` | api/operation/typeoperation/:param (pages/API/APIOperation.ts) |
| covered | GET | `api/operation/typeoperation/static/:param` | `src/modules/operation/operation.controller.ts#getAllTypeOperationStatic` | api/operation/typeoperation/static/:param (pages/API/APIOperation.ts) |
| covered | GET | `api/product/all/:param/:param` | `src/modules/product/product.controller.ts#getAllProduct` | api/product/all/:param/:param (pages/API/APIProducts.ts) |
| covered | GET | `api/product/light/:param` | `src/modules/product/product.controller.ts#getProductByIdLight` | api/product/light/:param (pages/API/APIProducts.ts) |
| covered | GET | `api/product/shipments/:param` | `src/modules/product/product.controller.ts#getProductSchipmentsById` | api/product/shipments/:param (pages/API/APIProducts.ts) |
| missing | GET | `api/product/tech_by_id_product/:param` | `src/modules/product/product.controller.ts#getTechByProductId` | - |
| covered | GET | `api/production-task/by-entity` | `src/modules/production-tasks/production-tasks.controller.ts#productionTaskByEntity` | api/production-task/by-entity (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/by-id/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getProductionTaskById` | api/production-task/by-id/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/count` | `src/modules/production-tasks/production-tasks.controller.ts#getCount` | api/production-task/count (pages/API/APIProductionTasks.ts) |
| missing | GET | `api/production-task/for-all-equipments` | `src/modules/production-tasks/production-tasks.controller.ts#getProductionTaskByAllEquipments` | - |
| covered | GET | `api/production-task/for-all-users/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getProductionTaskByAllUsers` | api/production-task/for-all-users/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/get/relative/date/:param/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getRelativeDateForEntity` | api/production-task/get/relative/date/:param/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/get/start/time/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getStartTimeUser` | api/production-task/get/start/time/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/get/start/time/detal/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getStartTimeDetal` | api/production-task/get/start/time/detal/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/percent/:param/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getPercentCreatedByProductionTask` | api/production-task/percent/:param/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/shipment/:param/:param` | `src/modules/production-tasks/production-tasks.controller.ts#getShipmentByProductionTask` | api/production-task/shipment/:param/:param (pages/API/APIProductionTasks.ts) |
| covered | GET | `api/production-task/toperations-list` | `src/modules/production-tasks/production-tasks.controller.ts#getTOperarationList` | api/production-task/toperations-list (pages/API/APIProductionTasks.ts) |
| missing | GET | `api/production-task/update-all-task-relative` | `src/modules/production-tasks/production-tasks.controller.ts#updateAllTaskRelative` | - |
| missing | GET | `api/provider` | `src/modules/provider/provider.controller.ts#getProviders` | - |
| missing | GET | `api/provider/:param` | `src/modules/provider/provider.controller.ts#getOneProvider` | - |
| missing | GET | `api/provider/ban/:param` | `src/modules/provider/provider.controller.ts#banProviders` | - |
| missing | GET | `api/provider/files/:param/:param` | `src/modules/provider/provider.controller.ts#attachFileToProvider` | - |
| missing | GET | `api/rack/:param` | `src/modules/rack/rack.controller.ts#getOneRack` | - |
| covered | GET | `api/roles` | `src/modules/roles/roles.controller.ts#getAllUser` | api/roles (pages/API/APIRoles.ts) |
| covered | GET | `api/roles/:param` | `src/modules/roles/roles.controller.ts#getRole` | api/roles/:param (pages/API/APIRoles.ts) |
| covered | GET | `api/roles/one/:param` | `src/modules/roles/roles.controller.ts#getRoleByPk` | api/roles/one/:param (pages/API/APIRoles.ts) |
| covered | GET | `api/sclad/complitass/:param/:param` | `src/modules/sclad/sclad.controller.ts#complitAssembly` | api/sclad/complitass/:param/:param (pages/API/APIWarehouse.ts) |
| covered | GET | `api/sclad/flags` | `src/modules/sclad/sclad.controller.ts#getDeficitFlags` | api/sclad/flags (pages/API/APIWarehouse.ts) |
| covered | GET | `api/sclad/needs-by-parents/:param/:param` | `src/modules/sclad/sclad.controller.ts#getNeedsByParents` | api/sclad/needs-by-parents/:param/:param (pages/API/APIWarehouse.ts) |
| covered | GET | `api/sclad/remains/:param` | `src/modules/sclad/sclad.controller.ts#getRemains` | api/sclad/remains/:param (pages/API/APIWarehouse.ts) |
| covered | GET | `api/sclad/reset_in_sets` | `src/modules/sclad/sclad.controller.ts#resetInSets` | api/sclad/reset_in_sets (pages/API/APIWarehouse.ts) |
| missing | GET | `api/settings/db` | `src/modules/settings/settings.controller.ts#getAllDB` | - |
| missing | GET | `api/settings/db/download/:param` | `src/modules/settings/settings.controller.ts#downloadDb` | - |
| missing | GET | `api/settings/db/new` | `src/modules/settings/settings.controller.ts#newDB` | - |
| missing | GET | `api/settings/edizm` | `src/modules/settings/settings.controller.ts#getAllEdizm` | - |
| missing | GET | `api/settings/inaction` | `src/modules/settings/settings.controller.ts#inactionGet` | - |
| missing | GET | `api/settings/norm-hours` | `src/modules/settings/settings.controller.ts#getNormHours` | - |
| missing | GET | `api/settings/typeedizm` | `src/modules/settings/settings.controller.ts#getAllTypeEdizm` | - |
| covered | GET | `api/shipments/by-product/:param` | `src/modules/shipments/shipments.controller.ts#getShipmentsByProduct` | api/shipments/by-product/:param (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/documents/:param` | `src/modules/shipments/shipments.controller.ts#returnDoucments` | api/shipments/documents/:param (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/light/:param` | `src/modules/shipments/shipments.controller.ts#getAllShipmentsById` | api/shipments/light/:param (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/one/izd/:param` | `src/modules/shipments/shipments.controller.ts#getShipmentsIzd` | api/shipments/one/izd/:param (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/oneships/:param` | `src/modules/shipments/shipments.controller.ts#getOneShipments` | api/shipments/oneships/:param (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/shcheck` | `src/modules/shipments/shipments.controller.ts#getAllShComplit` | api/shipments/shcheck (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/shcomplite/:param` | `src/modules/shipments/shipments.controller.ts#getById` | api/shipments/shcomplite/:param (pages/API/APIShipments.ts) |
| covered | GET | `api/shipments/shipments/k6` | `src/modules/shipments/shipments.controller.ts#getIdsWithShipments` | api/shipments/shipments/k6 (pages/API/APIShipments.ts) |
| missing | GET | `api/solidworks/get-entity/:param/:param` | `src/modules/solidworks/solidworks.controller.ts#findEntityBySolidworkType` | - |
| covered | GET | `api/stock-order/all/:param` | `src/modules/stock-order/stock-order.controller.ts#getAllStockOrder` | api/stock-order/all/:param (pages/API/APIStockOrder.ts) |
| covered | GET | `api/stock-order/by-obj-id/:param/:param` | `src/modules/stock-order/stock-order.controller.ts#getStockOrderByObject` | api/stock-order/by-obj-id/:param/:param (pages/API/APIStockOrder.ts) |
| covered | GET | `api/stock-order/by-stock-order/:param` | `src/modules/stock-order/stock-order.controller.ts#getStockOrderItems` | api/stock-order/by-stock-order/:param (pages/API/APIStockOrder.ts) |
| covered | GET | `api/stock-order/count` | `src/modules/stock-order/stock-order.controller.ts#getCountStockOrder` | api/stock-order/count (pages/API/APIStockOrder.ts) |
| covered | GET | `api/stock-order/item/:param` | `src/modules/stock-order/stock-order.controller.ts#getOneStockOrderItem` | api/stock-order/item/:param (pages/API/APIStockOrder.ts) |
| covered | GET | `api/stock-order/items/by-entity/:param/:param` | `src/modules/stock-order/stock-order.controller.ts#getStockOrderItemsByEntity` | api/stock-order/items/by-entity/:param/:param (pages/API/APIStockOrder.ts) |
| missing | GET | `api/supply/new-number-order` | `src/modules/supply/supply.controller.ts#getNewNumberOrder` | - |
| covered | GET | `api/tech-process/:param` | `src/modules/tech-process/tech-process.controller.ts#getTechProcessById` | api/tech-process/:param (pages/API/APITechProcess.ts) |
| covered | GET | `api/users/by-type-operation/:param` | `src/modules/users/users.controller.ts#getUsersByTypeOperation` | api/users/by-type-operation/:param (pages/API/APIUsers.ts) |
| missing | GET | `api/users/get/table/config/:param` | `src/modules/users/users.controller.ts#getTableConfigByUserId` | - |
| covered | GET | `api/users/list` | `src/modules/users/users.controller.ts#getAllList` | api/users/list (pages/API/APIUsers.ts) |
| covered | GET | `api/users/list/:param/:param` | `src/modules/users/users.controller.ts#getAllUsers` | api/users/list/:param/:param (pages/API/APIUsers.ts) |
| covered | GET | `api/users/role/:param` | `src/modules/users/users.controller.ts#getUserWithRole` | api/users/role/:param (pages/API/APIUsers.ts) |
| covered | GET | `api/waybill/:param` | `src/modules/waybill/waybill.controller.ts#ApiOperation` | api/waybill/:param (pages/API/APIWaybill.ts)<br>api/waybill/deliveriedcoming (pages/API/APIWaybill.ts)<br>api/waybill/last (pages/API/APIWaybill.ts) |
| covered | GET | `api/waybill/deliveriedcoming` | `src/modules/waybill/waybill.controller.ts#ApiOperation` | api/waybill/:param (pages/API/APIWaybill.ts)<br>api/waybill/deliveriedcoming (pages/API/APIWaybill.ts) |
| covered | GET | `api/waybill/getByStockOrder/:param/:param` | `src/modules/waybill/waybill.controller.ts#getByStockOrder` | api/waybill/getByStockOrder/:param/:param (pages/API/APIWaybill.ts) |
| covered | GET | `api/waybill/last` | `src/modules/waybill/waybill.controller.ts#ApiOperation` | api/waybill/:param (pages/API/APIWaybill.ts)<br>api/waybill/last (pages/API/APIWaybill.ts) |
| covered | POST | `api/actions/get-by-params` | `src/modules/actions/actions.controller.ts#getActionByParams` | api/actions/get-by-params (pages/API/APIActions.ts)<br>api/actions/get-by-params (lib/APIPage.ts) |
| covered | POST | `api/assemble` | `src/modules/assemble/assemble.controller.ts#createAssemble` | api/assemble (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/asstoplan` | `src/modules/assemble/assemble.controller.ts#getAllAssemblePlan` | api/assemble/asstoplan (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/coming/pagination` | `src/modules/assemble/assemble.controller.ts#getMetalloworkingComing` | api/assemble/coming/pagination (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/complectkit/create` | `src/modules/assemble/assemble.controller.ts#createAssembleKit` | api/assemble/complectkit/create (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/complectkit/getall` | `src/modules/assemble/assemble.controller.ts#getAllAssembleKit` | api/assemble/complectkit/getall (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/deficit/deep` | `src/modules/assemble/assemble.controller.ts#getDeepDeficitObject` | api/assemble/deficit/deep (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/pagination` | `src/modules/assemble/assemble.controller.ts#getAllAssemblePagination` | api/assemble/pagination (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/pagination/operation` | `src/modules/assemble/assemble.controller.ts#getAllAssembleOperationPagination` | api/assemble/pagination/operation (pages/API/APIAssemble.ts) |
| covered | POST | `api/assemble/sclad/pagination` | `src/modules/assemble/assemble.controller.ts#getAllAssemblePaginationSclad` | api/assemble/sclad/pagination (pages/API/APIAssemble.ts) |
| covered | POST | `api/auth/check` | `src/modules/auth/auth.controller.ts#check` | api/auth/check (pages/API/APIAuth.ts) |
| covered | POST | `api/auth/login` | `src/modules/auth/auth.controller.ts#login` | api/auth/login (lib/APIPage.ts) |
| covered | POST | `api/auth/logout` | `src/modules/auth/auth.controller.ts#logout` | api/auth/logout (pages/API/APIAuth.ts) |
| covered | POST | `api/auth/refresh` | `src/modules/auth/auth.controller.ts#refresh` | api/auth/refresh (pages/API/APIAuth.ts) |
| missing | POST | `api/buyer` | `src/modules/buyer/buyer.controller.ts#createBuyer` | - |
| missing | POST | `api/buyer/archive` | `src/modules/buyer/buyer.controller.ts#getBuyersArchive` | - |
| missing | POST | `api/buyer/getinclude/:param` | `src/modules/buyer/buyer.controller.ts#getInclude` | - |
| missing | POST | `api/buyer/name/check` | `src/modules/buyer/buyer.controller.ts#checkNameExisting` | - |
| missing | POST | `api/buyer/pagination` | `src/modules/buyer/buyer.controller.ts#getBuyersPagination` | - |
| missing | POST | `api/buyer/update` | `src/modules/buyer/buyer.controller.ts#updateBuyer` | - |
| covered | POST | `api/cbed` | `src/modules/cbed/cbed.controller.ts#createNewCbed` | api/cbed (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/archive` | `src/modules/cbed/cbed.controller.ts#archive` | api/cbed/archive (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/deficits` | `src/modules/cbed/cbed.controller.ts#getDeficitPaginationCbed` | api/cbed/deficits (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/designation/check` | `src/modules/cbed/cbed.controller.ts#checkDesignationExisting` | api/cbed/designation/check (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/getinclude/:param` | `src/modules/cbed/cbed.controller.ts#getInclude` | api/cbed/getinclude/:param (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/graph-childrens` | `src/modules/cbed/cbed.controller.ts#getGraphChilds` | api/cbed/graph-childrens (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/one` | `src/modules/cbed/cbed.controller.ts#getOneCbedById` | api/cbed/one (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/operation/include` | `src/modules/cbed/cbed.controller.ts#ApiBody` | api/cbed/operation/include (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/pagination` | `src/modules/cbed/cbed.controller.ts#getCbedPagination` | api/cbed/pagination (pages/API/APICBED.ts) |
| covered | POST | `api/cbed/sclad/remains` | `src/modules/cbed/cbed.controller.ts#getScladRemains` | api/cbed/sclad/remains (pages/API/APICBED.ts)<br>api/cbed/sclad/remains (testcases/API/APIProductionShipmentFlow.spec.ts) |
| covered | POST | `api/cbed/update` | `src/modules/cbed/cbed.controller.ts#updateCbed` | api/cbed/update (pages/API/APICBED.ts) |
| missing | POST | `api/comments/create` | `src/modules/thread/thread.controller.ts#addCommentEntity` | - |
| covered | POST | `api/companies` | `src/modules/company/companies.controller.ts#createCompany` | api/companies (pages/API/APICompanies.ts) |
| covered | POST | `api/companies/include` | `src/modules/company/companies.controller.ts#getInclude` | api/companies/include (pages/API/APICompanies.ts) |
| covered | POST | `api/companies/pagination` | `src/modules/company/companies.controller.ts#getCompanies` | api/companies/pagination (pages/API/APICompanies.ts) |
| covered | POST | `api/contacts` | `src/modules/contact/contacts.controller.ts#createContact` | api/contacts (pages/API/APIContacts.ts) |
| covered | POST | `api/contacts/include` | `src/modules/contact/contacts.controller.ts#getInclude` | api/contacts/include (pages/API/APIContacts.ts) |
| covered | POST | `api/contacts/pagination` | `src/modules/contact/contacts.controller.ts#getContacts` | api/contacts/pagination (pages/API/APIContacts.ts) |
| covered | POST | `api/deficits/materials` | `src/modules/deficits/deficits.controller.ts#getAllMaterialDeficit` | api/deficits/materials (pages/API/APIDeficits.ts) |
| covered | POST | `api/deficits/table_deficit` | `src/modules/deficits/deficits.controller.ts#updateDeficit` | api/deficits/table_deficit (pages/API/APIDeficits.ts) |
| covered | POST | `api/deliveries` | `src/modules/deliveries/deliveries.controller.ts#createDelivery` | api/deliveries (pages/API/APIDeliveries.ts) |
| covered | POST | `api/deliveries/by-company/:param` | `src/modules/deliveries/deliveries.controller.ts#getDeliveryListByCompany` | api/deliveries/by-company/:param (pages/API/APIDeliveries.ts) |
| covered | POST | `api/deliveries/pagination` | `src/modules/deliveries/deliveries.controller.ts#getAllDeliveriedPagination` | api/deliveries/pagination (pages/API/APIDeliveries.ts) |
| covered | POST | `api/detal` | `src/modules/detal/detal.controller.ts#createNewDetal` | api/detal (pages/API/APIDetails.ts)<br>api/detal (pages/API/APIParts.ts) |
| covered | POST | `api/detal/archive` | `src/modules/detal/detal.controller.ts#archive` | api/detal/archive (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/deficits` | `src/modules/detal/detal.controller.ts#getDeficit` | api/detal/deficits (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/designation/check` | `src/modules/detal/detal.controller.ts#checkDesignationExisting` | api/detal/designation/check (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/file` | `src/modules/detal/detal.controller.ts#addFileToDetal` | api/detal/file (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/getattribute/:param` | `src/modules/detal/detal.controller.ts#getAtribute` | api/detal/getattribute/:param (pages/API/APIParts.ts) |
| covered | POST | `api/detal/getinclude/:param` | `src/modules/detal/detal.controller.ts#getInclude` | api/detal/getinclude/:param (pages/API/APIDetails.ts)<br>api/detal/getinclude/:param (pages/API/APIParts.ts) |
| covered | POST | `api/detal/one` | `src/modules/detal/detal.controller.ts#getDeleteById` | api/detal/one (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/operation/include` | `src/modules/detal/detal.controller.ts#ApiBody` | api/detal/operation/include (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/pagination` | `src/modules/detal/detal.controller.ts#getAllDetalsPagination` | api/detal/pagination (pages/API/APIDetails.ts) |
| covered | POST | `api/detal/sclad/remains` | `src/modules/detal/detal.controller.ts#getScladRemains` | api/detal/sclad/remains (pages/API/APIDetails.ts)<br>api/detal/sclad/remains (testcases/API/APIProductionShipmentFlow.spec.ts) |
| covered | POST | `api/detal/update` | `src/modules/detal/detal.controller.ts#updateDetal` | api/detal/update (pages/API/APIDetails.ts)<br>api/detal/update (pages/API/APIParts.ts) |
| covered | POST | `api/documents/add` | `src/modules/documents/documents.controller.ts#UseInterceptors` | api/documents/add (pages/API/APIDocuments.ts) |
| covered | POST | `api/documents/editype` | `src/modules/documents/documents.controller.ts#changeType` | api/documents/editype (pages/API/APIDocuments.ts) |
| covered | POST | `api/documents/name/check` | `src/modules/documents/documents.controller.ts#checkNameExisting` | api/documents/name/check (pages/API/APIDocuments.ts) |
| covered | POST | `api/documents/param` | `src/modules/documents/documents.controller.ts#getAllDocumentsByParams` | api/documents/param (pages/API/APIDocuments.ts) |
| covered | POST | `api/documents/presign` | `src/modules/documents/documents.controller.ts#presignPut` | api/documents/presign (pages/API/APIDocuments.ts) |
| covered | POST | `api/documents/update` | `src/modules/documents/documents.controller.ts#updateDocuments` | api/documents/update (pages/API/APIDocuments.ts) |
| covered | POST | `api/equipment` | `src/modules/equipment/equipment.controller.ts#createEquipmentType` | api/equipment (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/eq` | `src/modules/equipment/equipment.controller.ts#createEquipment` | api/equipment/eq (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/eq/archive` | `src/modules/equipment/equipment.controller.ts#getAllArchive` | api/equipment/eq/archive (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/eq/update` | `src/modules/equipment/equipment.controller.ts#updateEquipment` | api/equipment/eq/update (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/name/check` | `src/modules/equipment/equipment.controller.ts#checkNameExisting` | api/equipment/name/check (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/name/unique` | `src/modules/equipment/equipment.controller.ts#checkNameUnique` | api/equipment/name/unique (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/pagination/equipment` | `src/modules/equipment/equipment.controller.ts#getAllEquipmentPagination` | api/equipment/pagination/equipment (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/pagination/subtype` | `src/modules/equipment/equipment.controller.ts#getAllSubtypeEquipmentPagination` | api/equipment/pagination/subtype (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/pagination/type` | `src/modules/equipment/equipment.controller.ts#getAllTypeEquipmentPagination` | api/equipment/pagination/type (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/pt` | `src/modules/equipment/equipment.controller.ts#createEquipmentPType` | api/equipment/pt (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/pt/update` | `src/modules/equipment/equipment.controller.ts#updateEquipmentPType` | api/equipment/pt/update (pages/API/APIEquipment.ts) |
| covered | POST | `api/equipment/update` | `src/modules/equipment/equipment.controller.ts#updateEquipmentType` | api/equipment/update (pages/API/APIEquipment.ts) |
| missing | POST | `api/exclusion` | `src/modules/exclusion/exclusion.controller.ts#createExclusion` | - |
| missing | POST | `api/exclusion/pagination` | `src/modules/exclusion/exclusion.controller.ts#getExclusionPagination` | - |
| missing | POST | `api/expenditure` | `src/modules/expenditure/expenditure.controller.ts#getExpenditure` | - |
| covered | POST | `api/external/notifications/enrich/batch` | `src/modules/notification/notification.controller.ts#enrichNotificationsBatch` | api/external/notifications/enrich/batch (pages/API/APINotifications.ts) |
| covered | POST | `api/instrument` | `src/modules/instrument/instrument.controller.ts#createInstrument` | api/instrument (pages/API/APITools.ts) |
| covered | POST | `api/instrument/instrument/pagination` | `src/modules/instrument/instrument.controller.ts#getAllInstrumentsPagination` | api/instrument/instrument/pagination (pages/API/APITools.ts) |
| covered | POST | `api/instrument/name/check` | `src/modules/instrument/instrument.controller.ts#checkNameExisting` | api/instrument/name/check (pages/API/APITools.ts) |
| covered | POST | `api/instrument/name/unique` | `src/modules/instrument/instrument.controller.ts#checkNameUnique` | api/instrument/name/unique (pages/API/APITools.ts) |
| covered | POST | `api/instrument/nameinstrument` | `src/modules/instrument/instrument.controller.ts#crteateNameInstrument` | api/instrument/nameinstrument (pages/API/APITools.ts) |
| covered | POST | `api/instrument/nameinstrument/archive` | `src/modules/instrument/instrument.controller.ts#getArchive` | api/instrument/nameinstrument/archive (pages/API/APITools.ts) |
| covered | POST | `api/instrument/nameinstrument/update` | `src/modules/instrument/instrument.controller.ts#updateNameInstrument` | api/instrument/nameinstrument/update (pages/API/APITools.ts) |
| covered | POST | `api/instrument/pt` | `src/modules/instrument/instrument.controller.ts#createPTInstrument` | api/instrument/pt (pages/API/APITools.ts) |
| covered | POST | `api/instrument/pt/update` | `src/modules/instrument/instrument.controller.ts#updatePTInstrument` | api/instrument/pt/update (pages/API/APITools.ts) |
| covered | POST | `api/instrument/subtype/pagination` | `src/modules/instrument/instrument.controller.ts#getAllSubtypeInstrumentsPagination` | api/instrument/subtype/pagination (pages/API/APITools.ts) |
| covered | POST | `api/instrument/type/pagination` | `src/modules/instrument/instrument.controller.ts#getAllTypeInstrumentsPagination` | api/instrument/type/pagination (pages/API/APITools.ts) |
| covered | POST | `api/instrument/update` | `src/modules/instrument/instrument.controller.ts#updateTInstrument` | api/instrument/update (pages/API/APITools.ts) |
| covered | POST | `api/inventary` | `src/modules/inventary/inventary.controller.ts#createPInventary` | api/inventary (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/name` | `src/modules/inventary/inventary.controller.ts#createNewInventary` | api/inventary/name (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/name/archive` | `src/modules/inventary/inventary.controller.ts#getArchive` | api/inventary/name/archive (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/name/check` | `src/modules/inventary/inventary.controller.ts#checkNameExisting` | api/inventary/name/check (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/name/unique` | `src/modules/inventary/inventary.controller.ts#checkNameUnique` | api/inventary/name/unique (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/pagination/inventary` | `src/modules/inventary/inventary.controller.ts#getAllInventaryPagination` | api/inventary/pagination/inventary (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/pagination/subtype` | `src/modules/inventary/inventary.controller.ts#getAllSubtypeInventaryPagination` | api/inventary/pagination/subtype (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/pagination/type` | `src/modules/inventary/inventary.controller.ts#getAllTypeInventaryPagination` | api/inventary/pagination/type (pages/API/APIInventory.ts) |
| covered | POST | `api/inventary/pt` | `src/modules/inventary/inventary.controller.ts#createPTInventary` | api/inventary/pt (pages/API/APIInventory.ts) |
| covered | POST | `api/marks/mark` | `src/modules/marks/marks.controller.ts#createMark` | api/marks/mark (pages/API/APIMarks.ts) |
| covered | POST | `api/marks/marks/operations` | `src/modules/marks/marks.controller.ts#getMarkForOperation` | api/marks/marks/operations (pages/API/APIMarks.ts) |
| covered | POST | `api/marks/resultworks` | `src/modules/marks/marks.controller.ts#getResultWorking` | api/marks/resultworks (pages/API/APIMarks.ts) |
| covered | POST | `api/material/aliases` | `src/modules/material/material.controller.ts#createMaterialAlias` | api/material/aliases (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/deficits` | `src/modules/material/material.controller.ts#getDeficit` | api/material/deficits (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/material` | `src/modules/material/material.controller.ts#createAndUpdateMaterial` | api/material/material (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/material/archive` | `src/modules/material/material.controller.ts#getAllMaterialArchive` | api/material/material/archive (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/material/include` | `src/modules/material/material.controller.ts#getIncludeForMaterial` | api/material/material/include (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/material/pagination` | `src/modules/material/material.controller.ts#getAllMaterialsPagination` | api/material/material/pagination (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/name/check` | `src/modules/material/material.controller.ts#checkNameExisting` | api/material/name/check (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/name/unique` | `src/modules/material/material.controller.ts#checkNameUnique` | api/material/name/unique (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/pagination/materials-provider` | `src/modules/material/material.controller.ts#getAllMaterialsProviderPagination` | api/material/pagination/materials-provider (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/pagination/subtype-materials` | `src/modules/material/material.controller.ts#getAllSubtypeMaterialPagination` | api/material/pagination/subtype-materials (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/pagination/subtypematerials-provider` | `src/modules/material/material.controller.ts#getAllSubtypeMaterialProviderPagination` | api/material/pagination/subtypematerials-provider (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/pagination/type-material` | `src/modules/material/material.controller.ts#getAllTypeMaterialPagination` | api/material/pagination/type-material (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/pagination/typematerials-provider` | `src/modules/material/material.controller.ts#getAllTypeMaterialProviderPagination` | api/material/pagination/typematerials-provider (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/subtype` | `src/modules/material/material.controller.ts#createSubtypeMaterial` | api/material/subtype (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/subtype/update` | `src/modules/material/material.controller.ts#updateSubtypeMaterial` | api/material/subtype/update (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/type-material` | `src/modules/material/material.controller.ts#createTypeMaterial` | api/material/type-material (pages/API/APIMaterials.ts) |
| covered | POST | `api/material/type-material/update` | `src/modules/material/material.controller.ts#updateTypeMaterial` | api/material/type-material/update (pages/API/APIMaterials.ts) |
| covered | POST | `api/metaloworking` | `src/modules/metaloworking/metaloworking.controller.ts#createMetaloworking` | api/metaloworking (pages/API/APIMetaloworking.ts) |
| covered | POST | `api/metaloworking/coming/pagination` | `src/modules/metaloworking/metaloworking.controller.ts#getMetalloworkingComing` | api/metaloworking/coming/pagination (pages/API/APIMetaloworking.ts) |
| covered | POST | `api/metaloworking/pagination` | `src/modules/metaloworking/metaloworking.controller.ts#getMetolloworkingPagination` | api/metaloworking/pagination (pages/API/APIMetaloworking.ts) |
| covered | POST | `api/metaloworking/pagination/operations` | `src/modules/metaloworking/metaloworking.controller.ts#getMetalloworkingByOperationPagination` | api/metaloworking/pagination/operations (pages/API/APIMetaloworking.ts) |
| covered | POST | `api/metaloworking/pagination/operations/complectation` | `src/modules/metaloworking/metaloworking.controller.ts#getMetalloworkingComplectationByOperationPagination` | api/metaloworking/pagination/operations/complectation (pages/API/APIMetaloworking.ts) |
| covered | POST | `api/metaloworking/shapebid` | `src/modules/metaloworking/metaloworking.controller.ts#createShapeBid` | api/metaloworking/shapebid (pages/API/APIMetaloworking.ts) |
| covered | POST | `api/movement-object` | `src/modules/movement-object/movement-object.controller.ts#ApiResponse` | api/movement-object (pages/API/APIMovementObject.ts) |
| covered | POST | `api/moving` | `src/modules/moving/moving.controller.ts#createNewMoving` | api/moving (pages/API/APIMoving.ts) |
| covered | POST | `api/online-board/list` | `src/modules/production-tasks/online-board/online-board.controller.ts#getListWorking` | api/online-board/list (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/online-board/production/list` | `src/modules/production-tasks/online-board/online-board.controller.ts#getListWorkingByProductionTask` | api/online-board/production/list (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/operation/name/unique` | `src/modules/operation/operation.controller.ts#checkNameUnique` | api/operation/name/unique (pages/API/APIOperation.ts) |
| covered | POST | `api/operation/operation` | `src/modules/operation/operation.controller.ts#createNewOperation` | api/operation/operation (pages/API/APIOperation.ts) |
| covered | POST | `api/operation/operation/up/tech` | `src/modules/operation/operation.controller.ts#updateOperationTech` | api/operation/operation/up/tech (pages/API/APIOperation.ts) |
| covered | POST | `api/operation/operation/update` | `src/modules/operation/operation.controller.ts#updateOperation` | api/operation/operation/update (pages/API/APIOperation.ts) |
| covered | POST | `api/operation/typeoperation` | `src/modules/operation/operation.controller.ts#createNewTypeOperation` | api/operation/typeoperation (pages/API/APIOperation.ts) |
| covered | POST | `api/operation/typeoperation/get` | `src/modules/operation/operation.controller.ts#getTypeOperationById` | api/operation/typeoperation/get (pages/API/APIOperation.ts) |
| covered | POST | `api/operation/typeoperation/update` | `src/modules/operation/operation.controller.ts#updateTypeOperation` | api/operation/typeoperation/update (pages/API/APIOperation.ts) |
| covered | POST | `api/product` | `src/modules/product/product.controller.ts#createNewProduct` | api/product (pages/API/APIProducts.ts) |
| covered | POST | `api/product/archive` | `src/modules/product/product.controller.ts#getAllProductArchive` | api/product/archive (pages/API/APIProducts.ts) |
| missing | POST | `api/product/deficits` | `src/modules/product/product.controller.ts#getAllDeficitProduct` | - |
| covered | POST | `api/product/designation/check` | `src/modules/product/product.controller.ts#checkDesignationExisting` | api/product/designation/check (pages/API/APIProducts.ts) |
| covered | POST | `api/product/getinclude/:param` | `src/modules/product/product.controller.ts#getInclude` | api/product/getinclude/:param (pages/API/APIProducts.ts) |
| covered | POST | `api/product/graph-childrens` | `src/modules/product/product.controller.ts#getGraphChilds` | api/product/graph-childrens (pages/API/APIProducts.ts) |
| covered | POST | `api/product/one` | `src/modules/product/product.controller.ts#getProductById` | api/product/one (pages/API/APIProducts.ts) |
| covered | POST | `api/product/operation/include` | `src/modules/product/product.controller.ts#ApiBody` | api/product/operation/include (pages/API/APIProducts.ts) |
| covered | POST | `api/product/pagination` | `src/modules/product/product.controller.ts#getAllProductPagination` | api/product/pagination (pages/API/APIProducts.ts) |
| covered | POST | `api/product/sclad/remains` | `src/modules/product/product.controller.ts#getScladRemains` | api/product/sclad/remains (testcases/API/APIProductionShipmentFlow.spec.ts) |
| covered | POST | `api/product/update` | `src/modules/product/product.controller.ts#updateProduct` | api/product/update (pages/API/APIProducts.ts) |
| covered | POST | `api/production-task` | `src/modules/production-tasks/production-tasks.controller.ts#createProductionTask` | api/production-task (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/by-equipment` | `src/modules/production-tasks/production-tasks.controller.ts#UsePipes` | api/production-task/by-equipment (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/by-operation` | `src/modules/production-tasks/production-tasks.controller.ts#UsePipes` | api/production-task/by-operation (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/by-plan` | `src/modules/production-tasks/production-tasks.controller.ts#getListWorking` | api/production-task/by-plan (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/by-user` | `src/modules/production-tasks/production-tasks.controller.ts#UsePipes` | api/production-task/by-user (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/create/operation/pos` | `src/modules/production-tasks/production-tasks.controller.ts#createProductionOperationPos` | api/production-task/create/operation/pos (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/detal/deficit` | `src/modules/production-tasks/production-tasks.controller.ts#getDeficitsDetalByProductionTask` | api/production-task/detal/deficit (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/list` | `src/modules/production-tasks/production-tasks.controller.ts#getProductionTaskPaginate` | api/production-task/list (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/list-with-operations` | `src/modules/production-tasks/production-tasks.controller.ts#getProductionTaskWithOperationsPaginate` | api/production-task/list-with-operations (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/result-works` | `src/modules/production-tasks/production-tasks.controller.ts#getResultWorks` | api/production-task/result-works (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/set/start/time` | `src/modules/production-tasks/production-tasks.controller.ts#setStartTimeUser` | api/production-task/set/start/time (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/set/start/time/detal` | `src/modules/production-tasks/production-tasks.controller.ts#setStartTimeDetal` | api/production-task/set/start/time/detal (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/tasks/operations` | `src/modules/production-tasks/production-tasks.controller.ts#getTaskByOperations` | api/production-task/tasks/operations (pages/API/APIProductionTasks.ts) |
| covered | POST | `api/production-task/workload-by-entity` | `src/modules/production-tasks/production-tasks.controller.ts#workloadByEntity` | api/production-task/workload-by-entity (pages/API/APIProductionTasks.ts) |
| missing | POST | `api/provider` | `src/modules/provider/provider.controller.ts#createProvider` | - |
| missing | POST | `api/provider/archive` | `src/modules/provider/provider.controller.ts#getAllArchive` | - |
| missing | POST | `api/provider/name/check` | `src/modules/provider/provider.controller.ts#checkNameExisting` | - |
| missing | POST | `api/provider/pagination` | `src/modules/provider/provider.controller.ts#getBuyersPagination` | - |
| missing | POST | `api/rack` | `src/modules/rack/rack.controller.ts#createRack` | - |
| missing | POST | `api/rack/pagination` | `src/modules/rack/rack.controller.ts#getAllRacks` | - |
| covered | POST | `api/roles` | `src/modules/roles/roles.controller.ts#create` | api/roles (pages/API/APIRoles.ts) |
| covered | POST | `api/roles/accesses` | `src/modules/roles/roles.controller.ts#updateAssetsRole` | api/roles/accesses (pages/API/APIRoles.ts) |
| covered | POST | `api/roles/name/unique` | `src/modules/roles/roles.controller.ts#checkNameUnique` | api/roles/name/unique (pages/API/APIRoles.ts) |
| covered | POST | `api/roles/update` | `src/modules/roles/roles.controller.ts#updateRoleByPk` | api/roles/update (pages/API/APIRoles.ts) |
| covered | POST | `api/sclad/needs_by_parent` | `src/modules/sclad/sclad.controller.ts#getNeedsByParent` | api/sclad/needs_by_parent (pages/API/APIWarehouse.ts) |
| covered | POST | `api/sclad/remains` | `src/modules/sclad/sclad.controller.ts#ApiResponse` | api/sclad/remains (pages/API/APIWarehouse.ts) |
| covered | POST | `api/sclad/revision` | `src/modules/sclad/sclad.controller.ts#ApiResponse` | api/sclad/revision (pages/API/APIWarehouse.ts) |
| missing | POST | `api/settings/edizm` | `src/modules/settings/settings.controller.ts#crateEdizm` | - |
| missing | POST | `api/settings/edizm/update` | `src/modules/settings/settings.controller.ts#updateEdizm` | - |
| missing | POST | `api/settings/norm-hours` | `src/modules/settings/settings.controller.ts#updateNormHours` | - |
| missing | POST | `api/settings/typeedizm` | `src/modules/settings/settings.controller.ts#createTypeEdizm` | - |
| covered | POST | `api/shipments` | `src/modules/shipments/shipments.controller.ts#createShipments` | api/shipments (pages/API/APIShipments.ts) |
| covered | POST | `api/shipments/attributes` | `src/modules/shipments/shipments.controller.ts#getAttribyteByShipments` | api/shipments/attributes (pages/API/APIShipments.ts) |
| covered | POST | `api/shipments/getinclude/:param` | `src/modules/shipments/shipments.controller.ts#getIncludeModelSh` | api/shipments/getinclude/:param (pages/API/APIShipments.ts) |
| covered | POST | `api/shipments/items/by-entity` | `src/modules/shipments/shipments.controller.ts#getShipmentItemsByEntity` | api/shipments/items/by-entity (pages/API/APIShipments.ts) |
| covered | POST | `api/shipments/pagination` | `src/modules/shipments/shipments.controller.ts#getShipmentsPagination` | api/shipments/pagination (pages/API/APIShipments.ts) |
| covered | POST | `api/shipments/shcheck` | `src/modules/shipments/shipments.controller.ts#shComplitCreate` | api/shipments/shcheck (pages/API/APIShipments.ts)<br>api/shipments/shcheck (testcases/API/APIProductionShipmentFlow.spec.ts) |
| covered | POST | `api/shipments/shcheck/pagination` | `src/modules/shipments/shipments.controller.ts#getAllShComplitPagination` | api/shipments/shcheck/pagination (pages/API/APIShipments.ts) |
| missing | POST | `api/shipments/shcheckupdate` | `src/modules/shipments/shipments.controller.ts#shComplitUpdate` | - |
| covered | POST | `api/shipments/shipments-list/pagination/:param` | `src/modules/shipments/shipments.controller.ts#getAllShipmentsAssemblePagination` | api/shipments/shipments-list/pagination/:param (pages/API/APIShipments.ts) |
| missing | POST | `api/solidworks/create-entity` | `src/modules/solidworks/solidworks.controller.ts#UseInterceptors` | - |
| covered | POST | `api/specification/attributes` | `src/modules/specification/specification.controller.ts#getAttributesFromIds` | api/specification/attributes (pages/API/APISpecifications.ts) |
| covered | POST | `api/specification/first-level-children` | `src/modules/specification/specification.controller.ts#getFirstLevelChildren` | api/specification/first-level-children (pages/API/APISpecifications.ts) |
| covered | POST | `api/stock-order` | `src/modules/stock-order/stock-order.controller.ts#createStockOrder` | api/stock-order (pages/API/APIStockOrder.ts) |
| covered | POST | `api/stock-order/one` | `src/modules/stock-order/stock-order.controller.ts#HttpCode` | api/stock-order/one (pages/API/APIStockOrder.ts) |
| covered | POST | `api/stock-order/order/pagination` | `src/modules/stock-order/stock-order.controller.ts#getStockOrderToWayPagination` | api/stock-order/order/pagination (pages/API/APIStockOrder.ts) |
| covered | POST | `api/stock-order/pagination` | `src/modules/stock-order/stock-order.controller.ts#getAllStockOrderWithPagination` | api/stock-order/pagination (pages/API/APIStockOrder.ts) |
| covered | POST | `api/stock-order/pagination/:param` | `src/modules/stock-order/stock-order.controller.ts#getAllStockOrderPagination` | api/stock-order/pagination/:param (pages/API/APIStockOrder.ts) |
| covered | POST | `api/tech-process` | `src/modules/tech-process/tech-process.controller.ts#upCreateTechProcess` | api/tech-process (pages/API/APITechProcess.ts) |
| missing | POST | `api/users` | `src/modules/users/users.controller.ts#UseInterceptors` | - |
| missing | POST | `api/users/archive` | `src/modules/users/users.controller.ts#archive` | - |
| covered | POST | `api/users/one` | `src/modules/users/users.controller.ts#getUserById` | api/users/one (pages/API/APIUsers.ts) |
| covered | POST | `api/users/pagination/all` | `src/modules/users/users.controller.ts#getAllWithPagination` | api/users/pagination/all (testcases/API/APIUsers.spec.ts) |
| missing | POST | `api/users/role` | `src/modules/users/users.controller.ts#addRole` | - |
| missing | POST | `api/users/role/:param/:param` | `src/modules/users/users.controller.ts#changeRoleById` | - |
| missing | POST | `api/users/set/table/config` | `src/modules/users/users.controller.ts#updateTableConfig` | - |
| covered | POST | `api/users/tabel/unique` | `src/modules/users/users.controller.ts#checkNameUnique` | api/users/tabel/unique (testcases/API/APIUsers.spec.ts) |
| missing | POST | `api/users/update` | `src/modules/users/users.controller.ts#UseInterceptors` | - |
| covered | POST | `api/waybill/create` | `src/modules/waybill/waybill.controller.ts#createWaybill` | api/waybill/create (pages/API/APIWaybill.ts) |
| covered | POST | `api/waybill/pagination` | `src/modules/waybill/waybill.controller.ts#ApiOperation` | api/waybill/pagination (pages/API/APIWaybill.ts) |
| covered | PUT | `api/assemble/complectkit/update` | `src/modules/assemble/assemble.controller.ts#updateAssembleKit` | api/assemble/complectkit/update (pages/API/APIAssemble.ts) |
| missing | PUT | `api/cbed/ava/update` | `src/modules/cbed/cbed.controller.ts#actualAvatar` | - |
| missing | PUT | `api/comments/:param` | `src/modules/thread/thread.controller.ts#updateCommentEntity` | - |
| missing | PUT | `api/comments/:param/pin` | `src/modules/thread/thread.controller.ts#pinCommentById` | - |
| missing | PUT | `api/comments/:param/unpin` | `src/modules/thread/thread.controller.ts#unpinCommentById` | - |
| covered | PUT | `api/companies` | `src/modules/company/companies.controller.ts#updateCompany` | api/companies (pages/API/APICompanies.ts) |
| covered | PUT | `api/companies/unpin-contact/:param/:param` | `src/modules/company/companies.controller.ts#unpunContact` | api/companies/unpin-contact/:param/:param (pages/API/APICompanies.ts) |
| covered | PUT | `api/contacts` | `src/modules/contact/contacts.controller.ts#updateContact` | api/contacts (pages/API/APIContacts.ts) |
| covered | PUT | `api/detal/ava/update` | `src/modules/detal/detal.controller.ts#actualAvatar` | api/detal/ava/update (pages/API/APIDetails.ts) |
| covered | PUT | `api/documents/attach-to-entity` | `src/modules/documents/documents.controller.ts#ApiOperation` | api/documents/attach-to-entity (pages/API/APICBED.ts)<br>api/documents/attach-to-entity (pages/API/APIDocuments.ts) |
| covered | PUT | `api/documents/unpin-documents` | `src/modules/documents/documents.controller.ts#ApiOperation` | api/documents/unpin-documents (pages/API/APICBED.ts)<br>api/documents/unpin-documents (pages/API/APIDocuments.ts) |
| missing | PUT | `api/exclusion/:param` | `src/modules/exclusion/exclusion.controller.ts#updateExclusion` | - |
| covered | PUT | `api/inventary` | `src/modules/inventary/inventary.controller.ts#updatePInventary` | api/inventary (pages/API/APIInventory.ts) |
| covered | PUT | `api/inventary/name` | `src/modules/inventary/inventary.controller.ts#updateInventary` | api/inventary/name (pages/API/APIInventory.ts) |
| covered | PUT | `api/inventary/pt` | `src/modules/inventary/inventary.controller.ts#updatePTInventary` | api/inventary/pt (pages/API/APIInventory.ts) |
| covered | PUT | `api/marks/mark` | `src/modules/marks/marks.controller.ts#updateMarkBy` | api/marks/mark (pages/API/APIMarks.ts) |
| covered | PUT | `api/metaloworking` | `src/modules/metaloworking/metaloworking.controller.ts#updateMetaloworking` | api/metaloworking (pages/API/APIMetaloworking.ts) |
| covered | PUT | `api/metaloworking/comback/:param` | `src/modules/metaloworking/metaloworking.controller.ts#combackMetolloworking` | api/metaloworking/comback/:param (pages/API/APIMetaloworking.ts) |
| missing | PUT | `api/product/ava/update` | `src/modules/product/product.controller.ts#actualAvatar` | - |
| covered | PUT | `api/production-task` | `src/modules/production-tasks/production-tasks.controller.ts#updateProductionTask` | api/production-task (pages/API/APIProductionTasks.ts) |
| covered | PUT | `api/production-task/due-date` | `src/modules/production-tasks/production-tasks.controller.ts#updateDueDateProductionTaskEnum` | api/production-task/due-date (pages/API/APIProductionTasks.ts) |
| covered | PUT | `api/production-task/set/equipment/:param/:param` | `src/modules/production-tasks/production-tasks.controller.ts#setEquipmentToOperationPos` | api/production-task/set/equipment/:param/:param (pages/API/APIProductionTasks.ts) |
| covered | PUT | `api/production-task/set/responsible/:param/:param` | `src/modules/production-tasks/production-tasks.controller.ts#setResponsibleUserToProductionOperation` | api/production-task/set/responsible/:param/:param (pages/API/APIProductionTasks.ts) |
| covered | PUT | `api/production-task/update/operation/pos` | `src/modules/production-tasks/production-tasks.controller.ts#updateOperationPos` | api/production-task/update/operation/pos (pages/API/APIProductionTasks.ts) |
| missing | PUT | `api/rack` | `src/modules/rack/rack.controller.ts#updateRack` | - |
| missing | PUT | `api/rack/add/cell` | `src/modules/rack/rack.controller.ts#addDataToCell` | - |
| missing | PUT | `api/rack/update/cell` | `src/modules/rack/rack.controller.ts#updateCell` | - |
| covered | PUT | `api/sclad/remains` | `src/modules/sclad/sclad.controller.ts#changeRemains` | api/sclad/remains (pages/API/APIWarehouse.ts) |
| missing | PUT | `api/settings/db/load/:param/:param` | `src/modules/settings/settings.controller.ts#loadDumpDb` | - |
| missing | PUT | `api/settings/inaction/:param` | `src/modules/settings/settings.controller.ts#inactionChange` | - |
| covered | PUT | `api/shipments` | `src/modules/shipments/shipments.controller.ts#updateShipments` | api/shipments (pages/API/APIShipments.ts) |
| covered | PUT | `api/shipments/actual` | `src/modules/shipments/shipments.controller.ts#actualAllShipments` | api/shipments/actual (pages/API/APIShipments.ts)<br>api/shipments/actual (pages/API/APITechProcess.ts) |
| covered | PUT | `api/shipments/set/warehouse/date` | `src/modules/shipments/shipments.controller.ts#setWarehouseReadinessDate` | api/shipments/set/warehouse/date (pages/API/APIShipments.ts) |
| missing | PUT | `api/shipments/status/ready-to-ship/:param` | `src/modules/shipments/shipments.controller.ts#updateReadyToShipStatus` | - |
| missing | PUT | `api/solidworks/update-entity` | `src/modules/solidworks/solidworks.controller.ts#UseInterceptors` | - |
| covered | PUT | `api/specification/time/:param/:param` | `src/modules/specification/specification.controller.ts#calculateProductionTime` | api/specification/time/:param/:param (pages/API/APISpecifications.ts) |
| covered | PUT | `api/stock-order/items` | `src/modules/stock-order/stock-order.controller.ts#updateStockOrderItems` | api/stock-order/items (pages/API/APIStockOrder.ts) |
| covered | PUT | `api/stock-order/set/warehouse/date` | `src/modules/stock-order/stock-order.controller.ts#setWarehouseReadinessDate` | api/stock-order/set/warehouse/date (pages/API/APIStockOrder.ts) |
| covered | PUT | `api/stock-order/update/:param` | `src/modules/stock-order/stock-order.controller.ts#update` | api/stock-order/update/:param (pages/API/APIStockOrder.ts) |
| covered | PUT | `api/waybill/update` | `src/modules/waybill/waybill.controller.ts#updateWaybill` | api/waybill/update (pages/API/APIWaybill.ts) |

