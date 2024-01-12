import * as yup from 'yup';

const uuidRegExp =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const body = yup.object().shape({
  reprocessing_ids: yup
    .array()
    .required()
    .test(
      'nonEmptyArray',
      'O reprocessing_ids não pode estar vazio',
      (value) => value && !!value.length
    )
    .test('validUUIDs', 'Cada elemento deve ser um UUID válido', (value) =>
      value.every((id) => uuidRegExp.test(id))
    )
});

export const publishDataToReprocessSchema = body;
