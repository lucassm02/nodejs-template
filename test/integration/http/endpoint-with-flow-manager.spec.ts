import request from 'supertest';

import { httpServer } from '@/infra/http/utils';
import { httpAdapter } from '@/main/adapters';
import flowManager from '@/main/adapters/flow-manager';
import { HttpRequest } from '@/presentation/protocols';

const getServer = () => httpServer().getServer();

describe('Endpoint With Flow Manager', () => {
  const condition = [
    {
      when: (req: HttpRequest) => req.params.id === '1',
      handler: httpAdapter((_, res) => {
        res.status(200).send({ message: 'ConditionReached' });
      })
    },
    {
      handler: httpAdapter((_, res) => {
        res.status(200).send({ message: 'ConditionNotReached' });
      })
    }
  ];

  const notBeCalledMock = jest.fn();

  beforeAll(async () => {
    const server = httpServer();
    server.router().get('/test/:id', flowManager(...condition), () => {
      notBeCalledMock();
    });
    await server.ready();
  });

  it('should returns a 200 if a body message ConditionReached if pass the params as 1', async () => {
    const { statusCode, body } = await request(getServer()).get('/test/1');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      message: 'ConditionReached'
    });
  });

  it('should returns a 200 if a body message ConditionNotReached if pass the params as any value different of 1', async () => {
    const { statusCode, body } = await request(getServer()).get('/test/999');

    expect(statusCode).toBe(200);
    expect(body).toStrictEqual({
      message: 'ConditionNotReached'
    });
  });

  it('should not called the mock function at the last callback', async () => {
    await request(getServer()).get('/test/1');

    expect(notBeCalledMock).not.toHaveBeenCalled();
  });
});
