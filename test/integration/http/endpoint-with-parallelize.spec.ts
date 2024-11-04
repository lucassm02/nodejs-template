import request from 'supertest';

import { webServer } from '@/infra/http/util';
import { Middleware } from '@/presentation/protocols';
import { parallelize } from '@/main/adapters';

class MockMiddleware implements Middleware {
  async handle(
    _httpRequest: Middleware.HttpRequest,
    [_, setState]: Middleware.State,
    next: Function
  ): Middleware.Result {
    setState({
      foo: 'bar'
    });
    return next();
  }
}

const getServer = () => webServer().getServer();

const mockMiddleware = new MockMiddleware();
const mockMiddlewareSpy = jest.spyOn(mockMiddleware, 'handle');
const beCalledFunction = jest
  .fn()
  .mockImplementation(async (req, res, next) => {
    next();
  });
const beCalledFunctionToThrow = jest
  .fn()
  .mockImplementation(async (req, res, next) => {
    throw new Error();
  });

let sutState = {};

describe('Endpoint with parallelize ', () => {
  beforeAll(async () => {
    const server = webServer();

    const router = server.router({
      baseUrl: '/api/v1'
    });

    router.get(
      '/parallelize',
      parallelize(beCalledFunction, mockMiddleware, beCalledFunctionToThrow),
      (_request, reply, _next, [state]) => {
        sutState = state;
        return reply.send({
          message: 'success'
        });
      }
    );

    await server.ready();
  });
  it('should call all the middlewares and functions passed in the param', async () => {
    const response = await request(getServer()).get('/api/v1/parallelize');

    expect(beCalledFunction).toHaveBeenCalledTimes(1);
    expect(beCalledFunction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      [expect.any(Object), expect.any(Function)]
    );
    expect(beCalledFunctionToThrow).toHaveBeenCalledTimes(1);
    expect(beCalledFunctionToThrow).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      [expect.any(Object), expect.any(Function)]
    );

    expect(mockMiddlewareSpy).toHaveBeenCalledTimes(1);
    expect(mockMiddlewareSpy).toHaveBeenCalledWith(
      expect.any(Object),
      [expect.any(Object), expect.any(Function)],
      expect.any(Function)
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: 'success'
    });
  });
  it('should set then state object if some middlewares or function passed in the param use setState', async () => {
    const response = await request(getServer()).get('/api/v1/parallelize');

    expect(sutState).toStrictEqual({
      foo: 'bar'
    });
    expect(mockMiddlewareSpy).toHaveBeenCalledTimes(1);
    expect(mockMiddlewareSpy).toHaveBeenCalledWith(
      expect.any(Object),
      [expect.any(Object), expect.any(Function)],
      expect.any(Function)
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: 'success'
    });
  });
  it('should not throw if some middlewares or function passed throws', async () => {
    const response = await request(getServer()).get('/api/v1/parallelize');

    expect(sutState).toStrictEqual({
      foo: 'bar'
    });
    expect(beCalledFunction).toHaveBeenCalledTimes(1);
    expect(beCalledFunction).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      [expect.any(Object), expect.any(Function)]
    );
    expect(mockMiddlewareSpy).toHaveBeenCalledTimes(1);
    expect(mockMiddlewareSpy).toHaveBeenCalledWith(
      expect.any(Object),
      [expect.any(Object), expect.any(Function)],
      expect.any(Function)
    );
    expect(beCalledFunctionToThrow).toHaveBeenCalledTimes(1);
    expect(beCalledFunctionToThrow).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Function),
      [expect.any(Object), expect.any(Function)]
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      message: 'success'
    });
  });
});
