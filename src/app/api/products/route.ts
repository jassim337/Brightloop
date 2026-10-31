import { prisma } from "@/lib/prisma";
import { handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPaging } from "@/lib/paging";
import { productSchema } from "@/lib/validators/catalog";

export async function GET(req: Request) {
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    const { page, pageSize, q, skip, take } = getPaging(req);
    const where = {
      organizationId: s.organizationId,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { variants: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const s = await requireRole(["ADMIN"]);
    const b = productSchema.parse(await req.json());
    const product = await prisma.product.create({
      data: {
        organizationId: s.organizationId,
        name: b.name,
        type: b.type,
        salesPricePaise: b.salesPricePaise,
        costPricePaise: b.costPricePaise,
        notes: b.notes || null,
        variants: { create: b.variants },
      },
      include: { variants: true },
    });
    const warning =
      b.costPricePaise > b.salesPricePaise
        ? "Cost price is higher than sales price"
        : undefined;
    return ok({ ...product, warning }, 201);
  } catch (e) {
    return handleError(e);
  }
}