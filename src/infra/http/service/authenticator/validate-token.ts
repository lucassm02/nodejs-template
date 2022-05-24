import { HttpClient } from '@/data/protocols/http/adapters';
import { ValidateTokenService as ValidateTokenProtocol } from '@/data/protocols/http/authenticator';

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

    return result.statusCode === 200;
  }
}
