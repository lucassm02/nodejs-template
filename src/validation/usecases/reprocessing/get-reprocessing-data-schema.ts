import * as yup from 'yup';
import { addHours, isBefore, isDate, isPast } from 'date-fns';

import { string } from '@/validation';

export const date = yup
  .mixed()
  .test('is-date', 'A data informada não está correta', function (value) {
    if (!value) return true;

    if (!/^([\d]{4})-([\d]{2})-([\d]{2})$/.test(<string>value)) {
      return false;
    }

    return isDate(new Date(<string>value));
  });

const optionalFinalDate = date.test(
  'is-big',
  'A data final não pode ser maior que hoje',
  function (value) {
    if (!value) return true;
    return isPast(addHours(new Date(<string>value), 3));
  }
);

export const optionalInitialDate = date.test(
  'initial-final-date',
  'A data inicial não pode ser maior que a final',
  function (value) {
    if (!value) return true;

    const final = new Date(`${this.parent.final_date} 23:59:59`);
    const initial = new Date(addHours(new Date(<string>value), 3));

    return isBefore(initial, final);
  }
);

export const getReprocessingDataSchema = yup.object().shape({
  verbose: yup
    .string()
    .notRequired()
    .test('is-boolean', 'O verbose deve ser um boolean', (value) => {
      return value ? value === 'true' || value === 'false' : true;
    }),
  queue: string.notRequired(),
  routing_key: string.notRequired(),
  exchange: string.notRequired(),
  initial_date: optionalInitialDate,
  final_date: optionalFinalDate
});
