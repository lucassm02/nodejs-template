export function makeErrorDescription(param: string, message: string) {
  return [
    {
      message,
      param,
    },
  ];
}
