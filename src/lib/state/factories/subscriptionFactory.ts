import { generateSubscriptionNumber } from '../utils';

export interface PlanTemplate {
  id: string;
  name: string;
  validityDays: number;
  productLines: { productId: string; variantId?: string; qty: number; unitPrice: number; taxRate: number }[];
}

export function createDraftFromTemplate(template: PlanTemplate, nextSequenceId: number) {
  const today = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(today.getDate() + template.validityDays);

  const lines = template.productLines.map(line => {
    const baseTotal = line.qty * line.unitPrice;
    const taxAmount = baseTotal * line.taxRate;
    return {
      productId: line.productId,
      variantId: line.variantId,
      qty: line.qty,
      unitPrice: line.unitPrice,
      taxAmount: taxAmount,
      totalAmount: baseTotal + taxAmount
    };
  });

  return {
    subscriptionNumber: generateSubscriptionNumber(nextSequenceId, today),
    status: 'Draft' as const,
    validityDays: template.validityDays,
    expiryDate,
    lines
  };
}