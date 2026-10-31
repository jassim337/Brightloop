import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import TaxesClient from "./taxes-client";

export default async function TaxesPage() {
  let role: string;
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    role = s.role;
  } catch {
    redirect("/login");
  }
  return <TaxesClient canEdit={role === "ADMIN"} />;
}