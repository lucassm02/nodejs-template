import { Controller } from '@/presentation/protocols';
import { ok } from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';

export class GetExampleController implements Controller {
  constructor() {}

  async handle(
    _httpRequest: Controller.HttpRequest,
    [{ getExample }]: Controller.State
  ): Controller.Result {
    return ok(
      template(DICTIONARY.RESPONSE.MESSAGE.OK, 'Exemplos listados'),
      getExample
    );
  }
}
