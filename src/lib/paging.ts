export function getPaging(req: Request) {
  const u = new URL(req.url);
  const page = Math.max(1, Number(u.searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(u.searchParams.get("pageSize")) || 20));
  const q = u.searchParams.get("q")?.trim() || "";
  return { page, pageSize, q, skip: (page - 1) * pageSize, take: pageSize };
}