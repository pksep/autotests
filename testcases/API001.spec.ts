import { test, expect, request } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage'; 
import { ENV } from '../config'; // Import the configuration

export const runAPI001 = () => {
    test('API Login Test', async ({ page }) => {
        const requestContext = await request.newContext();
        const username = 'Перов Д.А.';
        const password = '54321';
        const tabel = '001';

        const apiPage = new APIPageObject(page);
        // Perform API login
        const loginResponse = await apiPage.apiLogin(requestContext, username, password, tabel);
    
        // Check if the login was successful
        expect(loginResponse).toHaveProperty('token'); // Assuming the response includes a token
    
        // Optionally, set the token as a header for further requests
        await page.context().addInitScript(token => {
            window.localStorage.setItem('authToken', token);
        }, loginResponse.token);
    });
    test.skip('Create Company API Test', async ({ page }) => {
        const requestContext = await request.newContext();
        const username = 'Перов Д.А.';
        const password = '54321';
        const tabel = '001';

        const apiPage = new APIPageObject(page);
        // Perform API login
        const loginResponse = await apiPage.apiLogin(requestContext, username, password, tabel);
    
        // Check if the login was successful
        expect(loginResponse).toHaveProperty('token'); // Assuming the response includes a token
    
        // Optionally, set the token as a header for further requests
        await page.context().addInitScript(token => {
            window.localStorage.setItem('authToken', token);
        }, loginResponse.token);
    });
};
