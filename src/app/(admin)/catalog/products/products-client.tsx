"use client";

import { useCallback, useEffect, useState } from "react";
import { productSchema } from "@/lib/validators/catalog";
import { Badge, FieldError, ListSkeleton, Pager, inputClass } from "../_components/ui";

type Variant = {
  id?: string;
  attribute: string;
  value: string;
  extraPricePaise: number;
};

type Product = {
  id: string;
  name: string;
  type: string;
  salesPricePaise: number;
  costPricePaise: number;
  notes: string | null;
  variants: Variant[];
};

type ListData = { items: Product[]; total: number; page: number; pageSize: number };
type FieldErrors = Record<string, string[] | undefined>;
type VariantErrors = Record<number, Record<string, string>>;
type VariantForm = { attribute: string; value: string; extraText: string };

type FormState = {
  name: string;
  type: string;
  salesText: string;
  costText: string;
  notes: string;
  variants: VariantForm[];
};

const PAGE_SIZE = 10;
const EMPTY: FormState = { name: "", type: "", salesText: "", costText: "", notes: "", variants: [] };

function rupees(paise: number) {
  return (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
}

function toPaise(text: string) {
  if (text.trim() === "") return NaN;
  const n = Number(text);
  return Number.isNaN(n) ? NaN : Math.round(n * 100);
}

export default function ProductsClient({ canEdit }: { canEdit: boolean }) {
  const [data, setData] = useState<ListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [editing, setEditing] = useState<"new" | Product | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [variantErrors, setVariantErrors] = useState<VariantErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch(
        `/api/products?page=${page}&pageSize=${PAGE_SIZE}&q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Failed to load products");
      setData(json.data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  function resetMessages() {
    setErrors({});
    setVariantErrors({});
    setFormError(null);
    setNotice(null);
    setWarning(null);
    setActionError(null);
  }

  function openNew() {
    setEditing("new");
    setForm(EMPTY);
    resetMessages();
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      type: p.type,
      salesText: String(p.salesPricePaise / 100),
      costText: String(p.costPricePaise / 100),
      notes: p.notes ?? "",
      variants: p.variants.map((v) => ({
        attribute: v.attribute,
        value: v.value,
        extraText: String(v.extraPricePaise / 100),
      })),
    });
    resetMessages();
  }

  function closeForm() {
    setEditing(null);
    setErrors({});
    setVariantErrors({});
    setFormError(null);
  }

  function addVariant() {
    setForm({ ...form, variants: [...form.variants, { attribute: "", value: "", extraText: "0" }] });
  }

  function removeVariant(index: number) {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
    setVariantErrors({});
  }

  function updateVariant(index: number, patch: Partial<VariantForm>) {
    setForm({
      ...form,
      variants: form.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    });
  }

  const salesPaise = toPaise(form.salesText);
  const costPaise = toPaise(form.costText);
  const costTooHigh = !Number.isNaN(salesPaise) && !Number.isNaN(costPaise) && costPaise > salesPaise;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setFormError(null);

    const parsed = productSchema.safeParse({
      name: form.name,
      type: form.type,
      salesPricePaise: toPaise(form.salesText),
      costPricePaise: toPaise(form.costText),
      notes: form.notes,
      variants: form.variants.map((v) => ({
        attribute: v.attribute,
        value: v.value,
        extraPricePaise: v.extraText.trim() === "" ? 0 : toPaise(v.extraText),
      })),
    });

    if (!parsed.success) {
      const fe: FieldErrors = {};
      const ve: VariantErrors = {};
      for (const issue of parsed.error.issues) {
        const [first, idx, key] = issue.path;
        if (first === "variants" && typeof idx === "number" && typeof key === "string") {
          ve[idx] = ve[idx] ?? {};
          if (!ve[idx][key]) ve[idx][key] = issue.message;
        } else if (typeof first === "string") {
          fe[first] = [...(fe[first] ?? []), issue.message];
        }
      }
      setErrors(fe);
      setVariantErrors(ve);
      return;
    }

    setErrors({});
    setVariantErrors({});
    setSubmitting(true);
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/products" : `/api/products/${editing.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.ok) {
        setErrors(json.error?.fields ?? {});
        setFormError(json.error?.message ?? "Could not save product");
        return;
      }
      setNotice(isNew ? "Product created" : "Product updated");
      setWarning(json.data?.warning ?? null);
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

  async function onDelete(p: Product) {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    setActionError(null);
    setNotice(null);
    setWarning(null);
    try {
      const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) {
        setActionError(json.error?.message ?? "Could not delete product");
        return;
      }
      setNotice("Product deleted");
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
            placeholder="Search products"
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
            New product
          </button>
        ) : (
          <span className="text-sm text-slate-500">View only</span>
        )}
      </div>

      {notice && <p className="text-sm text-green-400">{notice}</p>}
      {warning && <p className="text-sm text-amber-400">{warning}</p>}
      {actionError && <p className="text-sm text-red-400">{actionError}</p>}

      {canEdit && editing && (
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6"
        >
          <h2 className="text-lg font-medium">{editing === "new" ? "New product" : "Edit product"}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Accounting software"
              />
              <FieldError messages={errors.name} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Type</label>
              <input
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Service"
              />
              <FieldError messages={errors.type} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Sales price (INR)</label>
              <input
                className={inputClass}
                inputMode="decimal"
                value={form.salesText}
                onChange={(e) => setForm({ ...form, salesText: e.target.value })}
                placeholder="1000"
              />
              <FieldError messages={errors.salesPricePaise} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Cost price (INR)</label>
              <input
                className={inputClass}
                inputMode="decimal"
                value={form.costText}
                onChange={(e) => setForm({ ...form, costText: e.target.value })}
                placeholder="600"
              />
              <FieldError messages={errors.costPricePaise} />
            </div>
          </div>

          {costTooHigh && (
            <p className="rounded-lg border border-amber-900 bg-amber-950/40 px-3 py-2 text-sm text-amber-300">
              Cost price is higher than sales price. You can still save, but this product will lose money.
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm text-slate-300">Notes</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional"
            />
            <FieldError messages={errors.notes} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-300">Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
              >
                Add variant
              </button>
            </div>

            {form.variants.length === 0 && (
              <p className="text-sm text-slate-500">No variants. Add one for options like Brand or Size.</p>
            )}

            {form.variants.map((v, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-slate-800 p-3 sm:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Attribute</label>
                  <input
                    className={inputClass}
                    value={v.attribute}
                    onChange={(e) => updateVariant(i, { attribute: e.target.value })}
                    placeholder="Brand"
                  />
                  <FieldError messages={variantErrors[i]?.attribute} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Value</label>
                  <input
                    className={inputClass}
                    value={v.value}
                    onChange={(e) => updateVariant(i, { value: e.target.value })}
                    placeholder="Odoo"
                  />
                  <FieldError messages={variantErrors[i]?.value} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Extra price (INR)</label>
                  <input
                    className={inputClass}
                    inputMode="decimal"
                    value={v.extraText}
                    onChange={(e) => updateVariant(i, { extraText: e.target.value })}
                    placeholder="0"
                  />
                  <FieldError messages={variantErrors[i]?.extraPricePaise} />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="w-full rounded-lg border border-red-900 px-3 py-2 text-sm text-red-300 hover:bg-red-950/40"
                  >
                    Remove
                  </button>
                </div>
              </div>
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
            {q ? "No products match your search." : "No products yet."}
          </p>
        )}

        {!loading && !listError && data && data.items.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {data.items.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-sm text-slate-400">
                      {p.type} - sells {rupees(p.salesPricePaise)} - cost {rupees(p.costPricePaise)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.costPricePaise > p.salesPricePaise && <Badge tone="amber">Cost above price</Badge>}
                    {p.variants.length > 0 ? (
                      <button
                        onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                        className="rounded-lg border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
                      >
                        {p.variants.length} {p.variants.length === 1 ? "variant" : "variants"}
                      </button>
                    ) : (
                      <Badge tone="grey">No variants</Badge>
                    )}
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
                </div>

                {expanded === p.id && p.variants.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-lg bg-slate-900 p-3 text-sm text-slate-300">
                    {p.variants.map((v, i) => (
                      <li key={v.id ?? i} className="flex justify-between gap-3">
                        <span>
                          {v.attribute}: {v.value}
                        </span>
                        <span className="text-slate-400">+ {rupees(v.extraPricePaise)}</span>
                      </li>
                    ))}
                  </ul>
                )}
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