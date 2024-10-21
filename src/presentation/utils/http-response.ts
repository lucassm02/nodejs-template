// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */

type Option = {
  close: boolean;
};

export const ok = (message: string, payload: object, options?: Option) => ({
  statusCode: 200,
  ...(options && { options }),
  body: {
    message,
    payload,
    error: []
  }
});

export const created = (
  message: string,
  payload: object,
  options?: Option
) => ({
  statusCode: 201,
  ...(options && { options }),
  body: {
    message,
    payload,
    error: []
  }
});

export const serverError = (
  _error: unknown,
  message?: string,
  options?: Option
) => {
  return {
    statusCode: 500,
    ...(options && { options }),
    body: {
      message:
        message ||
        'Ops, parece que ocorreu um erro dentro dos nossos servidores',
      payload: {},
      error: [{ message: 'Ocorreu um erro em nosso servidores' }]
    }
  };
};

export const conflict = (message: string, error?: any, options?: Option) => ({
  statusCode: 409,
  ...(options && { options }),
  body: {
    message,
    payload: {},
    error
  }
});

export const badRequest = (error?: any, options?: Option) => ({
  statusCode: 400,
  ...(options && { options }),
  body: {
    message: 'Ops! Ocorreram alguns erros de validação',
    payload: {},
    error
  }
});

export const unprocessableEntity = (
  message: string,
  error?: any,
  options?: Option
) => ({
  statusCode: 422,
  ...(options && { options }),
  body: {
    message,
    payload: {},
    error
  }
});

export const notFound = (message: string, error?: any, options?: Option) => ({
  statusCode: 404,
  ...(options && { options }),
  body: {
    message,
    payload: {},
    error
  }
});

export const unauthorized = (
  message: string,
  error?: any,
  options?: Option
) => ({
  statusCode: 401,
  ...(options && { options }),
  body: {
    message,
    payload: {},
    error
  }
});

export const internalImplementationError = (
  message: string,
  options?: Option
) => ({
  error: message,
  options
});
