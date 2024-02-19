import {
  isDateValid,
  convertUnixToDate,
  convertDateToUnix,
  isAfter,
  sumDays,
  subDays,
  sumMinutes,
  formatDate,
  formatToMilliseconds,
  sumBusinessDays,
  subBusinessDays
} from '@/util';

describe('Date Utility Functions', () => {
  it('isDateValid should return true for a valid date', () => {
    const validDate = new Date();
    expect(isDateValid(validDate)).toBe(true);
  });

  it('isDateValid should return false for an invalid date', () => {
    const invalidDate = new Date('invalid');
    expect(isDateValid(invalidDate)).toBe(false);
  });

  it('convertUnixToDate should convert Unix time to Date', () => {
    const unixTime = 1706745017;
    const expectedDate = new Date(unixTime * 1000);
    expect(convertUnixToDate(unixTime)).toEqual(expectedDate);
  });

  it('convertDateToUnix should convert Date to Unix time', () => {
    const inputDate = new Date('2024-01-31');
    const expectedUnixTime = Math.floor(inputDate.getTime() / 1000);
    expect(convertDateToUnix(inputDate)).toEqual(expectedUnixTime);
  });

  it('isAfter should return true if the first date is after the second date', () => {
    const date1 = new Date('2024-02-01');
    const date2 = new Date('2024-01-31');
    expect(isAfter(date1, date2)).toBe(true);
  });

  it('sumDays should add the specified number of days to the date', () => {
    const startDate = new Date('2024-01-01');
    const expectedDate = new Date('2024-01-06');
    expect(sumDays(startDate, 5)).toEqual(expectedDate);
  });

  it('subDays should subtract the specified number of days from the date', () => {
    const startDate = new Date('2024-01-10');
    const expectedDate = new Date('2024-01-05');
    expect(subDays(startDate, 5)).toEqual(expectedDate);
  });

  it('sumMinutes should add the specified number of minutes to the date', () => {
    const startDate = new Date('2024-01-01T12:00:00');
    const expectedDate = new Date('2024-01-01T12:30:00');
    expect(sumMinutes(startDate, 30)).toEqual(expectedDate);
  });

  it('formatDate should format the date according to the specified design', () => {
    const inputDate = new Date('2024-01-31 23:59:59');
    const expectedFormattedDate = '2024-01-31';
    expect(formatDate(inputDate, 'yyyy-MM-dd')).toEqual(expectedFormattedDate);
  });

  it('formatToMilliseconds should return the timestamp in milliseconds', () => {
    const inputDate = new Date('2024-01-01T12:00:00');
    const expectedMilliseconds = inputDate.getTime();
    expect(formatToMilliseconds(inputDate)).toEqual(expectedMilliseconds);
  });

  it('sumBusinessDays should add the specified number of business days to the date', () => {
    const startDate = new Date('2024-01-10');
    const expectedDate = new Date('2024-01-13');
    expect(sumBusinessDays(startDate, 3)).toEqual(expectedDate);
  });

  it('subBusinessDays should subtract the specified number of business days from the date', () => {
    const startDate = new Date('2024-01-31');
    const expectedDate = new Date('2024-01-26');
    expect(subBusinessDays(startDate, 3)).toEqual(expectedDate);
  });
});
