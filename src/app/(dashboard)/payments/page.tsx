import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentsClient, type PaymentItem } from "./_components/payments-client";
import type { Prisma } from "@/generated/prisma/client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentsPage({ searchParams }: PageProps) {
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

  const resolved = await searchParams;
  const page = Number(resolved.page) || 1;
  const pageSize = Number(resolved.pageSize) || 10;

  const where: Prisma.PaymentWhereInput = {
    organizationId: activeSession.organizationId,
  };

  const isCustomer = activeSession.role === "CUSTOMER";

  if (isCustomer) {
    if (!activeSession.customerId) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="My Payments"
            description="View your past transactions and payment receipts."
          />
          <p className="text-sm text-slate-400">No customer account is linked to this profile.</p>
        </div>
      );
    }
    where.invoice = {
      customerId: activeSession.customerId,
    };
  }

  const [total, rawPayments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const initialData: PaymentItem[] = rawPayments.map((p) => ({
    id: p.id,
    invoiceId: p.invoiceId,
    method: p.method,
    amountPaise: p.amountPaise,
    date: p.date,
    note: p.note,
    invoice: {
      id: p.invoice.id,
      number: p.invoice.number,
      customer: p.invoice.customer,
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCustomer ? "My Payments" : "Payments"}
        description={
          isCustomer
            ? "Track and verify all completed payments and transaction records."
            : "Review reconciled payment transactions, settlement methods, and collections history."
        }
      />

      <Suspense fallback={<div className="py-12 text-center text-sm text-slate-400">Loading payments...</div>}>
        <PaymentsClient
          initialData={initialData}
          total={total}
          page={page}
          pageSize={pageSize}
          isCustomer={isCustomer}
        />
      </Suspense>
    </div>
  );
}

