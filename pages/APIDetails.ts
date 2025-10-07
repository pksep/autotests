import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/logger';

export class DetailsAPI extends APIPageObject {
    constructor(page: Page | null) {
        super(page as any);
    }

    async getAttributeById(request: APIRequestContext, id: string, attributes: string[], authToken?: string) {
        logger.info(`Getting attributes for detail ID: ${id}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const bodyData = {
            id: parseInt(id),
            attributes: attributes,
            modelsInclude: ["cbed"]
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/one', {
            headers: headers,
            data: bodyData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get attributes response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get attributes successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getIncludeById(request: APIRequestContext, id: string, includes: string[], authToken?: string) {
        logger.info(`Getting includes for detail ID: ${id}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const bodyData = {
            id: parseInt(id),
            includes: includes,
            modelsInclude: ["cbed"]
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/one', {
            headers: headers,
            data: bodyData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get includes response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get includes successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getDetailShipments(request: APIRequestContext, id: string, authToken?: string) {
        logger.info(`Getting shipments for detail ID: ${id}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const bodyData = {
            id: parseInt(id),
            includes: ["shipments"],
            modelsInclude: ["cbed"]
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/one', {
            headers: headers,
            data: bodyData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get shipments response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get shipments successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getOperationInclude(request: APIRequestContext, authToken?: string) {
        logger.info(`Getting operation include details`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const response = await request.get(ENV.API_BASE_URL + 'api/detal/operation/include', {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Get operation include response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get operation include successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getArchivedDetails(request: APIRequestContext, searchString: string, authToken?: string) {
        logger.info(`Getting archived details`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const bodyData = {
            searchString: searchString
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/archive', {
            headers: headers,
            data: bodyData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get archived details response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get archived details successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async createDetail(request: APIRequestContext, detailData: any, userId: string, authToken?: string) {
        logger.info(`Creating detail with data:`, detailData);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal', {
            headers: headers,
            data: detailData
        });

        try {
            const responseData = await response.json();
            logger.info(`Detail creation response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Detail creation successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getPaginationDetails(request: APIRequestContext, paginationData: any, userId: string, authToken?: string) {
        logger.info(`Getting paginated details`);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/pagination', {
            headers: headers,
            data: paginationData
        });

        try {
            const responseData = await response.json();
            logger.info(`Pagination details response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Pagination details successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async checkDesignation(request: APIRequestContext, authToken?: string) {
        logger.info(`Checking designation availability`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/designation/check', {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Designation check response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Designation check successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async updateDetail(request: APIRequestContext, detailData: any, userId: string, authToken?: string) {
        logger.info(`Updating detail with data:`, detailData);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/update', {
            headers: headers,
            data: detailData
        });

        try {
            const responseData = await response.json();
            logger.info(`Detail update response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Detail update successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getDetailRemains(request: APIRequestContext, remainData: any, authToken?: string) {
        logger.info(`Getting detail remains`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/sclad/remains', {
            headers: headers,
            data: remainData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get detail remains response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get detail remains successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async addDetailFile(request: APIRequestContext, fileData: any, userId: string, authToken?: string) {
        logger.info(`Adding file to detail`);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/file', {
            headers: headers,
            data: fileData
        });

        try {
            const responseData = await response.json();
            logger.info(`Add detail file response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Add detail file successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async updateDetailAvatar(request: APIRequestContext, authToken?: string) {
        logger.info(`Updating detail avatar`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const response = await request.put(ENV.API_BASE_URL + 'api/detal/ava/update', {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Update detail avatar response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Update detail avatar successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async deleteDetail(request: APIRequestContext, detailId: string, userId: string, authToken?: string) {
        logger.info(`Deleting detail with ID: ${detailId}`);

        const headers = {
            'accept': '*/*',
            'user-id': userId,
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const response = await request.delete(ENV.API_BASE_URL + `api/detal/${detailId}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Delete detail response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Delete detail successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getDetailById(request: APIRequestContext, detailData: any, authToken?: string) {
        logger.info(`Getting detail by ID`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/one', {
            headers: headers,
            data: detailData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get detail by ID response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get detail by ID successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getTechProcessByDetailId(request: APIRequestContext, detailId: string, authToken?: string) {
        logger.info(`Getting tech process by detail ID: ${detailId}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const response = await request.get(ENV.API_BASE_URL + `api/detal/tech_by_id_detal/${detailId}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Get tech process by detail ID response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get tech process by detail ID successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getDetailSpecification(request: APIRequestContext, detailId: string, isFull: boolean, authToken?: string) {
        logger.info(`Getting detail specification for ID: ${detailId}, isFull: ${isFull}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const response = await request.get(ENV.API_BASE_URL + `api/detal/one/spetification/${detailId}/${isFull}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Get detail specification response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get detail specification successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getAllDetails(request: APIRequestContext, light: boolean, attributes: string[], authToken?: string) {
        logger.info(`Getting all details`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'compress': 'no-compress'
        };

        const encodedAttributes = encodeURIComponent(JSON.stringify(attributes));
        const response = await request.get(ENV.API_BASE_URL + `api/detal/all/${light}/${encodedAttributes}`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Get all details response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get all details successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getDetailDeficits(request: APIRequestContext, deficitData: any, authToken?: string) {
        logger.info(`Getting detail deficits`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.post(ENV.API_BASE_URL + 'api/detal/deficits', {
            headers: headers,
            data: deficitData
        });

        try {
            const responseData = await response.json();
            logger.info(`Get detail deficits response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            if (response.status() === 201) {
                logger.info(`Get detail deficits successful with empty response body`);
                return { status: response.status(), data: { success: true } };
            }
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }

    async getDetailFiles(request: APIRequestContext, detailId: string, authToken?: string) {
        logger.info(`Getting files for detail ID: ${detailId}`);

        const headers = {
            'accept': '*/*',
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            'compress': 'no-compress'
        };

        const response = await request.get(ENV.API_BASE_URL + `api/detal/${detailId}/files`, {
            headers: headers
        });

        try {
            const responseData = await response.json();
            logger.info(`Get detail files response received`);
            return { status: response.status(), data: responseData };
        } catch (error) {
            logger.error(`Failed to parse response, status: ${response.status()}`);
            return { status: response.status(), data: null };
        }
    }
}
