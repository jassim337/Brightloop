import React from "react";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-col md:pl-64">
        <DashboardHeader />
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
