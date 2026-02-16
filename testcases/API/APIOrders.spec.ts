import { test, expect, request } from "@playwright/test";
import { OrdersAPI } from "../../pages/API/APIOrders";
import { AuthAPI } from "../../pages/API/APIAuth";
import { ProductsAPI } from "../../pages/API/APIProducts";
import { UsersAPI } from "../../pages/API/APIUsers";
import { ENV } from "../../config";
import { API_CONST } from "../../lib/Constants/APIConstants";
import logger from "../../lib/utils/logger";
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
            logger.log("Step 1: Authenticate user");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect.soft(loginResponse.status).toBe(200);
            expect.soft(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            logger.log("Authentication successful, token received");
        });

        await allure.step("Step 2: Create User for Order", async () => {
            logger.log("Step 2: Create User for Order");

            const userData = {
                initials: "OU", // Order User
                tabel: "99999",
                role: "customer"
            };

            const userResponse = await usersAPI.createUser(request, userData, API_CONST.API_TEST_USER_ID);

            expect.soft(userResponse.status).toBe(201);
            expect.soft(userResponse.data).toHaveProperty('id');
            createdUserId = userResponse.data.id;
            logger.log(`User created successfully with ID: ${createdUserId}`);
        });

        await allure.step("Step 3: Create Product for Order", async () => {
            logger.log("Step 3: Create Product for Order");

            const productData = {
                name: "Order Test Product",
                description: "Product for order testing",
                category: "test-category",
                status: "active",
                price: 50.00
            };

            const productResponse = await productsAPI.createProduct(request, productData, API_CONST.API_TEST_USER_ID);

            expect.soft(productResponse.status).toBe(201);
            expect.soft(productResponse.data).toHaveProperty('id');
            createdProductId = productResponse.data.id;
            logger.log(`Product created successfully with ID: ${createdProductId}`);
        });

        await allure.step("Step 4: Create Order", async () => {
            logger.log("Step 4: Create Order");

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

            expect.soft(createResponse.status).toBe(201);
            expect.soft(createResponse.data).toHaveProperty('id');
            createdOrderId = createResponse.data.id;
            logger.log(`Order created successfully with ID: ${createdOrderId}`);
        });

        await allure.step("Step 5: Get Order by ID", async () => {
            logger.log("Step 5: Get Order by ID");

            const getResponse = await ordersAPI.getOrderById(request, createdOrderId);

            expect.soft(getResponse.status).toBe(200);
            expect.soft(getResponse.data.id).toBe(createdOrderId);
            expect.soft(getResponse.data.customerId).toBe(createdUserId);
            expect.soft(getResponse.data.status).toBe("pending");
            logger.log("Order retrieved successfully by ID");
        });

        await allure.step("Step 6: Get Order Items", async () => {
            logger.log("Step 6: Get Order Items");

            const itemsResponse = await ordersAPI.getOrderItems(request, createdOrderId);

            expect.soft(itemsResponse.status).toBe(200);
            expect.soft(Array.isArray(itemsResponse.data)).toBe(true);
            expect.soft(itemsResponse.data.length).toBeGreaterThan(0);
            logger.log(`Retrieved ${itemsResponse.data.length} order items`);
        });

        await allure.step("Step 7: Add Item to Order", async () => {
            logger.log("Step 7: Add Item to Order");

            const itemData = {
                productId: createdProductId,
                quantity: 1,
                price: 50.00
            };

            const addItemResponse = await ordersAPI.addOrderItem(request, createdOrderId, itemData, API_CONST.API_TEST_USER_ID);

            expect.soft(addItemResponse.status).toBe(201);
            expect.soft(addItemResponse.data).toHaveProperty('id');
            logger.log("Item added to order successfully");
        });

        await allure.step("Step 8: Update Order Status", async () => {
            logger.log("Step 8: Update Order Status");

            const statusResponse = await ordersAPI.updateOrderStatus(request, createdOrderId, "confirmed", API_CONST.API_TEST_USER_ID);

            expect.soft(statusResponse.status).toBe(200);
            expect.soft(statusResponse.data.status).toBe("confirmed");
            logger.log("Order status updated successfully");
        });

        await allure.step("Step 9: Update Order", async () => {
            logger.log("Step 9: Update Order");

            const updateData = {
                id: createdOrderId,
                customerId: createdUserId,
                status: "processing",
                totalAmount: 150.00,
                notes: "Updated test order"
            };

            const updateResponse = await ordersAPI.updateOrder(request, updateData, API_CONST.API_TEST_USER_ID);

            expect.soft(updateResponse.status).toBe(200);
            expect.soft(updateResponse.data.status).toBe("processing");
            logger.log("Order updated successfully");
        });

        await allure.step("Step 10: Get Orders by Status", async () => {
            logger.log("Step 10: Get Orders by Status");

            const statusOrdersResponse = await ordersAPI.getOrdersByStatus(request, "processing");

            expect.soft(statusOrdersResponse.status).toBe(200);
            expect.soft(Array.isArray(statusOrdersResponse.data)).toBe(true);
            logger.log(`Retrieved ${statusOrdersResponse.data.length} orders with processing status`);
        });

        await allure.step("Step 11: Delete Order", async () => {
            logger.log("Step 11: Delete Order");

            const deleteResponse = await ordersAPI.deleteOrder(request, createdOrderId, API_CONST.API_TEST_USER_ID);

            expect.soft(deleteResponse.status).toBe(204);
            logger.log("Order deleted successfully");
        });

        await allure.step("Step 12: Cleanup - Delete Product", async () => {
            logger.log("Step 12: Cleanup - Delete Product");

            const deleteProductResponse = await productsAPI.deleteProduct(request, createdProductId, API_CONST.API_TEST_USER_ID);

            expect.soft(deleteProductResponse.status).toBe(204);
            logger.log("Product deleted successfully");
        });

        await allure.step("Step 13: Cleanup - Delete User", async () => {
            logger.log("Step 13: Cleanup - Delete User");

            const deleteUserResponse = await usersAPI.deleteUserById(request, String(createdUserId));

            expect.soft(deleteUserResponse.status).toBe(204);
            logger.log("User deleted successfully");
        });

        await allure.step("Step 14: Verify Order deletion", async () => {
            logger.log("Step 14: Verify Order deletion");

            try {
                await ordersAPI.getOrderById(request, createdOrderId);
                throw new Error("Order should not exist after deletion");
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error);
                expect.soft(message).toContain("404");
                logger.log("Order deletion verified - Order no longer exists");
            }
        });
    });

    test("Orders API - Order Management Operations", async ({ request, page }) => {
        test.setTimeout(60000);
        const ordersAPI = new OrdersAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

        await allure.step("Step 1: Authenticate user", async () => {
            logger.log("Step 1: Authenticate user");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD,
                API_CONST.API_TEST_TABEL
            );

            expect.soft(loginResponse.status).toBe(200);
            expect.soft(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            logger.log("Authentication successful, token received");
        });

        await allure.step("Step 2: Get all orders with pagination", async () => {
            logger.log("Step 2: Get all orders with pagination");

            const paginationData = {
                page: 1,
                limit: 10,
                sortBy: "createdAt",
                sortOrder: "desc"
            };

            const paginationResponse = await ordersAPI.getAllOrders(request, paginationData);

            expect.soft(paginationResponse.status).toBe(200);
            expect.soft(paginationResponse.data).toHaveProperty('items');
            expect.soft(paginationResponse.data).toHaveProperty('total');
            expect.soft(Array.isArray(paginationResponse.data.items)).toBe(true);
            logger.log(`Retrieved ${paginationResponse.data.items.length} orders with pagination`);
        });

        await allure.step("Step 3: Get orders by different statuses", async () => {
            logger.log("Step 3: Get orders by different statuses");

            const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

            for (const status of statuses) {
                const statusResponse = await ordersAPI.getOrdersByStatus(request, status);

                expect.soft(statusResponse.status).toBe(200);
                expect.soft(Array.isArray(statusResponse.data)).toBe(true);
                logger.log(`Retrieved ${statusResponse.data.length} orders with status: ${status}`);
            }
        });
    });
};
