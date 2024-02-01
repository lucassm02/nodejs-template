import format from 'string-template';

import { template } from '@/util';

jest.mock('string-template', () => jest.fn((str: string) => str));

describe('template function', () => {
  it('Formats string with a single value correctly', () => {
    const inputString = 'Any, {value}!';
    const value = 'Any';

    const result = template(inputString, value);

    expect(format).toHaveBeenCalledWith(inputString, { value });
    expect(result).toBe(inputString);
  });

  it('Formats string with multiple values correctly', () => {
    const inputString = '{name}, {lastName}!';
    const templateObj = { name: 'Any', lastName: 'AnyAny' };

    const result = template(inputString, templateObj);

    expect(format).toHaveBeenCalledWith(inputString, templateObj);
    expect(result).toBe(inputString);
  });

  it('Handles empty string correctly', () => {
    const inputString = '';
    const value = 'Any';

    const result = template(inputString, value);

    expect(format).toHaveBeenCalledWith(inputString, { value });
    expect(result).toBe(inputString);
  });

  it('handles empty object correctly', () => {
    const inputString = 'Any Any Any!!';
    const emptyTemplateObj = {};

    const result = template(inputString, emptyTemplateObj);

    expect(format).toHaveBeenCalledWith(inputString, emptyTemplateObj);
    expect(result).toBe(inputString);
  });
});
