import { InputAndOutputLogModel } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-model';
import { InputAndOutputLogRepository } from '@/infra/db/mongodb/input-and-output-log/input-and-output-log-repository';

type SutTypes = {
  sut: InputAndOutputLogRepository;
};

const makeSut = (): SutTypes => ({ sut: new InputAndOutputLogRepository() });

describe('InputAndOutputLog Repository', () => {
  it('should call model create method', async () => {
    const { sut } = makeSut();

    const createSpy = jest
      .spyOn(InputAndOutputLogModel, 'create')
      .mockImplementationOnce(() => Promise.resolve(<any>{}));

    sut.create({
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
    expect(createSpy).toHaveBeenCalledWith(expected);
  });
});
