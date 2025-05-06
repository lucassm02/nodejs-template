import makeFlow from '@/main/adapters/flow-adapter';
import { webServer } from '@/infra/http/util';
import flowManager, { httpAdapter } from '@/main/adapters/flow-manager';
import {
  REPLY_KEY,
  REQUEST_KEY,
  STATE_KEY
} from '@/infra/http/util/web-server/types';
import { HttpRequest } from '@/presentation/protocols';

describe('flowManager', () => {
  const condition = [
    {
      when: (req: HttpRequest) => req.body.name === 'John',
      handler: httpAdapter((_, res) => {
        res.status(200).send({ name: 'John' });
      })
    },
    {
      handler: httpAdapter((_, res) => {
        res.status(200).send({ error: 'not John' });
      })
    }
  ];
  it('should call the correct interation with pass the correct args to the condition at when', async () => {
    const sendMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ send: sendMock });

    const flow = makeFlow({
      [REQUEST_KEY]: {
        body: { name: 'John' }
      },
      [STATE_KEY]: {},
      [REPLY_KEY]: {
        status: statusMock
      }
    });

    await flow(webServer().adapter(flowManager(condition)))();

    expect(statusMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      name: 'John'
    });
  });

  it('should call the correct interation with pass the incorrect args to the condition at when', async () => {
    const sendMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ send: sendMock });

    const flow = makeFlow({
      [REQUEST_KEY]: {
        body: { name: 'any_name' }
      },
      [STATE_KEY]: {},
      [REPLY_KEY]: {
        status: statusMock
      }
    });

    await flow(webServer().adapter(flowManager(condition)))();

    expect(statusMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({
      error: 'not John'
    });
  });
});
