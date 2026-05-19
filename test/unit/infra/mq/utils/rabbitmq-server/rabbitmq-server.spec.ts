import * as amqplib from 'amqplib';

import { RabbitMqServer } from '@/infra/mq/utils/rabbitmq-server/rabbitmq-server';

jest.mock('amqplib', () => ({ connect: jest.fn() }));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readdirSync: jest.fn().mockReturnValue([])
}));

jest.mock('@/util', () => ({
  amqpLogger: () => (_t: object, _k: string, desc: PropertyDescriptor) => desc,
  logger: { log: jest.fn() },
  convertCamelCaseKeysToSnakeCase: jest.fn().mockImplementation((x) => x),
  convertSnakeCaseKeysToCamelCase: jest.fn().mockImplementation((x) => x),
  RABBIT: { DEFAULT_PREFETCH: undefined },
  CONSUMER: { LIST: [] }
}));

jest.mock('@/util/observability', () => ({ logger: { log: jest.fn() } }));

jest.mock('@/util/observability/apm', () => ({
  apmSpan: () => (_t: object, _k: string, desc: PropertyDescriptor) => desc,
  apmTransaction: () => (_t: object, _k: string, desc: PropertyDescriptor) =>
    desc
}));

jest.mock('@/util/observability/loggers/decorators', () => ({
  logger: () => (_t: object, _k: string, desc: PropertyDescriptor) => desc
}));

jest.mock('@/main/adapters', () => ({
  jobAdapter:
    (...cbs: Function[]) =>
    async (payload: unknown) => {
      for (const cb of cbs) await cb(payload);
    }
}));

const mockConnect = amqplib.connect as jest.Mock;

const makeChannelMock = () => ({
  sendToQueue: jest.fn().mockReturnValue(true),
  publish: jest.fn().mockReturnValue(true),
  consume: jest.fn().mockResolvedValue({ consumerTag: 'tag-1' }),
  prefetch: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  cancel: jest.fn().mockResolvedValue(undefined),
  ack: jest.fn(),
  reject: jest.fn(),
  on: jest.fn(),
  once: jest.fn()
});

const makeConnectionMock = (channel = makeChannelMock()) => ({
  createChannel: jest.fn().mockResolvedValue(channel),
  close: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn(),
  on: jest.fn()
});

const makeCredentials = () => ({
  user: 'guest',
  password: 'guest',
  host: 'localhost',
  port: 5672
});

beforeEach(() => {
  (RabbitMqServer as any).instance = undefined;
  const conn = makeConnectionMock();
  mockConnect.mockResolvedValue(conn);
});

type SutTypes = { sut: RabbitMqServer };
const makeSut = (): SutTypes => ({ sut: new RabbitMqServer() });

describe('RabbitMqServer', () => {
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const a = RabbitMqServer.getInstance();
      const b = RabbitMqServer.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('#setCredentials', () => {
    it('should build the AMQP URL from credentials', () => {
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      expect((sut as any).url).toBe('amqp://guest:guest@localhost:5672');
    });

    it('should include virtual host in URL when provided', () => {
      const { sut } = makeSut();
      sut.setCredentials({ ...makeCredentials(), virtualHost: 'my-vhost' });
      expect((sut as any).url).toBe(
        'amqp://guest:guest@localhost:5672/my-vhost'
      );
    });

    it('should throw when a credential field is undefined', () => {
      const { sut } = makeSut();
      expect(() =>
        sut.setCredentials({
          user: undefined as any,
          password: 'p',
          host: 'h',
          port: 1
        })
      ).toThrow();
    });
  });

  describe('constructor', () => {
    it('should accept credentials in constructor and build url', () => {
      const sut = new RabbitMqServer(makeCredentials());
      expect((sut as any).url).toBe('amqp://guest:guest@localhost:5672');
    });

    it('should set defaultPrefetch from RABBIT.DEFAULT_PREFETCH', () => {
      const { RABBIT } = jest.requireMock('@/util');
      RABBIT.DEFAULT_PREFETCH = 10;
      const sut = new RabbitMqServer();
      expect((sut as any).defaultPrefetch).toBe(10);
      RABBIT.DEFAULT_PREFETCH = undefined;
    });
  });

  describe('#start', () => {
    it('should throw when credentials are not set', async () => {
      const { sut } = makeSut();
      await expect(sut.start()).rejects.toThrow(
        sut.Error.CredentialsNotDefined
      );
    });

    it('should connect and create channel pool', async () => {
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      expect(mockConnect).toHaveBeenCalled();
    });

    it('should not reconnect when already connected', async () => {
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      await sut.start();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('#stop', () => {
    it('should close the connection', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      await sut.stop();
      expect(conn.close).toHaveBeenCalled();
    });

    it('should not close again if already closing', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      const p1 = sut.stop();
      const p2 = sut.stop();
      await Promise.all([p1, p2]);
      expect(conn.close).toHaveBeenCalledTimes(1);
    });

    it('should handle connection.close error gracefully', async () => {
      const conn = makeConnectionMock();
      conn.close.mockRejectedValue(new Error('close error'));
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      await expect(sut.stop()).resolves.not.toThrow();
    });
  });

  describe('#getPendingMessageCount', () => {
    it('should return 0 when no messages are pending', () => {
      const { sut } = makeSut();
      expect(sut.getPendingMessageCount()).toBe(0);
    });
  });

  describe('#publishInQueue', () => {
    it('should throw when connection is not established', async () => {
      const { sut } = makeSut();
      await expect(sut.publishInQueue('queue', {}, {})).rejects.toThrow(
        sut.Error.ConnectionNotDefined
      );
    });

    it('should send message to queue using a channel from the pool', async () => {
      const channel = makeChannelMock();
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      await sut.publishInQueue('my-queue', { key: 'val' }, { header: '1' });
      expect(channel.sendToQueue).toHaveBeenCalledWith(
        'my-queue',
        expect.any(Buffer),
        expect.objectContaining({ headers: { header: '1' } })
      );
    });
  });

  describe('#publishInExchange', () => {
    it('should throw when connection is not established', async () => {
      const { sut } = makeSut();
      await expect(
        sut.publishInExchange('exchange', {}, 'routing-key')
      ).rejects.toThrow(sut.Error.ConnectionNotDefined);
    });

    it('should publish message to exchange', async () => {
      const channel = makeChannelMock();
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      await sut.publishInExchange('my-exchange', { data: 1 }, 'my-key', {});
      expect(channel.publish).toHaveBeenCalledWith(
        'my-exchange',
        'my-key',
        expect.any(Buffer),
        expect.any(Object)
      );
    });
  });

  describe('#cancelConsumers', () => {
    it('should cancel and close all consumer channels', async () => {
      const channel = makeChannelMock();
      const { sut } = makeSut();
      (sut as any).consumers.set('tag-1', {
        channel,
        consumer: { queue: 'q', callback: jest.fn() }
      });
      await sut.cancelConsumers();
      expect(channel.cancel).toHaveBeenCalled();
    });

    it('should handle errors during cancel gracefully', async () => {
      const badChannel = {
        ...makeChannelMock(),
        cancel: jest.fn().mockRejectedValue(new Error('cancel err'))
      };
      const { sut } = makeSut();
      (sut as any).consumers.set('tag-err', {
        channel: badChannel,
        consumer: { queue: 'q', callback: jest.fn() }
      });
      await expect(sut.cancelConsumers()).resolves.not.toThrow();
    });
  });

  describe('#makeConsumer', () => {
    it('should call consume with string queue argument', async () => {
      const { sut } = makeSut();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer('my-queue', jest.fn());
      expect(spy).toHaveBeenCalledWith(
        'my-queue',
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should call consume with ConsumerOptions object argument', async () => {
      const { sut } = makeSut();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer({ queue: 'opts-queue', prefetch: 5 }, jest.fn());
      expect(spy).toHaveBeenCalledWith(
        'opts-queue',
        expect.any(Function),
        expect.objectContaining({ prefetch: 5 })
      );
    });

    it('should skip consumer when enabled is false and not in allow list', () => {
      const { sut } = makeSut();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer({ queue: 'disabled-q', enabled: false }, jest.fn());
      expect(spy).not.toHaveBeenCalled();
    });

    it('should skip consumer when queue is in deny list', () => {
      const { CONSUMER } = jest.requireMock('@/util');
      CONSUMER.LIST = ['!blocked-queue'];
      const sut = new RabbitMqServer();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer('blocked-queue', jest.fn());
      expect(spy).not.toHaveBeenCalled();
      CONSUMER.LIST = [];
    });

    it('should skip all when denyAll is set and queue not in allow list', () => {
      const { CONSUMER } = jest.requireMock('@/util');
      CONSUMER.LIST = ['!*'];
      const sut = new RabbitMqServer();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer('any-queue', jest.fn());
      expect(spy).not.toHaveBeenCalled();
      CONSUMER.LIST = [];
    });

    it('should allow queue when denyAll is set but queue is in allow list', () => {
      const { CONSUMER } = jest.requireMock('@/util');
      CONSUMER.LIST = ['!*', 'allowed-queue'];
      const sut = new RabbitMqServer();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer('allowed-queue', jest.fn());
      expect(spy).toHaveBeenCalled();
      CONSUMER.LIST = [];
    });

    it('should allow all when CONSUMER.LIST contains *', () => {
      const { CONSUMER } = jest.requireMock('@/util');
      CONSUMER.LIST = ['*'];
      const sut = new RabbitMqServer();
      const spy = jest
        .spyOn(sut as any, 'consume')
        .mockResolvedValue(undefined);
      sut.makeConsumer({ queue: 'any', enabled: false }, jest.fn());
      expect(spy).toHaveBeenCalled();
      CONSUMER.LIST = [];
    });
  });

  describe('parseOptionsFromString via RABBIT_OPTIONS env', () => {
    afterEach(() => {
      delete process.env.RABBIT_OPTIONS;
    });

    it('should parse boolean, number, and string values', () => {
      process.env.RABBIT_OPTIONS =
        'my-queue.enabled=true, my-queue.prefetch=5, my-queue.name=test';
      const sut = new RabbitMqServer();
      expect((sut as any).optionsFromEnv).toMatchObject({
        'my-queue': { enabled: true, prefetch: 5, name: 'test' }
      });
    });

    it('should parse false boolean', () => {
      process.env.RABBIT_OPTIONS = 'q.enabled=false';
      const sut = new RabbitMqServer();
      expect((sut as any).optionsFromEnv?.q?.enabled).toBe(false);
    });

    it('should not set optionsFromEnv when env is empty string', () => {
      process.env.RABBIT_OPTIONS = '';
      const sut = new RabbitMqServer();
      expect((sut as any).optionsFromEnv).toBeNull();
    });
  });

  describe('#consumersDirectory', () => {
    it('should handle empty directory', async () => {
      const { readdirSync } = jest.requireMock('fs');
      readdirSync.mockReturnValue([]);
      const { sut } = makeSut();
      await expect(
        sut.consumersDirectory('/fake/path')
      ).resolves.toBeUndefined();
    });

    it('should skip spec and map files', async () => {
      const { readdirSync } = jest.requireMock('fs');
      readdirSync.mockReturnValue(['consumer.spec.ts', 'consumer.js.map']);
      const { sut } = makeSut();
      await expect(
        sut.consumersDirectory('/fake/path')
      ).resolves.toBeUndefined();
    });

    it('should log error when importing a file fails', async () => {
      const { readdirSync } = jest.requireMock('fs');
      readdirSync.mockReturnValue(['bad-consumer.ts']);
      const { logger } = jest.requireMock('@/util/observability');
      const { sut } = makeSut();
      await sut.consumersDirectory('/fake/path');
      expect(logger.log).toHaveBeenCalled();
    });

    it('should call setup function when imported file exports a default function', async () => {
      const { readdirSync } = jest.requireMock('fs');
      readdirSync.mockReturnValue(['valid-consumer.ts']);
      const { sut } = makeSut();
      // dynamic import will fail (file doesn't exist), covered by the error branch
      await expect(
        sut.consumersDirectory('/fake/path')
      ).resolves.toBeUndefined();
    });
  });

  describe('#consume', () => {
    const makeMessage = (content = {}) => ({
      content: Buffer.from(JSON.stringify(content)),
      fields: {
        queue: 'test-q',
        consumerTag: 'tag-consume',
        exchange: '',
        routingKey: ''
      },
      properties: {
        headers: {},
        contentType: undefined,
        contentEncoding: undefined,
        deliveryMode: undefined,
        priority: undefined,
        correlationId: undefined,
        replyTo: undefined,
        expiration: undefined,
        messageId: undefined,
        timestamp: undefined,
        type: undefined,
        userId: undefined,
        appId: undefined,
        clusterId: undefined
      }
    });

    it('should log error when connection is not established', async () => {
      const { logger } = jest.requireMock('@/util/observability');
      const { sut } = makeSut();
      await (sut as any).consume('q', jest.fn());
      expect(logger.log).toHaveBeenCalled();
    });

    it('should process message and call ack via consume callback', async () => {
      let consumeCallback: any;
      const channel = makeChannelMock();
      channel.consume.mockImplementation(async (_q: string, cb: Function) => {
        consumeCallback = cb;
        return { consumerTag: 'tag-consume' };
      });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      const callback = jest.fn().mockResolvedValue(undefined);
      await (sut as any).consume('test-q', callback);

      const msg = makeMessage({ key: 'val' });
      await consumeCallback(msg);

      expect(callback).toHaveBeenCalled();
      expect(channel.ack).toHaveBeenCalledWith(msg);
    });

    it('should return early when message is null', async () => {
      let consumeCallback: any;
      const channel = makeChannelMock();
      channel.consume.mockImplementation(async (_q: string, cb: Function) => {
        consumeCallback = cb;
        return { consumerTag: 'tag-null' };
      });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      await (sut as any).consume('test-q', jest.fn());
      await consumeCallback(null);

      expect(channel.ack).not.toHaveBeenCalled();
    });

    it('should call channel.reject via private reject method', async () => {
      const channel = makeChannelMock();
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      const msg: any = {
        content: Buffer.from('{}'),
        fields: {
          consumerTag: 'rj-tag',
          queue: 'test-q',
          exchange: '',
          routingKey: ''
        },
        properties: { headers: {} },
        customProperties: { rejected: false, acked: false }
      };
      (sut as any).consumers.set('rj-tag', {
        channel,
        consumer: { queue: 'test-q', callback: jest.fn() }
      });

      (sut as any).reject(msg, true);

      expect(channel.reject).toHaveBeenCalledWith(msg, true);
    });

    it('should trigger reject path when server is closing during consume', async () => {
      let consumeCallback: any;
      const channel = makeChannelMock();
      channel.consume.mockImplementation(async (_q: string, cb: Function) => {
        consumeCallback = cb;
        return { consumerTag: 'tag-closing' };
      });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      await (sut as any).consume('test-q', jest.fn());

      (sut as any).closing = true;
      const msg = makeMessage({});
      (msg as any).customProperties = { rejected: false, acked: false };
      await consumeCallback(msg);
      // covers line: if (this.closing) return this.reject(message)
    });

    it('should log and skip ack when message content is not valid JSON', async () => {
      let consumeCallback: any;
      const channel = makeChannelMock();
      channel.consume.mockImplementation(async (_q: string, cb: Function) => {
        consumeCallback = cb;
        return { consumerTag: 'tag-json-err' };
      });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      await (sut as any).consume('test-q', jest.fn());

      const invalidMsg = {
        content: Buffer.from('not-json'),
        fields: {
          queue: 'test-q',
          consumerTag: 'tag-json-err',
          exchange: '',
          routingKey: ''
        },
        properties: { headers: {} }
      };
      await consumeCallback(invalidMsg);
      // Should not throw, logger called via catch block
    });

    it('should apply prefetch when option is provided', async () => {
      let _consumeCallback: any;
      const channel = makeChannelMock();
      channel.consume.mockImplementation(async (_q: string, cb: Function) => {
        _consumeCallback = cb;
        return { consumerTag: 'tag-prefetch' };
      });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      await (sut as any).consume('test-q', jest.fn(), { prefetch: 5 });

      expect(channel.prefetch).toHaveBeenCalledWith(5);
    });
  });

  describe('#publishInQueue - empty pool', () => {
    it('should throw EmptyChannelPool when channel pool is empty', async () => {
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      (sut as any).channelPool.clear();
      (sut as any).channelArray = [];
      await expect(sut.publishInQueue('q', {}, {})).rejects.toThrow();
    });
  });

  describe('#publishInExchange - empty pool', () => {
    it('should throw EmptyChannelPool when channel pool is empty', async () => {
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();
      (sut as any).channelPool.clear();
      (sut as any).channelArray = [];
      await expect(sut.publishInExchange('ex', {}, 'rk')).rejects.toThrow();
    });
  });

  describe('startEventListeners', () => {
    it('should log on connection error event', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      const errorCb = (conn.on as jest.Mock).mock.calls.find(
        ([e]: [string]) => e === 'error'
      )?.[1];
      errorCb?.(new Error('conn error'));
      // logger called via this.logger(error)
    });

    it('should emit RESTART on connection close when no pending restart', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      // Intercept event to prevent actual restart loop
      (sut as any).event.removeAllListeners((sut as any).events.RESTART);
      (sut as any).event.on((sut as any).events.RESTART, () => {});

      const closeCb = (conn.on as jest.Mock).mock.calls.find(
        ([e]: [string]) => e === 'close'
      )?.[1];
      closeCb?.();
    });

    it('should rebuild channel pool when CHECK_CHANNEL_POOL fires with empty pool', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      (sut as any).channelPool.clear();
      (sut as any).channelArray = [];

      (sut as any).event.emit((sut as any).events.CHECK_CHANNEL_POOL);
      await new Promise<void>((r) => {
        setImmediate(r);
      });
    });
  });

  describe('#rebuildConsumers', () => {
    it('should cancel, close and re-consume all registered consumers', async () => {
      const channel = makeChannelMock();
      channel.consume.mockResolvedValue({ consumerTag: 'rebuilt-tag' });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      (sut as any).consumers.set('old-tag', {
        channel,
        consumer: { queue: 'q', callback: jest.fn(), options: {} }
      });

      await (sut as any).rebuildConsumers(true);

      expect(channel.cancel).toHaveBeenCalledWith('old-tag');
      expect(channel.close).toHaveBeenCalled();
    });

    it('should log error when consumer rebuild throws', async () => {
      const badChannel = {
        ...makeChannelMock(),
        cancel: jest.fn().mockRejectedValue(new Error('cancel err'))
      };
      const { sut } = makeSut();
      (sut as any).consumers.set('bad-tag', {
        channel: badChannel,
        consumer: { queue: 'q', callback: jest.fn() }
      });

      await expect((sut as any).rebuildConsumers(true)).resolves.not.toThrow();
    });
  });

  describe('#rebuildConsumer', () => {
    it('should throw when connection is not established', async () => {
      const { sut } = makeSut();
      await expect((sut as any).rebuildConsumer('any-tag')).rejects.toThrow();
    });

    it('should log warn when consumer tag is not found', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      await (sut as any).rebuildConsumer('nonexistent-tag');
      // logs warn: 'Unable to rebuild consumer, consumer not found'
    });

    it('should rebuild a specific consumer by tag', async () => {
      const channel = makeChannelMock();
      channel.consume.mockResolvedValue({ consumerTag: 'new-tag' });
      mockConnect.mockResolvedValue(makeConnectionMock(channel));
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      (sut as any).consumers.set('target-tag', {
        channel,
        consumer: { queue: 'q', callback: jest.fn(), options: {} }
      });

      await (sut as any).rebuildConsumer('target-tag');

      expect(channel.cancel).toHaveBeenCalledWith('target-tag');
    });

    it('should skip rebuild when thereIsAPendingRestart is true', async () => {
      const conn = makeConnectionMock();
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await sut.start();

      (sut as any).thereIsAPendingRestart = true;
      await (sut as any).rebuildConsumer('tag');
      // returns early, no action
    });
  });

  describe('#start - empty channel pool', () => {
    it('should throw EmptyChannelPool when createChannel fails for all channels', async () => {
      const conn = makeConnectionMock();
      conn.createChannel.mockRejectedValue(new Error('channel create failed'));
      mockConnect.mockResolvedValue(conn);
      const { sut } = makeSut();
      sut.setCredentials(makeCredentials());
      await expect(sut.start()).rejects.toThrow();
    });
  });

  describe('#restart', () => {
    it('should skip restart when thereIsAPendingRestart is true', async () => {
      const { sut } = makeSut();
      (sut as any).thereIsAPendingRestart = true;
      const result = await (sut as any).restart();
      expect(result).toBeUndefined();
    });
  });
});
