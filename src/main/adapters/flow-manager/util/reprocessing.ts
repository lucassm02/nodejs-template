import { normalizeReprocessingPayload } from '@/job/util';

import { Option } from '../flow-manager-adapter';

type Args = [Record<string, unknown>, [Record<string, unknown>, Function]];

export function normalize(callback: Function) {
  return (...args: Args) => {
    normalizeReprocessingPayload(...args);
    return callback(...args);
  };
}

export function normalizeOptions(options: Option[]): Option[];
export function normalizeOptions(
  firstOption: Option,
  ...options: Option[]
): Option[];
export function normalizeOptions(
  arg1: Option[] | Option,
  ...restOfOptions: Option[]
) {
  const firstOptions = Array.isArray(arg1) ? arg1 : [arg1];
  const options = [...firstOptions, ...restOfOptions];

  return options.map((option) => {
    const { strict } = option;

    const handler = normalize(option.handler);

    const when =
      typeof option.when === 'function'
        ? normalize(option.when)
        : option.handler;

    return { when, handler, strict };
  });
}
