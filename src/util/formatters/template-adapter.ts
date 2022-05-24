import format from 'string-template';

export function template(string: string, value: string): string;
export function template(string: string, template: object): string;
export function template(string: string, valueOrTemplate: string | object) {
  if (typeof valueOrTemplate === 'string')
    return format(string, { value: valueOrTemplate });
  return format(string, valueOrTemplate);
}
