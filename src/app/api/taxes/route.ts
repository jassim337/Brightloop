import { prisma } from "@/lib/prisma";
import { handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { taxSchema } from "@/lib/validators/catalog";

export async function GET() {
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    const items = await prisma.tax.findMany({
      where: { organizationId: s.organizationId },
      orderBy: { createdAt: "desc" },
    });
    return ok({ items, total: items.length });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const s = await requireRole(["ADMIN"]);
    const b = taxSchema.parse(await req.json());
    const tax = await prisma.$transaction(async (tx) => {
      if (b.isDefault) {
        await tx.tax.updateMany({
          where: { organizationId: s.organizationId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.tax.create({ data: { organizationId: s.organizationId, ...b } });
    });
    return ok(tax, 201);
  } catch (e) {
    return handleError(e);
  }
}