# Manufacturing process

## Setup

- Create materials
- Create details and add materials
- Create assemblies and add materials and details
- Create products and add all of the above
- Add tech process to details, assemblies, and products

---

## Client order (*Задачи на отгрузку*)

The client can only order a product in **Задачи на отгрузку**.

1. Click **Создать заказ**.
2. Select **Изделие:**
3. Select **Покупатель:**
4. Select quantity — note that the specifications change too.
5. **Дата план. отгрузки** is when you need to deliver to the client.

Then you can search for the deficit product.

---

## Deficit product (*Дефицит продукции*)

At the same time, open warehouse **Дефицит продукции**.

- First search for your product — it should not be there.
- After creating the **Задачи на отгрузку**, refresh and search again — it will be visible.

You can also open the deficit assembly and deficit details pages — deficits for your items will not yet be present there.

Open **Производство → Сборка** and search for your product — it should not be present.

---

## Launch product into production

Go back to **Дефицит продукции**, select your product, and press **Запустить в производство** to launch it into production (set a quantity if you need less).

Click **В производство**.

This creates the warehouse order for the product (**заказ склада**) and creates the deficit for its child elements.

- On **Дефицит сборочных единиц**, it will show when you search for it — same for **Дефицит деталей** and **Производство → Сборка**.

---

## Metalworking and assemblies

Open **Производство → Металлообработка**.

After launching the product, launch the assembly and the detail into production: go to **Дефицит сборочных единиц**, find your assembly, and launch it into production. These operations also create warehouse orders (**заказ склада**).

- On **Металлообработка**, you can search and see your detail.
- On **Сборка**, you can see your assembly.
- On **Сборка** you will see two items — one is for the assembly and one is for the product.

---

## Production tasks (*Производственные задания*)

Create production tasks (**Производственные задания**) to start building the part.

1. Open **Склад → Производственные задания** and click **Создание ПЗ**, then in the dialog choose **Металлообработка**.
2. Find your detail, select its checkbox, and click **add**.
3. Click **Сформировать операции**.
4. Select each operation and click **add** — here you assign the users who will perform the tasks.
   - If the production task is for **assembly**, you create a task for **users**.
   - If it is for **metalworking**, you create a task for **machinery**.
5. Click **Сохранить ПЗ**.

This also creates **ПЗ**.

Go back to **Производственные задания** and create a new task for the **assembly** and **product**.

---

## Production page and online board

Go to the **Производство** page.

- Turn on the **Пользователи по производственным заданиям** slider.
- Search for the user you assigned — their tasks appear here.

Go to the **Онлайн табло по ПЗ** page.

---

## Marking completion of operations

Two ways:

1. Click the link in the operations cell → select the operation (row) → **Добавить отметку**.
2. Click the link in the second operations group column → a dialog opens → open **Остальной технологический процесс** → click the link in the **Наименование операции** cell → on the page that opens, use **Создать отметку** in the table.

---

## Kit assemblies on plan

In the warehouse, open **Комплектация сборок на план**.

- Find your assembly and double-click to open the dialog.
- Select the **№ заказа** checkbox and the quantity to assemble → **Скомплектовать**.
- Refresh **Комплектация сборок на план** and search again — the line is gone because it is already assembled.
- It moves to **Скомплектованные наборы** — open that page and search to confirm.

---

## Kit products on plan (deficits)

Go to **Комплектация изделий на план** and search for your product.

Double-click it. In the dialog, the assembly and detail sections can show a deficit — you cannot assemble until those are resolved.

### Two ways to close deficits

- **Easiest (testing only):** In the **Сборки** and **Детали** tables, under **На складе**, click the link in the **Кол-во** column → revisions page → adjust how many items are in the warehouse.

- **Real way:** On **Онлайн табло по ПЗ**, find your assembly and add the final marks: select the second row → **Добавить отметку** → set **Кол-во выполненных сборочных единиц** to all 3 → **Сохранить**.

---

## Receipt from production

Receive items in the warehouse: **Склад → Приход на склад от поставщиков и производства**.

1. **Создать приход** → choose **металлообработка** (metalwork).
2. Search for your item → **add** (you can set how many to receive) → save.
3. Do the same for the assembly.

---

## Assemble the product

With everything received, assemble the product.

1. **Остатки продукции, сборок и деталей на складе** — search all three tables for detail, assembly, and product.
2. **Комплектация изделий на план** — find and double-click your product.
3. Select the **№ заказа** checkbox.
4. Leave **Свое кол-во** as it was (e.g. 3).
5. **Скомплектовать** — this automatically adds a completion mark for this operation for the product (same idea as for assemblies).

Refresh **Остатки продукции, сборок и деталей на складе** and search all three tables again — **В наборах** should show 3 for detail and assembly because they are reserved for the kit.

---

## Final assembly marks and product receipt

**Производство → Онлайн табло по ПЗ** → **сборка** tab.

- Search for your product → open the operations cell → **Производственный путь** dialog → second operation row → **Добавить отметку** → set quantity → save.

Accept the product in the warehouse: **Приход на склад от поставщиков и производства** → **Создать приход** → **Сборка** in the dialog → search for the product → select the row checkbox → **Добавить** → **Создать**.

---

## Shipment to buyer

**Склад: Задачи на отгрузку** → search for the product → select it → **Отгрузить** → **Отгрузить**.

Confirm shipment: **Склад → Отгруженные заказы** → search for the product and see that it has been sent.
