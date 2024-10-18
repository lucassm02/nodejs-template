import { Controller } from '@/presentation/protocols';
import { ok } from '@/presentation/utils';

export class GreetingWebsocketController implements Controller {
  async handle(): Controller.Result {
    return ok('Olá!', {}, { close: true });
  }
}
