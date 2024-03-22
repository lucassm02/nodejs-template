import * as yup from 'yup';

import { YupErrorHandler } from '@/domain/models';

type SutType = {
  sut: YupErrorHandler;
};

const makeSut = (): SutType => {
  const sut = new YupErrorHandler();
  return {
    sut
  };
};

class Stub extends YupErrorHandler {
  public validate<T>(schema: yup.ObjectShape, data: T) {
    this.validateSchema(schema, data);
  }
}

describe('YupErrorHandler', () => {
  it('#addError should add a error', () => {
    const { sut } = makeSut();

    sut.addError({
      message: 'any_message',
      param: 'any_param'
    });

    expect(sut).toEqual({
      errors: [
        {
          message: 'any_message',
          param: 'any_param'
        }
      ]
    });
  });

  it('#hasErrors should return false if not contains any error at errors array', () => {
    const { sut } = makeSut();
    expect(sut.hasErrors()).toBeFalsy();
  });
  it('#hasErrors should return true if contains error at errors array', () => {
    const { sut } = makeSut();

    sut.addError({
      message: 'any_message',
      param: 'any_param'
    });

    expect(sut.hasErrors()).toBeTruthy();
  });

  it('#getErrors should return the array of errors', () => {
    const { sut } = makeSut();

    sut.addError({
      message: 'any_message',
      param: 'any_param'
    });

    expect(sut.getErrors()).toStrictEqual([
      {
        message: 'any_message',
        param: 'any_param'
      }
    ]);
  });

  it('#RemoveDuplicatedErrors should return unique errors', () => {
    const { sut } = makeSut();

    sut.addError({
      message: 'any_message',
      param: 'any_param'
    });
    sut.addError({
      message: 'any_message',
      param: 'any_param'
    });
    sut.addError({
      message: 'any_message',
      param: 'any_param'
    });

    expect(
      YupErrorHandler.RemoveDuplicatedErrors(sut.getErrors())
    ).toStrictEqual([
      {
        message: 'any_message',
        param: 'any_param'
      }
    ]);
  });

  it('#validateSchema should not append any error if data provided is valid with the yup schema', () => {
    const stub = new Stub();
    const schema = {
      foo: yup.string()
    };

    const data = {
      foo: 'any_valid_string_value'
    };

    stub.validate(schema, data);

    expect(stub.hasErrors()).toBeFalsy();
  });

  it('#validateSchema should append a error if data provided is invalid with the yup schema', () => {
    const stub = new Stub();

    const schema = {
      foo: yup.string().required()
    };

    const data = {
      any: false
    };

    stub.validate(schema, data);

    expect(stub.hasErrors()).toBeTruthy();
    expect(stub.getErrors()).toStrictEqual([
      {
        message: 'foo is a required field',
        param: 'foo'
      }
    ]);
  });
});
