import { Prisma, type BillingPeriod } from "@/generated/prisma/client";
import { addPeriod } from "./addPeriod";

const BATCH_SIZE = 100;

const dueSubscriptionSelect = {
  id: true,
  nextBillingDate: true,
  plan: { select: { billingPeriod: true } },
  lines: { select: { id: true } },
} satisfies Prisma.SubscriptionSelect;

type DueSubscription = Prisma.SubscriptionGetPayload<{
  select: typeof dueSubscriptionSelect;
}>;

export interface BillingError {
  subscriptionId: string;
  periodStart: Date | null;
  missedPeriodCount: number;
  message: string;
}

export interface BillingResult {
  created: number;
  skipped: number;
  failed: number;
  errors: BillingError[];
}

export function* duePeriodStarts(
  nextBillingDate: Date,
  billingPeriod: BillingPeriod,
  billingDate: Date
): Generator<Date> {
  if (Number.isNaN(nextBillingDate.getTime()) || Number.isNaN(billingDate.getTime())) {
    throw new TypeError("Billing dates must be valid Date values.");
  }

  let periodStart = new Date(nextBillingDate);
  while (periodStart <= billingDate) {
    yield periodStart;
    const nextPeriodStart = addPeriod(periodStart, billingPeriod);
    if (nextPeriodStart <= periodStart) {
      throw new RangeError(`Billing period ${billingPeriod} did not advance the billing date.`);
    }
    periodStart = nextPeriodStart;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runBilling(
  organizationId: string,
  billingDate: Date = new Date()
): Promise<BillingResult> {
  if (!organizationId) {
    throw new TypeError("organizationId is required.");
  }
  if (Number.isNaN(billingDate.getTime())) {
    throw new TypeError("billingDate must be a valid Date.");
  }

  const { prisma } = await import("@/lib/prisma");
  const result: BillingResult = { created: 0, skipped: 0, failed: 0, errors: [] };
  let cursor: string | undefined;

  while (true) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        nextBillingDate: { lte: billingDate },
      },
      orderBy: { id: "asc" },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      take: BATCH_SIZE,
      select: dueSubscriptionSelect,
    });

    if (subscriptions.length === 0) break;
    cursor = subscriptions[subscriptions.length - 1].id;

    for (const candidate of subscriptions) {
      try {
        const outcome = await prisma.$transaction(async (tx) => {
          const current: DueSubscription | null = await tx.subscription.findFirst({
            where: {
              id: candidate.id,
              organizationId,
              status: "ACTIVE",
              nextBillingDate: { lte: billingDate },
            },
            select: dueSubscriptionSelect,
          });

          if (!current?.nextBillingDate) return { kind: "skipped" as const };

          let missedPeriodCount = 0;
          let firstPeriodStart: Date | null = null;
          for (const periodStart of duePeriodStarts(
            current.nextBillingDate,
            current.plan.billingPeriod,
            billingDate
          )) {
            firstPeriodStart ??= periodStart;
            missedPeriodCount += 1;
          }

          return {
            kind: "blocked" as const,
            firstPeriodStart,
            missedPeriodCount,
            hasLines: current.lines.length > 0,
          };
        });

        if (outcome.kind === "skipped") {
          result.skipped += 1;
          continue;
        }

        result.failed += 1;
        result.errors.push({
          subscriptionId: candidate.id,
          periodStart: outcome.firstPeriodStart,
          missedPeriodCount: outcome.missedPeriodCount,
          message: outcome.hasLines
            ? "Invoice creation is blocked: the repository does not establish whether SubscriptionLine.amountPaise includes tax or discounts. Refusing to risk double-applying financial amounts."
            : "Invoice creation is blocked: the subscription has no SubscriptionLine records, and the repository does not define whether Plan.pricePaise should be billed as a fallback.",
        });
      } catch (error) {
        result.failed += 1;
        result.errors.push({
          subscriptionId: candidate.id,
          periodStart: candidate.nextBillingDate,
          missedPeriodCount: 0,
          message: getErrorMessage(error),
        });
      }
    }

    if (subscriptions.length < BATCH_SIZE) break;
  }

  return result;
}
