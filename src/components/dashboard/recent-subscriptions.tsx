import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Subscription } from "@/types";

const RECENT_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub_01",
    customerId: "cus_01",
    customerName: "Acme Corp",
    customerEmail: "billing@acme.com",
    planName: "Enterprise Tier",
    status: "ACTIVE",
    amount: 1499,
    currency: "USD",
    cycle: "ANNUAL",
    renewsAt: "2027-01-15",
    createdAt: "2026-10-15",
  },
  {
    id: "sub_02",
    customerId: "cus_02",
    customerName: "HyperScale Studio",
    customerEmail: "finance@hyperscale.io",
    planName: "Growth Tier",
    status: "ACTIVE",
    amount: 299,
    currency: "USD",
    cycle: "MONTHLY",
    renewsAt: "2026-11-28",
    createdAt: "2026-09-28",
  },
  {
    id: "sub_03",
    customerId: "cus_03",
    customerName: "Vortex Labs",
    customerEmail: "ops@vortexlabs.dev",
    planName: "Pro Tier",
    status: "TRIALING",
    amount: 99,
    currency: "USD",
    cycle: "MONTHLY",
    renewsAt: "2026-11-05",
    createdAt: "2026-10-22",
  },
  {
    id: "sub_04",
    customerId: "cus_04",
    customerName: "Nordic Tech AB",
    customerEmail: "accounts@nordictech.se",
    planName: "Growth Tier",
    status: "PAST_DUE",
    amount: 299,
    currency: "USD",
    cycle: "MONTHLY",
    renewsAt: "2026-10-30",
    createdAt: "2026-08-30",
  },
];

const STATUS_VARIANTS = {
  ACTIVE: "success",
  TRIALING: "default",
  PAST_DUE: "destructive",
  CANCELED: "secondary",
  PAUSED: "warning",
} as const;

export function RecentSubscriptions() {
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Recent Subscriptions
        </CardTitle>
        <CardDescription>Latest customer billing events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {RECENT_SUBSCRIPTIONS.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none text-slate-800 dark:text-slate-200">
                  {sub.customerName}
                </p>
                <p className="text-xs text-slate-400">{sub.planName} • {sub.cycle.toLowerCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  ${sub.amount}
                </span>
                <Badge variant={STATUS_VARIANTS[sub.status]}>
                  {sub.status.toLowerCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
