import { DecryptToken } from '@/data/protocols/encryption';
import { mockTokenModel } from '@/test/unit/domain';

export class DecryptTokenStub implements DecryptToken {
  decrypt(): DecryptToken.Result {
    return mockTokenModel;
  }
}
