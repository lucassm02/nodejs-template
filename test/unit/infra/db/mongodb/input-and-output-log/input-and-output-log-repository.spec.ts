import { InputAndOutputLogModel } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-model';
import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';

type SutTypes = {
  sut: InputAndOutputLogRepository;
};

const makeSut = (): SutTypes => ({ sut: new InputAndOutputLogRepository() });

describe('InputAndOutputLog Repository', () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await InputAndOutputLogRepository.flush();
  });

  it('should buffer log and call model insertMany on flush', async () => {
    const { sut } = makeSut();

    const insertManySpy = jest
      .spyOn(InputAndOutputLogModel, 'insertMany')
      .mockResolvedValueOnce([]);

    await sut.create({
      type: 'any_type',
      id: 'my_id',
      inputPayload: { item: 'my_item' }
    });

    const expected = {
      id: 'my_id',
      input_payload: {
        item: 'my_item'
      },
      type: 'any_type'
    };

    expect(insertManySpy).not.toHaveBeenCalled();

    await InputAndOutputLogRepository.flush();

    expect(insertManySpy).toHaveBeenCalledWith([expected], {
      ordered: false,
      writeConcern: { w: 0 }
    });
  });
});
