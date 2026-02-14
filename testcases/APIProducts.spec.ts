import { test, expect, request } from "@playwright/test";
import { ProductsAPI } from "../pages/APIProducts";
import { AuthAPI } from "../pages/APIAuth";
import { SpecificationsAPI } from "../pages/APISpecifications";
import { ENV, API_CONST } from "../config";
import logger from "../lib/utils/logger";
import { allure } from "allure-playwright";

export const runProductsAPI = () => {
    logger.info(`Starting Products API tests`);

    test("Products API - Complete CRUD Flow with Dependencies", async ({ request, page }) => {
        test.setTimeout(90000);
        const productsAPI = new ProductsAPI(page);
        const authAPI = new AuthAPI(page);
        const specificationsAPI = new SpecificationsAPI(page);
        let authToken: string;
        let createdProductId: number;
        let createdSpecificationId: number;

        await allure.step("Step 1: Authenticate user", async () => {
            logger.log("Step 1: Authenticate user");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD
            );

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            logger.log("Authentication successful, token received");
        });

        await allure.step("Step 2: Create Product Specification", async () => {
            logger.log("Step 2: Create Product Specification");

            const specData = {
                name: "Test Product Specification",
                description: "Test specification for product",
                version: "1.0",
                status: "draft"
            };

            const specResponse = await specificationsAPI.createSpecification(request, specData, API_CONST.API_TEST_USER_ID);

            expect(specResponse.status).toBe(201);
            expect(specResponse.data).toHaveProperty('id');
            createdSpecificationId = specResponse.data.id;
            logger.log(`Specification created successfully with ID: ${createdSpecificationId}`);
        });

        await allure.step("Step 3: Create Product", async () => {
            logger.log("Step 3: Create Product");

            const productData = {
                name: API_CONST.API_TEST_PRODUCT_NAME,
                description: API_CONST.API_TEST_PRODUCT_DESCRIPTION,
                specificationId: createdSpecificationId,
                category: "test-category",
                status: "active",
                price: 100.00
            };

            const createResponse = await productsAPI.createProduct(request, productData, API_CONST.API_TEST_USER_ID);

            expect(createResponse.status).toBe(201);
            expect(createResponse.data).toHaveProperty('id');
            createdProductId = createResponse.data.id;
            logger.log(`Product created successfully with ID: ${createdProductId}`);
        });

        await allure.step("Step 4: Get Product by ID", async () => {
            logger.log("Step 4: Get Product by ID");

            const getResponse = await productsAPI.getProductById(request, createdProductId);

            expect(getResponse.status).toBe(200);
            expect(getResponse.data.id).toBe(createdProductId);
            expect(getResponse.data.name).toBe(API_CONST.API_TEST_PRODUCT_NAME);
            expect(getResponse.data.specificationId).toBe(createdSpecificationId);
            logger.log("Product retrieved successfully by ID");
        });

        await allure.step("Step 5: Get Product Specifications", async () => {
            logger.log("Step 5: Get Product Specifications");

            const specsResponse = await productsAPI.getProductSpecifications(request, createdProductId);

            expect(specsResponse.status).toBe(200);
            expect(Array.isArray(specsResponse.data)).toBe(true);
            logger.log(`Retrieved ${specsResponse.data.length} specifications for product`);
        });

        await allure.step("Step 6: Get Product Components", async () => {
            logger.log("Step 6: Get Product Components");

            const componentsResponse = await productsAPI.getProductComponents(request, createdProductId);

            expect(componentsResponse.status).toBe(200);
            expect(Array.isArray(componentsResponse.data)).toBe(true);
            logger.log(`Retrieved ${componentsResponse.data.length} components for product`);
        });

        await allure.step("Step 7: Update Product", async () => {
            logger.log("Step 7: Update Product");

            const updateData = {
                id: createdProductId,
                name: API_CONST.API_TEST_PRODUCT_NAME_UPDATED,
                description: API_CONST.API_TEST_PRODUCT_DESCRIPTION_UPDATED,
                specificationId: createdSpecificationId,
                category: "updated-test-category",
                status: "active",
                price: 150.00
            };

            const updateResponse = await productsAPI.updateProduct(request, updateData, API_CONST.API_TEST_USER_ID);

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.data.name).toBe(API_CONST.API_TEST_PRODUCT_NAME_UPDATED);
            logger.log("Product updated successfully");
        });

        await allure.step("Step 8: Validate Product", async () => {
            logger.log("Step 8: Validate Product");

            const validateData = {
                id: createdProductId,
                name: API_CONST.API_TEST_PRODUCT_NAME_UPDATED,
                description: API_CONST.API_TEST_PRODUCT_DESCRIPTION_UPDATED
            };

            const validateResponse = await productsAPI.validateProduct(request, validateData);

            expect(validateResponse.status).toBe(200);
            expect(validateResponse.data.valid).toBe(true);
            logger.log("Product validation successful");
        });

        await allure.step("Step 9: Delete Product", async () => {
            logger.log("Step 9: Delete Product");

            const deleteResponse = await productsAPI.deleteProduct(request, createdProductId, API_CONST.API_TEST_USER_ID);

            expect(deleteResponse.status).toBe(204);
            logger.log("Product deleted successfully");
        });

        await allure.step("Step 10: Delete Specification", async () => {
            logger.log("Step 10: Delete Specification");

            const deleteSpecResponse = await specificationsAPI.deleteSpecification(request, createdSpecificationId, API_CONST.API_TEST_USER_ID);

            expect(deleteSpecResponse.status).toBe(204);
            logger.log("Specification deleted successfully");
        });

        await allure.step("Step 11: Verify Product deletion", async () => {
            logger.log("Step 11: Verify Product deletion");

            try {
                await productsAPI.getProductById(request, createdProductId);
                throw new Error("Product should not exist after deletion");
            } catch (error) {
                expect(error.message).toContain("404");
                logger.log("Product deletion verified - Product no longer exists");
            }
        });
    });

    test("Products API - Search and Pagination", async ({ request, page }) => {
        test.setTimeout(60000);
        const productsAPI = new ProductsAPI(page);
        const authAPI = new AuthAPI(page);
        let authToken: string;

        await allure.step("Step 1: Authenticate user", async () => {
            logger.log("Step 1: Authenticate user");

            const loginResponse = await authAPI.login(
                request,
                API_CONST.API_TEST_USERNAME,
                API_CONST.API_TEST_PASSWORD
            );

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.data).toHaveProperty('token');
            authToken = loginResponse.data.token;
            logger.log("Authentication successful, token received");
        });

        await allure.step("Step 2: Get all products with pagination", async () => {
            logger.log("Step 2: Get all products with pagination");

            const paginationData = {
                page: 1,
                limit: 10,
                sortBy: "name",
                sortOrder: "asc"
            };

            const paginationResponse = await productsAPI.getAllProducts(request, paginationData);

            expect(paginationResponse.status).toBe(200);
            expect(paginationResponse.data).toHaveProperty('items');
            expect(paginationResponse.data).toHaveProperty('total');
            expect(Array.isArray(paginationResponse.data.items)).toBe(true);
            logger.log(`Retrieved ${paginationResponse.data.items.length} products with pagination`);
        });

        await allure.step("Step 3: Search products", async () => {
            logger.log("Step 3: Search products");

            const searchData = {
                query: "test",
                filters: {
                    category: "test-category",
                    status: "active"
                },
                page: 1,
                limit: 5
            };

            const searchResponse = await productsAPI.searchProducts(request, searchData);

            expect(searchResponse.status).toBe(200);
            expect(Array.isArray(searchResponse.data)).toBe(true);
            logger.log(`Search returned ${searchResponse.data.length} products`);
        });
    });
};
