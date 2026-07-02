import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';
import logger from '../../lib/utils/logger';

export class CommentsAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/comments';

  private token(accessToken?: string) {
    return accessToken && accessToken !== 'invalid_user' && !/^\d+$/.test(accessToken) ? accessToken : undefined;
  }

  private jsonHeaders(accessToken?: string) {
    return {
      'Content-Type': 'application/json',
      compress: 'no-compress',
      ...this.authHeaders(this.token(accessToken)),
    };
  }

  private async result(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    return { status: response.status(), data: await this.parseJsonBody(response) };
  }

  async getByEntity(request: APIRequestContext, entityType: string, entityId: number, page = 0, limit = 20, accessToken?: string) {
    logger.info(`Getting comments by entity ${entityType}:${entityId}`);

    const response = await request.get(this.base() + `/by-entity/${encodeURIComponent(entityType)}/${entityId}?page=${page}&limit=${limit}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async getByThread(request: APIRequestContext, threadId: string, accessToken?: string) {
    logger.info(`Getting comments by thread ${threadId}`);

    const response = await request.get(this.base() + `/by-thread/${encodeURIComponent(threadId)}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async createComment(request: APIRequestContext, commentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Creating comment with data:`, commentData);

    const response = await request.post(this.base() + '/create', {
      headers: this.jsonHeaders(accessToken),
      data: commentData,
    });

    return this.result(response);
  }

  async updateComment(request: APIRequestContext, id: string, commentData: Record<string, unknown>, accessToken?: string) {
    logger.info(`Updating comment ${id}`);

    const response = await request.put(this.base() + `/${encodeURIComponent(id)}`, {
      headers: this.jsonHeaders(accessToken),
      data: commentData,
    });

    return this.result(response);
  }

  async pinComment(request: APIRequestContext, id: string, accessToken?: string) {
    logger.info(`Pinning comment ${id}`);

    const response = await request.put(this.base() + `/${encodeURIComponent(id)}/pin`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async unpinComment(request: APIRequestContext, id: string, accessToken?: string) {
    logger.info(`Unpinning comment ${id}`);

    const response = await request.put(this.base() + `/${encodeURIComponent(id)}/unpin`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }

  async deleteComment(request: APIRequestContext, id: string, accessToken?: string) {
    logger.info(`Deleting comment ${id}`);

    const response = await request.delete(this.base() + `/${encodeURIComponent(id)}`, {
      headers: { compress: 'no-compress', ...this.authHeaders(this.token(accessToken)) },
    });

    return this.result(response);
  }
}
