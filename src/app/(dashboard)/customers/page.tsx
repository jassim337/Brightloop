import React from "react";
import { Users, UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customers
          </h1>
          <p className="text-sm text-slate-500">
            Accounts, payment methods, and lifecycle history for Brightloop Software clients.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Add Customer</span>
        </Button>
      </div>

      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            Customer Directory
          </h3>
          <p className="mt-2 max-w-sm text-xs text-slate-500">
            Customer profiles, payment methods, and billing contact management ready for database wiring.
          </p>
          <div className="mt-4">
            <Badge variant="secondary">Phase 0 Architecture Ready</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
