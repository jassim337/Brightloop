"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge, type InvoiceStatus } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DemoInvoice {
  number: string;
  customer: string;
  amount: string;
  status: InvoiceStatus;
}

const invoices: DemoInvoice[] = [
  { number: "INV-2026-001", customer: "Northstar Labs", amount: "$1,240", status: "PAID" },
  { number: "INV-2026-002", customer: "Acme Studio", amount: "$860", status: "PARTIALLY_PAID" },
  { number: "INV-2026-003", customer: "Willow Health", amount: "$2,400", status: "OVERDUE" },
  { number: "INV-2026-004", customer: "Orbit Analytics", amount: "$1,150", status: "CONFIRMED" },
  { number: "INV-2026-005", customer: "Cedar Works", amount: "$740", status: "DRAFT" },
  { number: "INV-2026-006", customer: "Brightside Co.", amount: "$3,100", status: "CANCELLED" },
  { number: "INV-2026-007", customer: "Monarch Systems", amount: "$980", status: "PAID" },
];

const columns: DataTableColumn<DemoInvoice>[] = [
  { key: "number", header: "Invoice" },
  { key: "customer", header: "Customer" },
  { key: "amount", header: "Amount" },
  {
    key: "status",
    header: "Status",
    render: (invoice) => <StatusBadge status={invoice.status} />,
  },
];

const statuses: InvoiceStatus[] = [
  "DRAFT",
  "CONFIRMED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export default function ComponentsShowcasePage() {
  const [page, setPage] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const pageSize = 3;
  const pageInvoices = invoices.slice((page - 1) * pageSize, page * pageSize);

  async function handleConfirm() {
    setConfirming(true);
    await new Promise<void>((resolve) => setTimeout(resolve, 900));
    setConfirming(false);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Component showcase"
        description="Temporary preview of Brightloop's reusable shared components."
        actions={
          <Button type="button" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New invoice
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Status badges</CardTitle>
          <CardDescription>All supported invoice status styles.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          {/* Unknown status fallback showcase */}
          <StatusBadge status="PENDING_REVIEW" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice table</CardTitle>
          <CardDescription>
            Three records per page, controlled by the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={pageInvoices}
            columns={columns}
            page={page}
            pageSize={pageSize}
            total={invoices.length}
            onPageChange={setPage}
            emptyMessage="No demo invoices are available."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Form fields</CardTitle>
          <CardDescription>Label, hint, and validation examples.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <FormField
            label="Customer name"
            htmlFor="demo-customer-name"
            hint="Enter the name shown on the invoice."
            required
          >
            <input
              id="demo-customer-name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="e.g. Northstar Labs"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </FormField>
          <FormField label="Invoice number" error="This invoice number is already in use.">
            <input
              defaultValue="INV-2026-001"
              aria-invalid="true"
              className="h-10 w-full rounded-lg border border-rose-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-rose-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmation dialog</CardTitle>
          <CardDescription>
            Destructive confirmation with an asynchronous loading state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDialogOpen(true)}
          >
            Delete demo invoice
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Delete invoice?"
        description="This will remove the demo invoice INV-2026-001. This action cannot be undone."
        confirmLabel="Delete invoice"
        destructive
        loading={confirming}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
