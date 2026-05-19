import * as crypto from 'crypto';

import { SecretToken } from '@/infra/encryption/secret-token';

// KEY must be 32 bytes (UTF-8), IV must be 16 bytes (UTF-8) — matches Buffer.from(KEY) and direct IV usage in source
const TEST_KEY = '12345678901234567890123456789012';
const TEST_IV = '1234567890123456';
const TEST_PAYLOAD = { id: 'user-123', role: 'admin' };

jest.mock('@/util/constants', () => ({
  ...jest.requireActual('@/util/constants'),
  ENCRYPTION: {
    KEY: '12345678901234567890123456789012',
    IV: '1234567890123456'
  }
}));

function encryptPayload(payload: object): string {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(TEST_KEY),
    TEST_IV
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload)),
    cipher.final()
  ]);
  return encrypted.toString('base64');
}

type SutTypes = { sut: SecretToken };
const makeSut = (): SutTypes => ({ sut: new SecretToken() });

describe('SecretToken', () => {
  it('should decrypt an encrypted token and return parsed JSON', () => {
    const { sut } = makeSut();
    const encrypted = encryptPayload(TEST_PAYLOAD);

    const result = sut.decrypt(encrypted);

    expect(result).toEqual(TEST_PAYLOAD);
  });

  it('should throw when token is invalid base64', () => {
    const { sut } = makeSut();
    expect(() => sut.decrypt('not-valid-encrypted-data')).toThrow();
  });
});
