import { Badge } from "@/components/ui/badge";

export type InvoiceStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "SENT"
  | "PAID"
  | "CANCELLED"
  | "OVERDUE";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  CONFIRMED:
    "border-indigo-200 bg-indigo-100 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  SENT:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
  PAID:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED:
    "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  OVERDUE:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge
      variant="outline"
      className={STATUS_STYLES[status]}
      aria-label={`Invoice status: ${status.toLowerCase()}`}
    >
      {status}
    </Badge>
  );
}
