import { formatYupError, PrettyYupError } from '@/util';

describe('formatYupError function', () => {
  it('Formats Yup validation error correctly', () => {
    const yupError: any = {
      inner: [
        { message: 'O field1 é obrigatório', path: 'field1' },
        { message: 'O field2 é obrigatório', path: 'field2.subfield' }
      ]
    };

    const expectedFormattedError: PrettyYupError[] = [
      { message: 'O field1 é obrigatório', param: 'field1' },
      { message: 'O field2 é obrigatório', param: 'field2.subfield' }
    ];

    const result = formatYupError(yupError);

    expect(result).toEqual(expectedFormattedError);
  });

  it('Formats Yup validation error with empty inner array', () => {
    const yupError: any = { inner: [] };

    const expectedFormattedError: PrettyYupError[] = [];

    const result = formatYupError(yupError);

    expect(result).toEqual(expectedFormattedError);
  });
});
