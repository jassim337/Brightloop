import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { duePeriodStarts } from "./runBilling";

describe("Billing period selection", () => {
  it("returns each missed billing period through the supplied billing date", () => {
    const periods = Array.from(
      duePeriodStarts(
        new Date("2026-10-01T10:00:00.000Z"),
        "MONTHLY",
        new Date("2026-12-01T10:00:00.000Z")
      )
    );

    assert.deepEqual(
      periods.map((period) => period.toISOString()),
      [
        "2026-10-01T10:00:00.000Z",
        "2026-11-01T10:00:00.000Z",
        "2026-12-01T10:00:00.000Z",
      ]
    );
  });

  it("returns no periods when the next billing date is in the future", () => {
    const periods = Array.from(
      duePeriodStarts(
        new Date("2026-11-01T10:00:00.000Z"),
        "WEEKLY",
        new Date("2026-10-31T10:00:00.000Z")
      )
    );

    assert.deepEqual(periods, []);
  });
});
