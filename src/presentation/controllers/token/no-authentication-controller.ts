import { Controller } from '@/presentation/protocols';
import { badRequest } from '@/presentation/utils';
import { makeErrorDescription } from '@/util/formatters';

export class NoAuthenticationController implements Controller {
  async handle(): Controller.Result {
    return badRequest(
      makeErrorDescription(
        'authorization/authentication',
        'Nenhum parâmetro para autenticação foi fornecido.'
      )
    );
  }
}
