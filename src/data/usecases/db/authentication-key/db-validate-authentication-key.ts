import { ValidateAuthenticationKey } from '@/domain/usecases';

export class DbValidateAuthenticationKey implements ValidateAuthenticationKey {
  constructor() {}

  async validate(authentication: string): ValidateAuthenticationKey.Result {
    return { authentication, mvnoId: 2, sourceId: 3, sourceMvnoId: 3 };
  }
}
