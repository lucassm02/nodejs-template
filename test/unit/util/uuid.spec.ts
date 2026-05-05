import { randomUUID } from 'node:crypto';

import { generateUuid } from '@/util';

jest.mock('node:crypto', () => {
  return {
    randomUUID: jest
      .fn()
      .mockReturnValue('5a5052c4-6760-4d27-b8f4-118fdbbba723')
  };
});

describe('generateUuid Function', () => {
  it('should generate a UUID in uppercase', () => {
    const result = generateUuid();

    expect(result).toBe('5A5052C4-6760-4D27-B8F4-118FDBBBA723');
  });

  it('should call randomUUID exactly once', () => {
    generateUuid();

    expect(randomUUID).toHaveBeenCalledTimes(1);
  });
});
