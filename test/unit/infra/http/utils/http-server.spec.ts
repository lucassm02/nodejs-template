import fastify from 'fastify';

import { HttpServer } from '@/infra/http/utils/http-server/http-server';
import { Route } from '@/infra/http/utils/http-server/route';

const register = jest.fn();
const ready = jest.fn().mockImplementation((callback) => {
  if (callback) callback();
});
const close = jest.fn().mockImplementation((callback) => {
  if (callback) callback();
});
const decorateRequest = jest.fn();

const server = {
  listen: jest.fn(),
  address: jest.fn().mockReturnValue('http://127.0.0.1'),
  close
};

const fastifyMock = () => ({
  register,
  ready,
  close,
  decorateRequest,
  server
});

type SutType = {
  sut: HttpServer;
};

const makeSut = (): SutType => {
  const sut = new HttpServer(fastifyMock as unknown as typeof fastify);
  return { sut };
};

describe('HttpServer', () => {
  describe('#use', () => {
    it('should call fastify.register with the correct params', () => {
      const { sut } = makeSut();
      sut.use(function () {}, { any: 'foo' });
      expect(register).toHaveBeenCalledTimes(1);
      expect(register).toHaveBeenCalledWith(expect.any(Function), {
        any: 'foo'
      });
    });
  });
  describe('address', () => {
    it('should return an valid address info if serving is listen', () => {
      const { sut } = makeSut();

      sut.listen(8080);

      const address = sut.address();

      expect(ready).toHaveBeenCalledTimes(1);

      expect(address).toBe('http://127.0.0.1');
    });
    it('should return an null info if serving is not listen', () => {
      const { sut } = makeSut();
      const address = sut.address();
      expect(address).toBeFalsy();
    });
  });
  describe('#listen', () => {
    it('should call ready and server.listen and return a valid server object when call listen method', () => {
      const { sut } = makeSut();

      const fastServer = sut.listen(8080);

      expect(ready).toHaveBeenCalledTimes(1);
      expect(server.listen).toHaveBeenCalledTimes(1);
      expect(fastServer).toStrictEqual(server);
    });
    it('should throws if port is not a valid numerical string or a number', async () => {
      const { sut } = makeSut();

      const promise = async () => sut.listenAsync('INVALID');

      expect(ready).not.toHaveBeenCalledTimes(1);
      expect(server.listen).not.toHaveBeenCalledTimes(1);
      expect(promise).rejects.toThrow(
        'Port must be a number or a valid numerical string'
      );
    });
  });
  describe('#listenAsync', () => {
    it('should call ready and server.listen and return a valid server object when call listenAsync method', async () => {
      const { sut } = makeSut();

      const fastServer = await sut.listenAsync(8080);

      expect(ready).toHaveBeenCalledTimes(1);
      expect(server.listen).toHaveBeenCalledTimes(1);
      expect(fastServer).toStrictEqual(server);
    });
    it('should throws if port is not a valid numerical string or a number', async () => {
      const { sut } = makeSut();

      const promise = sut.listenAsync('INVALID');

      expect(ready).not.toHaveBeenCalledTimes(1);
      expect(server.listen).not.toHaveBeenCalledTimes(1);
      expect(promise).rejects.toThrow(
        'Port must be a number or a valid numerical string'
      );
    });
  });
  describe('#getServer', () => {
    it('should returns an valid server object', () => {
      const { sut } = makeSut();
      const result = sut.getServer();
      expect(result).toStrictEqual(server);
    });
  });
  describe('#ready', () => {
    it('should call ready of server with the correct params', async () => {
      const { sut } = makeSut();
      const result = await sut.ready();
      expect(result).toBeUndefined();
      expect(ready).toHaveBeenCalledWith(expect.any(Function));
      expect(ready).toHaveBeenCalledTimes(1);
    });
  });
  describe('#onStart', () => {
    it('should works with called with spread arguments', () => {
      const { sut } = makeSut();
      const promise = async () => sut.onStart([() => {}]);
      expect(promise()).resolves.toBeUndefined();
    });
    it('should works with called with first argument a callback and the rest spread', () => {
      const { sut } = makeSut();
      const promise = async () => sut.onStart(() => {}, ...[() => {}]);
      expect(promise()).resolves.toBeUndefined();
    });
    it('should works with called with one argument', () => {
      const { sut } = makeSut();
      const promise = async () => sut.onStart(() => {});
      expect(promise()).resolves.toBeUndefined();
    });
  });
  describe('#refresh', () => {
    it('should not call internal close method of internal fastify server if server is not started', async () => {
      const { sut } = makeSut();

      await sut.refresh();

      expect(close).not.toHaveBeenCalled();
    });
    it('should call internal close method of internal fastify server', async () => {
      const { sut } = makeSut();

      sut.listen(8080);

      await sut.refresh();

      expect(close).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledWith(expect.any(Function));
    });
  });
  describe('#close', () => {
    it('should not call internal close method of internal fastify server if server is not started', () => {
      const { sut } = makeSut();

      sut.close();

      expect(close).not.toHaveBeenCalled();
    });
    it('should call internal close method of internal fastify server', () => {
      const { sut } = makeSut();

      sut.listen(8080);

      sut.close();

      expect(close).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledWith(expect.any(Function));
    });
  });
  describe('#route', () => {
    it('should return an Route instance', () => {
      const { sut } = makeSut();
      const router = sut.router();
      expect(router).toBeInstanceOf(Route);
    });
    it('should throw an error if server is already started', () => {
      const { sut } = makeSut();
      sut.listen(8080);
      const rejects = async () => sut.router();
      expect(rejects()).rejects.toThrow(
        'Sorry, you cannot register routes after bootstraping the HTTP server'
      );
    });
  });
});
