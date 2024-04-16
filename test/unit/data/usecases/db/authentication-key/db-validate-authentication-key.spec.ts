import { DbValidateAuthenticationKey } from '@/data/usecases/db';

type SutTypes = {
  sut: DbValidateAuthenticationKey;
};

const makeSut = (): SutTypes => ({ sut: new DbValidateAuthenticationKey() });

describe('DbValidateAuthenticationKey UseCase', () => {
  it('Should return an authentication on success', async () => {
    const { sut } = makeSut();

    const result = await sut.validate('any_authentication');

    const expected = {
      authentication: 'any_authentication',
      mvnoId: 2,
      sourceId: 3,
      sourceMvnoId: 3
    };
    expect(result).toStrictEqual(expected);
  });
});
