export const makeServerErrorMock = () => ({
  statusCode: 500,
  body: {
    message: 'Ops, parece que ocorreu um erro dentro dos nossos servidores',
    payload: {},
    error: [{ message: 'Ocorreu um erro em nosso servidores' }]
  }
});

export const makeUnprocessableEntityMock = (message: string, error?: any) => ({
  statusCode: 422,
  body: {
    message,
    payload: {},
    error
  }
});

export const makeBadRequestMock = (error: string) => ({
  statusCode: 400,
  body: {
    message: 'Ops! Ocorreram alguns erros de validação',
    payload: {},
    error
  }
});

export const makeNotFoundMock = (message: string, error?: any) => ({
  statusCode: 404,
  body: {
    message,
    payload: {},
    error
  }
});

export const makeUnauthorizedMock = (message: string, error?: any) => ({
  statusCode: 401,
  body: {
    message,
    payload: {},
    error
  }
});

export const makeForbiddenMock = (message?: string, error: any = []) => ({
  statusCode: 403,
  body: {
    message: message || 'Serviço não permitido para esse usuário.',
    payload: {},
    error
  }
});
