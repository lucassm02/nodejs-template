import {
  addBusinessDays,
  addDays,
  addMinutes,
  format,
  fromUnixTime,
  getUnixTime,
  isAfter as dateIsAfter,
  subBusinessDays as dateFnsSubBusinessDays,
  subDays as dateFnsSubDays,
} from 'date-fns';

export const convertUnixToDate = (unixTime: number): Date => {
  return fromUnixTime(unixTime);
};

export const convertDateToUnix = (date: Date): number => {
  return getUnixTime(date);
};

export const isAfter = (after: Date, before: Date): boolean => {
  return dateIsAfter(after, before);
};

export const sumDays = (date: Date, days: number) => {
  return addDays(date, days);
};

export const subDays = (date: Date, days: number) => {
  return dateFnsSubDays(date, days);
};

export const sumMinutes = (date: Date, days: number) => {
  return addMinutes(date, days);
};

export const formatDate = (date: Date, design: string) => {
  return format(date, design);
};

export const formatToMilliseconds = (date: Date) => {
  return date.getTime();
};

export const sumBusinessDays = (date: Date, num: number) => {
  return addBusinessDays(date, num);
};

export const subBusinessDays = (date: Date, num: number) => {
  return dateFnsSubBusinessDays(date, num);
};
