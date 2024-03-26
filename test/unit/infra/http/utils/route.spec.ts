import { Route } from '@/infra/http/utils/http-server/route';
import { Router } from '@/infra/http/utils/http-server/types';

import { RouterStub } from '../mocks';

type SutType = {
  routerStub: Router;
  sut: Route;
  adapterStub: Function;
  saveStub: Function;
  baseUrl: string;
};

const makeSut = ({ baseUrl }: { baseUrl: string }): SutType => {
  const routerStub = new RouterStub();
  const adapterStub = jest.fn().mockReturnValue('ADAPTED');
  const saveStub = jest.fn();
  const sut = new Route(routerStub, adapterStub, saveStub, baseUrl);
  return {
    baseUrl,
    saveStub,
    adapterStub,
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

  it('should call adapterStub with the correct params', () => {
    const { sut, adapterStub } = makeSut({ baseUrl: '/test' });

    for (const method of METHODS) {
      sut[<keyof Route>method](path, ...middlewares);
    }

    expect(adapterStub).toHaveBeenCalledTimes(METHODS.length);
    expect(adapterStub).toHaveBeenCalledWith([expect.any(Function)]);
  });

  it('should call save with the correct params', () => {
    const { sut, saveStub } = makeSut({ baseUrl: '/test' });

    for (const method of METHODS) {
      sut[<keyof Route>method](path, ...middlewares);
    }

    expect(saveStub).toHaveBeenCalledTimes(METHODS.length);
    expect(saveStub).toHaveBeenCalledWith({
      method: expect.stringMatching(/(get|post|put|patch|options|delete)/i),
      uri: '/test/any_route',
      handler: 'ADAPTED'
    });
  });
});
