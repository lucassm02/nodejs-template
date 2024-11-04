import { HttpClient } from '@/data/protocols/http/adapters';
import { ValidateTokenService as ValidateTokenProtocol } from '@/data/protocols/http/authenticator';

import { httpLoggerWrapper } from '../../util';

export class ValidateTokenService implements ValidateTokenProtocol {
  constructor(private readonly httpClient: HttpClient) {}

  async validate(
    token: ValidateTokenProtocol.Params
  ): ValidateTokenProtocol.Result {
    const url = '/v1/tokens/verify';
    const description = 'TOKEN VALIDATION';
    const method = 'GET';
    const body = {};
    const headers = {
      authorization: token
    };

    const response = await this.httpClient.request({
      url,
      method,
      headers
    });

    httpLoggerWrapper({
      description,
      keywords: {},
      services: ['AUTHENTICATION'],
      request: { url, method, body, headers },
      response
    });

    return response.statusCode === 200;
  }
}
