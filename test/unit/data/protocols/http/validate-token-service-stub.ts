import { ValidateTokenService } from '@/data/protocols/http';

export class ValidateTokenServiceStub implements ValidateTokenService {
  async validate(): ValidateTokenService.Result {
    return true;
  }
}
