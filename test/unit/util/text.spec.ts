import {
  capitalize,
  convertBase64ToString,
  convertStringToBase64,
  isJson,
  truncateString
} from '@/util';

describe('Text Functions', () => {
  describe('Capitalize', () => {
    it('should return a string with the first letter to UpperCase', () => {
      const string = 'string';
      const result = capitalize(string);

      const expected = 'String';
      expect(result).toStrictEqual(expected);
    });
  });

  describe('truncateString', () => {
    it('should return a sliced string', () => {
      const longString = 'striiiiing';
      const result = truncateString(longString, 2);

      const expected = 'st';
      expect(result).toStrictEqual(expected);
    });

    it('should return the same string when number is greater than string length', () => {
      const longString = 'striiiiing';
      const result = truncateString(longString, 12);

      const expected = 'striiiiing';
      expect(result).toStrictEqual(expected);
    });
  });

  describe('isJson', () => {
    it('should return true if string is a json', () => {
      const jsonString = JSON.stringify({ value: 'any' });
      const result = isJson(jsonString);

      const expected = true;
      expect(result).toStrictEqual(expected);
    });

    it('return false if string is not a json', () => {
      const string = 'any';
      const result = isJson(string);

      const expected = false;
      expect(result).toStrictEqual(expected);
    });
  });

  describe('convertBase64ToString', () => {
    it('should convert a base64 to string', () => {
      const message = 'message';
      const base64 = Buffer.from(message).toString('base64');

      const result = convertBase64ToString(base64);

      const expected = 'message';
      expect(result).toStrictEqual(expected);
    });
  });

  describe('convertStringToBase64', () => {
    it('should convert a string to base64', () => {
      const string = 'any_string';

      const result = convertStringToBase64(string);

      const expected = 'YW55X3N0cmluZw==';
      expect(result).toStrictEqual(expected);
    });
  });
});
