import http, { Server, createServer } from 'http';
import https from 'https';
import axios, { AxiosInstance } from 'axios';

import { RequestAdapter } from '@/infra/http/service';

const PORT = '3333';

type SutType = {
  sut: RequestAdapter;
  axiosInstance: AxiosInstance;
};

type FactoryParams = { httpAgent?: http.Agent; httpsAgent?: https.Agent };

const makeSut = (params?: FactoryParams): SutType => {
  const axiosInstance = axios.create({
    baseURL: `http://localhost:${PORT}`
  });

  const sut = new RequestAdapter(
    axiosInstance,
    params?.httpAgent,
    params?.httpsAgent
  );
  return {
    axiosInstance,
    sut
  };
};

describe('RequestAdapter', () => {
  let server: Server;
  beforeAll(async () => {
    server = createServer(async (_, reply) => {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve('');
        }, 1000);
      });

      reply.statusCode = 200;
      reply.setHeader('Content-Type', 'application/json');

      reply.end(JSON.stringify({}));
    }).listen(PORT);
  });
  afterAll(() => {
    server.close();
  });

  it('should call axios instance and returns a 200 as status code', async () => {
    const { sut } = makeSut();

    const response = await sut.request({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({});
  });

  it('should call axios instance with an custom http agent at DI, should throws a timeout exception', async () => {
    const mockOptions = {
      timeout: 100
    };

    const { sut } = makeSut({
      httpAgent: new http.Agent(mockOptions),
      httpsAgent: new https.Agent(mockOptions)
    });

    const { headers } = await sut.request({
      method: 'GET',
      url: '/'
    });

    expect(headers.connection).toBe('close');
    expect(headers['content-length']).toBe('2');
  });

  it('should call axios instance with an custom http agent at request method, should throws a timeout exception', async () => {
    const mockOptions = {
      timeout: 100
    };

    const { sut } = makeSut();

    const { headers } = await sut.request({
      method: 'GET',
      url: '/',
      httpAgent: new http.Agent(mockOptions),
      httpsAgent: new https.Agent(mockOptions)
    });

    expect(headers.connection).toBe('close');
    expect(headers['content-length']).toBe('2');
  });
});
