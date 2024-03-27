import * as yup from 'yup';

import { ExtractValues } from '@/plugin';
import { YupSchema } from '@/presentation/protocols';

type ValidationParams = {
  schema: YupSchema;
  exception?: string | Error;
};

class SutClass extends ExtractValues {
  constructor(valuesToExtract: (string | Record<string, string>)[]) {
    super(valuesToExtract);
  }
  sutValidate(payload: any, option?: ValidationParams) {
    return this.extractValuesFromSources(payload, option);
  }
}

describe('Extract Values Plugin', () => {
  it('should extract values from state when condition is in an array', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([
      'request.body.item',
      'state.get.item'
    ]).sutValidate({ request, state });

    expect(result.item).toBe('my_state_item');
  });

  it('should extract values from request when condition is in an array', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([
      'state.get.item',
      'request.body.item'
    ]).sutValidate({ request, state });

    expect(result.item).toBe('my_request_item');
  });

  it('should extract values from request when condition is in an object', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([{ item: 'request.body.item' }]).sutValidate({
      request,
      state
    });

    expect(result.item).toBe('my_request_item');
  });

  it('should extract values from state when condition is in an object', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([{ item: 'request.body.item' }]).sutValidate({
      request,
      state
    });

    expect(result.item).toBe('my_request_item');
  });

  it('should extract values from state and request when condition is in an object', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([
      { requestItem: 'request.body.item' },
      { stateItem: 'state.get.item' }
    ]).sutValidate({
      request,
      state
    });

    expect(result.requestItem).toBe('my_request_item');
    expect(result.stateItem).toBe('my_state_item');
  });

  it('should throw error when values not match with schema without exception', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    try {
      const result = new SutClass([
        { requestItem: 'request.body.item' },
        { stateItem: 'state.get.item' }
      ]).sutValidate(
        {
          request,
          state
        },
        {
          schema: yup.object({
            requestItem: yup.number()
          })
        }
      );
      expect(result.requestItem).toBe('my_request_item');
      expect(result.stateItem).toBe('my_state_item');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should throw error when values not match with schema with exception', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    try {
      const result = new SutClass([
        { requestItem: 'request.body.item' },
        { stateItem: 'state.get.item' }
      ]).sutValidate(
        {
          request,
          state
        },
        {
          schema: yup.object({
            requestItem: yup.number()
          }),
          exception: 'requestItem must be number'
        }
      );
      expect(result.requestItem).toBe('my_request_item');
      expect(result.stateItem).toBe('my_state_item');
    } catch (error) {
      expect(error.message).toBe('requestItem must be number');
    }
  });

  it('should extract values from state and request with schema', () => {
    const request = { body: { item: 1 } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([
      { requestItem: 'request.body.item' },
      { stateItem: 'state.get.item' }
    ]).sutValidate(
      {
        request,
        state
      },
      {
        schema: yup.object({
          requestItem: yup.number(),
          stateItem: yup.string()
        }),
        exception: 'requestItem must be number'
      }
    );

    expect(result.requestItem).toBe(1);
    expect(result.stateItem).toBe('my_state_item');
  });

  it('should return empty when values target is diff do request and state', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([
      'response.body.item',
      'data.get.item'
    ]).sutValidate({
      request,
      state
    });

    expect(result).toStrictEqual({});
  });

  it('should extract value when first value was founded and second not', () => {
    const request = { body: { item: 'my_request_body_item' } };

    const result = new SutClass([
      'request.body.item',
      'request.params.item'
    ]).sutValidate({
      request
    });

    const expected = { item: 'my_request_body_item' };
    expect(result).toStrictEqual(expected);
  });

  it('should return empty when values to extract is not valid as string', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass(['request.body.', 'state.get.']).sutValidate({
      request,
      state
    });

    expect(result).toStrictEqual({});
  });

  it('should return empty when values to extract is not valid as object', () => {
    const request = { body: { item: 'my_request_item' } };
    const state = { get: { item: 'my_state_item' } };

    const result = new SutClass([{}]).sutValidate({
      request,
      state
    });

    expect(result).toStrictEqual({});
  });
});
