import { prisma } from "@/lib/prisma";
import { ApiError, handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { productSchema } from "@/lib/validators/catalog";

type Ctx = { params: Promise<{ id: string }> };

async function findOwned(id: string, organizationId: string) {
  const p = await prisma.product.findFirst({
    where: { id, organizationId },
    include: { variants: true },
  });
  if (!p) throw new ApiError(404, "Product not found");
  return p;
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    const { id } = await ctx.params;
    return ok(await findOwned(id, s.organizationId));
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const s = await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    await findOwned(id, s.organizationId);
    const b = productSchema.parse(await req.json());
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productVariant.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          name: b.name,
          type: b.type,
          salesPricePaise: b.salesPricePaise,
          costPricePaise: b.costPricePaise,
          notes: b.notes || null,
          variants: { create: b.variants },
        },
        include: { variants: true },
      });
    });
    return ok(updated);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const s = await requireRole(["ADMIN"]);
    const { id } = await ctx.params;
    await findOwned(id, s.organizationId);
    try {
      await prisma.product.delete({ where: { id } });
    } catch (e) {
      if ((e as { code?: string }).code === "P2003") {
        throw new ApiError(409, "This product is used in quotations or subscriptions and cannot be deleted");
      }
      throw e;
    }
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}