import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { invoiceActionSchema } from "@/lib/validators/invoice";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN", "STAFF"]);
    const { id } = await params;

    const rawBody = await req.json();
    const { action } = invoiceActionSchema.parse(rawBody);

    if (action === "confirm") {
      // confirm: allowed only from DRAFT -> CONFIRMED
      const result = await prisma.invoice.updateMany({
        where: {
          id,
          organizationId: session.organizationId,
          status: "DRAFT",
        },
        data: {
          status: "CONFIRMED",
        },
      });

      if (result.count === 0) {
        const existing = await prisma.invoice.findFirst({
          where: { id, organizationId: session.organizationId },
          select: { status: true },
        });

        if (!existing) {
          return fail("Invoice not found", 404);
        }
        return fail(
          `Cannot confirm invoice in '${existing.status}' status (must be DRAFT)`,
          409
        );
      }

      return ok({ message: "Invoice confirmed successfully", status: "CONFIRMED" });
    }

    if (action === "cancel") {
      // cancel: allowed only from DRAFT or CONFIRMED -> CANCELLED if paidAmountPaise == 0
      const result = await prisma.invoice.updateMany({
        where: {
          id,
          organizationId: session.organizationId,
          status: { in: ["DRAFT", "CONFIRMED"] },
          paidAmountPaise: 0,
        },
        data: {
          status: "CANCELLED",
        },
      });

      if (result.count === 0) {
        const existing = await prisma.invoice.findFirst({
          where: { id, organizationId: session.organizationId },
          select: { status: true, paidAmountPaise: true },
        });

        if (!existing) {
          return fail("Invoice not found", 404);
        }
        if (existing.paidAmountPaise > 0) {
          return fail(
            "Cannot cancel an invoice with recorded payments",
            409
          );
        }
        return fail(
          `Cannot cancel invoice in '${existing.status}' status (must be DRAFT or CONFIRMED)`,
          409
        );
      }

      return ok({ message: "Invoice cancelled successfully", status: "CANCELLED" });
    }

    return fail("Invalid action specified", 400);
  } catch (error) {
    return handleError(error);
  }
}

