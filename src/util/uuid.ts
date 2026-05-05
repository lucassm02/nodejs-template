import { randomUUID } from 'node:crypto';

export const generateUuid = () => {
  return randomUUID().toUpperCase();
};
