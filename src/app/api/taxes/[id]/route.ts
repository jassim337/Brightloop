import { prisma } from "@/lib/prisma";
import { ApiError, handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { taxSchema } from "@/lib/validators/catalog";

type Ctx = { params: Promise<{ id: string }> };

async function findOwned(id: string, organizationId: string) {
  const t = await prisma.tax.findFirst({ where: { id, organizationId } });
  if (!t) throw new ApiError(404, "Tax not found");
  return t;
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const s = await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    await findOwned(id, s.organizationId);
    const b = taxSchema.parse(await req.json());
    const tax = await prisma.$transaction(async (tx) => {
      if (b.isDefault) {
        await tx.tax.updateMany({
          where: { organizationId: s.organizationId, isDefault: true, NOT: { id } },
          data: { isDefault: false },
        });
      }
      return tx.tax.update({ where: { id }, data: b });
    });
    return ok(tax);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const s = await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    await findOwned(id, s.organizationId);
    // Lines keep their own tax-rate snapshot, so deleting a tax is safe.
    await prisma.tax.delete({ where: { id } });
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}