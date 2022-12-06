import { Controller } from '@/presentation/protocols';
import { created } from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';

export class CreateExampleController implements Controller {
  constructor() {}

  async handle(): Controller.Result {
    return created(
      template(DICTIONARY.RESPONSE.MESSAGE.OK, 'Exemplo cadastrado'),
      {}
    );
  }
}
