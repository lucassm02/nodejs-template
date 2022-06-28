export const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const truncateString = (text: string, number: number) => {
  if (text.length <= number) return text;

  return text.slice(0, number);
};

export const isJson = (string: string): boolean => {
  try {
    JSON.parse(string);
    return true;
  } catch (error) {
    return false;
  }
};

export const convertBase64ToString = (base64: string): string => {
  const buffer = Buffer.from(base64, 'base64');
  return buffer.toString('ascii');
};

export const convertStringToBase64 = (text: string): string => {
  const buffer = Buffer.from(text);
  return buffer.toString('base64');
};

export const stringToBoolean = (value: string | undefined) =>
  String(value).toLowerCase() === 'true';
