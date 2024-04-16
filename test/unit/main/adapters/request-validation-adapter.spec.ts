import * as yup from 'yup';

import { requestValidationAdapter } from '@/main/adapters';

describe('requestValidationAdapter', () => {
  const schema = yup.object().shape({
    id: yup.string().required('O campo id é obrigatório.')
  });

  const sendMock = jest.fn();
  const statusMock = jest.fn().mockReturnValue({ send: sendMock });

  const request = {
    body: { id: 'any_valid_id' },
    params: {},
    query: {},
    headers: {}
  };
  const response = {
    status: statusMock
  };
  const next = jest.fn();

  it('should return an status code 400 with an body with formatted yup error if validation throws', async () => {
    await requestValidationAdapter(schema)(
      <any>{
        body: {},
        params: {},
        query: {},
        headers: {}
      },
      <any>response,
      next,
      <any>[]
    );
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(statusMock).toHaveBeenCalledTimes(1);

    expect(sendMock).toHaveBeenCalledWith({
      message: 'Ops! Ocorreram alguns erros de validação',
      payload: {},
      error: [
        {
          param: 'id',
          message: 'O campo id é obrigatório.'
        }
      ]
    });
    expect(statusMock).toHaveBeenCalledWith(400);
  });
  it('should call next if validation process works correctly', async () => {
    await requestValidationAdapter(schema)(
      <any>request,
      <any>response,
      next,
      <any>[]
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
