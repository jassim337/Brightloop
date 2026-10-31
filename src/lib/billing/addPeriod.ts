/**
 * @file src/lib/billing/addPeriod.ts
 * @description Date utility for calculating subscription billing renewal dates.
 * 
 * MONTH-END AND LEAP YEAR RESOLUTION RULES:
 * 1. Immutability: The input `Date` instance is never mutated; a fresh `Date` instance is returned.
 * 2. Time Preservation: Hours, minutes, seconds, and milliseconds are strictly preserved.
 * 3. Month Clamping (Anti-Drift):
 *    - In standard JavaScript, adding 1 month to January 31 evaluates to March 2 or 3 (31 days past Jan 31).
 *    - In Brightloop, month-end dates are clamped to the last valid day of the target month:
 *      * Jan 31 + 1 Month (leap year, e.g. 2024) => Feb 29
 *      * Jan 31 + 1 Month (common year, e.g. 2025) => Feb 28
 *      * Mar 31 + 1 Month => Apr 30
 *      * May 31 + 1 Month => Jun 30
 * 4. Leap Year Resolution:
 *    - Feb 29 + 1 Year (common year, e.g. 2025) => Feb 28
 *    - Feb 29 + 4 Years (leap year, e.g. 2028) => Feb 29
 */

export type BillingPeriod =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

/**
 * Returns the number of days in a given year and month.
 *
 * @param year - Full 4-digit year (e.g. 2024)
 * @param monthIndex - 0-indexed month (0 = January, 1 = February, ..., 11 = December)
 * @returns Total days in that month (28, 29, 30, or 31)
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Checks whether a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Adds a billing period to a date, returning a new Date without mutating the original.
 * Correctly clamps month-ends and leap-year dates to prevent date drift.
 *
 * @param date - The initial starting Date
 * @param period - The billing period ("DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY")
 * @param count - The number of periods to advance (default: 1). Can be negative.
 * @returns A new Date advanced by the specified period with exact time preserved
 * @throws {TypeError} If date is not a valid Date instance or count is not an integer.
 *
 * @example
 * addPeriod(new Date("2025-01-31T10:00:00Z"), "MONTHLY") // => 2025-02-28T10:00:00Z
 * addPeriod(new Date("2024-02-29T15:30:00Z"), "YEARLY")  // => 2025-02-28T15:30:00Z
 */
export function addPeriod(
  date: Date,
  period: BillingPeriod,
  count: number = 1
): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("[addPeriod] Expected a valid Date instance.");
  }

  if (!Number.isInteger(count)) {
    throw new TypeError(`[addPeriod] Period count must be an integer, received: ${count}`);
  }

  if (count === 0) {
    return new Date(date.getTime());
  }

  const normalizedPeriod = period.toUpperCase() as BillingPeriod;

  // Extract time components to preserve exact time of day
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ms = date.getMilliseconds();

  switch (normalizedPeriod) {
    case "DAILY": {
      const result = new Date(date.getTime());
      result.setDate(result.getDate() + count);
      return result;
    }

    case "WEEKLY": {
      const result = new Date(date.getTime());
      result.setDate(result.getDate() + count * 7);
      return result;
    }

    case "MONTHLY":
    case "QUARTERLY": {
      const monthMultiplier = normalizedPeriod === "QUARTERLY" ? 3 : 1;
      const totalMonthsToAdd = count * monthMultiplier;

      const origYear = date.getFullYear();
      const origMonth = date.getMonth(); // 0-indexed
      const origDay = date.getDate();

      const targetTotalMonths = origMonth + totalMonthsToAdd;
      const targetYear = origYear + Math.floor(targetTotalMonths / 12);
      const targetMonth = ((targetTotalMonths % 12) + 12) % 12;

      // Clamp day to max days available in target month
      const maxDaysInTargetMonth = getDaysInMonth(targetYear, targetMonth);
      const targetDay = Math.min(origDay, maxDaysInTargetMonth);

      return new Date(
        targetYear,
        targetMonth,
        targetDay,
        hours,
        minutes,
        seconds,
        ms
      );
    }

    case "YEARLY": {
      const origYear = date.getFullYear();
      const origMonth = date.getMonth();
      const origDay = date.getDate();

      const targetYear = origYear + count;

      // Handle February 29 on leap years moving to common years (e.g. 2024 -> 2025)
      const maxDaysInTargetMonth = getDaysInMonth(targetYear, origMonth);
      const targetDay = Math.min(origDay, maxDaysInTargetMonth);

      return new Date(
        targetYear,
        origMonth,
        targetDay,
        hours,
        minutes,
        seconds,
        ms
      );
    }

    default: {
      throw new TypeError(`[addPeriod] Unsupported billing period: ${period}`);
    }
  }
}
