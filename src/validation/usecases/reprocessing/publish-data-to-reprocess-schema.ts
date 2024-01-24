import * as yup from 'yup';

const uuidRegExp =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const publishDataToReprocessSchema = yup.object().shape({
  reprocessing_ids: yup
    .array()
    .required()
    .test(
      'nonEmptyArray',
      'O reprocessing_ids não pode estar vazio.',
      (value) => value && !!value.length
    )
    .test(
      'validUUIDs',
      'Cada elemento do reprocessing_ids deve ser um uuid válido.',
      (values) => values.every((value) => uuidRegExp.test(value))
    )
});
