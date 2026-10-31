import { getSession } from "@/lib/auth";
import { ok, fail, handleError } from "@/lib/api";
import { invoiceListQuerySchema } from "@/lib/validators/invoice";
import { getInvoices } from "@/app/(dashboard)/invoices/_lib/queries";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return fail("Not authenticated", 401);
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      q: searchParams.get("q") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      view: searchParams.get("view") ?? undefined,
    };

    const parsed = invoiceListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return handleError(parsed.error);
    }

    const result = await getInvoices(session, parsed.data);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

