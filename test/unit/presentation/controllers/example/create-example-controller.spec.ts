import { CommitAll } from '@/data/protocols/utils';
import { CreateExampleController } from '@/presentation/controllers';
import { commitAllStub } from '@/test/unit/data/protocols/utils';
import { databaseTransactionMock } from '@/test/unit/domain/models';

type SutTypes = {
  sut: CreateExampleController;
  commitAll: CommitAll;
};

const makeSut = (): SutTypes => ({
  sut: new CreateExampleController(commitAllStub),
  commitAll: commitAllStub
});

describe('CreateExampleController', () => {
  const request: any = {};
  const state: any = { transactions: [databaseTransactionMock] };
  const setState: any = jest.fn();

  it('should call commitAll with correct values', async () => {
    const { commitAll, sut } = makeSut();

    await sut.handle(request, [state, setState]);

    const expected = [
      {
        commit: expect.any(Function),
        rollback: expect.any(Function)
      }
    ];
    expect(commitAll).toHaveBeenCalledWith(expected);
  });

  it('should return 201 on success', async () => {
    const { sut } = makeSut();

    const result = await sut.handle(request, [state, setState]);

    const expected = {
      body: {
        error: [],
        message: 'Exemplo cadastrado com sucesso.',
        payload: {}
      },
      statusCode: 201
    };
    expect(result).toStrictEqual(expected);
  });
});
