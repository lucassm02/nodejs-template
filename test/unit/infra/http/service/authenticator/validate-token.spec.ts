import type { HttpClient } from '@/data/protocols/http/adapters';
import { ValidateTokenService } from '@/infra/http/service/authenticator/validate-token';
import * as httpLoggerWrapperModule from '@/infra/http/util/http-logger-wrapper';

jest.mock('@/infra/http/util/http-logger-wrapper', () => ({
  httpLoggerWrapper: jest.fn()
}));

type SutTypes = { sut: ValidateTokenService; httpClient: HttpClient };

const makeSut = (): SutTypes => {
  const httpClient: HttpClient = { request: jest.fn() };
  const sut = new ValidateTokenService(httpClient);
  return { sut, httpClient };
};

describe('ValidateTokenService', () => {
  it('should return true when httpClient responds with statusCode 200', async () => {
    const { sut, httpClient } = makeSut();
    jest
      .spyOn(httpClient, 'request')
      .mockResolvedValueOnce({ statusCode: 200, body: {}, headers: {} });

    const result = await sut.validate('Bearer valid-token');

    expect(result).toBe(true);
  });

  it('should return false when httpClient responds with statusCode 401', async () => {
    const { sut, httpClient } = makeSut();
    jest
      .spyOn(httpClient, 'request')
      .mockResolvedValueOnce({ statusCode: 401, body: {}, headers: {} });

    const result = await sut.validate('Bearer invalid-token');

    expect(result).toBe(false);
  });

  it('should call httpClient.request with authorization header', async () => {
    const { sut, httpClient } = makeSut();
    const requestSpy = jest
      .spyOn(httpClient, 'request')
      .mockResolvedValueOnce({ statusCode: 200, body: {}, headers: {} });

    await sut.validate('Bearer my-token');

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ headers: { authorization: 'Bearer my-token' } })
    );
  });

  it('should call httpLoggerWrapper after the request', async () => {
    const { sut, httpClient } = makeSut();
    jest
      .spyOn(httpClient, 'request')
      .mockResolvedValueOnce({ statusCode: 200, body: {}, headers: {} });
    const wrapperSpy = jest.spyOn(httpLoggerWrapperModule, 'httpLoggerWrapper');

    await sut.validate('Bearer token');

    expect(wrapperSpy).toHaveBeenCalledTimes(1);
  });
});
