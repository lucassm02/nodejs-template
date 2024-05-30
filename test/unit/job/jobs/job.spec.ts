import { Job } from '@/job/jobs/job';

class SutClass extends Job {
  constructor(valuesToExtract: (string | Record<string, string>)[]) {
    super(valuesToExtract);
  }
  sutValidate(payload: any) {
    return this.extractValuesFromSources(payload);
  }
}

describe('Job ExtractValue Class', () => {
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
