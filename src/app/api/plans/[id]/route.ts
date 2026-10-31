import { prisma } from "@/lib/prisma";
import { ApiError, handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { planSchema } from "@/lib/validators/catalog";

type Ctx = { params: Promise<{ id: string }> };

async function findOwned(id: string, organizationId: string) {
  const p = await prisma.plan.findFirst({ where: { id, organizationId } });
  if (!p) throw new ApiError(404, "Plan not found");
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
    const b = planSchema.parse(await req.json());
    const plan = await prisma.plan.update({
      where: { id },
      data: {
        ...b,
        description: b.description || null,
        availableTo: b.availableTo ?? null,
      },
    });
    return ok(plan);
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
      await prisma.plan.delete({ where: { id } });
    } catch (e) {
      if ((e as { code?: string }).code === "P2003") {
        throw new ApiError(409, "This plan is used in quotations or subscriptions and cannot be deleted");
      }
      throw e;
    }
    return ok({ id });
  } catch (e) {
    return handleError(e);
  }
}