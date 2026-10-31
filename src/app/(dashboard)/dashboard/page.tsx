import React from "react";
import { DollarSign, Users, CreditCard, RefreshCw, Plus, Download } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSubscriptions } from "@/components/dashboard/recent-subscriptions";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time billing, revenue performance, and subscriber metrics for Brightloop Software.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>New Subscription</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value="$34,250"
          change={12.4}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <MetricCard
          title="Active Subscriptions"
          value="1,428"
          change={8.2}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <MetricCard
          title="Avg Revenue Per User"
          value="$124.50"
          change={3.1}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Net Churn Rate"
          value="1.8%"
          change={-0.6}
          icon={<RefreshCw className="h-5 w-5" />}
        />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueChart />
        <RecentSubscriptions />
      </div>
    </div>
  );
}
