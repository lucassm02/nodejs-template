import { Route } from '@/infra/http/utils/http-server/route';
import { Router } from '@/infra/http/utils/http-server/types';

import { RouterStub } from '../mocks';

type SutType = {
  routerStub: Router;
  sut: Route;
  middlewareAdapterStub: Function;
  baseUrl: string;
};

const makeSut = ({ baseUrl }: { baseUrl: string }): SutType => {
  const routerStub = new RouterStub();
  const middlewareAdapterStub = jest.fn().mockReturnValue('ADAPTED');
  const sut = new Route(routerStub, middlewareAdapterStub, baseUrl);
  return {
    baseUrl,
    middlewareAdapterStub,
    routerStub,
    sut
  };
};

const METHODS = ['post', 'put', 'patch', 'get', 'delete', 'options'];

describe('Route', () => {
  const path = '/any_route';
  const middlewares = [() => {}];
  it('should call Router with the correct params', () => {
    const { sut, routerStub } = makeSut({ baseUrl: '/test' });
    const stubs = [];
    for (const method of METHODS) {
      stubs.push(jest.spyOn(routerStub, <keyof Router>method));
      sut[<keyof Route>method](path, ...middlewares);
    }

    stubs.forEach((stub) => {
      expect(stub).toHaveBeenCalledTimes(1);
      expect(stub).toHaveBeenCalledWith('/test/any_route', 'ADAPTED');
    });
  });

  it('should call middlewareAdapter with the correct params', () => {
    const { sut, middlewareAdapterStub } = makeSut({ baseUrl: '/test' });

    for (const method of METHODS) {
      sut[<keyof Route>method](path, ...middlewares);
    }

    expect(middlewareAdapterStub).toHaveBeenCalledTimes(METHODS.length);
    expect(middlewareAdapterStub).toHaveBeenCalledWith([expect.any(Function)]);
  });
});
