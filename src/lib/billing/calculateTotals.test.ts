import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateTotals } from "./calculateTotals";

describe("Billing Totals Calculation (src/lib/billing/calculateTotals.ts)", () => {
  it("calculates normal invoice with line items, 10% discount, and 18% tax", () => {
    // 2 items @ ₹500 (50,000 paise each) = ₹1,000 (100,000 paise)
    // Discount 10% (1,000 bps) = ₹100 (10,000 paise)
    // Taxable = ₹900 (90,000 paise)
    // Tax 18% (1,800 bps) = ₹162 (16,200 paise)
    // Total = ₹1,062 (106,200 paise)
    const result = calculateTotals({
      items: [
        { name: "Pro Plan Subscription", quantity: 2, unitPriceInPaise: 50000 },
      ],
      discount: {
        type: "PERCENTAGE",
        basisPoints: 1000,
      },
      taxRateBasisPoints: 1800,
    });

    assert.equal(result.subtotalInPaise, 100000);
    assert.equal(result.discountAmountInPaise, 10000);
    assert.equal(result.taxableAmountInPaise, 90000);
    assert.equal(result.taxAmountInPaise, 16200);
    assert.equal(result.totalInPaise, 106200);
  });

  it("calculates with fixed discount in paise", () => {
    // Subtotal ₹1000 (100,000 paise)
    // Fixed discount ₹250 (25,000 paise)
    // Taxable = 75,000 paise
    // 0% Tax
    // Total = 75,000 paise
    const result = calculateTotals({
      subtotalInPaise: 100000,
      discount: {
        type: "FIXED",
        amountInPaise: 25000,
      },
      taxRateBasisPoints: 0,
    });

    assert.equal(result.subtotalInPaise, 100000);
    assert.equal(result.discountAmountInPaise, 25000);
    assert.equal(result.taxableAmountInPaise, 75000);
    assert.equal(result.taxAmountInPaise, 0);
    assert.equal(result.totalInPaise, 75000);
  });

  it("handles zero discount and zero tax", () => {
    const result = calculateTotals({
      subtotalInPaise: 49900,
      discount: null,
      taxRateBasisPoints: 0,
    });

    assert.equal(result.subtotalInPaise, 49900);
    assert.equal(result.discountAmountInPaise, 0);
    assert.equal(result.taxableAmountInPaise, 49900);
    assert.equal(result.taxAmountInPaise, 0);
    assert.equal(result.totalInPaise, 49900);
  });

  it("handles discount exceeding subtotal without allowing negative taxable amount", () => {
    // Subtotal ₹50 (5,000 paise)
    // Fixed discount ₹100 (10,000 paise)
    // Discount applied is capped at subtotal (5,000 paise)
    // Taxable = 0 paise
    // Tax = 0 paise
    // Total = 0 paise
    const result = calculateTotals({
      subtotalInPaise: 5000,
      discount: {
        type: "FIXED",
        amountInPaise: 10000,
      },
      taxRateBasisPoints: 1800,
    });

    assert.equal(result.subtotalInPaise, 5000);
    assert.equal(result.discountAmountInPaise, 5000);
    assert.equal(result.taxableAmountInPaise, 0);
    assert.equal(result.taxAmountInPaise, 0);
    assert.equal(result.totalInPaise, 0);
  });

  it("handles 100% or greater percentage discount", () => {
    // 100% discount (10,000 bps)
    const result = calculateTotals({
      subtotalInPaise: 25000,
      discount: {
        type: "PERCENTAGE",
        basisPoints: 10000,
      },
      taxRateBasisPoints: 1800,
    });

    assert.equal(result.subtotalInPaise, 25000);
    assert.equal(result.discountAmountInPaise, 25000);
    assert.equal(result.taxableAmountInPaise, 0);
    assert.equal(result.taxAmountInPaise, 0);
    assert.equal(result.totalInPaise, 0);
  });

  it("handles fractional rounding edge cases for tax and discounts", () => {
    // Subtotal 333 paise
    // 10% discount (1,000 bps): 33.3 => rounds to 33 paise
    // Taxable = 300 paise
    // 18% tax (1,800 bps): 300 * 0.18 = 54 paise
    // Total = 354 paise
    const result = calculateTotals({
      subtotalInPaise: 333,
      discount: {
        type: "PERCENTAGE",
        basisPoints: 1000,
      },
      taxRateBasisPoints: 1800,
    });

    assert.equal(result.subtotalInPaise, 333);
    assert.equal(result.discountAmountInPaise, 33);
    assert.equal(result.taxableAmountInPaise, 300);
    assert.equal(result.taxAmountInPaise, 54);
    assert.equal(result.totalInPaise, 354);
  });

  it("throws on invalid quantities or negative amounts", () => {
    assert.throws(
      () =>
        calculateTotals({
          items: [{ quantity: 0, unitPriceInPaise: 100 }],
        }),
      TypeError
    );

    assert.throws(
      () =>
        calculateTotals({
          items: [{ quantity: 1, unitPriceInPaise: -50 }],
        }),
      RangeError
    );

    assert.throws(
      () =>
        calculateTotals({
          subtotalInPaise: -100,
        }),
      RangeError
    );
  });
});
