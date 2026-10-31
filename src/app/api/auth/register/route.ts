import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getDefaultOrgId } from "@/lib/org";
import { ApiError, handleError, ok } from "@/lib/api";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(req: Request) {
  try {
    const body = registerSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existing) {
      throw new ApiError(409, "Email already registered", {
        email: "This email is already registered",
      });
    }

    const organizationId = await getDefaultOrgId();
    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        organizationId,
        email: body.email,
        name: body.name,
        passwordHash,
        role: "CUSTOMER",
        customer: {
          create: {
            organizationId,
            name: body.name,
            email: body.email,
            company: body.company || null,
            phone: body.phone || null,
          },
        },
      },
      select: { id: true, email: true },
    });

    return ok(user, 201);
  } catch (e) {
    return handleError(e);
  }
}