import { LogModel } from '@/infra/db/mongodb/log/log-model';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';

type SutTypes = {
  sut: LogRepository;
};

const makeSut = (): SutTypes => ({ sut: new LogRepository() });

describe('Log Repository', () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await LogRepository.flush();
  });

  it('should buffer log and call model insertMany on flush', async () => {
    const { sut } = makeSut();

    const insertManySpy = jest
      .spyOn(LogModel, 'insertMany')
      .mockResolvedValueOnce([]);

    await sut.create({
      level: 'any_level',
      id: 'my_id',
      log_message: 'my_item',
      type: 'any_type'
    });

    const expected = {
      id: 'my_id',
      level: 'any_level',
      log_message: 'my_item',
      type: 'any_type'
    };

    expect(insertManySpy).not.toHaveBeenCalled();

    await LogRepository.flush();

    expect(insertManySpy).toHaveBeenCalledWith([expected], {
      ordered: false,
      writeConcern: { w: 0 }
    });
  });
});
