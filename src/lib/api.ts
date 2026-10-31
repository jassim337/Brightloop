import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const ok = (data: unknown, status = 200) =>
  NextResponse.json({ ok: true, data }, { status });

export const fail = (
  message: string,
  status = 400,
  fields?: Record<string, string>
) => NextResponse.json({ ok: false, error: { message, fields } }, { status });

export function handleError(e: unknown) {
  if (e instanceof ApiError) return fail(e.message, e.status, e.fields);

  if (e instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of e.issues) {
      const key = issue.path.map(String).join(".") || "_";
      if (!fields[key]) fields[key] = issue.message;
    }
    return fail("Please fix the highlighted fields", 400, fields);
  }

  if (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2002"
  ) {
    return fail("This record already exists", 409);
  }

  console.error(e);
  return fail("Something went wrong", 500);
}