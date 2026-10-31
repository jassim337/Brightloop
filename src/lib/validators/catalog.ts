import { z } from "zod";

// Money is integer paise, tax rates are basis points (1800 = 18%).
const paise = z
  .number({ message: "Enter a number" })
  .int("Whole paise only")
  .min(0, "Cannot be negative");

export const variantSchema = z.object({
  attribute: z.string().trim().min(1, "Enter attribute (e.g. Brand)"),
  value: z.string().trim().min(1, "Enter value (e.g. Odoo)"),
  extraPricePaise: paise.default(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name"),
  type: z.string().trim().min(1, "Enter a product type"),
  salesPricePaise: paise,
  costPricePaise: paise,
  notes: z.string().trim().optional(),
  variants: z.array(variantSchema).default([]),
});

export const taxSchema = z.object({
  name: z.string().trim().min(1, "Enter a tax name"),
  rateBasisPoints: z
    .number({ message: "Enter a number" })
    .int("Whole basis points only")
    .min(0, "Cannot be negative")
    .max(10000, "Cannot exceed 100%"),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export const planSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a plan name"),
    description: z.string().trim().optional(),
    pricePaise: paise,
    billingPeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
    minQty: z.number().int().min(1, "Minimum is 1").default(1),
    availableFrom: z.coerce.date(),
    availableTo: z.coerce.date().nullish(),
    autoClose: z.boolean().default(false),
    closable: z.boolean().default(true),
    pausable: z.boolean().default(true),
    renewable: z.boolean().default(true),
    isActive: z.boolean().default(true),
  })
  .refine((d) => !d.availableTo || d.availableTo >= d.availableFrom, {
    message: "End date must be after start date",
    path: ["availableTo"],
  });