import { randomUUID } from 'crypto';
import { ValidationError } from 'yup';

import { publishDataToReprocessSchema } from '@/validation/usecases';

describe('PublishDataToReprocess Yup Schema', () => {
  it('should return true when data is valid', async () => {
    const validData = { reprocessing_ids: [randomUUID()] };

    const result = publishDataToReprocessSchema.isValidSync(validData);

    expect(result).toStrictEqual(true);
  });

  it('should return true when data is empty', async () => {
    const emptyData = { reprocessing_ids: [] };

    try {
      const result = await publishDataToReprocessSchema.validate(emptyData);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError('O reprocessing_ids não pode estar vazio.')
      );
    }
  });

  it('should return true when data is an array on not uuids', async () => {
    const emptyData = { reprocessing_ids: [1, 2, 3, 'abc', '2645'] };

    try {
      const result = await publishDataToReprocessSchema.validate(emptyData);
      expect(result).toStrictEqual(false);
    } catch (error) {
      expect(error).toStrictEqual(
        new ValidationError(
          'Cada elemento do reprocessing_ids deve ser um uuid válido.'
        )
      );
    }
  });
});
