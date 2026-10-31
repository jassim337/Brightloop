import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleError } from "@/lib/api";
import { forgotSchema } from "@/lib/validators/password-reset";

const MESSAGE = "If that email is registered, a reset link has been generated.";
const EXPIRY_MS = 30 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        "Please fix the highlighted fields",
        400,
        parsed.error.flatten().fieldErrors as Record<string, string[]>
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: parsed.data.email, mode: "insensitive" } },
      select: { id: true },
    });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const resetTokenHash = createHash("sha256").update(token).digest("hex");
      const resetExpires = new Date(Date.now() + EXPIRY_MS);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash, resetExpires },
      });

      const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      console.log(`Password reset link: ${base}/reset-password?token=${token}`);
    }

    return ok({ message: MESSAGE });
  } catch (e) {
    return handleError(e);
  }
}