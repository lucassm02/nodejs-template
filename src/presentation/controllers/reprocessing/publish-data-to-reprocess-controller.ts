import { Controller } from '@/presentation/protocols';
import { ok } from '@/presentation/utils';

export class PublishDataToReprocessController implements Controller {
  async handle(): Controller.Result {
    return ok('Reprocessamento em andamento, aguarde!', {});
  }
}
