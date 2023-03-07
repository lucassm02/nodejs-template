import { HttpClient } from '@/data/protocols/http/adapters';
import { ValidateTokenService as ValidateTokenProtocol } from '@/data/protocols/http/authenticator';
import { logger } from '@/util';

export class ValidateTokenService implements ValidateTokenProtocol {
  constructor(private readonly httpClient: HttpClient) {}

  async validate(
    token: ValidateTokenProtocol.Params
  ): ValidateTokenProtocol.Result {
    const result = await this.httpClient.request({
      url: '/v1/tokens',
      method: 'GET',
      headers: {
        authorization: token,
      },
    });

    logger.log({
      level: 'http',
      message: 'TOKEN VALIDATION',
      payload: { meta: { keywords: {}, services: ['AUTHENTICATION'] } },
    });

    return result.statusCode === 200;
  }
}
