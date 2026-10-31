import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { UserRole } from "@/lib/navigation";
import { DashboardSidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    if (process.env.NODE_ENV === "production") {
      redirect("/login");
    }
    // TODO: In development without an active session, fall back to ADMIN nav so teammates' pages keep working.
  }

  const role: UserRole = (session?.role as UserRole) ?? "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <DashboardSidebar role={role} />
      <div className="flex min-w-0 flex-col md:pl-64 print:pl-0">
        <DashboardHeader role={role} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
