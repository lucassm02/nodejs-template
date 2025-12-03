import { LogModel } from '@/infra/db/mongodb/log/log-model';
import { LogRepository } from '@/infra/db/mongodb/log/log-repository';

type SutTypes = {
  sut: LogRepository;
};

const makeSut = (): SutTypes => ({ sut: new LogRepository() });

describe('Log Repository', () => {
  it('should create a logModel', async () => {
    const { sut } = makeSut();

    const createSpy = jest
      .spyOn(LogModel, 'create')
      .mockImplementationOnce(() => Promise.resolve(<any>{}));

    sut.create({
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

    const writeConcern = {
      w: 0
    };

    expect(createSpy).toHaveBeenCalledWith(expected, { writeConcern });
  });
});
