import { prisma } from "@/lib/prisma";
import type { AppSession } from "@/lib/auth";
import type { InvoiceListQuery } from "@/lib/validators/invoice";
import { getDisplayStatus } from "@/lib/validators/invoice";
import type { InvoiceStatus, Prisma } from "@/generated/prisma/client";

export interface InvoiceListItem {
  id: string;
  number: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  status: InvoiceStatus;
  displayStatus: InvoiceStatus;
  subtotalPaise: number;
  discountTotalPaise: number;
  taxTotalPaise: number;
  totalPaise: number;
  paidAmountPaise: number;
  outstandingPaise: number;
  daysLate: number;
  createdAt: Date;
}

export interface InvoiceListResult {
  data: InvoiceListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Shared query function for fetching invoices with tenant isolation and role restrictions.
 * Used by both page Server Components and GET /api/invoices.
 */
export async function getInvoices(
  session: AppSession,
  query: InvoiceListQuery
): Promise<InvoiceListResult> {
  const { page, pageSize, q, status, view } = query;

  // Base where clause enforcing tenant isolation
  const where: Prisma.InvoiceWhereInput = {
    organizationId: session.organizationId,
  };

  // Role restriction: CUSTOMER can only see their own non-draft invoices
  if (session.role === "CUSTOMER") {
    if (!session.customerId) {
      return { data: [], total: 0, page, pageSize, totalPages: 0 };
    }
    where.customerId = session.customerId;
    where.status = { not: "DRAFT" };
  }

  // Search by invoice number or customer name (case-insensitive)
  if (q && q.trim().length > 0) {
    const searchTerm = q.trim();
    where.OR = [
      { number: { contains: searchTerm, mode: "insensitive" } },
      { customer: { name: { contains: searchTerm, mode: "insensitive" } } },
    ];
  }

  // Today's midnight for overdue boundary check
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter: Overdue view or status="OVERDUE" uses computed overdue definition
  if (view === "overdue" || status === "OVERDUE") {
    where.dueDate = { lt: todayStart };
    // Only confirmed, partially paid, or stored overdue invoices can be overdue
    if (session.role === "CUSTOMER") {
      where.status = { in: ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"] };
    } else {
      where.status = { in: ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"] };
    }
  } else if (status) {
    where.status = status;
  }

  // Order by: overdue sorted by days late descending (earliest dueDate first); otherwise newest first
  const orderBy: Prisma.InvoiceOrderByWithRelationInput =
    view === "overdue" ? { dueDate: "asc" } : { createdAt: "desc" };

  const [total, rawInvoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const data: InvoiceListItem[] = rawInvoices.map((inv) => {
    const displayStatus = getDisplayStatus(inv);
    const outstandingPaise = Math.max(0, inv.totalPaise - inv.paidAmountPaise);
    const dueTime = new Date(inv.dueDate).getTime();
    const isLate = dueTime < todayStart.getTime();
    const daysLate = isLate
      ? Math.max(1, Math.floor((todayStart.getTime() - dueTime) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      id: inv.id,
      number: inv.number,
      customerId: inv.customerId,
      customer: inv.customer,
      periodStart: inv.periodStart,
      periodEnd: inv.periodEnd,
      dueDate: inv.dueDate,
      status: inv.status,
      displayStatus,
      subtotalPaise: inv.subtotalPaise,
      discountTotalPaise: inv.discountTotalPaise,
      taxTotalPaise: inv.taxTotalPaise,
      totalPaise: inv.totalPaise,
      paidAmountPaise: inv.paidAmountPaise,
      outstandingPaise,
      daysLate,
      createdAt: inv.createdAt,
    };
  });

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

