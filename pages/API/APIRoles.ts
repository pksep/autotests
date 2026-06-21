import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

/** `api/roles/*` — Nest `RolesController` (sep_erp_server). */
export class RolesAPI extends APIPageObject {
  constructor(page: Page) {
    super(page);
  }

  private base = () => ENV.API_BASE_URL + 'api/roles';

  /** Resolves JWT: optional 4th arg wins; else 3rd if it looks like a JWT; `invalid_user` → no auth. */
  private resolveToken(p3?: string, p4?: string): string | undefined {
    const raw = p4 ?? (p3 && p3 !== 'invalid_user' && (p3.startsWith('ey') || p3.startsWith('Bearer')) ? p3 : undefined);
    if (!raw || raw === 'invalid_user') return undefined;
    return raw;
  }

  async createRole(request: APIRequestContext, roleData: any, userId?: string, authToken?: string) {
    logger.info(`POST roles`);
    const token = this.resolveToken(userId, authToken);
    const response = await request.post(this.base(), {
      headers: {
        accept: '*/*',
        compress: 'no-compress',
        'Content-Type': 'application/json',
        ...this.authHeaders(token),
      },
      data: roleData,
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async getAllRoles(request: APIRequestContext, authToken?: string) {
    logger.info(`GET roles`);
    const response = await request.get(this.base(), {
      headers: { compress: 'no-compress', ...this.authHeaders(authToken) },
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async getRoleByName(request: APIRequestContext, name: string, authToken?: string) {
    logger.info(`GET roles/:name`);
    const response = await request.get(this.base() + `/${encodeURIComponent(name)}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(authToken) },
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async updateRoleAccess(request: APIRequestContext, accessData: any, userId?: string, authToken?: string) {
    logger.info(`POST roles/accesses`);
    const token = this.resolveToken(userId, authToken);
    const response = await request.post(this.base() + '/accesses', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(token),
      },
      data: accessData,
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async checkRoleNameUnique(request: APIRequestContext, nameData: any, authToken?: string) {
    logger.info(`POST roles/name/unique`);
    const response = await request.post(this.base() + '/name/unique', {
      headers: {
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(authToken),
      },
      data: nameData,
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async getRoleById(request: APIRequestContext, id: string, authToken?: string) {
    logger.info(`GET roles/one/:id`);
    const response = await request.get(this.base() + `/one/${encodeURIComponent(id)}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(authToken) },
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async deleteRole(request: APIRequestContext, roleId: string, userId?: string, authToken?: string) {
    logger.info(`DELETE roles/:id`);
    const token = this.resolveToken(userId, authToken);
    const response = await request.delete(this.base() + `/${encodeURIComponent(roleId)}`, {
      headers: { accept: '*/*', compress: 'no-compress', ...this.authHeaders(token) },
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }

  async updateRole(request: APIRequestContext, roleData: any, userId?: string, authToken?: string) {
    logger.info(`POST roles/update`);
    const token = this.resolveToken(userId, authToken);
    const response = await request.post(this.base() + '/update', {
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
        compress: 'no-compress',
        ...this.authHeaders(token),
      },
      data: roleData,
    });
    const responseData = await this.parseJsonBody(response);
    return { status: response.status(), data: responseData };
  }
}
