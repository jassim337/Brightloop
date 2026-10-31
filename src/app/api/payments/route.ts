import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError, ApiError } from "@/lib/api";
import { formatINR } from "@/lib/money";
import {
  recordPaymentSchema,
  paymentListQuerySchema,
} from "@/lib/validators/payment";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return fail("Not authenticated", 401);
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      invoiceId: searchParams.get("invoiceId") ?? undefined,
    };

    const parsed = paymentListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return handleError(parsed.error);
    }

    const { page, pageSize, invoiceId } = parsed.data;

    const where: Prisma.PaymentWhereInput = {
      organizationId: session.organizationId,
    };

    if (session.role === "CUSTOMER") {
      if (!session.customerId) {
        return ok({ data: [], total: 0, page, pageSize, totalPages: 0 });
      }
      where.invoice = {
        customerId: session.customerId,
      };
    }

    if (invoiceId) {
      where.invoiceId = invoiceId;
    }

    const [total, payments] = await Promise.all([
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
              customerId: true,
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

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return ok({
      data: payments,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ADMIN", "STAFF"]);
    const body = await req.json();
    const validated = recordPaymentSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch invoice ensuring tenant isolation
      const invoice = await tx.invoice.findFirst({
        where: {
          id: validated.invoiceId,
          organizationId: session.organizationId,
        },
      });

      if (!invoice) {
        throw new ApiError(404, "Invoice not found");
      }

      // 2. State validation: only CONFIRMED, PARTIALLY_PAID and OVERDUE are payable
      const payableStatuses = ["CONFIRMED", "PARTIALLY_PAID", "OVERDUE"];
      if (!payableStatuses.includes(invoice.status)) {
        throw new ApiError(
          422,
          `Cannot record payment on invoice in '${invoice.status}' status. Only CONFIRMED, PARTIALLY_PAID, or OVERDUE invoices are payable.`
        );
      }

      // 3. Balance validation
      const remainingBalance = invoice.totalPaise - invoice.paidAmountPaise;
      if (remainingBalance <= 0) {
        throw new ApiError(409, "Invoice is already fully paid");
      }

      if (validated.amountPaise > remainingBalance) {
        throw new ApiError(
          422,
          `Payment amount (${formatINR(validated.amountPaise)}) exceeds remaining balance (${formatINR(remainingBalance)})`
        );
      }

      // 4. Create the payment record
      const payment = await tx.payment.create({
        data: {
          organizationId: session.organizationId,
          invoiceId: invoice.id,
          method: validated.method,
          amountPaise: validated.amountPaise,
          date: validated.date,
          note: validated.note || null,
          recordedById: session.userId,
        },
      });

      // 5. Update invoice paid amount and status with concurrency guard
      const newPaidAmount = invoice.paidAmountPaise + validated.amountPaise;
      const newStatus =
        newPaidAmount >= invoice.totalPaise ? "PAID" : "PARTIALLY_PAID";

      const updateCount = await tx.invoice.updateMany({
        where: {
          id: invoice.id,
          organizationId: session.organizationId,
          paidAmountPaise: invoice.paidAmountPaise,
        },
        data: {
          paidAmountPaise: newPaidAmount,
          status: newStatus,
        },
      });

      if (updateCount.count === 0) {
        throw new ApiError(
          409,
          "Invoice payment state was modified concurrently. Please refresh and try again."
        );
      }

      return {
        payment,
        invoice: {
          id: invoice.id,
          number: invoice.number,
          paidAmountPaise: newPaidAmount,
          status: newStatus,
        },
      };
    });

    return ok(result, 201);
  } catch (error) {
    return handleError(error);
  }
}

