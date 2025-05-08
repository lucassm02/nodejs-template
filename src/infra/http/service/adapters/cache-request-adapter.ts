import type { GenericCacheService } from '@/data/protocols/cache';
import type { Data, HttpClient, HttpResponse } from '@/data/protocols/http';
import { generateHashKeyToMemJs, logger } from '@/util';

type Services = 'memjs' | 'node-cache';

const DEFAULT_CACHE_SERVICE: Services = 'node-cache';
const DEFAULT_TTL_IN_MINUTES = 60;

const MAX_RESULT_SIZE = 1024 * 1024 * 1; // ~ 1 MB

export class CachedRequestAdapter implements HttpClient {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly cacheService: GenericCacheService,
    private readonly options: {
      cacheService?: Services;
      headersFields?: string[];
      ttl?: number;
    } = {}
  ) {}

  async request(data: Data): Promise<HttpResponse> {
    const key = this.generateCacheKey(data);
    const cachedResponse = await this.getCachedResponse(key);

    if (cachedResponse && Object.keys(cachedResponse).length > 1)
      return cachedResponse;

    const response = await this.httpClient.request(data);

    setImmediate(() => {
      this.saveToCache(key, response).catch((error) => {
        logger.log({
          message: `Cache save error: ${error.message}`,
          level: 'warn'
        });
      });
    });

    return response;
  }

  private generateCacheKey(data: Data): string {
    const method = data.method?.toUpperCase() || '';
    const { url } = data;
    const headers = this.getRelevantHeaders(data.headers);
    const body = this.normalizeBody(data.body);

    const keyObject = { method, url, headers, body };
    return generateHashKeyToMemJs(JSON.stringify(keyObject));
  }

  private getRelevantHeaders(
    headers?: Record<string, unknown>
  ): Record<string, string> {
    if (!headers || !this.options.headersFields?.length) return {};

    const relevantHeaders: Record<string, string> = {};

    for (let i = 0; i < this.options.headersFields.length; i++) {
      const field = this.options.headersFields[i];
      if (headers[field] !== undefined) {
        relevantHeaders[field] = String(headers[field]);
      }
    }

    return relevantHeaders;
  }

  private normalizeBody(body: unknown): unknown {
    if (typeof body !== 'object' || body === null || body === undefined)
      return body;
    return JSON.parse(JSON.stringify(body));
  }

  private async getCachedResponse(
    key: string
  ): Promise<HttpResponse | undefined> {
    try {
      if (this.getCacheService() === 'node-cache') {
        return this.cacheService.get(key);
      }
      const buffer = await this.cacheService.get(key);
      return buffer ? JSON.parse(buffer.toString()) : undefined;
    } catch (error) {
      logger.log({
        message: `Cache read error: ${error.message}`,
        level: 'warn'
      });
      return undefined;
    }
  }

  private async saveToCache(
    key: string,
    response: HttpResponse
  ): Promise<void> {
    const responseString = JSON.stringify(response);

    if (Buffer.byteLength(responseString) > MAX_RESULT_SIZE) {
      return;
    }

    if (this.getCacheService() === 'node-cache') {
      this.cacheService.set(key, response, this.getTtl());
    } else {
      await this.cacheService.set({
        key,
        value: responseString,
        ttl: this.getTtl()
      });
    }
  }

  private getCacheService(): Services {
    return this.options.cacheService || DEFAULT_CACHE_SERVICE;
  }

  private getTtl(): number {
    return this.options.ttl || DEFAULT_TTL_IN_MINUTES;
  }
}
