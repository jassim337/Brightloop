"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, AlertTriangle, FileText, X } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatINR } from "@/lib/money";
import type { InvoiceListItem, InvoiceListResult } from "../_lib/queries";
import { Button } from "@/components/ui/button";

interface InvoicesClientProps {
  initialResult: InvoiceListResult;
  currentQuery: {
    page: number;
    pageSize: number;
    q?: string;
    status?: string;
    view?: "all" | "overdue";
  };
  isCustomer: boolean;
}

export function InvoicesClient({
  initialResult,
  currentQuery,
  isCustomer,
}: InvoicesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchVal, setSearchVal] = React.useState(currentQuery.q ?? "");

  const updateParams = (newParams: Record<string, string | number | undefined | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const isOverdueView = currentQuery.view === "overdue";

  const allColumns: DataTableColumn<InvoiceListItem>[] = [
    {
      key: "number",
      header: "Invoice",
      render: (row) => (
        <Link
          href={`/invoices/${row.id}`}
          className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline dark:text-indigo-400"
        >
          {row.number}
        </Link>
      ),
    },
    ...(!isCustomer
      ? [
          {
            key: "customer" as keyof InvoiceListItem,
            header: "Customer",
            render: (row: InvoiceListItem) => (
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {row.customer.name}
                </p>
                {row.customer.company ? (
                  <p className="text-xs text-slate-400">{row.customer.company}</p>
                ) : null}
              </div>
            ),
          },
        ]
      : []),
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {new Date(row.dueDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    ...(isOverdueView
      ? [
          {
            key: "daysLate" as keyof InvoiceListItem,
            header: "Days Late",
            render: (row: InvoiceListItem) => (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {row.daysLate} {row.daysLate === 1 ? "day" : "days"} late
              </span>
            ),
          },
        ]
      : []),
    {
      key: "totalPaise",
      header: "Total",
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {formatINR(row.totalPaise)}
        </span>
      ),
    },
    {
      key: "paidAmountPaise",
      header: "Paid",
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300">
          {formatINR(row.paidAmountPaise)}
        </span>
      ),
    },
    {
      key: "outstandingPaise" as keyof InvoiceListItem,
      header: "Outstanding",
      render: (row) => (
        <span
          className={
            row.outstandingPaise > 0
              ? "font-semibold text-amber-700 dark:text-amber-400"
              : "text-slate-400"
          }
        >
          {formatINR(row.outstandingPaise)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.displayStatus} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateParams({ view: "all", page: 1 })}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              !isOverdueView
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>All Invoices</span>
          </button>
          <button
            type="button"
            onClick={() => updateParams({ view: "overdue", page: 1, status: undefined })}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              isOverdueView
                ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <span>Overdue</span>
          </button>
        </div>

        {isPending ? (
          <span className="text-xs text-slate-400 animate-pulse">Loading updates...</span>
        ) : null}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ q: searchVal, page: 1 });
          }}
          className="relative min-w-0 flex-1 sm:max-w-xs"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder={
              isCustomer ? "Search invoice #..." : "Search number or customer..."
            }
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
          {searchVal ? (
            <button
              type="button"
              onClick={() => {
                setSearchVal("");
                updateParams({ q: undefined, page: 1 });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </form>

        <div className="flex items-center gap-2">
          {!isOverdueView ? (
            <div className="flex items-center gap-2">
              <label htmlFor="status-select" className="text-xs font-medium text-slate-500">
                Status:
              </label>
              <select
                id="status-select"
                value={currentQuery.status ?? "ALL"}
                onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Statuses</option>
                {!isCustomer ? <option value="DRAFT">Draft</option> : null}
                <option value="CONFIRMED">Confirmed</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          ) : null}

          {currentQuery.q || currentQuery.status || isOverdueView ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchVal("");
                updateParams({ q: undefined, status: undefined, view: "all", page: 1 });
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Reset
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={initialResult.data}
        columns={allColumns}
        page={initialResult.page}
        pageSize={initialResult.pageSize}
        total={initialResult.total}
        onPageChange={(nextPage) => updateParams({ page: nextPage })}
        emptyMessage={
          isOverdueView
            ? "No overdue invoices found. All payments are up to date."
            : "No invoices match the selected criteria."
        }
      />
    </div>
  );
}

