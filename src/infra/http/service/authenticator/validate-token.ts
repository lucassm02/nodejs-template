import { HttpClient } from '@/data/protocols/http/adapters';
import { ValidateTokenService as ValidateTokenProtocol } from '@/data/protocols/http/authenticator';
import { logger } from '@/util';

export class ValidateTokenService implements ValidateTokenProtocol {
  constructor(private readonly httpClient: HttpClient) {}

  async validate(
    token: ValidateTokenProtocol.Params
  ): ValidateTokenProtocol.Result {
    const url = '/v1/tokens';
    const method = 'GET';
    const body = {};
    const headers = {
      authorization: token,
    };

    const response = await this.httpClient.request({
      url,
      method,
      headers,
    });

    const requestEntities = {
      'request-body': body,
      'request-method': method,
      'request-headers': headers,
      'request-url': url,
    };

    const responseEntities = {
      'response-body': response.body,
      'response-status-code': response.statusCode,
      'response-headers': response.headers,
    };

    logger.log({
      level: 'http',
      message: 'TOKEN VALIDATION',
      payload: {
        request: requestEntities,
        response: responseEntities,
        meta: { keywords: {}, services: ['AUTHENTICATION'] },
      },
    });

    return response.statusCode === 200;
  }
}
