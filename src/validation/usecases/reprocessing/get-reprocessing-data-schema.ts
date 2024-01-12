import * as yup from 'yup';

import { string } from '@/validation';

export const getReprocessingDataSchema = yup.object().shape({
  verbose: yup
    .mixed()
    .notRequired()
    .test(
      'is-boolean',
      'O verbose deve ser um boolean.',
      (value) => typeof value === 'boolean'
    ),
  queue: string.notRequired(),
  routing_key: string.notRequired(),
  exchange: string.notRequired()
});
