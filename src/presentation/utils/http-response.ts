// TODO: We should seek better alternatives in the future, but for now, it's not a problem.
/* eslint-disable @typescript-eslint/no-explicit-any */

type Optional = {
  close: boolean;
};

export const ok = (message: string, payload: object, options?: Optional) => ({
  statusCode: 200,
  options,
  body: {
    message,
    payload,
    error: []
  }
});

export const created = (
  message: string,
  payload: object,
  options?: Optional
) => ({
  statusCode: 201,
  options,
  body: {
    message,
    payload,
    error: []
  }
});

export const serverError = (
  _error: unknown,
  message?: string,
  options?: Optional
) => {
  return {
    statusCode: 500,
    options,
    body: {
      message:
        message ||
        'Ops, parece que ocorreu um erro dentro dos nossos servidores',
      payload: {},
      error: [{ message: 'Ocorreu um erro em nosso servidores' }]
    }
  };
};

export const conflict = (message: string, error?: any, options?: Optional) => ({
  statusCode: 409,
  options,
  body: {
    message,
    payload: {},
    error
  }
});

export const badRequest = (error?: any, options?: Optional) => ({
  statusCode: 400,
  options,
  body: {
    message: 'Ops! Ocorreram alguns erros de validação',
    payload: {},
    error
  }
});

export const unprocessableEntity = (
  message: string,
  error?: any,
  options?: Optional
) => ({
  statusCode: 422,
  options,
  body: {
    message,
    payload: {},
    error
  }
});

export const notFound = (message: string, error?: any, options?: Optional) => ({
  statusCode: 404,
  options,
  body: {
    message,
    payload: {},
    error
  }
});

export const unauthorized = (
  message: string,
  error?: any,
  options?: Optional
) => ({
  statusCode: 401,
  options,
  body: {
    message,
    payload: {},
    error
  }
});

export const internalImplementationError = (
  message: string,
  options?: Optional
) => ({
  error: message,
  options
});
