import {
  getName,
  getType,
  labelParamsToString,
  searchLabels
} from '@/util/observability/loggers/make-decorator/utils';

describe('Logger Utils Functions', () => {
  describe('searchLabels Function', () => {
    it('should return empty when values are undefined', () => {
      const result = searchLabels(undefined, undefined);

      const expected = {};
      expect(result).toStrictEqual(expected);
    });

    it('should return empty when data not have label', () => {
      const labels = ['app'];
      const data = { id: 1, name: 'name' };

      const result = searchLabels(labels, data);

      const expected = {};
      expect(result).toStrictEqual(expected);
    });

    it('should return the value of data when label match', () => {
      const labels = { app: 'app' };
      const data = { id: 1, name: 'name', app: 'my_App' };

      const result = searchLabels(labels, data);

      const expected = { app: 'my_App' };
      expect(result).toStrictEqual(expected);
    });

    it('should return the value of data sub object when label match', () => {
      const labels = { label: 'app' };
      const data = { id: 1, name: 'name', payload: { app: 'my_app_payload' } };

      const result = searchLabels(labels, data);

      const expected = { label: 'my_app_payload' };
      expect(result).toStrictEqual(expected);
    });
  });

  describe('labelParamsToString Function', () => {
    it('should return a string of object', () => {
      const data = {
        id: 1,
        name: 'name',
        payload: { item: 'item' },
        items: ['item1', 'item2']
      };
      const result = labelParamsToString(data);

      const expected = {
        id: 1,
        name: 'name',
        payload: '{"item":"item"}',
        items: '["item1","item2"]'
      };
      expect(result).toStrictEqual(expected);
    });
  });

  describe('getName Function', () => {
    it('should return unnamed when values not found', () => {
      const result = getName([], {});

      const expected = 'unnamed';
      expect(result).toStrictEqual(expected);
    });

    it('should return option name when values not found', () => {
      const result = getName([1], { name: 'option_name' });

      const expected = 'option_name';
      expect(result).toStrictEqual(expected);
    });

    it('should value when nameByParameter match on args', () => {
      const result = getName(['name'], { nameByParameter: 0 });

      const expected = 'name';
      expect(result).toStrictEqual(expected);
    });

    it('should value when nameByParameter match on args and args is an array od objects', () => {
      const result = getName([{ name: 'name', item: 'item_value' }], {
        nameByParameter: 'item'
      });

      const expected = 'item_value';
      expect(result).toStrictEqual(expected);
    });
  });

  describe('getType Function', () => {
    it('should return void when subType is undefined', () => {
      const result = getType(undefined);

      const expected = undefined;
      expect(result).toStrictEqual(expected);
    });

    it('should return type when subType match', () => {
      const result = getType('http');

      const expected = 'external';
      expect(result).toStrictEqual(expected);
    });
  });
});
