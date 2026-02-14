import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../lib/APIPage';
import { ENV } from '../config';
import logger from '../lib/utils/logger';

export class WorkflowsAPI extends APIPageObject {
    constructor(page: Page) {
        super(page);
    }

    async createWorkflow(request: APIRequestContext, workflowData: any, userId: string) {
        logger.info(`Creating workflow:`, workflowData);

        const response = await request.post(ENV.API_BASE_URL + 'api/workflows', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: workflowData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Workflow created successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to create workflow, status: ${response.status()}`);
            throw new Error(`Failed to create workflow with status: ${response.status()}`);
        }
    }

    async updateWorkflow(request: APIRequestContext, workflowData: any, userId: string) {
        logger.info(`Updating workflow:`, workflowData);

        const response = await request.put(ENV.API_BASE_URL + 'api/workflows', {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: workflowData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Workflow updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update workflow, status: ${response.status()}`);
            throw new Error(`Failed to update workflow with status: ${response.status()}`);
        }
    }

    async getWorkflowById(request: APIRequestContext, workflowId: string) {
        logger.info(`Getting workflow by ID: ${workflowId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/workflows/${workflowId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflow by ID`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflow by ID, status: ${response.status()}`);
            throw new Error(`Failed to get workflow by ID with status: ${response.status()}`);
        }
    }

    async deleteWorkflow(request: APIRequestContext, workflowId: string, userId: string) {
        logger.info(`Deleting workflow with ID: ${workflowId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/workflows/${workflowId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Workflow deleted successfully' };
            logger.info(`Workflow deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete workflow, status: ${response.status()}`);
            throw new Error(`Failed to delete workflow with status: ${response.status()}`);
        }
    }

    async getAllWorkflows(request: APIRequestContext, paginationData: any) {
        logger.info(`Getting all workflows with pagination:`, paginationData);

        const response = await request.post(ENV.API_BASE_URL + 'api/workflows/pagination', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved all workflows`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get all workflows, status: ${response.status()}`);
            throw new Error(`Failed to get all workflows with status: ${response.status()}`);
        }
    }

    async getWorkflowsByStatus(request: APIRequestContext, status: string) {
        logger.info(`Getting workflows by status: ${status}`);

        const response = await request.get(ENV.API_BASE_URL + `api/workflows/status/${status}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflows by status`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflows by status, status: ${response.status()}`);
            throw new Error(`Failed to get workflows by status with status: ${response.status()}`);
        }
    }

    async getWorkflowsByUser(request: APIRequestContext, userId: string) {
        logger.info(`Getting workflows by user: ${userId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/workflows/user/${userId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflows by user`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflows by user, status: ${response.status()}`);
            throw new Error(`Failed to get workflows by user with status: ${response.status()}`);
        }
    }

    async executeWorkflow(request: APIRequestContext, workflowId: string, executionData: any, userId: string) {
        logger.info(`Executing workflow with ID: ${workflowId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/workflows/${workflowId}/execute`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: executionData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Workflow executed successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to execute workflow, status: ${response.status()}`);
            throw new Error(`Failed to execute workflow with status: ${response.status()}`);
        }
    }

    async getWorkflowExecution(request: APIRequestContext, executionId: string) {
        logger.info(`Getting workflow execution with ID: ${executionId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/workflows/executions/${executionId}`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflow execution`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflow execution, status: ${response.status()}`);
            throw new Error(`Failed to get workflow execution with status: ${response.status()}`);
        }
    }

    async getWorkflowExecutions(request: APIRequestContext, workflowId: string, paginationData: any) {
        logger.info(`Getting workflow executions for workflow: ${workflowId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/workflows/${workflowId}/executions`, {
            headers: {
                'Content-Type': 'application/json'
            },
            data: paginationData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflow executions`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflow executions, status: ${response.status()}`);
            throw new Error(`Failed to get workflow executions with status: ${response.status()}`);
        }
    }

    async cancelWorkflowExecution(request: APIRequestContext, executionId: string, userId: string) {
        logger.info(`Cancelling workflow execution with ID: ${executionId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/workflows/executions/${executionId}/cancel`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Workflow execution cancelled successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to cancel workflow execution, status: ${response.status()}`);
            throw new Error(`Failed to cancel workflow execution with status: ${response.status()}`);
        }
    }

    async getWorkflowSteps(request: APIRequestContext, workflowId: string) {
        logger.info(`Getting workflow steps for workflow: ${workflowId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/workflows/${workflowId}/steps`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflow steps`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflow steps, status: ${response.status()}`);
            throw new Error(`Failed to get workflow steps with status: ${response.status()}`);
        }
    }

    async addWorkflowStep(request: APIRequestContext, workflowId: string, stepData: any, userId: string) {
        logger.info(`Adding step to workflow: ${workflowId}`);

        const response = await request.post(ENV.API_BASE_URL + `api/workflows/${workflowId}/steps`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: stepData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Step added to workflow successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to add step to workflow, status: ${response.status()}`);
            throw new Error(`Failed to add step to workflow with status: ${response.status()}`);
        }
    }

    async updateWorkflowStep(request: APIRequestContext, workflowId: string, stepId: string, stepData: any, userId: string) {
        logger.info(`Updating step ${stepId} in workflow: ${workflowId}`);

        const response = await request.put(ENV.API_BASE_URL + `api/workflows/${workflowId}/steps/${stepId}`, {
            headers: {
                'Content-Type': 'application/json',
                'user-id': userId
            },
            data: stepData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Workflow step updated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to update workflow step, status: ${response.status()}`);
            throw new Error(`Failed to update workflow step with status: ${response.status()}`);
        }
    }

    async deleteWorkflowStep(request: APIRequestContext, workflowId: string, stepId: string, userId: string) {
        logger.info(`Deleting step ${stepId} from workflow: ${workflowId}`);

        const response = await request.delete(ENV.API_BASE_URL + `api/workflows/${workflowId}/steps/${stepId}`, {
            headers: {
                'user-id': userId
            }
        });

        if (response.ok()) {
            const responseText = await response.text();
            const responseData = responseText ? JSON.parse(responseText) : { message: 'Workflow step deleted successfully' };
            logger.info(`Workflow step deleted successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to delete workflow step, status: ${response.status()}`);
            throw new Error(`Failed to delete workflow step with status: ${response.status()}`);
        }
    }

    async validateWorkflow(request: APIRequestContext, workflowData: any) {
        logger.info(`Validating workflow:`, workflowData);

        const response = await request.post(ENV.API_BASE_URL + 'api/workflows/validate', {
            headers: {
                'Content-Type': 'application/json'
            },
            data: workflowData
        });

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Workflow validated successfully`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to validate workflow, status: ${response.status()}`);
            throw new Error(`Failed to validate workflow with status: ${response.status()}`);
        }
    }

    async getWorkflowLogs(request: APIRequestContext, executionId: string) {
        logger.info(`Getting workflow logs for execution: ${executionId}`);

        const response = await request.get(ENV.API_BASE_URL + `api/workflows/executions/${executionId}/logs`);

        if (response.ok()) {
            const responseData = await response.json();
            logger.info(`Successfully retrieved workflow logs`);
            return { status: response.status(), data: responseData };
        } else {
            logger.error(`Failed to get workflow logs, status: ${response.status()}`);
            throw new Error(`Failed to get workflow logs with status: ${response.status()}`);
        }
    }
}
