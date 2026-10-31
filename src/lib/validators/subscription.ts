import { z } from 'zod';
import { SUBSCRIPTION_STATES } from '../state/subscriptionMachine';

export const SubscriptionLineSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantId: z.string().optional(),
  qty: z.number().int("Quantity must be an integer").positive("Quantity must be greater than 0"),
  unitPrice: z.number().int("Unit price must be an integer in cents/paise").min(0, "Unit price cannot be negative"),
  taxAmount: z.number().int("Tax amount must be an integer in cents/paise").min(0, "Tax cannot be negative"),
  totalAmount: z.number().int("Total amount must be an integer in cents/paise").min(0, "Total amount cannot be negative")
}).refine(data => {
  // Pure integer arithmetic to avoid floating-point calculation errors for persisted money
  const expectedTotal = (data.qty * data.unitPrice) + data.taxAmount;
  return data.totalAmount === expectedTotal;
}, {
  message: "Total amount must equal (qty * unitPrice) + taxAmount in integer cents/paise",
  path: ["totalAmount"]
});

export const SubscriptionSchema = z.object({
  subscriptionNumber: z.string().optional(),
  status: z.enum(SUBSCRIPTION_STATES),
  lines: z.array(SubscriptionLineSchema).min(1, "At least one product line is required"),
  validityDays: z.number().int("Validity days must be an integer").positive("Validity days must be at least 1").optional(),
  expiryDate: z.date().optional(),
  startDate: z.date().optional(),
  nextBillingDate: z.date().optional(),
  autoClose: z.boolean().optional()
}).refine(data => {
  // When subscription becomes Active, nextBillingDate should equal startDate (Phase 1 requirement)
  if (data.status === 'Active' && data.startDate && data.nextBillingDate) {
    return data.startDate.getTime() === data.nextBillingDate.getTime();
  }
  return true;
}, {
  message: "When subscription becomes Active, nextBillingDate must equal startDate",
  path: ["nextBillingDate"]
}).refine(data => {
  // startDate cannot be after expiryDate when both exist
  if (data.startDate && data.expiryDate) {
    return data.startDate.getTime() <= data.expiryDate.getTime();
  }
  return true;
}, {
  message: "startDate cannot be after expiryDate",
  path: ["startDate"]
});

export type SubscriptionLineInput = z.infer<typeof SubscriptionLineSchema>;
export type SubscriptionInput = z.infer<typeof SubscriptionSchema>;
