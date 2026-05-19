import memjs from 'memjs';

import { CacheServer } from '@/infra/cache/cache-server';

jest.mock('memjs');

const makeMemjsClientMock = () => ({
  set: jest.fn().mockResolvedValue(true),
  add: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  get: jest.fn().mockResolvedValue({ value: Buffer.from('{"key":"val"}') }),
  delete: jest.fn().mockResolvedValue(true),
  close: jest.fn()
});

let memjsClientMock: ReturnType<typeof makeMemjsClientMock>;

beforeEach(() => {
  memjsClientMock = makeMemjsClientMock();
  (memjs.Client.create as jest.Mock).mockReturnValue(memjsClientMock);
  (CacheServer as any).instance = undefined;
});

type SutTypes = { sut: CacheServer };
const makeSut = (): SutTypes => ({ sut: new CacheServer() });

describe('CacheServer', () => {
  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const a = CacheServer.getInstance();
      const b = CacheServer.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('setCredentials', () => {
    it('should accept a single Connection object', () => {
      const { sut } = makeSut();
      expect(() =>
        sut.setCredentials({ host: 'localhost', port: 11211 })
      ).not.toThrow();
    });

    it('should accept an array of Connection objects', () => {
      const { sut } = makeSut();
      expect(() =>
        sut.setCredentials([
          { host: 'h1', port: 11211 },
          { host: 'h2', port: 11211 }
        ])
      ).not.toThrow();
    });

    it('should accept spread Connection objects', () => {
      const { sut } = makeSut();
      expect(() =>
        sut.setCredentials(
          { host: 'h1', port: 11211 },
          { host: 'h2', port: 11211 }
        )
      ).not.toThrow();
    });

    it('should accept positional args (host, port, user, password)', () => {
      const { sut } = makeSut();
      expect(() =>
        sut.setCredentials('localhost', 11211, 'user', 'pass')
      ).not.toThrow();
    });

    it('should include credentials in connection string when user and password provided', async () => {
      const { sut } = makeSut();
      sut.setCredentials({
        host: 'localhost',
        port: 11211,
        user: 'u',
        password: 'p'
      });
      memjsClientMock.set.mockResolvedValueOnce(true);
      await sut.connect();
      expect(memjs.Client.create).toHaveBeenCalledWith(
        'u:p@localhost:11211',
        expect.any(Object)
      );
    });
  });

  describe('connect', () => {
    it('should create a memjs client and ping', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });

      await sut.connect();

      expect(memjs.Client.create).toHaveBeenCalledWith(
        'localhost:11211',
        expect.any(Object)
      );
      expect(memjsClientMock.set).toHaveBeenCalledWith('__ping__', 'ok', {
        expires: 1
      });
    });

    it('should throw when credentials are not set', async () => {
      const { sut } = makeSut();
      await expect(sut.connect()).rejects.toThrow(
        sut.Error.CREDENTIALS_NOT_DEFINED
      );
    });

    it('should not reconnect if already connected', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();
      await sut.connect();
      expect(memjs.Client.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should call server.close', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();
      sut.disconnect();
      expect(memjsClientMock.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('get', () => {
    it('should throw when not connected', async () => {
      const { sut } = makeSut();
      await expect(sut.get('key')).rejects.toThrow(sut.Error.CONNECTION_ERROR);
    });

    it('should return undefined when key not found', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();
      memjsClientMock.get.mockResolvedValueOnce({ value: null });

      const result = await sut.get('missing');
      expect(result).toBeUndefined();
    });

    it('should return parsed JSON when parseToJson is true', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();
      memjsClientMock.get.mockResolvedValueOnce({
        value: Buffer.from('{"a":1}')
      });

      const result = await sut.get('key', { parseToJson: true });
      expect(result).toEqual({ a: 1 });
    });

    it('should return Buffer when parseToJson is false', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();
      memjsClientMock.get.mockResolvedValueOnce({ value: Buffer.from('raw') });

      const result = await sut.get('key', { parseToJson: false });
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });

  describe('set', () => {
    it('should throw when not connected', async () => {
      const { sut } = makeSut();
      await expect(sut.set('key', 'value')).rejects.toThrow(
        sut.Error.CONNECTION_ERROR
      );
    });

    it('should call server.add with key and value', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();

      await sut.set('mykey', 'myvalue');

      expect(memjsClientMock.add).toHaveBeenCalledWith(
        'mykey',
        'myvalue',
        undefined
      );
    });

    it('should call server.add with object value serialized to JSON', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();

      await sut.set('k', { foo: 'bar' });

      expect(memjsClientMock.add).toHaveBeenCalledWith(
        'k',
        '{"foo":"bar"}',
        undefined
      );
    });

    it('should accept SetOption object overload', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();

      await sut.set({ key: 'k', value: 'v', ttl: 60 });

      expect(memjsClientMock.add).toHaveBeenCalledWith('k', 'v', {
        expires: 60
      });
    });
  });

  describe('replace', () => {
    it('should call server.replace with key and value', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();

      await sut.replace('k', 'v');

      expect(memjsClientMock.replace).toHaveBeenCalledWith('k', 'v', undefined);
    });
  });

  describe('delete', () => {
    it('should throw when not connected', async () => {
      const { sut } = makeSut();
      await expect(sut.delete('key')).rejects.toThrow(
        sut.Error.CONNECTION_ERROR
      );
    });

    it('should call server.delete', async () => {
      const { sut } = makeSut();
      sut.setCredentials({ host: 'localhost', port: 11211 });
      await sut.connect();

      await sut.delete('mykey');

      expect(memjsClientMock.delete).toHaveBeenCalledWith('mykey');
    });
  });
});
