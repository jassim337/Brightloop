import { prisma } from "@/lib/prisma";
import { handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPaging } from "@/lib/paging";
import { planSchema } from "@/lib/validators/catalog";

// GET /api/plans?available=1 returns only plans open for sale today
// (use this for quotation forms so unavailable plans disappear).
export async function GET(req: Request) {
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    const { page, pageSize, q, skip, take } = getPaging(req);
    const available = new URL(req.url).searchParams.get("available") === "1";
    const now = new Date();
    const where = {
      organizationId: s.organizationId,
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(available
        ? {
            isActive: true,
            availableFrom: { lte: now },
            OR: [{ availableTo: null }, { availableTo: { gte: now } }],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.plan.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      prisma.plan.count({ where }),
    ]);
    return ok({ items, total, page, pageSize });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const s = await requireRole(["ADMIN"]);
    const b = planSchema.parse(await req.json());
    const plan = await prisma.plan.create({
      data: {
        organizationId: s.organizationId,
        ...b,
        description: b.description || null,
        availableTo: b.availableTo ?? null,
      },
    });
    return ok(plan, 201);
  } catch (e) {
    return handleError(e);
  }
}