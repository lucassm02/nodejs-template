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

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should validate request fields ignoring key case by default', async () => {
    const schema = yup.object().shape({
      initialDate: yup.string().required(),
      finalDate: yup.string().required(),
      storeId: yup.string().required()
    });

    await requestValidationAdapter(schema)(
      <any>{
        body: {},
        params: {},
        query: {
          INITIAL_DATE: '2026-05-12',
          final_date: '2026-05-19',
          StoreId: '238BAB40-925D-4806-BA6A-B097FC939F91'
        },
        headers: {}
      },
      <any>response,
      next,
      <any>[]
    );

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should keep key case differentiation when strict case mode is enabled', async () => {
    const schema = yup.object().shape({
      initialDate: yup.string().required('initialDate is required')
    });

    await requestValidationAdapter(schema, { caseMode: 'strict' })(
      <any>{
        body: {},
        params: {},
        query: {
          initial_date: '2026-05-12'
        },
        headers: {}
      },
      <any>response,
      next,
      <any>[]
    );

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('should require one consistent key case when strict validation strategy is enabled', async () => {
    const schema = yup.object().shape({
      firstName: yup.string().required('firstName is required'),
      last_name: yup.string().required('last_name is required')
    });

    await requestValidationAdapter(schema, { strategy: 'strict' })(
      <any>{
        body: {
          first_name: 'Ada',
          lastName: 'Lovelace'
        },
        params: {},
        query: {},
        headers: {}
      },
      <any>response,
      next,
      <any>[]
    );

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
  });

  it('should allow mixed key cases when merge validation strategy is enabled', async () => {
    const schema = yup.object().shape({
      firstName: yup.string().required(),
      last_name: yup.string().required()
    });

    await requestValidationAdapter(schema)(
      <any>{
        body: {
          first_name: 'Ada',
          lastName: 'Lovelace'
        },
        params: {},
        query: {},
        headers: {}
      },
      <any>response,
      next,
      <any>[]
    );

    expect(next).toHaveBeenCalledTimes(1);
  });
});
