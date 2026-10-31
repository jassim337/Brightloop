import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changePeriod?: string;
  icon: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  change,
  changePeriod = "vs last month",
  icon,
}: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
            {icon}
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
            )}
            {Math.abs(change)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">{changePeriod}</span>
        </div>
      </CardContent>
    </Card>
  );
}
