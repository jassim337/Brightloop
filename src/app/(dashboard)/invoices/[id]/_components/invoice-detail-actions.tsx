"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Ban,
  Mail,
  Printer,
  CreditCard,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/shared/form-field";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { formatINR, paiseToRupees, rupeesToPaise } from "@/lib/money";
import type { InvoiceStatus } from "@/generated/prisma/client";

interface InvoiceDetailActionsProps {
  invoice: {
    id: string;
    number: string;
    status: InvoiceStatus;
    totalPaise: number;
    paidAmountPaise: number;
    outstandingPaise: number;
    customer: {
      name: string;
      email: string;
    };
  };
  organizationName: string;
}

export function InvoiceDetailActions({
  invoice,
  organizationName,
}: InvoiceDetailActionsProps) {
  const router = useRouter();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cancel Confirm Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Record Payment Dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [paymentRupees, setPaymentRupees] = useState(
    invoice.outstandingPaise > 0
      ? String(paiseToRupees(invoice.outstandingPaise))
      : ""
  );
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [paymentNote, setPaymentNote] = useState("");
  const [paymentFieldErrors, setPaymentFieldErrors] = useState<Record<string, string>>({});
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Transition actions: Confirm or Cancel
  const handleTransition = async (action: "confirm" | "cancel") => {
    try {
      setLoadingAction(action);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch(`/api/invoices/${invoice.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to update invoice status.");
      }

      setSuccessMsg(
        action === "confirm"
          ? "Invoice confirmed successfully."
          : "Invoice cancelled."
      );
      setCancelDialogOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Submit Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentFieldErrors({});
    setErrorMsg(null);
    setSuccessMsg(null);

    let amountPaise = 0;
    try {
      amountPaise = rupeesToPaise(paymentRupees);
      if (amountPaise <= 0) {
        setPaymentFieldErrors({ amountRupees: "Amount must be greater than 0." });
        return;
      }
    } catch {
      setPaymentFieldErrors({ amountRupees: "Please enter a valid rupee amount." });
      return;
    }

    try {
      setSubmittingPayment(true);

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          method: paymentMethod,
          amountPaise,
          date: paymentDate,
          note: paymentNote.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.fields) {
          setPaymentFieldErrors(data.error.fields);
        }
        throw new Error(data?.error?.message || "Failed to record payment.");
      }

      setSuccessMsg(`Payment of ${formatINR(amountPaise)} recorded successfully.`);
      setPaymentDialogOpen(false);
      setPaymentNote("");
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Permissions based on rules
  const canConfirm = invoice.status === "DRAFT";
  const canCancel =
    (invoice.status === "DRAFT" || invoice.status === "CONFIRMED") &&
    invoice.paidAmountPaise === 0;
  const canRecordPayment =
    ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status) &&
    invoice.outstandingPaise > 0;

  // Send mailto prefilled link
  // TODO: Record sentAt once the field exists in the schema.
  const printUrl = typeof window !== "undefined"
    ? `${window.location.origin}/invoices/${invoice.id}/print`
    : `/invoices/${invoice.id}/print`;

  const emailSubject = encodeURIComponent(`Invoice ${invoice.number} from ${organizationName}`);
  const emailBody = encodeURIComponent(
    `Hello ${invoice.customer.name},\n\nPlease review your invoice ${invoice.number} from ${organizationName}.\n\nTotal: ${formatINR(
      invoice.totalPaise
    )}\nOutstanding: ${formatINR(
      invoice.outstandingPaise
    )}\n\nYou can view and print the full statement here:\n${printUrl}\n\nThank you for your business!`
  );
  const mailtoLink = `mailto:${invoice.customer.email}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {successMsg ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      ) : null}

      {errorMsg ? (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {canConfirm ? (
          <Button
            type="button"
            size="sm"
            onClick={() => handleTransition("confirm")}
            disabled={loadingAction !== null}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-500"
          >
            {loadingAction === "confirm" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>Confirm Invoice</span>
          </Button>
        ) : null}

        {canRecordPayment ? (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setPaymentRupees(String(paiseToRupees(invoice.outstandingPaise)));
              setPaymentDialogOpen(true);
            }}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <CreditCard className="h-4 w-4" />
            <span>Record Payment</span>
          </Button>
        ) : null}

        <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Mail className="h-4 w-4 text-slate-500" />
            <span>Send Email</span>
          </Button>
        </a>

        <Link href={`/invoices/${invoice.id}/print`}>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print</span>
          </Button>
        </Link>

        {canCancel ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCancelDialogOpen(true)}
            disabled={loadingAction !== null}
            className="gap-1.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50"
          >
            <Ban className="h-4 w-4" />
            <span>Cancel Invoice</span>
          </Button>
        ) : null}
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={`Cancel invoice ${invoice.number}?`}
        description="Cancelling will mark this invoice as void. This action cannot be reversed, and no payments can be recorded on cancelled invoices."
        confirmLabel="Yes, cancel invoice"
        destructive
        loading={loadingAction === "cancel"}
        onConfirm={() => handleTransition("cancel")}
      />

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="space-y-1">
              <DialogTitle className="text-base font-semibold">
                Record Payment for {invoice.number}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Outstanding balance:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatINR(invoice.outstandingPaise)}
                </span>
              </DialogDescription>
            </div>

            <div className="space-y-3 py-2">
              <FormField
                label="Payment Method"
                required
                error={paymentFieldErrors.method}
              >
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>

              <FormField
                label="Amount (in Rupees ₹)"
                required
                error={paymentFieldErrors.amountRupees || paymentFieldErrors.amountPaise}
                hint={`Max payable: ${formatINR(invoice.outstandingPaise)}`}
              >
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={paiseToRupees(invoice.outstandingPaise)}
                  value={paymentRupees}
                  onChange={(e) => setPaymentRupees(e.target.value)}
                  placeholder="e.g. 4999.00"
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </FormField>

              <FormField
                label="Payment Date"
                required
                error={paymentFieldErrors.date}
              >
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </FormField>

              <FormField
                label="Note / Transaction Reference"
                hint="e.g. UTR number, check reference, or receipt number"
                error={paymentFieldErrors.note}
              >
                <input
                  type="text"
                  maxLength={500}
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="Optional reference notes"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </FormField>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="sm" disabled={submittingPayment}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                disabled={submittingPayment}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {submittingPayment ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <span>Save Payment</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
