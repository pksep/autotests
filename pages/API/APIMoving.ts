import { APIRequestContext, Page } from '@playwright/test';
import { APIPageObject } from '../../lib/APIPage';
import { ENV } from '../../config';

export class MovingAPI extends APIPageObject {
  constructor(page: Page | null) {
    super(page as any);
  }

  private base = () => ENV.API_BASE_URL + 'api/moving';

  async getAllMoving(request: APIRequestContext, accessToken?: string) {
    return this.apiRequest(request, 'GET', this.base() + '/', { accessToken });
  }

  async createMoving(request: APIRequestContext, dto: Record<string, unknown>, accessToken?: string) {
    const response = await request.post(this.base() + '/', {
      headers: {
        compress: 'no-compress',
        ...this.authHeaders(accessToken),
      },
      multipart: this.toMultipartFields(dto),
    });
    return this.apiResult(response);
  }
}
