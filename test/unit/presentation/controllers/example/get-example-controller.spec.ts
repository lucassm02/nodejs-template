import { GetExampleController } from '@/presentation/controllers';
import { exampleModelMock } from '@/test/unit/domain/models';

type SutTypes = {
  sut: GetExampleController;
};

const makeSut = (): SutTypes => ({
  sut: new GetExampleController()
});

describe('GetExampleController', () => {
  const request: any = {};
  const state: any = { getExample: exampleModelMock };
  const setState: any = jest.fn();

  it('should return 200 on success', async () => {
    const { sut } = makeSut();

    const result = await sut.handle(request, [state, setState]);

    const expected = {
      body: {
        error: [],
        message: 'Exemplos listados com sucesso.',
        payload: exampleModelMock
      },
      statusCode: 200
    };
    expect(result).toStrictEqual(expected);
  });
});
