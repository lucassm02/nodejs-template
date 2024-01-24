import { PublishDataToReprocessController } from '@/presentation/controllers';

type SutTypes = {
  sut: PublishDataToReprocessController;
};

const makeSut = (): SutTypes => ({
  sut: new PublishDataToReprocessController()
});

describe('PublishDataToReprocessController', () => {
  it('Should return 200 on success', async () => {
    const { sut } = makeSut();

    const result = await sut.handle();

    const expected = {
      statusCode: 200,
      body: {
        message: 'Reprocessamento em andamento, aguarde!',
        payload: {},
        error: []
      }
    };
    expect(result).toStrictEqual(expected);
  });
});
