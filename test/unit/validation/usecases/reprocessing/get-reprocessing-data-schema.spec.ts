import { ValidationError } from 'yup';

import {
  getReprocessingDataSchema,
  date,
  optionalFinalDate,
  optionalInitialDate
} from '@/validation/usecases';
import { sumDays } from '@/util';

describe('GetReprocessingData Yup Schema', () => {
  describe('GetReprocessingDataSchema', () => {
    it('should return true when reprocessingData is valid with verbose true', async () => {
      const validReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: 'any_routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      const result = getReprocessingDataSchema.isValidSync(
        validReprocessingData
      );
      expect(result).toStrictEqual(true);
    });

    it('should return true when reprocessingData is valid with verbose false', async () => {
      const validReprocessingData = {
        verbose: 'false',
        queue: 'any_queue',
        routing_key: 'any_routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      const result = getReprocessingDataSchema.isValidSync(
        validReprocessingData
      );
      expect(result).toStrictEqual(true);
    });

    it('should return true when reprocessingData is valid without verbose', async () => {
      const validReprocessingData = {
        queue: 'any_queue',
        routing_key: 'any_routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      const result = getReprocessingDataSchema.isValidSync(
        validReprocessingData
      );
      expect(result).toStrictEqual(true);
    });

    it('should return false when verbose is not valid', async () => {
      const invalidReprocessingData = {
        verbose: 'invalid',
        queue: 'any_queue',
        routing_key: 'any_routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('O verbose deve ser um boolean')
        );
      }
    });

    it('should return false when queue is not valid', async () => {
      const invalidReprocessingData = {
        verbose: 'true',
        queue: {},
        routing_key: 'any_routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError(
            'queue must be a `string` type, but the final value was: `{}`.'
          )
        );
      }
    });

    it('should return false when routing_key is not valid', async () => {
      const invalidReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: {},
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError(
            'routing_key must be a `string` type, but the final value was: `{}`.'
          )
        );
      }
    });

    it('should return false when exchange is not valid', async () => {
      const invalidReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: 'routing_key',
        exchange: {},
        initial_date: '2023-01-01',
        final_date: '2023-02-01'
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError(
            'exchange must be a `string` type, but the final value was: `{}`.'
          )
        );
      }
    });

    it('should return false when initial_date is not valid', async () => {
      const invalidReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: 'routing_key',
        exchange: 'any_exchange',
        initial_date: {},
        final_date: '2023-02-01'
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data informada não está correta')
        );
      }
    });

    it('should return false when final_date is not valid', async () => {
      const invalidReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: 'routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-02-01',
        final_date: {}
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data informada não está correta')
        );
      }
    });

    it('should return false when initial_date is grater than final_date', async () => {
      const invalidReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: 'routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-03-01',
        final_date: '2023-02-01'
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data inicial não pode ser maior que a final')
        );
      }
    });

    it('should return false when final_date is greater than today', async () => {
      const futureDate = sumDays(new Date(), 3).toISOString().split('T')[0];
      const invalidReprocessingData = {
        verbose: 'true',
        queue: 'any_queue',
        routing_key: 'routing_key',
        exchange: 'any_exchange',
        initial_date: '2023-01-01',
        final_date: futureDate
      };
      try {
        const result = await getReprocessingDataSchema.validate(
          invalidReprocessingData
        );
        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data final não pode ser maior que hoje')
        );
      }
    });
  });

  describe('Date', () => {
    it('should return true when date is valid', async () => {
      const validDate = '2024-01-01';

      const result = date.isValidSync(validDate);

      expect(result).toStrictEqual(true);
    });

    it('should return false when date is not valid', async () => {
      const invalidDate = '2024-01';

      try {
        const result = await date.validate(invalidDate);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data informada não está correta')
        );
      }
    });

    it('should return true when date is empty', async () => {
      const invalidDate = 0;

      const result = date.isValidSync(invalidDate);

      expect(result).toStrictEqual(true);
    });
  });

  describe('Optional Final Date', () => {
    it('should return true when date is valid', async () => {
      const validDate = '2024-01-01';

      const result = optionalFinalDate.isValidSync(validDate);

      expect(result).toStrictEqual(true);
    });

    it('should return false when date is not valid', async () => {
      const invalidDate = '2024-01';

      try {
        const result = await optionalFinalDate.validate(invalidDate);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data informada não está correta')
        );
      }
    });

    it('should return true when date is empty', async () => {
      const invalidDate = 0;

      const result = optionalFinalDate.isValidSync(invalidDate);

      expect(result).toStrictEqual(true);
    });
  });

  describe('Optional Initial Date', () => {
    it('should return false when date is not valid', async () => {
      const invalidDate = '2024-01';

      try {
        const result = await optionalInitialDate.validate(invalidDate);

        expect(result).toStrictEqual(false);
      } catch (error) {
        expect(error).toStrictEqual(
          new ValidationError('A data informada não está correta')
        );
      }
    });

    it('should return true when date is empty', async () => {
      const invalidDate = 0;

      const result = optionalInitialDate.isValidSync(invalidDate);

      expect(result).toStrictEqual(true);
    });
  });
});
