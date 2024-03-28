import { ExampleTrouble } from '@/data/usecases/example';

type SutTypes = {
  sut: ExampleTrouble;
};

const makeSut = (): SutTypes => ({ sut: new ExampleTrouble() });

describe('ExampleTrouble UseCase', () => {
  it('should throw error when current equal 1', () => {
    const { sut } = makeSut();

    try {
      sut.trouble({ current: 1, step: 0 });
    } catch (error) {
      expect(error.message).toStrictEqual('Example Error');
    }
  });

  it('should throw error when troubleArray returns a trouble', () => {
    const { sut } = makeSut();

    try {
      sut.trouble({ current: 0, step: 0 });
    } catch (error) {
      expect(error).toStrictEqual({ message: 'Error', step: 2, total: 3 });
    }
  });

  it('should not throw when step pass with success', () => {
    const { sut } = makeSut();

    const result = sut.trouble({ current: 0, step: 3 });
    expect(result).toStrictEqual(undefined);
  });
});
