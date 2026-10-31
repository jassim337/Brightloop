import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addPeriod, BillingPeriod } from "./addPeriod";

describe("Subscription Period Date Calculations (src/lib/billing/addPeriod.ts)", () => {
  it("adds daily periods correctly", () => {
    const start = new Date("2025-03-10T14:30:00.000Z");
    const next = addPeriod(start, "DAILY", 5);

    assert.equal(next.toISOString(), "2025-03-15T14:30:00.000Z");
    // Verify start date was not mutated
    assert.equal(start.toISOString(), "2025-03-10T14:30:00.000Z");
  });

  it("adds weekly periods correctly (count * 7 days)", () => {
    const start = new Date("2025-03-01T08:00:00.000Z");
    const next = addPeriod(start, "WEEKLY", 2); // 14 days

    assert.equal(next.toISOString(), "2025-03-15T08:00:00.000Z");
  });

  it("adds standard monthly periods preserving day and time", () => {
    const start = new Date("2025-01-15T10:15:30.500Z");
    const next = addPeriod(start, "MONTHLY", 1);

    assert.equal(next.getUTCFullYear(), 2025);
    assert.equal(next.getUTCMonth(), 1); // February (0-indexed)
    assert.equal(next.getUTCDate(), 15);
    assert.equal(next.getUTCHours(), 10);
    assert.equal(next.getUTCMinutes(), 15);
    assert.equal(next.getUTCSeconds(), 30);
    assert.equal(next.getUTCMilliseconds(), 500);
  });

  it("handles January 31 month-end case on a common year (clamps to Feb 28)", () => {
    // 2025 is not a leap year. Feb has 28 days.
    const start = new Date(2025, 0, 31, 12, 0, 0, 0); // Jan 31, 2025
    const next = addPeriod(start, "MONTHLY", 1);

    assert.equal(next.getFullYear(), 2025);
    assert.equal(next.getMonth(), 1); // February
    assert.equal(next.getDate(), 28); // Clamped to 28, avoids March drift!
    assert.equal(next.getHours(), 12);
  });

  it("handles January 31 month-end case on a leap year (clamps to Feb 29)", () => {
    // 2024 is a leap year. Feb has 29 days.
    const start = new Date(2024, 0, 31, 9, 30, 0, 0); // Jan 31, 2024
    const next = addPeriod(start, "MONTHLY", 1);

    assert.equal(next.getFullYear(), 2024);
    assert.equal(next.getMonth(), 1); // February
    assert.equal(next.getDate(), 29); // Clamped to 29!
    assert.equal(next.getHours(), 9);
    assert.equal(next.getMinutes(), 30);
  });

  it("handles 31st month-ends moving to 30-day months (March 31 -> April 30)", () => {
    const start = new Date(2025, 2, 31, 16, 0, 0, 0); // March 31, 2025
    const next = addPeriod(start, "MONTHLY", 1);

    assert.equal(next.getFullYear(), 2025);
    assert.equal(next.getMonth(), 3); // April
    assert.equal(next.getDate(), 30); // Clamped to 30
  });

  it("handles yearly billing periods", () => {
    const start = new Date(2025, 5, 20, 11, 0, 0, 0); // June 20, 2025
    const next = addPeriod(start, "YEARLY", 1);

    assert.equal(next.getFullYear(), 2026);
    assert.equal(next.getMonth(), 5);
    assert.equal(next.getDate(), 20);
  });

  it("handles leap year case for February 29 + 1 Year (clamps to Feb 28)", () => {
    // 2024 is leap year, 2025 is not
    const start = new Date(2024, 1, 29, 10, 0, 0, 0); // Feb 29, 2024
    const next = addPeriod(start, "YEARLY", 1);

    assert.equal(next.getFullYear(), 2025);
    assert.equal(next.getMonth(), 1); // February
    assert.equal(next.getDate(), 28); // Clamped to 28
  });

  it("handles leap year case for February 29 + 4 Years (remains Feb 29 in 2028)", () => {
    // 2028 is a leap year
    const start = new Date(2024, 1, 29, 10, 0, 0, 0); // Feb 29, 2024
    const next = addPeriod(start, "YEARLY", 4);

    assert.equal(next.getFullYear(), 2028);
    assert.equal(next.getMonth(), 1); // February
    assert.equal(next.getDate(), 29); // Remains 29
  });

  it("guarantees the original date remains unchanged (immutability)", () => {
    const originalTime = new Date("2025-05-10T10:00:00.000Z").getTime();
    const originalDate = new Date(originalTime);

    addPeriod(originalDate, "MONTHLY", 2);
    addPeriod(originalDate, "YEARLY", 1);
    addPeriod(originalDate, "DAILY", 15);

    assert.equal(originalDate.getTime(), originalTime);
  });

  it("throws on invalid Date or unsupported periods", () => {
    assert.throws(() => addPeriod(new Date("invalid"), "MONTHLY"), TypeError);
    assert.throws(() => addPeriod("2025-01-01" as unknown as Date, "MONTHLY"), TypeError);
    assert.throws(() => addPeriod(new Date(), "INVALID_PERIOD" as unknown as BillingPeriod), TypeError);
  });
});
