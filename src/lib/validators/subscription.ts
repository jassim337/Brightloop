import { z } from 'zod';
import { SUBSCRIPTION_STATES } from '../state/subscriptionMachine';

export const SubscriptionLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().optional(),
  qty: z.number().int().positive("Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  taxAmount: z.number().min(0, "Tax cannot be negative"),
  totalAmount: z.number().min(0)
}).refine(data => {
  // Enforce mathematically correct line totals
  const expectedTotal = (data.qty * data.unitPrice) + data.taxAmount;
  return Math.abs(data.totalAmount - expectedTotal) < 0.01; // Account for float precision
}, {
  message: "Total amount must equal (qty * unitPrice) + taxAmount",
  path: ["totalAmount"]
});

export const SubscriptionSchema = z.object({
  status: z.enum(SUBSCRIPTION_STATES),
  lines: z.array(SubscriptionLineSchema).min(1, "At least one product line is required"),
  validityDays: z.number().int().min(1).optional(),
  expiryDate: z.date().optional(),
  startDate: z.date().optional(),
  nextBillingDate: z.date().optional()
});