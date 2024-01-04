import * as yup from 'yup';

import { uuid } from '@/validation';
import { CreateExample } from '@/domain/usecases';
import { ShapeToSchema } from '@/validation/types';

export const exampleSchema = yup.object().shape({
  payment_id: uuid,
  from: yup.date(),
  to: yup.date(),
  status: yup
    .string()
    .matches(
      /^AUTHORIZED$|^DELIVERED|^UNAUTHORIZED$/,
      'O formato do consumo precisa ser "AUTHORIZED", "DELIVERED" ou "UNAUTHORIZED"'
    )
});

export const createExampleSchema: ShapeToSchema<CreateExample.Params> = yup
  .object()
  .shape({
    description: yup.string().required(),
    value: yup.string().required()
  });
