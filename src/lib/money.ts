/**
 * @file src/lib/money.ts
 * @description Core monetary utilities for Brightloop Billing Engine.
 * 
 * DESIGN PRINCIPLES:
 * 1. Monetary amounts are stored and calculated strictly as integer `Paise` (minor units, 1 INR = 100 Paise).
 * 2. Floating-point arithmetic is strictly avoided for balance and ledger operations.
 * 3. All conversions between Rupees and Paise are guarded with rigorous runtime validation.
 * 4. Half-up rounding is applied deterministically when converting fractional calculations to integer paise.
 */

/**
 * Represents an integer monetary amount in Indian Paise (1/100th of an Indian Rupee).
 * 1 Rupee = 100 Paise. Example: ₹10.50 is represented as 1050 Paise.
 */
export type Paise = number;

/**
 * Represents a monetary amount in Indian Rupees (major currency unit).
 */
export type Rupees = number;

/**
 * Basis points unit: 1% = 100 basis points, 100% = 10,000 basis points.
 */
export type BasisPoints = number;

export const BASIS_POINTS_DIVISOR = 10_000;
export const PAISE_PER_RUPEE = 100;

/**
 * Asserts that a given value is a safe, finite integer representing Paise.
 *
 * @param value - The value to validate.
 * @param paramName - Optional context name for the error message.
 * @throws {TypeError} If value is not a finite integer.
 */
export function assertValidPaise(value: unknown, paramName: string = "amount"): asserts value is Paise {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new TypeError(
      `[assertValidPaise] Invalid ${paramName}: Expected a safe integer in paise, received: ${value} (${typeof value})`
    );
  }
}

/**
 * Validates whether a given value is an integer Paise.
 */
export function isValidPaise(value: unknown): value is Paise {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);
}

/**
 * Safely converts an amount in Rupees (major unit) to Paise (integer minor unit).
 * Handles numbers and numeric strings, applying half-up rounding for sub-paise fractions.
 *
 * @param rupees - Amount in Rupees (e.g., 10.50, "10.50", 499)
 * @returns Integer amount in Paise (e.g., 1050, 49900)
 * @throws {TypeError} If rupees is NaN, Infinite, non-numeric, or null/undefined.
 *
 * @example
 * rupeesToPaise(10.50)  // => 1050
 * rupeesToPaise("499")  // => 49900
 * rupeesToPaise(1.14)   // => 114
 */
export function rupeesToPaise(rupees: number | string): Paise {
  if (rupees === null || rupees === undefined || (typeof rupees === "string" && rupees.trim() === "")) {
    throw new TypeError("[rupeesToPaise] Input cannot be null, undefined, or empty string.");
  }

  const num = typeof rupees === "string" ? Number(rupees) : rupees;

  if (typeof num !== "number" || !Number.isFinite(num) || Number.isNaN(num)) {
    throw new TypeError(`[rupeesToPaise] Invalid rupee amount: expected finite number or numeric string, received: ${rupees}`);
  }

  // To prevent floating-point multiplication anomalies (e.g. 1.14 * 100 = 113.99999999999999),
  // we apply standard Math.round to the scaled product.
  return Math.round(num * PAISE_PER_RUPEE);
}

/**
 * Converts an integer amount in Paise (minor unit) to Rupees (major unit).
 *
 * @param paise - Integer amount in Paise (e.g., 1050)
 * @returns Amount in Rupees (e.g., 10.5)
 * @throws {TypeError} If paise is not a valid integer.
 *
 * @example
 * paiseToRupees(1050)  // => 10.5
 * paiseToRupees(49900) // => 499
 */
export function paiseToRupees(paise: Paise): Rupees {
  assertValidPaise(paise, "paise");
  return paise / PAISE_PER_RUPEE;
}

/**
 * Deterministically rounds a fractional paise value to the nearest integer paise using half-up rounding.
 *
 * @param fractionalPaise - The fractional paise value (e.g. from rate multiplication)
 * @returns Rounded integer in Paise
 * @throws {TypeError} If fractionalPaise is not a finite number.
 */
export function roundPaise(fractionalPaise: number): Paise {
  if (typeof fractionalPaise !== "number" || !Number.isFinite(fractionalPaise) || Number.isNaN(fractionalPaise)) {
    throw new TypeError(`[roundPaise] Expected a finite number, received: ${fractionalPaise}`);
  }
  return Math.round(fractionalPaise);
}

/**
 * Multiplies an integer Paise amount by a rate in basis points (1% = 100 bps)
 * and returns the rounded integer Paise result.
 *
 * @param amountInPaise - Base amount in integer paise
 * @param basisPoints - Rate in basis points (e.g., 1800 for 18% GST)
 * @returns Result in integer paise
 */
export function multiplyByBasisPoints(amountInPaise: Paise, basisPoints: BasisPoints): Paise {
  assertValidPaise(amountInPaise, "amountInPaise");
  if (typeof basisPoints !== "number" || !Number.isFinite(basisPoints)) {
    throw new TypeError(`[multiplyByBasisPoints] Expected finite basis points, received: ${basisPoints}`);
  }
  return roundPaise((amountInPaise * basisPoints) / BASIS_POINTS_DIVISOR);
}

export interface FormatINROptions {
  /**
   * Whether to include the paise fraction even if it is .00 (default: true).
   * If false and paise is 0, outputs e.g. ₹500 instead of ₹500.00.
   */
  showZeroPaise?: boolean;
}

/**
 * Formats an amount in integer Paise to standard Indian Rupee notation (e.g. ₹1,50,000.00).
 * Uses the Indian numbering system grouping (lakhs and crores).
 *
 * @param paise - Integer amount in Paise
 * @param options - Optional formatting configuration
 * @returns Formatted currency string
 * @throws {TypeError} If paise is not a valid integer.
 *
 * @example
 * formatINR(15000000) // => "₹1,50,000.00"
 * formatINR(49900)    // => "₹499.00"
 */
export function formatINR(paise: Paise, options?: FormatINROptions): string {
  assertValidPaise(paise, "paise");

  const rupees = paise / PAISE_PER_RUPEE;
  const isExactRupee = paise % PAISE_PER_RUPEE === 0;
  const showFraction = options?.showZeroPaise !== false || !isExactRupee;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
