"use client";

import { useCallback, useEffect, useState } from "react";
import { taxSchema } from "@/lib/validators/catalog";
import { Badge, FieldError, ListSkeleton, Pager, inputClass } from "../_components/ui";

type Tax = {
  id: string;
  name: string;
  rateBasisPoints: number;
  active: boolean;
  isDefault: boolean;
};

type ListData = { items: Tax[]; total: number; page: number; pageSize: number };
type FieldErrors = Record<string, string[] | undefined>;
type FormState = { name: string; rateText: string; active: boolean; isDefault: boolean };

const PAGE_SIZE = 10;
const EMPTY: FormState = { name: "", rateText: "", active: true, isDefault: false };

export default function TaxesClient({ canEdit }: { canEdit: boolean }) {
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<"new" | Tax | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch(
        `/api/taxes?page=${page}&pageSize=${PAGE_SIZE}&q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Failed to load taxes");
      setData(json.data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load taxes");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing("new");
    setForm(EMPTY);
    setErrors({});
    setFormError(null);
    setNotice(null);
  }

  function openEdit(t: Tax) {
    setEditing(t);
    setForm({
      name: t.name,
      rateText: String(t.rateBasisPoints / 100),
      active: t.active,
      isDefault: t.isDefault,
    });
    setErrors({});
    setFormError(null);
    setNotice(null);
  }

  function closeForm() {
    setEditing(null);
    setErrors({});
    setFormError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setFormError(null);

    const n = Number(form.rateText);
    const rateOk = form.rateText.trim() !== "" && !Number.isNaN(n);
    const parsed = taxSchema.safeParse({
      name: form.name,
      rateBasisPoints: rateOk ? Math.round(n * 100) : NaN,
      active: form.active,
      isDefault: form.isDefault,
    });

    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/taxes" : `/api/taxes/${editing.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.ok) {
        setErrors(json.error?.fields ?? {});
        setFormError(json.error?.message ?? "Could not save tax");
        return;
      }
      setNotice(isNew ? "Tax created" : "Tax updated");
      setEditing(null);
      if (isNew && page !== 1) {
        setPage(1);
      } else {
        await load();
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(t: Tax) {
    if (!window.confirm(`Delete tax "${t.name}"?`)) return;
    setActionError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/taxes/${t.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        setActionError(json.error?.message ?? "Could not delete tax");
        return;
      }
      setNotice("Tax deleted");
      if (data && data.items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch {
      setActionError("Network error. Please try again.");
    }
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={onSearch} className="flex gap-2">
          <input
            className={inputClass}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search taxes"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Search
          </button>
        </form>
        {canEdit ? (
          <button
            onClick={openNew}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New tax
          </button>
        ) : (
          <span className="text-sm text-slate-500">View only</span>
        )}
      </div>

      {notice && <p className="text-sm text-green-400">{notice}</p>}
      {actionError && <p className="text-sm text-red-400">{actionError}</p>}

      {canEdit && editing && (
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6"
        >
          <h2 className="text-lg font-medium">
            {editing === "new" ? "New tax" : "Edit tax"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="GST 18%"
              />
              <FieldError messages={errors.name} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Rate (%)</label>
              <input
                className={inputClass}
                inputMode="decimal"
                value={form.rateText}
                onChange={(e) => setForm({ ...form, rateText: e.target.value })}
                placeholder="18"
              />
              <FieldError messages={errors.rateBasisPoints} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-slate-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              Default tax
            </label>
          </div>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6">
        {loading && <ListSkeleton />}

        {!loading && listError && (
          <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {listError}
            <button onClick={load} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !listError && data && data.items.length === 0 && (
          <p className="py-8 text-center text-slate-400">
            {q ? "No taxes match your search." : "No taxes yet."}
          </p>
        )}

        {!loading && !listError && data && data.items.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {data.items.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.name}</p>
                  <p className="text-sm text-slate-400">{t.rateBasisPoints / 100}%</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={t.active ? "green" : "grey"}>
                    {t.active ? "Active" : "Inactive"}
                  </Badge>
                  {t.isDefault && <Badge tone="blue">Default</Badge>}
                  {canEdit && (
                    <>
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(t)}
                        className="rounded-lg border border-red-900 px-3 py-1 text-sm text-red-300 hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && !listError && data && (
          <Pager page={data.page} pageSize={data.pageSize} total={data.total} onPage={setPage} />
        )}
      </section>
    </div>
  );
}