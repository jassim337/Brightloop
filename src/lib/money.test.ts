import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  rupeesToPaise,
  paiseToRupees,
  roundPaise,
  formatINR,
  assertValidPaise,
  isValidPaise,
  multiplyByBasisPoints,
} from "./money";

describe("Money Utilities (src/lib/money.ts)", () => {
  describe("rupeesToPaise()", () => {
    it("converts integer rupees to paise accurately", () => {
      assert.equal(rupeesToPaise(100), 10000);
      assert.equal(rupeesToPaise(1), 100);
      assert.equal(rupeesToPaise(0), 0);
    });

    it("converts decimal rupees to paise without floating-point errors", () => {
      assert.equal(rupeesToPaise(10.5), 1050);
      assert.equal(rupeesToPaise(1.14), 114);
      assert.equal(rupeesToPaise(29.99), 2999);
      assert.equal(rupeesToPaise(0.01), 1);
    });

    it("accepts valid string rupee representations", () => {
      assert.equal(rupeesToPaise("499.00"), 49900);
      assert.equal(rupeesToPaise("0.50"), 50);
      assert.equal(rupeesToPaise("1500"), 150000);
    });

    it("rounds fractional sub-paise amounts half-up", () => {
      assert.equal(rupeesToPaise(10.504), 1050);
      assert.equal(rupeesToPaise(10.505), 1051);
      assert.equal(rupeesToPaise(10.506), 1051);
    });

    it("handles negative rupee values", () => {
      assert.equal(rupeesToPaise(-10.5), -1050);
    });

    it("throws on invalid non-numeric or non-finite inputs", () => {
      assert.throws(() => rupeesToPaise(NaN), TypeError);
      assert.throws(() => rupeesToPaise(Infinity), TypeError);
      assert.throws(() => rupeesToPaise(-Infinity), TypeError);
      assert.throws(() => rupeesToPaise("abc"), TypeError);
      assert.throws(() => rupeesToPaise(""), TypeError);
      assert.throws(() => rupeesToPaise(null as unknown as number), TypeError);
      assert.throws(() => rupeesToPaise(undefined as unknown as number), TypeError);
    });
  });

  describe("paiseToRupees()", () => {
    it("converts integer paise to rupees accurately", () => {
      assert.equal(paiseToRupees(10000), 100);
      assert.equal(paiseToRupees(1050), 10.5);
      assert.equal(paiseToRupees(1), 0.01);
      assert.equal(paiseToRupees(0), 0);
      assert.equal(paiseToRupees(-500), -5);
    });

    it("throws if input is not an integer paise", () => {
      assert.throws(() => paiseToRupees(10.5), TypeError);
      assert.throws(() => paiseToRupees(NaN), TypeError);
      assert.throws(() => paiseToRupees(Infinity), TypeError);
    });
  });

  describe("roundPaise()", () => {
    it("rounds fractional paise half-up deterministically", () => {
      assert.equal(roundPaise(10.4), 10);
      assert.equal(roundPaise(10.5), 11);
      assert.equal(roundPaise(10.6), 11);
      assert.equal(roundPaise(-10.5), -10);
    });

    it("throws on invalid inputs", () => {
      assert.throws(() => roundPaise(NaN), TypeError);
      assert.throws(() => roundPaise(Infinity), TypeError);
    });
  });

  describe("multiplyByBasisPoints()", () => {
    it("calculates percentage in basis points (1% = 100 bps) and rounds to integer paise", () => {
      // 18% GST on ₹100.00 (10000 paise) = 1800 paise (₹18.00)
      assert.equal(multiplyByBasisPoints(10000, 1800), 1800);
      // 10% on 333 paise = 33.3 paise => rounds to 33 paise
      assert.equal(multiplyByBasisPoints(333, 1000), 33);
      // 10% on 335 paise = 33.5 paise => rounds to 34 paise
      assert.equal(multiplyByBasisPoints(335, 1000), 34);
    });
  });

  describe("formatINR()", () => {
    it("formats paise to Indian Rupee notation with lakhs grouping", () => {
      const formatted = formatINR(10000000); // 1 Lakh rupees
      // Expected to contain ₹ and 1,00,000.00
      assert.match(formatted, /₹|INR/);
      assert.match(formatted, /1,00,000/);
    });

    it("formats small amounts with paise fractions", () => {
      const formatted = formatINR(49950); // ₹499.50
      assert.match(formatted, /499\.50/);
    });

    it("respects showZeroPaise option", () => {
      const formatted = formatINR(50000, { showZeroPaise: false }); // ₹500
      assert.doesNotMatch(formatted, /\.00/);
    });
  });

  describe("assertValidPaise() and isValidPaise()", () => {
    it("accepts valid integers", () => {
      assert.equal(isValidPaise(100), true);
      assert.equal(isValidPaise(0), true);
      assert.equal(isValidPaise(-50), true);
      assert.doesNotThrow(() => assertValidPaise(100));
    });

    it("rejects non-integers and non-numbers", () => {
      assert.equal(isValidPaise(10.5), false);
      assert.equal(isValidPaise("100"), false);
      assert.equal(isValidPaise(null), false);
      assert.throws(() => assertValidPaise(10.5), TypeError);
    });
  });
});
