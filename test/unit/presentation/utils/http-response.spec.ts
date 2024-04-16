import {
  badRequest,
  conflict,
  created,
  notFound,
  ok,
  serverError,
  unauthorized,
  unprocessableEntity
} from '@/presentation/utils';

describe('HTTP responses Function', () => {
  it('should return a model of ok response', () => {
    const result = ok('ok message', { id: 'any_id' });

    const expected = {
      body: {
        error: [],
        message: 'ok message',
        payload: {
          id: 'any_id'
        }
      },
      statusCode: 200
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of created response', () => {
    const result = created('created message', { id: 'any_id' });

    const expected = {
      body: {
        error: [],
        message: 'created message',
        payload: {
          id: 'any_id'
        }
      },
      statusCode: 201
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of serverError response', () => {
    const result = serverError('application error');

    const expected = {
      body: {
        error: [{ message: 'Ocorreu um erro em nosso servidores' }],
        message: 'Ops, parece que ocorreu um erro dentro dos nossos servidores',
        payload: {}
      },
      statusCode: 500
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of serverError response with personalized message', () => {
    const result = serverError('any_error', 'personalized message');

    const expected = {
      body: {
        error: [{ message: 'Ocorreu um erro em nosso servidores' }],
        message: 'personalized message',
        payload: {}
      },
      statusCode: 500
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of conflict response', () => {
    const result = conflict('conflict message');

    const expected = {
      body: {
        error: undefined,
        message: 'conflict message',
        payload: {}
      },
      statusCode: 409
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of conflict response with personalized error', () => {
    const result = conflict('conflict message', 'personalized error');

    const expected = {
      body: {
        error: 'personalized error',
        message: 'conflict message',
        payload: {}
      },
      statusCode: 409
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of badRequest response', () => {
    const result = badRequest();

    const expected = {
      body: {
        error: undefined,
        message: 'Ops! Ocorreram alguns erros de validação',
        payload: {}
      },
      statusCode: 400
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of badRequest response with personalized error', () => {
    const result = badRequest('personalized error');

    const expected = {
      body: {
        error: 'personalized error',
        message: 'Ops! Ocorreram alguns erros de validação',
        payload: {}
      },
      statusCode: 400
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of unprocessableEntity response', () => {
    const result = unprocessableEntity('unprocessableEntity message', {
      id: 'any_id'
    });

    const expected = {
      body: {
        error: {
          id: 'any_id'
        },
        message: 'unprocessableEntity message',
        payload: {}
      },
      statusCode: 422
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of unprocessableEntity response with personalized error', () => {
    const result = unprocessableEntity(
      'unprocessableEntity message',
      'personalized error'
    );

    const expected = {
      body: {
        error: 'personalized error',
        message: 'unprocessableEntity message',
        payload: {}
      },
      statusCode: 422
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of notFound response', () => {
    const result = notFound('notFound message', { id: 'any_id' });

    const expected = {
      body: {
        error: {
          id: 'any_id'
        },
        message: 'notFound message',
        payload: {}
      },
      statusCode: 404
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of notFound response with personalized error', () => {
    const result = notFound('notFound message', 'personalized error');

    const expected = {
      body: {
        error: 'personalized error',
        message: 'notFound message',
        payload: {}
      },
      statusCode: 404
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of unauthorized response', () => {
    const result = unauthorized('unauthorized message');

    const expected = {
      body: {
        error: undefined,
        message: 'unauthorized message',
        payload: {}
      },
      statusCode: 401
    };
    expect(result).toStrictEqual(expected);
  });

  it('should return a model of unauthorized response with personalized error', () => {
    const result = unauthorized('unauthorized message', 'personalized error');

    const expected = {
      body: {
        error: 'personalized error',
        message: 'unauthorized message',
        payload: {}
      },
      statusCode: 401
    };
    expect(result).toStrictEqual(expected);
  });
});
