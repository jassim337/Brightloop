import type { InvoiceStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type { InvoiceStatus };

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  },
  PARTIALLY_PAID: {
    label: "Partially paid",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  },
  PAID: {
    label: "Paid",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  OVERDUE: {
    label: "Overdue",
    className:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className:
      "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400",
  },
};

const FALLBACK_CLASSNAME =
  "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400";

function formatFallbackLabel(status: string): string {
  if (!status) return "Unknown";
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

export interface StatusBadgeProps {
  status: InvoiceStatus | (string & {});
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isKnown = typeof status === "string" && status in STATUS_CONFIG;
  const config = isKnown
    ? STATUS_CONFIG[status as InvoiceStatus]
    : {
        label: formatFallbackLabel(status),
        className: FALLBACK_CLASSNAME,
      };

  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
      aria-label={`Invoice status: ${config.label.toLowerCase()}`}
    >
      {config.label}
    </Badge>
  );
}
