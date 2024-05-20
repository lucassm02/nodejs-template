import fastify from 'fastify';
import path from 'path';
import request from 'supertest';

import { HttpServer } from '@/infra/http/utils/http-server/http-server';

describe('Route Directory Implementations', () => {
  describe('Just file', () => {
    const application = new HttpServer(fastify);
    application.setBaseUrl('/api/v1');

    const getServer = () => application.getServer();

    beforeAll(async () => {
      const mockFolder = path.resolve(__dirname, 'mocks');
      const mockRouterFolder = path.resolve(mockFolder, 'routes');
      await application.routesDirectory(mockRouterFolder);
      await application.ready();
    });
    it('should return a 200 and a valid payload', async () => {
      const response = await request(getServer()).get('/api/v1/mock');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        statusCode: 200
      });
    });
  });

  describe('With uncoupled router', () => {
    const application = new HttpServer(fastify);
    application.setBaseUrl('/api/v1');

    const getServer = () => application.getServer();

    afterAll(() => {
      application.close();
    });
    beforeAll(async () => {
      const router = application.router({
        baseUrl: '/api/v2',
        path: '/users'
      });

      const mockFolder = path.resolve(__dirname, 'mocks');
      const mockRouterFolder = path.resolve(mockFolder, 'routes');
      await application.routesDirectory(mockRouterFolder, router);
      await application.ready();
    });
    it('should return a 200 and a valid payload', async () => {
      const response = await request(getServer()).get('/api/v2/users/mock');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        statusCode: 200
      });
    });
  });
  describe('With uncoupled router and hooks', () => {
    const application = new HttpServer(fastify);
    application.setBaseUrl('/api/v1');

    const hookMock = jest.fn().mockImplementation((req, res, next, state) => {
      next();
    });
    const getServer = () => application.getServer();

    afterAll(() => {
      application.close();
    });

    beforeAll(async () => {
      const router = application.router({
        baseUrl: '/api/v3',
        path: '/users'
      });

      const mockFolder = path.resolve(__dirname, 'mocks');
      const mockRouterFolder = path.resolve(mockFolder, 'routes');
      await application.routesDirectory(mockRouterFolder, router, hookMock);
      await application.ready();
    });
    it('should return a 200 and a valid payload and call hook', async () => {
      const response = await request(getServer()).get('/api/v3/users/mock');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        statusCode: 200
      });
      expect(hookMock).toHaveBeenCalled();
      expect(hookMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('With other base url and hooks', () => {
    const application = new HttpServer(fastify);
    application.setBaseUrl('/api/v1');

    const hookMock = jest.fn().mockImplementation((req, res, next) => {
      next();
    });
    const getServer = () => application.getServer();

    afterAll(() => {
      application.close();
    });

    beforeAll(async () => {
      const mockFolder = path.resolve(__dirname, 'mocks');
      const mockRouterFolder = path.resolve(mockFolder, 'routes');
      await application.routesDirectory(mockRouterFolder, '/api/v4', hookMock);
      await application.ready();
    });
    it('should return a 200 and a valid payload and call hook', async () => {
      const response = await request(getServer()).get('/api/v4/mock');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        statusCode: 200
      });
      expect(hookMock).toHaveBeenCalled();
      expect(hookMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('With file and hooks', () => {
    const application = new HttpServer(fastify);
    application.setBaseUrl('/api/v1');

    const hookMock = jest
      .fn()
      .mockImplementation((req, res, next, [_state, setState]) => {
        setState({
          message: 'works!'
        });
        next();
      });

    const getServer = () => application.getServer();

    afterAll(() => {
      application.close();
    });

    beforeAll(async () => {
      const mockFolder = path.resolve(__dirname, 'mocks');
      const mockRouterFolder = path.resolve(mockFolder, 'routes');
      await application.routesDirectory(mockRouterFolder, hookMock);
      await application.ready();
    });
    it('should return a 200 and a valid payload and call hook', async () => {
      const response = await request(getServer()).get('/api/v1/mock');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({
        statusCode: 200,
        message: 'works!'
      });
      expect(hookMock).toHaveBeenCalled();
      expect(hookMock).toHaveBeenCalledTimes(1);
    });
  });
});
