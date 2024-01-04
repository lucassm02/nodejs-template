import { object, string } from 'yup';

import { UcVanillaDataValidation } from '@/data/usecases/validation';
import { YupSchema } from '@/presentation/protocols';

type SutType = {
  schema: YupSchema;
  sut: UcVanillaDataValidation;
  exception: string;
  data: Record<string, any>;
};

export const makeSut = (): SutType => {
  const sut = UcVanillaDataValidation.getInstance();
  const exception = 'INVALID_DATA_EXCEPTION';
  const data = { foo: 'bar' };
  const schema = object().shape({
    foo: string().required()
  });

  return {
    sut,
    exception,
    data,
    schema
  };
};

describe('UcVanillaDataValidation', () => {
  beforeAll(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  afterAll(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should work with object params overload', async () => {
    const { sut, data, exception, schema } = makeSut();
    const spyOnSutValidate = jest.spyOn(sut, 'validate');
    await sut.validate({
      data,
      exception,
      schema
    });
    expect(spyOnSutValidate).toHaveBeenNthCalledWith(1, {
      data,
      exception,
      schema
    });
  });
  it('should work with object sequencial overload params', async () => {
    const { sut, data, exception, schema } = makeSut();
    const spyOnSutValidate = jest.spyOn(sut, 'validate');
    await sut.validate(schema, data, exception);
    expect(spyOnSutValidate).toHaveBeenNthCalledWith(
      1,
      schema,
      data,
      exception
    );
  });
  it('should return the correctly result the according of the schema provided', async () => {
    const { sut, data, exception, schema } = makeSut();
    const result = await sut.validate(schema, data, exception);
    const expected = {
      foo: 'bar'
    };
    expect(result).toStrictEqual(expected);
  });
  it('should throws if invalid data is provided and passed default options or throws true in options', async () => {
    const { sut, data, exception, schema } = makeSut();
    const result = async () => sut.validate(schema, {}, exception);
    expect(result).rejects.toThrow(exception);
  });
  it('should return undefined with validation process throws but options throws is set as false', async () => {
    const { sut, exception, schema } = makeSut();
    const result = await sut.validate(schema, {}, exception, { throws: false });
    expect(result).toBeUndefined();
  });
});
