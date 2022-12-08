import { CommitAll } from '@/data/protocols/utils/transaction';
import { Controller } from '@/presentation/protocols';
import { created } from '@/presentation/utils';
import { DICTIONARY, template } from '@/util';

export class CreateExampleController implements Controller {
  constructor(private readonly commitAll: CommitAll) {}

  async handle(
    _httpRequest: Controller.HttpRequest,
    [state]: Controller.State
  ): Controller.Result {
    await this.commitAll(state.transactions);

    return created(
      template(DICTIONARY.RESPONSE.MESSAGE.OK, 'Exemplo cadastrado'),
      {}
    );
  }
}
