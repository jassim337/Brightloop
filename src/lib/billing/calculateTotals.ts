/**
 * @file src/lib/billing/calculateTotals.ts
 * @description Pure calculation engine for billing totals, discounts, taxes, and net invoices.
 * 
 * CALCULATION ORDER & ROUNDING RULES:
 * 1. Subtotal: Sum of (unitPriceInPaise * quantity) for all line items, OR direct subtotal in paise.
 * 2. Discount Amount:
 *    - FIXED: Direct amount in paise.
 *    - PERCENTAGE: Rounded half-up from (subtotal * basisPoints / 10,000).
 *    - If discount exceeds subtotal, the applied discount is capped at subtotal, ensuring taxable amount is never negative.
 * 3. Taxable Amount: Math.max(0, subtotalInPaise - discountAmountInPaise).
 * 4. Tax Amount: Rounded half-up from (taxableAmount * taxRateBasisPoints / 10,000).
 * 5. Final Total: taxableAmountInPaise + taxAmountInPaise.
 */

import {
  Paise,
  BasisPoints,
  BASIS_POINTS_DIVISOR,
  assertValidPaise,
  roundPaise,
} from "../money";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface PercentageDiscount {
  type: "PERCENTAGE";
  /**
   * Discount percentage expressed in basis points.
   * 1% = 100 bps, 10% = 1,000 bps, 100% = 10,000 bps.
   */
  basisPoints: BasisPoints;
}

export interface FixedDiscount {
  type: "FIXED";
  /**
   * Fixed discount amount in integer paise.
   */
  amountInPaise: Paise;
}

export type DiscountConfig = PercentageDiscount | FixedDiscount;

export interface BillingLineItem {
  id?: string;
  name?: string;
  /**
   * Must be a positive integer (>= 1).
   */
  quantity: number;
  /**
   * Unit price in integer paise (non-negative).
   */
  unitPriceInPaise: Paise;
}

export interface CalculateTotalsInput {
  /**
   * Line items to calculate the subtotal from.
   * If provided, takes precedence over `subtotalInPaise`.
   */
  items?: BillingLineItem[];

  /**
   * Direct subtotal in integer paise. Used when `items` is not provided.
   */
  subtotalInPaise?: Paise;

  /**
   * Optional discount configuration (Percentage in basis points OR Fixed in paise).
   */
  discount?: DiscountConfig | null;

  /**
   * Tax rate in basis points (e.g. 1800 for 18% GST).
   * Defaults to 0 (no tax).
   */
  taxRateBasisPoints?: BasisPoints;
}

export interface BillingTotals {
  /**
   * Gross subtotal before discounts and taxes, in integer paise.
   */
  subtotalInPaise: Paise;

  /**
   * Applied discount amount in integer paise (never exceeds subtotal).
   */
  discountAmountInPaise: Paise;

  /**
   * Amount subject to taxation in integer paise: max(0, subtotal - discount).
   */
  taxableAmountInPaise: Paise;

  /**
   * Tax amount calculated on the taxable amount, in integer paise.
   */
  taxAmountInPaise: Paise;

  /**
   * Final payable total in integer paise: (taxableAmount + taxAmount).
   */
  totalInPaise: Paise;

  /**
   * The tax rate applied in basis points.
   */
  taxRateBasisPoints: BasisPoints;
}

/**
 * Pure calculation function to determine billing totals, discounts, taxes, and final payable amount.
 * 
 * Deterministic, database-free, and handles all rounding strictly in integer paise.
 * 
 * @param input - Calculation parameters (items/subtotal, discount, tax rate)
 * @returns Deterministic BillingTotals object in integer paise
 * @throws {TypeError} If inputs contain invalid numbers, negative prices, or invalid quantities.
 */
export function calculateTotals(input: CalculateTotalsInput): BillingTotals {
  if (!input || typeof input !== "object") {
    throw new TypeError("[calculateTotals] Input must be a valid configuration object.");
  }

  // 1. Determine and validate Subtotal
  let subtotalInPaise = 0;

  if (Array.isArray(input.items) && input.items.length > 0) {
    for (const item of input.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new TypeError(`[calculateTotals] Item quantity must be a positive integer, received: ${item.quantity}`);
      }
      assertValidPaise(item.unitPriceInPaise, "item.unitPriceInPaise");
      if (item.unitPriceInPaise < 0) {
        throw new RangeError(`[calculateTotals] Unit price cannot be negative, received: ${item.unitPriceInPaise}`);
      }
      subtotalInPaise += item.unitPriceInPaise * item.quantity;
    }
  } else if (input.subtotalInPaise !== undefined) {
    assertValidPaise(input.subtotalInPaise, "subtotalInPaise");
    if (input.subtotalInPaise < 0) {
      throw new RangeError(`[calculateTotals] Subtotal cannot be negative, received: ${input.subtotalInPaise}`);
    }
    subtotalInPaise = input.subtotalInPaise;
  } else {
    // If no items and no subtotal provided, subtotal defaults to 0
    subtotalInPaise = 0;
  }

  // 2. Calculate Discount Amount
  let rawDiscountAmount = 0;

  if (input.discount) {
    if (input.discount.type === "FIXED") {
      assertValidPaise(input.discount.amountInPaise, "discount.amountInPaise");
      if (input.discount.amountInPaise < 0) {
        throw new RangeError(`[calculateTotals] Fixed discount amount cannot be negative, received: ${input.discount.amountInPaise}`);
      }
      rawDiscountAmount = input.discount.amountInPaise;
    } else if (input.discount.type === "PERCENTAGE") {
      const bps = input.discount.basisPoints;
      if (typeof bps !== "number" || !Number.isFinite(bps) || bps < 0) {
        throw new TypeError(`[calculateTotals] Discount basis points must be a non-negative number, received: ${bps}`);
      }
      rawDiscountAmount = roundPaise((subtotalInPaise * bps) / BASIS_POINTS_DIVISOR);
    } else {
      throw new TypeError(`[calculateTotals] Unsupported discount type: ${(input.discount as { type?: unknown }).type}`);
    }
  }

  // Ensure discount never exceeds subtotal (never allow negative taxable amount)
  const discountAmountInPaise = Math.min(rawDiscountAmount, subtotalInPaise);

  // 3. Calculate Taxable Amount
  const taxableAmountInPaise = Math.max(0, subtotalInPaise - discountAmountInPaise);

  // 4. Calculate Tax Amount
  const taxRateBasisPoints = input.taxRateBasisPoints ?? 0;
  if (typeof taxRateBasisPoints !== "number" || !Number.isFinite(taxRateBasisPoints) || taxRateBasisPoints < 0) {
    throw new TypeError(`[calculateTotals] Tax rate basis points must be a non-negative number, received: ${taxRateBasisPoints}`);
  }

  const taxAmountInPaise =
    taxRateBasisPoints > 0
      ? roundPaise((taxableAmountInPaise * taxRateBasisPoints) / BASIS_POINTS_DIVISOR)
      : 0;

  // 5. Final Total
  const totalInPaise = taxableAmountInPaise + taxAmountInPaise;

  return {
    subtotalInPaise,
    discountAmountInPaise,
    taxableAmountInPaise,
    taxAmountInPaise,
    totalInPaise,
    taxRateBasisPoints,
  };
}
