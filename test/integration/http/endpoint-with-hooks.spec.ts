import request from 'supertest';

import { webServer } from '@/infra/http/util';

const getServer = () => webServer().getServer();

const beCalledHookMock = jest.fn().mockImplementation((req, res, next) => {
  next();
});

describe('Endpoint With HTTP Adapter with hook', () => {
  beforeAll(async () => {
    const server = webServer();

    const router = server.router({
      baseUrl: '/v8'
    });

    router.use(beCalledHookMock);

    router.get('/cars', (request, reply) => {
      return reply.send({
        message: 'success'
      });
    });

    await server.ready();
  });

  it('should return 200 and call mock function defined', async () => {
    const response = await request(getServer()).get('/v8/cars');

    expect(beCalledHookMock).toHaveBeenCalled();
    expect(beCalledHookMock).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: 'success'
    });
  });
});
