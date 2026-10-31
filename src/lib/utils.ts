import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function generateSubscriptionNumber(sequenceId: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const paddedSequence = String(sequenceId).padStart(5, '0');
  
  return `SUB-${year}-${paddedSequence}`;
}