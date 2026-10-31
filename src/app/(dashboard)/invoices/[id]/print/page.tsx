import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/money";
import { getDisplayStatus } from "@/lib/validators/invoice";
import { StatusBadge } from "@/components/shared/status-badge";
import { PrintTriggerButton } from "./_components/print-trigger-button";
import type { Prisma } from "@/generated/prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePrintPage({ params }: PageProps) {
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
        orderBy: { date: "asc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const displayStatus = getDisplayStatus(invoice);
  const outstandingPaise = Math.max(0, invoice.totalPaise - invoice.paidAmountPaise);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8 print:max-w-none print:p-0">
      {/* Top action bar: hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Invoice</span>
        </Link>
        <PrintTriggerButton />
      </div>

      {/* A4 Printable Document Container */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 print:text-black">
        {/* Document Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200 pb-6 print:border-slate-300">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              {invoice.organization.name}
            </h1>
            <p className="text-xs text-slate-500 print:text-slate-600">
              Tax Invoice & Payment Receipt
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white print:text-black block">
              {invoice.number}
            </span>
            <div className="mt-1 flex items-center sm:justify-end gap-2">
              <StatusBadge status={displayStatus} />
            </div>
          </div>
        </div>

        {/* Bill To & Metadata Grid */}
        <div className="grid grid-cols-2 gap-8 py-6 text-xs border-b border-slate-100 print:border-slate-200">
          <div>
            <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Billed To
            </p>
            <p className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
              {invoice.customer.name}
            </p>
            {invoice.customer.company ? (
              <p className="font-medium text-slate-700 dark:text-slate-300 print:text-slate-800">
                {invoice.customer.company}
              </p>
            ) : null}
            <p className="text-slate-600 dark:text-slate-400 print:text-slate-700">{invoice.customer.email}</p>
            {invoice.customer.phone ? (
              <p className="text-slate-600 dark:text-slate-400 print:text-slate-700">{invoice.customer.phone}</p>
            ) : null}
            {invoice.customer.address ? (
              <p className="whitespace-pre-line text-slate-500 mt-1 print:text-slate-600">
                {invoice.customer.address}
              </p>
            ) : null}
            {invoice.customer.taxId ? (
              <p className="font-mono text-slate-500 mt-1 print:text-slate-600">
                Tax ID / GSTIN: {invoice.customer.taxId}
              </p>
            ) : null}
          </div>

          <div className="space-y-1 sm:text-right">
            <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
              Invoice Summary
            </p>
            <p>
              <span className="text-slate-500">Invoice Date: </span>
              <span className="font-medium">
                {new Date(invoice.periodStart).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Due Date: </span>
              <span className="font-bold text-slate-900 dark:text-white print:text-black">
                {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Billing Period: </span>
              <span>
                {new Date(invoice.periodStart).toLocaleDateString("en-IN")} –{" "}
                {new Date(invoice.periodEnd).toLocaleDateString("en-IN")}
              </span>
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 print:border-slate-300">
                <th className="py-2.5 font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  Item Description
                </th>
                <th className="py-2.5 text-center font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  Qty
                </th>
                <th className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  Unit Price
                </th>
                <th className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  Tax
                </th>
                <th className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300 print:text-black">
                  Line Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-200">
              {invoice.lines.map((line) => (
                <tr key={line.id} className="break-inside-avoid">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200 print:text-black">
                    {line.description}
                  </td>
                  <td className="py-3 text-center text-slate-600 print:text-slate-700">
                    {line.qty}
                  </td>
                  <td className="py-3 text-right text-slate-600 print:text-slate-700">
                    {formatINR(line.unitPricePaise)}
                  </td>
                  <td className="py-3 text-right text-slate-500 print:text-slate-600">
                    {(line.taxRateBasisPoints / 100).toFixed(1)}%
                  </td>
                  <td className="py-3 text-right font-semibold text-slate-900 dark:text-white print:text-black">
                    {formatINR(line.amountPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Payments Summary Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-t-2 border-slate-200 pt-6 dark:border-slate-800 print:border-slate-300">
          {/* Payment History on Left */}
          <div className="flex-1 space-y-2 text-xs">
            <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Payment History
            </p>
            {invoice.payments.length === 0 ? (
              <p className="text-slate-400 italic">No payments recorded</p>
            ) : (
              <div className="space-y-1">
                {invoice.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-900 print:border-slate-100"
                  >
                    <span className="text-slate-600 print:text-slate-700">
                      {new Date(p.date).toLocaleDateString("en-IN")} • {p.method}
                      {p.note ? ` (${p.note})` : ""}
                    </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                      {formatINR(p.amountPaise)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals Summary Table on Right */}
          <div className="w-full sm:w-72 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span>Subtotal:</span>
              <span>{formatINR(invoice.subtotalPaise)}</span>
            </div>
            {invoice.discountTotalPaise > 0 ? (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                <span>Discount:</span>
                <span>-{formatINR(invoice.discountTotalPaise)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span>Tax (GST):</span>
              <span>{formatINR(invoice.taxTotalPaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white print:text-black border-t border-slate-200 pt-2 dark:border-slate-800 print:border-slate-300">
              <span>Invoice Total:</span>
              <span>{formatINR(invoice.totalPaise)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
              <span>Paid to Date:</span>
              <span>{formatINR(invoice.paidAmountPaise)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold border-t-2 border-slate-900 pt-2 dark:border-white print:border-black">
              <span>Balance Due:</span>
              <span className={outstandingPaise > 0 ? "text-amber-800 dark:text-amber-300 print:text-black" : "text-emerald-800 dark:text-emerald-400"}>
                {formatINR(outstandingPaise)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-6 print:border-slate-200">
          <p>Thank you for choosing {invoice.organization.name}. For questions or support, please contact your account manager.</p>
        </div>
      </div>
    </div>
  );
}
