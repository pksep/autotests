import { test, expect, request } from "@playwright/test";
import { OrdersAPI } from "../pages/APIOrders";
import { AuthAPI } from "../pages/APIAuth";
import { ProductsAPI } from "../pages/APIProducts";
import { UsersAPI } from "../pages/APIUsers";
import { ENV, API_CONST } from "../config";
import logger from "../lib/logger";
import { allure } from "allure-playwright";

export const runOrdersAPI = () => {
    logger.info(`Starting Orders API tests`);

    test("Orders API - Complete Order Flow with Dependencies", async ({ request, page }) => {
        test.setTimeout(120000);
        const ordersAPI = new OrdersAPI(page);
        const authAPI = new AuthAPI(page);
        const productsAPI = new ProductsAPI(page);
        const usersAPI = new UsersAPI(page);
        let authToken: string;
        let createdOrderId: number;
        let createdProductId: number;
        let createdUserId: number;

        await allure.step("Step 1: Authenticate user", async () => {
            console.log("Step 1: Authenticate user");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD
            );

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            console.log("Authentication successful, token received");
        });

        await allure.step("Step 2: Create User for Order", async () => {
            console.log("Step 2: Create User for Order");

            const userData = {
                initials: "OU", // Order User
                tabel: "99999",
                role: "customer"
            };

            const userResponse = await usersAPI.createUser(request, userData, API_CONST.API_TEST_USER_ID);

            expect(userResponse.status).toBe(201);
            expect(userResponse.data).toHaveProperty('id');
            createdUserId = userResponse.data.id;
            console.log(`User created successfully with ID: ${createdUserId}`);
        });

        await allure.step("Step 3: Create Product for Order", async () => {
            console.log("Step 3: Create Product for Order");

            const productData = {
                name: "Order Test Product",
                description: "Product for order testing",
                category: "test-category",
                status: "active",
                price: 50.00
            };

            const productResponse = await productsAPI.createProduct(request, productData, API_CONST.API_TEST_USER_ID);

            expect(productResponse.status).toBe(201);
            expect(productResponse.data).toHaveProperty('id');
            createdProductId = productResponse.data.id;
            console.log(`Product created successfully with ID: ${createdProductId}`);
        });

        await allure.step("Step 4: Create Order", async () => {
            console.log("Step 4: Create Order");

            const orderData = {
                customerId: createdUserId,
                items: [
                    {
                        productId: createdProductId,
                        quantity: 2,
                        price: 50.00
                    }
                ],
                status: "pending",
                totalAmount: 100.00,
                notes: "Test order"
            };

            const createResponse = await ordersAPI.createOrder(request, orderData, API_CONST.API_TEST_USER_ID);

            expect(createResponse.status).toBe(201);
            expect(createResponse.data).toHaveProperty('id');
            createdOrderId = createResponse.data.id;
            console.log(`Order created successfully with ID: ${createdOrderId}`);
        });

        await allure.step("Step 5: Get Order by ID", async () => {
            console.log("Step 5: Get Order by ID");

            const getResponse = await ordersAPI.getOrderById(request, createdOrderId);

            expect(getResponse.status).toBe(200);
            expect(getResponse.data.id).toBe(createdOrderId);
            expect(getResponse.data.customerId).toBe(createdUserId);
            expect(getResponse.data.status).toBe("pending");
            console.log("Order retrieved successfully by ID");
        });

        await allure.step("Step 6: Get Order Items", async () => {
            console.log("Step 6: Get Order Items");

            const itemsResponse = await ordersAPI.getOrderItems(request, createdOrderId);

            expect(itemsResponse.status).toBe(200);
            expect(Array.isArray(itemsResponse.data)).toBe(true);
            expect(itemsResponse.data.length).toBeGreaterThan(0);
            console.log(`Retrieved ${itemsResponse.data.length} order items`);
        });

        await allure.step("Step 7: Add Item to Order", async () => {
            console.log("Step 7: Add Item to Order");

            const itemData = {
                productId: createdProductId,
                quantity: 1,
                price: 50.00
            };

            const addItemResponse = await ordersAPI.addOrderItem(request, createdOrderId, itemData, API_CONST.API_TEST_USER_ID);

            expect(addItemResponse.status).toBe(201);
            expect(addItemResponse.data).toHaveProperty('id');
            console.log("Item added to order successfully");
        });

        await allure.step("Step 8: Update Order Status", async () => {
            console.log("Step 8: Update Order Status");

            const statusResponse = await ordersAPI.updateOrderStatus(request, createdOrderId, "confirmed", API_CONST.API_TEST_USER_ID);

            expect(statusResponse.status).toBe(200);
            expect(statusResponse.data.status).toBe("confirmed");
            console.log("Order status updated successfully");
        });

        await allure.step("Step 9: Update Order", async () => {
            console.log("Step 9: Update Order");

            const updateData = {
                id: createdOrderId,
                customerId: createdUserId,
                status: "processing",
                totalAmount: 150.00,
                notes: "Updated test order"
            };

            const updateResponse = await ordersAPI.updateOrder(request, updateData, API_CONST.API_TEST_USER_ID);

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.status).toBe("processing");
            console.log("Order updated successfully");
        });

        await allure.step("Step 10: Get Orders by Status", async () => {
            console.log("Step 10: Get Orders by Status");

            const statusOrdersResponse = await ordersAPI.getOrdersByStatus(request, "processing");

            expect(statusOrdersResponse.status).toBe(200);
            expect(Array.isArray(statusOrdersResponse.data)).toBe(true);
            console.log(`Retrieved ${statusOrdersResponse.data.length} orders with processing status`);
        });

        await allure.step("Step 11: Delete Order", async () => {
            console.log("Step 11: Delete Order");

            const deleteResponse = await ordersAPI.deleteOrder(request, createdOrderId, API_CONST.API_TEST_USER_ID);

            expect(deleteResponse.status).toBe(204);
            console.log("Order deleted successfully");
        });

        await allure.step("Step 12: Cleanup - Delete Product", async () => {
            console.log("Step 12: Cleanup - Delete Product");

            const deleteProductResponse = await productsAPI.deleteProduct(request, createdProductId, API_CONST.API_TEST_USER_ID);

            expect(deleteProductResponse.status).toBe(204);
            console.log("Product deleted successfully");
        });

        await allure.step("Step 13: Cleanup - Delete User", async () => {
            console.log("Step 13: Cleanup - Delete User");

            const deleteUserResponse = await usersAPI.deleteUserById(request, createdUserId);

            expect(deleteUserResponse.status).toBe(204);
            console.log("User deleted successfully");
        });

        await allure.step("Step 14: Verify Order deletion", async () => {
            console.log("Step 14: Verify Order deletion");

            try {
                await ordersAPI.getOrderById(request, createdOrderId);
                throw new Error("Order should not exist after deletion");
            } catch (error) {
                expect(error.message).toContain("404");
                console.log("Order deletion verified - Order no longer exists");
            }
        });
    });

    test("Orders API - Order Management Operations", async ({ request, page }) => {
        test.setTimeout(60000);
        const ordersAPI = new OrdersAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

        await allure.step("Step 1: Authenticate user", async () => {
            console.log("Step 1: Authenticate user");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD
            );

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            console.log("Authentication successful, token received");
        });

        await allure.step("Step 2: Get all orders with pagination", async () => {
            console.log("Step 2: Get all orders with pagination");

            const paginationData = {
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc"
            };

            const paginationResponse = await ordersAPI.getAllOrders(request, paginationData);

            expect(paginationResponse.status).toBe(200);
            expect(paginationResponse.data).toHaveProperty('items');
            expect(paginationResponse.data).toHaveProperty('total');
            expect(Array.isArray(paginationResponse.data.items)).toBe(true);
            console.log(`Retrieved ${paginationResponse.data.items.length} orders with pagination`);
        });

        await allure.step("Step 3: Get orders by different statuses", async () => {
            console.log("Step 3: Get orders by different statuses");

            const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

            for (const status of statuses) {
                const statusResponse = await ordersAPI.getOrdersByStatus(request, status);

                expect(statusResponse.status).toBe(200);
                expect(Array.isArray(statusResponse.data)).toBe(true);
                console.log(`Retrieved ${statusResponse.data.length} orders with status: ${status}`);
            }
        });
    });
};
