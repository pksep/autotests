import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет соответствующего контроллера в sep_erp_server — вызовы через {@link APIPageObject.apiProbe}. */
export class WorkflowsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  async createWorkflow(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'createWorkflow', args };
    return this.apiProbe(request, 'WorkflowsAPI.createWorkflow', payload, accessToken);
  }

  async updateWorkflow(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateWorkflow', args };
    return this.apiProbe(request, 'WorkflowsAPI.updateWorkflow', payload, accessToken);
  }

  async getWorkflowById(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowById', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowById', payload, accessToken);
  }

  async deleteWorkflow(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteWorkflow', args };
    return this.apiProbe(request, 'WorkflowsAPI.deleteWorkflow', payload, accessToken);
  }

  async getAllWorkflows(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getAllWorkflows', args };
    return this.apiProbe(request, 'WorkflowsAPI.getAllWorkflows', payload, accessToken);
  }

  async getWorkflowsByStatus(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowsByStatus', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowsByStatus', payload, accessToken);
  }

  async getWorkflowsByUser(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowsByUser', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowsByUser', payload, accessToken);
  }

  async executeWorkflow(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'executeWorkflow', args };
    return this.apiProbe(request, 'WorkflowsAPI.executeWorkflow', payload, accessToken);
  }

  async getWorkflowExecution(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowExecution', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowExecution', payload, accessToken);
  }

  async getWorkflowExecutions(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowExecutions', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowExecutions', payload, accessToken);
  }

  async cancelWorkflowExecution(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'cancelWorkflowExecution', args };
    return this.apiProbe(request, 'WorkflowsAPI.cancelWorkflowExecution', payload, accessToken);
  }

  async getWorkflowSteps(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowSteps', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowSteps', payload, accessToken);
  }

  async addWorkflowStep(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'addWorkflowStep', args };
    return this.apiProbe(request, 'WorkflowsAPI.addWorkflowStep', payload, accessToken);
  }

  async updateWorkflowStep(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'updateWorkflowStep', args };
    return this.apiProbe(request, 'WorkflowsAPI.updateWorkflowStep', payload, accessToken);
  }

  async deleteWorkflowStep(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'deleteWorkflowStep', args };
    return this.apiProbe(request, 'WorkflowsAPI.deleteWorkflowStep', payload, accessToken);
  }

  async validateWorkflow(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'validateWorkflow', args };
    return this.apiProbe(request, 'WorkflowsAPI.validateWorkflow', payload, accessToken);
  }

  async getWorkflowLogs(request: APIRequestContext, ...args: any[]) {
    const last = args[args.length - 1];
    const accessToken =
      typeof last === 'string' && last !== 'invalid_user' && (last.startsWith('ey') || last.startsWith('Bearer'))
        ? (args.pop(), last)
        : undefined;
    const payload = { method: 'getWorkflowLogs', args };
    return this.apiProbe(request, 'WorkflowsAPI.getWorkflowLogs', payload, accessToken);
  }
}
