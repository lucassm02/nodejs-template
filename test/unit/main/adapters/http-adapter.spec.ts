import { webServer } from '@/infra/http/util/web-server/factory';
import {
  REPLY_KEY,
  REQUEST_KEY,
  STATE_KEY
} from '@/infra/http/util/web-server/types';
import { httpAdapter } from '@/main/adapters';
import makeFlow from '@/main/adapters/flow-adapter';
import { DICTIONARY } from '@/util';

describe('httpAdapter', () => {
  it('should append a value each time a next interation is called', async () => {
    const arr: number[] = [];

    const flow = makeFlow({
      [REQUEST_KEY]: {},
      [STATE_KEY]: {},
      [REPLY_KEY]: jest.fn()
    });

    await flow(
      webServer().adapter(
        httpAdapter(
          (_req, _res, next) => {
            arr.push(1);
            next();
          },
          (_req, _res, next) => {
            arr.push(2);
            next();
          },
          () => {
            arr.push(3);
          }
        )
      )
    )();

    expect(arr).toHaveLength(3);
  });

  it('should interupt the interation when return an object of response at any callback', async () => {
    const arr: number[] = [];

    const sendMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ send: sendMock });
    const flow = makeFlow({
      [REQUEST_KEY]: {},
      [STATE_KEY]: {},
      [REPLY_KEY]: {
        status: statusMock
      }
    });

    await flow(
      webServer().adapter(
        httpAdapter(
          (_req, _res, next) => {
            arr.push(1);
            next();
          },
          (_req, _res, next) => {
            arr.push(2);
            return {
              statusCode: 200,
              body: {
                message: 'Interrupted'
              }
            };
          },
          () => {
            arr.push(3);
          }
        )
      )
    )();

    expect(arr).toHaveLength(2);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(sendMock).toHaveBeenCalledWith({
      message: 'Interrupted'
    });
  });

  it('should interupt the interation when return not an object of response at any callback and returns an internal implementation error to the client', async () => {
    const arr: number[] = [];

    const sendMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ send: sendMock });
    const flow = makeFlow({
      [REQUEST_KEY]: {},
      [STATE_KEY]: {},
      [REPLY_KEY]: {
        status: statusMock
      }
    });

    await flow(
      webServer().adapter(
        httpAdapter(
          (_req, _res, next) => {
            arr.push(1);
            next();
          },
          (_req, _res, next) => {
            arr.push(2);
            return {};
          },
          () => {
            arr.push(3);
          }
        )
      )
    )();

    expect(arr).toHaveLength(2);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith({
      error: DICTIONARY.RESPONSE.MESSAGE.INTERNAl.INCORRECT_CALLBACK_RETURN
    });
  });
});
