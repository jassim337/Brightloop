import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { getPaging } from "@/lib/paging";
import { createStaffSchema } from "@/lib/validators/users";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(req: Request) {
  try {
    const s = await requireRole(["ADMIN"]);
    const { page, pageSize, q, skip, take } = getPaging(req);

    const where: Prisma.UserWhereInput = {
      organizationId: s.organizationId,
      role: { in: ["ADMIN", "STAFF"] },
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return ok({ items, total, page, pageSize });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const s = await requireRole(["ADMIN"]);
    const body = await req.json().catch(() => null);
    const parsed = createStaffSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        "Please fix the highlighted fields",
        400,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    });

    if (existing) {
      return fail("Email already registered", 409, { email: ["Email already registered"] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STAFF",
        organizationId: s.organizationId,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return ok(user, 201);
  } catch (e) {
    return handleError(e);
  }
}