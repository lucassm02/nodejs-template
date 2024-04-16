import { ValidationError } from 'yup';
import { randomUUID } from 'crypto';

import { createExampleSchema, exampleSchema } from '@/validation/usecases';

describe('Example Yup Schemas', () => {
  describe('CreateExample', () => {
    it('should return true when description and value are valid', async () => {
      const validParams = {
        description: 'any_description',
        value: 'any_value'
      };
      const result = createExampleSchema.isValidSync(validParams);

      expect(result).toStrictEqual(true);
    });

    it('should return false when description is invalid', async () => {
      try {
        const invalidParams = {
          description: undefined,
          value: 'any_value'
        };
        const result = await createExampleSchema.validate(invalidParams);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('description is a required field')
        );
      }
    });

    it('should return false when value is invalid', async () => {
      try {
        const invalidParams = {
          description: 'any_description',
          value: undefined
        };
        const result = await createExampleSchema.validate(invalidParams);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('value is a required field')
        );
      }
    });
  });

  describe('Example', () => {
    it('should return true when example is valid', async () => {
      const validParams = {
        payment_id: randomUUID(),
        from: new Date('2023-01-01'),
        to: new Date('2023-02-01'),
        status: 'AUTHORIZED'
      };

      const result = exampleSchema.isValidSync(validParams);

      expect(result).toStrictEqual(true);
    });

    it('should return false when payment_id is invalid', async () => {
      try {
        const invalidParams = {
          payment_id: 1,
          from: new Date('2023-01-01'),
          to: new Date('2023-02-01'),
          status: 'AUTHORIZED'
        };
        const result = await exampleSchema.validate(invalidParams);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(new ValidationError('O id não é válido'));
      }
    });

    it('should return false when "from" is invalid', async () => {
      try {
        const invalidParams = {
          payment_id: randomUUID(),
          from: null,
          to: new Date('2023-02-01'),
          status: 'AUTHORIZED'
        };
        const result = await exampleSchema.validate(invalidParams);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(new ValidationError('from cannot be null'));
      }
    });

    it('should return false when "to" is invalid', async () => {
      try {
        const invalidParams = {
          payment_id: randomUUID(),
          from: new Date('2023-01-01'),
          to: null,
          status: 'AUTHORIZED'
        };
        const result = await exampleSchema.validate(invalidParams);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(new ValidationError('to cannot be null'));
      }
    });

    it('should return false when status is invalid', async () => {
      try {
        const invalidParams = {
          payment_id: randomUUID(),
          from: new Date('2023-01-01'),
          to: new Date('2023-02-01'),
          status: 'INVALID'
        };
        const result = await exampleSchema.validate(invalidParams);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError(
            'O formato do consumo precisa ser "AUTHORIZED", "DELIVERED" ou "UNAUTHORIZED"'
          )
        );
      }
    });
  });
});
