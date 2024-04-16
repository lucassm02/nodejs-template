import { DecryptToken } from '@/data/protocols/encryption';
import { mockTokenModel } from '@/test/unit/domain/models';

export class DecryptTokenStub implements DecryptToken {
  decrypt(): DecryptToken.Result {
    return mockTokenModel;
  }
}
