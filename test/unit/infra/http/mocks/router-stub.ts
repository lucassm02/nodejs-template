import { Router } from '@/infra/http/utils/http-server/types';

export class RouterStub implements Router {
  register(...args: any): void {}
  post(...args: any): void {}
  put(...args: any): void {}
  patch(...args: any): void {}
  get(...args: any): void {}
  delete(...args: any): void {}
  options(...args: any): void {}
}
