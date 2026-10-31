import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Building2, Calendar, CreditCard, ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { getDisplayStatus } from "@/lib/validators/invoice";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceDetailActions } from "./_components/invoice-detail-actions";
import type { Prisma } from "@/generated/prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const session = await getSession();

  if (!session) {
    if (process.env.NODE_ENV === "production") {
      redirect("/login");
    }
  }

  const activeSession = session ?? {
    userId: "dev-admin",
    role: "ADMIN" as const,
    organizationId: "demo",
    customerId: null,
  };

  const { id } = await params;

  const where: Prisma.InvoiceWhereInput = {
    id,
    organizationId: activeSession.organizationId,
  };

  if (activeSession.role === "CUSTOMER") {
    if (!activeSession.customerId) {
      notFound();
    }
    where.customerId = activeSession.customerId;
    where.status = { not: "DRAFT" };
  }

  const invoice = await prisma.invoice.findFirst({
    where,
    include: {
      organization: {
        select: {
          name: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          phone: true,
          address: true,
          taxId: true,
        },
      },
      lines: {
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { date: "desc" },
        include: {
          recordedBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const displayStatus = getDisplayStatus(invoice);
  const outstandingPaise = Math.max(0, invoice.totalPaise - invoice.paidAmountPaise);
  const isStaff = activeSession.role === "ADMIN" || activeSession.role === "STAFF";

  return (
    <div className="space-y-6">
      {/* Back Link & Header Bar */}
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Invoices</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {invoice.number}
            </h1>
            <StatusBadge status={displayStatus} />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Issued on{" "}
            {new Date(invoice.periodStart).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            • Due by{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </p>
        </div>

        {/* Staff Action Controls */}
        {isStaff ? (
          <InvoiceDetailActions
            invoice={{
              id: invoice.id,
              number: invoice.number,
              status: invoice.status,
              totalPaise: invoice.totalPaise,
              paidAmountPaise: invoice.paidAmountPaise,
              outstandingPaise,
              customer: {
                name: invoice.customer.name,
                email: invoice.customer.email,
              },
            }}
            organizationName={invoice.organization.name}
          />
        ) : null}
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-500" />
              <span>Customer Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {invoice.customer.name}
              </p>
              {invoice.customer.company ? (
                <p className="text-slate-500">{invoice.customer.company}</p>
              ) : null}
            </div>
            <p>Email: {invoice.customer.email}</p>
            {invoice.customer.phone ? <p>Phone: {invoice.customer.phone}</p> : null}
            {invoice.customer.address ? (
              <p className="whitespace-pre-line text-slate-500">
                {invoice.customer.address}
              </p>
            ) : null}
            {invoice.customer.taxId ? (
              <p className="text-slate-500 font-mono">Tax / GSTIN: {invoice.customer.taxId}</p>
            ) : null}
          </CardContent>
        </Card>

        {/* Billing Schedule Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Billing Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Period Start:</span>
              <span className="font-medium">
                {new Date(invoice.periodStart).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Period End:</span>
              <span className="font-medium">
                {new Date(invoice.periodEnd).toLocaleDateString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Due Date:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
              </span>
            </div>
            {invoice.subscriptionId ? (
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Subscription:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  Linked Plan
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Payment Summary Box */}
        <Card className="bg-slate-50/70 dark:bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Balance & Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>{formatINR(invoice.subtotalPaise)}</span>
            </div>
            {invoice.discountTotalPaise > 0 ? (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span>-{formatINR(invoice.discountTotalPaise)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-500">
              <span>Tax (GST):</span>
              <span>{formatINR(invoice.taxTotalPaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Total Payable:</span>
              <span>{formatINR(invoice.totalPaise)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Total Paid:</span>
              <span>{formatINR(invoice.paidAmountPaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className={outstandingPaise > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}>
                Outstanding:
              </span>
              <span className={outstandingPaise > 0 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}>
                {formatINR(outstandingPaise)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Description</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Qty</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Unit Price</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Tax Rate</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoice.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {line.description}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-400">
                      {line.qty}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                      {formatINR(line.unitPricePaise)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      {(line.taxRateBasisPoints / 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                      {formatINR(line.amountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <span>Payments History</span>
          </CardTitle>
          <span className="text-xs text-slate-400">
            {invoice.payments.length} {invoice.payments.length === 1 ? "payment" : "payments"} recorded
          </span>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No payments have been recorded for this invoice yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Date</th>
                    <th className="px-4 py-2 font-semibold">Method</th>
                    <th className="px-4 py-2 font-semibold text-right">Amount</th>
                    <th className="px-4 py-2 font-semibold">Note / Ref</th>
                    <th className="px-4 py-2 font-semibold">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                        {new Date(p.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {p.method.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatINR(p.amountPaise)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {p.note || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                        {p.recordedBy?.name || p.recordedBy?.email || "System"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

