import { DecryptToken } from '@/data/protocols/encryption';
import { ValidateTokenService } from '@/data/protocols/http/authenticator';
import { ValidateToken } from '@/domain/usecases/token';

export class HttpValidateToken implements ValidateToken {
  constructor(
    private readonly decryptToken: DecryptToken,
    private readonly verifyValidToken: ValidateTokenService
  ) {}

  async validate(token: string): ValidateToken.Result {
    const decryptedToken = await this.decryptToken.decrypt(token);
    const isValid = await this.verifyValidToken.validate(token);
    if (!isValid) throw new Error(ValidateToken.Exceptions.INVALID_TOKEN);
    return decryptedToken;
  }
}
