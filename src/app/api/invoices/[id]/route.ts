import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { getDisplayStatus } from "@/lib/validators/invoice";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return fail("Not authenticated", 401);
    }

    const { id } = await params;

    const where: Prisma.InvoiceWhereInput = {
      id,
      organizationId: session.organizationId,
    };

    if (session.role === "CUSTOMER") {
      if (!session.customerId) {
        return fail("Customer profile not linked", 403);
      }
      where.customerId = session.customerId;
      where.status = { not: "DRAFT" };
    }

    const invoice = await prisma.invoice.findFirst({
      where,
      include: {
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
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return fail("Invoice not found", 404);
    }

    const outstandingPaise = Math.max(0, invoice.totalPaise - invoice.paidAmountPaise);
    const displayStatus = getDisplayStatus(invoice);

    return ok({
      ...invoice,
      displayStatus,
      outstandingPaise,
    });
  } catch (error) {
    return handleError(error);
  }
}

