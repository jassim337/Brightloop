import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { resetSchema } from "@/lib/validators/password-reset";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        "Please fix the highlighted fields",
        400,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const { token, password } = parsed.data;
    const resetTokenHash = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: { resetTokenHash, resetExpires: { gt: new Date() } },
      select: { id: true },
    });

    if (!user) {
      return fail("This reset link is invalid or has expired", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetTokenHash: null, resetExpires: null },
    });

    return ok({ message: "Password updated. You can now log in." });
  } catch (e) {
    return handleError(e);
  }
}