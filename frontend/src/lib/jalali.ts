/**
 * Persian / Jalali Calendar & Scheduling Utilities.
 * Zero-dependency, native Intl-backed, compliant with Persian typography & anti-slop rules.
 */

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const PERSIAN_WEEKDAY_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const;

export const PERSIAN_WEEKDAY_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;

export function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => farsiDigits[parseInt(d, 10)]);
}

export interface JalaliDateInfo {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 31
  monthName: string;
  dayOfWeekIndex: number; // 0 = شنبه, 6 = جمعه
  dayOfWeekName: string;
  dateObj: Date;
}

export function gregorianToJalali(date: Date = new Date()): JalaliDateInfo {
  const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  let year = 1405;
  let month = 1;
  let day = 1;

  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
    if (part.type === 'day') day = parseInt(part.value, 10);
  }

  // JS getDay(): 0 is Sunday, 6 is Saturday.
  // Saturday in Iran is index 0. Sunday is index 1 ... Friday is index 6.
  const dayOfWeekIndex = (date.getDay() + 1) % 7;
  const dayOfWeekName = PERSIAN_WEEKDAY_NAMES[dayOfWeekIndex];
  const monthName = PERSIAN_MONTH_NAMES[month - 1] || 'فروردین';

  return {
    year,
    month,
    day,
    monthName,
    dayOfWeekIndex,
    dayOfWeekName,
    dateObj: date,
  };
}

export function isJalaliLeapYear(year: number): boolean {
  const leapYearsRemainders = [1, 5, 9, 13, 17, 22, 26, 30];
  return leapYearsRemainders.includes(year % 33);
}

export function getDaysInJalaliMonth(year: number, month: number): number {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

/**
 * Builds the calendar matrix for a given Jalali month.
 * Returns an array of days including empty padding slots for preceding weekdays.
 */
export interface JalaliCalendarDay {
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeekIndex: number; // 0 (Sat) to 6 (Fri)
  jalaliStr: string; // e.g. "1405/08/15"
  gregorianDate?: Date;
}

export function generateJalaliMonthGrid(year: number, month: number, referenceToday: Date = new Date()): {
  year: number;
  month: number;
  monthName: string;
  days: (JalaliCalendarDay | null)[];
} {
  const totalDays = getDaysInJalaliMonth(year, month);
  const todayInfo = gregorianToJalali(referenceToday);

  // Approximate day of week for 1st of this month by stepping from today
  const dayOffsetFromToday = (1 - todayInfo.day);
  const approxFirstOfMonth = new Date(referenceToday.getTime() + dayOffsetFromToday * 86400000);
  const firstDayInfo = gregorianToJalali(approxFirstOfMonth);

  // Padding cells before day 1 (so Saturday aligns with index 0)
  const paddingBefore = firstDayInfo.dayOfWeekIndex;
  const days: (JalaliCalendarDay | null)[] = [];

  for (let i = 0; i < paddingBefore; i++) {
    days.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    const isToday = todayInfo.year === year && todayInfo.month === month && todayInfo.day === d;
    const dayOfWeekIndex = (paddingBefore + (d - 1)) % 7;
    const mStr = month < 10 ? `0${month}` : `${month}`;
    const dStr = d < 10 ? `0${d}` : `${d}`;

    days.push({
      dayNumber: d,
      isCurrentMonth: true,
      isToday,
      dayOfWeekIndex,
      jalaliStr: `${year}/${mStr}/${dStr}`,
    });
  }

  return {
    year,
    month,
    monthName: PERSIAN_MONTH_NAMES[month - 1] || '',
    days,
  };
}
