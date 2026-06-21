import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/** Нет REST-модуля audit в sep_erp_server — {@link APIPageObject.apiProbe}. */
export class AuditAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private t(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async createAuditEntry(request: APIRequestContext, auditData: any, accessToken?: string) {
    logger.info(`createAuditEntry (probe)`);
    return this.apiProbe(request, 'Audit.createAuditEntry', auditData, this.t(accessToken));
  }

  async getAuditLogs(request: APIRequestContext, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditLogs', {}, this.t(accessToken));
  }

  async getAuditLogById(request: APIRequestContext, auditId: string, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditLogById', { auditId }, this.t(accessToken));
  }

  async getAuditLogsByUser(request: APIRequestContext, userId: string, auditData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditLogsByUser', { userId, auditData }, this.t(accessToken));
  }

  async getAuditLogsByAction(request: APIRequestContext, action: string, auditData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditLogsByAction', { action, auditData }, this.t(accessToken));
  }

  async getAuditLogsByResource(request: APIRequestContext, resource: string, auditData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditLogsByResource', { resource, auditData }, this.t(accessToken));
  }

  async getAuditLogsByDateRange(request: APIRequestContext, dateRange: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditLogsByDateRange', dateRange, this.t(accessToken));
  }

  async exportAuditLogs(request: APIRequestContext, exportData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.exportAuditLogs', exportData, this.t(accessToken));
  }

  async getAuditStatistics(request: APIRequestContext, statsData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditStatistics', statsData, this.t(accessToken));
  }

  async getAuditDashboard(request: APIRequestContext, dashboardData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAuditDashboard', dashboardData, this.t(accessToken));
  }

  async createAuditRule(request: APIRequestContext, ruleData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.createAuditRule', ruleData, this.t(accessToken));
  }

  async updateAuditRule(request: APIRequestContext, ruleId: string, ruleData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.updateAuditRule', { ruleId, ruleData }, this.t(accessToken));
  }

  async deleteAuditRule(request: APIRequestContext, ruleId: string, accessToken?: string) {
    return this.apiProbe(request, 'Audit.deleteAuditRule', { ruleId }, this.t(accessToken));
  }

  async getAllAuditRules(request: APIRequestContext, paginationData: any, accessToken?: string) {
    return this.apiProbe(request, 'Audit.getAllAuditRules', paginationData, this.t(accessToken));
  }
}
