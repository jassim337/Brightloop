import { z } from "zod";

export const paymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "UPI",
  "STRIPE",
  "OTHER",
]);

export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  method: paymentMethodEnum,
  amountPaise: z
    .number()
    .int("Amount must be a whole integer in paise")
    .positive("Payment amount must be greater than 0"),
  date: z
    .union([z.string(), z.date()])
    .refine(
      (val) => {
        const d = new Date(val);
        return !isNaN(d.getTime());
      },
      { message: "Invalid date format" }
    )
    .refine(
      (val) => {
        const d = new Date(val);
        // Avoid timezone off-by-one by allowing up to the end of the current local day
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        return d.getTime() <= endOfToday.getTime();
      },
      { message: "Payment date cannot be in the future" }
    )
    .transform((val) => new Date(val)),
  note: z
    .string()
    .max(500, "Note must be 500 characters or fewer")
    .optional()
    .nullable(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const paymentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  invoiceId: z.string().optional(),
});

export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
