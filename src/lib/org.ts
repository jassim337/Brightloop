import { prisma } from "@/lib/prisma";

const SLUG = "brightloop";
let cached: string | null = null;

export async function getDefaultOrgId(): Promise<string> {
  if (cached) return cached;
  const org = await prisma.organization.upsert({
    where: { slug: SLUG },
    update: {},
    create: { name: "Brightloop Software", slug: SLUG },
    select: { id: true },
  });
  cached = org.id;
  return cached;
}