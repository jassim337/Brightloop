"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { formatINR } from "@/lib/money";

export interface PaymentItem {
  id: string;
  invoiceId: string;
  method: string;
  amountPaise: number;
  date: Date;
  note: string | null;
  invoice: {
    id: string;
    number: string;
    customer: {
      id: string;
      name: string;
      email: string;
      company: string | null;
    };
  };
}

interface PaymentsClientProps {
  initialData: PaymentItem[];
  total: number;
  page: number;
  pageSize: number;
  isCustomer: boolean;
}

export function PaymentsClient({
  initialData,
  total,
  page,
  pageSize,
  isCustomer,
}: PaymentsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const columns: DataTableColumn<PaymentItem>[] = [
    {
      key: "invoice" as keyof PaymentItem,
      header: "Invoice",
      render: (row) => (
        <Link
          href={`/invoices/${row.invoice.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
        >
          {row.invoice.number}
        </Link>
      ),
    },
    ...(!isCustomer
      ? [
          {
            key: "customer" as keyof PaymentItem,
            header: "Customer",
            render: (row: PaymentItem) => (
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {row.invoice.customer.name}
                </p>
                {row.invoice.customer.company ? (
                  <p className="text-xs text-slate-400">
                    {row.invoice.customer.company}
                  </p>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
    {
      key: "method",
      header: "Method",
      render: (row) => (
        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {row.method.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "amountPaise",
      header: "Amount",
      render: (row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatINR(row.amountPaise)}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {new Date(row.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "note",
      header: "Note / Reference",
      render: (row) => (
        <span className="text-xs text-slate-500 max-w-xs truncate block">
          {row.note || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {isPending ? (
        <p className="text-xs text-slate-400 animate-pulse">Updating page...</p>
      ) : null}

      <DataTable
        data={initialData}
        columns={columns}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        emptyMessage="No payment records found."
      />
    </div>
  );
}

