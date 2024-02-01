import { v4 as uuidv4 } from 'uuid';

import { generateUuid } from '@/util';

jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('5a5052c4-6760-4d27-b8f4-118fdbbba723')
  };
});

describe('generateUuid Function', () => {
  it('should generate a UUID in uppercase', () => {
    const result = generateUuid();

    expect(result).toBe('5A5052C4-6760-4D27-B8F4-118FDBBBA723');
  });

  it('should call uuidv4 exactly once', () => {
    generateUuid();

    expect(uuidv4).toHaveBeenCalledTimes(1);
  });
});
