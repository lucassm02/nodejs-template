import {
  convertCamelCaseKeysToSnakeCase,
  convertSnakeCaseKeysToCamelCase,
  convertToLowerCase
} from '@/util/object/formatters';

describe('formatters barrel', () => {
  describe('convertSnakeCaseKeysToCamelCase', () => {
    it('converts snake_case keys to camelCase, recursively', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        address_info: { street_name: 'Main St', zip_code: '00000' },
        phone_numbers: [{ area_code: '11', phone_number: '99999-0000' }],
        created_at: new Date('2023-01-01')
      };

      expect(convertSnakeCaseKeysToCamelCase(input)).toStrictEqual({
        firstName: 'John',
        lastName: 'Doe',
        addressInfo: { streetName: 'Main St', zipCode: '00000' },
        phoneNumbers: [{ areaCode: '11', phoneNumber: '99999-0000' }],
        createdAt: new Date('2023-01-01')
      });
    });

    it('collapses a leading or doubled underscore the same way the previous implementation did', () => {
      expect(
        convertSnakeCaseKeysToCamelCase({ _foo: 1, foo__bar: 2 })
      ).toStrictEqual({ Foo: 1, fooBar: 2 });
    });
  });

  describe('convertCamelCaseKeysToSnakeCase', () => {
    it('converts camelCase keys to snake_case, recursively', () => {
      const input = {
        firstName: 'John',
        addressInfo: { streetName: 'Main St' },
        phoneNumbers: [{ areaCode: '11' }]
      };

      expect(convertCamelCaseKeysToSnakeCase(input)).toStrictEqual({
        first_name: 'John',
        address_info: { street_name: 'Main St' },
        phone_numbers: [{ area_code: '11' }]
      });
    });

    it('lowercases a leading uppercase letter without a leading underscore', () => {
      expect(convertCamelCaseKeysToSnakeCase({ FooBar: 1 })).toStrictEqual({
        foo_bar: 1
      });
    });
  });

  describe('convertToLowerCase', () => {
    it('lowercases every key without introducing underscores', () => {
      expect(
        convertToLowerCase({ FooBar: 1, nested: { BazQux: 2 } })
      ).toStrictEqual({ foobar: 1, nested: { bazqux: 2 } });
    });
  });

  it('does not mutate sibling keys of the input object (no shared-reference regression)', () => {
    const input = { a_one: 1, b_two: 2, c_three: 3 };
    const result = convertSnakeCaseKeysToCamelCase(input);

    expect(result).toStrictEqual({ aOne: 1, bTwo: 2, cThree: 3 });
    expect(input).toStrictEqual({ a_one: 1, b_two: 2, c_three: 3 });
  });
});
