import { makeErrorDescription } from '@/util';

describe('makeErrorDescription Function', () => {
  it('Returns an array with the correct structure', () => {
    const param = 'any_param';
    const error = 'any_error';

    const result = makeErrorDescription(param, error);

    expect(result).toEqual([{ message: error, param }]);
  });

  it('Returns an array with the correct structure when parameters are empty strings', () => {
    const param = '';
    const error = '';

    const result = makeErrorDescription(param, error);

    expect(result).toEqual([{ message: error, param }]);
  });
});
