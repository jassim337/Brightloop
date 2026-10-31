import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import ProductsClient from "./products-client";

export default async function ProductsPage() {
  let role: string;
  try {
    const s = await requireRole(["ADMIN", "STAFF"]);
    role = s.role;
  } catch {
    redirect("/login");
  }
  return <ProductsClient canEdit={role === "ADMIN"} />;
}