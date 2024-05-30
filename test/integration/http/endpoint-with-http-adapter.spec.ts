import request from 'supertest';

import { httpServer } from '@/infra/http/utils';
import { httpAdapter } from '@/main/adapters';

const getServer = () => httpServer().getServer();

describe('Endpoint With HTTP Adapter', () => {
  const notBeCalledMock = jest.fn();
  const beCalledMock = jest.fn();
  beforeAll(async () => {
    const server = httpServer();
    server.router().get(
      '/test/:id',
      httpAdapter(
        (_req, _res, next) => {
          beCalledMock();
          next();
        },
        (_, res) => {
          res.status(200).send({
            message: 'ReachHttpAdapter'
          });
        }
      ),
      () => {
        notBeCalledMock();
      }
    );
    await server.ready();
  });

  it('should returns a 200 if a body message ReachHttpAdapter', async () => {
    const { statusCode, body } = await request(getServer()).get('/test/1');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      message: 'ReachHttpAdapter'
    });
  });

  it('should called the mock function at the fist callback used in  the httpAdapter arguments', async () => {
    await request(getServer()).get('/test/999');

    expect(beCalledMock).toHaveBeenCalledTimes(1);
    expect(beCalledMock).toHaveBeenCalledWith();
  });

  it('should not called the mock function at the last callback', async () => {
    await request(getServer()).get('/test/1');

    expect(notBeCalledMock).not.toHaveBeenCalled();
  });
});
