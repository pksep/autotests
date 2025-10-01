import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class AuthAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async login(request: APIRequestContext, username: string, password: string, tabel: string) {
        logger.info(`Attempting login for user: ${username}`);

        // Use the correct endpoint and field names
        const response = await this.postWithJsonHeaders(request, ENV.API_BASE_URL + 'api/auth/login', {
            login: username,
            password: password,
            tabel: tabel
        });

        return await this.handleResponse(response, username);
    }

    private async handleResponse(response: any, username: string) {
        const status = response.status();
        let responseData;

        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
        }

        if (response.ok()) {
            logger.info(`Login successful for user: ${username}`);
        } else {
            logger.info(`Login failed for user: ${username}, status: ${status} - This is expected for defensive testing`);
        }

        return { status: status, data: responseData };
    }

    async getUserByToken(request: APIRequestContext, token: string) {
        logger.info(`Getting user by token`);

        // Token validation endpoint - returns 200 OK if token is valid (no user data returned)
        // This is correct API behavior: 200 = valid token, 401 = invalid token
        const response = await request.get(ENV.API_BASE_URL + 'api/userdata-by-token', {
            headers: {
                'authorization': token,
                'accept': '*/*'
            }
        });

        const status = response.status();
        let responseData;

        try {
            responseData = await response.json();
            console.log(`🔍 JSON response parsed successfully: ${JSON.stringify(responseData).substring(0, 200)}...`);
        } catch (e) {
            responseData = await response.text();
            console.log(`🔍 Text response: "${responseData}" (length: ${responseData.length})`);
        }

        // Response processed

        if (response.ok()) {
            logger.info(`Successfully retrieved user by token`);
        } else {
            logger.info(`Failed to get user by token, status: ${status} - This is expected for defensive testing`);
        }

        return { status: status, data: responseData };
    }
}
