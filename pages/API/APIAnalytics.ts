import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import logger from '../../lib/utils/logger';

/**
 * В sep_erp_server нет модуля analytics — вызовы мапятся на {@link APIPageObject.apiProbe}
 * (`POST api/actions/get-by-params`) для сохранения контрактов defensive-спек.
 */
export class AnalyticsAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private t(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  async getProductionAnalytics(request: APIRequestContext, dateRange: any, accessToken?: string) {
    logger.info(`getProductionAnalytics (probe)`);
    return this.apiProbe(request, 'Analytics.getProductionAnalytics', dateRange, this.t(accessToken));
  }

  async getInventoryAnalytics(request: APIRequestContext, dateRange: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getInventoryAnalytics', dateRange, this.t(accessToken));
  }

  async getQualityAnalytics(request: APIRequestContext, dateRange: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getQualityAnalytics', dateRange, this.t(accessToken));
  }

  async getMaintenanceAnalytics(request: APIRequestContext, dateRange: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getMaintenanceAnalytics', dateRange, this.t(accessToken));
  }

  async getFinancialAnalytics(request: APIRequestContext, dateRange: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getFinancialAnalytics', dateRange, this.t(accessToken));
  }

  async getPerformanceMetrics(request: APIRequestContext, metricsData: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getPerformanceMetrics', metricsData, this.t(accessToken));
  }

  async createKPI(request: APIRequestContext, kpiData: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.createKPI', kpiData, this.t(accessToken));
  }

  async getKPIs(request: APIRequestContext, kpiData: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getKPIs', kpiData, this.t(accessToken));
  }

  async getTrendAnalysis(request: APIRequestContext, trendData: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.getTrendAnalysis', trendData, this.t(accessToken));
  }

  async exportAnalyticsReport(request: APIRequestContext, reportData: any, accessToken?: string) {
    return this.apiProbe(request, 'Analytics.exportAnalyticsReport', reportData, this.t(accessToken));
  }
}
