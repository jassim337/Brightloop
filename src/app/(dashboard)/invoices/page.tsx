import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { getInvoices } from "./_lib/queries";
import { InvoicesClient } from "./_components/invoices-client";
import type { InvoiceStatus } from "@/generated/prisma/client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session) {
    if (process.env.NODE_ENV === "production") {
      redirect("/login");
    }
  }

  // Development fallback session if none active
  const activeSession = session ?? {
    userId: "dev-admin",
    role: "ADMIN" as const,
    organizationId: "demo",
    customerId: null,
  };

  const resolved = await searchParams;

  const page = Number(resolved.page) || 1;
  const pageSize = Number(resolved.pageSize) || 10;
  const q = typeof resolved.q === "string" ? resolved.q : undefined;
  const rawStatus = typeof resolved.status === "string" ? resolved.status : undefined;
  const status =
    rawStatus && rawStatus !== "ALL" ? (rawStatus as InvoiceStatus) : undefined;
  const view = resolved.view === "overdue" ? ("overdue" as const) : ("all" as const);

  const initialResult = await getInvoices(activeSession, {
    page,
    pageSize,
    q,
    status,
    view,
  });

  const isCustomer = activeSession.role === "CUSTOMER";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCustomer ? "My Invoices" : "Invoices"}
        description={
          isCustomer
            ? "View and download your billing statements and payment receipts."
            : "Manage, track, and reconcile customer invoices, lifecycle statuses, and aging receivables."
        }
      />

      <Suspense fallback={<div className="py-12 text-center text-sm text-slate-400">Loading invoices...</div>}>
        <InvoicesClient
          initialResult={initialResult}
          currentQuery={{
            page,
            pageSize,
            q,
            status: rawStatus,
            view,
          }}
          isCustomer={isCustomer}
        />
      </Suspense>
    </div>
  );
}

