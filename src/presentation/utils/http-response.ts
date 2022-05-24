export const ok = (message: string, payload: object) => ({
  statusCode: 200,
  body: {
    message,
    payload,
    error: [],
  },
});

export const created = (message: string, payload: object) => ({
  statusCode: 201,
  body: {
    message,
    payload,
    error: [],
  },
});

export const serverError = (error: any, message?: string) => {
  return {
    statusCode: 500,
    body: {
      message:
        message ||
        'Ops, parece que ocorreu um erro dentro dos nossos servidores',
      payload: {},
      error: [{ message: 'Ocorreu um erro em nosso servidores' }],
    },
  };
};

export const conflict = (message: string, error?: any) => ({
  statusCode: 409,
  body: {
    message,
    payload: {},
    error,
  },
});

export const badRequest = (error?: any) => ({
  statusCode: 400,
  body: {
    message: 'Ops, ocorreram alguns erros de validações',
    payload: {},
    error,
  },
});

export const unprocessableEntity = (message: string, error?: any) => ({
  statusCode: 422,
  body: {
    message,
    payload: {},
    error,
  },
});

export const notFound = (message: string, error?: any) => ({
  statusCode: 404,
  body: {
    message,
    payload: {},
    error,
  },
});

export const unauthorized = (message: string, error?: any) => ({
  statusCode: 401,
  body: {
    message,
    payload: {},
    error,
  },
});
