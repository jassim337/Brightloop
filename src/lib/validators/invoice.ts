import { z } from "zod";
import type { InvoiceStatus } from "@/generated/prisma/client";

export const invoiceStatusEnum = z.enum([
  "DRAFT",
  "CONFIRMED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const invoiceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().optional(),
  status: invoiceStatusEnum.optional(),
  view: z.enum(["all", "overdue"]).default("all").optional(),
});

export type InvoiceListQuery = z.infer<typeof invoiceListQuerySchema>;

/**
 * Pure helper that computes the effective display status for an invoice.
 * Returns OVERDUE when the due date has passed (before today) and the stored status
 * is CONFIRMED, PARTIALLY_PAID, or OVERDUE.
 * Note: Never write computed OVERDUE directly to the database.
 */
export function getDisplayStatus(invoice: {
  dueDate: Date | string;
  status: InvoiceStatus | string;
}): InvoiceStatus {
  const status = invoice.status as InvoiceStatus;
  const due = new Date(invoice.dueDate);
  const now = new Date();
  // Normalize today's date to midnight for date-only comparison
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isPastDue = due.getTime() < todayStart.getTime();

  if (
    isPastDue &&
    (status === "CONFIRMED" || status === "PARTIALLY_PAID" || status === "OVERDUE")
  ) {
    return "OVERDUE";
  }

  return status;
}

/**
 * Transition rules for invoice state changes:
 * - confirm: DRAFT -> CONFIRMED
 * - cancel: DRAFT or CONFIRMED -> CANCELLED (refuse if paidAmountPaise > 0)
 */
export const INVOICE_TRANSITIONS = {
  confirm: {
    from: ["DRAFT"] as const,
    to: "CONFIRMED" as const,
  },
  cancel: {
    from: ["DRAFT", "CONFIRMED"] as const,
    to: "CANCELLED" as const,
  },
} as const;

export const invoiceActionSchema = z.object({
  action: z.enum(["confirm", "cancel"]),
});

export type InvoiceActionInput = z.infer<typeof invoiceActionSchema>;

