import { GetReprocessingDataController } from '@/presentation/controllers';

type SutTypes = {
  sut: GetReprocessingDataController;
};

const makeSut = (): SutTypes => ({
  sut: new GetReprocessingDataController()
});

describe('GetReprocessingDataController', () => {
  const state: any = {
    getReprocessingData: [
      {
        reprocessingId: 'any_reprocessing_id',
        reprocessing: {
          middleware: 'any_middleware',
          tries: {},
          data: { payload: { body: {}, headers: {}, properties: {} } },
          state: {}
        },
        queue: 'any_queue',
        createdAt: new Date('2024-01-13T23:24:13')
      }
    ]
  };
  const setState = jest.fn();

  it('Should return 200 with verbose response on success', async () => {
    const { sut } = makeSut();

    const request: any = { query: { verbose: true } };
    const result = await sut.handle(request, [state, setState]);

    const reprocessingIds = ['any_reprocessing_id'];

    const expected = {
      statusCode: 200,
      body: {
        message: 'Reprocessamento listado com sucesso.',
        payload: { reprocessingIds, reprocessings: state.getReprocessingData },
        error: []
      }
    };
    expect(result).toStrictEqual(expected);
  });

  it('Should return 200 with non-verbose response on success', async () => {
    const { sut } = makeSut();

    const request: any = { query: { verbose: false } };
    const result = await sut.handle(request, [state, setState]);

    const reprocessingIds = ['any_reprocessing_id'];

    const payload = {
      reprocessingIds,
      reprocessings: [
        {
          reprocessingId: 'any_reprocessing_id',
          middleware: 'any_middleware',
          tries: {},
          body: {},
          headers: {},
          createdAt: new Date('2024-01-13T23:24:13')
        }
      ]
    };

    const expected = {
      statusCode: 200,
      body: {
        message: 'Reprocessamento listado com sucesso.',
        payload,
        error: []
      }
    };
    expect(result).toStrictEqual(expected);
  });

  it('Should return 200 with non-verbose response when query verbose is not defined', async () => {
    const { sut } = makeSut();

    const request: any = {};
    const result = await sut.handle(request, [state, setState]);

    const reprocessingIds = ['any_reprocessing_id'];

    const payload = {
      reprocessingIds,
      reprocessings: [
        {
          reprocessingId: 'any_reprocessing_id',
          middleware: 'any_middleware',
          tries: {},
          body: {},
          headers: {},
          createdAt: new Date('2024-01-13T23:24:13')
        }
      ]
    };

    const expected = {
      statusCode: 200,
      body: {
        message: 'Reprocessamento listado com sucesso.',
        payload,
        error: []
      }
    };
    expect(result).toStrictEqual(expected);
  });

  it('Should return 200 with non-verbose response with body and headers undefined', async () => {
    const { sut } = makeSut();

    const stateWithoutBodyAndHeaders: any = {
      getReprocessingData: [
        {
          reprocessingId: 'any_reprocessing_id',
          reprocessing: {
            middleware: 'any_middleware',
            tries: {},
            data: {},
            state: {}
          },
          queue: 'any_queue',
          createdAt: new Date('2024-01-13T23:24:13')
        }
      ]
    };

    const request: any = { query: { verbose: false } };
    const result = await sut.handle(request, [
      stateWithoutBodyAndHeaders,
      setState
    ]);

    const reprocessingIds = ['any_reprocessing_id'];

    const payload = {
      reprocessingIds,
      reprocessings: [
        {
          reprocessingId: 'any_reprocessing_id',
          middleware: 'any_middleware',
          tries: {},
          body: undefined,
          headers: undefined,
          createdAt: new Date('2024-01-13T23:24:13')
        }
      ]
    };

    const expected = {
      statusCode: 200,
      body: {
        message: 'Reprocessamento listado com sucesso.',
        payload,
        error: []
      }
    };
    expect(result).toStrictEqual(expected);
  });
});
