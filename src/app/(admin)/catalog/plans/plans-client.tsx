"use client";

import { useCallback, useEffect, useState } from "react";
import { planSchema } from "@/lib/validators/catalog";
import { Badge, FieldError, ListSkeleton, Pager, inputClass } from "../_components/ui";

const PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;

type Plan = {
  id: string;
  name: string;
  description: string | null;
  pricePaise: number;
  billingPeriod: (typeof PERIODS)[number];
  minQty: number;
  availableFrom: string;
  availableTo: string | null;
  autoClose: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
  isActive: boolean;
};

type ListData = { items: Plan[]; total: number; page: number; pageSize: number };
type FieldErrors = Record<string, string[] | undefined>;

type FormState = {
  name: string;
  description: string;
  priceText: string;
  billingPeriod: (typeof PERIODS)[number];
  minQty: string;
  availableFrom: string;
  availableTo: string;
  autoClose: boolean;
  closable: boolean;
  pausable: boolean;
  renewable: boolean;
  isActive: boolean;
};

const PAGE_SIZE = 10;

const EMPTY: FormState = {
  name: "",
  description: "",
  priceText: "",
  billingPeriod: "MONTHLY",
  minQty: "1",
  availableFrom: new Date().toISOString().slice(0, 10),
  availableTo: "",
  autoClose: false,
  closable: true,
  pausable: true,
  renewable: true,
  isActive: true,
};

const FLAGS: { key: "autoClose" | "closable" | "pausable" | "renewable" | "isActive"; label: string }[] = [
  { key: "isActive", label: "Active" },
  { key: "autoClose", label: "Auto close" },
  { key: "closable", label: "Closable" },
  { key: "pausable", label: "Pausable" },
  { key: "renewable", label: "Renewable" },
];

function rupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function label(period: string) {
  return period.charAt(0) + period.slice(1).toLowerCase();
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN");
}

export default function PlansClient({ canEdit }: { canEdit: boolean }) {
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");

  const [editing, setEditing] = useState<"new" | Plan | null>(null);
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
        `/api/plans?page=${page}&pageSize=${PAGE_SIZE}&q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Failed to load plans");
      setData(json.data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing("new");
    setForm({ ...EMPTY, availableFrom: new Date().toISOString().slice(0, 10) });
    setErrors({});
    setFormError(null);
    setNotice(null);
    setActionError(null);
  }

  function openEdit(p: Plan) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      priceText: String(p.pricePaise / 100),
      billingPeriod: p.billingPeriod,
      minQty: String(p.minQty),
      availableFrom: p.availableFrom.slice(0, 10),
      availableTo: p.availableTo ? p.availableTo.slice(0, 10) : "",
      autoClose: p.autoClose,
      closable: p.closable,
      pausable: p.pausable,
      renewable: p.renewable,
      isActive: p.isActive,
    });
    setErrors({});
    setFormError(null);
    setNotice(null);
    setActionError(null);
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

    const price = Number(form.priceText);
    const priceOk = form.priceText.trim() !== "" && !Number.isNaN(price);
    const qty = Number(form.minQty);
    const qtyOk = form.minQty.trim() !== "" && !Number.isNaN(qty);

    const parsed = planSchema.safeParse({
      name: form.name,
      description: form.description,
      pricePaise: priceOk ? Math.round(price * 100) : NaN,
      billingPeriod: form.billingPeriod,
      minQty: qtyOk ? qty : NaN,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo ? form.availableTo : null,
      autoClose: form.autoClose,
      closable: form.closable,
      pausable: form.pausable,
      renewable: form.renewable,
      isActive: form.isActive,
    });

    if (!parsed.success) {
      const fe: FieldErrors = parsed.error.flatten().fieldErrors;
      if (!form.availableFrom) fe.availableFrom = ["Enter a start date"];
      setErrors(fe);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/plans" : `/api/plans/${editing.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.ok) {
        setErrors(json.error?.fields ?? {});
        setFormError(json.error?.message ?? "Could not save plan");
        return;
      }
      setNotice(isNew ? "Plan created" : "Plan updated");
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

  async function onDelete(p: Plan) {
    if (!window.confirm(`Delete plan "${p.name}"?`)) return;
    setActionError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/plans/${p.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        setActionError(json.error?.message ?? "Could not delete plan");
        return;
      }
      setNotice("Plan deleted");
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
            placeholder="Search plans"
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
            New plan
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
          <h2 className="text-lg font-medium">{editing === "new" ? "New plan" : "Edit plan"}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Pro monthly"
              />
              <FieldError messages={errors.name} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Price (INR)</label>
              <input
                className={inputClass}
                inputMode="decimal"
                value={form.priceText}
                onChange={(e) => setForm({ ...form, priceText: e.target.value })}
                placeholder="999"
              />
              <FieldError messages={errors.pricePaise} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional"
            />
            <FieldError messages={errors.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Billing period</label>
              <select
                className={inputClass}
                value={form.billingPeriod}
                onChange={(e) =>
                  setForm({ ...form, billingPeriod: e.target.value as FormState["billingPeriod"] })
                }
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p}>
                    {label(p)}
                  </option>
                ))}
              </select>
              <FieldError messages={errors.billingPeriod} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Minimum quantity</label>
              <input
                className={inputClass}
                inputMode="numeric"
                value={form.minQty}
                onChange={(e) => setForm({ ...form, minQty: e.target.value })}
              />
              <FieldError messages={errors.minQty} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Available from</label>
              <input
                className={inputClass}
                type="date"
                value={form.availableFrom}
                onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
              />
              <FieldError messages={errors.availableFrom} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Available to (optional)</label>
              <input
                className={inputClass}
                type="date"
                value={form.availableTo}
                onChange={(e) => setForm({ ...form, availableTo: e.target.value })}
              />
              <FieldError messages={errors.availableTo} />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
            {FLAGS.map((f) => (
              <label key={f.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                />
                {f.label}
              </label>
            ))}
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
            {q ? "No plans match your search." : "No plans yet."}
          </p>
        )}

        {!loading && !listError && data && data.items.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {data.items.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-slate-400">
                    {rupees(p.pricePaise)} / {label(p.billingPeriod).toLowerCase()} - min qty {p.minQty}
                  </p>
                  <p className="text-xs text-slate-500">
                    {shortDate(p.availableFrom)} to {p.availableTo ? shortDate(p.availableTo) : "no end"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={p.isActive ? "green" : "grey"}>
                    {p.isActive ? "Active" : "Inactive"}
                  </Badge>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p)}
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