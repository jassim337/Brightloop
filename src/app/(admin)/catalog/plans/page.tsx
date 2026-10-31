import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import PlansClient from "./plans-client";

export default async function PlansPage() {
  let role: string;
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    role = s.role;
  } catch {
    redirect("/login");
  }
  return <PlansClient canEdit={role === "ADMIN"} />;
}