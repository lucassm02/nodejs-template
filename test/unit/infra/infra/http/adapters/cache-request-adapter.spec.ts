import type { GenericCacheService } from '@/data/protocols/cache';
import type { Data, HttpClient } from '@/data/protocols/http';
import { makeNodeCache } from '@/infra/cache';
import { CachedRequestAdapter } from '@/infra/http/service';

const PORT = '3334';

type SutType = {
  sut: CachedRequestAdapter;
  cacheService: GenericCacheService;
  httpClient: HttpClient;
};

type FactoryParams = {
  cacheService?: 'node-cache' | 'memjs';
  headersFields?: string[];
  ttl?: number;
};

const makeSut = (params?: FactoryParams): SutType => {
  const mockHttpClient = (): HttpClient => ({
    request: jest.fn().mockImplementation(async (data: Data) => ({
      statusCode: 200,
      body: { url: data.url },
      headers: {}
    }))
  });

  const cacheService = makeNodeCache();
  const httpClient = mockHttpClient();

  return {
    sut: new CachedRequestAdapter(httpClient, cacheService, {
      cacheService: params?.cacheService,
      headersFields: params?.headersFields,
      ttl: params?.ttl
    }),
    cacheService,
    httpClient
  };
};

// Mock implementations

describe('CachedRequestAdapter', () => {
  it('should return cached response for identical requests', async () => {
    const { sut } = makeSut();
    const data = { method: 'GET', url: `http://localhost:${PORT}` };

    await sut.request(data);
    const response = await sut.request(data);

    expect(response.body).toHaveProperty('url', `http://localhost:${PORT}`);
  });

  it('should generate different keys for different headers', async () => {
    const { sut, httpClient } = makeSut({ headersFields: ['x-auth'] });

    const spyOnRequest = jest.spyOn(httpClient, 'request');

    const request1 = {
      method: 'GET',
      url: '/secure',
      headers: { 'x-auth': 'token1' }
    };

    const request2 = {
      method: 'GET',
      url: '/secure',
      headers: { 'x-auth': 'token2' }
    };

    await sut.request(request1);
    await sut.request(request2);

    expect(spyOnRequest).toHaveBeenCalledTimes(2);
  });

  it('should respect TTL configuration', async () => {
    const ttl = 1; // 1 second
    const { sut, httpClient } = makeSut({ ttl });

    const spyOnRequest = jest.spyOn(httpClient, 'request');

    await sut.request({ method: 'GET', url: '/test' });
    await new Promise((resolve) => {
      setTimeout(resolve, 1500);
    });
    await sut.request({ method: 'GET', url: '/test' });

    expect(spyOnRequest).toHaveBeenCalledTimes(2);
  });

  it('should handle cache server errors gracefully', async () => {
    const { sut, cacheService } = makeSut({ cacheService: 'memjs' });

    jest
      .spyOn(cacheService, 'get')
      .mockRejectedValueOnce(new Error('Cache error') as never);

    const response = await sut.request({ method: 'GET', url: '/error' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('url', '/error');
  });
});
