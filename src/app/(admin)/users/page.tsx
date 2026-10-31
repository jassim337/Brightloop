"use client";

import { useCallback, useEffect, useState } from "react";
import { createStaffSchema } from "@/lib/validators/users";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "STAFF";
  createdAt: string;
};

type ListData = {
  items: UserRow[];
  total: number;
  page: number;
  pageSize: number;
};

type FieldErrors = Record<string, string[] | undefined>;

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", email: "", password: "" };
const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="mt-1 text-sm text-red-400">{messages[0]}</p>;
}

function RoleBadge({ role }: { role: "ADMIN" | "STAFF" }) {
  const style =
    role === "ADMIN"
      ? "bg-indigo-500/20 text-indigo-300"
      : "bg-slate-500/20 text-slate-300";
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>{role}</span>;
}

export default function UsersPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch(
        `/api/users?page=${page}&pageSize=${PAGE_SIZE}&q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Failed to load users");
      setData(json.data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    const parsed = createStaffSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.ok) {
        setErrors(json.error?.fields ?? {});
        setFormError(json.error?.message ?? "Could not create staff account");
        return;
      }
      setSuccess(`Staff account created for ${json.data.email}`);
      setForm(EMPTY_FORM);
      if (page === 1) {
        await load();
      } else {
        setPage(1);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-4 text-slate-100 sm:p-6">
      <h1 className="text-2xl font-semibold">Staff</h1>

      <section className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-medium">Invite staff</h2>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3" noValidate>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Name</label>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
            />
            <FieldError messages={errors.name} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              className={inputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="staff@brightloop.com"
            />
            <FieldError messages={errors.email} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Password</label>
            <input
              className={inputClass}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="9+ chars, upper, lower, special"
            />
            <FieldError messages={errors.password} />
          </div>

          <div className="sm:col-span-3">
            {formError && <p className="mb-3 text-sm text-red-400">{formError}</p>}
            {success && <p className="mb-3 text-sm text-green-400">{success}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create staff account"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium">Team members</h2>
          <form onSubmit={onSearch} className="flex gap-2">
            <input
              className={inputClass}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email"
            />
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Search
            </button>
          </form>
        </div>

        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-800" />
            ))}
          </div>
        )}

        {!loading && listError && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {listError}
            <button onClick={load} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !listError && data && data.items.length === 0 && (
          <p className="py-8 text-center text-slate-400">No team members found.</p>
        )}

        {!loading && !listError && data && data.items.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {data.items.map((u) => (
              <li
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{u.name ?? "Unnamed"}</p>
                  <p className="truncate text-sm text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <RoleBadge role={u.role} />
                  <span className="text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && !listError && data && data.total > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <span>
              Page {data.page} of {totalPages} - {data.total} total
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}