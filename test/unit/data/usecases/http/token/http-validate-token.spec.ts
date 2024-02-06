import { HttpValidateToken } from '@/data/usecases/http';
import {
  DecryptTokenStub,
  ValidateTokenServiceStub
} from '@/test/unit/data/protocols';

type SutTypes = {
  sut: HttpValidateToken;
  decryptTokenStub: DecryptTokenStub;
  validateTokenServiceStub: ValidateTokenServiceStub;
};

const makeSut = (): SutTypes => {
  const decryptTokenStub = new DecryptTokenStub();
  const validateTokenServiceStub = new ValidateTokenServiceStub();

  const sut = new HttpValidateToken(decryptTokenStub, validateTokenServiceStub);

  return {
    sut,
    decryptTokenStub,
    validateTokenServiceStub
  };
};

describe('HttpValidateToken', () => {
  it('Should call DecryptToken witch correct values', async () => {
    const { sut, decryptTokenStub } = makeSut();

    const decrypt = jest.spyOn(decryptTokenStub, 'decrypt');

    const token = 'any_token';

    await sut.validate(token);

    expect(decrypt).toHaveBeenCalledWith(token);
  });

  it('Should call ValidateTokenService witch correct values', async () => {
    const { sut, validateTokenServiceStub } = makeSut();

    const validate = jest.spyOn(validateTokenServiceStub, 'validate');

    const token = 'any_token';

    await sut.validate(token);

    expect(validate).toHaveBeenCalledWith(token);
  });

  it('Should throw if ValidateTokenService return false', async () => {
    const { sut, validateTokenServiceStub } = makeSut();

    jest
      .spyOn(validateTokenServiceStub, 'validate')
      .mockResolvedValueOnce(false);

    const token = 'any_token';

    const promise = sut.validate(token);

    expect(promise).rejects.toThrowError('Invalid or expired token');
  });
});
