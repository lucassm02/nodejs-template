import { removeUndefinedValues } from '@/util';

describe('removeUndefinedValues Function', () => {
  it('Should remove undefined values from a simple object', () => {
    const input = {
      name: 'John',
      age: undefined,
      city: 'New York'
    };

    const result = removeUndefinedValues(input);

    expect(result).toEqual({
      name: 'John',
      city: 'New York'
    });
  });

  it('Should handle nested objects and remove undefined values', () => {
    const input = {
      person: {
        name: 'Alice',
        age: undefined,
        address: {
          city: 'London',
          street: undefined
        }
      },
      job: 'Developer'
    };

    const result = removeUndefinedValues(input);

    expect(result).toEqual({
      person: {
        name: 'Alice',
        address: {
          city: 'London'
        }
      },
      job: 'Developer'
    });
  });

  it('Should handle primitive values and remove undefined values', () => {
    const input = {
      name: 'Eva',
      age: 30,
      job: undefined
    };

    const result = removeUndefinedValues(input);

    expect(result).toEqual({
      name: 'Eva',
      age: 30
    });
  });
});
