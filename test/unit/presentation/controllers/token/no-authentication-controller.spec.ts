import { NoAuthenticationController } from '@/presentation/controllers';

type SutTypes = {
  sut: NoAuthenticationController;
};

const makeSut = (): SutTypes => ({
  sut: new NoAuthenticationController()
});

describe('NoAuthenticationController', () => {
  it('Should return 400 bad request', async () => {
    const { sut } = makeSut();

    const result = await sut.handle();

    const expected = {
      statusCode: 400,
      body: {
        message: 'Ops! Ocorreram alguns erros de validação',
        payload: {},
        error: [
          {
            message: 'Nenhum parâmetro para autenticação foi fornecido.',
            param: 'authorization/authentication'
          }
        ]
      }
    };
    expect(result).toStrictEqual(expected);
  });
});
