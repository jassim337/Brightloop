import { z } from "zod";
import { handleError, ok } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { runBilling } from "@/lib/billing/runBilling";

const billingRunSchema = z.object({
  billingDate: z.string().datetime({ offset: true }).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "STAFF"]);
    const body = billingRunSchema.parse(await request.json());
    const billingDate = body.billingDate ? new Date(body.billingDate) : new Date();
    const result = await runBilling(session.organizationId, billingDate);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
