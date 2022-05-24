import { uuid } from '@/validation';
import * as yup from 'yup';

export const example = yup.object().shape({
  payment_id: uuid,
  from: yup.date(),
  to: yup.date(),
  status: yup
    .string()
    .matches(
      /^AUTHORIZED$|^DELIVERED|^UNAUTHORIZED$/,
      'O formato do consumo precisa ser "AUTHORIZED", "DELIVERED" ou "UNAUTHORIZED"'
    ),
});
